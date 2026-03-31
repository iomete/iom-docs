---
title: Overview of Spark Configs
description: Overview of IOMETE Provided Spark Configurations Available
last_update:
  date: 07/03/2025
  author: Fuad Musayev
---

import Img from '@site/src/components/Img';

# IOMETE Spark Configurations

All Available IOMETE Spark Configuration Parameters
| **Property**                                                   | **Default Value** | **Description**                                                                    |
| -------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------- |
| `spark.iomete.driver.core.factor`                              | `1.5`             | Factor to multiply the node's CPU to calculate the number of Spark driver cores.   |
| `spark.iomete.driver.core.limit.factor`                        | `1.0`             | Factor to multiply the node's CPU to set the Kubernetes CPU limit for the driver.  |
| `spark.iomete.executor.core.factor`                            | `1.5`             | Factor to multiply the node's CPU to calculate the number of Spark executor cores. |
| `spark.iomete.executor.core.limit.factor`                      | `1.0`             | Factor to multiply the node's CPU to set the Kubernetes CPU limit for executors.   |
| `spark.iomete.server.startArrowFlightServer`                   | true              |                                                                                    |
| `spark.iomete.server.startSparkConnectServer`                  | true              |                                                                                    |
| `spark.iomete.server.startHiveThriftServer`                    | true              |                                                                                    |
| `spark.executor.iomete.loadInitialUserArtifactsForEachSession` | false             |                                                                                    |
