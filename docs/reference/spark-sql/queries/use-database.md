---
title: Use Database
description: USE statement is used to set the current database. Once set, the unqualified database artifacts that are referenced by SQLs are resolved from the current database
slug: /reference/spark-sql/use-database
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

### Description

USE statement is used to set the current database. Once set, the unqualified database artifacts such as tables, functions and views that are referenced by SQLs are resolved from the current database

:::info
The default database name is ‘default’
:::

**Syntax**

```sql
USE database_name
```

**Parameter**

`database_name` Name of the database will be used. If the database does not exist, an exception will be thrown.

**Example**

```sql
-- Use the 'userdb' which exists.
USE userdb;
+---------+--+
| Result  |
+---------+--+
+---------+--+

-- Use the 'userdb1' which doesn't exist
USE userdb1;
Error: org.apache.spark.sql.catalyst.analysis.NoSuchDatabaseException: Database 'userdb1' not found;(state=,code=0)
```
