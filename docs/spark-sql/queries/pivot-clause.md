---
title: PIVOT Clause
description: The PIVOT clause is used for data perspective based on specific column values, which will be turned to multiple columns used in SELECT clause
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

### Description

The `PIVOT` clause is used for data perspective. We can get the aggregated values based on specific column values, which will be turned to multiple columns used in `SELECT` clause. The `PIVOT` clause can be specified after the table name or subquery.

### Syntax

```sql
PIVOT ( { aggregate_expression [ AS aggregate_expression_alias ] } [ , ... ]
    FOR column_list IN ( expression_list ) )
```

### Parameters

- **aggregate_expression**

    Specifies an aggregate expression (SUM(a), COUNT(DISTINCT b), etc.).

- **aggregate_expression_alias**

    Specifies an alias for the aggregate expression.

- **column_list**

    Contains columns in the FROM clause, which specifies the columns we want to replace with new columns. We 
    can use brackets to surround the columns, such as (c1, c2).

- **expression_list**

    Specifies new columns, which are used to match values in `column_list` as the aggregating condition. We can 
    also add aliases for them.

### Examples

```sql
CREATE TABLE person (id INT, name STRING, age INT, class INT, address STRING);
INSERT INTO person VALUES
    (100, 'John', 30, 1, 'Street 1'),
    (200, 'Mary', NULL, 1, 'Street 2'),
    (300, 'Mike', 80, 3, 'Street 3'),
    (400, 'Dan', 50, 4, 'Street 4');

SELECT * FROM person
    PIVOT (
        SUM(age) AS a, AVG(class) AS c
        FOR name IN ('John' AS john, 'Mike' AS mike)
    );
+------+-----------+---------+---------+---------+---------+
|  id  |  address  | john_a  | john_c  | mike_a  | mike_c  |
+------+-----------+---------+---------+---------+---------+
| 200  | Street 2  | NULL    | NULL    | NULL    | NULL    |
| 100  | Street 1  | 30      | 1.0     | NULL    | NULL    |
| 300  | Street 3  | NULL    | NULL    | 80      | 3.0     |
| 400  | Street 4  | NULL    | NULL    | NULL    | NULL    |
+------+-----------+---------+---------+---------+---------+

SELECT * FROM person
    PIVOT (
        SUM(age) AS a, AVG(class) AS c
        FOR (name, age) IN (('John', 30) AS c1, ('Mike', 40) AS c2)
    );
+------+-----------+-------+-------+-------+-------+
|  id  |  address  | c1_a  | c1_c  | c2_a  | c2_c  |
+------+-----------+-------+-------+-------+-------+
| 200  | Street 2  | NULL  | NULL  | NULL  | NULL  |
| 100  | Street 1  | 30    | 1.0   | NULL  | NULL  |
| 300  | Street 3  | NULL  | NULL  | NULL  | NULL  |
| 400  | Street 4  | NULL  | NULL  | NULL  | NULL  |
+------+-----------+-------+-------+-------+-------+
```