---
title: Table Details and Metadata
description: View and manage table statistics, columns, metrics, owners, descriptions, and Iceberg-specific metadata tabs.
sidebar_label: Table Details
last_update:
  date: 03/26/2026
  author: Abhishek Pathania
---

import Img from '@site/src/components/Img';

Click any table name (from search results or the Data Explorer) to open its detail page.

## Page Header

The header helps you confirm you're looking at the right table and quickly grab references for queries. From Data Catalog search, it displays "Table: \{tableName\}" with "Last sync: \{relative time\}" below it. From Data Explorer, you'll see breadcrumb navigation instead.

When accessed from Data Catalog search, the header also includes:

- **Bookmark** button (star icon toggle)
- **Copy** dropdown with three options:
  - **Copy name**: copies `tableName`
  - **Copy full name**: copies `catalogName.databaseName.tableName`
  - **Copy SELECT statement**: copies `SELECT * FROM catalogName.databaseName.tableName LIMIT 100;`

<Img src="/img/data-catalog/page-header.png" alt="Table detail page header with title, bookmark button, and copy dropdown" />

## Details Tab

This tab opens by default when you view a table, giving you the key context up front. It has three sections.

**Statistics** (Iceberg tables only): four metric cards showing **Table size (latest snapshot)** (with a badge comparing it to the database size), **Data files (latest snapshot)**, **Columns**, and **Rows**. Non-Iceberg tables don't display statistics, partitions, or additional metadata.

**Table details**: identity fields like **ID**, **Table name**, **Database**, **Catalog**, **Provider**, and **Type**. Below those you'll find **Owners** (editable; see [Managing Table Owners](#managing-table-owners)) and **Classification tags** (via the [request workflow](./classification-tags)). The section also shows **Pending tag requests** and **Updated** (relative time since last sync).

**Documentation**: the table description, rendered as Markdown. Click **Edit** to update it in a Markdown editor modal.

<Img src="/img/data-catalog/details-tab.png" alt="Details tab showing statistics cards, table details, and documentation sections" />

## Columns Tab

The **Columns** tab is where you go to inspect or annotate individual columns. It lists every column in a searchable table.

Each row displays the column's **Name**, **Data type** (with a type icon), **Classification tags**, and **Description** (rendered as Markdown). Use the actions dropdown on any row to **Edit description** or **Assign classification**. Both go through the [request workflow](./classification-tags). Filter by name with the search box at the top.

<Img src="/img/data-catalog/columns-tab.png" alt="Columns tab with column list, tags, descriptions, and actions dropdown" />

## Metrics Tab

If you're tracking storage growth or diagnosing bloat, this tab surfaces the numbers you need. It's available only for Iceberg tables (other table types show a disabled tab with a tooltip).

The tab repeats the four statistics cards from the Details tab and adds an **All Snapshots** section. This section includes **Total storage size** (physical size across all snapshots), **Total data files**, and a **Live data ratio** pie chart that compares current snapshot data to historical data.

<Img src="/img/data-catalog/metrics-tab.png" alt="Metrics tab showing statistics cards and All Snapshots section with live data ratio" />

:::warning Storage Optimization
If total table size exceeds 100 GB and the live data ratio drops below 40%, a storage optimization alert recommends compaction or snapshot expiration to reduce costs.
:::

## Iceberg-Specific Tabs

Iceberg tables expose richer metadata than other formats, so they get three additional tabs:

- **Table Properties**: Iceberg table properties pulled from metadata.
- **Partitions**: partition layout and details.
- **Snapshots**: snapshot history with charts and a summary table. You can also create branches and tags from individual snapshots.

<Img src="/img/data-catalog/table-properties-tab.png" alt="Table Properties tab showing Iceberg metadata key-value pairs" />

If automated maintenance is enabled, a **Maintenance** tab also appears with configuration and history. See [Table Maintenance](/user-guide/table-maintenance/overview) for details.

## Managing Table Metadata

Good metadata makes tables easier to find and understand. Here's how to keep yours current.

### Editing a Table Description

1. On the table detail page, scroll to **Documentation** in the **Details** tab.
2. Click **Edit**. A Markdown editor modal opens.
3. Write or update the description.
4. Click **Save**.

<Img src="/img/data-catalog/details-tab-documentation.png" alt="Details tab showing documentation content and pending classification tags" />
<Img src="/img/data-catalog/edit-description-modal.png" alt="Edit Description modal with Markdown editor and preview" />

### Managing Table Owners

Owners signal who's responsible for a table's data quality. The **Owners** field in the **Details** section displays current owners as closable tags. Click **+ New user** to choose a user from the searchable dropdown, or click the **X** on an existing tag to remove an owner.

<Img src="/img/data-catalog/table-owner.png" alt="Owners field in Details tab showing current owners as tags and add-user option" />

### Editing a Column Description

1. Open the **Columns** tab and find the column you want to update.
2. Click its actions dropdown and select **Edit description**.
3. Update the text in the Markdown editor.
4. Click **Save**.

<Img src="/img/data-catalog/columns-actions.png" alt="Column actions dropdown showing Edit description and Assign classification options" />
