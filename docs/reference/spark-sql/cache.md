---
title: Cache
description: Caches contents of a table or output of a query with the given storage level. This reduces scanning of the original files in future queries
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

Caches contents of a table or output of a query with the given storage level. This reduces scanning of the original files in future queries.

---

## Cache Table

`CACHE TABLE` statement caches contents of a table or output of a query with the given storage level. This reduces scanning of the original files in future queries.

### Syntax

```sql
CACHE [ LAZY ] TABLE table_name
    [ OPTIONS ( 'storageLevel' [ = ] value ) ] [ [ AS ] query ]
```

### Parameters

_`LAZY`_ Only cache the table when it is first used, instead of immediately.table*nameThe name of the table to be cached.*`OPTIONS ( 'storageLevel' [ = ] value )OPTIONS`_ clause with _`storageLevel`\_ key and value pair. A Warning is issued when a key other than storageLevel is used. The valid options for `storageLevel` are:

- `NONE`
- `DISK_ONLY`
- `DISK_ONLY_2`
- `MEMORY_ONLY`
- `MEMORY_ONLY_2`
- `MEMORY_ONLY_SER`
- `MEMORY_ONLY_SER_2`
- `MEMORY_AND_DISK`
- `MEMORY_AND_DISK_2`
- `MEMORY_AND_DISK_SER`
- `MEMORY_AND_DISK_SER_2`
- `OFF_HEAP `

An Exception is thrown when an invalid value is set for `storageLevel`. If `storageLevel` is not explicitly set using `OPTIONS` clause, the default `storageLevel` is set to `MEMORY_AND_DISK`._`query`_ A query that produces the rows to be cached. It can be in one of following formats:

- `a SELECT statement`
- `a TABLE statement`
- `a FROM statement`

### Examples

```sql
CACHE TABLE testCache OPTIONS ('storageLevel' 'DISK_ONLY') SELECT * FROM testData;
```

## **Uncache Table**

`UNCACHE TABLE` removes the entries and associated data from the in-memory and/or on-disk cache for a given table or view. The underlying entries should already have been brought to cache by previous `CACHE TABLE` operation. `UNCACHE TABLE` on a non-existent table throws Exception if `IF EXISTS` is not specified.

### Syntax

```sql
UNCACHE TABLE [ IF EXISTS ] table_name
```

### Parameters

_`table_name`_ The name of the table or view to be uncached.

### Examples

```sql
UNCACHE TABLE t1;
```

## Clear Cache

`CLEAR CACHE` removes the entries and associated data from the in-memory and/or on-disk cache for all cached tables and views.

### Syntax

```sql
CLEAR CACHE
```

### Examples

```sql
CLEAR CACHE;
```

## Refresh Tables

`REFRESH TABLE` statement invalidates the cached entries, which include data and metadata of the given table or view. The invalidated cache is populated in lazy manner when the cached table or the query associated with it is executed again.

### Syntax

```sql
REFRESH [TABLE] tableIdentifier
```

### Parameters

_`tableIdentifier`_ Specifies a table name, which is either a qualified or unqualified name that designates a table/view. If no database identifier is provided, it refers to a temporary view or a table/view in the current database.

### Syntax

```sql
[database_name.]table_name
```

### Examples

```sql
-- The cached entries of the table will be refreshed
-- The table is resolved from the current database as the table name is unqualified.
REFRESH TABLE tbl1;

-- The cached entries of the view will be refreshed or invalidated
-- The view is resolved from tempDB database, as the view name is qualified.
REFRESH TABLE tempDB.view1;
```
