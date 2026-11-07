---
title: Scalability
description: Understand how IOMETE scales across Kubernetes infrastructure, platform services, compute clusters, and storage to handle growing data workloads efficiently.
sidebar_label: Scalability
last_update:
  date: 11/07/2026
  author: Abhishek Pathania
---

IOMETE is built on [Kubernetes](https://kubernetes.io/), [Apache Spark](https://spark.apache.org/), and [Apache Iceberg](https://iceberg.apache.org/): three technologies designed to scale horizontally. Instead of a single monolithic engine, IOMETE scales at four independent layers: infrastructure, platform services, compute clusters, and storage. You can grow each layer on its own schedule, matching spending to actual demand.

For a deeper look at how these components fit together, see the [Architecture overview](./architecture.md).

## Kubernetes Cluster Scaling

Everything in IOMETE runs on Kubernetes, so the simplest way to add capacity is to add worker nodes. How you do that depends on your environment:

- **Manual scaling**: Add worker nodes directly. Kubernetes can then schedule pending workloads on nodes that match their resource requests, selectors, and tolerations.
- **Cloud autoscalers**: Tools like [AWS Karpenter](https://karpenter.sh/), [GKE Node Auto-Provisioning](https://cloud.google.com/kubernetes-engine/docs/concepts/node-auto-provisioning), and [AKS Cluster Autoscaler](https://learn.microsoft.com/en-us/azure/aks/cluster-autoscaler-overview) add and remove nodes automatically based on pending pod resource requests. When Spark executors need more resources than the cluster currently has, the autoscaler provisions new nodes. When demand drops, it removes idle ones.
- **On-premises**: Scale the node pool manually or through infrastructure automation tools.

Once new nodes join, Kubernetes schedules any pending Spark executors and platform service replicas onto them automatically.

## Platform Service Autoscaling

As your user base or query volume grows, the platform services that handle API requests, identity, and metadata can become bottlenecks. Horizontal Pod Autoscaling (HPA) lets individual services scale their replica count based on CPU or memory utilization. HPA is disabled by default for most services, but you can enable it per-service in your `values.yaml`.

Scale the service that is limiting throughput. For example, adding gateway replicas helps request handling; it does not add Spark executors or PostgreSQL capacity. In the 4.0.1 enterprise chart, the Gateway, Core, Cluster, Identity, Catalog, REST Catalog, and Maintenance services, the Prefect server, and the Spark submit service accept autoscaling settings, while `iom-sql` runs as one replica. When Event Streams are enabled, the Event Stream proxy autoscales by default, from 1 to 4 replicas at 80% CPU. Check the `services` section of the values file for your chart version before enabling HPA.

When you enable HPA for a service, set its CPU and memory requests equal to its limits: HPA measures utilization against requests, and the chart refuses to install when they differ.

An HPA needs Kubernetes resource metrics and enough schedulable capacity. Rolling updates also need spare capacity for replacement pods. A rolling-update strategy by itself is not a guarantee of uninterrupted service; database availability, readiness checks, and the health of dependent services still matter.

For service roles and placement, see [Deployment Architecture](../deployment/architecture-deployment.md).

## Compute Cluster Scaling

[Compute clusters](/resources/user-guide/compute-clusters/overview) are where your queries and jobs actually run, so their sizing has the most direct impact on performance. Each cluster runs Apache Spark with a driver pod and zero or more executor pods, and clusters scale independently of one another. A data engineering team can run large executor pools while a BI dashboard cluster stays small.

**Executor auto-scaling** adjusts the number of Spark executors between the compute's configured minimum and maximum. Idle executors can scale down to zero when the minimum is zero; a nonzero minimum keeps that many executors available. The driver remains running until the compute is suspended or stopped. Executors still need available node capacity and namespace quota to start.

For lightweight workloads, you can run a cluster in **single-node mode** (driver only, no separate executors) to minimize resource usage. Administrators also define **[node types](/resources/user-guide/node-types/overview)** with specific CPU and memory profiles that users choose when creating clusters. This prevents over-provisioning by matching the resource footprint to the workload.

:::tip
Choose a zero minimum when you can accept executor startup time after an idle period. Keep a nonzero minimum when response latency matters more than avoiding idle executor capacity.
:::

## Workload Isolation

When multiple teams share a single IOMETE installation, you need guardrails so one team's heavy batch job doesn't starve another team's dashboard queries. Use namespaces for resource budgets, node placement for hardware separation, and data planes when you need a separate runtime or cluster.

### Node Placement

Kubernetes node selectors and tolerations separate platform services from Spark workloads across two sets of nodes:

- **Service placement** (`controlPlaneNodeSelector` / `controlPlaneTolerations`): Places the services that a release installs. Set it on each release, including the runtime release of each additional data plane.
- **Workload placement** (`dataPlaneNodeSelector` / `dataPlaneTolerations`): Places Spark drivers and executors, Jupyter containers, and event stream pods. Set it on the control-plane release only: IOMETE applies these values to workloads on every data plane, and the runtime chart has no such settings.

Because one workload placement applies to every data plane, use node labels and taints that exist in each cluster that hosts a data plane. A selector that matches no node in a cluster leaves that plane's workloads Pending.

These setting names refer to IOMETE service and workload placement. They do not require running IOMETE on the Kubernetes API server's control-plane nodes.

This separation keeps compute-heavy Spark workloads from starving platform services of CPU or memory. See [Node Placement](../deployment/architecture-deployment.md#node-placement) for details, including when a change takes effect.

### Multi-Namespace

One data plane can manage several workload namespaces. For example, `analytics` can manage `finance` and `marketing`, each with its own Kubernetes ResourceQuota. Assign those namespaces to IOMETE domains, then select the intended namespace when creating a compute or job.

Each release also runs a Prefect worker and, by default, a Spark proxy server in each of its workload namespaces. Account for their resource requests when setting quotas. A namespace provides a scope for quotas and access rules; node placement and network policies determine additional isolation. Adding a namespace does not add worker nodes.

See [Adding a Namespace](../deployment/connect-namespace.md) for configuration and verification.

### Priority Classes

When cluster resources are tight, Kubernetes PriorityClasses determine which workloads get scheduled first. Create the PriorityClasses, then turn them on with `features.priorityClasses.enabled` on the control-plane release:

| Priority Class | Applies To |
|---|---|
| `iomete-compute` | Compute clusters |
| `iomete-spark-job` | [Spark jobs](/resources/user-guide/spark-jobs/creating-spark-job) |
| `iomete-notebook` | [Jupyter containers](/resources/user-guide/notebook/jupyter-containers) |
| `iomete-operational-support` | Job Orchestrator (Prefect) workers and Spark proxy servers |

Priority classes influence scheduling order and can allow higher-priority pods to preempt lower-priority pods. They do not create capacity or override every scheduling constraint. Set priorities deliberately and keep namespace quotas and available node capacity in mind.

## Multi-Cluster Deployments

A single IOMETE control plane can manage data planes in the same Kubernetes cluster or across several clusters. Choose the boundary that matches the need:

| Need | What to Scale or Add |
| --- | --- |
| A query needs more parallel processing | Executors, within the compute's configured maximum |
| Pods cannot fit on existing nodes | Kubernetes worker capacity, or adjust requests and placement |
| Teams need separate resource budgets | Workload namespaces and quotas within a data plane |
| Workloads need their own data-plane services, region, or cluster | An additional data plane registered with the same control plane |
| Environments need independent administration and state | Separate IOMETE installations |

For example, `default` and `analytics` can share a Kubernetes cluster while `analytics` manages two namespaces. This creates separate data planes, not additional physical capacity: their workloads still compete for the cluster's nodes unless you configure placement and quotas. A data plane in a separate cluster has its own Kubernetes capacity, but still depends on connectivity to the shared control plane and the storage it uses.

An additional data plane does not automatically replicate table data or fail workloads over between clusters. Plan storage access, network latency, backup, and recovery separately. See [Multi-Cluster Setup](../deployment/multi-cluster-setup.mdx) for topology choices.

## Storage Scalability

Because IOMETE decouples storage from compute, your data layer scales independently of your processing power. Data lives in object storage (Amazon S3, Google Cloud Storage, Azure Data Lake Storage, Apache Ozone, Dell ECS, or MinIO), and compute clusters access it on demand.

Managed cloud object storage and self-hosted object storage have different capacity and operating requirements. Plan for stored data, request throughput, network bandwidth, and retention; a self-hosted store also needs enough disks and nodes. Multiple computes can access the same tables when their catalog configuration, credentials, and network access allow it.

Iceberg supports techniques such as partition pruning and metadata-based file selection. Query performance still depends on table layout, file sizes, metadata maintenance, and the workload; increasing compute alone does not resolve every storage bottleneck.

## Cost Optimization

Adding resources is one thing. Spending wisely on those resources takes more thought. Here are the main cost levers in IOMETE:

- **Spot and preemptible instances**: Interruptible capacity can reduce executor costs where your infrastructure supports it. Spark can retry tasks after an executor is lost, but interruptions can delay queries or fail a workload if retry limits are exceeded.
- **Reserved instances and savings plans**: For always-on resources like compute cluster drivers and platform services, reserved pricing reduces costs compared to on-demand rates.
- **Right-sizing with node types**: Define node types that match specific workload profiles. A BI dashboard cluster doesn't need the same resources as a batch ETL job.
- **Executor auto-scaling**: Dynamic allocation reduces idle executor usage down to the configured minimum. Driver and supporting-service costs remain while the compute runs.

:::info
For the biggest savings on variable workloads, combine spot instances for Spark executors with executor auto-scaling. Executors scale to match demand and run on discounted infrastructure.
:::
