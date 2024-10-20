---
slug: /user-guide/users
title: Users
description: Discover how to create and control user accounts, set permissions, and join a group.
last_update:
  date: 03/02/2024
  author: Nurlan Mammadov
---

import { Plus } from "@phosphor-icons/react";
import Img from '@site/src/components/Img';

Welcome to the documentation for Users! This document aims to provide a comprehensive guide to understanding users within data plane.

---

The system initially generates **Admin** user with full permissions. Admin have the ability to create new user.

<Img src="/img/user-guide/iam/users/users.png" alt="Users" />

## User create

To create new user click the <button className="button button--primary button-iom"><Plus size={16}/>Create</button> button. Fill in all the fields and click submit. You'll receive a temporary password. Share the temporary password with the user, who will then be prompted to change it during their first login.

<div className="row">
  <div className="col col--6">
    <Img src="/img/user-guide/iam/users/user-create-fill.png" alt="User create filled inputs" maxWidth="600px"/>
  </div>
  <div className="col col--6">
    <Img src="/img/user-guide/iam/users/user-created.png" alt="User create" maxWidth="600px"/>
  </div>
</div>

Sign out, then attempt to sign in using the user's username or email and the provided password.
After sign in you will be redirected `Update Password` page. Set a new password and click `Submit`.

<div className="row">
  <div className="col col--6">
    <Img src="/img/user-guide/iam/users/signin.png" alt="User create filled inputs" maxWidth="600px"/>
  </div>
  <div className="col col--6">
    <Img src="/img/user-guide/iam/users/update-password.png" alt="User create" maxWidth="600px"/>
  </div>
</div>

That's it! The user account is now ready.

<!-- <Img src="/img/user-guide/iam/users/users2.png" alt="Users" /> -->

## Details

<Img src="/img/user-guide/iam/users/user-details.png" alt="User details" />

### General informations

Click the `Edit` button to modify the `First name` and `Last name`.

<Img src="/img/user-guide/iam/users/user-edit.png" alt="User edit" maxWidth="400px"/>

### Roles

In the Roles section, view the Assigned role list. You have the ability to Assign or Remove roles for the user.
Find out how to create and assign roles for [more details.](/user-guide/roles#role-create)

<Img src="/img/user-guide/iam/users/user-roles.png" alt="User roles" />

### Assigned groups

The `Assigned groups` section displays the groups the user is in. You can add or remove the user from a group.

<Img src="/img/user-guide/iam/users/user-groups.png" alt="User groups" />

<!-- <div className="row">
  <div className="col col--6">
    <Img src="/img/user-guide/iam/users/user-groups.png" alt="User groups" maxWidth="600px"/>
  </div>
  <div className="col col--6">
    <Img src="/img/user-guide/iam/users/user-group-assign.png" alt="User group assign" maxWidth="600px"/>
  </div>
</div> -->

### Effective roles

<Img src="/img/user-guide/iam/users/effective-roles.png" alt="User effective roles" />

:::info Effective roles
Effective roles depend on group memberships, not direct assignments to a user.
:::
