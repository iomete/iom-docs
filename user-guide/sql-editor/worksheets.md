---
title: Worksheets Overview
description: Create, organize, and run SQL queries using worksheets in the IOMETE SQL Editor with real-time collaboration, query variables, and chart visualizations.
sidebar_label: Worksheets Overview
last_update:
  date: 03/26/2026
  author: Abhishek Pathania
---

import Img from "@site/src/components/Img";

If you spend most of your day writing and iterating on SQL, worksheets are where that happens. Each worksheet holds a query plus its full context: compute cluster, catalog, database namespace, and any query variables. That context persists between sessions, so you pick up right where you left off.

You organize worksheets in a three-level hierarchy (**Workspaces > Folders > Worksheets**), structured however fits your team. Beyond basic query editing, worksheets support:

- [Real-time collaboration](/user-guide/sql-editor/collaboration) with teammates
- [Chart visualizations and CSV export](/user-guide/sql-editor/query-results)
- Parameterized [query variables](/user-guide/sql-editor/running-queries#using-query-variables)
- File imports (`.sql`, `.ipynb`, `.dash`)
- Read-only browsing of SQL files from connected [Git repositories](/user-guide/sql-editor/collaboration#git-repository-worksheets)

:::tip Workspaces and Folders
Worksheets are organized in workspaces. See [Workspaces](/user-guide/sql-editor/workspaces) for details on creating workspaces, managing folders, and permissions.
:::

<Img src="/img/user-guide/sql-editor/worksheets/overview.png" alt="SQL Editor layout with sidebar workspace tree, open worksheet tab, code editor, and results panel" />

## Getting Started

The home screen gets you from zero to a working worksheet in one click. When you first open the SQL Editor with no worksheets, you'll see three options:

1. **New worksheet**: creates a worksheet in your personal workspace
2. **Import file**: opens a file picker for `.sql`, `.dash`, or `.ipynb` files
3. **Add Git repository**: takes you to **Settings > Git Repository** to connect a repository

Already have open tabs? The editor skips the home screen and takes you straight to your last-visited worksheet.

<Img src="/img/user-guide/sql-editor/worksheets/home-screen.png" alt="SQL Editor home screen with New worksheet, Import file, and Add Git repository buttons" />

## Working with Worksheets

Once you have a few worksheets, you'll want to keep them organized. The sidebar's right-click context menu is the main hub for creating, moving, renaming, and cleaning up worksheets.

### Creating a Worksheet

Two paths lead to a new worksheet.

**From the sidebar:** Right-click any workspace or folder node, select **New worksheet**, type a name in the inline input, and press **Enter**.

**From the home screen:** Click **New worksheet**, enter a **Worksheet name** (required, max 100 characters) in the modal, and confirm. Home-screen worksheets land in **My Workspace**.

:::info Character Restrictions
Worksheet names can't contain these special characters: `/ \ : * ? " < > |`
:::

<Img src="/img/user-guide/sql-editor/worksheets/context-menu-workspace.png" alt="Workspace context menu with New worksheet, New dashboard, and New folder options" />

### Opening a Worksheet

Click any worksheet in the sidebar to open it as a tab. Each tab is divided into four areas:

- **Toolbar** at the top (run button, compute selector, collaboration avatars, and more)
- An optional **Query variables bar**
- The **Code editor**
- A resizable **Results panel** at the bottom

<Img src="/img/user-guide/sql-editor/worksheets/worksheet-layout.png" alt="Open worksheet showing toolbar, code editor with SQL, and results panel with data grid" />

### Renaming, Duplicating, and Moving Worksheets

Right-click the worksheet node in the sidebar to access these actions:

- **Rename**: Select **Rename**, edit the inline text, and press **Enter**.
- **Duplicate**: Select **Duplicate** to create a copy in the same folder.
- **Move to / Copy to**: Browse workspaces and folders in the multi-column navigator to pick a destination. Moving requires **MOVE** permission; copying requires **PUT** permission on the target workspace.

<Img src="/img/user-guide/sql-editor/worksheets/context-menu-worksheet.png" alt="Worksheet right-click context menu with Rename, Duplicate, Move to, Copy to, and Delete options" />

### Importing a File

If you have existing `.sql`, `.dash`, or `.ipynb` files, you can import them as worksheets. Right-click a workspace node and select **Import file**, or use the **Import file** button on the home screen. The new worksheet takes the file's name and content. Home-screen imports land in **My Workspace**.

<Img src="/img/user-guide/sql-editor/worksheets/import-file.png" alt="Workspace context menu showing the Import file option" />

### Deleting a Worksheet

Right-click the worksheet node and select **Delete** (shown in red). If the worksheet has content, a confirmation dialog appears. Click **Force delete** to proceed.

:::warning Permanent Deletion
Deleting a worksheet permanently removes it and its contents. This can't be undone.
:::

<Img src="/img/user-guide/sql-editor/worksheets/context-menu-delete.png" alt="Worksheet context menu with Delete option highlighted in red" />

## Keyboard Shortcuts

| Action | Mac | Windows / Linux |
|--------|-----|-----------------|
| Run query | **Cmd+Enter** | **Ctrl+Enter** |
| Save worksheet | **Cmd+S** | **Ctrl+S** |
| Open autocomplete | **Cmd+Space** | **Ctrl+Space** |
