---
title: Deployment Architecture
sidebar_label: Deployment Architecture
description: How IOMETE control-plane and runtime charts map onto Kubernetes, including service placement, workload namespaces, storage, and network connections.
last_update:
  date: 11/05/2026
  author: Abhishek Pathania
---

Use this reference to decide where IOMETE services and workloads run. The [Architecture Overview](../getting-started/architecture.md) explains the components; the [Installation Guide](./on-prem/install.md) provides the installation steps.

In the 4.x architecture, one **control plane** provides the console and shared management services. Each **data plane** provides a runtime that manages workloads in one or more Kubernetes namespaces. You can run several data planes in one Kubernetes cluster or distribute them across clusters. A namespace is a location for resources, not another name for a data plane.

## Helm Chart Structure

Two charts have different roles:

| Chart | What It Installs | Where You Use It |
| --- | --- | --- |
| `iomete-data-plane-enterprise` | The control plane and, by default, a colocated data plane named `default` | The main IOMETE installation |
| `iomete-lakehouse-runtime` | An additional data plane's runtime services, which register with an existing control plane | A separate service namespace in the same cluster, or another Kubernetes cluster |

The enterprise chart's name predates this separation: installing it is not the same as adding a lightweight runtime. Additional data planes do not need another console, Identity Service, or SQL Editor backend.

The enterprise chart supports `defaultDataPlane.enabled: false` when all user workloads should run on separately installed data planes. This does not remove every Spark-related component from the control-plane installation: its internal Spark Connect metadata service still needs supporting infrastructure. See [Multi-Cluster Setup](./multi-cluster-setup.mdx) before choosing this topology.

Use compatible control-plane and runtime releases, and inspect the values supplied with the **version you deploy**. Defaults and optional services can change between releases. A successful agent registration is not a substitute for testing a workload connection.

### Initialization Job

Both charts run a pre-install/pre-upgrade hook:

- The enterprise chart's `iomete-data-plane-init` prepares platform configuration and database schemas. It can create the PostgreSQL databases when administrator credentials are provided; otherwise, provision the required databases first.
- The runtime chart's `init-job` prepares that plane's Hadoop, metastore, Spark, and history-storage configuration. Its metastore database must already exist; this job does not provision the full control-plane database set.

If a hook fails, Helm does not finish the installation or upgrade. Inspect the failed Job and its pod logs in the **release namespace**. Check its access to Kubernetes, the configured database, and storage before retrying.

### Configuration Distribution

The chart supplies Helm settings to the services through Kubernetes Secrets, ConfigMaps, and environment variables. Several settings are read at process startup. Updating a values file alone changes nothing; apply it with Helm and wait for the affected services to roll out before verifying the new behavior.

Keep the values file for each release separate. For example, adding `dp2-batch` to the runtime release `dp-2` does not update the enterprise release's namespace list. Follow [Adding a Namespace](./connect-namespace.md) for that operation, including upgrades where a restart is needed.

## Service Inventory

The table groups the main services by responsibility. It is a placement guide, not a promise that every optional feature is installed in every release.

| Responsibility | Main Components | Placement |
| --- | --- | --- |
| Console and management API routing | `iom-app`, control-plane `iom-gateway` | Control-plane release |
| Platform configuration and data-plane registry | `iom-core` | Control-plane release; includes platform health APIs |
| Workload definitions and lifecycle management | `iom-cluster` | Control-plane release; calls the selected data plane |
| Users, domains, roles, and data-security policies | `iom-identity` | Control-plane release |
| SQL Editor and query management | `iom-sql` | Control-plane release; connects to computes on their data planes |
| Data discovery and Iceberg catalog APIs | `iom-catalog`, `iom-rest-catalog`, Typesense | Control-plane release |
| Status updates to browsers | `iom-socket` | Control-plane release |
| Job orchestration and table maintenance | Prefect server, `iom-maintenance` | Control-plane release |
| Local Kubernetes operations and status reporting | `iomete-lakehouse-agent` | Each data plane's service namespace |
| Workload and plane-to-plane connections | Data-plane gateway | Each data plane's service namespace |
| Spark application lifecycle | Spark operator, webhook, submit service | Runtime infrastructure; watches the plane's configured namespaces |
| Table metadata and Spark history | Hive metastore, Spark History Server | Runtime infrastructure |
| Workload support | Prefect worker, Spark proxy where enabled | Managed namespaces, according to chart configuration |
| User workloads | Compute drivers/executors, Spark jobs, Jupyter pods | The selected workload namespace |

The control plane also runs an internal Spark Connect service for metadata operations. Optional modules such as event ingestion, AI services, and the MCP server depend on the selected release and enabled features; consult that chart's values and the feature's own guide.

Most HTTP services use Kubernetes Deployments and internal Services. Other resources include StatefulSets, Jobs, Spark custom resources, and persistent volumes. Use each component's readiness status rather than assuming that every component has the same probe path or update strategy.

## Gateway Routing

There are two kinds of traffic to plan for: users accessing the platform or their computes, and the control plane communicating with runtime agents. Their routes and trust requirements differ.

### API Routes

Console management requests enter the control-plane gateway. It routes SQL Editor requests to `iom-sql`, compute lifecycle requests to `iom-cluster`, identity requests to `iom-identity`, and platform/data-plane administration and health requests to `iom-core`.

A management request can then trigger a call from the control plane to the selected data plane's agent. That agent performs the Kubernetes operation locally and reports the resulting state back. The central API does not require a separate full control-plane installation in each workload cluster.

### Non-API Routes

The control-plane gateway also serves console assets and WebSocket connections. Catalog clients use the Iceberg REST Catalog endpoint. Spark UI and history links are reached through authenticated platform routes, while notebook access requires HTTP and WebSocket forwarding to the selected workload.

### Dynamic Workload Routes

Compute connections reach the data plane hosting the compute. The gateway supports the protocols used by the selected Spark image and client:

| Connection | Protocol | Ingress Requirement |
| --- | --- | --- |
| Hive JDBC / ODBC endpoint | HTTP transport for HiveServer2 | Route the compute connection path |
| Spark Connect | gRPC | HTTP/2 support |
| Arrow Flight | gRPC | HTTP/2 support; TLS for remote-plane SQL connections |
| Jupyter | HTTP and WebSocket | WebSocket upgrade support |

Use the connection details shown for the compute. Internal Spark driver ports are not instructions to expose those pods directly. Give each additional data plane a reachable public hostname and configure its ingress for the required protocols. See [Configure Ingress](./configure-ingress.md) and [Multi-Cluster Setup](./multi-cluster-setup.mdx#configuration).

## Node Placement

The chart separates service placement from Spark workload placement:

| Setting | What It Controls |
| --- | --- |
| `controlPlaneNodeSelector` / `controlPlaneTolerations` | Placement of services installed by the chart, including supporting services in a runtime-only release |
| `dataPlaneNodeSelector` / `dataPlaneTolerations` | Placement of Spark drivers and executors |

These names describe IOMETE roles; they do not require placing IOMETE services on Kubernetes control-plane nodes. Use selectors and tolerations with your actual node labels and taints. A selector with no matching nodes leaves pods Pending.

## Multi-Namespace Support

A data plane's `namespaces` list adds workload namespaces to the release's own service namespace, which is managed automatically. For example, a runtime installed as release `dp-2` in `iomete-dp-2` can use:

```yaml title="Excerpt from dp-2 values"
namespaces:
  - dp2-analytics
  - dp2-batch
```

All three namespaces are siblings in Kubernetes. The runtime services remain in `iomete-dp-2`; computes and jobs can run in the selected workload namespace. Supporting resources are also installed in the managed namespaces as required.

Create the namespaces, arrange service accounts and RBAC through the chart or an administrator, configure the runtime to manage them, then assign them to an IOMETE domain. Configure Kubernetes ResourceQuotas to enforce resource budgets. The namespace list alone does not create quotas, domain assignments, or extra nodes.

When multiple IOMETE releases share a cluster, give them separate service namespaces and non-overlapping workload namespaces. Spark operator watchers and admission webhooks must be scoped accordingly. Kubernetes custom resource definitions are cluster-wide, so their installation and version must also be coordinated between releases.

See [Adding a Namespace](./connect-namespace.md) for the procedure and [Namespace Quotas](/resources/user-guide/namespace-quotas#setting-quotas) for resource limits.

## Priority Classes

PriorityClasses influence which pods Kubernetes schedules first and which lower-priority pods it may preempt. Where enabled, the chart maps compute, Spark job, notebook, and orchestration workloads to priority classes. Inspect the priority-class settings and mappings for your release before using them. Priorities do not replace namespace quotas or sufficient node capacity.

## Autoscaling

Some services expose HPA settings under `services.<service>.autoscaling`. Use them with Kubernetes metrics and adequate resource requests; do not assume that all services can scale in the same way. For example, the current enterprise chart keeps `iom-sql` at one replica.

Spark executor dynamic allocation and Kubernetes node autoscaling solve different problems from service HPA. See [Scalability](../getting-started/scalability.md) for choosing the appropriate layer.

## Feature Flags

Use the values file shipped with your chart version and the relevant feature guide. Internal rollout flags and migration switches are not a stable deployment interface, and lists copied from an older release can be misleading.

### Deployment Flags

An optional module can require additional services, storage, permissions, or network routes. Review those prerequisites before enabling it. Do not copy an old list of default booleans into a new installation.

### Runtime Behavior Flags

Some settings change behavior inside existing services and do not add Kubernetes resources. Apply the documented upgrade or migration procedure for the feature; do not infer an authorization migration from a flag name.

## Storage Configuration

### Object Storage

Object storage holds table files, Spark event logs, and platform files such as query results and worksheets. Each plane must be able to reach the storage its workloads use. A shared console does not replicate buckets or grant storage credentials across environments.

The enterprise chart supports these storage configuration types:

| Provider | `storage.type` | Settings |
| --- | --- | --- |
| S3-compatible, including Ozone, Dell ECS, and MinIO | `s3_compatible` | `storage.s3CompatibleSettings` endpoint and credentials |
| AWS S3 | `aws_s3` | Bucket, region, and the configured AWS identity |
| Google Cloud Storage | `gcs` | Bucket and GCP identity configuration |
| Azure Blob Storage | `azure_gen1` | `storage.azureSettings` |
| Azure Data Lake Storage Gen2 | `azure_gen2` | `storage.azureSettings` |

From 3.19.1, use `s3_compatible` for S3-compatible storage. The older `minio` / `dell_ecs` types and their `storage.minioSettings` / `storage.dellEcsSettings` blocks are deprecated aliases retained for existing installations.

:::note Additional Runtime Storage
Do not infer additional-runtime support from the enterprise chart's provider list. The 4.0.1 lakehouse runtime initialization supports AWS S3 and S3-compatible storage; its initializer rejects GCS and Azure storage types. Check the runtime version's supported providers before choosing storage for an additional plane.
:::

Typical storage locations include:

| Location | Contents |
| --- | --- |
| Configured warehouse and table locations | Table data and Iceberg metadata files |
| `iomete-assets/spark-history/` | Spark event logs |
| `iomete-assets/sql-results/` | SQL query results |
| `iomete-assets/sql-editor/worksheets/` | SQL worksheet files |

Keep the required credentials available to the correct namespace or workload identity. Use [Storage Configuration](/resources/user-guide/storage-configs) for user-managed storage settings.

### Database

The control-plane installation uses PostgreSQL for platform state, including identities, configuration, catalog metadata, SQL metadata, and orchestration. The enterprise chart can initialize the required databases when given administrator credentials. Otherwise, provision them as described in [Backend Databases](./backend-databases.md).

Each additional runtime also needs its metastore database. You may host these databases on suitable shared PostgreSQL infrastructure or separate servers, but choose database names, ownership, and access deliberately. The runtime does not require direct access to every control-plane database to enroll.

The legacy `clusterDatabase` split is not the 4.x multi-data-plane mechanism. See [Legacy Shared-Database Installations](./multi-cluster-setup.mdx#multi-cluster-setup-shared-global-database) before interpreting older values files.

For PostgreSQL TLS, configure the chart's database SSL settings and certificate trust together. When using a transaction pooler such as PgBouncer, releases that expose `database.directHost` / `database.directPort` use those direct endpoints for operations requiring a session-owning connection, including migrations. Verify these options against the deployed chart version.

## Secret Store

IOMETE manages application secrets separately from Kubernetes infrastructure credentials. Database, registry, storage, and trust Secrets must be available where the relevant chart or workload expects them. Kubernetes Secrets are namespace-scoped: a Secret in `iomete-system` is not automatically available in `dp2-batch`.

Use the [Secrets guide](/resources/user-guide/secrets) for application secrets and [Adding a Namespace](./connect-namespace.md) for which infrastructure resources a new workload namespace needs. Do not use a historical secret-store backend table as a migration procedure.

## Logging

Workload logs are retrieved from the data plane that hosts the workload. The configured logging backend determines whether older logs remain available after pods disappear. When using an external backend such as Loki, Elasticsearch, or Splunk, verify its connectivity, retention, and credentials for each environment.

## Monitoring

Set up metrics collection for both control-plane services and data-plane runtimes. The chart's `monitoring` settings add component-specific annotations; they do not install a Prometheus server. Metrics and health endpoint paths differ across services. Check the rendered resources and your monitoring targets rather than assuming that every service exposes `/q/metrics`.

## TLS and TrustStore

TLS certificates must cover the hostnames clients and planes actually use. If a private CA signs them, configure trust for all relevant clients, including Java services making remote compute connections. A Java truststore should retain the public roots as well as your additional CA certificates. See [TrustStore Configuration](./truststore.md).

## Ingress

Place an ingress controller or load balancer in front of the gateways. Configure console/API HTTP routes, plane-to-plane routes, and workload protocols as needed. The chart's `ingress.httpsEnabled` setting controls the forwarded public scheme; it does not provision a TLS certificate or a listener on port 443. See [Configure Ingress](./configure-ingress.md).

## OpenAPI Documentation

The control-plane gateway exposes service specifications under `/openapi/`, including `/openapi/core`, `/openapi/cluster`, `/openapi/iam`, `/openapi/sql`, `/openapi/catalog`, and `/openapi/rest-catalog`. The Swagger UI is at `/openapi/ui`. Use the specifications served by your installation when checking available endpoints and request fields.

## Cloud Provider Support

IOMETE runs on on-premises and cloud Kubernetes. Node labels, workload identity, storage endpoints, local scratch volumes, and ingress differ by environment. A data plane in another region needs working network paths to the control plane and its own data dependencies. Deploying a plane does not configure inter-region replication or failover.

## Technology Stack

| Role | Technology |
| --- | --- |
| Platform APIs | Kotlin / Quarkus on the JVM |
| Data-plane agent | Go |
| Console | React and TypeScript |
| Compute | Apache Spark on Kubernetes |
| Table format | Apache Iceberg |
| Platform databases | PostgreSQL |
| Runtime catalog and history | Hive metastore and Spark History Server |
| Job orchestration | Prefect |
| Catalog search | Typesense |
| Gateways | Nginx |
