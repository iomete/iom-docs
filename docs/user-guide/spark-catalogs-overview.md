---
title: Spark Catalogs Overview
description: Overview of the Spark Catalogs functionality in IOMETE.
last_update:
  date: 06/02/2024
  author: Vugar Dadalov
---

import { ArrowsClockwise } from "@phosphor-icons/react";
import Img from '@site/src/components/Img';

A **Spark Catalog** is a component in Apache Spark that manages metadata for tables and databases within a Spark session. It allows for the creation, deletion, and querying of tables, as well as access to their schemas and properties.

IOMETE allows users to configure multiple **Spark Catalogs** to access data from both IOMETE systems and external sources. This configuration supports lakehouse queries and Spark jobs, streamlining data retrieval and management across diverse environments.


### Catalog Overview

To view all configured Spark Catalogs, navigate to the `Settings` menu item and switch to the `Spark Catalogs` tab.
In the list below, you'll find the Spark catalog. The default catalog created by the system is called `spark_catalog`.

<Img src="/img/user-guide/spark-catalogs/catalog-list.png" alt="Spark Catalogs" />

### Configuring Managed Catalogs

IOMETE enables the creation of new catalogs that operate as Iceberg REST Catalogs, managed internally by the IOMETE system.
These catalogs are accessible to external tools via the path `/catalogs/<catalog name>`.
They seamlessly integrate with existing data security rules to enforce role-based access control (RBAC).
For authentication, a session or a [PAT token](create-a-personal-access-token.md) is required.

<Img src="/img/user-guide/spark-catalogs/rest-catalog-sol.png" alt="Spark Rest Catalogs Solution" />

#### Creating a new Managed Catalog

To add new catalog item, click `Create` button in the top right corner. You'll see following screen:

<Img src="/img/user-guide/spark-catalogs/spark-catalogs-create.png" alt="Spark Catalog create" maxWidth="600px"/>

### Catalog Types Overview

IOMETE supports both **internally managed catalogs** and **external catalogs** that can be integrated for a seamless data experience across different environments. Below is an overview of the various types of catalogs you can configure.


These are the catalogs managed internally by the IOMETE system.

### [Iceberg Rest Catalog](spark-catalogs-internal.md)

An internally managed Iceberg catalog using a REST API connection. It is fully managed within the IOMETE platform and provides an easy way to manage metadata through the Iceberg REST API.



### [External Catalogs](spark-catalogs-external-overview.md)

These are external catalogs that can be integrated with IOMETE, allowing users to connect to existing data sources without moving their data.

#### [Iceberg Rest Catalog](spark-catalogs-external-rest.md)

An external Iceberg catalog connected via a REST API. This allows for seamless integration with Iceberg-based systems that are already running outside the IOMETE environment.

#### [Iceberg - AWS Glue Catalog](spark-catalogs-external-aws.md)

This catalog connects to external Iceberg metadata stored in **AWS Glue**. It leverages AWS Glue’s cataloging capabilities to manage metadata and data schemas for Iceberg tables.

#### [Nessie Catalog](spark-catalogs-external-nessie.md)

The **Nessie catalog** provides version control for your Iceberg tables, enabling Git-like operations for table versioning and branching.

#### [JDBC Catalog](spark-catalogs-external-jdbc.md)

A **JDBC catalog** enables integration with various relational databases through standard **JDBC connections**. This catalog type is used to query existing databases from different platforms, including MySQL, PostgreSQL, and others.


Explore the links above to learn more about setting up and configuring each catalog type for your environment.

---

## New Catalog in SQL Editor.

After c  SQL Editor to view the Spark catalog that has been created.
Check out the `SQL Editior` section in the left panel. If you don't see the created catalog, please refresh by using the <ArrowsClockwise size={16} /> button.
In the given image, we have already created some databases and tables inside the catalog.
<Img src="/img/user-guide/spark-catalogs/sqleditor.png" alt="Spark Catalogs in SQL Editor" maxWidth="600px"/>

## Connecting to the IOMETE REST Catalog from External Applications

IOMETE exposes the Iceberg REST URL at the subpath `/catalogs/<catalog name>` on the same domain as the IOMETE console.
For instance, you wish to query a catalog named `my_catalog` if your console is available on https://console.iomete.internal, then
you can utilize tools like cURL, Postman, or others to send requests to https://console.iomete.internal/catalogs/my_catalog/v1/config.
All REST endpoints are compliant with the [Iceberg REST OpenAPI specification](https://github.com/apache/iceberg/blob/apache-iceberg-1.6.1/open-api/rest-catalog-open-api.yaml).

To connect to the REST Catalog via PySpark, the following configuration will enable the connection. Be sure to fill in the required fields.
If you are using HTTPS with certificates, you will also need to provide a valid truststore and its associated password.

```shell
pyspark \
    --conf spark.sql.catalog.spark_catalog.uri="<http|https>://<url running IOMETE console>/catalogs/my_catalog" \
    --conf spark.sql.catalog.spark_catalog.token="<(personal) access token>" \
    --conf spark.sql.catalog.spark_catalog=org.apache.iceberg.spark.SparkCatalog \
    --conf spark.sql.catalog.spark_catalog.warehouse="<path-to-your-s3-compatible warehouse>" \
    --conf spark.sql.defaultCatalog=spark_catalog \
    --conf spark.sql.catalog.spark_catalog.catalog-impl=org.apache.iceberg.rest.RESTCatalog \
    --conf spark.sql.catalog.spark_catalog.s3.endpoint="<s3 compatible storage endpoint>" \
    --conf spark.sql.catalog.spark_catalog.s3.client.region="<region for your s3 compatible storage, default it us-east1>" \
    --conf spark.sql.catalog.spark_catalog.s3.access-key-id="<access key for your s3 compatible storage>" \
    --conf spark.sql.catalog.spark_catalog.s3.secret-access-key="<secret key for your s3 compatible storage>" \
    --conf spark.sql.catalog.spark_catalog.s3.path-style-access=true \
    --conf "spark.driver.extraJavaOptions=-Djavax.net.ssl.trustStore=<path-to-truststore> -Djavax.net.ssl.trustStorePassword=<truststore password>" \
    --conf spark.sql.extensions=org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions \
    --packages org.apache.iceberg:iceberg-spark-extensions-3.4_2.12:1.6.1,org.apache.iceberg:iceberg-spark-runtime-3.4_2.12:1.6.1,org.apache.iceberg:iceberg-aws-bundle:1.6.1,software.amazon.awssdk:s3:2.27.21
```

:::note Access token
Please mind that you will require a valid session or [PAT token](create-a-personal-access-token.md) pass authentication.
Additionally, the user associated with the token must have the necessary [Access Policies](../user-guide/data-security/access-policy.mdx) on the catalog, namespace, and table you wish to operate on.
:::




