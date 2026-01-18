---
title: Why Is My Iceberg Compaction So Slow? A Practical Guide to Scaling Maintenance Jobs 
description: Understand why Iceberg compaction can look serial, how to tune file grouping and Spark settings for real parallelism, and how IOMETE automates safe, observable rewrites.
slug: iceberg-compaction-slow
authors: aytan
tags2: [Educational, Technical]
coverImage: img/blog/thumbnails/structure-6.png
date: 12/02/2025
---

import FAQSection from '@site/src/components/FAQSection';

Compaction questions come up in almost every production Iceberg deployment. The pattern is familiar: one Spark executor is busy doing all the work while the rest sit idle. Jobs take hours, costs spike, and downstream pipelines fall behind. This guide demystifies how Iceberg compaction actually works, why it sometimes behaves serially, which tuning levers matter, and how IOMETE automates the hard parts for regulated, enterprise-scale environments.

:::info Related Documentation

For comprehensive guidance on Iceberg maintenance and compaction:

- **[Iceberg Maintenance Operations](/docs/reference/iceberg-tables/maintenance)** - Complete guide to table maintenance, optimization, and cleanup
- **[Data Compaction Job](/docs/open-source-spark-jobs/data-compaction-job)** - Automate compaction with IOMETE's built-in jobs
- **[Iceberg Procedures](/docs/reference/iceberg-tables/iceberg-procedures)** - Use stored procedures for rewrite operations and optimization
- **[Compaction Tutorial](/docs/tutorials/compaction-cow-mor)** - Hands-on tutorial for compacting CoW and MoR tables

:::

## How Iceberg Compaction Works (and Why It Differs From Typical Spark Jobs)

Compaction is really two jobs in one:

- **File grouping:** Iceberg analyzes manifests to decide which small files belong together based on thresholds and clustering strategy.
- **Rewrite:** Spark reads each file group, applies delete files, optionally sorts or Z-orders, and writes out new files.

Each file group becomes one logical unit of work. Iceberg creates one Spark task per group, not per file.

### Copy-on-Write (COW) vs Merge-on-Read (MOR)

- **COW rewrite:** Recreate data files fully, producing new files without relying on delete files later.
- **MOR rewrite:** Combine data files and apply delete files in place; layout depends on pending deletes.

Both modes must read and apply delete files during rewriting, which increases I/O and CPU pressure.

## Why Compaction Feels Serial

If you have 10,000 small files but Iceberg groups them into five file groups, you only get five parallel tasks—regardless of cluster size. That is the root cause of the classic “one busy executor” symptom.

Iceberg’s rewrite framework is intentionally conservative to avoid extreme shuffle pressure, preserve atomic commits, and maintain manifest consistency. Task parallelism equals the number of file groups, not the total number of files.

When only one executor is busy, it usually means:

- Only one file group met rewrite criteria.
- `max-concurrent-file-group-rewrites` is at its default of 1.
- File grouping produced large groups that cannot run concurrently.

## The Tuning Knobs That Actually Matter

### 1. `max-file-group-size-bytes`

- Controls how large a file group can become.
- Larger groups → fewer rewrite tasks → more serialization.
- Smaller groups → more tasks → higher parallelism.
- Typical starting point: 512 MB–2 GB per group, adjusted to storage throughput.

### 2. `shuffle-partitions-per-file`

- Sets how many Spark shuffle partitions Iceberg allocates per input file.
- Increases intra-group parallelism: a group with three files and this set to four yields 12 shuffle partitions.
- One of the few ways to add parallelism inside a single file group.

### 3. `max-concurrent-file-group-rewrites`

- Defines how many file groups are rewritten in parallel.
- Default is often 1, which serializes rewrites.
- Raising to 4–16 dramatically speeds small groups, but too high can overwhelm object storage, exhaust Spark memory, or trigger commit retries.

### 4. Core Spark Shuffle Settings

- `spark.sql.shuffle.partitions`: Parallelism of repartition/sort stages. Too low is slow; too high adds memory pressure.
- `spark.sql.adaptive.enabled`: AQE can merge or reduce partitions to avoid skew.
- `spark.sql.files.maxPartitionBytes`: Influences how scan splits are created.
- `spark.executor.memoryOverhead`: Compaction touches Arrow buffers, delete files, and sort spill; overhead is often underestimated.

## Stable Patterns for Very Large Partitions (200+ GB) That OOM

Large-partition compaction (including Z-order) is the top source of OOM in Spark + Iceberg. Use these production-safe patterns:

1. **Avoid rewriting entire partitions.** Split work with smaller `max-file-group-size-bytes`, higher `shuffle-partitions-per-file`, and scope to recent snapshots or incremental manifests.
2. **Do not Z-order or sort full history.** Sort or Z-order only the latest N days, use clustering metrics on write, and push sorting earlier into ETL instead of compaction.
3. **Use spill-friendly Spark settings.** Increase executor memory overhead, use smaller shuffle partitions to reduce per-task memory, and prefer the external shuffle service when available.

## How IOMETE Automates, Observes, and Scales Compaction

Enterprises need predictable, observable maintenance—especially in regulated sectors with strict operational controls. IOMETE is built for that with self-hosted deployments, full data sovereignty, and enterprise-grade performance guarantees.

- **Automated compaction orchestration:** Detects small-file buildup, creates workload-aware file groups, and schedules compaction automatically to avoid the “one busy executor” anti-pattern.
- **Deep observability into table health:** Exposes file counts, file-size histograms, compaction backlog, SLA alerts, delete-file impact, and snapshot growth so operators gain visibility missing in typical open-source setups.
- **Safe-by-default execution for large partitions:** Applies guardrails that prevent unsafe Z-order rewrites on massive partitions, splits work to avoid OOM, and uses workload-aware execution profiles to keep commits predictable.

:::tip
Iceberg compaction slows when file groups are few or huge, so Spark runs one rewrite task at a time. Speed it up by shrinking file groups, raising shuffle-partitions-per-file, and increasing max-concurrent-file-group-rewrites while splitting large partitions. IOMETE automates this with guardrails and observability for regulated teams.
:::

## Conclusion

If Iceberg compaction feels slow, the issue is rarely cluster size. It is almost always insufficient parallelism caused by file grouping or shuffle-heavy rewrites. IOMETE removes this complexity with automated orchestration, observability, and safe execution controls so compaction keeps up with streaming and batch workloads at scale. To evaluate IOMETE on your own infrastructure, visit [contact us](https://iomete.com/contact-us).

## FAQs

<FAQSection faqs={[
  {
    question: "Why does Iceberg compaction often use only one Spark executor?",
    answer: "Iceberg creates one task per file group. If only one file group qualifies for rewriting, Spark executes a single task."
  },
  {
    question: "How do I increase Iceberg compaction parallelism?",
    answer: "Use smaller file groups, increase shuffle-partitions-per-file, and raise max-concurrent-file-group-rewrites."
  },
  {
    question: "Why do large partitions fail during Z-order compaction?",
    answer: "Sorting and applying deletes on hundreds of gigabytes can exceed executor memory and spill."
  },
  {
    question: "What is the best setting to avoid serialized compaction?",
    answer: "Increase max-concurrent-file-group-rewrites so multiple file groups rewrite in parallel."
  },
  {
    question: "Does IOMETE automate Iceberg compaction?",
    answer: "Yes. IOMETE runs continuous maintenance with optimized parallelization, workload-aware grouping, and built-in observability."
  },
  {
    question: "Should I compact entire partitions?",
    answer: "No. Compact incremental or recent partitions and split large partitions into multiple file groups."
  },
  {
    question: "Does AQE help compaction?",
    answer: "Yes. Adaptive Query Execution reduces unnecessary shuffle partitions and mitigates skew during rewrite stages."
  }
]} />
