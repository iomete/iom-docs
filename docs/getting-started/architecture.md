---
title: Architecture Overview
sidebar_label: Architecture
description: Understand IOMETE's microservices architecture, Spark infrastructure, security model, and how all components work together on Kubernetes.
last_update:
  date: 03/31/2026
  author: Abhishek Pathania
---

import Img from '@site/src/components/Img';

IOMETE is a Data Lakehouse Platform for AI and Analytics built on [Apache Spark](https://spark.apache.org/), [Apache Iceberg](https://iceberg.apache.org/), and [Kubernetes](https://kubernetes.io/). It deploys as a [Helm](https://helm.sh/) chart into a Kubernetes cluster and uses object storage ([AWS S3](https://aws.amazon.com/s3/), [Google Cloud Storage](https://cloud.google.com/storage), [Azure Blob/ADLS](https://azure.microsoft.com/en-us/products/storage/blobs), [MinIO](https://min.io/), [Dell ECS](https://www.dell.com/en-us/dt/storage/ecs/index.htm)) as its data layer. From a single console, you can manage compute clusters, run Spark jobs, query data with SQL, browse the data catalog, and enforce security policies.

<Img src="/img/getting-started/iomete-high-level-overview.png" alt="IOMETE Architecture High-Level Overview"/>

## High-Level Architecture

Knowing the overall layout makes it easier to reason about where data lives, how services talk to each other, and what you can scale independently. IOMETE runs on Kubernetes (any cloud provider or on-premises data center), stores data in object storage, and keeps metadata in [PostgreSQL](https://www.postgresql.org/). All platform services live inside a single Kubernetes namespace, with optional multi-namespace support for Spark workloads.

The architecture breaks into three tiers:

1. **Infrastructure layer**: Kubernetes cluster and object storage
2. **Platform services**: Microservices that manage metadata, security, catalog, SQL, and orchestration
3. **Workloads**: Spark-based compute (clusters, jobs, notebooks, event streams) that you create on demand

<Img src="/img/getting-started/architecture/IOMETE Architecture z100.png" alt="IOMETE Architecture z100"/>

## Platform Services

The IOMETE Console is backed by a set of microservices, each responsible for a specific domain. Because they're independent, you can update and scale them separately. All of them run as containerized Kubernetes Deployments exposed through ClusterIP Services.

### IOMETE Gateway

All traffic enters the platform through a single [Nginx](https://nginx.org/) reverse proxy. API calls, UI assets, Spark Connect, Arrow Flight, and WebSocket connections all flow through the Gateway, which routes each request to the right backend service based on URI pattern. The Gateway also proxies gRPC for Spark Connect and Arrow Flight, so BI tools and data applications can reach compute clusters directly.

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

This is the largest service by API surface because it manages every Spark-based resource:

- [Compute clusters](/user-guide/compute-clusters/overview): create, start, stop, delete
- [Spark batch and streaming jobs](/user-guide/spark-jobs/creating-spark-job): submission, monitoring, scheduling
- [Jupyter containers](/user-guide/notebook/jupyter-containers): lifecycle management
- [Docker registries](/user-guide/private-docker-registry) and image management
- Namespace and [secrets](/user-guide/secrets) management
- [Event stream](/user-guide/event-stream) definitions

### Identity Service

Controls who can access the platform and what they're allowed to see or change:

- [User](/user-guide/users) and [group management](/user-guide/groups)
- [Role management](/user-guide/roles) and member assignment
- [LDAP](/user-guide/ldap-configuration), [SAML](/user-guide/single-sign-on/saml), and [OIDC](/user-guide/single-sign-on/oidc) integrations for [single sign-on](/user-guide/single-sign-on)
- Apache Ranger policy management for [data security](/user-guide/data-security/overview) (row-level filtering, [column masking](/user-guide/data-security/data-masking))
- Bundle-based authorization

### SQL Service

Provides the backend for the [SQL Editor](/user-guide/sql-editor/overview), where most day-to-day querying happens:

- SQL [query execution](/user-guide/sql-editor/running-queries) and [result management](/user-guide/sql-editor/query-results)
- [Worksheets](/user-guide/sql-editor/worksheets), [workspaces](/user-guide/sql-editor/workspaces), and folder organization
- [Git integration](/integrations/git/git-integration) for version-controlled SQL
- [Query history](/user-guide/sql-editor/query-history) and monitoring
- [Database explorer](/user-guide/sql-editor/database-explorer) for schema and catalog browsing
- [Dashboards](/user-guide/sql-editor/dashboards) and [scheduling](/user-guide/sql-editor/scheduling)

### Catalog Service

The backend for the [Data Catalog](/user-guide/data-catalog/overview). Teams use it to discover and govern data:

- Full-text [search](/user-guide/data-catalog/search) and browsing (backed by [Typesense](https://typesense.org/))
- [Table metadata](/user-guide/data-catalog/table-details) and descriptions
- [Classification tags](/user-guide/data-catalog/classification-tags) and governance policies
- [Access permissions](/user-guide/data-catalog/access-permissions)

### Iceberg REST Catalog Service

Implements the [Apache Iceberg REST Catalog](https://iceberg.apache.org/concepts/catalog/#rest-catalog) specification so that external tools and Spark engines can access Iceberg table metadata. Every data request passes through [Apache Ranger](https://ranger.apache.org/) policy enforcement, so access control stays consistent no matter how data is queried.

### Health Check Service

Monitors all platform services and reports their status through the API. Checks run every 10 seconds, the service retains 48 hours of history, and status changes push to the console in real time.

## Spark Infrastructure

Spark is the execution engine behind every query and job in IOMETE. The components below manage how Spark workloads get created, submitted, and tracked.

### Spark Operator

A Kubernetes operator that manages Spark workloads through three components:

- **Controller**: watches for SparkApplication CRDs and manages the lifecycle of Spark pods
- **Webhook**: validates and mutates SparkApplication resources on submission
- **Submit Service**: handles submission of Spark applications to Kubernetes, with configurable parallelization and queueing

### Spark Connect (Internal)

An internal Spark cluster used for metadata extraction and database explorer operations. It isn't user-facing. Instead, it powers features like schema browsing in the SQL Editor and Data Catalog.

### Spark History Server

Reads Spark event logs from object storage and displays job history and performance details. You can access it through the IOMETE Console via the Core Service proxy.

## Workloads

Unlike platform services, workloads don't ship with the Helm chart. The Spark Operator creates them dynamically when you provision resources through the Console or API.

### Compute Clusters

These are SQL-accessible Spark clusters. Each one runs a Spark driver pod that exposes:

- **HiveServer2** (port 10000): [JDBC](/user-guide/driver/jdbc-driver)/ODBC connections from BI tools, [dbt](/integrations/dbt/getting-started-with-iomete-dbt), and other SQL clients
- **Spark Connect** (port 15002): gRPC protocol for programmatic access
- **[Arrow Flight](/user-guide/driver/arrow-flight-jdbc-driver)** (port 33333): high-performance gRPC data transfer (when enabled)

See [Compute Clusters](/user-guide/compute-clusters/overview) for details.

### Spark Jobs

Batch and streaming Spark applications. You can submit Scala or PySpark jobs, schedule them with the [Job Orchestrator](/user-guide/spark-jobs/job-orchestrator), and monitor execution through the console. See [Spark Jobs](/user-guide/spark-jobs/creating-spark-job).

### Jupyter Containers

Dedicated [JupyterLab](https://jupyterlab.readthedocs.io/) environments for interactive data exploration, ETL prototyping, and ML development. Each container runs as a separate pod inside the cluster and is accessible through the Gateway with full WebSocket support. See [Jupyter Containers](/user-guide/notebook/jupyter-containers).

### Event Streams

Real-time data ingestion endpoints powered by Papyrus, a Rust-based ingestion engine. Each event stream receives HTTP POST requests and writes data to Iceberg tables. This is an optional feature that an administrator must enable. See [Event Streams](/user-guide/event-stream).

## Security Architecture

IOMETE handles security at multiple layers. Authentication confirms your identity, authorization decides what you can do, and [Apache Ranger](https://ranger.apache.org/) policies control which rows and columns you can see.

### Authentication

The Identity Service handles authentication directly and supports three modes:

- **Built-in authentication**: username/password with secure token management
- **[LDAP integration](/user-guide/ldap-configuration)**: connects to your existing directory service
- **SSO via [SAML](/user-guide/single-sign-on/saml) or [OIDC](/user-guide/single-sign-on/oidc)**: integrates with your organization's identity provider

The login flow follows a redirect-based OIDC pattern: the console redirects to the Identity Service, which issues tokens after successful login.

### Authorization

Authorization operates at three levels:

1. **Platform-level**: The Core Service checks whether you can perform platform operations like creating compute clusters or managing settings.
2. **Data-level ([Apache Ranger](https://ranger.apache.org/))**: The Iceberg REST Catalog enforces Ranger policies on every data access request. Ranger policies are managed through the Identity Service and control row-level filtering, column masking, and table-level permissions.
3. **Resource Access Service (RAS)**: A granular permission model that assigns per-resource permissions (VIEW, UPDATE, MANAGE) to compute clusters, Spark jobs, workspaces, and namespaces.

See [Data Security](/user-guide/data-security/overview), [Roles](/user-guide/roles), and [Resource Access Service](/user-guide/ras/resource-bundles) for details on configuring security policies.

## Storage and Data Layer

Everything IOMETE stores (table data, Spark event logs, SQL results, worksheets) goes into object storage. Compute and storage are fully decoupled.

### Object Storage

IOMETE supports multiple storage backends. The URI scheme depends on the provider:

| Storage Provider | URI Scheme |
|---|---|
| [MinIO](https://min.io/) | `s3a://` |
| [Dell ECS](https://www.dell.com/en-us/dt/storage/ecs/index.htm) | `s3a://` |
| [AWS S3](https://aws.amazon.com/s3/) | `s3a://` |
| [Google Cloud Storage](https://cloud.google.com/storage) | `gs://` |
| [Azure Blob Storage (Gen1)](https://azure.microsoft.com/en-us/products/storage/blobs) | `wasbs://` |
| [Azure Data Lake Storage (Gen2)](https://azure.microsoft.com/en-us/products/storage/data-lake-storage) | `abfs://` |

### Database

All services share a single [PostgreSQL](https://www.postgresql.org/) server. The platform automatically creates separate databases for each service (Hive Metastore, Ranger policies, Iceberg catalog, and each microservice), so there's no manual database provisioning required.

## Real-Time Communication

Several features depend on pushing updates to the browser without a page refresh:

- **Socket Service**: a WebSocket relay that pushes real-time events (health check updates, job status changes) to the console
- **Collaboration Service**: lets multiple users edit SQL in real time using CRDT-based conflict resolution (optional, feature-flagged)
- **[NATS](https://nats.io/)**: JetStream messaging for cross-pod synchronization of collaborative editing sessions (optional)

## Job Orchestration

If you need scheduled, dependency-aware Spark job execution, the Job Orchestrator (powered by [Prefect](https://www.prefect.io/)) adds workflow scheduling:

- **Prefect Server**: orchestration engine that manages workflow state
- **Prefect Worker**: runs scheduled Spark jobs (deployed per-namespace)
- **Metrics Exporter**: exposes [Prometheus](https://prometheus.io/) metrics for job orchestration monitoring

See [Job Orchestrator](/user-guide/spark-jobs/job-orchestrator) for configuration details.

## Deployment Architecture

Understanding the deployment topology helps you plan infrastructure, estimate resource needs, and configure the Helm chart for your environment.

For details on how IOMETE is deployed on Kubernetes (including the Helm chart structure, service inventory, feature flags, and infrastructure requirements), see the [Deployment Architecture](../deployment/architecture-deployment) reference.

For step-by-step installation instructions, see the [On-Premises Deployment Guide](../deployment/on-prem/install).
