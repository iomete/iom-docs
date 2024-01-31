---
title: Data Catalog
description: Discover the power of efficient data management with our Data Catalog. Streamline exploration, enhance collaboration, and ensure data quality, all in one centralized hub.
last_update:
  date: 01/29/2024
  author: Nurlan Mammadov
---

import Img from '@site/src/components/Img';
import { Star } from "@phosphor-icons/react";

Smart way to find and manage your data in one place.

<Img src="/img/user-guide/data-catalog/data-catalog.png" alt="IOMETE Data Catalog"/>

---

<!-- :::info
Data catalogs are a quick and affordable way to organize and classify an organization's growing, scattered data assets.
::: -->

## How it works?

The **IOMETE** Data Catalog is a powerful tool for organizations looking to manage and get the most out of their data. It helps you find data easily, encourages teamwork, maintains data accuracy, and supports overall data management efforts.

<Img src="/img/user-guide/data-catalog/search-and-filter.png" alt="How IOMETE Data Catalog works"/>

### Search

The Search functionality in the **IOMETE** Data Catalog empowers users to quickly locate relevant information across various fields. When you type a query into the search input, the system intelligently searches through the following fields:

- **Display name:** The user-friendly display name of a table.
- **Name:** The internal name or identifier of the table.
- **Schema:** The schema or database where the table is located.
- **Description:** Any descriptive information about the table.
- **Column names:** Names of individual columns within the table.
- **Column tags:** Tags associated with columns, providing additional metadata.
- **Column descriptions:** Descriptions of individual columns.
- **Tags:** General tags associated with the table.

:::info
If your search **text** matches the **Display name**, you will notice that the display name in the result card section is specially <code style={{color:'blue', backgroundColor:'#ffe58f'}}>highlighted</code>. This visual cue makes it easier for users to quickly identify and focus on the most relevant information in the search results.
:::

### Filters

The **IOMETE** Data Catalog offers a powerful filtering mechanism to streamline the process of finding specific tables. Users can utilize various filters to narrow down their search based on specific criteria. Here's how the filters work:

- **SCHEMAS:** Filter tables based on the schema or database where they are located.
- **TAGS:** Refine results by applying tags associated with tables, providing additional metadata.
- **COLUMN TAGS:** Narrow down your search by filtering tables based on tags associated with individual columns.
- **TABLE TYPE:** Categorize tables by their type to quickly identify specific data structures.
- **PROVIDER:** Filter tables based on the data provider or source.

:::info
By combining these filters, users can tailor their search and quickly locate the exact information they need. The filtering options enhance the precision of searches, offering a more targeted and efficient data exploration experience within the Data Catalog.
:::

### Result

The Result section serves as the primary description of a table, offering key information at a glance. It includes:

- **Table Details**: Displaying essential information such as table name, database name, rows count, columns count, type, tags, owners, and a <Star size={18} color="#d8bd14" weight="fill" /> icon for adding or removing from favorites.

- **Navigation to Details**: Clicking on the **table name** within the result section directs you to the **detailed** information page for that specific table.

:::info
The Result section is designed to provide a quick overview of each table in your search results, allowing efficient data exploration and immediate access to more detailed information when needed.
:::

### Favorites

Effortlessly manage your preferred tables in the **IOMETE** Data Catalog:

1. **Add Tables**: Click the <Star size={18}  /> icon to add a table to your favorites.
2. **View Favorites**: Find them quickly in the "FAVORITES" section.
3. **Remove Tables**: Click the highlighted <Star size={18} color="#d8bd14" weight="fill" /> icon to remove a table.

:::info
Use Favorites to streamline your workflow, accessing and managing your most important tables in the Data Catalog. It's a personalized and user-friendly tool, enhancing your overall experience with data exploration and utilization.
:::

## Details

The Details Page in the **IOMETE** Data Catalog provides a comprehensive view of each table, offering in-depth information for thorough understanding and management. Here's what you can expect on the Details Page:

- [General Information](#general-information)
- [Metric Cards](#metric-cards)
- [Columns Overview](#columns-overview)

### General Information

<Img src="/img/user-guide/data-catalog/details-general-info.png" alt="Catalog table details"/>

View essential details about the table, including its name, creation date, last update, and the most recent synchronization.

#### Details

In this section, discover information about the data provider, database, table type, owners, labels (tags), and a description. You can conveniently add or remove owners and labels (tags), and for the description, you have the flexibility to edit and support not only text format but also **markdown** format.

### Metric Cards

Obtain valuable insights with visual representations that conveniently display data size, file count, as well as the number of rows and columns in easily digestible graphical formats.
<Img src="/img/user-guide/data-catalog/visual-cards.png" alt="Data Catalog table visualization cards"/>

### Columns Overview

The detailed table provides information on each column, showcasing its name, data type, associated tags, and descriptions. You can conveniently modify or add tags and descriptions directly within this table, with support for **markdown** format in descriptions.

<Img src="/img/user-guide/data-catalog/table-columns.png" alt="Data Catalog table columns"/>

## Summary

The **IOMETE** Data Catalog is your central hub for effective data management. Easily explore and manage tables with the powerful search and filtering options. The Result and Details Pages offer intuitive overviews, while the ability to add favorites and customize data descriptions enhances your experience. Whether you're navigating general details, modifying columns, or delving into specific tables, the Data Catalog streamlines your workflow, providing a user-friendly environment for efficient data exploration and utilization.
