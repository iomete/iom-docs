---
title: Virtual Lakehouses
description: Virtual Lakehouses. This guide explains how to create lakehouse in IOMETE
last_update:
  date: 12/25/2022
  author: Nurlan Mammadov
---

import Img from '@site/src/components/Img';

A virtual **lakehouse** is a cluster of compute resources that provide the required resources, such as CPU, memory to perform the querying processing. Table data files are stored in cloud data storage (S3) as a shared data storage that allows multiple virtual lakehouse clusters to share the same data while isolating compute. IOMETE uses Apache Spark as a data lakehouse query engine with ACID support

---

:::info
In production environments, it is often required to isolate workloads, for example, to avoid the overhead of batch ETL jobs on ad-hoc analytical queries. Since data is decoupled and shared from virtual lakehouse, it enables the creation of multiple lakehouse clusters to isolate the workloads and turn on/off clusters based on requirements to save costs. Cluster size can be defined based on requirements and workloads.
:::

## **Create a new Lakehouse[](https://iomete.com/docs/user-guide/virtual-lakehouses#create-virtual-warehouse)**

**1.** Go to the **Lakehouses** and click the **Create New** button
<Img src="/img/user-guide/virtual-lakehouse/create-new.png" alt="Create New Lakehouse" />
<br />

**2.** Give the new **lakehouse** a name under **Name**.
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-name.png" alt="Lakehouse name" />
<br />

**3.** Under the **Type** section, choose **type**.
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-type.png" alt="Lakehouse type" />

:::info
Type defines the maximum number of executors/workers that spark could scale. Read more about spark executors [here](https://spark.apache.org/docs/latest/cluster-overview.html).
:::
<br />

**4.** Select **driver**, under the Driver section.
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-driver.png" alt="Lakehouse driver" />

:::info
Spark driver is running all the time until lakehouse stopped manually. Driver is responsible for managing executors/workers and connections. If stopped, no connections could be established to the lakehouse.
:::
<br />

**5.** Select **executor**, under the Executor section.
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-executor.png" alt="Lakehouse executor" />

:::info
Executors basically are responsible for executing the queries. They will be scaled up and down automatically based on the auto-scale parameter. Keep auto-scale on to minimize lakehouse costs.
:::
<br />

**6.** Select **storage integration,** under Storage Integration section.
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-si.png" alt="Lakehouse Storage Integration" />

:::info **Optional parameter**
Useful if you need access to additional storage buckets/locations.
:::
<br />

**7.** Set **auto scale,** under Auto scale section.
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-autoscale.png" alt="Lakehouse Auto Scale" />

:::info
Executors will be scaled down after the specified time of inactivity. Executors will be scaled up automatically on demand (Scale up time around 10-15 seconds). It is recommended to keep auto-scale on to minimize monthly costs.
:::

By clicking checkbox in the left side we can **disabled** **auto scale** functionality.

<Img src="/img/user-guide/virtual-lakehouse/lakehouse-autoscale-check.png" alt="Lakehouse Auto Scale Check" />
<br />

**8.** Click the **Create** button after adding a **description** to the **optional description field**.
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-desc.png" alt="Lakehouse Description" />
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
    More details about **lakehouse** **statuses** check [this link.](https://iomete.com/docs/user-guide/lakehouse-statuses)
    :::

4.  **Connections** details
    In this section we may observe various connections details in this part. For instance, **Python**, **JDBC**, and others connections.
5.  **Audit logs**
    In this section we may check your lakehouse's **start**/**stop** logs.

6.  **Delete** - this button makes it simple to **remove** Lakehouse.
