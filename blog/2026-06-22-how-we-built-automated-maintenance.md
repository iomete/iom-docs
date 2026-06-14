---
title: How We Built Automated Table Maintenance at IOMETE
description: Engineering story of building automated Iceberg table maintenance — design decisions, pipeline architecture, Amoro evaluation, and production tradeoffs.
slug: how-we-built-automated-maintenance
authors: Shashank
hide_table_of_contents: false
tags2: [Technical, Engineering]
banner_description: Customers had hundreds of Iceberg tables. Nobody was running maintenance. This is the engineering story of what we built and the decisions behind it.
coverImage: img/blog/thumbnails/darkStone.png
date: 06/22/2026
last_update:
  date: 2026-06-22
---

# How We Built Automated Table Maintenance at IOMETE

*Customers had hundreds of Iceberg tables. Nobody was running maintenance. This is the engineering story of what we built and the decisions behind it.*

<details>
  <summary><strong>This is Part 4 of our Apache Iceberg Table Maintenance series. Explore the full series:</strong></summary>

  * Part 1: [The Hidden Debt in Your Lakehouse Tables](/blog/hidden-debt-in-lakehouse-tables)
  * Part 2: [What Iceberg Gives You for Table Maintenance](/blog/iceberg-maintenance-operations)
  * Part 3: [The Iceberg Table Maintenance Landscape](/blog/iceberg-maintenance-alternatives)
  * **Part 4: How We Built Automated Table Maintenance**
  * Part 5: Running Iceberg Maintenance in Production *(coming soon)*
  * Part 6: Why We Rebuilt Orphan File Cleanup from Scratch *(coming soon)*

</details>

---

We kept having the same conversation with customers. They'd migrate from Cloudera or Databricks, spin up a few hundred Iceberg tables, and within weeks, queries slowed down and storage costs crept up. Most had some form of cron-based maintenance — hand-rolled Spark jobs running on a schedule — but it wasn't enough. The jobs were fragile, didn't scale past a few dozen tables, and couldn't adapt to varying write patterns. Iceberg puts the maintenance burden on the user, and a static cron job is a poor substitute for a real system.

As we covered in [Part 3](/blog/iceberg-maintenance-alternatives), most major platforms now offer automated maintenance — Snowflake, Databricks, AWS, Dremio, Cloudera all handle it in the background for their managed tables. Our customers expected the same from IOMETE. They expected tables to just stay healthy.

So we built it. What follows is the engineering decisions, what we tried, what we rejected, and why. If you're designing a similar system for Iceberg or any system that needs background work across many tables, some of these tradeoffs will be familiar.

## The naive approach and why it breaks

The simplest version of automated maintenance is a cron job that wraps [Spark procedures](https://iceberg.apache.org/docs/latest/spark-procedures/). Every few hours, iterate over tables, run [`rewrite_data_files`](https://iceberg.apache.org/docs/latest/spark-procedures/#rewrite_data_files), [`expire_snapshots`](https://iceberg.apache.org/docs/latest/spark-procedures/#expire_snapshots), [`remove_orphan_files`](https://iceberg.apache.org/docs/latest/spark-procedures/#remove_orphan_files), and [`rewrite_manifests`](https://iceberg.apache.org/docs/latest/spark-procedures/#rewrite_manifests). Done.

We actually started there. Our customers were doing exactly this with hand-rolled Spark jobs. It falls apart fast:

A cron job doesn't know which tables have changed. If you have 500 tables and only 30 received writes since the last cycle, you're still evaluating all 500. That means 500 metadata reads, 500 manifest scans, wasting compute and hammering the REST catalog.

A streaming table that commits every second generates 86,400 [snapshots](https://iceberg.apache.org/spec/#snapshots) per day. Running compaction after every batch is counterproductive because the compaction itself will conflict with the next write. But running it only on a 24-hour schedule lets the small file count explode to hundreds of thousands before anything happens.

Compaction is compute-heavy. If you kick off compaction on 50 tables simultaneously, your Spark cluster either runs out of resources or you starve your actual analytical workloads. There's no natural back-pressure in a cron + Spark loop. And not all operations need a cluster at all. Expiring snapshots is a metadata operation. Compaction rewrites data files and can consume hours. Treating them the same is wasteful.

These problems compound. Once you move past 50 tables, the cron approach requires increasingly fragile orchestration logic. And at that point, you've built a maintenance service anyway, just a bad one.

## The pipeline: Detect, Evaluate, Execute

Instead of running maintenance on a timer, we built a three-phase pipeline where each phase filters out work that isn't needed.

The first phase, detection, answers: "Has anything changed?" Every minute, the service scans the catalog for tables that received commits. If a table hasn't changed, we skip it entirely. No metadata reads, no manifest parsing. Just a check against our internal event log.

We considered three detection approaches. The first was cron-based: just evaluate every table on a schedule. Simple, but wasteful. A table that hasn't been written to in two weeks doesn't need evaluation. The second was event-based: Spark writes commit events into a partitioned Iceberg event table via our internal event service. The maintenance service scans this table to detect which tables received commits since the last check. This works, but requires a table scan against the event log on every cycle. The third was catalog-based: our internal REST catalog already tracks when each table's metadata was last updated. A single paginated API call returns only the tables modified after a given timestamp — no table scanning, no event parsing, just a metadata timestamp check.

We started with the Iceberg commit report approach and later moved to the catalog-based strategy as the default. It's lighter, avoids coupling detection to a specific event table, and scales better with pagination. On a deployment with 500 tables where only 30 are actively written to, we evaluate 30 instead of 500.

Evaluation answers the next question: "Does this table actually need work?" For each detected table, we run operation-specific checks. For compaction, we check average file size per partition and delete file ratios. For manifest rewriting, we check whether manifest count is disproportionate relative to data file count, or whether manifest overhead is too large relative to table size. For snapshot expiration, we check if snapshots older than the configured retention period exist and whether total count exceeds the minimum to keep.

Orphan file cleanup is different. You can't determine orphan status from metadata alone. The only way is a full storage scan. So orphan cleanup skips evaluation entirely and runs on its own cron schedule (weekly by default, configurable to at most monthly).

Execution actually performs the operation. But not all operations are equal, and that distinction matters.

## Not everything needs a Spark cluster

We considered running all four operations as Spark SQL jobs. It would have been simpler architecturally, one execution path instead of two. But the cost didn't make sense.

Compaction (`rewrite_data_files`) and manifest rewriting (`rewrite_manifests`) genuinely need [Spark](https://spark.apache.org/). They scan files, rewrite data, generate new [Parquet](https://parquet.apache.org/) files, and commit the result. These are compute-intensive operations that benefit from distributed execution.

Snapshot expiration and orphan file cleanup are different. They traverse Iceberg metadata and make storage API calls. No data is rewritten. No shuffle. No distributed execution needed. Running them through Spark means spinning up a cluster (or keeping one warm) just to make a few API calls.

Running everything through Spark would have been simpler. But we went with a split model: expiration and orphan cleanup run directly on the maintenance service using [Iceberg's Java API](https://iceberg.apache.org/docs/latest/api/), while compaction and manifest rewriting are submitted as Spark SQL jobs through our IOM-SQL service. Yes, two execution paths means more code to maintain. But lightweight metadata operations never block on cluster availability, and we don't burn compute dollars on work that doesn't need it.

## Threshold-based triggering, not fixed schedules

A fixed schedule (compact every 6 hours) ignores table state. A table with one write per day doesn't need hourly evaluation. A streaming table with 10,000 commits per hour needs attention much sooner.

We use thresholds instead. The evaluation phase checks specific metrics against configurable limits:

Compaction triggers when average file size is significantly below the target, or when the delete file ratio exceeds a configurable threshold. We compute average file size per partition by traversing [manifest files](https://iceberg.apache.org/spec/#manifests). That's more IO than reading just commit events, but it gives us precise per-file metrics instead of approximations.

Manifest rewriting triggers when manifest count is disproportionately high relative to data file count, or when manifest overhead is disproportionate to table size.

Snapshot expiration triggers when snapshots older than the configured retention period exist (default: 5 days) and total count exceeds the minimum to retain (default: 1).

Orphan cleanup has no threshold. It runs on a cron schedule (default: `0 0 * * 7`, weekly at Sunday midnight) and is always eligible when the schedule fires.

This means quiet tables are left alone. Active tables are evaluated frequently. And tables with healthy file layouts pass evaluation without triggering unnecessary work. The transferable principle here: if your background system can check whether work is needed before doing it, you should. Fixed schedules are only appropriate when the check itself is expensive (like orphan cleanup's full storage scan).

## Configuration hierarchy

We needed configuration at multiple levels. Platform-wide defaults. Catalog-level overrides. Table-level overrides. The resolution chain is straightforward:

1. Table-level config — per-table settings, highest priority
2. Catalog-level config — defaults for all tables in that catalog
3. Platform defaults — built-in IOMETE defaults, final fallback

Each level inherits from the one below it. Set a retention period at the catalog level and every table in that catalog picks it up unless overridden.

One important design choice: the catalog acts as a master switch. Catalog-level maintenance must be enabled before any table in that catalog can run maintenance. But tables don't auto-inherit the enabled state. Each table must be explicitly enabled in V1. This was a deliberate safety measure. We didn't want to flip a switch at the catalog level and immediately start compacting 300 tables. Instead, you enable the catalog, then enable tables as you're ready.

One gap we're aware of: there's no database-level configuration yet. If you have 200 tables across 10 databases and want different retention policies per database, you currently configure each table individually. Database-level inheritance is on the V2 roadmap.

## Concurrency limits

We run a multi-table maintenance pipeline where multiple tables can be in different stages simultaneously. Without limits, a burst of detected tables could overwhelm the Spark cluster.

Each operation type has a configurable concurrency cap, tuned based on cluster load and resource profile. Compaction gets the tightest cap — it's by far the most resource-intensive operation, and running too many in parallel either starves analytical workloads or causes out-of-memory failures. Orphan cleanup is similarly constrained because it performs a full storage scan; concurrent scans hammer the object storage API layer. Total concurrent SQL queries per cluster are also capped to prevent maintenance from monopolizing Spark at the expense of user queries. Lightweight operations (snapshot expiration, orphan cleanup) have their own separate limits since they don't compete for Spark resources.

In V1, these limits are static — operators set them based on their cluster capacity. In later versions, we want the system to deduce appropriate concurrency dynamically based on table count, table size, and which operations need to run.

## Cooldowns

After a successful run of any operation on a table, that same table+operation pair can't be picked up again for a configurable cooldown period. Manual triggers bypass this cooldown.

We added this because of a problem with streaming tables. A table receiving constant writes will always have new commits. Without a cooldown, the detect-evaluate-execute loop would pick it up immediately after finishing, running compaction back-to-back. This is wasteful (recently written files are unlikely to constitute meaningful compaction work) and increases the risk of write conflicts with the streaming pipeline.

We considered three cooldown designs. Cooldown only in evaluation (reduces metadata load, but processing could still run too often). Cooldown only in processing (controls write conflicts, but evaluation still hammers the catalog with metadata reads). Cooldown in both evaluation and processing (each stage solves a different part of the problem). We chose option three.

The evaluation cooldown prevents repeated metadata scans for the same table. The processing cooldown ensures heavy operations run only at safe intervals. The tradeoff is that a table that genuinely needs immediate re-compaction (say, after a large batch load) must wait for the cooldown to expire. That's what manual triggers are for.

There's a side effect worth acknowledging. Because the evaluation that produced a pending maintenance operation may be minutes or hours old by the time processing runs, the evaluation reasons can be slightly stale. A table might have accumulated more small files since the evaluation ran. For V1, this is acceptable. The operation still helps, even if it's based on slightly dated metrics. In V2, we plan to use commit-event payloads to track delta changes since the last evaluation, which will let us do more targeted compaction.


## What we evaluated and didn't use: Amoro

We covered Amoro's capabilities and positioning in the [alternatives landscape post](/blog/iceberg-maintenance-alternatives). What follows is our engineering evaluation of whether to adopt or build.

Before building from scratch, we evaluated [Apache Amoro](https://amoro.apache.org/) (incubating), an open-source lakehouse management system specifically designed for Iceberg table maintenance. Amoro provides [self-optimizing tables](https://amoro.apache.org/docs/latest/self-optimizing/) with automatic compaction, snapshot expiration, and orphan cleanup. It's used at scale by companies like NetEase and ByteDance. On paper, it was a perfect fit.

We spent several weeks on a thorough evaluation.

Amoro's self-optimization pipeline (detect, evaluate, plan, execute, commit) is thoughtfully designed. It supports Minor, Major, and Full optimization types, each triggered by different conditions. The custom compaction logic reportedly [benchmarks at 10x the efficiency](https://medium.com/@jinsong.zhou1990/10x-efficiency-boost-compared-to-spark-rewritefiles-procedure-how-apache-amoro-efficiently-7e7a993950d7) of Spark's native `rewrite_data_files`. It provides a health score (0-100) per table and has production validation at large scale.

Where it fell short for us: Amoro makes heavy metadata fetches. For every table where optimization is enabled, it calls `loadTable()` on the REST catalog, downloads the metadata JSON, and reads manifest files on every planning cycle (default: every 1 minute). At our scale, this puts significant pressure on the REST catalog and object storage. We prototyped mitigations (increasing cache TTL, bulk catalog calls) but they introduced their own tradeoffs.

Amoro supports configuration at only two levels: catalog and table. No database-level configuration, which we needed. No dynamic SQL filter support (expressions like `CURRENT_DATE` or `INTERVAL` don't work in optimization filters). Manifest rewriting isn't individually toggleable. And Amoro doesn't rewrite manifests at all, it only handles data file compaction.

The visibility gaps were also a concern. Snapshot expiration, orphan cleanup, and dangling delete file cleanup all run in Amoro, but they produce no run-level history. The metrics are computed internally but only appear in logs. For a customer-facing feature, we needed full observability for every operation.

The architecture is tightly coupled with mixed-Iceberg logic (a format specific to Amoro's origin at NetEase). Stripping it out would require forking and maintaining roughly 50-60% of the codebase. The Docker image also carried 3 critical and approximately 30 high-severity security vulnerabilities that would need remediation.

We concluded that Amoro provides a strong foundation, but isn't a drop-in solution. The modifications needed (bulk metadata fetching, database-level configs, dynamic filters, full observability, security remediation, removing mixed-Iceberg coupling) would cost as much effort as building a focused system ourselves, with the ongoing maintenance tax of a fork.

Our recommendation from the evaluation was: build in-house, but don't hesitate to reuse specific pieces of Amoro's logic where they make sense.

## What we'd do differently in V2

V1 is deliberately scoped. We know what's missing.

The biggest gap is priority-based scheduling. Right now, all tables get equal treatment. Under heavy load, a critical customer-facing table gets the same scheduling priority as an internal staging table. We plan to introduce automatic priority based on query frequency and table usage patterns.

For write-conflict avoidance, V1 relies on user-defined static WHERE filters to exclude hot partitions from compaction (e.g., `event_date < '2025-01-01'`). We want the system to automatically identify partitions still receiving writes and skip them. This would remove a manual configuration step that most users forget to set up.

We also want to move beyond polling. Right now, the detection loop runs on a 2-minute poll. In V2, we want to support triggering maintenance immediately after a large batch job completes, or continuously at a configured interval for streaming applications.

Finally, we track file counts, storage savings, and operation duration, but not the query performance improvement that maintenance delivers. Showing users that compaction reduced their average query time by 40% is more compelling than showing them a file count reduction.

## The system in a single diagram

The full pipeline:

```
Spark Clusters → Commit events → Event Pipeline → Catalog Updates
                                                      ↓
                                            Detection (every 2 min)
                                            Find changed tables
                                            Check catalog/table config
                                                      ↓
                                            Create evaluation runs
                                                      ↓
                                            Evaluation (every 30s)
                                            Check operation thresholds
                                            Respect cooldowns
                                                      ↓
                                            Create execution runs
                                                      ↓
                                    ┌───────────────────┴──────────────────┐
                                    ↓                                      ↓
                            SQL Operations                        Simple Operations
                         (compaction, manifests)              (expire snapshots, orphans)
                                    ↓                                      ↓
                         Submit via SQL service                    Run on maintenance service
                         Execute on Spark cluster              via Iceberg Java API
                                    ↓                                      ↓
                                    └───────────────────┬──────────────────┘
                                                        ↓
                                            Record before/after metrics
                                                        ↓
                                            Archive to Iceberg (hourly, batch of 500)
```

The maintenance service runs on [Kubernetes](https://kubernetes.io/), backed by [PostgreSQL](https://www.postgresql.org/) for operational state. Completed runs are archived to Iceberg tables for long-term audit.

## The principle behind it all

The core design principle is simple: don't do work you don't need to do. Event-based detection skips unchanged tables. Threshold-based evaluation skips healthy ones. The split execution model keeps lightweight operations off the Spark cluster. Cooldowns prevent redundant re-runs. Every design decision we made traces back to that same question: is this work actually necessary right now?

The system isn't perfect. V1 lacks priority scheduling, database-level config, and automatic partition awareness. But it solves the core problem: customers no longer need to think about table maintenance. Tables stay healthy. Storage costs stay predictable. And the engineering team can evolve the system from a solid foundation rather than patching a cron job.

---

## Resources & Further reading

#### Architecture & Design Patterns
- [Apache Iceberg Maintenance Guide](https://iceberg.apache.org/docs/latest/maintenance/) — official guide covering compaction, snapshot expiration, orphan cleanup, and manifest rewriting
- [Iceberg Table Spec](https://iceberg.apache.org/spec/) — full specification for snapshots, manifests, metadata files, and sequence numbers
- [Iceberg Configuration Reference](https://iceberg.apache.org/docs/latest/configuration/) — table properties for tuning maintenance behavior, retention policies, and commit retries
- [Iceberg Spark Procedures](https://iceberg.apache.org/docs/latest/spark-procedures/) — full parameter reference for `rewrite_data_files`, `expire_snapshots`, `remove_orphan_files`, and `rewrite_manifests`

#### Event-Driven & Policy-Driven Maintenance
- [Floe and Apache Polaris: Policy-Driven Table Maintenance](https://polaris.apache.org/blog/2026/02/04/floe-and-apache-polaris-policy-driven-table-maintenance-for-apache-iceberg/) — declarative, signal-based triggers for Iceberg maintenance
- [Cloudera Lakehouse Optimizer — Refining Optimizations through Table Properties](https://community.cloudera.com/t5/Engineering-Blogs/Cloudera-Lakehouse-Optimizer-Refining-Optimizations-through/ba-p/413125) — policy-based automation with schedule and event triggers
- [Optimizing Compaction Parameters for Iceberg Tables](https://community.cloudera.com/t5/Engineering-Blogs/Optimizing-Compaction-Parameters-for-Iceberg-Tables/ba-p/413227) — tuning compaction thresholds and parameters for production workloads

#### Compaction Strategies
- [Compaction in Apache Iceberg: Fine-Tuning Your Data Files](https://www.dremio.com/blog/compaction-in-apache-iceberg-fine-tuning-your-iceberg-tables-data-files/) — deep dive into bin-pack and sort strategies
- [Maintaining Tables by Using Compaction — AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/apache-iceberg-on-aws/best-practices-compaction.html) — AWS best practices for scheduling and sizing compaction jobs
- [Partition-Aware Compaction: A Fail-Safe Strategy for Streaming Data Lakes](https://medium.com/@shahsoumil519/partition-aware-compaction-a-fail-safe-strategy-for-streaming-data-lakes-with-apache-iceberg-c2abfbef6a52) — filtering compaction by partition to avoid streaming write conflicts

#### Concurrency & Catalog-Level Configuration
- [Allow Table Property Defaults at Catalog Level — Issue #3994](https://github.com/apache/iceberg/issues/3994) — upstream discussion on catalog-level configuration hierarchy
- [Manage Concurrent Write Conflicts in Iceberg on AWS Glue](https://aws.amazon.com/blogs/big-data/manage-concurrent-write-conflicts-in-apache-iceberg-on-the-aws-glue-data-catalog/) — patterns for handling commit conflicts between maintenance and write workloads
- [Apache Amoro](https://amoro.apache.org/) — self-optimizing Iceberg tables with continuous monitoring ([GitHub](https://github.com/apache/amoro))

#### IOMETE References
- [IOMETE Data Compaction Job](https://iomete.com/resources/open-source-spark-jobs/data-compaction-job) — open-source Spark job for scheduled Iceberg compaction
- [Why Is My Iceberg Compaction So Slow?](https://iomete.com/resources/blog/iceberg-compaction-slow) — practical guide to scaling maintenance jobs
- [The Iceberg Maintenance Runbook](https://iomete.com/resources/blog/iceberg-maintenance-runbook) — snapshots, orphan files, and metadata bloat diagnostics

