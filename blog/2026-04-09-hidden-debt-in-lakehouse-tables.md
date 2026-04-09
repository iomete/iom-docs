---
title: The Hidden Debt in Your Lakehouse Tables (And Why You Should Care)
description: Iceberg tables silently degrade from small files, snapshot accumulation, orphan files, and metadata bloat. Real production numbers on what neglect actually costs.
slug: hidden-debt-in-lakehouse-tables
authors: abhishek
hide_table_of_contents: true
tags2: [Engineering]
banner_description: Every Iceberg table you're not maintaining is silently getting slower and more expensive. This post explains the physics of why, with real production numbers.
date: 04/09/2026
---

# The Hidden Debt in Your Lakehouse Tables (And Why You Should Care)

*Every Iceberg table you're not maintaining is silently getting slower and more expensive. This post explains the physics of why, with real production numbers.*

---

A customer came to us last year with a problem. Their queries were taking 40% longer than they had three months ago. No schema changes. No new data sources. Same queries, same cluster size. Just... slower.

The culprit wasn't a bad query plan or a misconfigured cluster. It was 45 million tiny data files and 5 TB of metadata. The metadata was *larger than the actual data*. Their drivers were running out of memory just trying to figure out *which files to read*, before reading a single row.

This is what table debt looks like. And if you're running Iceberg tables in production without automated maintenance, it's accumulating right now.

## Your table is a warehouse. Nobody's cleaning the aisles.

Think of an Iceberg table like a physical warehouse. Every write operation is a delivery truck backing up to the loading dock. The truck drops off boxes (data files), and a clerk updates the inventory ledger (metadata).

In a well-run warehouse, someone periodically consolidates small boxes into larger pallets, throws away outdated inventory logs, and sweeps up packaging debris. In most Iceberg deployments? The deliveries keep coming. Nobody consolidates. Nobody sweeps. The aisles fill up with thousands of half-empty boxes, the inventory ledger grows to fill an entire filing cabinet, and finding anything requires checking every single shelf.

That's not really a metaphor. That's what happens at the file level.

## What actually happens when you write data

Let's start with what's actually happening at the file level when you write data. The maintenance stuff won't make sense without it.

### The append-only model

Iceberg is [append-only at the storage layer](https://iceberg.apache.org/spec/#overview). When you write data, Iceberg creates new [Parquet](https://parquet.apache.org/) files. It never modifies existing files in place. This is how Iceberg provides [ACID transactions, time travel, and concurrent reads](https://iceberg.apache.org/docs/latest/reliability/). It's also the root cause of table debt.

Every data-modifying commit creates at minimum:

1. A new [`metadata.json`](https://iceberg.apache.org/spec/#table-metadata) file: the table's current schema, partition spec, and snapshot history
2. A new [snapshot](https://iceberg.apache.org/spec/#snapshots): an immutable pointer to the table's state at that moment
3. A new [manifest list](https://iceberg.apache.org/spec/#manifest-lists): the index of all manifest files for this snapshot

Depending on the operation, it also creates new data files (INSERTs, COW updates), new delete files (MOR updates), or new manifest files. Some manifests get reused across snapshots, but the metadata layer always grows.

Nothing gets deleted automatically. Old files stick around because some snapshot still references them, or because nobody told Iceberg it was safe to clean up.

### Copy-on-Write vs Merge-on-Read: same problem, different shape

[Iceberg supports two write modes](https://iceberg.apache.org/docs/latest/configuration/#write-properties). Both create maintenance debt, just differently.

With **Copy-on-Write (COW)**, UPDATEs and DELETEs rewrite the entire data file with changes applied. The old file stays around until its snapshot expires. Every update creates a full copy of the affected file. Writes are slower, reads stay clean.

With **Merge-on-Read (MOR)**, Iceberg writes small "delete files" that mark which rows are removed instead of rewriting data files. Reads merge data files with delete files at query time. Writes are fast, but reads get progressively slower as delete files pile up.

COW tables bloat in storage (write amplification). MOR tables bloat in query time (read amplification). Either way, without maintenance, the problem compounds.

## The four types of table debt

Table debt isn't one problem. It's four problems that compound each other.

### 1. Small file proliferation

This is the big one. The one that bites hardest and fastest.

Streaming microbatches, small INSERTs, CDC events: they all create new data files. If your streaming pipeline commits every second, that's 86,400 commits per day. With even 5 files per commit, you're looking at **432,000 new files per day**. In a month, **13 million files** for a single table.

Query performance is a function of *file count*, not data volume. When a query engine plans a query, it has to:
1. Open the metadata file to find the current snapshot
2. Read the manifest list to find all manifest files
3. Read every manifest file to find all data files
4. Apply partition pruning and column statistics to narrow down which files to actually scan

Steps 3 and 4 scale linearly with file count. A table with 1 million small files needs **30-60 seconds just for query planning**, before a single row is read. After compaction brings that down to a few thousand files, the same query plans in under a second. We've seen 10-100x improvement in real deployments.

And then there's the cloud bill. On object storage ([S3](https://aws.amazon.com/s3/pricing/), [GCS](https://cloud.google.com/storage/pricing), [ADLS](https://azure.microsoft.com/en-us/pricing/details/storage/data-lake/)), every file operation is an API call. S3 GET requests cost $0.0004 per 1,000. A single query scanning 1 million files costs $0.40 just in GET requests. Run that 100 times a day and you're at **$1,200/month in S3 GETs for a single table**.

Small Parquet files also waste per-file overhead. Opening a file on object storage has a fixed cost (TCP setup, TLS handshake, request latency) regardless of whether the file is 1 MB or 512 MB. A 1 MB Parquet file costs roughly the same to open as a 512 MB file, but delivers 500x less data.

### 2. Snapshot accumulation

Every commit creates a snapshot. Snapshots enable time travel and rollback, which are genuinely useful. But each snapshot holds references to data files, and those references prevent garbage collection.

The trap: even after you delete data or compact files, the old files can't be removed from storage as long as *any* snapshot references them. Snapshots are the gate. Until you expire old snapshots, storage only grows. It never shrinks.

A streaming table generating 86,400 commits/day accumulates 86,400 snapshots per day. Each snapshot maintains a manifest list pointing to data files. The metadata layer grows even if your actual data volume is flat.

Symptoms:
- `metadata/` directory grows unbounded
- `metadata.json` files get larger with every snapshot (each one contains the full snapshot history)
- Query planning slows down even though data volume hasn't changed
- Storage costs creep up without explanation

The default behavior is to keep everything forever. Iceberg won't expire a single snapshot unless you explicitly tell it to.

### 3. Orphan files

Orphan files are the warehouse equivalent of debris left behind after a delivery truck crashes on the loading dock. They're physical files sitting on storage that no snapshot references. Nobody needs them, but they keep costing you money.

How do they appear? A [Spark](https://spark.apache.org/) job crashes mid-write, and the data files it already wrote to S3 sit there with no commit pointing to them. Compaction rewrites files, crashes after writing new ones but before committing, and now both old and new copies exist. Schema evolution or partition changes leave files from the old layout stranded.

Orphan files are invisible to queries (they're not in any manifest), but very visible to your storage bill. We've seen neglected tables where orphan files consume a significant chunk of storage.

### 4. Metadata bloat (manifest fragmentation)

Iceberg organizes file references into manifest files. Each manifest tracks a subset of data files along with partition values and column-level statistics. The query planner reads these manifests to decide which files to scan.

Over time, manifests fragment. Every write adds entries. Every compaction rewrites entries. The result: hundreds or thousands of small manifest files, each containing a handful of file references.

This means the query planner must open and parse hundreds of manifest files just to build the scan plan. On object storage, each manifest read is a GET request with latency. When your manifest layer becomes the bottleneck, you'll see query planning slow down *without any increase in data volume*.

The symptoms look identical to small file problems (slower queries, higher latency), but the cause is in the metadata layer, not the data layer. This is why people who only compact data files and skip manifest rewriting often see diminishing returns.

## The compounding effect

These four problems don't exist in isolation. They feed each other.

```
Small files multiply
  → More manifest entries per write
    → Manifests fragment
      → Query planning slows
        → Users complain, but data keeps flowing
          → More snapshots accumulate
            → Old files can't be garbage collected
              → Orphan files grow after failed operations
                → Storage costs rise
                  → Someone runs compaction... which creates new snapshots
                    → Back to step 1, but worse
```

This is why "just run compaction once" doesn't fix the problem. Compaction itself creates new snapshots, new manifests, and (if it fails) new orphan files. Without a *systematic* approach that handles all four problems, you're running on a treadmill.

You need all four maintenance operations running regularly:
- **Expire snapshots** — removes old metadata references and deletes data files uniquely tied to those snapshots, freeing storage
- **Remove orphan files** — cleans up files not tracked by any metadata (crashed writes, failed compactions)
- **Compact data files** — merges small files into larger ones for better read performance
- **Rewrite manifests** — consolidates fragmented metadata so query planning stays fast

Skip any one of them and the debt keeps compounding in a different dimension.

## Why streaming makes it 10x worse

Everything above applies to batch workloads. Streaming is the same physics, but at a different velocity.

A batch pipeline that runs hourly creates 24 commits per day. A streaming pipeline with 1-second microbatches creates **86,400 commits per day**. The math isn't subtle:

| | Batch (hourly) | Streaming (per-second) |
|---|---|---|
| Commits/day | 24 | 86,400 |
| New files/day (5 per commit) | 120 | 432,000 |
| Snapshots/month | 720 | 2,592,000 |
| Files/month (no compaction) | 3,600 | 12,960,000 |

At streaming velocity, tables go from healthy to unusable in *weeks*, not months. The 30-60 second query planning overhead we mentioned? That's the kind of degradation you hit within a single month of unattended streaming writes.

The irony is that streaming pipelines are usually the ones where people *don't* set up maintenance. The focus is on getting the pipeline running and keeping latency low. Maintenance feels like a problem for later. By the time "later" arrives, you're staring at 13 million files and wondering why your dashboard takes 2 minutes to load.

### MOR + streaming: compounding at velocity

If you're using Merge-on-Read with a streaming CDC pipeline ([Kafka](https://kafka.apache.org/), [Debezium](https://debezium.io/), database logs), every batch of updates generates new delete files AND new data files. The delete files accumulate at commit velocity, and each one adds filtering overhead to every subsequent read.

A table with 10,000 delete files means 10,000 additional file opens per query, 10,000 metadata reads, and complex merge logic. Without compaction that explicitly rewrites position deletes, MOR tables under streaming load trend toward unusable read latency.

## Putting real numbers on it

Take a moderately active Iceberg table: 500 GB of data, streaming ingestion, no maintenance.

After 3 months:

| Metric | Healthy | Neglected | Impact |
|---|---|---|---|
| Data files | 1,000 | 500,000+ | Query planning: seconds → minutes |
| Average file size | 512 MB | 1–5 MB | Read efficiency drops ~100x |
| Snapshots | 50 | 100,000+ | Metadata layer bloats continuously |
| Orphan files | ~0 | Thousands+ | Pure storage waste |
| Manifest files | 10 | 5,000+ | Planning overhead multiplies |
| Storage (data + metadata) | 500 GB | 800+ GB | 60%+ storage bloat |
| Simple query plan time | <1s | 30–60s | Users think "the platform is slow" |

The storage bloat alone is expensive. But the real cost is compute: slower queries burn more CPU hours, analysts wait longer, dashboards time out, and someone spins up a bigger cluster to "fix performance" when the actual fix is maintenance.

The extreme case we've seen: 45 million data files. 5 TB of metadata, larger than the data itself. Query coordinators hitting OOM just loading file statistics. The table wasn't broken. It was *unmaintained*.

## So what do you do about it?

Iceberg ships [maintenance procedures](https://iceberg.apache.org/docs/latest/maintenance/): compaction, snapshot expiration, orphan cleanup, manifest rewriting. They work fine. But there's no scheduler, no health checks, no monitoring, nothing that tells you when to run them or how often.

Most teams wire up cron jobs. Some pay a managed platform to handle it. Plenty just don't think about it until dashboards start timing out.

The next post walks through what Iceberg actually gives you for maintenance — the four operations, their mechanics, and where the DIY path leads.

---

*Next in the series: [What Open-Source Iceberg Actually Gives You for Table Maintenance](/blog/iceberg-maintenance-operations)*

## Resources & further reading

- [Apache Iceberg Documentation](https://iceberg.apache.org/docs/latest/) — official docs covering table format, configuration, and APIs
- [Iceberg Table Spec](https://iceberg.apache.org/spec/) — the full specification for snapshots, manifests, metadata files, and the append-only model
- [Iceberg Maintenance Procedures](https://iceberg.apache.org/docs/latest/maintenance/) — official guide to compaction, snapshot expiration, orphan cleanup, and manifest rewriting
- [Iceberg Table Inspection Queries](https://iceberg.apache.org/docs/latest/spark-queries/#inspecting-tables) — how to query metadata tables (data_files, snapshots, manifests) for table health diagnostics
- [Apache Parquet Format](https://parquet.apache.org/docs/) — columnar storage format used by Iceberg data files

