---
title: Identifiers
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

<!-- <head>
  <title>Identifiers</title>
  <meta
    name="description"
    content="Identifiers"
  />
</head> -->


An identifier is a string used to identify a database object such as a table, view, schema, column, etc. Spark SQL has regular identifiers and delimited identifiers, which are enclosed within backtick
___

## Syntax
<br/>

**Regular Identifier** 
```json 
{ letter | digit | '_' } [ , ... ]
```

**Note**: `If spark.sql.ansi.enabled` is set to true, ANSI SQL reserved keywords cannot be used as identifiers. For more details, please refer to  <a href="https://spark.apache.org/docs/latest/sql-ref-ansi-compliance.html" target="_blank">ANSI Compliance</a>.

<br/>

**Delimited Identifier**
```json
`c [ ... ]`
```

<br/>

**Parameters**
  * **letter**
   Any letter from A-Z or a-z.
  * **digit**
   Any numeral from 0 to 9.
  * **c**
   Any character from the character set. Use ``` ` ``` to escape special characters (e.g., ``` ` ```).

<br/>

**Examples** 
```sql
-- This CREATE TABLE fails with ParseException because of the illegal identifier name a.b
CREATE TABLE test (a.b int);
org.apache.spark.sql.catalyst.parser.ParseException:
no viable alternative at input 'CREATE TABLE test (a.'(line 1, pos 20)

-- This CREATE TABLE works
CREATE TABLE test (`a.b` int);

-- This CREATE TABLE fails with ParseException because special character ` is not escaped
CREATE TABLE test1 (`a`b` int);
org.apache.spark.sql.catalyst.parser.ParseException:
no viable alternative at input 'CREATE TABLE test (`a`b`'(line 1, pos 23)

-- This CREATE TABLE works
CREATE TABLE test (`a``b` int);
```