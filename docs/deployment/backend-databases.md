---
title: IOMETE Backend Databases
sidebar_label: Backend Databases
description: Plan the PostgreSQL databases for the IOMETE control plane and additional data planes, including which databases each release uses, who connects to them, sizing and recovery.
last_update:
  date: 11/07/2026
  author: Vusal Dadalov
---

IOMETE stores platform configuration and metadata in PostgreSQL. Table data and files live in object storage; adding a data plane does not copy those files into a database.

The current enterprise and runtime charts support **PostgreSQL**. For example, the published 4.0.1 and 4.0.2 charts specify PostgreSQL as their only supported backend. The older [MySQL deployment example](./mysql-deployment.md) is for legacy deployments, not a database choice for a new 4.x installation.

## Choosing Database Ownership

A Kubernetes namespace, an IOMETE data plane, and a PostgreSQL database are different resources. They do not have a one-to-one relationship:

| Installation | Database Requirements |
| --- | --- |
| Control plane (`iomete-data-plane-enterprise`) | The nine [control-plane databases](#control-plane-databases) for the platform services, including a Hive metastore database. |
| Additional data plane (`iomete-lakehouse-runtime`) | Only a metastore database for that data plane, `<prefix>metastore_db`. It does not need another copy of the control-plane databases. |
| Additional workload namespace on an existing plane | Uses that plane's existing configuration. Adding a namespace does not create another platform database set. |

The control-plane release uses its metastore database even when `defaultDataPlane.enabled` is `false`, because its internal Spark Connect service needs it.

Computes on every data plane also connect to the control-plane database. With activity monitoring on, which is the default in 4.0.1 and 4.0.2 (`features.activityMonitoring.enabled`), every compute writes query activity to `<prefix>sql_db`, whichever data plane it runs on. Computes use the control-plane release's `database.host` value as it is, so that host name must resolve, and the server must accept connections, in every cluster that runs computes.

You can host the required databases on the same PostgreSQL server or on separate servers. Record which release owns each database and which clients use it. Both charts use the prefix `iomete_` by default, so an additional data plane whose metastore database is on the control plane's server needs its own `database.prefix`, such as `analytics_`. Otherwise both releases use `iomete_metastore_db`. Sharing a PostgreSQL server does not itself connect data planes to a control plane.

An additional plane registers with the control plane using its runtime configuration. See [Multi-Cluster Setup](./multi-cluster-setup.mdx) for that relationship.

## Control-Plane Databases

In 4.0.1 and 4.0.2, the control-plane release uses nine databases, each named with its `database.prefix`. With the default prefix, `iomete_`:

| Database | Used by | Holds |
| --- | --- | --- |
| `iomete_core_db` | `iom-core`, `iom-cluster`, `iom-socket` | Platform settings and workload definitions, such as Spark catalogs, data planes, computes, Spark jobs and their runs, Jupyter containers, access tokens and stored secrets. `iom-socket` also relays events through it. |
| `iomete_iam_db` | `iom-identity` | Users, groups, roles, domains, SSO and LDAP settings, and data security policies. |
| `iomete_sql_db` | `iom-sql`, and computes on every data plane | SQL editor metadata, query history and the query activity that computes record. Worksheet content itself is in object storage. |
| `iomete_metastore_db` | `metastore` | The control-plane release's Hive metastore. |
| `iomete_iceberg_db` | `iom-rest-catalog` | The Iceberg catalog, which points to each table's current metadata file. |
| `iomete_catalog_db` | `iom-catalog`, `iom-maintenance` | Data catalog metadata, such as classifications, tags and lineage, and table maintenance runs. |
| `iomete_prefect_db` | `prefect-server` | The Job Orchestrator's Prefect server data. |
| `iomete_mcp_db` | `iom-mcp-server` | MCP server data, when `features.mcpServer.enabled` is on. |
| `iomete_ai_services_db` | `iom-ai-services` | The AI services' model endpoint registry, when `features.aiServices.enabled` is on. |

The initialization job creates all nine when you provide administrator credentials, whether or not the optional features are on. The stored secrets in `iomete_core_db` are encrypted with the key in the `iom-secret-encryption-key` Secret. Back up that Secret with the databases: without it, the stored secrets in a restored database can't be decrypted.

An additional data plane uses a single database, `<prefix>metastore_db`, for its own Hive metastore.

## Provisioning Databases

Use the database names, roles, and initialization requirements for the **chart version you install**. In particular:

- The enterprise initialization job creates the IOMETE role and the control-plane databases when `database.adminCredentials` holds a PostgreSQL administrator account. If you do not provide those credentials, create every database in the [list above](#control-plane-databases) before installation. Grant the IOMETE role all privileges on each database and on its `public` schema.
- An additional data plane's runtime release expects its metastore database to exist; it creates only the schema. With the default prefix `iomete_`, its name is `iomete_metastore_db`; use your actual configured prefix.
- Keep credentials and connection settings in the complete values file or configured Secret for each release. A change to the control plane's values does not update a separate runtime release.
- Allow database connections from every cluster that has a consumer. For the control-plane databases, that includes the cluster of every data plane, because computes connect to them directly. Configure authentication, TLS, and trusted certificates consistently with the clients that connect.

For a test PostgreSQL installation, see [PostgreSQL Deployment](./postgresql-deployment.md). For production, use your organization's managed or administrator-operated PostgreSQL service and its supported backup and availability configuration.

## Planning Capacity {#database-load}

Size the database for the work it performs, rather than the number of Kubernetes namespaces alone.

### IOMETE Internal Metadata

Consider concurrent API operations, job scheduling and run history, SQL activity, catalog operations, and enabled platform features. In 4.0.1 and 4.0.2, activity monitoring is on by default: computes on every data plane record their queries in `<prefix>sql_db`, including query plans (`features.activityMonitoringQueryPlans.enabled`). Additional services, replicas and computes also increase the number of database connections. Plan connection limits across all consumers of a shared server.

### Metadata of Data Lake

Metastore load depends on catalog and table operations, concurrent workloads, and the amount of metadata they access. The table files themselves remain in object storage. A larger object store does not translate directly into an equally large PostgreSQL database.

## Database Resource Requirements

{/* Starting points from the 01/2024 guidance (base revision 327567b2). Awaiting product confirmation for 4.x, where activity monitoring and query plans are on by default. */}

Use these figures as starting points for a first server. They come from earlier IOMETE guidance based on the number of users and predate the activity monitoring and query plan capture that 4.x turns on by default, so confirm them with your own workload:

<span id="small-scale-1-10-users" style={{scrollMarginTop: 'calc(var(--ifm-navbar-height) + 0.5rem)'}}></span>
<span id="medium-scale-10-100-users" style={{scrollMarginTop: 'calc(var(--ifm-navbar-height) + 0.5rem)'}}></span>
<span id="large-scale-100-1000-users" style={{scrollMarginTop: 'calc(var(--ifm-navbar-height) + 0.5rem)'}}></span>

| Scale | CPU | Memory | Disk |
| --- | --- | --- | --- |
| Small, 1 to 10 users | 1 to 2 cores | 4 GB | 20 GB |
| Medium, 10 to 100 users | 4 cores | 16 GB | 50 GB |
| Large, 100 to 1,000 users | 8 cores | 32 GB | 50 GB |

Disk use depends on the number of tables and other metadata, not directly on the amount of data in object storage. Between 20 GB and 100 GB is typically enough. Use SSD or NVMe storage for better database performance.

Before production use, run a representative workload and monitor PostgreSQL CPU, memory, connections, query latency, storage capacity, and disk I/O. Include concurrent work from all data planes that share the server, plus backup and maintenance activity. Provide headroom for growth and retention, and set alerts for capacity and connection limits.

## Backups and Maintenance

Back up every required database and preserve the corresponding roles, grants, connection settings, and the Secrets that hold IOMETE's keys, such as `iom-secret-encryption-key` and `iomete-jwt-signing`. Test restoring them together. A Helm release backup does not contain PostgreSQL data.

Before changing a shared database server, identify all control-plane, data-plane, and external consumers. Follow [Temporary Shutdown for Maintenance](/resources/user-guide/shutdown-for-maintenance) to pause the affected installation, or [Database Migration](/resources/user-guide/k8s/database-migration) to move its databases. Stopping only the control-plane release leaves the computes on other data planes connected to its databases.
