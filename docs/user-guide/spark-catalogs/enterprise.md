---
title: Enterprise Catalog
sidebar_label: Enterprise Catalog
description: Configure and manage Enterprise Catalogs in IOMETE — a format-agnostic catalog supporting Avro, CSV, Iceberg, JSON, ORC, Parquet, and Text tables.
last_update:
  date: 02/07/2026
  author: Rocco Verhoef
---

import Img from '@site/src/components/Img';

:::warning Preview Feature
Enterprise Catalog is a **preview feature** introduced in IOMETE v3.16.0. It is intended for evaluation and feedback — **not for production use**.

- Breaking changes may occur before general availability
- Please share your feedback with your IOMETE representative or [open a ticket](https://iomete.atlassian.net/servicedesk/customer/portals) on our support portal
:::

## Overview

Enterprise Catalog is a format-agnostic data catalog that provides a single plane for managing tables across multiple formats — including **Avro**, **CSV**, **Iceberg**, **JSON**, **ORC**, **Parquet**, and **Text** — with **Delta Lake** and **Hudi** support planned — without requiring separate catalogs for each.

Traditional Spark catalog setups require creating individual catalogs per format or storage provider. Enterprise Catalog simplifies this by:

- **Unifying table formats** into a single catalog — no more one-catalog-per-format
- **Auto-configuring** connection properties, S3 credentials, and internal routing
- **Reducing operational overhead** — only a name and warehouse are required to get started

Enterprise Catalog is currently only accessible by IOMETE workloads: Lakehouses, Spark jobs, and Jupyter notebooks.

## Architecture

Enterprise Catalog is built as a **wrapper on top of [Iceberg REST Catalog](./internal.md)**:

- For **Iceberg tables**, it delegates to the underlying Iceberg REST Catalog infrastructure
- For **other formats** (Avro, CSV, JSON, ORC, Parquet, Text), it extends the catalog to register and query these formats alongside Iceberg tables
- Connection properties (REST endpoint, storage type, internal routing) are **auto-configured** — no manual S3 credentials or endpoint configuration required

This architecture means Enterprise Catalog inherits the reliability of Iceberg REST Catalog while extending format support beyond Iceberg. It currently uses the Spark Catalog V1 API, with V2 migration planned for a future release.

## Supported Formats

| Format | Status |
|--------|--------|
| Avro | Available |
| CSV | Available |
| Iceberg | Available |
| JSON | Available |
| ORC | Available |
| Parquet | Available |
| Text | Available |
| Delta Lake | Planned |
| Hudi | Planned |

## Creating an Enterprise Catalog

On the admin portal, locate **Spark Catalogs** on the sidebar (under **Data Governance**) and click **+ New Spark Catalog**.

Select **Enterprise Catalog** from the **Managed Catalogs** section.

<Img src="/img/user-guide/spark-catalogs/enterprise-catalog-create.png" alt="Enterprise Catalog creation form" maxWidth="600px" />

Provide the following:

- **Name** — A unique name for the catalog
- **Warehouse** — The S3-compatible warehouse URL for table storage

Basic settings are automatically configured by the platform — you only need to provide overrides, if any.

### Validating and Saving

Click **Test Connection** to validate connectivity and permissions, then click **Create**.

<Img src="/img/user-guide/spark-catalogs/enterprise-catalog-test-connection.png" alt="Enterprise Catalog test connection" maxWidth="600px" />

Due to caching, the catalog might take a few seconds to become available in the platform and on applications.

---

## Current Features

- **Multi-format read/write** — Avro, CSV, Iceberg, JSON, ORC, Parquet, and Text tables in a single catalog
- **Auto-configured connections** — REST endpoint, storage type, and internal routing require no manual setup
- **Simplified creation** — Only name and warehouse required; no S3 credentials needed
- **IOMETE workload access** — Available to Lakehouses, Spark jobs, and Jupyter notebooks

## Planned Features

The following capabilities are under development for future releases:

- **Spark Catalog V2 API migration** — Currently uses V1 API; V2 will enable richer catalog operations
- **External REST API access** — Expose catalogs to external compute engines with token-based authentication
- **Namespace & table-level ACLs** — GRANT/REVOKE permissions via Data Security
- **JDBC/ODBC discovery** — Register catalogs for BI tool auto-discovery
- **Hive Metastore migration utility** — Migrate existing Hive-managed tables into Enterprise Catalog
- **Delta Lake & Hudi support** — Extend format coverage to include Delta Lake and Hudi tables
- **Column-level lineage & tags** — Track data flow and annotate columns with metadata
- **Fine-grained privileges** — Column-level access, row filters, and data masking

---

## Enterprise Catalog vs Iceberg REST Catalog

| | Enterprise Catalog | Iceberg REST Catalog |
|---|---|---|
| **Formats** | Avro, CSV, Iceberg, JSON, ORC, Parquet, Text (Delta Lake & Hudi planned) | Iceberg only |
| **Setup** | Auto-configured (name + warehouse only) | Auto-configured when internal; manual S3 config for external access |
| **External access** | Planned — currently internal only | REST API with token authentication |
| **Access delegation** | Planned | Credential vending & remote signing |
| **Status** | Preview | Production-ready |

---

## Providing Feedback

Enterprise Catalog is in **preview** and we actively encourage you to try it out. Your feedback directly shapes its development — every issue reported, feature requested, or workflow shared helps us build a better product.

- Contact your **IOMETE representative** with questions, ideas, or issues
- [Open a ticket](https://iomete.atlassian.net/servicedesk/customer/portals) on our support portal for technical support
