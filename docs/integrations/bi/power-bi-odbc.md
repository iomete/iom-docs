---
title: Power BI (ODBC) - Connecting to IOMETE
sidebar_label: Power BI (ODBC)
description: Effortlessly integrate IOMETE with Power BI using ODBC Driver - Step-by-step guide to connect, visualize and analyze data. Create reports and visualizations with Power BI resources.
image: img/guides/power-bi/power-bi-connecting-to-iomete.png
---

# Power BI (ODBC) - Connecting to IOMETE


import Img from '@site/src/components/Img';

![Power BI & IOMETE connecting](/img/guides/power-bi/power-bi-connecting-to-iomete.png)

If you need to connect to the default Spark Catalog, and work with Iceberg and Metastore tables, please refer to [Power BI](power-bi.md) documentation. However, if you need to connect to an additional Spark Catalog, you must use the ODBC driver.  

This guide will show you how to connect Power BI to IOMETE using the ODBC driver.  

Let’s get started.  

## Create ODBC Data Source

First, you need to create an ODBC Data Source. Go to the Windows search bar and type `ODBC Data Sources` and click on the `ODBC Data Sources (64-bit)`.  
This will open the ODBC Data Source Administrator.

<Img src="/img/guides/power-bi-odbc/odbc-panel.png" alt="ODBC Data Sources"/>


Click on the `User DSN` tab and then click on the `Add` button. Choose the "Simba Spark ODBC Driver" from the list of drivers and click `Finish`.  
If you don't see the driver in the list, you can download it from the [Simba website](https://www.simba.com/drivers/spark-odbc-jdbc/) or contact us for assistance.  

<Img src="/img/guides/power-bi-odbc/odbc-driver-select.png" alt="Simba Spark ODBC Driver Select"/>

### Data Source Details

Please refer to the IOMETE Platform to get the connection details. Go to the Lakehouse you want to connect and open Power BI tab in the Connections section.  

<Img src="/img/guides/power-bi-odbc/iolake.png" alt="IOMETE lakehouse connection details"/>

Now, fill in the connection details in the ODBC Data Source Administrator as shown below.  

<Img src="/img/guides/power-bi-odbc/odbc-props.png" alt="ODBC Connection Details"/>

Optionally, you can click on the `Advanced` button and add additional properties.  

<Img src="/img/guides/power-bi-odbc/odbc-advanced-props.png" alt="ODBC Connection Details 2"/>

Finally, click on the `Test` button to verify the connection. If everything is correct, you will see a success message.  

<Img src="/img/guides/power-bi-odbc/odbc-test.png" alt="ODBC Test Connection"/>


## Connecting Power BI

Click “Get Data” from the menu and select `ODBC` as a data source.  

<Img src="/img/guides/power-bi-odbc/pb-data-source.png" alt="Power BI data source"/>

Then choose the ODBC Data Source you created and click `Connect`.  

<Img src="/img/guides/power-bi-odbc/pb-source-name.png" alt="Power BI data source name"/>  

After clicking the `OK` button, you will be directed to an authentication page where you can establish a connection and input your username and password.  
You will need to create a Personal Access Token and use as the password. 

<Img src="/img/guides/power-bi-odbc/pb-auth.png" alt="Power BI auth"/>  

Now in the next step, you will see your databases and tables. Select the tables you want to use in Power BI.  

<Img src="/img/guides/power-bi-odbc/pb-schema.png" alt="Power BI auth"/>  

You will have to wait a couple of minutes before Power BI will load the data sets.

Congratulations, you have successfully connected Power BI to IOMETE.

From this point, you can create, save and publish your reports. You can learn how to create dashboards and detailed visualizations with [Power BI resources](https://learn.microsoft.com/en-us/power-bi/).

Thanks.
