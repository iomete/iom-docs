---
title: Collaboration & Permissions
description: Collaborate on worksheets in real time, browse Git repository SQL files, and manage workspace-level and role-based permissions in the IOMETE SQL Editor.
sidebar_label: Collaboration & Permissions
last_update:
  date: 03/26/2026
  author: Abhishek Pathania
---

import Img from "@site/src/components/Img";

This page covers browsing SQL files from Git repositories and managing access permissions for SQL Editor features.

## Git Repository Worksheets

If your team stores SQL in a Git repository, you can browse and run those files directly in the SQL Editor without duplicating them. Worksheets from connected repositories appear in the sidebar under the repository name and are always **read-only**. An alert banner confirms this when you open one.

Unlike regular worksheets, Git worksheets share their compute cluster, catalog/namespace, and query variable settings at the repository level rather than per file.

To connect a repository, go to **Settings > Git Repository** or click **Add Git repository** on the SQL Home screen. See [Git Integration](/integrations/git/git-integration) for details.

## Notebook and Dashboard Files

Beyond SQL, the editor handles two other file types. Open a `.ipynb` file and you get a notebook viewer; open a `.dash` file for a [dashboard](/user-guide/sql-editor/dashboards) view. Both replace the code editor with their own specialized layout.

:::info Dashboard Workspace Restriction
Dashboard creation (**.dash** files) is currently available only in the personal workspace. The **New dashboard** option doesn't appear in other workspace context menus.
:::

## Access Permissions

SQL Editor features are controlled through role permissions, which grant granular access to specific capabilities. If a required permission is missing, the relevant UI element is disabled and a tooltip explains why.

### Domain Bundle Permissions

These permissions are managed through [Roles](/user-guide/roles), where admins grant specific access rights to users or groups.

| Permission | What It Controls |
|------------|-----------------|
| **Export SQL Editor** | Export query results as CSV |
| **List Git Repository** | View Git repositories in the sidebar |
| **Manage Git Repository** | Configure, update, and delete Git repository connections |
| **List Shared Worksheet** | View shared SQL worksheets |
| **Manage Shared Worksheet** | Create folders and manage worksheets in shared workspaces |

:::tip Workspace permissions
Workspace-level permissions (VIEW, PUT, MOVE, DELETE) control what you can do within a specific workspace. See [Workspaces - Access Permissions](/user-guide/sql-editor/workspaces#access-permissions) for details.
:::

### Domain Owner Actions

Only domain owners can create new workspaces and manage workspace-level settings (storage configuration and bundle assignment).
