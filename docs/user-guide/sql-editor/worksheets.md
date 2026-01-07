---
title: Worksheets
sidebar_label: Worksheets
description: Learn how to use worksheets in IOMETE SQL Editor for querying and exploring your data.
last_update:
  date: 01/22/2024
  author: Vugar Dadalov
---

import { Database, DotsThreeVertical, DownloadSimple, LinkSimple, ChartBar, ChatTeardropDots } from "@phosphor-icons/react";
import Img from "@site/src/components/Img";

The worksheet is a document that stores SQL queries. These worksheets are organized in folders, and the system automatically creates a default **Draft** folder. In this folder, you'll find worksheets with helpful SQL query hints to make writing queries easier.

<Img src="/img/user-guide/sql-editor/sql-editor.png" alt="SQL Editor"/>

You can create custom folders for better organization. Folders can be deleted, renamed, and modified, except for the system-generated 'Draft' folder, which remains fixed. Within folders, you have the flexibility to create, duplicate, delete, rename, and move worksheets.

<div className="row">
    <div className="col col--6">
      <Img src="/img/user-guide/sql-editor/folder-create.png" alt="SQL Editor - Folder create" maxWidth="400px"/>
    </div>
    <div className="col col--6">
      <Img src="/img/user-guide/sql-editor/worksheet-menu.png" alt="SQL Editor - Worksheet menu" maxWidth="400px"/>
    </div>
  </div>

## Querying data

:::info
Before running a query you must select a running **[Lakehouse](/user-guide/virtual-lakehouses)** and **Database**.
:::

To select (or change) the Running lakehouse for a worksheet, click the `Select Lakehouse` dropdown in the upper-right corner of the query editor.

To select (or change) the current database for a worksheet, click the `Select Database` dropdown in the upper-right corner of the query editor.
You can also select **catalog** only.

<div className="row">
    <div className="col col--6">
      <Img src="/img/user-guide/sql-editor/lakehouse-select.png" alt="SQL Editor - Lakehouse select" maxWidth="400px"/>
    </div>
    <div className="col col--6">
      <Img src="/img/user-guide/sql-editor/db-select.png" alt="SQL Editor - Database select" maxWidth="400px"/>
    </div>
</div>

### Write query

As you enter your script in the query editor, the autocomplete feature suggests:

- Query syntax keywords such as SQL functions or aliases.
- Values that match table or column names within a schema.

IOMETE tracks table aliases and suggests them as autocomplete options. For example, if you execute a query using `employees as e` or `employees e` as an alias, the next time you type `e`, the autocomplete feature suggests the alias as an option.

  <div className="row">
    <div className="col col--5">
      <Img src="/img/user-guide/sql-editor/table-columns.png" alt="SQL Editor - Table columns" maxWidth="400px"/>
    </div>
    <div className="col col--7">
      <Img src="/img/user-guide/sql-editor/autocomplete-table.png" alt="SQL Editor - Autocomplete tables" maxWidth="400px"/>
      <Img src="/img/user-guide/sql-editor/autocomplete-column.png" alt="SQL Editor - Autocomplete columns" maxWidth="400px"/>
    </div>
  </div>

:::info Open autocomplete with
⌘+Space (Mac) or Ctrl+Space (Windows/Linux).
:::

### Query Variables

Use variables in your SQL queries by wrapping them in double curly braces, like `{{id}}` .
It is necessary to declare a variable before using it. Specifying an expression for the initial value for the variable.After declaring the variable, you can see it in autocomplete.

<div className="row">
    <div className="col col--6">
      <Img src="/img/user-guide/sql-editor/variable-create.png" alt="SQL Editor - Variable create" maxWidth="400px"/>
    </div>
    <div className="col col--6">
      <Img src="/img/user-guide/sql-editor/variable-autocomplete.png" alt="SQL Editor - Variable autocomplete" maxWidth="400px"/>
    </div>
</div>

### Run query

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

<Img src="/img/user-guide/sql-editor/sql-editor-query-result-1.png" alt="SQL Editor - Query result"/>

<br/>

**Download or Share Results**

To download your results as a .csv file, click the <span className="inline-button"><DownloadSimple size={16}/>.csv</span> button.

To share your results as a link, click the <span className="inline-button"><LinkSimple size={16}/>Share</span> button to copy the link.

<br/>

**Results as CHART**

To show result as chart click the <span className="inline-button"><ChartBar size={16}/>Chart</span> button.
<Img src="/img/user-guide/sql-editor/sql-editor-query-result-chart.png"  alt="SQL Editor - Query result chart"/>

:::info
You can customize the chart using filtering options on the right side.
:::

<br/>

**Using Sort and Filters**

You can use column sorting and filtering. Hover over columns to view the filter icon and click.
When clicking the filter icon, you can see available filters.

<Img src="/img/user-guide/sql-editor/sql-editor-result-filter-1.png" maxWidth="360px" alt="SQL Editor - Query result filter"/>

<Img src="/img/user-guide/sql-editor/sql-editor-result-filter-contains-1.png" alt="SQL Editor - Query result filter"/>

<!-- ## IOMETE AI Assistant

To open IOMETE AI Assistant click the <span className="inline-button"><ChatTeardropDots size={16}/>AI Assistant</span> button.

<Img src="/img/user-guide/sql-editor/sql-editor-ai-chat.png"  alt="SQL Editor - Query result chart"/>

:::info
You can easily paste the SQL code using the <span className="inline-button">Paste into editor</span> button from the chat into our editor, and then run it.
:::

IOMETE SQL AI assistant can help users in many different ways, some of which are:

- **Helping write queries:** It creates SQL queries for users who aren't familiar with SQL or want quicker query writing.

- **Fixing errors:** It finds and fixes mistakes in SQL queries instantly, so users can write accurate queries.

- **Speeding up queries:** It suggests ways to make SQL queries run faster and more efficiently.

- **Quick suggestions:** It predicts and suggests SQL words, namespaces, tables and more as users type, cutting down on errors and speeding up writing.

- **Exploring data:** It makes it easier to understand databases by showing how tables relate and what information they hold. -->
