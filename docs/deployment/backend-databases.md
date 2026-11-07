---
title: IOMETE Backend Databases
sidebar_label: Backend Databases
description: Plan PostgreSQL databases for the IOMETE control plane and additional data planes, including ownership, provisioning, capacity, and recovery.
last_update:
  date: 11/05/2026
  author: Vusal Dadalov
---

IOMETE stores platform configuration and metadata in PostgreSQL. Table data and files live in object storage; adding a data plane does not copy those files into a database.

The current enterprise and runtime charts support **PostgreSQL**. For example, both published 4.0.1 charts specify PostgreSQL as their only supported backend. The older [MySQL deployment example](./mysql-deployment.md) is for legacy deployments, not a database choice for a new 4.x installation.

## Choosing Database Ownership

A Kubernetes namespace, an IOMETE data plane, and a PostgreSQL database are different resources. They do not have a one-to-one relationship:

| Installation | Database Requirements |
| --- | --- |
| Control plane (`iomete-data-plane-enterprise`) | Several databases for platform services, such as identities, workload definitions, catalog metadata, and orchestration, plus a Hive metastore database. |
| Additional data plane (`iomete-lakehouse-runtime`) | A metastore database for that runtime. It does not need another copy of all control-plane databases. |
| Additional workload namespace on an existing plane | Uses that plane's existing configuration. Adding a namespace does not create another platform database set. |

The enterprise release still uses its metastore for the internal Spark Connect service when `defaultDataPlane.enabled` is `false`.

You can host the required databases on the same PostgreSQL server or on separate servers. Record which release owns each database and which clients use it. For separate installations that share a server, use deliberate database names or prefixes; reusing a default prefix can accidentally point them at the same databases. Sharing a PostgreSQL server does not itself connect data planes to a control plane.

An additional plane registers with the control plane using its runtime configuration. See [Multi-Cluster Setup](./multi-cluster-setup.mdx) for that relationship.

## Provisioning Databases

Use the database names, roles, and initialization requirements for the **chart version you install**. In particular:

- The enterprise initialization job can create its databases when you provide suitable administrator credentials. If you do not provide those credentials, provision the required databases and grants before installation.
- The additional runtime expects its metastore database to exist. With the default prefix `iomete_`, its name is `iomete_metastore_db`; use your actual configured prefix.
- Keep credentials and connection settings in the complete values file or configured Secret for each release. A change to the control plane's values does not update a separate runtime release.
- Allow database connections from every cluster that has a consumer. Configure authentication, TLS, and trusted certificates consistently with the clients that connect.

For a test PostgreSQL installation, see [PostgreSQL Deployment](./postgresql-deployment.md). For production, use your organization's managed or administrator-operated PostgreSQL service and its supported backup and availability configuration.

## Planning Capacity {#database-load}

Size the database for the work it performs, rather than the number of Kubernetes namespaces or registered users alone.

### IOMETE Internal Metadata

Consider concurrent API operations, job scheduling and run history, SQL activity, catalog operations, and enabled platform features. Additional services and replicas also increase the number of database connections. Plan connection limits across all consumers of a shared server.

### Metadata of Data Lake

Metastore load depends on catalog and table operations, concurrent workloads, and the amount of metadata they access. The table files themselves remain in object storage. A larger object store does not translate directly into an equally large PostgreSQL database.

## Database Resource Requirements

Before production use, run a representative workload and monitor PostgreSQL CPU, memory, connections, query latency, storage capacity, and disk I/O. Include concurrent work from all data planes that share the server, plus backup and maintenance activity.

Provide headroom for growth and retention. Use storage with sufficient throughput and latency for the measured workload, and set alerts for capacity and connection limits. User-count-based CPU and disk estimates alone cannot establish that a deployment has enough capacity.

## Backups and Maintenance

Back up every required database and preserve the corresponding roles, grants, connection settings, and IOMETE identity/encryption Secrets. Test restoring them together. A Helm release backup does not contain PostgreSQL data.

Before changing a shared database server, identify all control-plane, data-plane, and external consumers. Follow [Temporary Shutdown for Maintenance](/resources/user-guide/shutdown-for-maintenance) to pause the affected installation, or [Database Migration](/resources/user-guide/k8s/database-migration) to move its databases. Stopping only the control-plane namespace can leave additional data planes connected.
