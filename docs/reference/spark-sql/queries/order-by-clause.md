---
title: ORDER BY Clause
description: The ORDER BY clause is used to return the result rows in a sorted manner in the user specified order
slug: /reference/spark-sql/order-by-clause
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

The ORDER BY clause is used to return the result rows in a sorted manner in the user specified order. Unlike the SORT BY clause, this clause guarantees a total order in the output.

---

## Syntax

```sql
ORDER BY { expression [ sort_direction | nulls_sort_order ] [ , ... ] }
```

## Parametres

- **ORDER BY**

  Specifies a comma-separated list of expressions along with optional parameters `sort_direction` and `nulls_sort_order` which are used to sort the rows.

- ** sort_direction**

  Optionally specifies whether to sort the rows in ascending or descending order. The valid values for the sort direction are `ASC` for ascending and `DESC` for descending. If sort direction is not explicitly specified, then by default rows are sorted ascending.

  **Syntax:** `[ ASC | DESC ]`

- ** nulls_sort_order**

  Optionally specifies whether NULL values are returned before/after non-NULL values. If null_sort_order is not specified, then NULLs sort first if sort order is ASC and NULLS sort last if sort order is DESC.

  - If NULLS FIRST is specified, then NULL values are returned first regardless of the sort order.
  - If NULLS LAST is specified, then NULL values are returned last regardless of the sort order.

  **Syntax:** `[ NULLS { FIRST | LAST } ]`

## Examples

```sql
CREATE TABLE person (id INT, name STRING, age INT);
INSERT INTO person VALUES
    (100, 'John', 30),
    (200, 'Mary', NULL),
    (300, 'Mike', 80),
    (400, 'Jerry', NULL),
    (500, 'Dan',  50);

-- Sort rows by age. By default rows are sorted in ascending manner with NULL FIRST.
SELECT name, age FROM person ORDER BY age;
+-----+----+
| name| age|
+-----+----+
|Jerry|null|
| Mary|null|
| John|  30|
|  Dan|  50|
| Mike|  80|
+-----+----+

-- Sort rows in ascending manner keeping null values to be last.
SELECT name, age FROM person ORDER BY age NULLS LAST;
+-----+----+
| name| age|
+-----+----+
| John|  30|
|  Dan|  50|
| Mike|  80|
| Mary|null|
|Jerry|null|
+-----+----+

-- Sort rows by age in descending manner, which defaults to NULL LAST.
SELECT name, age FROM person ORDER BY age DESC;
+-----+----+
| name| age|
+-----+----+
| Mike|  80|
|  Dan|  50|
| John|  30|
|Jerry|null|
| Mary|null|
+-----+----+

-- Sort rows in ascending manner keeping null values to be first.
SELECT name, age FROM person ORDER BY age DESC NULLS FIRST;
+-----+----+
| name| age|
+-----+----+
|Jerry|null|
| Mary|null|
| Mike|  80|
|  Dan|  50|
| John|  30|
+-----+----+

-- Sort rows based on more than one column with each column having different
-- sort direction.
SELECT * FROM person ORDER BY name ASC, age DESC;
+---+-----+----+
| id| name| age|
+---+-----+----+
|500|  Dan|  50|
|400|Jerry|null|
|100| John|  30|
|200| Mary|null|
|300| Mike|  80|
+---+-----+----+
```
