---
title: Event Logs
description: Review identity event logs in IOMETE without mixing them with data access audit records.
sidebar_label: Event Logs
last_update:
  date: 05/11/2026
  author: sourabh
---

import Img from '@site/src/components/Img';

## Event Logs Overview

Event Logs help administrators review identity audit entries recorded by IOMETE. The page currently shows LDAP sync activity, including who ran the sync and the payload recorded for that action.

Event Logs are different from Audit Logs. **Event Logs** in the Admin Portal are identity-scoped entries exposed by the identity event logs API; **Audit Logs** track data access and policy evaluation activity and are stored in `spark_catalog.iomete_system_db.data_access_audit`.

## Event Logs and Audit Logs

Separating Event Logs from Audit Logs helps you look in the right place during an investigation. Use Event Logs when you need to review LDAP sync activity. Use Audit Logs when you need to review access to data.

| Log type | What it records | Where to find it | Primary use |
|---|---|---|---|
| Event Logs | Identity audit entries, currently LDAP sync events | **Admin Portal -> Administration -> Event Logs** | Checking LDAP sync history and payloads |
| Audit Logs | Data access attempts, policy evaluations, and access control decisions | **Admin Portal -> Data Governance -> Audit Logs** | Checking data access history |

## Viewing and Filtering Event Logs

The Event Logs list gives you a chronological view of LDAP sync activity, so you can trace identity synchronization changes without querying internal audit storage.

1. Open **Admin Portal** from the user menu.
2. Go to **Administration -> Event Logs**.
3. Review the event table:
   - **Actor**: The user or service account that triggered the event.
   - **Action**: The identity action that was recorded, such as **LDAP Sync**.
   - **Payload**: A preview of the JSON payload for the event.
   - **Action date**: The date and time when the action occurred.

<Img src="/img/user-guide/iam/ldap/ldap-audit.png" alt="Event Logs list filtered to LDAP Sync events" />

4. Use the controls above the table to narrow the list:
   - **Time range**: Limit the table to a recent window, such as **Last 30 days**.
   - **User**: Show events for a specific actor.
   - **Action**: Show one type of event, such as **LDAP Sync**.
   - **Search**: Search the visible event fields.
   - **Refresh**: Reload the table after new activity occurs.
   - **Filter settings**: Open additional table or filter controls.

## Inspecting Event Payloads

Payload details show the structured data behind an event, which is useful when you need to review what IOMETE recorded for the action.

1. Find the event in **Administration -> Event Logs**.
2. Click the `+` icon beside the row.
3. Review the detail header for the actor, action, and action date.
4. Inspect **Content payload** for the full JSON body.

<Img src="/img/user-guide/iam/ldap/ldap-audit-payload.png" alt="Event Log details page showing an LDAP Sync JSON payload" />

The payload structure depends on the action. For example, an LDAP sync event can include user search parameters, group search parameters, and attribute mappings.

## Access Permissions

Event Logs are part of platform administration. Users need the `ADMINISTRATION_MANAGER` role to open the page, filter entries, and inspect payloads. See [Admin Roles](./iam/admin-roles.md) for the full built-in role reference.

## Related Resources

- [LDAP Configuration](./iam/ldap-configuration.md): review how LDAP operations appear in Event Logs.
- [Admin Roles](./iam/admin-roles.md): assign the `ADMINISTRATION_MANAGER` role.
