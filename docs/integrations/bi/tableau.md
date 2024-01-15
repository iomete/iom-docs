---
title: Tableau - Connecting to IOMETE
sidebar_label: Tableau
description: In this guide, we will explain how to effortlessly integrate IOMETE with one of the most popular BI tools Tableau
image: img/guides/iomete-tableau-integration/iomete-tableau.png
---

# Tableau - Connecting to IOMETE

import Img from '@site/src/components/Img';

In this guide, we will explain how to effortlessly integrate **IOMETE** with one of the most popular BI tools: Tableau.

## What is Tableau?

Tableau is an Business Intelligence, Reporting and Dashboarding tool. Data has limitless potential to transform businesses and the world as long as people are empowered to use it. Tableau is used to build a data culture and to change lives while providing access to the data.

### Tableau should be accessible from cloud

Tableau can be directly connected from the tableau cloud page.

### Add IOMETE as the data source

The next step is to connect the IOMETE Lakehouse to Tableau.

Create a new workbook in Tableau. Once new workbook interface is opened up, you will have the following menu, where you need to add a new data source:

<Img src="/img/guides/iomete-tableau-integration/iomete-data-source.png" alt="IOMETE data source"/>

After clicking on the “New Data Source”, an option would be provided to select a source. Then click on “Connectors” tab. In the Connectors tab, select **Spark SQL** as your database:

<Img src="/img/guides/iomete-tableau-integration/spark-sql-database.png" alt="Spark SQL database"/>

Once Spark SQL is selected following pop-up would be provided, and then you should be able to enter the details for connecting to IOMETE Lakehouse. Server details can be found in your “Lakehouse” which you want to connect for analytical purposes.

<Img src="/img/guides/iomete-tableau-integration/connect-iomete-lakehouse.png" alt="connect IOMETE lakehouse"/>

All connection properties can be extracted from the connection string, from the “lakehouse” details sheet in IOMETE (sample picture below):

| Connection     | SparkThriftServer(Spark1.1 and later) |
| -------------- | ------------------------------------- |
| Server         | \{domain or IP address}               |
| Port           | \{server port}                        |
| Authentication | Username and Password                 |
| Username       | \{your user name}                     |
| Password       | \{personal access token}              |
| Transport      | HTTP                                  |
| HTTP Path      | lakehouse/\{lakehouse name}           |

<Img src="/img/guides/iomete-tableau-integration/tableau-spark-sql-driver.png" alt="IOMETE lakehouse details"/>

Once the platform is connected, it would appear as a database as presented below with name “Fuad”. And then the “Schema” provides list of schemas from which tables can be selected for reporting purposes.

In the following example, “sample_db” schema is selected and then “employees_proxy” database is previewed before it’s used part of the report to be generated.

<Img src="/img/guides/iomete-tableau-integration/tableau-schema-connector.png" alt="Tableau schema connector"/>

Looking at the table details helps to understand the data types and based on which the reporting can take place.

The report requirement is to generate the gender equality for recruitment within organization across years.

<Img src="/img/guides/iomete-tableau-integration/table-report.png" alt="table report"/>

Once table is selected we can add a report to the sheet, by adding a attribute (”Hire Date”) to the report Sheet. It’s done by clicking on the “Add to Sheet” after right-clicking on a attribute. Hire Date is important to understand which year an employee is recruited and on-boarded into the organization.

<Img src="/img/guides/iomete-tableau-integration/report-to-sheet-tableau.png" alt="report to sheet Tableau"/>

Gender provides the details on which gender has been recruited during that period.

<Img src="/img/guides/iomete-tableau-integration/gender-sheet-tableau.png" alt="gender sheet tableau"/>

Then we need to add number of employees onboarded each year, such that count of the number of employees joined is put on a table.

<Img src="/img/guides/iomete-tableau-integration/employees-sheet-tableau.png" alt="employees sheet tableau"/>

Once the counts are there, then in Tableau a visualization can be chosen to present the report.

A nice looking dashboard presenting the information of required report. Tableau and IOMETE work together seamlessly, lets get connected to take your data analytics to next level.

<Img src="/img/guides/iomete-tableau-integration/iomete-tableau-dashboard.png" alt="IOMETE Tableau dashboard"/>

<br/>

### How to connect to IOEMTE using Spark SQL by CData connector

1. Download [Tableau](https://www.tableau.com/products/desktop/download) and install.
2. Download tableau [Spark SQL by CData](https://www.cdata.com/drivers/spark/tableau) and install.
3. Open tableau.
4. Click To a server and find **Spark SQL by CData** and click.
5. Enter following properties.

| Parameter      | Value                       |
| -------------- | --------------------------- |
| **General**    |                             |
| Server         | \{domain or IP address}     |
| Port           | \{server port}              |
| Auth Scheme    | Plain                       |
| User           | \{your user name}           |
| Password       | \{personal access token}    |
| **Advanced**   |                             |
| Transport Mode | HTTP                        |
| HTTP Path      | lakehouse/\{lakehouse name} |
| Use SSL        | True                        |

<!-- spark-sql-by-cdata-driver.png -->
<Img src="/img/guides/iomete-tableau-integration/spark-sql-by-cdata-driver.png" alt="IOMETE tableau CData connector" maxWidth="600px"/>
