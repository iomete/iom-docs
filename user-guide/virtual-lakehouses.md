---
title: Compute Clusters
description: Create and manage Apache Spark compute clusters that provide isolated CPU and memory resources for query processing while sharing data stored in object storage.
sidebar_label: Compute Clusters
last_update:
  date: 02/26/2026
  author: Abhishek Pathania
---

import Img from '@site/src/components/Img';

A compute cluster provides dedicated CPU and memory resources, powered by Apache Spark, for executing queries. Table data is stored separately in S3 compatible object storage. This separation allows multiple clusters to access the same data while keeping compute environments fully isolated. IOMETE uses the Apache Iceberg table format to support reliable ACID transactions.

Because storage and compute are decoupled, you can right-size each cluster for its specific workload, whether batch ETL, interactive analytics, or a dedicated BI connection. When a cluster is no longer needed, you can shut it down to stop compute costs.


<Img src="/img/user-guide/compute-clusters/overview.png" alt="Compute Clusters" />

## Viewing the Cluster List

The **Cluster List** page shows all compute clusters you have permission to access, along with their current state.
Open it by selecting **Compute** in the left sidebar.

Each row represents one cluster and includes the following columns:

| Column           | Description                                                                                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**         | Opens the cluster detail page. The cluster ID appears below the name (hover to copy). |
| **Driver**       | Displays the driver status (`STARTING`, `ACTIVE`, `STOPPED`, `FAILED`) and its node type. Sortable by status.                                                                                           |
| **Executor**     | Shows executor state, such as `Running 2/4`, along with the executor node type. Displays **Single node** for single-node clusters.                                                                      |
| **Namespace**    | The Kubernetes namespace where the cluster runs. Sortable.                                                                                                                                              |
| **Auto scaling** | Displays the idle timeout for auto-suspend. Shows **Single node** for single-node clusters.                                                                                                             |
| **Image**        | Configured Docker image name. Hidden by default. Use the column selector to display it.                                                                                                                 |
| **Actions**      | Ellipsis menu with actions based on the cluster's current state. See **Managing a Compute Cluster**.                                                                                                    |

### Filtering the List

Use the controls above the table to filter results:

* **Namespace**. Filter clusters by deployment namespace.
* **Status**. Filter by driver state (`Starting`, `Active`, `Stopped`, `Failed`).
* **Search**. Match clusters by name or cluster ID.

<Img src="/img/user-guide/compute-clusters/list-filters.png" alt="Compute cluster list with filters" />

## Creating a Cluster

Create a separate cluster for each workload so resources remain isolated and predictable. The setup typically takes about a minute.

1. Go to the **Compute** page.
2. Click **New Compute Cluster** in the top-right corner.
3. Complete the configuration across the six tabs: **General**, **Configurations**, **Dependencies**, **Docker settings**, **Tags**, and **Review & Create**.
4. Open **Review & Create**, verify the summary, then click **Create**.

You can move between tabs using **Previous** and **Next**, or by selecting a tab directly. The **Next** button validates the current tab before proceeding. If validation fails, the tab shows a red exclamation mark and you must fix the errors before continuing.

### General Tab

The **General** tab defines the core configuration of the cluster.

- **Name** (required): A unique name using lowercase letters, numbers, and hyphens. It must start and end with a letter or number. This value cannot be changed after creation.

  :::info Naming Constraints
  Maximum 53 characters. Pattern: `^[a-z0-9]([-a-z0-9]*[a-z0-9])?$`.
  :::

- **Description** (optional): A short explanation of the cluster's purpose.

- **Bundle** (required if resource-level access control is enabled): Associates the cluster with a resource bundle that defines access permissions. Hidden when resource-level access control is disabled. Like the name, this cannot be changed later.

- **Namespace** (required): The Kubernetes namespace where the cluster will be deployed. Only namespaces available to your account are shown.

- **Deployment type**: Choose between:
  - **Multi-node** (default): Uses separate driver and executor pods.
  - **Single-node**: Runs only the Spark driver. Executor-related fields and **Auto scaling** are hidden.

- **Driver node** (required): The [node type](./node-types/overview.md) assigned to the Spark driver. The driver coordinates executors and handles incoming connections.

- **Executor node** (required for multi-node): The [node type](./node-types/overview.md) used for executor pods.

- **Executor count** (required for multi-node): Maximum number of executor pods. Default is `1`. The minimum cannot exceed the maximum.

- **Use spot instances** (optional): Enables spot or preemptible instances for executor pods to reduce cost. Disabled by default.

- **Volume** (optional): Attach a persistent volume. See [Volumes](./volumes.md) for configuration details.

- **Auto scaling** (multi-node only): Enabled by default. Executors scale down to zero after the configured idle period and scale back up when a query runs. Idle timeout options range from 1 minute to 3 hours. Default is 30 minutes. Select **Disabled** to keep executors running continuously.

  :::tip Keep Auto Scaling Enabled
  Only executors in the `Running` state are billed. Scale-up takes 10 to 15 seconds with a hot pool, or 1 to 2 minutes otherwise.
  :::

<Img src="/img/user-guide/compute-clusters/create-general.png" alt="Create compute cluster -- General tab" maxWidth="700px" />

### Configurations Tab

The **Configurations** tab lets you tune Spark behavior, inject secrets, and set JVM options without rebuilding a Docker image.

- **Environment variables**: Key-value pairs injected at runtime. Supports plain text and secret-backed values.
- **Spark config**: Standard Spark properties (for example, `spark.executor.memoryOverhead = 512m`). Also supports secret-backed values.
- **Arguments**: Command-line arguments passed to the Spark application.
- **Java options**: JVM flags for driver and executor processes (for example, `-XX:+UseG1GC`).

<Img src="/img/user-guide/compute-clusters/create-configs.png" alt="Create compute cluster -- Configurations tab" maxWidth="700px" />

### Dependencies Tab

The **Dependencies** tab loads external JARs, Python packages, and Maven artifacts at Spark startup.

- **Jar file locations**: URLs or paths to JAR files on the classpath (for example, `https://repo.example.com/my-udf.jar`).
- **Files**: URLs or paths to additional files available at runtime.
- **PY file locations**: Paths to Python files (`.py`, `.egg`, or `.zip`) for PySpark (for example, `local:///app/package.egg`).
- **Maven packages**: Maven coordinates resolved at startup (for example, `org.apache.spark:spark-avro_2.13:3.5.0`).

<Img src="/img/user-guide/compute-clusters/create-dependencies.png" alt="Create compute cluster -- Dependencies tab" maxWidth="700px" />

### Docker Settings Tab

This tab lets you override the default Spark runtime image. The **Docker image** field (optional) lists images from your registered Docker registries. See [Private Docker Registry](./private-docker-registry.md) for setup details.

<Img src="/img/user-guide/compute-clusters/create-docker.png" alt="Create compute cluster -- Docker Settings tab" maxWidth="700px" />

### Tags Tab

Add **Resource tags** (key-value metadata pairs) to categorize the cluster. Tags appear in the cluster detail view and help with cost allocation or operational filtering.

<Img src="/img/user-guide/compute-clusters/create-tags.png" alt="Create compute cluster -- Tags tab" maxWidth="700px" />

### Review & Create Tab

The **Review & Create** tab displays a read-only summary of your configuration. Review each section carefully. To make changes, select any tab to return and update the settings. When everything looks correct, click **Create**.

If creation succeeds, IOMETE provisions and starts the cluster, then redirects you to its detail page. If the cluster name is already in use, you’re returned to the **General** tab with a validation error prompting you to choose a different name. If resource quotas are exceeded, the form highlights the affected fields with error messages.


<Img src="/img/user-guide/compute-clusters/create-review.png" alt="Create compute cluster -- Review & Create tab" maxWidth="700px" />

## Viewing a Compute Cluster

The cluster detail page is where you monitor status, manage lifecycle actions, and connect external tools. To open it, click a cluster name in the list.

The page title displays **Compute: \{name\}**, and the breadcrumb shows **Compute > \{name\}**.

The header includes state-aware action buttons (see [Managing a Compute Cluster](#managing-a-compute-cluster)) and two monitoring links:

- **Spark Metrics UI**. Opens the Spark metrics dashboard. Always available.  
- **Spark UI**. Opens the live Spark web interface. Enabled only when the driver state is `ACTIVE`.

If another user deletes the cluster while you are viewing the page, a yellow banner appears stating: **This compute has been deleted.**

### Details Tab

The **Details** tab shows the current state and configuration of the cluster.

#### Compute Section

- Displays identity fields: **ID** and **Name**.  
- Shows the **Driver state** badge.  
- When the state is `FAILED`, a tooltip explains the failure reason.  
- Lists resource settings, including driver and executor node types, executor counts, **Volume**, and **Auto scaling** timeout.  
- For single-node clusters, executor-related fields are hidden.

#### Metadata Section

- **Namespace**  
- **Created by** user and timestamp  
- **Tags**  
- **Description**

<Img src="/img/user-guide/compute-clusters/detail-overview.png" alt="Compute cluster detail -- Details tab" />

### Connections Tab

The **Connections** tab has ready-to-use snippets for connecting BI tools and applications. Click a connection type card to reveal its configuration.

Available types: **Python**, **JDBC**, **DBT**, **Tableau**, **Power BI**, **Superset**, **Metabase**, **Redash**, and **Spark Connect**. If the Arrow Flight module is enabled, **Arrow Flight** also appears.

The SQLAlchemy connection URL follows this format:

```
iomete://{userId}:{accessToken}@{host}{port}/{db}?lakehouse={lakehouseName}
```

The HTTP path depends on whether a namespace is configured:

- With namespace: `data-plane/{namespace}/lakehouse/{name}`
- Without namespace: `lakehouse/{name}`

<Img src="/img/user-guide/compute-clusters/detail-connections.png" alt="Compute cluster detail -- Connections tab" />

### Logs Tab

The **Logs** tab streams Spark driver logs in real time. Use the time range selector to narrow the window, and click **Download** to save them as `spark-driver-logs.txt`.

When per-executor logging is enabled, an **Instance** dropdown appears above the log viewer so you can inspect individual pod logs.

<Img src="/img/user-guide/compute-clusters/detail-logs.png" alt="Compute cluster detail -- Logs tab" />

### Kubernetes Events Tab

The **Kubernetes events** tab lists events for the cluster's pods and highlights warnings. The tab badge shows warning and total counts (for example, `2 / 15`) so you can spot problems at a glance. Kubernetes retains events for one hour by default.

<Img src="/img/user-guide/compute-clusters/detail-k8s-events.png" alt="Compute cluster detail -- Kubernetes events tab" />

### Activity Tab

The **Activity** tab logs every start and terminate event for the cluster. Each row shows the **Action**, **Time**, and **User** who triggered it. Results paginate at 20 rows per page.

<Img src="/img/user-guide/compute-clusters/detail-activity.png" alt="Compute cluster detail -- Activity tab" />

### Configuration Tab

The **Configuration** tab lists every active Spark key-value pair (both your custom values and IOMETE system defaults) in read-only form.

<Img src="/img/user-guide/compute-clusters/detail-configuration.png" alt="Compute cluster detail -- Configuration tab" />

## Cluster States

Understanding cluster states helps you predict billing, diagnose failures, and pick the right action.

### Driver States

The driver moves through four states during its lifecycle. The page refreshes automatically when the state changes.

| State | Meaning | Available actions | Billing |
|-------|---------|-------------------|---------|
| `STARTING` | Driver pod is booting. Takes 1 to 2 minutes, or 10 to 15 seconds with a hot pool. | Terminate, Restart | Not billed |
| `ACTIVE` | Driver is running and accepting connections. The **Spark UI** link becomes active. | Terminate, Restart | Billed |
| `STOPPED` | Driver is offline. No connections accepted. | Start, Configure | Not billed |
| `FAILED` | Driver crashed or didn't start. Check the **Details** tab for the error. | Terminate, Restart, Configure | Not billed |

A newly created cluster enters `STARTING` automatically. It moves to `ACTIVE` once the driver is ready, or to `FAILED` if a deployment error occurs.

### Executor States (Multi-Node Only)

Both the **Details** tab and the **Executor** column in the cluster list show executor state. IOMETE hides this for single-node clusters.

| State display | Meaning |
|---------------|---------|
| No running executors | All executors scaled to zero (auto-suspend kicked in). They scale up when a query arrives. |
| `Running N/M` | N executors are active out of M configured. |
| `Scaling N/M` | N executors are pending, waiting for Kubernetes resources. |
| `Running N/M + Scaling P/M` | A mix of active and pending executors. Load is increasing. |

IOMETE only bills for executors in the `Running` state. Executors scaled to zero don't incur compute charges.

## Managing a Compute Cluster

Once a cluster exists, you control its lifecycle from two places: the detail page header and the ellipsis menu on each list row.

<Img src="/img/user-guide/compute-clusters/cluster-actions.png" alt="Cluster detail page header showing Restart, Terminate, and Configure action buttons" maxWidth="600px" />

### Configuring a Cluster

To reconfigure a cluster, the driver must be `STOPPED` or `FAILED`. While the cluster is running, the **Configure** button shows a tooltip asking you to terminate first.

<Img src="/img/user-guide/compute-clusters/configure-tooltip.png" alt="Configure button disabled with tooltip: Terminate the compute before configuring" maxWidth="400px" />

**Configure** opens the same six-tab form used during creation, pre-populated with current values. **Name** and **Bundle** are read-only in edit mode. After you make changes, review them on the **Review & Save** tab and click **Save**.

After saving, the cluster may show an amber **Restart required** label in the list. Starting or restarting the cluster applies the new settings and clears the label.

### Starting a Cluster

Click **Start** in the header or the list row ellipsis menu. There's no confirmation dialog. The driver moves from `STOPPED` to `STARTING`, then to `ACTIVE`. **Start** is only enabled when the driver is `STOPPED` with no other operation pending.

### Restarting a Cluster

Click **Restart** in the header or the list row ellipsis menu, then confirm with **Yes, restart it**. The driver cycles through `STOPPED`, `STARTING`, and `ACTIVE`. This action is available when the driver is `ACTIVE`, `STARTING`, or `FAILED`.

<Img src="/img/user-guide/compute-clusters/restart-confirm.png" alt="Restart confirmation popover with Cancel and Yes, restart it buttons" maxWidth="600px" />

:::warning Restart Is Not Atomic
If the start phase fails after a successful terminate, the cluster stays `STOPPED`. Check the **Logs** and **Kubernetes events** tabs to diagnose the failure.
:::

### Terminating a Cluster

Click **Terminate** in the header or the list row ellipsis menu, then confirm with **Yes, terminate it**. The driver transitions to `STOPPED`, all active connections drop, and executor state clears. Available when the driver is `ACTIVE`, `STARTING`, or `FAILED`.

Unlike restart, termination leaves the cluster stopped. Start it again manually when ready.

<Img src="/img/user-guide/compute-clusters/terminate-confirm.png" alt="Terminate confirmation popover with Cancel and Yes, terminate it buttons" maxWidth="600px" />

### Deleting a Cluster

Deletion permanently removes the cluster and its configuration. Data in cloud object storage is not affected.

1. Select **Delete** from the detail page or list row ellipsis menu.
2. In the confirmation modal, type the exact cluster name.
3. Click **Delete**. The button stays disabled until the typed name matches.

:::warning Deletion Is Permanent
You cannot undo this action. IOMETE permanently removes the cluster configuration and drops any active connections.
:::

<Img src="/img/user-guide/compute-clusters/delete-modal.png" alt="Delete cluster confirmation modal" maxWidth="500px" />

## Access Permissions

Permissions are granted to users or groups and enforced at two levels:

- **Domain level**  
  The **Create Compute** permission allows a user to create new clusters. Administrators assign this either directly through member permissions or indirectly through a domain bundle. See [Domain Authorization](/user-guide/iam/ras/domain-authorization) for configuration details.

- **Resource level**  
  Per-cluster permissions (`VIEW`, `EXECUTE`, `CONSUME`, `UPDATE`, `DELETE`) are inherited from the cluster’s assigned resource bundle. The `CONSUME` permission allows a user to submit queries against the cluster. The cluster list displays only clusters where you have at least `VIEW` permission. See [Resource Bundles](/user-guide/ras/resource-bundles) to manage bundle-based access control.

## Related Resources

Explore these guides for features referenced on this page.

- [Node Types](./node-types/overview.md): Create and manage node types for driver and executor pods.
- [Volumes](./volumes.md): Attach persistent volumes via the **Volume** field on the **General** tab.
- [Secrets](./secrets.md): Reference secret values in environment variables and Spark configuration.
- [Private Docker Registry](./private-docker-registry.md): Register Docker registries so their images appear in the **Docker settings** tab.
- [Domain Authorization](/user-guide/iam/ras/domain-authorization): Manage domain-level permissions for users and groups.
- [Resource Bundles](/user-guide/ras/resource-bundles): Control per-resource access through bundle permissions.
