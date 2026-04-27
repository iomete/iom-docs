---
slug: /admin-roles
title: Admin Roles
description: Reference for the built-in IOMETE admin roles that gate platform management actions across IAM, domains, catalogs, security, compute, and system administration.
sidebar_label: Admin Roles
last_update:
  date: 04/27/2026
  author: Soltan Garayev
---

## Overview

Admin roles are built-in, predefined roles that grant permission to manage specific areas of the IOMETE platform. You assign admin roles to users directly or to groups, and group members inherit the role automatically. Each admin role scopes a user to one management area — IAM, domains, Spark catalogs, data security, compute, or system administration — so you can grant only the access a person needs.

Admin roles are different from **Resource Bundles** and **Domain Authorization** (see [Resource Bundles](./ras/ras.md) and [Domain Authorization](./domain-authorization.md)), which grant resource-scoped access to specific domains and the resources they contain. Admin roles always apply platform-wide within the area they manage; they don't scope down to individual resources.

## Available Admin Roles

IOMETE ships with six built-in admin roles. The list is fixed — you can't create new admin roles or edit the permissions of existing ones.

| Value | Label | Description |
|---|---|---|
| `DOMAIN_MANAGER` | Domain Manager | Manage domains and their resource mappings. Domain managers are owners of all domains, meaning they can do everything across all domains. |
| `IAM_MANAGER` | IAM Manager | Manage users, groups, admin roles, LDAP, SSO, and SCIM operations. |
| `SPARK_CATALOG_MANAGER` | Spark Catalog Manager | Manage Spark catalogs — create, update, and delete. |
| `DATA_SECURITY_AND_AUDIT_MANAGER` | Data Security and Audit Manager | Manage data security, Spark catalog permissions, and audit operations. |
| `COMPUTE_RESOURCES_MANAGER` | Compute Resources Manager | Manage compute resources — Docker registries, volumes, and node types. |
| `ADMINISTRATION_MANAGER` | Administration Manager | Manage system configurations and event logs. |

A user or group can hold multiple admin roles. Any admin role grants read access to the IAM section (you can view users, groups, and admin roles), but write access is gated by `IAM_MANAGER`.

## Assigning Admin Roles

You assign admin roles in two places:

- **To a user** — open the user's detail page from [Users](./users.md) and add the admin role under the user's role assignments.
- **To a group** — open the group's detail page from [Groups](./groups.md) and add the admin role to the group. All current and future group members inherit it.

Assigning or removing an admin role requires the `IAM_MANAGER` admin role. Without it, the assignment controls are disabled.

## Admin Roles vs. Resource Bundles

Admin roles and Resource Bundles cover different layers of the platform:

| Concept | Scope | What it controls | Where to manage |
|---|---|---|---|
| **Admin roles** | Platform-wide, fixed set | Management actions in IAM, domains, catalogs, security, compute, and system settings | IAM > Admin Roles |
| **Resource Bundles / Domain Authorization** | Resource-scoped | Granular access to specific domains and the resources within them | [Resource Bundles](./ras/ras.md), [Domain Authorization](./domain-authorization.md) |

Use admin roles to delegate platform administration. Use resource bundles to govern day-to-day access to data and compute resources.
