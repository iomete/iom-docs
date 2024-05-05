---
title: Roles
description: Learn how to create and manage Roles, their permissions, responsibilities, and best practices for effective management.
last_update:
  date: 02/02/2024
  author: Vugar Dadalov
---

import { Plus } from "@phosphor-icons/react";
import Img from '@site/src/components/Img';

Welcome to the documentation for Roles! This document aims to provide a comprehensive guide to understanding roles within data plane.

---

The system initially generates some roles with full permissions. Users have the ability to create new role or duplicate existing role from role list.

<Img src="/img/user-guide/roles/roles.png"  alt="Roles" />

## Role create

Lets create new role (with Admin account) and assign it to user.
In the role create page contains following inputs:

- `Name`
- `Description`
- `Permissions` that covering areas such as Lakehouse, Spark Connect, Spark Jobs, Users, Groups, Roles, Data Security, and Data Catalog.

<Img src="/img/user-guide/roles/role-create.png"  alt="Role create" />

<Img src="/img/user-guide/roles/add-permission.png"  alt="Role permission select"  maxWidth="400px"/>

### Permissions Overview

Each permission includes the following access levels:

- **Can List**: Grants permission to view a list of resources.
- **Can Create**: Provides permission to create new resources.
- **Can Manage**: Offers the ability to edit, remove, or manage select or all resources. This includes the option to Start and Terminate the Lakehouse.

- **Can View**: Allows users to view detailed information about a resource.

- **Can Attach**: Grants permission to attach roles to users, roles to groups, users to groups, etc.

To activate a specific access item, simply check the related checkbox. The default setting is **(All)** for each access item. However, you can customize options for everything except _Can list_ and _Can create_ as needed.

<div className="row">
  <div className="col col--8">
    <Img src="/img/user-guide/roles/role-create-filled.png"  alt="Role create inputs"  maxWidth="600px"/>
  </div>
  <div className="col col--4">
    <Img src="/img/user-guide/roles/access-can-view.png"  alt="Role permission can view"  maxWidth="400px"/>
    <Img src="/img/user-guide/roles/access-can-attach.png"  alt="Role permission can attach"  maxWidth="400px"/>
  </div>
</div>

### Assign role

After creating a role, go to the user list and click on a user to whom you want to assign the role. First, remove any existing roles added by the system. Then, click the `Assign Role` button and choose the role we created.

<div className="row">
  <div className="col col--6">
    <Img src="/img/user-guide/roles/user-detail.png"  alt="Assign Role to user view"  maxWidth="600px"/>
  </div>
  <div className="col col--6">
    <Img src="/img/user-guide/roles/role-assign-to-user.png"  alt="Assign Role to user"  maxWidth="600px"/>
  </div>
</div>

:::note
Groups can have roles assigned, and all users in a group automatically inherit the group's role.
:::

### Result

After being assigned the role, log in to the current user account. Navigate to the lakehouse list and click on `test-lakehouse`.
You can view the lakehouse, but you can't manage it.

<Img src="/img/user-guide/roles/lakehouse-manage-denied.png"  alt="Lakehouse can manage role"/>
