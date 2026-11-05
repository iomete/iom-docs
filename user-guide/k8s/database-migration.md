---
title: Database Migration
sidebar_label: Database Migration
description: Move the PostgreSQL databases used by IOMETE while preserving the installation and coordinating all affected control planes and data planes.
last_update:
  date: 11/05/2026
  author: Vusal Dadalov
---

This guide covers moving IOMETE's PostgreSQL databases to a different server while keeping the same IOMETE version and installation. It does not cover upgrading PostgreSQL or changing database engines at the same time.

A control plane and its data planes can use the same database server or different servers. Before moving one, identify **every release and external client that connects to it**. Stopping only the control-plane namespace does not stop additional data planes or workloads in other namespaces.

## 1. Identifying the Affected Releases

Review each release's database configuration and existing Secret references. Record the Kubernetes context, release name, service namespace, workload namespaces, chart version, database host, and database names or prefix.

| Release type | What to check |
| --- | --- |
| `iomete-data-plane-enterprise` | The control plane's databases, including its metastore. The internal Spark Connect service still needs the metastore when the default data plane is disabled. |
| `iomete-lakehouse-runtime` | The additional data plane's metastore database. Include this release if it uses the server you are moving. |
| Other installations or external clients | Any connection to the databases being moved, including other control-plane replicas or separately deployed services. |

IOMETE uses several databases. Moving only `iomete_core_db` does not migrate an entire installation. Use the actual configured prefix and your database inventory, rather than assuming every database has its default name.

## 2. Preparing the Destination and Recovery Plan

Before the maintenance window:

- Verify that the new PostgreSQL server meets the requirements of your installed IOMETE version.
- Prepare the database roles, permissions, extensions, TLS settings, and network access required by all affected clusters.
- Test your backup and restore process. Include every affected database and the roles or grants your backup method does not capture automatically.
- Preserve the installation's Secrets, including encryption and signing material, along with Helm values and original replica counts. Changing these identities is not part of a database move.
- Decide when it is safe to switch back. Once the new server accepts writes, returning to the old backup requires a plan to reconcile those writes.

Use your database administrator's or managed provider's migration procedure for copying the database contents. This guide covers coordinating IOMETE around that move.

## 3. Stopping Database Consumers

Follow [Temporary Shutdown for Maintenance](../misc/shutdown-for-maintenance.md) for **all affected releases**, stopping at the maintenance step. That procedure records the original state, pauses new work, stops workloads, handles the internal Spark application when present, and stops services across their workload namespaces.

Keep the old database running until its consumers are stopped. Ask your database administrator to verify that no application clients are still writing to the databases being copied. Do not infer this solely from zero replicas in `iomete-system`.

Take the final consistent backup or complete your provider's replication cutover only after the required write pause. Keep the original database available for the agreed recovery window without allowing both copies to receive application writes.

## 4. Updating Connection Settings

Update the existing complete values file for every affected release. Change the connection fields needed for the new server and keep the database names/prefix and unrelated settings unchanged. For example:

```yaml title="Existing values file: change the host"
database:
  type: postgresql
  host: new-postgresql.example.com
  port: "5432"
  # Keep the existing user, password or Secret reference, prefix, and TLS settings.
```

This is a fragment, not a replacement values file. Preserve any administrator-credential configuration already used by your installation's initialization job.

If credentials or a connection URL come from an existing Kubernetes Secret, update that Secret wherever it is consumed. Changing `database.host` does not rewrite connection URLs stored elsewhere. If the destination uses a different private CA, update the trust configuration in every affected namespace before starting services.

Prepare and review all affected releases' new settings before restarting any of them. An additional data plane with a metastore on another, unchanged database server does not need its database settings changed.

## 5. Applying the Settings and Restoring Services

Confirm that the restored databases contain the expected data before starting IOMETE. An empty database can allow initialization to succeed while your users and resources are missing.

Apply the updated complete values file with the **existing release name, chart, and chart version**. For an enterprise release:

```bash
IOMETE_CONTEXT="<kubernetes-context>"
IOMETE_VERSION="<installed-chart-version>"

helm upgrade data-plane iomete/iomete-data-plane-enterprise \
  --kube-context "$IOMETE_CONTEXT" \
  --namespace iomete-system \
  --version "$IOMETE_VERSION" \
  --values values.yaml \
  --wait
```

For an affected additional data plane, use its `iomete-lakehouse-runtime` release and its own values file:

```bash
helm upgrade <runtime-release> iomete/iomete-lakehouse-runtime \
  --kube-context <runtime-kubernetes-context> \
  --namespace <runtime-service-namespace> \
  --version <installed-runtime-chart-version> \
  --values <updated-runtime-values-file> \
  --wait
```

Restore the control plane first, then its additional data planes. Use the recorded replica counts from the maintenance procedure; do not assume Helm restores every manually scaled or autoscaled service to its previous count. A service left at zero may need its recorded count restored while an upgrade is waiting for readiness.

If you deleted the chart-managed `iom-spark-connect` application during shutdown, the enterprise upgrade recreates it with the updated configuration. Other workloads remain stopped until you restart them deliberately. If an existing Secret changed without a corresponding pod restart, restart its consumers so they read the new connection settings.

## 6. Verifying the Migration

Before re-enabling schedules and external producers:

1. Confirm that all affected services are ready and logs show no connection, authentication, TLS, or schema errors.
2. Sign in to the console. Check existing users, domains, computes, catalogs, and other expected resources from the migrated databases.
3. Open **Data Planes** and verify that every affected plane reconnects and reports the expected namespaces.
4. Start a compute on each affected plane. Run `SELECT 1`, then query a known table to check metastore and storage access as well.
5. Have the database administrator confirm that the intended clients connect to the new server and that none still write to the old one.
6. Restore autoscaling and reconciliation with the new settings, then re-enable schedules and other producers.

Keep the old database and the migration snapshots until the agreed verification and recovery window ends. A Helm rollback changes Kubernetes resources; it does not reverse database writes or restore a database backup.
