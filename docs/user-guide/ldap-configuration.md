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

To view LDAP configuration page, navigate to the `Settings` menu item and click to the `LDAP` tab under `IAM`.

<Img src="/img/user-guide/ldap/ldap-landing.png" alt="LDAP configuration" />

On this page, you'll find configuration options divided into three parts:

- [**General Options**](#general-options)
- [**Group Settings**](#group-settings)
- [**Attribute Mappings**](#attribute-mappings)
- [**Sync Settings**](#sync-settings)


### General options

The General Options include the following settings:


- **Connection URL**:
  The URL to connect to your LDAP server, for example: ` ldap://openldap.infra.svc:389` 
- **Bind DN**:
  The distinguished name (DN) used for binding to the LDAP server, such as: `cn=admin,dc=iomete,dc=com`
- **Bind Credential**:
  The password for the Bind DN (admin). This can be stored securely in a vault using the $\{vault.ID} format.
- **LDAP Searching and Updating** 
  - **Users DN**:
    The base distinguished name where the users are located in the LDAP directory, e.g.: ` ou=users,dc=iomete,dc=com`
  - **User Object Classes**:
    A comma-separated list of object classes that identify LDAP user objects, such as ` inetOrgPerson, organizationalPerson`
  - **Custom User LDAP Filter (Optional)**:
    Add a custom filter to refine user search. Use LDAP syntax starting with ( and ending with ).

<Img src="/img/user-guide/ldap/ldap-general-info.png" alt="LDAP configuration general inputs" maxWidth="500px"/>

:::info `Test connection`
You can test a URL connection by clicking the `Test connection` button (located next to the Connection URL input) before saving your settings.
:::

:::info `Test authentication`
You can test a URL authentication by clicking the `Test authentication` button (located next to the Bind Credential input) before saving your settings.
:::

### Group Settings

**Group Searching and Updating**
1. **Groups DN**:
   Defines the LDAP tree where groups are located, for example: ` ou=groups,dc=iomete,dc=com`. 
   This is the parent distinguished name (DN) of your LDAP groups.
2. **Group Object Classes**:
   A comma-separated list of object classes that identify LDAP group objects, for instance: ` groupOfNames`
3. **Custom User LDAP Filter (Optional)**:
   Add a custom filter to refine group searches. Use LDAP syntax, such as: ` (&(objectClass=groupOfNames)(cn={name}))`

**Group and LDAP Attribute Mappings**
- **Group Attribute (Optional)**:
   Defines the attributes for LDAP group mapping in IOMETE. This can include:

   ``` **name**: The group's common name (CN), typically mapped to the cn LDAP attribute.```
   ``` **membership**: Defines the membership attribute, commonly member.```
   ``` **membershipAttributeType**: Specifies the type of the membership attribute, typically DN (Distinguished Name).```


<Img src="/img/user-guide/ldap/ldap-groups.png" alt="LDAP configuration groups" maxWidth="500px"/>


### Attribute mappings

The attribute should be filled for all LDAP user records you want to import from LDAP to IOMETE.
The Attribute mappings include the following settings:

- **email**
- **firstName**
- **lastName**

<Img src="/img/user-guide/ldap/ldap-att-mapping.png" alt="LDAP configuration attribute mappings"/>

### Sync settings

Sync settings options include how often everything syncs: Full sync interval (seconds) or Updated/New LDAP user sync interval (seconds).

- **Periodic Full Sync** Should periodic full synchronization of LDAP users be enabled in IOMETE? If enabled, a number input field will appear below it to input the synchronization interval in seconds.
- **Periodic Changed Users Sync** Should periodic synchronization of changed or newly created LDAP users be enabled in IOMETE? If yes, you'll see a number input field below to set the synchronization interval in seconds.

<Img src="/img/user-guide/ldap/ldap-sync-settings.png" alt="LDAP configuration sync settings"/>

After filling in all the required information, click the <button className="button button--primary button-iom">**Create**</button> button.

## LDAP actions

After creating LDAP, you will see action buttons on the left side below the input fields.
<Img src="/img/user-guide/ldap/ldap-action-new.png" alt="LDAP actions (Sync all users, Sync changed users, Remove imported users, Delete LDAP)"/>

###   **Sync All Users**

    Clicking the Sync all users button ensures that all user data from your LDAP server is synchronized with the IOMETE user database. This includes updating usernames, emails, group memberships, and any other user details.

###  **Sync Changed Users**
    
    Clicking Sync changed users updates only the information for users whose details have changed since the last synchronization. IOMETE will check for modifications such as new users, deleted users, or updated details, and apply those changes to its database.

###  **Sync All Groups**

    Clicking Sync all groups ensures that all group information from your LDAP server is synchronized with IOMETE. This includes group memberships and associated attributes.

###  **Sync Changed Groups**

    Clicking Sync changed groups updates only the group information that has changed since the last sync. IOMETE will only pull in modifications or new groups from LDAP.

###  **Remove Imported Users**
    
    Click Remove imported users to delete any users that were previously imported from the LDAP server. This action will remove them from the IOMETE user database.

###  **Remove Imported Groups**
    
    Click Remove imported groups to delete any groups that were previously imported from LDAP, removing them from IOMETE's group database.

###  **Disable LDAP**
    
    Click Disable LDAP to stop LDAP synchronization and disable the LDAP provider. Users previously imported from LDAP will be set to read-only until LDAP is re-enabled.

###  **Delete LDAP**
    
    To permanently remove the LDAP settings, click Delete LDAP. A confirmation message will appear; confirm the action by selecting "Yes, delete" to finalize the removal.