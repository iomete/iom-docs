---
title: Reliable CDC to Iceberg with Debezium, Kafka, and Spark
description: How to stream database changes into Iceberg tables with schema evolution, compaction, and data quality guardrails on IOMETE.
slug: cdc-to-iceberg-debezium-kafka-spark
authors: aytan
hide_table_of_contents: true
tags2: [Engineering, Technical]
coverImage: img/blog/thumbnails/2.png
---

import FAQSection from '@site/src/components/FAQSection';

## TLDR

- Designing reliable CDC needs more than connectors: ordering, deduplication, schema evolution, and compaction must be first-class.
- Stack: Debezium for capture, Kafka for buffering/replay, Spark Structured Streaming on IOMETE for deterministic MERGE into Iceberg.
- Why IOMETE? A self-hosted, enterprise Spark + Iceberg runtime with built-in security, autoscaling, and predictable cost—no SaaS lock-in.

## Why CDC to Iceberg?

Modern analytics and AI need continuously fresh data, not nightly rebuilds. CDC delivers row-level changes from operational databases, and Iceberg keeps them queryable with ACID snapshots.

- Freshness without full reloads: only changed rows are ingested.
- Auditability and time travel: Iceberg snapshots make reconstruction and rollback trivial.
- Performance at scale: compaction and clustering keep reads fast even with high-frequency CDC.
- With IOMETE: run Iceberg + Spark inside your own perimeter on a managed execution layer optimized for CDC/ELT.

## Reference Architecture

1. **Sources**: Postgres, MySQL, Oracle emit binlog/redo changes.
2. **Capture**: Debezium connectors publish changes to Kafka topics (one per table).
3. **Buffer**: Kafka provides ordered logs, backpressure handling, and replay.
4. **Apply**: Spark Structured Streaming jobs on IOMETE MERGE updates into Iceberg with checkpoints in object storage.
5. **Serve**: BI and AI workloads read Iceberg via IOMETE Spark SQL, Trino/Presto, or any Iceberg-compatible engine.

This becomes much easier on IOMETE: Spark clusters, job deployment, autoscaling, secrets, checkpoint storage, and Iceberg metadata management are handled for you.

## Step 1: Capture Changes with Debezium

Example Postgres connector:

```json
{
  "name": "inventory-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "postgres",
    "database.port": "5432",
    "database.user": "cdc_user",
    "database.password": "******",
    "database.dbname": "inventory",
    "database.server.name": "pg",
    "table.include.list": "public.orders,public.customers",
    "slot.name": "iomete_cdc",
    "publication.autocreate.mode": "filtered",
    "tombstones.on.delete": "false"
  }
}
```

Tips:

- Use stable topic naming (for example, `pg.public.orders`) to map directly to Iceberg tables.
- Disabling tombstones is correct when deletes are handled via Debezium payloads (`op = 'd'`).
- Ensure Kafka retention covers your checkpoint replay window.

## Step 2: Upsert CDC Streams into Iceberg with Spark on IOMETE

```sql
CREATE TABLE IF NOT EXISTS lakehouse.orders (
  order_id        BIGINT,
  status          STRING,
  amount          DECIMAL(12,2),
  updated_at      TIMESTAMP,
  PRIMARY KEY (order_id) NOT ENFORCED
)
USING iceberg;
```

```scala
import org.apache.spark.sql.functions._

val topic = "pg.public.orders"
val raw = spark.readStream
  .format("kafka")
  .option("kafka.bootstrap.servers", "kafka:9092")
  .option("subscribe", topic)
  .load()

val events = raw
  .selectExpr("CAST(value AS STRING) as json")
  .select(from_json(col("json"), debeziumSchema).as("data"))
  .selectExpr(
    "data.payload.after.order_id as order_id",
    "data.payload.after.status as status",
    "data.payload.after.amount as amount",
    "data.payload.ts_ms as ts_ms",
    "data.payload.op as op"
  )
  .withColumn("updated_at", to_timestamp(col("ts_ms") / 1000))

events.writeStream
  .foreachBatch { (batch, _) =>
    batch.createOrReplaceTempView("updates")
    spark.sql(
      """
      MERGE INTO lakehouse.orders AS target
      USING updates AS source
      ON target.order_id = source.order_id
      WHEN MATCHED AND source.op = 'd' THEN DELETE
      WHEN MATCHED THEN UPDATE SET *
      WHEN NOT MATCHED THEN INSERT *
      """
    )
  }
  .option("checkpointLocation", "s3://bucket/checkpoints/orders")
  .trigger(Trigger.ProcessingTime("30 seconds"))
  .start()
```

Best practices:

- Idempotent upserts via primary key MERGE.
- Per-table checkpointing for reliable restarts.
- Schema compatibility checks to avoid runtime failures.
- IOMETE advantage: jobs run in isolated compute with autoscaling, versioned deployments, and built-in monitoring.

## Step 3: Keep Iceberg Tables Fast

High-ingest CDC creates many small files. Schedule Iceberg maintenance:

```sql
CALL system.rewrite_data_files('lakehouse.orders', map('min-file-size-bytes','134217728'));
CALL system.rewrite_sort_orders('lakehouse.orders', array(struct('order_id','asc')));
CALL system.expire_snapshots('lakehouse.orders', TIMESTAMPADD('DAY', -14, CURRENT_TIMESTAMP()));
```

On IOMETE, run these as recurring Spark jobs with resource isolation and automatic retries.

## Step 4: Operate with Guardrails

- Observability: track consumer lag, batch duration, MERGE duration, and failed batches.
- Backfill strategy: Kafka retention plus checkpoint recovery for deterministic reprocessing.
- Data quality: add null-rate and type checks with quarantine paths.
- Change management: treat schemas as contracts; enforce compatibility before deployment.

## What “Good” Looks Like

- End-to-end latency under a few minutes for most tables.
- No uncontrolled small-file growth thanks to compaction and clustering.
- Easy recoverability: drop and rebuild Iceberg tables from Kafka plus checkpoints.
- Operational simplicity with IOMETE: clusters, maintenance jobs, security, networking, checkpoints, and Iceberg optimization are handled by the platform.

## Why Teams Choose IOMETE for CDC → Iceberg Pipelines

- Keep data inside your security perimeter; avoid SaaS dependency.
- Predictable, transparent cost with no per-query pricing.
- Enterprise-grade Iceberg operations: optimized Spark engine, concurrent writers, automated compaction support.
- Unified platform: ingest, transform, model, and serve in one environment.

If your organization needs a secure, self-hosted, scalable lakehouse that ingests CDC streams reliably, IOMETE is the ideal platform. Contact us: https://iomete.com/contact-us

<FAQSection
  faqs={[
    {
      question: 'What is CDC in data engineering?',
      answer: 'Change Data Capture extracts row-level inserts, updates, and deletes from OLTP systems without full reloads.'
    },
    {
      question: 'Why use Debezium for CDC?',
      answer: 'Debezium streams database changes in real time from binlogs or redo logs, providing ordered events with schema metadata.'
    },
    {
      question: 'Can Iceberg handle CDC workloads?',
      answer: 'Yes. Iceberg supports MERGE, DELETE, and row-level updates, which makes it well suited for high-frequency CDC pipelines.'
    },
    {
      question: 'How do you implement deletes from Debezium in Iceberg?',
      answer: "Debezium emits payloads with op = 'd'; Spark MERGE applies those rows with WHEN MATCHED AND op = 'd' THEN DELETE."
    },
    {
      question: 'Is Spark Structured Streaming good for CDC?',
      answer: 'Spark provides exactly-once guarantees with checkpoints and micro-batch MERGE operations; IOMETE optimizes Spark for CDC ingestion at scale.'
    },
    {
      question: 'Do you need compaction for CDC on Iceberg?',
      answer: 'Yes. CDC workloads generate many small files, so regular compaction keeps scan performance and costs in check.'
    },
    {
      question: 'Why choose IOMETE instead of Databricks or Snowflake for CDC?',
      answer: 'IOMETE is self-hosted with predictable cost, native Apache Iceberg and Spark, enterprise security, and no vendor lock-in.'
    }
  ]}
/>
