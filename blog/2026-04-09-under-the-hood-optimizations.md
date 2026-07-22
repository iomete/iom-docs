---
title: "Running Iceberg Maintenance in Production: Safety Mechanisms and Hard-Won Lessons"
description: Production lessons from running automated Apache Iceberg table maintenance — write conflict handling, orphan cleanup safety, and operational patterns.
slug: under-the-hood-optimizations
authors: abhishek
hide_table_of_contents: true
tags2: [Engineering]
banner_description: Building the maintenance system was one challenge. Running it against live workloads without breaking anything was another.
date: 04/09/2026
---

# Running Iceberg Maintenance in Production: Safety Mechanisms and Hard-Won Lessons

*Building the maintenance system was one challenge. Running it against live workloads without breaking anything was another. This post covers the safety mechanisms, failure modes, and operational surprises we encountered after deploying automated Iceberg maintenance at IOMETE.*

---

[Part 4](/blog/how-we-built-automated-maintenance) covered how we designed the detect-evaluate-execute pipeline, the configuration hierarchy, and the concurrency model. This post picks up where that left off: what happens when the system meets real production workloads, and what we built to keep it safe.

## Write conflict handling

Every automated maintenance system that runs alongside live workloads must handle write conflicts. Iceberg uses [optimistic concurrency control](https://iceberg.apache.org/docs/latest/reliability/): if the snapshot your operation was based on is no longer current when you try to commit, the commit fails. The writer must retry based on the new current version.

Our approach has three layers.

At the lowest level, Iceberg itself retries commits based on [configurable table properties](https://iceberg.apache.org/docs/latest/configuration/#write-properties) — number of retries, backoff intervals, and a total timeout. These apply to all operations, not just maintenance.

Above that, the maintenance service retries failed jobs with a configurable retry limit. If a newer successful run for the same table-operation exists, the failed job is marked obsolete instead of retried, avoiding redundant work.

The third layer is [partition-level filtering](https://medium.com/@shahsoumil519/partition-aware-compaction-a-fail-safe-strategy-for-streaming-data-lakes-with-apache-iceberg-c2abfbef6a52) for streaming tables. For tables with continuous writes, we support a `where` clause on compaction that targets specific partitions. Compacting only historical partitions (e.g., older than 7 days) avoids touching partitions that are actively receiving writes, dramatically reducing conflict probability.

Partial progress mode also helps. Instead of one massive commit at the end of compaction, it commits file groups incrementally. Each commit is smaller and less likely to conflict with concurrent writes. If some commits succeed and others fail, the successful ones still take effect.

There's a real tension between these strategies. Partition-level filtering is the cleanest solution but requires partition-aligned write patterns. Partial progress increases commit throughput, which can itself cause more conflicts on very hot tables. Iceberg's native retry with exponential backoff handles transient conflicts well, but sustained contention from multiple concurrent writers needs the higher-level strategies.

## Orphan file cleanup: the operation that needs the most guardrails

Orphan cleanup is fundamentally different from the other operations. There's no threshold-based evaluation. There's no way to determine orphan files from metadata alone because the entire point is finding files that metadata *doesn't know about*. This means a full storage scan, which is expensive.

Because of this cost, orphan cleanup runs on a configurable cron schedule rather than triggering on every table change. We enforce a minimum frequency of at most weekly.

We learned the hard way that orphan cleanup needs more guardrails than any other operation. Here are the safety mechanisms we built.

### Minimum retention floor

The backend enforces a minimum retention period. Any configuration below this floor is rejected with a non-retryable error. This prevents deleting files from in-progress writes that haven't committed yet. Iceberg's own default for [`remove_orphan_files`](https://iceberg.apache.org/docs/latest/spark-procedures/#remove_orphan_files) uses the same principle, and we enforce it at the platform level to prevent misconfiguration.

### Abort threshold on orphan percentage

If orphan files exceed a configured percentage of total files at the table location, the operation aborts entirely. Hitting this threshold usually signals something is wrong: a misconfigured catalog, partial data corruption, or a bulk-load job that failed mid-write. Investigate first, then run `remove_orphan_files` manually through the SQL editor if everything checks out.

This has been the single most effective safety mechanism. It has prevented accidental mass deletion in at least three cases where catalog metadata was temporarily inconsistent during catalog migration operations. One customer hit it during a catalog ownership transfer. Their initial instinct was to raise the threshold. The correct answer was to wait for the migration to finish, after which orphan percentage dropped to normal levels.

### Batched deletion with throttling

Files are deleted in configurable batches with a pause between batches. This prevents overwhelming the object store (particularly [S3](https://aws.amazon.com/s3/), where delete throughput can bottleneck and LIST requests are already the most expensive storage calls).

### Streaming engine checkpoint exclusion

This one caught us by surprise in production. [Flink](https://flink.apache.org/) streaming jobs write [checkpoint metadata](https://nightlies.apache.org/flink/flink-docs-master/docs/ops/state/checkpoints/) files that appear unreferenced from Iceberg's perspective but are actively used by Flink's recovery mechanism. Deleting them mid-stream causes the Flink job to fail on restart.

Our solution: detect streaming engine metadata from snapshot summaries and exclude matching files from orphan cleanup. This applies only to metadata files, not data files written by the streaming engine.

The key insight: just because a file isn't referenced in Iceberg metadata doesn't mean nothing else cares about it. If your environment uses streaming engines with checkpoint patterns, this is worth replicating.

## Timeout and failure handling

Jobs that hang are worse than jobs that fail, because they silently consume resources and block the pipeline.

SQL-based jobs (compaction, manifest rewriting) have a configurable running timeout. Most compaction jobs on tables under 1 TB complete well within the timeout window, but the limit provides headroom for massive tables while preventing indefinite hangs. Jobs stuck in pending state (waiting for cluster capacity) also have a separate timeout to prevent stale accumulation. After a configurable number of failed attempts, a job moves to permanently failed and won't auto-retry, though it can still be manually triggered.

## Metrics: measuring what changed

Every operation records before-and-after metrics. This isn't just for reporting. It's how we validate that maintenance actually improved things.

| Operation | What We Measure |
|---|---|
| Compaction | Data file count and total size (before/after), rewritten vs added files, removed delete files |
| Expire Snapshots | Snapshot count (before/after) |
| Orphan Cleanup | Data and metadata file counts and sizes (before/after) |
| Manifest Rewrite | Manifest file count and total size (before/after) |

One caveat worth knowing: before/after metrics may reflect concurrent writes that happened during the maintenance operation. On a streaming table where files arrive continuously, a long-running compaction might show the file count *increasing* even though the compaction successfully merged thousands of files. The operation-specific result metrics (rewritten files, added files) are more reliable for assessing compaction effectiveness.

A gap we're aware of: we track file counts, storage savings, and operation duration, but not the query performance improvement that maintenance delivers. Showing users that compaction reduced their average query time by 40% is more compelling than showing them a file count reduction. This is on the V2 roadmap.

## Configuration propagation delay

Configuration changes don't take effect instantly. The detection pipeline caches table and catalog configs with a short TTL. This means if you change a threshold, the next detection cycle may still use the old value. Worst case, a config change takes a few minutes to affect behavior.

This surprised some early users who expected instant effect after toggling maintenance off for a table. The table still ran one more evaluation before the cache caught up. Not a bug, but worth calling out. The cache exists because the detection pipeline checks configs for every table in every cycle — without caching, a large catalog would generate thousands of config lookups per cycle.

## What we learned running this in production

The streaming engine checkpoint issue was the most surprising production incident. Orphan cleanup deleted checkpoint metadata files, causing a streaming job to lose its recovery state on restart. We now proactively detect streaming engine metadata and exclude it. If you're building orphan cleanup for an environment with streaming engines, build this exclusion from day one — don't wait for the incident.

The orphan abort threshold saved us multiple times. Every time a customer hit it, the root cause was a temporary catalog inconsistency — not actual orphan buildup. The instinct is always to raise the threshold. The correct response is almost always to investigate why it triggered.

One subtle issue with cooldowns: evaluation results can become slightly stale by the time execution runs. A table might have accumulated more small files since the evaluation. For V1, this is acceptable — the operation still helps. In V2, we plan to use commit-event payloads to track delta changes since the last evaluation for more targeted compaction.

## Applying these patterns to your own system

Even if you don't use IOMETE, the operational patterns here apply to any Iceberg maintenance setup.

Orphan cleanup always needs a minimum retention floor and an abort threshold. The cost of accidentally deleting active data far exceeds the cost of leaving orphan files for another cycle. If your environment includes streaming engines, build checkpoint file exclusion before you hit the incident.

Write conflict handling needs multiple layers. Iceberg's built-in retry handles transient conflicts. Partition-level filtering avoids conflicts entirely for the most common case (streaming into recent partitions). Partial progress mode limits the blast radius of failures.

Track before-and-after metrics for every operation. Without them, you can't tell whether maintenance is actually helping or just consuming resources. And be aware that on actively-written tables, before/after comparisons can be misleading — prefer operation-specific result metrics.

The hardest part of running automated maintenance isn't any individual safety mechanism. It's getting all the pieces to work together without stepping on each other, while still being responsive enough that tables don't degrade between maintenance cycles.

## Resources & further reading

### Write Conflicts & Concurrency
- [Iceberg Reliability Guarantees](https://iceberg.apache.org/docs/1.6.0/reliability/) — optimistic concurrency control, conflict resolution, and retry semantics
- [Manage Concurrent Write Conflicts in Iceberg on AWS Glue](https://aws.amazon.com/blogs/big-data/manage-concurrent-write-conflicts-in-apache-iceberg-on-the-aws-glue-data-catalog/) — catalog-level and data-level conflict handling patterns
- [Handling Commit Conflicts in Apache Iceberg: Patterns and Fixes](https://www.ryft.io/blog/handling-commit-conflicts-in-apache-iceberg-patterns-and-fixes) — practical patterns for resolving commit failures
- [Working Around Iceberg Commit Failures on Concurrent Writes](https://medium.com/@ishan.das387/working-around-iceberg-commit-failures-on-concurrent-writes-9299751fd801) — real-world workarounds for streaming + maintenance conflicts
- [Understanding Apache Iceberg's Consistency Model (Part 2)](https://jack-vanlightly.com/analyses/2024/8/5/apache-icebergs-consistency-model-part-2) — deep analysis of Iceberg's OCC model and edge cases

### Partition-Aware Compaction
- [Partition-Aware Compaction: A Fail-Safe Strategy for Streaming Data Lakes](https://medium.com/@shahsoumil519/partition-aware-compaction-a-fail-safe-strategy-for-streaming-data-lakes-with-apache-iceberg-c2abfbef6a52) — filtering compaction scope to avoid conflicts with active streaming partitions
- [Optimizing Compaction for Streaming Workloads in Apache Iceberg](https://dev.to/alexmercedcoder/apache-iceberg-table-optimization-3-optimizing-compaction-for-streaming-workloads-in-apache-4od8) — streaming-specific compaction tuning

### Snapshot Expiration & Metadata Management
- [Retain and Expire Snapshots — Tabular](https://www.tabular.io/apache-iceberg-cookbook/data-operations-snapshot-expiration/) — cookbook guide to snapshot retention policies
- [Avoiding Metadata Bloat with Snapshot Expiration and Rewriting Manifests](https://dev.to/alexmercedcoder/apache-iceberg-table-optimization-5-avoiding-metadata-bloat-with-snapshot-expiration-and-moi) — coordinating expiration with manifest rewrites
- [11 Apache Iceberg Expire Snapshots Optimizations](https://overcast.blog/11-apache-iceberg-expire-snapshots-optimizations-8ce431680301) — advanced techniques for faster snapshot expiration
- [Managing Iceberg Metadata for Near-Real-Time Workloads](https://www.onehouse.ai/blog/from-the-trenches-managing-apache-iceberg-metadata-for-near-real-time-workloads) — production lessons on metadata growth from high-frequency writes

### Streaming Engine Integration
- [Flink TableMaintenance API](https://iceberg.apache.org/docs/nightly/flink-maintenance/) — embedding maintenance in Flink streaming jobs without a Spark cluster
- [Restoring Flink Jobs from Older Checkpoints May Cause Silent Data Loss — Issue #10892](https://github.com/apache/iceberg/issues/10892) — critical issue around Flink checkpoint recovery and Iceberg metadata
- [Metadata File Not Found on Flink Checkpoint Recovery — Issue #4557](https://github.com/apache/iceberg/issues/4557) — metadata expiration interfering with Flink checkpoints

### Orphan File Safety
- [Clean Up Orphan Files — Tabular](https://www.tabular.io/apache-iceberg-cookbook/data-operations-orphan-file-cleanup/) — cookbook guide with retention interval recommendations
- [Iceberg Maintenance Guide — Orphan Files](https://iceberg.apache.org/docs/latest/maintenance/) — why the default 3-day retention exists and when it's dangerous to lower it

---

*This concludes the five-part core series on Apache Iceberg table maintenance. [Part 1](/blog/hidden-debt-in-lakehouse-tables) covered why tables degrade. [Part 2](/blog/iceberg-maintenance-operations) explained what Iceberg gives you out of the box. [Part 3](/blog/iceberg-maintenance-alternatives) surveyed the alternatives. [Part 4](/blog/how-we-built-automated-maintenance) told the engineering story of what we built.*

*Bonus deep-dive: [Part 6](/blog/orphan-cleanup-from-scratch) — why we rebuilt Iceberg's orphan file cleanup from scratch, the most dangerous maintenance operation in the set.*

