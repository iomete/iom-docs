---
title: DBT Incremental Models
sidebar_label: Incremental Models
description: Learn how to use the incremental dbt model on the IOMETE data platform to reduce the runtime of transformation and improve warehouse performance
last_update:
  date: 04/27/2026
  author: Shashank Chaudhary
---


# Incremental Models

Incremental models skip reprocessing your entire source dataset on every run, which can be the difference between a transformation that finishes in seconds and one that drags on for hours. They're built as tables in your data lake. The first run transforms _all rows_ of source data, and on later runs dbt transforms only the rows you filter for, then inserts them into the existing target table.

Usually you filter for rows created or updated since the last run. That's why your model **gets built incrementally** with each dbt run.

:::tip
An incremental model limits how much data gets transformed on each run, which cuts runtime and lowers compute costs.
:::

## Using Incremental Materializations

Once you know an incremental model is the right fit, the setup is short. Incremental models work like other [materializations](https://docs.getdbt.com/docs/build/materializations) in dbt: define them with a `select` statement and set the materialization in a config block.

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

### Filtering Rows on an Incremental Run

The filter is what keeps each run cheap, so this is the part that matters most. Wrap the filtering SQL inside the `is_incremental()` macro to tell dbt which rows to transform.

Most of the time you want "new" rows: rows created since the last time dbt ran this model. The cleanest way to find that cutoff is to check the most recent timestamp already in your target table, and dbt makes that easy with the [\{\{ this }}](https://docs.getdbt.com/reference/dbt-jinja-functions/this) variable, which references the target table itself.

Here's a model with a slow column transformation that benefits from incremental builds:

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

:::tip Optimizing Your Incremental Model
For more complex incremental models built on Common Table Expressions (CTEs), the position of the `is_incremental()` macro affects query performance. Place it where it prunes data earliest in the pipeline.
:::

### Defining a Uniqueness Constraint (Optional)

If you re-run a model and don't want duplicate rows piling up, you need a `unique_key`. It tells dbt how to recognize an existing record so it can decide whether to update or insert, and each source row maps to a single row in your incremental model. Skip it, and dbt falls back to **append-only behavior**: every row returned by the model gets inserted into the target table, duplicates and all.

This optional parameter accepts a single column or a list of columns that together uniquely identify a row. Set it in the config block at the top of your model.

Pass `unique_key` as a string (a single column name) or as a list of single-quoted column names, for example `['col1', 'col2', …]`.

:::tip
If several columns identify a row, pass them as a list (`unique_key = ['user_id', 'session_number']`) instead of a string expression like `unique_key = 'concat(user_id, session_number)'`. The list form is portable, so dbt can template the columns into the merge statement the right way for your database.
:::

With a `unique_key` set, here's what happens to each row of "new" data your model returns:

- If the same `unique_key` already exists in the target table, dbt updates the existing row with the new values. On IOMETE (Iceberg), this runs through [MERGE INTO](/reference/iceberg-tables/writes#merge-into) syntax.
- If the `unique_key` doesn't exist yet, dbt inserts the entire row, so the behavior is effectively `append-only`.

:::info
`iomete-dbt` supports two incremental strategies (Iceberg tables only):

- `merge` (default)
- `append` (optional)

`merge` uses the `unique_key` configuration to upsert rows. `append` inserts all new rows without deduplication.

For more, see [Incremental models](https://docs.getdbt.com/docs/build/incremental-models) in the dbt docs.
:::

#### `unique_key` Example

Consider a model that calculates daily active users (DAUs) from an event stream. As new source data arrives, you want to recalculate DAUs for the day dbt last ran and every day since. The model looks like this:

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
Without `unique_key`, this model would produce one row per day for every dbt run on that day, leading to duplicates. With `unique_key` set, dbt updates the existing row instead.
:::

## How Do I Rebuild an Incremental Model?

Eventually your model logic will change, and the new transformations no longer match the historical rows already sitting in your target table. When that happens, you need to rebuild the model from scratch.

Use the `--full-refresh` flag to force a complete rebuild. dbt drops the existing target table and rebuilds it for all time:

```bash
dbt run --full-refresh --select my_incremental_model+
```

The trailing `+` rebuilds downstream models too, which is usually what you want.

For full usage details, see the [dbt run](https://docs.getdbt.com/reference/commands/run) documentation.

## Understanding Incremental Models

Before reaching for `incremental` on every model, it helps to know when it's the right tool and how it behaves under the hood. This section covers when to use one, how the `is_incremental()` macro decides what to run, what IOMETE does behind the scenes, and how schema drift is handled.

### When Should I Use an Incremental Model?

Building models as tables makes downstream queries fast, which is why it's often the right default for a data lakehouse. The plain `table` materialization works the same way, but it rebuilds the whole table on every run. That gets expensive when:

- Source tables hold millions or billions of rows.
- Transformations on the source data are slow (think complex regex or UDFs).

In either case, an incremental model can save substantial runtime and compute.

:::tip
Like most things in programming, incremental models trade complexity for performance. They aren't as plug-and-play as `view` or `table`, but on a long-running pipeline the speedup is usually worth it.
:::

### Understanding the is_incremental() Macro

The macro gates your filter logic, so it helps to know exactly when it fires. `is_incremental()` returns `True` when all of these conditions hold:

- The destination table already exists in the database.
- dbt is _not_ running in full-refresh mode.
- The running model is configured with `materialized='incremental'`.

Your model's SQL must stay valid whether `is_incremental()` evaluates to `True` or `False`.

### How Do Incremental Models Work Behind the Scenes?

A quick note on what IOMETE does once dbt hands off the SQL. Incremental models are supported on Iceberg tables, the platform's default table format. If you explicitly set `file_format` to anything other than `iceberg` (for example, `file_format = 'parquet'`), the incremental build won't work.

Iceberg's ACID transaction management runs the incremental write as a single unit of work, so a partial update can't leave the table in a broken state.

### Python Models

Prefer Python over SQL for the transformation? Incremental models support both. A Python incremental model takes the same config options (`unique_key`, `incremental_strategy`, `on_schema_change`, and so on) and uses `dbt.is_incremental()` to branch its logic.

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

### What If the Columns of My Incremental Model Change?

Schema drift is the most common reason teams end up running `--full-refresh` more often than they'd like. The optional `on_schema_change` parameter lets dbt keep going when columns are added or removed, so full refreshes become rarer.

Configure `on_schema_change` in one of two places.

#### Option 1. Globally

In `dbt_project.yml`:

```yaml title="dbt_project.yml"
models:
  +on_schema_change: "sync_all_columns"
```

#### Option 2. Per Model

In the model configuration:

```sql title="models/my_model.sql"
{{
    config(
        materialized='incremental',
        unique_key='date_day',
        on_schema_change='fail'
    )
}}
```

The supported values are:

- `ignore`: Default behavior (see below).
- `fail`: Raises an error when source and target schemas diverge.
- `append_new_columns`: Adds new columns to the existing table. It does _not_ remove columns that are absent from the new data.
- `sync_all_columns`: Adds new columns and removes any that are now missing. This is _inclusive_ of data type changes.

:::info
None of the `on_schema_change` behaviors backfill old records with values for newly added columns. To populate those values, run manual updates or trigger a `--full-refresh`.
:::

:::tip Default Behavior
Here's what `on_schema_change: ignore` actually does (it's the default, and the behavior on older dbt versions).

Add a column to your incremental model and run `dbt run`, and the column won't show up in the target table. Remove a column and run again, and the column stays in the target table.

So whenever the model logic changes, run a full-refresh on the incremental model and any downstream models.
:::

## About incremental_strategy

The strategy decides how new rows land in the target table, and the right choice depends on whether you need updates or just inserts. IOMETE supports two: `merge` (the default) and `append`. Set it globally or per model.

### Configuring Incremental Strategy

Set `incremental_strategy` on individual models, or globally for every model in `dbt_project.yml`.

#### Option 1. Globally

In `dbt_project.yml`:

```yaml title="dbt_project.yml"
models:
  +incremental_strategy: "append"
```

#### Option 2. Per Model

In the model configuration:

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

### Strategy-Specific Configs

A few extra knobs only apply to the `merge` strategy. Reach for these when you need finer control over which columns get rewritten or which target rows get scanned.

#### `merge_update_columns`

With the `merge` strategy and a `unique_key`, dbt overwrites every column on a matched row by default. To narrow that down, pass a list of column names to `merge_update_columns`. dbt then updates _only_ those columns and leaves the rest untouched.

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

The inverse of `merge_update_columns`: list the columns you want to _exclude_ from the update, and dbt updates everything else. You can't use both options on the same model.

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

Scanning every row of a large target table to find merge matches gets expensive fast. `incremental_predicates` is an optional list of predicates added to the `MERGE` statement that prunes the target-side scan to a much smaller window.

`predicates` is accepted as an alias for `incremental_predicates`, and both behave the same.

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
Predicates reference `DBT_INTERNAL_DEST` (the target table alias). A wrong predicate can silently skip rows during the merge, so run `--full-refresh` to recover.
:::
