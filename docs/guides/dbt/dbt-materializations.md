---
title: DBT Materializations
description: DBT Materializations on iomete platform. Learn how to set different materialization types (view, table, incremental) and understand their pros & cons
last_update:
  date: 07/11/2022
  author: Vusal Dadalov
---

import Img from '@site/src/components/Img';

# DBT Materializations

[Materializations](https://docs.getdbt.com/terms/materialization) are strategies for persisting dbt models in a warehouse. There are 3 types of materializations supported by `dbt-iomete`. They are:

- [table](https://docs.getdbt.com/terms/table)
- [view](https://docs.getdbt.com/terms/view)
- [incremental](dbt-incremental-models)

## Configuring materializations

:::tip
By default, dbt models are materialized as `views`.
:::

There are two options to configure the materialization.

### Option 1. Globally

On `dbt_project.yaml`

```yaml
# The following dbt_project.yml configures a project that looks like this:
# .
# └── models
#     ├── csvs
#     │   ├── employees.sql
#     │   └── goals.sql
#     └── events
#         ├── stg_event_log.sql
#         └── stg_event_sessions.sql

name: my_project
version: 1.0.0
config-version: 2

models:
  my_project:
    events:
      # materialize all models in models/events as tables
      +materialized: table
    csvs:
      # this is redundant, and does not need to be set
      +materialized: view
```

### Option 2. Per model

Setting on the model configuration directly inside the model sql files.

```sql
{{ config(materialized='table') }}

select *
from ...
```

## Materializations

### View

When using the `view` materialization, your model is rebuilt as a view on each run via a `create view as` statement.

- **Pros:** No additional data is stored, and views on top of source data will always have the latest records in them.
- **Cons:** Views that perform a significant transformation, or are stacked on top of other views, are slow to query.
- **Advice:**
  - Generally, start with views for your models and only change to another materialization when you notice performance problems.
  - Views are best suited for models that do not do significant transformation, e.g., renaming, or recasting columns.

### Table

When using the `table` materialization, your model is rebuilt as a [table](https://docs.getdbt.com/terms/table) on each run via a `create table as` statement.

- **Pros:** Tables are fast to query
- **Cons:**
  - Tables can take a long time to rebuild, especially for complex transformations
  - New records in underlying source data are not automatically added to the table
- **Advice:**
  - Use the table materialization for any models being queried by BI tools, to give your end user a faster experience
  - Also use the table materialization for any slower transformations that are used by many downstream models

### Incremental

`incremental` models allow dbt to insert or update records into a table since the last time that dbt was run.

- **Pros:** You can significantly reduce the build time by just transforming new records
- **Cons:** Incremental models require extra configuration and are an advanced usage of dbt. Read more about using incremental models on iomete [here](dbt-incremental-models).
- **Advice:**
  - Incremental models are best for event-style data
  - Use incremental models when your `dbt run`s are becoming too slow (i.e. don't start with incremental models)

