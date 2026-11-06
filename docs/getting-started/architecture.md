---
title: "IOMETE Architecture: Control Plane, Data Planes, Kubernetes"
title_meta: "IOMETE Architecture: Control Plane, Data Planes, Kubernetes"
sidebar_label: Architecture
description: "How IOMETE works on Kubernetes: control plane, data planes, Spark compute, Iceberg storage, catalog and security model, and how the components connect."
last_update:
  date: 11/06/2026
  author: Shashank Chaudhary
---

import DemoCta from '@site/src/components/DemoCta';

IOMETE is a data lakehouse platform built on [Apache Spark](https://spark.apache.org/), [Apache Iceberg](https://iceberg.apache.org/), and [Kubernetes](https://kubernetes.io/). It runs on Kubernetes and stores table data in object storage. From a single console, you can manage compute clusters, run Spark jobs, query data with SQL, browse the data catalog, and enforce security policies.

## High-Level Architecture

IOMETE separates **management**, **execution**, and **storage**. In the 4.x architecture, one control plane manages one or more data planes. A data plane can manage several Kubernetes namespaces, and several data planes can run in the same Kubernetes cluster. You do not need a new cluster for every data plane.

| Component | Responsibility | Example |
| --- | --- | --- |
| **Control plane** | Provides the console, APIs, identity, catalog, and workload management | One console for all your teams and data planes |
| **Data plane** | Runs the services that create, monitor, and connect to workloads in its Kubernetes cluster | `default` for existing workloads, `analytics` for a separate runtime |
| **Kubernetes namespace** | Contains pods and other Kubernetes resources; can have its own quotas and access rules | `finance` and `marketing`, both managed by `analytics` |
| **IOMETE domain** | Organizes members, permissions, and platform resources | A `business` domain assigned namespaces on one or more data planes |
| **Storage** | Holds table data and platform files; PostgreSQL holds platform metadata | Object storage for Iceberg tables, PostgreSQL for configuration |

The default installation includes a control plane and a colocated data plane named `default`. Additional data planes run their own runtime services and register with that control plane. They can be in the same cluster, another data center, or another cloud region.

```mermaid
flowchart TB
  accTitle: One control plane manages multiple data planes
  accDescr: The control plane manages the default data plane and analytics. Data plane analytics manages the finance and marketing namespaces.
  CP["Control plane"] --> Default["Data plane<br/>default"]
  CP --> AnalyticsPlane["Data plane<br/>analytics"]
  AnalyticsPlane --> FinanceNamespace["Namespace<br/>finance"]
  AnalyticsPlane --> MarketingNamespace["Namespace<br/>marketing"]
```

This diagram shows management relationships, not nested Kubernetes namespaces. The control-plane namespace, each runtime's service namespace, and its workload namespaces are peers in Kubernetes. You can place all the components above in one cluster or place the data planes in separate clusters.

For example, a `business` domain can use both `finance` and `marketing` on `analytics`. A compute created in `marketing` runs there; assigning the namespace to the domain does not create another data plane or move existing workloads. See [Multi-Cluster Setup](../deployment/multi-cluster-setup.mdx) for topology choices.

## Platform Services

The control plane's services provide the shared console and management APIs. Data planes provide local runtime services, including an agent, gateway, Spark operator, metastore, and history server. Use compatible control-plane and runtime releases; the presence of separate containers does not imply that any mix of versions is supported.

### IOMETE Gateway

The control-plane [Nginx](https://nginx.org/) gateway routes console and management API requests to the appropriate service. Each data plane also has a gateway for its workload connections and communication with the control plane. Spark Connect and Arrow Flight use gRPC; notebook connections also require WebSocket support. The ingress in front of each gateway must support the protocols you use.

### Core Service

The Core Service owns platform-wide settings and cross-cutting concerns:

- Data plane and system configuration
- Authentication and access tokens
- Authorization checks
- Node type and volume management
- Spark settings
- S3 browser for object storage exploration
- Spark History Server proxy (the Spark History UI is accessible through this service)
- Integration settings (notifications, external services)

### Cluster Service

The Cluster Service manages workload definitions and lifecycle operations across the registered data planes:

- [Compute clusters](/resources/user-guide/compute-clusters/overview): create, start, stop, delete
- [Spark batch and streaming jobs](/resources/user-guide/spark-jobs/creating-spark-job): submission, monitoring, scheduling
- [Jupyter containers](/resources/user-guide/notebook/jupyter-containers): lifecycle management
- [Docker registries](/resources/user-guide/private-docker-registry) and image management
- Namespace and [secrets](/resources/user-guide/secrets) management
- [Event stream](/resources/user-guide/event-stream) definitions

### Data Plane Agent

Each data plane's agent registers it with the control plane, reports its namespaces and runtime health, and forwards Kubernetes events. The control plane uses the agent to perform Kubernetes operations and retrieve workload status and logs in that plane. This is how one console manages workloads across cluster boundaries without installing another full control plane for each runtime.

### Identity Service

Controls who can access the platform and what they're allowed to see or change:

- [User](/resources/user-guide/users) and [group management](/resources/user-guide/groups)
- [Role management](/resources/user-guide/roles) and member assignment
- [LDAP](/resources/user-guide/ldap-configuration), [SAML](/resources/user-guide/single-sign-on/saml), and [OIDC](/resources/user-guide/single-sign-on/oidc) integrations for [single sign-on](/resources/user-guide/single-sign-on)
- Policy management for [data security](/resources/user-guide/data-security/overview) (row-level filtering, [column masking](/resources/user-guide/data-security/data-masking))
- Bundle-based authorization

### SQL Service

Provides the backend for the [SQL Editor](/resources/user-guide/sql-editor/overview), where most day-to-day querying happens:

- SQL [query execution](/resources/user-guide/sql-editor/running-queries) and [result management](/resources/user-guide/sql-editor/query-results)
- [Worksheets](/resources/user-guide/sql-editor/worksheets), [workspaces](/resources/user-guide/sql-editor/workspaces), and folder organization
- [Git integration](/resources/integrations/git/git-integration) for version-controlled SQL
- [Query history](/resources/user-guide/sql-editor/query-history) and monitoring
- [Database explorer](/resources/user-guide/sql-editor/database-explorer) for schema and catalog browsing
- [Dashboards](/resources/user-guide/sql-editor/dashboards)

### Catalog Service

The backend for the [Data Catalog](/resources/user-guide/data-catalog/overview). Teams use it to discover and govern data:

- Full-text [search](/resources/user-guide/data-catalog/search) and browsing (backed by [Typesense](https://typesense.org/))
- [Table metadata](/resources/user-guide/data-catalog/table-details) and descriptions
- [Classification tags](/resources/user-guide/data-catalog/classification-tags) and governance policies
- [Access permissions](/resources/user-guide/data-catalog/access-permissions)

### Iceberg REST Catalog Service

Implements the [Apache Iceberg REST Catalog](https://iceberg.apache.org/rest-catalog-spec/) specification so that compatible engines can access Iceberg table metadata. Catalog authorization and the data-security policies enforced by IOMETE compute work together to control access. The catalog manages metadata; Spark reads and writes table files in object storage.

### Platform Health {#health-check-service}

The Core Service exposes platform health information, including the status reported by each data plane. The console distinguishes control-plane services from data-plane runtimes, so a disconnected plane can be investigated without treating it as a failure of every plane. Health monitoring is part of Core in the 4.x architecture, rather than a separate `iom-health-check` deployment.

## Spark Infrastructure

Spark is the execution engine for Spark computes and jobs. The components below manage how those workloads are created, submitted, and tracked.

### Spark Operator

A Kubernetes operator that manages Spark workloads through three components:

- **Controller**: watches for SparkApplication CRDs and manages the lifecycle of Spark pods
- **Webhook**: applies runtime settings to Spark pods during Kubernetes admission
- **Submit Service**: handles submission of Spark applications to Kubernetes, with configurable parallelization and queueing

### Spark Connect (Internal)

An internal Spark cluster used for metadata extraction and database explorer operations. It isn't user-facing. Instead, it powers features like schema browsing in the SQL Editor and Data Catalog.

### Spark History Server

Reads Spark event logs from object storage and displays job history and performance details. You can access it through the IOMETE Console via the Core Service proxy.

## Workloads

You create computes, Spark jobs, and Jupyter containers through the console or API, choosing a data plane and an assigned namespace. The runtime creates the corresponding Kubernetes resources there. Spark workloads use the Spark operator; supporting services are installed with the runtime chart.

### Compute Clusters

These are SQL-accessible Spark clusters. Each one runs a Spark driver pod that exposes:

- **HiveServer2** (port 10000): [JDBC](/resources/user-guide/driver/hive-jdbc-driver)/ODBC connections from BI tools, [dbt](/resources/integrations/dbt/getting-started-with-iomete-dbt), and other SQL clients
- **Spark Connect** (port 15002): gRPC protocol for programmatic access
- **[Arrow Flight](/resources/user-guide/driver/arrow-flight-jdbc-driver)** (port 33333): high-performance gRPC data transfer (when enabled)

See [Compute Clusters](/resources/user-guide/compute-clusters/overview) for details.

### Spark Jobs

Batch and streaming Spark applications. You can submit Scala or PySpark jobs, schedule them with the [Job Orchestrator](/resources/user-guide/spark-jobs/job-orchestrator), and monitor execution through the console. See [Spark Jobs](/resources/user-guide/spark-jobs/creating-spark-job).

### Jupyter Containers

Dedicated [JupyterLab](https://jupyterlab.readthedocs.io/) environments for interactive data exploration, ETL prototyping, and ML development. Each container runs as a separate pod inside the cluster and is accessible through the Gateway with full WebSocket support. See [Jupyter Containers](/resources/user-guide/notebook/jupyter-containers).

### Event Streams

Real-time data ingestion endpoints powered by Papyrus, a Rust-based ingestion engine. Each event stream receives HTTP POST requests and writes data to Iceberg tables. This is an optional feature that an administrator must enable. See [Event Streams](/resources/user-guide/event-stream).

## Security Architecture

IOMETE handles security at multiple layers. Authentication confirms your identity, authorization decides what you can do, and data security policies control which rows and columns you can see.

### Authentication

The Identity Service handles authentication directly and supports three modes:

- **Built-in authentication**: username/password with secure token management
- **[LDAP integration](/resources/user-guide/ldap-configuration)**: connects to your existing directory service
- **SSO via [SAML](/resources/user-guide/single-sign-on/saml) or [OIDC](/resources/user-guide/single-sign-on/oidc)**: integrates with your organization's identity provider

The login flow follows a redirect-based OIDC pattern: the console redirects to the Identity Service, which issues tokens after successful login.

### Authorization

Authorization operates at three levels:

1. **Platform and domain roles** determine which administrative and domain operations you can perform.
2. **Data security policies**, managed through the Identity Service, define table permissions, row filters, and column masking for supported access paths.
3. **Resource Access Service (RAS)** assigns permissions such as VIEW, UPDATE, and MANAGE to resources including compute clusters, Spark jobs, workspaces, and namespace assignments.

See [Data Security](/resources/user-guide/data-security/overview), [Roles](/resources/user-guide/roles), and [Resource Access Service](/resources/user-guide/ras/resource-bundles) for details on configuring security policies.

## Storage and Data Layer

Table files, Spark event logs, and platform files such as SQL results and worksheets use object storage. Configuration, identities, workload records, and catalog metadata use PostgreSQL. Adding compute does not require copying the table data into each compute cluster.

### Object Storage

IOMETE supports multiple storage backends. The URI scheme depends on the provider:

| Storage Provider                                                                                       | URI Scheme |
| ------------------------------------------------------------------------------------------------------ | ---------- |
| [Apache Ozone](https://ozone.apache.org/)                                                              | `s3a://`   |
| [Dell ECS](https://www.dell.com/en-us/dt/storage/ecs/index.htm)                                        | `s3a://`   |
| [MinIO](https://min.io/)                                                                               | `s3a://`   |
| [AWS S3](https://aws.amazon.com/s3/)                                                                   | `s3a://`   |
| [Google Cloud Storage](https://cloud.google.com/storage)                                               | `gs://`    |
| [Azure Blob Storage (Gen1)](https://azure.microsoft.com/en-us/products/storage/blobs)                  | `wasbs://` |
| [Azure Data Lake Storage (Gen2)](https://azure.microsoft.com/en-us/products/storage/data-lake-storage) | `abfs://`  |

### Database

The control plane uses [PostgreSQL](https://www.postgresql.org/) databases for its services. You can provide administrator credentials for database initialization or provision the databases yourself. An additional runtime also needs a database for its Hive metastore; it does not need a second copy of all control-plane databases. PostgreSQL can be external to Kubernetes. See [Backend Databases](../deployment/backend-databases.md) for provisioning details.

## Real-Time Communication

The Socket Service pushes events such as workload status changes to the console. Data-plane agents send runtime events to the control plane, which keeps the shared view up to date. A browser refresh or a connected agent alone is not a workload health check: verify the compute's status and execute a query when checking an end-to-end connection.

## Job Orchestration

If you need scheduled, dependency-aware Spark job execution, the Job Orchestrator (powered by [Prefect](https://www.prefect.io/)) adds workflow scheduling:

- **Prefect Server**: orchestration engine that manages workflow state
- **Prefect Worker**: runs scheduled Spark jobs (deployed per-namespace)

See [Job Orchestrator](/resources/user-guide/spark-jobs/job-orchestrator) for configuration details.

## Deployment Architecture

Understanding the deployment topology helps you plan infrastructure, estimate resource needs, and configure the Helm chart for your environment.

For chart roles, service placement, namespace configuration, and network requirements, see [Deployment Architecture](../deployment/architecture-deployment.md). The [Scalability](./scalability.md) guide explains when to add executors, nodes, namespaces, or data planes.

For step-by-step installation instructions, see the [On-Premises Deployment Guide](../deployment/on-prem/install).

<DemoCta variant="B" page="architecture" position="end" />
