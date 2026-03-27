---
title: Browsing with Data Explorer
description: Browse catalogs, databases, and tables in a hierarchical tree using the Data Explorer tab in IOMETE's Data Catalog.
sidebar_label: Data Explorer
last_update:
  date: 03/26/2026
  author: Abhishek Pathania
---

import Img from '@site/src/components/Img';

When you don't have a specific table in mind, the **Data Explorer** tab lets you browse catalogs, databases, and tables level by level.

<Img src="/img/data-catalog/catalog-list.png" alt="Data Explorer catalog list showing Name, Type, Location, Size, Databases, and Tables columns" />

## Navigating the Hierarchy

The hierarchy works like a file browser: start at catalogs, then drill into databases and tables. Open the **Data Explorer** tab to land on the catalog list, and click any name to go deeper.

At each level you'll see different columns:

- **Catalog list**: **Name**, **Type**, **Location** (monospace), **Size** (Iceberg tables, latest snapshot only), **Databases**, and **Tables**.
- **Database list** (after clicking a catalog): **Name**, **Size**, and **Tables / Views** (format: "N / M").
- **Table list** (after clicking a database): **Name**, **Type** (`Table` or `View`), **Size** (latest snapshot), and **Number of files**. The header also includes a **Register Table** button for adding external tables (see [Register Table](../register-table)).

<Img src="/img/data-catalog/database-list.png" alt="Database list showing Name, Size, and Tables/Views columns" />

<Img src="/img/data-catalog/table-list.png" alt="Table list showing Name, Type, Size, and Number of files columns with Register Table button" />

Click any table name to open the [detail view](./table-details).

:::info Size Values
Size values reflect only Iceberg tables at their latest snapshot. Total storage may be higher because snapshot history and metadata aren't included.
:::
