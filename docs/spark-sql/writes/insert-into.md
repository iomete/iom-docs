---
title: Insert Into
description: This documentation explains how to inserts new rows into a table
slug: /spark-sql/insert-into
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

The INSERT INTO statement inserts new rows into a table. The inserted rows can be specified by value expressions or result from a query.

The table must not be a view or an external table. In order to truncate multiple partitions at once, the user can specify the partitions in partition_spec. If no partition_spec is specified it will remove all partitions in the table.

## **Syntax**

```sql
INSERT INTO [ TABLE ] table_identifier [ partition_spec ]
    { VALUES ( { value | NULL } [ , ... ] ) [ , ( ... ) ] | query }
```

:::info
When you INSERT INTO a table schema enforcement and evolution is supported. If a column’s data type cannot be safely cast to a table’s data type, a runtime exception is thrown. If **schema evolution** is enabled, new columns can exist as the last columns of your schema (or nested columns) for the schema to evolve.
:::

<br/>

## Parameters

- **table_identifier**

  - `[database_name.] table_name`: A table name, optionally qualified with a database name.
    **Syntax:** `PARTITION ( partition_col_name  = partition_col_val [ , ... ] )`

- **VALUES ( \{ value | NULL } [ , … ] ) [ , ( … ) ]**
  The values to be inserted. Either an explicitly specified value or a `NULL`. Use a comma to separate each value in the clause. You can specify more than one set of values to insert multiple rows.

- **query**
  - A `SELECT` statement
  - A `TABLE` statement
  - A `FROM` statement

<br/>

---

<br/>

## Single row insert using a VALUES clause

Here's the shortest and easiest way to insert data into a table. You only have to specify the values, but you have to pass all values `in order`. If you have 10 columns, you have to specify 10 values.

```sql
-- CREATE TABLE session (id INT, start_date TIMESTAMP, end_date TIMESTAMP, category INT) using delta;
-- assuming the sessions table has only four columns:
-- id, start_date, and end_date, and category, in that order
INSERT INTO sessions
VALUES (1, '2020-04-02 14:05:15.400', '2020-04-03 14:25:15.400', 1);

+-----+------------------------+--------------------------+-----------+
| id  |       start_date       |         end_date         | category  |
+-----+------------------------+--------------------------+-----------+
| 1   | 2020-04-02 14:05:15.4  | 2020-04-03 14:25:15.4    | 1         |
+-----+------------------------+--------------------------+-----------+
```

To skip some columns use **NULL** in-place of that column:

```sql
INSERT INTO sessions
VALUES (2, '2020-04-02 14:05:15.400', '2020-04-04 16:57:53.653', NULL );

+-----+------------------------+--------------------------+-----------+
| id  |       start_date       |         end_date         | category  |
+-----+------------------------+--------------------------+-----------+
| 2   | 2020-04-02 14:05:15.4  | 2020-04-04 16:57:53.653  | NULL      |
+-----+------------------------+--------------------------+-----------+
```

<br/>

---

<br/>

## Multi-row insert using a VALUES clause

You can insert multiple rows in one `INSERT` statement by having multiple sets of values enclosed in parentheses:

```sql
INSERT INTO sessions VALUES
(1, '2020-04-02 14:05:15.400', '2020-04-03 14:25:15.400', 1),
(2, '2020-04-02 14:05:15.400', '2020-04-04 16:57:53.653', NULL ),
(3, '2020-04-02 14:05:15.400', '2020-04-04 16:57:53.653', 3 );

+-----+------------------------+--------------------------+-----------+
| id  |       start_date       |         end_date         | category  |
+-----+------------------------+--------------------------+-----------+
| 1   | 2020-04-02 14:05:15.4  | 2020-04-03 14:25:15.4    | 1         |
| 2   | 2020-04-02 14:05:15.4  | 2020-04-04 16:57:53.653  | NULL      |
| 3   | 2020-04-02 14:05:15.4  | 2020-04-04 16:57:53.653  | 3         |
+-----+------------------------+--------------------------+-----------+
```

<br/>

---

<br/>

## Multi-row insert using a SELECT statement

You can insert multiple rows in one `INSERT` statement by selecting data from a different table. This is similar to a `CREATE TABLE AS` syntax :

```sql
CREATE TABLE sessions_dm (id INT, start_date TIMESTAMP, end_date TIMESTAMP, category INT) using delta;


INSERT INTO sessions_dm
SELECT *
FROM sessions
WHERE category IS NOT NULL;

-- if you want to append whole sessions table into sessions_dm table. You can use:
-- INSERT INTO sessions_dm TABLE category;


DESC TABLE sessions_dm;

+-------------+------------+----------+
|  col_name   | data_type  | comment  |
+-------------+------------+----------+
| id          | int        | NULL     |
| start_date  | timestamp  | NULL     |
| end_date    | timestamp  | NULL     |
| category    | int        | NULL     |
+-------------+------------+----------+

SELECT * FROM sessions_dm;

+-----+------------------------+--------------------------+-----------+
| id  |       start_date       |         end_date         | category  |
+-----+------------------------+--------------------------+-----------+
| 1   | 2020-04-02 14:05:15.4  | 2020-04-03 14:25:15.4    | 1         |
| 3   | 2020-04-02 14:05:15.4  | 2020-04-04 16:57:53.653  | 3         |
+-----+------------------------+--------------------------+-----------+
```

To append the whole `sessions` table into `sessions_dm` table. You can use:

```sql
-- appends sessions data to sessions_dm
INSERT INTO sessions_dm TABLE sessions;
```

Or using a FROM statement

```sql
-- appends selected data to sessions_dm
INSERT INTO sessions_dm
     FROM sessions
     SELECT id, start_date, end_date, category WHERE category IS NOT NULL;
```

You can also use `CREATE TABLE AS` with a `SELECT` command to copy data from an existing table:

```sql
CREATE TABLE sessions_dm AS
SELECT *
FROM sessions
WHERE category IS NOT NULL ;

DESC TABLE sessions_dm;

+-------------+------------+----------+
|  col_name   | data_type  | comment  |
+-------------+------------+----------+
| id          | int        | NULL     |
| start_date  | timestamp  | NULL     |
| end_date    | timestamp  | NULL     |
| category    | int        | NULL     |
+-------------+------------+----------+

SELECT * FROM sessions_dm;

+-----+------------------------+--------------------------+-----------+
| id  |       start_date       |         end_date         | category  |
+-----+------------------------+--------------------------+-----------+
| 1   | 2020-04-02 14:05:15.4  | 2020-04-03 14:25:15.4    | 1         |
| 3   | 2020-04-02 14:05:15.4  | 2020-04-04 16:57:53.653  | 3         |
+-----+------------------------+--------------------------+-----------+
```

<br/>

---

<br/>

## Insert with a column list

```sql
INSERT INTO students (address, name, student_id) VALUES
    ('Hangzhou, China', 'Kent Yao', 11215016);

SELECT * FROM students WHERE name = 'Kent Yao';
+---------+----------------------+----------+
|     name|               address|student_id|
+---------+----------------------+----------+
|Kent Yao |       Hangzhou, China|  11215016|
+---------+----------------------+----------+
```

<br/>

---

<br/>

## Insert with both a partition spec and a column list

```sql
INSERT INTO students PARTITION (student_id = 11215017) (address, name) VALUES
    ('Hangzhou, China', 'Kent Yao Jr.');

SELECT * FROM students WHERE student_id = 11215017;
+------------+----------------------+----------+
|        name|               address|student_id|
+------------+----------------------+----------+
|Kent Yao Jr.|       Hangzhou, China|  11215017|
+------------+----------------------+----------+
```
