---
title: SQL Editor Overview
description: Write, run, and visualize SQL queries in IOMETE's browser-based SQL Editor with workspaces, real-time collaboration, and Git integration.
sidebar_label: Overview
last_update:
  date: 09/30/2026
  author: Mammad Mammadli
---

import Img from "@site/src/components/Img";

The SQL Editor is IOMETE's browser-based environment for writing, running, and visualizing SQL queries. It connects to your [compute clusters](/user-guide/compute-clusters/overview), supports real-time collaboration, and integrates with Git for version-controlled SQL files.

## Editor Layout

The interface is split into three panels, so you can browse your catalog, write queries, and review results without switching views.

- **Left sidebar** (collapsible): three tabs for **Worksheets** (workspace tree), **Explorer** (catalog, namespace, table, and column browser), and **Query History** (previously run queries).
- **Main content area**: a tab bar for open worksheets, plus the active worksheet's code editor and toolbar.
- **Results panel** (bottom, resizable): renders query output as a data grid, chart, or raw SQL.

With [SQL Editor V2](../feature-flags/sql-editor-v2.md), you can run multiple statements in sequence and inspect each result in its own tab. Pin or rename tabs to compare results, and move the results panel to the right or open it in fullscreen. Use **SQL settings → Appearance** to customize fonts, the editor color scheme, and statement highlighting.

<Img src="/img/user-guide/sql-editor/worksheets/overview.png" alt="SQL Editor layout with sidebar workspace tree, open worksheet tab, code editor, and results panel" />

## Key Concepts

Four building blocks make up the SQL Editor.

- **Workspace**: a top-level container with its own storage configuration, bundle, and permissions.
- **Folder**: organizes worksheets inside a workspace. Supports nesting.
- **Worksheet**: a SQL document that stores queries, compute cluster selection, catalog/namespace, and variables.
- **Dashboard**: a `.dash` file that renders as a visual dashboard inside the editor.

## Feature Guides

Each guide below covers a specific part of the SQL Editor in detail.

| Guide | What It Covers |
|-------|----------------|
| [Workspaces](/user-guide/sql-editor/workspaces) | Creating workspaces, managing folders, access permissions, storage integration |
| [Worksheets](/user-guide/sql-editor/worksheets) | Creating/editing worksheets, running queries, variables, charts, collaboration, Git worksheets |
| [Running Queries](./running-queries.md) | Running selected statements or an entire worksheet, keyboard shortcuts, stopping execution |
| [Query Results & Settings](./query-results.md) | Managing result tabs, pinning and refreshing results, arranging the panel, editor appearance |
| [Database Explorer](/user-guide/sql-editor/database-explorer) | Browsing catalogs, namespaces, tables, and columns |
| [Query History](/user-guide/sql-editor/query-history) | Viewing and reusing previously run queries |
| [Dashboards](/user-guide/sql-editor/dashboards) | Building and managing dashboards |
| [Scheduling](/user-guide/sql-editor/scheduling) | Scheduling queries to run automatically |
