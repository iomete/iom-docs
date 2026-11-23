---
title: JDBC Catalog Integration
description: Configure IOMETE to connect to existing JDBC resources.
last_update:
  date: 11/19/2026
  author: Abhishek Pathania
---

import Img from '@site/src/components/Img';

You can connect IOMETE to any existing JDBC (Java Database Connectivity) resource, which facilitates communication with relational database management systems (RDBMS). This integration enables you to use JDBC resources in various queries and Spark jobs, enhancing your data processing capabilities and allowing for seamless interaction with your existing database systems.

To set up this connection, you must provide:

- **Name** : Name of the catalog
- **URL**: The JDBC URL
- **Username**: A valid username to connect with to the JDBC Resource
- **Password**: The password associated with the Username
- **Driver**: The JDBC driver class for your database, for example `org.postgresql.Driver`. Spark must be able to load this class, so check [JDBC Drivers](./external-jdbc-drivers.md) for the drivers IOMETE includes and how to add any other driver

<Img src="/img/user-guide/spark-catalogs/create-jdbc-catalog.png" alt="Create JDBC Catalog" />

Test the connection to ensure proper setup.

For more details, refer to the [Iceberg JDBC Integration](https://iceberg.apache.org/docs/1.5.1/jdbc/#java-api).
