---
title: Merge Into
---

<!-- <head>
  <title>Merge Into</title>
  <meta
    name="description"
    content="Merge Into"
  />
</head> -->

Merges a set of updates, insertions, and deletions based on a source table into a target Delta table
___

You can upsert data from an Apache Spark DataFrame into a Delta table using the `merge` operation. This operation is similar to the SQL `MERGE` command but has additional support for deletes and extra conditions in updates, inserts, and deletes.


**Syntax** 

```sql
MERGE INTO target_table_identifier [AS target_alias]
USING source_table_identifier [AS source_alias]
ON <merge_condition>
[ WHEN MATCHED [ AND <condition> ] THEN <matched_action> ]
[ WHEN MATCHED [ AND <condition> ] THEN <matched_action> ]
[ WHEN NOT MATCHED [ AND <condition> ]  THEN <not_matched_action> ]
```

where

  * **table_identifier** 
      * `[database_name.] table_name:` A table name, optionally qualified with a database name.
      * `delta.<path-to-table>`: The location of an existing Delta table.

  * **AS alias** 
    Define a table alias.

```sql
<merge_condition> =
  How the rows from one relation are combined with the rows of another relation. An expression with a return type of Boolean.

<matched_action>  =
  DELETE  |
  UPDATE SET *  |
  UPDATE SET column1 = value1 [, column2 = value2 ...]

<not_matched_action>  =
  INSERT *  |
  INSERT (column1 [, column2 ...]) VALUES (value1 [, value2 ...])
```

<br/>


**Operation semantics**

Here is a detailed description of the `merge` programmatic operation.

  * There can be any number of `whenMatched` and `whenNotMatched` clauses.
      * Multiple matches are allowed when matches are unconditionally deleted (since unconditional delete is not ambiguous even if there are multiple matches).

  * `whenMatched` clauses are executed when a source row matches a target table row based on the match condition. These clauses have the following semantics.
      * `whenMatched` clauses can have at most one `update` and one `delete` action. The `update` action in `merge` only updates the specified columns (similar to the `update` operation) of the matched target row. The `delete` action deletes the matched row.
      * Each `whenMatched` clause can have an optional condition. If this clause condition exists, the `update` or `delete` action is executed for any matching source-target row pair only when the clause condition is true.
      * If there are multiple `whenMatched` clauses, then they are evaluated in the order they are specified (that is, the order of the clauses matter). All `whenMatched` clauses, except the last one, must have conditions.
      * If multiple `whenMatched` clauses have conditions and none of the conditions are true for a matching source-target row pair, then the matched target row is left unchanged.
      * To update all the columns of the target Delta table with the corresponding columns of the source dataset, use `UPDATE SET *`. This is equivalent to `UPDATE SET col1 = source.col1 [, col2 = source.col2 ...]` for all the columns of the target Delta table. Therefore, this action assumes that the source table has the same columns as those in the target table, otherwise the query will throw an analysis error
 
 * `whenNotMatched` clauses are executed when a source row does not match any target row based on the match condition. These clauses have the following semantics.
     * `whenNotMatched` clauses can have only the `insert` action. The new row is generated based on the specified column and corresponding expressions. You do not need to specify all the columns in the target table. For unspecified target columns, `NULL` is inserted.
      * Each `whenNotMatched` clause can have an optional condition. If the clause condition is present, a source row is inserted only if that condition is true for that row. Otherwise, the source column is ignored.
      * If there are multiple `whenNotMatched` clauses, then they are evaluated in the order they are specified (that is, the order of the clauses matter). All `whenNotMatched` clauses, except the last one, must have conditions.
      * To insert all the columns of the target Delta table with the corresponding columns of the source dataset, use `INSERT *`. This is equivalent to `INSERT (col1 [, col2 ...]) VALUES (source.col1 [, source.col2 ...])` for all the columns of the target Delta table. Therefore, this action assumes that the source table has the same columns as those in the target table, otherwise the query will throw an analysis error.

:::warning Important
A MERGE operation can fail if multiple rows of the source dataset match and attempt to update the same rows of the target Delta table. According to the SQL semantics of merge, such an update operation is ambiguous as it is unclear which source row should be used to update the matched target row. You can preprocess the source table to eliminate the possibility of multiple matches.
:::

## **Examples**

You can use ```MERGE INTO``` for complex operations like deduplicating data, upserting change data, applying SCD Type 2 operations, etc.

Example 1. Merging new event updates

Suppose you have a table that contains new data for events with `eventId`. Some of these events may already be present in the `events` table. To merge the new data into the `events` table, you want to update the matching rows (that is, `eventId` already present) and insert the new rows (that is, `eventId` not present). You can run the following:

```sql
MERGE INTO events
USING updates
ON events.eventId = updates.eventId
WHEN MATCHED THEN
  UPDATE SET events.data = updates.data
WHEN NOT MATCHED
  THEN INSERT (date, eventId, data) VALUES (date, eventId, data)
  
-- short version
MERGE INTO events
USING updates
ON events.eventId = updates.eventId
WHEN MATCHED THEN
  UPDATE SET *
WHEN NOT MATCHED
  THEN INSERT *;
```

Example 2. Data deduplication when writing into Delta tables

A common ETL use case is to collect logs into Delta table by appending them to a table. However, often the sources can generate duplicate log records and downstream deduplication steps are needed to take care of them. With ```merge```, you can avoid inserting duplicate records.

```sql
MERGE INTO logs
USING newDedupedLogs
ON logs.uniqueId = newDedupedLogs.uniqueId
WHEN NOT MATCHED
  THEN INSERT *
```

:::info
The dataset containing the new logs needs to be deduplicated within itself. By the SQL semantics of merge, it matches and deduplicates the new data with the existing data in the table, but if there is duplicate data within the new dataset, it is inserted. Hence, deduplicate the new data before merging into the table.
:::


If you know that you may get duplicate records only for a few days, you can optimize your query further by partitioning the table by date, and then specifying the date range of the target table to match on

```sql
MERGE INTO logs
USING newDedupedLogs
ON logs.uniqueId = newDedupedLogs.uniqueId AND logs.date > current_date() - INTERVAL 7 DAYS
WHEN NOT MATCHED AND newDedupedLogs.date > current_date() - INTERVAL 7 DAYS
  THEN INSERT *
```


This is more efficient than the previous command as it looks for duplicates only in the last 7 days of logs, not the entire table.