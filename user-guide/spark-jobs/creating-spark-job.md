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


1. In the left sidebar, under **Applications**, click **Job Templates**.
2. On the Job Templates page, click <button className="button button--primary button-iom"><Plus size={16} /><b>New Job Template</b></button> in the top-right corner.

<Img src="/img/guides/spark-job/job-create-form.png" alt="Spark Job create form showing Name, Application, and Instance sections" maxWidth="700px"/>

The create form has several sections:

**General**

- **Name** (required): Enter a name for the job, e.g. `sample-job`. Allowed characters: alphanumeric, dashes, underscores, dots, and spaces.
- **Description** (optional): A brief description of what the job does.

**Application**

- **Application type**: Select **Python** (default) or **JVM** (Java, Scala).
- **Docker registry** + **Docker image**: A compound input. Select the registry from the dropdown (use `default` for IOMETE's built-in registry or choose a [private Docker registry](/user-guide/private-docker-registry)), then enter the image and tag. For our sample job: `iomete/sample-job:1.0.0`
- **Main class** (JVM only): The fully qualified class name, e.g. `org.example.MyApp`. Hidden for Python jobs.
- **Main application file** (required): The entry point of the job. For our sample PySpark job: `local:///app/job.py`. For JVM jobs, use `spark-internal` if the class is already in the classpath.

**Instance**

- **Deployment type**: Choose **Standard** (clustered, with separate driver and executors) or **Single node** (lightweight, single machine).
- **Node driver** (required): Select the [node type](/user-guide/node-types/overview) for the Spark driver.
- **Node executor** + **Executor count** (Standard mode only): Select the [node type](/user-guide/node-types/overview) for executors and how many executors to run.
- **Executors Volume**: Select a [volume](/user-guide/volumes) for executor (or driver in Single node mode) storage.

The form also includes the following sections. These can be left at their defaults for your first job:

**Resource bundle** (required)

Select a [resource bundle](/user-guide/ras/resource-bundles) that defines the resource quotas available to this job.

**Namespace**

Select the Kubernetes namespace to deploy the job in. Auto-selects if only one namespace exists.

**Run as user**

Choose the user identity the job runs under. Defaults to the currently logged-in user.

**Schedule**

By default, jobs are **manual** (run on demand). You can set an **Interval** (e.g., every 5 minutes) or a **Cron** expression for recurring execution. Scheduled jobs also have a **Concurrency** policy (Allow, Replace, or Forbid) that controls overlap behavior.

**Configurations**

A tabbed section for environment variables, Spark config key-value pairs, application arguments, Java options, and config maps. See [Application Config](./spark-application-config.md) for details.

**Dependencies**

A tabbed section for additional jar files, data files, Python files, and Maven packages. See [Application Config](./spark-application-config.md) for details.

**Restart policy**

Controls automatic restart behavior: **Never** (default), **Always**, or **OnFailure**. When set to OnFailure, you can configure retry counts and intervals for both submission and runtime failures.

**Max execution duration**

The maximum time (in seconds) a job run is allowed to execute before it is terminated. Minimum 60 seconds. Required.

**Resource tags**

Optional key-value labels applied to the job's Kubernetes resources. Must follow [Kubernetes label syntax](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set).

**Advanced settings**

When available, configure the deployment flow (**Legacy** or **Priority-Based**) and [execution priority](./job-orchestrator.md) (**Normal** or **High**).

Click <button className="button button--primary button-iom">Create</button> to submit. You can also click the <button className="button button--primary button-iom"><Code size={16} /></button> button next to Create to view the equivalent cURL command for API-based creation.

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
