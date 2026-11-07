---
title: Creating a Cluster
description: Step-by-step guide to creating a compute cluster, covering the General, Configurations, Dependencies, Docker settings, Resource tags, and Review tabs.
sidebar_label: Creating a Cluster
last_update:
  date: 11/07/2026
  author: Abhishek Pathania
---

import Img from '@site/src/components/Img';

Create a compute cluster to give a workload its own Spark driver and executors. The cluster runs in an existing Kubernetes namespace managed by a data plane. It still shares the underlying Kubernetes cluster's capacity with other workloads. Here's how to create one:

1. Go to the **Compute** page.
2. Click **New compute cluster** in the top-right corner.
3. Walk through the six tabs: **General**, **Configurations**, **Dependencies**, **Docker settings**, **Resource tags**, and **Review & Create**.
4. On **Review & Create**, verify the summary and click **Create**.

Move between tabs with **Previous** and **Next**, or click any tab directly. The form checks every tab when you click **Create**. If a field is invalid, the form opens the first tab with an error, and each tab with an error shows a red alert icon. Fix the flagged fields and click **Create** again.

## General Tab

This is where you set identity, sizing, and scaling for the cluster.

- **Name** (required): A unique name using lowercase letters, numbers, and hyphens. Must start and end with a letter or number. Can't be changed after creation.

  :::info Naming Constraints
  Maximum 53 characters. Pattern: `^[a-z0-9]([-a-z0-9]*[a-z0-9])?$`.
  :::

- **Description** (optional): A short explanation of the cluster's purpose.

- **Resource bundle** (required): Links the cluster to a [resource bundle](/user-guide/ras/resource-bundles) that defines access permissions. Like the name, this can't be changed later. To create a bundle from the form, click **New resource bundle** at the bottom of the list (requires permission to create resource bundles).

- **Deploy to Kubernetes namespace** (required): Choose the namespace under the data plane that should run the cluster, for example `finance` under `analytics`. Only deployment targets available to your account appear. See [Selecting a Namespace](../namespace-quotas.md#selecting-a-namespace) if the list is empty.

- **Deployment type**: Choose between:
  - **Standard** (default): Uses separate driver and executor pods.
  - **Single node**: Runs only the Spark driver. Executor-related fields and **Auto scaling** are hidden.

- **Node driver** (required): The [node type](../node-types/node-type-sizing.md) assigned to the Spark driver. The driver coordinates executors and handles incoming connections.

- **Node executor** (required for Standard): The [node type](../node-types/node-type-sizing.md) used for executor pods. If the selected node type supports spot instances, a **Spot** checkbox appears next to the label. Select it to prefer spot nodes for executors; IOMETE falls back to on-demand nodes when no spot node is available.

- **Min executor count** (Standard with auto scaling only): Minimum number of executor pods. Default is `1`. It can't exceed the maximum.

- **Max executor count** (required for Standard): Maximum number of executor pods. Default is `2`. When auto scaling is disabled, this field is labeled **Executor count**.

- **Auto scaling** (Standard only): Executors scale down to the minimum after the selected idle period and scale back up when a query runs. Options range from 1 minute to 3 hours. Default is 30 minutes. Select **Disabled** to keep executors running continuously.

- **Executors volume** (optional): Attach a persistent volume. For a single-node cluster, this field is labeled **Driver volume**. See [Volumes](../volumes.md) for configuration details.

- **Query acceleration** (optional): Runs Spark SQL through [Apache DataFusion Comet](https://datafusion.apache.org/comet/), a native vectorized engine. Off by default and not available for single-node clusters. It needs a Spark 4 or newer image; if the default image is older, the form asks you to choose a newer one on the **Docker settings** tab.

  :::tip Keep Auto Scaling Enabled
  You're only billed for executors in the `Running` state. Scale-up takes 10 to 15 seconds with a hot pool, or 1 to 2 minutes otherwise.
  :::

<Img src="/img/user-guide/compute-clusters/create-general.png" alt="Create compute cluster -- General tab" maxWidth="700px" />

## Configurations Tab

Use this tab to tune Spark behavior, inject secrets, and set JVM options without rebuilding a Docker image.

- **Environment variables**: key-value pairs injected at runtime. The form accepts plain-text values, so avoid putting credentials here.
- **Spark config**: standard Spark properties as plain-text key-value pairs (for example, `spark.executor.memoryOverhead = 512m`).
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

## Resource Tags Tab {#tags-tab}

Attach **Resource tags** (key-value metadata pairs) to categorize the cluster. Tags show up on the detail page and are handy for cost allocation or operational filtering.

<Img src="/img/user-guide/compute-clusters/create-tags.png" alt="Create compute cluster -- Resource tags tab" maxWidth="700px" />

## Review & Create Tab

This tab shows a read-only summary of your configuration, including separate **Data plane** and **Namespace** rows. Verify both match your intended deployment, and if anything needs adjusting, click the relevant tab to go back. When everything looks correct, click **Create**.

If creation succeeds, IOMETE provisions the cluster and redirects you to its detail page. If the cluster name is already taken, you're returned to the **General** tab with a validation error. If resource quotas are exceeded, the form highlights the affected fields with error messages. See [Namespace Quotas](../namespace-quotas.md#checking-quota-before-creating-a-resource).

<Img src="/img/user-guide/compute-clusters/create-review.png" alt="Create compute cluster -- Review & Create tab" maxWidth="700px" />
