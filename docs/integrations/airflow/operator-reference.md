---
title: IometeOperator Reference
sidebar_label: Operator Reference
description: Reference for IometeOperator parameters, configuration overrides, templates, and job run states.
last_update:
  date: 09/04/2026
  author: Abhishek Pathania
---

# IometeOperator Reference

`IometeOperator` submits an existing IOMETE Spark job and monitors its run from an Airflow task. Complete [Getting Started with Airflow](./getting-started.mdx) before using this reference.

## Parameters

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `task_id` | `str` | Yes | — | Unique identifier for the task in the DAG. |
| `job_id` | `str` | Yes | — | IOMETE Spark job ID or name. |
| `host` | `str` | Yes | — | IOMETE platform URL. |
| `domain` | `str` | Yes | — | IOMETE domain identifier. |
| `access_token` | `str` | One token option | — | Personal access token passed as a raw string. This field is not templatable. |
| `access_token_variable` | `str` | One token option | — | Name of an Airflow Variable containing the token. The plugin resolves it when the task runs. |
| `host_verify` | `bool` | No | `True` | Verifies the IOMETE host's TLS certificate. |
| `config_override` | `dict` or `str` | No | `{}` | Overrides arguments, environment variables, or Spark configuration for this run. |
| `polling_period_seconds` | `int` | No | `10` | Seconds between job status checks. |
| `do_xcom_push` | `bool` | No | `False` | Pushes `job_id` and `job_run_id` to XCom. |

Set either `access_token` or `access_token_variable`, never both.

## Template Fields

Airflow applies Jinja templating to:

- `job_id`
- `config_override`
- `host`
- `domain`
- `access_token_variable`

The raw `access_token` field is intentionally excluded because Airflow stores rendered fields in its metadata database and displays them in the UI.

## Configuration Overrides

`config_override` accepts a dictionary or JSON string with these optional fields:

```json
{
  "arguments": ["arg1", "arg2"],
  "envVars": {
    "key": "value"
  },
  "sparkConf": {
    "spark.example.variable": "sample_value"
  }
}
```

See [DAG Examples](./examples.md#overriding-job-configuration) for a templated runtime override.

## Job Run States

| State | Description | Final? |
| --- | --- | --- |
| `ENQUEUED` | Job is queued. | No |
| `SUBMITTED` | Job is being deployed. | No |
| `RUNNING` | Job is running. | No |
| `COMPLETED` | Job completed successfully. | Yes |
| `FAILED` | Job failed. | Yes |
| `ABORTED` | Job was cancelled. | Yes |
| `ABORTING` | Job cancellation is in progress. | No |

A `FAILED` or `ABORTED` run raises an `AirflowException`. If the Airflow task is killed, the operator cancels the active IOMETE job run.

## XCom Values

When `do_xcom_push=True`, the operator publishes:

| Key | Description |
| --- | --- |
| `job_id` | ID of the submitted IOMETE Spark job. |
| `job_run_id` | ID of the specific job run. |

See [Passing Run Details with XCom](./examples.md#passing-run-details-with-xcom) for usage.
