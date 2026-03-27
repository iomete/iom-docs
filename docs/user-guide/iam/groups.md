---
slug: /user-guide/groups
title: Groups
description: Learn how to create and manage groups to organize users and control access across admin roles, domain ownership, domain authorisation, and resource bundles.
sidebar_label: Groups
last_update:
  date: 03/27/2026
  author: Abhishek Pathania
---

import Img from '@site/src/components/Img';

## Overview

Instead of granting permissions one user at a time, groups let you manage access collectively. Add users to a group, then assign that group wherever access is needed: admin roles, domain ownership, domain authorisation (domain bundles), or resource bundles. Every member inherits the group's permissions automatically.

Groups come from three sources. **IOMETE** groups are created manually in the console. **LDAP** groups sync from your directory service and can form parent-child hierarchies. **IDP** groups are provisioned through SAML or OIDC.

## Creating a Group

You'll typically create a group when a new team or project needs shared permissions.

1. In the Admin Console sidebar, go to **IAM** > **Groups**.
2. Click **New group** in the top-right corner.

<Img src="/img/user-guide/iam/groups/groups-list.png" alt="Groups list page showing three groups with the New Group button in the top-right corner" />

<Img src="/img/user-guide/iam/groups/groups-list-header.png" alt="Zoomed view of the Groups page header highlighting the New Group button and search bar" />

3. A drawer opens with two fields:
   - **Name** (required): a unique identifier for the group, up to 255 characters. You can't change this after creation.
   - **Description** (optional): a short note about the group's purpose.
4. Click **Create**.

<Img src="/img/user-guide/iam/groups/create-group-modal.png" alt="Create New Group modal with Name and Description fields filled in" />

You're redirected to the new group's detail page. If a group with that name already exists, the **Name** field displays a validation error instead.

:::info Permission Required
The **New group** button is disabled unless you have the **IAM_MANAGER** admin role.
:::

## Viewing Group Details

To check who's in a group or how it fits into a hierarchy, open its detail page by clicking any group name in the list.

### General Info

The top of the page displays the group's core metadata:

| Field | Description |
|-------|-------------|
| **Name** | The group's unique identifier |
| **Origin** | Where the group was created: `IOMETE`, `LDAP`, or `IDP` |
| **Added by** | Who created the group and when |
| **Description** | Optional description text |

<Img src="/img/user-guide/iam/groups/group-detail.png" alt="Group detail page showing General Info with Name, Origin, Added by, and Description fields, plus the Users tab below" />

### Users Tab

The **Users** tab (selected by default) lists every assigned user with their username and full name. Each row links to that user's detail page. For long lists, the search bar filters by email, first name, last name, or username.

<Img src="/img/user-guide/iam/groups/users-tab.png" alt="Users tab showing assigned users list with username, full name, search bar, and Assign user button" />

### Sub Groups and Parent Groups Tabs

These tabs show where a group sits in a hierarchy. Both display a searchable, read-only table of group names that link to each group's detail page.

:::info LDAP Only
Group hierarchies come from LDAP sync when the `ldapGroupInheritance` feature flag is enabled. You can't create or edit parent-child relationships through the console.
:::

## Editing a Group

Need to clarify a group's purpose? You can update its description at any time, though the name is locked after creation.

1. Click **Edit** in the header.
2. A drawer opens with the **Name** field grayed out. Update the **Description**.
3. Click **Save changes**.

<Img src="/img/user-guide/iam/groups/group-detail-header.png" alt="Group detail page header showing the Edit group button and three-dot actions menu" />

<Img src="/img/user-guide/iam/groups/edit-group-modal.png" alt="Edit group modal with the Name field disabled and the Description field editable" />

## Managing Users

Once a group exists, you'll want to add the right people. Assign or remove users from the **Users** tab on the group's detail page.

### Assigning Users to a Group

1. Select the **Users** tab.
2. Click the **Assign user** dropdown. A scrollable list appears with users not already in the group.
3. Search by name or username, then select one or more users to assign them.

<Img src="/img/user-guide/iam/groups/assign-user-dropdown.png" alt="Assign user dropdown open with a searchable list showing a user selected for assignment" />

### Removing a User from a Group

1. On the **Users** tab, find the user you want to remove.
2. Click the delete icon on that row. The user is removed immediately with no confirmation dialog.

<Img src="/img/user-guide/iam/groups/users-tab.png" alt="Users tab showing assigned users list with username, full name, search bar, and Assign user button" />

## Deleting a Group

When a team dissolves or a project wraps up, delete its group to keep your IAM tidy. You can do this from either the detail page or the list page.

**From the detail page:**
1. Click the three-dot actions menu in the header.
2. Click **Delete group**.
3. Confirm by clicking **Yes, delete it**.

<Img src="/img/user-guide/iam/groups/delete-group-detail.png" alt="Detail page header with the three-dot menu open showing the Delete group option" />

**From the list page:**
1. Click the three-dot actions menu on the group's row.
2. Click **Delete**, then confirm with **Yes, delete it**.

<Img src="/img/user-guide/iam/groups/delete-group-list.png" alt="Groups list page with the row actions menu open showing View and Delete options" />

:::warning Irreversible Action
Deleting a group removes all its user and admin role assignments. This action can't be undone.
:::

## Access Permissions

Before you start managing groups, make sure you have the right role. Any admin role lets you view groups, but you need **IAM_MANAGER** to make changes. Without it, all create, edit, delete, and assign buttons are disabled.

| Permission | View groups | Create / Edit / Delete | Assign or remove users | Assign or remove admin roles |
|------------|:-----------:|:----------------------:|:----------------------:|:----------------------------:|
| Any admin role | ✅ | ❌ | ❌ | ❌ |
| **IAM_MANAGER** | ✅ | ✅ | ✅ | ✅ |

## Group Origins

Not every group is created by hand. The **Origin** field tells you where a group came from, and IOMETE sets it automatically at creation time.

| Origin | Description |
|--------|-------------|
| `IOMETE` | Created manually through the Admin Console |
| `LDAP` | Synced from an LDAP directory. See [LDAP Configuration](./ldap-configuration) |
| `IDP` | Provisioned through a SAML or OIDC identity provider. See [SSO](./sso/sso) |

## Related Features

- [Users](./users): manage individual user accounts assigned to groups
- [Roles](./roles): understand the role model that groups inherit
- [LDAP Configuration](./ldap-configuration): configure LDAP sync that creates groups and hierarchies
