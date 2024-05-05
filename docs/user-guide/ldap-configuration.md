---
title: LDAP Configuration
description: Learn how to integrate LDAP authentication within the IOMETE Data Plane
last_update:
  date: 03/26/2024
  author: Vugar Dadalov
---

import { Trash } from "@phosphor-icons/react";
import Img from '@site/src/components/Img';

IOMETE offers an interface to configure your LDAP server.

---

## Configuration

To view LDAP configuration page, navigate to the `LDAP` menu item and switch to the `LDAP` tab.
Click on the <button className="button button--primary button-iom">Configure</button> button to get started.

<Img src="/img/user-guide/ldap/ldap-configuration.png" alt="LDAP configuration" />

On this page, you'll find configuration options divided into three parts:

- [**General Options**](#general-options)
- [**Sync Settings**](#sync-settings)
- [**Attribute Mappings**](#attribute-mappings)

### General options

The General Options include the following settings:

- **Name:** Currently, only the name `ldap-iomete` is accepted.
- **Enabled** If the provider is disabled, it won't be used for queries, and imported users will be read-only until the provider is re-enabled.
- **Username LDAP attribute** Name of LDAP attribute, which is mapped as IOMETE username.
- **RDN LDAP attribute** The LDAP attribute used as the top attribute in a typical user DN is called the RDN. It's usually the same as the Username LDAP attribute, but it doesn't have to be. For instance, in Active Directory, 'cn' is commonly used as the RDN attribute, even though the username attribute might be 'sAMAccountName'.
- **UUID LDAP attribute** The LDAP attribute used as a unique identifier (UUID) for objects varies among LDAP server vendors. For most, it's 'entryUUID,' but for Active Directory, it's 'objectGUID.' If your LDAP server doesn't support UUID, you can use other unique attributes like 'uid' or 'entryDN' for LDAP users in the tree.
- **User Object Classes** All user LDAP objectClass attributes are separated by commas, like 'inetOrgPerson, organizationalPerson'. IOMETE will write new users to LDAP with these object classes, and existing LDAP user records are only identified if they have all these object classes.
- **Connection URL** Connection URL to your LDAP server
- **Users DN** Here is the LDAP tree where your users are located: 'ou=users,dc=example,dc=com'. This is the parent DN of LDAP users. For instance, a typical user's DN might look like 'uid=john,ou=users,dc=example,dc=com'.
- **Custom User LDAP Filter** Add an extra LDAP Filter to refine user search. Keep it blank if not needed. Start with '(' and end with ')' for correctness.
- **Bind DN** LDAP admin DN, which IOMETE will use to access the LDAP server.
- **Bind Credential** LDAP admin password. This field can get its value from the vault using the $\{vault.ID} format.

<Img src="/img/user-guide/ldap/ldap-configuration-general-options.png" alt="LDAP configuration general inputs" maxWidth="500px"/>

:::info `Test connection`
You can test a URL connection by clicking the `Test connection` button (located next to the Connection URL input) before saving your settings.
:::

:::info `Test authentication`
You can test a URL authentication by clicking the `Test authentication` button (located next to the Bind Credential input) before saving your settings.
:::

### Attribute mappings

The attribute should be filled for all LDAP user records you want to import from LDAP to IOMETE.
The Attribute mappings include the following settings:

- **email**
- **firstName**
- **lastName**

<Img src="/img/user-guide/ldap/ldap-attribute-mappings.png" alt="LDAP configuration attribute mappings"/>

### Sync settings

Sync settings options include how often everything syncs: Full sync interval (seconds) or Updated/New LDAP user sync interval (seconds).

- **Periodic Full Sync** Should periodic full synchronization of LDAP users be enabled in IOMETE? If enabled, a number input field will appear below it to input the synchronization interval in seconds.
- **Periodic Changed Users Sync** Should periodic synchronization of changed or newly created LDAP users be enabled in IOMETE? If yes, you'll see a number input field below to set the synchronization interval in seconds.

<Img src="/img/user-guide/ldap/ldap-sync-settings.png" alt="LDAP configuration sync settings"/>

After filling in all the required information, click the <button className="button button--primary button-iom">**Create**</button> button.

## LDAP actions

After creating LDAP, you will see action buttons on the left side below the input fields.
<Img src="/img/user-guide/ldap/ldap-actions.png" alt="LDAP actions (Sync all users, Sync changed users, Remove imported users, Delete LDAP)"/>

### Sync all users

Clicking the `Sync all users` button in IOMETE makes sure that all user information from your LDAP server gets updated and matched with IOMETE's user database. This includes usernames, emails, group memberships, and other details.

### Sync changed users

Clicking the `Sync changed users` button in IOMETE updates only the user information that has changed since the last synchronization. This means IOMETE checks for updates in your LDAP server and only updates the relevant changes (e.g., modified user details, new users, or deleted users) in its user database.

### Remove imported users

Clicking the `Remove imported users` button in IOMETE will remove any user accounts that were previously imported from the LDAP server.

### Delete LDAP

To delete the LDAP settings, simply click the `Delete LDAP` button below the inputs. Afterward, you'll receive a confirmation message; click "Yes, delete" to confirm the deletion.
