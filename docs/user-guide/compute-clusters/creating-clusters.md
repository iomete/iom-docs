---
title: Creating a Cluster
description: Step-by-step guide to creating a compute cluster, covering the General, Configurations, Dependencies, Docker settings, Tags, and Review tabs.
sidebar_label: Creating a Cluster
last_update:
  date: 02/26/2026
  author: Abhishek Pathania
---

import Img from '@site/src/components/Img';

Each workload benefits from its own cluster, keeping resources isolated and performance predictable. Setup takes about a minute.

1. Go to the **Compute** page.
2. Click **New Compute Cluster** in the top-right corner.
3. Walk through the six tabs: **General**, **Configurations**, **Dependencies**, **Docker settings**, **Tags**, and **Review & Create**.
4. On **Review & Create**, verify the summary and click **Create**.

Move between tabs with **Previous** and **Next**, or click any tab directly. **Next** validates the current tab before advancing. If validation fails, the tab shows a red exclamation mark; fix the flagged fields before continuing.

## General Tab

This is where you set identity, sizing, and scaling for the cluster.

- **Name** (required): A unique name using lowercase letters, numbers, and hyphens. Must start and end with a letter or number. Can't be changed after creation.

  :::info Naming Constraints
  Maximum 53 characters. Pattern: `^[a-z0-9]([-a-z0-9]*[a-z0-9])?$`.
  :::

- **Description** (optional): A short explanation of the cluster's purpose.

- **Bundle** (required if resource-level access control is enabled): Links the cluster to a resource bundle that defines access permissions. Hidden when resource-level access control is disabled. Like the name, this can't be changed later.

- **Namespace** (required): Kubernetes namespace where the cluster runs. Only namespaces available to your account appear.

- **Deployment type**: Choose between:
  - **Multi-node** (default): Uses separate driver and executor pods.
  - **Single-node**: Runs only the Spark driver. Executor-related fields and **Auto scaling** are hidden.

- **Driver node** (required): The [node type](../node-types.md) assigned to the Spark driver. The driver coordinates executors and handles incoming connections.

- **Executor node** (required for multi-node): The [node type](../node-types.md) used for executor pods.

- **Executor count** (required for multi-node): Maximum number of executor pods. Defaults to `1`. The minimum can't exceed the maximum.

- **Use spot instances** (optional): Runs executor pods on spot or preemptible instances to cut costs. Off by default.

- **Volume** (optional): Attach a persistent volume. See [Volumes](../volumes.md) for configuration details.

- **Auto scaling** (multi-node only): On by default. Executors scale to zero after the configured idle period and spin back up when a query arrives. Timeout options range from 1 minute to 3 hours (default: 30 minutes). Select **Disabled** to keep executors running continuously.

  :::tip Keep Auto Scaling Enabled
  You're only billed for executors in the `Running` state. Scale-up takes 10 to 15 seconds with a hot pool, or 1 to 2 minutes otherwise.
  :::

<Img src="/img/user-guide/compute-clusters/create-general.png" alt="Create compute cluster -- General tab" maxWidth="700px" />

## Configurations Tab

Use this tab to tune Spark behavior, inject secrets, and set JVM options without rebuilding a Docker image.

- **Environment variables**: key-value pairs injected at runtime, supporting both plain text and secret-backed values.
- **Spark config**: standard Spark properties (for example, `spark.executor.memoryOverhead = 512m`). Also supports secrets.
- **Arguments**: command-line arguments passed to the Spark application.
- **Java options**: JVM flags for driver and executor processes (for example, `-XX:+UseG1GC`).

<Img src="/img/user-guide/compute-clusters/create-configs.png" alt="Create compute cluster -- Configurations tab" maxWidth="700px" />

## Dependencies Tab

Pull in external JARs, Python packages, and Maven artifacts at Spark startup.

- **Jar file locations**: URLs or paths to JAR files on the classpath (for example, `https://repo.example.com/my-udf.jar`).
- **Files**: URLs or paths to additional files available at runtime.
- **PY file locations**: Python files (`.py`, `.egg`, or `.zip`) for PySpark (for example, `local:///app/package.egg`).
- **Maven packages**: Maven coordinates resolved at startup (for example, `org.apache.spark:spark-avro_2.13:3.5.0`).

<Img src="/img/user-guide/compute-clusters/create-dependencies.png" alt="Create compute cluster -- Dependencies tab" maxWidth="700px" />

## Docker Settings Tab

Override the default Spark runtime image here. The **Docker image** field (optional) lists images from your registered Docker registries. See [Private Docker Registry](../private-docker-registry.md) for setup details.

<Img src="/img/user-guide/compute-clusters/create-docker.png" alt="Create compute cluster -- Docker Settings tab" maxWidth="700px" />

## Tags Tab

Attach **Resource tags** (key-value metadata pairs) to categorize the cluster. Tags show up on the detail page and are handy for cost allocation or operational filtering.

<Img src="/img/user-guide/compute-clusters/create-tags.png" alt="Create compute cluster -- Tags tab" maxWidth="700px" />

## Review & Create Tab

This tab shows a read-only summary of your configuration. Look it over, and if anything needs adjusting, click the relevant tab to go back. When everything looks correct, click **Create**.

If creation succeeds, IOMETE provisions the cluster and redirects you to its detail page. If the cluster name is already taken, you're returned to the **General** tab with a validation error. If resource quotas are exceeded, the form highlights the affected fields with error messages.


<Img src="/img/user-guide/compute-clusters/create-review.png" alt="Create compute cluster -- Review & Create tab" maxWidth="700px" />
