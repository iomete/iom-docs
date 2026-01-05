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

### Create new node

When creating new node template, you'll see the following options for configuration.

| **Field**             | **Description**                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Name**              | Should be unique.                                                                                                                                      |
| **Description**       | This is what user will see on node type selection.                                                                                                     |
| **CPU in millicores** | CPU limit for Spark pod. For 1 CPU, enter 1000.                                                                                                        |
| **Memory**            | Memory limit for Spark pod. Memory size in MiB. For 1 GiB, enter 1024 MiB.                                                                             |
| **Available for**     | Driver and Executor (At least one option should be checked).                                                                                           |
| **Resource tags**     | Tags are custom name/value pairs that you can assign to IOMETE resources. These tags enable you to categorize and organize your resources effectively. |

<Img src="/img/user-guide/node-types/node-type-create.png" alt="Node type create" maxWidth="600px"/>

After creating node template you can utilize them in [Lakehouses](./virtual-lakehouses.md) and [Spark Jobs](../developer-guide/spark-job/getting-started.md).
Let's navigate to the [Lakehouse create](./virtual-lakehouses.md#create-a-new-lakehouse) page. Here, you'l find options for `Node driver` and `Node executor`, which include node type selections. You can also view the Total CPU and Memory based on the selected executor and executor count.

<Img src="/img/user-guide/node-types/lakehouse-node-type-select.png" alt="Lakehouse Node type select" maxWidth="600px"/>


## Internal Implementation

When configuring a Spark Resource (such as Lakehouse, Spark Job, or Connect), IOMETE automatically sets the following Spark configuration parameters based on the selected node type. The system calculates these parameters for both the driver and executor using a combination of the node's CPU and internal factors:  

**Default Spark Configuration Parameters (Driver)**  
| **Property**                            | <div style={{width: '100px'}}>**Default**</div> | **Description**                                                                         |
| --------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| `spark.driver.cores`                    | `CPU * 1.5`                                     | The number of Spark cores is set to the node's CPU multiplied by the core factor (1.5). |
| `spark.kubernetes.driver.request.cores` | `CPU`                                           | The Kubernetes CPU request is set to match the exact CPU of the selected node.          |
| `spark.kubernetes.driver.limit.cores`   | `CPU * 1.0`                                     | The Kubernetes CPU limit is set to the node’s CPU multiplied by the limit factor (1.0). |

**Default Spark Configuration Parameters (Executors)**
| **Property**                              | <div style={{width: '100px'}}>**Default**</div> | **Description**                                                                         |
| ----------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| `spark.executor.cores`                    | `CPU * 1.5`                                     | The number of Spark cores is set to the node's CPU multiplied by the core factor (1.5). |
| `spark.kubernetes.executor.request.cores` | `CPU`                                           | The Kubernetes CPU request is set to match the exact CPU of the selected node.          |
| `spark.kubernetes.executor.limit.cores`   | `CPU * 1.0`                                     | The Kubernetes CPU limit is set to the node’s CPU multiplied by the limit factor (1.0). |


## Customizing Spark Configuration in IOMETE
IOMETE provides flexibility to customize and manage these configuration parameters for Spark resources globally or per job template, allowing users to modify the core and limit factors, or even set static values if needed.

### Globally Modifying Core and Limit Factors

The following properties can be used to modify the default multiply factors globally, or for specific job templates or lakehouses:  
| **Property**                              | **Default Value** | **Description**                                                                    |
| ----------------------------------------- | ----------------- | ---------------------------------------------------------------------------------- |
| `spark.iomete.driver.core.factor`         | `1.5`             | Factor to multiply the node's CPU to calculate the number of Spark driver cores.   |
| `spark.iomete.driver.core.limit.factor`   | `1.0`             | Factor to multiply the node's CPU to set the Kubernetes CPU limit for the driver.  |
| `spark.iomete.executor.core.factor`       | `1.5`             | Factor to multiply the node's CPU to calculate the number of Spark executor cores. |
| `spark.iomete.executor.core.limit.factor` | `1.0`             | Factor to multiply the node's CPU to set the Kubernetes CPU limit for executors.   |

**Example**  
For a node with `2 CPUs`, if the core limit factors are set to `2.0`, the final value for `spark.kubernetes.driver.core.limit` or `spark.kubernetes.executor.core.limit` will be `4 CPUs`.

### Overriding with Static Values

If you want to set static values for cores and limits, you can override the default factors by using the following properties: 
| **Property**                       | **Example** | **Description**                                                                                  |
| ---------------------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| `spark.iomete.driver.cores`        | `4`         | Static value to set the number of Spark driver cores, overriding the factor-based calculation.   |
| `spark.iomete.driver.core.limit`   | `1000m`     | Static value to set the Kubernetes CPU limit for the Spark driver.                               |
| `spark.iomete.executor.cores`      | `6`         | Static value to set the number of Spark executor cores, overriding the factor-based calculation. |
| `spark.iomete.executor.core.limit` | `2000m`     | Static value to set the Kubernetes CPU limit for Spark executors.                                |

### Priority of Configuration
The final configuration is determined based on the following priority:  
1. Override values: If static override values are provided (e.g., `spark.iomete.driver.cores`), they take the highest priority.
2. Factor properties: If override values are not set, IOMETE will use the custom factors (e.g., `spark.iomete.driver.core.factor`).
3. Default values: If neither overrides nor factors are provided, IOMETE will use the default factors (`1.5` for cores and `1.0` for limits).

## Performance Benchmarking

Using less than 1 CPU, such as 300m, can significantly slow down Spark jobs due to throttling. Benchmarking results will demonstrate performance variations with different CPU configurations.

Benchmark performed on TPC-DS 1GB dataset. For demonstration purposes, only TPC-DS queries 1, 2, 3, 4 are executed. Results are displayed in seconds.
<Img src="/img/user-guide/node-types/bar-graph.png" alt="Benchmark" maxWidth="600px"/>

- For efficient performance, it is recommended to use at least 1 vCPU for both driver and executor nodes.
- Higher CPU allocations for executors (e.g., 2 vCPUs, 4 vCPUs) will provide better performance, especially for compute-intensive tasks.
