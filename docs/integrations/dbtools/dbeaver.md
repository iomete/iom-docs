---
title: DBeaver
description: Use IOMETE JDBC Driver for seamless integration with DBeaver database tool.
last_update:
  date: 08/01/2024
  author: Fuad Musayev
---

import Img from '@site/src/components/Img';

IOMETE warehouse JDBC endpoints are compatible with Hive JDBC drivers. But due to recent SSL issues, we have released a fixed version of the driver. If you wish to use the JDBC driver must download it from our GitHub repository and include it as a library in their project.

## Download the Driver
Visit our GitHub repository [iomete-artifacts](https://github.com/iomete/iomete-artifacts) and download the latest version of the Hive JDBC driver `hive-jdbc-3.1.3-standalone.jar`.

## Using JDBC driver for DBeaver connection

1. Open DBeaver and navigate to the `Database` menu.
2. Click on `Driver Manager`.
   <Img src="/img/database-drivers/dbeaver/driver-manager.png" alt="Driver Manager" />
3. Click on `New` to add a new driver.
4. Set Driver Name as `IOMETE` and Driver Type `Hive`.
5. Switch to the Libraries tab and click on `Add File`.
6. Select the downloaded `hive-jdbc-3.1.3-standalone.jar` file and then in the `Driver class` section click `Find Class` (if it won't work try saving the newly created driver and edit again).
   <Img src="/img/database-drivers/dbeaver/driver-libs.png" alt="Add File" />
7. Switch back to `Setting` tab and make sure that driver class name are filled correctly. (Should be done automatically)
   <Img src="/img/database-drivers/dbeaver/driver-settings.png" alt="Driver Settings" />
8. Click `OK` to save the driver.

### Connection settings
In order to connect to the IOMETE lakehouse using newly created driver, click on `New Database Connection` and select the `IOMETE` driver from the list.  
You can find the connection details in the IOMETE Console by navigating to the necessary lakehouse and switching to the `Connections` tab (Select `JDBC` option).  


Fill the connection details as in the example image below.  

<Img src="/img/database-drivers/dbeaver/dbeaver-connection.png" alt="Connection Settings" />

:::note
For the password field, you should use the Access Token key generated in the IOMETE Console.
:::

After successfully connecting to the lakehouse, in the `Database Navigator` you can see the list of tables and views available in the lakehouse as in the screenshot below.

<Img src="/img/database-drivers/dbeaver/explorer.png" alt="Database Navigator" />