---
title: How We Built Automated Table Maintenance at IOMETE
description: "How we built automated Iceberg table maintenance at IOMETE: the architecture, Amoro evaluation, scheduling model, and production tradeoffs behind it."
slug: how-we-built-automated-maintenance
authors: Shashank
hide_table_of_contents: false
tags2: [Technical, Engineering]
banner_description: The goal was simple - customers should not have to think about table maintenance. This is the system we built to make that true, and the engineering decisions behind it.
coverImage: img/blog/thumbnails/darkStone.png
date: 06/22/2026
last_update:
  date: 2026-06-22
---

# How We Built Automated Table Maintenance at IOMETE

*The goal was simple: customers should not have to think about table maintenance. This is the system we built to make that true, and the engineering decisions behind it.*

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

We kept having the same conversation with customers. They would migrate from a platform like Snowflake, Databricks, Cloudera, or Dremio, create a few hundred Iceberg tables, and within weeks see queries slow down while storage costs crept up.

Most teams already had some maintenance in place, usually custom Spark jobs on a schedule. We had shipped a basic version too: a [scheduled Data Compaction Job](/resources/open-source-spark-jobs/data-compaction) on our Spark scheduler. It helped, but it was not enough. Scheduled jobs were fragile, did not scale cleanly past a few dozen tables, and could not adapt to different write patterns. Iceberg gives you the maintenance primitives, but it leaves the operating model to you. A static cron job is a weak substitute for that operating model.

As we covered in [Part 3](/blog/iceberg-maintenance-alternatives), Snowflake, Databricks, AWS, Dremio, and Cloudera all run maintenance quietly in the background for their managed tables. Customers expected the same from IOMETE: tables that stay healthy without someone checking them every day.

So we built a system that decides which tables need maintenance, when to run it, and which execution path to use. This post walks through the decisions behind that system: what we tried, what we rejected, and the production tradeoffs that shaped the final design.

## The Naive Approach and Why It Breaks

The simplest version of automated maintenance is a cron job around the four [Spark procedures](https://iceberg.apache.org/docs/latest/spark-procedures/). Every few hours, it loops through your tables and runs [`rewrite_data_files`](https://iceberg.apache.org/docs/latest/spark-procedures/#rewrite_data_files), [`expire_snapshots`](https://iceberg.apache.org/docs/latest/spark-procedures/#expire_snapshots), [`remove_orphan_files`](https://iceberg.apache.org/docs/latest/spark-procedures/#remove_orphan_files), and [`rewrite_manifests`](https://iceberg.apache.org/docs/latest/spark-procedures/#rewrite_manifests). For a handful of tables, that can be enough. The trouble starts at a few hundred.

We started there ourselves, running the same kind of Spark jobs our customers had. It falls apart fast:

- **A cron job doesn't know which tables changed.** With 500 tables and only 30 written to since the last cycle, it still checks all 500 (500 metadata reads and 500 manifest scans), burning compute and hammering the REST catalog for tables that never moved.
- **No schedule is right for streaming.** A table committing once a second produces 86,400 [snapshots](https://iceberg.apache.org/spec/#snapshots) a day. Compact after every batch and the rewrite collides with the next write; wait for a nightly run and the small-file count explodes into the hundreds of thousands first.
- **There's no back-pressure.** Compaction is heavy. Fire it at 50 tables at once and the Spark cluster either falls over or starves the analytical queries users are waiting on. A cron loop has no way to throttle itself when it's overloaded.
- **Not every operation needs a cluster.** Expiring snapshots is a quick metadata call. Compaction rewrites data files and can run for hours. A cron loop treats them identically, spinning up the same heavy machinery for both.
- **Maintenance always lags the writes.** A table written heavily in the morning sits unoptimized until the nightly job runs. Queries stay slow all day, waiting on work that's scheduled hours away.
- **You can't tell if it's working.** A cron job runs and exits. Nothing records what it changed, how much compute it burned, or whether queries actually got faster, so when maintenance quietly falls behind, slow queries are the first sign.

These problems compound. Once you move past 50 tables, the cron approach needs more and more orchestration logic: retries, throttling, locking, history, configuration, and alerts. At that point you have built a maintenance service anyway, just a bad one.

## Build vs. Adopt: Evaluating Amoro

Once we knew a cron loop would not be enough, the next question was whether to build the service ourselves or adopt one. We covered Amoro's capabilities and positioning in the [alternatives landscape post](/blog/iceberg-maintenance-alternatives); this section focuses on our engineering evaluation.

Before building from scratch, we evaluated [Apache Amoro](https://amoro.apache.org/), an open-source lakehouse management system built for Iceberg table maintenance. Amoro provides [self-optimizing tables](https://amoro.apache.org/docs/latest/self-optimizing/) with automatic compaction, snapshot expiration, and orphan cleanup. It is used at scale by companies like NetEase and ByteDance. On paper, it looked like a strong fit.

We spent several weeks evaluating it in depth. Amoro's self-optimization pipeline (detect, evaluate, plan, execute, commit) is well thought out. It runs tiered optimization, from lightweight small-file compaction through larger merges to full partition rewrites, each triggered by different conditions. Its custom compaction logic reportedly [benchmarks at 10x the efficiency](https://medium.com/@jinsong.zhou1990/10x-efficiency-boost-compared-to-spark-rewritefiles-procedure-how-apache-amoro-efficiently-7e7a993950d7) of Spark's native `rewrite_data_files`. It also provides a health score from 0 to 100 per table and has production validation at large scale.

Where it fell short for us:

- **Heavy metadata fetches.** For every table where optimization is enabled, Amoro calls `loadTable()` on the REST catalog, downloads the metadata JSON, and reads manifest files on every planning cycle. The default interval is one minute. At our scale, that puts significant pressure on the REST catalog and object storage. We prototyped mitigations such as higher cache TTLs and bulk catalog calls, but each introduced its own tradeoffs.
- **Limited configuration.** Amoro supports only two levels, catalog and table. No database-level configuration, which we needed. Dynamic SQL filters (`CURRENT_DATE`, `INTERVAL`) also don't work in optimization filters, manifest rewriting isn't individually toggleable, and Amoro doesn't rewrite manifests at all; it only compacts data files.
- **Weak observability.** Snapshot expiration, orphan cleanup, and dangling delete file cleanup all run, but produce no run-level history. The metrics are computed internally and only appear in logs. For a customer-facing feature, we needed full observability for every operation.
- **Tight coupling and security debt.** The architecture is tightly coupled to mixed-Iceberg logic, a format specific to Amoro's origin at NetEase. Stripping it out would require forking and maintaining roughly 50-60% of the codebase. The Docker image also carried 3 critical and ~30 high-severity security vulnerabilities that would need remediation.

We concluded that Amoro provides a strong foundation, but was not a drop-in solution for us. The modifications would cost about as much as building a focused system ourselves, with the ongoing maintenance tax of a fork.

Our recommendation from the evaluation was: build in-house, but don't hesitate to reuse specific pieces of Amoro's logic where they make sense.

## The Architecture at a Glance

Before we designed anything, we agreed on the core idea: do the least work possible, and spend the least doing it. That led to three rules: skip tables that have not changed, skip tables that are already healthy, and never let maintenance overload the cluster or run up the costs. Everything in the architecture follows from those rules.

The design became a single pipeline. Maintenance flows through three phases: detect, evaluate, and execute. Each phase filters out work the next phase would otherwise waste effort on, and all three share the same state store.

<Img src="/img/blog/2026-06-22-how-we-built-automated-maintenance/maintenance-orchestration-layer.png" alt="The Maintenance Orchestration Layer: query engines (Spark, Trino, Flink, Databricks, Cloudera) sit above a Detect-Evaluate-Execute orchestration layer that continuously monitors Iceberg tables across cloud and on-prem object storage" borderless/>

The maintenance service runs on [Kubernetes](https://kubernetes.io/), backed by [PostgreSQL](https://www.postgresql.org/) for operational state. Completed runs are archived to Iceberg tables for long-term audit.

## The Automated Maintenance Pipeline

The core of the system is a three-phase pipeline. Instead of running every operation on a timer, each phase answers one question and passes only the necessary work to the next phase:

1. **Detect:** has anything changed?
2. **Evaluate:** does this table need work?
3. **Execute:** run the operation on the right execution path.

<Img src="/img/blog/2026-06-22-how-we-built-automated-maintenance/pipeline-funnel.png" alt="A funnel following one 500-table deployment from all tables down to the few that get maintenance: all tables in the catalog (500, 100 percent), tables with new commits after Detect (about 30, ~6 percent, since unchanged tables are never evaluated), past a maintenance threshold after Evaluate (about 10, ~2 percent, since already-healthy tables are skipped), and maintenance executing on only those tables. Filtering this hard keeps maintenance near-real-time: a table that crosses a threshold is compacted within minutes, not at the next nightly window" centered borderless/>

### Detect

Detection answers the first question: has anything changed? Every few minutes, the service asks the catalog for tables whose metadata changed since the last detection cycle. If a table has not changed, we skip it entirely. No manifest parsing, no table-level evaluation, and no maintenance decision.

We considered three detection approaches:

| Approach | How it works                                                                                                                         | Verdict                                                                       |
|---|--------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| Cron-based | Evaluate every table on a schedule.                                                                                                  | Simple but wasteful, a table untouched for two weeks doesn't need evaluation. |
| Event-based | Spark writes commit events into a partitioned Iceberg event table; the service scans it for tables changed since the last check.     | Works, but requires a table scan against the event log every cycle.           |
| Catalog-based | The REST catalog already tracks each table's last metadata update; one paginated API call returns tables modified after a timestamp. | No table scan or event parsing, just a metadata timestamp check.              |

We started with the Iceberg commit report approach and later moved to the catalog-based strategy as the default. It is lighter, avoids coupling detection to a specific event table, and scales better with pagination. On a deployment with 500 tables where only 30 are actively written to, we evaluate 30 instead of 500.

### Evaluate

A fixed schedule ignores table state. A table with one write per day does not need hourly evaluation, while a streaming table with 10,000 commits per hour needs attention much sooner. Evaluation answers the next question: does this table actually need work? It checks table metrics against configurable thresholds instead of trusting the clock.

Each operation has its own trigger condition:

| Operation | Sample Triggers                                                                                                              |
|---|------------------------------------------------------------------------------------------------------------------------------|
| Compaction | Average file size is well below the target, or the delete-file ratio exceeds a configurable threshold.                       |
| Manifest rewriting | Manifest count is disproportionately high relative to data file count, or manifest overhead is large relative to table size. |
| Snapshot expiration | Snapshots older than the retention period exist, for example 5 days, and total count exceeds the minimum to retain, for example 2. |
| Orphan cleanup | No metadata signal to check (finding orphans needs a full storage scan), so it skips evaluation and runs on a fixed schedule instead, weekly and configurable. |

Compaction has the most expensive check. We compute average file size per partition by traversing [manifest files](https://iceberg.apache.org/spec/#manifests). That is more IO than reading commit events, but it gives us precise per-file metrics instead of approximations.

This means quiet tables are left alone. Active tables are evaluated frequently. And healthy tables pass evaluation without triggering unnecessary work. The lesson generalizes: if you can check whether work is needed before doing it, do it. Fixed schedules are only appropriate when the check itself is expensive, like orphan cleanup's full storage scan.

### Execute

Execution runs the operation, but not all operations are equal, and that distinction drives the design.

We considered running all four operations as Spark SQL jobs. Architecturally, one execution path would have been simpler than two. But the cost did not make sense, because the operations split by what they actually need:

| Operation | How it runs | Why |
|---|---|---|
| Compaction & manifest rewriting | Spark SQL job via our internal SQL service | Scans and rewrites data files, compute-intensive work that benefits from distributed [Spark](https://spark.apache.org/). |
| Snapshot expiration | On the maintenance service, via the [Iceberg Java API](https://iceberg.apache.org/docs/latest/api/) | Pure metadata work: no data rewrite, no shuffle, no cluster needed. |
| Orphan cleanup | On the maintenance service, via a custom routine | Mostly storage and metadata calls, but the stock procedure needs Spark and has real risks, so we wrote our own. |

Running snapshot expiration through Spark would mean spinning up a cluster, or keeping one warm, for work that is really just metadata and storage calls. It does not need distributed Spark compute. So we went with the split model. Two execution paths mean more code to maintain, but lightweight metadata operations never block on cluster availability, and we do not burn compute dollars on work that does not need them.

Orphan cleanup is the one operation that deletes files, so it is the easiest to get dangerously wrong. Iceberg's version only runs on Spark and does not include the safety checks we wanted, so we rebuilt it from scratch. How we did that, without Spark and without deleting the wrong file, is Part 6 (coming soon).

Each phase runs as its own scheduler on a short loop, passing pending work down the chain through a shared state store. End to end, the decision path looks like this:

<Img src="/img/blog/2026-06-22-how-we-built-automated-maintenance/scheduler-flow.png" alt="Three schedulers run on their own loops and pass work down a chain. The Detection scheduler gets changed tables from the commit report, checks whether maintenance is enabled and whether an evaluation entry already exists, then creates a pending evaluation entry. The Evaluation scheduler reads pending entries, skips tables in cooldown, and for each table and operation checks whether an entry already exists and whether table metrics breach the threshold, then creates a pending entry for the operation. The Processing scheduler reads pending entries, skips tables in cooldown, runs the operation on a Spark compute cluster if it needs Spark or on a pod otherwise, then records impact metrics" centered borderless/>

## Runtime Controls

The pipeline decides what to run. Two more controls decide how aggressively it runs, so maintenance does not overwhelm the cluster or the tables it is maintaining.

### Concurrency Limits

Hundreds of tables can move through the pipeline at once. In a single detection cycle, many of them can be flagged together, for example right after a nightly load writes to half the tables. Most will need compaction, the heaviest job we run. If we started all of them at the same time, the Spark cluster could run out of memory or spend all its capacity on maintenance while user queries wait. So we limit how many operations run at once.

Each operation type has a configurable concurrency cap, tuned to cluster load and resource profile:

- **Compaction** gets the tightest cap, since it's by far the most resource-intensive operation.
- **Orphan cleanup** is similarly constrained, because it performs a full storage scan and concurrent scans hammer the object storage API layer.
- **SQL queries per cluster** are capped overall, so maintenance never monopolizes Spark at the expense of user queries.
- **Non-Spark operations** (snapshot expiration, orphan cleanup) have their own separate limits, since they run on the maintenance service and don't compete for Spark resources.

In V1, these limits are static. Operators set them based on cluster capacity. In later versions, we want the system to determine appropriate concurrency dynamically based on table count, table size, and which operations need to run.

### Cooldowns

After a successful run of any operation on a table, that same table and operation pair cannot be picked up again for a configurable cooldown period. Manual triggers bypass this cooldown.

We added cooldowns to handle frequently written tables. A table taking constant writes always has new commits, so without a cooldown the detect-evaluate-execute loop would pick it up again the moment it finished, running compaction back-to-back. This is wasteful because recently written files rarely add up to meaningful compaction work. It also raises the risk of conflicting with writes that are still coming in.

We apply cooldowns at both stages: evaluation and processing. The evaluation cooldown stops us from scanning the same table's metadata over and over. The processing cooldown makes sure heavy operations only run at safe intervals. The tradeoff is that a table that genuinely needs immediate re-compaction, for example after a large batch load, has to wait for the cooldown to expire. That is what manual triggers are for.

## Configuration Hierarchy

We needed configuration at multiple levels, with settings resolving from most specific to least specific:

1. **Table-level config:** per-table settings, highest priority
2. **Catalog-level config:** defaults for all tables in that catalog
3. **Platform defaults:** built-in IOMETE defaults, final fallback

Each level inherits from the one below it. Set a retention period at the catalog level and every table in that catalog uses it unless the table overrides it.

**The catalog acts as a master switch.** Catalog-level maintenance must be enabled before any table in that catalog can run maintenance.

<Img src="/img/blog/2026-06-22-how-we-built-automated-maintenance/config-hierarchy.png" alt="Configuration resolves most specific first: table-level config overrides catalog-level config, which overrides platform defaults, and each level inherits from the one below. The catalog acts as a master switch that must be enabled before any of its tables can run maintenance" centered borderless/>

One gap we are aware of: there is no database-level configuration yet. If you have 200 tables across 10 databases and want different retention policies per database, you currently configure each table individually. Database-level inheritance is on the roadmap for later versions.

## The Road Ahead

V1 is deliberately scoped, and we know what is missing:

- **Priority-based scheduling.** Right now, all tables get equal treatment. Under heavy load, a critical customer-facing table gets the same scheduling priority as an internal staging table. We plan to introduce automatic priority based on query frequency and table usage patterns.
- **Automatic partition awareness.** Compacting a partition that is still taking writes will likely collide with those writes, and one of the two commits fails. For now we avoid that with user-defined WHERE filters that exclude hot partitions, for example `event_date < '2026-01-01'`. We want the system to handle this itself: skip partitions still receiving writes, and compact only the ones that actually changed.
- **Beyond polling.** The detection loop currently runs on a fixed poll. We want to trigger maintenance the moment a large batch job finishes, or run it continuously for streaming tables, instead of waiting for the next cycle.
- **Query-performance metrics.** We track file counts, storage savings, and operation duration, but not the query performance improvement maintenance delivers. Showing users that compaction cut their average query time by 40% is more useful than showing only a file-count reduction.

The main lesson is that table maintenance is not one job. It is a control system. The hard part is not calling `rewrite_data_files`; it is deciding when the call is worth making, how much pressure it will put on the platform, and whether the table is healthier afterward.

That is the difference between scheduled maintenance and automated maintenance. Scheduled maintenance runs because the clock says so. Automated maintenance runs because the table state says it should.

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
