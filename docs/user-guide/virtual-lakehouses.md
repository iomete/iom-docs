---
title: Virtual Lakehouses
description: Learn how to create and manage virtual lakehouses in IOMETE, including cluster creation, scaling, and isolation of workloads for optimized performance and cost savings.
last_update:
  date: 08/05/2024
  author: Vugar Dadalov
---

import { Plus } from "@phosphor-icons/react";
import GridBox from "@site/src/components/GridBox";
import Img from '@site/src/components/Img';

A virtual **lakehouse** is a cluster of compute resources that provide the required resources, such as CPU, memory to perform the querying processing. Table data files are stored in cloud data storage (S3) as a shared data storage that allows multiple virtual lakehouse clusters to share the same data while isolating compute. IOMETE uses Apache Spark as a data lakehouse query engine with ACID support

---

:::info
In production environments, it is often required to isolate workloads, for example, to avoid the overhead of batch ETL jobs on ad-hoc analytical queries. Since data is decoupled and shared from virtual lakehouse, it enables the creation of multiple lakehouse clusters to isolate the workloads and turn on/off clusters based on requirements to save costs. Cluster size can be defined based on requirements and workloads.
:::

## **Create a new Lakehouse**

**1.** Go to the **Lakehouses** and click the `Create` button
<Img src="/img/user-guide/virtual-lakehouse/lakehouses.png" alt="Lakehouses"/>
<br />

**2.** Give the new lakehouse a name under **Name**.
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-create.png"  alt="Create Lakehouse" maxWidth="600px"/>
<br />

**3.** Select driver, under the **Node driver** section. Learn how to create a [custom Node type](./node-types.md).
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-driver-select.png" alt="Lakehouse driver select" maxWidth="500px" />

:::info Node driver
The Node driver runs continuously, managing executors/workers, and connections until manually stopped. If it stops, no new connections to the lakehouse can be made. It acts as the control center, orchestrating all tasks.
:::
<br />

**4.** Select the type of executor from the **Node executor** section and enter the number of executors in the **Executor count** section. Below these inputs, you'll see a real-time preview of Total **CPU and memory**. This helps you choose the right number and type of executors, ensuring you allocate enough resources for your workload. [Read more](https://spark.apache.org/docs/latest/cluster-overview.html) about spark executors.

<GridBox>
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-executor-select.png" alt="Lakehouse executor select" maxWidth="500px" />
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-executor.png" alt="Lakehouse executor" maxWidth="500px" />
</GridBox>

:::info Node executor
The Node Executor is responsible for executing queries and processing data. It scales automatically based on the auto-suspend parameter, ensuring efficient resource usage.
:::
<br />

**6.** Select volume, under the **Volume** section. [Read more](./volumes.md) about volumes.
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-volume-select.png" alt="Lakehouse volume select" maxWidth="500px" />

**7.** Set Auto suspend under **Auto suspend** section. By clicking checkbox in the left side we can **disabled Auto suspend** functionality.
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-auto-suspend.png" alt="Lakehouse auto suspend" maxWidth="500px" />

:::info
Executors will be scaled down after the specified time of inactivity. Executors will be scaled up automatically on demand (Scale up time around 10-15 seconds). It is recommended to keep auto-suspend on to minimize monthly costs.
:::

<br />

**8.** **Resource tags** are custom key/value pairs designed to help categorize and organize IOMETE resources. They provide a flexible and convenient way to manage resources by associating them with meaningful metadata.
<Img src="/img/resource-tags.png" alt="Resource tags" maxWidth="500px" />

<br />

🎉 🎉🎉 **Tadaa**! The newly created **test-lakehouse** details view is shown.

## **Lakehouse details**

The Lakehouse Detail View in our application provides a comprehensive overview and management options for a specific lakehouse instance.

<Img src="/img/user-guide/virtual-lakehouse/lakehouse-info.png" alt="Lakehouse Details" />

### Lakehouse navigation buttons

The header of the Detail View includes the following elements:

1. **Spark UI link:** This link redirects users to the Spark UI for real-time metrics and logs.
2. **Configure:** Opens the configuration settings for the lakehouse, enabling users to modify its parameters and settings.
3. **Start:** Starts the lakehouse instance if it is not already running. If the instance is already running, this button will be replaced with `Restart` and `Terminate`.
4. **Restart:** Restarts the lakehouse instance to apply new configurations or resolve issues by stopping and then starting it.
5. **Terminate:** This button stops the lakehouse instance and terminates all associated processes and jobs. You can start the instance again if needed.
6. **Delete:** Permanently deletes the lakehouse instance.

<Img src="/img/user-guide/virtual-lakehouse/lakehouse-navigation-buttons.png" alt="Lakehouse Navigation Buttons" />

### Lakehouse general informations

Under the header, there is a card displaying the following information about the lakehouse.

#### Auto suspend

By default, scaling up usually takes 1 to 2 minutes, depending on various factors like the cloud provider's response time and resource availability.

:::tip Faster Scaling-Up
In cloud environments, you can utilize IOMETE to establish a **hot pool** of preconfigured resources. This markedly accelerates the scaling process, reducing the scale-up time to a mere 10 to 15 seconds. Contact support to learn more about this feature.
:::

#### Driver state

- **Starting**: The Driver is booting up.
- **Active**: The Driver is running and ready to accept connections.
- **Stopped**: The Driver is offline and not accepting any connections.
- **Failed**: The Driver couldn't start. Contact support for assistance.

:::tip Cost Implications
You're only charged for the Driver when it's in the `Active` state.
:::

#### Executor state

- **No running executors**: There is no active executor. This happens when auto-suspend is configured. In this case, when there is no workload for a configured auto-suspend time, the cluster scales down to zero. Executors will scale up automatically based on demand.
- **Running**: Executors are active and processing data.
- **Scaling**: Executors are scheduled to start and waiting for resources to start.

#### Status examples

- **`Running 1/4`**: One out of four Executors is active. The cluster scales down to save costs when the workload is light.
- **`Running 1/4` `Scaling 3/4`**: One Executor is active, and three are waiting to start due to an increase in workload.
- **`Running 4/4`**: All Executors are active, and the cluster is at full capacity.

<Img src="/img/user-guide/virtual-lakehouse/lakehouse-general-info.png" alt="Lakehouse General Informations" />

:::tip Cost Implications
You're only billed for Executors when they're in the `Running` state.
:::

### Lakehouse connections

In this section we may observe various connections details in this part. **IOMETE** supports the following types of connections:

- Python Connection
- JDBC Connection
- [DBT Connection](/docs/integrations/dbt/getting-started-with-iomete-dbt.md)
- [Tableau Connection](/docs/integrations/bi/tableau.md)
- [Power BI Connection](/docs/integrations/bi/power-bi.md)
- [Superset Connection](/docs/integrations/bi/apache-superset.md)
- [Metabase Connection](/docs/integrations/bi/metabase.md)
- [Redash Connection](/docs/integrations/bi/redash.md)

<Img src="/img/user-guide/virtual-lakehouse/lakehouse-connections.png" alt="Lakehouse connections" />

### Lakehouse logs

In this section we can see Spark logs.
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-logs.png" alt="Lakehouse logs" />

### Lakehouse kubernetes events

Kubernetes events are only stored for a duration of one hour by default. After this period, events are automatically deleted from the system.
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-kubernetes-events.png" alt="Lakehouse kubernetes events" />

### Lakehouse activity

In this section we may check your lakehouse's **Start**/**Terminate** events.
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-activity.png" alt="Lakehouse events" maxWidth="600px" />
