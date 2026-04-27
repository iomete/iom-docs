---
title: DBT Incremental Models By Examples
sidebar_label: Incremental Models By Examples
description: Hands-on examples covering every incremental model configuration for dbt on IOMETE, including append, merge, schema changes, and common error cases.
last_update:
  date: 04/27/2026
  author: Shashank Chaudhary
---

Incremental models on IOMETE use Iceberg tables and support two strategies (`append` and `merge`), plus a handful of merge-specific options. This page walks through every supported configuration with working SQL examples and shows the table state after each run.

## Incremental Models Configurations

Incremental models are trickier to get right than views or tables, so it helps to see every knob in one place before working through examples. The tables below summarize the configurations DBT exposes for incremental models on IOMETE.

| Parameter | Default value | Expected values                                    |
| --- | --- |----------------------------------------------------|
| file_format | `iceberg` | `iceberg` (only supported value)                   |
| incremental_strategy | `merge` | `append`, `merge`                                  |
| on_schema_change | `ignore` | `ignore`, `append_new_columns`, `sync_all_columns`, `fail` |

**Incremental Strategies**

| Incremental Strategy | Description                                                                                             |
| --- |---------------------------------------------------------------------------------------------------------|
| append | Each run appends new rows to the table. Example: [_append_](#append)                                 |
| merge | Each run merges new rows with existing rows. Example: [_merge-with-unique_key_](#merge-with-unique_key) |

**Merge Incremental Strategy**

| Configuration | Behavior if not provided                                                                                      | Behavior when provided                                                                                               |
| --- |----------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| unique_key | Runs behave as append-only. Example: [_merge-without-unique_key_](#merge-without-unique_key) | Iceberg runs a merge on the given column. Example: [_merge-with-unique_key_](#merge-with-unique_key) |
| merge_update_columns | Every column is updated on merge. Example: [_merge-with-unique_key_](#merge-with-unique_key) | Only the listed columns are merged. Example: [_merge-with-update-columns_](#merge-with-update-columns) |
| merge_exclude_columns | Every column is updated on merge. | The listed columns are skipped, and all others are updated. Example: [_merge-with-exclude-columns_](#merge-with-exclude-columns) |
| incremental_predicates | Every target row is scanned during merge. | Only target rows matching the predicate are scanned, which speeds up merges on large tables. Example: [_merge-with-incremental-predicates_](#merge-with-incremental-predicates) |


**Schema Changes**

| Schema change | Description                                                                                             |
| --- |---------------------------------------------------------------------------------------------------------|
| ignore | Ignores schema changes. Example: [_ignore_](#ignore)                                                     |
| append_new_columns | Adds new fields and keeps removed ones. Example: [_append-new-columns_](#append-new-columns) |
| sync_all_columns | Adds new fields and drops missing ones. Example: [_sync-all-columns_](#sync-all-columns)              |
| fail | Fails the run when a schema change is detected. Example: [_fail_](#fail)                                        |


## Bad Incremental Models

A few configurations look perfectly reasonable but fail at run time. Knowing them upfront saves you a debugging round trip.

### Bad File Format


```sql title="models/incremental_strategies/models_bad/bad_file_format.sql"
{{ config(
    materialized = 'incremental',
    file_format = 'bad_format'
) }}

select 1
```
---

### Unsupported File Format for Incremental

:::info
Incremental models only support the `iceberg` file format. Any other `file_format` value errors out immediately, regardless of `incremental_strategy`.
:::

```sql title="models/incremental_strategies/models_bad/bad_file_format_incremental.sql"
{{ config(
    materialized = 'incremental',
    file_format = 'parquet'
) }}

select 1
```

**DBT Error on run**

```bash
Invalid incremental file format provided: parquet
    We only support 'iceberg' file format
```
---

### Bad Strategy

```sql title="models/incremental_strategies/models_bad/bad_strategy.sql"
{{ config(
    materialized = 'incremental',
    incremental_strategy = 'something_else',
) }}

select 1
```

**DBT Error**

```bash
Invalid incremental strategy provided: something_else
    Expected one of: 'append', 'merge', 'insert_overwrite'
```

:::note
The error lists `insert_overwrite` as a recognized value, but it isn't usable in practice. `insert_overwrite` requires a non-iceberg file format, which is also rejected. Stick with `append` or `merge`.
:::
---

## Examples

Each example below pairs the SQL you'd write with the table state you'd see after each run. Pick the one that matches your use case as a starting template.

### Append

```sql title="models/incremental_strategies/models_iceberg/append.sql"
{{ config(
    materialized = 'incremental',
    incremental_strategy = 'append'
) }}

{% if not is_incremental() %}

select cast(1 as bigint) as id, 'hello' as msg
union all
select cast(2 as bigint) as id, 'goodbye' as msg

{% else %}

select cast(2 as bigint) as id, 'yo' as msg
union all
select cast(3 as bigint) as id, 'anyway' as msg

{% endif %}
```

Results

```bash
# After 1st run
> select * from append;
+-----+----------+
| id  |   msg    |
+-----+----------+
| 1   | hello    |
| 2   | goodbye  |
+-----+----------+

# After 2nd run
> select * from append order by id
+-----+----------+
| id  |   msg    |
+-----+----------+
| 1   | hello    |
| 2   | yo       |
| 2   | goodbye  |
| 3   | anyway   |
+-----+----------+

```
---

### Merge Without unique_key

:::info
Without a merge key, the strategy quietly degrades to **append** mode.
:::

```sql title="models/incremental_strategies/models_iceberg/merge_no_key.sql"
{{ config(
    materialized = 'incremental',
    incremental_strategy = 'merge'
) }}

{% if not is_incremental() %}

select cast(1 as bigint) as id, 'hello' as msg
union all
select cast(2 as bigint) as id, 'goodbye' as msg

{% else %}

select cast(2 as bigint) as id, 'yo' as msg
union all
select cast(3 as bigint) as id, 'anyway' as msg

{% endif %}
```

Results

```bash
# After 1st run
> select * from merge_no_key order by id;
+-----+----------+
| id  |   msg    |
+-----+----------+
| 1   | hello    |
| 2   | goodbye  |
+-----+----------+

# After 2nd run
> select * from merge_no_key order by id;
+-----+----------+
| id  |   msg    |
+-----+----------+
| 1   | hello    |
| 2   | yo       |
| 2   | goodbye  |
| 3   | anyway   |
+-----+----------+
```
---

### Merge With unique_key

```sql title="models/incremental_strategies/models_iceberg/merge_unique_key.sql"
{{ config(
    materialized = 'incremental',
    incremental_strategy = 'merge',
    unique_key = 'id',
) }}

{% if not is_incremental() %}

select cast(1 as bigint) as id, 'hello' as msg
union all
select cast(2 as bigint) as id, 'goodbye' as msg

{% else %}

select cast(2 as bigint) as id, 'yo' as msg
union all
select cast(3 as bigint) as id, 'anyway' as msg

{% endif %}
```

Results

```bash
# After 1st run
> select * from merge_unique_key order by id;
+-----+----------+
| id  |   msg    |
+-----+----------+
| 1   | hello    |
| 2   | goodbye  |
+-----+----------+

# After 2nd run
> select * from merge_unique_key order by id;
+-----+---------+
| id  |   msg   |
+-----+---------+
| 1   | hello   |
| 2   | yo      |
| 3   | anyway  |
+-----+---------+
```
---

### Merge With Update Columns

```sql title="models/incremental_strategies/models_iceberg/merge_update_columns.sql"
{{ config(
    materialized = 'incremental',
    incremental_strategy = 'merge',
    unique_key = 'id',
    merge_update_columns = ['msg'],
) }}

{% if not is_incremental() %}

select cast(1 as bigint) as id, 'hello' as msg, 'blue' as color
union all
select cast(2 as bigint) as id, 'goodbye' as msg, 'red' as color

{% else %}

-- msg will be updated, color will be ignored
select cast(2 as bigint) as id, 'yo' as msg, 'green' as color
union all
select cast(3 as bigint) as id, 'anyway' as msg, 'purple' as color

{% endif %}
```

Results

```bash
# After 1st run
> select * from merge_update_columns order by id;
+-----+----------+--------+
| id  |   msg    | color  |
+-----+----------+--------+
| 1   | hello    | blue   |
| 2   | goodbye  | red    |
+-----+----------+--------+

# After 2nd run
## pay attention to id=2: msg changed, color unchanged
> select * from merge_update_columns order by id;
+-----+---------+---------+
| id  |   msg   |  color  |
+-----+---------+---------+
| 1   | hello   | blue    |
| 2   | yo      | red     |
| 3   | anyway  | purple  |
+-----+---------+---------+
```
---

### Merge With Exclude Columns

:::info
`merge_exclude_columns` is the inverse of `merge_update_columns`: the listed columns are preserved from the existing row, and everything else is updated. You can't use both on the same model.
:::

```sql title="models/incremental_strategies/models_iceberg/merge_exclude_columns.sql"
{{ config(
    materialized = 'incremental',
    incremental_strategy = 'merge',
    unique_key = 'id',
    merge_exclude_columns = ['color'],
) }}

{% if not is_incremental() %}

select cast(1 as bigint) as id, 'hello' as msg, 'blue' as color
union all
select cast(2 as bigint) as id, 'goodbye' as msg, 'red' as color

{% else %}

-- msg will be updated, color will be preserved
select cast(2 as bigint) as id, 'yo' as msg, 'green' as color
union all
select cast(3 as bigint) as id, 'anyway' as msg, 'purple' as color

{% endif %}
```

Results

```bash
# After 1st run
> select * from merge_exclude_columns order by id;
+-----+----------+--------+
| id  |   msg    | color  |
+-----+----------+--------+
| 1   | hello    | blue   |
| 2   | goodbye  | red    |
+-----+----------+--------+

# After 2nd run
## id=2: msg updated to 'yo', but color stays 'red' (excluded from merge)
> select * from merge_exclude_columns order by id;
+-----+---------+--------+
| id  |   msg   | color  |
+-----+---------+--------+
| 1   | hello   | blue   |
| 2   | yo      | red    |
| 3   | anyway  | purple |
+-----+---------+--------+
```
---

### Merge With Incremental Predicates

:::info
`incremental_predicates` limits which target rows are scanned during the merge, so large tables avoid a full scan. Predicates must reference `DBT_INTERNAL_DEST`. `predicates` works as an alias for `incremental_predicates`.
:::

```sql title="models/incremental_strategies/models_iceberg/merge_incremental_predicates.sql"
{{ config(
    materialized = 'incremental',
    incremental_strategy = 'merge',
    unique_key = 'id',
    incremental_predicates = ['DBT_INTERNAL_DEST.id >= 2']
) }}

{% if not is_incremental() %}

select cast(1 as bigint) as id, 'hello' as msg
union all
select cast(2 as bigint) as id, 'goodbye' as msg
union all
select cast(3 as bigint) as id, 'hey' as msg

{% else %}

-- new data stays within the predicate window (id >= 2)
select cast(2 as bigint) as id, 'updated' as msg
union all
select cast(4 as bigint) as id, 'new' as msg

{% endif %}
```

Results

```bash
# After 1st run
> select * from merge_incremental_predicates order by id;
+-----+----------+
| id  |   msg    |
+-----+----------+
| 1   | hello    |
| 2   | goodbye  |
| 3   | hey      |
+-----+----------+

# After 2nd run
# Only target rows with id >= 2 are scanned; id=1 is never touched.
# id=2 is updated; id=3 is untouched (not in new data); id=4 is inserted.
> select * from merge_incremental_predicates order by id;
+-----+---------+
| id  |   msg   |
+-----+---------+
| 1   | hello   |
| 2   | updated |
| 3   | hey     |
| 4   | new     |
+-----+---------+
```

:::caution
Keep your new data within the predicate window. If a source row falls outside it — for example `id=1` in this case — the merge can't find the existing target row and inserts a duplicate instead of updating it.
:::
---

## Schema Changes

Source schemas drift over time, and `on_schema_change` decides how your incremental model reacts. The examples in this section all build on the same source model, shown below.

```sql title="models/incremental_on_schema_change/models/model_a.sql"
{{ 
    config(materialized='table') 
}}

with source_data as (

    select 1 as id, 'aaa' as field1, 'bbb' as field2, 111 as field3, 'TTT' as field4
    union all select 2 as id, 'ccc' as field1, 'ddd' as field2, 222 as field3, 'UUU' as field4
    union all select 3 as id, 'eee' as field1, 'fff' as field2, 333 as field3, 'VVV' as field4
    union all select 4 as id, 'ggg' as field1, 'hhh' as field2, 444 as field3, 'WWW' as field4
    union all select 5 as id, 'iii' as field1, 'jjj' as field2, 555 as field3, 'XXX' as field4
    union all select 6 as id, 'kkk' as field1, 'lll' as field2, 666 as field3, 'YYY' as field4

)

select id
       ,field1
       ,field2
       ,field3
       ,field4

from source_data
```

```bash
> select * from source_data;
+-----+---------+---------+---------+---------+
| id  | field1  | field2  | field3  | field4  |
+-----+---------+---------+---------+---------+
| 1   | aaa     | bbb     | 111     | TTT     |
| 2   | ccc     | ddd     | 222     | UUU     |
| 3   | eee     | fff     | 333     | VVV     |
| 4   | ggg     | hhh     | 444     | WWW     |
| 5   | iii     | jjj     | 555     | XXX     |
| 6   | kkk     | lll     | 666     | YYY     |
+-----+---------+---------+---------+---------+
```

### Ignore

The target schema stays frozen. New columns in the source are silently dropped on insert.

```sql title="models/incremental_on_schema_change/models/incremental_ignore.sql"
{{
    config(
        materialized='incremental',
        on_schema_change='ignore'
    )
}}

WITH source_data AS (SELECT * FROM {{ ref('model_a') }} )

{% if is_incremental() %}

SELECT id, field1, field2, field3, field4 FROM source_data WHERE id NOT IN (SELECT id from {{ this }} )

{% else %}

SELECT id, field1, field2 FROM source_data LIMIT 3

{% endif %}
```

Results

```bash
# After 1st run
> describe table incremental_ignore;
+------------------+------------+----------+
|     col_name     | data_type  | comment  |
+------------------+------------+----------+
| id               | int        |          |
| field1           | string     |          |
| field2           | string     |          |
|                  |            |          |
| # Partitioning   |            |          |
| Not partitioned  |            |          |
+------------------+------------+----------+

> select * from incremental_ignore;
+-----+---------+---------+
| id  | field1  | field2  |
+-----+---------+---------+
| 1   | aaa     | bbb     |
| 2   | ccc     | ddd     |
| 3   | eee     | fff     |
+-----+---------+---------+

--------------------------------------------------------

# After 2nd run
# field3 and field4 are silently dropped — schema stays frozen
> describe table incremental_ignore;
+------------------+------------+----------+
|     col_name     | data_type  | comment  |
+------------------+------------+----------+
| id               | int        |          |
| field1           | string     |          |
| field2           | string     |          |
|                  |            |          |
| # Partitioning   |            |          |
| Not partitioned  |            |          |
+------------------+------------+----------+

> select * from incremental_ignore;
+-----+---------+---------+
| id  | field1  | field2  |
+-----+---------+---------+
| 1   | aaa     | bbb     |
| 2   | ccc     | ddd     |
| 3   | eee     | fff     |
| 4   | ggg     | hhh     |
| 5   | iii     | jjj     |
| 6   | kkk     | lll     |
+-----+---------+---------+
```
---

### Append New Columns

New source fields are added to the target. Existing columns that disappear from the source are kept, and new rows get `NULL` for them.

```sql title="models/incremental_on_schema_change/models/incremental_append_new_columns.sql"
{{
    config(
        materialized='incremental',
        on_schema_change='append_new_columns'
    )
}}

{% set string_type = 'string' %}

WITH source_data AS (SELECT * FROM {{ ref('model_a') }} )

{% if is_incremental()  %}

SELECT id, 
       cast(field1 as {{string_type}}) as field1, 
       cast(field2 as {{string_type}}) as field2, 
       cast(field3 as {{string_type}}) as field3, 
       cast(field4 as {{string_type}}) as field4 
FROM source_data WHERE id NOT IN (SELECT id from {{ this }} )

{% else %}

SELECT id, 
       cast(field1 as {{string_type}}) as field1, 
       cast(field2 as {{string_type}}) as field2 
FROM source_data where id <= 3

{% endif %}
```

Results

```bash
# After 1st run
> describe table incremental_append_new_columns;
+------------------+------------+----------+
|     col_name     | data_type  | comment  |
+------------------+------------+----------+
| id               | int        |          |
| field1           | string     |          |
| field2           | string     |          |
|                  |            |          |
| # Partitioning   |            |          |
| Not partitioned  |            |          |
+------------------+------------+----------+

> select * from incremental_append_new_columns;
+-----+---------+---------+
| id  | field1  | field2  |
+-----+---------+---------+
| 1   | aaa     | bbb     |
| 2   | ccc     | ddd     |
| 3   | eee     | fff     |
+-----+---------+---------+

--------------------------------------------------------

# After 2nd run
## new columns are added: field3, field4
> describe table incremental_append_new_columns;
+------------------+------------+----------+
|     col_name     | data_type  | comment  |
+------------------+------------+----------+
| id               | int        |          |
| field1           | string     |          |
| field2           | string     |          |
| field3           | string     |          |
| field4           | string     |          |
|                  |            |          |
| # Partitioning   |            |          |
| Not partitioned  |            |          |
+------------------+------------+----------+

> select * from incremental_append_new_columns;
+-----+---------+---------+---------+---------+
| id  | field1  | field2  | field3  | field4  |
+-----+---------+---------+---------+---------+
| 1   | aaa     | bbb     | NULL    | NULL    |
| 2   | ccc     | ddd     | NULL    | NULL    |
| 3   | eee     | fff     | NULL    | NULL    |
| 4   | ggg     | hhh     | 444     | WWW     |
| 5   | iii     | jjj     | 555     | XXX     |
| 6   | kkk     | lll     | 666     | YYY     |
+-----+---------+---------+---------+---------+
```
---

### Sync All Columns

The target schema mirrors the source on every run. New columns are added and missing ones are dropped, so use this when you want the target to track the source exactly.

```sql title="models/incremental_on_schema_change/models/incremental_sync_all_columns.sql"
{{
    config(
        materialized='incremental',
        on_schema_change='sync_all_columns'
        
    )
}}

WITH source_data AS (SELECT * FROM {{ ref('model_a') }} )

{% set string_type = 'string' %}

{% if is_incremental() %}

SELECT id, 
       cast(field1 as {{string_type}}) as field1, 
       cast(field3 as {{string_type}}) as field3, -- to validate new fields
       cast(field4 as {{string_type}}) AS field4 -- to validate new fields

FROM source_data WHERE id NOT IN (SELECT id from {{ this }} )

{% else %}

select id, 
       cast(field1 as {{string_type}}) as field1, 
       cast(field2 as {{string_type}}) as field2

from source_data where id <= 3

{% endif %}
```

Results

```bash
# After 1st run
> describe table incremental_sync_all_columns;
+------------------+------------+----------+
|     col_name     | data_type  | comment  |
+------------------+------------+----------+
| id               | int        |          |
| field1           | string     |          |
| field2           | string     |          |
|                  |            |          |
| # Partitioning   |            |          |
| Not partitioned  |            |          |
+------------------+------------+----------+

> select * from incremental_sync_all_columns;
+-----+---------+---------+
| id  | field1  | field2  |
+-----+---------+---------+
| 1   | aaa     | bbb     |
| 2   | ccc     | ddd     |
| 3   | eee     | fff     |
+-----+---------+---------+

--------------------------------------------------------

# On 2nd run
# removed: field2, added: field3 and field4

> describe table incremental_sync_all_columns;
+------------------+------------+----------+
|     col_name     | data_type  | comment  |
+------------------+------------+----------+
| id               | int        |          |
| field1           | string     |          |
| field3           | string     |          |
| field4           | string     |          |
|                  |            |          |
| # Partitioning   |            |          |
| Not partitioned  |            |          |
+------------------+------------+----------+

> select * from incremental_sync_all_columns;
+-----+---------+---------+---------+
| id  | field1  | field3  | field4  |
+-----+---------+---------+---------+
| 1   | aaa     | NULL    | NULL    |
| 2   | ccc     | NULL    | NULL    |
| 3   | eee     | NULL    | NULL    |
| 4   | ggg     | 444     | WWW     |
| 5   | iii     | 555     | XXX     |
| 6   | kkk     | 666     | YYY     |
+-----+---------+---------+---------+
```
---

### Fail

The run fails as soon as a schema mismatch is detected. Use this when silent drift would hurt more than a broken pipeline.

```sql title="models/incremental_on_schema_change/models/incremental_fail.sql"
{{
    config(
        materialized='incremental',
        on_schema_change='fail'
    )
}}

WITH source_data AS (SELECT * FROM {{ ref('model_a') }} )

{% if is_incremental()  %}

SELECT id, field1, field2 FROM source_data

{% else %}

SELECT id, field1, field3 FROm source_data

{% endif %}
```

Results

```bash
# After 1st run
> describe table incremental_fail;
+------------------+------------+----------+
|     col_name     | data_type  | comment  |
+------------------+------------+----------+
| id               | int        |          |
| field1           | string     |          |
| field3           | int        |          |
|                  |            |          |
| # Partitioning   |            |          |
| Not partitioned  |            |          |
+------------------+------------+----------+

> select * from incremental_fail;
+-----+---------+---------+
| id  | field1  | field3  |
+-----+---------+---------+
| 1   | aaa     | 111     |
| 2   | ccc     | 222     |
| 3   | eee     | 333     |
| 4   | ggg     | 444     |
| 5   | iii     | 555     |
| 6   | kkk     | 666     |
+-----+---------+---------+

--------------------------------------------------------

# On 2nd run - DBT Error
The source and target schemas on this incremental model are out of sync!
They can be reconciled in several ways: 
  - set the `on_schema_change` config to either append_new_columns or sync_all_columns, depending on your situation.
  - Re-run the incremental model with `full_refresh: True` to update the target schema.
  - update the schema manually and re-run the process.
```
---
