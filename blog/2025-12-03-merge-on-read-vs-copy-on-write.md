---
title: Merge-on-Read vs Copy-on-Write in the Real World Performance, Pitfalls, and When to Use Which
description: A practical decision guide for Iceberg teams on when to pick MOR or COW, why delete files create read drag, and how IOMETE automates compaction, cleanup, and guardrails.
slug: merge-on-read-vs-copy-on-write
authors: aytan
tags2: [Educational, Technical]
coverImage: img/blog/thumbnails/3.png
date: 12/03/2025
---

import FAQSection from '@site/src/components/FAQSection';

Teams adopting Apache Iceberg often start with merge-on-read (MOR) because it sounds flexible: write fast now, apply deletes later, and optimize during compaction. In production, many quickly hit walls: MERGE INTO slows, delete files balloon, commits collide, streaming upserts lag, and tables become “unusable” without emergency compaction. This guide explains why, when to choose MOR vs copy-on-write (COW), and how IOMETE bakes both strategies into reliable maintenance for regulated, self-hosted deployments.

## Quick recap: how MOR and COW handle writes

To choose correctly, you need a clear mental model of how Iceberg applies MERGE INTO, DELETE, and UPDATE.

- **Copy-on-Write (COW)** rewrites full data files on updates or deletes. Data files always reflect the latest state, so deletes do not create separate delete files. Writes are slower, reads stay fast.
- **Merge-on-Read (MOR)** writes delete files instead of removing rows and appends new files for upserts. Cleanup happens later during compaction. Writes are fast, reads slow over time without maintenance.

| Operation | COW behavior | MOR behavior |
| --- | --- | --- |
| UPDATE | Rewrite affected data files | Write delete file + append new file |
| DELETE | Rewrite data file minus deleted rows | Write delete file only |
| INSERT | Append new files | Append new files |
| UPSERT / streaming | May rewrite many files | Append new files + delete markers |

**TL;DR:** MOR shines for frequent, small updates or streaming upserts—until delete files pile up.

:::tip Deep Dive Resources

To make informed decisions about MOR vs COW for your workloads:

- **[Iceberg Write Operations](/docs/reference/iceberg-tables/writes)** - Understand write modes, update strategies, and performance trade-offs
- **[Iceberg Maintenance](/docs/reference/iceberg-tables/maintenance)** - Master compaction, snapshot management, and table optimization
- **[Compaction Tutorial](/docs/tutorials/compaction-cow-mor)** - Step-by-step guide to compacting both CoW and MoR tables

:::

## Why MOR read performance degrades

Each delete file adds another layer of filtering the engine must apply at read time. When delete files accumulate faster than compaction rewrites them, scans become CPU-bound and spill-heavy.

- High delete-file fanout: many small deletes referencing many data files.
- Writers emit deletes across large partitions.
- Long snapshot retention keeps old delete files alive.
- Missing compaction schedules means delete files never fold into data files.
- Streaming upserts generate constant delete files at high velocity.

Symptoms include spill to disk, executors loading both data and delete files, and slow planning from large manifest lists. Without cleanup, MOR tables trend toward unusable read latency.

## Common validation errors when moving MOR data files

Manual data movement or external rewrites often trip Iceberg validation:

- Cannot delete data file referenced by delete file.
- File not found during commit after compaction rewrites files that external processes moved.
- Delete file refers to unknown data file when paths or partition layouts change outside Iceberg.
- Commit conflicts in high-concurrency MOR workloads because many small files increase collision odds.

These failures are why MOR needs guardrails and observability, not ad hoc file shuffling.

## Operational patterns that keep MOR stable

MOR works well only when paired with disciplined maintenance:

1. **Regular compaction (daily for high churn, weekly for moderate):** Rewrite data and delete files into clean files. Tune `max-concurrent-file-group-rewrites` for real parallelism.
2. **Targeted delete-file rewrites:** Rebuild delete files without rewriting all data when update/delete intensity is high but data volume is large.
3. **Snapshot expiry:** Shorten retention so old delete files drop with expired snapshots.
4. **Manifest compaction:** Keep manifest lists small to avoid slow planning and commits.
5. **Write clustering:** Avoid tiny files during streaming to reduce downstream compaction overhead.

## When MOR is actually the right choice

Choose MOR only when write flexibility outweighs maintenance cost:

- High-frequency streaming upserts or CDC ingestion (Kafka, Debezium, database logs).
- Extremely low-latency writes matter more than immediate read speed.
- Queries focus on recent data and you are willing to compact on a schedule.

If you use MOR just because “it seems faster,” you are probably optimizing the wrong thing.

## When COW plus good clustering is simpler (and faster)

Pick COW for workloads where stable reads matter most and write amplification is acceptable:

- Analytical workloads with batch updates (hourly or daily).
- Slowly changing dimensions (SCD Type 2) and predictable fact ingestion.
- Teams that want fewer failure modes, simpler debugging, and easier backfills.

Benefits: no delete-file amplification, simpler maintenance, consistently fast reads, and safer MERGE/DELETE behavior.

## How IOMETE makes MOR and COW reliable

Enterprise teams need operational guarantees, visibility, and controlled maintenance—not just table formats. IOMETE delivers that with self-hosted, secure deployments that respect data sovereignty.

1. **Managed compaction and delete-file cleanup:** Automatic scheduling and tuning for file rewrites, delete rebuilds, manifest compaction, and snapshot pruning to prevent MOR degradation.
2. **UI-level table health monitoring:** Surfaced ratios of data files to delete files, read-amplification indicators, snapshot and manifest growth, and file-size distributions missing in most open-source setups.
3. **Workload-aware execution profiles:** Strategy selection for streaming upserts (MOR-friendly), large batch rewrites (COW-friendly), partition-level optimization, and cluster-aware resource allocation across on-prem, private cloud, or hybrid environments.
4. **Safe-by-default mutation guardrails:** Blocks unsafe file movement, warns on delete-file accumulation, applies safer rewrite granularities for large partitions, and auto-handles commit retries and conflict mitigation.

:::tip
Copy-on-Write keeps reads fast and operations simple by physically rewriting files on updates. Merge-on-Read makes writes faster via delete files but slows reads unless you compact regularly. Use MOR for streaming upserts and COW for analytical workloads. IOMETE automates both with managed compaction and monitoring.
:::

## Conclusion

MOR vs COW is an operational choice, not a philosophical one. MOR delivers fast writes but demands disciplined maintenance and carries read-amplification risk. COW brings slower writes but stable reads and simpler operations. Most teams overuse MOR and underestimate the cleanup it requires; IOMETE closes that gap with automated compaction, delete-file rewrites, snapshot management, table-health UI, and guardrails for predictable performance. To evaluate IOMETE on your own infrastructure, visit [contact us](https://iomete.com/contact-us).

## FAQs

<FAQSection faqs={[
  {
    question: "Why do MOR tables become slow over time?",
    answer: "Delete files accumulate and must be applied at read time, adding CPU and I/O overhead."
  },
  {
    question: "How do I fix slow MOR reads?",
    answer: "Run regular compaction, rewrite delete files, expire old snapshots, and reduce write fanout."
  },
  {
    question: "When should I prefer COW over MOR?",
    answer: "Pick COW for analytical workloads where read performance is critical and updates are batch oriented."
  },
  {
    question: "Can I manually move data files in MOR tables?",
    answer: "Not safely. Delete files reference specific data-file paths, so moving files causes validation failures."
  },
  {
    question: "How often should MOR tables be compacted?",
    answer: "Daily for high-churn streaming systems and weekly for moderate workloads."
  },
  {
    question: "Does IOMETE manage MOR and COW maintenance automatically?",
    answer: "Yes. IOMETE orchestrates compaction, delete cleanup, manifest compaction, and snapshot optimization with built-in observability."
  },
  {
    question: "Can MOR work well for large enterprise workloads?",
    answer: "Yes, but only with consistent maintenance and tooling like IOMETE’s automated rewrite and monitoring pipeline."
  }
]} />
