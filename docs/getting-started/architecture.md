---
title: Architecture Overview
sidebar_label: Architecture
description: Learn about IOMETE's architecture, components, and key features that make it a cutting-edge Data Lakehouse Platform for AI and Analytics.
last_update:
  date: 04/02/2024
  author: Vusal Dadalov
---

import Img from '@site/src/components/Img';

## Architecture Overview

IOMETE is a Data Lakehouse Platform that provides a unified data platform for AI and Analytics.
It is built on top of [Apache Spark](https://spark.apache.org/), [Apache Iceberg](/docs/reference/iceberg-tables/getting-started), and [Kubernetes](/docs/deployment/kubernetes). IOMETE is designed to be a scalable, reliable, and high-performance platform for data processing and analytics.

For an introduction to IOMETE's core concepts and features, see [What is IOMETE?](./what-is-iomete).

<Img src="/img/getting-started/iomete-high-level-overview.png" alt="IOMETE Architecture High-Level Overview"/>

---

## High-Level Architecture

IOMETE runs on top of [Kubernetes](/docs/deployment/kubernetes), which can be deployed on any cloud provider or on-premises data center. IOMETE uses Object Storage (e.g., [AWS S3](/docs/aws/s3-bucket-permissions), [Google Cloud Storage](/docs/gcp/gcs-bucket-permissions), Azure Blob Storage, [MinIO](/docs/deployment/minio-deployment)) as the storage layer for data.

Inside Kubernetes, IOMETE is deployed and provides a set of services that are used to manage data, run [Spark jobs](/docs/user-guide/spark-jobs), and provide a [SQL interface](/docs/user-guide/sql-editor/worksheets) to query and process data.

Learn more about deployment options:
- [Community Deployment Overview](/docs/community-deployment/overview)
- [Kubernetes Deployment Guide](/docs/deployment/kubernetes)
- [Scalability Features](./scalability)

<Img src="/img/getting-started/architecture/IOMETE Architecture z100.png" alt="IOMETE Architecture z100"/>

---

## Inside Data Plane - IOMETE Services

If we dive deeper into the IOMETE services, we can see the following components:

- **Microservices:** IOMETE is built on top of microservices architecture. Each service is responsible for a specific task, such as managing metadata, running Spark jobs, or providing a SQL interface. In the diagram below, bluish boxes represent microservices.
- **Workloads:** These are the actual workloads based on Spark Engine that serves different purposes.

<Img src="/img/getting-started/architecture/IOMETE Services Full Diagram.png" alt="IOMETE Services Full Diagram"/>

### Microservices

**1. IOMETE Gateway:** IOMETE Gateway is the entry point to the IOMETE platform. It's a reverse proxy that routes requests to the appropriate microservices.

#### Control Plane Services

- **2. Core Service:** Core Service is the main service that manages metadata, scheduling, and orchestration of workloads. It coordinates [Virtual Lakehouses](/docs/user-guide/virtual-lakehouses) and [Spark Jobs](/docs/user-guide/spark-jobs).
- **3. IAM Service:** IAM Service is responsible for managing [users](/docs/user-guide/iam/users), [groups](/docs/user-guide/iam/groups), and [permissions](/docs/user-guide/iam/roles), as well as managing other IDP integrations, such as [LDAP](/docs/user-guide/iam/ldap-configuration), [SAML](/docs/user-guide/iam/sso/sso), etc.
- **4. SQL Service:** SQL Service provides REST API for SQL and also provides a backend for the [SQL Editor](/docs/user-guide/sql-editor/worksheets). It supports [query federation](/docs/reference/sql-quick-start/query-federation) across multiple data sources.
- **5. Catalog Service:** Catalog Service is a backend service for [Data Catalog](/docs/user-guide/data-catalog). Which provides metadata management, data discovery, tagging, and lineage.
- **6. Spark Operator:** Spark Operator is a Kubernetes operator that manages all Spark Workloads. It schedules, monitors, and manages the lifecycle of Spark clusters. Learn more in [Kubernetes for IOMETE](/docs/deployment/kubernetes).

#### Security

- **7. Data Access Policies (Ranger):** Data Access Policies is a service that manages data access policies for databases, tables, and columns. It provides a consistent way to manage permissions for groups or users. See [Data Security Overview](/docs/user-guide/data-security/overview), [Access Policies](/docs/user-guide/data-security/access-policy), [Data Masking](/docs/user-guide/data-security/data-masking), and [Row-Level Filtering](/docs/user-guide/data-security/row-filter).
- **8. Control Policies (OPA):** Control Policies is a service that manages control policies for the platform. It provides a way to manage platform-level policies, such as who can create lakehouses, who can run Spark jobs, etc. See [Roles and Permissions](/docs/user-guide/iam/roles) and [Resource Access System (RAS)](/docs/user-guide/iam/ras/ras).
- **9. IDP - Identity Provider (Keycloak):** IDP is a service that manages user storage, authentication, and integration powered by Keycloak. Configure SSO with [Okta](/docs/user-guide/iam/sso/sso-okta), [OneLogin](/docs/user-guide/iam/sso/sso-onelogin), or [Entra ID](/docs/user-guide/iam/sso/sso-entra-id).

#### Catalogs

- **10. Hive Metastore:** Hive Metastore is a service that manages metadata for [Parquet](/docs/reference/data-sources/parquet-files), [CSV](/docs/reference/data-sources/csv-files), [JSON](/docs/reference/data-sources/json-files), Hive Tables, etc. It provides a way to store metadata for Hive tables and partitions.
- **11. Iceberg Catalog:** Iceberg Catalog is a service that manages metadata for [Iceberg Tables](/docs/reference/iceberg-tables/getting-started). IOMETE also supports external catalogs like [Glue](/docs/user-guide/spark-catalogs/external-glue), [JDBC](/docs/user-guide/spark-catalogs/external-jdbc), [REST](/docs/user-guide/spark-catalogs/external-rest), and [Nessie](/docs/user-guide/spark-catalogs/external-nessie).

#### Monitoring

- **12. Spark History:** Spark History is a service that provides Spark job history and monitoring. It's useful for [debugging](/docs/developer-guide/spark-job/spark-debugging) and monitoring completed Spark jobs. Learn about [Spark logging](/docs/developer-guide/spark-job/spark-logging).
- **13. Prometheus/Loki/Grafana:** Prometheus, Loki, and Grafana are services that provide [monitoring](/docs/k8s/monitoring), logging, and visualization for the platform and workloads.

### Workloads

- **Lakehouse Clusters:** [Virtual Lakehouses](/docs/user-guide/virtual-lakehouses) are the clusters that provide SQL interface that can be connected from any SQL client, BI tools (e.g., [Tableau](/docs/integrations/bi/tableau), [Power BI](/docs/integrations/bi/power-bi), [Metabase](/docs/integrations/bi/metabase), [Apache Superset](/docs/integrations/bi/apache-superset)), [DBT](/docs/integrations/dbt/getting-started-with-iomete-dbt), or any other tool that supports [JDBC](/docs/developer-guide/driver/jdbc-driver)/ODBC.
- **Spark Jobs:** [Spark Jobs](/docs/developer-guide/spark-job/getting-started) are the Spark jobs that are submitted to the Spark Engine for execution. Explore [marketplace jobs](/docs/open-source-spark-jobs/getting-started) or integrate with [Airflow](/docs/developer-guide/spark-job/airflow).
- **Jupyter Remote Kernel:** [Jupyter Notebooks](/docs/developer-guide/notebook/starting-with-notebook) provide a Jupyter Kernel that can be connected from any Jupyter Notebook to execute code remotely (e.g., ML training, data processing). Use with [VSCode](/docs/developer-guide/notebook/using-vscode) or [Jupyter Containers](/docs/developer-guide/notebook/jupyter-containers).

## Related Resources

### Learn More About Architecture
- **Blog**: [Kubernetes-Native Data Engineering Architecture](/blog/kubernetes-native-data-engineering-architecture)
- **Blog**: [Core Components & Technical Architecture](/blog/core-components-technical-architecture)
- **Blog**: [Platform Components & Enterprise Architecture](/blog/platform-components-and-enterprise-architecture)

### Next Steps
1. **Take a Tour**: Explore the [Platform Tour](./platform-tour) to see these components in action
2. **Deploy IOMETE**: Follow the [Deployment Guide](/docs/community-deployment/overview) to set up your environment
3. **Configure Security**: Set up [data security](/docs/user-guide/data-security/overview) and [IAM](/docs/user-guide/iam/roles)
4. **Start Using IOMETE**: Create your first [Virtual Lakehouse](/docs/user-guide/virtual-lakehouses) and run [Spark Jobs](/docs/user-guide/spark-jobs)
