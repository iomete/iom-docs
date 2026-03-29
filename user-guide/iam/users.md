---
slug: /users
title: Users
description: Create and manage user accounts, reset passwords, assign groups and admin roles, and control access across the data plane.
sidebar_label: Users
last_update:
  date: 03/25/2026
  author: Abhishek Pathania
---

import Img from '@site/src/components/Img';

## User Accounts at a Glance

Every person or system that accesses the IOMETE data plane needs a user account. Each account has a **type** (`Person` or `Service Account`) and an **origin** that indicates how it was provisioned: `IOMETE` (local), `LDAP` (directory sync), or `IDP` (SAML/OIDC).

The admin portal lets you create accounts, edit profiles, reset passwords, assign groups and admin roles, switch account types, and delete accounts. Users also appear in the domain-level **Members** view for domain-scoped role assignment.

Most user management actions require the **IAM_MANAGER** admin role. Any admin role can view the user list and details.

## Browsing the User List

The user list is your starting point for checking who has access and what type each account is. It surfaces every account and its current state. Open it by selecting **Users** in the admin portal sidebar.

<Img src="/img/user-guide/iam/users/user-list.png" alt="Users list page showing the table with type and origin filters, search bar, and user rows" />

### Table Columns

| Column | Description |
|--------|-------------|
| **Username** | Unique identifier, linked to the user's detail page |
| **Full name** | First and last name combined |
| **Email** | The user's email address |
| **Origin** | How the account was created: `IOMETE`, `LDAP`, or `IDP` |
| **Type** | `Person` or `Service Account` |
| **Actions** | Dropdown menu with quick actions |

### Filtering and Searching

Two segmented filters sit in the table header:

- **Type**: `All`, `Person`, or `Service Account`
- **Origin**: `All`, `IOMETE`, `IDP`, or `LDAP`

A free-text search field matches against username, first name, last name, and email (case-insensitive).

<Img src="/img/user-guide/iam/users/search-filter.png" alt="Search filter narrowing the user list to a single result" />

## Creating a User

Adding accounts up front lets people start querying data the moment they log in.

1. On the **Users** list page, click **New user** in the top-right corner. A side drawer opens. (Without the **IAM_MANAGER** role, this button is disabled.)

2. Fill in the form:
   - **Username** (required): letters, numbers, underscores, dots, and dashes only (max 128 characters). Always stored in lowercase.
   - **Email** (optional): a valid email address.
   - **First name** / **Last name** (optional): the user's given and family name.

3. Click **Create**.

4. If creation succeeds, the drawer displays a confirmation screen with a temporary password and a **Copy** button. Share this password with the user because they'll need to change it on first login.

5. Click **Go to user details** to open the new account's detail page.

<Img src="/img/user-guide/iam/users/create-user.png" alt="Create New User form with Username, Email, First name, and Last name fields filled in" />

<Img src="/img/user-guide/iam/users/create-user-success.png" alt="User created success screen showing a temporary password with a Copy button" />

:::warning Unique Usernames and Emails
Usernames and emails must be unique across the platform. If either is already taken, the form highlights the field with a validation error.
:::

### First Login Experience

When the new user signs in with their temporary password, IOMETE redirects them to an **Update Password** page. They must choose a new password before they can proceed.

## Viewing User Details

When you need the full picture of a single account, click any username in the list to open its detail page.

The top section displays the username, full name, email, origin, type, and who created the account (with a timestamp).

<Img src="/img/user-guide/iam/users/user-details.png" alt="User detail page showing general information, Groups tab, and Admin roles tab" />

Below that, three tabs organize the remaining details:

- **Groups**: lists the groups this user belongs to (see [Groups](/user-guide/groups))
- **Admin roles**: lists the roles assigned to this user (see [Roles](/user-guide/roles))
- **Access Tokens**: only visible for `Service Account` users; manages API access tokens

## Managing Users

Day-to-day user management mostly involves editing profiles, resetting passwords, and toggling account types.

<Img src="/img/user-guide/iam/users/actions-bar.png" alt="User detail page header showing the Edit button and Actions dropdown" />

### Editing a User

1. On the user detail page, click **Edit** in the actions bar. A side drawer opens.
2. Update the **First name** and **Last name** fields. (**Username** and **Email** are read-only.)
3. Click **Save changes**.

<Img src="/img/user-guide/iam/users/edit-user.png" alt="Edit user drawer with First name and Last name fields" />

### Resetting a Password

Password resets only apply to `IOMETE`-origin users. LDAP and IDP users authenticate through their external identity provider, so there's nothing to reset here.

1. On the user detail page, open the **Actions** dropdown and click **Reset password**.
2. Enter the **New password**, then confirm it in the **Confirm new password** field.
3. The **Temporary password** toggle is on by default, forcing the user to pick a new password at next login. Turn it off if the password should persist.
4. Click **Save**.

If the reset succeeds, a confirmation message appears. If the passwords don't match, the form highlights the mismatch with a validation error. Service accounts can't have their passwords reset.

<Img src="/img/user-guide/iam/users/reset-password-action.png" alt="Actions dropdown with Reset password option highlighted" />

<Img src="/img/user-guide/iam/users/reset-password-modal.png" alt="Reset password modal with New password, Confirm new password fields, and Temporary password toggle" />

### Switching User Type (Person / Service Account)

If you need to convert a person's account into a service account (or the other way around):

1. From the user list or detail page, open the **Actions** dropdown.
2. Click **Mark as Service Account** or **Mark as Personal Account**, depending on the current type.

<Img src="/img/user-guide/iam/users/actions-dropdown.png" alt="Actions dropdown showing Mark as Service Account, Reset password, and Delete user options" />

The change applies immediately. Once a user becomes a Service Account, an **Access Tokens** tab appears on their detail page.

:::warning Domain Owners
Domain owners can't be marked as Service Accounts. If you try, IOMETE returns an error identifying the user as a domain owner.
:::

### Deleting a User

You can delete a user from either the list page or the detail page.

**From the list page:** open the **Actions** dropdown for that row, click **Delete**, then confirm with **Yes, delete it**.

**From the detail page:** open the **Actions** dropdown, click **Delete user**, then confirm. IOMETE redirects you back to the user list.

<Img src="/img/user-guide/iam/users/delete-user-action.png" alt="Actions dropdown with Delete user option highlighted" />

:::warning Irreversible Action
Deleting a user removes their role mappings, group memberships, and account permanently. This can't be undone.
:::

## Domain-Level Member View

If you're working inside the domain portal instead of the admin portal, users appear with a slightly different interface.

<Img src="/img/user-guide/iam/users/domain-members.png" alt="Domain-level Members page showing the member list with name and identity columns" />

The domain-level detail view displays the same general info as the admin view, with two exceptions: the **Added by** field is hidden, and **Type** only appears for Service Accounts.

Three tabs are available:

- **Groups**: a read-only list of group memberships. You can't assign or remove groups from here.
- **Roles**: domain-scoped roles that you can assign and remove (requires the `iam_settings` `manage` permission). Each role indicates whether it's directly assigned or inherited from a group.
- **Access Tokens**: only visible for Service Account users. Manages domain-scoped access tokens.

:::info Bundle Authorization
If the **domain-level bundle authorization** module is enabled, the **Roles** tab is replaced by a **Permissions** tab listing direct permissions assigned to the user in the domain bundle.
:::

## Access Permissions

The tables below map every operation to the role or permission it requires.

### Admin Portal

| Operation | Required Role |
|-----------|--------------|
| View user list and details | Any admin role |
| Create, edit, or delete a user | `IAM_MANAGER` |
| Reset a password | `IAM_MANAGER` |
| Toggle user type | `IAM_MANAGER` |
| Assign/remove groups | `IAM_MANAGER` |
| Assign/remove admin roles | `IAM_MANAGER` |

If you lack the required role, action buttons appear disabled with a tooltip explaining why.

### Domain Portal

| Operation | Required Permission |
|-----------|-------------------|
| View member details and groups | Domain member |
| Assign/remove domain roles | `iam_settings` service, `manage` action |

## Related Features

- **[Groups](/user-guide/groups)**: assign users to groups so they inherit roles collectively.
- **[Roles](/user-guide/roles)**: assign domain-level roles to users as members.
- **[LDAP Configuration](/user-guide/ldap-configuration)**: sync users from an external LDAP directory.
- **[Single Sign-On](/user-guide/single-sign-on)**: provision users through identity provider flows (SAML/OIDC).
