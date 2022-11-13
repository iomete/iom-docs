---
title: DBT Incremental models By Examples
description: Building DBT incremental models are a little difficult than other materializaion types (view, table). This guide aims to make it easy to understand all possible DBT incremental model configurations with lots of examples.

last_update:
  date: 07/11/2022
  author: Vusal Dadalov
---

import Img from '@site/src/components/Img';

import TOCInline from '@theme/TOCInline';

<TOCInline toc={toc}  minHeadingLevel={2} maxHeadingLevel={5}/>

# DBT Incremental models By Examples

Building DBT incremental models are a little difficult than other materializaion types (view, table). This guide aims to make it easy to understand all possible DBT incremental model configurations with lots of examples.


## Incremental Models Configurations

Here are the DBT configurations for incremental models

| Parameter | Default value | Expected values                                    |
| --- | --- |----------------------------------------------------|
| file_format | `iceberg` | `iceberg`, `parquet`, `orc`, `csv`, `json`         |
| incremental_strategy | `merge` | `append`, `merge`, `insert_overwrite`                |
| on_schema_change | `ignore` | `ignore`, `append_new_columns`, `sync_all_columns`, `fail` |

**Incremental Strategies**

| Incremental Strategy | Supported table types | Description                                                                                                                                                   |
| --- | --- |---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| append | all | Each incremental run appends to the table. Example: [_append_](#append)                                                                                       |
| merge | iceberg | Each incremental run merges new rows with the existing rows. Example: [_merge-with-unique_key_](#merge-with-unique_key)                                       |
| insert_overwrite | non-iceberg | Each run [overwriting the matching partitions](#insert-overwrite-partitions) or the [whole table for non-partitioned tables](#insert-overwrite-no-partitions) |

**Merge Incremental Strategy**

| Configuration | Behaviour if not provided                                                                                      | Behaviour when provided                                                                                               |
| --- |----------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| unique_key | incremental runs are behaving as append-only. Example: [_merge-without-unique_key_](#merge-without-unique_key) | Iceberg merge is going to be run on the given column name. Example: [_merge-with-unique_key_](#merge-with-unique_key) |
| merge_update_columns | All columns will be updated on the merge. Example: [_merge-with-unique_key_](#merge-with-unique_key)                          | Only the specified columns will be merged; Example: [_merge-with-update-columns_](#merge-with-update-columns)         |


**Schema Changes**

| Schema change | Supported table types | Description                                                                                             |
| --- | --- |---------------------------------------------------------------------------------------------------------|
| ignore | all | Ignore schema changes. Example: [_ignore_](#ignore)                                                     |
| append_new_columns | iceberg | Only adds the new fields; keep the removed fields. Example: [_append-new-columns_](#append-new-columns) |
| sync_all_columns | iceberg | Full sync schema changes. Example: [_sync-all-columns_](#sync-all-columns)                              |
| fail | all | Fails when the schema change is detected. Example: [_fail_](#fail)                                      |


## Bad Incremental models


### Bad file format


```sql title="models/incremental_strategies/models_bad/bad_file_format.sql"
{{ config(
    materialized = 'incremental',
		file_format = 'bad_format'
) }}

select 1
```
---

### Bad insert overwrite

:::info
Iceberg tables only support `append` and `merge` incremental strategies. The following results in error.
:::

```sql title="models/incremental_strategies/models_bad/bad_insert_overwrite_iceberg.sql"
{{ config(
    materialized = 'incremental',
    incremental_strategy = 'insert_overwrite'
) }}

select 1
```

**DBT Error on run**

```bash
You cannot use this strategy when file_format is set to 'iceberg' (default one)
	Use the 'append' or 'merge' strategy instead
```
---

### Bad merge
:::info
Non-iceberg tables don’t support merge incremental strategy
:::
```sql title="models/incremental_strategies/models_bad/bad_merge_not_iceberg.sql"
{{ config(
    materialized = 'incremental',
    incremental_strategy = 'merge',
    file_format = 'parquet'
) }}

select 1
```

**DBT Error**

```bash
Invalid incremental strategy provided: merge
	You can only choose this strategy when file_format is set to 'iceberg'
```
---

### Bad strategy

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
---

## Merge for iceberg tables

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

### Merge without `unique_key`

:::info
Without no merge keys it behaves as **append** mode
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

### Merge with `unique_key`

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

### Merge with `update columns`

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
## pay attention to id=2; the **msg** field is changed but not the **color** field not
> select * from merge_update_columns order by id;
+-----+---------+---------+
| id  |   msg   |  color  |
+-----+---------+---------+
| 1   | hello   | blue    |
**| 2   | yo      | red     |**
| 3   | anyway  | purple  |
+-----+---------+---------+
```
---

## Insert Overwrite for non-iceberg tables

### Insert overwrite no partitions

:::info
Each run overwrites the whole table
:::

```sql title="models/incremental_strategies/models_insert_overwrite/insert_overwrite_no_partitions.sql"
{{ config(
    materialized = 'incremental',
    incremental_strategy = 'insert_overwrite',
    file_format = 'parquet'
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
> select * from insert_overwrite_no_partitions order by id;
+-----+----------+--------+
| id  |   msg    | color  |
+-----+----------+--------+
| 1   | hello    | blue   |
| 2   | goodbye  | red    |
+-----+----------+--------+

# After 2nd run
> select * from insert_overwrite_no_partitions order by id;
+-----+---------+
| id  |   msg   |
+-----+---------+
| 2   | yo      |
| 3   | anyway  |
+-----+---------+
```
---

### Insert overwrite partitions

:::info
Each run overwrites the overlapping partitions
:::

```sql title="models/incremental_strategies/models_insert_overwrite/insert_overwrite_partitions.sql"
{{ config(
    materialized = 'incremental',
    incremental_strategy = 'insert_overwrite',
    partition_by = 'id',
    file_format = 'parquet',
) }}

{% if not is_incremental() %}

select cast(1 as bigint) as id, 'hello' as msg
union all
select cast(2 as bigint) as id, 'goodbye' as msg
union all
select cast(2 as bigint) as id, 'aloha' as msg

{% else %}

select cast(2 as bigint) as id, 'yo' as msg
union all
select cast(3 as bigint) as id, 'anyway' as msg

{% endif %}
```

Results

```bash
# After 1st run
> select * from insert_overwrite_partitions order by id;
+----------+-----+
|   msg    | id  |
+----------+-----+
| hello    | 1   |
| goodbye  | 2   |
| aloha    | 2   |
+----------+-----+

# After 2nd run
## id=2 row (partition is overwritten)
> select * from insert_overwrite_partitions order by id;
+---------+-----+
|   msg   | id  |
+---------+-----+
| hello   | 1   |
**| yo      | 2   |**
| anyway  | 3   |
+---------+-----+
```
---

## Schema Changes

Let’s use this as a source model

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

### Ignore

Ignore schema changes

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
## new columns are added: field3, field4
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
| 4   | ggg     | hhh     |
| 5   | iii     | jjj     |
| 6   | kkk     | lll     |
| 1   | aaa     | bbb     |
| 2   | ccc     | ddd     |
| 3   | eee     | fff     |
+-----+---------+---------+
```
---

### Append new columns

Only adds the new fields

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

### Sync all columns

Full sync schema changes

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
| 4   | ggg     | 444     | WWW     |
| 5   | iii     | 555     | XXX     |
| 6   | kkk     | 666     | YYY     |
| 1   | aaa     | NULL    | NULL    |
| 2   | ccc     | NULL    | NULL    |
| 3   | eee     | NULL    | NULL    |
+-----+---------+---------+---------+
```
---

### Fail

Fails when the schema change is detected

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
