---
title: Oracle Data Source
sidebar_label: Oracle Data Source
description: Learn how to connect to Oracle from IOMETE Lakehouse.
---

import Img from "@site/src/components/Img";

The IOMETE Spark images include JDBC drivers for a few databases, listed in [Bundled Drivers](/user-guide/spark-catalogs/external-jdbc-drivers#bundled-drivers). Oracle isn't one of them, so you add its driver yourself. Follow these steps to add the Oracle driver to IOMETE:

### Configure Oracle JDBC Driver

Through the IOMETE Console:

1. **Navigate to Settings:**  
   Go to the IOMETE Console, then proceed to `Settings -> Spark Settings (Global Spark Settings)`.

2. **Add Dependency:**

2.1. Download the Oracle JDBC driver JAR file. For example, you can download the Oracle 18c JDBC driver from the following link:

:::info
Ensure that the Oracle JDBC driver version is compatible with your Oracle database version.
:::

```shell lineNumbers
wget https://download.oracle.com/otn-pub/otn_software/jdbc/1922/ojdbc8.jar
```

2.2. Upload the driver JAR file to your object storage. For example, you can upload it to:

```shell lineNumbers
s3a://lakehouse/drivers/ojdbc8.jar
```

2.3.
Then, add the following configuration in the Global Spark Settings:

```shell lineNumbers
spark.jars s3a://lakehouse/drivers/ojdbc8.jar
```

### Restart the Compute Clusters

After adding the Oracle driver dependencies, restart the compute clusters to make the driver available.

### Connect to Oracle Data Source

Once the dependencies are added and the compute clusters are restarted, you can connect to the Oracle data source using the following syntax:

```sql showLineNumbers
CREATE TABLE test_table
USING org.apache.spark.sql.jdbc
OPTIONS (
    url "jdbc:oracle:thin:@bore.pub:22746:ORCL",
    dbtable "<datbase>.<table>",
    driver 'oracle.jdbc.OracleDriver',
    user '<oracle_user>',
    password '<oracle_password>'
);
```

:::info
In addition to using the JDBC method to create individual tables, you can also create a Spark JDBC catalog. By setting up a Spark JDBC catalog, you will be able to connect to an entire database or schema and browse all the tables under that catalog without needing to write DDL statements for every table. This simplifies the process of managing multiple tables in your Oracle Data Source. For more details on setting up a Spark JDBC catalog, refer to the following [Spark Catalogs](/user-guide/spark-catalogs/overview) Documentation. A JDBC catalog also needs the driver on the shared schema server, which runs **Test connection** and the Database Browser; see [Adding the Jar to the Shared Schema Server](/user-guide/spark-catalogs/external-jdbc-drivers#adding-the-jar-to-the-shared-schema-server).
:::

### Important Parameters

- **Format:** `org.apache.spark.sql.jdbc`
- **Driver:** `oracle.jdbc.OracleDriver`

By following these steps, you can easily add and configure a custom Oracle JDBC driver in IOMETE, enabling you to connect and interact with your Oracle databases efficiently.
