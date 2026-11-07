---
title: Priority Classes
sidebar_label: Priority Classes
description: Configure Kubernetes PriorityClasses for IOMETE workloads to control scheduling and preemption when cluster resources are limited.
last_update:
  date: 11/07/2026
  author: IOMETE
---

When multiple workloads compete for limited cluster resources, some will have to wait. Priority classes let you control which IOMETE workloads get resources first — and which ones can be interrupted to make room.

IOMETE priority-class assignment is disabled by default. Without an explicit class, Kubernetes uses the cluster’s default priority. Priority affects scheduling order and possible preemption; it does not create capacity or bypass namespace quotas.

## How It Works

When priority classes are enabled, IOMETE assigns a Kubernetes [PriorityClass](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/) to each workload type. If the cluster runs out of resources:

1. The Kubernetes scheduler uses priority values to decide which pending pods to schedule first.
2. Higher-priority pods can **preempt** (evict) lower-priority pods to free up resources.

### What Happens When a Pod Is Preempted

When a lower-priority pod is preempted, Kubernetes terminates it. The impact depends on the workload type:

- **Spark jobs**: Losing a driver can fail the application; losing an executor can require task retries or replacement executors. Recovery depends on the Spark settings and configured job retry policy.
- **Compute clusters**: Executor loss can interrupt work while Spark replaces executors. Driver loss can interrupt the entire compute and its sessions.
- **Jupyter containers**: The notebook server is terminated. Any unsaved work in the notebook session is lost.

Choose priority values and preemption policies according to which workloads may interrupt others. A larger numerical gap does not create more capacity.

## Prerequisites

- You need access to update the control-plane enterprise release's complete values file.
- A Kubernetes administrator must create every referenced PriorityClass in each cluster that runs the affected pods. PriorityClasses are **cluster-scoped**, so they are shared by data planes in the same Kubernetes cluster; do not create one copy per namespace.
- For an additional data plane, complete [Additional Data Planes](#additional-data-planes) before reloading the configuration. The control plane's mapping is not copied to other planes.

Here is a minimal example for one class:

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: iomete-compute
value: 1000
globalDefault: false
description: "High priority for IOMETE compute clusters"
```

Create every class referenced by your enabled mappings, including support-pod mappings. Use `kubectl --context <workload-cluster-context> apply -f <file>.yaml`; no namespace is needed for a PriorityClass.

## Default Priority Class Mappings

For the default data plane, the enterprise chart writes `priorityClassMappings` to a ConfigMap in its service namespace. The agent supplies these mappings to the control plane when it generates workload specifications:

| Mapping Key                    | Default PriorityClass Name     | Workload Type              |
| ------------------------------ | ------------------------------ | -------------------------- |
| `iomete-compute`               | `iomete-compute`               | Compute clusters           |
| `iomete-spark-job`             | `iomete-spark-job`             | Spark jobs                 |
| `iomete-notebook`              | `iomete-notebook`              | Jupyter containers         |
| `iomete-operational-support`   | `iomete-operational-support`   | Job Orchestrator (Prefect) workers and Spark proxy servers |

The **mapping keys** (left column) are fixed. IOMETE uses them internally to look up the PriorityClass for each workload. The **values** (middle column) can be changed to point to any PriorityClass name that exists in your cluster.

The enterprise chart applies the `iomete-operational-support` class itself, to the default data plane's `prefect-worker-<namespace>` and `spark-proxy-server-<namespace>` Deployments in the service namespace and each workload namespace. A change to that mapping takes effect with the Helm upgrade that applies it.

## Enabling Priority Classes

Enable the feature in the **control-plane enterprise release’s** complete values file. This flag controls priority assignment for workloads, including those on additional planes:

```yaml
features:
  priorityClasses:
    enabled: true
```

Then apply the change with Helm:

```bash
helm upgrade <control-plane-release> iomete/iomete-data-plane-enterprise \
  --kube-context <control-plane-context> \
  --namespace <control-plane-service-namespace> \
  --version <installed-chart-version> \
  --values values.yaml --wait
```

Use the existing release, chart version and complete values file, preserving its namespace list and other settings. See [Life Cycle Management](/resources/deployment/life-cycle-management) for upgrade preparation.

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

The names are only references: the PriorityClass resources’ numeric values and preemption policies determine behavior. Ensure every mapped name exists in the workload’s Kubernetes cluster.

<details id="additional-data-planes" style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}>
<summary>Configuring mappings for an additional data plane</summary>

The agent reads `priority-class-mappings` from **its own service namespace**, such as `iomete-analytics`. The published 4.0.1 runtime chart does not render this ConfigMap from `priorityClassMappings`, so adding the enterprise values to that runtime release alone is insufficient.

For a runtime chart that does not manage this resource, an administrator can manage the mapping separately. If a mapping already exists, update its owned configuration and preserve the intended entries. For example:

```yaml title="runtime-priority-mappings.yaml"
apiVersion: v1
kind: ConfigMap
metadata:
  name: priority-class-mappings
  namespace: iomete-analytics
data:
  iomete-compute: my-high-priority
  iomete-spark-job: my-medium-priority
  iomete-notebook: my-low-priority
```

```bash
kubectl --context <runtime-cluster-context> apply -f runtime-priority-mappings.yaml
```

Replace the namespace and class names for your plane. Keep the feature enabled on the control plane. Do not assume that the operational-support mapping applies to every runtime release: the 4.0.1 runtime workers do not set `priorityClassName` from that mapping.

</details>

## Reloading and Verifying the Configuration {#verifying-the-configuration}

The agent caches its mappings, and `iom-cluster` reads the feature flag at startup and caches the returned mappings. After updating them, restart the affected plane's agent, then the control-plane `iom-cluster`, during your change window. For the default plane, both deployments are in the enterprise release's namespace:

```bash
kubectl --context <plane-cluster-context> --namespace <plane-service-namespace> \
  rollout restart deployment/iomete-lakehouse-agent
kubectl --context <plane-cluster-context> --namespace <plane-service-namespace> \
  rollout status deployment/iomete-lakehouse-agent
kubectl --context <control-plane-context> --namespace <control-plane-service-namespace> \
  rollout restart deployment/iom-cluster
kubectl --context <control-plane-context> --namespace <control-plane-service-namespace> \
  rollout status deployment/iom-cluster
```

Create a new test workload and inspect its pods in the selected plane and workload namespace. Existing workload pods do not gain a different PriorityClass merely because the mapping changed:

```bash
kubectl --context <workload-cluster-context> get pods \
  --namespace <workload-namespace> \
  -o custom-columns='NAME:.metadata.name,PRIORITY:.spec.priorityClassName'
```

The new driver/executor or notebook pods should show the mapped class. Other platform services may legitimately have no class. If a new workload has none, check the control-plane feature flag, that plane's ConfigMap, and whether the processes above have reloaded it. If a pod is rejected because the class does not exist, create the referenced PriorityClass in that pod's cluster.

:::caution
Test priority class changes in a staging environment before applying them to production. Preemption can terminate running workloads, so an incorrect priority assignment could disrupt active Spark jobs or compute clusters.
:::

## Resource Quotas by Priority

You can have further granular control by defining [ResourceQuotas scoped to priority classes](https://kubernetes.io/docs/concepts/policy/resource-quotas/#resource-quota-per-priorityclass). This lets you cap how much CPU or memory each priority level can consume within a namespace, giving administrators tighter control over resource allocation alongside scheduling priority. See [Namespace Quotas](../namespace-quotas.md#setting-quotas) for an example and for how these quotas appear in the console.
