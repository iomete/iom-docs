---
title: SQL Editor overview
description: SQL Editor. This guide explains how quering in IOMETE
last_update:
  date: 12/30/2022
  author: Vugar Dadalov
---

import { Database, ListDashes, ClockCounterClockwise, ListChecks, DotsThreeVertical, DownloadSimple } from "phosphor-react";

import Img from '@site/src/components/Img';

The SQL Editor is where you run queries on your dataset and get results. The main components of the SQL Editor are highlighted below:


- [Database explorer](#database-explorer)
- [Worksheets](#worksheets)
  - [Querying data](#querying-data)
  - [Query Result](#query-result)
- [Query Histories](#query-histories)
- [Query Variables](#query-variables)

<Img src="/img/user-guide/sql-editor/sql-editor.png" alt="IOMETE SQL Editor"/>


## Database explorer

Database explorer panel is used to explore your database objects, which includes **namespaces, tables, views,** and their **columns** (even complex columns), and partitions.

To view database objects, expand a database. Each object in the database explorer has a corresponding options menu <DotsThreeVertical size={16} weight="bold" className="bg-emphasis-300"/> . 

The options menu lets you:
- Place the query `SELECT * FROM database.table LIMIT 100;` (tables and views only)
- Place the query `DESC EXTENDED database.table;` (tables and views only)
- Copy of object name `Copy`

<Img src="/img/user-guide/sql-editor/explorer-context-menu.png" alt="IOMETE SQL Editor - Database explorer" maxWidth="700px"/>


## Worksheets

The worksheet is a document that stores all SQL statements. 

**Welcome** worksheet - This worksheet was created for you when you first started SQL Editor.
When you make changes to a worksheet it will save automatically after a delay of 5 seconds.

In the **Worksheet** panel, you can:

- Open a worksheet in the SQL editor
- Rename a worksheet
- Delete a worksheet
- Search your set of worksheets by name


<Img src="/img/user-guide/sql-editor/sql-editor-worksheets.png" alt="IOMETE SQL Editor - Worksheets" maxWidth="700px"/>


### Querying data

:::info
Before running a query you must select a running **[Lakehouse](https://iomete.com/docs/user-guide/virtual-lakehouses)** and **Database**.
:::

To select (or change) the Running lakehouse for a worksheet, click the `Select Lakehouse` dropdown in the upper-right corner of the query editor.

To select (or change) the current database for a worksheet, click the `Select Database` dropdown in the upper-right corner of the query editor.


**Write query**

As you enter your script in the query editor, the autocomplete feature suggests:

- Query syntax keywords such as SQL functions or aliases.
- Values that match table or column names within a schema.

IOMETE tracks table aliases and suggests them as autocomplete options. For example, if you execute a query using `call_center as c` or `call_center c` as an alias, the next time you type `c`, the autocomplete feature suggests the alias as an option. 

If you want to open autocomplete, use the given shortcut:
- ⌘+Space (Mac)
- Ctrl+Space (Windows) 

<Img src="/img/user-guide/sql-editor/sql-editor-autocomplete.png" alt="IOMETE SQL Editor - Query autocomplete"/>


**Run query**

:::info
Currently, you can run only a single query
:::

Using the query editor, run a single query as follows:
- Click `Run` button
- ⌘+Enter (Mac)
- Ctrl+Enter (Windows)

### Query Result

:::info
Up to 10,000 rows can be displayed in the results.
:::

The query result includes the following information:

- The duration of the query execution.
- The status of the query execution.
- The number of rows.
- Result table

<Img src="/img/user-guide/sql-editor/sql-editor-query-result.png" alt="IOMETE SQL Editor - Query result"/>

<br/>

**Download Results**

To download your results as a .csv file, click <span className="inline-button"><DownloadSimple size={16}/>.csv</span>  button.

<br/>

**Using Sort and Filters**

You can use column sorting and filtering. Hover over columns to view the filter icon and click.
When clicking the filter icon, you can see available filters.

<Img src="/img/user-guide/sql-editor/sql-editor-result-filter.png" maxWidth="360px" alt="IOMETE SQL Editor - Query result filter"/>


<Img src="/img/user-guide/sql-editor/sql-editor-result-filter-contains.png" alt="IOMETE SQL Editor - Query result filter"/>


## Query Histories

When you run a query, it is tracked as a new item in the SQL history. You can use the SQL history to go back to previous queries so that you can see query results and open queries in the active worksheet. 

<Img src="/img/user-guide/sql-editor/sql-editor-history.png" alt="IOMETE SQL Editor - Query histories"/>

## Query Variables

Use variables in your SQL queries by wrapping them in double curly braces, like `{{id}}` .
It is necessary to declare a variable before using it. Specifying an expression for the initial value for the variable. 

After declaring the variable, you can see it in autocomplete.

<Img src="/img/user-guide/sql-editor/sql-editor-query-variable.png" alt="IOMETE SQL Editor - Query variables"/>

<!-- You can switch between realms by clicking the realm name in the menu.

The master realm
Edit this section
Report an issue
In the Admin Console, two types of realms exist: -->