---
slug: /ldap-configuration
title: LDAP Configuration
description: Connect IOMETE to an LDAP or Active Directory server to import users and groups and authenticate sign-ins against the directory.
sidebar_label: LDAP Configuration
last_update:
  date: 04/21/2026
  author: Sourabh Jajoria
---

import Img from '@site/src/components/Img';

## LDAP Configuration Overview

If your organization already manages users in LDAP or Active Directory, you can connect IOMETE to that directory to import users and groups and let LDAP users sign in with their existing credentials.

Open **Settings → IAM → LDAP** to configure the integration. Only users with the **IAM Manager** admin role can access this page.

:::info
Each IOMETE installation supports a single, platform-wide LDAP configuration. The configuration is shared across all workspaces and clusters in the installation.
:::

<Img src="/img/user-guide/iam/ldap/ldap-configuration.png" alt="LDAP configuration" />

## Configuration

### General Options

The **General Options** section includes the following settings:

- **Connection URL**: The URL to connect to your LDAP server. Example: `ldap://openldap.infra.svc:389`
- **Bind DN**: The distinguished name (DN) used for binding to the LDAP server. This bind DN must have the necessary permissions on the LDAP directory. Example: `cn=admin,dc=iomete,dc=com`
- **Bind credential**: The password for the bind DN.

<Img src="/img/user-guide/iam/ldap/ldap-general-options.png" alt="LDAP general options with Connection URL, Bind DN, and Bind credential fields" maxWidth="600px" />

Use **Test connection** after entering the **Connection URL** to verify that IOMETE can reach the LDAP server.

Use **Test authentication** after entering the **Connection URL**, **Bind DN**, and **Bind credential** to verify that the bind credentials work.

### User Searching and Updating

Defines the LDAP query parameters for locating and filtering users in the directory.

- **Users DN**: The full DN where the users are located in the LDAP directory. This DN is the parent of LDAP users. Example: `ou=users,dc=iomete,dc=com`.
- **User object classes**: A comma-separated list of object classes that identify LDAP user objects. Example: `inetOrgPerson, organizationalPerson`.
- **Custom user LDAP filter** _(Optional)_: Add a custom filter to refine user search. Enter one LDAP filter per line in the editor.

<Img src="/img/user-guide/iam/ldap/ldap-user-setting.png" alt="LDAP configuration user searching and updating" maxWidth="600px" />

Use **Validate user filters** to check each non-empty filter line before saving. See [Validating LDAP Filters](#validating-ldap-filters) for details.

### User Attribute Mappings

Map each IOMETE user attribute to the corresponding LDAP attribute so that user information is correctly retrieved from the directory.

- **username**: LDAP attribute mapped as the IOMETE username. Commonly `uid` for many LDAP servers, and `sAMAccountName` or `cn` for Active Directory.
- **email**: LDAP attribute mapped as the IOMETE email. Typically `mail` for most LDAP servers.
- **firstName**: LDAP attribute mapped as the IOMETE first name. Default `cn` (common name).
- **lastName**: LDAP attribute mapped as the IOMETE last name. Commonly `sn` (surname).

<Img src="/img/user-guide/iam/ldap/ldap-user-attribute-mapping.png" alt="LDAP user attribute mappings with username, email, firstName, and lastName fields" maxWidth="600px" />

If you want some imported LDAP users to be created as service accounts, enable **Use service-account** and fill these fields:

- **LDAP attribute**: The LDAP attribute to inspect. Example: `employeeType`
- **Attribute value**: The value that marks the user as a service account. Example: `service`

Imported users whose attribute matches this pair are created as service accounts instead of person accounts. You can manage their API access with [service account access tokens](../access-tokens/service-account.md).

<Img src="/img/user-guide/iam/ldap/ldap-service-account.png" alt="LDAP user attribute mappings with Use service-account enabled" maxWidth="600px" />

### Group Searching and Updating

Defines how LDAP groups are searched and mapped, including the DN base, object classes, filter, and group attribute mappings. This section is optional. If you don't need LDAP groups, leave **Group searching and updating** unchecked.

- **Groups DN**: Defines the LDAP tree where groups are located. Example: `ou=groups,dc=iomete,dc=com`.
- **Group object classes**: A comma-separated list of object classes that identify LDAP group objects. Example: `groupOfNames`
- **Custom group LDAP filter** _(Optional)_: Add a custom filter to refine group searches. Enter one LDAP filter per line in the editor.

<Img src="/img/user-guide/iam/ldap/ldap-group-setting.png" alt="LDAP configuration group searching and updating" maxWidth="600px" />

Use **Validate group filters** to check group filter lines before saving.

### Group Attribute Mappings

Fill these attributes for the LDAP group records you want to import from the directory.

- **name**: The LDAP attribute used for group names and RDN is typically `cn`. For example, a group's DN might look like `cn=Group1,ou=groups,dc=example,dc=org`.
- **membership**: The LDAP attribute used for group membership mapping is typically `member`.
- **membershipAttributeType**: Specifies the type of the membership attribute. It can be either `DN` or `UID`. `DN` represents the full path to the object in the directory, while `UID` refers to the unique identifier of the user.

<Img src="/img/user-guide/iam/ldap/ldap-group-attribute-mapping.png" alt="LDAP group attribute mappings with name, membership, and membershipAttributeType fields" maxWidth="600px" />

### Sync Settings

Use **Periodic full sync** to control whether IOMETE regularly synchronizes LDAP users and groups. When enabled, enter the full sync period in seconds. The minimum is `5` seconds, and the default is `86400` seconds (24 hours).

<Img src="/img/user-guide/iam/ldap/ldap-sync-settings.png" alt="LDAP sync settings with Periodic full sync enabled and a 86400 second interval" maxWidth="600px" />

After filling in all required information, click **Save**.

## Validating LDAP Filters

You can validate custom user and group filters before you save the configuration.

<Img src="/img/user-guide/iam/ldap/ldap-validate-user-filters.png" alt="Validated custom user LDAP filter showing 12 valid lines and 1 warning for a filter line with no results" maxWidth="600px" />

- Use **Validate user filters** or **Validate group filters** above the relevant filter editor.
- Enter one LDAP filter per line. Blank lines are ignored.
- Each validated line shows a status in the editor:
  - Green means the line returned results.
  - Yellow means the line returned no results.
  - Red means the line produced an LDAP error.
- If the DN format is invalid, IOMETE shows an inline error on the DN field.
- If the LDAP server can't find the configured object path, IOMETE shows **No such object. Check DN and object classes.**

## LDAP Actions

After saving the integration, you can manage LDAP from the same page.

<Img src="/img/user-guide/iam/ldap/ldap-sync-actions.png" alt="LDAP action buttons: Sync all users and groups, Disable LDAP, and a menu with Remove all users and groups and Delete LDAP" maxWidth="600px" />

### Syncing All Users and Groups

Click **Sync all users** or **Sync all users and groups** to synchronize the current LDAP users and groups with the IOMETE user and group database.

### Removing Imported Users and Groups

Click **Remove all users** or **Remove all users and groups** to delete previously imported LDAP data from IOMETE without deleting the LDAP configuration itself.

### Enabling or Disabling LDAP

Use **Enable LDAP** or **Disable LDAP** to turn the integration on or off. When LDAP is disabled, imported LDAP users can no longer sign in until it is enabled again.

### Deleting LDAP

Click **Delete LDAP** to permanently remove the LDAP configuration and the LDAP users and groups imported through it.

## Soft-Delete Behavior

When the `identitySoftDelete` feature flag is enabled, LDAP sync uses an archive-and-restore flow instead of hard-deleting imported LDAP records.

- **Full sync**: Existing LDAP users and groups are updated, previously archived LDAP users and groups are restored, new LDAP users and groups are created, and LDAP users and groups that no longer exist in the directory are archived. Before rebuilding the current LDAP state, IOMETE also soft-deletes LDAP user-group, user-role, group-role, and group-to-group mappings, then recreates the current mappings from the latest sync result.
- **Remove all users** or **Remove all users and groups**: IOMETE soft-deletes all LDAP-origin users, groups, and LDAP mappings, but keeps the LDAP integration settings so you can sync again later.
- **Delete LDAP**: IOMETE soft-deletes the LDAP integration record and soft-deletes all LDAP-origin users, groups, and LDAP mappings. After the delete completes, the page returns to create mode.
- **Event logs**: Full sync still writes the standard **LDAP Sync** audit entry. In the soft-delete path, IOMETE also writes `iam-users` / `USERS_SYNCED` and `iam-groups` / `GROUPS_SYNCED` event-log entries with `created`, `updated`, `restored`, and `archived` lists.

When the feature flag is disabled, full sync hard-cleans and re-imports LDAP data, and the remove/delete actions hard-delete imported LDAP users, groups, and mappings.

## Access Permissions

All operations on the LDAP page require the **IAM Manager** admin role.

| Admin role     | View | Create | Update | Enable/Disable | Sync | Remove imported | Delete |
| -------------- | ---- | ------ | ------ | -------------- | ---- | --------------- | ------ |
| IAM Manager    | Yes  | Yes    | Yes    | Yes            | Yes  | Yes             | Yes    |
| Any other role | No   | No     | No     | No             | No   | No              | No     |

## Auditing LDAP

To audit LDAP operations, go to **Settings → Administration → Event Logs**. Here, you can view who performed LDAP-related actions and when.

<Img src="/img/user-guide/iam/ldap/ldap-audit.png" alt="LDAP audit logs" />

Click the `+` icon on the left of any entry to inspect the payload for that action.

<Img src="/img/user-guide/iam/ldap/ldap-audit-payload.png" alt="Expanded LDAP Sync event log entry showing the JSON payload with user and group search parameters and attribute mappings" />
