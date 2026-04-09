---
title: Service Account Access Tokens
description: Generate and manage access tokens for service accounts to enable secure, automated API access to IOMETE.
sidebar_label: Service Account Tokens
last_update:
  date: 04/09/2026
  author: Abhishek Pathania
---

import Img from '@site/src/components/Img';

If you need automated systems, CI/CD pipelines, or external integrations to call the IOMETE API, service account access tokens are the way to go. They work like [personal access tokens](./personal), but they're tied to a service account instead of a human user. 

This guide focuses on what's different about service account tokens. For the basics of creating, suspending, and rate-limiting tokens, see the [Personal Access Tokens](./personal) guide.

## Prerequisites

Before you can manage service account tokens, you need:

- **Group membership**: You must share at least one group with the service account. Without this, the token list returns a 403 error.
- **Permission**: Either the `access_token.manage` role permission (domain level) or any admin role (admin level). The **Generate new token** button stays disabled if you lack the required permission.

:::warning Group Membership
If you see _"You must be in the same group as this service account to view and manage tokens"_, ask your admin to add you to one of the service account's groups.
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

Both paths lead to the same interface. The difference is permissions: domain-level access requires the `access_token.manage` role permission, while admin-level access is open to any admin user.

## Managing Service Account Tokens

You create, suspend, and delete service account tokens the same way as personal tokens — with a few key differences. See the [Personal Access Tokens](./personal) guide for the full workflow.

- **Max RPS column**: The token list includes a **Max RPS** column (only visible for service accounts) that displays the configured requests-per-second cap, or "None" if unset.

<Img src="/img/user-guide/service-account-access-tokens/generate-token.png" alt="Generate Access Token dialog with Token name, Max RPS, and expiration options" />

## API Endpoints

If you're calling the API directly, service account tokens use their own set of endpoints (separate from personal token endpoints). Every endpoint enforces the same-group requirement on top of standard permissions.

### Domain-Level Endpoints

Base path: `/api/v1/domains/{domain}/auth/service-accounts/{serviceAccountId}`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/tokens` | List tokens |
| POST | `/tokens` | Create a token |
| PATCH | `/tokens/{name}` | Update a token (status, maxRps) |
| DELETE | `/tokens/{name}` | Delete a token |

Requires `access_token.manage` (role v1) or `MANAGE_ACCESS_TOKEN` (bundle v2), plus same-group membership.

### Admin-Level Endpoints

Base path: `/api/v1/auth/service-accounts/{serviceAccountId}`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/tokens` | List tokens |
| POST | `/tokens` | Create a token |
| PATCH | `/tokens/{name}` | Update a token (status, maxRps) |
| DELETE | `/tokens/{name}` | Delete a token |

Requires any admin role, plus same-group membership.

:::info Deprecated Endpoint
The older `POST /service-accounts/tokens` endpoint (with `serviceAccountId` in the request body) is deprecated. Use the path-parameter versions above instead.
:::

## Access Permissions

Different permission models control who can manage service account tokens. The same-group check applies in all contexts, even for admins.

| Context | Required Permission | Same-Group Required |
|---------|--------------------|--------------------|
| Domain, role-based (v1) | `access_token.manage` | Yes |
| Domain, bundle-based (v2) | `MANAGE_ACCESS_TOKEN` | Yes |
| Admin | Any admin role | Yes |

Configure `access_token.manage` through [Roles](/user-guide/roles), or `MANAGE_ACCESS_TOKEN` through [Domain Authorization](/user-guide/iam/ras/domain-authorization).
