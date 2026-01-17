---
title: Apache Iceberg Production Anti-Patterns - What Breaks in 2026 (And How to Fix It)
description: The small files problem, metadata bloat, and catalog fragmentation are breaking Iceberg deployments in production. Learn the anti-patterns that cause query planning failures, OOM errors, and unbounded storage costs—and the operational patterns that prevent them.
slug: apache-iceberg-production-antipatterns-2026
authors: aytan
tags2: [Apache Iceberg, production issues, small files, metadata bloat, compaction, catalog wars, lakehouse operations]
hide_table_of_contents: false
date: 01/17/2026
coverImage: img/blog/thumbnails/2.png
---

import FAQSection from '@site/src/components/FAQSection';

# Apache Iceberg Production Anti-Patterns: What Breaks in 2026 (And How to Fix It)

Apache Iceberg has become the table format of choice for modern data lakehouses. Spark, Trino, Flink, Snowflake, Databricks—everyone supports it. The specification is solid. The features are powerful. Time travel, schema evolution, ACID transactions on object storage—it all works exactly as advertised.

Until it doesn't.

The problem isn't the format. It's how teams operate it in production. Iceberg tables that start fast degrade over weeks or months. Query planning times balloon from milliseconds to minutes. Coordinators run out of memory. Storage costs spike. And the root cause is almost always the same: operational anti-patterns that accumulate silently until they break something critical.

This isn't about edge cases. These are the production failures happening right now in 2026, across streaming pipelines, analytical workloads, and batch ETL jobs. If you're running Iceberg at scale, you've either hit these issues already or you're about to.

<!-- truncate -->

---

## Anti-Pattern #1: The Small Files Death Spiral

The most common production failure in Iceberg deployments is file explosion. Tables that start with a few hundred well-sized data files end up with millions of tiny files, and query performance collapses.

Here's how it happens:

You're running a streaming pipeline. Kafka events land every 10 seconds, and you commit to your Iceberg table after each micro-batch. Each commit writes a handful of small Parquet files—maybe 500KB to 2MB each. Over a few days, you've generated 25,000 commits and 100,000 small data files.

Now a user runs a `SELECT` query. Iceberg's query planner needs to open metadata for every potentially relevant file, evaluate partition pruning, check column statistics, and build an execution plan. With 100,000 files, that's 100,000 metadata reads. Each read has a fixed cost—object storage latency, HTTP overhead, deserialization. The query planning phase that used to take 200 milliseconds now takes 45 seconds.

And it gets worse. Those 100,000 small files mean 100,000 separate object storage GET requests during execution. S3 charges per request. Your query cost just multiplied by 500x, even though you're reading the same amount of data.

The real damage isn't performance—it's metadata bloat. Every commit generates new manifest files. Manifest files list data files and their statistics. With 100,000 files across 25,000 commits, you now have thousands of manifest files, each tracking overlapping subsets of the same data files. The metadata layer that was supposed to make queries faster has become the bottleneck.

This happened in a real Dell Federal deployment running streaming IoT data. The table had 45 million data files. Metadata size reached 5TB—larger than the actual data. Query coordinators were running out of memory just loading file statistics. Planning a simple aggregation query triggered OOM errors because the system tried to materialize metadata for millions of files in one shot.

The fix isn't subtle. You need compaction.

### How to Fix It: Compaction as a First-Class Operation

Compaction combines small files into larger ones. Iceberg provides built-in actions for this in Spark:

```scala
Actions.forTable(spark, "my_table")
  .rewriteDataFiles()
  .targetSizeInBytes(256 * 1024 * 1024) // 256 MB target
  .execute()
```

But compaction isn't a one-time job. It's an ongoing operational requirement. If you're writing to Iceberg tables continuously, you need compaction running on a schedule—hourly, daily, or triggered by commit count thresholds.

In IOMETE deployments handling streaming workloads, compaction jobs run automatically based on table health metrics. When the ratio of small files to large files crosses a threshold, compaction triggers in the background. This keeps metadata lean and query planning fast, without manual intervention.

The key insight: **streaming ingestion and batch compaction are complementary, not competing.** Stream data in small batches for freshness. Compact periodically for query performance. Both need to happen, and you need infrastructure that handles both.

---

## Anti-Pattern #2: Metadata Bloat from Snapshot Accumulation

Time travel is one of Iceberg's best features. Every commit creates a snapshot—a complete, immutable version of the table. You can query historical data, roll back bad writes, and reproduce ML training datasets exactly as they were.

But snapshots accumulate. And if you don't expire them, metadata grows unbounded.

Each snapshot references a manifest list. Each manifest list references multiple manifest files. Each manifest file lists data files with full statistics—min/max values, null counts, record counts. For wide tables with hundreds of columns, the statistics for a single file can reach 200KB to 1MB.

Now multiply that across thousands of snapshots. A table with 10,000 commits and 100 manifests per commit ends up with 1 million manifest files. Even if most of those files reference the same underlying data (because only a small partition changed per commit), the metadata layer still tracks them all.

Query planning requires reading the latest snapshot's manifest list, then pruning based on partition filters, then loading manifest files for the relevant partitions, then evaluating file-level statistics. If manifests are bloated with references to files that haven't changed in weeks, you're doing redundant work on every query.

The operational failure mode looks like this: Query planning time increases linearly with the number of snapshots, even when the underlying data hasn't grown. A table that used to plan queries in 500ms now takes 20 seconds, and the only thing that changed is the number of historical snapshots being tracked.

### How to Fix It: Expire Snapshots and Rewrite Manifests

Iceberg provides snapshot expiration to clean up old metadata:

```scala
Actions.forTable(spark, "my_table")
  .expireSnapshots()
  .expireOlderThan(System.currentTimeMillis() - TimeUnit.DAYS.toMillis(7))
  .retainLast(10)
  .execute()
```

This removes snapshots older than 7 days, keeping only the last 10 for time travel. The metadata files referenced by expired snapshots become orphaned and can be garbage collected.

But expiring snapshots isn't enough. You also need to rewrite manifests to consolidate references:

```scala
Actions.forTable(spark, "my_table")
  .rewriteManifests()
  .execute()
```

Manifest rewriting merges small manifest files into larger ones, reducing the total manifest count and improving query planning efficiency. This is especially important after compaction, which rewrites data files but leaves behind fragmented manifests.

The safe operational order is:
1. **Compact data files** → Combine small files into larger ones
2. **Expire snapshots** → Remove old table versions
3. **Remove orphan files** → Clean up unreferenced data and metadata
4. **Rewrite manifests** → Consolidate metadata structure

Running these out of order can leave orphaned data, corrupt time travel, or trigger race conditions with concurrent writes. IOMETE automates this lifecycle with workload-aware policies that adjust maintenance frequency based on snapshot velocity, small-file growth, and observed query patterns.

---

## Anti-Pattern #3: The Catalog Wars—Choosing the Wrong Metadata Layer

2026 is seeing a "Catalog War" across the Iceberg ecosystem. REST Catalog, AWS Glue, Databricks Unity Catalog, Polaris, Hive Metastore—each has different compatibility guarantees, latency characteristics, and operational constraints.

Choosing the wrong catalog locks you into vendor-specific behavior or introduces query planning bottlenecks that can't be fixed without migrating the entire table.

Here's the problem: Iceberg is an open table format, but the catalog layer is not standardized at the operational level. The REST Catalog specification defines semantic correctness—how to list tables, read metadata, commit transactions—but it doesn't define performance SLAs, caching behavior, or conflict resolution policies.

Two catalogs can both be "REST-compliant" but differ by orders of magnitude in query planning latency. One catalog might cache manifest lists aggressively, returning stale metadata for up to 60 seconds. Another might synchronously validate every file reference, adding 5 seconds to every query.

Worse, the specification doesn't mandate retry behavior for concurrent writes. When multiple writers commit simultaneously, Iceberg uses optimistic concurrency control—the first commit wins, others get a 409 Conflict and retry. But if a high-frequency streaming writer has aggressive retry logic and a batch compaction job has conservative retries, the compaction job can be permanently starved. Over time, the table degrades from file explosion because compaction never completes.

### How to Fix It: Choose Catalogs Based on Operational Needs

If you're running multi-engine workloads (Spark for writes, Trino for analytics), you need a catalog with strong multi-writer support and predictable caching. REST Catalog is the safest bet for vendor neutrality, but you need to verify latency and conflict resolution behavior in your specific deployment.

If you're in a single-cloud environment (AWS only), AWS Glue works well for integration with other AWS services, but be aware of eventual consistency issues and higher latency compared to REST Catalog.

If you're running IOMETE, the platform uses REST Catalog or Nessie depending on your governance requirements. REST Catalog provides simple, fast metadata access. Nessie adds Git-like branching for data, enabling isolated development environments and atomic multi-table commits—critical for complex ETL workflows.

The key principle: **catalog choice impacts operational behavior, not just semantic correctness.** Test query planning latency, concurrent write throughput, and metadata freshness before committing to a catalog implementation.

---

## Anti-Pattern #4: Ignoring Partition Strategy Until It's Too Late

Partitioning in Iceberg is powerful—hidden partitioning with transforms like `day()`, `bucket()`, and `truncate()` means partition logic is tracked in metadata, not in physical directory structure. You can evolve partitioning over time without rewriting data.

But bad partition choices made early are expensive to fix.

The classic mistake: partitioning by a high-cardinality column that creates millions of tiny partitions. For example, partitioning a sensor data table by `sensor_id` when you have 50,000 sensors. Each partition ends up with a handful of files, and compaction can't help because it operates within partitions. You end up with millions of small files that can't be combined.

The opposite mistake: not partitioning at all. Tables exceeding 1 million records without partitions force full table scans on every query. Query planning has to evaluate statistics for every file, and execution can't skip irrelevant data.

The guideline from Dell Federal training sessions: **datasets above 1 million records must be partitioned.** The partition column should have moderate cardinality—enough to enable meaningful pruning, but not so high that it creates millions of partitions.

For time-series data, partition by `day()` or `hour()`, not by timestamp. For geographical data, partition by `bucket(region, 10)` to create 10 balanced partitions, not by individual city or zip code.

### How to Fix It: Partition Evolution in Iceberg

If you've already committed to a bad partition scheme, Iceberg supports partition evolution without rewriting data:

```sql
ALTER TABLE my_table
  ADD PARTITION FIELD days(event_time);
```

New data written after this change uses the new partition scheme. Old data remains readable under the old scheme. Queries automatically use the correct partition logic based on file metadata.

In IOMETE, partition recommendations are surfaced in the table health dashboard. If a table shows high file counts per partition or excessive partition counts, the system flags it for review. You can test alternative partition strategies in development clusters before applying changes to production.

---

## Anti-Pattern #5: Streaming at Millisecond Intervals Without Compaction Strategy

Streaming use cases are driving Iceberg adoption in 2026. Kafka to Iceberg, Flink to Iceberg, CDC pipelines writing changes in real-time—it all works. But streaming workloads generate the most aggressive small-file growth.

A streaming pipeline committing every second generates 86,400 commits per day. Even if each commit writes just 5 files, that's 432,000 new files per day. After a week, you have 3 million files. After a month, 13 million.

The operational failure happens when compaction can't keep up. If your compaction job runs hourly and takes 45 minutes to complete, but new files are arriving faster than compaction can consolidate them, you've entered a death spiral. File count grows unbounded, query planning degrades, and eventually the table becomes unusable.

### How to Fix It: Batch Ingestion with Controlled Commit Frequency

The fix is tuning commit frequency based on freshness requirements. Do you actually need sub-second data latency? Most analytical workloads don't. Batching writes into 1-minute or 5-minute intervals reduces commit count by 60x to 300x while still delivering near-real-time data.

In Spark Structured Streaming with Iceberg:

```scala
streamingDF
  .writeStream
  .format("iceberg")
  .option("checkpointLocation", checkpointPath)
  .trigger(Trigger.ProcessingTime("5 minutes")) // Batch every 5 minutes
  .toTable("my_table")
```

This reduces the rate of metadata growth while maintaining freshness within acceptable SLA boundaries.

For true sub-second requirements, couple fast ingestion with automated compaction. Apache Flink's v2 sink for Iceberg includes built-in small-file compaction. Commits happen fast, but compaction runs continuously in the background, merging files as they accumulate.

In IOMETE deployments handling streaming workloads, compaction triggers based on file count thresholds. When a partition accumulates more than 100 files, compaction runs automatically. This keeps the table healthy without manual tuning.

---

## Anti-Pattern #6: Running Maintenance in the Wrong Order

Iceberg maintenance—compaction, snapshot expiration, orphan file removal, manifest rewriting—requires running operations in a specific order to avoid corrupting metadata or leaving orphaned data.

The wrong order looks like this:

1. Remove orphan files
2. Compact data files
3. Expire snapshots

This sequence causes data loss. When you compact data files, the old files become orphaned (no longer referenced by active snapshots). If you've already run orphan file removal, those files haven't been identified as orphans yet, so they stay in storage. But if you expire snapshots next, the references to those old compacted files disappear, and they become unreachable. Future orphan removal will delete them, but they should have been deleted earlier.

The correct order is:

1. **Compact data files** → Rewrite small files into larger ones
2. **Expire snapshots** → Remove old table versions, orphaning old data files
3. **Remove orphan files** → Clean up files no longer referenced by any snapshot
4. **Rewrite manifests** → Consolidate metadata structure

This ensures that files orphaned by compaction are properly tracked through snapshot expiration before being deleted, and manifests are rewritten after all structural changes are complete.

### How to Fix It: Automated Maintenance Pipelines

Manual maintenance is error-prone. Production deployments need automated pipelines that run operations in the correct order, validate preconditions, and handle failures gracefully.

IOMETE's maintenance framework enforces safe execution order. It blocks misordered operations, protects snapshots referenced by active jobs, and keeps metadata consistent for multi-writer workloads. Maintenance frequency adjusts automatically based on table health metrics—snapshot velocity, small-file growth, manifest expansion, and query patterns.

---

## Anti-Pattern #7: Ignoring Delete Files Until They Explode

Iceberg v2 introduced delete files to support row-level updates and deletes without rewriting entire data files. When you delete rows from a table, Iceberg writes a small delete file listing the rows to remove. Query engines merge delete files with data files at read time to produce the correct result.

This is powerful, but delete files accumulate. If you're running a CDC pipeline that applies updates and deletes continuously, each batch generates new delete files. Over time, you end up with thousands of delete files referencing overlapping sets of data files.

Query performance degrades because execution engines have to merge delete files on every read. A table with 10,000 delete files means 10,000 additional file opens, 10,000 metadata reads, and complex merge logic to reconcile which rows are actually deleted.

The failure mode is similar to small files: metadata bloat and query slowdown. But it's harder to detect because delete files are smaller and often overlooked in maintenance workflows.

### How to Fix It: Rewrite Position Deletes During Compaction

The fix is rewriting data files to apply deletes permanently:

```scala
Actions.forTable(spark, "my_table")
  .rewriteDataFiles()
  .option("rewrite-position-deletes", "true")
  .execute()
```

This reads data files, applies delete files, and writes new data files without the deleted rows. The old data files and delete files are orphaned and cleaned up during snapshot expiration.

For CDC workloads with frequent deletes, this needs to run regularly. IOMETE's maintenance policies track delete file accumulation and trigger rewrites when the delete-to-data ratio exceeds thresholds. This keeps read performance stable without manual tuning.

---

## What Works in Production: The Operational Pattern That Scales

Every anti-pattern above has a common fix: **treat Iceberg maintenance as a first-class operational requirement, not an afterthought.**

Successful Iceberg deployments in 2026 follow this pattern:

1. **Monitor table health metrics continuously** — File counts, metadata sizes, snapshot counts, delete file accumulation
2. **Automate maintenance on schedules or triggers** — Compaction runs when file counts exceed thresholds; snapshot expiration runs nightly
3. **Run operations in the correct order** — Compact → Expire → Remove orphans → Rewrite manifests
4. **Tune ingestion frequency to balance freshness and file count** — Batch commits when possible; use compaction for true streaming
5. **Choose catalogs based on operational needs** — REST Catalog for vendor neutrality; validate latency and concurrency behavior
6. **Partition intelligently** — Moderate cardinality, datasets above 1M records must be partitioned
7. **Test under production load** — Metadata bloat, small files, and catalog conflicts only show up at scale

In IOMETE, these patterns are built into the platform. Table health dashboards surface metadata bloat, small file growth, and delete file accumulation. Automated maintenance runs in the background with safe execution frameworks that prevent misordered operations. Workload-aware policies adjust maintenance frequency based on observed query patterns and snapshot velocity.

This isn't magic. It's operational discipline applied consistently across all Iceberg tables.

---

## The Production Reality: Iceberg Works When You Operate It Correctly

Apache Iceberg is production-ready. The specification is solid. The ecosystem is mature. Time travel, schema evolution, ACID transactions—it all works.

But production success depends on operational patterns, not just feature lists. Small files, metadata bloat, catalog fragmentation, partition strategy, streaming ingestion, maintenance order—these aren't edge cases. They're the core operational challenges of running Iceberg at scale.

Teams that treat Iceberg as "just another table format" hit these issues within weeks. Teams that invest in monitoring, automation, and operational discipline build tables that scale to petabytes without degradation.

The difference isn't the technology. It's how you operate it.

---

## Frequently Asked Questions

<FAQSection faqs={[
  {
    question: "How do you know when it's time to run compaction?",
    answer: "Monitor file count and average file size. If you see thousands of files smaller than 10MB, or if query planning time is increasing without data volume growth, compaction is overdue.",
    answerContent: (
      <>
        <p>Monitor file count and average file size. If you see thousands of files smaller than 10MB, or if query planning time is increasing without data volume growth, compaction is overdue.</p>
        <p>In production environments running platforms like IOMETE, automated policies track file count per partition and trigger compaction when thresholds are exceeded—typically when small file counts cross <strong>100 per partition</strong> or the small-to-large file ratio exceeds 10:1.</p>
      </>
    )
  },
  {
    question: "Can you run compaction and snapshot expiration simultaneously?",
    answer: "No. Running them simultaneously risks orphaning data that's still referenced by active snapshots. The safe order is: compact data files first, then expire snapshots, then remove orphan files.",
    answerContent: (
      <>
        <p>No. Running them simultaneously risks orphaning data that's still referenced by active snapshots. The safe order is: <strong>compact data files first, then expire snapshots, then remove orphan files</strong>.</p>
        <p>Concurrent execution can leave the table in an inconsistent state where old data files are deleted before snapshot metadata is updated.</p>
        <p>Organizations running IOMETE use automated maintenance frameworks that enforce correct operation ordering and block unsafe concurrent execution.</p>
      </>
    )
  },
  {
    question: "What's the actual performance impact of small files?",
    answer: "Query planning time scales with file count, not data size. A table with 1 million small files can take 30-60 seconds just to plan a simple SELECT query because the planner has to load metadata for every file.",
    answerContent: (
      <>
        <p>Query planning time scales with file count, not data size. A table with 1 million small files can take <strong>30-60 seconds</strong> just to plan a simple SELECT query because the planner has to load metadata for every file.</p>
        <p>Execution performance also degrades—each file requires a separate object storage request, which adds fixed latency and increases costs.</p>
        <p>Real deployments have seen query times improve by <strong>10x to 100x</strong> after compaction consolidates millions of small files into thousands of optimally-sized files.</p>
      </>
    )
  },
  {
    question: "How do you handle metadata bloat in existing tables?",
    answer: "Start with snapshot expiration to remove old table versions, retaining only what you need for time travel and compliance. Then rewrite manifests to consolidate metadata structure.",
    answerContent: (
      <>
        <p>Start with snapshot expiration to remove old table versions, retaining only what you need for time travel and compliance. Then rewrite manifests to consolidate metadata structure.</p>
        <p>For tables with extreme bloat (metadata larger than data), you may need to rewrite the entire table into a new location with optimized settings.</p>
        <p>In IOMETE environments, table health dashboards flag bloat early, and maintenance automation prevents it from reaching critical levels in the first place.</p>
      </>
    )
  },
  {
    question: "Should you use Copy-on-Write or Merge-on-Read for updates?",
    answer: "It depends on your read-to-write ratio. Copy-on-Write (CoW) rewrites entire data files when rows change, which eliminates delete files but increases write cost. Merge-on-Read (MoR) writes small delete files, which is faster for writes but slower for reads.",
    answerContent: (
      <>
        <p>It depends on your read-to-write ratio. <strong>Copy-on-Write (CoW)</strong> rewrites entire data files when rows change, which eliminates delete files but increases write cost. <strong>Merge-on-Read (MoR)</strong> writes small delete files, which is faster for writes but slower for reads.</p>
        <p>For read-heavy analytical workloads, CoW is better. For write-heavy CDC pipelines with frequent updates, MoR with periodic compaction is more efficient.</p>
        <p>Organizations running IOMETE can configure write mode per table based on workload characteristics.</p>
      </>
    )
  },
  {
    question: "What catalog should you use for multi-engine environments?",
    answer: "REST Catalog is the safest choice for multi-engine compatibility. It works with Spark, Trino, Flink, and most other Iceberg-compatible engines without vendor lock-in.",
    answerContent: (
      <>
        <p><strong>REST Catalog</strong> is the safest choice for multi-engine compatibility. It works with Spark, Trino, Flink, and most other Iceberg-compatible engines without vendor lock-in.</p>
        <p>AWS Glue works well if you're exclusively in AWS, but has higher latency and eventual consistency issues. Databricks Unity Catalog only works within the Databricks ecosystem.</p>
        <p>In IOMETE deployments, REST Catalog is the default for its combination of performance, compatibility, and operational simplicity.</p>
      </>
    )
  },
  {
    question: "How do you partition tables that are already in production?",
    answer: "Iceberg supports partition evolution without rewriting data. Add a new partition spec with ALTER TABLE, and new data uses the new partitioning while old data remains readable under the old scheme.",
    answerContent: (
      <>
        <p>Iceberg supports <strong>partition evolution</strong> without rewriting data. Add a new partition spec with ALTER TABLE, and new data uses the new partitioning while old data remains readable under the old scheme. Queries automatically use the correct partition logic based on file metadata.</p>
        <p>For extreme cases where existing data is heavily skewed, you may need to rewrite the table, but this can be done incrementally by partition.</p>
        <p>IOMETE environments test partition changes in development clusters before applying them to production tables.</p>
      </>
    )
  },
  {
    question: "What's the recommended snapshot retention policy?",
    answer: "Retain 7-14 days of snapshots for time travel and operational recovery, keeping at least the last 10 snapshots even if they're older. For compliance-heavy workloads, tag specific snapshots for longer retention.",
    answerContent: (
      <>
        <p>Retain <strong>7-14 days</strong> of snapshots for time travel and operational recovery, keeping at least the last 10 snapshots even if they're older.</p>
        <p>For compliance-heavy workloads, tag specific snapshots (end-of-month, end-of-quarter) for longer retention and expire untagged snapshots more aggressively. Snapshot expiration should run at least weekly to prevent unbounded metadata growth.</p>
        <p>Organizations running IOMETE configure retention policies per table based on regulatory requirements and operational SLAs, with automated expiration enforcing policies consistently.</p>
      </>
    )
  }
]} />

---

## About IOMETE

IOMETE is a self-hosted data lakehouse platform built on Apache Iceberg, Apache Spark, and Kubernetes. It runs entirely within your infrastructure—on-premise, in your VPC, or in air-gapped environments—giving you complete control over data sovereignty, compliance, and cost. With automated Iceberg maintenance, table health monitoring, and workload-aware optimization policies, IOMETE eliminates the operational burden of running production lakehouse workloads at scale.

Learn more at [iomete.com](https://iomete.com) or [schedule a demo](https://iomete.com/contact-us) to see how IOMETE handles Iceberg operations in production environments.
