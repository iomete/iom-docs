---
title: LIMIT Clause
description: limit clause is to ensure that the results are deterministic
last_update: 
  date: 10/04/2022
  author: Vugar Dadalov
---

### Description
The  `LIMIT`  clause is used to constrain the number of rows returned by the <a href="./select">SELECT</a> statement. In general, this clause is used in conjunction with <a href="./order-by-clause">ORDER BY</a> to ensure that the results are deterministic.
[block:api-header]

### Syntax

```sql
LIMIT { ALL | integer_expression }
```

### Parameters

- **ALL**

    If specified, the query returns all the rows. In other words, no limit is applied if this option is specified.

- **integer_expression**

    Specifies a foldable expression that returns an integer.

### Examples

```sql
CREATE TABLE person (name STRING, age INT);
INSERT INTO person VALUES
    ('Zen Hui', 25),
    ('Anil B', 18),
    ('Shone S', 16),
    ('Mike A', 25),
    ('John A', 18),
    ('Jack N', 16);

-- Select the first two rows.
SELECT name, age FROM person ORDER BY name LIMIT 2;
+------+---+
|  name|age|
+------+---+
|Anil B| 18|
|Jack N| 16|
+------+---+

-- Specifying ALL option on LIMIT returns all the rows.
SELECT name, age FROM person ORDER BY name LIMIT ALL;
+-------+---+
|   name|age|
+-------+---+
| Anil B| 18|
| Jack N| 16|
| John A| 18|
| Mike A| 25|
|Shone S| 16|
|Zen Hui| 25|
+-------+---+

-- A function expression as an input to LIMIT.
SELECT name, age FROM person ORDER BY name LIMIT length('SPARK');
+-------+---+
|   name|age|
+-------+---+
| Anil B| 18|
| Jack N| 16|
| John A| 18|
| Mike A| 25|
|Shone S| 16|
+-------+---+

-- A non-foldable expression as an input to LIMIT is not allowed.
SELECT name, age FROM person ORDER BY name LIMIT length(name);
org.apache.spark.sql.AnalysisException: The limit expression must evaluate to a constant value ...
```