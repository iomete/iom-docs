---
title: Airflow DAG Examples
sidebar_label: DAG Examples
description: Examples for overriding IOMETE Spark job configuration, sequencing jobs, and passing run details through XCom.
last_update:
  date: 09/04/2026
  author: Abhishek Pathania
---

# Airflow DAG Examples

These examples build on [Getting Started with Airflow](./getting-started.mdx). See the [IometeOperator Reference](./operator-reference.md) for parameter details.

The complete source examples are available in the [`iomete-airflow-plugin` repository](https://github.com/iomete/iomete-integrations/tree/main/iomete-airflow-plugin/dags).

## Overriding Job Configuration

Airflow can render `job_id` and `config_override` from parameters supplied when you trigger a DAG. In the Airflow UI, select **Run with config** and edit the values before starting the run.

Replace the host, domain, and token Variable name in this example:

```python
import pendulum
from airflow import DAG
from iomete_airflow_plugin.iomete_operator import IometeOperator

args = {
    "owner": "airflow",
    "email": ["airflow@example.com"],
    "depends_on_past": False,
    "start_date": pendulum.today("UTC"),
}

dag = DAG(
    dag_id="iomete-task-with-overrides",
    default_args=args,
    schedule=None,
    params={
        "job_id": "YOUR_JOB_ID",
        "config_override": {
            "envVars": {"ENVIRONMENT": "production"},
            "arguments": ["--full-refresh"],
            "sparkConf": {"spark.sql.shuffle.partitions": "200"},
        },
    },
)

task = IometeOperator(
    task_id="run-iomete-job",
    job_id="{{ params.job_id }}",
    config_override="{{ params.config_override }}",
    host="https://YOUR.iomete.host",
    domain="YOUR_DOMAIN",
    access_token_variable="YOUR_TOKEN_VARIABLE",
    dag=dag,
)
```

## Running Jobs Sequentially

Put shared IOMETE connection parameters in `default_args` when every task uses the same environment. Airflow passes them to each operator unless the task overrides them.

```python
import pendulum
from airflow import DAG
from iomete_airflow_plugin.iomete_operator import IometeOperator

args = {
    "owner": "airflow",
    "email": ["airflow@example.com"],
    "depends_on_past": False,
    "start_date": pendulum.today("UTC"),
    "host": "https://YOUR.iomete.host",
    "domain": "YOUR_DOMAIN",
    "access_token_variable": "YOUR_TOKEN_VARIABLE",
}

dag = DAG(dag_id="iomete-sequential-jobs", default_args=args, schedule=None)

sql_task = IometeOperator(
    task_id="run-sql",
    job_id="sql-runner",
    dag=dag,
)

catalog_task = IometeOperator(
    task_id="sync-catalog",
    job_id="iomete-catalog-sync",
    dag=dag,
)

sql_task >> catalog_task
```

## Passing Run Details with XCom

Set `do_xcom_push=True` to publish the submitted `job_id` and `job_run_id` for downstream tasks:

```python
task = IometeOperator(
    task_id="run-iomete-job",
    job_id="YOUR_JOB_ID",
    host="https://YOUR.iomete.host",
    domain="YOUR_DOMAIN",
    access_token_variable="YOUR_TOKEN_VARIABLE",
    do_xcom_push=True,
    dag=dag,
)
```

A downstream task can read both values:

```python
job_id = "{{ ti.xcom_pull(task_ids='run-iomete-job', key='job_id') }}"
job_run_id = "{{ ti.xcom_pull(task_ids='run-iomete-job', key='job_run_id') }}"
```
