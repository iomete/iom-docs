---
title: JDBC Drivers
sidebar_label: JDBC Drivers
description: See which JDBC drivers the IOMETE Spark images include, and add a driver for any other database, such as ClickHouse or Oracle.
last_update:
  date: 11/19/2026
  author: Abhishek Pathania
---

A [JDBC catalog](./external-jdbc.md), a `USING jdbc` table and `spark.read.format("jdbc")` all need the database's JDBC driver on the Spark classpath. The IOMETE Spark images include drivers for a few common databases. For any other database, you upload the driver jar yourself and add it everywhere that connects to the database: the compute clusters that run your queries, and the shared schema server that runs **Test connection** and the Database Browser.

## Bundled Drivers

These drivers are in the Spark image, so you can use them without adding anything:

| Database | Driver artifact | Spark 4.2.1-v1 | Spark 3.5.9-v2 |
| -- | -- | -- | -- |
| PostgreSQL | `org.postgresql:postgresql` | Yes | Yes |
| MySQL | `com.mysql:mysql-connector-j` | Yes | Yes |
| Microsoft SQL Server | `com.microsoft.sqlserver:mssql-jdbc` | Yes | Yes |
| Amazon Redshift | `com.amazon.redshift:redshift-jdbc42` | Yes | No |
| Snowflake | `net.snowflake:snowflake-jdbc` | Yes | Yes |

Driver versions change between images, and the [Spark release notes](/deployment/on-prem/release-notes/spark) list each upgrade. Images earlier than 4.2.1-v1 and 3.5.9-v2 also include the ClickHouse JDBC driver 0.6.4 and the ClickHouse Spark connector. See [ClickHouse](#clickhouse) if you used either.

A bundled driver loads before any jar you add with `spark.jars`, so adding your own copy of a bundled driver with the same class name has no effect.

## Adding a Driver That Isn't Bundled

You make the driver available in two places, and both are needed for a working catalog:

- **Each compute cluster** that queries the database, through its Spark config in the console.
- **The shared schema server**, through the data plane Helm values. **Test connection** and the Database Browser run there, not on your compute clusters.

Before you start, you need:

- The driver jar. If the vendor publishes a self-contained jar, use it: `spark.jars` adds only the file you name, not the jars it depends on.
- A bucket Spark can read, such as your lakehouse bucket.
- Access to the data plane Helm values and permission to run `helm upgrade`, usually held by a platform administrator.

### Uploading the Jar

Upload the jar to the bucket, for example to `s3a://<lakehouse-bucket>/jars/<driver>.jar`. Spark accepts both `s3a://` and `s3://` paths.

### Adding the Jar to a Compute Cluster

Repeat these steps on every compute cluster that queries the database:

1. Open the compute cluster and click **Configure**.
2. On the **Configurations** tab, add a **Spark config** entry with the key `spark.jars` and the jar path as its value. If `spark.jars` is already set, append the new path with a comma:

   ```
   s3a://<lakehouse-bucket>/jars/existing.jar,s3a://<lakehouse-bucket>/jars/<driver>.jar
   ```

3. Click **Save**, then restart the compute cluster. Spark loads jars only at startup, so a running cluster doesn't see the driver until it restarts.

A Spark job that reads from the database needs the jar too. Add it under the job's [JAR files](../spark-jobs/spark-application-config.md#jar-files) or as `spark.jars` in its Spark config.

### Adding the Jar to the Shared Schema Server

The shared schema server is a Spark application that the data plane Helm chart deploys. It takes Spark settings only from the data plane Helm values. Global Spark Settings in the console don't reach it, even after a restart.

1. Add the jar path to your data plane values file:

   ```yaml title="values.yaml"
   services:
     sparkConnect:
       sparkConf:
         spark.jars: s3a://<lakehouse-bucket>/jars/<driver>.jar
   ```

   Helm merges this key into the chart's default `sparkConf`, so you list only the keys you add. If your values file already sets `spark.jars` here, append the new path with a comma.

2. Apply the change with the chart version you already run:

   ```shell showLineNumbers
   export IOMETE_VERSION="<chart-version>"   # the version you installed

   helm upgrade --install -n iomete-system data-plane iomete/iomete-data-plane-enterprise \
     --version "$IOMETE_VERSION" \
     -f values.yaml
   ```

   The shared schema server restarts on its own after the upgrade and accepts requests again after about a minute. You don't need to restart it manually.

The schema server runs the `spark-py` image set in `docker.defaultSparkPyVersion`, or `docker.defaultSparkVersion` when that is empty, so it includes the bundled drivers of that image.

### Creating the Catalog

Create the catalog as described in [JDBC Catalog Integration](./external-jdbc.md). If your driver isn't in the **Driver** list, type its class name and select **Use "\<class name\>"**. Click **Test connection** before you create the catalog. Green checks mean the schema server loaded the driver and reached the database.

## ClickHouse

The Spark images include no ClickHouse driver from 4.2.1-v1 and 3.5.9-v2 on. Add the driver as described in [Adding a Driver That Isn't Bundled](#adding-a-driver-that-isnt-bundled), with these values:

| Setting | Value |
| -- | -- |
| Driver jar | `clickhouse-jdbc-<version>-all.jar`, version 0.9.4 or later. Tested with `clickhouse-jdbc-0.11.2-all.jar`. |
| Driver class | `com.clickhouse.jdbc.ClickHouseDriver` |
| URL | `jdbc:clickhouse://<host>:8123/<database>` |

Download the jar from Maven Central, for example:

```shell
wget https://repo1.maven.org/maven2/com/clickhouse/clickhouse-jdbc/0.11.2/clickhouse-jdbc-0.11.2-all.jar
```

Spark 4.2.1-v1 and 3.5.9-v2 don't include the ClickHouse Spark connector either, so a catalog that uses `com.clickhouse.spark.ClickHouseCatalog` fails with `Cannot find catalog plugin class`. A JDBC catalog with the driver above lists and queries ClickHouse databases and tables.

### Connection Properties for Driver 0.9 and Later

Driver 0.9 and later rejects any connection property it doesn't recognize, so a catalog set up for the older 0.6.4 driver can fail every request with:

```
Failed to create connection
Caused by: com.clickhouse.client.api.ClientMisconfigurationException: Unknown and unmapped config properties: [databaseTerm]
```

Check the catalog's additional properties and the query parameters in its URL:

| Property | With driver 0.9 and later |
| -- | -- |
| `databaseTerm` | Remove it. The driver lists ClickHouse databases as schemas without it. |
| `sslmode` | Replace it with `ssl_mode`, which takes `DISABLED`, `TRUST`, `VERIFY_CA` or `STRICT`. For `sslmode=NONE`, use `ssl_mode=trust`. |
| `dataTransferTimeout` | Remove it. |
| `compress` | Accepted. `compress=0` is no longer needed, but you can leave it. |

If you can't change the properties right away, add `ignore_unknown_config_key=true` and the driver skips the properties it doesn't recognize. Replace `sslmode` anyway: the driver skips it too, and then verifies the server certificate instead of trusting it.

### Driver 0.6.4

Images earlier than 4.2.1-v1 and 3.5.9-v2 include driver 0.6.4, which loads before any newer jar you add. The same applies if you add 0.6.4 yourself through `spark.jars`. With this driver, set these catalog properties:

- `compress=0` if your ClickHouse server runs version 25.10 or later. Without it, reads fail.
- `databaseTerm=schema`, so the catalog lists ClickHouse databases as namespaces. Without it, the list is empty.

## Troubleshooting

### Cannot Find Catalog Plugin Class

```
Cannot find catalog plugin class for catalog '<catalog>': org.apache.spark.sql.execution.datasources.v2.jdbc.JDBCTableCatalog.
```

This error names Spark's JDBC catalog class, but that class is always present. The usual cause is a missing driver jar, which the Spark driver log shows as `Caused by: java.lang.ClassNotFoundException: <driver class>`. Where the error appears tells you which side lacks the jar:

- **Test connection or the Database Browser**: add the jar to the [shared schema server](#adding-the-jar-to-the-shared-schema-server).
- **A query on a compute cluster**: add the jar to [that compute cluster](#adding-the-jar-to-a-compute-cluster) and restart it.

`spark.read.format("jdbc")` reports the same cause directly as `java.lang.ClassNotFoundException: <driver class>`.
