---
slug: /shutdown-for-maintenance
title: Temporary Shutdown for Maintenance
sidebar_label: Maintenance Shutdown
description: Pause the IOMETE services and workloads affected by a maintenance window and restore them afterward, including installations with several data planes.
last_update:
  date: 11/07/2026
  author: Vusal Dadalov
---

<span id="overview" style={{scrollMarginTop: 'calc(var(--ifm-navbar-height) + 0.5rem)'}}></span>

Use this procedure to pause IOMETE for a planned maintenance window and bring the same installation back afterward. You record each affected Helm release, stop its workloads and scale its services to zero. After the maintenance, you restore the recorded replica counts and restart the workloads. Helm releases, configuration, persistent volumes and databases stay in place.

## Choosing the Maintenance Scope

An IOMETE installation has one control plane and one or more data planes. The **control-plane release**, from the `iomete-data-plane-enterprise` chart, installs the console, the platform services and the default data plane. Each **additional data plane** has its own runtime release, from the `iomete-lakehouse-runtime` chart. A release runs its services in its **service namespace** and in each **workload namespace** it manages. Computes, Spark jobs and Jupyter containers run in the workload namespaces.

The examples on this page use:

- the control-plane release `data-plane`, in the service namespace `iomete-system`;
- the additional data plane `analytics`: runtime release `analytics`, service namespace `iomete-analytics`, and workload namespaces `finance` and `marketing`.

Use the target of the maintenance to decide what to stop:

| Maintenance target | Workloads to stop | Releases to scale down |
| --- | --- | --- |
| An additional data plane, such as `analytics`, or its metastore database | Workloads on that data plane | Its runtime release |
| The control plane, or the PostgreSQL server that holds the control-plane databases | Workloads on **every** data plane | The control-plane release, and every runtime release whose metastore database is on that server |
| An object store | Workloads on every data plane that stores data in it | Every release configured to use it |

Workloads on every data plane depend on the control plane. Computes also connect to the control-plane database directly: with activity monitoring on, which is the 4.0.1 default (`features.activityMonitoring.enabled`), every compute writes query activity to `<prefix>sql_db` (`iomete_sql_db` with the default prefix), whichever data plane it runs on. Scaling down the control-plane release doesn't stop computes on other data planes, so stop them first.

<span id="notes" style={{scrollMarginTop: 'calc(var(--ifm-navbar-height) + 0.5rem)'}}></span>

## Before You Start

- Arrange a maintenance window, and confirm that you have tested backups of the databases and object storage.
- Use Bash, Helm and `kubectl`, with a Kubernetes context for every cluster involved. The commands use the `iomete` Helm repository. If your machine doesn't have it, add it as described in [Add IOMETE Helm Repository](/resources/deployment/on-prem/install#add-iomete-helm-repository).
- Sign in to the console as a user who can stop and start workloads in every affected domain.
- Pause GitOps reconciliation, such as Argo CD or Flux, and any other automation that would undo manual scaling or start workloads.

:::warning Don't uninstall the release
A maintenance shutdown doesn't need `helm uninstall`. Uninstalling the control-plane release deletes Secrets that the chart generated, including `iom-secret-encryption-key`, which encrypts the secrets IOMETE stores in its database, and `iomete-plane-trust-secret`, which data planes present when they call the control plane. A new installation generates new keys: stored secrets can no longer be decrypted, and enrolled data planes are rejected.
:::

<span id="steps-to-shutdown-iomete-for-maintenance" style={{scrollMarginTop: 'calc(var(--ifm-navbar-height) + 0.5rem)'}}></span>

## 1. Recording the Existing Installation

Record every affected release before you stop anything: the restore in step 5 uses this snapshot. Run this step once for each release.

Set the release's variables and list the Helm releases in its service namespace. The comments show the values for the `analytics` data plane:

```bash
IOMETE_CONTEXT="<kubernetes-context>"
RELEASE_NAME="data-plane"                           # analytics
RELEASE_NAMESPACE="iomete-system"                   # iomete-analytics
IOMETE_CHART="iomete/iomete-data-plane-enterprise"  # iomete/iomete-lakehouse-runtime

helm list --kube-context "$IOMETE_CONTEXT" --namespace "$RELEASE_NAMESPACE"
```

<span id="3-remember-iomete-version" style={{scrollMarginTop: 'calc(var(--ifm-navbar-height) + 0.5rem)'}}></span>

Find the release and read the chart version at the end of its **CHART** value, not its **APP VERSION**. Here it's `4.0.1`:

```text
NAME        NAMESPACE       REVISION   UPDATED                                 STATUS     CHART                                APP VERSION
data-plane  iomete-system   12         2026-10-14 09:12:44.531961 +0000 UTC    deployed   iomete-data-plane-enterprise-4.0.1   4.0.1
```

In the console, the user menu also shows the version of the control-plane release.

Next, set the version and the namespaces the release manages, and save the snapshot. `IOMETE_NAMESPACES` lists the service namespace followed by every workload namespace in the release's `namespaces` value. The snapshot directory's path includes the context, namespace, release name and a timestamp, so releases with the same name never share a snapshot:

```bash
IOMETE_VERSION="4.0.1"
IOMETE_NAMESPACES=(iomete-system)                   # (iomete-analytics finance marketing)
IOMETE_MAINTENANCE_DIR="$HOME/iomete-maintenance/${IOMETE_CONTEXT//[^A-Za-z0-9._-]/_}"
IOMETE_MAINTENANCE_DIR+="/$RELEASE_NAMESPACE/$RELEASE_NAME/$(date +%Y%m%d-%H%M%S)"

umask 077
mkdir -p "$IOMETE_MAINTENANCE_DIR"
declare -p IOMETE_CONTEXT RELEASE_NAME RELEASE_NAMESPACE IOMETE_CHART \
  IOMETE_VERSION IOMETE_NAMESPACES IOMETE_MAINTENANCE_DIR \
  > "$IOMETE_MAINTENANCE_DIR/env.sh"

helm get values "$RELEASE_NAME" --kube-context "$IOMETE_CONTEXT" \
  --namespace "$RELEASE_NAMESPACE" --output yaml \
  > "$IOMETE_MAINTENANCE_DIR/values.yaml"
helm get values "$RELEASE_NAME" --kube-context "$IOMETE_CONTEXT" \
  --namespace "$RELEASE_NAMESPACE" --all --output yaml \
  > "$IOMETE_MAINTENANCE_DIR/values-all.yaml"
helm get manifest "$RELEASE_NAME" --kube-context "$IOMETE_CONTEXT" \
  --namespace "$RELEASE_NAMESPACE" \
  > "$IOMETE_MAINTENANCE_DIR/manifest.yaml"

for ns in "${IOMETE_NAMESPACES[@]}"; do
  kubectl --context "$IOMETE_CONTEXT" -n "$ns" get deployments,statefulsets \
    -l "app.kubernetes.io/instance=$RELEASE_NAME" \
    -o jsonpath='{range .items[*]}{.kind}{"\t"}{.metadata.namespace}{"\t"}{.metadata.name}{"\t"}{.spec.replicas}{"\n"}{end}'
done > "$IOMETE_MAINTENANCE_DIR/replicas.tsv"

for ns in "${IOMETE_NAMESPACES[@]}"; do
  echo "== $ns: autoscalers"
  kubectl --context "$IOMETE_CONTEXT" -n "$ns" get hpa
  echo "== $ns: IOMETE workloads"
  kubectl --context "$IOMETE_CONTEXT" -n "$ns" \
    get sparkapplications,deployments,statefulsets \
    -l iomete.com/appType -L iomete.com/appType,iomete.com/domain
done > "$IOMETE_MAINTENANCE_DIR/before.txt" 2>&1

echo "Snapshot saved in $IOMETE_MAINTENANCE_DIR"
column -t -s $'\t' "$IOMETE_MAINTENANCE_DIR/replicas.tsv"
```

The snapshot directory now holds these files:

| File | Contents | Used for |
| --- | --- | --- |
| `env.sh` | The variables above | Loading them again in another shell |
| `values.yaml` | Only the values you supplied to the release | The Helm upgrade in step 5 |
| `values-all.yaml` | Every value, including the chart's defaults | Reference only. Applying it would turn every default into an override. |
| `manifest.yaml` | Every resource the release manages | Reference |
| `replicas.tsv` | Each Deployment and StatefulSet with its namespace and replica count | Scaling down and restoring |
| `before.txt` | For each namespace: the HorizontalPodAutoscalers (HPAs) and the running IOMETE workloads | Restarting workloads, and reference |

For a control-plane release installed with the 4.0.1 defaults, the command prints:

```text
Deployment   iomete-system  iom-app                           1
Deployment   iomete-system  iom-catalog                       1
Deployment   iomete-system  iom-cluster                       1
Deployment   iomete-system  iom-core                          1
Deployment   iomete-system  iom-gateway                       1
Deployment   iomete-system  iom-gateway-dp                    1
Deployment   iomete-system  iom-identity                      1
Deployment   iomete-system  iom-maintenance                   1
Deployment   iomete-system  iom-rest-catalog                  1
Deployment   iomete-system  iom-socket                        1
Deployment   iomete-system  iom-spark-connect-rest-client     1
Deployment   iomete-system  iom-sql                           1
Deployment   iomete-system  iomete-lakehouse-agent            1
Deployment   iomete-system  metastore                         1
Deployment   iomete-system  prefect-server                    1
Deployment   iomete-system  prefect-worker-iomete-system      1
Deployment   iomete-system  spark-history                     1
Deployment   iomete-system  spark-operator                    1
Deployment   iomete-system  spark-operator-submit-service     1
Deployment   iomete-system  spark-proxy-server-iomete-system  1
Deployment   iomete-system  typesense                         1
StatefulSet  iomete-system  iom-event-stream                  2
```

Optional features add rows, such as `iom-event-stream-proxy`, `iom-ratelimiter`, `iom-mcp-server` and `iom-ai-services`. Your replica counts may differ.

<details>
<summary>Sample for the analytics data plane</summary>

A runtime release has fewer services, plus a Prefect worker and a Spark proxy in each workload namespace:

```text
Deployment  iomete-analytics  iom-gateway                          1
Deployment  iomete-analytics  iomete-lakehouse-agent               1
Deployment  iomete-analytics  metastore                            1
Deployment  iomete-analytics  prefect-worker-iomete-analytics      1
Deployment  iomete-analytics  spark-history                        1
Deployment  iomete-analytics  spark-operator                       1
Deployment  iomete-analytics  spark-operator-submit-service        1
Deployment  iomete-analytics  spark-proxy-server-iomete-analytics  1
Deployment  finance           prefect-worker-finance               1
Deployment  finance           spark-proxy-server-finance           1
Deployment  marketing         prefect-worker-marketing             1
Deployment  marketing         spark-proxy-server-marketing         1
```

</details>

Review every row before you continue:

- Every namespace in `IOMETE_NAMESPACES` appears. If one is missing, check the release's `namespaces` value.
- No row has `0` replicas, unless you scaled that service down on purpose before the window. A snapshot taken after scaling down would restore zeros.
- Nothing else is listed, such as a database in the same namespace. The commands select the release's `app.kubernetes.io/instance` label only in the listed namespaces, because a release in another namespace can have the same name.

If `before.txt` lists HPAs, leave them in place. For example, when Event Streams are enabled, the chart manages `iom-event-stream-proxy` with an HPA by default. An HPA doesn't scale a target that has zero replicas: its `ScalingActive` condition reports `ScalingDisabled`. So it doesn't undo the scale-down in step 3, and it doesn't bring the Deployment back afterward either. The restore in step 5 does that.

For the control-plane release, also back up the Secrets that hold its keys. `iomete-jwt-signing` holds the key pair IOMETE signs its tokens with. The initialization job creates it outside Helm, so it isn't in the release's manifest or values. The chart generates the other two:

```bash
kubectl --context "$IOMETE_CONTEXT" -n "$RELEASE_NAMESPACE" get secret \
  iomete-jwt-signing iom-secret-encryption-key iomete-plane-trust-secret \
  --output yaml > "$IOMETE_MAINTENANCE_DIR/control-plane-keys.yaml"
```

If your values set `jwtSigning.existingSecret`, `secretEncryptionKey.existingSecret` or `multiCluster.trustSecret.existingSecret`, back up the Secrets they name as well. Keep the snapshot directory private: the values files and these Secrets contain credentials.

Each release has its own snapshot directory. Before you run a later step for a release, load its variables, for example in a new shell:

```bash
ls -d "$HOME"/iomete-maintenance/*/*/*/*/
source "$HOME/iomete-maintenance/<context>/iomete-system/data-plane/<timestamp>/env.sh"
```

<span id="1-stop-lakehouse-and-spark-jobs" style={{scrollMarginTop: 'calc(var(--ifm-navbar-height) + 0.5rem)'}}></span>

## 2. Stopping Workloads

Stop the workloads on every data plane in scope while the console and services are still running. For maintenance on the control plane or its database, that's every data plane.

1. Pause new work. Suspend scheduled [Spark jobs](../spark-jobs/creating-spark-job.md#managing-spark-jobs) in the console or through the IOMETE API, not by editing Kubernetes resources, and keep a list of the jobs you suspend. Disable [automated table maintenance](../table-maintenance/overview.md) if it's on, and pause external tools that submit work or write to IOMETE tables.
2. In the console, note which computes, streaming jobs, Jupyter containers and event streams are running. `before.txt` also lists them, by their Kubernetes names. Then [terminate the computes](../compute-clusters/managing-clusters.md#terminating-a-cluster), [stop the streaming jobs](../spark-jobs/streaming-jobs.md#stopping-a-streaming-job), [terminate the Jupyter containers](../notebook/manage-containers.mdx#terminating-a-container) and [terminate the event streams](../event-stream.md#terminate-and-start). Let running Spark jobs finish, or cancel them.
3. Check that no IOMETE workload pods remain in the release's namespaces:

   ```bash
   for ns in "${IOMETE_NAMESPACES[@]}"; do
     kubectl --context "$IOMETE_CONTEXT" -n "$ns" get pods -l iomete.com/appType
   done
   ```

   Repeat the check until every namespace reports that it has no resources. For the `analytics` data plane:

   ```text
   No resources found in iomete-analytics namespace.
   No resources found in finance namespace.
   No resources found in marketing namespace.
   ```

4. For the control-plane release only, delete the internal `iom-spark-connect` Spark application, which the database explorer uses. A Spark application can't be scaled to zero, and the restore in step 5 recreates it. Then check that its pods have gone:

   ```bash
   kubectl --context "$IOMETE_CONTEXT" -n "$RELEASE_NAMESPACE" \
     delete sparkapplication iom-spark-connect
   kubectl --context "$IOMETE_CONTEXT" -n "$RELEASE_NAMESPACE" \
     get pods -l sparkoperator.k8s.io/app-name=iom-spark-connect
   ```

   ```text
   sparkapplication.sparkoperator.k8s.io "iom-spark-connect" deleted
   No resources found in iomete-system namespace.
   ```

   If its driver pod is still terminating, repeat the second command. Don't delete other Spark applications this way: stop them in the console.

<span id="4-uninstall-data-plane" style={{scrollMarginTop: 'calc(var(--ifm-navbar-height) + 0.5rem)'}}></span>

## 3. Pausing the Selected Services

Start only when step 2 is complete on every data plane in scope. Scale down additional data planes before the control plane, the reverse of the restore order. For each release, load its snapshot and scale only the resources in it:

```bash
while IFS=$'\t' read -r kind ns name replicas; do
  kubectl --context "$IOMETE_CONTEXT" -n "$ns" scale "$kind/$name" --replicas=0
done < "$IOMETE_MAINTENANCE_DIR/replicas.tsv"
```

Each line of output reports a scaled resource, such as `deployment.apps/iom-core scaled`. Then check that the release's pods have stopped:

```bash
for ns in "${IOMETE_NAMESPACES[@]}"; do
  kubectl --context "$IOMETE_CONTEXT" -n "$ns" get pods \
    -l "app.kubernetes.io/instance=$RELEASE_NAME"
done
```

Repeat the check until it prints only `No resources found in <namespace> namespace.`, once for each namespace. If pods come back, a controller or automation is recreating them: find and pause it, then scale down again.

While its agent is stopped, a data plane shows as **Disconnected** on the **Data Planes** page of the admin console. That's expected during the maintenance window.

## 4. Performing Maintenance

Stop a database or object store only after everything that uses it has stopped. Follow that product's own maintenance procedure: managed services and operator-managed databases usually can't be stopped by scaling their pods. Keep the databases, persistent volumes, Helm release records and Secrets intact.

<details id="2-backup-and-scale-down-postgresql-and-minio" style={{scrollMarginTop: 'calc(var(--ifm-navbar-height) + 0.5rem)'}}>
<summary>Stopping and starting the test PostgreSQL and MinIO deployments</summary>

If you use the test deployments from [PostgreSQL Deployment](/resources/deployment/postgresql-deployment) and [MinIO Deployment](/resources/deployment/minio-deployment), they run in `iomete-system` outside the IOMETE release, so the steps above leave them running. Back them up, then stop them:

```bash
kubectl --context "$IOMETE_CONTEXT" -n iomete-system scale statefulset postgresql --replicas=0
kubectl --context "$IOMETE_CONTEXT" -n iomete-system scale deployment minio --replicas=0
```

When the maintenance is done, start them again and wait until they're ready, before you restore IOMETE:

```bash
kubectl --context "$IOMETE_CONTEXT" -n iomete-system scale statefulset postgresql --replicas=1
kubectl --context "$IOMETE_CONTEXT" -n iomete-system scale deployment minio --replicas=1
kubectl --context "$IOMETE_CONTEXT" -n iomete-system rollout status statefulset/postgresql
kubectl --context "$IOMETE_CONTEXT" -n iomete-system rollout status deployment/minio
```

</details>

To move the databases, continue with [Database Migration](../k8s/database-migration.md). To move the object storage, follow [Migrating to New Object Storage](/resources/deployment/storage-migration).

<span id="steps-to-restore-iomete-after-maintenance" style={{scrollMarginTop: 'calc(var(--ifm-navbar-height) + 0.5rem)'}}></span>
<span id="2-reinstall-data-plane" style={{scrollMarginTop: 'calc(var(--ifm-navbar-height) + 0.5rem)'}}></span>

## 5. Restoring Services

Restore the control-plane release first, then additional data planes, so their agents can reconnect.

1. <span id="1-scale-up-postgresql-and-minio-instances" style={{scrollMarginTop: 'calc(var(--ifm-navbar-height) + 0.5rem)'}}></span>Start the database and object store if you stopped them, and check that every affected cluster can reach them.
2. If connection settings or credentials changed, update the values files and Secrets of every affected release before you start any service. For a database move, prepare them as described in [Updating Connection Settings](../k8s/database-migration.md#4-updating-connection-settings).
3. If you scaled down the control-plane release, load its snapshot and upgrade the release with its existing chart version. This recreates `iom-spark-connect` and starts most services at the replica counts the chart sets. `values.yaml` holds only the values you supplied, so the chart's defaults stay defaults. If you changed settings in the previous step, set `IOMETE_VALUES` to your updated values file instead:

   ```bash
   source "$HOME/iomete-maintenance/<context>/iomete-system/data-plane/<timestamp>/env.sh"
   IOMETE_VALUES="$IOMETE_MAINTENANCE_DIR/values.yaml"

   helm upgrade "$RELEASE_NAME" "$IOMETE_CHART" \
     --kube-context "$IOMETE_CONTEXT" --namespace "$RELEASE_NAMESPACE" \
     --version "$IOMETE_VERSION" \
     --reset-values --values "$IOMETE_VALUES" \
     --wait --timeout 15m
   ```

   The initialization job runs first and connects to the database. If it fails, Helm stops before it changes any service. If the upgrade fails or times out, find the cause before you run it again:

   ```bash
   kubectl --context "$IOMETE_CONTEXT" -n "$RELEASE_NAMESPACE" logs job/iomete-data-plane-init
   kubectl --context "$IOMETE_CONTEXT" -n "$RELEASE_NAMESPACE" get pods
   ```

   A runtime release has no `iom-spark-connect`, so it needs this upgrade only when its settings changed. Its initialization job is `init-job`.

4. Restore the recorded replica counts. Run this for every release, after any upgrade:

   ```bash
   while IFS=$'\t' read -r kind ns name replicas; do
     kubectl --context "$IOMETE_CONTEXT" -n "$ns" scale "$kind/$name" --replicas="$replicas"
   done < "$IOMETE_MAINTENANCE_DIR/replicas.tsv"
   ```

   Don't skip this step after a successful upgrade. When an HPA manages a Deployment, the chart doesn't set its replica count, so the upgrade leaves it at zero. `--wait` counts a Deployment with zero replicas as ready, and the HPA doesn't scale a target at zero. Once this loop restores the count, the HPA takes over again.

5. Check that every Deployment and StatefulSet is ready with its recorded count. It can take a few minutes:

   ```bash
   for ns in "${IOMETE_NAMESPACES[@]}"; do
     echo "== $ns"
     kubectl --context "$IOMETE_CONTEXT" -n "$ns" get deployments,statefulsets \
       -l "app.kubernetes.io/instance=$RELEASE_NAME"
   done
   ```

   For the `analytics` data plane, every row shows `1/1`:

   ```text
   == iomete-analytics
   NAME                                                  READY   UP-TO-DATE   AVAILABLE   AGE
   deployment.apps/iom-gateway                           1/1     1            1           42d
   deployment.apps/iomete-lakehouse-agent                1/1     1            1           42d
   deployment.apps/metastore                             1/1     1            1           42d
   deployment.apps/prefect-worker-iomete-analytics       1/1     1            1           42d
   deployment.apps/spark-history                         1/1     1            1           42d
   deployment.apps/spark-operator                        1/1     1            1           42d
   deployment.apps/spark-operator-submit-service         1/1     1            1           42d
   deployment.apps/spark-proxy-server-iomete-analytics   1/1     1            1           42d
   == finance
   NAME                                         READY   UP-TO-DATE   AVAILABLE   AGE
   deployment.apps/prefect-worker-finance       1/1     1            1           42d
   deployment.apps/spark-proxy-server-finance   1/1     1            1           42d
   == marketing
   NAME                                           READY   UP-TO-DATE   AVAILABLE   AGE
   deployment.apps/prefect-worker-marketing       1/1     1            1           42d
   deployment.apps/spark-proxy-server-marketing   1/1     1            1           42d
   ```

   For the control-plane release, `iomete-system` lists the services from its `replicas.tsv`, with `iom-event-stream` in a second table for StatefulSets. If a row stays below its count, inspect its pods with `kubectl describe pod` and `kubectl logs`.

6. For the control-plane release, check that `iom-spark-connect` is running again:

   ```bash
   kubectl --context "$IOMETE_CONTEXT" -n "$RELEASE_NAMESPACE" \
     get sparkapplication iom-spark-connect
   ```

   ```text
   NAME                STATUS    ATTEMPTS   START                  FINISH       AGE
   iom-spark-connect   RUNNING   1          2026-11-07T10:42:18Z   <no value>   4m
   ```

   The status can stay empty or show `SUBMITTED` for a few minutes before it reaches `RUNNING`.

7. For each additional data plane you scaled down, load its snapshot and repeat steps 4 and 5. If its settings changed, run the upgrade from step 3 first, with its own updated values file.
8. On the **Data Planes** page of the admin console, check that every restored data plane shows as **Connected**.

## 6. Restarting Workloads and Schedules

1. Start one compute on each restored data plane. Run `SELECT 1` on it in the SQL editor, and check that its pods run in the intended namespace, for example `kubectl --context "$IOMETE_CONTEXT" -n finance get pods -l iomete.com/appType=compute`. If the maintenance affected storage, also query a known table. A compute can show as active a minute or two before it accepts queries: if the query reports that the compute isn't ready or reachable, run it again shortly.
2. Start the other computes, streaming jobs, Jupyter containers and event streams that were running before the maintenance. Use your notes and `before.txt`.
3. Resume the scheduled Spark jobs you suspended, through the console or API. Re-enable table maintenance and the external tools you paused.
4. Resume GitOps reconciliation and other automation. If you changed settings during the maintenance, update their source first, so they don't revert the change.

Keep the snapshots until you've verified the restored installation. Restoring every service to one replica isn't the same as restoring the recorded counts.

<span id="conclusion" style={{scrollMarginTop: 'calc(var(--ifm-navbar-height) + 0.5rem)'}}></span>
