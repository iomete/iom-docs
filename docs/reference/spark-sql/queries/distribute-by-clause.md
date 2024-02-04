---
title: DISTRIBUTE BY Clause
description: The "DISTRIBUTE BY" clause facilitates data repartitioning based on specified input expressions, optimizing data distribution in Apache Spark SQL queries.
slug: /reference/spark-sql/distribute-by-clause
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

The DISTRIBUTE BY clause is used to repartition the data based on the input expressions. Unlike the <a href="./cluster-by-clause">CLUSTER BY</a> clause, this does not sort the data within each partition.

---

## Syntax

```sql
DISTRIBUTE BY { expression [ , ... ] }
```

## Parameters

- **expression**
  Specifies combination of one or more values, operators and SQL functions that results in a value.

## Examples

```sql
CREATE TABLE person (name STRING, age INT);
INSERT INTO person VALUES
    ('Zen Hui', 25),
    ('Anil B', 18),
    ('Shone S', 16),
    ('Mike A', 25),
    ('John A', 18),
    ('Jack N', 16);

-- Reduce the number of shuffle partitions to 2 to illustrate the behavior of `DISTRIBUTE BY`.
-- It's easier to see the clustering and sorting behavior with less number of partitions.
SET spark.sql.shuffle.partitions = 2;

-- Select the rows with no ordering. Please note that without any sort directive, the result
-- of the query is not deterministic. It's included here to just contrast it with the
-- behavior of `DISTRIBUTE BY`. The query below produces rows where age columns are not
-- clustered together.
SELECT age, name FROM person;
+---+-------+
|age|   name|
+---+-------+
| 16|Shone S|
| 25|Zen Hui|
| 16| Jack N|
| 25| Mike A|
| 18| John A|
| 18| Anil B|
+---+-------+

-- Produces rows clustered by age. Persons with same age are clustered together.
-- Unlike `CLUSTER BY` clause, the rows are not sorted within a partition.
SELECT age, name FROM person DISTRIBUTE BY age;
+---+-------+
|age|   name|
+---+-------+
| 25|Zen Hui|
| 25| Mike A|
| 18| John A|
| 18| Anil B|
| 16|Shone S|
| 16| Jack N|
+---+-------+
```
