---
title: Data Catalog
description: Discover the power of efficient data management with our Data Catalog. Streamline exploration, enhance collaboration, and ensure data quality, all in one centralized hub.
last_update:
  date: 01/29/2024
  author: Nurlan Mammadov
---

import Img from '@site/src/components/Img';
import { Star } from "@phosphor-icons/react";

The IOMETE Data Catalog is a powerful tool designed to help you easily find and manage data.

### Search and Filter

The search feature in the IOMETE Data Catalog helps you easily find the information you need across different fields. Just enter your query in the search bar, apply filters, and the system will smartly search and filter through the following fields:

- **Search fields:**

  - **Name:** The internal name or identifier of the table.
  - **Schema:** The schema or database where the table is located.
  - **Tags:** General tags associated with the table.
  - **Description:** Any descriptive information about the table.
  - **Column names:** Names of individual columns within the table.
  - **Column tags:** Tags associated with columns, providing additional metadata.
  - **Column descriptions:** Descriptions of individual columns.

- **Filter fields:**
  - **SCHEMAS:** Filter tables based on the schema or database where they are located.
  - **TAGS:** Refine results by applying tags associated with tables, providing additional metadata.
  - **COLUMN TAGS:** Narrow down your search by filtering tables based on tags associated with individual columns.
  - **TABLE TYPE:** Categorize tables by their type to quickly identify specific data structures.
  - **PROVIDER:** Filter tables based on the data provider or source.

<Img src="/img/user-guide/data-catalog/search-and-filter.png" alt="How IOMETE Data Catalog works"/>

### Result

The Result section gives you a quick summary of each table in your search results, making it easy to explore and access detailed information. It provides a brief overview of the table's key details for efficient data exploration.

It includes:

- `table name`
- `database name`
- `column count`
- `row count`
- `provider`
- `tags`
- `owners`
- <Star size={18} color="#d8bd14" weight="fill" /> - use the favorite icon to add or remove tables. Click to add to favorites and find them easily in the "FAVORITES" section. Remove a table by clicking the highlighted icon.

<Img src="/img/user-guide/data-catalog/result.png" alt="Data catalog filter result"/>

## Table details

The Details Page in the **IOMETE** Data Catalog provides a comprehensive view of each table, offering in-depth information for thorough understanding and management. Here's what you can expect on the details.

### General information

View important table details like name, creation date, last update, and synchronization status. Access information on data provider, database, table type, owners, tags, and description. Effortlessly manage owners and tags.

<div class="row">
  <div class="col col--6">
  <Img src="/img/user-guide/data-catalog/add-owner.png" alt="Data Catalog add owner" maxWidth="400px"/>
  </div>
  <div class="col col--6">
  <Img src="/img/user-guide/data-catalog/add-tag.png" alt="Data Catalog add tag" maxWidth="400px"/>
  </div>
</div>

You can edit the description in either text or **markdown** format. When you type using markdown, you can preview it at the bottom.

<Img src="/img/user-guide/data-catalog/edit-description.png" alt="Data Catalog edit description" maxWidth="600px"/>

### Metrics and columns

Get quick and clear insights using easy-to-read visuals that show data size, file count, and the number of rows and columns. The detailed table breaks down each column, displaying its name, data type, tags, and descriptions.

<Img src="/img/user-guide/data-catalog/metrics-columns.png" alt="Data Catalog table metrics and table columns"/>

You can also can edit or add tags and descriptions right in the table, with support for **markdown** formatting in descriptions.

<Img src="/img/user-guide/data-catalog/column-tag-add.png" alt="Data Catalog columns tags add"/>
<Img src="/img/user-guide/data-catalog/column-description-edit.png" alt="Data Catalog columns tags add" maxWidth="600px"/>
