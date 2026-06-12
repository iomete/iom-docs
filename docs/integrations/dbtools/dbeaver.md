---
title: DBeaver
description: Connect DBeaver to IOMETE using the Arrow Flight SQL JDBC driver.
sidebar_label: DBeaver
last_update:
  date: 2026-06-12
  author: Mateus Aubin
---

import Img from '@site/src/components/Img';
import Card from '@site/src/components/Card';
import GridBox from '@site/src/components/GridBox';

[DBeaver](https://dbeaver.io/) is a cross-platform database tool. It connects to IOMETE over the [Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html) protocol using a JDBC driver. You can choose between two Arrow Flight drivers, and both work the same way:

- **IOMETE custom build**: adds proxy support, a connection-level query timeout, and named parameters. See the [Arrow Flight SQL JDBC Driver](/user-guide/driver/arrow-flight-jdbc-driver) guide for the details.
- **Apache Arrow Flight SQL JDBC driver**: the standard upstream build, also fully compatible.

There's also a **legacy Hive JDBC driver** that connects over the _deprecated_ HiveServer2 protocol. It's slower and has known [compatibility issues](/user-guide/driver/hive-jdbc-driver) with schema selection and catalog names. Use Arrow Flight SQL unless you have a specific reason to use the Hive driver.

The steps below apply to either Arrow Flight driver.

## Downloading the Driver

DBeaver needs the JDBC driver JAR on disk before it can connect to IOMETE. Download the IOMETE custom build from the [iomete-artifacts](https://github.com/iomete/iomete-artifacts) GitHub repository, where the files follow the naming convention `flight-sql-jdbc-driver-<upstream>-iomete.<release>.jar`.

To use the standard upstream driver instead, download it from the [Apache Arrow releases page](https://arrow.apache.org/docs/19.0/java/flight_sql_jdbc_driver.html).

## Registering the Driver in DBeaver

DBeaver doesn't ship with the Arrow Flight SQL driver. Register the JAR once, then reuse it for every IOMETE connection.

1. Open DBeaver and go to **Database → Driver Manager**.

   <Img src="/img/database-drivers/dbeaver/driver-manager.png" alt="Opening Driver Manager from the Database menu" />

2. Click **New** to create a driver.

3. On the **Libraries** tab, click **Add File** and select the JAR you downloaded. Then click **Find Class** to let DBeaver resolve the driver class.

   <Img src="/img/database-drivers/dbeaver/driver-libs.png" alt="Libraries tab with the Arrow Flight SQL JDBC JAR and resolved driver class" />

4. Switch to the **Settings** tab and confirm:
   - **Driver Name**: `IOMETE Arrow Flight SQL`
   - **Driver Type**: `Generic`
   - **Class Name**: `org.apache.arrow.driver.jdbc.ArrowFlightJdbcDriver`

   <br />

   <Img src="/img/database-drivers/dbeaver/driver-settings.png" alt="Driver Settings tab with Generic type and the Arrow Flight class name" />

5. Click **OK** to save.

## Connecting to IOMETE

With the driver registered, you can open a connection and browse your data.

1. Click **New Database Connection** and select the **IOMETE Arrow Flight SQL** driver.

2. Find your connection details in the IOMETE Console: **Compute → select a compute → Connections tab → Arrow Flight**. Copy the JDBC connection string.

3. Paste it into the **JDBC URL** field (it looks like `jdbc:arrow-flight-sql://<host>:443?cluster=<cluster>&data-plane=<data-plane>`), then enter your credentials in the **Username** and **Password** fields below it.

   <Img src="/img/database-drivers/dbeaver/dbeaver-connection.png" alt="Connection settings dialog with Arrow Flight JDBC URL, username, and password fields" />

   :::note
   Use an **Access Token** generated in the IOMETE Console as the password.
   :::

4. Click **Test Connection**, then **Finish**.

If the connection succeeds, the **Database Navigator** lists your catalogs, schemas, and tables so you can start querying.

<Img src="/img/database-drivers/dbeaver/explorer.png" alt="Database Navigator showing IOMETE catalogs and tables" />

## Resources

<GridBox>
  <Card
    title="Arrow Flight SQL JDBC Driver"
    link="user-guide/driver/arrow-flight-jdbc-driver"
  >
    Configure the IOMETE custom driver, including proxy tunneling, query timeout, and named parameters.
  </Card>
  <Card
    title="Hive JDBC Driver"
    link="user-guide/driver/hive-jdbc-driver"
  >
    Legacy HiveServer2 driver. Use only if Arrow Flight SQL is not an option.
  </Card>
</GridBox>
