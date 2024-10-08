---
title: Spark Catalog Support
description: IOMETE offers a convenient feature for configuring Spark Catalogs interface.
last_update:
  date: 06/02/2024
  author: Vugar Dadalov
---

import { ArrowsClockwise } from "@phosphor-icons/react";
import Img from '@site/src/components/Img';


## Background
A catalog serves as a centralized repository for storing metadata about data assets, encapsulating essential information such as their structure, lineage, and usage. This facilitates effective data discovery, governance, and integration, empowering users to manage and comprehend their data more efficiently.

In the context of Apache Iceberg, the catalog functions as a robust metadata management system specifically designed for Iceberg tables, which are typically organized into namespaces. It oversees various aspects of metadata related to data storage and retrieval, including table schemas, partitions, and snapshots. Furthermore, it supports advanced features such as schema evolution and time travel.

Iomete allows you to configure the Iceberg Catalogs:

- [REST Catalog](https://www.tabular.io/apache-iceberg-cookbook/getting-started-catalog-background/)
- [AWS Glue Catalog](https://iceberg.apache.org/docs/1.5.1/nessie/)
- [Nessie Catalog](https://iceberg.apache.org/docs/1.5.1/nessie/)

---
## Current Capabilities
Initially, our platform offered JDBC connections to users, enabling them to access either the Iceberg JDBC Catalog or standard databases such as PostgreSQL and MySQL. This functionality empowered users to execute queries on these data sources and, with some innovative Spark techniques, perform joins across multiple connections.

As we evolved, we expanded our offerings to include Iceberg Glue and Nessie catalogs, enhancing our users' ability to manage diverse data sources effectively. In our latest release, we also introduced support for Iceberg REST catalogs, further broadening the range of integrations available.

Looking ahead, we plan to revamp the user interface, specifically the dropdown menus and forms used for creating and managing catalogs. This enhancement aims to streamline the catalog creation process and improve user experience when querying different data sources.

<Img src="/img/user-guide/spark-catalogs/spark-menu-old.png" alt="Spark Catalogs Menu" />
<Img src="/img/user-guide/spark-catalogs/spark-menu-new.png" alt="Spark Catalogs Menu 2" />

## Future User Interactions with IOMETE
Our vision for the future is to empower users to run queries and Spark jobs seamlessly across a variety of data sources. To achieve this, we are categorizing data sources into two primary groups:
1. **JDBC-Compatible Sources**: Users will be able to query any data source that supports a JDBC driver, distinguishing this from the Iceberg JDBC catalog. This encompasses users' own databases, which may form part of their existing data warehouse solutions.

2. **Iceberg Catalog Types**: Users will have access to a selection of Iceberg catalogs, including JDBC, REST, AWS Glue, and Nessie.

Additionally, we can further classify these data sources into two dimensions:
1. **IOMETE Internal Databases/Catalogs**: This category includes databases used by all IOMETE components and the Iceberg catalogs managed by IOMETE.
2. **External Databases/Catalogs**: This encompasses pre-existing databases and data warehouses, including established Iceberg catalogs like [Polaris](https://www.snowflake.com/en/blog/introducing-polaris-catalog/) and [Unity Catalog](https://www.databricks.com/product/unity-catalog).

By considering these categories, we can streamline user interactions into two main workflows: connecting to existing customer catalogs/databases and creating new IOMETE catalogs. To enhance simplicity, we plan to automatically integrate the selected IOMETE database into our explorer for easy access.

---
## IOMETE Internal Catalogs
Upon installation of IOMETE, customers will have the capability to create catalogs immediately. By default, we provide a PostgreSQL database for this purpose, although users can also opt for MySQL. Future expansions to support additional databases like Oracle, SQL Server, and DB2 are considered, but they are beyond the scope of this document. The database will include tables to store metadata related to Iceberg catalogs, namespaces, tables, and views.

In our upcoming release, we have introduced a [REST Catalog Service](/docs/user-guide/spark-rest-catalogs.md) as a standard feature of the IOMETE installation.
- This service will support multiple catalogs and will become the preferred method for catalog creation within IOMETE.
- Instead of the existing JDBC option, Spark jobs and queries will connect directly to the REST Catalog Service.
- Users will only need to provide the catalog name, warehouse URI, and any additional properties, which will automatically create a catalog accessible via the REST Catalog Service at http://iom-rest-catalog/catalogs/{catalog_name}.


<Img src="/img/user-guide/spark-catalogs/restcatalog-spark.png" alt="Spark Catalogs Rest proposal" />
<Img src="/img/user-guide/spark-catalogs/spark-create-catalog.png" alt="Spark Catalogs Create" />


To optimize database connections and implement smart caching, all Spark jobs will connect to the REST Catalog Service rather than accessing the database directly.
For now, the REST Catalog Service will encapsulate a traditional Iceberg JDBC Catalog and expose a RESTful API for enhanced accessibility.


## External Iceberg Catalogs
The next category encompasses customers who wish to utilize their existing catalogs. For instance, if a customer is already leveraging Snowflake and has Polaris installed, which functions as an Iceberg REST catalog, they can seamlessly integrate this into IOMETE. While some adjustments to our forms may be necessary, the core functionality will remain consistent with current offerings.

## Other External Data Sources
The final category includes external data sources that customers wish to query. Currently, we are focusing on data sources that support JDBC-compatible interfaces. In the future, we may explore the possibility of enabling queries from additional sources, such as Excel or Google Sheets, directly from the IOMETE console. This would likely involve using a similar interface to what we currently have, although we may need to reconsider the naming conventions for clarity and usability.
