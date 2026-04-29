---
title: Priority Classes
sidebar_label: Priority Classes
description: Configure Kubernetes PriorityClasses for IOMETE workloads to control scheduling and preemption when cluster resources are limited.
last_update:
  date: 04/29/2026
  author: IOMETE
---

If your IOMETE deployment shares a fixed-size Kubernetes cluster across production pipelines, ad-hoc analytics, and notebooks, you will eventually hit resource contention. Priority classes give you a knob to control who wins that contention.

By default, all IOMETE workloads are scheduled with equal priority. Kubernetes uses its default first-come, first-served ordering, which means a batch of notebook pods that happen to start first can block a production Spark job from getting resources. Priority classes let you change that by telling Kubernetes which workloads matter most.

## How It Works

When priority classes are enabled, IOMETE assigns a Kubernetes [PriorityClass](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/) to each workload type. If the cluster runs out of resources:

1. The Kubernetes scheduler uses priority values to decide which pending pods to schedule first.
2. Higher-priority pods can **preempt** (evict) lower-priority pods to free up resources.

### What Happens When a Pod Is Preempted

When a lower-priority pod is preempted, Kubernetes terminates it. The impact depends on the workload type:

- **Spark jobs**: The job fails and needs to be retried. If you use the Job Orchestrator with retry policies configured, the job is retried automatically.
- **Compute clusters**: The affected executor pods are evicted and the cluster may temporarily degrade until Kubernetes reschedules replacement pods.
- **Jupyter containers**: The notebook server is terminated. Any unsaved work in the notebook session is lost.

Keep this in mind when assigning priority values. Preemption is disruptive, so you should reserve large priority gaps for workloads where the tradeoff is clearly worth it.

## Prerequisites

- You need Helm access to update the IOMETE data-plane `values.yaml`.
- You need to create the PriorityClass resources in your cluster before enabling this feature. Here is a minimal example:

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: iomete-compute
value: 1000
globalDefault: false
description: "High priority for IOMETE compute clusters"
```

Create a PriorityClass for each workload type you want to prioritize. Set the `value` field to reflect relative importance: higher numbers mean higher priority. Apply each manifest with `kubectl apply -f <file>.yaml`.

## Default Priority Class Mappings

When enabled, IOMETE maps each workload type to a PriorityClass using the `priorityClassMappings` section in `values.yaml`:

| Mapping Key                    | Default PriorityClass Name     | Workload Type              |
| ------------------------------ | ------------------------------ | -------------------------- |
| `iomete-compute`               | `iomete-compute`               | Compute clusters           |
| `iomete-spark-job`             | `iomete-spark-job`             | Spark jobs                 |
| `iomete-notebook`              | `iomete-notebook`              | Jupyter containers         |
| `iomete-operational-support`   | `iomete-operational-support`   | Job Orchestrator workers   |

The **mapping keys** (left column) are fixed. IOMETE uses them internally to look up the PriorityClass for each workload. The **values** (middle column) can be changed to point to any PriorityClass name that exists in your cluster.

## Enabling Priority Classes

Priority classes are disabled by default. To enable them, set the feature flag in your `values.yaml`:

```yaml
features:
  priorityClasses:
    enabled: true
```

Then apply the change with Helm:

```bash
helm upgrade <release-name> iomete/iomete-data-plane -f values.yaml -n <namespace>
```

Replace `<release-name>` and `<namespace>` with your actual Helm release name and Kubernetes namespace.

## Customizing Mappings

If your cluster already has PriorityClass resources with different names, update the `priorityClassMappings` values to match:

```yaml
features:
  priorityClasses:
    enabled: true

priorityClassMappings:
  iomete-compute: "my-high-priority"
  iomete-spark-job: "my-medium-priority"
  iomete-notebook: "my-low-priority"
  iomete-operational-support: "my-medium-priority"
```

In this example, compute clusters use a high-priority class while notebooks use a low-priority class, so notebooks are preempted first when resources are constrained.

## Verifying the Configuration

After enabling priority classes and running a Helm upgrade, confirm that new pods are picking up the correct PriorityClass:

```bash
kubectl get pods -o custom-columns='NAME:.metadata.name,PRIORITY:.spec.priorityClassName' -n <namespace>
```

Each IOMETE workload pod should show its assigned PriorityClass in the `PRIORITY` column. If the column is empty for a pod, the PriorityClass mapping or the feature flag may not be configured correctly.

:::caution
Test priority class changes in a staging environment before applying them to production. Preemption can terminate running workloads, so an incorrect priority assignment could disrupt active Spark jobs or compute clusters.
:::
