---
title: "Why We Rebuilt Iceberg Orphan File Cleanup from Scratch"
description: "How we built a production-safe orphan file cleanup for Apache Iceberg without Spark — Bloom filters, threshold-based abort, batch deletion, and Flink-aware exclusions."
slug: why-we-rebuilt-orphan-cleanup
authors: [ujjawal,Shashank,abhishek]
hide_table_of_contents: false
tags2: [Technical, Engineering]
keywords: [apache iceberg, orphan file cleanup, remove_orphan_files, iceberg maintenance, bloom filter, orphan detection, lakehouse storage, object storage cleanup, data lake maintenance, iceberg file management]
banner_description: "Deleting data is easy. Deleting the right data safely in a distributed lakehouse is much harder."
coverImage: img/blog/thumbnails/darkStone.png
date: 07/13/2026
last_update:
  date: 2026-07-13
  author: Ujjawal Khare
---

import Img from '@site/src/components/Img';

# Why We Rebuilt Iceberg Orphan File Cleanup from Scratch

*Deleting data is easy. Deleting the right data safely in a distributed lakehouse is much harder.*

<details>
  <summary><strong>This is Part 6 of our Apache Iceberg Table Maintenance series. Explore the full series:</strong></summary>

* Part 1: [The Hidden Debt in Your Lakehouse Tables](/blog/hidden-debt-in-lakehouse-tables)
* Part 2: [What Iceberg Gives You for Table Maintenance](/blog/iceberg-maintenance-operations)
* Part 3: [The Iceberg Table Maintenance Landscape](/blog/iceberg-maintenance-alternatives)
* Part 4: [How We Built Automated Table Maintenance](/blog/how-we-built-automated-maintenance)
* Part 5: [Running Iceberg Maintenance in Production](/blog/iceberg-maintenance-production-guide)
* **Part 6: Why We Rebuilt Orphan File Cleanup from Scratch**
</details>

---

In the [previous articles](/blog/how-we-built-automated-maintenance) of this series, we discussed why table maintenance is essential, explored Iceberg's built-in maintenance procedures, and explained how we automated them at IOMETE. One operation, however, deserved its own deep dive.

Orphan file cleanup appears straightforward, find files that are no longer referenced by the Iceberg table and delete them. In practice, it is one of the riskiest maintenance operations because a single incorrect deletion can lead to permanent data loss.

In this article, we explain why we built our own orphan file cleanup implementation, the production challenges we encountered, and the safety mechanisms we designed to make it reliable.

## Why Orphan Files Exist

Orphan files are data or metadata files that exist in a table's storage location but are not referenced by any snapshot in the table's metadata. They accumulate silently and consume storage without serving any purpose.

Common scenarios that produce orphan files include:

- **Failed write operations.** A Spark or Flink job writes data files to storage but crashes before committing the snapshot. The files exist on disk but no metadata points to them.
- **Interrupted compaction jobs.** Compaction rewrites data files into larger, optimized ones. If the process fails after writing the new files but before the atomic metadata swap, both old and new files exist — but only the old ones are referenced.
- **Failed streaming writes.** Streaming engines like Flink commit at high velocity. A checkpoint failure or executor restart can leave uncommitted data files behind.
- **External tools writing into table locations.** ETL tools, migration scripts, or manual uploads sometimes place files into an Iceberg table's directory structure without going through Iceberg's commit protocol.

In all of these cases, the files are real and consume storage, but Iceberg has no record of them. Without cleanup, orphan files grow indefinitely.

## Why Orphan Cleanup Is Harder Than It Looks

At a high level, orphan cleanup seems simple:

1. List every file under the table location.
2. Read Iceberg metadata to identify referenced files.
3. Delete everything else.

Unfortunately, production environments introduce edge cases that make each of these steps dangerous.

### Concurrent Writes

Orphan cleanup operates on a moving target. While the cleanup process is scanning storage and building its list of referenced files, other jobs may be actively writing new data. Those newly written files exist in storage but have not yet been committed to Iceberg metadata.

A naive implementation sees those files as unreferenced and deletes them. The write job then tries to commit, pointing to files that no longer exist. The result is data loss.

Retention windows help (only delete files older than N days), but they are not a complete solution. A long-running batch job might write files that sit uncommitted for hours. A Flink checkpoint might hold references to files across multiple commit cycles. The window needs to be wide enough to cover the longest possible gap between file creation and metadata commit and that gap is workload-dependent.

### Large Object Stores

A production Iceberg table can contain millions of files spread across `data/` and `metadata/` directories. Listing all of them means paginating through the object store's list API, which is both slow and expensive at scale.

At the same time, building the set of referenced files requires reading every snapshot's manifest list, every manifest file, and every metadata file. For tables with hundreds of snapshots and thousands of manifests, this is a significant amount of I/O.

Running both operations in a single pass while keeping memory usage bounded is an engineering challenge that the basic algorithm does not address.

### Temporary Files from Compute Engines

Not every unreferenced file is an orphan in the traditional sense. Compute engines leave behind temporary files that serve operational purposes:

- **Flink** writes checkpoint metadata files into the table's metadata directory. These files are critical for exactly-once processing guarantees and should not be deleted while the Flink job is running.
- **Spark** may leave behind temporary files from speculative execution or failed task attempts.

Deleting these files while the engine is actively using them can corrupt running pipelines.

### Mixed Directory Contents

In many production environments, table directories contain files that Iceberg did not create and does not manage logs, README files, temporary uploads, or user-created folders. A cleanup process that deletes every unreferenced file risks removing things that have nothing to do with Iceberg.

## Why We Didn't Use the Default Implementation

Iceberg's [`remove_orphan_files`](https://iceberg.apache.org/docs/latest/spark-procedures/#remove_orphan_files) procedure is a well designed starting point. We covered how it works in [Part 2](/blog/iceberg-maintenance-operations) of this series. But for a managed platform running cleanup automatically across hundreds of tables, we needed additional guarantees that the built-in procedure does not provide:

- **No Spark dependency.** The default implementation runs as a Spark procedure. Orphan cleanup is fundamentally a metadata-plus-storage operation, it reads Iceberg metadata, lists object storage, and deletes files. None of that requires distributed data processing. Running it without Spark eliminates the compute overhead and the scheduling dependency on Spark cluster availability.
- **Threshold-based safety.** If the orphan ratio is unusually high, something may be wrong, a misconfigured table location, corrupted metadata, or a bug in the cleanup logic itself. The default procedure does not check for this; it deletes whatever it finds. We needed an automatic abort mechanism.
- **Batch deletion with backpressure.** Deleting thousands of files in a single API call can overwhelm object storage rate limits or cause cascading failures. We needed controlled, batched deletion with configurable cooldown periods.
- **Engine-aware exclusions.** Flink checkpoint files must not be deleted while a streaming job is running. The default procedure has no awareness of compute engine state.
- **Operational metrics.** A success/failure status tells you nothing useful. Every run should show what it actually did: files scanned, orphans found, storage reclaimed.

The goal was never to replace Iceberg's capabilities. It was to build the production grade guardrails required for an automated platform.

## How Our Implementation Works

### Step 1: Collecting Valid Files with a Bloom Filter

Before we can identify orphan files, we need to know which files are valid, meaning referenced by at least one snapshot. Building this set is the most expensive part of the operation.

A naive approach would load every referenced file path into a `HashSet`. For a table with 10 million data files, that set alone would consume hundreds of megabytes of memory. Multiply that by the number of tables being cleaned concurrently, and memory becomes a bottleneck.

Instead, we use a [Bloom filter](https://en.wikipedia.org/wiki/Bloom_filter), a probabilistic data structure that can tell you with certainty when a file is *not* in a set, and with a small, configurable error rate when it *might* be. We tuned ours to a 0.01% false positive rate — at most one in every 10,000 flagged files could actually be valid. And even that one survives, because it still has to clear the retention window and exclusion checks before anything gets deleted.

The Bloom filter handles up to 10 million data file entries and 10,000 metadata file entries, capped at around 24 MB, a fraction of what a `HashSet` would need.

The valid file collection walks through every snapshot in the table:

1. **Metadata files.** All reachable metadata file locations are collected using Iceberg's `ReachableFileUtil`.
2. **Manifest list files.** Each snapshot's manifest list location is added.
3. **Manifest files.** Each manifest is read to extract data file and delete file paths. A manifest cache (LRU, capacity 10,000) ensures manifests shared across snapshots are read only once.
4. **Statistics files and version hint.** Puffin statistics files and the version hint file are added to the metadata set.

To avoid overwhelming object storage during this phase, we apply throttling: after every batch of 1,500 files read from manifests, the process pauses for 100 milliseconds. This keeps the I/O rate sustainable for shared storage systems.

The result is two Bloom filters: one for content files (`data/`) and one for metadata files (`metadata/`), along with the total count and size of all valid files.

### Step 2: Counting Orphans Before Deleting Anything

With the valid file sets built, the next step is to scan the table's storage directories and classify every file. For each file in the `data/` and `metadata/` directories, we check:

1. **Is it referenced?** If the Bloom filter reports the file might be valid, we treat it as valid. No further checks needed.
2. **Is it excluded?** Metadata files matching an active Flink job ID pattern are excluded from deletion, even if unreferenced. This protects Flink checkpoint files for running streaming jobs.
3. **Is it old enough?** Files newer than the retention window (configured as `olderThanTimestamp`) are not eligible for deletion, regardless of their reference status. This protects in-flight commits and retry scenarios.

Only files that fail all three checks — unreferenced, not excluded, and older than the retention window — are classified as eligible orphans.

At this point, we have counted the orphans but have not deleted anything. This separation is deliberate.

### Step 3: Threshold Check — The Safety Net

Before any deletion begins, we calculate the orphan ratio: the number of eligible orphans divided by the total number of files (valid plus orphan).

If this ratio exceeds a configurable threshold (default: 50%), the entire cleanup operation aborts. No files are deleted. The run is recorded as aborted with the orphan statistics, so operators can investigate.

This check exists because an unusually high orphan ratio is a strong signal that something is wrong:

- **Incorrect table location.** The cleanup may be scanning a directory that contains unrelated files.
- **Metadata corruption.** The table's metadata may not accurately reflect the files that should exist.
- **Configuration error.** The retention window may be set too aggressively, causing recently written files to appear as orphans.

In any of these cases, blindly deleting files would cause significant damage. The threshold check prevents the cleanup from proceeding when the numbers don't look right.

The threshold applies only when the total file count exceeds a minimum (default: 1,000 files). For small tables with few files, orphan ratios can be naturally volatile, and a threshold would cause unnecessary aborts.

### Step 4: Batch Deletion with Backpressure

Once the threshold check passes, deletion proceeds in controlled batches.

Instead of issuing a single bulk delete for all orphan files, the process:

1. Collects orphan files into batches of a configurable size (default: 1,000 files).
2. Deletes each batch using the object store's bulk deletion API when supported (`SupportsBulkOperations`), or falls back to individual file deletion.
3. Applies a configurable cooldown period between batches to avoid overwhelming the storage API.

If a bulk deletion partially fails — a common occurrence with cloud object storage — the process handles it gracefully. It tracks how many files in the batch succeeded and how many failed, logs the partial failure, and continues with the next batch. The operation does not abort on partial batch failures.

This design reduces the blast radius of any single failure. If the process crashes mid-cleanup, only the current batch is affected. The remaining orphan files are left untouched and will be cleaned up on the next run.

### Step 5: Flink-Aware Exclusions

Flink writes checkpoint metadata files into the Iceberg table's `metadata/` directory. These files follow a naming pattern tied to the Flink job ID, which Flink stores in each snapshot's summary under the key `flink.job-id`.

Our implementation extracts the most recent Flink job ID from the table's snapshot history and builds a regex pattern that matches any metadata file associated with that job. Files matching this pattern are classified as orphans (they are unreferenced by Iceberg metadata) but are excluded from deletion.

This ensures that an active Flink streaming job's checkpoint files are never deleted, even if they appear as orphans to Iceberg.

## Minimum Retention Enforcement

Beyond the configurable retention window, the executor enforces a hard minimum retention period. If the configured retention is below this minimum (set at the platform level), the operation is rejected before any file scanning begins. This provides a platform-level safety net that prevents accidental misconfiguration from causing premature deletion, even if a user sets an aggressive retention policy on their table.

## What We Track

Every orphan cleanup run records detailed metrics:

| Metric | Description |
|---|---|
| Total data files | Number of files in the `data/` directory |
| Total metadata files | Number of files in the `metadata/` directory |
| Orphan data files | Data files identified as orphans |
| Orphan metadata files | Metadata files identified as orphans |
| Deleted data files | Data files actually deleted |
| Deleted metadata files | Metadata files actually deleted |
| Total data file size | Storage footprint of all data files |
| Total metadata file size | Storage footprint of all metadata files |
| Deleted data file size | Storage reclaimed from data file deletion |
| Deleted metadata file size | Storage reclaimed from metadata file deletion |
| Orphan percentage | Ratio of orphans to total files |
| Aborted due to threshold | Whether the run was stopped by the safety check |

These metrics are captured as before/after pairs and stored alongside every execution run, giving operators and users a clear view of what each cleanup accomplished.

## Lessons Learned

**Deleting files safely is harder than writing them.** A write that fails leaves behind an orphan — annoying, but harmless. A delete that targets the wrong file causes data loss. The asymmetry means the cleanup process needs to be significantly more careful than the write process that created the mess.

**Probabilistic data structures earn their keep at scale.** A Bloom filter with a 0.01% false positive rate and a 24 MB memory cap replaced what would have been a multi-gigabyte hash set for large tables. The tradeoff — occasionally skipping a real orphan — is negligible compared to the memory savings. That orphan will be caught on the next run.

**Safety mechanisms matter more than raw speed.** The threshold check, batch deletion, and retention enforcement all add latency to the cleanup process. That latency is the cost of not deleting customer data by accident. It is a worthwhile trade.

**Separating counting from deleting changes the risk profile.** Counting orphans first and checking the ratio before deleting anything turns a destructive operation into a two-phase process with an explicit go/no-go gate. Most of the bugs we caught during development would have been invisible in a single-pass implementation.

## Conclusion

Orphan file cleanup is one of those operations that seems trivial until you operate a lakehouse at scale.

Building a production-ready implementation was not about replacing Iceberg's capabilities — it was about adding the safety, observability, and operational guarantees required for an automated platform. Bloom filters keep memory bounded. Threshold checks prevent runaway deletions. Batch deletion with backpressure keeps storage APIs healthy. Flink-aware exclusions protect running pipelines.

These guardrails allow orphan cleanup to run continuously without risking customer data, turning a potentially dangerous maintenance task into a reliable part of day-to-day lakehouse operations.

---

## Resources & Further Reading

#### References
- [Apache Iceberg `remove_orphan_files` Procedure](https://iceberg.apache.org/docs/latest/spark-procedures/#remove_orphan_files): Iceberg's built-in Spark procedure for orphan file removal
- [Bloom Filters by Example](https://llimllib.github.io/bloomfilter-tutorial/): interactive tutorial on how Bloom filters work
- [Apache Iceberg Spec: Snapshots](https://iceberg.apache.org/spec/#snapshots): how Iceberg tracks file references through snapshots and manifests

#### IOMETE References
- [Automated Table Maintenance on IOMETE](/resources/user-guide/table-maintenance/overview): the feature this post describes, including setup and configuration
- [IOMETE Data Compaction Job](/resources/open-source-spark-jobs/data-compaction): open-source Spark job for scheduled Iceberg compaction