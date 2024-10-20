---
title: External Iceberg Catalogs Overview
description: Overview of connecting IOMETE to existing external Iceberg catalogs.
last_update:
  date: 06/02/2024
  author: Vugar Dadalov
---

# Connecting to External Iceberg Catalogs

IOMETE can connect to existing Iceberg catalogs, enabling seamless integration with your external data infrastructure. This allows you to leverage IOMETE’s capabilities while managing metadata and data in external systems.

## Types of External Iceberg Catalogs

IOMETE supports connecting to a variety of external Iceberg catalogs, including REST APIs, AWS Glue, and Nessie catalogs. Follow the links below to learn how to configure each type of catalog:

### [JDBC Catalog](spark-catalogs-external-jdbc.md)
This catalog connects to an existing JDBC (Java Database Connectivity) resource, which facilitates communication with relational database management systems (RDBMS)

### [REST Iceberg Catalog](spark-catalogs-external-rest.md)
An external Iceberg catalog connected via REST API integration. This type of catalog allows you to connect IOMETE to any REST-compliant Iceberg metadata storage.

Learn more about [REST Catalog](https://www.tabular.io/apache-iceberg-cookbook/getting-started-catalog-background/) integration by following the [Iceberg REST Catalog guide](spark-catalogs-external-rest.md)

### [AWS Glue Iceberg Catalog](spark-catalogs-external-glue.md)
This catalog connects IOMETE to Iceberg metadata stored in **AWS Glue**, leveraging AWS Glue’s cataloging features to manage schemas and metadata for Iceberg tables.

For details on configuring the [AWS Glue Iceberg Catalog](https://iceberg.apache.org/docs/1.5.1/aws/#glue-catalog/), refer to the [AWS Glue Catalog Guide](spark-catalogs-external-glue.md).

### [Nessie Iceberg Catalog](spark-catalogs-external-nessie.md)
The **Nessie catalog** provides version control for your Iceberg tables, with Git-like operations for branching and managing table versions.

Learn more about configuring [Nessie Iceberg Catalogs](https://iceberg.apache.org/docs/1.5.1/nessie/) by visiting the [Nessie Catalog documentation](spark-catalogs-external-nessie.md).

---

Follow the instructions provided in each section to properly configure the catalogs. Once configured, these catalogs can be queried and managed seamlessly through IOMETE’s platform.

