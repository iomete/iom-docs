---
title: "What Open-Source Iceberg Actually Gives You for Table Maintenance (And What It Doesn't)"
description: "Deep dive into Iceberg's four maintenance procedures: what each does at the file level, tuning parameters most teams miss, and where the DIY path breaks down."
slug: iceberg-maintenance-operations
authors: Shashank
hide_table_of_contents: false
tags2: [Engineering]
banner_description: Every team running Apache Iceberg in production eventually hits the same wall. What Iceberg gives you out of the box, what each operation actually does, and where the DIY path leads.
coverImage: img/blog/thumbnails/darkStone.png
date: 2026-04-09
---

import Img from '@site/src/components/Img';

# What Open-Source Iceberg Actually Gives You for Table Maintenance (And What It Doesn't)

*Iceberg ships the maintenance primitives, but no scheduler, no health checks, and no orchestration. This post unpacks what each operation actually does at the file level, the tuning parameters most teams miss, and where the DIY path breaks down.*

---

Every team running [Apache Iceberg](https://iceberg.apache.org/) in production eventually hits the same wall. Queries slow down, storage costs creep up, and someone opens a ticket. The engineer who investigates discovers that Iceberg ships the maintenance primitives but no automation and no guidance on when to use them.

This is the second post in our series on Iceberg table maintenance. [Part 1](/blog/hidden-debt-in-lakehouse-tables) covered the hidden costs of ignoring it. This one maps the terrain: what Iceberg gives you out of the box, what each operation actually does at the file level, and where the DIY path leads. We tried most of these options before building our own system, and the gaps are real.

## What Iceberg Ships Out of the Box

Iceberg exposes the same set of maintenance operations through **three different interfaces**, each aimed at a different persona:

| # | Interface | Who uses it | When it fits |
|---|---|---|---|
| 1 | Spark SQL Procedures | Analysts, data engineers | Default: ad-hoc or scheduled SQL |
| 2 | Java Actions API | Backend engineers | Embedded in services, CI, custom orchestrators |
| 3 | Flink Maintenance Framework | Streaming teams | Already running Flink, no separate Spark cluster |

The operations underneath are identical. What changes is *where the call originates from*.

### 1. Spark SQL Procedures

[Spark SQL Procedures](https://iceberg.apache.org/docs/latest/spark-procedures/) are by far the most commonly used. They're registered automatically when you configure an Iceberg catalog in Spark. Four procedures cover the core operations:

```sql
CALL catalog.system.rewrite_data_files('db.table');
CALL catalog.system.expire_snapshots('db.table');
CALL catalog.system.remove_orphan_files(table => 'db.table');
CALL catalog.system.rewrite_manifests('db.table');
```

Here's what a detailed call to [`rewrite_data_files`](https://iceberg.apache.org/docs/latest/spark-procedures/#rewrite_data_files) looks like:

```sql
CALL catalog.system.rewrite_data_files(
  table   => 'ecommerce.orders',
  strategy => 'sort',
  sort_order => 'region ASC, order_date ASC',
  options => map(
    'target-file-size-bytes',          '536870912',
    'min-input-files',                 '5',
    'max-file-group-size-bytes',       '5368709120',
    'max-concurrent-file-group-rewrites', '5',
    'partial-progress.enabled',        'true',
    'partial-progress.max-commits',    '10',
    'delete-file-threshold',           '5',
    'delete-ratio-threshold',          '0.1',
    'remove-dangling-deletes',         'true'
  )
);
```

That's just a slice of what `rewrite_data_files` exposes. The full procedure has [over 15 tunable parameters](https://iceberg.apache.org/docs/latest/spark-procedures/#options) governing file selection, parallelism, failure recovery, and Merge-on-Read behavior. The other three procedures follow the same pattern.

Most teams call them with defaults and then wonder why compaction runs slowly, fails on large tables, or never reclaims storage.

### 2. Java Actions API

The [Java Actions API](https://iceberg.apache.org/docs/latest/api/#actions) provides programmatic access for applications that need more control than a SQL `CALL`. `SparkActions.get().rewriteDataFiles(table)` returns a builder where you can chain filters, set options, and execute. Same operations, same engine, but embeddable in custom services and CI pipelines.

The same `rewrite_data_files` call shown above looks like this in Java:

```kotlin
Table table = catalog.loadTable(TableIdentifier.of("ecommerce", "orders"));

RewriteDataFiles.Result result = SparkActions.get()
    .rewriteDataFiles(table)
    .filter(Expressions.equal("order_date", "2026-04-07"))
    .sort(SortOrder.builderFor(table.schema())
        .asc("region")
        .asc("order_date")
        .build())
    .option("target-file-size-bytes", "536870912")
    .option("max-file-group-size-bytes", "5368709120")
    .option("partial-progress.enabled", "true")
    .option("partial-progress.max-commits", "10")
    .execute();
```

### 3. Flink Maintenance Framework

The [Flink Maintenance Framework](https://iceberg.apache.org/docs/latest/flink-maintenance/) is newer and less known. It lets you embed maintenance directly inside a Flink streaming job using the `TableMaintenance` API. You define a pipeline that includes `ExpireSnapshots`, `RewriteDataFiles`, and `DeleteOrphanFiles` as streaming operators, coordinated by a `TriggerLockFactory` (JDBC-backed) to prevent concurrent runs. This matters for teams already running Flink: you can compact files in the same job that writes them, without standing up a separate Spark cluster.

The [Iceberg docs](https://iceberg.apache.org/docs/latest/maintenance/) cover each procedure's parameters well. What they don't cover: recommended schedules, resource sizing, failure recovery, or how these operations interact with each other. That's on you.

## What Each Operation Actually Does Under the Hood

Most blog posts show you the SQL syntax. What follows is what actually happens at the file level.

### Compaction ([rewrite_data_files](https://iceberg.apache.org/docs/latest/spark-procedures/#rewrite_data_files))

Compaction is the most resource-intensive maintenance operation. It rewrites small data files into larger ones, reducing metadata overhead and the per-file cost of opening files during queries.

To make the mechanics concrete, we'll follow a single example through every stage: an e-commerce `orders` table that receives a stream of small writes throughout the day.

<Img src="/img/blog/2026-04-09-iceberg-maintenance-operations/compaction-before-after.svg" alt="Compaction before and after: 10,000 × 5 MB Parquet files in one partition collapse into ~100 × 512 MB files after rewrite_data_files. Same 50 GB of data, 100× fewer file-opens during planning." borderless/>

#### How Iceberg Selects Files for Compaction

Suppose your streaming pipeline writes one [Parquet](https://parquet.apache.org/docs/) file per micro-batch to `ecommerce.orders`. After 24 hours, the partition `order_date = 2026-04-07` contains 10,000 files averaging 5 MB each, totaling 50 GB of data.

An analyst runs:

```sql
SELECT * FROM ecommerce.orders WHERE order_date = '2026-04-07';
```

The query engine opens all 10,000 files, reads 10,000 Parquet footers, evaluates 10,000 sets of column statistics. Each file-open is a network round-trip to object storage. What should take seconds takes minutes.

When you run compaction:

```sql
CALL catalog.system.rewrite_data_files('ecommerce.orders');
```

Iceberg does not immediately read data. It starts by scanning the table's [metadata](https://iceberg.apache.org/spec/#table-metadata): manifest files that record every data file's path, size, partition, and column-level stats. From this metadata, it classifies each file:

| File size | Classification | Action |
|-----------|---------------|--------|
| < 384 MB (75% of 512 MB target) | Too small | Candidate for merging |
| 384 MB – 922 MB | In range | Left alone |
| > 922 MB (180% of 512 MB target) | Too large | Candidate for splitting |

These thresholds derive from [`target-file-size-bytes`](https://iceberg.apache.org/docs/latest/configuration/#write-properties) (default: 512 MB). The 75% and 180% ratios are the default multipliers used by Iceberg's [bin-pack file planner](https://github.com/apache/iceberg/blob/main/core/src/main/java/org/apache/iceberg/actions/BinPackRewriteFilePlanner.java). You can override them explicitly with [`min-file-size-bytes` and `max-file-size-bytes`](https://iceberg.apache.org/docs/latest/spark-procedures/#options) in the procedure's options map.

<Img src="/img/blog/2026-04-09-iceberg-maintenance-operations/file-selection-flow.svg" alt="How rewrite_data_files decides which files to compact: each file is classified by size against the 512 MB target. Files under 384 MB are too-small candidates, files between 384 and 922 MB are skipped as in-range, files over 922 MB are too-large candidates. Too-small candidates pass through a min-input-files ≥ 5 gate before being added to a file group; otherwise the partition is skipped. All accepted candidates are bin-packed into file groups." borderless/>

In our example, every file is 5 MB, well under the 384 MB floor, so all 10,000 files are candidates.

There's an additional gate: `min-input-files` (default: 5). Even if files are undersized, a partition with fewer than 5 candidate files won't be rewritten unless the total data exceeds the target file size. This prevents wasteful rewrites of partitions with just a couple of small files.

#### How File Groups Control Parallelism

This is where most teams get surprised.

Iceberg doesn't hand each file to a separate task. Instead, it groups candidates into **file groups** using a bin-packing algorithm, capped at `max-file-group-size-bytes` (default: 100 GB). Groups never span partitions; each partition's files are grouped independently.

<Img src="/img/blog/2026-04-09-iceberg-maintenance-operations/file-groups-parallelism.svg" alt="File-group sizing controls parallelism. Default 100 GB group cap collapses 50 GB of input into 1 group → 1 task → 5 executor slots sit idle. Tuned 5 GB cap yields 10 groups → 5 parallel tasks bounded by max-concurrent-file-group-rewrites." borderless/>

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

The result: 10,000 files become ~100 files. The metadata swap is atomic, so readers see either all-old or all-new files, never a partial state.

The sweet spot we found in production: **2 to 10 GB per group** for tables with heavy small-file accumulation. Smaller groups mean more parallelism but also more commit overhead.

#### Compaction Strategies: Binpack vs Sort

The same `rewrite_data_files` procedure supports two strategies that produce very different outcomes from the same input.

**Binpack** (default) merges files to reach the target size. No reordering. It's fast because it reads rows and writes them back without shuffling data across the cluster.

```sql
CALL catalog.system.rewrite_data_files('ecommerce.orders');
-- Strategy defaults to 'binpack'
-- 10,000 × 5 MB files → ~100 × 512 MB files
-- Rows stay in whatever order they arrived
```

After binpack compaction, our analyst's full-partition scan is fast: 100 file-opens instead of 10,000. But a filtered query like `WHERE region = 'US'` still reads most files because `region = 'US'` rows are scattered across all of them.

**[Sort](https://iceberg.apache.org/docs/latest/spark-procedures/#options_2)** merges files *and* physically reorders rows by columns you specify. This clusters related data together so that queries with predicates on those columns can skip entire files using min/max statistics in the metadata.

```sql
CALL catalog.system.rewrite_data_files(
  table => 'ecommerce.orders',
  strategy => 'sort',
  sort_order => 'region ASC NULLS LAST, order_date ASC NULLS LAST'
);
```

Now all `region = 'US'` rows are physically adjacent. The query planner sees that files 1–12 have `region_min = 'US'` and `region_max = 'US'`, while files 13–100 don't. It reads 12 files instead of 100.

For queries that filter on multiple columns simultaneously, [Z-order](https://iceberg.apache.org/docs/latest/spark-procedures/#options_2) interleaves the sort keys so that no single column dominates the clustering:

```sql
CALL catalog.system.rewrite_data_files(
  table => 'ecommerce.orders',
  strategy => 'sort',
  sort_order => 'zorder(region, product_category)'
);
```

<Img src="/img/blog/2026-04-09-iceberg-maintenance-operations/binpack-vs-sort.svg" alt="Binpack vs Sort vs Z-order: same input, different physical layout. Binpack preserves arrival order (cheap, no shuffle, scans most files on a region filter). Sort by region clusters rows by one key (skips most files, full shuffle). Z-order interleaves multiple keys for multi-column filters." borderless/>

The tradeoff: sort compaction requires a full shuffle of the data across the cluster, making it significantly slower than binpack. Use **binpack when file count is the problem**; use **sort when query performance on specific filter columns matters**; use **z-order when filters span multiple columns equally**.

#### Partial Progress and Failure Recovery

By default, compaction is all-or-nothing. If you have 10 file groups and group 8 fails after 4 hours, Iceberg aborts every completed rewrite. The [source code](https://github.com/apache/iceberg/blob/main/spark/v3.5/spark/src/main/java/org/apache/iceberg/spark/actions/RewriteDataFilesSparkAction.java) is explicit about this. Inside `RewriteDataFilesSparkAction`, a failure triggers cleanup of all finished groups:

```
Cannot complete rewrite, partial-progress.enabled is not enabled and one of the
file set groups failed to be rewritten... Cleaning up N groups which finished being written.
```

For large tables, this is unacceptable. Enable [partial progress](https://iceberg.apache.org/docs/latest/spark-procedures/#options) to let each group commit independently:

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

<Img src="/img/blog/2026-04-09-iceberg-maintenance-operations/partial-progress.svg" alt="Partial-progress turns one all-or-nothing job into ten independent commits. With partial-progress.enabled = false (default), if group 8 fails the other 7 successful rewrites are aborted and no commit reaches the table — hours of work lost. With partial-progress.enabled = true, each group commits independently, 9 of 10 commits land, only group 8 needs retry. Also reduces commit-conflict aborts." borderless/>

With this configuration, our 10 file groups each commit as soon as they finish. If group 8 fails, groups 1–7, 9, and 10 are already committed. You only need to retry the failed partition range, not the entire table.

The `max-commits` parameter (default: 10) caps the number of separate commits produced. If you have 20 file groups and `max-commits` is 10, Iceberg batches 2 groups per commit. There's also `partial-progress.max-failed-commits` (default: 10) which controls how many commit failures are tolerable before the entire job is marked as failed.

Without partial progress, a commit conflict (another writer touching the same files) also triggers a full abort. The error message from the source recommends enabling partial progress specifically for this scenario: *"To reduce the likelihood of conflicts, set partial-progress.enabled which will break up the rewrite into multiple smaller commits."*

#### Delete Files and Merge-on-Read Tables

Tables using [Merge-on-Read (MoR)](https://iceberg.apache.org/spec/#row-level-deletes) don't rewrite data files on delete. Instead, they write separate [delete files](https://iceberg.apache.org/spec/#delete-formats) that record which rows to skip. Over time, these accumulate and slow reads because the query engine must cross-reference delete files against data files at query time.

Compaction resolves this by applying the accumulated deletes: it reads the data file plus its delete files, materializes only the surviving rows, and writes clean output files.

<Img src="/img/blog/2026-04-09-iceberg-maintenance-operations/mor-compaction.svg" alt="MoR compaction reads delete files and writes clean output. Before: a 10,000-row data file plus 6 accumulated delete files marking 3,200 rows; queries pay the cost of cross-referencing all of them. After: a single rewritten data file with 6,800 surviving rows and the delete files discarded. Trigger knobs: delete-file-threshold (rewrite if ≥ N delete files), delete-ratio-threshold (rewrite if ≥ 30% rows deleted), remove-dangling-deletes (drop deletes with no live target)." borderless/>

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

The `remove-dangling-deletes` option (default: false) adds a follow-up step that removes delete files which no longer reference any live data file. These are common leftovers after compaction rewrites the data files that the deletes originally targeted.

For a deeper look at the COW vs MoR tradeoff and when each shows up in practice, see [Part 1](/blog/hidden-debt-in-lakehouse-tables#what-actually-happens-when-you-write-data) of this series.

### Expire Snapshots ([expire_snapshots](https://iceberg.apache.org/docs/latest/spark-procedures/#expire_snapshots))

Every write to an Iceberg table creates a new [snapshot](https://iceberg.apache.org/spec/#snapshots). A streaming pipeline writing once per second generates 86,400 snapshots per day. Each snapshot references data files, preventing their deletion even if the data is obsolete.

[`expire_snapshots`](https://iceberg.apache.org/docs/latest/spark-procedures/#expire_snapshots) walks the snapshot chain and removes snapshots older than a timestamp (default: 5 days ago in the Spark procedure). The procedure also removes data files that are no longer referenced by any remaining snapshot. It respects a `retain_last` parameter (default: 1) that keeps a minimum number of snapshots regardless of age.

<Img src="/img/blog/2026-04-09-iceberg-maintenance-operations/expire-snapshots.png" alt="Why compaction alone does not shrink storage: before, many small files using 1 TB; after compaction, snapshots not yet expired so storage doubles to 2 TB; after expire_snapshots, old snapshots cleaned and storage drops back to 1 TB." borderless/>

The critical detail: expiring snapshots directly deletes data files that are no longer referenced by any remaining snapshot. Until you expire, nothing gets cleaned up. Even after compaction rewrites them into larger files, the originals stay around because old snapshots still point to them.

The operation walks metadata to determine which files to delete. It doesn't read data file contents, only removes them from storage. In IOMETE's system, it runs directly on the maintenance service without needing a Spark cluster.

A common production pattern: combine a 7-day retention with `retain_last => 10` so that even on quiet tables you keep enough snapshots for [time travel](https://iceberg.apache.org/docs/latest/spark-queries/#time-travel) and rollback debugging.

### Orphan File Cleanup ([remove_orphan_files](https://iceberg.apache.org/docs/latest/spark-procedures/#remove_orphan_files))

[Orphan files](https://iceberg.apache.org/docs/latest/spark-procedures/#remove_orphan_files) appear when writes fail mid-operation, jobs get killed, or compaction creates new files but crashes before committing. These files sit in storage, unreferenced by any metadata, consuming space silently.

The cleanup procedure performs a full filesystem scan of the table's storage location. It lists every file, then compares against all files referenced in the current metadata tree (all snapshots, all manifests). Any file not referenced **and** older than the retention period (default: 3 days) is deleted.

<Img src="/img/blog/2026-04-09-iceberg-maintenance-operations/orphan-file-scan.svg" alt="remove_orphan_files: set difference, gated by retention. The procedure LISTs every object under the table path, then runs each file through two gates. Gate 1: is the file in the metadata referenced-set? Gate 2: is it older than the retention window (3 days default)? Three outcomes: keep (referenced), skip (orphan but newer than 3 days, may be in-flight), delete (orphan and older than 3 days). Watch for s3 vs s3a scheme mismatches via the equal_schemes parameter." borderless/>

The 3-day minimum is a safety window. It exists because a write operation might have created files that haven't been committed yet. Delete them too early and you corrupt an in-progress transaction. The Iceberg docs explicitly warn that using a retention shorter than your longest expected write is dangerous.

There's a subtlety with [S3](https://aws.amazon.com/s3/) here. Iceberg supports both `s3://` and `s3a://` URI schemes. If your table metadata uses `s3a://` but the filesystem lists files as `s3://`, the comparison fails and legitimate files look orphaned. The `equal_schemes` parameter (default: `map('s3a,s3n','s3')`) handles this, but you have to know it exists. The same trap applies to `gs://` (GCS) and `abfss://` (Azure) when migrating between connectors.

For large tables, the filesystem scan itself can be expensive. Listing tens of millions of objects in S3 can take hours and incur non-trivial [LIST request costs](https://aws.amazon.com/s3/pricing/). This is why orphan cleanup typically runs on a cron schedule (weekly or monthly), not on every change.

### Manifest Rewrite ([rewrite_manifests](https://iceberg.apache.org/docs/latest/spark-procedures/#rewrite_manifests))

Iceberg metadata is layered: snapshots point to manifest lists, which point to [manifest files](https://iceberg.apache.org/spec/#manifests), which list data files with their partition values and column statistics. Each write adds entries to the manifest tree. Over time, the manifest count grows and query planners slow down because they have to read every manifest during planning.

[`rewrite_manifests`](https://iceberg.apache.org/docs/latest/spark-procedures/#rewrite_manifests) consolidates fragmented manifests. It reads all manifest entries, re-groups data files into fewer, better-organized manifest files (sorted by partition spec fields), and commits the new manifest structure atomically.

<Img src="/img/blog/2026-04-09-iceberg-maintenance-operations/manifest-rewrite.png" alt="Same data files, very different planning cost. Healthy metadata: 3 large manifests covering ~1,000 files each, planning under a second. Fragmented metadata: 24+ small manifests each covering ~125 files, planning takes tens of seconds. Compaction fixes the data layer; rewriting manifests keeps the metadata layer lean." borderless/>

The effect is felt in **query planning time**, not query execution. If your queries are slow to *start* but fast once running, manifest bloat is likely the cause. We've seen tables where manifest rewriting cut planning time from 45 seconds to under 2.

A useful diagnostic before running it:

```sql
SELECT count(*), avg(length), sum(added_data_files_count)
FROM ecommerce.orders.manifests;
```

If average manifest length is small (a few hundred KB) and count is in the hundreds or thousands, you're a candidate.

## What Iceberg Does NOT Give You

The list is longer than most people expect.

Iceberg has **no built-in scheduler**. You call procedures manually or build something yourself. Nothing monitors whether a table *needs* maintenance. There's no metric for "too many small files" or "snapshots are piling up," so you either run on a fixed schedule (wasteful for healthy tables) or write your own detection logic.

If you have 500 tables, you need to figure out which ones need maintenance, in what order, with what priority, and how to avoid overwhelming your Spark cluster. Iceberg gives you nothing for this. The procedures return result rows (files rewritten, bytes changed), but there's **no dashboard, no history, no alerting**. If a compaction job fails at 3 AM, you find out when someone complains about slow queries the next morning.

A compaction job can consume your entire Spark cluster with no built-in **resource governance**. And if compaction crashes halfway through, some file groups may have committed (with partial progress on) and some haven't. You need to figure out the state and re-run. Iceberg doesn't track this for you.

| Capability | Open-source Iceberg | What you need in production |
|---|---|---|
| Maintenance procedures | ✅ Four procedures | ✅ Same |
| Scheduling | ❌ | Cron, Airflow, or event-driven |
| Health detection | ❌ | Per-table metrics + thresholds |
| Multi-table prioritization | ❌ | Queue with cost-aware ordering |
| Resource isolation | ❌ | Quotas per pool / tenant |
| Run history & observability | ❌ | Per-run logs, metrics, audit |
| Partial-failure recovery state | ❌ | Tracked, resumable jobs |
| Alerting | ❌ | Hooks into PagerDuty / Slack |

This is not a criticism. Iceberg is a table format, not a platform. But the gap between "table format with maintenance primitives" and "production-ready maintenance system" is substantial.

## The DIY Path

Most teams start with cron and scripts. The pattern usually looks like this:

1. A Python script that iterates over tables in a catalog
2. Calls Spark procedures via `spark-submit` or a Spark session
3. Scheduled via cron, [Airflow](https://airflow.apache.org/), or [Dagster](https://dagster.io/)
4. Logs piped to a file or a monitoring tool

<Img src="/img/blog/2026-04-09-iceberg-maintenance-operations/diy-architecture.svg" alt="DIY maintenance architecture: cron / Airflow triggers a Python wrapper that opens a Spark session and calls each system procedure (rewrite_data_files, expire_snapshots, remove_orphan_files, rewrite_manifests). Logs go to flat files; no central health view, no health detection, no prioritization, no resource governance, no failure recovery state." borderless/>

Community engineers have shared Python classes on Medium for multi-table maintenance with configurable thresholds. [Vincent Daniel's approach](https://medium.com/@vincent_daniel/automating-apache-iceberg-maintenance-with-spark-and-python-ee1a253de86c) wraps compaction, snapshot expiration, and orphan cleanup in a class that iterates tables and applies size-based defaults. It's a solid starting point.

We started here at IOMETE, using our built-in Spark scheduler with a [Data Compaction Job](https://iomete.com/resources/open-source-spark-jobs/data-compaction-job) from our marketplace. It removed the need for an external orchestrator like Airflow, but the fundamental limitations of scheduled maintenance remained:

- **Fixed schedules are wasteful.** Running compaction on a table that doesn't need it burns compute for nothing.
- **Detecting which tables actually need maintenance** requires reading metadata, so your scheduler needs catalog access and evaluation logic.
- **Retries are dangerous.** Re-running a compaction job that partially committed can create duplicate data if you're not careful.
- **Multi-engine catalogs break the abstraction.** A table written by Flink and read by Trino still has to be maintained by Spark, and your scheduler has to know all three engines.

That experience is what pushed us toward building fully automated table maintenance.

For teams with 50 tables and batch-only workloads, cron is fine. For anything larger, the DIY approach becomes its own engineering project.

The next post surveys the alternatives, from [Apache Amoro](https://amoro.apache.org/) to managed platforms like [Snowflake](https://docs.snowflake.com/en/user-guide/tables-iceberg-manage), [Databricks](https://docs.databricks.com/aws/en/optimizations/predictive-optimization), and AWS, and identifies the gaps that persist across all of them.

---

*This is Part 2 of our series on Apache Iceberg table maintenance. [Part 1](/blog/hidden-debt-in-lakehouse-tables) covered why unmaintained tables rot. Next: [Part 3](/blog/iceberg-maintenance-alternatives) surveys the alternatives landscape.*

---

## Resources & further reading

### Official Iceberg docs
- [Apache Iceberg Maintenance Guide](https://iceberg.apache.org/docs/latest/maintenance/): official guide covering all four maintenance operations, recommended schedules, and caveats
- [Iceberg Spark Procedures](https://iceberg.apache.org/docs/latest/spark-procedures/): full parameter reference for `rewrite_data_files`, `expire_snapshots`, `remove_orphan_files`, and `rewrite_manifests`
- [Iceberg Flink Maintenance](https://iceberg.apache.org/docs/latest/flink-maintenance/): embedding maintenance tasks inside Flink streaming jobs with `TableMaintenance` API
- [Iceberg Java Actions API](https://iceberg.apache.org/docs/latest/api/#actions): programmatic access to the same maintenance operations
- [Iceberg Table Spec, Snapshot Retention Policy](https://iceberg.apache.org/spec/#snapshot-retention-policy): how the format defines snapshot expiration at the spec level
- [Iceberg Table Spec, Delete Formats](https://iceberg.apache.org/spec/#delete-formats): Merge-on-Read delete file mechanics
- [Iceberg Configuration Properties](https://iceberg.apache.org/docs/latest/configuration/): table-level and write properties that affect maintenance behavior

### Source references
- [`RewriteDataFilesSparkAction`](https://github.com/apache/iceberg/blob/main/spark/v3.5/spark/src/main/java/org/apache/iceberg/spark/actions/RewriteDataFilesSparkAction.java): partial-progress and abort logic
- [Iceberg release notes](https://iceberg.apache.org/releases/): maintenance-related improvements per version

### Community & DIY
- [Vincent Daniel: Automating Apache Iceberg Maintenance with Spark and Python](https://medium.com/@vincent_daniel/automating-apache-iceberg-maintenance-with-spark-and-python-ee1a253de86c): Python class approach with size-based table classification
- [IOMETE Data Compaction Job](https://iomete.com/resources/open-source-spark-jobs/data-compaction-job): open-source Spark job for scheduled Iceberg compaction

### Series
- [Part 1: The Hidden Debt in Your Lakehouse Tables](/blog/hidden-debt-in-lakehouse-tables)
- [Part 3: The Iceberg Table Maintenance Landscape](/blog/iceberg-maintenance-alternatives)