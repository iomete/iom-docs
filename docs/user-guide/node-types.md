---
title: Node Types
description: Configuring node types, such as CPU and memory for Spark drivers and executors.
last_update:
  date: 03/29/2024
  author: Vugar Dadalov
---

import { Plus, Trash } from "@phosphor-icons/react";
import Img from '@site/src/components/Img';

This documentation explains how to configure node types for Spark drivers and executors. We also cover the internal implementation details and providing guidelines for optimal configuration.

## Overview

To view available Node Types, go to the `Settings` menu and click on the `Node Types` tab. Here you can re-configure an existing node or create a new one.

<Img src="/img/user-guide/node-types/node-types.png" alt="Node types" />

**Create new node**

To create new node type, click the <button className="button button--primary button-iom"><Plus size={16}/>Create</button> button. After that, you'll see the following options for configuration.

| **Field**             | **Description**                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Name**              | Should be unique.                                                                                                                                      |
| **Description**       | This is what user will see on node type selection.                                                                                                     |
| **CPU in millicores** | CPU limit for Spark pod. For 1 CPU, enter 1000.                                                                                                        |
| **Memory**            | Memory limit for Spark pod. Memory size in MiB. For 1 GiB, enter 1024 MiB.                                                                             |
| **Available for**     | Driver and Executor (At least one option should be checked).                                                                                           |
| **Resource tags**     | Tags are custom name/value pairs that you can assign to IOMETE resources. These tags enable you to categorize and organize your resources effectively. |

<Img src="/img/user-guide/node-types/node-type-create.png" alt="Node type create" maxWidth="600px"/>

### Using node types

You can utilize node types in [Lakehouses](./virtual-lakehouses.md), [Spark Connect Clusters](./spark-connect.md) and [Spark Jobs](../developer-guide/spark-job/getting-started.md).
Let's navigate to the [Lakehouse create](./virtual-lakehouses.md#create-a-new-lakehouse) page. Here, you'l find options for `Node driver` and `Node executor`, which include node type selections. You can also view the Total CPU and Memory based on the selected executor and executor count.

<Img src="/img/user-guide/node-types/lakehouse-node-type-select.png" alt="Lakehouse Node type select" maxWidth="600px"/>

The node type select dropdown looks like this.
<Img src="/img/user-guide/node-types/lakehouse-node-type-select-options.png" alt="Lakehouse Node type select options" maxWidth="600px"/>

## Internal Implementation

When a user specifies a CPU and Memory for a node, IOMETE internally sets the driver (`spark.driver`) and executor (`spark.executor`) parameters in the Spark as described below:

| Parameter     | Description                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------------- |
| `cores`       | CPU * 1.5 (`spark.iomete.coreFactor=1.5`). The value is always rounded to the nearest whole number. |
| `coreLimit`   | Set to the specified CPU limit value.                                                               |
| `coreRequest` | Set to the specified CPU limit value.                                                               |
| `memory`      | Set to the specified memory limit value.                                                            |


:::note Core Factor
The 50% overhead is the default value set by `spark.iomete.coreFactor=1.5`, which can be overridden globally (in **Global Spark Settings** page) or for each Spark job by setting the `spark.iomete.coreFactor` in the **Spark config** section. This parameter accepts a number in decimal format and is used as a multiplier to the actual CPU size.
:::

:::note Requests and Limits
Both `spark.kubernetes.{driver,executor}.request.cores` and `spark.kubernetes.{driver,executor}.limit.cores` (also the **memory** config) are set to the same value. This ensures the driver and executor pods are getting the exact CPU allocated, avoiding resource contention and ensuring stable performance.
:::

### Performance Benchmarking

Using less than 1 CPU, such as 300m, can significantly slow down Spark jobs due to throttling. Benchmarking results will demonstrate performance variations with different CPU configurations.

Benchmark performed on TPC-DS 1GB dataset. For demonstration purposes, only TPC-DS queries 1, 2, 3, 4 are executed. Results are displayed in seconds.
<Img src="/img/user-guide/node-types/bar-graph.png" alt="Benchmark" maxWidth="600px"/>

- For efficient performance, it is recommended to use at least 1 vCPU for both driver and executor nodes.
- Higher CPU allocations for executors (e.g., 2 vCPUs, 4 vCPUs) will provide better performance, especially for compute-intensive tasks.
