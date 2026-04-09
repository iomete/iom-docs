---
title: What Open-Source Iceberg Actually Gives You for Table Maintenance (And What It Doesn't)
description: Deep dive into Iceberg's four maintenance procedures — what each does at the file level, tuning parameters most teams miss, and where the DIY path breaks down.
slug: iceberg-maintenance-operations
authors: abhishek
hide_table_of_contents: true
tags2: [Engineering]
banner_description: Every team running Apache Iceberg in production eventually hits the same wall. What Iceberg gives you out of the box, what each operation actually does, and where the DIY path leads.
date: 04/09/2026
---

# What Open-Source Iceberg Actually Gives You for Table Maintenance (And What It Doesn't)

Every team running Apache Iceberg in production eventually hits the same wall. The queries slow down. Storage costs creep up. Someone opens a ticket. And the engineer who investigates discovers that Iceberg ships powerful maintenance primitives but no automation and no guidance on when to use them.

This is the second post in our series on Iceberg table maintenance. The first covered the hidden costs of ignoring it. This one maps the terrain: what Iceberg gives you out of the box, what each operation actually does at the file level, and where the DIY path leads. We tried most of these options before building our own system, and the gaps are real.

## What Iceberg Ships Out of the Box

Iceberg provides maintenance through three interfaces, each targeting a different persona.

**Spark SQL Procedures** are the most commonly used. They're registered automatically when you configure an Iceberg catalog in Spark. Four procedures cover the core operations:

```sql
CALL catalog.system.rewrite_data_files('db.table');
CALL catalog.system.expire_snapshots('db.table');
CALL catalog.system.remove_orphan_files(table => 'db.table');
CALL catalog.system.rewrite_manifests('db.table');
```

These are not just wrappers. Each procedure accepts a detailed options map. `rewrite_data_files` alone has over 15 tunable parameters: target file size (default 512 MB), minimum input files (default 5), maximum concurrent file group rewrites (default 5), partial progress commits, delete-file thresholds, and more. Most teams never touch them and then wonder why compaction runs slowly.

**The Java Actions API** provides programmatic access for applications that need more control. `SparkActions.get().rewriteDataFiles(table)` returns a builder where you can chain filters, set options, and execute. Same operations, same engine, but embeddable in custom services and CI pipelines.

**The Flink Maintenance Framework** is newer and less known. It lets you embed maintenance directly inside a Flink streaming job using the `TableMaintenance` API. You define a pipeline that includes `ExpireSnapshots`, `RewriteDataFiles`, and `DeleteOrphanFiles` as streaming operators, coordinated by a `TriggerLockFactory` (JDBC-backed) to prevent concurrent runs. This matters for teams already running Flink: you can compact files in the same job that writes them, without standing up a separate Spark cluster.

The Iceberg docs cover each procedure's parameters well. What they don't cover: recommended schedules, resource sizing, failure recovery, or how these operations interact with each other. That's on you.

## What Each Operation Actually Does Under the Hood

Most blog posts show you the SQL syntax. What follows is what actually happens at the file level.

### Compaction (rewrite_data_files)

Compaction is the most resource-intensive maintenance operation. It rewrites small data files into larger ones, reducing metadata overhead and the per-file cost of opening files during queries.

To make the mechanics concrete, we'll follow a single example through every stage: an e-commerce `orders` table that receives a stream of small writes throughout the day.

#### How Iceberg Selects Files for Compaction

Suppose your streaming pipeline writes one Parquet file per micro-batch to `ecommerce.orders`. After 24 hours, the partition `order_date = 2026-04-07` contains 10,000 files averaging 5 MB each — 50 GB of data.

An analyst runs:

```sql
SELECT * FROM ecommerce.orders WHERE order_date = '2026-04-07';
```

The query engine opens all 10,000 files, reads 10,000 Parquet footers, evaluates 10,000 sets of column statistics. Each file-open is a network round-trip to object storage. What should take seconds takes minutes.

When you run compaction:

```sql
CALL catalog.system.rewrite_data_files('ecommerce.orders');
```

Iceberg does not immediately read data. It starts by scanning the table's metadata — manifest files that record every data file's path, size, partition, and column-level stats. From this metadata, it classifies each file:

| File size | Classification | Action |
|-----------|---------------|--------|
| < 384 MB (75% of 512 MB target) | Too small | Candidate for merging |
| 384 MB – 922 MB | In range | Left alone |
| > 922 MB (180% of 512 MB target) | Too large | Candidate for splitting |

These thresholds derive from `target-file-size-bytes` (default: 512 MB). The 75% and 180% ratios are the default multipliers used by Iceberg's bin-pack file planner. You can override them explicitly with `min-file-size-bytes` and `max-file-size-bytes`.

In our example, every file is 5 MB — well under the 384 MB floor — so all 10,000 files are candidates.

There's an additional gate: `min-input-files` (default: 5). Even if files are undersized, a partition with fewer than 5 candidate files won't be rewritten unless the total data exceeds the target file size. This prevents wasteful rewrites of partitions with just a couple of small files.

#### How File Groups Control Parallelism

This is where most teams get surprised.

Iceberg doesn't hand each file to a separate task. Instead, it groups candidates into **file groups** using a bin-packing algorithm, capped at `max-file-group-size-bytes` (default: 100 GB). Groups never span partitions — each partition's files are grouped independently.

Back to our example: 10,000 files × 5 MB = 50 GB total, all in one partition. With the default 100 GB group size, everything fits in **one file group**. That means **one rewrite task**, regardless of how many Spark executors you have.

The thread pool for concurrent rewrites is sized by `max-concurrent-file-group-rewrites` (default: 5). But if you only have 1 group, that pool sits idle. Parallelism equals `min(number_of_groups, max-concurrent-file-group-rewrites)`, never the number of files.

To increase parallelism, shrink the group size:

```sql
CALL catalog.system.rewrite_data_files(
  table => 'ecommerce.orders',
  options => map(
    'max-file-group-size-bytes', '5368709120'  -- 5 GB per group
  )
);
```

Now 50 GB / 5 GB = 10 file groups. With the default concurrency of 5, Iceberg rewrites 5 groups in parallel, then the remaining 5. Each group reads its ~1,000 input files, merges the data, and writes ~10 output files of ~512 MB each.

The result: 10,000 files become ~100 files. The metadata swap is atomic — readers see either all-old or all-new files, never a partial state.

The sweet spot we found in production: 2 to 10 GB per group for tables with heavy small-file accumulation. Smaller groups mean more parallelism but also more commit overhead.

#### Compaction Strategies: Binpack vs Sort

The same `rewrite_data_files` procedure supports two strategies that produce very different outcomes from the same input.

**Binpack** (default) simply merges files to reach the target size. No reordering. It's fast because it reads rows and writes them back without shuffling data across the cluster.

```sql
CALL catalog.system.rewrite_data_files('ecommerce.orders');
-- Strategy defaults to 'binpack'
-- 10,000 × 5 MB files → ~100 × 512 MB files
-- Rows stay in whatever order they arrived
```

After binpack compaction, our analyst's full-partition scan is fast: 100 file-opens instead of 10,000. But a filtered query like `WHERE region = 'US'` still reads most files because `region = 'US'` rows are scattered across all of them.

**Sort** merges files *and* physically reorders rows by columns you specify. This clusters related data together so that queries with predicates on those columns can skip entire files using min/max statistics in the metadata.

```sql
CALL catalog.system.rewrite_data_files(
  table => 'ecommerce.orders',
  strategy => 'sort',
  sort_order => 'region ASC NULLS LAST, order_date ASC NULLS LAST'
);
```

Now all `region = 'US'` rows are physically adjacent. The query planner sees that files 1–12 have `region_min = 'US'` and `region_max = 'US'`, while files 13–100 don't. It reads 12 files instead of 100.

For queries that filter on multiple columns simultaneously, Z-order interleaves the sort keys so that no single column dominates the clustering:

```sql
CALL catalog.system.rewrite_data_files(
  table => 'ecommerce.orders',
  strategy => 'sort',
  sort_order => 'zorder(region, product_category)'
);
```

The tradeoff: sort compaction requires a full shuffle of the data across the cluster, making it significantly slower than binpack. Use binpack when file count is the problem; use sort when query performance on specific filter columns matters.

#### Partial Progress and Failure Recovery

By default, compaction is all-or-nothing. If you have 10 file groups and group 8 fails after 4 hours, Iceberg aborts every completed rewrite. The source code is explicit about this — in `RewriteDataFilesSparkAction`, a failure triggers cleanup of all finished groups:

```
Cannot complete rewrite, partial-progress.enabled is not enabled and one of the
file set groups failed to be rewritten... Cleaning up N groups which finished being written.
```

For large tables, this is unacceptable. Enable partial progress to let each group commit independently:

```sql
CALL catalog.system.rewrite_data_files(
  table => 'ecommerce.orders',
  options => map(
    'partial-progress.enabled', 'true',
    'partial-progress.max-commits', '10',
    'max-file-group-size-bytes', '5368709120'
  )
);
```

With this configuration, our 10 file groups each commit as soon as they finish. If group 8 fails, groups 1–7, 9, and 10 are already committed. You only need to retry the failed partition range, not the entire table.

The `max-commits` parameter (default: 10) caps the number of separate commits produced. If you have 20 file groups and `max-commits` is 10, Iceberg batches 2 groups per commit. There's also `partial-progress.max-failed-commits` (default: 10) which controls how many commit failures are tolerable before the entire job is marked as failed.

Without partial progress, a commit conflict (another writer touching the same files) also triggers a full abort. The error message from the source recommends enabling partial progress specifically for this scenario: *"To reduce the likelihood of conflicts, set partial-progress.enabled which will break up the rewrite into multiple smaller commits."*

#### Delete Files and Merge-on-Read Tables

Tables using Merge-on-Read (MoR) don't rewrite data files on delete — they write separate delete files that record which rows to skip. Over time, these accumulate and slow reads because the query engine must cross-reference delete files against data files at query time.

Compaction resolves this by applying the accumulated deletes: it reads the data file plus its delete files, materializes only the surviving rows, and writes clean output files.

Two thresholds control when delete-heavy files get pulled into compaction even if their size is in range:

- `delete-file-threshold` (default: `Integer.MAX_VALUE`, effectively disabled): rewrite a data file if it has this many or more associated delete files
- `delete-ratio-threshold` (default: `0.3`): rewrite a data file if 30% or more of its rows are marked deleted

```sql
CALL catalog.system.rewrite_data_files(
  table => 'ecommerce.orders',
  options => map(
    'delete-file-threshold', '5',
    'delete-ratio-threshold', '0.1',
    'remove-dangling-deletes', 'true'
  )
);
```

The `remove-dangling-deletes` option (default: false) adds a follow-up step that removes delete files which no longer reference any live data file — a common leftover after compaction rewrites the data files that the deletes originally targeted.

### Expire Snapshots

Every write to an Iceberg table creates a new snapshot. A streaming pipeline writing once per second generates 86,400 snapshots per day. Each snapshot references data files, preventing their deletion even if the data is obsolete.

`expire_snapshots` walks the snapshot chain and removes snapshots older than a timestamp (default: 5 days ago in the Spark procedure). The procedure also removes data files that are no longer referenced by any remaining snapshot. It respects a `retain_last` parameter (default: 1) that keeps a minimum number of snapshots regardless of age.

The critical detail: expiring snapshots directly deletes data files that are no longer referenced by any remaining snapshot. Until you expire, nothing gets cleaned up.

The operation walks metadata to determine which files to delete — it doesn't read data file contents, only removes them from storage. In IOMETE's system, it runs directly on the maintenance service without needing a Spark cluster.

### Orphan File Cleanup (remove_orphan_files)

Orphan files appear when writes fail mid-operation, jobs get killed, or compaction creates new files but crashes before committing. These files sit in storage, unreferenced by any metadata, consuming space silently.

The cleanup procedure performs a full filesystem scan of the table's storage location. It lists every file, then compares against all files referenced in the current metadata tree (all snapshots, all manifests). Any file not referenced and older than the retention period (default: 3 days) is deleted.

The 3-day minimum is a safety window. It exists because a write operation might have created files that haven't been committed yet. Delete them too early and you corrupt an in-progress transaction. The Iceberg docs explicitly warn that using a retention shorter than your longest expected write is dangerous.

There's a subtlety with S3 here. Iceberg supports both `s3://` and `s3a://` URI schemes. If your table metadata uses `s3a://` but the filesystem lists files as `s3://`, the comparison fails and legitimate files look orphaned. The `equal_schemes` parameter (default: `map('s3a,s3n','s3')`) handles this, but you have to know it exists.

For large tables, the filesystem scan itself can be expensive. This is why orphan cleanup typically runs on a cron schedule (weekly or monthly), not on every change.

### Manifest Rewrite (rewrite_manifests)

Iceberg metadata is layered: snapshots point to manifest lists, which point to manifest files, which list data files with their partition values and column statistics. Each write adds entries to the manifest tree. Over time, the manifest count grows and query planners slow down because they have to read every manifest during planning.

`rewrite_manifests` consolidates fragmented manifests. It reads all manifest entries, re-groups data files into fewer, better-organized manifest files (sorted by partition spec fields), and commits the new manifest structure atomically.

The effect is felt in query planning time, not query execution. If your queries are slow to *start* but fast once running, manifest bloat is likely the cause. We've seen tables where manifest rewriting cut planning time from 45 seconds to under 2.

## What Iceberg Does NOT Give You

The list is longer than most people expect.

Iceberg has no built-in scheduler. You call procedures manually or build something yourself. Nothing monitors whether a table *needs* maintenance. There's no metric for "too many small files" or "snapshots are piling up," so you either run on a fixed schedule (wasteful for healthy tables) or write your own detection logic.

If you have 500 tables, you need to figure out which ones need maintenance, in what order, with what priority, and how to avoid overwhelming your spark cluster. Iceberg gives you nothing for this. The procedures return result rows (files rewritten, bytes changed), but there's no dashboard, no history, no alerting. If a compaction job fails at 3 AM, you find out when someone complains about slow queries the next morning.

A compaction job can consume your entire Spark cluster with no built-in resource governance. And if compaction crashes halfway through, some file groups may have committed (with partial progress on) and some haven't. You need to figure out the state and re-run. Iceberg doesn't track this for you.

This is not a criticism. Iceberg is a table format, not a platform. But the gap between "table format with maintenance primitives" and "production-ready maintenance system" is substantial.

## The DIY Path

Most teams start with cron and scripts. The pattern usually looks like this:

1. A Python script that iterates over tables in a catalog
2. Calls Spark procedures via `spark-submit` or a Spark session
3. Scheduled via cron, Airflow, or Dagster
4. Logs piped to a file or a monitoring tool

Community engineers have shared Python classes on Medium for multi-table maintenance with configurable thresholds. Vincent Daniel's approach wraps compaction, snapshot expiration, and orphan cleanup in a class that iterates tables and applies size-based defaults. It's a solid starting point.

We started here at IOMETE — using our built-in Spark scheduler with a [Data Compaction Job](https://iomete.com/resources/open-source-spark-jobs/data-compaction-job) from our marketplace. It removed the need for an external orchestrator like Airflow, but the fundamental limitations of scheduled maintenance remained. Fixed schedules are wasteful — running compaction on a table that doesn't need it burns compute for nothing. Detecting which tables actually need maintenance requires reading metadata, so your scheduler needs catalog access and evaluation logic. Retrying a compaction job that partially committed can create duplicate data if you're not careful. That experience is what pushed us toward building fully automated table maintenance.

For teams with 50 tables and batch-only workloads, cron is fine. For anything larger, the DIY approach becomes its own engineering project.

The next post surveys the alternatives — from Apache Amoro to managed platforms like Snowflake, Databricks, and AWS — and identifies the gaps that persist across all of them.

---

*This is Part 2 of our series on Apache Iceberg table maintenance. [Part 1](/blog/hidden-debt-in-lakehouse-tables) covered why unmaintained tables rot. Next: [Part 3](/blog/iceberg-maintenance-alternatives) surveys the alternatives landscape.*

---

## Resources & further reading

- [Apache Iceberg Maintenance Guide](https://iceberg.apache.org/docs/latest/maintenance/) — official guide covering all four maintenance operations, recommended schedules, and caveats
- [Iceberg Spark Procedures](https://iceberg.apache.org/docs/latest/spark-procedures/) — full parameter reference for `rewrite_data_files`, `expire_snapshots`, `remove_orphan_files`, and `rewrite_manifests`
- [Iceberg Flink Maintenance](https://iceberg.apache.org/docs/latest/flink-maintenance/) — embedding maintenance tasks inside Flink streaming jobs with `TableMaintenance` API
- [Iceberg Table Spec — Snapshot Retention Policy](https://iceberg.apache.org/spec/#snapshot-retention-policy) — how the format defines snapshot expiration at the spec level
- [Vincent Daniel: Automating Apache Iceberg Maintenance with Spark and Python](https://medium.com/@vincent_daniel/automating-apache-iceberg-maintenance-with-spark-and-python-ee1a253de86c) — Python class approach with size-based table classification
- [IOMETE Data Compaction Job](https://iomete.com/resources/open-source-spark-jobs/data-compaction-job) — open-source Spark job for scheduled Iceberg compaction

