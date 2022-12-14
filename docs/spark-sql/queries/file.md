---
title: File
description: Using file you can query a file with a specified format directly with SQL
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

### Description

You can query a file with a specified format directly with SQL.

### Syntax

```js
file_format.`file_path`
```
### Parameters

- **file_format**

    Specifies a file format for a given file path, could be TEXTFILE, ORC, PARQUET, etc.

- **file_path**

    Specifies a file path with a given format.

### Examples

```sql
-- PARQUET file
SELECT * FROM parquet.`examples/src/main/resources/users.parquet`;
+------+--------------+----------------+
|  name|favorite_color|favorite_numbers|
+------+--------------+----------------+
|Alyssa|          null|  [3, 9, 15, 20]|
|   Ben|           red|              []|
+------+--------------+----------------+

-- ORC file
SELECT * FROM orc.`examples/src/main/resources/users.orc`;
+------+--------------+----------------+
|  name|favorite_color|favorite_numbers|
+------+--------------+----------------+
|Alyssa|          null|  [3, 9, 15, 20]|
|   Ben|           red|              []|
+------+--------------+----------------+

-- JSON file
SELECT * FROM json.`examples/src/main/resources/people.json`;
+----+-------+
| age|   name|
+----+-------+
|null|Michael|
|  30|   Andy|
|  19| Justin|
+----+-------+
```