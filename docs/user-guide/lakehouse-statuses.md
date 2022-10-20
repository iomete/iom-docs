---
title: Lakehouse statuses
description: Explanation of iomete lakehouse cluster statuses
last_update:
  date: 10/20/2022
  author: Vusal D.
hide_table_of_contents: true
---
This page describes the iomete lakehouse cluster statuses


:::note
We need to understand the cluster components to understand the lakehouse cluster's statuses. Lakehouse cluster comprises of driver and executors.
- **Driver:** is the gateway to accept and keep connections, plan executions, and orchestrate executors.
- **Executors:** are the components that do the actual processing.
:::

## Statuses

A lakehouse cluster can be one of the following statuses:

| Status     | Description                                                                                                                                                                                                                                                                                                                                                                                                                             |
|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Stopped    | Cluster is completely turned off. <br/><br/>**Driver:** Not running<br/>**Executors:** No executors running<br/>**Accepting connections:** No<br/>**Cost charging:** No                                                                                                                                                                                                                                                                 |
| Pending    | Cluster is newly started manually and waiting for resources for the driver<br/><br/>**Driver:** Not running. Waiting for the resources<br/>**Executors:** No executors running<br/>**Accepting connections:** No<br/>**Cost charging:** No                                                                                                                                                                                              |
| Suspended  | This status happens when auto-scale is enabled on the cluster. When the cluster stays without any workload, it scales down and turns off the executors to prevent charging costs. Only the driver is running. When the driver gets a query, it starts executors to handle the processing<br/><br/>**Driver:** Running<br/>**Executors:** No executors running<br/>**Accepting connections:** Yes<br/>**Cost charging:** Only for driver |
| Scaling-up | This status happens when auto-scale is enabled on the cluster. The cluster decides to scale up executors based on the workload needs up to the maximum of the cluster size.<br/><br/>**Driver:** Running<br/>**Executors:** 0 or some already running, and new executors are being started<br/>**Accepting connections:** Yes<br/>**Cost charging:** For driver and already running executors                                           |
| Running    | Cluster is running state<br/><br/>**Driver:** Running<br/>**Executors:** Running<br/>**Accepting connections:** Yes<br/>**Cost charging:** For driver and running executors                                                                                                                                                                                                                                                             |
