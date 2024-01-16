---
title: SQL DDL Examples
description: This SQL script showcases key DDL operations in IOMETE, a platform based on Spark SQL and Iceberg. It includes database and table creation, CTAS and RTAS operations, and various table alterations.
---

This SQL script showcases key DDL operations in IOMETE, a platform based on Spark SQL and Iceberg. It includes database and table creation, CTAS and RTAS operations, and various table alterations.

```sql jsx title="create database"
CREATE DATABASE IF NOT EXISTS ddl_ops_demo_db;
```

```sql jsx title="show databases"
SHOW DATABASES;

/*Output
+------------------+
|    namespace     |
+------------------+
| ddl_ops_demo_db  |
| default          |
+------------------+
*/
```

```sql jsx title="show tables in the given database"
SHOW TABLES in ddl_ops_demo_db;

/* Output: Since the database has just been created, there are no tables or views available.
+------------+------------+--------------+
| namespace  | tableName  | isTemporary  |
+------------+------------+--------------+
+------------+------------+--------------+
No rows selected
*/
```

:::tip

See [DDL for Iceberg Tables: Create, Alter, Manage Operations](/reference/iceberg-tables/ddl).

:::

```sql jsx title="create a table and default format is Iceberg."
CREATE TABLE ddl_ops_demo_db.sample(id bigint COMMENT 'unique id', data string, ts timestamp);
```

```sql jsx title="both create table statements are equivalent"
CREATE TABLE ddl_ops_demo_db.sample(id bigint COMMENT 'unique id', data string, ts timestamp) using iceberg;
```

```sql jsx title="describe table"
DESCRIBE EXTENDED ddl_ops_demo_db.sample;

/* Output:
+-------------------------------+----------------------------------------------------+------------+
|           col_name            |                     data_type                      |  comment   |
+-------------------------------+----------------------------------------------------+------------+
| id                            | bigint                                             | unique id  |
| data                          | string                                             |            |
| ts                            | timestamp                                          |            |
|                               |                                                    |            |
| # Partitioning                |                                                    |            |
| Not partitioned               |                                                    |            |
|                               |                                                    |            |
| # Metadata Columns            |                                                    |            |
| _spec_id                      | int                                                |            |
| _partition                    | struct<>                                           |            |
| _file                         | string                                             |            |
| _pos                          | bigint                                             |            |
| _deleted                      | boolean                                            |            |
|                               |                                                    |            |
| # Detailed Table Information  |                                                    |            |
| Name                          | spark_catalog.ddl_ops_demo_db.sample               |            |
| Location                      | gs://iom-lakehouse-2e6c6c/data/ddl_ops_demo_db...  |            |
// highlight-start
| Provider                      | iceberg                                            |          |
// highlight-end
| Owner                         | root                                               |            |
| Table Properties              | [current-snapshot-id=none,format=iceberg/parqu...  |            |
+-------------------------------+----------------------------------------------------+------------+
20 rows selected
*/
```

```sql jsx title="create a partitioned table"
CREATE TABLE ddl_ops_demo_db.sample_partitioned (
    id bigint,
    data string,
    category string,
    ts timestamp
)
PARTITIONED BY (days(ts), category);
```

```sql jsx title="describe table"
DESCRIBE EXTENDED ddl_ops_demo_db.sample_partitioned;

/* Output: See partition related information
+-------------------------------+----------------------------------------------------+----------+
|           col_name            |                     data_type                      | comment  |
+-------------------------------+----------------------------------------------------+----------+
| id                            | bigint                                             |          |
| data                          | string                                             |          |
| category                      | string                                             |          |
| ts                            | timestamp                                          |          |

// highlight-start
| # Partitioning                |                                                    |          |
| Part 0                        | days(ts)                                           |          |
| Part 1                        | category                                           |          |
// highlight-end
|                               |                                                    |          |
| # Metadata Columns            |                                                    |          |
| _spec_id                      | int                                                |          |
// highlight-start
| _partition                    | struct<ts_day:date,category:string>                |          |
// highlight-end
| _file                         | string                                             |          |
| _pos                          | bigint                                             |          |
| _deleted                      | boolean                                            |          |
|                               |                                                    |          |
| # Detailed Table Information  |                                                    |          |
| Name                          | spark_catalog.ddl_ops_demo_db.sample_partitioned   |          |
| Location                      | gs://iom-lakehouse-2e6c6c/data/ddl_ops_demo_db...  |          |
| Provider                      | iceberg                                            |          |
| Owner                         | root                                               |          |
| Table Properties              | [current-snapshot-id=none,format=iceberg/parque... |          |
+-------------------------------+----------------------------------------------------+----------+
22 rows selected
*/

```

## Create external table

:::tip

See [JDBC sources](/reference/data-sources/jdbc-sources)

:::

```sql jsx title="create table"
CREATE TABLE IF NOT EXISTS ddl_ops_demo_db.employees_mysql_external
USING org.apache.spark.sql.jdbc
OPTIONS (
    url "jdbc:mysql://iomete-tutorial.cetmtjnompsh.eu-central-1.rds.amazonaws.com:3306/employees",
    dbtable "employees.employees",
    driver 'com.mysql.cj.jdbc.Driver',
    user 'tutorial_user',
    password '9tVDVEKp'
);
```

```sql jsx title="describe table"
DESCRIBE EXTENDED ddl_ops_demo_db.employees_mysql_external;

/* Output: See provider. It's `org.apache.spark.sql.jdbc`
+-------------------------------+----------------------------------------------------+----------+
|           col_name            |                     data_type                      | comment  |
+-------------------------------+----------------------------------------------------+----------+
| emp_no                        | int                                                | NULL     |
| birth_date                    | date                                               | NULL     |
| first_name                    | string                                             | NULL     |
| last_name                     | string                                             | NULL     |
| gender                        | string                                             | NULL     |
| hire_date                     | date                                               | NULL     |
|                               |                                                    |          |
| # Detailed Table Information  |                                                    |          |
| Database                      | ddl_ops_demo_db                                    |          |
| Table                         | employees_mysql_external                           |          |
| Owner                         | root                                               |          |
| Created Time                  | Thu Jul 06 15:51:44 UTC 2023                       |          |
| Last Access                   | UNKNOWN                                            |          |
| Created By                    | Spark 3.3.3-IOMETE                                 |          |
| Type                          | MANAGED                                            |          |
// highlight-start
| Provider                      | org.apache.spark.sql.jdbc                          |          |
// highlight-end
| Location                      | gs://iom-lakehouse-2e6c6c/data/ddl_ops_demo_db...  |          |
| Serde Library                 | org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe |          |
| InputFormat                   | org.apache.hadoop.mapred.SequenceFileInputFormat   |          |
| OutputFormat                  | org.apache.hadoop.hive.ql.io.HiveSequenceFileOu... |          |
| Storage Properties            | [url=*********(redacted), driver=com.mysql.cj.j..  |          |
+-------------------------------+----------------------------------------------------+----------+

21 rows selected
*/
```

## CTAS and RTAS operations

```sql jsx title="CTAS (Create Table As Select)"
CREATE TABLE ddl_ops_demo_db.employees_iceberg_table
AS
SELECT *
FROM ddl_ops_demo_db.employees_mysql_external;

DESCRIBE EXTENDED ddl_ops_demo_db.employees_iceberg_table;
/* Output: The table columns and their corresponding types are
automatically identified based on the query result.
+-------------------------------+----------------------------------------------------+----------+
|           col_name            |                     data_type                      | comment  |
+-------------------------------+----------------------------------------------------+----------+
// highlight-start
| emp_no                        | int                                                |          |
| birth_date                    | date                                               |          |
| first_name                    | string                                             |          |
| last_name                     | string                                             |          |
| gender                        | string                                             |          |
| hire_date                     | date                                               |          |
// highlight-end
|                               |                                                    |          |
| # Partitioning                |                                                    |          |
| Not partitioned               |                                                    |          |
|                               |                                                    |          |
| # Metadata Columns            |                                                    |          |
| _spec_id                      | int                                                |          |
| _partition                    | struct<>                                           |          |
| _file                         | string                                             |          |
| _pos                          | bigint                                             |          |
| _deleted                      | boolean                                            |          |
|                               |                                                    |          |
| # Detailed Table Information  |                                                    |          |
| Name                          | spark_catalog.ddl_ops_demo_db.employees_icebe...   |          |
| Location                      | gs://iom-lakehouse-2e6c6c/data/ddl_ops_demo_db...  |          |
| Provider                      | iceberg                                            |          |
| Owner                         | root                                               |          |
| Table Properties              | [current-snapshot-id=5866161643764467853,forma...  |          |
+-------------------------------+----------------------------------------------------+----------+
23 rows selected
*/

```

```sql jsx title=" RTAS (Replace Table As Select). Atomic table replacement creates a new snapshot with the results of the SELECT query, but keeps table history."
CREATE OR REPLACE TABLE ddl_ops_demo_db.employees_iceberg_table
AS
SELECT *
FROM ddl_ops_demo_db.employees_mysql_external;
```

```sql jsx title="Alter table name"
ALTER TABLE ddl_ops_demo_db.employees_iceberg_table RENAME TO employees;
```

```sql jsx title="describe table"

DESCRIBE EXTENDED ddl_ops_demo_db.employees;
/* Output: The name of the table has been changed as part of a metadata operation,
but the physical location of the table remains unchanged.
+-------------------------------+----------------------------------------------------+----------+
|           col_name            |                     data_type                      | comment  |
+-------------------------------+----------------------------------------------------+----------+
| emp_no                        | int                                                |          |
| birth_date                    | date                                               |          |
| first_name                    | string                                             |          |
| last_name                     | string                                             |          |
| gender                        | string                                             |          |
| hire_date                     | date                                               |          |
|                               |                                                    |          |
| # Partitioning                |                                                    |          |
| Not partitioned               |                                                    |          |
|                               |                                                    |          |
| # Metadata Columns            |                                                    |          |
| _spec_id                      | int                                                |          |
| _partition                    | struct<>                                           |          |
| _file                         | string                                             |          |
| _pos                          | bigint                                             |          |
| _deleted                      | boolean                                            |          |
|                               |                                                    |          |
| # Detailed Table Information  |                                                    |          |
| Name                          | spark_catalog.ddl_ops_demo_db.employees            |          |
// highlight-start
| Location                      | gs://iom-lakehouse-2e6c6c/data/ddl_ops_demo_db     |          |
|                               | /employees_iceberg_table                           |          |
// highlight-end
| Provider                      | iceberg                                            |          |
| Owner                         | root                                               |          |
| Table Properties              | [current-snapshot-id=37222068048484820,format...   |          |
+-------------------------------+----------------------------------------------------+----------+
23 rows selected (1.724 seconds)
*/
```

```sql jsx title="Alter table set properties"
ALTER TABLE ddl_ops_demo_db.sample SET TBLPROPERTIES ('read.split.target-size'='268435456');
SHOW TBLPROPERTIES ddl_ops_demo_db.sample;
/*
+-------------------------+------------------+
|           key           |      value       |
+-------------------------+------------------+
| current-snapshot-id     | none             |
| format                  | iceberg/parquet  |
| format-version          | 1                |
| read.split.target-size  | 268435456        |
+-------------------------+------------------+
*/
```

```sql jsx title="Alter table unset properties"
ALTER TABLE ddl_ops_demo_db.sample UNSET TBLPROPERTIES ('read.split.target-size');
```

```sql jsx title="add columns (metadata only operations)"
ALTER TABLE ddl_ops_demo_db.sample
ADD COLUMNS (
    new_column1 string comment 'new_column docs',
    new_column2 int
);

/*output
+---------+
| Result  |
+---------+
+---------+
*/
```

```sql jsx title="rename column (metadata only operations)"
ALTER TABLE ddl_ops_demo_db.sample RENAME COLUMN data TO payload;
```

```sql jsx title="change column type (metadata only operations). Allowed conversions: int -> bigint, float -> double, decimal(P,S) to decimal(P2,S) when P2 > P (scale cannot change)"
ALTER TABLE ddl_ops_demo_db.sample ALTER COLUMN new_column2 TYPE bigint;
```

```sql jsx title="drop columns (metadata only operations)"
ALTER TABLE ddl_ops_demo_db.sample DROP COLUMN id;
```

```sql jsx title="add partition field (metadata only operations)"
ALTER TABLE ddl_ops_demo_db.sample ADD PARTITION FIELD years(ts);
```

## Clean up

```sql jsx title="drop Iceberg table (delete table and data from storage. Pay attention to the PURGE option)"
DROP TABLE ddl_ops_demo_db.sample PURGE;
```

```sql jsx title="drop Iceberg table (metadata only operations - doesn't delete data from storage)"
DROP TABLE ddl_ops_demo_db.sample;
```

```sql jsx title="drop Iceberg table if exists"
DROP TABLE IF EXISTS ddl_ops_demo_db.sample PURGE;

DROP TABLE ddl_ops_demo_db.sample PURGE;
DROP TABLE ddl_ops_demo_db.sample_partitioned PURGE;
DROP TABLE ddl_ops_demo_db.employees_mysql_external;
DROP TABLE ddl_ops_demo_db.employees PURGE;

DROP DATABASE ddl_ops_demo_db;
```
