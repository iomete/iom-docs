---
title: Deployment Architecture
sidebar_label: Deployment Architecture
description: Reference for how the IOMETE control-plane and runtime releases map onto Kubernetes, including services, namespaces, gateway routes, feature flags, storage, and logging.
last_update:
  date: 11/07/2026
  author: Abhishek Pathania
---

Use this reference to see where IOMETE services and workloads run, and which Helm release holds each setting. The [Architecture Overview](../getting-started/architecture.md) explains what the components do, and the [Installation Guide](./on-prem/install.md) walks through an installation.

In the 4.x architecture, one **control plane** provides the console and the shared management services. Each **data plane** runs workloads in one or more Kubernetes namespaces and connects clients to them. You can run several data planes in one Kubernetes cluster or spread them across clusters. A namespace is a place for Kubernetes resources, not another name for a data plane.

## Terms Used in These Guides

The deployment guides use each of these terms with one meaning. The examples describe one fictional installation, which the rest of this page also uses.

| Term | Meaning | Example |
| --- | --- | --- |
| **Control plane** | The console and the shared services: identity, SQL, catalog, workload management, and the registry of data planes. One control plane manages every data plane. | The console at `iomete.example.com` |
| **Data plane** | The services that run workloads in one Kubernetes cluster and connect clients to them: an agent, a gateway, the Spark operator, a Hive metastore, and a Spark History Server. Each data plane has an ID. | `default` and `analytics` |
| **Default data plane** | The data plane that the control-plane release installs next to the control plane. Its ID is `default`. | `default`, in `iomete-system` |
| **Additional data plane** | A data plane installed by its own runtime release, in the control plane's cluster or in another one. It registers with the control plane. | `analytics`, reached at `analytics.example.com` |
| **Control-plane release** | The Helm release of the `iomete-data-plane-enterprise` chart. It installs the control plane and, unless you turn it off, the default data plane. | Release `data-plane` |
| **Runtime release** | The Helm release of the `iomete-lakehouse-runtime` chart. Each one installs one additional data plane. | Release `analytics` |
| **Service namespace** | The namespace that a release installs its services into. Workloads can run there too. | `iomete-system` and `iomete-analytics` |
| **Workload namespace** | A namespace listed in a release's `namespaces` value. Computes, Spark jobs, and Jupyter containers run there. | `finance` and `marketing`, on `analytics` |
| **IOMETE domain** | A group of members, roles, and resources in IOMETE. It isn't a Kubernetes object. | `business` |
| **Namespace assignment** | Letting a domain use a namespace on a data plane, so that its members can create workloads there. | `finance` on `analytics`, assigned to `business` |

## Helm Chart Structure

Each chart is installed as its own Helm release:

| Chart | What It Installs | Release |
| --- | --- | --- |
| `iomete-data-plane-enterprise` | The control plane and, by default, the default data plane | The control-plane release, one per installation |
| `iomete-lakehouse-runtime` | One additional data plane, which registers with an existing control plane | A runtime release in its own service namespace, in the same cluster or in another Kubernetes cluster |

The enterprise chart's name predates the split between the control plane and data planes: installing it doesn't add a lightweight data plane. Additional data planes don't run another console, Identity Service, or SQL Editor backend.

To run all user workloads on additional data planes, set `defaultDataPlane.enabled: false` on the control-plane release. The release still runs its internal Spark Connect service, with the Spark operator and metastore that service needs, because the Database Explorer reads metadata from it. See [Multi-Cluster Setup](./multi-cluster-setup.mdx) before you choose this topology.

### Release Versions

Both charts are published with the same version number for each IOMETE release. Install every runtime release from the same version as the control-plane release, and upgrade all of them when you upgrade IOMETE. The 4.0.1 charts and release notes don't describe support for running a control plane and its data planes on different versions.

Defaults and optional services change between versions, so read the values of the version you deploy, for example:

```bash
helm show values iomete/iomete-lakehouse-runtime --version 4.0.1
```

A data plane that registers with the control plane can still fail to run workloads. After you install or upgrade a data plane, start a compute on it and connect to that compute.

### Initialization Jobs {#initialization-job}

Both charts run a Job as a Helm pre-install and pre-upgrade hook, with `backoffLimit: 2`:

- The control-plane release's `iomete-data-plane-init` Job prepares the platform. It creates the JWT signing key and, when `database.adminCredentials` is set, the PostgreSQL databases and users. It also writes the Hive metastore and Hadoop configuration Secrets and the Spark ConfigMap, creates the Spark History folder in object storage, and moves secrets stored by older releases into the database.
- A runtime release's `init-job` prepares its data plane. It writes the Hadoop configuration and the Spark settings into each of the plane's namespaces and the metastore configuration into its service namespace, and it creates the Spark History folder in object storage. The metastore database must already exist: the runtime release creates its schema, not the database.

If a hook Job fails, Helm stops the install or upgrade. Read the Job's logs in the release's service namespace, for example:

```bash
kubectl logs job/iomete-data-plane-init -n iomete-system
```

The logs show which step failed. Check the Job's access to Kubernetes, the database, and object storage, and then run the Helm command again.

### Configuration Distribution

Each release stores the values it applied in the Secret `iomete-helm-values`, under the key `values.yaml`, in its service namespace. 4.0.1 also writes a copy to a legacy Secret named `data-plane`. Helm rewrites both on every upgrade, so change values with Helm, not by editing these Secrets.

The control-plane services read these values once, when they start. Upgrading to a new IOMETE version restarts them, because their images change. An upgrade that only changes values restarts a service only when a setting it watches changes, such as `database`, `storage`, or `multiCluster`. Other settings, such as `features`, `logging`, and the [Spark pod settings](#node-placement), take effect only after the services that read them restart. After such a `helm upgrade`, restart them:

```bash
kubectl rollout restart -n iomete-system \
  deployment/iom-core deployment/iom-cluster deployment/iom-sql deployment/iom-identity \
  deployment/iom-catalog deployment/iom-rest-catalog deployment/iom-maintenance
kubectl rollout status deployment/iom-cluster -n iomete-system
```

Each Deployment replaces its pods one at a time, and `kubectl rollout status` reports `successfully rolled out` when the new pod is ready. Queries that run on the SQL Editor V1 engine can be lost when `iom-sql` restarts, so choose a quiet time.

Keep each release's values file separate. For example, adding `marketing` to the runtime release `analytics` doesn't change the control-plane release's namespace list. Follow [Adding a Namespace](./connect-namespace.md) for that change.

## Service Inventory

The tables list what each release runs in 4.0.1, using the Kubernetes resource names. Use them to plan capacity and to find a component when you troubleshoot.

### Control-Plane Services

The control-plane release runs these in its service namespace, `iomete-system` in the examples:

| Component | Kubernetes Resource | Role | Installed When |
| --- | --- | --- | --- |
| `iom-gateway` | Deployment | Entry point for the console, the APIs, and the default data plane's compute connections | Always |
| `iom-app` | Deployment | Console web application | Always |
| `iom-core` | Deployment | Platform settings, authentication, the data-plane registry, platform health, and the Spark UI and history proxy | Always |
| `iom-cluster` | Deployment | Computes, Spark jobs, Jupyter containers, event streams, namespaces, and secrets on every data plane | Always |
| `iom-identity` | Deployment | Users, groups, roles, domains, single sign-on, and data-security policies | Always |
| `iom-sql` | Deployment, one replica | SQL Editor and query management | Always |
| `iom-catalog` | Deployment | Data Catalog | Always |
| `typesense` | Deployment with a 20Gi PersistentVolumeClaim, `typesense-binding` | Search index for the Data Catalog | Always |
| `iom-rest-catalog` | Deployment | Iceberg REST Catalog | Always |
| `iom-socket` | Deployment | Live updates to browsers | Always |
| `iom-maintenance` | Deployment | Table maintenance | Always |
| `prefect-server` | Deployment | Job Orchestrator server | Always |
| `iom-spark-connect` | SparkApplication | Internal Spark Connect service that reads catalog metadata for the Database Explorer | Always |
| `iom-spark-connect-rest-client` | Deployment | REST client for the internal Spark Connect service | `services.sparkConnect.restClient.enabled` is `true` (default) |
| `iom-event-stream` | StatefulSet with 2 replicas, each with a 10Gi PersistentVolumeClaim | Receives audit events and Iceberg metrics and writes them to system tables. Audit logging fails without it. | `features.internalEventStream.enabled` is `true` (default) |
| `iom-event-stream-proxy` | Deployment with an autoscaler | Routes requests to event streams | `features.eventStream.enabled` is `true` (default `false`) |
| `iom-ratelimiter` | Deployment | Rate limiting for the Iceberg REST Catalog | `features.ratelimiter.enabled` is `true` (default `false`) |
| `iom-mcp-server` | Deployment | Managed MCP server (beta) | `features.mcpServer.enabled` is `true` (default `false`) |

Typesense and `iom-event-stream` need persistent volumes: 20Gi for Typesense and 10Gi for each `iom-event-stream` replica. Their claims use the cluster's default StorageClass unless you set `services.typesense.persistence.storageClassName` or `services.eventStream.persistence.storageClassName`.

### Data-Plane Services

Every data plane runs these in its service namespace. The control-plane release installs them for the default data plane, and a runtime release installs them for its additional data plane.

| Component | Kubernetes Resource | Role |
| --- | --- | --- |
| `iomete-lakehouse-agent` | Deployment | Registers the data plane, reports its namespaces and health, and carries out Kubernetes operations for the control plane |
| `iom-gateway-dp` on the default data plane, `iom-gateway` in a runtime release | Deployment | Data-plane gateway for compute connections and for calls between the planes |
| `spark-operator` | Deployment, plus a MutatingWebhookConfiguration when `webhook.create` is `true` | Runs Spark applications and adjusts Spark pods when Kubernetes admits them |
| `spark-operator-submit-service` | Deployment | Submits Spark applications |
| `metastore` | Deployment | Hive metastore for `spark_catalog` |
| `spark-history` | Deployment | Spark History Server |
| `prefect-worker-<namespace>` | Deployment in each of the plane's namespaces | Runs Job Orchestrator jobs |
| `spark-proxy-server-<namespace>` | Deployment in each of the plane's namespaces | Arrow Flight proxy. On the default data plane, installed when `features.sparkProxyForArrowFlight.enabled` is `true` (default). |
| `init-job` | Job, run as a Helm hook | Runtime release only; see [Initialization Jobs](#initialization-job) |

Workloads, such as compute drivers and executors, Spark jobs, Jupyter containers, and event stream pods, aren't part of either chart. `iom-cluster` creates them in the namespace selected for them.

### Health Probes and Updates

The Quarkus services `iom-core`, `iom-cluster`, `iom-identity`, `iom-sql`, `iom-catalog`, `iom-rest-catalog`, and `iom-maintenance` use three probes:

| Probe | Path | With the Default Timings |
| --- | --- | --- |
| Startup | `/health` | A service has 120 seconds to start. |
| Liveness | `/q/health/live` | Kubernetes restarts a pod after 60 seconds of failed checks. |
| Readiness | `/q/health/ready`, which includes the service's database connection | Kubernetes stops sending traffic to a pod after 30 seconds of failed checks. |

Setting `services.databaseAwareProbes: false` moves the liveness and readiness probes to `/health`, which always passes while the process runs. The timings are shared by these services and set under `services.probes` on the control-plane release:

```yaml title="services.probes defaults in the 4.0.1 control-plane chart"
services:
  probes:
    liveness:
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 6
    readiness:
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 3
    startup:
      initialDelaySeconds: 5
      periodSeconds: 5
      timeoutSeconds: 5
      failureThreshold: 24
```

If services restart before they finish starting on busy nodes, raise `startup.failureThreshold`. These services update with a rolling strategy that starts one new pod before it stops an old one. Typesense and the Spark operator use the `Recreate` strategy instead, so they're briefly unavailable during an update.

## Gateway Routing

Each release runs an Nginx gateway. The control-plane gateway, `iom-gateway`, is the entry point for the console and the APIs. Each data-plane gateway serves compute connections for its data plane and carries calls between the planes. Put an ingress controller or load balancer in front of each gateway; see [Configure Ingress](./configure-ingress.md).

Two kinds of traffic pass through the gateways: users and clients reaching the console, the APIs, and computes, and calls between the control plane and its data planes. Calls between planes use the `/cross-plane/` path prefix and carry the shared plane trust secret, which the receiving gateway checks.

### API Routes

The control-plane gateway sends each `/api/` request to the service that owns it. The table lists the main path prefixes. In it, `v*` is the API version, such as `v1`, and `*` is one path segment, such as a domain ID.

| Path Prefix | Service |
| --- | --- |
| `/api/v*/domains/*/sql`, `/api/v*/domains/*/git`, `/api/v*/git`, `/api/v*/admin/sql` | `iom-sql` |
| `/api/v*/domains/*/compaction`, `/api/v*/admin/compaction` | `iom-maintenance` |
| `/api/v*/domains/*/data-catalog`, `/api/v*/domains/*/data-product`, `/api/v*/domains/*/governance`, `/api/v*/admin/governance` | `iom-catalog` |
| `/api/v*/auth`, `/api/v*/authz`, `/api/v*/data-planes`, `/api/v*/multi-cluster`, `/api/v*/admin/multi-cluster`, `/api/v*/health-check`, `/api/v*/system-config`, `/api/v*/feature-flags`, `/api/v*/modules`, `/api/v*/node-types`, `/api/v*/volumes`, `/api/v*/domains/*/spark/settings` | `iom-core` |
| `/api/v*/domains/*/compute`, `/api/v*/domains/*/spark/jobs`, `/api/v*/domains/*/spark/streaming`, `/api/v*/domains/*/spark/applications`, `/api/v*/domains/*/jupyter-containers`, `/api/v*/domains/*/event-streams`, `/api/v*/domains/*/namespaces`, `/api/v*/domains/*/secrets`, `/api/v*/domains/*/schedules`, `/api/v*/admin/namespaces`, `/api/v*/admin/docker-registries` | `iom-cluster` |
| `/api/v*/users`, `/api/v*/groups`, `/api/v*/bundles`, `/api/v*/identity`, `/api/v*/domains/*/roles`, `/api/v*/domains/*/members`, `/api/v*/admin/identity`, `/api/v*/admin/domains`, `/api/v*/admin/data-security` | `iom-identity` |

The gateway answers `404` to an `/api/` path that no service owns.

### Non-API Routes

| Path | Service | Protocol |
| --- | --- | --- |
| `/`, `/domains/*`, `/admin/*` | `iom-app`, the console | HTTP |
| `/socket.io` | `iom-socket` | WebSocket |
| `/catalogs/` | `iom-rest-catalog`, the Iceberg REST Catalog | HTTP |
| `/spark-history`, `/spark-ui`, `/monitoring`, `/sso-proxy` | `iom-core` | HTTP |
| `/openapi/` | `iom-core` and the other services; see [OpenAPI Documentation](#openapi-documentation) | HTTP |
| `/healthz` | `iom-core`. Returns `200` when the control plane can serve requests and `503` when it can't, for load balancer health checks. | HTTP |
| `/mcp` | `iom-mcp-server`, when `features.mcpServer.enabled` is `true` | HTTP |
| `/cross-plane/` | Calls from data planes, checked against the plane trust secret | HTTP |

On the public listener, internal paths return `404`: `/internal/`, `/api/internal/`, `/prefect/`, and the Ranger admin paths `/service/plugins`, `/service/roles`, `/service/xusers`, and `/service/tags`, with or without a `/v2` prefix. Data planes reach them only under `/cross-plane/`, with the plane trust secret.

### Dynamic Workload Routes

The control-plane gateway serves these routes for computes in its own cluster, and each data-plane gateway serves them for its data plane. Clients use the host shown in the compute's connection details, such as `analytics.example.com` for a compute on `analytics`. In these paths and headers, `data-plane` and `data_plane` hold the compute's **Kubernetes namespace**, not the data plane ID.

| Path | Target | Protocol |
| --- | --- | --- |
| `/data-plane/<namespace>/lakehouse/<compute>/...` | HiveServer2 on `cc-<compute>.<namespace>:10000` | HTTP, for Hive JDBC and ODBC |
| `/spark.connect.*` | `cc-<compute>.<namespace>:15002`, chosen from the `cluster` and `data_plane` request headers | gRPC, for Spark Connect |
| `/arrow.flight.protocol.FlightService/...` | The namespace's Spark proxy server, `cc-spark-proxy-server.<namespace>:33333`, chosen from the `data_plane` header | gRPC, for Arrow Flight |
| `/data-plane/<namespace>/jupyter/<name>/...` | `jc-<name>.<namespace>:8888` | HTTP and WebSocket |
| `/data-plane/<namespace>/event-stream/<name>` | `iom-event-stream-proxy`, on the control-plane gateway when `features.eventStream.enabled` is `true` | HTTP |

When `features.sparkProxyForArrowFlight.enabled` is `false`, the control-plane gateway sends Arrow Flight traffic to the compute itself, on port `33333`. The ingress in front of a gateway must support HTTP/2 for gRPC and WebSocket upgrades. Clients connect through the gateways, so don't expose Spark driver ports directly. Give each additional data plane a public hostname and configure its ingress; see [Configure Ingress](./configure-ingress.md) and [Multi-Cluster Setup](./multi-cluster-setup.mdx).

With SQL Editor V2, `iom-sql` reaches a compute on an additional data plane through that plane's public host, over gRPC with TLS on port 443. The control plane must be able to reach that host and trust its certificate. In 4.0.1, the default V1 engine connects to computes only through cluster-internal addresses, so it can't query a compute on a data plane in another Kubernetes cluster. To query those computes, turn on [SQL Editor V2](/resources/user-guide/feature-flags/sql-editor-v2).

## Node Placement

Two pairs of settings place pods on nodes, and they come from different releases:

| Setting | Where You Set It | What It Places |
| --- | --- | --- |
| `controlPlaneNodeSelector` / `controlPlaneTolerations` | Each release | The services that release installs, including its Prefect workers and Spark proxy servers in the workload namespaces. On the control-plane release, this also covers the default data plane's services. |
| `dataPlaneNodeSelector` / `dataPlaneTolerations` | The control-plane release only | Workload pods on every data plane: compute and Spark job drivers and executors, Jupyter containers, and event stream pods |

`iom-cluster` adds the control-plane release's `dataPlaneNodeSelector` and `dataPlaneTolerations` to every workload it creates, whichever data plane runs it. The runtime chart has no such settings, so setting them on a runtime release has no effect. Use node labels and taints that exist in every cluster that hosts a data plane: a selector that matches no node in a cluster leaves that plane's workload pods `Pending`. The same applies to `sparkPodAnnotations`, which the control-plane release adds to every Spark driver and executor.

`iom-cluster` reads these settings when it starts; see [Configuration Distribution](#configuration-distribution). New pods get the new placement, and running workloads keep theirs until they restart.

The setting names describe IOMETE roles. They don't require IOMETE services to run on the Kubernetes control-plane nodes.

## Multi-Namespace Support

A release's `namespaces` list adds workload namespaces to its service namespace, which the release manages automatically. For example, the runtime release `analytics` in `iomete-analytics` can use:

```yaml title="Excerpt from analytics values"
namespaces:
  - finance
  - marketing
```

All three namespaces are siblings in Kubernetes. The data plane's services stay in `iomete-analytics`, and computes and jobs run in the namespace selected for them. In each workload namespace, the release also installs a Prefect worker and a Spark proxy server. When `serviceAccount.create` is `true`, it also creates the `lakehouse-service-account` service account and its role there.

Create the namespaces before you add them to a release. Arrange service accounts and RBAC through the chart or an administrator, add the namespaces to the release, and then assign them to an IOMETE domain. To enforce resource budgets, create Kubernetes ResourceQuotas: the `namespaces` list doesn't create quotas, domain assignments, or nodes.

When several IOMETE releases share a cluster, give each release its own service namespace and its own workload namespaces. A namespace must not belong to two releases. The Spark operator's CRDs and admission webhook configurations are cluster-wide objects, so both charts leave `crds.create` and `webhook.create` set to `false`:

- Install the Spark operator CRDs once per cluster, either with `crds.create: true` on the first release or through an administrator.
- Each release needs its own webhook configuration, named after its service namespace by default, such as `spark-operator-iomete-analytics`. Set `webhook.create: true`, or have an administrator create it.

See [Adding a Namespace](./connect-namespace.md) for the procedure and [Namespace Quotas](/resources/user-guide/namespace-quotas#setting-quotas) for resource limits.

## Priority Classes

PriorityClasses influence which pods Kubernetes schedules first and which lower-priority pods it may preempt. Create the PriorityClasses in the cluster, then turn them on with `features.priorityClasses.enabled` on the control-plane release. `priorityClassMappings` maps IOMETE's classes for computes, Spark jobs, Jupyter containers, and supporting pods to your PriorityClass names. Priorities don't replace namespace quotas or node capacity. See [Priority Classes](/resources/user-guide/priority-class/overview).

## Autoscaling

These services accept Horizontal Pod Autoscaler (HPA) settings under `services.<name>.autoscaling`: `gateway`, `core`, `cluster`, `identity`, `dataCatalog`, `restCatalog`, `maintenance`, `jobOrchestrator` (the Prefect server only), and `sparkOperator.submitService`. Autoscaling is off for all of them by default. `iom-sql` always runs one replica.

The event stream proxy's autoscaler is on by default when Event Streams are enabled. It runs 1 to 4 replicas and scales at 80% CPU (`services.eventStreamProxy.autoscaling`).

When you turn on an autoscaler, set the service's CPU and memory requests equal to its limits, or the chart stops the install. Autoscalers also need the Kubernetes resource metrics API and spare node capacity.

Spark executor dynamic allocation and Kubernetes node autoscaling solve different problems from service HPA. See [Scalability](../getting-started/scalability.md) to choose the right layer.

## Feature Flags

Helm feature flags are set on the control-plane release, as `features.<flag>.enabled`, and apply to the whole installation, including every data plane. The runtime chart doesn't read them. For example, to show Event Streams in the console:

```yaml title="Excerpt from data-plane values"
features:
  eventStream:
    enabled: true
```

Apply the change with `helm upgrade` on the control-plane release, then restart the services as described in [Configuration Distribution](#configuration-distribution).

### Deployment Flags

These flags add or remove Kubernetes resources.

| Flag | What It Does | Default | More Information |
| --- | --- | --- | --- |
| `eventStream` | Deploys `iom-event-stream-proxy` and the gateway's event stream route, and shows **Event Streams** in the console. | `false`, and not listed in the values file | [Event Streams](/resources/user-guide/event-stream) |
| `internalEventStream` | Runs the `iom-event-stream` StatefulSet. Without it, writing audit events and Iceberg metrics fails. | `true` | [System Tables](/resources/user-guide/system-tables) |
| `sparkProxyForArrowFlight` | Deploys a Spark proxy server in each namespace of the default data plane and routes Arrow Flight connections through it. Additional data planes always run the proxy. | `true` | [Arrow Flight](/resources/user-guide/driver/arrow-flight-jdbc-driver) |
| `jupyterContainers` | Makes Jupyter containers available. | `true` | [Jupyter Containers](/resources/user-guide/notebook/jupyter-containers) |
| `ratelimiter` | Deploys `iom-ratelimiter` to rate-limit Iceberg REST Catalog requests. | `false` | [Rate Limiting](/resources/user-guide/spark-catalogs/internal#rate-limiting) |
| `mcpServer` | Deploys the managed MCP server (beta) at `/mcp` on the console host. | `false` | [Release notes](./on-prem/release-notes/index.md), under 4.0.0 |

### Behavior Flags {#runtime-behavior-flags}

These flags change how the services behave.

| Flag | What It Does | Default | More Information |
| --- | --- | --- | --- |
| `priorityClasses` | Gives workloads and supporting pods Kubernetes PriorityClasses. Create the PriorityClasses first. | `false` | [Priority Classes](/resources/user-guide/priority-class/overview) |
| `arrowFlightConnection` | Shows Arrow Flight connection details for computes. | `true` | [Arrow Flight](/resources/user-guide/driver/arrow-flight-jdbc-driver) |
| `arrowFlightForDbExplorer` | Makes the Database Explorer load metadata over Arrow Flight instead of the Spark Connect REST client. | `true` | [Database Explorer API Migration](/resources/user-guide/sql-editor/database-explorer-api-migration) |
| `activityMonitoring` | Records queries and their resource usage for Query Monitoring. | `true` | [Query Monitoring](/resources/user-guide/monitoring/query-monitoring) |
| `activityMonitoringQueryPlans` | Captures Spark query plans so that Query Monitoring can show them. | `true` | [Query Monitoring](/resources/user-guide/monitoring/query-monitoring) |
| `activityMonitoringArchival` | Archives older Query Monitoring records to the `activity_monitoring_compute_cluster` system table. | `true` | |
| `sparkJobArchival` | Archives finished Spark job runs and their metrics to the `activity_monitoring_spark_jobs` system table. Old runs are removed from the database only while this is on. | `true` | |
| `downloadQueryResults` | Lets users download query results as CSV files. | `true` | [Query Results](/resources/user-guide/sql-editor/query-results) |
| `showExecutorLogs` | Adds an instance picker to the logs of computes and Spark applications, so users can read executor logs as well as driver logs. | `true` | |
| `caseInsensitiveIcebergIdentifiers` | Treats Iceberg database and table names as case-insensitive. | `false` | [Case-Insensitive Identifiers](/resources/user-guide/spark-catalogs/internal#case-insensitive-identifiers) |
| `preserveIcebergIdentifierCase` | With case-insensitive identifiers on, shows names in the case they were created with. | `true` | [Case-Insensitive Identifiers](/resources/user-guide/spark-catalogs/internal#case-insensitive-identifiers) |
| `enforceUniqueIcebergTableLocations` | Gives each table created without a `LOCATION` its own storage directory. | `true` | [Unique Table Locations](/resources/user-guide/spark-catalogs/internal#unique-table-locations) |
| `icebergRestCatalogStrictMode` | Requires a database to exist before tables are created in it. It doesn't apply to `spark_catalog`. | `false` | |
| `iometeSparkDriverAntiAffinity` | Asks Kubernetes to spread Spark driver pods across nodes where it can. | `false` | |
| `dataAccessAudit` | Writes data access audit events to the `data_access_audit` system table. | `true` | [System Tables](/resources/user-guide/system-tables#data_access_audit) |
| `defaultRangerAuditLog` | Also writes Ranger's own audit log to object storage. It applies only while `dataAccessAudit` is on. | `true` | [System Tables](/resources/user-guide/system-tables#data_access_audit) |
| `icebergMetrics` | Records Iceberg commit and scan reports in system tables. | `true` | [System Tables](/resources/user-guide/system-tables) |
| `identitySoftDelete` | Archives deleted users and groups instead of removing them permanently. | `false` | [Soft-Delete Behavior](/resources/user-guide/ldap-configuration#soft-delete-behavior) |
| `secretsV2` | Turns on Secrets V2. | `true` | [Secrets V2](/resources/user-guide/feature-flags/secrets-v2) |
| `ldapGroupInheritance` | Creates inherited group relationships during LDAP sync when LDAP groups contain other groups. | `true` | [LDAP Group Inheritance](/resources/user-guide/feature-flags/ldap-group-inheritance) |

The values file has other switches that aren't listed here, such as previews and internal fixes. Leave them at their defaults unless a feature's guide tells you to change them.

### Flags in the Console

Some features are switched in the console instead, under **Administration → Feature Flags**, and take effect without a restart. In 4.0.1, these are Secrets V2, LDAP Group Inheritance, and SQL Editor V2 (`sqlEditorV2`). For `secretsV2` and `ldapGroupInheritance`, the Helm value is only the default until an administrator changes the flag in the console. `sqlEditorV2` has no Helm value and stays off until you turn it on. See [Managing Feature Flags](/resources/user-guide/feature-flags/managing-feature-flags).

4.0 also changed some older Helm flags: `jobOrchestrator` and the four `onboard*Ras` flags are always on, and `emailNotifications` and `enableAutomatedMaintenance` were removed. See the 4.0.0 entry in the [release notes](./on-prem/release-notes/index.md).

## Storage Configuration

### Object Storage

Object storage holds table files, Spark event logs, and platform files such as query results and worksheets. Each data plane must be able to reach the storage its workloads use. A shared console doesn't replicate buckets or grant storage credentials across environments.

The enterprise chart supports these storage configuration types:

| Provider | `storage.type` | Settings |
| --- | --- | --- |
| S3-compatible, including Ozone, Dell ECS, and MinIO | `s3_compatible` | `storage.s3CompatibleSettings` endpoint and credentials |
| AWS S3 | `aws_s3` | Bucket, region, and the configured AWS identity |
| Google Cloud Storage | `gcs` | Bucket and GCP identity configuration |
| Azure Blob Storage | `azure_gen1` | `storage.azureSettings` |
| Azure Data Lake Storage Gen2 | `azure_gen2` | `storage.azureSettings` |

From 3.19.1, use `s3_compatible` for S3-compatible storage. The older `minio` and `dell_ecs` types and their `storage.minioSettings` and `storage.dellEcsSettings` blocks are deprecated aliases kept for existing installations.

:::note Storage for Additional Data Planes
Don't assume that an additional data plane supports every provider in the enterprise chart's list. In 4.0.1, a runtime release supports AWS S3 and S3-compatible storage; its `init-job` rejects the GCS and Azure storage types.
:::

Typical storage locations include:

| Location | Contents |
| --- | --- |
| Configured warehouse and table locations | Table data and Iceberg metadata files |
| `iomete-assets/spark-history/` | Spark event logs |
| `iomete-assets/sql-results/` | SQL query results |
| `iomete-assets/sql-editor/worksheets/` | SQL worksheet files |
| `ranger/audit/` | Ranger's own audit log of data access; see `defaultRangerAuditLog` in [Behavior Flags](#runtime-behavior-flags) |

Keep the required credentials available to the correct namespace or workload identity. Use [Storage Configuration](/resources/user-guide/storage-configs) for user-managed storage settings.

### Database

The control-plane release uses PostgreSQL for platform state, including identities, configuration, catalog metadata, SQL metadata, and orchestration. When you set `database.adminCredentials`, its `iomete-data-plane-init` Job creates the databases it needs. Otherwise, provision them yourself; [Backend Databases](./backend-databases.md) covers the requirements.

Each runtime release needs a PostgreSQL database for its Hive metastore, named `<prefix>metastore_db`. It doesn't need the control plane's other databases. Both charts default `database.prefix` to `iomete_`, so if an additional data plane uses the same PostgreSQL server as the control plane, give its runtime release another prefix, such as `analytics_`. Otherwise, both metastores use the database `iomete_metastore_db`.

The `clusterDatabase` setting, which split databases between installations, existed only in 3.16 charts and isn't part of the 4.x architecture. See [Multi-Cluster Setup](./multi-cluster-setup.mdx#multi-cluster-setup-shared-global-database) before you interpret an older values file that uses it.

For PostgreSQL TLS, set `database.ssl.enabled` and `database.ssl.mode` (`verify-full`) together with a `javaTrustStore` that trusts the server's certificate. When `database.host` points to a connection pooler such as PgBouncer, set `database.directHost` and `database.directPort` to PostgreSQL itself: schema migrations need a session-owning connection and use the direct endpoint.

## Secret Store

In 4.x, IOMETE stores application secrets, such as the credentials that computes, jobs, and storage configurations use, in its database. They're encrypted with a key kept in the `iom-secret-encryption-key` Secret in the control-plane release's service namespace. The release generates the key on first install and keeps it on every upgrade; to supply your own, name a Secret in `secretEncryptionKey.existingSecret`. Back up this key together with the database, because IOMETE can't read the stored secrets without it. The older `secretStore` setting is deprecated. See the [Secrets guide](/resources/user-guide/secrets).

Infrastructure credentials are separate: database, registry, storage, and trust Secrets must exist where the chart or the workload expects them. Kubernetes Secrets are namespace-scoped, so a Secret in `iomete-analytics` isn't available in `marketing`. See [Adding a Namespace](./connect-namespace.md) for what a new workload namespace needs.

## Logging

The console shows workload logs, such as a compute's driver and executor logs, through `iom-cluster`. The `logging` settings on the control-plane release choose where it reads them. The runtime chart has only `logging.json`, which, as on the control-plane release, switches the JVM services' own console logs to JSON.

| `logging.source` | Where `iom-cluster` Reads Workload Logs | Settings |
| --- | --- | --- |
| `kubernetes` (default) | The Kubernetes API of the cluster that runs the workload, through that data plane's agent. Logs are gone once their pods are deleted. | None |
| `loki` | [Grafana Loki](https://grafana.com/oss/loki/) | `logging.lokiSettings.host` and `port` |
| `elasticsearch` | [Elasticsearch](https://www.elastic.co/elasticsearch) | `logging.elasticSearchSettings.endpoint` and `indexPattern`, plus `apiKey` if your cluster needs one |
| `splunk` | [Splunk Enterprise](https://www.splunk.com/) | `logging.splunkSettings.endpoint` and `indexName`, plus `token`, a Splunk bearer token |

With `loki`, `elasticsearch`, or `splunk`, the control plane queries that one backend for workloads on every data plane. It looks logs up by Kubernetes namespace, pod, and container, not by data plane. Make sure the backend receives logs, with their Kubernetes metadata, from every cluster that hosts a data plane.

To read recent logs from Kubernetes and older logs from the external backend, turn on hot storage:

```yaml title="Excerpt from data-plane values"
logging:
  source: loki
  lokiSettings:
    host: loki-gateway.logging.svc.cluster.local
    port: "80"
  hotStorage:
    enabled: true
    source: kubernetes
```

With hot storage on, `iom-cluster` first asks the data plane that runs the workload and uses the external backend when that request fails. Log downloads always come from the external backend. `hotStorage.source` must be `kubernetes`, and `logging.source` must be one of the external backends.

`iom-cluster` reads the `logging` settings when it starts; see [Configuration Distribution](#configuration-distribution).

## Monitoring

Collect metrics from the control plane and from each data plane. `monitoring.enabled`, `false` by default in both charts, adds Prometheus scrape annotations to the IOMETE services and the Spark operator. It doesn't install Prometheus, Grafana, or any scrape configuration. Metrics paths differ: the IOMETE services use `/q/metrics`, and the Spark operator uses `/metrics`. Check the rendered resources and your monitoring targets. See [Monitoring](/resources/user-guide/k8s/monitoring).

## TLS and TrustStore

TLS certificates must cover the hostnames that clients and planes actually use. If a private CA signs them, configure trust for every client that connects, including Java services that make remote compute connections. A Java truststore must keep the public root certificates as well as your additional CA certificates. See [TrustStore Configuration](./truststore.md).

## Ingress

Place an ingress controller or load balancer in front of the gateways. Route the console and API traffic, the calls between planes, and the workload protocols you use. The chart's `ingress.httpsEnabled` setting, `true` by default, controls the public scheme that the gateway reports to the services. It doesn't provision a TLS certificate or a listener on port 443. See [Configure Ingress](./configure-ingress.md).

## OpenAPI Documentation

The control-plane gateway serves each service's OpenAPI specification under `/openapi/`: `/openapi/core`, `/openapi/cluster`, `/openapi/iam`, `/openapi/sql`, `/openapi/catalog`, `/openapi/maintenance`, and `/openapi/rest-catalog`. The Swagger UI is at `/openapi/ui`. Use the specifications that your installation serves when you check the available endpoints and request fields.

## Cloud Provider Support

IOMETE runs on on-premises and cloud Kubernetes. Node labels, workload identity, storage endpoints, local scratch volumes, and ingress differ by environment. A data plane in another region needs working network paths to the control plane and to its own data dependencies. Deploying a data plane doesn't set up replication or failover between regions.

When IOMETE first starts, it creates a default host-path [volume](/resources/user-guide/volumes) that points to `/local1` on the node. Computes and Spark jobs that use this volume write Spark scratch data there, so make sure their nodes have enough disk space at that path.

## Technology Stack

| Role | Technology |
| --- | --- |
| Platform APIs | Kotlin and Quarkus on the JVM |
| Data-plane agent | Go |
| Console | React and TypeScript |
| Compute | Apache Spark on Kubernetes |
| Table format | Apache Iceberg |
| Platform databases | PostgreSQL |
| Data-plane catalog and history | Hive metastore and Spark History Server |
| Job orchestration | Prefect |
| Catalog search | Typesense |
| Gateways | Nginx |
