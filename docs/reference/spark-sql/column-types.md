---
title: Column Types
description: IOMETE Column Types are BOOLEAN, BYTE, SHORT, INT, LONG, FLOAT, DOUBLE, DATE, TIMESTAMP, STRING, BINARY, DECIMAL, ARRAY, STRUCT, MAP. Examples of usage and range of values
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

IOMETE supports the following column types:

| Type Name                 | Description                                                                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BOOLEAN                   | Represents boolean values                                                                                                                                                                           |
| BYTE, TINYINT             | Represents 1-byte signed integer numbers. The range of numbers is from -128 to 127                                                                                                                  |
| SHORT, SMALLINT           | Represents 2-byte signed integer numbers. The range of numbers is from -32768 to 32767                                                                                                              |
| INT, INTEGER              | Represents 4-byte signed integer numbers. The range of numbers is from -2147483648 to 2147483647                                                                                                    |
| LONG, BIGINT              | Represents 8-byte signed integer numbers. The range of numbers is from -9223372036854775808 to 9223372036854775807                                                                                  |
| FLOAT, REAL               | Represents 4-byte single-precision floating-point numbers                                                                                                                                           |
| DOUBLE                    | Represents 8-byte double-precision floating-point numbers                                                                                                                                           |
| DATE                      | Represents values comprising values of fields year, month, and day, without a time-zone                                                                                                             |
| TIMESTAMP                 | Represents values comprising values of fields year, month, day, hour, minute, and second, with the session local time-zone. The timestamp value represents an absolute point in time                |
| STRING                    | Represents character string values                                                                                                                                                                  |
| BINARY                    | Represents byte sequence values                                                                                                                                                                     |
| DECIMAL, DEC, NUMERIC     | Represents arbitrary-precision signed decimal numbers. Backed internally by java.math.BigDecimal. A BigDecimal consists of an arbitrary precision integer unscaled value and a 32-bit integer scale |
| ARRAY                     | Represents values comprising a sequence of elements with the type of elementType                                                                                                                    |
| STRUCT\<name1: type, ...> | Represents values with the structure described by a sequence of name:type pairs                                                                                                                     |
| MAP\<keytype, valuetype>  | Represents values comprising a set of key-value pairs. The data type of keys is described by keyType and the data type of values is described by valueType                                          |

## Examples

### Bool type

```sql
CREATE TABLE IF NOT EXISTS bool_types (id INT, bool_col BOOLEAN) USING delta;

INSERT INTO bool_types VALUES (1, false);
INSERT INTO bool_types VALUES (2, true);
INSERT INTO bool_types VALUES (3, false);
INSERT INTO bool_types VALUES (4, true);
INSERT INTO bool_types VALUES (5, 0);
INSERT INTO bool_types VALUES (6, 1);
INSERT INTO bool_types VALUES (7, '');
INSERT INTO bool_types VALUES (8, 'some val');
INSERT INTO bool_types VALUES (null);

select * from bool_types order by id;

+-----+-----------+
| id  | bool_col  |
+-----+-----------+
| 1   | false     |
| 2   | true      |
| 3   | false     |
| 4   | true      |
| 5   | false     |
| 6   | true      |
| 7   | NULL      |
| 8   | NULL      |
+-----+-----------+
```

### Integer types

```sql
CREATE TABLE IF NOT EXISTS integer_types (id INT, byte_col BYTE, short_col SHORT, int_col INT, long_col LONG) USING delta;

INSERT INTO integer_types VALUES (1, 1, 1, 1, 1);
--min numbers
INSERT INTO integer_types VALUES (2, -128, -32768, -2147483648, -9223372036854775808);
--max number
INSERT INTO integer_types VALUES (3, 127, 32767, 2147483647, 9223372036854775807);

INSERT INTO bool_types VALUES (2, true);
INSERT INTO bool_types VALUES (3, false);
INSERT INTO bool_types VALUES (4, true);
INSERT INTO bool_types VALUES (5, 0);
INSERT INTO bool_types VALUES (6, 1);
INSERT INTO bool_types VALUES (7, '');
INSERT INTO bool_types VALUES (8, 'some val');
INSERT INTO bool_types VALUES (null);


select * from integer_types order by id;

+-----+-----------+------------+--------------+-----------------------+
| id  | byte_col  | short_col  |   int_col    |       long_col        |
+-----+-----------+------------+--------------+-----------------------+
| 1   | 1         | 1          | 1            | 1                     |
| 2   | -128      | -32768     | -2147483648  | -9223372036854775808  |
| 3   | 127       | 32767      | 2147483647   | 9223372036854775807   |
+-----+-----------+------------+--------------+-----------------------+
```

### Floating point numbers

```sql
CREATE TABLE IF NOT EXISTS floating_point_number_types (id INT, float_col FLOAT, double_col DOUBLE) USING delta;

INSERT INTO floating_point_number_types VALUES (1, 1, 1);
INSERT INTO floating_point_number_types VALUES (2, 1.12345, 1.12345);
-- Positive/Negative Infinity and NaN values
INSERT INTO floating_point_number_types VALUES (3, double('infinity'),double('infinity'));
INSERT INTO floating_point_number_types VALUES (4, double('-infinity'),double('-infinity'));
INSERT INTO floating_point_number_types VALUES (5, double('inf'), double('inf'));
INSERT INTO floating_point_number_types VALUES (6, double('-inf'), double('-inf'));
INSERT INTO floating_point_number_types VALUES (7, double('NaN'), double('NaN'));


select * from floating_point_number_types order by id;

+-----+------------+-------------+
| id  | float_col  | double_col  |
+-----+------------+-------------+
| 1   | 1.0        | 1.0         |
| 2   | 1.12345    | 1.12345     |
| 3   | Infinity   | Infinity    |
| 4   | -Infinity  | -Infinity   |
| 5   | Infinity   | Infinity    |
| 6   | -Infinity  | -Infinity   |
| 7   | NaN        | NaN         |
+-----+------------+-------------+
```

### Date types

```sql
CREATE TABLE IF NOT EXISTS date_types (id INT, date_col DATE, ts_col TIMESTAMP) USING delta;

INSERT INTO date_types VALUES (1, '2020-01-01', current_timestamp());
INSERT INTO date_types VALUES (2, '2020-01-31', current_timestamp());

select * from date_types order by id;

+-----+-------------+--------------------------+
| id  |  date_col   |          ts_col          |
+-----+-------------+--------------------------+
| 1   | 2020-01-01  | 2021-01-03 14:22:01.913  |
| 2   | 2020-01-31  | 2021-01-03 14:23:41.7    |
+-----+-------------+--------------------------+
```

### String type

```sql
CREATE TABLE IF NOT EXISTS str_type (id INT, str_col STRING) USING delta;

INSERT INTO str_type VALUES (1, 'Some text here');

select * from str_type order by id;

+-----+-----------------+
| id  |     str_col     |
+-----+-----------------+
| 1   | Some text here  |
+-----+-----------------+
```

### Numeric type

```sql
-- NUMERIC(value, precision)
CREATE TABLE IF NOT EXISTS bigdecimal_type (id INT, numeric_col NUMERIC(10,5)) USING delta;

INSERT INTO bigdecimal_type VALUES (1, 123.1234);
--decimal point is rounded
INSERT INTO bigdecimal_type VALUES (2, 12345.123456);
-- This cannot be represented by BigDecimal. Unscaled value (12345612345) has more than 10 digits
--INSERT INTO bigdecimal_type3 VALUES (2, 123456.12345);

select * from bigdecimal_type  order by id;

+-----+--------------+
| id  | numeric_col  |
+-----+--------------+
| 1   | 123.12340    |
| 2   | 12345.12346  |
+-----+--------------+
```

### Array type

```sql
CREATE TABLE IF NOT EXISTS array_type (id INT, array_int_col ARRAY<INT>, array_str_col ARRAY<STRING>) USING delta;

INSERT INTO array_type VALUES (1, array(), array());
INSERT INTO array_type VALUES (2, array(1,2,3), array('one', 'two', 'three'));


select * from array_type order by id;

+-----+----------------+------------------------+
| id  | array_int_col  |     array_str_col      |
+-----+----------------+------------------------+
| 1   | []             | []                     |
| 2   | [1,2,3]        | ["one","two","three"]  |
+-----+----------------+------------------------+
```

### Struct type

```sql
CREATE TABLE IF NOT EXISTS struct_type (id INT, struct_col STRUCT<num:INT, txt: STRING>) USING delta;

INSERT INTO struct_type VALUES (1, struct(1, 'one'));
-- with names
INSERT INTO struct_type VALUES (2, named_struct("num", 1, "txt", 'one'));


select * from struct_type order by id;

+-----+------------------------+
| id  |       struct_col       |
+-----+------------------------+
| 1   | {"num":1,"txt":"one"}  |
| 2   | {"num":1,"txt":"one"}  |
+-----+------------------------+
```

### Map type

```sql
CREATE TABLE IF NOT EXISTS map_type (id INT, map_col MAP<INT, STRING>) USING delta;

INSERT INTO map_type VALUES (1, map(1, 'one', 2, 'two', 3, 'three'));


select * from map_type order by id;

+-----+------------------------------+
| id  |           map_col            |
+-----+------------------------------+
| 1   | {1:"one",2:"two",3:"three"}  |
+-----+------------------------------+
```
