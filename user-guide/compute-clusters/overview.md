---
title: Compute Clusters
description: Dedicated Apache Spark compute clusters that provide isolated CPU and memory resources for query processing while sharing data stored in object storage.
sidebar_label: Overview
last_update:
  date: 02/26/2026
  author: Abhishek Pathania
---

import Img from '@site/src/components/Img';

A compute cluster gives you dedicated CPU and memory, powered by Apache Spark, for running queries. Table data lives in S3-compatible object storage, separate from compute, so multiple clusters can share the same data without interfering with each other. IOMETE uses the Apache Iceberg table format for reliable ACID transactions.

Since storage and compute are decoupled, you can size each cluster for its workload (batch ETL, interactive analytics, a dedicated BI connection) and shut it down when it's idle to stop accruing costs.


<Img src="/img/user-guide/compute-clusters/overview.png" alt="Compute Clusters" />

## Viewing the Cluster List

Before you create or modify anything, the cluster list gives you an at-a-glance view of every compute resource and its current state. Open it by selecting **Compute** in the left sidebar.

Each row represents one cluster:

| Column           | Description                                                                                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**         | Opens the cluster detail page. The cluster ID appears below the name (hover to copy). |
| **Driver**       | Driver status (`STARTING`, `ACTIVE`, `STOPPED`, `FAILED`) and node type. Sortable by status. |
| **Executor**     | Executor state (for example, `Running 2/4`) and node type. Shows **Single node** for single-node clusters. |
| **Namespace**    | Kubernetes namespace where the cluster runs. Sortable. |
| **Auto scaling** | Idle timeout for auto-suspend. Shows **Single node** for single-node clusters. |
| **Image**        | Docker image name. Hidden by default; use the column selector to reveal it. |
| **Actions**      | Ellipsis menu with state-dependent actions. See [Managing a Compute Cluster](./managing-clusters.md). |

### Filtering the List

Controls above the table narrow the list:

* **Namespace**: deployment namespace.
* **Status**: driver state (`Starting`, `Active`, `Stopped`, `Failed`).
* **Search**: cluster name or ID.

<Img src="/img/user-guide/compute-clusters/list-filters.png" alt="Compute cluster list with filters" />

## Access Permissions

Who can see and interact with a cluster depends on permissions granted to users or groups at two levels:

- **Domain level**
  The **Create Compute** permission lets a user create new clusters. Admins assign it directly through member permissions or indirectly through a domain bundle. See [Domain Authorization](/user-guide/iam/ras/domain-authorization) for details.

- **Resource level**
  Per-cluster permissions (`VIEW`, `EXECUTE`, `CONSUME`, `UPDATE`, `DELETE`) come from the cluster's resource bundle. `CONSUME` lets a user submit queries against the cluster. The cluster list only shows clusters where you have at least `VIEW` permission. See [Resource Bundles](/user-guide/ras/resource-bundles) for bundle-based access control.

## Next Steps

- [Creating a Cluster](./creating-clusters.md): walk through the six-tab creation form.
- [Managing Clusters](./managing-clusters.md): view cluster details, monitor state, and run lifecycle actions.

## Related Resources

- [Node Types](../node-types/overview.md): manage the node types available for driver and executor pods.
- [Volumes](../volumes.md): attach persistent volumes via the **Volume** field on the **General** tab.
- [Secrets](../secrets.md): reference secret values in environment variables and Spark config.
- [Private Docker Registry](../private-docker-registry.md): register Docker registries so their images appear in the **Docker settings** tab.
- [Domain Authorization](/user-guide/iam/ras/domain-authorization): manage domain-level permissions for users and groups.
- [Resource Bundles](/user-guide/ras/resource-bundles): control per-resource access through bundle permissions.
