---
title: DataGrip Lakehouse Connection
slug: /datagrip-lakehouse-connection
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

<!-- <head>
  <title>DataGrip Lakehouse Connection</title>
  <meta
    name="description"
    content="DataGrip Lakehouse Connection"
  />
</head> -->

___

**Connect to Spark Warehouse through DataGrip** 

1. In DataGrip click on `Add Datasource` and choose `Apache Spark` from dropdown. It should be under the _Others_ section

![datagrip lakehouse connection](/img/misc/datagrip-connection-details.png)


1. If you will see the `Download missing drivers` button below, install them first.

![Datagrip downloading missing drivers](/img/misc/datagrip-downloading-missing-files.png)


- After downloading the required drivers, insert your JDBC connection URL to `URL` field 
  
:::info
You can find the warehouse's JDBC URL on the warehouse's detail page under the JDBC tab
:::


Copy JDBC URL from Connection details

![Datagrip connection details](/img/misc/datagrip-connection-details.png)


1. Then type in your **iomete** user and password into corresponding fields
2. Optionally you can specify the schema (database)

:::warning Check Status
Please take into consideration that **Test Connection** could take couple of minutes if your lakehouse driver is suspended. It takes usually 1-2 minutes to scale up. After that you should be able to Connect to your Lakehouse through JDBC.
:::


![Datagrip connection test](/img/misc/datagrip-connection-tests.png)