---
title: Query Results & Settings
description: Explore query results with data grids, charts, and CSV export, and configure SQL Editor settings like query limits and connection resets.
sidebar_label: Query Results & Settings
last_update:
  date: 03/26/2026
  author: Abhishek Pathania
---

import Img from "@site/src/components/Img";

After you [run a query](/user-guide/sql-editor/running-queries), the results panel lets you explore raw data in a grid, build quick charts, review the executed SQL, and export results. This page also covers SQL Editor settings like query limits and connection resets.

## Viewing Query Results

### Data View

Results load into a sortable, filterable data grid. Hover over any column header to reveal the filter icon, then click it to filter by "contains," "equals," or other conditions.

<Img src="/img/user-guide/sql-editor/query-results/data-view.png" alt="Query results data grid with sortable and filterable columns" />

### Chart View

To visualize your results, click the **Chart** tab. Choose from Bar (default), Line, Area, Pie/donut, Scatter, Treemap, Composed (multiple series types on one chart), Big Number, or Text.

The configuration panel on the right lets you customize:

- **Dimension** (X-axis) and **Measure** (Y-axis) with aggregation (`count`, `sum`, `avg`, `min`, `max`, `value`)
- **Legend** visibility and position
- **Axis settings** (show/hide labels, label rotation)
- **Stacking** for applicable chart types
- **Series/Segment colors** per series or segment

<Img src="/img/user-guide/sql-editor/query-results/chart-view.png" alt="Chart view with line chart and configuration panel for axis, legend, and appearance settings" />

### SQL View

This tab displays the exact SQL that executed, with all query variables resolved to their runtime values. Handy for verifying that substitutions worked as expected.

<Img src="/img/user-guide/sql-editor/query-results/sql-view.png" alt="SQL view showing the executed query with resolved variable values" />

### Exporting Results as CSV

Click the **CSV** icon in the results header to download your results as `data.csv`. This requires both the `sql_editor.export` permission and the `downloadQueryResults` module. If either is missing, the button is disabled and its tooltip explains why.

<Img src="/img/user-guide/sql-editor/query-results/csv-export.png" alt="Results panel with Export result as CSV tooltip on the CSV button" />

### Results Header

The results header gives you a quick summary: **query duration**, **row count** (e.g., "42 rows"), and a **status badge** that stays visible until the query completes. The **CSV export** button sits at the far right.

<Img src="/img/user-guide/sql-editor/query-results/results-header.png" alt="Results header showing query duration, row count, Data/Chart/SQL tabs, and CSV export button" />

## SQL Editor Settings

When you need to tweak query limits or recover from a stuck session, open the settings drawer. Click the **SQL Settings** button (gear icon) in the toolbar.

<Img src="/img/user-guide/sql-editor/query-results/sql-settings.png" alt="Toolbar with SQL Settings gear icon tooltip" />

### Query Limit

By default, queries return up to 100 rows. To change this, set the **Rows limit** (1 to 10,000) and click **Save**. The limit is stored in your browser and applies to all queries you run from it.

<Img src="/img/user-guide/sql-editor/query-results/sql-settings-query-limit.png" alt="SQL Settings dialog showing the Query Limit tab with Rows limit set to 100" />

### Resetting the Connection

If your database session enters an unexpected state (for example, a hung transaction), you can reset it:

1. Open **SQL Settings** (gear icon).
2. Switch to the **Reset Connection** tab.
3. Click the red **Reset connection** button.

A notification confirms the reset.

### Formatting SQL

Click **Format SQL** (beautify icon) in the toolbar to auto-format your SQL. This button is disabled for read-only [worksheets](/user-guide/sql-editor/worksheets) (Git or shared).
