---
title: Querying Files in AWS S3
description: Querying Files in AWS S3 with IOMETE. This is an end-to-end guide about how to query and move files from your AWS S3 to IOMETE
last_update:
  date: 05/04/2023
---

import Img from '@site/src/components/Img';

import Card from "@site/src/components/Card";
import GridBox from "@site/src/components/GridBox";
import { File, FileCsv, FileJs } from "@phosphor-icons/react";

This is an end-to-end guide about how to move files from your AWS S3 to IOMETE.

:::info Your files in AWS S3
Let's assume you have an external bucket in AWS S3 with the CSV files you want to query in IOMETE. In this example, we will use the `area-for-iomete` bucket.
:::

## Provide permissions to IOMETE

In order to access files in this external S3 bucket, IOMETE requires permissions to read/write the files. Follow [this guide](/tutorials/external-s3-buckets-access) to provide the necessary permissions.

## Querying files in AWS S3

It's extremely easy to query files in AWS S3 with IOMETE. You just need to provide the bucket name and the path to the file you want to query.

```sql
SELECT  * FROM json.`s3a://area-for-iomete/countries.json`;
```

Learn more about querying files like CSV, JSON, Parquet, ORC and more detailed configuration options in the following guides:

<GridBox>

<Card title="CSV Files" icon={<FileCsv />} link="reference/data-sources/csv-files">
Learn how to query CSV files in IOMETE and options to configure the CSV data source
</Card>

<Card title="JSON Files" icon={<FileJs />} link="reference/data-sources/json-files">
Learn how to query JSON files in IOMETE and options to configure the JSON data source
</Card>

<Card title="Parquet Files" icon={<File />} link="reference/data-sources/parquet-files">
Learn how to query Parquet files in IOMETE and options to configure the Parquet data source
</Card>

<Card title="ORC Files" icon={<File />} link="reference/data-sources/orc-files">
Learn how to query ORC files in IOMETE and options to configure the ORC data source
</Card>

</GridBox>

## Moving data into the lakehouse

If you want to move files to IOMETE Lakehouse, which provides a managed data lake experience, you can use the following commands to create tables and insert data into them.

### Non-partitioned Table

- **Option 1. Create a table from select**

```sql SQL
-- Create table directly from the query
CREATE TABLE countries
AS SELECT  * FROM json.`s3a://area-for-iomete/countries.json`;

-- To inspect the table use the following query
DESC TABLE EXTENDED countries;
```

- **Option 2. Insert into to existing table**

```sql
-- just append data
INSERT INTO countries
SELECT  * FROM json.`s3a://area-for-iomete/countries.json`;

-- first clean an existing data and then insert new data
INSERT OVERWRITE TABLE countries
SELECT  * FROM json.`s3a://area-for-iomete/countries.json`;
```

- **Option 3. Merge with existing data**

```sql
MERGE INTO countries
    USING (SELECT  * FROM json.`s3a://area-for-iomete/countries.json`) updates
ON countries.id = updates.id
WHEN MATCHED THEN
    UPDATE SET *
WHEN NOT MATCHED
    THEN INSERT *;
```

### Partitioned Table

Partitioning data to speed up queries or DML that have predicates involving the partition columns. Here we use `country_code` as a partition column

- **Option 1. Create a partitioned table from select**

```sql SQL
-- Create a partitioned table directly from the query
CREATE TABLE countries_partitioned
  PARTITIONED BY (country_code)
AS SELECT * FROM json.`s3a://area-for-iomete/countries.json`
ORDER BY country_code;

-- To inspect the table use the following query
DESC TABLE EXTENDED countries_partitioned;
```

- **Option 2. Insert into to existing table**

```sql SQL
-- just append data
INSERT INTO countries_partitioned
  SELECT  * FROM json.`s3a://area-for-iomete/countries.json`
  ORDER BY country_code;

-- or you can use the following command to overwerite data
INSERT OVERWRITE TABLE countries_partitioned
  SELECT  * FROM json.`s3a://area-for-iomete/countries.json`
  ORDER BY country_code;
```

- **Option 3. Merge with existing data**

```sql
MERGE INTO countries_partitioned
  USING (SELECT  * FROM json.`s3a://area-for-iomete/countries.json`) updates
ON countries_partitioned.id = updates.id
WHEN MATCHED THEN
  UPDATE SET *
WHEN NOT MATCHED
  THEN INSERT *;
```

## Conclusion

It's extremly easy to query files in AWS S3 with IOMETE. You just need to provide the bucket name and the path to the file you want to query.
