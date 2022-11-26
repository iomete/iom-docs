---
title: Functions
description: Learn about Spark SQL built-in functions in IOMETE
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

Built-in Functions
___


## **abs**
abs(expr) - Returns the absolute value of the numeric value.

**Examples:** 
```sql
> SELECT abs(-1);
 1
```

<br/>

---

<br/>

## **acos**
acos(expr) - Returns the inverse cosine (a.k.a. arc cosine) of `expr`, as if computed by ```java.lang.Math.acos```.

**Examples:** 
```sql
> SELECT acos(1);
 0.0
> SELECT acos(2);
 NaN
```

<br/>

---

<br/>

## **acosh**
acosh(expr) - Returns inverse hyperbolic cosine of `expr`.

**Examples:** 
```sql
> SELECT acosh(1);
 0.0
> SELECT acosh(0);
 NaN
```
**Since**: 3.0.0

<br/>

---

<br/>



## **add_months**
add_months(start_date, num_months) - Returns the date that is `num_months` after `start_date`.

**Examples:** 
```sql
> SELECT add_months('2016-08-31', 1);
 2016-09-30
```
**Since**: 1.5.0
<hr/>


## **aggregate**
aggregate(expr, start, merge, finish) - Applies a binary operator to an initial state and all elements in the array, and reduces this to a single state. The final state is converted into the final result by applying a finish function.


**Examples:** 
```sql
> SELECT aggregate(array(1, 2, 3), 0, (acc, x) -> acc + x);
 6
> SELECT aggregate(array(1, 2, 3), 0, (acc, x) -> acc + x, acc -> acc * 10);
 60
```
**Since**: 2.4.0
<hr/>

## **and**
expr1 and expr2 - Logical AND.

<br/>

---

<br/>

## **any**
any(expr) - Returns true if at least one value of `expr` is true.


**Examples:** 
```sql
> SELECT any(col) FROM VALUES (true), (false), (false) AS tab(col);
 true
> SELECT any(col) FROM VALUES (NULL), (true), (false) AS tab(col);
 true
> SELECT any(col) FROM VALUES (false), (false), (NULL) AS tab(col);
 false
```
**Since**: 3.0.0
<hr/>

## **approx_count_distinct**
approx_count_distinct(expr[, relativeSD]) - Returns the estimated cardinality by HyperLogLog++. ```relativeSD``` defines the maximum relative standard deviation allowed.


**Examples:** 
```sql
> SELECT approx_count_distinct(col1) FROM VALUES (1), (1), (2), (2), (3) tab(col1);
 3
```
**Since**: 1.6.0
<hr/>

## **approx_percentile**
approx_percentile(col, percentage [, accuracy]) - Returns the approximate percentile value of numeric column `col` at the given percentage. The value of percentage must be between 0.0 and 1.0. The `accuracy` parameter (default: 10000) is a positive numeric literal which controls approximation accuracy at the cost of memory. Higher value of `accuracy` yields better accuracy, `1.0/accuracy` is the relative error of the approximation. When `accuracy` is an array, each value of the percentage array must be between 0.0 and 1.0. In this case, returns the approximate percentile array of column `col` at the given percentage array.


**Examples:** 
```sql
> SELECT approx_percentile(10.0, array(0.5, 0.4, 0.1), 100);
 [10.0,10.0,10.0]
> SELECT approx_percentile(10.0, 0.5, 100);
 10.0
```
**Since**: 2.1.0
<hr/>

## **array**
array(expr, ...) - Returns an array with the given elements.


**Examples:** 
```sql
> SELECT array(1, 2, 3);
 [1,2,3]
```
<br/>

---

<br/>

## **array_contains**
array_contains(array, value) - Returns true if the array contains the value.

**Examples:** 
```sql
> SELECT array_contains(array(1, 2, 3), 2);
 true
```
<br/>

---

<br/>

## **array_distinct**
array_distinct(array) - Removes duplicate values from the array.

**Examples:** 
```sql
> SELECT array_distinct(array(1, 2, 3, null, 3));
 [1,2,3,null]
```
**Since**: 2.4.0
<hr/>


## **array_except**
array_except(array1, array2) - Returns an array of the elements in array1 but not in array2, without duplicates.

**Examples:** 
```sql
> SELECT array_except(array(1, 2, 3), array(1, 3, 5));
 [2]
```
**Since**: 2.4.0
<hr/>

## **array_intersect**
array_intersect(array1, array2) - Returns an array of the elements in the intersection of array1 and array2, without duplicates.

**Examples:** 
```sql
> SELECT array_intersect(array(1, 2, 3), array(1, 3, 5));
 [1,3]
```
**Since**: 2.4.0
<hr/>

## **array_join**
array_join(array, delimiter[, nullReplacement]) - Concatenates the elements of the given array using the delimiter and an optional string to replace nulls. If no value is set for nullReplacement, any null value is filtered.

**Examples:** 
```sql
> SELECT array_join(array('hello', 'world'), ' ');
 hello world
> SELECT array_join(array('hello', null ,'world'), ' ');
 hello world
> SELECT array_join(array('hello', null ,'world'), ' ', ',');
 hello , world
```
**Since**: 2.4.0
<hr/>

## **array_max**
array_max(array) - Returns the maximum value in the array. NULL elements are skipped.

**Examples:** 
```sql
> SELECT array_max(array(1, 20, null, 3));
 20
```
**Since**: 2.4.0
<hr/>

## **array_min**
array_min(array) - Returns the minimum value in the array. NULL elements are skipped.

**Examples:** 
```sql
> SELECT array_min(array(1, 20, null, 3));
 1
```
**Since**: 2.4.0
<hr/>


## **array_position**
array_position(array, element) - Returns the (1-based) index of the first element of the array as long.

**Examples:** 
```sql
> SELECT array_position(array(3, 2, 1), 1);
 3
```
**Since**: 2.4.0
<hr/>


## **array_remove**
array_remove(array, element) - Remove all elements that equal to element from array.

**Examples:** 
```sql
> SELECT array_remove(array(1, 2, 3, null, 3), 3);
 [1,2,null]
```
**Since**: 2.4.0
<hr/>


## **array_repeat**
array_repeat(element, count) - Returns the array containing element count times.

**Examples:** 
```sql
> SELECT array_repeat('123', 2);
 ["123","123"]
```
**Since**: 2.4.0
<hr/>


## **array_sort**
array_sort(expr, func) - Sorts the input array. If func is omitted, sort in ascending order. The elements of the input array must be orderable. Null elements will be placed at the end of the returned array. Since 3.0.0 this function also sorts and returns the array based on the given comparator function. The comparator will take two arguments representing two elements of the array. It returns -1, 0, or 1 as the first element is less than, equal to, or greater than the second element. If the comparator function returns other values (including null), the function will fail and raise an error.

**Examples:** 
```sql
> SELECT array_sort(array(5, 6, 1), (left, right) -> case when left < right then -1 when left > right then 1 else 0 end);
 [1,5,6]
> SELECT array_sort(array('bc', 'ab', 'dc'), (left, right) -> case when left is null and right is null then 0 when left is null then -1 when right is null then 1 when left < right then 1 when left > right then -1 else 0 end);
 ["dc","bc","ab"]
> SELECT array_sort(array('b', 'd', null, 'c', 'a'));
 ["a","b","c","d",null]
```
**Since**: 2.4.0
<hr/>



## **array_union**
array_union(array1, array2) - Returns an array of the elements in the union of array1 and array2, without duplicates.

**Examples:** 
```sql
> SELECT array_union(array(1, 2, 3), array(1, 3, 5));
 [1,2,3,5]
```
**Since**: 2.4.0
<hr/>


## **arrays_overlap**
arrays_overlap(a1, a2) - Returns true if a1 contains at least a non-null element present also in a2. If the arrays have no common element and they are both non-empty and either of them contains a null element null is returned, false otherwise.

**Examples:** 
```sql
> SELECT arrays_overlap(array(1, 2, 3), array(3, 4, 5));
 true
```
**Since**: 2.4.0
<hr/>


## **arrays_zip**
arrays_zip(a1, a2, ...) - Returns a merged array of structs in which the N-th struct contains all N-th values of input arrays.

**Examples:** 
```sql
> SELECT arrays_zip(array(1, 2, 3), array(2, 3, 4));
 [{"0":1,"1":2},{"0":2,"1":3},{"0":3,"1":4}]
> SELECT arrays_zip(array(1, 2), array(2, 3), array(3, 4));
 [{"0":1,"1":2,"2":3},{"0":2,"1":3,"2":4}]
```
**Since**: 2.4.0
<hr/>


## **ascii**
ascii(str) - Returns the numeric value of the first character of `str`.

**Examples:** 
```sql
> SELECT ascii('222');
 50
> SELECT ascii(2);
 50
```
**Since**: 1.5.0
<hr/>


## **asin**
asin(expr) - Returns the inverse sine (a.k.a. arc sine) the arc sin of `expr`, as if computed by `java.lang.Math.asin`.

**Examples:** 
```sql
> SELECT asin(0);
 0.0
> SELECT asin(2);
 NaN
```
<br/>

---

<br/>


## **asinh**
asinh(expr) - Returns inverse hyperbolic sine of `expr`.

**Examples:** 
```sql
> SELECT asinh(0);
 0.0
```
**Since**: 3.0.0
<hr/>


## **assert_true**
assert_true(expr) - Throws an exception if `expr` is not true.

**Examples:** 
```sql
> SELECT assert_true(0 < 1);
 NULL
```
<br/>

---

<br/>


## **atan**
atan(expr) - Returns the inverse tangent (a.k.a. arc tangent) of `expr`, as if computed by `java.lang.Math.atan`

**Examples:** 
```sql
> SELECT atan(0);
 0.0
```
<br/>

---

<br/>


## **atan2**
atan2(exprY, exprX) - Returns the angle in radians between the positive x-axis of a plane and the point given by the coordinates (```exprX```, ```exprY```), as if computed by `java.lang.Math.atan2`.

**Arguments**:
  * exprY - coordinate on y-axis
  * exprX - coordinate on x-axis

**Examples:** 
```sql
> SELECT atan2(0, 0);
 0.0
```
<br/>

---

<br/>


## **atanh**
atanh(expr) - Returns inverse hyperbolic tangent of `expr`.

**Examples:** 
```sql
> SELECT atanh(0);
 0.0
> SELECT atanh(2);
 NaN
```
**Since**: 3.0.0
<hr/>

## **avg**
avg(expr) - Returns the mean calculated from values of a group.

**Examples:** 
```sql
> SELECT avg(col) FROM VALUES (1), (2), (3) AS tab(col);
 2.0
> SELECT avg(col) FROM VALUES (1), (2), (NULL) AS tab(col);
 1.5
```
**Since**: 1.0.0
<hr/>


## **base64**
base64(bin) - Converts the argument from a binary `bin` to a base 64 string.

**Examples:** 
```sql
> SELECT base64('Spark SQL');
 U3BhcmsgU1FM
```
**Since**: 1.5.0
<hr/>

## **bigint**
bigint(expr) - Casts the value `expr` to the target data type `bigint`.

<br/>

---

<br/>

## **bin**
bin(expr) - Returns the string representation of the long value `expr` represented in binary.

**Examples:** 
```sql
> SELECT bin(13);
 1101
> SELECT bin(-13);
 1111111111111111111111111111111111111111111111111111111111110011
> SELECT bin(13.3);
 1101
```
<br/>

---

<br/>

## **binary**
binary(expr) - Casts the value `expr` to the target data type `binary`.

<br/>

---

<br/>


## **bit_and**
bit_and(expr) - Returns the bitwise AND of all non-null input values, or null if none.

**Examples:** 
```sql
> SELECT bit_and(col) FROM VALUES (3), (5) AS tab(col);
 1
```
**Since**: 3.0.0
<hr/>


## **bit_count**
bit_count(expr) - Returns the number of bits that are set in the argument expr as an unsigned 64-bit integer, or NULL if the argument is NULL.

**Examples:** 
```sql
> SELECT bit_count(0);
 0
```
**Since**: 3.0.0
<hr/>


## **bit_length**
bit_length(expr) - Returns the bit length of string data or number of bits of binary data.

**Examples:** 
```sql
> SELECT bit_length('Spark SQL');
 72
```
**Since**: 2.3.0
<hr/>


## **bit_or**
bit_or(expr) - Returns the bitwise OR of all non-null input values, or null if none.

**Examples:** 
```sql
> SELECT bit_or(col) FROM VALUES (3), (5) AS tab(col);
 7
```
**Since**: 3.0.0
<hr/>


## **bit_xor**
bit_xor(expr) - Returns the bitwise XOR of all non-null input values, or null if none.

**Examples:** 
```sql
> SELECT bit_xor(col) FROM VALUES (3), (5) AS tab(col);
 6
```
**Since**: 3.0.0
<hr/>


## **bool_and**
bool_and(expr) - Returns true if all values of `expr` are true.

**Examples:** 
```sql
> SELECT bool_and(col) FROM VALUES (true), (true), (true) AS tab(col);
 true
> SELECT bool_and(col) FROM VALUES (NULL), (true), (true) AS tab(col);
 true
> SELECT bool_and(col) FROM VALUES (true), (false), (true) AS tab(col);
 false
```
**Since**: 3.0.0
<hr/>


## **bool_or**
bool_or(expr) - Returns true if at least one value of `expr` is true.

**Examples:** 
```sql
> SELECT bool_or(col) FROM VALUES (true), (false), (false) AS tab(col);
 true
> SELECT bool_or(col) FROM VALUES (NULL), (true), (false) AS tab(col);
 true
> SELECT bool_or(col) FROM VALUES (false), (false), (NULL) AS tab(col);
 false
```
**Since**: 3.0.0
<hr/>

## **boolean**
boolean(expr) - Casts the value `expr` to the target data type `boolean`.
<br/>

---

<br/>



## **bround**
bround(expr, d) - Returns `expr` rounded to `d` decimal places using HALF_EVEN rounding mode.

**Examples:** 
```sql
> SELECT bround(2.5, 0);
 2
```
<br/>

---

<br/>


## **cardinality**
cardinality(expr) - Returns the size of an array or a map. The function returns null for null input if spark.sql.legacy.sizeOfNull is set to false or spark.sql.ansi.enabled is set to true. Otherwise, the function returns -1 for null input. With the default settings, the function returns -1 for null input.

**Examples:** 
```sql
> SELECT cardinality(array('b', 'd', 'c', 'a'));
 4
> SELECT cardinality(map('a', 1, 'b', 2));
 2
> SELECT cardinality(NULL);
 -1
```
<br/>

---

<br/>


## **cast**
cast(expr AS type) - Casts the value `expr` to the target data type `type`.

**Examples:** 
```sql
> SELECT cast('10' as int);
 10
```
<br/>

---

<br/>


## **cbrt**
cbrt(expr) - Returns the cube root of `expr`.

**Examples:** 
```sql
> SELECT cbrt(27.0);
 3.0
```
<br/>

---

<br/>



## **ceil**
ceil(expr) - Returns the smallest integer not smaller than `expr`.

**Examples:** 
```sql
> SELECT ceil(-0.1);
 0
> SELECT ceil(5);
 5
```
<br/>

---

<br/>


## **ceiling**
ceiling(expr) - Returns the smallest integer not smaller than `expr`.

**Examples:** 
```sql
> SELECT ceiling(-0.1);
 0
> SELECT ceiling(5);
 5
```
<br/>

---

<br/>


## **char**
char(expr) - Returns the ASCII character having the binary equivalent to `expr`. If n is larger than 256 the result is equivalent to chr(n % 256)

**Examples:** 
```sql
> SELECT char(65);
 A
```

**Since**: 2.3.0
<hr/>



## **char_length**
char_length(expr) - Returns the character length of string data or number of bytes of binary data. The length of string data includes the trailing spaces. The length of binary data includes binary zeros.

**Examples:** 
```sql
> SELECT char_length('Spark SQL ');
 10
> SELECT CHAR_LENGTH('Spark SQL ');
 10
> SELECT CHARACTER_LENGTH('Spark SQL ');
 10
```

**Since**: 1.5.0
<hr/>


## **character_length**
character_length(expr) - Returns the character length of string data or number of bytes of binary data. The length of string data includes the trailing spaces. The length of binary data includes binary zeros.

**Examples:** 
```sql
> SELECT character_length('Spark SQL ');
 10
> SELECT CHAR_LENGTH('Spark SQL ');
 10
> SELECT CHARACTER_LENGTH('Spark SQL ');
 10
```

**Since**: 1.5.0
<hr/>



## **chr**
chr(expr) - Returns the ASCII character having the binary equivalent to `expr`. If n is larger than 256 the result is equivalent to chr(n % 256)

**Examples:** 
```sql
> SELECT chr(65);
 A
```

**Since**: 2.3.0
<hr/>


## **coalesce**
coalesce(expr1, expr2, ...) - Returns the first non-null argument if exists. Otherwise, null.

**Examples:** 
```sql
> SELECT coalesce(NULL, 1, NULL);
 1
```

**Since**: 1.0.0
<hr/>


## **collect_list**
collect_list(expr) - Collects and returns a list of non-unique elements.

**Examples:** 
```sql
> SELECT collect_list(col) FROM VALUES (1), (2), (1) AS tab(col);
 [1,2,1]
```

**Note**:
The function is non-deterministic because the order of collected results depends on the order of the rows which may be non-deterministic after a shuffle.


**Since**: 2.0.0
<hr/>


## **collect_set**
collect_set(expr) - Collects and returns a set of unique elements.

**Examples:** 
```sql
> SELECT collect_set(col) FROM VALUES (1), (2), (1) AS tab(col);
 [1,2]
```

**Note**:
The function is non-deterministic because the order of collected results depends on the order of the rows which may be non-deterministic after a shuffle.

**Since**: 2.0.0
<hr/>


## **concat**
concat(col1, col2, ..., colN) - Returns the concatenation of col1, col2, ..., colN.

**Examples:** 
```sql
> SELECT concat('Spark', 'SQL');
 SparkSQL
> SELECT concat(array(1, 2, 3), array(4, 5), array(6));
 [1,2,3,4,5,6]
```

**Note**:
Concat logic for arrays is available since 2.4.0.

<br/>

---

<br/>


## **concat_ws**
concat_ws(sep, [str | array(str)]+) - Returns the concatenation of the strings separated by `sep`.

**Examples:** 
```sql
> SELECT concat_ws(' ', 'Spark', 'SQL');
  Spark SQL
```

**Since**: 1.5.0
<hr/>


## **conv**
conv(num, from_base, to_base) - Convert `num` from `from_base` to to_base.

**Examples:** 
```sql
> SELECT conv('100', 2, 10);
 4
> SELECT conv(-10, 16, -10);
 -16
```
<br/>

---

<br/>



## **corr**
corr(expr1, expr2) - Returns Pearson coefficient of correlation between a set of number pairs.

**Examples:** 
```sql
> SELECT corr(c1, c2) FROM VALUES (3, 2), (3, 3), (6, 4) as tab(c1, c2);
 0.8660254037844387
```

**Since**: 1.6.0
<hr/>


## **cos**
cos(expr) - Returns the cosine of `expr`, as if computed by `java.lang.Math.cos`.

**Arguments**
  * expr - angle in radians
  
**Examples:** 
```sql
> SELECT cos(0);
 1.0
```
<br/>

---

<br/>



## **cosh**
cosh(expr) - Returns the hyperbolic cosine of `expr`, as if computed by `java.lang.Math.cosh`.

**Arguments**
  * expr - hyperbolic angle
  
**Examples:** 
```sql
> SELECT cosh(0);
 1.0
```
<br/>

---

<br/>



## **cot**
cot(expr) - Returns the cotangent of `expr`, as if computed by `1/java.lang.Math.cot`.

**Arguments**
  * expr - angle in radians
  
**Examples:** 
```sql
> SELECT cot(1);
 0.6420926159343306
```
<br/>

---

<br/>



## **count**
count(*) - Returns the total number of retrieved rows, including rows containing null.

count(expr[, expr...]) - Returns the number of rows for which the supplied expression(s) are all non-null.

count(DISTINCT expr[, expr...]) - Returns the number of rows for which the supplied expression(s) are unique and non-null.

**Examples:** 
```sql
> SELECT count(*) FROM VALUES (NULL), (5), (5), (20) AS tab(col);
 4
> SELECT count(col) FROM VALUES (NULL), (5), (5), (20) AS tab(col);
 3
> SELECT count(DISTINCT col) FROM VALUES (NULL), (5), (5), (10) AS tab(col);
 2
```

**Since**: 1.0.0
<hr/>


## **count_if**
count_if(expr) - Returns the number of `TRUE` values for the expression.


**Examples:** 
```sql
> SELECT count_if(col % 2 = 0) FROM VALUES (NULL), (0), (1), (2), (3) AS tab(col);
 2
> SELECT count_if(col IS NULL) FROM VALUES (NULL), (0), (1), (2), (3) AS tab(col);
 1
```

**Since**: 3.0.0
<hr/>


## **count_min_sketch**
count_min_sketch(col, eps, confidence, seed) - Returns a count-min sketch of a column with the given esp, confidence and seed. The result is an array of bytes, which can be deserialized to a `CountMinSketch` before usage. Count-min sketch is a probabilistic data structure used for cardinality estimation using sub-linear space.

**Since**: 2.2.0
<hr/>


## **covar_pop**
covar_pop(expr1, expr2) - Returns the population covariance of a set of number pairs.

**Examples:** 
```sql
> SELECT covar_pop(c1, c2) FROM VALUES (1,1), (2,2), (3,3) AS tab(c1, c2);
 0.6666666666666666
```

**Since**: 2.0.0
<hr/>

## **covar_samp**
covar_samp(expr1, expr2) - Returns the sample covariance of a set of number pairs.

**Examples:** 
```sql
> SELECT covar_samp(c1, c2) FROM VALUES (1,1), (2,2), (3,3) AS tab(c1, c2);
 1.0
```

**Since**: 2.0.0
<hr/>

## **crc32**
crc32(expr) - Returns a cyclic redundancy check value of the ``expr``` as a bigint.

**Examples:** 
```sql
> SELECT crc32('Spark');
 1557323817
```
<br/>

---

<br/>


## **cube**
cube([col1[, col2 ..]]) - create a multi-dimensional cube using the specified columns so that we can run aggregation on them.

**Examples:** 
```sql
> SELECT name, age, count(*) FROM VALUES (2, 'Alice'), (5, 'Bob') people(age, name) GROUP BY cube(name, age);
  Bob   5   1
  Alice 2   1
  NULL  NULL    2
  NULL  5   1
  Bob   NULL    1
  Alice NULL    1
  NULL  2   1
```

**Since**: 2.0.0
<hr/>


## **cume_dist**
cume_dist() - Computes the position of a value relative to all values in the partition.

**Since**: 2.0.0
<hr/>


## **current_database**
current_database() - Returns the current database.

**Examples:** 
```sql
> SELECT current_database();
 default
```
<br/>

---

<br/>



## **current_date**
current_date() - Returns the current date at the start of query evaluation.

current_date - Returns the current date at the start of query evaluation.


**Examples:** 
```sql
> SELECT current_date();
 2020-04-25
> SELECT current_date;
 2020-04-25
```

**Note**:
The syntax without braces has been supported since 2.0.1.

**Since**: 1.5.0
<hr/>


## **current_timestamp**
current_timestamp() - Returns the current timestamp at the start of query evaluation.

current_timestamp - Returns the current timestamp at the start of query evaluation.


**Examples:** 
```sql
> SELECT current_timestamp();
 2020-04-25 15:49:11.914
> SELECT current_timestamp;
 2020-04-25 15:49:11.914
```

**Note**:
The syntax without braces has been supported since 2.0.1.

**Since**: 1.5.0
<hr/>


## **date**
date(expr) - Casts the value `expr` to the target data type `date`.

<br/>

---

<br/>


## **date_add**
date_add(start_date, num_days) - Returns the date that is `num_days` after `start_date`.


**Examples:** 
```sql
> SELECT date_add('2016-07-30', 1);
 2016-07-31
```

**Since**: 1.5.0
<hr/>


## **date_format**
date_format(timestamp, fmt) - Converts `timestamp` to a value of string in the format specified by the date format ```fmt```.

**Arguments:**
  * timestamp - A date/timestamp or string to be converted to the given format.
  * fmt - Date/time format pattern to follow. See <a href="https://spark.apache.org/docs/latest/sql-ref-datetime-pattern.html" target="_blank">Datetime Patterns</a> for valid date and time format patterns.


**Examples:** 
```sql
> SELECT date_format('2016-04-08', 'y');
 2016
```

**Since**: 1.5.0
<hr/>


## date_part

date_part(field, source) - Extracts a part of the date/timestamp or interval source.

**Arguments:**
  * field - selects which part of the source should be extracted, and supported string values are as same as the fields of the equivalent function ```EXTRACT```.
  * source - a date/timestamp or interval column from where ```field``` should be extracted


**Examples:** 
```sql
> SELECT date_part('YEAR', TIMESTAMP '2019-08-12 01:00:00.123456');
 2019
> SELECT date_part('week', timestamp'2019-08-12 01:00:00.123456');
 33
> SELECT date_part('doy', DATE'2019-08-12');
 224
> SELECT date_part('SECONDS', timestamp'2019-10-01 00:00:01.000001');
 1.000001
> SELECT date_part('days', interval 1 year 10 months 5 days);
 5
> SELECT date_part('seconds', interval 5 hours 30 seconds 1 milliseconds 1 microseconds);
 30.001001
```
**Note:**
The date_part function is equivalent to the SQL-standard function `EXTRACT(field FROM source)`

**Since**: 3.0.0
<hr/>



## **date_sub**
date_sub(start_date, num_days) - Returns the date that is `num_days` before `start_date`.

**Examples:** 
```sql
> SELECT date_sub('2016-07-30', 1);
 2016-07-29
```

**Since**: 1.5.0
<hr/>


## **date_trunc**
date_trunc(fmt, ts) - Returns timestamp ```ts``` truncated to the unit specified by the format model ```fmt```.

**Examples:** 
```sql
> SELECT date_trunc('YEAR', '2015-03-05T09:32:05.359');
 2015-01-01 00:00:00
> SELECT date_trunc('MM', '2015-03-05T09:32:05.359');
 2015-03-01 00:00:00
> SELECT date_trunc('DD', '2015-03-05T09:32:05.359');
 2015-03-05 00:00:00
> SELECT date_trunc('HOUR', '2015-03-05T09:32:05.359');
 2015-03-05 09:00:00
> SELECT date_trunc('MILLISECOND', '2015-03-05T09:32:05.123456');
 2015-03-05 09:32:05.123
```

**Since**: 2.3.0
<hr/>


## **datediff**
datediff(endDate, startDate) - Returns the number of days from `startDate` to `endDate`.

**Examples:** 
```sql
> SELECT datediff('2009-07-31', '2009-07-30');
 1

> SELECT datediff('2009-07-30', '2009-07-31');
 -1
```

**Since**: 1.5.0
<hr/>


## **day**
day(date) - Returns the day of month of the date/timestamp.

**Examples:** 
```sql
> SELECT day('2009-07-30');
 30
```

**Since**: 1.5.0
<hr/>


## **dayofmonth**
dayofmonth(date) - Returns the day of month of the date/timestamp.

**Examples:** 
```sql
> SELECT dayofmonth('2009-07-30');
 30
```

**Since**: 1.5.0
<hr/>


## **dayofweek**
dayofweek(date) - Returns the day of the week for date/timestamp (1 = Sunday, 2 = Monday, ..., 7 = Saturday).

**Examples:** 
```sql
> SELECT dayofweek('2009-07-30');
 5
```

**Since**: 2.3.0
<hr/>


## **dayofyear**
dayofyear(date) - Returns the day of year of the date/timestamp.

**Examples:** 
```sql
> SELECT dayofyear('2016-04-09');
 100
```

**Since**: 1.5.0
<hr/>


## **decimal**
decimal(expr) - Casts the value `expr` to the target data type `decimal`.

<br/>

---

<br/>



## **decode**
decode(bin, charset) - Decodes the first argument using the second argument character set.

**Examples:** 
```sql
> SELECT decode(encode('abc', 'utf-8'), 'utf-8');
 abc
```

**Since**: 1.5.0
<hr/>


## **degrees**
degrees(expr) - Converts radians to degrees.

**Arguments:**
  * expr - angle in radians
  
**Examples:** 
```sql
> SELECT degrees(3.141592653589793);
 180.0
```
<br/>

---

<br/>


## **dense_rank**
dense_rank() - Computes the rank of a value in a group of values. The result is one plus the previously assigned rank value. Unlike the function rank, dense_rank will not produce gaps in the ranking sequence.

**Arguments:**
  * children - this is to base the rank on; a change in the value of one the children will trigger a change in rank. This is an internal parameter and will be assigned by the Analyser.
    
**Since:** 2.0.0

<br/>

---

<br/>



## **div**
expr1 div expr2 - Divide `expr1` by `expr2`. It returns NULL if an operand is NULL or `expr2` is 0. The result is casted to long.

  
**Examples:** 
```sql
> SELECT 3 div 2;
 1
```
**Since:** 3.0.0

<br/>

---

<br/>



## **double**
double(expr) - Casts the value `expr` to the target data type `double`.

<br/>

---

<br/>



## **e**
e() - Returns Euler's number, e.

  
**Examples:** 
```sql
> SELECT e();
 2.718281828459045
```
<br/>

---

<br/>


## **element_at**
element_at(array, index) - Returns element of array at given (1-based) index. If index < 0, accesses elements from the last to the first. Returns NULL if the index exceeds the length of the array.
element_at(map, key) - Returns value for given key, or NULL if the key is not contained in the map

  
**Examples:** 
```sql
> SELECT element_at(array(1, 2, 3), 2);
 2
> SELECT element_at(map(1, 'a', 2, 'b'), 2);
 b
```
**Since:**2.4.0
<hr/>


## **elt**
elt(n, input1, input2, ...) - Returns the n-th input, e.g., returns `input2` when `n` is 2.


  
**Examples:** 
```sql
> SELECT elt(1, 'scala', 'java');
 scala
```
**Since:**2.0.0
<hr/>


## **encode**
encode(str, charset) - Encodes the first argument using the second argument character set.

**Examples:** 
```sql
> SELECT encode('abc', 'utf-8');
 abc
```
**Since:**1.5.0
<hr/>


## **every**
every(expr) - Returns true if all values of `expr` are true.

**Examples:** 
```sql
> SELECT every(col) FROM VALUES (true), (true), (true) AS tab(col);
 true
> SELECT every(col) FROM VALUES (NULL), (true), (true) AS tab(col);
 true
> SELECT every(col) FROM VALUES (true), (false), (true) AS tab(col);
 false
```
**Since:**3.0.0
<hr/>


## **exists**
exists(expr, pred) - Tests whether a predicate holds for one or more elements in the array.

**Examples:** 
```sql
> SELECT exists(array(1, 2, 3), x -> x % 2 == 0);
 true
> SELECT exists(array(1, 2, 3), x -> x % 2 == 10);
 false
> SELECT exists(array(1, null, 3), x -> x % 2 == 0);
 NULL
> SELECT exists(array(0, null, 2, 3, null), x -> x IS NULL);
 true
> SELECT exists(array(1, 2, 3), x -> x IS NULL);
 false
```
**Since:**2.4.0
<hr/>


## **exp**
exp(expr) - Returns e to the power of `expr`.

**Examples:** 
```sql
> SELECT exp(0);
 1.0
```
<br/>

---

<br/>



## **explode**
explode(expr) - Separates the elements of array `expr` into multiple rows, or the elements of map `expr` into multiple rows and columns. Unless specified otherwise, uses the default column name `col` for elements of the array or `key`and `value` for the elements of the map.

**Examples:** 
```sql
> SELECT explode(array(10, 20));
 10
 20
```
<br/>

---

<br/>


## **explode_outer**
explode_outer(expr) - Separates the elements of array `expr` into multiple rows, or the elements of map `expr` into multiple rows and columns. Unless specified otherwise, uses the default column name `col` for elements of the array or `key` and `value` for the elements of the map.

**Examples:** 
```sql
> SELECT explode_outer(array(10, 20));
 10
 20
```
<br/>

---

<br/>


## **expm1**
expm1(expr) - Returns exp(`expr`) - 1.

**Examples:** 
```sql
> SELECT expm1(0);
 0.0
```
extract(field FROM source) - Extracts a part of the date/timestamp or interval source.

**Arguments:**

  * field - selects which part of the source should be extracted
      *   Supported string values of field for dates and timestamps are(case insensitive):
  
          * "YEAR", ("Y", "YEARS", "YR", "YRS") - the year field
          *   "YEAROFWEEK" - the ISO 8601 week-numbering year that the datetime falls in. For example, 2005-01-02 is part of the 53rd week of year 2004, so the result is 2004
          * "QUARTER", ("QTR") - the quarter (1 - 4) of the year that the datetime falls in
          * "MONTH", ("MON", "MONS", "MONTHS") - the month field (1 - 12)
          * "WEEK", ("W", "WEEKS") - the number of the ISO 8601 week-of-week-based-year. A week is considered to start on a Monday and week 1 is the first week with >3 days. In the ISO week-numbering system, it is possible for early-January dates to be part of the 52nd or 53rd week of the previous year, and for late-December dates to be part of the first week of the next year. For example, 2005-01-02 is part of the 53rd week of year 2004, while 2012-12-31 is part of the first week of 2013
          * "DAY", ("D", "DAYS") - the day of the month field (1 - 31)
          * "DAYOFWEEK",("DOW") - the day of the week for datetime as Sunday(1) to Saturday(7)
          * "DAYOFWEEK_ISO",("DOW_ISO") - ISO 8601 based day of the week for datetime as Monday(1) to Sunday(7)
          * "DOY" - the day of the year (1 - 365/366)
          * "HOUR", ("H", "HOURS", "HR", "HRS") - The hour field (0 - 23)
          * "MINUTE", ("M", "MIN", "MINS", "MINUTES") - the minutes field (0 - 59)
          * "SECOND", ("S", "SEC", "SECONDS", "SECS") - the seconds field, including fractional parts

      * Supported string values of field for interval(which consists of months, days, microseconds) are(case insensitive):
          * "YEAR", ("Y", "YEARS", "YR", "YRS") - the total months / 12
          * "MONTH", ("MON", "MONS", "MONTHS") - the total months % 12
          * "DAY", ("D", "DAYS") - the days part of interval
          * "HOUR", ("H", "HOURS", "HR", "HRS") - how many hours the microseconds contains
          * "MINUTE", ("M", "MIN", "MINS", "MINUTES") - how many minutes left after taking hours from microseconds
          * "SECOND", ("S", "SEC", "SECONDS", "SECS") - how many second with fractions left after taking hours and minutes from microseconds

  * source - a date/timestamp or interval column from where field should be extracted

**Examples:**

```sql
> SELECT extract(YEAR FROM TIMESTAMP '2019-08-12 01:00:00.123456');
 2019
> SELECT extract(week FROM timestamp'2019-08-12 01:00:00.123456');
 33
> SELECT extract(doy FROM DATE'2019-08-12');
 224
> SELECT extract(SECONDS FROM timestamp'2019-10-01 00:00:01.000001');
 1.000001
> SELECT extract(days FROM interval 1 year 10 months 5 days);
 5
> SELECT extract(seconds FROM interval 5 hours 30 seconds 1 milliseconds 1 microseconds);
 30.001001
```

**Note:**
The extract function is equivalent to `date_part(field, source)`.

**Since:** 3.0.0


<br/>

---

<br/>



## **factorial**
factorial(expr) - Returns the factorial of `expr`. `expr` is [0..20]. Otherwise, null.

**Examples:** 
```sql
> SELECT factorial(5);
 120
```
<br/>

---

<br/>


## **filter**
filter(expr, func) - Filters the input array using the given predicate.

**Examples:** 
```sql
> SELECT filter(array(1, 2, 3), x -> x % 2 == 1);
 [1,3]
> SELECT filter(array(0, 2, 3), (x, i) -> x > i);
 [2,3]
> SELECT filter(array(0, null, 2, 3, null), x -> x IS NOT NULL);
 [0,2,3]
```
**Note:**
The inner function may use the index argument since 3.0.0.
**Since:** 2.4.0
<hr/>



## **find_in_set**
find_in_set(str, str_array) - Returns the index (1-based) of the given string (`str`) in the comma-delimited list (`str_array`). Returns 0, if the string was not found or if the given string (`str`) contains a comma.

**Examples:** 
```sql
> SELECT find_in_set('ab','abc,b,ab,c,def');
 3
```
**Note:**
The inner function may use the index argument since 3.0.0.

**Since:** 1.5.0
<hr/>


## **first**
first(expr[, isIgnoreNull]) - Returns the first value of `expr` for a group of rows. If `isIgnoreNull` is true, returns only non-null values.

**Examples:** 
```sql
> SELECT first(col) FROM VALUES (10), (5), (20) AS tab(col);
 10
> SELECT first(col) FROM VALUES (NULL), (5), (20) AS tab(col);
 NULL
> SELECT first(col, true) FROM VALUES (NULL), (5), (20) AS tab(col);
 5
```
**Note:**
The function is non-deterministic because its results depends on the order of the rows which may be non-deterministic after a shuffle.

**Since:** 2.0.0
<hr/>


## **first_value**
first_value(expr[, isIgnoreNull]) - Returns the first value of `expr` for a group of rows. If `isIgnoreNull` is true, returns only non-null values.

**Examples:** 
```sql
> SELECT first_value(col) FROM VALUES (10), (5), (20) AS tab(col);
 10
> SELECT first_value(col) FROM VALUES (NULL), (5), (20) AS tab(col);
 NULL
> SELECT first_value(col, true) FROM VALUES (NULL), (5), (20) AS tab(col);
 5
```
**Note:**
The function is non-deterministic because its results depends on the order of the rows which may be non-deterministic after a shuffle.

**Since:** 2.0.0
<hr/>


## **flatten**
flatten(arrayOfArrays) - Transforms an array of arrays into a single array.

**Examples:** 
```sql
> SELECT flatten(array(array(1, 2), array(3, 4)));
 [1,2,3,4]
```

**Since:** 2.4.0
<hr/>


## **float**
float(expr) - Casts the value `expr` to the target data type ```float```.

<br/>

---

<br/>



## **floor**
floor(expr) - Returns the largest integer not greater than `expr`.

**Examples:** 
```sql
> SELECT floor(-0.1);
 -1
> SELECT floor(5);
 5
```
<br/>

---

<br/>


## **forall**
forall(expr, pred) - Tests whether a predicate holds for all elements in the array.

**Examples:** 
```sql
> SELECT forall(array(1, 2, 3), x -> x % 2 == 0);
 false
> SELECT forall(array(2, 4, 8), x -> x % 2 == 0);
 true
> SELECT forall(array(1, null, 3), x -> x % 2 == 0);
 false
> SELECT forall(array(2, null, 8), x -> x % 2 == 0);
 NULL
```

**Since:** 3.0.0

<br/>

---

<br/>



## **format_number**
format_number(expr1, expr2) - Formats the number `expr1` like '#,###,###.##', rounded to `expr2` decimal places. If `expr2` is 0, the result has no decimal point or fractional part. `expr2` also accept a user specified format. This is supposed to function like MySQL's FORMAT.

**Examples:** 
```sql
> SELECT format_number(12332.123456, 4);
 12,332.1235
> SELECT format_number(12332.123456, '##################.###');
 12332.123
```

**Since:** 1.5.0

<br/>

---

<br/>




## **format_string**
format_string(strfmt, obj, ...) - Returns a formatted string from printf-style format strings.

**Examples:** 
```sql
> SELECT format_string("Hello World %d %s", 100, "days");
 Hello World 100 days
```

**Since:** 1.5.0

<br/>

---

<br/>


## **from_csv**
from_csv(csvStr, schema[, options]) - Returns a struct value with the given ```csvStr``` and ```schema```.

**Examples:** 
```sql
> SELECT from_csv('1, 0.8', 'a INT, b DOUBLE');
 {"a":1,"b":0.8}
> SELECT from_csv('26/08/2015', 'time Timestamp', map('timestampFormat', 'dd/MM/yyyy'));
 {"time":2015-08-26 00:00:00}
```

**Since:** 3.0.0

<br/>

---

<br/>


## **from_json**
from_json(jsonStr, schema[, options]) - Returns a struct value with the given ```jsonStr``` and ```schema```.

**Examples:** 
```sql
> SELECT from_json('{"a":1, "b":0.8}', 'a INT, b DOUBLE');
 {"a":1,"b":0.8}
> SELECT from_json('{"time":"26/08/2015"}', 'time Timestamp', map('timestampFormat', 'dd/MM/yyyy'));
 {"time":2015-08-26 00:00:00}
```

**Since:** 2.2.0

<br/>

---

<br/>


## **from_unixtime**
from_unixtime(unix_time, format) - Returns ```unix_time``` in the specified ```format```.

**Arguments:**
  * unix_time - UNIX Timestamp to be converted to the provided format.
  * format - Date/time format pattern to follow. See Datetime Patterns for valid date and time format patterns.


**Examples:** 
```sql
> SELECT from_unixtime(0, 'yyyy-MM-dd HH:mm:ss');
 1969-12-31 16:00:00
```

**Since:** 1.5.0

<br/>

---

<br/>


## **from_utc_timestamp**
from_utc_timestamp(timestamp, timezone) - Given a timestamp like '2017-07-14 02:40:00.0', interprets it as a time in UTC, and renders that time as a timestamp in the given time zone. For example, 'GMT+1' would yield '2017-07-14 03:40:00.0'.

**Examples:** 
```sql
> SELECT from_utc_timestamp('2016-08-31', 'Asia/Seoul');
 2016-08-31 09:00:00
```

**Since:** 1.5.0

<br/>

---

<br/>


## **get_json_object**
get_json_object(json_txt, path) - Extracts a json object from ```path```.

**Examples:** 
```sql
> SELECT get_json_object('{"a":"b"}', '$.a');
 b
```
<br/>

---

<br/>


## **greatest**
greatest(expr, ...) - Returns the greatest value of all parameters, skipping null values.

**Examples:** 
```sql
> SELECT greatest(10, 9, 2, 4, 3);
 10
```
<br/>

---

<br/>


## **grouping**
grouping(col) - indicates whether a specified column in a GROUP BY is aggregated or not, returns 1 for aggregated or 0 for not aggregated in the result set.",

**Examples:** 
```sql
> SELECT name, grouping(name), sum(age) FROM VALUES (2, 'Alice'), (5, 'Bob') people(age, name) GROUP BY cube(name);
  Bob   0   5
  Alice 0   2
  NULL  1   7
```

**Since:** 2.0.0

<br/>

---

<br/>



## **grouping_id**
grouping_id([col1[, col2 ..]]) - returns the level of grouping, equals to ```(grouping(c1) << (n-1)) + (grouping(c2) << (n-2)) + ... + grouping(cn)```

**Examples:** 
```sql
> SELECT name, grouping_id(), sum(age), avg(height) FROM VALUES (2, 'Alice', 165), (5, 'Bob', 180) people(age, name, height) GROUP BY cube(name, height);
  NULL  2   5   180.0
  Alice 0   2   165.0
  NULL  3   7   172.5
  NULL  2   2   165.0
  Bob   1   5   180.0
  Alice 1   2   165.0
  Bob   0   5   180.0
```
**Note:**
Input columns should match with grouping columns exactly, or empty (means all the grouping columns).

**Since:** 2.0.0

<br/>

---

<br/>



## **hash**
hash(expr1, expr2, ...) - Returns a hash value of the arguments.

**Examples:** 
```sql
> SELECT hash('Spark', array(123), 2);
 -1321691492
```
<br/>

---

<br/>


## **hex**
hex(expr) - Converts `expr` to hexadecimal.

**Examples:** 
```sql
> SELECT hex(17);
 11
> SELECT hex('Spark SQL');
 537061726B2053514C
```
<br/>

---

<br/>


## **hour**
hour(timestamp) - Returns the hour component of the string/timestamp.

**Examples:** 
```sql
> SELECT hour('2009-07-30 12:58:59');
 12
```

**Since:** 1.5.0

<br/>

---

<br/>


## **hypot**
hypot(expr1, expr2) - Returns sqrt(```expr12``` + ```expr22```).

**Examples:** 
```sql
> SELECT hypot(3, 4);
 5.0
```
<br/>

---

<br/>


## **if**
if(expr1, expr2, expr3) - If `expr1` evaluates to true, then returns `expr2`; otherwise returns `expr3`.

**Examples:** 
```sql
> SELECT if(1 < 2, 'a', 'b');
 a
```
<br/>

---

<br/>


## **ifnull**
ifnull(expr1, expr2) - Returns `expr2` if `expr1` is null, or `expr1` otherwise.

**Examples:** 
```sql
> SELECT ifnull(NULL, array('2'));
 ["2"]
```

**Since:** 2.0.0

<br/>

---

<br/>



## **in**
expr1 in(expr2, expr3, ...) - Returns true if `expr` equals to any valN.

**Arguments:**
expr1, expr2, expr3, ... - the arguments must be same type.

**Examples:** 
```sql
> SELECT 1 in(1, 2, 3);
 true
> SELECT 1 in(2, 3, 4);
 false
> SELECT named_struct('a', 1, 'b', 2) in(named_struct('a', 1, 'b', 1), named_struct('a', 1, 'b', 3));
 false
> SELECT named_struct('a', 1, 'b', 2) in(named_struct('a', 1, 'b', 2), named_struct('a', 1, 'b', 3));
 true
```
<br/>

---

<br/>



## **initcap**
initcap(str) - Returns `str` with the first letter of each word in uppercase. All other letters are in lowercase. Words are delimited by white space.

**Examples:** 
```sql
> SELECT initcap('sPark sql');
 Spark Sql
```

**Since:** 1.5.0
<hr/>


## **inline**
inline(expr) - Explodes an array of structs into a table. Uses column names col1, col2, etc. by default unless specified otherwise.

**Examples:** 
```sql
> SELECT inline(array(struct(1, 'a'), struct(2, 'b')));
 1  a
 2  b
```

<br/>

---

<br/>


## **inline_outer**
inline_outer(expr) - Explodes an array of structs into a table. Uses column names col1, col2, etc. by default unless specified otherwise.

**Examples:** 
```sql
> SELECT inline_outer(array(struct(1, 'a'), struct(2, 'b')));
 1  a
 2  b
```

<br/>

---

<br/>


## **input_file_block_length**
input_file_block_length() - Returns the length of the block being read, or -1 if not available.

<br/>

---

<br/>


## **input_file_block_start**
input_file_block_start() - Returns the start offset of the block being read, or -1 if not available.

<br/>

---

<br/>


## **input_file_name**
input_file_name() - Returns the name of the file being read, or empty string if not available.

<br/>

---

<br/>


## **instr**
instr(str, substr) - Returns the (1-based) index of the first occurrence of `substr` in `str`.

**Examples:** 
```sql
> SELECT instr('SparkSQL', 'SQL');
 6
```

**Since:** 1.5.0

<br/>

---

<br/>


## **int**
int(expr) - Casts the value `expr` to the target data type `int`.

<br/>

---

<br/>


## **isnan**
isnan(expr) - Returns true if `expr` is NaN, or false otherwise.

**Examples:** 
```sql
> SELECT isnan(cast('NaN' as double));
 true
```

**Since:** 1.5.0

<br/>

---

<br/>


## **isnotnull**
isnotnull(expr) - Returns true if `expr` is not null, or false otherwise.

**Examples:** 
```sql
> SELECT isnotnull(1);
 true
```

**Since:** 1.0.0

<br/>

---

<br/>


## **isnull**
isnull(expr) - Returns true if `expr` is null, or false otherwise.

**Examples:** 
```sql
> SELECT isnull(1);
 false
```

**Since:** 1.0.0

<br/>

---

<br/>


## **java_method**
java_method(class, method[, arg1[, arg2 ..]]) - Calls a method with reflection.

**Examples:** 
```sql
> SELECT java_method('java.util.UUID', 'randomUUID');
 c33fb387-8500-4bfa-81d2-6e0e3e930df2
> SELECT java_method('java.util.UUID', 'fromString', 'a5cf6c42-0c85-418f-af6c-3e4e5b1328f2');
 a5cf6c42-0c85-418f-af6c-3e4e5b1328f2
```

<br/>

---

<br/>


## **json_tuple**
json_tuple(jsonStr, p1, p2, ..., pn) - Returns a tuple like the function get_json_object, but it takes multiple names. All the input parameters and output column types are string.

**Examples:** 
```sql
> SELECT json_tuple('{"a":1, "b":2}', 'a', 'b');
 1  2
```

<br/>

---

<br/>


## **kurtosis**
kurtosis(expr) - Returns the kurtosis value calculated from values of a group.

**Examples:** 
```sql
> SELECT kurtosis(col) FROM VALUES (-10), (-20), (100), (1000) AS tab(col);
 -0.7014368047529627
> SELECT kurtosis(col) FROM VALUES (1), (10), (100), (10), (1) as tab(col);
 0.19432323191699075
```

**Since:** 1.6.0

<br/>

---

<br/>



## **lag**
lag(input[, offset[, default]]) - Returns the value of `input` at the `offset`th row before the current row in the window. The default value of `offset` is 1 and the default value of `default` is null. If the value of `input` at the `offset`th row is null, null is returned. If there is no such offset row (e.g., when the offset is 1, the first row of the window does not have any previous row), `default` is returned.

**Arguments:**
  * input - a string expression to evaluate offset rows before the current row.
  * offset - an int expression which is rows to jump back in the partition.
  * default - a string expression which is to use when the offset row does not exist.


**Since:** 2.0.0

<br/>

---

<br/>



## **last**
last(expr[, isIgnoreNull]) - Returns the last value of expr for a group of rows. If `isIgnoreNull` is true, returns only non-null values

**Examples:** 
```sql
> SELECT last(col) FROM VALUES (10), (5), (20) AS tab(col);
 20
> SELECT last(col) FROM VALUES (10), (5), (NULL) AS tab(col);
 NULL
> SELECT last(col, true) FROM VALUES (10), (5), (NULL) AS tab(col);
 5
```

**Note:**
  The function is non-deterministic because its results depends on the order of the rows which may be non-deterministic after a shuffle.

**Since:** 2.0.0

<br/>

---

<br/>


## **last_day**
last_day(date) - Returns the last day of the month which the date belongs to.

**Examples:** 
```sql
> SELECT last_day('2009-01-12');
 2009-01-31
```

**Since:** 1.5.0

<br/>

---

<br/>


## **last_value**
last_value(expr[, isIgnoreNull]) - Returns the last value of `expr` for a group of rows. If `isIgnoreNull` is true, returns only non-null values

**Examples:** 
```sql
> SELECT last_value(col) FROM VALUES (10), (5), (20) AS tab(col);
 20
> SELECT last_value(col) FROM VALUES (10), (5), (NULL) AS tab(col);
 NULL
> SELECT last_value(col, true) FROM VALUES (10), (5), (NULL) AS tab(col);
 5
```
**Note:**
The function is non-deterministic because its results depends on the order of the rows which may be non-deterministic after a shuffle.

**Since:** 2.0.0

<br/>

---

<br/>


## **lcase**
lcase(str) - Returns `str` with all characters changed to lowercase.

**Examples:** 
```sql
> SELECT lcase('SparkSql');
 sparksql
```

**Since:** 1.0.1

<br/>

---

<br/>


## **lead**
lead(input[, offset[, default]]) - Returns the value of `input` at the `offset`th row after the current row in the window. The default value of `offset` is 1 and the default value of `default` is null. If the value of `input` at the `offset`th row is null, null is returned. If there is no such an offset row (e.g., when the offset is 1, the last row of the window does not have any subsequent row), `default` is returned.

**Arguments:**
  * input - a string expression to evaluate `offset` rows after the current row.
  * offset - an int expression which is rows to jump ahead in the partition.
  * default - a string expression which is to use when the offset is larger than the window. The default value is null.


**Since:** 2.0.0

<br/>

---

<br/>



## **least**
least(expr, ...) - Returns the least value of all parameters, skipping null values.

**Examples:** 
```sql
> SELECT least(10, 9, 2, 4, 3);
 2
```

<br/>

---

<br/>


## **left**
left(str, len) - Returns the leftmost `len`(`len` can be string type) characters from the string `str`,if `len` is less or equal than 0 the result is an empty string.

**Examples:** 
```sql
> SELECT left('Spark SQL', 3);
 Spa
```
**Since:** 2.3.0

<br/>

---

<br/>



## **length**
length(expr) - Returns the character length of string data or number of bytes of binary data. The length of string data includes the trailing spaces. The length of binary data includes binary zeros.

**Examples:** 
```sql
> SELECT length('Spark SQL ');
 10
> SELECT CHAR_LENGTH('Spark SQL ');
 10
> SELECT CHARACTER_LENGTH('Spark SQL ');
 10
```
**Since:** 1.5.0

<br/>

---

<br/>



## **levenshtein**
levenshtein(str1, str2) - Returns the Levenshtein distance between the two given strings.

**Examples:** 
```sql
> SELECT levenshtein('kitten', 'sitting');
 3
```
**Since:** 1.5.0

<br/>

---

<br/>



## **like**
str like pattern[ ESCAPE escape] - Returns true if str matches `pattern` with escape, null if any arguments are null, false otherwise.

**Arguments:**
  * str - a string expression
  * pattern - a string expression. The pattern is a string which is matched literally, with exception to the following special symbols:
_ matches any one character in the input (similar to . in posix regular expressions)
% matches zero or more characters in the input (similar to .* in posix regular expressions)
Since Spark 2.0, string literals are unescaped in our SQL parser. For example, in order to match "\abc", the pattern should be "\abc".
When SQL config 'spark.sql.parser.escapedStringLiterals' is enabled, it fallbacks to Spark 1.6 behavior regarding string literal parsing. For example, if the config is enabled, the pattern to match "\abc" should be "\abc". * escape - an character added since Spark 3.0. The default escape character is the '\'. If an escape character precedes a special symbol or another escape character, the following character is matched literally. It is invalid to escape any other character.

**Examples:** 
```sql
> SELECT like('Spark', '_park');
true
> SET spark.sql.parser.escapedStringLiterals=true;
spark.sql.parser.escapedStringLiterals  true
> SELECT '%SystemDrive%\Users\John' like '\%SystemDrive\%\\Users%';
true
> SET spark.sql.parser.escapedStringLiterals=false;
spark.sql.parser.escapedStringLiterals  false
> SELECT '%SystemDrive%\\Users\\John' like '\%SystemDrive\%\\\\Users%';
true
> SELECT '%SystemDrive%/Users/John' like '/%SystemDrive/%//Users%' ESCAPE '/';
true
```

**Note:**
Use RLIKE to match with standard regular expressions.


**Since:** 1.0.0

<br/>

---

<br/>


## **ln**
ln(expr) - Returns the natural logarithm (base e) of `expr`.

**Examples:** 
```sql
> SELECT ln(1);
 0.0
```
<br/>

---

<br/>


## **locate**
locate(substr, str[, pos]) - Returns the position of the first occurrence of `substr` in `str` after position `pos`. The given `pos` and return value are 1-based.

**Examples:** 
```sql
> SELECT locate('bar', 'foobarbar');
 4
> SELECT locate('bar', 'foobarbar', 5);
 7
> SELECT POSITION('bar' IN 'foobarbar');
 4
```
**Since:** 1.5.0

<br/>

---

<br/>



## **log**
log(base, expr) - Returns the logarithm of `expr` with `base`.

**Examples:** 
```sql
> SELECT log(10, 100);
 2.0
```

<br/>

---

<br/>


## **log10**
log10(expr) - Returns the logarithm of `expr` with base 10.

**Examples:** 
```sql
> SELECT log10(10);
 1.0
```

<br/>

---

<br/>



## **log1p**
log1p(expr) - Returns log(1 + `expr`).

**Examples:** 
```sql
> SELECT log1p(0);
 0.0
```

<br/>

---

<br/>



## **log2**
log2(expr) - Returns the logarithm of `expr` with base 2.

**Examples:** 
```sql
> SELECT log2(2);
 1.0
```

<br/>

---

<br/>




## **lower**
lower(str) - Returns `str` with all characters changed to lowercase.

**Examples:** 
```sql
> SELECT lower('SparkSql');
 sparksql
```

**Since:** 1.0.1

<br/>

---

<br/>



## **lpad**
lpad(str, len[, pad]) - Returns `str`, left-padded with `pad` to a length of `len`. If `str` is longer than `len`, the return value is shortened to `len` characters. If `pad` is not specified, `str` will be padded to the left with space characters.

**Examples:** 
```sql
> SELECT lpad('hi', 5, '??');
 ???hi
> SELECT lpad('hi', 1, '??');
 h
> SELECT lpad('hi', 5);
    hi
```

**Since:** 1.5.1

<br/>

---

<br/>



## **ltrim**
ltrim(str) - Removes the leading space characters from `str`.

**Arguments:**
  * str - a string expression
  * trimStr - the trim string characters to trim, the default value is a single space


**Examples:** 
```sql
> SELECT ltrim('    SparkSQL   ');
 SparkSQL
```

**Since:** 1.5.0

<br/>

---

<br/>



## **make_date**
make_date(year, month, day) - Create date from year, month and day fields.

**Arguments:**
  * year - the year to represent, from 1 to 9999
  * month - the month-of-year to represent, from 1 (January) to 12 (December)
  * day - the day-of-month to represent, from 1 to 31
  

**Examples:** 
```sql
> SELECT make_date(2013, 7, 15);
 2013-07-15
> SELECT make_date(2019, 13, 1);
 NULL
> SELECT make_date(2019, 7, NULL);
 NULL
> SELECT make_date(2019, 2, 30);
 NULL
```

**Since:** 3.0.0

<br/>

---

<br/>



## **make_interval**
make_interval(years, months, weeks, days, hours, mins, secs) - Make interval from years, months, weeks, days, hours, mins and secs.

**Arguments:**
  * years - the number of years, positive or negative
  * months - the number of months, positive or negative
  * weeks - the number of weeks, positive or negative
  * days - the number of days, positive or negative
  * hours - the number of hours, positive or negative
  * mins - the number of minutes, positive or negative
  * secs - the number of seconds with the fractional part in microsecond precision.
  

**Examples:** 
```sql
> SELECT make_interval(100, 11, 1, 1, 12, 30, 01.001001);
 100 years 11 months 8 days 12 hours 30 minutes 1.001001 seconds
> SELECT make_interval(100, null, 3);
 NULL
> SELECT make_interval(0, 1, 0, 1, 0, 0, 100.000001);
 1 months 1 days 1 minutes 40.000001 seconds
```

**Since:** 3.0.0

<br/>

---

<br/>



## **make_timestamp**
make_timestamp(year, month, day, hour, min, sec[, timezone]) - Create timestamp from year, month, day, hour, min, sec and timezone fields.

**Arguments:**
  * year - the year to represent, from 1 to 9999
  * month - the month-of-year to represent, from 1 (January) to 12 (December)
  * day - the day-of-month to represent, from 1 to 31
  * hour - the hour-of-day to represent, from 0 to 23
  * min - the minute-of-hour to represent, from 0 to 59
  * sec - the second-of-minute and its micro-fraction to represent, from 0 to 60. If the sec argument equals to 60, the seconds field is set to 0 and 1 minute is added to the final timestamp.
  * timezone - the time zone identifier. For example, CET, UTC and etc.
    

**Examples:** 
```sql
> SELECT make_timestamp(2014, 12, 28, 6, 30, 45.887);
 2014-12-28 06:30:45.887
> SELECT make_timestamp(2014, 12, 28, 6, 30, 45.887, 'CET');
 2014-12-27 21:30:45.887
> SELECT make_timestamp(2019, 6, 30, 23, 59, 60);
 2019-07-01 00:00:00
> SELECT make_timestamp(2019, 13, 1, 10, 11, 12, 'PST');
 NULL
> SELECT make_timestamp(null, 7, 22, 15, 30, 0);
 NULL
```

**Since:** 3.0.0

<br/>

---

<br/>


## **map**
map(key0, value0, key1, value1, ...) - Creates a map with the given key/value pairs.


**Examples:** 
```sql
> SELECT map(1.0, '2', 3.0, '4');
 {1.0:"2",3.0:"4"}
```

<br/>

---

<br/>


## **map_concat**
map_concat(map, ...) - Returns the union of all the given maps


**Examples:** 
```sql
> SELECT map_concat(map(1, 'a', 2, 'b'), map(3, 'c'));
 {1:"a",2:"b",3:"c"}
```

**Since:** 2.4.0

<br/>

---

<br/>


## **map_entries**
map_entries(map) - Returns an unordered array of all entries in the given map.


**Examples:** 
```sql
> SELECT map_entries(map(1, 'a', 2, 'b'));
 [{"key":1,"value":"a"},{"key":2,"value":"b"}]
```

**Since:** 3.0.0

<br/>

---

<br/>



## **map_filter**
map_filter(expr, func) - Filters entries in a map using the function.


**Examples:** 
```sql
> SELECT map_filter(map(1, 0, 2, 2, 3, -1), (k, v) -> k > v);
 {1:0,3:-1}
```

**Since:** 3.0.0

<br/>

---

<br/>


## **map_from_arrays**
map_from_arrays(keys, values) - Creates a map with a pair of the given key/value arrays. All elements in keys should not be null


**Examples:** 
```sql
> SELECT map_from_arrays(array(1.0, 3.0), array('2', '4'));
 {1.0:"2",3.0:"4"}
```

**Since:** 2.4.0

<br/>

---

<br/>


## **map_from_entries**
map_from_entries(arrayOfEntries) - Returns a map created from the given array of entries.


**Examples:** 
```sql
> SELECT map_from_entries(array(struct(1, 'a'), struct(2, 'b')));
 {1:"a",2:"b"}
```

**Since:** 2.4.0

<br/>

---

<br/>



## **map_keys**
map_keys(map) - Returns an unordered array containing the keys of the map.


**Examples:** 
```sql
> SELECT map_keys(map(1, 'a', 2, 'b'));
 [1,2]
```

<br/>

---

<br/>


## **map_values**
map_values(map) - Returns an unordered array containing the values of the map.


**Examples:** 
```sql
> SELECT map_values(map(1, 'a', 2, 'b'));
 ["a","b"]
```

<br/>

---

<br/>


## **map_zip_with**
map_zip_with(map1, map2, function) - Merges two given maps into a single map by applying function to the pair of values with the same key. For keys only presented in one map, NULL will be passed as the value for the missing key. If an input map contains duplicated keys, only the first entry of the duplicated key is passed into the lambda function.


**Examples:** 
```sql
> SELECT map_zip_with(map(1, 'a', 2, 'b'), map(1, 'x', 2, 'y'), (k, v1, v2) -> concat(v1, v2));
 {1:"ax",2:"by"}
```

**Since:** 3.0.0

<br/>

---

<br/>


## **max**
max(expr) - Returns the maximum value of `expr`.


**Examples:** 
```sql
> SELECT max(col) FROM VALUES (10), (50), (20) AS tab(col);
 50
```

**Since:** 1.0.0

<br/>

---

<br/>



## **max_by**
max_by(x, y) - Returns the value of `x` associated with the maximum value of `y`.


**Examples:** 
```sql
> SELECT max_by(x, y) FROM VALUES (('a', 10)), (('b', 50)), (('c', 20)) AS tab(x, y);
 b
```

**Since:** 3.0.0

<br/>

---

<br/>



## **md5**
md5(expr) - Returns an MD5 128-bit checksum as a hex string of `expr`.


**Examples:** 
```sql
> SELECT md5('Spark');
 8cde774d6f7333752ed72cacddb05126
```

<br/>

---

<br/>


## **mean**
mean(expr) - Returns the mean calculated from values of a group.


**Examples:** 
```sql
 > SELECT mean(col) FROM VALUES (1), (2), (3) AS tab(col);
 2.0
> SELECT mean(col) FROM VALUES (1), (2), (NULL) AS tab(col);
 1.5
```

**Since:** 1.0.0

<br/>

---

<br/>



## **min**
min(expr) - Returns the minimum value of `expr`.


**Examples:** 
```sql
> SELECT min(col) FROM VALUES (10), (-1), (20) AS tab(col);
 -1
```

**Since:** 1.0.0

<br/>

---

<br/>


## **min_by**
min_by(x, y) - Returns the value of `x` associated with the minimum value of `y`.


**Examples:** 
```sql
> SELECT min_by(x, y) FROM VALUES (('a', 10)), (('b', 50)), (('c', 20)) AS tab(x, y);
 a
```

**Since:** 3.0.0

<br/>

---

<br/>


## **minute**
minute(timestamp) - Returns the minute component of the string/timestamp.


**Examples:** 
```sql
> SELECT minute('2009-07-30 12:58:59');
 58
```

**Since:** 1.5.0

<br/>

---

<br/>



## **mod**
expr1 mod expr2 - Returns the remainder after `expr1`/`expr2`.


**Examples:** 
```sql
> SELECT 2 % 1.8;
 0.2
> SELECT MOD(2, 1.8);
 0.2
```
<br/>

---

<br/>


## **monotonically_increasing_id**
monotonically_increasing_id() - Returns monotonically increasing 64-bit integers. The generated ID is guaranteed to be monotonically increasing and unique, but not consecutive. The current implementation puts the partition ID in the upper 31 bits, and the lower 33 bits represent the record number within each partition. The assumption is that the data frame has less than 1 billion partitions, and each partition has less than 8 billion records. The function is non-deterministic because its result depends on partition IDs.

<br/>

---

<br/>



## **month**
month(date) - Returns the month component of the date/timestamp.


**Examples:** 
```sql
> SELECT month('2016-07-30');
 7
```
**Since:** 1.5.0

<br/>

---

<br/>


## **months_between**
months_between(timestamp1, timestamp2[, roundOff]) - If `timestamp1` is later than `timestamp2`, then the result is positive. If `timestamp1` and `timestamp2` are on the same day of month, or both are the last day of month, time of day will be ignored. Otherwise, the difference is calculated based on 31 days per month, and rounded to 8 digits unless roundOff=false.


**Examples:** 
```sql
> SELECT months_between('1997-02-28 10:30:00', '1996-10-30');
 3.94959677
> SELECT months_between('1997-02-28 10:30:00', '1996-10-30', false);
 3.9495967741935485
```
**Since:** 1.5.0

<br/>

---

<br/>


## **named_struct**
named_struct(name1, val1, name2, val2, ...) - Creates a struct with the given field names and values.


**Examples:** 
```sql
> SELECT named_struct("a", 1, "b", 2, "c", 3);
 {"a":1,"b":2,"c":3}
```

<br/>

---

<br/>


## **nanvl**
nanvl(expr1, expr2) - Returns `expr1` if it's not NaN, or `expr2` otherwise.


**Examples:** 
```sql
> SELECT nanvl(cast('NaN' as double), 123);
 123.0
```

**Since:** 1.5.0

<br/>

---

<br/>


## **negative**
negative(expr) - Returns the negated value of `expr`.


**Examples:** 
```sql
> SELECT negative(1);
 -1
```
<br/>

---

<br/>


## **next_day**
next_day(start_date, day_of_week) - Returns the first date which is later than `start_date` and named as indicated.


**Examples:** 
```sql
> SELECT next_day('2015-01-14', 'TU');
 2015-01-20
```

**Since:** 1.5.0

<br/>

---

<br/>



## **not**
not expr - Logical not.
<br/>

---

<br/>



## **now**
now() - Returns the current timestamp at the start of query evaluation.


**Examples:** 
```sql
> SELECT now();
 2020-04-25 15:49:11.914
```

**Since:** 1.6.0

<br/>

---

<br/>


## **ntile**
ntile(n) - Divides the rows for each window partition into `n` buckets ranging from 1 to at most `n`.


**Arguments:** 
  * buckets - an int expression which is number of buckets to divide the rows in. Default value is 1.


**Since:** 2.0.0

<br/>

---

<br/>


## **nullif**
nullif(expr1, expr2) - Returns null if `expr1` equals to `expr2`, or `expr1` otherwise.


**Examples:** 
```sql
> SELECT nullif(2, 2);
 NULL
```

**Since:** 2.0.0

<br/>

---

<br/>



## **nvl**
nvl(expr1, expr2) - Returns `expr2` if `expr1` is null, or `expr1` otherwise.


**Examples:** 
```sql
> SELECT nvl(NULL, array('2'));
 ["2"]
```

**Since:** 2.0.0

<br/>

---

<br/>


## **nvl2**
nvl2(expr1, expr2, expr3) - Returns `expr2` if `expr1` is not null, or `expr3` otherwise.


**Examples:** 
```sql
> SELECT nvl2(NULL, 2, 1);
 1
```

**Since:** 2.0.0

<br/>

---

<br/>



## **octet_length**
octet_length(expr) - Returns the byte length of string data or number of bytes of binary data.


**Examples:** 
```sql
> SELECT octet_length('Spark SQL');
 9
```

**Since:** 2.3.0

<br/>

---

<br/>


## **or**
expr1 or expr2 - Logical OR.

<br/>

---

<br/>



## **overlay**
overlay(input, replace, pos[, len]) - Replace `input` with ```replace``` that starts at `pos` and is of length `len`.


**Examples:** 
```sql
> SELECT overlay('Spark SQL' PLACING '_' FROM 6);
 Spark_SQL
> SELECT overlay('Spark SQL' PLACING 'CORE' FROM 7);
 Spark CORE
> SELECT overlay('Spark SQL' PLACING 'ANSI ' FROM 7 FOR 0);
 Spark ANSI SQL
> SELECT overlay('Spark SQL' PLACING 'tructured' FROM 2 FOR 4);
 Structured SQL
> SELECT overlay(encode('Spark SQL', 'utf-8') PLACING encode('_', 'utf-8') FROM 6);
 Spark_SQL
> SELECT overlay(encode('Spark SQL', 'utf-8') PLACING encode('CORE', 'utf-8') FROM 7);
 Spark CORE
> SELECT overlay(encode('Spark SQL', 'utf-8') PLACING encode('ANSI ', 'utf-8') FROM 7 FOR 0);
 Spark ANSI SQL
> SELECT overlay(encode('Spark SQL', 'utf-8') PLACING encode('tructured', 'utf-8') FROM 2 FOR 4);
 Structured SQL
```

<br/>

---

<br/>


## **parse_url**
parse_url(url, partToExtract[, key]) - Extracts a part from a URL.


**Examples:** 
```sql
> SELECT parse_url('http://spark.apache.org/path?query=1', 'HOST');
 spark.apache.org
> SELECT parse_url('http://spark.apache.org/path?query=1', 'QUERY');
 query=1
> SELECT parse_url('http://spark.apache.org/path?query=1', 'QUERY', 'query');
 1
```

**Since:** 2.0.0

<br/>

---

<br/>


## **percent_rank**
percent_rank() - Computes the percentage ranking of a value in a group of values.


**Arguments:** 
  * children - this is to base the rank on; a change in the value of one the children will trigger a change in rank. This is an internal parameter and will be assigned by the Analyser.
  * 

**Since:** 2.0.0

<br/>

---

<br/>



## **percentile**
percentile(col, percentage [, frequency]) - Returns the exact percentile value of numeric column `col` at the given percentage. The value of percentage must be between 0.0 and 1.0. The value of frequency should be positive integral

percentile(col, array(percentage1 [, percentage2]...) [, frequency]) - Returns the exact percentile value array of numeric column `col` at the given percentage(s). Each value of the percentage array must be between 0.0 and 1.0. The value of frequency should be positive integral


**Examples:** 
```sql
> SELECT percentile(col, 0.3) FROM VALUES (0), (10) AS tab(col);
 3.0
> SELECT percentile(col, array(0.25, 0.75)) FROM VALUES (0), (10) AS tab(col);
 [2.5,7.5]
```

**Since:** 2.1.0

<br/>

---

<br/>


## **percentile_approx**
percentile_approx(col, percentage [, accuracy]) - Returns the approximate percentile value of numeric column `col` at the given percentage. The value of percentage must be between 0.0 and 1.0. The `accuracy` parameter (default: 10000) is a positive numeric literal which controls approximation accuracy at the cost of memory. Higher value of `accuracy` yields better accuracy, `1.0/accuracy` is the relative error of the approximation. When `accuracy` is an array, each value of the percentage array must be between 0.0 and 1.0. In this case, returns the approximate percentile array of column `col` at the given percentage array.



**Examples:** 
```sql
> SELECT percentile_approx(10.0, array(0.5, 0.4, 0.1), 100);
 [10.0,10.0,10.0]
> SELECT percentile_approx(10.0, 0.5, 100);
 10.0
```

**Since:** 2.1.0

<br/>

---

<br/>



## **pi**
pi() - Returns pi.

**Examples:** 
```sql
> SELECT pi();
 3.141592653589793
```

<br/>

---

<br/>



## **pmod**
pmod(expr1, expr2) - Returns the positive value of `expr1` mod `expr2`.

**Examples:** 
```sql
> SELECT pmod(10, 3);
 1
> SELECT pmod(-10, 3);
 2
```

<br/>

---

<br/>



## **posexplode**
posexplode(expr) - Separates the elements of array `expr` into multiple rows with positions, or the elements of map `expr` into multiple rows and columns with positions. Unless specified otherwise, uses the column name `pos` for position, `col` for elements of the array or `key` and `value` for elements of the map.

**Examples:** 
```sql
> SELECT posexplode(array(10,20));
 0  10
 1  20
```

<br/>

---

<br/>



## posexplode_outer

posexplode_outer(expr) - Separates the elements of array `expr` into multiple rows with positions, or the elements of map `expr` into multiple rows and columns with positions. Unless specified otherwise, uses the column name `pos` for position, `col` for elements of the array or `key` and `value` for elements of the map.

**Examples:** 
```sql
> SELECT posexplode_outer(array(10,20));
 0  10
 1  20
```

<br/>

---

<br/>



## **position**
position(substr, str[, pos]) - Returns the position of the first occurrence of `substr` in `str` after position `pos`. The given `pos` and return value are 1-based.

**Examples:** 
```sql
> SELECT position('bar', 'foobarbar');
 4
> SELECT position('bar', 'foobarbar', 5);
 7
> SELECT POSITION('bar' IN 'foobarbar');
 4
```

**Since:** 1.5.0

<br/>

---

<br/>


## **positive**
positive(expr) - Returns the value of `expr`.


<br/>

---

<br/>



## **pow**
pow(expr1, expr2) - Raises `expr1` to the power of `expr2`.

**Examples:** 
```sql
> SELECT pow(2, 3);
 8.0
```

<br/>

---

<br/>


## **power**
power(expr1, expr2) - Raises `expr1` to the power of `expr2`.

**Examples:** 
```sql
> SELECT power(2, 3);
 8.0
```

<br/>

---

<br/>



## **printf**
printf(strfmt, obj, ...) - Returns a formatted string from printf-style format strings.

**Examples:** 
```sql
> SELECT printf("Hello World %d %s", 100, "days");
 Hello World 100 days
```

**Since:** 1.5.0

<br/>

---

<br/>


## **quarter**
quarter(date) - Returns the quarter of the year for date, in the range 1 to 4.

**Examples:** 
```sql
> SELECT quarter('2016-08-31');
 3
```

**Since:** 1.5.0

<br/>

---

<br/>


## **radians**
radians(expr) - Converts degrees to radians.

**Arguments:** 

  * expr - angle in degrees

**Examples:** 
```sql
> SELECT radians(180);
 3.141592653589793
```
<br/>

---

<br/>


## **rand**
rand([seed]) - Returns a random value with independent and identically distributed (i.i.d.) uniformly distributed values in [0, 1).

**Examples:** 
```sql
> SELECT rand();
 0.9629742951434543
> SELECT rand(0);
 0.8446490682263027
> SELECT rand(null);
 0.8446490682263027
```
**Note:**
The function is non-deterministic in general case.

**Since:** 1.5.0

<br/>

---

<br/>


## **randn**
rand([seed]) - Returns a random value with independent and identically distributed (i.i.d.) uniformly distributed values in [0, 1).

**Examples:** 
```sql
> SELECT rand();
 > SELECT randn();
 -0.3254147983080288
> SELECT randn(0);
 1.1164209726833079
> SELECT randn(null);
 1.1164209726833079
```
**Note:**
The function is non-deterministic in general case.

**Since:** 1.5.0

<br/>

---

<br/>



## **random**
random([seed]) - Returns a random value with independent and identically distributed (i.i.d.) uniformly distributed values in [0, 1).

**Examples:** 
```sql
> SELECT random();
 0.9629742951434543
> SELECT random(0);
 0.8446490682263027
> SELECT random(null);
 0.8446490682263027
```
**Note:**
The function is non-deterministic in general case.

**Since:** 1.5.0

<br/>

---

<br/>



## **rank**
rank() - Computes the rank of a value in a group of values. The result is one plus the number of rows preceding or equal to the current row in the ordering of the partition. The values will produce gaps in the sequence.

**Arguments:** 
  * children - this is to base the rank on; a change in the value of one the children will trigger a change in rank. This is an internal parameter and will be assigned by the Analyser.
  

**Since:** 2.0.0

<br/>

---

<br/>



## **reflect**
reflect(class, method[, arg1[, arg2 ..]]) - Calls a method with reflection.

**Examples:** 
```sql
> SELECT reflect('java.util.UUID', 'randomUUID');
 c33fb387-8500-4bfa-81d2-6e0e3e930df2
> SELECT reflect('java.util.UUID', 'fromString', 'a5cf6c42-0c85-418f-af6c-3e4e5b1328f2');
 a5cf6c42-0c85-418f-af6c-3e4e5b1328f2
```
regexp_extract(str, regexp[, idx]) - Extracts a group that matches regexp.

**Arguments:**
  * str - a string expression.
  * regexp - a string representing a regular expression. The regex string should be a Java regular expression.
  * idx - an integer expression that representing the group index. The group index should be non-negative. If ```idx``` is not specified, the default group index value is 1.

**Examples:** 
```sql
> SELECT regexp_extract('100-200', '(\\d+)-(\\d+)', 1);
 100
```

**Since:** 1.5.0

<br/>

---

<br/>


## **regexp_replace**
regexp_replace(str, regexp, rep) - Replaces all substrings of `str` that match ```regexp``` with ```rep```.

**Examples:** 
```sql
> SELECT regexp_replace('100-200', '(\\d+)', 'num');
 num-num
```

**Since:** 1.5.0

<br/>

---

<br/>


## **repeat**
repeat(str, n) - Returns the string which repeats the given string value n times.

**Examples:** 
```sql
> SELECT repeat('123', 2);
 123123
```

**Since:** 1.5.0

<br/>

---

<br/>




## **replace**
replace(str, search[, replace]) - Replaces all occurrences of search with replace.

**Arguments:** 
  * str - a string expression
  * search - a string expression. If search is not found in `str`, `str` is returned unchanged.
  * replace - a string expression. If ```replace``` is not specified or is an empty string, nothing replaces the string that is removed from `str`.

**Examples:** 
```sql
> SELECT replace('ABCabc', 'abc', 'DEF');
 ABCDEF
```

**Since:** 2.3.0

<br/>

---

<br/>



## **reverse**
reverse(array) - Returns a reversed string or an array with reverse order of elements.

**Examples:** 
```sql
> SELECT reverse('Spark SQL');
 LQS krapS
> SELECT reverse(array(2, 1, 4, 3));
 [3,4,1,2]
```

**Note:**
Reverse logic for arrays is available since 2.4.0.

**Since:** 1.5.0

<br/>

---

<br/>



## **right**
right(str, len) - Returns the rightmost `len`(`len` can be string type) characters from the string `str`,if `len` is less or equal than 0 the result is an empty string.

**Examples:** 
```sql
> SELECT right('Spark SQL', 3);
 SQL
```

**Since:** 2.3.0

<br/>

---

<br/>


## **rint**
rint(expr) - Returns the double value that is closest in value to the argument and is equal to a mathematical integer.

**Examples:** 
```sql
> SELECT rint(12.3456);
 12.0
```

<br/>

---

<br/>



## **rlike**
str rlike regexp - Returns true if `str` matches ```regexp```, or false otherwise.

**Arguments:** 
  * str - a string expression
  * regexp - a string expression. The regex string should be a Java regular expression.
  Since Spark 2.0, string literals (including regex patterns) are unescaped in our SQL parser. For example, to match "\abc", a regular expression for ```regexp``` can be "^\abc$".
  There is a SQL config 'spark.sql.parser.escapedStringLiterals' that can be used to fallback to the Spark 1.6 behavior regarding string literal parsing. For example, if the config is enabled, the ```regexp``` that can match "\abc" is "^\abc$".


**Examples:** 
```sql
> SET spark.sql.parser.escapedStringLiterals=true;
spark.sql.parser.escapedStringLiterals  true
> SELECT '%SystemDrive%\Users\John' rlike '%SystemDrive%\\Users.*';
true
> SET spark.sql.parser.escapedStringLiterals=false;
spark.sql.parser.escapedStringLiterals  false
> SELECT '%SystemDrive%\\Users\\John' rlike '%SystemDrive%\\\\Users.*';
true
```
**Note:**
Use LIKE to match with simple string pattern.

**Since:** 1.0.0

<br/>

---

<br/>


## **rollup**
rollup([col1[, col2 ..]]) - create a multi-dimensional rollup using the specified columns so that we can run aggregation on them.

**Examples:** 
```sql
> SELECT name, age, count(*) FROM VALUES (2, 'Alice'), (5, 'Bob') people(age, name) GROUP BY rollup(name, age);
  Bob   5   1
  Alice 2   1
  NULL  NULL    2
  Bob   NULL    1
  Alice NULL    1
```

**Since:** 2.0.0

<br/>

---

<br/>


## **round**
round(expr, d) - Returns `expr` rounded to `d` decimal places using HALF_UP rounding mode.

**Examples:** 
```sql
> SELECT round(2.5, 0);
 3
```

**Since:** 2.0.0

<br/>

---

<br/>



## **row_number**
row_number() - Assigns a unique, sequential number to each row, starting with one, according to the ordering of rows within the window partition.

**Since:** 2.0.0

<br/>

---

<br/>




## **rpad**
rpad(str, len[, pad]) - Returns `str`, right-padded with `pad` to a length of `len`. If `str` is longer than `len`, the return value is shortened to `len` characters. If `pad` is not specified, `str` will be padded to the right with space characters.

**Examples:** 
```sql
> SELECT rpad('hi', 5, '??');
 hi???
> SELECT rpad('hi', 1, '??');
 h
> SELECT rpad('hi', 5);
 hi
```

**Since:** 1.5.0

<br/>

---

<br/>



## **rtrim**
rtrim(str) - Removes the trailing space characters from `str`.

**Arguments:** 
  * str - a string expression
  * trimStr - the trim string characters to trim, the default value is a single space

**Examples:** 
```sql
> SELECT rtrim('    SparkSQL   ');
 SparkSQL
```

**Since:** 1.5.0

<br/>

---

<br/>



## **schema_of_csv**
schema_of_csv(csv[, options]) - Returns schema in the DDL format of CSV string.

**Examples:** 
```sql
> SELECT schema_of_csv('1,abc');
 struct<_c0:int,_c1:string>
```

**Since:** 3.0.0

<br/>

---

<br/>



## **schema_of_json**
schema_of_json(json[, options]) - Returns schema in the DDL format of JSON string.

**Examples:** 
```sql
> SELECT schema_of_json('[{"col":0}]');
 array<struct<col:bigint>>
> SELECT schema_of_json('[{"col":01}]', map('allowNumericLeadingZeros', 'true'));
 array<struct<col:bigint>>
```

**Since:** 2.4.0

<br/>

---

<br/>


## **second**
second(timestamp) - Returns the second component of the string/timestamp.

**Examples:** 
```sql
> SELECT second('2009-07-30 12:58:59');
 59
```

**Since:** 1.5.0

<br/>

---

<br/>



## **sentences**
sentences(str[, lang, country]) - Splits `str` into an array of array of words.

**Examples:** 
```sql
> SELECT sentences('Hi there! Good morning.');
 [["Hi","there"],["Good","morning"]]
```

**Since:** 2.0.0

<br/>

---

<br/>



## **sequence**
sequence(start, stop, step) - Generates an array of elements from start to stop (inclusive), incrementing by step. The type of the returned elements is the same as the type of argument expressions.

Supported types are: byte, short, integer, long, date, timestamp.

The start and stop expressions must resolve to the same type. If start and stop expressions resolve to the 'date' or 'timestamp' type then the step expression must resolve to the 'interval' type, otherwise to the same type as the start and stop expressions.

**Arguments:** 
  * start - an expression. The start of the range.
  * stop - an expression. The end the range (inclusive).
  * step - an optional expression. The step of the range. By default step is 1 if start is less than or equal to stop, otherwise -1. For the temporal sequences it's 1 day and -1 day respectively. If start is greater than stop then the step must be negative, and vice versa.


**Examples:** 
```sql
> SELECT sequence(1, 5);
 [1,2,3,4,5]
> SELECT sequence(5, 1);
 [5,4,3,2,1]
> SELECT sequence(to_date('2018-01-01'), to_date('2018-03-01'), interval 1 month);
 [2018-01-01,2018-02-01,2018-03-01]
```

**Since:** 2.4.0

<br/>

---

<br/>



## **sha**
sha(expr) - Returns a sha1 hash value as a hex string of the `expr`.

**Examples:** 
```sql
> SELECT sha('Spark');
 85f5955f4b27a9a4c2aab6ffe5d7189fc298b92c
```

<br/>

---

<br/>


## **sha1**
sha1(expr) - Returns a sha1 hash value as a hex string of the `expr`.

**Examples:** 
```sql
> SELECT sha1('Spark');
 85f5955f4b27a9a4c2aab6ffe5d7189fc298b92c
```

<br/>

---

<br/>


## **sha2**
sha2(expr, bitLength) - Returns a checksum of SHA-2 family as a hex string of expr. SHA-224, SHA-256, SHA-384, and SHA-512 are supported. Bit length of 0 is equivalent to 256.

**Examples:** 
```sql
> SELECT sha2('Spark', 256);
 529bc3b07127ecb7e53a4dcf1991d9152c24537d919178022b2c42657f79a26b
```

<br/>

---

<br/>



## **shiftleft**
shiftleft(base, expr) - Bitwise left shift.

**Examples:** 
```sql
> SELECT shiftleft(2, 1);
 4
```

<br/>

---

<br/>


## **shiftright**
shiftright(base, expr) - Bitwise (signed) right shift.

**Examples:** 
```sql
> SELECT shiftright(4, 1);
 2
```

<br/>

---

<br/>


## **shiftrightunsigned**
shiftrightunsigned(base, expr) - Bitwise unsigned right shift.

**Examples:** 
```sql
> SELECT shiftrightunsigned(4, 1);
 2
```

<br/>

---

<br/>



## **shuffle**
shuffle(array) - Returns a random permutation of the given array.

**Examples:** 
```sql
> SELECT shuffle(array(1, 20, 3, 5));
 [3,1,5,20]
> SELECT shuffle(array(1, 20, null, 3));
 [20,null,3,1]
```

**Note:**
The function is non-deterministic.

**Since:** 2.4.0

<br/>

---

<br/>


## **sign**
sign(expr) - Returns -1.0, 0.0 or 1.0 as `expr` is negative, 0 or positive.

**Examples:** 
```sql
> SELECT sign(40);
 1.0
```

<br/>

---

<br/>


## **signum**
signum(expr) - Returns -1.0, 0.0 or 1.0 as `expr` is negative, 0 or positive.

**Examples:** 
```sql
> SELECT signum(40);
 1.0
```

<br/>

---

<br/>




## **sin**
sin(expr) - Returns the sine of `expr`, as if computed by ```java.lang.Math.sin```.

**Arguments:**
  * expr - angle in radians

**Examples:** 
```sql
> SELECT sin(0);
 0.0
```

<br/>

---

<br/>


## **sinh**
sinh(expr) - Returns hyperbolic sine of `expr`, as if computed by ```java.lang.Math.sinh```.

**Arguments:**
  * expr - hyperbolic angle


**Examples:** 
```sql
> SELECT sinh(0);
 0.0
```
<br/>

---

<br/>




## **size**
size(expr) - Returns the size of an array or a map. The function returns null for null input if spark.sql.legacy.sizeOfNull is set to false or spark.sql.ansi.enabled is set to true. Otherwise, the function returns -1 for null input. With the default settings, the function returns -1 for null input.


**Examples:** 
```sql
> SELECT size(array('b', 'd', 'c', 'a'));
 4
> SELECT size(map('a', 1, 'b', 2));
 2
> SELECT size(NULL);
 -1
```

<br/>

---

<br/>



## **skewness**
skewness(expr) - Returns the skewness value calculated from values of a group.


**Examples:** 
```sql
> SELECT skewness(col) FROM VALUES (-10), (-20), (100), (1000) AS tab(col);
 1.1135657469022011
> SELECT skewness(col) FROM VALUES (-1000), (-100), (10), (20) AS tab(col);
 -1.1135657469022011
```

**Since: **1.6.0
<hr/>



## **slice**
slice(x, start, length) - Subsets array x starting from index start (array indices start at 1, or starting from the end if start is negative) with the specified length.


**Examples:** 
```sql
> SELECT slice(array(1, 2, 3, 4), 2, 2);
 [2,3]
> SELECT slice(array(1, 2, 3, 4), -2, 2);
 [3,4]
```

**Since: **2.4.0
<hr/>



## **smallint**
```sql
smallint(expr) - Casts the value `expr` to the target data type ```smallint```.

<br/>

---

<br/>


## **some**
some(expr) - Returns true if at least one value of `expr` is true.


**Examples:** 
```sql
> SELECT some(col) FROM VALUES (true), (false), (false) AS tab(col);
 true
> SELECT some(col) FROM VALUES (NULL), (true), (false) AS tab(col);
 true
> SELECT some(col) FROM VALUES (false), (false), (NULL) AS tab(col);
 false
```

**Since: **3.0.0
<hr/>



## **sort_array**
sort_array(array[, ascendingOrder]) - Sorts the input array in ascending or descending order according to the natural ordering of the array elements. Null elements will be placed at the beginning of the returned array in ascending order or at the end of the returned array in descending order.


**Examples:** 
```sql
> SELECT sort_array(array('b', 'd', null, 'c', 'a'), true);
 [null,"a","b","c","d"]
```

<br/>

---

<br/>



## **soundex**
soundex(str) - Returns Soundex code of the string.


**Examples:** 
```sql
> SELECT soundex('Miller');
 M460
```

**Since: **1.5.0
<hr/>



## **space**
space(n) - Returns a string consisting of `n` spaces.


**Examples:** 
```sql
> SELECT concat(space(2), '1');
   1
```

**Since: **1.5.0
<hr/>



## **spark_partition_id**
spark_partition_id() - Returns the current partition id.

<br/>

---

<br/>



## **split**
split(str, regex, limit) - Splits `str` around occurrences that match ```regex``` and returns an array with a length of at most ```limit```

**Arguments:**
  * str - a string expression to split.
  * regex - a string representing a regular expression. The regex string should be a Java regular expression.
  * limit - an integer expression which controls the number of times the regex is applied.
      * limit > 0: The resulting array's length will not be more than limit, and the resulting array's last entry will contain all input beyond the last matched regex.
      * limit <= 0: regex will be applied as many times as possible, and the resulting array can be of any size.


**Examples:** 
```sql
> SELECT split('oneAtwoBthreeC', '[ABC]');
 ["one","two","three",""]
> SELECT split('oneAtwoBthreeC', '[ABC]', -1);
 ["one","two","three",""]
> SELECT split('oneAtwoBthreeC', '[ABC]', 2);
 ["one","twoBthreeC"]
```

**Since: **1.5.0
<hr/>



## **sqrt**
sqrt(expr) - Returns the square root of `expr`.


**Examples:** 
```sql
> SELECT sqrt(4);
 2.0
```

<br/>

---

<br/>




## **stack**
stack(n, expr1, ..., exprk) - Separates `expr1`, ..., ```exprk``` into `n` rows. Uses column names col0, col1, etc. by default unless specified otherwise.


**Examples:** 
```sql
> SELECT stack(2, 1, 2, 3);
 1  2
 3  NULL
```

<br/>

---

<br/>


## **std**
std(expr) - Returns the sample standard deviation calculated from values of a group.


**Examples:** 
```sql
> SELECT std(col) FROM VALUES (1), (2), (3) AS tab(col);
 1.0
```

**Since:** 1.6.0

<br/>

---

<br/>


## **stddev**
stddev(expr) - Returns the sample standard deviation calculated from values of a group.


**Examples:** 
```sql
> SELECT stddev(col) FROM VALUES (1), (2), (3) AS tab(col);
 1.0
```

**Since:** 1.6.0

<br/>

---

<br/>



## **stddev_pop**
stddev_pop(expr) - Returns the population standard deviation calculated from values of a group.


**Examples:** 
```sql
> SELECT stddev_pop(col) FROM VALUES (1), (2), (3) AS tab(col);
 0.816496580927726
```

**Since:** 1.6.0

<br/>

---

<br/>



## **stddev_samp**
stddev_samp(expr) - Returns the sample standard deviation calculated from values of a group.


**Examples:** 
```sql
> SELECT stddev_samp(col) FROM VALUES (1), (2), (3) AS tab(col);
 1.0
```

**Since:** 1.6.0

<br/>

---

<br/>



## **str_to_map**
str_to_map(text[, pairDelim[, keyValueDelim]]) - Creates a map after splitting the text into key/value pairs using delimiters. Default delimiters are ',' for ```pairDelim``` and ':' for ```keyValueDelim```. Both ```pairDelim``` and ```keyValueDelim``` are treated as regular expressions.


**Examples:** 
```sql
> SELECT str_to_map('a:1,b:2,c:3', ',', ':');
 {"a":"1","b":"2","c":"3"}
> SELECT str_to_map('a');
 {"a":null}
```

**Since:** 2.0.0

<br/>

---

<br/>



## **string**
string(expr) - Casts the value `expr` to the target data type ```string```.

<br/>

---

<br/>


## **struct**
struct(col1, col2, col3, ...) - Creates a struct with the given field values.

<br/>

---

<br/>



## **substr**
substr(str, pos[, len]) - Returns the substring of `str` that starts at `pos` and is of length `len`, or the slice of byte array that starts at `pos` and is of length `len`.

substr(str FROM pos[ FOR len]]) - Returns the substring of `str` that starts at `pos` and is of length `len`, or the slice of byte array that starts at `pos` and is of length `len`.


**Examples:** 
```sql
> SELECT substr('Spark SQL', 5);
 k SQL
> SELECT substr('Spark SQL', -3);
 SQL
> SELECT substr('Spark SQL', 5, 1);
 k
> SELECT substr('Spark SQL' FROM 5);
 k SQL
> SELECT substr('Spark SQL' FROM -3);
 SQL
> SELECT substr('Spark SQL' FROM 5 FOR 1);
 k
```

**Since:** 1.5.0

<br/>

---

<br/>




## **substring**
substring(str, pos[, len]) - Returns the substring of `str` that starts at `pos` and is of length `len`, or the slice of byte array that starts at `pos` and is of length `len`.

substring(str FROM pos[ FOR len]]) - Returns the substring of `str` that starts at `pos` and is of length `len`, or the slice of byte array that starts at `pos` and is of length `len`.

**Examples:** 
```sql
> SELECT substring('Spark SQL', 5);
 k SQL
> SELECT substring('Spark SQL', -3);
 SQL
> SELECT substring('Spark SQL', 5, 1);
 k
> SELECT substring('Spark SQL' FROM 5);
 k SQL
> SELECT substring('Spark SQL' FROM -3);
 SQL
> SELECT substring('Spark SQL' FROM 5 FOR 1);
 k
```

**Since:** 1.5.0

<br/>

---

<br/>



## **substring_index**
substring_index(str, delim, count) - Returns the substring from `str` before ```count``` occurrences of the delimiter ```delim```. If ```count``` is positive, everything to the left of the final delimiter (counting from the left) is returned. If ```count``` is negative, everything to the right of the final delimiter (counting from the right) is returned. The function substring_index performs a case-sensitive match when searching for ```delim```.


**Examples:** 
```sql
> SELECT substring_index('www.apache.org', '.', 2);
 www.apache
```

**Since:** 1.5.0

<br/>

---

<br/>



## **sum**
sum(expr) - Returns the sum calculated from values of a group.


**Examples:** 
```sql
> SELECT sum(col) FROM VALUES (5), (10), (15) AS tab(col);
 30
> SELECT sum(col) FROM VALUES (NULL), (10), (15) AS tab(col);
 25
> SELECT sum(col) FROM VALUES (NULL), (NULL) AS tab(col);
 NULL
```

**Since:** 1.0.0

<br/>

---

<br/>


## **tan**
tan(expr) - Returns the tangent of `expr`, as if computed by ```java.lang.Math.tan```.

**Arguments:**
  * expr - angle in radians
  

**Examples:** 
```sql
> SELECT tan(0);
 0.0
```

<br/>

---

<br/>



## **tanh**
tanh(expr) - Returns the hyperbolic tangent of `expr`, as if computed by ```java.lang.Math.tanh```.

**Arguments:**
  * expr - hyperbolic angle
  

**Examples:** 
```sql
> SELECT tanh(0);
 0.0
```

<br/>

---

<br/>



## **timestamp**
timestamp(expr) - Casts the value `expr` to the target data type `timestamp`.

<br/>

---

<br/>


## **tinyint**
tinyint(expr) - Casts the value `expr` to the target data type ```tinyint```.

<br/>

---

<br/>


## **to_csv**
to_date(date_str[, fmt]) - Parses the date_str expression with the fmt expression to a date. Returns null with invalid input. By default, it follows casting rules to a date if the fmt is omitted.

**Arguments:**
  * date_str - A string to be parsed to date.
  * fmt - Date format pattern to follow. See <a href="https://spark.apache.org/docs/latest/sql-ref-datetime-pattern.html" target="_blank"> Datetime Patterns </a> for valid date and time format patterns.
  

**Examples:** 
```sql
> SELECT to_date('2009-07-30 04:17:52');
 2009-07-30
> SELECT to_date('2016-12-31', 'yyyy-MM-dd');
 2016-12-31
```

**Since:** 1.5.0

<br/>

---

<br/>



## **to_date**
to_date(date_str[, fmt]) - Parses the date_str expression with the fmt expression to a date. Returns null with invalid input. By default, it follows casting rules to a date if the fmt is omitted.

**Arguments:**
  * date_str - A string to be parsed to date.
  * fmt - Date format pattern to follow. See <a href="https://spark.apache.org/docs/latest/sql-ref-datetime-pattern.html" target="_blank"> Datetime Patterns </a> for valid date and time format patterns.

  

**Examples:** 
```sql
> SELECT to_date('2009-07-30 04:17:52');
 2009-07-30
> SELECT to_date('2016-12-31', 'yyyy-MM-dd');
 2016-12-31
```

**Since:** 1.5.0

<br/>

---

<br/>



## **to_json**
to_json(expr[, options]) - Returns a JSON string with a given struct value

**Examples:** 
```sql
> SELECT to_json(named_struct('a', 1, 'b', 2));
 {"a":1,"b":2}
> SELECT to_json(named_struct('time', to_timestamp('2015-08-26', 'yyyy-MM-dd')), map('timestampFormat', 'dd/MM/yyyy'));
 {"time":"26/08/2015"}
> SELECT to_json(array(named_struct('a', 1, 'b', 2)));
 [{"a":1,"b":2}]
> SELECT to_json(map('a', named_struct('b', 1)));
 {"a":{"b":1}}
> SELECT to_json(map(named_struct('a', 1),named_struct('b', 2)));
 {"[1]":{"b":2}}
> SELECT to_json(map('a', 1));
 {"a":1}
> SELECT to_json(array((map('a', 1))));
 [{"a":1}]
```

**Since:** 2.2.0

<br/>

---

<br/>



## **to_timestamp**
to_timestamp(timestamp_str[, fmt]) - Parses the timestamp_str expression with the fmt expression to a timestamp. Returns null with invalid input. By default, it follows casting rules to a timestamp if the fmt is omitted.

**Arguments:**
  * timestamp_str - A string to be parsed to timestamp.
  * fmt - Timestamp format pattern to follow. See <a href="https://spark.apache.org/docs/latest/sql-ref-datetime-pattern.html" target="_blank"> Datetime Patterns </a> for valid date and time format patterns.

**Examples:** 
```sql
> SELECT to_timestamp('2016-12-31 00:12:00');
 2016-12-31 00:12:00
> SELECT to_timestamp('2016-12-31', 'yyyy-MM-dd');
 2016-12-31 00:00:00
```

**Since:** 2.2.0

<br/>

---

<br/>


## **to_unix_timestamp**
to_unix_timestamp(timeExp[, format]) - Returns the UNIX timestamp of the given time.

**Arguments:**
  *timeExp - A date/timestamp or string which is returned as a UNIX timestamp.
  * format - Date/time format pattern to follow. Ignored if timeExp is not a string. Default value is "yyyy-MM-dd HH:mm:ss". See <a href="https://spark.apache.org/docs/latest/sql-ref-datetime-pattern.html" target="_blank"> Datetime Patterns </a> for valid date and time format patterns.

**Examples:** 
```sql
> SELECT to_unix_timestamp('2016-04-08', 'yyyy-MM-dd');
 1460098800
```

**Since:** 1.6.0

<br/>

---

<br/>



## **to_utc_timestamp**
to_utc_timestamp(timestamp, timezone) - Given a timestamp like '2017-07-14 02:40:00.0', interprets it as a time in the given time zone, and renders that time as a timestamp in UTC. For example, 'GMT+1' would yield '2017-07-14 01:40:00.0'.

**Examples:** 
```sql
> SELECT to_utc_timestamp('2016-08-31', 'Asia/Seoul');
 2016-08-30 15:00:00
```

**Since:** 1.5.0

<br/>

---

<br/>



## **transform_keys**
transform_keys(expr, func) - Transforms elements in a map using the function.

**Examples:** 
```sql
> SELECT transform_keys(map_from_arrays(array(1, 2, 3), array(1, 2, 3)), (k, v) -> k + 1);
 {2:1,3:2,4:3}
> SELECT transform_keys(map_from_arrays(array(1, 2, 3), array(1, 2, 3)), (k, v) -> k + v);
 {2:1,4:2,6:3}
```

**Since:** 3.0.0

<br/>

---

<br/>


## **transform_values**
transform_values(expr, func) - Transforms values in the map using the function.

**Examples:** 
```sql
> SELECT transform_values(map_from_arrays(array(1, 2, 3), array(1, 2, 3)), (k, v) -> v + 1);
 {1:2,2:3,3:4}
> SELECT transform_values(map_from_arrays(array(1, 2, 3), array(1, 2, 3)), (k, v) -> k + v);
 {1:2,2:4,3:6}
```

**Since:** 3.0.0

<br/>

---

<br/>




## **translate**
translate(input, from, to) - Translates the `input` string by replacing the characters present in the ```from``` string with the corresponding characters in the ```to``` string.

**Examples:** 
```sql
> SELECT translate('AaBbCc', 'abc', '123');
 A1B2C3
```

**Since:** 1.5.0

<br/>

---

<br/>




## **trim**

trim(str) - Removes the leading and trailing space characters from `str`.

trim(BOTH FROM str) - Removes the leading and trailing space characters from `str`.

trim(LEADING FROM str) - Removes the leading space characters from `str`.

trim(TRAILING FROM str) - Removes the trailing space characters from `str`.

trim(trimStr FROM str) - Remove the leading and trailing `trimStr` characters from `str`.

trim(BOTH trimStr FROM str) - Remove the leading and trailing `trimStr` characters from `str`.

trim(LEADING trimStr FROM str) - Remove the leading `trimStr` characters from `str`.

trim(TRAILING trimStr FROM str) - Remove the trailing `trimStr` characters from `str`.

**Arguments:**
  *   str - a string expression
  * trimStr - the trim string characters to trim, the default value is a single space
  * BOTH, FROM - these are keywords to specify trimming string characters from both ends of the string
  * LEADING, FROM - these are keywords to specify trimming string characters from the left end of the string
  * TRAILING, FROM - these are keywords to specify trimming string characters from the right end of the string

**Examples:** 
```sql
> SELECT trim('    SparkSQL   ');
 SparkSQL
> SELECT trim(BOTH FROM '    SparkSQL   ');
 SparkSQL
> SELECT trim(LEADING FROM '    SparkSQL   ');
 SparkSQL
> SELECT trim(TRAILING FROM '    SparkSQL   ');
     SparkSQL
> SELECT trim('SL' FROM 'SSparkSQLS');
 parkSQ
> SELECT trim(BOTH 'SL' FROM 'SSparkSQLS');
 parkSQ
> SELECT trim(LEADING 'SL' FROM 'SSparkSQLS');
 parkSQLS
> SELECT trim(TRAILING 'SL' FROM 'SSparkSQLS');
 SSparkSQ
```

**Since:** 1.5.0

<br/>

---

<br/>



## **trunc**
trunc(date, fmt) - Returns `date` with the time portion of the day truncated to the unit specified by the format model ```fmt```.

**Examples:** 
```sql
> SELECT trunc('2019-08-04', 'week');
 2019-07-29
> SELECT trunc('2019-08-04', 'quarter');
 2019-07-01
> SELECT trunc('2009-02-12', 'MM');
 2009-02-01
> SELECT trunc('2015-10-27', 'YEAR');
 2015-01-01
```

**Since:** 1.5.0

<br/>

---

<br/>



## **typeof**
typeof(expr) - Return DDL-formatted type string for the data type of the input.

**Since:** 3.0.0

<br/>

---

<br/>



## **ucase**
ucase(str) - Returns `str` with all characters changed to uppercase.

**Examples:** 
```sql
> SELECT ucase('SparkSql');
 SPARKSQL
```

**Since:** 1.0.1

<br/>

---

<br/>



## **unbase64**
unbase64(str) - Converts the argument from a base 64 string `str` to a binary.

**Examples:** 
```sql
> SELECT unbase64('U3BhcmsgU1FM');
 Spark SQL
```

**Since:** 1.5.0

<br/>

---

<br/>



## **unhex**
unhex(expr) - Converts hexadecimal expr to binary.

**Examples:** 
```sql
> SELECT decode(unhex('537061726B2053514C'), 'UTF-8');
 Spark SQL
```
<br/>

---

<br/>


## **unix_timestamp**
unix_timestamp([timeExp[, format]]) - Returns the UNIX timestamp of current or specified time.

**Arguments:**
timeExp - A date/timestamp or string. If not provided, this defaults to current time.
  * format - Date/time format pattern to follow. Ignored if ```timeExp``` is not a string. Default value is "yyyy-MM-dd HH:mm:ss". See <a href="https://spark.apache.org/docs/latest/sql-ref-datetime-pattern.html" target="_blank"> Datetime Patterns </a> for valid date and time format patterns.

**Examples:** 
```sql
> SELECT unix_timestamp();
 1476884637
> SELECT unix_timestamp('2016-04-08', 'yyyy-MM-dd');
 1460041200
```

**Since:** 1.5.0

<br/>

---

<br/>



## **upper**
upper(str) - Returns str with all characters changed to uppercase.

**Examples:** 
```sql
> SELECT upper('SparkSql');
 SPARKSQL
```

**Since:** 1.0.1

<br/>

---

<br/>



## **uuid**
uuid() - Returns an universally unique identifier (UUID) string. The value is returned as a canonical UUID 36-character string.

**Examples:** 
```sql
> SELECT uuid();
 46707d92-02f4-4817-8116-a4c3b23e6266
```

**Note:**
The function is non-deterministic.

<br/>

---

<br/>



## **var_pop**
var_pop(expr) - Returns the population variance calculated from values of a group.

**Examples:** 
```sql
> SELECT var_pop(col) FROM VALUES (1), (2), (3) AS tab(col);
 0.6666666666666666
```

**Since:** 1.6.0

<br/>

---

<br/>



## **var_samp**
var_samp(expr) - Returns the sample variance calculated from values of a group.

**Examples:** 
```sql
> SELECT var_samp(col) FROM VALUES (1), (2), (3) AS tab(col);
 1.0
```

**Since:** 1.6.0

<br/>

---

<br/>


## **variance**
variance(expr) - Returns the sample variance calculated from values of a group.

**Examples:** 
```sql
> SELECT variance(col) FROM VALUES (1), (2), (3) AS tab(col);
 1.0
```

**Since:** 1.6.0

<br/>

---

<br/>


## **version**
version() - Returns the Spark version. The string contains 2 fields, the first being a release version and the second being a git revision.

**Since:** 3.0.0

<br/>

---

<br/>



## **weekday**
weekday(date) - Returns the day of the week for date/timestamp (0 = Monday, 1 = Tuesday, ..., 6 = Sunday).

**Examples:** 
```sql
> SELECT weekday('2009-07-30');
 3
```

**Since:** 2.4.0

<br/>

---

<br/>



## **weekofyear**
weekofyear(date) - Returns the week of the year of the given date. A week is considered to start on a Monday and week 1 is the first week with >3 days.

**Examples:** 
```sql
> SELECT weekofyear('2008-02-20');
 8
```

**Since:** 1.5.0

<br/>

---

<br/>



## **when**
CASE WHEN expr1 THEN expr2 [WHEN expr3 THEN expr4]* [ELSE expr5] END - When `expr1` = true, returns `expr2`; else when `expr3` = true, returns `expr4`; else returns `expr5`.

**Arguments:**
  * expr1, expr3 - the branch condition expressions should all be boolean type.
  * expr2, expr4, expr5 - the branch value expressions and else value expression should all be same type or coercible to a common type.


**Examples:** 
```sql
> SELECT CASE WHEN 1 > 0 THEN 1 WHEN 2 > 0 THEN 2.0 ELSE 1.2 END;
 1.0
> SELECT CASE WHEN 1 < 0 THEN 1 WHEN 2 > 0 THEN 2.0 ELSE 1.2 END;
 2.0
> SELECT CASE WHEN 1 < 0 THEN 1 WHEN 2 < 0 THEN 2.0 END;
 NULL
```

**Since:** 1.5.0

<br/>

---

<br/>

## **window**
N/A.
<br/>

---

<br/>


## **xpath**
xpath(xml, xpath) - Returns a string array of values within the nodes of xml that match the XPath expression.

**Examples:** 
```sql
> SELECT xpath('<a><b>b1</b><b>b2</b><b>b3</b><c>c1</c><c>c2</c></a>','a/b/text()');
 ["b1","b2","b3"]
```

<br/>

---

<br/>



## **xpath_boolean**
xpath_boolean(xml, xpath) - Returns true if the XPath expression evaluates to true, or if a matching node is found.

**Examples:** 
```sql
> SELECT xpath_boolean('<a><b>1</b></a>','a/b');
 true
```

<br/>

---

<br/>



## **xpath_double**
xpath_double(xml, xpath) - Returns a double value, the value zero if no match is found, or NaN if a match is found but the value is non-numeric.

**Examples:** 
```sql
> SELECT xpath_double('<a><b>1</b><b>2</b></a>', 'sum(a/b)');
 3.0
```

<br/>

---

<br/>



## **xpath_float**
xpath_float(xml, xpath) - Returns a float value, the value zero if no match is found, or NaN if a match is found but the value is non-numeric.

**Examples:** 
```sql
> SELECT xpath_float('<a><b>1</b><b>2</b></a>', 'sum(a/b)');
 3.0
```

<br/>

---

<br/>




## **xpath_int**
xpath_int(xml, xpath) - Returns an integer value, or the value zero if no match is found, or a match is found but the value is non-numeric.

**Examples:** 
```sql
> SELECT xpath_int('<a><b>1</b><b>2</b></a>', 'sum(a/b)');
 3
```

<br/>

---

<br/>



## **xpath_long**
xpath_long(xml, xpath) - Returns a long integer value, or the value zero if no match is found, or a match is found but the value is non-numeric.

**Examples:** 
```sql
> SELECT xpath_long('<a><b>1</b><b>2</b></a>', 'sum(a/b)');
 3
```

<br/>

---

<br/>


## **xpath_number**
xpath_number(xml, xpath) - Returns a double value, the value zero if no match is found, or NaN if a match is found but the value is non-numeric.

**Examples:** 
```sql
> SELECT xpath_number('<a><b>1</b><b>2</b></a>', 'sum(a/b)');
 3.0
```

<br/>

---

<br/>


## **xpath_short**
xpath_short(xml, xpath) - Returns a short integer value, or the value zero if no match is found, or a match is found but the value is non-numeric.

**Examples:** 
```sql
> SELECT xpath_short('<a><b>1</b><b>2</b></a>', 'sum(a/b)');
 3
```

<br/>

---

<br/>


## **xpath_string**
xpath_string(xml, xpath) - Returns the text contents of the first xml node that matches the XPath expression.

**Examples:** 
```sql
> SELECT xpath_string('<a><b>b</b><c>cc</c></a>','a/c');
 cc
```

<br/>

---

<br/>


## **xxhash64**
xxhash64(expr1, expr2, ...) - Returns a 64-bit hash value of the arguments.

**Examples:** 
```sql
> SELECT xxhash64('Spark', array(123), 2);
 5602566077635097486
```

**Since:** 3.0.0

<br/>

---

<br/>


## **year**
year(date) - Returns the year component of the date/timestamp.

**Examples:** 
```sql
> SELECT year('2016-07-30');
 2016
```

**Since:** 1.5.0

<br/>

---

<br/>


## **zip_with**
zip_with(left, right, func) - Merges the two given arrays, element-wise, into a single array using function. If one array is shorter, nulls are appended at the end to match the length of the longer array, before applying function.

**Examples:** 
```sql
> SELECT zip_with(array(1, 2, 3), array('a', 'b', 'c'), (x, y) -> (y, x));
 [{"y":"a","x":1},{"y":"b","x":2},{"y":"c","x":3}]
> SELECT zip_with(array(1, 2), array(3, 4), (x, y) -> x + y);
 [4,6]
> SELECT zip_with(array('a', 'b', 'c'), array('d', 'e', 'f'), (x, y) -> concat(x, y));
 ["ad","be","cf"]
```

**Since:** 2.4.0

<br/>

---

<br/>



## **|**
expr1 | expr2 - Returns the result of bitwise OR of `expr1` and `expr2`.

**Examples:** 
```sql
> SELECT 3 | 5;
 7
```

<br/>

---

<br/>



## **~**
~ expr - Returns the result of bitwise NOT of `expr`.

**Examples:** 
```sql
> SELECT ~ 0;
 -1
```


<br/>

---

<br/>
