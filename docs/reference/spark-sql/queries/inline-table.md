---
title: Inline Table
description: An inline table is a transient table generated through a VALUES clause, providing a convenient way to create temporary data structures in SQL.
slug: /reference/spark-sql/inline-table
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

### Description

An inline table is a temporary table created using a VALUES clause.

### Syntax

```sql
VALUES ( expression [ , ... ] ) [ table_alias ]
```

### Parameters

- **expression**

  Specifies a combination of one or more values, operators and SQL functions that results in a value.

- **table_alias**

  Specifies a temporary name with an optional column name list.

  **Syntax:** `[ AS ] table_name [ ( column_name [ , ... ] ) ]`

### Examples

```sql
-- single row, without a table alias
SELECT * FROM VALUES ("one", 1);
+----+----+
|col1|col2|
+----+----+
| one|   1|
+----+----+

-- three rows with a table alias
SELECT * FROM VALUES ("one", 1), ("two", 2), ("three", null) AS data(a, b);
+-----+----+
|    a|   b|
+-----+----+
|  one|   1|
|  two|   2|
|three|null|
+-----+----+

-- complex types with a table alias
SELECT * FROM VALUES ("one", array(0, 1)), ("two", array(2, 3)) AS data(a, b);
+---+------+
|  a|     b|
+---+------+
|one|[0, 1]|
|two|[2, 3]|
+---+------+
```
