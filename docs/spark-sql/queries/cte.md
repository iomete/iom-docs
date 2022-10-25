---
title: Common Table Expression (CTE)
description: A common table expression (CTE) defines a temporary result set that a user can reference possibly multiple times within the scope of a SQL statement
slug: common-table-expression-cte
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

## Description

A common table expression (CTE) defines a temporary result set that a user can reference possibly multiple times within the scope of a SQL statement. A CTE is used mainly in a SELECT statement.

## Syntax

```sql
WITH common_table_expression [ , ... ]
```



While `common_table_expression` is defined as

```sql
expression_name [ ( column_name [ , ... ] ) ] [ AS ] ( query )
```



## Parameters

- **expression_name**

    Specifies a name for the common table expression.

- **query**

    A <a href="./select">SELECT</a> statement.

## Examples

```sql
-- CTE with multiple column aliases
WITH t(x, y) AS (SELECT 1, 2)
SELECT * FROM t WHERE x = 1 AND y = 2;
+---+---+
|  x|  y|
+---+---+
|  1|  2|
+---+---+

-- CTE in CTE definition
WITH t AS (
    WITH t2 AS (SELECT 1)
    SELECT * FROM t2
)
SELECT * FROM t;
+---+
|  1|
+---+
|  1|
+---+

-- CTE in subquery
SELECT max(c) FROM (
    WITH t(c) AS (SELECT 1)
    SELECT * FROM t
);
+------+
|max(c)|
+------+
|     1|
+------+

-- CTE in subquery expression
SELECT (
    WITH t AS (SELECT 1)
    SELECT * FROM t
);
+----------------+
|scalarsubquery()|
+----------------+
|               1|
+----------------+

-- CTE in CREATE VIEW statement
CREATE VIEW v AS
    WITH t(a, b, c, d) AS (SELECT 1, 2, 3, 4)
    SELECT * FROM t;
SELECT * FROM v;
+---+---+---+---+
|  a|  b|  c|  d|
+---+---+---+---+
|  1|  2|  3|  4|
+---+---+---+---+

-- If name conflict is detected in nested CTE, then AnalysisException is thrown by default.
-- SET spark.sql.legacy.ctePrecedencePolicy = CORRECTED (which is recommended),
-- inner CTE definitions take precedence over outer definitions.
SET spark.sql.legacy.ctePrecedencePolicy = CORRECTED;
WITH
    t AS (SELECT 1),
    t2 AS (
        WITH t AS (SELECT 2)
        SELECT * FROM t
    )
SELECT * FROM t2;
+---+
|  2|
+---+
|  2|
+---+
```