---
title: Microsoft SQL Server Data Source
sidebar_label: Microsoft SQL Server Data Source
description: Learn how to connect to Microsoft SQL Server from IOMETE Lakehouse.
---

import Img from "@site/src/components/Img";

By default, IOMETE includes MySQL, PostgreSQL, and Snowflake JDBC drivers. However, adding custom drivers, such as the Microsoft SQL Server driver, Oracle is straightforward. Follow these steps to add Microsoft SQL Server driver to IOMETE:

### Configure Microsoft SQL Server Driver

Through the IOMETE Console:  
1. **Navigate to Settings:**  
   Go to the IOMETE Console, then proceed to `Settings -> Spark Settings (Global Spark Settings)`.  

2. **Add Dependency:**  

You can add the MS SQL driver using two methods:  

   - Option 1: **Using Packages:**
     Add the MS SQL driver package using the following configuration:
     ```
     spark.jars.packages com.microsoft.azure:spark-mssql-connector_2.12:1.2.0
     ```
     <Img src="/img/database-drivers/mssql-driver-1.png" alt="Adding spark dependencies for MS SQL driver in IOMETE"/>

   - Option 2: **Using JAR Files:**
     Upload the JAR file to the default lakehouse bucket specified during IOMETE installation. This could be S3, Minio, or Dell ECS instance. Then, add the JAR file path:
     ```
     spark.jars s3a://lakehouse/spark-mssql-connector_2.12-1.2.0.jar
     ```

    <Img src="/img/database-drivers/mssql-driver-2.png" alt="Adding spark dependencies for MS SQL driver in IOMETE"/>

### Restart the Lakehouse

After adding the MS SQL driver dependencies, restart the lakehouses to make the driver available.

### Connect to Microsoft SQL Server Data Source

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

By following these steps, you can easily add and configure a custom Microsoft SQL Server driver in IOMETE, enabling you to connect and interact with your Microsoft SQL Server databases efficiently.
