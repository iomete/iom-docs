---
title: Query History
description: Browse, search, and revisit every SQL query you have run in the IOMETE SQL Editor, including results, statuses, and CSV export.
sidebar_label: Query History
last_update:
  date: 02/27/2026
  author: Abhishek Pathania
---

import Img from "@site/src/components/Img";

Every query you run in the SQL Editor is automatically captured in your Query History, giving you a complete, searchable record of your work.

Instantly revisit past queries, inspect results, export data as CSV, review compute logs for failed runs, or cancel queries that are still in progress. Whether you're troubleshooting an issue, validating results, or sharing outputs with your team, everything you need is just a click away.

Query history is scoped per user, ensuring you only see and manage the queries you created.


## Browsing Query History

The query history panel gives you quick access to everything you've run recently. It lives in the SQL Editor's left sidebar.

1. Open the **SQL Editor** from the main sidebar.
2. In the left sidebar, click the **clock icon** tab (the third tab).
3. The **Query History** panel loads with a scrollable list of your recent queries.
4. Each query card displays:
   - A colored **status indicator** icon (see [Understanding Query Statuses](#understanding-query-statuses))
   - The **SQL statement** text (truncated to a single line)
   - The **database name** (`catalog.schema`)
5. Click any card to open that query's detail view.

The panel header includes a **Refresh** button that reloads the list from the server.

:::info Query Limit
The history list returns up to 1,000 queries per request. If you need older queries, adjust the time range filter.
:::

### Empty State

When no queries match your current filters, the panel displays:

> *"There are no queries to display for the selected date range and search term."*

## Searching and Filtering Queries

Narrowing down your history is useful when you're looking for a specific query among hundreds of past runs.

### Searching Queries

The **Search** field at the top of the history panel filters the loaded list as you type. It matches against the SQL statement text (case-insensitive). Clear the field to show all queries again.

Search is client-side only, so it filters queries already loaded from the server. To find queries outside your current time range, adjust the time range filter first.

### Filtering by Time Range

1. Click the **time range button** next to the search field (it displays the current selection, e.g., "Last 1 hour").
2. A popover opens with two panels:
   - **Left panel**: Predefined relative ranges. Click any option to apply it immediately.
   - **Right panel**: An **Absolute time range** form with **From** and **To** date fields, each showing your browser's timezone offset (e.g., "UTC+05:30"). Enter dates in `YYYY-MM-DD HH:mm:ss` format or use the calendar picker, then click **Apply**.
3. The query list refreshes to show queries within the selected range.

The default time range is **Last 1 hour**.

## Viewing Query Details

Sometimes you need more than the one-line preview in the history list. The detail view gives you the full picture of any query.

1. Click a query card in the history list, or navigate directly to `/:domain/sql/history/:queryId`.
2. The **Query details** page loads with two tabs: **Details** and **Data Result**.

If the query isn't found, the page displays an error message with a back button.

When you view a query that's still running, the detail page refreshes every 8 seconds until the query reaches a terminal status.

### Details Tab

The **Details** tab lists key metadata about the query:

| Field | Description |
|-------|-------------|
| **ID** | The unique query identifier |
| **Status** | Current status with icon and message |
| **Compute** | The compute cluster that ran the query |
| **Catalog & Schema** | The catalog and schema context (`catalog.schema`) |
| **Duration** | Elapsed time (updates live while the query runs) |
| **Start time** | When the query began executing |
| **Finish time** | When the query reached a terminal status |

### Data Result Tab

The **Data Result** tab displays query output and includes a **Fullscreen** toggle. A segmented control in the footer lets you switch between three views.

**Data segment (default)** presents results in an interactive data grid with sortable, resizable, and filterable columns. Numeric columns use a number filter; all others use a text filter. A pinned row-number column appears on the left, and cell text selection is enabled. Double-click any cell to open a popup with the full, untruncated value.

The footer bar shows the **query duration**, **row count** (e.g., "5 rows"), and the current **status badge** if the query isn't completed.

**Chart segment** visualizes results using one of nine chart types: `line`, `area`, `bar`, `pie`, `scatter`, `treemap`, `composed`, `bignumber`, and `text`. The default is `bar`. The chart view uses a split panel: the chart on the left and an **Appearance** configuration panel on the right (resizable, 10-40% width).

:::warning Chart Row Limit
Charts are limited to 1,000 rows. If your result set exceeds this, the chart segment displays: *"Dataset too large for visualization (over 1000 rows). Consider filtering your data."* Other edge-case messages include *"No columns provided for visualization"* and *"No data rows available for visualization."*
:::

**SQL segment** is a read-only code viewer showing the original SQL statement with syntax highlighting and line wrapping.

### Non-Completed Query States

While a query runs or data loads, the result area displays a live-updating **duration** counter and a spinner with contextual status text:

- *"Query executing"* when the query is running
- *"Checking status..."* when refreshing the query status
- *"Fetching data..."* when loading result data

A **Cancel** button also appears (see [Cancelling a Running Query](#cancelling-a-running-query)).

If a query reaches a non-completed terminal status (e.g., `FAILED`, `CANCELLED`), the result area shows the error message or status name.

## Cancelling a Running Query

If a query is taking too long or you realize it's wrong, you can stop it mid-execution.

1. Open the detail view for a running query.
2. Click the **Cancel** button in the loading area.
3. The query transitions to `CANCELLED` status.

The **Cancel** button is only active when the query status is `RUNNING`. It's disabled during the `CANCELLING` transition. If the query finishes before the cancel request reaches the server, the system returns the current status with: *"Query \{queryId\} already finished or aborted"*.

## Exporting Results as CSV

Need your query output in a spreadsheet? CSV export has you covered.

1. Open a completed query's **Data Result** tab.
2. In the footer bar, click the **CSV download** button (CSV icon). This button appears only when the query returned at least one row.
3. The server generates a CSV file and streams it to your browser. The downloaded file is named `{queryId}.csv`.

:::info Export Requirements
CSV export has two requirements. First, the `downloadQueryResults` module flag must be enabled for your deployment. If it isn't, the CSV button is hidden entirely. Second, your role needs the **Export** permission under **SQL Editor**. Without it, the button appears but is disabled with the tooltip: *"You don't have permission to export results as CSV"*.
:::

## Viewing Compute Logs

When a query fails, you often need to dig into what went wrong at the compute level. A **Logs** button appears in the result footer for any query with `FAILED` status.

1. Click **Logs**.
2. A full-width modal opens showing the Kubernetes logs from the compute cluster that ran the query.
3. You can download the logs directly from the modal.

## Understanding Query Statuses

Each query moves through a lifecycle. Knowing what each status means helps you quickly spot issues in your history.

```
SUBMITTED → RUNNING → COMPLETED
                    → FAILED
                    → CANCELLED

SUBMITTED → CANCELLED  (cancelled before execution began)

COMPLETED → RESULT_EXPIRED  (result data expired in object storage)
```

| Status | Icon color | Description |
|--------|-----------|-------------|
| `SUBMITTED` | Blue | The query has been submitted and is waiting to execute |
| `RUNNING` | Green | The query is currently executing |
| `COMPLETED` | Gray | The query finished successfully and results are available |
| `CANCELLING` | Orange | A cancel request has been sent; waiting for confirmation |
| `CANCELLED` | Orange | The query was cancelled by the user |
| `FAILED` | Red | The query encountered an error during execution |
| `RESULT_EXPIRED` | Orange | The query completed previously, but result data is no longer available |

:::warning Expired Results
When a query's result data has expired, you see: *"The result data has expired. Please re-run the query."* Run the query again from a worksheet to generate fresh results.
:::

## Real-Time Status Updates

You don't need to keep hitting refresh. The SQL Editor maintains a live connection to receive query status changes as they happen. When a query transitions to `COMPLETED`, `FAILED`, or `CANCELLED`, the update appears in your history list and detail view without a manual refresh.

If the connection drops, the client attempts up to 3 reconnection tries. You can always click **Refresh** in the history panel to reload the list manually.
