---
title: Compute Clusters
description: Learn how to create and manage compute clusters in IOMETE, including cluster creation, deployment types, scaling, and workload isolation for optimized performance and cost savings.
last_update:
  date: 11/03/2025
  author: Abhishek Pathania
---

import GridBox from "@site/src/components/GridBox";
import Img from '@site/src/components/Img';

A **Compute Cluster** is a cluster of compute resources that provides CPU and memory to perform query processing and data transformations. Table data files are stored in cloud data storage (S3) as a shared data layer, allowing multiple compute clusters to access the same data while maintaining isolated compute resources. IOMETE uses Apache Spark as the query engine with ACID support.

---

:::info Workload Isolation
In production environments, it's often necessary to isolate workloads—for example, to prevent batch ETL jobs from impacting ad-hoc analytical queries. Since data is decoupled from compute clusters, you can create multiple clusters to isolate workloads and turn them on/off based on demand to optimize costs. Cluster size can be configured based on workload requirements.
:::

## **Create a Compute Cluster**

**1.** Go to **Compute Clusters** and click the `Create` button
<Img src="/img/user-guide/virtual-lakehouse/lakehouses.png" alt="Compute Clusters"/>
<br />

**2.** Provide a **Name** for the compute cluster. Names must be lowercase alphanumeric with hyphens, maximum 53 characters.
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-create.png"  alt="Create" maxWidth="600px"/>
<br />

**3.** Optionally add a **Description** to document the cluster's purpose or usage.
<br />

**4.** Select **Deployment Type**:
- **Multi-node**: Separate driver and executor nodes for distributed processing (recommended for production workloads)
- **Single-node**: Combined driver and executor on a single instance (suitable for development or light workloads)

<br />

### Multi-node Configuration

**5.** Select the **Driver** node type. Learn how to create a [custom Node type](./node-types.md).
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-driver-select.png" alt="Driver select" maxWidth="500px" />

:::info Driver Node
The Driver node runs continuously, managing executors/workers and connections until manually stopped. If the driver stops, no new connections to the cluster can be made. It acts as the control center, orchestrating all tasks.
:::
<br />

**6.** Select the **Executor** node type and specify **Max Executors** count. Below these inputs, you'll see a real-time preview of total **CPU and memory**. This helps you allocate appropriate resources for your workload. [Read more](https://spark.apache.org/docs/latest/cluster-overview.html) about Spark executors.

<GridBox>
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-executor-select.png" alt="Executor select" maxWidth="500px" />
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-executor.png" alt="Executor count" maxWidth="500px" />
</GridBox>

:::info Executor Nodes
Executor nodes are responsible for executing queries and processing data. They scale automatically based on the Auto Scaling configuration, ensuring efficient resource usage.
:::
<br />

**7.** Select volume under the **Volume** section. [Read more](./volumes.md) about volumes.
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-volume-select.png" alt="Volume select" maxWidth="500px" />

**8.** Configure **Auto Scaling** settings. Specify the idle timeout duration after which executors will scale down. You can disable Auto Scaling by unchecking the checkbox.
<Img src="/img/user-guide/virtual-lakehouse/lakehouse-auto-suspend.png" alt="Auto Scaling" maxWidth="500px" />

:::info Auto Scaling
Executors will be scaled down after the specified time of inactivity. Executors will be scaled up automatically on demand (scale-up time around 10-15 seconds). It is recommended to keep Auto Scaling enabled to minimize monthly costs.
:::

<br />

**9.** **Resource tags** are custom key/value pairs designed to help categorize and organize IOMETE resources. They provide a flexible and convenient way to manage resources by associating them with meaningful metadata.
<Img src="/img/resource-tags.png" alt="Resource tags" maxWidth="500px" />

<br />

**10.** Review the **Resources Summary** displaying total CPU, memory, and estimated costs before creating the cluster.

<br />

🎉 The newly created compute cluster is ready! You'll be redirected to the cluster details view.

## **Compute Cluster Details**

The Compute Cluster Detail View provides a comprehensive overview and management options for a specific cluster instance.

<Img src="/img/user-guide/virtual-lakehouse/lakehouse-info.png" alt="Compute Cluster info" />

### Overview

The detail view displays key information about your compute cluster:

- **ID**: Unique identifier (copyable)
- **Name**: Cluster name
- **Description**: Purpose or usage notes
- **Deployment Type**: Single-node or Multi-node
- **Driver State**: Current status of the driver node
- **Executor State**: Current status and count of executors
- **Docker Image**: Container image used
- **Namespace**: Deployment namespace
- **Created By**: User and timestamp
- **Tags**: Resource tags for organization

### Navigation Buttons

The header of the Detail View includes the following controls:

1. **Spark UI**: Redirects to the Spark UI for real-time metrics and logs
2. **Metrics UI**: Access to cluster metrics and monitoring dashboards
3. **Configure**: Opens configuration settings (only available when cluster is STOPPED or FAILED)
4. **Start**: Starts the cluster if it is not already running
5. **Restart**: Restarts the cluster to apply new configurations or resolve issues
6. **Terminate**: Stops the cluster and terminates all associated processes and jobs
7. **Delete**: Permanently deletes the cluster instance

<Img src="/img/user-guide/virtual-lakehouse/lakehouse-navigation-buttons.png" alt="Navigation buttons" />

:::info Restart Required Indicator
If configuration changes require a restart, a "Restart required" indicator will appear in the cluster list and detail views.
:::

### Detail View Tabs

#### Details Tab

Displays comprehensive cluster information including:

##### Auto Scaling

By default, scaling up usually takes 1 to 2 minutes, depending on various factors like the cloud provider's response time and resource availability.

:::tip Faster Scaling-Up
In cloud environments, you can utilize IOMETE to establish a **hot pool** of preconfigured resources. This markedly accelerates the scaling process, reducing the scale-up time to a mere 10 to 15 seconds. Contact support to learn more about this feature.
:::

##### Driver State

- **Starting**: The Driver is booting up
- **Active**: The Driver is running and ready to accept connections
- **Stopped**: The Driver is offline and not accepting any connections
- **Failed**: The Driver couldn't start. Contact support for assistance

:::tip Cost Implications
You're only charged for the Driver when it's in the `Active` state.
:::

##### Executor State

- **No running executors**: There is no active executor. This happens when Auto Scaling is configured. When there is no workload for the configured idle timeout, the cluster scales down to zero. Executors will scale up automatically based on demand
- **Running**: Executors are active and processing data
- **Scaling**: Executors are scheduled to start and waiting for resources

##### Status Examples

- **`Running 1/4`**: One out of four Executors is active. The cluster scales down to save costs when the workload is light
- **`Running 1/4` `Scaling 3/4`**: One Executor is active, and three are waiting to start due to an increase in workload
- **`Running 4/4`**: All Executors are active, and the cluster is at full capacity

<Img src="/img/user-guide/virtual-lakehouse/lakehouse-general-info.png" alt="General information" />

:::tip Cost Implications
You're only billed for Executors when they're in the `Running` state.
:::

#### Connections Tab

This section provides connection details for various integration methods. **IOMETE** supports the following types of connections:

- Python Connection (SQLAlchemy)
- JDBC Connection
- Spark Connect (cluster-to-cluster connections)
- Arrow Flight SQL (advanced high-performance connection protocol)
- [DBT Connection](/docs/integrations/dbt/getting-started-with-iomete-dbt.md)
- [Tableau Connection](/docs/integrations/bi/tableau.md)
- [Power BI Connection](/docs/integrations/bi/power-bi.md)
- [Superset Connection](/docs/integrations/bi/apache-superset.md)
- [Metabase Connection](/docs/integrations/bi/metabase.md)
- [Redash Connection](/docs/integrations/bi/redash.md)

<Img src="/img/user-guide/virtual-lakehouse/lakehouse-connections.png" alt="connections" />

#### Configuration Tab

Displays the complete Spark configuration for the cluster, including:
- Spark properties and settings
- Custom configurations
- Resource allocations

This tab is read-only and shows the active configuration of your cluster.

#### Spark Logs Tab

View and download Spark logs from your cluster:
- Driver logs
- Executor-specific logs (when enabled)
- Time range filtering
- Download functionality for offline analysis

<Img src="/img/user-guide/virtual-lakehouse/lakehouse-logs.png" alt="Spark logs" />

#### Kubernetes Events Tab

Monitor infrastructure-level events from the Kubernetes cluster:
- Warning and error event counts
- Filterable event list
- Event timestamps and details

:::info
Kubernetes events are only stored for a duration of one hour by default. After this period, events are automatically deleted from the system.
:::

<Img src="/img/user-guide/virtual-lakehouse/lakehouse-kubernetes-events.png" alt="Kubernetes events" />

#### Resource Activity Tab

Track operational history of your cluster:
- Start/Terminate action logs
- Timestamp for each action
- User who performed the action
- Color-coded status indicators (start=green, terminate=red)

<Img src="/img/user-guide/virtual-lakehouse/lakehouse-activity.png" alt="Resource activity" maxWidth="600px" />

## **Compute Clusters List View**

The Compute Clusters list provides an overview of all your clusters with the following columns:

- **Name**: Cluster name (linked to detail view) with ID and restart indicator if applicable
- **Driver**: Driver status badge and node type details
- **Executor**: Executor state and node type (or "Single Node" for single-node deployments)
- **Namespace**: Deployment namespace
- **Auto Scaling**: Configuration summary (or "Single Node" for single-node deployments)
- **Actions**: Context menu with available operations based on cluster status

### Filtering and Search

Use the list view controls to:
- **Filter by Namespace**: View clusters in specific namespaces
- **Filter by Status**: STARTING, ACTIVE, STOPPED, FAILED
- **Search**: Find clusters by ID or name
- **Pagination**: Navigate through large cluster lists (50 items per page default)

### Creating Clusters

Click the **New Compute Cluster** button to create a new cluster. This button is available based on your permissions.

## **Configure/Edit a Compute Cluster**

You can modify cluster settings by clicking the **Configure** button in the cluster detail view.

### Availability

- Configuration is only available when the cluster is **STOPPED** or **FAILED**
- If the cluster is running, you must terminate it first before making configuration changes
- Some changes may require a restart to take effect

### Editable Fields

When configuring an existing cluster, you can modify:

- **Description**: Update cluster purpose or usage notes
- **Deployment Configuration**: Change driver/executor node types
- **Max Executors**: Adjust executor count
- **Auto Scaling**: Modify idle timeout settings
- **Volume**: Change or assign storage volumes
- **Resource Tags**: Update organization tags

### Locked Fields

The following fields cannot be modified after cluster creation:

- **Name**: Cluster name is immutable
- **Deployment Type**: Cannot switch between single-node and multi-node

### Applying Changes

After making configuration changes:
1. Save the configuration
2. Start the cluster to apply the new settings
3. Monitor the cluster status to ensure successful startup
