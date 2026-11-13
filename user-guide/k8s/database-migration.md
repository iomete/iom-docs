---
title: Database Migration
sidebar_label: Database Migration
description: Move the PostgreSQL databases IOMETE uses to another server while keeping the same installation, and coordinate the workloads on every data plane that connect to them.
last_update:
  date: 11/07/2026
  author: Vusal Dadalov
---

This guide moves IOMETE's PostgreSQL databases to a different server while you keep the same IOMETE version and installation. You stop everything that connects to the databases, copy them, point each affected Helm release at the new server, and restore the services and workloads. It doesn't cover upgrading PostgreSQL or changing the database engine at the same time.

The examples use the control-plane release `data-plane` in the service namespace `iomete-system`, the additional data plane `analytics` (runtime release `analytics` in `iomete-analytics`, with workload namespaces `finance` and `marketing`), and a new server at `new-postgresql.example.com`.

<span id="understanding-control-plane-setup" style={{scrollMarginTop: 'calc(var(--ifm-navbar-height) + 0.5rem)'}}></span>

## 1. Identifying the Affected Releases

Each Helm release has its own `database` settings, and other clients may connect to the same databases:

| Release or client | Its databases | What connects to them |
| --- | --- | --- |
| Control-plane release (`iomete-data-plane-enterprise`) | Nine databases named with its `database.prefix`, `iomete_` by default: `iomete_core_db`, `iomete_iam_db`, `iomete_sql_db`, `iomete_metastore_db`, `iomete_iceberg_db`, `iomete_catalog_db`, `iomete_prefect_db`, `iomete_mcp_db` and `iomete_ai_services_db` | Its services, including the internal `iom-spark-connect` application, which uses the metastore database even when `defaultDataPlane.enabled` is `false`. Also the computes on **every** data plane. |
| Runtime release of an additional data plane (`iomete-lakehouse-runtime`) | One metastore database, `<prefix>metastore_db` | That data plane's `metastore` service |
| Other clients | Any of the above | For example, another control-plane installation that shares the databases, or your own tools |

Computes connect to the control-plane database directly. With activity monitoring on, which is the default in 4.0.1 and 4.0.2 (`features.activityMonitoring.enabled`), every compute writes query activity to `<prefix>sql_db`, whichever data plane it runs on. So when you move the control-plane databases, you stop and later restart the workloads on every data plane, and every cluster that runs computes must be able to reach the new server.

The control-plane databases share one `database.host`, so they move together; moving only `iomete_core_db` doesn't migrate the installation. Check the prefix each release actually uses, rather than assuming the default names. See [Backend Databases](/resources/deployment/backend-databases) for what each database holds.

## 2. Preparing the Destination and Recovery Plan

Before the maintenance window:

- Check that the new PostgreSQL server meets the requirements of your installed IOMETE version.
- Prepare the database role, the databases and their grants. Alternatively, plan to let the initialization job create them on the new server through `database.adminCredentials`.
- Allow connections to the new server from every cluster that runs IOMETE services or computes: the control plane's cluster and the cluster of every data plane. Computes connect to the database directly, not through the control plane, and use the control-plane release's `database.host` value as it is. So choose a host name that resolves in all of those clusters, such as a fully qualified name rather than a short Kubernetes Service name.
- If the new server needs different TLS settings, or a certificate authority your truststore doesn't include, prepare those changes too.
- Test your backup and restore process with every affected database, including the roles and grants your method doesn't capture.
- Decide until when it's safe to switch back. Once the new server accepts writes, returning to the old one means reconciling those writes.

Copy the database contents with your database administrator's or managed provider's migration procedure. This guide coordinates IOMETE around that copy.

<span id="downscaling-iomete-to-remove-connections-to-the-database" style={{scrollMarginTop: 'calc(var(--ifm-navbar-height) + 0.5rem)'}}></span>
<span id="downscaling-deployments-and-statefulsets" style={{scrollMarginTop: 'calc(var(--ifm-navbar-height) + 0.5rem)'}}></span>
<span id="deleting-sparkapplication" style={{scrollMarginTop: 'calc(var(--ifm-navbar-height) + 0.5rem)'}}></span>

## 3. Stopping Database Consumers

Use [Temporary Shutdown for Maintenance](../misc/shutdown-for-maintenance.md) to stop everything that connects to the databases:

- For every release whose settings you'll change, complete steps 1 to 3: record the release, stop its workloads and scale its services to zero. That's the control-plane release when you move the control-plane databases, and each runtime release whose metastore database moves.
- When you move the control-plane databases, also complete steps 1 and 2 for every other data plane: record it and stop its workloads. Its services can keep running, and it reconnects once the control plane is back.

Keep the old databases running until their consumers have stopped. Then check on the old server that no IOMETE client is still connected. Connected to the `postgres` database, run this query, with your prefix instead of `iomete`:

```sql
SELECT datname, usename, client_addr, application_name
FROM pg_stat_activity
WHERE datname LIKE 'iomete%';
```

It should return no rows. A row whose `client_addr` belongs to a pod means that a workload or service is still running, possibly on another data plane. Find and stop it before you continue: zero replicas in `iomete-system` alone doesn't prove that nothing is connected.

<span id="migrating-the-database-to-a-new-location" style={{scrollMarginTop: 'calc(var(--ifm-navbar-height) + 0.5rem)'}}></span>

Take the final consistent backup, or complete your provider's replication cutover, and copy the databases to the new server. Keep the original databases available for the agreed recovery window, but don't let both copies receive writes.

<span id="updating-values-files-to-point-to-the-new-database-location" style={{scrollMarginTop: 'calc(var(--ifm-navbar-height) + 0.5rem)'}}></span>

## 4. Updating Connection Settings

For each release whose settings change, copy the `values.yaml` saved in its snapshot to a new file in the same directory, such as `values-new-database.yaml`, and edit its `database` section. Keep the database prefix: the database names must not change. These keys can point at the old server:

| Key | What to set |
| --- | --- |
| `database.host`, `database.port` | The new server, or the connection pooler in front of it. |
| `database.directHost`, `database.directPort` | If they're set: the new server itself. They're used when `host` points at a pooler. |
| `database.readHost`, `database.readPort`, `database.readUser`, `database.readPassword` | If `readHost` is set: a read-only standby of the new server. Or leave `readHost` empty to read from the primary. |
| `database.user`, and `database.password` or `database.passwordSecret` | Only if the new server uses another role or password. |
| `database.adminCredentials` | If it's set: an administrator account on the new server. Or remove it if your database administrator created the role and databases. The initialization job connects to the new server with it during the upgrade. |
| `database.ssl.enabled`, `database.ssl.mode` | The new server's TLS requirements. Enabling TLS also requires the `javaTrustStore` settings. |

A runtime release has fewer keys: `host`, `port`, `user`, `password` or `passwordSecret`, `prefix` and `ssl`. For example, the `database` section of the control-plane release, with the keys you may also need shown as comments:

```yaml title="values-new-database.yaml: database section"
database:
  type: postgresql
  host: new-postgresql.example.com
  port: "5432"
  # directHost: ""              # the new server itself, if host points at a pooler
  # directPort: ""
  # readHost: ""                # a standby of the new server, or empty
  # user: iomete_user           # change only for a new role
  # password: <password>        # or passwordSecret with the Secret's name and key
  # adminCredentials:           # an administrator on the new server, or remove it
  #   user: postgres
  #   password: <password>
  # prefix: "iomete_"           # keep your existing prefix
  # ssl:
  #   enabled: false
  #   mode: disable
```

This is a section of the saved file, not a replacement for it: keep everything else in the file as it is.

If the password comes from `database.passwordSecret`, update that Secret in the release's service namespace before you start any service. For the control-plane release, update it in each of its workload namespaces too: the Spark proxy in every one of them reads it. If the new server uses a certificate authority your truststore doesn't include, add it to the truststore Secret in every namespace that has a copy.

Prepare and review the settings of every affected release before you start any of them. A runtime release whose metastore database stays on an unchanged server keeps its settings.

<span id="upgrading-the-iomete-control-plane-using-the-new-values-files" style={{scrollMarginTop: 'calc(var(--ifm-navbar-height) + 0.5rem)'}}></span>

## 5. Applying the Settings and Restoring Services

Before you start IOMETE, confirm that the new server holds the expected data. If a database is empty, the initialization job can still succeed by creating empty schemas, and your users and resources are missing.

Then restore the services as described in [Restoring Services](../misc/shutdown-for-maintenance.md#5-restoring-services), with these settings:

1. Load the control-plane release's snapshot and upgrade the release with its existing chart version and your updated values file:

   ```bash
   source "$HOME/iomete-maintenance/<context>/iomete-system/data-plane/<timestamp>/env.sh"
   IOMETE_VALUES="$IOMETE_MAINTENANCE_DIR/values-new-database.yaml"

   helm upgrade "$RELEASE_NAME" "$IOMETE_CHART" \
     --kube-context "$IOMETE_CONTEXT" --namespace "$RELEASE_NAMESPACE" \
     --version "$IOMETE_VERSION" \
     --reset-values --values "$IOMETE_VALUES" \
     --wait --timeout 15m
   ```

   The initialization job runs first and connects to the new server. When `adminCredentials` is set, it creates the role and any missing database. It also creates the metastore schema if it's missing. If the job can't connect or sign in, the upgrade stops before any service starts. Read its logs, fix the settings and run the upgrade again:

   ```bash
   kubectl --context "$IOMETE_CONTEXT" -n "$RELEASE_NAMESPACE" logs job/iomete-data-plane-init
   ```

2. Complete steps 4 to 6 of [Restoring Services](../misc/shutdown-for-maintenance.md#5-restoring-services): restore the recorded replica counts, check that every Deployment and StatefulSet is ready, and check that `iom-spark-connect` is `RUNNING`. Run the replica loop even after a successful upgrade, or the Deployments that an HPA manages stay at zero.
3. For each runtime release whose metastore database moved, load its snapshot, set `IOMETE_VALUES` to its updated file and run the same `helm upgrade` command. Then restore its replica counts and check it the same way. Its metastore starts with the new settings.

## 6. Verifying the Migration

Before you resume schedules and external producers:

1. Confirm that all affected services are ready and that their logs show no connection, authentication, TLS or schema errors.
2. Sign in to the console. Check that existing users, domains, computes, catalogs and other resources from the migrated databases are there.
3. On the **Data Planes** page of the admin console, check that every data plane shows as **Connected** and reports its expected namespaces.
4. Start a compute on each data plane. Run `SELECT 1`, then query a known table to check metastore and storage access too.
5. Run the `pg_stat_activity` query from step 3 on both servers. On the new server, it lists the IOMETE services and the computes you started. On the old server, it still returns no rows.
6. Restart the remaining workloads, and resume schedules, external producers and automation with the new settings, as described in [Restarting Workloads and Schedules](../misc/shutdown-for-maintenance.md#6-restarting-workloads-and-schedules).

Keep the old databases and the snapshots until the agreed verification and recovery window ends. A Helm rollback changes Kubernetes resources; it doesn't reverse database writes or restore a database backup.
