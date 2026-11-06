---
slug: /shutdown-for-maintenance
title: Temporary Shutdown for Maintenance
sidebar_label: Maintenance Shutdown
description: Pause and restore the IOMETE services and workloads affected by a maintenance window, including installations with multiple data planes.
last_update:
  date: 11/06/2026
  author: Vusal Dadalov
---

Use this procedure to pause IOMETE for a planned maintenance window and restore the same installation afterward. You keep its Helm releases, configuration, and persistent storage in place.

## Choosing the Maintenance Scope

An IOMETE installation can span several data planes and Kubernetes namespaces. Start by identifying what the work affects:

| Maintenance target | What to pause |
| --- | --- |
| One separately installed data plane | That plane's workloads and runtime services, including services in its additional workload namespaces. |
| The control plane | Its services and the workloads that depend on them. The enterprise release may also contain the default data plane. |
| A shared database or object store | Every control plane, data plane, workload, and external client that uses that dependency. |

The enterprise chart, `iomete-data-plane-enterprise`, installs the control plane and normally its default data plane. An additional data plane uses a separate `iomete-lakehouse-runtime` release. Stopping the enterprise release also stops the console and shared platform services.

This guide uses one enterprise release as an example. Repeat the relevant steps for each affected release and Kubernetes cluster. Do not assume that stopping `iomete-system` stops workloads in other namespaces or data planes.

## Before You Start

Arrange a maintenance window, confirm recoverable database and storage backups, and have access to the installation's Helm values and any separately managed Secrets. Keep these backups private; values and rendered manifests can contain credentials.

You need Bash, Helm, and `kubectl`. Pause GitOps reconciliation or other automation that would undo manual scaling. Record any Horizontal Pod Autoscalers (HPAs) and disable their reconciliation using your installation's normal process for the duration of the shutdown.

## 1. Recording the Existing Installation

Set the Kubernetes context and existing release names. For an additional plane, use its runtime release and service namespace instead:

```bash
set -euo pipefail
IOMETE_CONTEXT="<kubernetes-context>"
RELEASE_NAME="data-plane"
RELEASE_NAMESPACE="iomete-system"
IOMETE_CHART="iomete/iomete-data-plane-enterprise"

helm list --kube-context "$IOMETE_CONTEXT" --namespace "$RELEASE_NAMESPACE"
```

Record the installed chart version from the **CHART** column, not just the application version. For example, `iomete-data-plane-enterprise-4.0.1` means chart version `4.0.1`.

Set `IOMETE_NAMESPACES` to the service namespace **and every workload namespace managed by this release**, using its values file. This example release manages the `finance` and `marketing` workload namespaces. Replace the array with the complete list from your release:

```bash
IOMETE_VERSION="<installed-chart-version>"
IOMETE_NAMESPACES=(iomete-system finance marketing)
IOMETE_MAINTENANCE_DIR="maintenance-$RELEASE_NAME"

umask 077
mkdir "$IOMETE_MAINTENANCE_DIR"
helm get values "$RELEASE_NAME" \
  --kube-context "$IOMETE_CONTEXT" --namespace "$RELEASE_NAMESPACE" \
  --all > "$IOMETE_MAINTENANCE_DIR/values.yaml"
helm get manifest "$RELEASE_NAME" \
  --kube-context "$IOMETE_CONTEXT" --namespace "$RELEASE_NAMESPACE" \
  > "$IOMETE_MAINTENANCE_DIR/manifest.yaml"

for ns in "${IOMETE_NAMESPACES[@]}"; do
  kubectl --context "$IOMETE_CONTEXT" -n "$ns" get deployments,statefulsets \
    -l "app.kubernetes.io/instance=$RELEASE_NAME" \
    -o jsonpath='{range .items[*]}{.kind}{"\t"}{.metadata.namespace}{"\t"}{.metadata.name}{"\t"}{.spec.replicas}{"\n"}{end}'
done > "$IOMETE_MAINTENANCE_DIR/replicas.tsv"

test -s "$IOMETE_MAINTENANCE_DIR/replicas.tsv"
cat "$IOMETE_MAINTENANCE_DIR/replicas.tsv"
```

Review every row before continuing. The file must contain only the services you intend to stop, including per-namespace workers and proxies. If your deployment uses different labels, correct the selection first. Separate releases can reuse the same name in different namespaces, so do not replace the explicit namespace list with a cluster-wide selector.

Save your HPA configuration and separately managed Secrets using your existing backup process. Keep the original values file alongside this snapshot, especially if you use several values files or external Secret references.

## 2. Stopping Workloads

While the console and runtime services are still available:

1. Pause Spark job schedules, maintenance schedules, external orchestrators, and other producers that can submit work.
2. Let running jobs finish or stop them deliberately. Stop computes, notebooks, streaming jobs, and event streams in every affected namespace.
3. Check each affected data plane and namespace for remaining workloads. Wait for their driver and executor pods to terminate before stopping the operator and other runtime services.

For example, inspect an affected namespace with:

```bash
kubectl --context "$IOMETE_CONTEXT" -n finance get pods
```

The control plane also has an internal Spark application for the database explorer in chart versions that deploy `iom-spark-connect`. If your recorded enterprise manifest includes it, stop it **before** scaling down the Spark operator:

```bash
kubectl --context "$IOMETE_CONTEXT" -n "$RELEASE_NAMESPACE" \
  delete sparkapplication iom-spark-connect
```

Wait until its driver and executor pods have gone. The same-version Helm upgrade during restoration recreates this chart-managed application. Do not apply this command to a runtime-only release or delete unrelated Spark applications.

## 3. Pausing the Selected Services

After workloads have stopped and autoscaling/reconciliation has been paused, scale only the reviewed resources in your snapshot:

```bash
while IFS=$'\t' read -r kind ns name replicas; do
  kubectl --context "$IOMETE_CONTEXT" -n "$ns" \
    scale "$kind/$name" --replicas=0
done < "$IOMETE_MAINTENANCE_DIR/replicas.tsv"
```

Check every affected namespace. The selected services should have no running pods, and they should remain stopped. If pods return, find and pause the controller or external automation recreating them before continuing.

The data plane will appear disconnected while its agent is stopped. That is expected during this maintenance window.

## 4. Performing Maintenance

Only after all consumers have stopped should you stop an affected database or object store. Follow that dependency's own maintenance procedure. Managed services and operator-managed databases may not support direct pod scaling.

Keep databases, persistent volumes, Helm release records, and identity/encryption Secrets intact. You do not need `helm uninstall` for a temporary shutdown.

For a database move, continue with [Database Migration](../k8s/database-migration.md).

## 5. Restoring Services and Workloads

1. Restore the database and object store first. Verify their health and network access from the affected clusters.
2. Restore control-plane services before additional data planes, so the agents can reconnect.
3. Check whether any connection settings or credentials changed. If they did, update all affected values files and Secrets **before starting consumers**, then apply them using the existing chart version. For a database move, follow [Applying the Settings and Restoring Services](../k8s/database-migration.md#5-applying-the-settings-and-restoring-services). Do not restore replicas with their old connection settings.
4. With the correct configuration in place, restore the recorded service replica counts for each release:

   ```bash
   while IFS=$'\t' read -r kind ns name replicas; do
     kubectl --context "$IOMETE_CONTEXT" -n "$ns" \
       scale "$kind/$name" --replicas="$replicas"
   done < "$IOMETE_MAINTENANCE_DIR/replicas.tsv"
   ```

5. If you removed chart-managed resources such as `iom-spark-connect` and have not already recreated them through an upgrade, use the same chart version and saved values:

   ```bash
   helm upgrade "$RELEASE_NAME" "$IOMETE_CHART" \
     --kube-context "$IOMETE_CONTEXT" --namespace "$RELEASE_NAMESPACE" \
     --version "$IOMETE_VERSION" \
     --values "$IOMETE_MAINTENANCE_DIR/values.yaml" \
     --wait
   ```

   This can change replica counts according to the chart. Compare the result with your snapshot and restore intentional overrides. This command assumes the connection settings are unchanged. If they changed, use the updated complete values file from step 3 instead of the old snapshot.

6. Wait for the affected Deployments and StatefulSets to be ready. Check **Data Planes** in the admin console: each restored plane should reconnect and report its expected namespaces.
7. Start one compute in each affected data plane, run `SELECT 1`, and confirm its pods are in the intended namespace. If storage was affected, also verify access to a known table or object.
8. Re-enable autoscaling, GitOps reconciliation, schedules, and external producers after these checks pass. Confirm they use the intended post-maintenance configuration.

Keep the snapshot until you have verified the restored services and workloads. Restoring every service to one replica is not equivalent to restoring the original installation.
