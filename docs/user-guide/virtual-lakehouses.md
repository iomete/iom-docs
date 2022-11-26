---
title: Virtual Lakehouses
description: A virtual warehouse is a cluster of compute resources that provide the required resources
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

___

A virtual warehouse is a cluster of compute resources that provide the required resources, such as CPU, memory to perform the querying processing. Table data files are stored in cloud data storage (S3) as a shared data storage that allows multiple virtual warehouse clusters to share the same data while isolating compute. IOMETE uses Apache Spark as a data warehouse query engine with ACID support

:::info
In production environments, it is often required to isolate workloads, for example, to avoid the overhead of batch ETL jobs on ad-hoc analytical queries. Since data is decoupled and shared from virtual warehouses, it enables the creation of multiple warehouse clusters to isolate the workloads and turn on/off clusters based on requirements to save costs. Cluster size can be defined based on requirements and workloads.
:::

## Create Virtual Warehouse

1.  **Log in** to the **Console App**
2. Click the "Create New" button in the **Warehouses** tab
3. Name your warehouse, and choose cluster type and press the  "Create" button

![Virtual Warehouses](/img/user-guide/create-lakehouse.png)

<br/>

![New Virtual Warehouse Creation](/img/user-guide/lakehouse-create-form.png)

:::info
Warehouse creation takes around a minute. After the status to \"running\" you can start using the warehouse
:::

#### Warehouse Settings

On the settings tab, you can find the action buttons to start/stop/delete the warehouse

![Settings Tab](/img/user-guide/lakehouse-view.png)