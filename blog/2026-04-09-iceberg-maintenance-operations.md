---
title: "What Iceberg Gives You for Table Maintenance and What It Doesn't"
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

# What Iceberg Gives You for Table Maintenance and What It Doesn't

*Iceberg ships the maintenance primitives, but no scheduler, no health checks, and no orchestration. This post unpacks what each operation actually does at the file level, the tuning parameters most teams miss, and where the DIY path breaks down.*

---

Every team running [Apache Iceberg](https://iceberg.apache.org/) in production eventually hits the same wall. Queries slow down, storage costs creep up, and someone opens a ticket. The engineer who investigates discovers that Iceberg ships the maintenance primitives but no automation and no guidance on when to use them.

This is the second post in our series on Iceberg table maintenance. [Part 1](/blog/hidden-debt-in-lakehouse-tables) covered the hidden costs of ignoring it. This one maps the terrain: what Iceberg gives you out of the box, what each operation actually does at the file level, and where the DIY path leads. We tried most of these options before building our own system, and the gaps are real.

## What Iceberg Ships Out of the Box

Iceberg exposes the same set of maintenance operations through **three different interfaces**, each aimed at a different persona:

| # | Interface | Who uses it | When it fits |
|---|---|---|---|
| 1 | Spark SQL Procedures | Data engineers, platform engineers | Default — ad-hoc or scheduled SQL |
| 2 | Spark Actions API (Java/Scala) | Backend / platform engineers | Embedded in services, CI, custom orchestrators |
| 3 | Flink Maintenance Framework | Streaming teams | Already running Flink, no separate Spark cluster |

The operations underneath are identical. What changes is *where the call originates from*.

### Spark SQL Procedures

[Spark SQL Procedures](https://iceberg.apache.org/docs/latest/spark-procedures/) are by far the most commonly used. They're registered automatically when you configure an Iceberg catalog in Spark. Four procedures cover the core operations:

```sql
CALL catalog.system.rewrite_data_files('db.table');
CALL catalog.system.expire_snapshots('db.table');
CALL catalog.system.remove_orphan_files(table => 'db.table');
CALL catalog.system.rewrite_manifests('db.table');
```

Each procedure takes a long options map. [`rewrite_data_files`](https://iceberg.apache.org/docs/latest/spark-procedures/#rewrite_data_files) alone has [over 15 tunable parameters](https://iceberg.apache.org/docs/latest/spark-procedures/#options) covering file selection, parallelism, failure recovery, and Merge-on-Read behavior. The other three procedures follow the same pattern. Most teams call them with defaults and then wonder why compaction runs slowly, fails on large tables, or never reclaims storage.

We walk through the parameters that matter in [What Each Operation Actually Does](#what-each-operation-actually-does-under-the-hood).

### Spark Actions API

The [Spark Actions API](https://iceberg.apache.org/docs/latest/api/#actions) provides programmatic access for applications that need more control than a SQL `CALL`. It's still Spark underneath — you just call it from Java or Scala instead of SQL. `SparkActions.get().rewriteDataFiles(table)` returns a builder where you can chain filters, set options, and execute. Same operations, same engine, embeddable in custom services and CI pipelines.

From Java, the same procedure is a builder:

```kotlin
Table table = catalog.loadTable(TableIdentifier.of("ecommerce", "orders"));

RewriteDataFiles.Result result = SparkActions.get()
    .rewriteDataFiles(table)
    .filter(Expressions.equal("order_date", "2026-04-07"))
    .execute();
```

The builder accepts the same options as the SQL `CALL` via `.option(key, value)`, and `Result` exposes counters (files rewritten, bytes changed) you can log or alert on.

### Flink Maintenance Framework

The [Flink Maintenance Framework](https://iceberg.apache.org/docs/latest/flink-maintenance/) is newer and less known. It lets you embed maintenance directly inside a Flink streaming job using the `TableMaintenance` API. You define a pipeline that includes `ExpireSnapshots`, `RewriteDataFiles`, and `DeleteOrphanFiles` as streaming operators, coordinated by a `TriggerLockFactory` (JDBC-backed) to prevent concurrent runs. This matters for teams already running Flink: you can compact files in the same job that writes them, without standing up a separate Spark cluster.

## What Each Operation Actually Does Under the Hood

Calling these procedures is one line of SQL. Running them well is dozens of decisions: how big each file group should be, when partial progress should kick in, which sort order to apply, when to expire, when to clean up. The [Iceberg docs](https://iceberg.apache.org/docs/latest/maintenance/) cover *what* the parameters mean. 

The next four sections cover *why* you'd touch them — what each procedure reads and writes at the file level, and how the defaults break down at scale.

### Compaction

[`rewrite_data_files`](https://iceberg.apache.org/docs/latest/spark-procedures/#rewrite_data_files) is the most resource-intensive maintenance operation. It rewrites small data files into larger ones, reducing metadata overhead and the per-file cost of opening files during queries.

To make the mechanics concrete, we'll follow a single example through every stage. `ecommerce.orders` is a Merge-on-Read Iceberg table that ingests one Parquet file per Spark Structured Streaming microbatch:

```sql
CREATE TABLE ecommerce.orders (
  order_id           BIGINT,
  customer_id        BIGINT,
  region             STRING,        -- US, EU, AS, ZA
  product_category   STRING,
  amount             DECIMAL(10,2),
  status             STRING,
  order_date         DATE           -- partition column
)
USING iceberg
PARTITIONED BY (order_date)
TBLPROPERTIES ('write.delete.mode' = 'merge-on-read');
```

The image below shows what one day's partition looks like before and after compaction.

<Img src="/img/blog/2026-04-09-iceberg-maintenance-operations/compaction-before-after.png" alt="Compaction before and after: 10,000 × 5 MB Parquet files in one partition collapse into ~100 × 512 MB files after rewrite_data_files. Same 50 GB of data, 100× fewer file-opens during planning." borderless/>

The five subsections that follow walk through how compaction gets from the left side of that image to the right:

1. **File Selection** — which files become candidates
2. **File Groups and Parallelism** — how candidates get grouped into tasks
3. **Binpack vs Sort vs Z-Order** — how rows get reordered
4. **Partial Progress and Recovery** — what happens when a rewrite fails
5. **Merge-on-Read Compaction** — how delete files get materialized

#### 1. File Selection

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

<Img src="/img/blog/2026-04-09-iceberg-maintenance-operations/file-selection-flow.png" alt="How rewrite_data_files decides which files to compact: each file is classified by size against the 512 MB target. Files under 384 MB are too-small candidates, files between 384 and 922 MB are skipped as in-range, files over 922 MB are too-large candidates. Too-small candidates pass through a min-input-files ≥ 5 gate before being added to a file group; otherwise the partition is skipped. All accepted candidates are bin-packed into file groups." borderless/>

Two checks decide whether a partition actually gets rewritten:

1. **Are there candidates?** A file is a candidate if its size falls outside the in-range band — under 384 MB or over 922 MB. In our example, every file is 5 MB, so all 10,000 are candidates.
2. **Is there enough work to be worth it?** The `min-input-files` parameter (default: 5) requires at least 5 candidates per partition. There's a back-door: if the candidates' total size already exceeds `target-file-size-bytes` (512 MB), the rewrite proceeds even with fewer files. The point is to skip partitions where compaction would barely change anything.

Our partition passes both. 10,000 candidates, 50 GB total — easy yes.

#### 2. File Groups and Parallelism

This is where most teams get surprised.

**Iceberg doesn't parallelize over files. It parallelizes over file groups.** A bin-packing algorithm bundles candidate files into groups up to `max-file-group-size-bytes` (default: 100 GB), and groups never span partitions.

**Our example produces exactly one group.** 10,000 files × 5 MB = 50 GB, all in one partition, fits comfortably under the 100 GB ceiling. One group means one rewrite task — regardless of how many Spark executors you have idling.

**The parallelism formula** is `min(number_of_groups, max-concurrent-file-group-rewrites)`. That second parameter (default: 5) sizes the thread pool. With 1 group and a pool of 5, four slots sit idle. The number of files never enters the math.

<Img src="/img/blog/2026-04-09-iceberg-maintenance-operations/file-groups-parallelism.png" alt="File-group sizing controls parallelism. Default 100 GB group cap collapses 50 GB of input into 1 group → 1 task → 5 executor slots sit idle. Tuned 5 GB cap yields 10 groups → 5 parallel tasks bounded by max-concurrent-file-group-rewrites." borderless/>

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

#### 3. Binpack vs Sort vs Z-Order

The same `rewrite_data_files` procedure supports two strategies that produce very different outcomes from the same input.

**[Binpack](https://iceberg.apache.org/docs/latest/spark-procedures/#usage_9)** (default) merges files to reach the target size. No reordering. It's fast because it reads rows and writes them back without shuffling data across the cluster.

```sql
CALL catalog.system.rewrite_data_files('ecommerce.orders');
-- Strategy defaults to 'binpack'
-- 10,000 × 5 MB files → ~100 × 512 MB files
-- Rows stay in whatever order they arrived
```

After binpack compaction, our analyst's full-partition scan is fast: 100 file-opens instead of 10,000. But a filtered query like `WHERE region = 'US'` still reads most files because `region = 'US'` rows are scattered across all of them.

**[Sort](https://iceberg.apache.org/docs/latest/spark-procedures/#options-for-sort-strategy)** merges files *and* physically reorders rows by columns you specify. This clusters related data together so that queries with predicates on those columns can skip entire files using min/max statistics in the metadata.

```sql
CALL catalog.system.rewrite_data_files(
  table => 'ecommerce.orders',
  strategy => 'sort',
  sort_order => 'region ASC NULLS LAST, order_date ASC NULLS LAST'
);
```

Now all `region = 'US'` rows are physically adjacent. The query planner sees that files 1–12 have `region_min = 'US'` and `region_max = 'US'`, while files 13–100 don't. It reads 12 files instead of 100.

For queries that filter on multiple columns simultaneously, [Z-order](https://iceberg.apache.org/docs/latest/spark-procedures/#options-for-sort-strategy-with-zorder-sort_order) interleaves the sort keys so that no single column dominates the clustering:

```sql
CALL catalog.system.rewrite_data_files(
  table => 'ecommerce.orders',
  strategy => 'sort',
  sort_order => 'zorder(region, product_category)'
);
```

<Img src="/img/blog/2026-04-09-iceberg-maintenance-operations/binpack-vs-sort.png" alt="Binpack vs Sort vs Z-order: same input, different physical layout. Binpack preserves arrival order (cheap, no shuffle, scans most files on a region filter). Sort by region clusters rows by one key (skips most files, full shuffle). Z-order interleaves multiple keys for multi-column filters." borderless/>

The tradeoff: sort and z-order require a full shuffle of the data across the cluster, making them significantly slower than binpack.

When to pick what:

- **Binpack** — when file count is the problem
- **Sort** — when query performance on a single filter column matters
- **Z-order** — when filters span multiple columns equally

#### 4. Partial Progress and Recovery

By default, compaction is all-or-nothing. If you have 10 file groups and group 8 fails after 4 hours, Iceberg aborts every completed rewrite. The [source code](https://github.com/apache/iceberg/blob/main/spark/v3.5/spark/src/main/java/org/apache/iceberg/spark/actions/RewriteDataFilesSparkAction.java) is explicit about this. Inside `RewriteDataFilesSparkAction`, a failure triggers cleanup of all finished groups:

```
Cannot complete rewrite, partial-progress.enabled is not enabled and one of the
file set groups failed to be rewritten... Cleaning up N groups which finished being written.
```

For large tables, this is unacceptable. A 4-hour compaction that aborts on group 8 means 4 hours of compute thrown away, and the table is still uncompacted when you wake up to retry it. Enable [partial progress](https://iceberg.apache.org/docs/latest/spark-procedures/#options) to let each group commit independently:

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

<Img src="/img/blog/2026-04-09-iceberg-maintenance-operations/partial-progress.png" alt="Partial-progress turns one all-or-nothing job into ten independent commits. With partial-progress.enabled = false (default), if group 8 fails the other 7 successful rewrites are aborted and no commit reaches the table — hours of work lost. With partial-progress.enabled = true, each group commits independently, 9 of 10 commits land, only group 8 needs retry. Also reduces commit-conflict aborts." borderless/>

With this configuration, our 10 file groups each commit as soon as they finish. If group 8 fails, groups 1–7, 9, and 10 are already committed. You only need to retry the failed partition range, not the entire table.

The `max-commits` parameter (default: 10) caps the number of separate commits produced. If you have 20 file groups and `max-commits` is 10, Iceberg batches 2 groups per commit. There's also `partial-progress.max-failed-commits` (default: 10) which controls how many commit failures are tolerable before the entire job is marked as failed.

Without partial progress, a commit conflict (another writer touching the same files) also triggers a full abort.

**The downsides:** More snapshots per job (one per commit), more work for `expire_snapshots` later, and success becomes partial instead of binary.

#### 5. Merge-on-Read Compaction

Tables using [Merge-on-Read (MoR)](https://iceberg.apache.org/spec/#row-level-deletes) don't rewrite data files on delete. Instead, they write separate [delete files](https://iceberg.apache.org/spec/#delete-formats) that record which rows to skip. Over time, these accumulate and slow reads because the query engine must cross-reference delete files against data files at query time.

Compaction resolves this by applying the accumulated deletes: it reads the data file plus its delete files, materializes only the surviving rows, and writes clean output files.

<Img src="/img/blog/2026-04-09-iceberg-maintenance-operations/mor-compaction.png" alt="MoR compaction reads delete files and writes clean output. Before: a 10,000-row data file plus 6 accumulated delete files marking 3,200 rows; queries pay the cost of cross-referencing all of them. After: a single rewritten data file with 6,800 surviving rows and the delete files discarded. Trigger knobs: delete-file-threshold (rewrite if ≥ N delete files), delete-ratio-threshold (rewrite if ≥ 30% rows deleted), remove-dangling-deletes (drop deletes with no live target)." borderless/>

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

### Expire Snapshots

Most teams think of `expire_snapshots` as cleanup. It's actually two different things at once.

First, **storage hygiene**: every snapshot pins the data files it references, so old, compacted-away files keep using disk until expiry runs. [Part 1](/blog/hidden-debt-in-lakehouse-tables) walked through why this happens.

Second — and the one most teams miss — **compliance**. Iceberg's DELETE is a soft delete: time travel can resurrect any deleted row right up until the snapshot covering it expires. For GDPR, CCPA, and similar regimes, [`expire_snapshots`](https://iceberg.apache.org/docs/latest/spark-procedures/#expire_snapshots) is what turns a logical delete into a real one.

<Img src="/img/blog/2026-04-09-iceberg-maintenance-operations/expire-snapshots.png" alt="Why compaction alone does not shrink storage: before, many small files using 1 TB; after compaction, snapshots not yet expired so storage doubles to 2 TB; after expire_snapshots, old snapshots cleaned and storage drops back to 1 TB." borderless/>

These parameters control how the expiry runs:

- `older_than` (default: 5 days ago) — the cutoff timestamp
- `retain_last` (default: 1) — minimum snapshots to keep regardless of age

The defaults are conservative for streaming tables and aggressive for quiet ones. A pattern that works across both: `7-day retention` with `retain_last => 10` — enough history for [time travel](https://iceberg.apache.org/docs/latest/spark-queries/#time-travel) and rollback debugging on quiet tables, enough storage release on busy ones. Compliance-driven workloads often run tighter (e.g. 24 hours after a delete commit) to limit the window where deleted data is recoverable.

```sql
CALL catalog.system.expire_snapshots(
  table       => 'ecommerce.orders',
  older_than  => TIMESTAMP '2026-04-02 00:00:00.000',
  retain_last => 10
);
```

### Orphan File Cleanup

[Part 1](/blog/hidden-debt-in-lakehouse-tables) explained what orphan files are and how they accumulate. The operational question is when and how to run [`remove_orphan_files`](https://iceberg.apache.org/docs/latest/spark-procedures/#remove_orphan_files) without breaking your table or burning your storage bill.

<Img src="/img/blog/2026-04-09-iceberg-maintenance-operations/orphan-file-scan.png" alt="remove_orphan_files: set difference, gated by retention. The procedure LISTs every object under the table path, then runs each file through two gates. Gate 1: is the file in the metadata referenced-set? Gate 2: is it older than the retention window (3 days default)? Three outcomes: keep (referenced), skip (orphan but newer than 3 days, may be in-flight), delete (orphan and older than 3 days). Watch for s3 vs s3a scheme mismatches via the equal_schemes parameter." borderless/>

**It's the most expensive maintenance operation by far.** The procedure performs a full filesystem scan of the table's storage location, then diffs the listing against every file referenced in metadata. On a small table that's seconds. On a table with tens of millions of objects, the LIST calls alone can take hours and incur real [S3 cost](https://aws.amazon.com/s3/pricing/). Most teams schedule this weekly or monthly, never per-write.

**Two operational risks:**

- **The 3-day retention is a safety window**, not a cleanup tunable. It exists so in-flight writes that haven't committed yet aren't mistaken for orphans. Shorten it below your longest expected write duration and you'll corrupt the operation it interrupts — including any concurrent compaction that's still mid-flight.
- **URI scheme mismatches create false orphans.** If table metadata uses `s3a://` but the filesystem lists `s3://`, every legitimate file looks orphaned. The `equal_schemes` parameter (default: `map('s3a,s3n','s3')`) handles the common case; opt in explicitly for `gs://` or `abfss://`.

**Tuning knobs:**

- `older_than` — retention window (default: 3 days)
- `max_concurrent_deletes` — parallelism for the deletes (default: 4)
- `equal_schemes` / `equal_authorities` — URI aliases for cross-scheme compatibility
- `dry_run` — returns the list of files *that would be* deleted, without deleting them

Always pass `dry_run => true` the first time you run this on a new table:

```sql
CALL catalog.system.remove_orphan_files(
  table       => 'ecommerce.orders',
  older_than  => TIMESTAMP '2026-04-02 00:00:00.000',
  dry_run     => true
);
```

### Manifest Rewrite

[Part 1](/blog/hidden-debt-in-lakehouse-tables) covered why manifest files fragment over time and how it slows query planning. The operational question is when [`rewrite_manifests`](https://iceberg.apache.org/docs/latest/spark-procedures/#rewrite_manifests) is worth running and how to know your table needs it.

<Img src="/img/blog/2026-04-09-iceberg-maintenance-operations/manifest-rewrite.png" alt="Same data files, very different planning cost. Healthy metadata: 3 large manifests covering ~1,000 files each, planning under a second. Fragmented metadata: 24+ small manifests each covering ~125 files, planning takes tens of seconds. Compaction fixes the data layer; rewriting manifests keeps the metadata layer lean." borderless/>

**The effect lands in query planning, not execution.** If your queries are slow to *start* but fast once running, manifest bloat is the likely cause. Iceberg opens and parses every manifest before deciding which data files to scan; with hundreds of fragmented manifests, that alone can take tens of seconds. We've seen tables where rewriting manifests cut planning time from 45 seconds to under 2.

**Diagnose before you run.** The `manifests` metadata table tells you whether you're a candidate:

```sql
SELECT count(*), avg(length), sum(added_data_files_count)
FROM ecommerce.orders.manifests;
```

If count is in the hundreds or thousands and average length is small (a few hundred KB), you're fragmented. If count is under ~10 with multi-MB average length, you're already in good shape — running the procedure won't help.

**Run it after compaction.** Compaction commits create fresh manifest entries grouped by write time, not by partition. `rewrite_manifests` re-groups them by partition spec, which is what makes partition pruning fast. (See [How the Four Operations Interact](#how-the-four-operations-interact) for the full pipeline order.)

**Tuning knobs:**

- `use_caching` (default: true) — cache manifest entries during the rewrite for speed
- `spec_id` — rewrite manifests for one partition spec only (useful after schema evolution where old and new specs coexist)

```sql
CALL catalog.system.rewrite_manifests(
  table => 'ecommerce.orders'
);
```

**Cheap to run.** It reads metadata only — no data file I/O — so it's much cheaper than compaction. On hot tables it can run daily without operational concern.

### How the Four Operations Interact

The conventional pipeline order is:

```
rewrite_data_files  →  rewrite_manifests  →  expire_snapshots  →  remove_orphan_files
    (data)               (metadata)            (storage)            (debris)
```

Skip any step and the others stop working as advertised:

- **Compact without expiring snapshots and your storage doubles.** Compaction creates new larger files; the old small files stay referenced by old snapshots and keep using disk. The image in *Expire Snapshots* above shows the 1 TB → 2 TB → 1 TB progression.
- **Compact without rewriting manifests and planning stays slow.** Each compaction commit produces fresh manifest entries, but grouped by write time, not partition. Manifest rewriting is what gives you partition-clustered manifests for fast pruning.
- **Expire snapshots without orphan cleanup and partial-failure debris stays.** If a compaction job dies mid-write, its output files are unreferenced by any snapshot. Expiry won't touch them. Only `remove_orphan_files` does, and only after the retention window.

## What Iceberg Doesn't Give You (And the DIY Path That Follows)

So far we've covered the four operations and how each works under the hood. Calling them is the easy part. Running them across hundreds of tables, on a schedule that fits the workload, and recovering when one fails — that's the part Iceberg doesn't help with.

### The Gaps

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

### The DIY Pattern

Most teams close that gap with cron and scripts. The pattern usually looks like this:

1. A Python script that iterates over tables in a catalog
2. Calls Spark procedures via `spark-submit` or a Spark session
3. Scheduled via cron, [Airflow](https://airflow.apache.org/), or [Dagster](https://dagster.io/)
4. Logs piped to a file or a monitoring tool

<Img src="/img/blog/2026-04-09-iceberg-maintenance-operations/diy-architecture.png" alt="DIY maintenance architecture: cron / Airflow triggers a Python wrapper that opens a Spark session and calls each system procedure (rewrite_data_files, expire_snapshots, remove_orphan_files, rewrite_manifests). Logs go to flat files; no central health view, no health detection, no prioritization, no resource governance, no failure recovery state." borderless/>

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

## Resources & Further Reading

#### Official Iceberg Docs
- [Apache Iceberg Maintenance Guide](https://iceberg.apache.org/docs/latest/maintenance/): official guide covering all four maintenance operations, recommended schedules, and caveats
- [Iceberg Spark Procedures](https://iceberg.apache.org/docs/latest/spark-procedures/): full parameter reference for `rewrite_data_files`, `expire_snapshots`, `remove_orphan_files`, and `rewrite_manifests`
- [Iceberg Flink Maintenance](https://iceberg.apache.org/docs/latest/flink-maintenance/): embedding maintenance tasks inside Flink streaming jobs with `TableMaintenance` API
- [Iceberg Spark Actions API](https://iceberg.apache.org/docs/latest/api/#actions): programmatic Java/Scala access to the same maintenance operations
- [Iceberg Table Spec, Snapshot Retention Policy](https://iceberg.apache.org/spec/#snapshot-retention-policy): how the format defines snapshot expiration at the spec level
- [Iceberg Table Spec, Delete Formats](https://iceberg.apache.org/spec/#delete-formats): Merge-on-Read delete file mechanics
- [Iceberg Configuration Properties](https://iceberg.apache.org/docs/latest/configuration/): table-level and write properties that affect maintenance behavior

#### Source References
- [`RewriteDataFilesSparkAction`](https://github.com/apache/iceberg/blob/main/spark/v3.5/spark/src/main/java/org/apache/iceberg/spark/actions/RewriteDataFilesSparkAction.java): partial-progress and abort logic
- [Iceberg release notes](https://iceberg.apache.org/releases/): maintenance-related improvements per version

#### Community & DIY
- [Vincent Daniel: Automating Apache Iceberg Maintenance with Spark and Python](https://medium.com/@vincent_daniel/automating-apache-iceberg-maintenance-with-spark-and-python-ee1a253de86c): Python class approach with size-based table classification
- [IOMETE Data Compaction Job](https://iomete.com/resources/open-source-spark-jobs/data-compaction-job): open-source Spark job for scheduled Iceberg compaction

#### Series
- [Part 1: The Hidden Debt in Your Lakehouse Tables](/blog/hidden-debt-in-lakehouse-tables)
- [Part 3: The Iceberg Table Maintenance Landscape](/blog/iceberg-maintenance-alternatives)