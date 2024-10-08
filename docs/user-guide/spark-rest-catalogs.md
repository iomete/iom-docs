---
title: Spark REST Catalog Service
description: IOMETE offers a convenient feature for configuring Spark Catalogs interface.
last_update:
  date: 06/02/2024
  author: Vugar Dadalov
---

import { ArrowsClockwise } from "@phosphor-icons/react";
import Img from '@site/src/components/Img';

The latest release of IOMETE introduces an internal Iceberg REST Catalog, equipped with a REST interface that adheres to the Iceberg REST OpenAPI specification. This multi-catalog service allows users and applications to efficiently query all catalogs managed by the IOMETE system, significantly enhancing data management capabilities.

## Transition from JDBC to REST Catalog
Previously, IOMETE relied on a traditional Iceberg JDBC Catalog for its internal catalogs. While this approach was straightforward, it presented several notable challenges:

- Connection Overload: Each Spark job could generate up to 50 database connections, leading to performance bottlenecks.
- Limited Role-Based Access Control (RBAC): The previous model lacked effective RBAC, hindering secure data access.
- No Smart Caching: The absence of caching mechanisms impacted performance during data retrieval.
- Compatibility Issues: The JDBC Catalog primarily supported JVM-based programming languages, limiting integration possibilities. 

<Img src="/img/user-guide/spark-catalogs/rest-catalog-issues.png" alt="Spark Pre Rest Catalogs Issues" />

The introduction of the REST Catalog addresses these challenges by providing a layer that decouples the catalog implementation from the clients connecting to it.

<Img src="/img/user-guide/spark-catalogs/rest-catalog-sol.png" alt="Spark Rest Catalogs Solution" />

---
## Features of the IOMETE REST Catalog

- Integration with IAM
The REST Catalog seamlessly integrates with IOMETE’s Identity and Access Management (IAM) system, enabling robust role-based access control (RBAC). Additionally, all create and update requests for Iceberg Namespaces, Tables, and Views are routed through the REST service, allowing for improved performance through smart caching.

- Connecting to the REST Catalog
To access the REST Catalog from within the IOMETE Kubernetes namespace, users must include an Authorization header with an OAuth Bearer token. This configuration provides access to all IOMETE-managed Iceberg catalogs. To access Namespaces, Tables, or Views, the URL should be structured as follows:
  - `https://dev.iomete.cloud/catalogs/<catalog>`

  For example, a connection might look like this:
    - `https://iomete-a1-np.kob.dell.com/catalogs/rest-catalog-tmx/`

## Connections from Within IOMETE
Within the IOMETE environment, Spark jobs connect to the REST Catalog using a master token that grants full access. Data security rules are enforced directly within IOMETE Spark jobs, rather than at the REST Catalog level, streamlining data governance and access control.

<Img src="/img/user-guide/spark-catalogs/iomete-rest-connections.png" alt="Spark Rest Catalogs Connection" />


## External Connections
For users wishing to connect to the REST Catalog from outside the Kubernetes namespace where IOMETE is installed, setting up an ingress on Kubernetes is required. It is recommended to configure this ingress to utilize HTTPS to safeguard access tokens from being transmitted in plaintext. The REST Catalog will enforce authentication and RBAC based on the roles associated with the user's access token.

<Img src="/img/user-guide/spark-catalogs/iomete-rest-3rdparty-conn.png" alt="Spark Rest Catalogs 3rd party Connections" />

## Connecting from Spark
To connect to the REST Catalog from Spark, use the following configuration settings:

    `spark.sql.catalog.my_catalog=org.apache.iceberg.spark.SparkCatalog
    spark.sql.catalog.my_catalog.type=rest
    spark.sql.catalog.my_catalog.uri=http://<your-rest-catalog-endpoint>
    spark.sql.catalog.my_catalog.warehouse=s3://<your-bucket>/iceberg`


The IOMETE REST Catalog significantly enhances the capabilities of the IOMETE platform, offering a more efficient, secure, and user-friendly method for managing data catalogs. By transitioning to a RESTful architecture, IOMETE ensures better performance, robust access control, and compatibility across various programming environments.
