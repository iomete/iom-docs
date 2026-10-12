---
title: Service Account Access Tokens
description: Generate and manage access tokens for service accounts, and control who owns a service account through explicit owners and run-as principals.
sidebar_label: Service Account Tokens
last_update:
  date: 10/12/2026
  author: Sourabh Jajoria
---

import Img from '@site/src/components/Img';

If you need automated systems, CI/CD pipelines, or external integrations to call the IOMETE API, service account access tokens are the way to go. They work like [personal access tokens](./personal), but they're tied to a service account instead of a human user.

This guide focuses on what's different about service account tokens. For the basics of creating, suspending, and rate-limiting tokens, see the [Personal Access Tokens](./personal) guide.

## Owners and Run-As Principals

Every service account carries an explicit list of principals, and each one holds exactly one of two roles.

| Role | What it grants |
|---|---|
| **Owner** | Full control: view and manage the account's tokens, and add or remove other owners and run-as principals. |
| **Run-as** | Standing to run workloads as the account, with no management rights. An owner still controls the tokens and the access list. |

A principal is either a user or a group. A group counts as one entry rather than one entry per member, so adding someone to an owning group gives them access immediately, without touching the service account itself. Nested groups count too: if a group owns the account, members of its sub-groups get the same access.

:::note Nested Groups and Expiry Emails
Access follows nested groups, but expiry notification emails only reach the direct members of an owning group. Someone who owns an account through a sub-group can manage its tokens without being emailed before they expire. Add them as a direct owner if they need the warnings.
:::

IAM managers and super admins can view and manage any service account whatever these lists say. That's the escape hatch for an account whose owners have all left.

:::info Upgrading from Group Sharing
Earlier releases granted access implicitly: sharing any group with a service account was enough to manage its tokens. Access is now an explicit owner entry instead. The upgrade converted each account's previously-sharing groups into group owner entries, so nobody lost access along the way.
:::

## Prerequisites

To manage a service account's tokens, you need one of the following:

- An owner entry on that service account, either directly as a user or through a group that owns it.
- The IAM manager admin role, or super admin.

Sharing a group with the account grants nothing on its own, and you don't need an admin role to manage an account you own.

:::warning Access Denied
If you see _"may not access owners or run-as of service account"_, you hold neither an owner entry nor the IAM manager role. Ask an existing owner or an IAM manager to add you as an owner.
:::

## Finding the Token Management Page

You manage service account tokens from the account's detail page. The **Access Tokens** tab only appears for users of type `SERVICE_ACCOUNT`, and you can get there in two ways.

**For domain members**

1. Go to **Settings** > **Members**.
2. Find and select the service account.
3. Open the **Access Tokens** tab.

<Img src="/img/user-guide/service-account-access-tokens/domain-access-tokens-tab.png" alt="Service account detail page showing the Access Tokens tab at domain level under Settings > Members" />

**For admins**

1. Go to **Admin** > **Users**.
2. Find and select the service account.
3. Open the **Access Tokens** tab.

<Img src="/img/user-guide/service-account-access-tokens/admin-access-tokens-tab.png" alt="Service account token list at admin level showing the Max RPS column" />

Both paths lead to the same interface and apply the same ownership check.

## Managing Service Account Tokens

You create, suspend, and delete service account tokens the same way as personal tokens — with a few key differences. See the [Personal Access Tokens](./personal) guide for the full workflow.

- **Max RPS column**: The token list includes a **Max RPS** column (only visible for service accounts) that displays the configured requests-per-second cap, or "None" if unset.
- **Expiry notifications**: When token expiry notifications are enabled, emails go to the account's owners. See [Access Token Expiry Notifications](./expiry-notifications) for who exactly gets notified.

<Img src="/img/user-guide/service-account-access-tokens/generate-token.png" alt="Generate Access Token dialog with Token name, Max RPS, and expiration options" />

## Managing Owners and Run-As Principals

Owners and run-as principals have their own endpoints under `/api/v1/service-accounts/{serviceAccount}`.

### Reading the Access List

```http
GET /api/v1/service-accounts/{serviceAccount}/access
```

This returns a flat list of every principal attached to the account:

```json
[
  { "id": "data-platform", "type": "GROUP", "role": "OWNER" },
  { "id": "jane.doe", "type": "USER", "role": "RUN_AS" }
]
```

An account with nothing assigned returns an empty list. Reading takes the same standing as writing: owner or IAM manager.

### Assigning and Removing Principals

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/owners/users` | Add users as owners |
| DELETE | `/owners/users` | Remove users as owners |
| POST | `/owners/groups` | Add groups as owners |
| DELETE | `/owners/groups` | Remove groups as owners |
| POST | `/run-as/users` | Add users as run-as principals |
| DELETE | `/run-as/users` | Remove users as run-as principals |
| POST | `/run-as/groups` | Add groups as run-as principals |
| DELETE | `/run-as/groups` | Remove groups as run-as principals |

Every write takes a plain list body, so one call can assign or remove several principals at once:

```json
["jane.doe", "john.smith"]
```

Writes are atomic. Validation runs across the whole list first, and a single bad entry rejects the call without writing anything. Removals are idempotent, so removing a principal that was never assigned still succeeds.

### Changing a Principal's Role

A principal holds exactly one role at a time. Promoting a run-as principal to owner updates its existing entry rather than adding a second one, so a single call does it:

```http
POST /api/v1/service-accounts/{serviceAccount}/owners/users
["jane.doe"]
```

Going the other way takes two calls. Owner already covers everything run-as grants, so adding run-as to someone who already owns the account does nothing. Remove the owner entry first, then add the run-as entry:

```http
DELETE /api/v1/service-accounts/{serviceAccount}/owners/users
["jane.doe"]

POST /api/v1/service-accounts/{serviceAccount}/run-as/users
["jane.doe"]
```

## Token API Endpoints

If you're calling the API directly, service account tokens use their own set of endpoints, separate from personal token endpoints.

### Domain-Level Endpoints

Base path: `/api/v1/domains/{domain}/auth/service-accounts/{serviceAccountId}`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/tokens` | List tokens |
| POST | `/tokens` | Create a token |
| PATCH | `/tokens/{name}` | Update a token (status, maxRps) |
| DELETE | `/tokens/{name}` | Delete a token |

Requires `access_token.manage` ([Roles](/user-guide/roles)), plus ownership of the service account.

### Admin-Level Endpoints

Base path: `/api/v1/auth/service-accounts/{serviceAccountId}`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/tokens` | List tokens |
| POST | `/tokens` | Create a token |
| PATCH | `/tokens/{name}` | Update a token (status, maxRps) |
| DELETE | `/tokens/{name}` | Delete a token |

Requires ownership of the service account. No admin role is needed here, so a non-admin owner can manage their own service account's tokens.

:::info Deprecated Endpoint
The older `POST /service-accounts/tokens` endpoint (with `serviceAccountId` in the request body) is deprecated. Use the path-parameter versions above instead.
:::

## Access Permissions

| Action | Who can do it |
|---|---|
| View a service account's owners and run-as principals | Owners, IAM managers |
| Add or remove owners and run-as principals | Owners, IAM managers |
| List, create, update, delete the account's tokens | Owners, IAM managers |
| Run workloads as the service account | Owners, run-as principals |

Domain-level token endpoints also require the `access_token.manage` role permission. Configure it through [Roles](/user-guide/roles).
