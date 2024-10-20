---
slug: /user-guide/ldap-configuration
title: LDAP Configuration
description: Learn how to integrate LDAP authentication within the IOMETE Data Plane
last_update:
  date: 10/17/2024
  author: Vugar Dadalov
---

import Img from '@site/src/components/Img';

IOMETE offers an interface to configure your LDAP server.

---

## Configuration

To view LDAP configuration page, navigate to the `Settings` menu item and click to the `LDAP` tab under `IAM`.

<Img src="/img/user-guide/iam/ldap/ldap-configuration.png" alt="LDAP configuration" />

### General options

The General Options include the following settings:

- **Connection URL**:
  The URL to connect to your LDAP server. Example: `ldap://openldap.infra.svc:389`
- **Bind DN**:
  The distinguished name (DN) used for binding to the LDAP server. This Bind DN must have the necessary permissions on the LDAP directory. Example: `cn=admin,dc=iomete,dc=com`
- **Bind credential**:
  The password for the Bind DN (admin).

<Img src="/img/user-guide/iam/ldap/ldap-general-options.png" alt="LDAP configuration general options" maxWidth="600px"/>

:::info `Test connection`
You can test a URL connection by clicking the `Test connection` button (located next to the Connection URL input) after entering the Connection URL, before saving your settings.
:::

:::info `Test authentication`
You can test URL authentication by clicking the `Test authentication` button (located next to the Bind Credential input) after entering the Connection URL, Bind DN and Bind Credential, before saving your settings.
:::

### User searching and updating

Defines the LDAP query parameters for locating and filtering users in the directory.

- **Users DN**:
  The full DN where the users are located in the LDAP directory. This DN is the parent of LDAP users. Example: ` ou=users,dc=iomete,dc=com`.
- **User object classes**:
  A comma-separated list of object classes that identify LDAP user objects. Example: `inetOrgPerson, organizationalPerson`.
- **Custom user LDAP filter** _(Optional)_:
  Add a custom filter to refine user search. Use LDAP syntax starting with `(` and ending with `)`.

<Img src="/img/user-guide/iam/ldap/ldap-user-setting.png" alt="LDAP configuration user searching and updating" maxWidth="600px"/>

### User attribute mappings

The LDAP attribute mapped as IOMETE refers to the correlation between LDAP attributes and the application's internal user model, ensuring user-related information is correctly retrieved or stored from the LDAP directory.

- **username**:
  LDAP attribute mapped as IOMETE username. Commonly `uid` for many LDAP servers, and `sAMAccountName` or `cn` for Active Directory. This attribute must be set for all LDAP users you want to import into IOMETE.
- **email**: LDAP attribute mapped as IOMETE email. Typically `mail` for most LDAP servers.
- **firstName**: LDAP attribute mapped as IOMETE first name. Default `cn` (Common name)
- **lastName**: LDAP attribute mapped as IOMETE last name. Commonly `sn` (surname) in most LDAP servers.

<Img src="/img/user-guide/iam/ldap/ldap-user-attribute-mapping.png" alt="LDAP configuration user attribute mappings" maxWidth="600px"/>

### Group searching and updating

Defines how LDAP groups are searched and mapped, including the DN base, object classes, filter, and group attribute mappings. This section is optional—if you don't need it, simply uncheck the option.

- **Groups DN**:
  Defines the LDAP tree where groups are located, for example: ` ou=groups,dc=iomete,dc=com`.
  This is the parent distinguished name (DN) of your LDAP groups.
- **Group object classes**:
  A comma-separated list of object classes that identify LDAP group objects, for instance: ` groupOfNames`
- **Custom group LDAP filter** _(Optional)_:
  Add a custom filter to refine group searches. Use LDAP syntax, such as: ` (&(objectClass=groupOfNames)(cn={name}))`

<Img src="/img/user-guide/iam/ldap/ldap-group-setting.png" alt="LDAP configuration group searching and updating" maxWidth="600px"/>

### Group attribute mappings

The attribute should be filled for all LDAP group records you want to import from LDAP server.

- **name**: The LDAP attribute used for group names and RDN is typically `cn`. For example, a group's DN might look like `cn=Group1,ou=groups,dc=example,dc=org`.
- **membership**: The LDAP attribute used for group membership mapping is typically `member`.
- **membershipAttributeType**: Specifies the type of the membership attribute. It can be either a `DN` (Distinguished Name) or a `UID` (User Identifier). DN represents the **full path** to the object in the directory, while UID refers to the **unique identifier** of the user, commonly used in systems like POSIX.

<Img src="/img/user-guide/iam/ldap/ldap-group-attribute-mapping.png" alt="LDAP configuration group attribute mappings" maxWidth="600px" />

### Sync settings

Sync settings options include how often everything syncs: Full sync interval (seconds) or Updated/New LDAP user sync interval (seconds).

- **Periodic full sync** Should periodic full synchronization of LDAP users be enabled in IOMETE? If enabled, a number input field will appear below it to input the synchronization interval in seconds.

<Img src="/img/user-guide/iam/ldap/ldap-sync-settings.png" alt="LDAP configuration sync settings" maxWidth="600px" />

After filling in all the required information, click the <button className="button button--primary button-iom">**Create**</button> button.

## LDAP actions

After creating LDAP, you will see action buttons on the left side below the input fields.
<Img src="/img/user-guide/iam/ldap/ldap-sync-actions.png" alt="LDAP actions (Sync all users, Sync changed users, Remove imported users, Delete LDAP)"  maxWidth="600px" />

### **Sync all users and groups**

    Clicking the `Sync all users and groups` button ensures that all user and group data from your LDAP server is synchronized with the IOMETE user and group database. This includes updating usernames, emails, group memberships, and any other user and group details.

### **Remove imported users and groups**

    Click `Remove imported users and groups` to delete any users and groups that were previously imported from the LDAP server. This action will remove them from the IOMETE user and group database.

### **Disable LDAP**

    Click Disable LDAP to stop LDAP synchronization and disable the LDAP provider. Users previously imported from LDAP will be set to read-only until LDAP is re-enabled.

### **Delete LDAP**

    To permanently remove the LDAP settings, click Delete LDAP. A confirmation message will appear; confirm the action by selecting "Yes, delete" to finalize the removal.
