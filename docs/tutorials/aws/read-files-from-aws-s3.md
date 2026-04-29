---
slug: /aws/read-files-from-aws-s3
title: Querying Files in AWS S3
description: Read CSV, JSON, Parquet, and ORC files directly from an external S3 bucket with IOMETE SQL, then move that data into managed Iceberg tables in the Lakehouse.
sidebar_label: Read Files from S3
last_update:
  date: 04/29/2026
  author: Sourabh Jajoria
---

import Img from '@site/src/components/Img';

## Introduction

Most data teams keep raw files in S3 long before they're ready to land in a curated table. This tutorial walks you through querying those files in place from the IOMETE SQL Editor, then promoting the data into managed Iceberg tables in the IOMETE Lakehouse when you're ready. Every example uses standard Spark SQL (no custom IOMETE syntax), so the same queries run from a SQL Editor worksheet, a Spark Job, or a Jupyter notebook.

:::info
The examples assume you have an external bucket called `area-for-iomete` containing a `countries.json` file. Replace the bucket and file names with your own.
:::

## Common Use Cases

The patterns below cover the situations where reading directly from S3 saves you a round trip through ingestion tooling:

- Exploring ad-hoc CSV, JSON, Parquet, or ORC files in S3 without registering them as tables first.
- Bulk-loading data from an external bucket into the Lakehouse with `CREATE TABLE AS SELECT`.
- Appending or merging incremental file drops into an existing managed Iceberg table.

## Prerequisites

IOMETE needs permission to read the bucket before any of these queries work. The ingestion examples later in this tutorial also need write access. Follow the [AWS S3 Buckets Access](/user-guide/aws/s3-bucket-permissions) guide to update the bucket policy and the IOMETE Lakehouse IAM role.

:::info Use the `s3a://` Scheme
Always reference S3 paths with `s3a://`, not `s3://` or `s3n://`. IOMETE's Spark runtime registers only the Hadoop S3A driver, so `s3://` raises `No FileSystem for scheme: s3`.
:::

## Step 1: Querying a File in S3

The fastest way to inspect a file is to skip the table registration step entirely and let Spark read it directly. Open the **SQL Editor** in your domain and use the file-format shorthand `<format>.\`<path>\``, where `<format>` is one of `csv`, `json`, `parquet`, or `orc`.

```sql
SELECT * FROM json.`s3a://area-for-iomete/countries.json`;
```

The same pattern works for other formats:

```sql
SELECT * FROM csv.`s3a://area-for-iomete/sales.csv`;
SELECT * FROM parquet.`s3a://area-for-iomete/events.parquet`;
SELECT * FROM orc.`s3a://area-for-iomete/logs/`;
```

Nothing gets created in the catalog. Spark reads the file on the fly and streams the rows back to the editor.

{/* SCREENSHOT NEEDED: SQL Editor with the json.`s3a://...` query and result rows. */}

## Step 2: Moving Data Into the Lakehouse

Reading in place is great for exploration, but you'll usually want the data in a managed Iceberg table for downstream queries, governance, and time travel. Three patterns cover almost every ingestion scenario. Pick the one that matches what you need.

### Option 1: Create a Table From the Query

Use `CREATE TABLE AS SELECT` (CTAS) to spin up a fresh managed table populated with the file's rows:

```sql
-- Create a managed Iceberg table directly from the query
CREATE TABLE countries
AS SELECT * FROM json.`s3a://area-for-iomete/countries.json`;

-- Inspect the resulting schema, location, and table properties
DESC TABLE EXTENDED countries;
```

:::info
`CREATE TABLE` produces an Iceberg table by default. IOMETE sets `spark.sql.sources.default = iceberg` globally, so you don't need a `USING iceberg` clause.
:::

### Option 2: Insert Into an Existing Table

If the target table already exists, append new rows or replace all of them:

```sql
-- Append rows
INSERT INTO countries
SELECT * FROM json.`s3a://area-for-iomete/countries.json`;

-- Replace all rows atomically
INSERT OVERWRITE TABLE countries
SELECT * FROM json.`s3a://area-for-iomete/countries.json`;
```

### Option 3: Merge by Key

When you need to insert new rows and update changed ones in a single pass, reach for `MERGE INTO`. The example below assumes both the target table and the source file have an `id` column:

```sql
MERGE INTO countries
    USING (SELECT * FROM json.`s3a://area-for-iomete/countries.json`) updates
ON countries.id = updates.id
WHEN MATCHED THEN
    UPDATE SET *
WHEN NOT MATCHED
    THEN INSERT *;
```

`MERGE INTO` ships with the Iceberg Spark extensions, which IOMETE loads on every Spark session.

## Step 3: Working With Partitioned Tables

Partitioning a table speeds up any query or DML statement that filters on the partition columns. The three patterns from Step 2 still apply. You just add `PARTITIONED BY (...)` to the target and an `ORDER BY <partition_col>` to the source query. That `ORDER BY` keeps each partition in a single file, which improves write performance and avoids the small-file problem.

**Option 1: Partitioned CTAS**

```sql
CREATE TABLE countries_partitioned
  PARTITIONED BY (country_code)
AS SELECT * FROM json.`s3a://area-for-iomete/countries.json`
ORDER BY country_code;

DESC TABLE EXTENDED countries_partitioned;
```

**Option 2: Insert into an existing partitioned table**

```sql
-- Append
INSERT INTO countries_partitioned
  SELECT * FROM json.`s3a://area-for-iomete/countries.json`
  ORDER BY country_code;

-- Overwrite
INSERT OVERWRITE TABLE countries_partitioned
  SELECT * FROM json.`s3a://area-for-iomete/countries.json`
  ORDER BY country_code;
```

**Option 3: Merge into a partitioned table**

```sql
MERGE INTO countries_partitioned
  USING (SELECT * FROM json.`s3a://area-for-iomete/countries.json`) updates
ON countries_partitioned.id = updates.id
WHEN MATCHED THEN
  UPDATE SET *
WHEN NOT MATCHED
  THEN INSERT *;
```

Iceberg tracks partition metadata for you, so partition pruning kicks in automatically during the merge.

## Next Steps

- For the longer-form `CREATE TABLE ... USING csv|json|parquet|orc OPTIONS(path "s3a://...")` syntax and per-format options, see [Query Federation](../../reference/sql-quick-start/query-federation.md).

