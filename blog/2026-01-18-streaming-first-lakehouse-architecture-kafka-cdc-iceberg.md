---
title: "Streaming-First Lakehouse Architecture: Why 2026 Is the Year Real-Time CDC Replaces Batch ETL"
description: Batch ETL is dying. Streaming-first lakehouses built on Kafka, Debezium CDC, and Apache Iceberg deliver sub-minute data freshness without the operational complexity of dual architectures. Learn why organizations are consolidating real-time streams and analytical storage into unified Iceberg tables—and how to avoid the small files, metadata bloat, and compaction disasters that break streaming pipelines in production.
slug: streaming-first-lakehouse-architecture-kafka-cdc-iceberg
authors: aytan
tags2: ["Technical", "Company"]
hide_table_of_contents: true
date: 01/18/2026
coverImage: img/blog/thumbnails/2.png
---

import FAQSection from '@site/src/components/FAQSection';

# Streaming-First Lakehouse Architecture: Why 2026 Is the Year Real-Time CDC Replaces Batch ETL

The debate is over. Batch ETL lost.

In 2026, organizations building new data platforms aren't asking whether to adopt streaming. They're asking how fast they can migrate existing batch workloads to real-time architectures. The reason is simple: business requirements have shifted from "give me yesterday's numbers" to "show me what's happening right now."

Marketing teams need real-time customer behavior to trigger personalized campaigns within minutes. Fraud detection systems need transaction anomalies flagged in seconds, not hours. Supply chain optimization requires inventory updates reflected instantly across warehouses. Batch ETL running on nightly schedules can't deliver this.

Streaming-first lakehouse architecture solves this by unifying operational event streams (Kafka) with analytical storage (Apache Iceberg) in a single coherent system. Change Data Capture (CDC) tools like Debezium continuously replicate database changes into Kafka topics. Stream processing engines like Apache Flink transform, enrich, and write those events directly into Iceberg tables. Analysts query the same data that powers real-time applications—no dual writes, no eventual consistency problems, no stale snapshots.

But streaming to Iceberg isn't just "turn on CDC and start writing." Production deployments face brutal operational challenges: millions of small files crushing query performance, metadata bloat from sub-second commits, schema evolution breaking pipelines mid-stream, compaction strategies that require 10x the write volume they're supposed to eliminate.

This post walks through what streaming-first lakehouse architecture actually looks like in 2026, why it works, and—critically—how to deploy it without destroying query performance or operational sanity.

<!-- truncate -->

---

## Why Batch ETL Breaks in Real-Time Businesses

Traditional data architectures split the world into two systems:

**Operational databases** handle transactions—inserts, updates, deletes—with ACID guarantees and sub-second latency. These are PostgreSQL, MySQL, Oracle, Mongo running your applications.

**Analytical warehouses** handle queries—aggregations, joins, time-series analysis—optimized for read performance on large datasets. These are Snowflake, Redshift, BigQuery running your reports.

The connection between them? Batch ETL. Every night (or every hour, if you're fancy), extract data from operational databases, transform it into analytical schemas, load it into the warehouse. Rinse, repeat.

This architecture worked when "real-time" meant "yesterday's data available by 8 AM." It breaks when the business needs:

- **Fraud detection** that flags suspicious transactions within seconds of occurrence
- **Inventory management** that reflects stock changes across locations instantly
- **Customer 360 views** that update as users interact with your product
- **Anomaly detection** that catches issues before they cascade into outages
- **Dynamic pricing** that adjusts based on real-time demand signals

Batch ETL introduces latency measured in hours. Even "micro-batch" systems running every 15 minutes are too slow when the business expects sub-minute data freshness.

The solution isn't to run ETL faster. It's to eliminate the ETL entirely and build a streaming-first architecture where operational data flows continuously into analytical storage.

---

## Streaming-First Lakehouse: Architecture Patterns That Work

The streaming-first lakehouse architecture unifies operational and analytical workloads through three core components:

### 1. Change Data Capture (CDC) for Database Replication

CDC tools like Debezium monitor database transaction logs and emit every insert, update, delete as an event. Instead of periodic snapshots, you get a continuous stream of changes in real-time.

For a PostgreSQL database, Debezium reads the Write-Ahead Log (WAL), converts each row-level change into a structured event, and publishes it to a Kafka topic. The event includes before/after images of the row, metadata about the transaction, and schema information.

This happens with sub-second latency. A customer updates their shipping address? That change appears in Kafka within milliseconds. No batch job. No polling. Just continuous replication.

### 2. Apache Kafka as the Event Streaming Backbone

Kafka acts as the durable, scalable buffer between operational databases and analytical storage. It provides:

- **Durability** – Events are persisted to disk and replicated across brokers. If a consumer crashes, it resumes from the last committed offset.
- **Ordering** – Events within a partition are strictly ordered. Updates to the same customer ID always appear in the correct sequence.
- **Scalability** – Topics partition across brokers, enabling parallel consumption by multiple stream processors.
- **Replay** – Historical events remain available for reprocessing. If you need to rebuild Iceberg tables from scratch, replay the Kafka topic.

Kafka doesn't replace the lakehouse. It's the ingestion layer that feeds it. Think of Kafka as a distributed Write-Ahead Log for the entire organization—every system that needs real-time data can subscribe to the relevant topics.

### 3. Apache Iceberg for Unified Analytical Storage

Iceberg provides the ACID-compliant, schema-evolved, queryable storage layer where streaming data lands. Unlike traditional data lakes (Parquet files in S3), Iceberg offers:

- **ACID transactions** – Every commit is atomic. Queries see consistent snapshots even while writes continue.
- **Schema evolution** – Add columns, change types, rename fields without rewriting data.
- **Time travel** – Query historical versions of tables for audit, debugging, or reproducibility.
- **Hidden partitioning** – Iceberg manages partitions internally. Queries don't need to specify partition filters.
- **Efficient metadata** – Iceberg's metadata layer enables fast scan planning even with millions of files.

When Flink or Spark Streaming writes CDC events to Iceberg, those events become immediately queryable by Spark, Trino, Presto, or any engine that supports Iceberg tables. There's no "eventually consistent" window. Commits are atomic—either the data is visible or it isn't.

---

## The Kafka → Iceberg Pipeline: What Actually Happens

Let's walk through a real production pipeline: replicating a PostgreSQL customer database into an Iceberg table for analytics.

**Step 1: Debezium Captures Changes**

Debezium connects to PostgreSQL, subscribes to the WAL, and emits every row-level change to a Kafka topic named `customers.public.users`. Each event contains:

```json
{
  "before": {"id": 12345, "email": "old@example.com", "updated_at": "2026-01-15T10:00:00Z"},
  "after": {"id": 12345, "email": "new@example.com", "updated_at": "2026-01-18T14:30:00Z"},
  "op": "u",
  "ts_ms": 1737212400000
}
```

The `op` field indicates the operation type: `c` (create), `u` (update), `d` (delete). The `before` and `after` fields show the row state before and after the change.

**Step 2: Flink Processes the Stream**

A Flink job consumes the Kafka topic, deserializes events, and transforms them into Iceberg row format. This includes:

- **Schema mapping** – Convert Debezium JSON to Iceberg schema (matching column types, handling nulls)
- **Deduplication** – If the same row is updated multiple times within a commit window, only keep the latest version
- **Enrichment** – Join with reference data, add derived columns, apply business logic
- **Partitioning** – Route events to the correct Iceberg partition based on timestamp, region, or other dimensions

**Step 3: Iceberg Writes and Commits**

Flink writes data files (Parquet) to object storage and updates Iceberg's metadata. Each commit produces:

- **Data files** – Parquet files containing the actual rows
- **Manifest files** – Metadata describing which data files belong to this commit
- **Snapshot metadata** – The new table state including schema, partitions, and manifest list

Once the commit completes, the data is immediately queryable. Analysts running Spark queries see the updated rows. Dashboards refresh with the latest values. There's no delay, no "wait for the next batch."

**Step 4: Automated Maintenance**

Streaming workloads create many small files. IOMETE's automated maintenance framework handles:

- **Compaction** – Merge small files into larger ones (targeting 512 MB per file)
- **Snapshot expiration** – Delete old snapshots to prevent metadata bloat
- **Orphan file cleanup** – Remove unreferenced data files from object storage

This happens automatically on a schedule you define—nightly compaction, weekly orphan cleanup, 14-day snapshot retention. No manual intervention required.

---

## Production Challenges: What Breaks Streaming Pipelines

Streaming to Iceberg sounds simple in theory. In practice, production deployments hit three brutal challenges:

### Challenge 1: The Small Files Problem

Streaming workloads write data continuously. If you commit every second, you produce 86,400 data files per day per partition. Each file might be only 1-10 MB. When analysts query the table, Iceberg must open and scan thousands of tiny files—crushing performance.

**Symptoms:**
- Query planning takes minutes instead of seconds
- Spark jobs fail with "too many open files" errors
- S3 list operations time out due to excessive object count
- Storage costs explode from metadata overhead

**Solution:**
Batch commits into larger windows (5-10 minutes) and compact aggressively. Instead of committing every second, buffer writes in Flink state and flush every 5 minutes. This reduces file count by 300x while maintaining sub-10-minute data freshness.

IOMETE's compaction engine automatically rewrites small files into 512 MB targets. For high-velocity tables, schedule compaction hourly instead of daily.

### Challenge 2: Metadata Bloat from Snapshots

Every Iceberg commit creates a new snapshot. If you're streaming updates to a table at high frequency, you accumulate thousands of snapshots. Each snapshot adds metadata overhead—manifest files, snapshot records, partition specs.

**Symptoms:**
- Table metadata grows to gigabytes even when data is only terabytes
- Query planning slows as Iceberg scans snapshot history
- Metadata operations (schema evolution, partition changes) take minutes

**Solution:**
Expire old snapshots aggressively. For streaming tables, 7-14 days of snapshot history is sufficient for time travel and rollback. Beyond that, snapshots are just bloat.

```sql
-- Expire snapshots older than 7 days
CALL iomete.system.expire_snapshots('my_database.streaming_table', TIMESTAMP '2026-01-11 00:00:00');
```

Run this weekly or integrate it into automated maintenance schedules.

### Challenge 3: Schema Evolution Mid-Stream

Databases evolve. Applications add columns. Data types change. CDC events suddenly include new fields that don't exist in the Iceberg schema.

**Symptoms:**
- Flink jobs crash with "column not found" errors
- Events are dropped silently because schema mismatch
- Manual intervention required to update Iceberg schema and restart pipelines

**Solution:**
Use Flink's **Dynamic Iceberg Sink** pattern with schema registry integration. When Debezium publishes a schema change to Kafka, Flink detects it, evolves the Iceberg table schema automatically, and continues writing without restarts.

This requires coordinating three systems:
1. **Schema Registry** – Confluent Schema Registry or Apicurio storing Avro schemas
2. **Flink Dynamic Sink** – Automatically adapts to schema changes detected in incoming events
3. **Iceberg Schema Evolution** – ADD COLUMN, ALTER TYPE operations applied on-the-fly

When deployed correctly, schema changes propagate from database → CDC → Kafka → Iceberg without pipeline downtime.

---

## Best Practices for Streaming to Iceberg in Production

### 1. Batch Writes Into Larger Commits

Don't commit every event. Buffer writes for 5-10 minutes and commit in larger batches. This reduces file count, improves compaction efficiency, and lowers metadata overhead.

**Flink configuration:**
```yaml
sink.iceberg.write.distribution-mode: hash  # Distribute by partition key
sink.iceberg.commit.interval: 300s          # Commit every 5 minutes
```

**Trade-off:** Data freshness is 5-10 minutes instead of sub-second. For most analytics use cases, this is acceptable. For real-time dashboards requiring sub-minute latency, consider a dual-tier architecture where hot data lives in Kafka or a streaming database (e.g., Apache Pinot) and cold data in Iceberg.

### 2. Compact Aggressively on High-Velocity Tables

Tables receiving millions of events per hour need hourly compaction. Tables with moderate velocity (thousands per hour) can compact daily. Adjust frequency based on file count, not calendar schedule.

**Compaction trigger:**
```sql
-- Compact when partition exceeds 100 files
SELECT partition, count(*) as file_count
FROM my_database.streaming_table.files
GROUP BY partition
HAVING count(*) > 100;
```

IOMETE provides automated compaction policies that trigger based on file count thresholds, eliminating manual monitoring.

### 3. Partition Strategically for Query Patterns

Partition Iceberg tables based on how queries filter data. Common patterns:

- **Time-series data** – Partition by `date` or `hour` for queries filtering recent periods
- **Multi-tenant SaaS** – Partition by `tenant_id` to isolate customer data
- **Geographic data** – Partition by `region` or `country` for localized analytics

**Example:**
```sql
CREATE TABLE events (
  event_id BIGINT,
  user_id BIGINT,
  event_type STRING,
  event_time TIMESTAMP,
  region STRING
)
USING iceberg
PARTITIONED BY (days(event_time), region);
```

Iceberg's **hidden partitioning** means queries don't need to specify partition filters explicitly. The query optimizer automatically prunes partitions based on filters in the WHERE clause.

### 4. Use Exactly-Once Semantics for CDC

Debezium + Kafka + Flink supports exactly-once processing. This guarantees that every database change appears in Iceberg exactly once—no duplicates, no missing records.

**Requirements:**
- Kafka 2.5+ with idempotent producers
- Flink checkpointing enabled with 2-phase commit
- Iceberg catalog supporting atomic commits (REST catalog, Hive metastore, AWS Glue)

**Flink configuration:**
```yaml
execution.checkpointing.mode: EXACTLY_ONCE
execution.checkpointing.interval: 60s
state.backend: rocksdb
state.checkpoints.dir: s3://my-bucket/checkpoints/
```

Without exactly-once semantics, CDC pipelines can duplicate events during failures or miss events during restarts. This corrupts analytical results and breaks idempotency guarantees.

### 5. Monitor Table Health Continuously

Streaming pipelines fail silently. Monitor metrics like:

- **File count per partition** – Alert when partitions exceed 500 files
- **Snapshot count** – Alert when table has more than 1,000 unexpired snapshots
- **Metadata size** – Alert when metadata exceeds 10 GB
- **Compaction lag** – Alert when last compaction was more than 24 hours ago

IOMETE's built-in table health monitoring surfaces these metrics in dashboards and integrates with alerting systems like PagerDuty or Slack.

---

## Real-World Streaming Lakehouse Patterns

### Pattern 1: Real-Time Customer 360

**Use Case:** SaaS company needs unified customer view updated in real-time as users interact with the product.

**Architecture:**
- Debezium captures changes from `users`, `subscriptions`, `usage_events` tables in PostgreSQL
- Kafka topics: `users.public.users`, `users.public.subscriptions`, `events.public.usage`
- Flink job joins streams, enriches with product catalog data, writes to Iceberg `customer_360` table
- Analysts query Iceberg with Spark for cohort analysis, retention metrics, churn prediction

**Data freshness:** 5-minute commits provide near-real-time analytics while maintaining query performance.

### Pattern 2: Fraud Detection with Sub-Minute Alerts

**Use Case:** Fintech company detects fraudulent transactions by analyzing real-time patterns across user accounts.

**Architecture:**
- Debezium captures `transactions` table changes from PostgreSQL
- Kafka topic: `payments.public.transactions`
- Flink job applies fraud detection rules (velocity checks, geographic anomalies, spending patterns)
- Fraudulent transactions written to Iceberg `fraud_alerts` table for investigation
- Real-time alerts sent to operations team via separate Kafka topic

**Data freshness:** 1-minute commits for fraud alerts, 10-minute commits for historical transaction table.

### Pattern 3: IoT Sensor Data at Scale

**Use Case:** Manufacturing company ingests millions of sensor readings per hour from factory equipment.

**Architecture:**
- IoT devices publish sensor data directly to Kafka (no CDC layer needed)
- Kafka topic: `sensors.factory_floor` partitioned by `equipment_id`
- Flink job aggregates readings into 1-minute windows, writes to Iceberg partitioned by `date` and `equipment_id`
- Predictive maintenance models query Iceberg for historical patterns

**Data freshness:** 5-minute commits with hourly compaction to manage file count from high-velocity ingestion.

---

## Frequently Asked Questions

<FAQSection faqs={[
  {
    question: "Can Apache Iceberg replace Kafka for real-time streaming?",
    answer: "No. Kafka and Iceberg serve different purposes. Kafka is a distributed event streaming platform for ingestion and pub-sub. Iceberg is a storage layer for analytical queries. Streaming-first architectures use both—Kafka for ingestion, Iceberg for durable analytical storage.",
    answerContent: (
      <>
        <p>No. Kafka and Iceberg serve different purposes. Kafka is a distributed event streaming platform for ingestion and pub-sub. Iceberg is a storage layer for analytical queries. Streaming-first architectures use both—Kafka for ingestion, Iceberg for durable analytical storage.</p>
        <p>Kafka provides <strong>sub-second latency</strong> for event delivery, buffering, and multi-consumer distribution. Iceberg provides <strong>ACID transactions</strong>, schema evolution, and efficient query performance on large datasets.</p>
        <p>IOMETE integrates with Kafka through Flink or Spark Streaming jobs that continuously write Kafka topics to Iceberg tables, combining real-time ingestion with analytical query performance.</p>
      </>
    )
  },
  {
    question: "How do you prevent small files from destroying query performance?",
    answer: "Batch commits into 5-10 minute windows instead of committing every event. Run automated compaction hourly or daily depending on write velocity. IOMETE's maintenance framework automatically rewrites small files into 512 MB targets.",
    answerContent: (
      <>
        <p>Batch commits into 5-10 minute windows instead of committing every event. Run automated compaction hourly or daily depending on write velocity. IOMETE's maintenance framework automatically rewrites small files into 512 MB targets.</p>
        <p>For high-velocity tables receiving millions of events per hour, schedule compaction <strong>hourly</strong>. For moderate velocity tables, daily compaction is sufficient.</p>
        <p>In IOMETE deployments, organizations set file count thresholds (e.g., 100 files per partition) that trigger automatic compaction, eliminating manual monitoring and preventing performance degradation.</p>
      </>
    )
  },
  {
    question: "What's the latency difference between Kafka and Iceberg for real-time queries?",
    answer: "Kafka delivers sub-second latency for event-level queries. Iceberg with Flink provides sub-10-minute latency for analytical queries after commits. For sub-second analytics, use Kafka directly or a streaming database like Pinot. For minute-level analytics, Iceberg is sufficient.",
    answerContent: (
      <>
        <p>Kafka delivers <strong>sub-second latency</strong> for event-level queries. Iceberg with Flink provides <strong>sub-10-minute latency</strong> for analytical queries after commits. For sub-second analytics, use Kafka directly or a streaming database like Apache Pinot. For minute-level analytics, Iceberg is sufficient.</p>
        <p>The trade-off is between latency and query capability. Kafka excels at key-value lookups and time-windowed aggregations. Iceberg excels at complex joins, multi-dimensional aggregations, and historical analysis.</p>
        <p>IOMETE supports both patterns—direct Kafka queries for real-time dashboards and Iceberg queries for comprehensive analytics—within a unified lakehouse architecture.</p>
      </>
    )
  },
  {
    question: "How do you handle schema evolution in streaming CDC pipelines?",
    answer: "Use Flink Dynamic Iceberg Sink with schema registry integration. When Debezium publishes a schema change to Kafka, Flink detects it, evolves the Iceberg table schema automatically, and continues writing without pipeline restarts.",
    answerContent: (
      <>
        <p>Use Flink Dynamic Iceberg Sink with schema registry integration. When Debezium publishes a schema change to Kafka, Flink detects it, evolves the Iceberg table schema automatically, and continues writing without pipeline restarts.</p>
        <p>This requires coordinating three systems: <strong>Schema Registry</strong> (Confluent or Apicurio), <strong>Flink Dynamic Sink</strong>, and <strong>Iceberg Schema Evolution</strong>. When deployed correctly, schema changes propagate from database → CDC → Kafka → Iceberg without downtime.</p>
        <p>IOMETE supports Iceberg's schema evolution natively, allowing ADD COLUMN, ALTER TYPE, and RENAME operations without rewriting data or disrupting queries.</p>
      </>
    )
  },
  {
    question: "What happens to Iceberg queries while streaming writes are happening?",
    answer: "Iceberg provides snapshot isolation. Queries see a consistent snapshot at the time the query starts. Concurrent writes create new snapshots that don't affect running queries. There's no locking or blocking between readers and writers.",
    answerContent: (
      <>
        <p>Iceberg provides <strong>snapshot isolation</strong>. Queries see a consistent snapshot at the time the query starts. Concurrent writes create new snapshots that don't affect running queries. There's no locking or blocking between readers and writers.</p>
        <p>This is fundamentally different from traditional data lakes where concurrent writes can corrupt query results or cause "file not found" errors.</p>
        <p>In IOMETE deployments, streaming writes and analytical queries run concurrently without performance degradation or consistency issues, enabling true real-time analytics on continuously updated data.</p>
      </>
    )
  },
  {
    question: "How do you guarantee exactly-once semantics in CDC pipelines?",
    answer: "Use Kafka 2.5+ with idempotent producers, Flink checkpointing with 2-phase commit, and Iceberg catalogs supporting atomic commits. This guarantees every database change appears in Iceberg exactly once—no duplicates, no missing records.",
    answerContent: (
      <>
        <p>Use Kafka 2.5+ with idempotent producers, Flink checkpointing with 2-phase commit, and Iceberg catalogs supporting atomic commits (REST catalog, Hive metastore, AWS Glue). This guarantees every database change appears in Iceberg exactly once—no duplicates, no missing records.</p>
        <p>Without exactly-once semantics, CDC pipelines can duplicate events during failures or miss events during restarts, corrupting analytical results.</p>
        <p>IOMETE's Iceberg catalog supports atomic commits required for exactly-once processing, ensuring CDC pipelines maintain data integrity even during failures and restarts.</p>
      </>
    )
  },
  {
    question: "Can you use Spark Streaming instead of Flink for writing to Iceberg?",
    answer: "Yes. Both Flink and Spark Streaming can write to Iceberg tables. Flink provides lower latency and better state management for complex stream processing. Spark Streaming (Structured Streaming) is simpler for micro-batch workloads and integrates natively with Spark SQL.",
    answerContent: (
      <>
        <p>Yes. Both Flink and Spark Streaming can write to Iceberg tables. Flink provides <strong>lower latency</strong> and better state management for complex stream processing. Spark Streaming (Structured Streaming) is simpler for micro-batch workloads and integrates natively with Spark SQL.</p>
        <p>Choose Flink for: Sub-second processing, stateful operations (windowing, deduplication), complex event patterns. Choose Spark Streaming for: Micro-batch processing (5-10 minute windows), SQL-based transformations, unified batch and streaming code.</p>
        <p>IOMETE supports both Flink and Spark Streaming for writing to Iceberg, allowing organizations to choose the best engine for their latency and complexity requirements.</p>
      </>
    )
  },
  {
    question: "What's the operational overhead of running a streaming-first lakehouse?",
    answer: "If you're already running Kubernetes and Kafka, the incremental overhead is minimal. Deploy Flink or Spark Streaming as containerized jobs, configure automated Iceberg maintenance, monitor table health metrics. IOMETE handles compaction, snapshot expiration, and metadata cleanup automatically.",
    answerContent: (
      <>
        <p>If you're already running Kubernetes and Kafka, the incremental overhead is minimal. Deploy Flink or Spark Streaming as containerized jobs, configure automated Iceberg maintenance, monitor table health metrics.</p>
        <p>IOMETE handles compaction, snapshot expiration, and metadata cleanup automatically through built-in maintenance frameworks. Organizations set policies (e.g., compact when file count exceeds 100) and IOMETE executes them on schedule.</p>
        <p>The operational model is simpler than dual-architecture systems where you maintain separate batch ETL pipelines, streaming infrastructure, and data warehouse synchronization logic.</p>
      </>
    )
  }
]} />

---

## About IOMETE

IOMETE is a self-hosted data lakehouse platform built on Apache Iceberg, Apache Spark, and Kubernetes. It provides native support for streaming workloads through Flink and Spark Streaming integration, automated table maintenance for high-velocity writes, and real-time query performance on continuously updated Iceberg tables. With IOMETE, organizations build streaming-first lakehouses that unify operational and analytical data without the complexity of dual architectures.

Learn more at [iomete.com](https://iomete.com) or [schedule a demo](https://iomete.com/contact-us) to see how streaming-first lakehouse architecture delivers real-time analytics at scale.
