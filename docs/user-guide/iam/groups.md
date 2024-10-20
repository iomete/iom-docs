---
slug: /user-guide/groups
title: Groups
description: Discover how to create and control groups, set permissions, and add a user.
last_update:
  date: 05/02/2024
  author: Vugar Dadalov
---

import { Plus } from "@phosphor-icons/react";
import Img from '@site/src/components/Img';

Welcome to the documentation for Groups! This documentation provides guidelines on managing groups within the data plane.

---

To view groups, click the `Settings` menu item and switch to the `Groups` tab.

<Img src="/img/user-guide/iam/groups/groups.png" alt="Groups" />

## Group create

To create new group, click the <button className="button button--primary button-iom"><Plus size={16}/>Create</button> button. Fill in the `Name` and `Description`, then click submit.

<Img src="/img/user-guide/iam/groups/group-create.png" alt="Group create" maxWidth="400px"/>

## Group details

After creating, you will be redirected to the detail view. The detail view includes General info, Assigned users, Assigned roles, and Delete card.

<Img src="/img/user-guide/iam/groups/group-details.png" alt="Group details" maxWidth="600px"/>

### General info

By clicking the `Edit` button, you can edit the `Description`.

<Img src="/img/user-guide/iam/groups/group-edit.png" alt="Group edit" maxWidth="400px"/>

### Assigned users

To assign a user to the group, click the `Assign user` button. You will see available users in the opened dropdown. Click on the user you want to assign to the group.

<div className="row">
  <div className="col col--6">
    <Img src="/img/user-guide/iam/groups/user-assign.png" alt="User assign" maxWidth="400px"/>
  </div>
  <div className="col col--6">
    <Img src="/img/user-guide/iam/groups/assigned-users.png" alt="Assigned users" maxWidth="400px"/>
  </div>
</div>

### Assigned roles

To assign a role to the group, click the `Assign role` button. You will see available roles in the opened dropdown. Click on the role you want to assign to the group.

<Img src="/img/user-guide/iam/groups/role-assign.png" alt="Role assign" maxWidth="600px"/>

<Img src="/img/user-guide/iam/groups/assigned-roles.png" alt="Assigned roles" maxWidth="600px"/>

:::info Effective roles
Group roles will have an impact on the users within this group.
:::

### Delete group

You can delete the group by selecting `Delete` from the header actions dropdown
<Img src="/img/user-guide/iam/groups/group-delete.png" alt="Delete role" maxWidth="600px"/>

or from the actions dropdown in the table section.

<Img src="/img/user-guide/iam/groups/table-group-delete.png" alt="Delete role" maxWidth="600px"/>
