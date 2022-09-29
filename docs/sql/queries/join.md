---
title: JOIN
---

<!-- <head>
  <title>JOIN</title>
  <meta
    name="description"
    content="JOIN"
  />
</head> -->

### Description

A SQL join is used to combine rows from two relations based on join criteria. The following section describes the overall join syntax and the sub-sections cover different types of joins along with examples.

### Syntax

```sql
relation { [ join_type ] JOIN relation [ join_criteria ] | NATURAL join_type JOIN relation }
```
### Parameters

 - ** relation**

    Specifies the relation to be joined.

 - ** join_type**

    Specifies the join type.

 - ** Syntax**

    ```sql
     [ INNER ] | CROSS | LEFT [ OUTER ] | [ LEFT ] SEMI | RIGHT [ OUTER ] | FULL [ OUTER ] | [ LEFT ] ANTI
    ```

- ** join_criteria**

    Specifies how the rows from one relation will be combined with the rows of another relation.
    
    **Syntax:** 
    ```sql
    ON boolean_expression | USING ( column_name [ , ... ] )
    ```
    
    `boolean_expression`

    Specifies an expression with a return type of boolean.

### Join Types

<h3>Inner Join</h3>

The inner join is the default join in Spark SQL. It selects rows that have matching values in both relations.

**Syntax:**

```sql
relation [ INNER ] JOIN relation [ join_criteria ]
```


<h3>Left Join</h3>

A left join returns all values from the left relation and the matched values from the right relation, or appends NULL if there is no match. It is also referred to as a left outer join.

**Syntax:**

```sql
relation LEFT [ OUTER ] JOIN relation [ join_criteria ]
```


<h3>Right Join</h3>

A right join returns all values from the right relation and the matched values from the left relation, or appends NULL if there is no match. It is also referred to as a right outer join.

**Syntax:**

```sql
relation RIGHT [ OUTER ] JOIN relation [ join_criteria ]
```


<h3>Full Join</h3>

A full join returns all values from both relations, appending NULL values on the side that does not have a match. It is also referred to as a full outer join.

**Syntax:**

```sql
relation FULL [ OUTER ] JOIN relation [ join_criteria ]
```


<h3>Cross Join</h3>

A cross join returns the Cartesian product of two relations.

**Syntax:**

```sql
relation CROSS JOIN relation [ join_criteria ]
```


<h3> Semi Join</h3>

A semi join returns values from the left side of the relation that has a match with the right. It is also referred to as a left semi-join.

**Syntax:**

```sql
relation [ LEFT ] SEMI JOIN relation [ join_criteria ]
```


<h3> Anti Join</h3>

An anti join returns values from the left relation that has no match with the right. It is also referred to as a left anti join.

**Syntax:**

```sql
relation [ LEFT ] ANTI JOIN relation [ join_criteria ]
```

### Examples

```sql
-- Use employee and department tables to demonstrate different type of joins.
SELECT * FROM employee;
+---+-----+------+
| id| name|deptno|
+---+-----+------+
|105|Chloe|     5|
|103| Paul|     3|
|101| John|     1|
|102| Lisa|     2|
|104| Evan|     4|
|106|  Amy|     6|
+---+-----+------+

SELECT * FROM department;
+------+-----------+
|deptno|   deptname|
+------+-----------+
|     3|Engineering|
|     2|      Sales|
|     1|  Marketing|
+------+-----------+

-- Use employee and department tables to demonstrate inner join.
SELECT id, name, employee.deptno, deptname
    FROM employee INNER JOIN department ON employee.deptno = department.deptno;
+---+-----+------+-----------|
| id| name|deptno|   deptname|
+---+-----+------+-----------|
|103| Paul|     3|Engineering|
|101| John|     1|  Marketing|
|102| Lisa|     2|      Sales|
+---+-----+------+-----------|

-- Use employee and department tables to demonstrate left join.
SELECT id, name, employee.deptno, deptname
    FROM employee LEFT JOIN department ON employee.deptno = department.deptno;
+---+-----+------+-----------|
| id| name|deptno|   deptname|
+---+-----+------+-----------|
|105|Chloe|     5|       NULL|
|103| Paul|     3|Engineering|
|101| John|     1|  Marketing|
|102| Lisa|     2|      Sales|
|104| Evan|     4|       NULL|
|106|  Amy|     6|       NULL|
+---+-----+------+-----------|

-- Use employee and department tables to demonstrate right join.
SELECT id, name, employee.deptno, deptname
    FROM employee RIGHT JOIN department ON employee.deptno = department.deptno;
+---+-----+------+-----------|
| id| name|deptno|   deptname|
+---+-----+------+-----------|
|103| Paul|     3|Engineering|
|101| John|     1|  Marketing|
|102| Lisa|     2|      Sales|
+---+-----+------+-----------|

-- Use employee and department tables to demonstrate full join.
SELECT id, name, employee.deptno, deptname
    FROM employee FULL JOIN department ON employee.deptno = department.deptno;
+---+-----+------+-----------|
| id| name|deptno|   deptname|
+---+-----+------+-----------|
|101| John|     1|  Marketing|
|106|  Amy|     6|       NULL|
|103| Paul|     3|Engineering|
|105|Chloe|     5|       NULL|
|104| Evan|     4|       NULL|
|102| Lisa|     2|      Sales|
+---+-----+------+-----------|

-- Use employee and department tables to demonstrate cross join.
SELECT id, name, employee.deptno, deptname FROM employee CROSS JOIN department;
+---+-----+------+-----------|
| id| name|deptno|   deptname|
+---+-----+------+-----------|
|105|Chloe|     5|Engineering|
|105|Chloe|     5|  Marketing|
|105|Chloe|     5|      Sales|
|103| Paul|     3|Engineering|
|103| Paul|     3|  Marketing|
|103| Paul|     3|      Sales|
|101| John|     1|Engineering|
|101| John|     1|  Marketing|
|101| John|     1|      Sales|
|102| Lisa|     2|Engineering|
|102| Lisa|     2|  Marketing|
|102| Lisa|     2|      Sales|
|104| Evan|     4|Engineering|
|104| Evan|     4|  Marketing|
|104| Evan|     4|      Sales|
|106|  Amy|     4|Engineering|
|106|  Amy|     4|  Marketing|
|106|  Amy|     4|      Sales|
+---+-----+------+-----------|

-- Use employee and department tables to demonstrate semi join.
SELECT * FROM employee SEMI JOIN department ON employee.deptno = department.deptno;
+---+-----+------+
| id| name|deptno|
+---+-----+------+
|103| Paul|     3|
|101| John|     1|
|102| Lisa|     2|
+---+-----+------+

-- Use employee and department tables to demonstrate anti join.
SELECT * FROM employee ANTI JOIN department ON employee.deptno = department.deptno;
+---+-----+------+
| id| name|deptno|
+---+-----+------+
|105|Chloe|     5|
|104| Evan|     4|
|106|  Amy|     6|
+---+-----+------+
```