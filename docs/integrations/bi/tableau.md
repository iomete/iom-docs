---
title: Tableau - Connecting to IOMETE
sidebar_label: Tableau
description: Connect Tableau to IOMETE using the built-in Spark SQL driver or the CData Spark SQL connector to build interactive dashboards and reports on your lakehouse data.
image: img/guides/iomete-tableau-integration/iomete-tableau.png
last_update:
  date: 04/06/2026
  author: Nurlan Mammadov
---

import Img from '@site/src/components/Img';
import GridBox from "@site/src/components/GridBox";

## Overview

If you're using Tableau for dashboards and reporting, you can point it straight at your IOMETE data. There's no need to copy anything into a separate analytics database.

Two connection methods are available:

- **Spark SQL driver**: Tableau's built-in Spark SQL connector (recommended)
- **CData Spark SQL connector**: a third-party option from CData

Both use the Spark Thrift Server (Hive2 protocol) over HTTP transport, which is enabled by default on every IOMETE compute cluster.

## Prerequisites

You'll need a few things in place before connecting Tableau to IOMETE:

- A **running IOMETE compute cluster** ([setup instructions](/user-guide/compute-clusters/overview))
- **Tableau Desktop** or **Tableau Cloud** ([download Tableau Desktop](https://www.tableau.com/products/desktop/download))
- A **Personal Access Token** for authentication, since Tableau doesn't accept regular passwords ([how to create one](/user-guide/access-tokens/personal))
- For the CData method only: the [Spark SQL by CData](https://www.cdata.com/drivers/spark/tableau) connector

## Finding Connection Parameters

You don't need to assemble connection strings by hand. IOMETE generates them for each compute cluster.

1. Open **Compute** from the sidebar.
2. Click the cluster you want to connect.
3. Select the **Connections** tab.
4. Click the **Tableau** card.

{/* 📸 SCREENSHOT NEEDED: Compute detail page showing the Connections tab with the Tableau card selected */}

You'll see two parameter tables, one for the **Spark SQL Driver** and one for **Spark SQL by CData**. Every value is pre-filled for your environment. Hover over any value and click the copy button to grab it.

## Connecting Using the Spark SQL Driver

This is the simplest path because Tableau ships with a built-in Spark SQL connector. Nothing extra to install.

1. Open Tableau and create a new workbook (or open an existing one).
2. Click **New Data Source**.

<Img src="/img/guides/iomete-tableau-integration/iomete-data-source.png" alt="Adding a new data source in Tableau"/>

3. Go to the **Connectors** tab and select **Spark SQL**.

<Img src="/img/guides/iomete-tableau-integration/spark-sql-database.png" alt="Selecting Spark SQL from Tableau connectors"/>

4. Fill in the Spark SQL connection dialog with these parameters:

| Parameter | Value |
|-----------|-------|
| **Connection** | SparkThriftServer (Spark 1.1 and later) |
| **Server** | Your IOMETE platform hostname (shown as `HOST_NAME` in the console) |
| **Port** | `443` for HTTPS or `80` for HTTP (shown as `PORT` in the console) |
| **Authentication** | Username and Password |
| **Username** | Your IOMETE user ID |
| **Password** | \{[personal access token](/user-guide/access-tokens/personal)} |
| **Transport** | HTTP |
| **HTTP Path** | `/data-plane/\{namespace\}/lakehouse/\{compute-name\}` |
| **SSL** | Check **Require SSL** if your platform uses HTTPS |

<Img src="/img/guides/iomete-tableau-integration/tableau-spark-sql-driver.png" dark="/img/guides/iomete-tableau-integration/tableau-spark-sql-driver-dark.png" alt="Spark SQL driver connection parameters in IOMETE console"/>

:::warning Personal Access Token Required
The **Password** field takes a **Personal Access Token**, not your account password. Generate one under **Settings > Access Tokens** in the IOMETE console. See [Creating a Personal Access Token](/user-guide/access-tokens/personal).
:::

:::info HTTP Path Format
The HTTP Path includes `lakehouse` in the URL (e.g., `/data-plane/default/lakehouse/my-compute`). Copy it exactly as shown in the IOMETE console, including the leading `/`.
:::

5. Click **Sign In**.
6. Once connected, your IOMETE database appears. Select a **Schema** to browse its tables.

<Img src="/img/guides/iomete-tableau-integration/tableau-schema-connector.png" alt="Selecting a schema in Tableau after connecting to IOMETE" maxWidth="400px"/>

7. Drag tables into the canvas to begin building your reports and dashboards.

<Img src="/img/guides/iomete-tableau-integration/connect-iomete-compute.png" alt="Connecting to IOMETE compute from Tableau"/>

## Connecting Using the CData Spark SQL Connector

If you need the extra configuration options that CData offers, use this method instead. It requires a separate connector install.

1. Install [Tableau Desktop](https://www.tableau.com/products/desktop/download) and the [Spark SQL by CData](https://www.cdata.com/drivers/spark/tableau) connector.
2. Open Tableau.
3. Click **To a server**, then select **Spark SQL by CData**.

<Img src="/img/guides/iomete-tableau-integration/spark-sql-by-cdata-driver.png" alt="Selecting Spark SQL by CData connector in Tableau" maxWidth="600px"/>

4. Enter the following connection parameters.

**General tab:**

| Parameter | Value |
|-----------|-------|
| **Server** | Your IOMETE platform hostname |
| **Port** | `443` for HTTPS or `80` for HTTP |
| **Auth Scheme** | Plain |
| **User** | Your IOMETE user ID |
| **Password** | \{[personal access token](/user-guide/access-tokens/personal)} |

**Advanced tab:**

| Parameter | Value |
|-----------|-------|
| **Transport Mode** | HTTP |
| **HTTP Path** | `/data-plane/\{namespace\}/lakehouse/\{compute-name\}` |
| **Use SSL** | True |

<Img src="/img/guides/iomete-tableau-integration/tableau-spark-sql-c-data-driver.png" dark="/img/guides/iomete-tableau-integration/tableau-spark-sql-c-data-driver-dark.png" alt="CData Spark SQL connector parameters in IOMETE console"/>

:::warning Personal Access Token Required
The **Password** field takes a **Personal Access Token**, not your account password. See [Creating a Personal Access Token](/user-guide/access-tokens/personal).
:::

5. Click **Connect**.

## Building a Dashboard

With the connection in place, you're ready to turn your IOMETE data into visualizations.

1. Select a schema, drag tables into the canvas, then click **Sheet 1** to open a new sheet.

<Img src="/img/guides/iomete-tableau-integration/table-report.png" alt="Table data preview in Tableau"/>

2. Right-click a dimension or measure and select **Add to Sheet**.

<Img src="/img/guides/iomete-tableau-integration/report-to-sheet-tableau.png" alt="Adding a field to a Tableau sheet" maxWidth="400px"/>

3. Drag additional fields into rows, columns, or filters to refine the report.

<GridBox>
<Img src="/img/guides/iomete-tableau-integration/gender-sheet-tableau.png" alt="Adding gender dimension to the Tableau report" maxWidth="400px"/>

<Img src="/img/guides/iomete-tableau-integration/employees-sheet-tableau.png" alt="Adding employee count to the report" maxWidth="400px"/>
</GridBox>

4. Pick a visualization type and customize the layout to finish your dashboard.

<Img src="/img/guides/iomete-tableau-integration/iomete-tableau-dashboard.png" alt="Completed Tableau dashboard with IOMETE data"/>

## Next Steps

- [Creating a Personal Access Token](/user-guide/access-tokens/personal): generate tokens for Tableau authentication
- [Compute Clusters](/user-guide/compute-clusters/overview): create and manage the compute clusters Tableau connects to
- [Power BI](./power-bi): connect Power BI to IOMETE as an alternative BI tool
