---
title: Table-valued Functions (TVF)
description: A table-valued function (TVF) is a function that yields a relation or a set of rows as its result, providing a mechanism for querying and retrieving data.
slug: /reference/spark-sql/table-valued-functions-tvf
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

A table-valued function (TVF) is a function that returns a relation or a set of rows. There are two types of TVFs in Spark SQL:

- a TVF that can be specified in a FROM clause, e.g. range;
- a TVF that can be specified in SELECT/LATERAL VIEW clauses, e.g. explode.

---

## Supported Table-valued Functions

### TVFs that can be specified in a FROM clause:

| Function                                      | Argument Type(s)      | Description                                                                                                                                                                         |
| :-------------------------------------------- | :-------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **range** ( end )                             | Long                  | Creates a table with a single _LongType_ column named id, containing rows in a range from 0 to end (exclusive) with step value 1.                                                   |
| **range** ( start, end )                      | Long, Long            | Creates a table with a single _LongType_ column named id,containing rows in a range from start to end (exclusive) with step value 1.                                                |
| **range** ( start, end, step )                | Long, Long, Long      | Creates a table with a single _LongType_ column named id, containing rows in a range from start to end (exclusive) with step value.                                                 |
| **range** ( start, end, step, numPartitions ) | Long, Long, Long, Int | Creates a table with a single _LongType_ column named id,containing rows in a range from start to end (exclusive) with step value, with partition number _numPartitions_ specified. |

### TVFs that can be specified in SELECT/LATERAL VIEW clauses:

| Function                                          | Argument Type(s) | Description                                                                                                                                                                                                                                                                                       |
| :------------------------------------------------ | :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **explode**<br/>( _expr_ )                        | Array/Map        | Separates the elements of array _expr_ into multiple rows, or the elements of map expr into multiple rows and columns. Unless specified otherwise, uses the default column name col for elements of the array or key and value for the elements of the map.                                       |
| **explode_outer**<br/>( _expr_ )                  | Array/Map        | Separates the elements of array _expr_ into multiple rows, or the elements of map _expr_ into multiple rows and columns. Unless specified otherwise, uses the default column name col for elements of the array or key and value for the elements of the map.                                     |
| **inline**<br/>( _expr_ )                         | Expression       | Explodes an array of structs into a table. Uses column names col1, col2, etc. by default unless specified otherwise.                                                                                                                                                                              |
| **inline_outer**<br/>( _expr_ )                   | Expression       | Explodes an array of structs into a table. Uses column names col1, col2, etc. by default unless specified otherwise.                                                                                                                                                                              |
| **posexplode**<br/>( _expr_ )                     | Array/Map        | Separates the elements of array _expr_ into multiple rows with positions, or the elements of map _expr_ into multiple rows and columns with positions. Unless specified otherwise, uses the column name pos for position, col for elements of the array or key and value for elements of the map. |
| **posexplode_outer** <br/>( _expr_ )              | Array/Map        | Separates the elements of array _expr_ into multiple rows with positions, or the elements of map _expr_ into multiple rows and columns with positions. Unless specified otherwise, uses the column name pos for position, col for elements of the array or key and value for elements of the map. |
| **stack**<br/>( _n, expr1,…, exprk_ )             | Seq[Expression]  | Separates _expr1, …, exprk_ into n rows. Uses column names col0, col1, etc. by default unless specified otherwise.                                                                                                                                                                                |
| **json_tuple**<br/>( _jsonStr, p1, p2, …, pn_ )   | Seq[Expression]  | Returns a tuple like the function _get_json_object_, but it takes multiple names. All the input parameters and output column types are string.                                                                                                                                                    |
| **parse_url**<br/>( _url, partToExtract[, key]_ ) | Seq[Expression]  | Extracts a part from a URL.                                                                                                                                                                                                                                                                       |

## Examples

```sql
-- range call with end
SELECT * FROM range(6 + cos(3));
+---+
| id|
+---+
|  0|
|  1|
|  2|
|  3|
|  4|
+---+

-- range call with start and end
SELECT * FROM range(5, 10);
+---+
| id|
+---+
|  5|
|  6|
|  7|
|  8|
|  9|
+---+

-- range call with numPartitions
SELECT * FROM range(0, 10, 2, 200);
+---+
| id|
+---+
|  0|
|  2|
|  4|
|  6|
|  8|
+---+

-- range call with a table alias
SELECT * FROM range(5, 8) AS test;
+---+
| id|
+---+
|  5|
|  6|
|  7|
+---+

SELECT explode(array(10, 20));
+---+
|col|
+---+
| 10|
| 20|
+---+

SELECT inline(array(struct(1, 'a'), struct(2, 'b')));
+----+----+
|col1|col2|
+----+----+
|   1|   a|
|   2|   b|
+----+----+

SELECT posexplode(array(10,20));
+---+---+
|pos|col|
+---+---+
|  0| 10|
|  1| 20|
+---+---+

SELECT stack(2, 1, 2, 3);
+----+----+
|col0|col1|
+----+----+
|   1|   2|
|   3|null|
+----+----+

SELECT json_tuple('{"a":1, "b":2}', 'a', 'b');
+---+---+
| c0| c1|
+---+---+
|  1|  2|
+---+---+

SELECT parse_url('http://spark.apache.org/path?query=1', 'HOST');
+-----------------------------------------------------+
|parse_url(http://spark.apache.org/path?query=1, HOST)|
+-----------------------------------------------------+
|                                     spark.apache.org|
+-----------------------------------------------------+

-- Use explode in a LATERAL VIEW clause
CREATE TABLE test (c1 INT);
INSERT INTO test VALUES (1);
INSERT INTO test VALUES (2);
SELECT * FROM test LATERAL VIEW explode (ARRAY(3,4)) AS c2;
+--+--+
|c1|c2|
+--+--+
| 1| 3|
| 1| 4|
| 2| 3|
| 2| 4|
+--+--+
```
