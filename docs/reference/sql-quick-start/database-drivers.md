---
title: Custom Database Drivers
sidebar_label: Database Drivers
description: Learn how to add custom JDBC drivers to IOMETE Lakehouses.
---

import Img from "@site/src/components/Img";

By default, IOMETE includes MySQL, PostgreSQL, and Snowflake JDBC drivers. However, adding custom drivers, such as the MS SQL driver, Oracle is straightforward. Follow these steps to add MS SQL driver to IOMETE:

### Add Driver

Through the IOMETE Console:  
1. **Navigate to Settings:**
   Go to the IOMETE Console, then proceed to `Settings -> Spark Settings (Global Spark Settings)`.

2. **Add the Driver:**
   - **Using Packages:**
     Add the MS SQL driver package using the following configuration:
     ```
     spark.jars.packages com.microsoft.azure:spark-mssql-connector_2.12:1.2.0
     ```
   - **Using JAR Files:**
     Upload the JAR file to the default lakehouse bucket specified during IOMETE installation. This could be S3, Minio, or Dell ECS instance. Then, add the JAR file path:
     ```
     spark.jars s3a://lakehouse/spark-mssql-connector_2.12-1.2.0.jar
     ```

See the image below for reference:

<Img
src="/img/database-drivers/mssql-driver.png"
alt="Adding spark dependencies for MS SQL driver in IOMETE"
/>

### Restart the Lakehouse

After adding the MS SQL driver dependencies, restart the lakehouses to make the driver available.

### Connect to MS SQL Data Source

Once the dependencies are added and the lakehouse is restarted, you can connect to the MS SQL data source using the following syntax:

```sql
CREATE TABLE IF NOT EXISTS ms_sql_demo_db
USING com.microsoft.sqlserver.jdbc.spark
OPTIONS (
    url "jdbc:sqlserver://host_name_or_ip;databaseName=db_name",
    driver "com.microsoft.sqlserver.jdbc.SQLServerDriver",
    dbtable "db_name.table_name",
    user 'user',
    password 'password'
);
```

### Important Parameters

- **Format:** `com.microsoft.sqlserver.jdbc.spark`
- **Driver:** `com.microsoft.sqlserver.jdbc.SQLServerDriver`

These parameters are crucial for the connection configuration.

By following these steps, you can easily add and configure a custom MS SQL driver in IOMETE, enabling you to connect and interact with your MS SQL databases efficiently.
