---
title: "The Iceberg Maintenance Runbook: Snapshots, Orphan Files, and Metadata Bloat"
description: "A practical, engineering-safe guide to keep Apache Iceberg tables healthy with the right order for snapshot expiration, orphan cleanup, and manifest rewrites - plus how IOMETE automates it."
slug: iceberg-maintenance-runbook
authors: aytan
tags2: [Engineering, Technical]
coverImage: img/blog/thumbnails/4.png
date: 12/04/2025
---

import FAQSection from '@site/src/components/FAQSection';

Keeping Iceberg tables fast and consistent requires understanding how metadata layers work and running maintenance in the right order. This runbook explains the mental model, the safe lifecycle (expire snapshots -> remove orphan files -> rewrite manifests), common failure modes, and how IOMETE automates the entire pipeline for regulated, self-hosted environments.

## Mental model how Iceberg metadata actually works

Iceberg metadata is layered, immutable, and versioned. Before touching retention or cleanup settings, know what each layer holds:

1. **Snapshots**: Complete, immutable versions of the table. Each write creates a snapshot with a manifest list pointer, operation summary, timestamp, and ID - enabling time travel and rollback.
2. **Manifest lists**: One per snapshot, listing all manifest files plus partition boundary statistics for pruning.
3. **Manifest files**: List data and delete files with paths, partition values, column-level stats, and add/delete markers.
4. **Metadata files (v1.metadata.json, v2.metadata.json, ...)**: Every commit writes a new metadata file with schema, partition specs, snapshot history, sort order, properties, and the current snapshot pointer. Old files remain until their snapshots expire.

## Why old metadata.json files persist

- Metadata is immutable. Files remain while any snapshot references them.
- They are removed only after snapshot expiration and orphan cleanup confirm no references.
- This is by design: preserving metadata keeps rollbacks and time travel instant.

## Critical metadata properties to set safely

- **write.metadata.delete-after-commit.enabled**: If true, deletes older metadata files that are unreferenced after a commit. Referenced files persist until snapshots expire.
- **write.metadata.previous-versions-max**: Caps how many unreferenced metadata files stay around to avoid uncontrolled growth.
- **history.expire.min-snapshots-to-keep**: Safety net so snapshot expiration cannot remove too many snapshots. Use higher values for streaming workloads.

Suggested guardrails:

- Batch workloads: keep 5-20 snapshots.
- Streaming workloads: keep 100+ snapshots because commit velocity is high.

## The correct maintenance order (minimal and safe)

Running tasks out of order risks data loss, broken time travel, or lingering orphan files. Always follow this sequence:

1. **Expire snapshots**: Remove historical snapshots per retention policy. Unlocks which data and manifests are eligible for removal.  
   `CALL system.expire_snapshots('table', older_than_timestamp, retain_last => N);`
2. **Remove orphan files**: After expiration, delete files not referenced by any metadata (data files, delete files, manifests, obsolete metadata).  
   `CALL system.remove_orphan_files('table');`
3. **Rewrite manifests (manifest compaction)**: Consolidate fragmented manifests to reduce planning overhead and metadata bloat.  
   `CALL system.rewrite_manifests('table');`

Why this order works:

- Expiration decides what is safe to delete.
- Orphan cleanup removes unreferenced physical files.
- Manifest rewrite then optimizes the remaining metadata for planning speed.

## Handling metadata bloat and snapshot leaks

- **Oversized manifest lists**: Symptoms include slow planning and excessive object storage GETs. Fix with `rewrite_manifests`.
- **Snapshot leaks**: Long-running jobs or aggressive retention settings prevent expiration. Fix by scheduling expiration and compaction more aggressively.
- **Delete-file bloat (MOR workloads)**: Delete files pile up faster than compaction. Fix with delete-file rewrites, regular compaction, and shorter snapshot retention.

## Failure patterns from aggressive settings

1. **Snapshot retention too short**: If `older_than` is tiny and `min-snapshots-to-keep` is low, long-running jobs may reference expired snapshots, causing failures or incomplete reads.
2. **Orphan cleanup before snapshot expiration**: Can delete files that snapshots still reference, especially if locations are misconfigured or external systems moved files. Always expire first.

## Recommended starting configurations

### High-churn streaming fact tables

| Setting | Recommended |
| --- | --- |
| Snapshot retention | 24-72 hours |
| min-snapshots-to-keep | 100-300 |
| Snapshot expiration | Every 1-3 hours |
| Orphan cleanup | Daily |
| Manifest rewrite | Every 12-24 hours |
| Compaction | Daily |

### Slowly changing dimensions (SCD Type 2)

| Setting | Recommended |
| --- | --- |
| Snapshot retention | 7-30 days |
| min-snapshots-to-keep | 10-50 |
| Snapshot expiration | Daily |
| Orphan cleanup | Weekly |
| Manifest rewrite | Weekly |
| Compaction | Weekly or monthly |

## How IOMETE automates and monitors the pipeline

- **Scheduled maintenance jobs**: Automated snapshot expiration, orphan cleanup, manifest rewrites, and data/delete-file compaction for predictable operations.
- **Table health dashboard**: Visibility into metadata file counts, manifest sizes, snapshot lineage, orphaned volume, and delete-file accumulation - gaps that vanilla OSS Iceberg leaves open.
- **Workload-aware policies**: Maintenance frequency adjusts to snapshot velocity, small-file growth, manifest expansion, and observed query patterns.
- **Safe execution framework**: Blocks misordered operations, protects snapshots referenced by active jobs, and keeps metadata consistent for multi-writer workloads.


:::tip
Apache Iceberg keeps old metadata files to preserve snapshot history. The safe maintenance order is expire snapshots -> remove orphan files -> rewrite manifests. This prevents metadata bloat and preserves time travel. IOMETE automates and monitors the lifecycle, eliminating operational risk for self-hosted teams.
:::

## Conclusion

Metadata is Iceberg's superpower when maintained correctly. With a clear snapshot lifecycle, conservative retention, and the right task ordering, tables stay fast and predictable at scale. IOMETE adds automation, observability, and guardrails so teams do not rely on brittle cron jobs or manual cleanup.

## FAQs

<FAQSection faqs={[
  {
    question: "Why do old metadata.json files stay in my Iceberg table?",
    answer: "Snapshots reference them; they are removed only after snapshot expiration and orphan cleanup confirm no references."
  },
  {
    question: "What is the correct order of Iceberg maintenance operations?",
    answer: "Expire snapshots, remove orphan files, then rewrite manifests."
  },
  {
    question: "Why does my metadata keep growing?",
    answer: "Too many snapshots, excessive small files, or missed manifest rewrite cycles."
  },
  {
    question: "What causes orphan files?",
    answer: "Expired snapshots, failed writes, external file movement, or partial commits."
  },
  {
    question: "What happens if I expire snapshots too aggressively?",
    answer: "Long-running queries can fail, and time travel becomes unsafe."
  },
  {
    question: "How often should I run snapshot expiration?",
    answer: "Streaming: every 1-3 hours. Batch: daily."
  },
  {
    question: "How does IOMETE simplify Iceberg maintenance?",
    answer: "It automates expiration, orphan cleanup, manifest compaction, and monitoring with workload-aware safety checks."
  }
]} />
