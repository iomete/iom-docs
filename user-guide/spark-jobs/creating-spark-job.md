---
title: Creating Spark Job
sidebar_label: Creating Spark Job
description: Learn how to run your first Spark Job on the IOMETE platform using PySpark. Follow our step-by-step guide and get started with Spark Jobs today!
last_update:
  date: 04/20/2026
  author: Ujjawal Khare
---

import Img from '@site/src/components/Img';
import { Plus, Code, Cpu } from "@phosphor-icons/react";


Each Spark Job runs as an isolated Spark application with its own driver and (optionally) executors. Here's how to create one:

1. In the left sidebar, under **Applications**, click **Job Templates**.
2. Click <button className="button button--primary button-iom"><Plus size={16} /><b>New Job Template</b></button> in the top-right corner.
3. Fill in the form sections described below.
4. Click <button className="button button--primary button-iom">Create</button> to submit.

You can also click the <button className="button button--primary button-iom"><Code size={16} /></button> button next to Create to view the equivalent cURL command for API-based creation.

<Img src="/img/guides/spark-job/job-create-form.png" alt="Spark Job create form showing Name, Application, and Instance sections" maxWidth="700px"/>

### General

- **Name** (required): A name for the job, e.g. `sample-job`. Allowed characters: alphanumeric, dashes, underscores, dots, and spaces.
- **Description** (optional): A brief explanation of what the job does.

### Resource Bundle

- **Resource bundle** (required): The [resource bundle](/user-guide/ras/resource-bundles) that defines resource quotas available to this job.

### Namespace

- **Namespace**: The Kubernetes namespace to deploy the job in. Auto-selects if only one namespace exists.

### Run as User

- **Run as user**: The user identity the job runs under. Defaults to the currently logged-in user.

### Schedule

Configure when and how often the job runs. See [Application Config — Schedule](./spark-application-config.md#schedule) for details.

- **Trigger type**: **Manual** (default, run on demand), **Interval** (e.g. every 5 minutes), or **Cron** expression for recurring execution.
- **Concurrency** (scheduled jobs only): Controls overlap behavior — **Allow**, **Replace**, or **Forbid**.

### Application

Define the code the job runs. See [Application Config — Application](./spark-application-config.md#application) for details.

- **Application type**: Select **Python** (default) or **JVM** (Java, Scala).
- **Docker registry** + **Docker image**: Select the registry from the dropdown (use `default` for IOMETE's built-in registry or choose a [private Docker registry](/user-guide/private-docker-registry)), then enter the image and tag (e.g. `iomete/sample-job:1.0.0`).
- **Main class** (JVM only): The fully qualified class name, e.g. `org.example.MyApp`. Hidden for Python jobs.
- **Main application file** (required): The entry point of the job. For PySpark: `local:///app/job.py`. For JVM jobs, use `spark-internal` if the class is already in the classpath.


### Configurations

Tune Spark behavior and inject runtime settings without rebuilding a Docker image. See [Application Config — Configuration](./spark-application-config.md#configuration) for details.

- **Environment variables**: Key-value pairs injected at runtime.
- **Spark config**: Standard Spark properties (e.g. `spark.executor.memoryOverhead = 512m`).
- **Arguments**: Command-line arguments passed to the Spark application.
- **Java options**: JVM flags for driver and executor processes.
- **Config maps**: Kubernetes ConfigMaps mounted into the job's pods.

### Dependencies

Pull in external code and packages at Spark startup. See [Application Config — Dependencies](./spark-application-config.md#dependencies) for details.

- **Jar file locations**: URLs or paths to additional JAR files.
- **Files**: URLs or paths to additional data files.
- **PY file locations**: Python files (`.py`, `.egg`, or `.zip`) for PySpark.
- **Maven packages**: Maven coordinates resolved at startup (e.g. `org.apache.spark:spark-avro_2.13:3.5.0`).

### Instance

Configure compute resources for the job. See [Application Config — Instance](./spark-application-config.md#instance-configuration) for details.

- **Deployment type**: Choose **Standard** (clustered, with separate driver and executors) or **Single node** (lightweight, single machine).
- **Node driver** (required): The [node type](/user-guide/node-types/overview) for the Spark driver.
- **Node executor** + **Executor count** (Standard mode only): The [node type](/user-guide/node-types/overview) for executors and how many to run.
- **Executors Volume**: A [volume](/user-guide/volumes) for executor (or driver in Single node mode) storage.

### Restart Policy

Controls automatic restart behavior. See [Application Config — Restart Policy](./spark-application-config.md#restart-policy) for details.

- **Policy**: **Never** (default), **Always**, or **OnFailure**.
- **Retry counts and intervals** (OnFailure only): Configure retry limits and backoff for both submission and runtime failures.

### Max Execution Duration

- **Max execution duration** (required): The maximum time (in seconds) a job run is allowed to execute before it is terminated. Minimum 60 seconds.

### Resource Tags

- **Resource tags** (optional): Key-value labels applied to the job's Kubernetes resources. Must follow [Kubernetes label syntax](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set).

### Advanced Settings

- **Deployment flow**: **Legacy** or **Priority-Based** (when available).
- **Execution priority**: **Normal** or **High**. See [Job Orchestrator](./job-orchestrator.md) for details.

## Running a Spark Job

Once the Spark Job is created, you are redirected to the job detail page. The detail page has three tabs:

- **Details**: Shows job configuration: name, schedule, compute resources, namespace, metadata, and advanced settings.
- **Applications**: Lists all job runs with status, filters, and the **Run** button.
- **Notifications**: Configure email notifications for job events (when enabled).

To run the job, go to the **Applications** tab and click the **Run** button. A new run will appear in the applications list.

<Img src="/img/guides/spark-job/job-list.png" alt="Spark Job applications list showing a completed run with status and duration"/>

You can monitor the run status directly in the applications list. Click on a run to view its logs, metrics, and events.

<Img src="/img/guides/spark-job/job-run-view.png" alt="Spark Job Run Details"/>

## Managing Spark Jobs

From the job main page, you can:

- **Configure**: Edit the job's settings (application, instance, schedule, etc.).
- **Duplicate**: Create a new job pre-filled with this job's configuration.
- **Suspend / Resume**: Pause or resume a scheduled job's automatic runs.
- **Delete**: Permanently remove the job.
- **API operations**: View cURL commands for getting job details, executing the job, listing runs, and deleting the job.

<Img src="/img/guides/spark-job/job-options.png" alt="Spark Job actions menu showing Configure, Duplicate, Suspend, Delete, and API operations"/>

:::info ACCESS TOKEN
To use the API, you need an [access token](/user-guide/access-tokens/personal). Go to the **Settings** menu and switch to the **Access Tokens** tab.
:::
