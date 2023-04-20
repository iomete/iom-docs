---
title: Truncate Table
description: Remove all rows from a table or partition(s) with TRUNCATE TABLE statement. Learn syntax, parameters, and examples for easy table truncation in this comprehensive documentation
slug: /spark-sql/truncate-table
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

The TRUNCATE TABLE statement removes all the rows from a table or partition(s).
___

The table must not be a view or an external table. In order to truncate multiple partitions at once, the user can specify the partitions in `partition_spec`. If no `partition_spec` is specified it will remove all partitions in the table.

 **Syntax**

```sql
TRUNCATE TABLE table_name [PARTITION partition_spec];
```



<br/>

 **Parameters**

_`table_name`_ The name of an existing table._`PARTITION ( partition_spec :[ partition_column = partition_col_value, partition_column = partition_col_value, ...] )`_ Specifies one or more partition columns and value pairs. The partition value is optional.

<br/>

**Examples**

```sql
--Create table Student with partition
CREATE TABLE Student ( name String, rollno INT) PARTITIONED BY (age int);

SELECT * from Student;
+-------+---------+------+--+
| name  | rollno  | age  |
+-------+---------+------+--+
| ABC   | 1       | 10   |
| DEF   | 2       | 10   |
| XYZ   | 3       | 12   |
+-------+---------+------+--+

-- Removes all rows from the table in the partion specified
TRUNCATE TABLE Student partition(age=10);

--After truncate execution, records belonging to partition age=10 are removed
SELECT * from Student;
+-------+---------+------+--+
| name  | rollno  | age  |
+-------+---------+------+--+
| XYZ   | 3       | 12   |
+-------+---------+------+--+

-- Removes all rows from the table from all partitions
TRUNCATE TABLE Student;

SELECT * from Student;
+-------+---------+------+--+
| name  | rollno  | age  |
+-------+---------+------+--+
+-------+---------+------+--+
No rows selected 
```
