---
title: How We Built Automated Table Maintenance at IOMETE
description: "Engineering story of building automated Iceberg table maintenance: design decisions, pipeline architecture, Amoro evaluation, and production tradeoffs."
slug: how-we-built-automated-maintenance
authors: Shashank
hide_table_of_contents: false
tags2: [Technical, Engineering]
banner_description: The goal was simple - customers should never think about table maintenance again. This is the system we built to make that true, and the design decisions that got us there.
coverImage: img/blog/thumbnails/darkStone.png
date: 06/22/2026
last_update:
  date: 2026-06-22
---

# How We Built Automated Table Maintenance at IOMETE

*The goal was simple: customers should never think about table maintenance again. This is the system we built to make that true, and the design decisions that got us there.*

<details>
  <summary><strong>This is Part 4 of our Apache Iceberg Table Maintenance series. Explore the full series:</strong></summary>

  * Part 1: [The Hidden Debt in Your Lakehouse Tables](/blog/hidden-debt-in-lakehouse-tables)
  * Part 2: [What Iceberg Gives You for Table Maintenance](/blog/iceberg-maintenance-operations)
  * Part 3: [The Iceberg Table Maintenance Landscape](/blog/iceberg-maintenance-alternatives)
  * **Part 4: How We Built Automated Table Maintenance**
  * Part 5: Running Iceberg Maintenance in Production *(coming soon)*
  * Part 6: Why We Rebuilt Orphan File Cleanup from Scratch *(coming soon)*

</details>

import Img from '@site/src/components/Img';

---

We kept having the same conversation with customers. They'd migrate from Snowflake or Databricks, spin up a few hundred Iceberg tables, and within weeks, queries slowed down and storage costs crept up. Most had some form of cron-based maintenance, hand-rolled Spark jobs running on a schedule, but it wasn't enough. The jobs were fragile, didn't scale past a few dozen tables, and couldn't adapt to varying write patterns. Iceberg puts the maintenance burden on the user, and a static cron job is a poor substitute for a real system.

As we covered in [Part 3](/blog/iceberg-maintenance-alternatives), Snowflake, Databricks, AWS, Dremio, and Cloudera all run maintenance quietly in the background for their managed tables. People expected the same from IOMETE: tables that stay healthy without anyone watching them.

So we built it: a system that figures out for itself which tables need maintenance, when to run it, and how. What follows are the decisions behind it: what we tried, what we rejected, and why. If you're building anything that does background work across a lot of tables, some of these tradeoffs will look familiar.

## The Naive Approach and Why It Breaks

The simplest version of automated maintenance is a cron job around the four [Spark procedures](https://iceberg.apache.org/docs/latest/spark-procedures/): every few hours, iterate over your tables and run [`rewrite_data_files`](https://iceberg.apache.org/docs/latest/spark-procedures/#rewrite_data_files), [`expire_snapshots`](https://iceberg.apache.org/docs/latest/spark-procedures/#expire_snapshots), [`remove_orphan_files`](https://iceberg.apache.org/docs/latest/spark-procedures/#remove_orphan_files), and [`rewrite_manifests`](https://iceberg.apache.org/docs/latest/spark-procedures/#rewrite_manifests). For a handful of tables, that's genuinely enough. The trouble starts at a few hundred.

We started there ourselves, running the same hand-rolled Spark jobs our customers had. It falls apart fast:

- **A cron job doesn't know which tables changed.** With 500 tables and only 30 written to since the last cycle, it still checks all 500: 500 metadata reads, 500 manifest scans, burning compute and hammering the REST catalog for tables that never moved.
- **No schedule is right for streaming.** A table committing once a second produces 86,400 [snapshots](https://iceberg.apache.org/spec/#snapshots) a day. Compact after every batch and the rewrite collides with the next write; wait for a nightly run and the small-file count explodes into the hundreds of thousands first.
- **There's no back-pressure.** Compaction is heavy. Fire it at 50 tables at once and the Spark cluster either falls over or starves the analytical queries users are waiting on. A cron loop has no way to throttle itself when it's overloaded.
- **Not every operation needs a cluster.** Expiring snapshots is a quick metadata call. Compaction rewrites data files and can run for hours. A cron loop treats them identically, spinning up the same heavy machinery for both.

And these problems compound. Once you move past 50 tables, the cron approach requires increasingly fragile orchestration logic. At that point, you've built a maintenance service anyway, only a bad one.

## Build vs. Adopt: Evaluating Amoro

Once it's clear you need a real maintenance service rather than a cron loop, the next question is whether to build it or adopt one. We covered Amoro's capabilities and positioning in the [alternatives landscape post](/blog/iceberg-maintenance-alternatives); what follows is our engineering evaluation.

Before building from scratch, we evaluated [Apache Amoro](https://amoro.apache.org/), an open-source lakehouse management system built for Iceberg table maintenance. Amoro provides [self-optimizing tables](https://amoro.apache.org/docs/latest/self-optimizing/) with automatic compaction, snapshot expiration, and orphan cleanup. It's used at scale by companies like NetEase and ByteDance. On paper, it was a perfect fit.

We spent several weeks evaluating it in depth.

Amoro's self-optimization pipeline (detect, evaluate, plan, execute, commit) is well thought out. It supports Minor, Major, and Full optimization types, each triggered by different conditions. The custom compaction logic reportedly [benchmarks at 10x the efficiency](https://medium.com/@jinsong.zhou1990/10x-efficiency-boost-compared-to-spark-rewritefiles-procedure-how-apache-amoro-efficiently-7e7a993950d7) of Spark's native `rewrite_data_files`. It provides a health score (0-100) per table and has production validation at large scale.

Where it fell short for us:

- **Heavy metadata fetches.** For every table where optimization is enabled, Amoro calls `loadTable()` on the REST catalog, downloads the metadata JSON, and reads manifest files on every planning cycle (default: every 1 minute). At our scale, this puts significant pressure on the REST catalog and object storage. We prototyped mitigations (higher cache TTL, bulk catalog calls) but each introduced its own tradeoffs.
- **Limited configuration.** Amoro supports only two levels, catalog and table. No database-level configuration, which we needed. Dynamic SQL filters (`CURRENT_DATE`, `INTERVAL`) don't work in optimization filters, manifest rewriting isn't individually toggleable, and Amoro doesn't rewrite manifests at all; it only compacts data files.
- **Weak observability.** Snapshot expiration, orphan cleanup, and dangling delete file cleanup all run, but produce no run-level history. The metrics are computed internally and only appear in logs. For a customer-facing feature, we needed full observability for every operation.
- **Tight coupling and security debt.** The architecture is tightly coupled to mixed-Iceberg logic (a format specific to Amoro's origin at NetEase). Stripping it out would require forking and maintaining roughly 50-60% of the codebase. The Docker image also carried 3 critical and ~30 high-severity security vulnerabilities that would need remediation.

We concluded that Amoro provides a strong foundation, but isn't a drop-in solution. The modifications needed would cost as much effort as building a focused system ourselves, with the ongoing maintenance tax of a fork.

Our recommendation from the evaluation was: build in-house, but don't hesitate to reuse specific pieces of Amoro's logic where they make sense.

## The Architecture at a Glance

So we built our own. Here's the whole system: maintenance flows through three phases (detect, evaluate, execute), each one filtering out work the next phase would otherwise waste effort on. At the end it splits into two execution paths, all backed by a single state store.

<Img src="/img/blog/2026-06-22-how-we-built-automated-maintenance/architecture-pipeline.png" alt="The maintenance pipeline end to end: Spark clusters emit commit events through an event pipeline into catalog updates, which feed Detect (every 2 minutes) then Evaluate (every 30 seconds), then Execute splits into SQL operations (compaction and manifest rewriting) run on the Spark cluster and simple operations (snapshot expiration and orphan cleanup) run on the maintenance service via the Iceberg Java API, before both record before/after metrics and archive to Iceberg hourly in batches of 500" centered borderless/>

The maintenance service runs on [Kubernetes](https://kubernetes.io/), backed by [PostgreSQL](https://www.postgresql.org/) for operational state. We archive completed runs to Iceberg tables for long-term audit.

## The Automated Maintenance Pipeline

The core of the system is a three-phase pipeline. Instead of running maintenance on a timer, each phase filters out work that isn't needed before passing the rest to the next:

1. **Detect:** has anything changed?
2. **Evaluate:** does this table need work?
3. **Execute:** run the operation on the right execution path.

<Img src="/img/blog/2026-06-22-how-we-built-automated-maintenance/pipeline-funnel.png" alt="A funnel narrowing through the pipeline: 500 tables in the catalog, about 30 changed since the last cycle after Detect, a handful past a threshold after Evaluate, and the few that run after Execute" centered borderless/>

### Detect

Detection answers the first question: has anything changed? Every few minutes, the service scans the catalog for tables that received commits. If a table hasn't changed, we skip it entirely. No metadata reads, no manifest parsing, only a check against our internal event log.

We considered three detection approaches:

| Approach | How it works                                                                                                                         | Verdict                                                                       |
|---|--------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| Cron-based | Evaluate every table on a schedule.                                                                                                  | Simple but wasteful, a table untouched for two weeks doesn't need evaluation. |
| Event-based | Spark writes commit events into a partitioned Iceberg event table; the service scans it for tables changed since the last check.     | Works, but requires a table scan against the event log every cycle.           |
| Catalog-based | The REST catalog already tracks each table's last metadata update; one paginated API call returns tables modified after a timestamp. | No table scan or event parsing, just a metadata timestamp check.              |

We started with the Iceberg commit report approach and later moved to the catalog-based strategy as the default. It's lighter, avoids coupling detection to a specific event table, and scales better with pagination. On a deployment with 500 tables where only 30 are actively written to, we evaluate 30 instead of 500.

### Evaluate

A fixed-schedule cron (compact every X hours) ignores table state. A table with one write per day doesn't need hourly evaluation, while a streaming table with 10,000 commits per hour needs attention much sooner. So evaluation answers the next question (does this table actually need work?) by checking specific metrics against configurable thresholds rather than the clock.

Each operation has its own trigger condition:

| Operation | Sample Triggers                                                                                                              |
|---|------------------------------------------------------------------------------------------------------------------------------|
| Compaction | Average file size is well below the target, or the delete-file ratio exceeds a configurable threshold.                       |
| Manifest rewriting | Manifest count is disproportionately high relative to data file count, or manifest overhead is large relative to table size. |
| Snapshot expiration | Snapshots older than the retention period exist (eg: 5 days) and total count exceeds the minimum to retain (eg: 2).          |

Compaction's check is the most expensive: we compute average file size per partition by traversing [manifest files](https://iceberg.apache.org/spec/#manifests). That's more IO than reading just commit events, but it gives us precise per-file metrics instead of approximations.

Orphan cleanup is the exception. You can't determine orphan status from metadata alone. The only way is a full storage scan. So orphan cleanup skips evaluation entirely and runs on its own cron schedule (weekly at Sunday midnight, configurable), always eligible when the schedule fires.

This means quiet tables are left alone. Active tables are evaluated frequently. And tables with healthy file layouts pass evaluation without triggering unnecessary work. The lesson generalizes: if you can check whether work is needed before doing it, do it. Fixed schedules are only appropriate when the check itself is expensive, like orphan cleanup's full storage scan.

### Execute

Execution runs the operation. But not all operations are equal, and that distinction drives the design.

We considered running all four operations as Spark SQL jobs. It would have been simpler architecturally, one execution path instead of two. But the cost didn't add up, because the operations split cleanly into two classes:

| Operation                             | Execution path                                                                                                 | Why                                                                                                                                                                               |
|---------------------------------------|----------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Compaction & Manifest rewriting       | Spark SQL job via our Internal SQL service on Spark Cluster.                                                   | Scan files, rewrite data, write new [Parquet](https://parquet.apache.org/), and commit. Compute-intensive work that benefits from distributed [Spark](https://spark.apache.org/). |
| Snapshot expiration & Orphan cleanup. | Directly within the maintenance service via [Iceberg's Java API](https://iceberg.apache.org/docs/latest/api/). | Traverse metadata and call storage APIs. No data rewrite, no shuffle, no cluster needed.                                                                                          |

Running expiration or orphan cleanup through Spark would mean spinning up a cluster (or keeping one warm) just to make a few API calls. So we went with the split model. Yes, two execution paths mean more code to maintain. But lightweight metadata operations never block on cluster availability, and we don't burn compute dollars on work that doesn't need it.

## Runtime Controls

The pipeline decides what to run, but two more controls decide how aggressively it runs, so maintenance never overwhelms the cluster or the tables it's maintaining.

### Concurrency Limits

Many tables can be in different stages of the pipeline at once. Without limits, a burst of detected tables could overwhelm the Spark cluster.

Each operation type has a configurable concurrency cap, tuned to cluster load and resource profile:

- **Compaction** gets the tightest cap, by far the most resource-intensive operation; too many in parallel either starves analytical workloads or causes out-of-memory failures.
- **Orphan cleanup** is similarly constrained, because it performs a full storage scan and concurrent scans hammer the object storage API layer.
- **SQL queries per cluster** are capped overall, so maintenance never monopolizes Spark at the expense of user queries.
- **Lightweight operations** (snapshot expiration, orphan cleanup) have their own separate limits, since they don't compete for Spark resources.

In V1, these limits are static; operators set them based on their cluster capacity. In later versions, we want the system to determine appropriate concurrency dynamically based on table count, table size, and which operations need to run.

### Cooldowns

After a successful run of any operation on a table, that same table+operation pair can't be picked up again for a configurable cooldown period (manual triggers bypass this cooldown).

We added this to solve a problem with streaming tables. A table receiving constant writes always has new commits. Without a cooldown, the detect-evaluate-execute loop would pick it up immediately after finishing, running compaction back-to-back. This is wasteful (recently written files rarely add up to meaningful compaction work) and increases the risk of write conflicts with the streaming pipeline.

We considered three cooldown designs:

1. **Evaluation only:** reduces metadata load, but processing could still run too often.
2. **Execution only:** controls write conflicts, but evaluation still hammers the catalog with metadata reads.
3. **Both stages:** each stage solves a different part of the problem.

We went ahead with option three. The evaluation cooldown prevents repeated metadata scans for the same table; the processing cooldown ensures heavy operations run only at safe intervals. The tradeoff is that a table that genuinely needs immediate re-compaction (say, after a large batch load) must wait for the cooldown to expire. That's what manual triggers are for.

:::note Evaluations can go stale
Because the evaluation that produced a pending operation may be minutes or hours old by the time processing picks it from the queue, its reasons can be slightly stale; a table might have accumulated more small files since. For V1 this is acceptable; the operation still helps, even on slightly dated metrics. In later versions, we plan to use commit-event payloads to track delta changes since the last evaluation, which will let us do more targeted compaction like compacting a specific partition which has been impacted.
:::

## Configuration Hierarchy

We needed configuration at multiple levels, with settings resolving from most specific to least:

1. **Table-level config:** per-table settings, highest priority
2. **Catalog-level config:** defaults for all tables in that catalog
3. **Platform defaults:** built-in IOMETE defaults, final fallback

Each level inherits from the one below it. Set a retention period at the catalog level and every table in that catalog picks it up unless overridden.

**The catalog acts as a master switch.** Catalog-level maintenance must be enabled before any table in that catalog can run maintenance.

<Img src="/img/blog/2026-06-22-how-we-built-automated-maintenance/config-hierarchy.png" alt="Configuration resolves most specific first: table-level config overrides catalog-level config, which overrides platform defaults, and each level inherits from the one below. The catalog acts as a master switch that must be enabled before any of its tables can run maintenance" centered borderless/>

One gap we're aware of: there's no database-level configuration yet. If you have 200 tables across 10 databases and want different retention policies per database, you currently configure each table individually. Database-level inheritance is on the roadmap for later versions.

## The Road Ahead

V1 is deliberately scoped and we know what's missing:

- **Priority-based scheduling.** Right now, all tables get equal treatment. Under heavy load, a critical customer-facing table gets the same scheduling priority as an internal staging table. We plan to introduce automatic priority based on query frequency and table usage patterns.
- **Automatic partition awareness.** For write-conflict avoidance, V1 relies on user-defined static WHERE filters to exclude hot partitions from compaction (e.g., `event_date < '2026-01-01'`). We want the system to identify partitions still receiving writes and skip them automatically, removing a manual step most users forget to set up.
- **Beyond polling.** The detection loop currently runs on a fixed few minute poll. We want to trigger maintenance immediately after a large batch job completes, or continuously at a configured interval for streaming applications.
- **Query-performance metrics.** We track file counts, storage savings, and operation duration, but not the query performance improvement maintenance delivers. Showing users that compaction cut their average query time by 40% is more compelling than a file-count reduction.

## The Principle Behind It All

The core design principle is simple: don't do work you don't need to do. Every part of the system is a filter against that one idea:

- **Detection** skips tables that haven't changed.
- **Evaluation** skips tables that are already healthy.
- **Split execution** keeps lightweight operations off the Spark cluster.
- **Cooldowns** stop the same table from being reprocessed back-to-back.

Every decision traces back to the same question: is this work actually necessary right now?

The system isn't perfect. It still lacks priority scheduling, database-level config, and automatic partition awareness. But it solves the problem behind all those customer conversations: nobody has to think about table maintenance anymore. Tables stay healthy, storage costs stay predictable, and we get to build on a real foundation instead of patching a cron job.

---

## Resources & Further Reading

- [Floe and Apache Polaris: Policy-Driven Table Maintenance](https://polaris.apache.org/blog/2026/02/04/floe-and-apache-polaris-policy-driven-table-maintenance-for-apache-iceberg/): declarative, signal-based triggers for Iceberg maintenance.
- [Compaction in Apache Iceberg: Fine-Tuning Your Data Files](https://www.dremio.com/blog/compaction-in-apache-iceberg-fine-tuning-your-iceberg-tables-data-files/): deep dive into bin-pack and sort strategies.
- [Maintaining Tables by Using Compaction](https://docs.aws.amazon.com/prescriptive-guidance/latest/apache-iceberg-on-aws/best-practices-compaction.html): AWS best practices for scheduling and sizing compaction jobs.
- [Partition-Aware Compaction: A Fail-Safe Strategy for Streaming Data Lakes](https://medium.com/@shahsoumil519/partition-aware-compaction-a-fail-safe-strategy-for-streaming-data-lakes-with-apache-iceberg-c2abfbef6a52): filtering compaction by partition to avoid streaming write conflicts.
- [Manage Concurrent Write Conflicts in Iceberg on AWS Glue](https://aws.amazon.com/blogs/big-data/manage-concurrent-write-conflicts-in-apache-iceberg-on-the-aws-glue-data-catalog/): patterns for handling commit conflicts between maintenance and write workloads.
- [Apache Amoro](https://amoro.apache.org/): self-optimizing Iceberg tables with continuous monitoring ([GitHub](https://github.com/apache/amoro)).

#### IOMETE References
- [Automated Table Maintenance on IOMETE](/resources/user-guide/table-maintenance/overview): the feature this post describes, including setup and configuration.
- [IOMETE Data Compaction Job](/resources/open-source-spark-jobs/data-compaction): open-source Spark job for scheduled Iceberg compaction.
