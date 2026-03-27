---
title: Running Queries
description: Write, execute, and manage SQL queries in IOMETE worksheets with compute selection, query variables, and real-time status tracking.
sidebar_label: Running Queries
last_update:
  date: 03/26/2026
  author: Abhishek Pathania
---

import Img from "@site/src/components/Img";

Before running anything, you need to point your worksheet at the right compute cluster and database. Once that's set, you can write and execute SQL.

## Selecting a Compute

Click the **compute selector** dropdown in the toolbar and choose a running [compute cluster](/user-guide/compute-clusters/overview). Your selection saves to the worksheet automatically.

## Selecting a Catalog and Database

Click the **catalog** dropdown in the toolbar, then choose a namespace from the **database** dropdown (which activates after you pick a catalog). Both selections persist as `catalog.database` on the worksheet. Each dropdown has a **Refresh** button if you need to reload options. If a previously selected catalog or namespace no longer exists, the dropdown shows an error indicator.

<Img src="/img/user-guide/sql-editor/running-queries/toolbar.png" alt="Worksheet toolbar showing compute selector, catalog and database dropdowns" />

## Writing Queries

The code editor autocompletes SQL keywords, functions, table and column names from your selected catalog, and query variables. It also recognizes table aliases (e.g., typing `e` after `employees as e`). Press **Cmd+Space** (Mac) or **Ctrl+Space** (Windows/Linux) to trigger suggestions manually.

Your SQL auto-saves after a 2-second pause. Press **Cmd+S** / **Ctrl+S** to save immediately, or navigate away.

<Img src="/img/user-guide/sql-editor/running-queries/code-editor.png" alt="Code editor with SQL syntax highlighting and autocomplete" />

## Using Query Variables

Variables let you parameterize queries using `{{variableName}}` syntax. At runtime, each variable is replaced with its assigned value, so you can reuse the same query with different inputs.

**Adding a variable:** Click **Toggle Variables** in the toolbar to reveal the variables bar, then click **+**. In the **Add variable** modal, enter a unique **Name**, choose a **Type** (**Text**, **Dropdown**, or **Date** in YYYY-MM-DD format), and set a **Value**. Click **Add**.

**Editing a variable:** Click an existing variable tag in the bar. The modal opens pre-filled with the current values (the name is read-only). Update the fields and click **Save**.

**Deleting a variable:** Click the **X** icon on a variable tag.

<Img src="/img/user-guide/sql-editor/running-queries/add-variable.png" alt="Add variable modal with Name, Type, and Date value fields" />

## Running a Query

Select a single SQL statement in the editor, then click the **Run** button (green play icon) or press **Cmd+Enter** / **Ctrl+Enter**. Only one statement runs at a time; multiple selections aren't supported.

<Img src="/img/user-guide/sql-editor/running-queries/run-query.png" alt="Code editor with a selected SQL statement and Cmd+Enter shortcut tooltip" />

If something isn't ready, the editor displays a message instead of executing:

| Condition | Error Message |
|-----------|---------------|
| Another query is already running | "Query in progress. Please wait for it to complete" |
| No compute selected or compute not active | "Please select an active compute" |
| Compute is still starting | "Please wait for the compute to be active" |
| No catalog/namespace selected | "Please select a catalog or namespace" |
| No statement selected in editor | "Please select statement to run" |
| Multiple selections made | "Multiple selections aren't supported right now" |

## Cancelling a Query

While a query runs, a **Cancel** button appears in the results panel. Click it to stop execution, and the state transitions from **RUNNING** through **CANCELLING** to **CANCELLED**.

<Img src="/img/user-guide/sql-editor/running-queries/query-running.png" alt="Results panel showing query executing status with elapsed time and Cancel button" />

## Understanding Query States

| State | Description |
|-------|-------------|
| **RUNNING** | Executing. The run button shows a spinner, and **Cancel** is available. |
| **COMPLETED** | Finished successfully. Results appear in the [Data, Chart, and SQL views](/user-guide/sql-editor/query-results). |
| **CANCELLING** | A cancel request is being processed. |
| **CANCELLED** | You cancelled the query. |
| **FAILED** | Execution failed. An error message and a **Compute Logs** link appear. |
| **NOT_FOUND** | The result wasn't found (it may have been cleaned up). |
| **RESULT_EXPIRED** | The result expired and is no longer available. |

Status updates arrive in real time, so you'll see state changes without refreshing.
