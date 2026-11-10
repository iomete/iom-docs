---
title: Resource Group Roles Feature Flag
description: What the resourceGroupRoles feature flag controls, its prerequisites and impact area, and what to check before enabling or disabling it.
sidebar_label: Resource Group Roles
last_update:
  date: 11/06/2026
  author: Sourabh Jajoria
---

Lets administrators give people access to a resource group through [roles](../iam/roles.md), and lets a domain role decide which namespaces its members can deploy to. Access given through roles adds to the permissions a resource group already has; nothing existing is replaced.

|              |                                      |
| ------------ | ------------------------------------ |
| **Flag key** | `resourceGroupRoles`                 |
| **Scope**    | Global only — no per-domain override |
| **Default**  | Disabled                             |

## Prerequisites

### Minimum Compatible Version

IOMETE `4.0.2` or later.

### Deployment Setup Changes

None. No additional Helm values, infrastructure, or configuration are needed to turn this flag on or off.

### Services to Restart

None. A change reaches all services within a couple of minutes, without a restart.

## Impact Area

### Resource group access

Enabling the flag unlocks role-based access on resource groups: an administrator can grant a person a role on a group, and that role decides what they can see and use among the group's resources. Role-based access is added to the permissions the group already grants, so existing access is unchanged.

### Namespace deployment

Enabling the flag also unlocks namespace control on domain roles: a domain role can define which namespaces its members are allowed to deploy to. Without the flag, a role-based namespace list is not applied.

### Role assignments and namespace lists

Adds role assignments on resource groups and namespace lists on roles. Both are stored, and only take effect while the flag is on. Roles themselves stay manageable without the flag.

## Rollout Considerations

Enabling the flag adds access, it never removes it: permissions a resource group already grants stay as they are, and roles add to them. Assign roles after enabling; users see the new access within a couple of minutes.

## Rollback Considerations

**Breaking, not safe.** While the flag is off, anyone whose access to a resource group or namespace comes only from a role loses it.

Nothing is deleted. Role assignments and namespace lists are kept, and apply again when the flag is turned back on.

Before disabling, confirm no user or group depends only on a role for access, and tell affected users first.

## References

- [Roles](../iam/roles.md)

---

See [Feature Flags](./overview.md) for other flags.
