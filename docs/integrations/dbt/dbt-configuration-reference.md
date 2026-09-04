---
title: dbt Configuration Reference
sidebar_label: Configuration Reference
description: Reference for dbt-iomete connection, model, incremental, and Python model settings.
last_update:
  date: 09/04/2026
  author: Abhishek Pathania
---

# dbt Configuration Reference

For installation and a complete starter profile, see [Getting Started with dbt](./getting-started-with-iomete-dbt.md).

**Available Since** identifies the first published `dbt-iomete` version that supports a setting. When a setting gained new values later, its description identifies the newer version.

## Profile Settings

Add connection settings under an IOMETE output in `~/.dbt/profiles.yml`.

| Setting | Available Since | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `type` | 1.0.0 | Yes | — | Adapter type. Set this to `iomete`. |
| `host` | 1.0.0 | Yes | — | IOMETE hostname without the protocol (e.g., `example.iomete.com`). |
| `port` | 1.0.0 | No | `443` | IOMETE port. |
| `https` | 1.7.0 | No | `true` | Uses HTTPS when `true` and HTTP when `false`. |
| `dataplane` | 1.7.3 | Yes | — | IOMETE namespace/data plane name (e.g., `iomete-system`). |
| `domain` | 1.7.4 | Yes | — | IOMETE domain name (e.g., `analytics`). |
| `lakehouse` | 1.1.0 | Yes | — | Compute cluster name. |
| `catalog` | 1.7.7 | No | `spark_catalog` | Default catalog. The adapter also accepts `database` as the underlying dbt field name. |
| `schema` | 1.0.0 | Yes | — | Default database or schema where dbt creates objects. The value cannot contain a period. |
| `user` | 1.0.0 | Yes | — | IOMETE username. |
| `token` | 1.4.0 | Yes | — | [Personal access token](/user-guide/access-tokens/personal). Use an environment variable instead of storing the token in the profile. |
| `threads` | 1.0.0 | No | `1` | Maximum number of dbt model tasks that can run concurrently. |
| `connect_retries` | 1.0.0 | No | `0` | Number of times to retry a failed connection. |
| `connect_timeout` | 1.0.0 | No | `120` | Seconds to wait between connection attempts when retries are enabled. |
| `retry_all` | 1.0.0 | No | `false` | Retries every connection error when `true`. Otherwise, retries apply only to errors reported as pending or temporarily unavailable. |
| `list_relations_threads` | 1.8.2 | No | `100` | Maximum concurrent `DESCRIBE EXTENDED` queries used while listing relations. This does not change model-build concurrency. |

Use `list_relations_threads` to tune metadata listing separately from model execution. Lower it if relation discovery creates too much load on the data plane:

```yaml title="~/.dbt/profiles.yml"
dbt_project:
  target: dev
  outputs:
    dev:
      type: iomete
      # Other connection settings omitted
      threads: 4
      list_relations_threads: 25
      connect_retries: 2
      connect_timeout: 30
      retry_all: false
```

## Model Settings

Set model configuration in a model's `config()` block or under `models` in `dbt_project.yml`.

| Setting | Available Since | Applies to | Default | Description |
| --- | --- | --- | --- | --- |
| `materialized` | 1.0.0 | SQL and Python models | `view` | Materialization type. IOMETE supports `view`, `table`, and `incremental`. |
| `file_format` | 1.0.0 | SQL tables and incremental models | `iceberg` | Spark table provider. Incremental models require `iceberg`. |
| `location_root` | 1.0.0 | SQL tables | — | Root storage location. The adapter appends the model alias to this path. |
| `partition_by` | 1.0.0 | SQL tables and incremental models | — | Column name or list of columns used to partition the table. |
| `clustered_by` | 1.0.0 | SQL tables | — | Column name or list of columns used to cluster the table. Set `buckets` with it. |
| `buckets` | 1.0.0 | SQL tables | — | Number of buckets used with `clustered_by`. The adapter emits the clustering clause only when both settings are present. |
| `options` | 1.0.0 | SQL tables | — | Mapping of Spark data source option names to values. |
| `tblproperties` | 1.7.9 | SQL tables, views, snapshots, and seeds | — | Mapping of Spark table property names to values, applied when the relation is created. |
| `persist_docs` | 1.0.0 | Tables and views | — | Persists relation descriptions and, for Iceberg tables, column descriptions. |

This example creates a partitioned Iceberg table with table properties:

```sql title="models/events.sql"
{{
  config(
    materialized='table',
    file_format='iceberg',
    partition_by=['event_date'],
    tblproperties={
      'write.format.default': 'parquet'
    }
  )
}}

select *
from raw.events
```

## Incremental Model Settings

Incremental models support the following additional settings. See [Incremental Models](./dbt-incremental-models.md) for behavior, constraints, and examples.

| Setting | Available Since | Default | Description |
| --- | --- | --- | --- |
| `incremental_strategy` | 1.0.0 | `merge` | `merge` and `append` are available from 1.0.0; `delete+insert` and `insert_overwrite` are available from 1.8.3. |
| `unique_key` | 1.0.0 | — | Column name or list of columns that identifies target rows for `merge` or `delete+insert`. Lists containing multiple columns are available from 1.7.7. Without a key, both strategies insert every source row. |
| `on_schema_change` | 1.0.0 | `ignore` | Controls how dbt handles source and target column differences. Supports `ignore`, `fail`, `append_new_columns`, and `sync_all_columns`. |
| `incremental_predicates` | 1.7.9 | — | List of predicates that limits target rows considered by `merge` or deleted by `delete+insert`. `predicates` is an alias. |
| `merge_update_columns` | 1.0.0 | All columns | List of columns to update when a row matches. |
| `merge_exclude_columns` | 1.7.7 | — | List of columns to exclude from matched-row updates. Do not combine this with `merge_update_columns`. |

## Python Model Settings

Python models run through an existing IOMETE Spark job and always write Iceberg tables. SQL-only table settings such as `location_root`, `clustered_by`, and `options` do not apply.

| Setting | Available Since | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `spark_job_id` | 1.7.1 | Yes | — | ID of the IOMETE Spark job used to run the compiled Python model. |
| `spark_job_overrides` | 1.7.1 | No | `{}` | Per-run overrides containing `arguments`, `envVars`, or `sparkConf`. |

Replace `YOUR_SPARK_JOB_ID` with the ID of an existing IOMETE Spark job:

```python title="models/my_python_model.py"
def model(dbt, spark):
    dbt.config(
        materialized="table",
        spark_job_id="YOUR_SPARK_JOB_ID",
        spark_job_overrides={
            "arguments": ["--environment", "production"],
            "envVars": {"LOG_LEVEL": "INFO"},
            "sparkConf": {"spark.sql.shuffle.partitions": "200"},
        },
    )

    return dbt.ref("source_model")
```
