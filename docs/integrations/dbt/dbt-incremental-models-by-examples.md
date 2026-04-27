---
title: DBT Incremental models By Examples
description: Building DBT incremental models are a little difficult than other materializaion types (view, table). This guide aims to make it easy to understand all possible DBT incremental model configurations with lots of examples.

last_update:
  date: 04/27/2026
  author: Shashank Chaudhary
---

import Img from '@site/src/components/Img';

import TOCInline from '@theme/TOCInline';

<TOCInline toc={toc}  minHeadingLevel={2} maxHeadingLevel={5}/>

Building DBT incremental models are a little difficult than other materializaion types (view, table). This guide aims to make it easy to understand all possible DBT incremental model configurations with lots of examples.


## Incremental Models Configurations

Here are the DBT configurations for incremental models

| Parameter | Default value | Expected values                                    |
| --- | --- |----------------------------------------------------|
| file_format | `iceberg` | `iceberg` (only supported value)                   |
| incremental_strategy | `merge` | `append`, `merge`                                  |
| on_schema_change | `ignore` | `ignore`, `append_new_columns`, `sync_all_columns`, `fail` |

**Incremental Strategies**

| Incremental Strategy | Description                                                                                             |
| --- |---------------------------------------------------------------------------------------------------------|
| append | Each incremental run appends to the table. Example: [_append_](#append)                                 |
| merge | Each incremental run merges new rows with the existing rows. Example: [_merge-with-unique_key_](#merge-with-unique_key) |

**Merge Incremental Strategy**

| Configuration | Behaviour if not provided                                                                                      | Behaviour when provided                                                                                               |
| --- |----------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| unique_key | incremental runs behave as append-only. Example: [_merge-without-unique_key_](#merge-without-unique_key) | Iceberg merge is run on the given column name. Example: [_merge-with-unique_key_](#merge-with-unique_key) |
| merge_update_columns | All columns will be updated on the merge. Example: [_merge-with-unique_key_](#merge-with-unique_key) | Only the specified columns will be merged. Example: [_merge-with-update-columns_](#merge-with-update-columns) |
| merge_exclude_columns | All columns will be updated on the merge. | The specified columns are excluded from the merge update; all others are updated. Example: [_merge-with-exclude-columns_](#merge-with-exclude-columns) |
| incremental_predicates | All target rows are scanned during merge. | Only target rows matching the predicate are considered, improving performance on large tables. Example: [_merge-with-incremental-predicates_](#merge-with-incremental-predicates) |


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
`insert_overwrite` is not supported. Only `iceberg` file format is supported, and `insert_overwrite` requires a non-iceberg format.
:::

```sql title="models/incremental_strategies/models_bad/bad_insert_overwrite_iceberg.sql"
{{ config(
    materialized = 'incremental',
    incremental_strategy = 'insert_overwrite',
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

### Bad merge
:::info
Only `iceberg` file format is supported. Any other `file_format` value errors before the strategy is even evaluated.
:::
```sql title="models/incremental_strategies/models_bad/bad_merge_not_iceberg.sql"
{{ config(
    materialized = ‘incremental’,
    incremental_strategy = ‘merge’,
    file_format = ‘parquet’
) }}

select 1
```

**DBT Error**

```bash
Invalid incremental file format provided: parquet
    We only support ‘iceberg’ file format
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

:::note
The error lists `insert_overwrite` as a recognised value, but it is not usable in practice — `insert_overwrite` requires a non-iceberg file format, which is also rejected. Use `append` or `merge`.
:::
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

### Merge without unique_key

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

### Merge with unique_key

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

### Merge with update columns

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

### Merge with exclude columns

:::info
`merge_exclude_columns` is the inverse of `merge_update_columns`. The listed columns are preserved from the existing row; all other columns are updated. You cannot use both on the same model.
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

### Merge with incremental predicates

:::info
`incremental_predicates` limits which rows in the target table are scanned during the merge. This improves performance on large tables by avoiding a full table scan. Predicates must reference `DBT_INTERNAL_DEST`. `predicates` is accepted as an alias for `incremental_predicates`.
:::

```sql title="models/incremental_strategies/models_iceberg/merge_incremental_predicates.sql"
{{ config(
    materialized = 'incremental',
    incremental_strategy = 'merge',
    unique_key = 'id',
    incremental_predicates = ['DBT_INTERNAL_DEST.id > 1']
) }}

{% if not is_incremental() %}

select cast(1 as bigint) as id, 'hello' as msg
union all
select cast(2 as bigint) as id, 'goodbye' as msg

{% else %}

select cast(2 as bigint) as id, 'updated' as msg
union all
select cast(3 as bigint) as id, 'new' as msg

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
+-----+----------+

# After 2nd run
## id=2 is updated; id=3 inserted; id=1 untouched (excluded by predicate)
> select * from merge_incremental_predicates order by id;
+-----+---------+
| id  |   msg   |
+-----+---------+
| 1   | hello   |
| 2   | updated |
| 3   | new     |
+-----+---------+
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
