---
title: Scalability
description: Understand how IOMETE scales across Kubernetes infrastructure, platform services, compute clusters, and storage to handle growing data workloads efficiently.
sidebar_label: Scalability
last_update:
  date: 03/31/2026
  author: Abhishek Pathania
---

IOMETE is built on [Kubernetes](https://kubernetes.io/), [Apache Spark](https://spark.apache.org/), and [Apache Iceberg](https://iceberg.apache.org/): three technologies designed to scale horizontally. Instead of a single monolithic engine, IOMETE scales at four independent layers: infrastructure, platform services, compute clusters, and storage. You can grow each layer on its own schedule, matching spending to actual demand.

For a deeper look at how these components fit together, see the [Architecture overview](./architecture).

## Kubernetes Cluster Scaling

Everything in IOMETE runs on Kubernetes, so the simplest way to add capacity is to add worker nodes. How you do that depends on your environment:

- **Manual scaling**: Add worker nodes directly. IOMETE detects the new capacity and distributes pending workloads across the additional nodes.
- **Cloud autoscalers**: Tools like [AWS Karpenter](https://karpenter.sh/), [GKE Node Auto-Provisioning](https://cloud.google.com/kubernetes-engine/docs/concepts/node-auto-provisioning), and [AKS Cluster Autoscaler](https://learn.microsoft.com/en-us/azure/aks/cluster-autoscaler-overview) add and remove nodes automatically based on pending pod resource requests. When Spark executors need more resources than the cluster currently has, the autoscaler provisions new nodes. When demand drops, it removes idle ones.
- **On-premises**: Scale the node pool manually or through infrastructure automation tools.

Once new nodes join, Kubernetes schedules any pending Spark executors and platform service replicas onto them automatically.

## Platform Service Autoscaling

As your user base or query volume grows, the platform services that handle API requests, identity, and metadata can become bottlenecks. Horizontal Pod Autoscaling (HPA) lets individual services scale their replica count based on CPU or memory utilization. HPA is disabled by default for most services, but you can enable it per-service in your `values.yaml`.

| Service | HPA Support | Default State | Scaling Behavior |
|---|---|---|---|
| `iom-gateway` | Yes | Disabled | CPU-based |
| `iom-core` | Yes | Disabled | CPU-based |
| `iom-cluster` | Yes | Disabled | CPU-based |
| `iom-identity` | Yes | Disabled | CPU-based |
| `iom-catalog` | Yes | Disabled | CPU-based |
| `iom-rest-catalog` | Yes | Disabled | CPU-based |
| `spark-submit-service` | Yes | Disabled | CPU-based |
| `iom-collab` | Yes | Disabled | Memory-based (85% primary), CPU (80% secondary) |
| `iom-event-stream-proxy` | Yes | Enabled | 1–4 replicas, CPU (80%) |
| `iom-sql` | No | Fixed | Always 1 replica |

All services use a `RollingUpdate` strategy with `maxUnavailable: 0` and `maxSurge: 1`, so scaling doesn't cause downtime.

For details on each service's role and resource requirements, see the [Deployment Architecture](../deployment/architecture-deployment) guide.

## Compute Cluster Scaling

[Compute clusters](/user-guide/compute-clusters/overview) are where your queries and jobs actually run, so their sizing has the most direct impact on performance. Each cluster runs Apache Spark with a driver pod and zero or more executor pods, and clusters scale independently of one another. A data engineering team can run large executor pools while a BI dashboard cluster stays small.

**Executor auto-scaling** is the most common lever. When enabled, Spark dynamic allocation starts with a single executor and adds more based on query demand, up to a configured maximum. Once queries finish, idle executors scale back down to zero.

For lightweight workloads, you can run a cluster in **single-node mode** (driver only, no separate executors) to minimize resource usage. Administrators also define **[node types](/user-guide/node-types/overview)** with specific CPU and memory profiles that users choose when creating clusters. This prevents over-provisioning by matching the resource footprint to the workload.

:::tip
Enable executor auto-scaling for interactive workloads like SQL queries or BI dashboards. Executors spin up only while queries are running and scale to zero during idle periods, so you aren't paying for unused compute.
:::

## Workload Isolation

When multiple teams share a single IOMETE installation, you need guardrails so one team's heavy batch job doesn't starve another team's dashboard queries. IOMETE provides three isolation mechanisms.

### Node Placement

Kubernetes node selectors and tolerations separate platform services from Spark workloads across two sets of nodes:

- **Control plane nodes** (`controlPlaneNodeSelector` / `controlPlaneTolerations`): Host platform services like Gateway, Core, Cluster, Identity, and Catalog.
- **Data plane nodes** (`dataPlaneNodeSelector` / `dataPlaneTolerations`): Host Spark drivers and executors.

This separation keeps compute-heavy Spark workloads from starving platform services of CPU or memory. Configure these selectors in `values.yaml` during deployment. See the [Deployment Architecture](../deployment/architecture-deployment) guide for details.

### Multi-Namespace

Each team can get its own Kubernetes namespace with separate CPU and memory quotas. Spark drivers and executors deploy into these team namespaces, giving you resource-level isolation. Each namespace also receives its own [Prefect Worker](/user-guide/spark-jobs/job-orchestrator), Spark Proxy Server, and [Event Stream](/user-guide/event-stream) pods.

The result: per-team resource budgets enforced at the Kubernetes level, all sharing the same IOMETE platform installation.

### Priority Classes

When cluster resources are tight, Kubernetes PriorityClasses determine which workloads get scheduled first:

| Priority Class | Applies To |
|---|---|
| `iomete-compute` | Compute clusters |
| `iomete-spark-job` | [Spark jobs](/user-guide/spark-jobs/creating-spark-job) |
| `iomete-notebook` | [Jupyter containers](/user-guide/notebook/jupyter-containers) |
| `iomete-operational-support` | Job Orchestrator workers |

These are most useful when multiple workload types compete for limited resources. With priority classes enabled, production compute clusters and scheduled Spark jobs won't be starved by lower-priority workloads.

## Multi-Cluster Deployments

Some organizations need IOMETE running across multiple data centers, cloud regions, or business units. Three deployment models support this:

1. **Single installation**: One Kubernetes cluster, one database. This is the default and works for most organizations.
2. **Multiple independent installations**: Separate IOMETE instances, each with its own database and workloads. There's no shared state between them. Use this when strict data isolation is required across business units.
3. **Shared global database**: Multiple IOMETE instances share common resources (users, catalogs, domains) through a single database while keeping compute independent. This gives you a unified experience across regions with local data processing.

For setup instructions and architecture diagrams, see the [Multi-Cluster Setup](../deployment/multi-cluster-setup) guide.

## Storage Scalability

Because IOMETE decouples storage from compute, your data layer scales independently of your processing power. Data lives in object storage (Amazon S3, Google Cloud Storage, Azure Data Lake Storage, MinIO, or Dell ECS), and compute clusters access it on demand.

Object storage scales automatically with no capacity planning, so you pay only for what you store. Adding more compute clusters doesn't require additional storage infrastructure either. Multiple clusters can read from the same data simultaneously.

Apache Iceberg's table format keeps things fast even at petabyte scale. Features like hidden partitioning and metadata pruning keep query planning efficient regardless of table size.

## Cost Optimization

Adding resources is one thing. Spending wisely on those resources takes more thought. Here are the main cost levers in IOMETE:

- **Spot and preemptible instances**: Spark executors handle interruption gracefully, making them strong candidates for spot instances (up to 3x cost reduction). If a spot node is reclaimed, Spark reschedules the affected tasks on remaining executors.
- **Reserved instances and savings plans**: For always-on resources like compute cluster drivers and platform services, reserved pricing reduces costs compared to on-demand rates.
- **Right-sizing with node types**: Define node types that match specific workload profiles. A BI dashboard cluster doesn't need the same resources as a batch ETL job.
- **Executor auto-scaling**: With dynamic allocation, you pay for executors only while queries are running. Idle clusters consume only driver resources.

:::info
For the biggest savings on variable workloads, combine spot instances for Spark executors with executor auto-scaling. Executors scale to match demand and run on discounted infrastructure.
:::
