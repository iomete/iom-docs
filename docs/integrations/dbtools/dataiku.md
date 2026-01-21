---
title: Dataiku
description: Connect Dataiku to IOMETE using the Arrow Flight SQL JDBC Driver.
last_update:
  date: 2026-01-21
  author: Altay Aliyev
---

import Img from '@site/src/components/Img';

This guide walks you through connecting Dataiku to IOMETE using the Arrow Flight SQL JDBC driver.

## Prerequisites

- A running IOMETE cluster with an active compute resource
- Access to the Dataiku Administration panel
- Your IOMETE username and personal access token

## Download the JDBC Driver

Download the Arrow Flight SQL JDBC driver from Maven Central:

<a href="https://repo1.maven.org/maven2/org/apache/arrow/flight-sql-jdbc-driver/16.1.0/flight-sql-jdbc-driver-16.1.0.jar" download>
  flight-sql-jdbc-driver-16.1.0.jar
</a>

Save the JAR file to a directory accessible by your Dataiku instance.

## Configure the Connection in Dataiku

### Step 1: Open the Administration Panel

Navigate to the **Administration** section from the Dataiku home screen.

<Img src="/img/integrations/dataiku/admin-panel.png" alt="Dataiku Administration Panel" />

### Step 2: Access Connections

Select **Connections** from the left-hand menu.

<Img src="/img/integrations/dataiku/connections-panel.png" alt="Dataiku Connections Panel" />

### Step 3: Create a New SQL Connection

Search for **Other** and select **Other SQL databases**.

<Img src="/img/integrations/dataiku/database-panel.png" alt="Selecting Other SQL databases" />

### Step 4: Configure the Connection

You will see the connection setup form:

<Img src="/img/integrations/dataiku/new-sql-database.png" alt="New SQL Database Connection Form" />

Fill in the following settings:

| Field | Value |
|-------|-------|
| **JDBC driver class** | `org.apache.arrow.driver.jdbc.ArrowFlightJdbcDriver` |
| **JDBC URL** | Your IOMETE compute JDBC connection string (remove any embedded username/password) |
| **Driver jars directory** | Path to the directory containing the downloaded JAR file |
| **SQL dialect** | `SparkSQL (via JDBC)` |
| **User** | Your IOMETE username |
| **Password** | Your IOMETE personal access token |
| **Can browse catalogs** | ✓ Enabled |

:::tip Finding Your JDBC URL
You can find the JDBC connection string in the IOMETE console under your compute resource's connection details. Make sure to remove any `user` and `password` parameters from the URL, as these are configured separately.
:::

## Verify the Connection

After saving your configuration, use Dataiku's **Test** button to verify the connection. Once successful, you can start creating datasets and running queries against your IOMETE lakehouse.