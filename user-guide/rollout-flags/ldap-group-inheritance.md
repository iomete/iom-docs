---
title: LDAP Group Inheritance Rollout Flag
description: What the ldapGroupInheritance rollout flag controls, its prerequisites and impact area, and what to check before enabling or disabling it.
sidebar_label: LDAP Group Inheritance
last_update:
  date: 08/18/2026
  author: Sourabh Jajoria
---

When LDAP groups contain other groups, this flag makes IOMETE take that hierarchy into account for authorization: a group's members inherit any access granted to its parent groups, the same way users inherit access from the groups they belong to directly. See [LDAP Configuration](../iam/ldap-configuration.md) for the full LDAP sync feature.

This only affects **group-to-group** relationships built during LDAP sync (a group nested inside another group in the directory). Direct LDAP user-to-group membership is a separate code path this flag does not touch, and always syncs regardless of the flag.

|              |                                      |
| ------------ | ------------------------------------ |
| **Flag key** | `ldapGroupInheritance`               |
| **Scope**    | Global only — no per-domain override |
| **Default**  | Enabled                              |

## Prerequisites

### Minimum compatible version

IOMETE `4.0.0` or later to control it through this rollout flag — before that, `ldapGroupInheritance` can only be set through the Helm chart value, which requires a normal redeploy to change.

### Deployment setup changes

None beyond having LDAP itself configured. This flag has no effect unless [group searching and updating](../iam/ldap-configuration.md) is enabled on the LDAP integration and at least one synced group is nested inside another.

### Services to restart

None **when changed through the rollout-flag admin API**. Toggling a global override takes effect automatically, within about a minute, without restarting `iom-identity` or any other service — the change applies starting with the next LDAP sync.

If you instead change the underlying Helm value this flag falls back to (`features.ldapGroupInheritance.enabled`) with no override set, that's an ordinary Helm upgrade — it goes through your normal deploy process like any other chart value.

## Impact Area

### LDAP Sync

Every LDAP sync (manual or periodic full sync) always clears and rebuilds the group-to-group hierarchy table for LDAP-origin groups — that part isn't gated by this flag. What the flag controls is what happens next:

- **Enabled:** any group-to-group relationships found in that sync (a group listed as a member of another group) are rebuilt into the hierarchy.
- **Disabled:** the sync logs that group hierarchy creation was skipped and leaves the hierarchy table empty for LDAP-origin groups. Direct user-to-group mappings sync normally either way.

### Authorization

The group hierarchy is what lets access granted to a parent group also apply to its child groups' members. This is read at the point IOMETE builds the user-to-groups mapping used for authorization: each user's groups are expanded to include ancestor groups from the hierarchy table.

- **Enabled:** a user in a child group is treated as if they're also in every ancestor group, for authorization purposes.
- **Disabled:** only a user's direct group memberships are considered — ancestor groups are not added, so no inherited access applies.

## Rollout Considerations

Enabling `ldapGroupInheritance` takes effect starting with the next LDAP sync — it does not retroactively re-derive authorization decisions that were already cached before that sync completes. If your LDAP directory has nested groups with access granted at a parent level, trigger a full sync after enabling so those relationships are picked up.

## Rollback Considerations

**Breaking, not safe.** The group-to-group hierarchy table is always cleared on the next LDAP sync, flag or no flag — disabling this flag just means it isn't rebuilt afterward. Concretely: any user who only has access because of an inherited (not direct) group membership silently loses that access once the next sync runs and authorization re-reads the (now-empty) hierarchy. Direct group memberships and any access granted through them are unaffected.

Before disabling, confirm no access grant relies solely on inherited group membership, and notify affected users first. If you re-enable later, the hierarchy is rebuilt from the current LDAP directory state on the next sync, not restored from what existed before you disabled it.

## References

- [LDAP Configuration](../iam/ldap-configuration.md)
- [Groups](../iam/groups.md)

---

See [Rollout Flags](./overview.md) for other flags.
