---
title: Platform Tour
sidebar_label: Platform Tour
description: A high-level tour of the IOMETE platform covering compute, SQL Editor, Spark jobs, Data Catalog, and more.
last_update:
  date: 03/23/2026
  author: Abhishek Pathania
---

import Img from '@site/src/components/Img';

The IOMETE interface has three areas:

1. **User Menu** (top-left): manage your account, access platform administration, and get help.
2. **Navigation Menu** (left sidebar): move between sections like Engine, Workspace, and Governance, covered below.
3. **Content** (center): where the selected section's page loads and where you do your work.

<Img src="/img/getting-started/platform-tour/dashboard-page.png" alt="IOMETE Platform layout"/>

## Home

The Home page is your starting point after login. It displays a resource quota overview and quick access cards for user guides, integrations, the API reference, and support.

<Img src="/img/getting-started/platform-tour/home-page.png" alt="Home page" maxWidth="900px"/>

## Engine

Every workload on IOMETE needs compute resources. The Engine section is where you provision and manage them.

### Compute

Compute clusters are pools of dedicated resources (CPU and memory) that run your queries. You'll need at least one before using the SQL Editor.

<Img src="/img/getting-started/platform-tour/lakehouse-page.png" alt="Compute page" maxWidth="900px"/>

The [Compute Clusters](/user-guide/compute-clusters/overview) guide covers configuration in detail.

### Jupyter Containers

Jupyter Containers provide containerized JupyterLab environments inside the platform. Each container has persistent storage and connects to compute clusters via Spark Connect, so you can explore data, prototype ETL pipelines, and develop ML models interactively.

<Img src="/img/getting-started/platform-tour/notebook-page.png" alt="Jupyter Containers page" maxWidth="900px"/>

More in the [Jupyter Containers](/user-guide/notebook/jupyter-containers) guide.

### Event Streams

Event Streams ingest events over HTTP and write them to Apache Iceberg tables in near real time. Deploy an ingestion endpoint, point your applications at it, and query the data with SQL. No message queues or extra infrastructure required.

<Img src="/img/getting-started/platform-tour/event-streams.png" alt="Event Streams page" maxWidth="900px"/>

Details in the [Event Stream](/user-guide/event-stream) guide.

## Workspace

Most of your day-to-day SQL work happens in the [Workspace](/user-guide/sql-editor/workspaces). The sidebar groups three tools: SQL Editor, Query Monitoring, and Schedules.

### SQL Editor

The SQL Editor is where you write and run queries. The left icon bar switches between four panels:

- **[Worksheets](/user-guide/sql-editor/worksheets)**: file tree that organizes worksheets and dashboards into personal or shared workspaces.
- **[Database Explorer](/user-guide/sql-editor/database-explorer)**: browse catalogs, schemas, tables, views, and columns.
- **[Query History](/user-guide/sql-editor/query-history)**: logs every query you run, with time range and status filters. Reopen any past query in the active worksheet.

Before running a query, select a compute cluster and namespace from the top bar. The editor autocompletes database objects as you type. Results display as tables or charts. Build **[Dashboards](/user-guide/sql-editor/dashboards)** from your results and export them to PDF.

<Img src="/img/getting-started/platform-tour/sql-editor-page.png" alt="SQL Editor page" maxWidth="900px"/>

Learn more in the [SQL Editor](/user-guide/sql-editor/worksheets) guide.

### Query Monitoring

Keeping tabs on what's running across your clusters prevents bottlenecks. This view lists active queries across all compute clusters, so you can spot long-running or stuck queries early.

<Img src="/img/getting-started/platform-tour/query-monitoring.png" alt="Query Monitoring page" maxWidth="900px"/>

### Schedules

Recurring SQL work like transformations, reports, and maintenance doesn't have to be manual. Set up cron-based schedules and track each run's status and results.

<Img src="/img/getting-started/platform-tour/schedules.png" alt="Schedules page" maxWidth="900px"/>

The [Query Scheduling](/user-guide/sql-editor/scheduling) guide walks through setup.

## Applications

Whether you're running one-off batch jobs or long-lived streams, the Applications section tracks all your Spark workloads in one place.

### Spark Applications

This page charts every Spark application run with interactive visualizations. Filter by time range, user, status, or tags to spot issues quickly.

<Img src="/img/getting-started/platform-tour/spark-applications.png" alt="Spark Applications page" maxWidth="900px"/>

More in the [Spark Jobs](/user-guide/spark-jobs/getting-started) guide.

### Streaming Jobs

Spark Structured Streaming workloads live here. Create, monitor, and scale long-running streaming jobs that process data continuously as it arrives.

<Img src="/img/getting-started/platform-tour/streaming-jobs.png" alt="Streaming Jobs page" maxWidth="900px"/>

### Job Templates

Job Templates define reusable Spark job configurations. Browse the built-in marketplace for ready to use templates, or create your own.

<Img src="/img/getting-started/platform-tour/job-templates.png" alt="Job Templates page"/>

The [Getting Started with Spark Jobs](/user-guide/spark-jobs/getting-started) guide has a full walkthrough.

## Governance

As your data grows, finding and understanding tables gets harder. The Governance section currently has one page, **Data Catalog**, which organizes table metadata across five tabs:

- **Data Catalog**: full-text search across all tables, with filters for catalogs, schemas, and tags.
- **Data Explorer**: hierarchical browsing through catalogs, namespaces, and tables, plus views of columns, partitions, and snapshots.
- **Favorites**: quick access to your bookmarked tables.
- **Classifications**: manage classification tags applied to data assets.
- **Classification Requests**: review and approve requests to add or modify classifications.

<Img src="/img/getting-started/platform-tour/catalog-search.png" alt="Data Catalog search"/>

The [Data Catalog](/user-guide/data-catalog/overview) guide covers everything in detail.


## Resource Bundles

When different teams share the same platform, you need fine-grained access control. Resource Bundles group resources (compute clusters, Spark jobs, Jupyter Containers, etc.) and assign permissions per bundle. That way, you control who can create, manage, or use each resource.

<Img src="/img/getting-started/platform-tour/resource-bundles.png" alt="Resource Bundles page" maxWidth="900px"/>

More in the [Resource Bundles](/user-guide/ras/resource-bundles) guide.

## Settings

Platform-wide configuration lives in Settings, organized into three groups:

- **General Info**: domain details, cloud provider, runtime and Spark versions.
- **Profile**: Access Tokens and Notifications.
- **Domain**: Members, Spark Settings, Spark Catalogs, Docker Settings, Secret Settings, Node Types, Volumes, Namespaces, Storage Configs, and Git Integration.

Open Settings from the left sidebar or the user menu.

<Img src="/img/getting-started/platform-tour/settings.png" alt="Settings page" maxWidth="900px"/>

## Admin Portal

Platform administrators manage users, security, and infrastructure from the Admin Portal. Access it through the user menu.

- **IAM**: [Users](/user-guide/users), [Groups](/user-guide/groups), Admin Roles, [LDAP](/user-guide/ldap-configuration), and [Single Sign-On (SSO)](/user-guide/single-sign-on).
- **Data Governance**: [Spark Catalogs](/user-guide/spark-catalogs/overview), [Data Security](/user-guide/data-security/overview) policies, and Audit logs.
- **Compute**: [Node Types](/user-guide/node-types/overview), [Volumes](/user-guide/volumes), Namespaces, and [Docker Settings](/user-guide/private-docker-registry).
- **Administration**: System Config, Event Logs, [Email Config](/user-guide/email-settings), and Orphaned Resources.

<Img src="/img/getting-started/platform-tour/admin-portal.png" alt="Admin Portal page" maxWidth="900px"/>

:::info Feature Availability
Some features (Jupyter Containers, Event Streams, Query Monitoring, and Schedules) may not be visible depending on your deployment configuration.
:::
