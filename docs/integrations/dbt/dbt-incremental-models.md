---
title: DBT Incremental models
description: Learn how to use the incremental dbt model on the IOMETE data platform to reduce the runtime of transformation and improve warehouse performance
last_update:
  date: 04/27/2026
  author: Shashank Chaudhary
---


# Incremental models

Incremental models are built as tables in your data lake. The first time a model is run, the table is built by transforming _all rows_ of source data. On subsequent runs, dbt transforms _only_ the rows in your source data that you tell dbt to filter for, inserting them into the target table, which is the table that has already been built.

Often, the rows you filter for on an incremental run will be the rows in your source data that have been created or updated since the last time dbt ran. As such, on each dbt run, your model **gets built incrementally**.

:::tip
Using an incremental model limits the amount of data that needs to be transformed, vastly reducing the runtime of your transformations. This improves warehouse performance and reduces compute costs.
:::

## Using incremental materializations

Like the other [materializations](https://docs.getdbt.com/docs/build/materializations) built into dbt, incremental models are defined with `select` statements, with the materialization defined in a config block.

```sql title="models/my_model.sql"
{{
    config(
        materialized='incremental'
    )
}}

select ...
```

To use incremental models, you also need to tell dbt:

- How to filter the rows on an incremental run.
- The uniqueness constraint of the model (if any).

### Filtering rows on an incremental run

To tell dbt which rows it should transform on an incremental run, wrap valid SQL that filters for these rows in the `is_incremental()` macro.

Often, you'll want to filter for "new" rows, as in rows that have been created since the last time dbt ran this model. The best way to find the timestamp of the most recent run of this model is by checking the most recent timestamp in your target table. dbt makes it easy to query your target table by using the [\{\{ this }}](https://docs.getdbt.com/reference/dbt-jinja-functions/this) variable.

For example, a model that includes a computationally slow transformation on a column can be built incrementally, as follows:

```sql title="models/my_model.sql"
{{
    config(
        materialized='incremental'
    )
}}

select
    *,
    my_slow_function(my_column)

from raw_app_data.events

{% if is_incremental() %}

  -- this filter will only be applied on an incremental run
  where event_time > (select max(event_time) from {{ this }})

{% endif %}
```

:::tip
**Optimizing your incremental model**

For more complex incremental models that make use of Common Table Expressions (CTEs), you should consider the impact of the position of the `is_incremental()` macro on query performance.
:::

### Defining a uniqueness constraint (optional)

A `unique_key` determines whether a record has new values and should be updated. Using `unique_key`, you can ensure that each row from the source table is represented by a single row in your incremental model without duplicates. Not specifying a `unique_key` will result in **append-only behavior**, which means dbt inserts all rows returned by the model's SQL into the preexisting target table without regard for whether the rows represent duplicates.

This **optional** parameter for incremental models specifies a field (or combination of fields) that can uniquely identify each row within your model. You can define `unique_key` in a configuration block at the top of your model, and it can be a list in addition to a single column name.

The `unique_key` should be supplied in your model definition as a string representing a simple column or a list of single-quoted column names that can be used together, for example, `['col1', 'col2', …])`.

:::tip
In cases where you need multiple columns in combination to uniquely identify each row, we recommend you pass these columns as a list (`unique_key = ['user_id', 'session_number']`), rather than a string expression (`unique_key = 'concat(user_id, session_number)'`).

By using the first syntax, which is more universal, dbt can ensure that the columns will be templated into your incremental model materialization in a way that's appropriate to your database.
:::

When you define a `unique_key`, you'll see this behavior for each row of "new" data returned by your dbt model:

- If the same `unique_key` is present in the "new" and "old" model data, dbt will update/replace the old row with the new row of data. IOMETE (iceberg) is using [MERGE INTO](/reference/iceberg-tables/writes#merge-into) syntax for that
- If the `unique_key` is _not_ present in the "old" data, dbt will insert the entire row into the table. In other words it becomes `append-only` mode.

:::info

`iomete-dbt` supports two incremental strategies (iceberg tables only):

- `merge` (default)
- `append` (optional)

`merge` uses the `unique_key` configuration to upsert rows. `append` inserts all new rows without deduplication.

For more information, see [Incremental models](https://docs.getdbt.com/docs/build/incremental-models) in the dbt docs.
:::

#### `unique_key` example

Consider a model that calculates the number of daily active users (DAUs) based on an event stream. As source data arrives, you will want to recalculate the number of DAUs for both the day that dbt last ran and any days since then. The model would look as follows:

```sql
{{
    config(
        materialized='incremental',
        unique_key='date_day'
    )
}}

select
    date_trunc('day', event_at) as date_day,
    count(distinct user_id) as daily_active_users

from raw_app_data.events

{% if is_incremental() %}

  -- this filter will only be applied on an incremental run
  where date_day >= (select max(date_day) from {{ this }})

{% endif %}

group by 1
```

:::note
Building this model incrementally without the `unique_key` parameter would result in multiple rows in the target table for a single day – one row for each time dbt runs on that day. Instead, the inclusion of the `unique_key` parameter ensures the existing row is updated instead.
:::

## How do I rebuild an incremental model?

If your incremental model logic has changed, the transformations on your new rows of data may diverge from the historical transformations, which are stored in your target table. In this case, you should rebuild your incremental model.

To force dbt to rebuild the entire incremental model from scratch, use the `--full-refresh` flag on the command line. This flag will cause dbt to drop the existing target table in the database before rebuilding it for all-time.

```bash
dbt run --full-refresh --select my_incremental_model+
```

It's also advisable to rebuild any downstream models, as indicated by the trailing `+`.

For detailed usage instructions, check out the [dbt run](https://docs.getdbt.com/reference/commands/run) documentation.

## Understanding incremental models

### When should I use an incremental model?

It's often desirable to build models as tables in your data lakehouse since downstream queries are more performant. While the `table` materialization also creates your models as tables, it rebuilds the table on each dbt run. These runs can become problematic in that they use a lot of compute when either:

- source data tables have millions, or even billions, of rows.
- the transformations on the source data are computationally expensive (that is, take a long time to execute); for example, complex Regex functions, or UDFs, are being used to transform data.

:::tip
Like many things in programming, incremental models are a trade-off between complexity and performance. While they are not as straightforward as the `view` and `table` materializations, they can lead to significantly better performance of your dbt runs.
:::

### Understanding the is_incremental() macro

The `is_incremental()` macro will return `True` if:

- the destination table already exists in the database
- dbt is _not_ running in full-refresh mode
- the running model is configured with `materialized='incremental'`

Note that the SQL in your model needs to be valid whether `is_incremental()` evaluates to `True` or `False`.

### How do incremental models work behind the scenes?

The IOMETE platform supports incremental models for Iceberg tables which is the default table format. The incremental build will not work if `file_format` is explicitly specified other than `iceberg` (e.g., `file_format = ‘parquet’`).

Apache Iceberg’s ACID Transaction management is used to ensure this is executed as a single unit of work.

### Python models

Incremental models support both SQL and Python. A Python incremental model follows the same config options (`unique_key`, `incremental_strategy`, `on_schema_change`, etc.) and uses `dbt.is_incremental()` to branch logic.

```python title="models/my_model.py"
def model(dbt, session):
    dbt.config(
        materialized="incremental",
        unique_key="id",
    )
    df = dbt.ref("my_source")
    if dbt.is_incremental():
        max_id = session.sql(f"select max(id) from {dbt.this}").collect()[0][0]
        df = df.filter(df.id > max_id)
    return df
```

### What if the columns of my incremental model change?

The optional `on_schema_change` parameter controls what happens when the columns of your incremental model change. It enables dbt to continue running in the presence of schema changes, resulting in fewer `--full-refresh` scenarios.

You can configure the `on_schema_change` setting as follows.

#### Option 1. Globally

On `dbt_project.yml`:

```yaml title="dbt_project.yml"
models:
  +on_schema_change: "sync_all_columns"
```

#### Option 2. Per model

Setting on the model configuration:

```sql title="models/my_model.sql"
{{
    config(
        materialized='incremental',
        unique_key='date_day',
        on_schema_change='fail'
    )
}}
```

The possible values for `on_schema_change` are:

- `ignore`: Default behavior (see below).
- `fail`: Triggers an error message when the source and target schemas diverge
- `append_new_columns`: Append new columns to the existing table. Note that this setting does _not_ remove columns from the existing table that are not present in the new data.
- `sync_all_columns`: Adds any new columns to the existing table and removes any columns that are now missing. Note that this is _inclusive_ of data type changes

:::info
None of the `on_schema_change` behaviors backfill values in old records for newly added columns. If you need to populate those values, we recommend running manual updates or triggering a `--full-refresh`
:::

:::tip
**Default behavior**

This is the behavior if `on_schema_change: ignore`, which is set by default, and on older versions of dbt.

If you add a column to your incremental model and execute a `dbt run`, this column will _not_ appear in your target table.

Similarly, if you remove a column from your incremental model and execute a `dbt run`, this column will _not_ be removed from your target table.

Instead, whenever the logic of your incremental changes, execute a full-refresh run of both your incremental model and any downstream models.
:::

## About incremental_strategy

### Configuring incremental strategy

The `incremental_strategy` config can either be specified in specific models, or for all models in your `dbt_project.yml` file.

#### Option 1. Globally

On `dbt_project.yml`:

```yaml title="dbt_project.yml"
models:
  +incremental_strategy: "append"
```

#### Option 2. Per model

Setting on the model configuration:

```sql title="models/my_model.sql"
{{
  config(
    materialized='incremental',
    unique_key='date_day',
    incremental_strategy='merge',
    ...
  )
}}

select ...
```

### Strategy-specific configs

#### `merge_update_columns`

If you are using the `merge` strategy and have specified a `unique_key`, by default, dbt will entirely overwrite matched rows with new values.

You may optionally pass a list of column names to `merge_update_columns`. In that case, dbt will update _only_ the columns specified and keep the previous values of other columns.

```sql
{{
  config(
    materialized = 'incremental',
    unique_key = 'id',
    merge_update_columns = ['email', 'ip_address'],
  )
}}

select ...
```

#### `merge_exclude_columns`

The inverse of `merge_update_columns` — specify columns to _exclude_ from the merge update. All other columns will be updated. You cannot use both `merge_update_columns` and `merge_exclude_columns` on the same model.

```sql
{{
  config(
    materialized = 'incremental',
    unique_key = 'id',
    merge_exclude_columns = ['created_at'],
  )
}}

select ...
```

#### `incremental_predicates`

An optional list of predicates applied to the `MERGE` statement to limit which rows in the target table are considered for matching. This can improve performance on large tables by pruning the scan on the target side.

`predicates` is accepted as an alias for `incremental_predicates` — both work identically.

```sql
{{
  config(
    materialized = 'incremental',
    unique_key = 'id',
    incremental_predicates = ['DBT_INTERNAL_DEST.updated_at >= dateadd(day, -3, current_date)'],
  )
}}

select ...
```

:::caution
Predicates reference `DBT_INTERNAL_DEST` (the target table alias). An incorrect predicate can cause rows to be silently skipped during merge. Use `--full-refresh` to recover.
:::
