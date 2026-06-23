---
title: Why We Rebuilt Iceberg's Orphan File Cleanup from Scratch
description: How we built a custom Iceberg orphan file cleanup that uses Bloom filters, batched deletion, and safety thresholds — without requiring a Spark cluster.
slug: orphan-cleanup-from-scratch
authors: abhishek
hide_table_of_contents: true
tags2: [Engineering]
banner_description: "Iceberg's remove_orphan_files procedure works. Until you have millions of files, a streaming Flink pipeline, and no Spark cluster to spare."
date: 04/09/2026
---

# Why We Rebuilt Iceberg's Orphan File Cleanup from Scratch

*Iceberg's `remove_orphan_files` procedure works. Until you have millions of files, a streaming Flink pipeline, and no Spark cluster to spare. This is how we rebuilt orphan cleanup to run without Spark, use constant memory, and not accidentally delete your data.*

---

Orphan file cleanup is the most dangerous maintenance operation you can run on an Iceberg table. Every other operation (compaction, snapshot expiration, manifest rewriting) works within the metadata tree. They read metadata, make decisions, and commit new metadata. Orphan cleanup works *outside* the metadata tree. Its entire purpose is finding files that metadata doesn't know about. Get it wrong and you delete data that matters.

Iceberg ships a [`remove_orphan_files`](https://iceberg.apache.org/docs/latest/spark-procedures/#remove_orphan_files) procedure that handles the basic case well. But when we tried to run it automatically across hundreds of tables, some with millions of files, some with active Flink streaming jobs, some sitting on object stores with API rate limits, the stock procedure's limitations became real fast.

## What the stock procedure does (and where it breaks)

Iceberg's `remove_orphan_files` Spark procedure works in three steps. First, it collects all files referenced by the current metadata tree: every snapshot, every manifest, every data file, every delete file. Second, it lists all files at the table's storage location. Third, it compares the two sets and deletes anything in storage but not in metadata, subject to a retention period (default: 3 days).

The logic is correct. The problems are operational.

It requires [Spark](https://spark.apache.org/). The procedure runs as a distributed Spark job. For an operation that's fundamentally a metadata comparison and a batch of storage API calls, spinning up a Spark cluster is like renting a crane to move a couch. If your cluster is busy with analytical workloads, orphan cleanup either waits or competes for resources. If you're running a serverless Spark environment, you're paying for cluster startup time on an operation that doesn't need distributed compute.

It loads all valid file paths into memory. The stock procedure collects all referenced file paths into a Spark Dataset, then joins against the storage listing. For a table with 10 million data files, that's 10 million file paths in memory (or spilling to disk via Spark shuffle). This works, but it's heavy. On a table with 50 million files, we've seen the procedure take over an hour just to build the valid file set.

It has no abort mechanism. If 40% of your files are orphaned, which happens during catalog migrations, bulk load failures, or misconfigured table locations, the procedure will delete all of them. There's no "wait, that seems like too many" check. You find out after the fact, when queries start failing.

It doesn't know about streaming engines. [Flink](https://flink.apache.org/)'s Iceberg sink writes checkpoint metadata files that aren't referenced in Iceberg metadata but are actively used by Flink's [recovery mechanism](https://nightlies.apache.org/flink/flink-docs-master/docs/ops/state/checkpoints/). From Iceberg's perspective, these files are orphans. Delete them and the Flink job can't recover from its last checkpoint on restart.

It doesn't throttle storage API calls. On [S3](https://aws.amazon.com/s3/), LIST and DELETE operations have [rate limits](https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html). Deleting 100,000 files in rapid succession can trigger throttling, which cascades to slow down all other S3 operations on the same prefix, including your production queries.

These aren't bugs. They're limitations of a procedure designed for manual, occasional use on single tables. We needed something that could run automatically on hundreds of tables, safely, without Spark, and without surprising anyone.

## The architecture: two phases, no Spark

Our solution runs directly on the maintenance service using [Iceberg's Java API](https://iceberg.apache.org/docs/latest/api/). No Spark cluster involved. The operation has two phases: count, then delete.

The count phase scans storage and identifies orphan files without deleting anything. It calculates the orphan percentage. If the percentage exceeds a configurable safety threshold, the operation aborts and reports what it found. If the percentage is safe, the delete phase runs and removes the orphan files in throttled batches.

This two-phase approach means the threshold check happens before any file is deleted. In the stock procedure, there's no equivalent. You either delete everything or nothing.

We also separate data files and metadata files entirely. The `/data/` directory and the `/metadata/` directory are scanned independently with separate configurations. This matters because:

- Data files and metadata files have different cardinalities. A table with 10 million data files typically has only thousands of metadata files. Using the same data structure for both wastes memory.
- Streaming engine checkpoint exclusion applies only to metadata files. Data files written by Flink are properly tracked in Iceberg metadata. Checkpoint metadata is not.
- Orphan percentages differ between file types. A table might have a low percentage of orphan data files but a much higher percentage of orphan metadata files (common after many compaction cycles that generate and abandon metadata). Combining them masks the true distribution.

## Bloom filters instead of hash sets

The central question of orphan detection is: "Is this file referenced by any snapshot?" For every file in storage, you need to check membership against the set of valid files.

Think of it like a guest list at a venue. You have a list of everyone who's supposed to be there, and you're checking IDs at the door. A `HashSet<String>` is the straightforward approach: load every valid file path into memory and check each storage file against it. This works for small tables but the guest list gets unwieldy fast. Each file path is 100-200 bytes. For 10 million data files, that's 1-2 GB of heap just for the set. Since orphan cleanup runs on the maintenance service (not a Spark cluster with massive executors), memory is precious.

We use a [Bloom filter](https://en.wikipedia.org/wiki/Bloom_filter) instead. A Bloom filter is a probabilistic data structure that can tell you definitively if an element is *not* in the set, and with high probability if it *is* in the set. The tradeoff is false positives: the filter might say a file is valid when it's actually orphaned. It will never say a file is orphaned when it's valid.

That tradeoff is perfect here. A false positive means we skip deleting an orphan file. It stays around until the next cleanup cycle. A false negative would mean deleting a valid file, but Bloom filters don't produce false negatives. The safety direction is exactly right.

We create separate Bloom filters for data files and metadata files, each sized for their expected cardinality. The data file filter is sized for millions of entries; the metadata filter for a much smaller count. Both use a low false positive probability. At millions of entries, the Bloom filter consumes tens of megabytes of heap. A `HashSet` with the same entries would need gigabytes. The low FPP means that across thousands of orphan files, only a handful might be falsely identified as valid and skipped per run. They'll be cleaned up on the next cycle.

## Single-pass valid file collection with manifest deduplication

Building the valid file set means traversing all snapshots, reading all manifest lists, reading all manifests, and collecting every referenced file path. The naive approach reads every manifest in every snapshot independently. But Iceberg [snapshots share manifests](https://iceberg.apache.org/spec/#manifests). A table with 100 snapshots might reference only 500 unique manifests, while the total manifest references across all snapshots could be 5,000. Reading the same manifest 10 times is wasted I/O.

We use a bounded LRU cache to track which manifests we've already processed. When we encounter a manifest we've already seen, we skip it entirely. The LRU eviction ensures bounded memory even for tables with very large numbers of unique manifests.

The full collection runs in a single pass over all snapshots: collect metadata file locations, walk every snapshot's manifest list, read each unseen manifest, and add every referenced file to the appropriate Bloom filter. Statistics files and the version hint file are also collected.

We also throttle the traversal. After processing a batch of files from manifests, we pause briefly. This gives the JVM time to handle GC and prevents the heap from spiking during large table scans. Without this throttling, scanning a table with millions of data files across thousands of manifests would create a sustained allocation burst that could trigger long GC pauses or OOM on the maintenance service.

## URI normalization

Object storage URIs are inconsistent. The same physical file can appear as `s3://bucket/path/file.parquet` in one context and `s3a://bucket/path/file.parquet` in another. Iceberg metadata might use one scheme while the storage listing returns another.

If you naively compare full URIs, legitimate files look orphaned because the scheme doesn't match. The stock Iceberg procedure has an [`equal_schemes` parameter](https://iceberg.apache.org/docs/latest/spark-procedures/#remove_orphan_files) for this, but it's easy to misconfigure.

We normalize by extracting just the path component of the URI before adding to or querying the Bloom filter. By stripping the scheme and authority, both `s3://` and `s3a://` URIs reduce to the same path. It just works, without needing to configure scheme-matching tables.

## Safety mechanisms

As we covered in [Part 5](/blog/under-the-hood-optimizations), orphan cleanup needs more guardrails than any other operation. Here's how those mechanisms work at the implementation level.

### Abort threshold

Before deleting anything, we check whether the orphan percentage exceeds a configurable safety threshold. If it does, the operation aborts and reports what it found. There's also a floor: tables with a very small number of total files skip the percentage check entirely, because a small table with a handful of orphans can show a high percentage that's meaningless at that scale.

### Minimum retention floor

The backend enforces a minimum retention period. Any configuration below this floor is rejected with a non-retryable error. This prevents deleting files from in-progress writes that haven't committed yet. Iceberg writes are [not atomic at the storage level](https://iceberg.apache.org/docs/latest/reliability/) — data files are created *before* the metadata commit that references them. The retention window ensures even the slowest write operations have completed before their files become eligible for deletion.

### Streaming engine checkpoint exclusion

As discussed in [Part 5](/blog/under-the-hood-optimizations), streaming engines like Flink write checkpoint metadata that appears orphaned from Iceberg's perspective. We detect streaming engine metadata from snapshot summaries and exclude matching files. This applies only to metadata files — data files written by streaming engines are properly tracked in Iceberg metadata.

### Batched deletion with throttling

Deleting orphan files isn't a single API call. On a table with tens of thousands of orphan files, rapid-fire DELETE requests can trigger [S3 throttling](https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html) (the per-prefix rate limit is approximately 3,500 PUT/DELETE requests per second), which cascades to slow down all operations on that prefix — including production queries.

We delete in configurable batches with a cooldown period between them. Each batch is deleted via a bulk DELETE request when the storage backend supports it. If the bulk operation partially fails, we count successes and report partial results. If the storage backend doesn't support bulk operations, we fall back to single-file deletion with per-file error handling.

## How it all fits together

The full orphan cleanup flow for a single table:

```
1. Load table from catalog

2. Collect all valid files (single-pass):
   - Metadata files from the metadata tree
   - Manifest list locations from each snapshot
   - Data/delete files from each manifest (with dedup cache)
   - Statistics files and version hint
   → Data files → content Bloom filter
   → Metadata files → metadata Bloom filter
   → Extract streaming engine metadata for exclusion

3. Count phase:
   - LIST all files under /data/
   - For each: check Bloom filter → if miss, it's orphan
   - Check age threshold → if recent, skip
   - Tally orphan count and size
   - Same for /metadata/, plus check streaming engine exclusion

4. Threshold check:
   - Orphan % exceeds threshold? → ABORT, report findings
   - Total file count below floor? → Skip threshold, proceed

5. Delete phase:
   - Re-scan storage, collect eligible orphans in batches
   - Bulk delete each batch with cooldown between batches
   - Fallback to single-file delete on bulk failure

6. Report metrics (before/after counts and sizes)
```

The count phase and delete phase both scan storage separately. This means two full LIST operations per directory. We accept this cost because the alternative — holding all orphan file paths in memory between count and delete — would negate the memory savings from using Bloom filters. Two LIST scans are cheaper than an OOM on a table with millions of orphan files.

## Benchmarks

We benchmarked our implementation against Iceberg's stock Spark procedure on the same table with the same infrastructure available.

| | Custom implementation | Iceberg Spark procedure |
|---|---|---|
| Duration | ~30 seconds | ~90 seconds |
| Requires Spark cluster | No | Yes |
| Separate data/metadata tracking | Yes | No |
| Memory profile | Flat (Bloom filter) | Grows with file count (HashSet) |

On a table with tens of thousands of files, our implementation completed in roughly a third of the time. The stock procedure's overhead comes from Spark job mechanics: code generation, task serialization, driver coordination, and result collection. Our implementation is a single JVM thread doing sequential I/O against object storage with Bloom filter lookups. There's nothing to coordinate because there's no distributed execution.

### Scaling behavior

We tested against progressively larger tables. Two things stood out.

First, JVM heap stays flat regardless of table size. This is the Bloom filter at work. A `HashSet` scales linearly with file count — manageable at tens of thousands of files, but at millions of files it would consume gigabytes. The Bloom filter's memory is fixed at creation time.

Second, the bottleneck is storage LIST latency, not file count. S3 returns up to 1,000 objects per LIST request. Bloom filter lookups take nanoseconds; each LIST round-trip takes milliseconds. Tables with similar storage layouts but different file counts complete in similar times.

CPU utilization stayed low throughout. Orphan cleanup runs comfortably alongside the maintenance service's other work (detection, evaluation, snapshot expiration) without resource contention. Compare this to the Spark procedure, which allocates dedicated executor cores for the duration of the job.

### What the benchmarks don't show

These benchmarks used tables with tens of thousands to hundreds of thousands of files. At this scale, even the stock Spark procedure is fast enough. The performance gap widens at larger scales, where the stock procedure's linear memory growth may force spills to disk.

The real advantage isn't raw speed. It's that our implementation doesn't need a Spark cluster at all. For a weekly operation that takes under a minute, reserving Spark cluster capacity (or paying for serverless startup time) is overhead that doesn't justify itself. Running it as a background operation on the maintenance service costs nothing extra in infrastructure.

## Why not just improve the stock procedure?

We considered contributing improvements back to the Iceberg `remove_orphan_files` procedure. But the two implementations serve different purposes.

The stock procedure is a Spark SQL action designed for manual, one-table-at-a-time use where someone is watching. Ours runs unattended across hundreds of tables on a schedule. Bolting Bloom filters and batched deletion into a Spark procedure would mean changing Iceberg's internal APIs — a much larger scope than building our own.

The resource model is also different. The stock procedure can leverage Spark's distributed memory and shuffle. Ours runs on a single JVM with limited heap. The optimizations we built (Bloom filters, manifest caching, throttled scanning) exist specifically because we don't have a Spark cluster to fall back on.

Both have their place. If you're running ad-hoc cleanup on a single table, the stock procedure works fine. If you need automated, continuous cleanup across a catalog, you need something purpose-built.

## What we'd build differently

The double storage scan (count, then delete) is the most obvious optimization target. A single-pass approach that counts orphans, checks the threshold, and deletes in the same scan would halve the LIST API calls. We haven't done this because the current two-scan approach keeps the code simpler and the threshold check happens before any deletion begins. Mixing counting and conditional deletion in a single pass adds complexity around batch boundaries and rollback if the threshold is exceeded mid-scan.

The Bloom filter's false positive rate means we leave a tiny number of orphan files behind on each run. Over time, repeated runs converge — a file falsely identified as valid in one run has the same tiny chance of surviving the next. We've never seen false positives cause measurable orphan accumulation in practice.

We also considered adaptive batch sizing (smaller batches during peak hours, larger during off-peak) but decided the complexity wasn't justified. The current configuration works well across our production deployments. If a specific deployment hits storage throttling, adjusting the batch size in config is simpler than adding time-of-day awareness to the deletion pipeline.

## Resources & further reading

### Iceberg Orphan File Cleanup
- [Iceberg Maintenance Guide — Remove Orphan Files](https://iceberg.apache.org/docs/latest/maintenance/) — official documentation on `remove_orphan_files`, retention intervals, and safety caveats
- [DeleteOrphanFiles Javadoc](https://iceberg.apache.org/javadoc/1.10.0/org/apache/iceberg/actions/DeleteOrphanFiles.html) — API reference for the orphan file deletion action, including custom delete function support
- [Support for Orphan File Cleanup in Java SDK — Issue #15612](https://github.com/apache/iceberg/issues/15612) — upstream discussion on providing orphan cleanup without requiring Spark
- [Clean Up Orphan Files — Tabular Cookbook](https://www.tabular.io/apache-iceberg-cookbook/data-operations-orphan-file-cleanup/) — practical guide with examples and retention recommendations
- [How to Clean S3/OSS Orphan Files with Spark — Issue #8368](https://github.com/apache/iceberg/issues/8368) — community discussion on orphan cleanup scalability with cloud storage

### Bloom Filters
- [Bloom Filter — Wikipedia](https://en.wikipedia.org/wiki/Bloom_filter) — foundational reference on the probabilistic data structure, false positive rates, and optimal sizing
- [Bloom Filter in Java using Guava](https://www.baeldung.com/guava-bloom-filter) — practical guide to Guava's `BloomFilter` implementation with funnels and expected insertions
- [Bloom Filters by Example](http://llimllib.github.io/bloomfilter-tutorial/) — interactive tutorial explaining hash functions, bit arrays, and false positive probability

### Streaming Engine Checkpoint Protection
- [Flink TableMaintenance API](https://iceberg.apache.org/docs/nightly/flink-maintenance/) — Flink-native maintenance that understands checkpoint boundaries
- [Restoring Flink Jobs from Older Checkpoints May Cause Silent Data Loss — Issue #10892](https://github.com/apache/iceberg/issues/10892) — why orphan cleanup must exclude in-flight checkpoint files
- [Metadata File Not Found on Flink Checkpoint Recovery — Issue #4557](https://github.com/apache/iceberg/issues/4557) — metadata expiration breaking Flink checkpoint recovery

### Iceberg Internals & Manifest Structure
- [Iceberg Table Spec](https://iceberg.apache.org/spec/) — manifest lists, manifest files, data files, and how metadata references are structured
- [Iceberg Rewrite Manifest Files: A Guide](https://dev.to/davidwr/iceberg-rewrite-manifest-files-a-guide-m5f) — understanding manifest structure and deduplication
- [How to Fix Slow Iceberg Queries by Rewriting Manifest Files](https://medium.com/the-data-therapy/how-to-fix-slow-apache-iceberg-queries-by-rewriting-manifest-files-3f7e62e8aa3c) — manifest fragmentation and its impact on query planning

### Production Maintenance Patterns
- [Iceberg Table Maintenance: 4 Best Practices](https://bigdataboutique.com/blog/iceberg-table-maintenance-4-best-practices-e914ea) — coordinating compaction, expiration, manifest rewrites, and orphan cleanup
- [Best Practices for Optimizing Apache Iceberg Performance](https://www.starburst.io/blog/best-practices-for-optimizing-apache-iceberg-performance/) — file sizing targets, monitoring, and maintenance scheduling
- [The Iceberg Maintenance Runbook](https://iomete.com/resources/blog/iceberg-maintenance-runbook) — practical diagnostics for snapshots, orphan files, and metadata bloat

---

*This is a bonus deep-dive in our series on Apache Iceberg table maintenance. [Part 1](/blog/hidden-debt-in-lakehouse-tables) covered why tables degrade. [Part 2](/blog/iceberg-maintenance-operations) explained what Iceberg gives you out of the box. [Part 3](/blog/iceberg-maintenance-alternatives) surveyed the alternatives. [Part 4](/blog/how-we-built-automated-maintenance) told the engineering story. [Part 5](/blog/under-the-hood-optimizations) covered production safety mechanisms and lessons learned.*

