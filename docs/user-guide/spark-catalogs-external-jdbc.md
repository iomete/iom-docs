---
title: JDBC Catalog Integration
description: Configure IOMETE to connect to existing JDBC resources.
last_update:
  date: 06/02/2024
  author: Vugar Dadalov
---

import Img from '@site/src/components/Img';

You can connect IOMETE to any existing JDBC (Java Database Connectivity) resource, which facilitates communication with relational database management systems (RDBMS). This integration enables you to use JDBC resources in various queries and Spark jobs, enhancing your data processing capabilities and allowing for seamless interaction with your existing database systems.

To set up this connection, you must provide:

- **Name** : Name of the catalog
- **URL**: The JDBC URL
- **Username**: A valid username to connect with to the JDBC Resource
- **Password**: The password associated with the Username
- **Driver**: The JDBC driver for your database

<Img src="/img/user-guide/spark-catalogs/create-jdbc-catalog.png" alt="Create JDBC Catalog" />

Test the connection to ensure proper setup.
