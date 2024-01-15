---
title: SQL Editor overview
description: Explore the SQL Editor in IOMETE with this guide, unraveling the intricacies of querying for a seamless and efficient data exploration experience.
last_update:
  date: 12/30/2022
  author: Vugar Dadalov
---

import { Database, ListDashes, ClockCounterClockwise, ListChecks, DotsThreeVertical, DownloadSimple, LinkSimple, ChartBar, ChatTeardropDots } from "@phosphor-icons/react";
import GridBox from "@site/src/components/GridBox";
import Img from "@site/src/components/Img";
import TOCInline from '@theme/TOCInline';

<GridBox>

<div>
  <p>The SQL Editor is where you run queries on your dataset and get results. The main components of the SQL Editor are highlighted below:</p>
  
  <ul>
    <li><a href="#database-explorer">Database explorer</a></li>
    <li><a href="#worksheets">Worksheets</a></li>
    <li><a href="#querying-data">Querying data</a></li>
    <li><a href="#query-result">Query Result</a></li>
    <li><a href="#query-histories">Query Histories</a></li>
    <li><a href="#query-variables">Query Variables</a></li>
    <li><a href="#iomete-ai-assistant">IOMETE AI Assistant</a></li>

  </ul>
</div>

<Img src="/img/user-guide/sql-editor/sql-editor-1.png" alt="IOMETE SQL Editor"/>

</GridBox>

## Database explorer

Database explorer panel is used to explore your database objects, which includes **namespaces, tables, views,** and their **columns** (even complex columns), and partitions.

To view database objects, expand a database. Each object in the database explorer has a corresponding options menu <DotsThreeVertical size={16} weight="duotone"/> .

The options menu lets you:

- Place the query `SELECT * FROM database.table LIMIT 100;` (tables and views only)
- Place the query `DESC EXTENDED database.table;` (tables and views only)
- Copy of object name `Copy`

<Img src="/img/user-guide/sql-editor/explorer-context-menu-1.png" alt="IOMETE SQL Editor - Database explorer" maxWidth="700px"/>

## Worksheets

The worksheet is a document that stores all SQL statements.

**Welcome** worksheet - This worksheet was created for you when you first started SQL Editor.
When you make changes to a worksheet it will save automatically after a delay of 5 seconds.

In the **Worksheet** panel, you can:

- Open a worksheet in the SQL editor
- Rename a worksheet
- Duplicate a worksheet
- Delete a worksheet
- Search your set of worksheets by name

<Img src="/img/user-guide/sql-editor/sql-editor-worksheets-1.png" alt="IOMETE SQL Editor - Worksheets" maxWidth="700px"/>

### Querying data

:::info
Before running a query you must select a running **[Lakehouse](/user-guide/virtual-lakehouses)** and **Database**.
:::

To select (or change) the Running lakehouse for a worksheet, click the `Select Lakehouse` dropdown in the upper-right corner of the query editor.

To select (or change) the current database for a worksheet, click the `Select Database` dropdown in the upper-right corner of the query editor.

**Write query**

As you enter your script in the query editor, the autocomplete feature suggests:

- Query syntax keywords such as SQL functions or aliases.
- Values that match table or column names within a schema.

IOMETE tracks table aliases and suggests them as autocomplete options. For example, if you execute a query using `cities as c` or `cities c` as an alias, the next time you type `c`, the autocomplete feature suggests the alias as an option.

If you want to open autocomplete, use the given shortcut:

- ⌘+Space (Mac)
- Ctrl+Space (Windows)

<Img src="/img/user-guide/sql-editor/sql-editor-autocomplete-1.png" alt="IOMETE SQL Editor - Query autocomplete"/>

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

<Img src="/img/user-guide/sql-editor/sql-editor-query-result-1.png" alt="IOMETE SQL Editor - Query result"/>

<br/>

**Download or Share Results**

To download your results as a .csv file, click the <span className="inline-button"><DownloadSimple size={16}/>.csv</span> button.

To share your results as a link, click the <span className="inline-button"><LinkSimple size={16}/>Share</span> button to copy the link.

<br/>

**Results as CHART**

To show result as chart click the <span className="inline-button"><ChartBar size={16}/>Chart</span> button.
<Img src="/img/user-guide/sql-editor/sql-editor-query-result-chart.png"  alt="IOMETE SQL Editor - Query result chart"/>

:::info
You can customize the chart using filtering options on the right side.
:::

<br/>

**Using Sort and Filters**

You can use column sorting and filtering. Hover over columns to view the filter icon and click.
When clicking the filter icon, you can see available filters.

<Img src="/img/user-guide/sql-editor/sql-editor-result-filter-1.png" maxWidth="360px" alt="IOMETE SQL Editor - Query result filter"/>

<Img src="/img/user-guide/sql-editor/sql-editor-result-filter-contains-1.png" alt="IOMETE SQL Editor - Query result filter"/>

## Query Histories

When you run a query, it is tracked as a new item in the SQL history. You can use the SQL history to go back to previous queries so that you can see query results and open queries in the active worksheet.

<Img src="/img/user-guide/sql-editor/sql-editor-history-1.png" alt="IOMETE SQL Editor - Query histories"/>

## Query Variables

Use variables in your SQL queries by wrapping them in double curly braces, like `{{id}}` .
It is necessary to declare a variable before using it. Specifying an expression for the initial value for the variable.

After declaring the variable, you can see it in autocomplete.

<Img src="/img/user-guide/sql-editor/sql-editor-query-variable-1.png" alt="IOMETE SQL Editor - Query variables"/>

## IOMETE AI Assistant

To open IOMETE AI Assistant click the <span className="inline-button"><ChatTeardropDots size={16}/>AI Assistant</span> button.

<Img src="/img/user-guide/sql-editor/sql-editor-ai-chat.png"  alt="IOMETE SQL Editor - Query result chart"/>

:::info
You can easily paste the SQL code using the <span className="inline-button">Paste into editor</span> button from the chat into our editor, and then run it.
:::

IOMETE SQL AI assistant can help users in many different ways, some of which are:

- **Helping write queries:** It creates SQL queries for users who aren't familiar with SQL or want quicker query writing.

- **Fixing errors:** It finds and fixes mistakes in SQL queries instantly, so users can write accurate queries.

- **Speeding up queries:** It suggests ways to make SQL queries run faster and more efficiently.

- **Quick suggestions:** It predicts and suggests SQL words, namespaces, tables and more as users type, cutting down on errors and speeding up writing.

- **Exploring data:** It makes it easier to understand databases by showing how tables relate and what information they hold.

<br/>

<!-- You can switch between realms by clicking the realm name in the menu.

The master realm
Edit this section
Report an issue
In the Admin Console, two types of realms exist: -->
