---
title: Insert Overwrite
description: The "INSERT OVERWRITE" statement serves to replace the existing data in a table with updated values.
slug: /reference/spark-sql/insert-overwrite
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

The `INSERT OVERWRITE` statement overwrites the existing data in the table using the new values. The inserted rows can be specified by value expressions or result from a query

---

**Syntax**

```mysql
INSERT OVERWRITE [ TABLE ] table_name
    [ PARTITION ( partition_col_name [ = partition_col_val ] [ , ... ] ) [ IF NOT EXISTS ] ]
    { { VALUES ( { value | NULL } [ , ... ] ) [ , ( ... ) ] } | query }
```

**Parameters**

_`table_name`_ The name of an existing table._`PARTITION ( partition_col_name [ = partition_col_val ] [ , ... ] )`_ Specifies one or more partition column and value pairs. The partition value is optional._`VALUES ( { value | NULL } [ , ... ] ) [ , ( ... ) ]`_ Specifies the values to be inserted. Either an explicitly specified value or a NULL can be inserted. A comma must be used to seperate each value in the clause. More than one set of values can be specified to insert multiple rows._`query`_ A query that produces the rows to be inserted. It can be in one of following formats:

- a `SELECT` statement
- a `TABLE` statement
- a `FROM` statement

**Examples**

### Insert Using a VALUES Clause

```sql
 -- Assuming the students table has already been created and populated.
 SELECT * FROM students;

     + -------------- + ------------------------------ + -------------- +
     | name           | address                        | student_id     |
     + -------------- + ------------------------------ + -------------- +
     | Amy Smith      | 123 Park Ave, San Jose         | 111111         |
     + -------------- + ------------------------------ + -------------- +
     | Bob Brown      | 456 Taylor St, Cupertino       | 222222         |
     + -------------- + ------------------------------ + -------------- +
     | Cathy Johnson  | 789 Race Ave, Palo Alto        | 333333         |
     + -------------- + ------------------------------ + -------------- +
     | Dora Williams  | 134 Forest Ave, Melo Park      | 444444         |
     + -------------- + ------------------------------ + -------------- +
     | Fleur Laurent  | 345 Copper St, London          | 777777         |
     + -------------- + ------------------------------ + -------------- +
     | Gordon Martin  | 779 Lake Ave, Oxford           | 888888         |
     + -------------- + ------------------------------ + -------------- +
     | Helen Davis    | 469 Mission St, San Diego      | 999999         |
     + -------------- + ------------------------------ + -------------- +
     | Jason Wang     | 908 Bird St, Saratoga          | 121212         |
     + -------------- + ------------------------------ + -------------- +

 INSERT OVERWRITE students
     VALUES ('Ashua Hill', '456 Erica Ct, Cupertino', 111111),
            ('Brian Reed', '723 Kern Ave, Palo Alto', 222222);

 SELECT * FROM students;

     + -------------- + ------------------------------ + -------------- +
     | name           | address                        | student_id     |
     + -------------- + ------------------------------ + -------------- +
     | Ashua Hill     | 456 Erica Ct, Cupertino        | 111111         |
     + -------------- + ------------------------------ + -------------- +
     | Brian Reed     | 723 Kern Ave, Palo Alto        | 222222         |
     + -------------- + ------------------------------ + -------------- +
```

### Insert Using a SELECT Statement

```sql
 -- Assuming the persons table has already been created and populated.
 SELECT * FROM persons;

      + -------------- + ------------------------------ + -------------- +
      | name           | address                        | ssn            |
      + -------------- + ------------------------------ + -------------- +
      | Dora Williams  | 134 Forest Ave, Melo Park      | 123456789      |
      + -------------- + ------------------------------ + -------------- +
      | Eddie Davis    | 245 Market St, Milpitas        | 345678901      |
      + -------------- + ------------------------------ + ---------------+

 INSERT OVERWRITE students PARTITION (student_id = 222222)
     SELECT name, address FROM persons WHERE name = "Dora Williams";

 SELECT * FROM students;

      + -------------- + ------------------------------ + -------------- +
      | name           | address                        | student_id     |
      + -------------- + ------------------------------ + -------------- +
      | Ashua Hill     | 456 Erica Ct, Cupertino        | 111111         |
      + -------------- + ------------------------------ + -------------- +
      | Dora Williams  | 134 Forest Ave, Melo Park      | 222222         |
      + -------------- + ------------------------------ + -------------- +
```

### Insert Using a TABLE Statement

```sql
 -- Assuming the visiting_students table has already been created and populated.
 SELECT * FROM visiting_students;

      + -------------- + ------------------------------ + -------------- +
      | name           | address                        | student_id     |
      + -------------- + ------------------------------ + -------------- +
      | Fleur Laurent  | 345 Copper St, London          | 777777         |
      + -------------- + ------------------------------ + -------------- +
      | Gordon Martin  | 779 Lake Ave, Oxford           | 888888         |
      + -------------- + ------------------------------ + -------------- +

 INSERT OVERWRITE students TABLE visiting_students;

 SELECT * FROM students;

      + -------------- + ------------------------------ + -------------- +
      | name           | address                        | student_id     |
      + -------------- + ------------------------------ + -------------- +
      | Fleur Laurent  | 345 Copper St, London          | 777777         |
      + -------------- + ------------------------------ + -------------- +
      | Gordon Martin  | 779 Lake Ave, Oxford           | 888888         |
      + -------------- + ------------------------------ + -------------- +
```

### Insert Using a FROM Statement

```sql
 -- Assuming the applicants table has already been created and populated.
 SELECT * FROM applicants;

     + -------------- + ------------------------------ + -------------- + -------------- +
     | name           | address                        | student_id     | qualified      |
     + -------------- + ------------------------------ + -------------- + -------------- +
     | Helen Davis    | 469 Mission St, San Diego      | 999999         | true           |
     + -------------- + ------------------------------ + -------------- + -------------- +
     | Ivy King       | 367 Leigh Ave, Santa Clara     | 101010         | false          |
     + -------------- + ------------------------------ + -------------- + -------------- +
     | Jason Wang     | 908 Bird St, Saratoga          | 121212         | true           |
     + -------------- + ------------------------------ + -------------- + -------------- +

 INSERT OVERWRITE students;
      FROM applicants SELECT name, address, id applicants WHERE qualified = true;

 SELECT * FROM students;

     + -------------- + ------------------------------ + -------------- +
     | name           | address                        | student_id     |
     + -------------- + ------------------------------ + -------------- +
     | Helen Davis    | 469 Mission St, San Diego      | 999999         |
     + -------------- + ------------------------------ + -------------- +
     | Jason Wang     | 908 Bird St, Saratoga          | 121212         |
     + -------------- + ------------------------------ + -------------- +
```
