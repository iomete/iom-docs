---
title: DataGrip Lakehouse Connection
description: DataGrip Lakehouse Connection
slug: /user-guide/datagrip-lakehouse-connection
last_update:
  date: 11/17/2024
  author: Vugar Dadalov
---

---

IOMETE warehouse JDBC endpoints are compatible with Hive JDBC drivers. But due to recent SSL issues, we have released a fixed version of the driver. If you wish to use the JDBC driver must download it from our GitHub repository and include it as a library in their project

### Download the Driver

Visit our GitHub repository [iomete-artifacts](https://github.com/iomete/iomete-artifacts) and download the latest version of the Hive JDBC driver hive-jdbc-3.1.3-standalone.jar.

### Using JDBC driver for DataGrip connection

- **Registering the IOMETE Driver to DataGrip**

  1. Open DataGrip and click on the `Data Source Properties` button from the toolbar. Or from the menu, `File` -> `Data Sources`.
     ![datagrip registration1](/img/misc/register1.png)

  2. Switch to the `Drivers` tab and click on the `+` button to add a new driver.
     ![datagrip registration2](/img/misc/register2.png)

  3. Add the downloaded driver file (hive-jdbc-4.0.1-standalone.jar) , and make sure org.apache.hive.jdbc.HiveDriver is selected as the driver class. And, provide a name for the driver (e.g., IOMETE).
     ![datagrip registration3](/img/misc/register3.png)

  4. From the `Options` tab, choose the dialect as `Apache Spark`, and optionally choose Icon.
     ![datagrip registration4](/img/misc/register4.png)

  5. Click on the **OK** button to save the driver.

- **Creating a new Data Source for IOMETE**

  1. Click on the `Data Source Properties` button from the toolbar. Or from the menu, `File` -> `Data Sources`.

  2. Switch to the `Data Sources` tab and click on the `+` button to add a new data source.
     ![Datagrip datasource1](/img/misc/datasource1.png)

  3. Provide connection details
     :::info
     You can find the connection details in the IOMETE Console by navigating to the necessary lakehouse and switching to the Connections tab (Select JDBC option).
     ![Datagrip datasource2](/img/misc/datasource2.png)
     :::

  4. And, click on the `Test Connection` button to verify the connection.
     ![Datagrip datasource3](/img/misc/datasource3.png)
