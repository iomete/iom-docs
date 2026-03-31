---
title: Deployment Architecture
sidebar_label: Deployment Architecture
description: Technical reference for IOMETE's Kubernetes deployment topology, complete service inventory, feature flags, and infrastructure configuration.
last_update:
  date: 03/31/2026
  author: Abhishek Pathania
---

This reference describes how IOMETE maps onto Kubernetes: the Helm chart structure, the full service inventory, feature flags, and infrastructure options. For a conceptual overview of each service, see the [Architecture Overview](../getting-started/architecture.md). For installation steps, see the [On-Premises Deployment Guide](./on-prem/install.md).

## Helm Chart Structure

Everything ships as a single Helm chart ([`iomete-data-plane-enterprise`](https://artifacthub.io/packages/helm/iomete/iomete-data-plane-enterprise)), which deploys all platform services into one Kubernetes namespace. Services talk to each other over internal Kubernetes DNS.

### Initialization Job

Before any service starts, a pre-install/pre-upgrade Helm hook job (`iomete-data-plane-init`) bootstraps the environment:

1. Creates PostgreSQL databases for each microservice
2. Creates the Hive Metastore secret
3. Creates the Hadoop configuration secret
4. Creates the Spark ConfigMap
5. Creates the Spark History folder in object storage

:::warning Init Job Failures
This job runs with `backoffLimit: 2`. If it fails, the entire Helm install or upgrade fails. When troubleshooting a failed deployment, check the init job logs first.
:::

### Configuration Distribution

All Helm values (including feature flags) are serialized to YAML and stored in a Kubernetes Secret named `data-plane`. Every backend microservice reads this secret at startup, so a Helm upgrade propagates config changes to all services on their next restart.

## Service Inventory

Knowing which services run (and which are optional) helps you plan resource allocation and troubleshoot startup issues. The table below lists every service the Helm chart deploys. Services tied to a feature flag only appear when that flag is enabled.

| Service | Type | Feature Flag | Notes |
|---|---|---|---|
| iom-gateway | Deployment | Always | Nginx reverse proxy, entry point |
| iom-app | Deployment | Always | Frontend SPA (Nginx) |
| iom-core | Deployment | Always | Platform settings, auth, Spark History proxy |
| iom-cluster | Deployment | Always | Spark resource management |
| iom-identity | Deployment | Always | IAM, Ranger, SSO, domains |
| iom-sql | Deployment | Always | SQL editor backend |
| iom-catalog | Deployment | Always | Data catalog, governance |
| iom-rest-catalog | Deployment | Always | Iceberg REST Catalog |
| iom-health-check | Deployment | Always | Service health monitoring |
| iom-socket | Deployment | Always | WebSocket relay |
| spark-operator-controller | Deployment | Always | Spark CRD controller |
| spark-operator-webhook | Deployment | Always | Admission webhook |
| spark-submit-service | Deployment | Always | Spark app submission |
| spark-connect-driver | SparkApplication | Always | Internal metadata extraction |
| spark-connect-rest | Deployment | Always | REST client for Spark Connect |
| spark-history | Deployment | Always | Spark job history UI |
| metastore | Deployment | Always | Hive Metastore |
| typesense | Deployment | Always | Search engine (20Gi PVC) |
| iom-collab | Deployment | `enableCollaborativeSqlEditor` | Collaborative SQL editing |
| nats | StatefulSet (3 replicas) | `services.nats.enabled` | JetStream messaging |
| iom-event-stream | StatefulSet (2 replicas) | `eventStream` | Event ingestion + Iceberg writer |
| iom-event-stream-proxy | Deployment | `eventStream` | Ingestion request routing |
| prefect-server | Deployment | `jobOrchestrator` | Workflow orchestration |
| prefect-worker | Deployment (per-namespace) | `jobOrchestrator` | Scheduled job execution |
| job-orchestrator-metrics-exporter | Deployment | `jobOrchestrator` | Prometheus metrics |
| iom-maintenance | Deployment | `enableAutomatedMaintenance` | Table compaction |
| iom-ratelimiter | Deployment | `ratelimiter` | Redis-based rate limiting |
| spark-proxy-server | Deployment (per-namespace) | `sparkProxyForArrowFlight` | Arrow Flight proxy |

All Quarkus-based services expose `/health` for liveness and readiness probes. They use a `RollingUpdate` strategy (`maxUnavailable: 0, maxSurge: 1`), so at least one replica stays available during deploys.

## Gateway Routing

Every request into the platform passes through the Gateway (an Nginx reverse proxy), which routes traffic to the correct backend based on URI prefix. The tables below show the complete routing map.

### API Routes

| URI Pattern | Backend Service |
|---|---|
| `/api/v*/domains/*/sql`, `/api/v*/domains/*/git` | iom-sql |
| `/api/v*/health-check` | iom-health-check |
| `/api/v*/admin/compaction`, `/api/v*/domains/*/compaction` | iom-maintenance |
| `/api/v*/domains/*/data-catalog`, `/api/v*/domains/*/data-product`, `/api/v*/domains/*/governance`, `/api/v*/admin/governance` | iom-catalog |
| `/api/v*/authz`, `/api/v*/auth`, `/api/v*/data-planes`, `/api/v*/modules`, `/api/v*/system-config`, `/api/v*/admin/node-types`, `/api/v*/admin/volumes` | iom-core |
| `/api/v*/domains/*/compute`, `/api/v*/domains/*/spark/*`, `/api/v*/domains/*/jupyter-containers`, `/api/v*/domains/*/namespaces`, `/api/v*/domains/*/secrets`, `/api/v*/domains/*/schedules`, `/api/v*/domains/*/event-streams` | iom-cluster |
| `/api/v*/domains/*/roles`, `/api/v*/domains/*/members`, `/api/v*/admin/identity`, `/api/v*/admin/domains`, `/api/v*/users`, `/api/v*/groups`, `/api/v*/bundles`, `/api/v*/identity` | iom-identity |

### Non-API Routes

| URI Pattern | Backend Service | Protocol |
|---|---|---|
| `/` (default), `/domains/*`, `/admin/*` | iom-app | HTTP |
| `/catalogs/` | iom-rest-catalog | HTTP |
| `/socket.io` | iom-socket | WebSocket |
| `/collaboration` | iom-collab | WebSocket (feature-flagged) |
| `/spark-history`, `/spark-ui`, `/monitoring` | iom-core | HTTP |
| `/sso-proxy` | iom-core | HTTP |
| `/service/(plugins\|roles\|xusers\|tags)` | iom-identity | HTTP (Ranger admin API) |

### Dynamic Workload Routes

| URI Pattern | Target | Protocol |
|---|---|---|
| `/data-plane/*/lakehouse/*/...` | `cc-<name>.<ns>:10000` | HTTP (HiveServer2 JDBC) |
| `/spark.connect.*` | `cc-<name>.<ns>:15002` | gRPC (Spark Connect) |
| `/arrow.flight.protocol.FlightService` | `cc-<name>.<ns>:33333` or Spark Proxy | gRPC (Arrow Flight) |
| `/data-plane/*/jupyter/*/...` | `jc-<name>.<ns>:8888` | HTTP + WebSocket |
| `/data-plane/*/event-stream/*/...` | iom-event-stream-proxy | HTTP |

The Gateway supports gRPC for Spark Connect and Arrow Flight, with keepalive enabled and a 24-hour read timeout (`86400s`).

## Node Placement

To keep platform services and Spark workloads on separate hardware, the chart exposes two pairs of node selectors and tolerations:

| Setting | Applied To | Purpose |
|---|---|---|
| `controlPlaneNodeSelector` / `controlPlaneTolerations` | All IOMETE platform services | Isolate control plane on dedicated nodes |
| `dataPlaneNodeSelector` / `dataPlaneTolerations` | Spark workloads (drivers, executors) | Isolate compute on data nodes |

## Multi-Namespace Support

If different teams need separate CPU and memory quotas, you can deploy Spark workloads (drivers and executors) into additional namespaces via the `namespaces` list in `values.yaml`. The data plane's own namespace is always included automatically.

Each extra namespace gets its own copies of:

- Prefect Worker
- Spark Proxy Server (when Arrow Flight proxy is enabled)
- Event Stream pods (when event streams are enabled)

For details, see [Connect Namespace](./connect-namespace.md). For full multi-cluster topology, see [Multi-Cluster Setup](./multi-cluster-setup.mdx).

## Priority Classes

PriorityClasses let Kubernetes preempt lower-priority pods when resources are scarce. When `features.priorityClasses.enabled` is true, Spark workloads are assigned these classes:

| Priority Class | Workload Type |
|---|---|
| `iomete-compute` | Compute clusters |
| `iomete-spark-job` | Spark jobs |
| `iomete-notebook` | Jupyter containers |
| `iomete-operational-support` | Job Orchestrator workers |

## Autoscaling

For services that handle variable load, you can turn on Horizontal Pod Autoscaling (HPA). It's disabled by default and must be enabled per-service in `values.yaml`.

| Service | HPA Support | Notes |
|---|---|---|
| iom-gateway | Yes | Disabled by default |
| iom-core | Yes | Disabled by default |
| iom-cluster | Yes | Disabled by default |
| iom-identity | Yes | Disabled by default |
| iom-catalog | Yes | Disabled by default |
| iom-rest-catalog | Yes | Disabled by default |
| spark-submit-service | Yes | Disabled by default |
| iom-collab | Yes | Memory-based (85%) primary, CPU (80%) secondary |
| iom-event-stream-proxy | Yes | Enabled by default (1-4 replicas, 80% CPU) |
| iom-sql | No | Fixed at 1 replica |

## Feature Flags

Feature flags control what gets deployed and how the platform behaves. They live in `values.yaml` under `features:` and reach every service through the `data-plane` secret.

### Deployment Flags

These flags control whether entire services or subsystems are deployed at all:

| Flag | Services Deployed | Default |
|---|---|---|
| `enableCollaborativeSqlEditor` | iom-collab | `false` |
| `services.nats.enabled` | NATS cluster | `false` |
| `eventStream` | iom-event-stream, iom-event-stream-proxy | `false` |
| `jobOrchestrator` | prefect-server, prefect-worker, metrics-exporter | `false` |
| `sparkProxyForArrowFlight` | spark-proxy-server (per-namespace) | `false` |
| `enableAutomatedMaintenance` | iom-maintenance | `false` |
| `ratelimiter` | iom-ratelimiter | `false` |
| `jupyterContainers` | jupyter-containers ConfigMap | `false` |

### Runtime Behavior Flags

These flags toggle features without adding or removing services:

| Flag | Effect When Enabled | Default |
|---|---|---|
| `arrowFlightConnection` | Arrow Flight connections available for compute clusters | `true` |
| `arrowFlightForDbExplorer` | DB Explorer uses Arrow Flight instead of Spark Connect REST | `false` |
| `activityMonitoring` | Query monitoring and resource tracking | `false` |
| `downloadQueryResults` | SQL query result download in UI | `true` |
| `caseInsensitiveIcebergIdentifiers` | Iceberg table/database names are case-insensitive | `false` |
| `iometeSparkLivenessProbe` | Additional liveness probe on Spark driver pods | `true` |
| `icebergRestCatalogStrictMode` | Database must exist before creating tables | `false` |
| `priorityClasses` | Spark workloads use PriorityClasses | `false` |
| `emailNotifications` | Email notifications available | `true` |
| `sparkJobArchival` | Archival of Spark job history | `false` |
| `onboardComputeRas` | Resource Access Service for compute clusters | `false` |
| `onboardSparkJobRas` | Resource Access Service for Spark jobs | `false` |
| `onboardWorkspaceRas` | Resource Access Service for SQL workspaces | `false` |
| `onboardNamespaceMappingRas` | Namespace-level access control | `false` |
| `domainLevelBundleAuthorization` | Domain-level bundle-based authorization | `false` |
| `secretsV2` | New secrets management system | `false` |
| `dataAccessAudit` | Data access audit logging | `false` |
| `icebergMetrics` | Iceberg table metrics sent to event stream | `true` |
| `scheduling` | SQL scheduling (requires `jobOrchestrator`) | `false` |
| `ldapGroupInheritance` | LDAP group hierarchy inheritance | `true` |
| `identitySoftDelete` | Soft delete for users/groups | `false` |
| `showExecutorLogs` | Executor logs visible in UI | `true` |

:::warning Prerequisite Chain
Don't enable `domainLevelBundleAuthorization` until all four RAS flags are active (`onboardComputeRas`, `onboardSparkJobRas`, `onboardWorkspaceRas`, `onboardNamespaceMappingRas`) and you've run the migration script. Skipping this order breaks authorization.
:::

## Storage Configuration

### Object Storage

All table data, Spark event logs, and SQL results live in object storage, making it the most important infrastructure dependency. Configure the provider and credentials in `values.yaml`.

| Storage Type | Config Key | URI Scheme | Required Settings |
|---|---|---|---|
| MinIO | `minio` | `s3a://` | endpoint, accessKey, secretKey |
| Dell ECS | `dell_ecs` | `s3a://` | endpoint, accessKey, secretKey |
| AWS S3 | `aws_s3` | `s3a://` | IAM role, cloud.region |
| Google Cloud Storage | `gcs` | `gs://` | GCP service account |
| Azure Blob (Gen1) | `azure_gen1` | `wasbs://` | storageAccountName, storageAccountKey |
| Azure Data Lake (Gen2) | `azure_gen2` | `abfs://` | storageAccountName, storageAccountKey |

**Object storage paths**:

| Path | Contents |
|---|---|
| `data/` | Lakehouse table data |
| `iomete-assets/spark-history/` | Spark event logs |
| `iomete-assets/sql-results/` | SQL query results |
| `iomete-assets/sql-editor/worksheets/` | SQL editor worksheet content |
| `ranger/audit` | Ranger audit logs (when HDFS audit is enabled) |

### Database

All services share a single PostgreSQL server. The init job creates databases with a configurable prefix (default: `iomete_`):

- `<prefix>metastore_db` (Hive Metastore)
- `<prefix>ranger_db` (Ranger policies)
- `<prefix>iceberg_db` (Iceberg catalog metadata)
- Per-microservice databases (Core, Cluster, Identity, SQL, Catalog, etc.)
- `<prefix>prefect_db` (Prefect job orchestrator, when enabled)

**Multi-cluster database support**: You can point `clusterDatabase` at a different server than the main `database`. This is handy in multi-region setups where high-volume operations (Kubernetes/Spark data) hit a local database while metadata stays on a global one.

**SSL**: PostgreSQL SSL is optional. When `ssl.enabled` is true, JDBC connections use `sslmode=verify-full`.

## Secret Store

You can choose where IOMETE keeps sensitive values like database passwords and API keys:

| Type | Description |
|---|---|
| `kubernetes` (default) | Kubernetes Secrets |
| `database` | Encrypted in the IOMETE database |
| `vault` | [HashiCorp Vault](https://www.vaultproject.io/) (requires endpoint, path, token) |

## Logging

Depending on your observability stack, you can route logs to one of several backends:

| Source | Description |
|---|---|
| `kubernetes` (default) | Reads logs directly from the Kubernetes API |
| `loki` | [Grafana Loki](https://grafana.com/oss/loki/) (requires host, port) |
| `elasticsearch` | [ElasticSearch](https://www.elastic.co/elasticsearch) (requires endpoint, apiKey, indexPattern) |
| `splunk` | [Splunk Enterprise](https://www.splunk.com/) (requires endpoint, token, indexName) |

**Hot storage**: When `hotStorage.enabled` is true, the platform tries the Kubernetes API first (for recent logs), then falls back to the external backend for older entries.

## Monitoring

If you run [Prometheus](https://prometheus.io/), set `monitoring.enabled` to true. This adds scrape annotations to every service pod. Metrics endpoints differ by framework:

- `/q/metrics` for Quarkus services (Core, Cluster, Identity, SQL, Catalog, REST Catalog)
- `/metrics` for everything else (Spark Operator, Collab)

## TLS and TrustStore

If your environment uses self-signed certificates, mount a Java TrustStore into all services via a Kubernetes Secret. The TrustStore must include both the default public certificates and your custom ones. See [TrustStore Configuration](./truststore.md) for setup details.

## Ingress

The Gateway expects an ingress controller in front of it. When `ingress.httpsEnabled` is true (the default), the Gateway sets the public-facing protocol to HTTPS in forwarded headers. See [Configure Ingress](./configure-ingress.md) for setup instructions.

## OpenAPI Documentation

Every backend service publishes an OpenAPI spec, and the Gateway proxies them all under `/openapi/`:

| Path | Service |
|---|---|
| `/openapi/ui` | Swagger UI (served by Core Service) |
| `/openapi/core` | Core Service |
| `/openapi/cluster` | Cluster Service |
| `/openapi/iam` | Identity Service |
| `/openapi/sql` | SQL Service |
| `/openapi/catalog` | Catalog Service |
| `/openapi/rest-catalog` | Iceberg REST Catalog |

## Cloud Provider Support

IOMETE runs on AWS, Azure, GCP, and on-premises Kubernetes. The main differences between providers are scratch directory paths and zone-aware scheduling:

| Provider | Scratch Directory | Zone-Aware Scheduling |
|---|---|---|
| On-Premises | `/local1` | No |
| AWS | `/local1` | Yes (region + availability zone) |
| Azure | `/mnt` | No |
| GCP | `/mnt/stateful_partition` | No |

Regardless of provider, Spark workload pods include tolerations for dedicated nodes (`k8s.iomete.com/dedicated`) and ARM64 architecture (`kubernetes.io/arch=arm64`).

## Technology Stack

| Component | Technology |
|---|---|
| Backend language | [Kotlin](https://kotlinlang.org/) |
| JVM | [Java](https://openjdk.org/) |
| Backend framework | [Quarkus](https://quarkus.io/) |
| Build system | [Gradle](https://gradle.org/) (Kotlin DSL) |
| Frontend | [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/) |
| UI library | [Ant Design](https://ant.design/) |
| Spark engine | [Apache Spark](https://spark.apache.org/) |
| Table format | [Apache Iceberg](https://iceberg.apache.org/) |
| Hive Metastore | [Apache Hive](https://hive.apache.org/) |
| Spark Operator | [Kubernetes Operator](https://github.com/kubeflow/spark-operator) (Go) |
| Event ingestion | [Rust](https://rust-lang.org) |
| Job orchestration | [Prefect](https://www.prefect.io/) (Python) |
| Messaging | [NATS JetStream](https://nats.io/) |
| Search | [Typesense](https://typesense.org/) |
| Rate limiting | [Redis](https://redis.io/) |
