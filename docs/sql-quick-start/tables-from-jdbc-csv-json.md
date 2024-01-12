---
title: Tables from JDBC, CSV, JSON, Parquet, ORC files
sidebar_label: External tables
description: This SQL script provides a comprehensive guide on data sources and external tables manipulation in IOMETE, with examples covering JDBC, CSV, JSON, Parquet, and ORC. It demonstrates creating tables from various data sources, querying these tables, as well as exporting data back to these sources.
---

This SQL script provides a comprehensive guide on data sources and external tables manipulation in IOMETE, with examples covering JDBC, CSV, JSON, Parquet, and ORC. It demonstrates creating tables from various data sources, querying these tables, as well as exporting data back to these sources.

```sql jsx  title="Let's start from creating a database"
CREATE DATABASE IF NOT EXISTS common_queries_demo_db;
```

## Manipulating JDBC sources

```sql jsx  title="Create a table from a JDBC source (MySQL)"
CREATE TABLE IF NOT EXISTS data_sources_demo_db.employees_mysql_external
USING org.apache.spark.sql.jdbc
OPTIONS (
    url "jdbc:mysql://iomete-tutorial.cetmtjnompsh.eu-central-1.rds.amazonaws.com:3306/employees",
    dbtable "employees.employees",
    driver 'com.mysql.cj.jdbc.Driver',
    user 'tutorial_user',
    password '9tVDVEKp'
);
```

:::tip
See: [JDBC-sources doc](/docs/data-sources/jdbc-sources)
:::

```sql jsx  title="To import data in iceberg format we can use CTAS statement"
CREATE TABLE data_sources_demo_db.employees
AS SELECT *
FROM data_sources_demo_db.employees_mysql_external;
```

```sql jsx  title="This will read data from the mysql table. Filters and other operations will be pushed down to the source"
SELECT * FROM data_sources_demo_db.employees_mysql_external LIMIT 10;

/* Output:
+---------+-------------+-------------+------------+---------+-------------+
| emp_no  | birth_date  | first_name  | last_name  | gender  |  hire_date  |
+---------+-------------+-------------+------------+---------+-------------+
| 10001   | 1953-09-02  | Georgi      | Facello    | M       | 1986-06-26  |
| 10002   | 1964-06-02  | Bezalel     | Simmel     | F       | 1985-11-21  |
| 10003   | 1959-12-03  | Parto       | Bamford    | M       | 1986-08-28  |
| 10004   | 1954-05-01  | Chirstian   | Koblick    | M       | 1986-12-01  |
| 10005   | 1955-01-21  | Kyoichi     | Maliniak   | M       | 1989-09-12  |
| 10006   | 1953-04-20  | Anneke      | Preusig    | F       | 1989-06-02  |
| 10007   | 1957-05-23  | Tzvetan     | Zielinski  | F       | 1989-02-10  |
| 10008   | 1958-02-19  | Saniya      | Kalloufi   | M       | 1994-09-15  |
| 10009   | 1952-04-19  | Sumant      | Peac       | F       | 1985-02-18  |
| 10010   | 1963-06-01  | Duangkaew   | Piveteau   | F       | 1989-08-24  |
+---------+-------------+-------------+------------+---------+-------------+
*/
```

:::info
Similarly, you can read/write from other JDBC sources such as PostgreSQL, Oracle, SQL Server, etc.
:::

## Manipulating CSV files

```sql jsx  title="Read CSV file from the Cloud Storage"
SELECT *
FROM csv.`gs://iomete-examples/sample-data/csv/employees.csv`
LIMIT 10;

/* Output:
+---------+-------------+-------------+------------+---------+-------------+
|   _c0   |     _c1     |     _c2     |    _c3     |   _c4   |     _c5     |
+---------+-------------+-------------+------------+---------+-------------+
| emp_no  | birth_date  | first_name  | last_name  | gender  | hire_date   |
| 10001   | 1953-09-02  | Georgi      | Facello    | M       | 1986-06-26  |
| 10002   | 1964-06-02  | Bezalel     | Simmel     | F       | 1985-11-21  |
| 10003   | 1959-12-03  | Parto       | Bamford    | M       | 1986-08-28  |
| 10004   | 1954-05-01  | Chirstian   | Koblick    | M       | 1986-12-01  |
| 10005   | 1955-01-21  | Kyoichi     | Maliniak   | M       | 1989-09-12  |
| 10006   | 1953-04-20  | Anneke      | Preusig    | F       | 1989-06-02  |
| 10007   | 1957-05-23  | Tzvetan     | Zielinski  | F       | 1989-02-10  |
| 10008   | 1958-02-19  | Saniya      | Kalloufi   | M       | 1994-09-15  |
| 10009   | 1952-04-19  | Sumant      | Peac       | F       | 1985-02-18  |
+---------+-------------+-------------+------------+---------+-------------+
*/
```

:::tip
See: [CSV Files doc](/docs/data-sources/csv-files)
:::

```sql jsx  title="Create table allows to provide additional options such as header, inferSchema, etc"
CREATE table data_sources_demo_db.employees_csv_external
USING csv
OPTIONS (
  header "true", -- first row is header information
  inferSchema "true", -- automatically infer data types
  path "gs://iomete-examples/sample-data/csv/employees.csv"
);
```

```sql jsx  title="Check the table schema and inferred data types"
DESC EXTENDED data_sources_demo_db.employees_csv_external;

/* Output:
+-------------------------------+----------------------------------------------------+----------+
|           col_name            |                     data_type                      | comment  |
+-------------------------------+----------------------------------------------------+----------+
| emp_no                        | int                                                | NULL     |
| birth_date                    | timestamp                                          | NULL     |
| first_name                    | string                                             | NULL     |
| last_name                     | string                                             | NULL     |
| gender                        | string                                             | NULL     |
| hire_date                     | timestamp                                          | NULL     |
|                               |                                                    |          |
| # Detailed Table Information  |                                                    |          |
| Database                      | data_sources_demo_db                               |          |
| Table                         | employees_csv_external                             |          |
| Owner                         | root                                               |          |
| Created Time                  | Sun Sep 24 17:18:23 UTC 2023                       |          |
| Last Access                   | UNKNOWN                                            |          |
| Created By                    | Spark 3.3.4-IOMETE                                 |          |
| Type                          | EXTERNAL                                           |          |
| Provider                      | csv                                                |          |
| Location                      | gs://iomete-examples/sample-data/csv/employees.csv |          |
| Serde Library                 | org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe |          |
| InputFormat                   | org.apache.hadoop.mapred.SequenceFileInputFormat   |          |
| OutputFormat                  | org.apache.hadoop.hive.ql.io.HiveSequenceFileOutp..|          |
| Storage Properties            | [header=true, inferSchema=true]                    |          |
+-------------------------------+----------------------------------------------------+----------+
*/
```

```sql jsx  title="Read data from the table (CSV file)"
SELECT * FROM data_sources_demo_db.employees_csv_external LIMIT 10;

/* Output:
+---------+------------------------+-------------+------------+---------+------------------------+
| emp_no  |       birth_date       | first_name  | last_name  | gender  |       hire_date        |
+---------+------------------------+-------------+------------+---------+------------------------+
| 10001   | 1953-09-02 00:00:00.0  | Georgi      | Facello    | M       | 1986-06-26 00:00:00.0  |
| 10002   | 1964-06-02 00:00:00.0  | Bezalel     | Simmel     | F       | 1985-11-21 00:00:00.0  |
| 10003   | 1959-12-03 00:00:00.0  | Parto       | Bamford    | M       | 1986-08-28 00:00:00.0  |
| 10004   | 1954-05-01 00:00:00.0  | Chirstian   | Koblick    | M       | 1986-12-01 00:00:00.0  |
| 10005   | 1955-01-21 00:00:00.0  | Kyoichi     | Maliniak   | M       | 1989-09-12 00:00:00.0  |
| 10006   | 1953-04-20 00:00:00.0  | Anneke      | Preusig    | F       | 1989-06-02 00:00:00.0  |
| 10007   | 1957-05-23 00:00:00.0  | Tzvetan     | Zielinski  | F       | 1989-02-10 00:00:00.0  |
| 10008   | 1958-02-19 00:00:00.0  | Saniya      | Kalloufi   | M       | 1994-09-15 00:00:00.0  |
| 10009   | 1952-04-19 00:00:00.0  | Sumant      | Peac       | F       | 1985-02-18 00:00:00.0  |
| 10010   | 1963-06-01 00:00:00.0  | Duangkaew   | Piveteau   | F       | 1989-08-24 00:00:00.0  |
+---------+------------------------+-------------+------------+---------+------------------------+
*/
```

```sql jsx  title="To export data to a CSV file, you can use the following syntax. It will write employees data to the specified path in CSV format"
CREATE TABLE data_sources_demo_db.tmp_csv_external_write
    USING csv
    OPTIONS (path "gs://path/to/employees.csv")
AS SELECT * FROM data_sources_demo_db.employees;
```

```sql jsx  title="You can drop temporary table after the export. It will not delete the CSV file"
DROP TABLE data_sources_demo_db.tmp_csv_external_write;
```

## Manipulating JSON files

```sql jsx  title="Read JSON file from the Cloud Storage"
SELECT  * FROM json.`gs://iomete-examples/sample-data/json/employees.json` LIMIT 10;

/* Output:
+-------------+---------+-------------+---------+-------------+------------+
| birth_date  | emp_no  | first_name  | gender  |  hire_date  | last_name  |
+-------------+---------+-------------+---------+-------------+------------+
| 1953-09-02  | 10001   | Georgi      | M       | 1986-06-26  | Facello    |
| 1964-06-02  | 10002   | Bezalel     | F       | 1985-11-21  | Simmel     |
| 1959-12-03  | 10003   | Parto       | M       | 1986-08-28  | Bamford    |
| 1954-05-01  | 10004   | Chirstian   | M       | 1986-12-01  | Koblick    |
| 1955-01-21  | 10005   | Kyoichi     | M       | 1989-09-12  | Maliniak   |
| 1953-04-20  | 10006   | Anneke      | F       | 1989-06-02  | Preusig    |
| 1957-05-23  | 10007   | Tzvetan     | F       | 1989-02-10  | Zielinski  |
| 1958-02-19  | 10008   | Saniya      | M       | 1994-09-15  | Kalloufi   |
| 1952-04-19  | 10009   | Sumant      | F       | 1985-02-18  | Peac       |
| 1963-06-01  | 10010   | Duangkaew   | F       | 1989-08-24  | Piveteau   |
+-------------+---------+-------------+---------+-------------+------------+
*/

CREATE TABLE data_sources_demo_db.employees_json_external
    USING org.apache.spark.sql.json
    OPTIONS (
        path "gs://iomete-examples/sample-data/json/employees.json"
    );

SELECT * FROM data_sources_demo_db.employees_json_external LIMIT 10;

/* Output:
+-------------+---------+-------------+---------+-------------+------------+
| birth_date  | emp_no  | first_name  | gender  |  hire_date  | last_name  |
+-------------+---------+-------------+---------+-------------+------------+
| 1953-09-02  | 10001   | Georgi      | M       | 1986-06-26  | Facello    |
| 1964-06-02  | 10002   | Bezalel     | F       | 1985-11-21  | Simmel     |
| 1959-12-03  | 10003   | Parto       | M       | 1986-08-28  | Bamford    |
| 1954-05-01  | 10004   | Chirstian   | M       | 1986-12-01  | Koblick    |
| 1955-01-21  | 10005   | Kyoichi     | M       | 1989-09-12  | Maliniak   |
| 1953-04-20  | 10006   | Anneke      | F       | 1989-06-02  | Preusig    |
| 1957-05-23  | 10007   | Tzvetan     | F       | 1989-02-10  | Zielinski  |
| 1958-02-19  | 10008   | Saniya      | M       | 1994-09-15  | Kalloufi   |
| 1952-04-19  | 10009   | Sumant      | F       | 1985-02-18  | Peac       |
| 1963-06-01  | 10010   | Duangkaew   | F       | 1989-08-24  | Piveteau   |
+-------------+---------+-------------+---------+-------------+------------+
*/
```

:::tip
See: [JSON Files doc](/docs/data-sources/json-files)
:::

```sql jsx  title="To export data to a JSON file, you can use the following syntax. It will write employees data to the specified path in JSON format"
CREATE TABLE data_sources_demo_db.tmp_json_external_write
    USING org.apache.spark.sql.json
    OPTIONS (path "gs://path/to/employees.json")
    AS SELECT * FROM data_sources_demo_db.employees;
```

```sql jsx  title="You can drop temporary table after the export. It will not delete the JSON file"
DROP TABLE data_sources_demo_db.tmp_json_external_write;
```

## Manipulating Parquet files

```sql jsx  title="Read Parquet file from the Cloud Storage"
SELECT  * FROM parquet.`gs://iomete-examples/sample-data/parquet/employees.parquet` LIMIT 10;

/* Output:
+---------+-------------+-------------+------------+---------+-------------+
| emp_no  | birth_date  | first_name  | last_name  | gender  |  hire_date  |
+---------+-------------+-------------+------------+---------+-------------+
| 10001   | 1953-09-02  | Georgi      | Facello    | M       | 1986-06-26  |
| 10002   | 1964-06-02  | Bezalel     | Simmel     | F       | 1985-11-21  |
| 10003   | 1959-12-03  | Parto       | Bamford    | M       | 1986-08-28  |
| 10004   | 1954-05-01  | Chirstian   | Koblick    | M       | 1986-12-01  |
| 10005   | 1955-01-21  | Kyoichi     | Maliniak   | M       | 1989-09-12  |
| 10006   | 1953-04-20  | Anneke      | Preusig    | F       | 1989-06-02  |
| 10007   | 1957-05-23  | Tzvetan     | Zielinski  | F       | 1989-02-10  |
| 10008   | 1958-02-19  | Saniya      | Kalloufi   | M       | 1994-09-15  |
| 10009   | 1952-04-19  | Sumant      | Peac       | F       | 1985-02-18  |
| 10010   | 1963-06-01  | Duangkaew   | Piveteau   | F       | 1989-08-24  |
+---------+-------------+-------------+------------+---------+-------------+
*/

CREATE TABLE data_sources_demo_db.employees_parquet_external
    USING org.apache.spark.sql.parquet
    OPTIONS (
    path "gs://iomete-examples/sample-data/parquet/employees.parquet"
);

SELECT * FROM data_sources_demo_db.employees_parquet_external LIMIT 10;

/* Output:
+---------+-------------+-------------+------------+---------+-------------+
| emp_no  | birth_date  | first_name  | last_name  | gender  |  hire_date  |
+---------+-------------+-------------+------------+---------+-------------+
| 10001   | 1953-09-02  | Georgi      | Facello    | M       | 1986-06-26  |
| 10002   | 1964-06-02  | Bezalel     | Simmel     | F       | 1985-11-21  |
| 10003   | 1959-12-03  | Parto       | Bamford    | M       | 1986-08-28  |
| 10004   | 1954-05-01  | Chirstian   | Koblick    | M       | 1986-12-01  |
| 10005   | 1955-01-21  | Kyoichi     | Maliniak   | M       | 1989-09-12  |
| 10006   | 1953-04-20  | Anneke      | Preusig    | F       | 1989-06-02  |
| 10007   | 1957-05-23  | Tzvetan     | Zielinski  | F       | 1989-02-10  |
| 10008   | 1958-02-19  | Saniya      | Kalloufi   | M       | 1994-09-15  |
| 10009   | 1952-04-19  | Sumant      | Peac       | F       | 1985-02-18  |
| 10010   | 1963-06-01  | Duangkaew   | Piveteau   | F       | 1989-08-24  |
+---------+-------------+-------------+------------+---------+-------------+
*/
```

:::tip
See: [Parquet Files doc](/docs/data-sources/parquet-files)
:::

```sql jsx  title="To export data to a Parquet file, you can use the following syntax. It will write employees data to the specified path in Parquet format"
CREATE TABLE data_sources_demo_db.tmp_parquet_external_write
    USING org.apache.spark.sql.parquet
    OPTIONS (path "gs://path/to/employees.parquet")
    AS SELECT * FROM data_sources_demo_db.employees;
```

```sql jsx  title="You can drop temporary table after the export. It will not delete the Parquet file"
DROP TABLE data_sources_demo_db.tmp_parquet_external_write;
```

## Manipulating ORC files

```sql jsx  title="Read ORC file from the Cloud Storage"
SELECT  * FROM orc.`gs://iomete-examples/sample-data/orc/employees.orc` LIMIT 10;

/* Output:
+---------+-------------+-------------+------------+---------+-------------+
| emp_no  | birth_date  | first_name  | last_name  | gender  |  hire_date  |
+---------+-------------+-------------+------------+---------+-------------+
| 10001   | 1953-09-02  | Georgi      | Facello    | M       | 1986-06-26  |
| 10002   | 1964-06-02  | Bezalel     | Simmel     | F       | 1985-11-21  |
| 10003   | 1959-12-03  | Parto       | Bamford    | M       | 1986-08-28  |
| 10004   | 1954-05-01  | Chirstian   | Koblick    | M       | 1986-12-01  |
| 10005   | 1955-01-21  | Kyoichi     | Maliniak   | M       | 1989-09-12  |
| 10006   | 1953-04-20  | Anneke      | Preusig    | F       | 1989-06-02  |
| 10007   | 1957-05-23  | Tzvetan     | Zielinski  | F       | 1989-02-10  |
| 10008   | 1958-02-19  | Saniya      | Kalloufi   | M       | 1994-09-15  |
| 10009   | 1952-04-19  | Sumant      | Peac       | F       | 1985-02-18  |
| 10010   | 1963-06-01  | Duangkaew   | Piveteau   | F       | 1989-08-24  |
+---------+-------------+-------------+------------+---------+-------------+
*/

CREATE TABLE data_sources_demo_db.employees_orc_external
    USING orc
    OPTIONS (
    path "gs://iomete-examples/sample-data/orc/employees.orc"
);

SELECT * FROM data_sources_demo_db.employees_orc_external LIMIT 10;

/* Output:
+---------+-------------+-------------+------------+---------+-------------+
| emp_no  | birth_date  | first_name  | last_name  | gender  |  hire_date  |
+---------+-------------+-------------+------------+---------+-------------+
| 10001   | 1953-09-02  | Georgi      | Facello    | M       | 1986-06-26  |
| 10002   | 1964-06-02  | Bezalel     | Simmel     | F       | 1985-11-21  |
| 10003   | 1959-12-03  | Parto       | Bamford    | M       | 1986-08-28  |
| 10004   | 1954-05-01  | Chirstian   | Koblick    | M       | 1986-12-01  |
| 10005   | 1955-01-21  | Kyoichi     | Maliniak   | M       | 1989-09-12  |
| 10006   | 1953-04-20  | Anneke      | Preusig    | F       | 1989-06-02  |
| 10007   | 1957-05-23  | Tzvetan     | Zielinski  | F       | 1989-02-10  |
| 10008   | 1958-02-19  | Saniya      | Kalloufi   | M       | 1994-09-15  |
| 10009   | 1952-04-19  | Sumant      | Peac       | F       | 1985-02-18  |
| 10010   | 1963-06-01  | Duangkaew   | Piveteau   | F       | 1989-08-24  |
+---------+-------------+-------------+------------+---------+-------------+
*/
```

:::tip
See: [Orc Files doc](/docs/data-sources/orc-files)
:::

```sql jsx  title="To export data to a ORC file, you can use the following syntax. It will write employees data to the specified path in ORC format"

CREATE TABLE data_sources_demo_db.tmp_orc_external_write
    USING orc
    OPTIONS (path "gs://path/to/employees.orc")
    AS SELECT * FROM data_sources_demo_db.employees;
```

```sql jsx  title="You can drop temporary table after the export. It will not delete the ORC file"
DROP TABLE data_sources_demo_db.tmp_orc_external_write;
```

```sql jsx  title="Clean up"
DROP DATABASE data_sources_demo_db CASCADE;
```
