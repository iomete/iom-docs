---
title: Set Operators
description: Set operators are employed to merge two input relations into a unified result, facilitating the combination of data sets in a single operation.
slug: /reference/spark-sql/set-operators
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

Set operators are used to combine two input relations into a single one. Spark SQL supports three types of set operators:

- `EXCEPT or MINUS`
- `INTERSECT`
- `UNION`

Note that input relations must have the same number of columns and compatible data types for the respective columns.

---

## EXCEPT

`EXCEPT` and `EXCEPT ALL` return the rows that are found in one relation but not the other. EXCEPT (alternatively, EXCEPT DISTINCT) takes only distinct rows while `EXCEPT ALL` does not remove duplicates from the result rows. Note that `MINUS` is an alias for `EXCEPT`.

### Syntax

```sql
[ ( ] relation [ ) ] EXCEPT | MINUS [ ALL | DISTINCT ] [ ( ] relation [ ) ]
```

### Examples

```sql
-- Use number1 and number2 tables to demonstrate set operators in this page.
SELECT * FROM number1;
+---+
|  c|
+---+
|  3|
|  1|
|  2|
|  2|
|  3|
|  4|
+---+

SELECT * FROM number2;
+---+
|  c|
+---+
|  5|
|  1|
|  2|
|  2|
+---+

SELECT c FROM number1 EXCEPT SELECT c FROM number2;
+---+
|  c|
+---+
|  3|
|  4|
+---+

SELECT c FROM number1 MINUS SELECT c FROM number2;
+---+
|  c|
+---+
|  3|
|  4|
+---+

SELECT c FROM number1 EXCEPT ALL (SELECT c FROM number2);
+---+
|  c|
+---+
|  3|
|  3|
|  4|
+---+

SELECT c FROM number1 MINUS ALL (SELECT c FROM number2);
+---+
|  c|
+---+
|  3|
|  3|
|  4|
+---+
```

## INTERSECT

`INTERSECT` and `INTERSECT ALL` return the rows that are found in both relations. `INTERSECT`(alternatively, `INTERSECT DISTINCT`) takes only distinct rows while `INTERSECT ALL` does not remove duplicates from the result rows.

### Syntax

```sql
[ ( ] relation [ ) ] INTERSECT [ ALL | DISTINCT ] [ ( ] relation [ ) ]
```

### Examples

```sql
(SELECT c FROM number1) INTERSECT (SELECT c FROM number2);
+---+
|  c|
+---+
|  1|
|  2|
+---+

(SELECT c FROM number1) INTERSECT DISTINCT (SELECT c FROM number2);
+---+
|  c|
+---+
|  1|
|  2|
+---+

(SELECT c FROM number1) INTERSECT ALL (SELECT c FROM number2);
+---+
|  c|
+---+
|  1|
|  2|
|  2|
+---+
```

## UNION

`UNION` and `UNION ALL` return the rows that are found in either relation. `UNION` (alternatively, `UNION DISTINCT`) takes only distinct rows while `UNION ALL` does not remove duplicates from the result rows.

### Syntax

```sql
[ ( ] relation [ ) ] UNION [ ALL | DISTINCT ] [ ( ] relation [ ) ]
```

### Examples

```sql
(SELECT c FROM number1) UNION (SELECT c FROM number2);
+---+
|  c|
+---+
|  1|
|  3|
|  5|
|  4|
|  2|
+---+

(SELECT c FROM number1) UNION DISTINCT (SELECT c FROM number2);
+---+
|  c|
+---+
|  1|
|  3|
|  5|
|  4|
|  2|
+---+

SELECT c FROM number1 UNION ALL (SELECT c FROM number2);
+---+
|  c|
+---+
|  3|
|  1|
|  2|
|  2|
|  3|
|  4|
|  5|
|  1|
|  2|
|  2|
+---+
```
