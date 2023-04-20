---
title: Literals
description: String Binary Null Boolean Numeric and Datetime literals. Learn about syntax and examples for each type of literal in SQL.
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

### String Literal 
A string literal is used to specify a character string value.

**Syntax** 
```json
'char [ ... ]' | "char [ ... ]"
```

**Parameters** 
  *    **char**
         One character from the character set. Use ``` \ ``` to escape special characters (e.g., ``` ' ``` or ``` \ ```). 

**Examples** 

```sql
SELECT 'Hello, World!' AS col;
+-------------+
|          col|
+-------------+
|Hello, World!|
+-------------+

SELECT "SPARK SQL" AS col;
+---------+
|      col|
+---------+
|Spark SQL|
+---------+

SELECT 'it\'s $10.' AS col;
+---------+
|      col|
+---------+
|It's $10.|
+---------+
```
<br/>


### Binary Literal
A binary literal is used to specify a byte sequence value.

**Syntax** 
```json
X { 'num [ ... ]' | "num [ ... ]" }
```

**Parameters** 

  * **num**
    Any hexadecimal number from 0 to F.

**Examples** 
```sql
SELECT X'123456' AS col;
+----------+
|       col|
+----------+
|[12 34 56]|
+----------+
```
<br/>


### Null Literal s
A null literal is used to specify a null value.

**Syntax** 
```sql
NULL
```

**Examples** 
```sql
SELECT NULL AS col;
+----+
| col|
+----+
|NULL|
+----+
```
<br/>

### Boolean
A boolean literal is used to specify a boolean value.

**Syntax** 
```sql
TRUE | FALSE
```

**Examples** 
```sql
SELECT TRUE AS col;
+----+
| col|
+----+
|true|
+----+
```

<br/>

### Numeric Literal
A numeric literal is used to specify a fixed or floating-point number.

### Integral Literal

**Syntax**
```json
[ + | - ] digit [ ... ] [ L | S | Y ]
```
 <br/>

**Parameters**
  *  **digit**
  Any numeral from 0 to 9.
  *  **L**
  Case insensitive, indicates ```BIGINT```, which is an 8-byte signed integer number.
  *  **S**
  Case insensitive, indicates ```SMALLINT```, which is a 2-byte signed integer number.
  *  **Y**
Case insensitive, indicates ```TINYINT```, which is a 1-byte signed integer number.
  *  **default (no postfix)**
  Indicates a 4-byte signed integer number.

**Examples**

```sql
SELECT -2147483648 AS col;
+-----------+
|        col|
+-----------+
|-2147483648|
+-----------+

SELECT 9223372036854775807l AS col;
+-------------------+
|                col|
+-------------------+
|9223372036854775807|
+-------------------+

SELECT -32Y AS col;
+---+
|col|
+---+
|-32|
+---+

SELECT 482S AS col;
+---+
|col|
+---+
|482|
+---+
``` 
<br/>

### Fractional Literals

<br/>

**Syntax** 
decimal literals:
```json
decimal_digits { [ BD ] | [ exponent BD ] } | digit [ ... ] [ exponent ] BD
```

double literals:
```json
decimal_digits  { D | exponent [ D ] }  | digit [ ... ] { exponent [ D ] | [ exponent ] D }
```

While decimal_digits is defined as
```json
[ + | - ] { digit [ ... ] . [ digit [ ... ] ] | . digit [ ... ] }
```

and exponent is defined as
```json
E [ + | - ] digit [ ... ]
```

<br/>


**Parameters**
  *  **digit**
Any numeral from 0 to 9.
  *  **D**
Case insensitive, indicates ```DOUBLE```, which is an 8-byte double-precision floating point number.
  *  **BD**
Case insensitive, indicates ```DECIMAL```, with the total number of digits as precision and the number of digits to right of decimal point as scale.

**Examples**
```sql
SELECT 12.578 AS col;
+------+
|   col|
+------+
|12.578|
+------+

SELECT -0.1234567 AS col;
+----------+
|       col|
+----------+
|-0.1234567|
+----------+

SELECT -.1234567 AS col;
+----------+
|       col|
+----------+
|-0.1234567|
+----------+

SELECT 123. AS col;
+---+
|col|
+---+
|123|
+---+

SELECT 123.BD AS col;
+---+
|col|
+---+
|123|
+---+

SELECT 5E2 AS col;
+-----+
|  col|
+-----+
|500.0|
+-----+

SELECT 5D AS col;
+---+
|col|
+---+
|5.0|
+---+

SELECT -5BD AS col;
+---+
|col|
+---+
| -5|
+---+

SELECT 12.578e-2d AS col;
+-------+
|    col|
+-------+
|0.12578|
+-------+

SELECT -.1234567E+2BD AS col;
+---------+
|      col|
+---------+
|-12.34567|
+---------+

SELECT +3.e+3 AS col;
+------+
|   col|
+------+
|3000.0|
+------+

SELECT -3.E-3D AS col;
+------+
|   col|
+------+
|-0.003|
+------+
```
<br/>

### Datetime Literal
A Datetime literal is used to specify a datetime value.

### Date Literal

**Syntax** 
```json
DATE { 'yyyy' |
       'yyyy-[m]m' |
       'yyyy-[m]m-[d]d' |
       'yyyy-[m]m-[d]d[T]' }
```
**Note**: defaults to ```01``` if month or day is not specified.

**Examples**
```sql
SELECT DATE '1997' AS col;
+----------+
|       col|
+----------+
|1997-01-01|
+----------+

SELECT DATE '1997-01' AS col;
+----------+
|       col|
+----------+
|1997-01-01|
+----------+

SELECT DATE '2011-11-11' AS col;
+----------+
|       col|
+----------+
|2011-11-11|
+----------+
```

### Timestamp Literal

**Syntax**
```json
TIMESTAMP { 'yyyy' |
            'yyyy-[m]m' |
            'yyyy-[m]m-[d]d' |
            'yyyy-[m]m-[d]d ' |
            'yyyy-[m]m-[d]d[T][h]h[:]' |
            'yyyy-[m]m-[d]d[T][h]h:[m]m[:]' |
            'yyyy-[m]m-[d]d[T][h]h:[m]m:[s]s[.]' |
            'yyyy-[m]m-[d]d[T][h]h:[m]m:[s]s.[ms][ms][ms][us][us][us][zone_id]'}
``` 

**Note**: defaults to ```00``` if hour, minute or second is not specified. ```zone_id``` should have one of the forms:

  * Z - Zulu time zone UTC+0
  * ```+|-[h]h:[m]m```
  * An id with one of the prefixes UTC+, UTC-, GMT+, GMT-, UT+ or UT-, and a suffix in the formats: 
      *  ```+|-h[h]```
      *  ```+|-hh[:]mm```
      *  ```+|-hh:mm:ss```
      *  ```+|-hhmmss```
  * Region-based zone IDs in the form ```area/city```, such as ```Europe/Paris```

**Note**: defaults to the session local timezone (set via ```spark.sql.session.timeZone```) if ```zone_id``` is not specified.

**Examples** 
```sql
SELECT TIMESTAMP '1997-01-31 09:26:56.123' AS col;
+-----------------------+
|                    col|
+-----------------------+
|1997-01-31 09:26:56.123|
+-----------------------+

SELECT TIMESTAMP '1997-01-31 09:26:56.66666666UTC+08:00' AS col;
+--------------------------+
|                      col |
+--------------------------+
|1997-01-30 17:26:56.666666|
+--------------------------+

SELECT TIMESTAMP '1997-01' AS col;
+-------------------+
|                col|
+-------------------+
|1997-01-01 00:00:00|
+-------------------+
```

### Interval Literal
An interval literal is used to specify a fixed period of time.

```sql
INTERVAL interval_value interval_unit [ interval_value interval_unit ... ] |
INTERVAL 'interval_value interval_unit [ interval_value interval_unit ... ]' |
INTERVAL interval_string_value interval_unit TO interval_unit
```

**Parameters** 

  * **interval_value**
    **Syntax**: 
    ```json
    [ + | - ] number_value | '[ + | - ] number_value'
    ```
  * **interval_string_value**
    year-month/day-time interval string.

* **interval_unit**
    **Syntax**: 
    ```json
     YEAR[S] | MONTH[S] | WEEK[S] | DAY[S] | HOUR[S] | MINUTE[S] | SECOND[S] |
     MILLISECOND[S] | MICROSECOND[S]
    ```

**Examples** 

```sql
SELECT INTERVAL 3 YEAR AS col;
+-------+
|    col|
+-------+
|3 years|
+-------+

SELECT INTERVAL -2 HOUR '3' MINUTE AS col;
+--------------------+
|                 col|
+--------------------+
|-1 hours -57 minutes|
+--------------------+

SELECT INTERVAL '1 YEAR 2 DAYS 3 HOURS';
+----------------------+
|                   col|
+----------------------+
|1 years 2 days 3 hours|
+----------------------+

SELECT INTERVAL 1 YEARS 2 MONTH 3 WEEK 4 DAYS 5 HOUR 6 MINUTES 7 SECOND 8
    MILLISECOND 9 MICROSECONDS AS col;
+-----------------------------------------------------------+
|                                                        col|
+-----------------------------------------------------------+
|1 years 2 months 25 days 5 hours 6 minutes 7.008009 seconds|
+-----------------------------------------------------------+

SELECT INTERVAL '2-3' YEAR TO MONTH AS col;
+----------------+
|             col|
+----------------+
|2 years 3 months|
+----------------+

SELECT INTERVAL '20 15:40:32.99899999' DAY TO SECOND AS col;
+---------------------------------------------+
|                                          col|
+---------------------------------------------+
|20 days 15 hours 40 minutes 32.998999 seconds|
+---------------------------------------------+
```