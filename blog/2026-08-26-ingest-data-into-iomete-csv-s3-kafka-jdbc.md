---
title: "How to get data into IOMETE: CSV, S3, Kafka, JDBC"
description: "Four practical ways to ingest data into a self-hosted lakehouse: SQL over raw files, per-bucket S3 access, Kafka streaming into Iceberg, and JDBC pulls."
keywords: [data ingestion, lakehouse ingestion, csv to iceberg, kafka to iceberg, jdbc spark ingestion, s3a bucket credentials]
slug: ingest-data-into-iomete-csv-s3-kafka-jdbc
authors: aytan
tags2: [Technical, Educational]
coverImage: img/blog/thumbnails/lightStone.png
date: 08/26/2026
hide_table_of_contents: false
last_update:
  date: 2026-08-26
---

Every lakehouse project stalls in the same place. The cluster is running, the catalog is up, someone has a query editor open – and the first table is still empty. The data sits in a CSV on a laptop, in a bucket another team owns, in a Kafka topic, or in the operational database nobody wants to grant access to.

This is the least glamorous part of platform work and the part that decides whether the project moves. So here are the four ingestion paths that cover almost every case, when to pick each one, and the specific mistakes that eat an afternoon.

{/* truncate */}

import FAQSection from '@site/src/components/FAQSection';

## The four ways to get data in.

There are four practical ingestion paths into an Iceberg-based lakehouse: query raw files in place with SQL, run a streaming job that watches object storage, stream from a message broker such as Kafka, or pull from an operational database over JDBC. The right one depends on whether the data arrives once, continuously, or on a schedule – not on how big it is.

A useful rule: **do not build a pipeline until you have queried the data once**. Reading a file in place takes one SQL statement, tells you whether the schema is what you were promised, and costs nothing to throw away.

## Query files where they already sit.

Spark SQL can read a file directly from object storage without copying it. That makes exploration a one-liner:

```sql
SELECT _c0, _c1, _c2, _c3
FROM csv.`s3a://iomete-lakehouse-shared/superset_examples/tutorial_flights.csv`
LIMIT 5;
```

Note the column names. This form does not treat the first row as a header, which is why the output looks wrong the first time everyone tries it. To control parsing, create a reference table instead – it still copies nothing, it just points at the path:

```sql
CREATE TABLE tutorial_flights
USING csv
OPTIONS (
  header "true",
  path "s3a://iomete-lakehouse-shared/superset_examples/tutorial_flights.csv"
);
```

Useful options here: `header`, `delimiter`, `quote`, `inferSchema`, `nullValue`, `dateFormat`, and `mode` – where `PERMISSIVE` (the default) fills missing tokens with nulls, `DROPMALFORMED` silently discards bad rows, and `FAILFAST` aborts. Pick `FAILFAST` while you are still learning the file. Silent row loss is much more expensive than a failed query. The full option list is in the [CSV files reference](/resources/user-guide/reference/data-sources/csv-files).

Two more details matter. Without `inferSchema` every column comes back as a string, so cast explicitly when you define the table. And a folder full of files needs `recursiveFileLookup "true"` with the path pointing at the directory, not a single object – a path that matches nothing produces an empty table with no columns rather than an error, which is the single most confusing failure in this whole flow.

Once the schema is confirmed, promote it into a managed Iceberg table with CTAS:

```sql
CREATE TABLE analytics.flights
AS SELECT * FROM tutorial_flights;
```

That is the moment the data becomes a real table – versioned, compactable, and governed. Everything before it was a view over someone else's file.

## Reading a bucket the platform does not own.

By default, jobs reach storage through the lakehouse role configured at installation. The interesting case is the other bucket: a partner's, a different account's, or an internal S3-compatible store with its own endpoint. Hadoop's S3A connector resolves credentials per bucket, so a single job can read several buckets with different keys and no code changes:

```
spark.hadoop.fs.s3a.bucket.<bucket-name>.access.key
spark.hadoop.fs.s3a.bucket.<bucket-name>.secret.key
spark.hadoop.fs.s3a.bucket.<bucket-name>.endpoint
```

Add these under **Configurations → Spark Config** on the job. Three things go wrong here, in order of frequency:

1. **`<bucket-name>` is the bare bucket name** – no `s3a://` prefix, no trailing path. Get this wrong and Spark falls back to the default credentials, which usually surfaces as a "no such bucket" error even though the bucket plainly exists.
2. **The endpoint is required for anything that is not standard AWS** – MinIO, Dell ECS, and other S3-compatible stores all need it set explicitly.
3. **The secret belongs in a secret, not in a config field.** Mark it as a secret in the job config so it is masked in the UI and run logs, or reference a stored credential – IOMETE supports domain-scoped secrets backed by Kubernetes or read-only [HashiCorp Vault integrations](/resources/user-guide/secrets), and both are better than a key pasted into a Spark property.

The per-bucket property reference lives in [accessing specific buckets](/resources/user-guide/spark-jobs/accessing-specific-buckets).

## Ingest files continuously.

When files keep landing, a manual read stops being enough. The [file streaming job](/resources/open-source-spark-jobs/file-streaming-job) watches a source directory and appends new files to a destination Iceberg table on a fixed trigger, using Spark Structured Streaming. It handles CSV and JSON, and for large or fast-growing buckets it can consume Amazon S3 event notifications through SQS (`s3-sqs`) instead of listing the prefix – object listing is what makes naive directory watchers collapse once a bucket holds millions of keys.

## Stream from Kafka into Iceberg.

The [Kafka to Iceberg streaming job](/resources/open-source-spark-jobs/kafka-iceberg-stream) subscribes to a topic pattern and writes records into an Iceberg table. It is configuration-driven – bootstrap servers, subscribe pattern, trigger, destination table – and deploys from the Job Templates marketplace:

```hocon
{
  kafka: {
    options: {
      "kafka.bootstrap.servers": "kafka-bootstrap-server:9092",
      "subscribePattern": ".*"
    },
    trigger: {
      once: True
    },
    checkpoint_location: "s3a://assets-dir/checkpoints/kafka-streaming/data/app1",
  }
}
```

Two constraints worth knowing before you design around it. Only JSON deserialization is supported today, so Avro or Protobuf payloads need a conversion step upstream. And set `trigger` to either `once` or `processing_time`, never both. The `checkpoint_location` default points at a local `.tmp` path, which is fine for a first test and wrong for production – put it on object storage, or the stream loses its position the moment the driver pod is rescheduled.

For the architectural side of this – exactly-once semantics, CDC patterns, and why streaming and batch tables can share one Iceberg layout – see [streaming-first lakehouse architecture](/resources/blog/streaming-first-lakehouse-architecture-kafka-cdc-iceberg).

## Pull from an operational database.

For a relational source, define an external table over JDBC and let Spark push filters down to the source:

```sql
CREATE TABLE IF NOT EXISTS demo_db.employees_external
USING org.apache.spark.sql.jdbc
OPTIONS (
    url "jdbc:mysql://host:3306/employees",
    dbtable "employees.employees",
    driver 'com.mysql.cj.jdbc.Driver',
    user 'tutorial_user',
    password '${DB_PASSWORD}'
);

CREATE TABLE demo_db.employees AS SELECT * FROM demo_db.employees_external;
```

The same pattern works for PostgreSQL, Oracle, and SQL Server – only the driver class and URL change. Two operational notes: the JDBC driver JAR has to be available to the job, and a driver class that is present in the image but not on the executor classpath is what produces `ClassNotFoundException` when the query runs rather than when the job starts. Credentials go through secrets and environment variable references, never inline.

For repeatable replication rather than a one-off copy, the [open-source ingestion jobs](/resources/open-source-spark-jobs/ingesting-jobs) cover MySQL and Oracle full-load-plus-incremental sync, Kinesis, and Debezium-based CDC from MySQL and PostgreSQL. Reusing one of those is almost always cheaper than maintaining a bespoke sync script, and they run as ordinary jobs on the same cluster as everything else. IOMETE's [data ingestion overview](https://iomete.com/product/data-platform/data-ingestion) shows where these fit in the wider platform.

## Choosing a path.

| Data arrives | Path | Notes |
|---|---|---|
| Once, for exploration | SQL over the raw file | No pipeline, no copy. Confirm the schema first. |
| Once, to keep | External table plus CTAS | Turns files into a managed Iceberg table. |
| Continuously, as files | File streaming job | Use S3 with SQS notifications on large buckets. |
| Continuously, as events | Kafka to Iceberg job | JSON only. Checkpoint to object storage. |
| On a schedule, from a database | JDBC external table or a sync job | Push down filters; use CDC for high-change tables. |

## Plan for small files from day one.

Streaming and frequent micro-batches produce many small files, and small files are what turn a fast table slow. This is a metadata problem, not a storage problem: every file adds a manifest entry that query planning has to read. Schedule compaction on any table fed by a stream, and choose the write mode deliberately – see [merge-on-read vs copy-on-write](/resources/blog/merge-on-read-vs-copy-on-write) for which one suits your update pattern, and the [Iceberg production antipatterns](/resources/blog/apache-iceberg-production-antipatterns-2026) for the failure modes that follow when nobody does.

Ingestion is the easy half. Keeping the tables healthy afterwards is the half that decides whether people trust the platform in six months.

## FAQ

<FAQSection faqs={[
  {
    question: "How do I load a CSV file into a lakehouse without any object storage set up?",
    answer: "You cannot load a file into a lakehouse table without storage behind it, because the table has to be written somewhere durable. The practical path is to put the file into the object storage the platform already uses – the same bucket that backs the lakehouse – and then read it with SQL. In IOMETE that means uploading the file to the lakehouse bucket and running a CREATE TABLE ... USING csv statement against its s3a path.",
    answerContent: (<><p>You cannot load a file into a lakehouse table without storage behind it, because the table has to be written somewhere durable. The practical path is to put the file into the object storage the platform already uses – the same bucket that backs the lakehouse – and then read it with SQL.</p><p>In IOMETE that means uploading the file to the lakehouse bucket and running a <code>CREATE TABLE ... USING csv</code> statement against its <code>s3a://</code> path. A separate MinIO or external bucket is only needed when the data has to stay outside the platform's own storage.</p></>)
  },
  {
    question: "Why does my external CSV table have no columns and no rows?",
    answer: "An empty external table almost always means the path matched no files rather than that the parse failed. Spark creates the table definition from whatever the path resolves to, so a prefix with no objects, a missing recursiveFileLookup option on a directory, or credentials that resolve to a different bucket all produce a table with no schema. IOMETE surfaces the resolved path in the job and query logs, which is the fastest way to confirm what was actually read.",
    answerContent: (<><p>An empty external table almost always means the path matched no files rather than that the parse failed. Spark builds the table definition from whatever the path resolves to.</p><p>Check three things: the prefix actually contains objects, a directory path carries <code>recursiveFileLookup "true"</code>, and the credentials in use resolve to the intended bucket. IOMETE surfaces the resolved path in the job and query logs, which is the fastest way to confirm what was read.</p></>)
  },
  {
    question: "How do I give a Spark job credentials for a second S3 bucket?",
    answer: "Per-bucket S3A properties let one job use different credentials for each bucket it touches. The keys take the form spark.hadoop.fs.s3a.bucket.<bucket-name>.access.key, .secret.key and .endpoint, where the bucket name is bare, without the s3a prefix or a path. IOMETE reads these from the job's Spark Config and masks any value marked as a secret in the console and run logs.",
    answerContent: (<><p>Per-bucket S3A properties let one job use different credentials for each bucket it touches. The keys take the form <code>spark.hadoop.fs.s3a.bucket.&lt;bucket-name&gt;.access.key</code>, <code>.secret.key</code> and <code>.endpoint</code>.</p><p>The bucket name is bare – no <code>s3a://</code> prefix and no path suffix. IOMETE reads these from the job's Spark Config and masks any value marked as a secret in the console and run logs. The endpoint is mandatory for S3-compatible stores such as MinIO.</p></>)
  },
  {
    question: "Can I stream Avro or Protobuf messages from Kafka into Iceberg?",
    answer: "Not directly with the packaged streaming job, which deserializes JSON only. Non-JSON payloads need either a conversion step upstream in the broker pipeline or a custom Structured Streaming job that handles the format. The IOMETE Kafka to Iceberg job is open source, so extending its deserialization is a supported route rather than a workaround.",
    answerContent: (<><p>Not directly with the packaged streaming job, which deserializes JSON only. Non-JSON payloads need either a conversion step upstream in the broker pipeline or a custom Structured Streaming job that handles the format.</p><p>The IOMETE Kafka to Iceberg job is published as open source, so extending its deserialization is a supported route rather than a workaround.</p></>)
  },
  {
    question: "Where should a streaming checkpoint live?",
    answer: "Checkpoints belong on object storage, never on a container's local filesystem. A checkpoint records the stream's position, so if it lives in a pod-local temporary directory it disappears when the pod restarts and the stream either reprocesses or skips data. IOMETE streaming jobs run as Kubernetes pods, which are rescheduled routinely, so the checkpoint_location should always point at an s3a path.",
    answerContent: (<><p>Checkpoints belong on object storage, never on a container's local filesystem. A checkpoint records the stream's position, so if it lives in a pod-local temporary directory it disappears when the pod restarts – and the stream either reprocesses or skips data.</p><p>IOMETE streaming jobs run as Kubernetes pods, which are rescheduled routinely, so <code>checkpoint_location</code> should always point at an <code>s3a://</code> path.</p></>)
  },
  {
    question: "Is CDC or scheduled batch replication better for an operational database?",
    answer: "Change data capture suits tables with high update rates and tight freshness requirements; scheduled batch replication suits large, slowly changing tables where minutes or hours of lag are acceptable. The deciding factor is usually update volume rather than table size, because CDC cost scales with changes while batch cost scales with rows scanned. IOMETE ships open-source jobs for both patterns – Debezium-based CDC for MySQL and PostgreSQL, and full-load-plus-incremental sync for MySQL and Oracle.",
    answerContent: (<><p>Change data capture suits tables with high update rates and tight freshness requirements. Scheduled batch replication suits large, slowly changing tables where minutes or hours of lag are acceptable.</p><p>The deciding factor is usually update volume rather than table size, because CDC cost scales with the number of changes while batch cost scales with rows scanned. IOMETE ships open-source jobs for both patterns – Debezium-based CDC for MySQL and PostgreSQL, and full-load-plus-incremental sync for MySQL and Oracle.</p></>)
  }
]} />
