---
title: Virtual Lakehouses
description: Learn how to create and manage virtual lakehouses in IOMETE, including cluster creation, scaling, and isolation of workloads for optimized performance and cost savings.
last_update:
  date: 12/25/2022
  author: Nurlan Mammadov
---

import { Plus } from "@phosphor-icons/react";

import Img from '@site/src/components/Img';

A virtual **lakehouse** is a cluster of compute resources that provide the required resources, such as CPU, memory to perform the querying processing. Table data files are stored in cloud data storage (S3) as a shared data storage that allows multiple virtual lakehouse clusters to share the same data while isolating compute. IOMETE uses Apache Spark as a data lakehouse query engine with ACID support

---

:::info
In production environments, it is often required to isolate workloads, for example, to avoid the overhead of batch ETL jobs on ad-hoc analytical queries. Since data is decoupled and shared from virtual lakehouse, it enables the creation of multiple lakehouse clusters to isolate the workloads and turn on/off clusters based on requirements to save costs. Cluster size can be defined based on requirements and workloads.
:::

## **Create a new Lakehouse**

**1.** Go to the **Lakehouses** and click the <span className="inline-button"><Plus size={16}/>Create</span> button
<Img src="/img/user-guide/virtual-lakehouse/create-new.png" alt="Create New Lakehouse" />
<br />

**2.** Give the new **lakehouse** a name under **Name**.
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-name.png"  alt="Lakehouse name" maxWidth="500px" />
<br />

**3.** Under the **Type** section, choose **type**.
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-type.png" alt="Lakehouse type" maxWidth="500px" />

:::info
Type defines the maximum number of executors/workers that spark could scale. Read more about spark executors [here](https://spark.apache.org/docs/latest/cluster-overview.html).
:::
<br />

**4.** Select **driver**, under the Driver section.
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-driver.png" alt="Lakehouse driver" maxWidth="500px" />

:::info
Spark driver is running all the time until lakehouse stopped manually. Driver is responsible for managing executors/workers and connections. If stopped, no connections could be established to the lakehouse.
:::
<br />

**5.** Select **executor**, under the Executor section.
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-executor.png" alt="Lakehouse executor" maxWidth="500px" />

:::info
Executors basically are responsible for executing the queries. They will be scaled up and down automatically based on the auto-scale parameter. Keep auto-scale on to minimize lakehouse costs.
:::
<br />

**6.** Set **auto scale,** under Auto scale section.
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-autoscale.png" alt="Lakehouse Auto Scale" maxWidth="500px" />

:::info
Executors will be scaled down after the specified time of inactivity. Executors will be scaled up automatically on demand (Scale up time around 10-15 seconds). It is recommended to keep auto-scale on to minimize monthly costs.
:::

By clicking checkbox in the left side we can **disabled** **auto scale** functionality.

<Img src="/img/user-guide/virtual-lakehouse/lakehouse-autoscale-check.png" alt="Lakehouse Auto Scale Check" maxWidth="500px" />
<br />

**7.** Click the **Create** button after adding a **description** to the **optional description field**.
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-desc.png" alt="Lakehouse Description" maxWidth="500px" />
<br />

🎉 🎉🎉 **Tadaa**! The newly created **test-lakehouse** details view is shown.

<Img src="/img/user-guide/virtual-lakehouse/lakehouse-details.png" alt="Lakehouse Detail" />

1.  Navigation buttons
    - **Spark UI** - this button will take us Spark Jobs information.
    - **Edit -** this button will take us to the editing form.
    - **Terminate / Start -** buttons for the lakehouse's start and stop.
2.  **Lakehouse's** general information.
3.  Lakehouse **statuses**
    :::info
    More details about **lakehouse** **statuses** click [here](#lakehouse-statuses)
    :::

4.  **Connections** details
    In this section we may observe various connections details in this part. For instance, **Python**, **JDBC**, and others connections.
5.  **Audit logs**
    In this section we may check your lakehouse's **start**/**stop** logs.

6.  **Delete** - this button makes it simple to **remove** Lakehouse.

## Lakehouse Cluster Statuses

To effectively manage and monitor your lakehouse cluster, you need to understand its two main components: the **Driver** and the **Executors**.

- **Driver** acts as the control center, managing connections and orchestrating tasks
- **Executors** carry out the actual data processing.

### Driver Status

What Each Status Means

- **Stopped**: The Driver is offline and not accepting any connections.
- **Starting**: The Driver is booting up.
- **Active**: The Driver is running and ready to accept connections.
- **Failed**: The Driver couldn't start. Contact support for assistance.

<Img src="/img/user-guide/virtual-lakehouse/statuses/driver-status.png" alt="Driver status" />

:::tip Cost Implications
You're only charged for the Driver when it's in the 'Active' state.
:::

### Executor Status

What Each Status Means

- **No Running Executors**: There is no active executor. This happens when auto-scale is configured. In this case, when there is no workload for a configured auto-suspend time, the cluster scales down to zero. Executors will scale up automatically based on demand.
- **Pending**: Executors are scheduled to start and waiting for resources to start.
- **Running**: Executors are active and processing data.

#### Status Examples

- **Running 1/4**: One out of four Executors is active. The cluster scales down to save costs when the workload is light.
- **Running 1/4 Pending 3/4**: One Executor is active, and three are waiting to start due to an increase in workload.
  <Img src="/img/user-guide/virtual-lakehouse/statuses/scaling-up.png" alt="Lakehouse is scaling-up." />
- **Running 4/4**: All Executors are active, and the cluster is at full capacity.
  <Img src="/img/user-guide/virtual-lakehouse/statuses/running.png" alt="All executors are active" />

:::tip Cost Implications
You're only billed for Executors when they're in the 'Running' state.
:::

### Scaling-Up Timing

By default, scaling up usually takes 1 to 2 minutes, depending on various factors like the cloud provider's response time and resource availability.

:::tip Faster Scaling-Up
In cloud environments, you can utilize IOMETE to establish a **hot pool** of preconfigured resources. This markedly accelerates the scaling process, reducing the scale-up time to a mere 10 to 15 seconds. Contact support to learn more about this feature.
:::
