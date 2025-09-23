---
title: Workspaces
description: Learn how to organize and manage your SQL worksheets using workspaces in IOMETE. Create custom workspaces, manage folders and worksheets, and control access permissions.
last_update:
  date: 09/20/2025
  author: IOMETE Documentation Team
---

import { DotsThreeVertical } from "@phosphor-icons/react";
import Img from '@site/src/components/Img';

Workspaces in IOMETE provide a powerful way to organize and manage your SQL worksheets within the SQL Editor. Think of workspaces as containers that group related worksheets and folders, with configurable storage backends and access permissions.

## Viewing Workspaces

In the SQL Editor, you can view all workspaces in the left sidebar under the **Worksheets** section. The workspace list includes:

- **My Workspace**: Your personal workspace (always visible)
- **Shared**: The shared workspace accessible to all users (always visible)
- **Custom Workspaces**: Any additional workspaces where you have `VIEW` or `PUT` permissions (configured via resource bundles)

<Img src="/img/user-guide/workspaces/workspace-list.png" alt="Workspaces List" />

:::info Workspace Visibility
Users can see all workspaces for which they have any level of permission (`VIEW` or `PUT`). Additionally, "My Workspace" and "Shared Workspace" are always visible to every user, regardless of permissions.
:::

## Creating a New Workspace

To create a new workspace:

1. Click the three-dot menu <DotsThreeVertical size={16} weight="duotone"/> next to **Worksheets** in the SQL Editor.
2. Select **New workspace** from the menu.
3. Fill in the workspace details in the dialog.

<Img src="/img/user-guide/workspaces/workspace-create-button.png" alt="Create Workspace Button" maxWidth="600px" centered />
<Img src="/img/user-guide/workspaces/workspace-create-dialog.png" alt="Create Workspace Dialog" maxWidth="600px" centered />

### Workspace Configuration

When creating a workspace, you need to configure:

**Basic Information:**

- **Name**: A unique identifier for your workspace. Choose descriptive names that reflect the workspace purpose (e.g., "Data Analytics", "Marketing Reports")

:::warning Workspace Name Uniqueness
The workspace name must be unique across the entire IOMETE instance to ensure there is no overlap in file paths.
:::

**Storage Configuration:**

- **Storage Config**: Select from available [storage configurations](./storage-configs.md) based on your permissions. Only storage configs that you have access to through resource bundles will be visible in the dropdown.

**Access Control:**

- **Resource Bundle**: Select the required [resource bundle](./iam/ras/ras.md) to manage workspace access permissions

:::warning Access Control
Only **domain owners** can create workspaces. The selected resource bundle determines who can access the workspace and what level of permissions they have.
:::

## Managing Folders

Folders help organize worksheets within workspaces. You can create hierarchical folder structures to better categorize your SQL scripts.

### Adding Folders

To create a new folder:

1. Right-click on a workspace or existing folder.
2. Select **New folder** from the context menu (visible only if you have `PUT` permission).
3. Enter a name for the folder and confirm.

<div class="row">
    <div class="col col--6">
      <Img src="/img/user-guide/workspaces/workspace-folder-access.png" alt="Folder Context Menu" />
    </div>
    <div class="col col--6">
      <Img src="/img/user-guide/workspaces/workspace-folder-disabled-access.png" alt="Folder Context Menu Disabled" />
    </div>
  </div>

The folder will be created inside the selected workspace or parent folder..

### Moving Folders

To move a folder to a different location:

1. Right-click on the folder and select **Move**.
2. A dialog will show available target workspaces (only workspaces where you have `PUT` permission).
3. Select the target workspace and optionally choose a destination folder.
4. Confirm the move.

<Img src="/img/user-guide/workspaces/workspace-move-dialog.png" alt="Move Dialog" />
<Img src="/img/user-guide/workspaces/workspace-move-dialog-disabled.png" alt="Move Dialog Disabled" />

:::warning Name Conflicts
If a folder with the same name already exists in the destination, the move operation will fail. You'll need to rename one of the folders before proceeding.
:::

### Deleting Folders

To delete a folder:

1. Right-click on the folder and select **Delete** (only workspaces where you have `PUT` permission).
2. Confirm the deletion.

:::danger Permanent Deletion
When you delete a folder, all worksheets and subfolders inside it will be permanently removed. This action cannot be undone.
:::

## Managing Worksheets

Worksheets are SQL documents that contain your queries and scripts. They can be organized within folders and moved between workspaces.

### Adding Worksheets

To create a new worksheet:

1. Right-click on a workspace or folder.
2. Select **New worksheet**.
3. Enter a name for the worksheet and confirm.

### Moving Worksheets

To move a worksheet to a different location:

1. Right-click on the worksheet and select **Move**.
2. Choose from available workspaces.
3. Optionally select a destination folder or subfolder.
4. Confirm the move.

### Deleting Worksheets

To delete a worksheet:

1. Right-click on the worksheet and select **Delete**.
2. Confirm deletion.

The worksheet will be permanently removed.

## Access Permissions

Workspace access is controlled through [resource bundle](./iam/ras/ras.md) and follows a hierarchical permission model:

### Workspace

- **CREATE**: Only Domain Owners can create new workspaces

### Folders & Worksheets

**Domain Owners**: Have all permissions by default

**Bundle-based Access**: Permissions are assigned to selected people or groups through resource bundles

#### VIEW Permission

- View all folders and worksheets inside the workspace
- Execute the contents of worksheets

#### PUT Permission

- Create new folders and worksheets inside the workspace.
- Rename and duplicate existing worksheets.
- Move folders and worksheets within the same workspace or from other workspaces (where they have `PUT` access).
- Delete folders and worksheets inside the workspace.
- Cannot edit the contents of files.

<Img src="/img/user-guide/workspaces/workspace-worksheet-content-disable.png" alt="Worksheet Content Update Disabled" />

:::info Future Enhancement
The ability to edit worksheet contents is planned for future releases, providing collaboration features.
:::

## Storage Integration

Workspaces leverage [storage configs](./storage-configs.md) to determine where worksheets are physically stored. This allows you to:

- Store different workspaces in different storage backends.
- Organize data based on compliance or business needs.

Each workspace is associated with a specific storage configuration during creation, and all worksheets within that workspace are stored in the configured storage backend.

## How to Enable Workspaces

The workspace feature is controlled by the `onboardWorkspaceRas` feature flag. To enable workspaces functionality, add the following to your Helm `values.yaml`:

```yaml
onboardWorkspaceRas:
  enabled: true
```
