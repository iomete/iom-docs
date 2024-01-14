---
title: Sampling Queries
description: The IOMETE Lakehouse Platform with Spark SQL offers a guide on efficiently executing sampling queries, optimizing data exploration and analysis.
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

### Description

The `TABLESAMPLE` statement is used to sample the table. It supports the following sampling methods:

- `TABLESAMPLE(x ROWS)`: Sample the table down to the given number of rows.
- `TABLESAMPLE(x PERCENT)`: Sample the table down to the given percentage. Note that percentages
  are defined as a number between 0 and 100.
- `TABLESAMPLE(BUCKET x OUT OF y)`: Sample the table down to a x out of y fraction.

**Note:** `TABLESAMPLE` returns the approximate number of rows or fraction requested.

### Syntax

```postgresql
TABLESAMPLE ({ integer_expression | decimal_expression } PERCENT)
    | TABLESAMPLE ( integer_expression ROWS )
    | TABLESAMPLE ( BUCKET integer_expression OUT OF integer_expression )
```

### Examples

```sql
SELECT * FROM test;
+--+----+
|id|name|
+--+----+
| 5|Alex|
| 8|Lucy|
| 2|Mary|
| 4|Fred|
| 1|Lisa|
| 9|Eric|
|10|Adam|
| 6|Mark|
| 7|Lily|
| 3|Evan|
+--+----+

SELECT * FROM test TABLESAMPLE (50 PERCENT);
+--+----+
|id|name|
+--+----+
| 5|Alex|
| 2|Mary|
| 4|Fred|
| 9|Eric|
|10|Adam|
| 3|Evan|
+--+----+

SELECT * FROM test TABLESAMPLE (5 ROWS);
+--+----+
|id|name|
+--+----+
| 5|Alex|
| 8|Lucy|
| 2|Mary|
| 4|Fred|
| 1|Lisa|
+--+----+

SELECT * FROM test TABLESAMPLE (BUCKET 4 OUT OF 10);
+--+----+
|id|name|
+--+----+
| 8|Lucy|
| 2|Mary|
| 9|Eric|
| 6|Mark|
+--+----+
```
