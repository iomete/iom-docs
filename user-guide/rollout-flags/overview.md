---
title: Rollout Flags
description: How IOMETE's runtime feature-flag system works — evaluation order, Helm defaults, and the admin API for viewing and overriding flags.
sidebar_label: Overview
last_update:
  date: 08/18/2026
  author: Sourabh Jajoria
---

Rollout flags let IOMETE turn a feature on or off at runtime, without a redeploy. They replace the older pattern of feature flags declared once in Helm values at install time, which required a chart upgrade to change and could only be set the same way for every domain.

## How a flag resolves

Every rollout flag resolves in this order:

1. **Domain override** — if an admin has set an override for the specific domain, that value wins.
2. **Global override** — otherwise, if a global override exists, that value wins.
3. **Disabled** — otherwise, the flag is off by default.

Flag checks never fail a request. If the flag backend is temporarily unreachable, the last known value keeps being used; if no value has ever been loaded, the flag evaluates to disabled rather than throwing an error.

Some flags are **global-only**: they don't support a per-domain override at all, and every domain sees the same value. This is noted per flag; see [Secrets V2](./secrets-v2.md) for an example.

## Helm defaults are preserved automatically

If a flag was previously controlled by a Helm value (`features.<flagKey>.enabled` in your data-plane values) and no admin override has been set yet, that Helm value is used as the effective global value. This means turning a Helm-only flag into a rollout flag doesn't change behavior for existing deployments — you keep seeing whatever the chart already set, until an admin explicitly overrides it.

## Viewing and changing flags

Rollout flags are managed through the admin API today (a management screen in the admin portal is planned):

- `GET /api/v1/admin/rollout-flags` — list all flags and their current overrides.
- `GET /api/v1/admin/rollout-flags/{flagKey}` — view a single flag's metadata and current overrides.
- `POST /api/v1/admin/rollout-flags/{flagKey}/overrides` — set a global or domain override.
- `DELETE /api/v1/admin/rollout-flags/{flagKey}/overrides` — remove an override (a global override is reset to disabled; a domain override is removed, falling back to the global value).

Setting or removing an override requires the **Administration Manager** admin role; listing and viewing flags only requires any admin role. Every override change is written to the audit log.

To set a global override, for example:

```bash
curl -X POST "https://<your-domain>/api/v1/admin/rollout-flags/secretsV2/overrides" \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "scopeType": "GLOBAL",
    "enabled": true,
    "notes": "Re-enabling after investigating the storage-config fallback"
  }'
```

For a domain override, set `"scopeType": "DOMAIN"` and include the domain name as `"scopeId"`. Attempting a domain override on a global-only flag returns a `400` error.

## What each flag tells you

Every flag ships with a fixed set of metadata, written by the engineering team when the flag is introduced:

| Field                       | Meaning                                                                                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name / Description**      | What the flag does.                                                                                                                                                                         |
| **Dependencies**            | What has to be true for the flag to work (services reachable, other features configured).                                                                                                   |
| **Affected Surfaces**       | Which product features change behavior when the flag is toggled.                                                                                                                            |
| **Rollback Considerations** | What happens — and what could break — if you disable the flag after it's been on. Read this before disabling a flag that's been enabled for a while; it's not always safe to just turn off. |
| **Documentation Links**     | Where to read more about the feature the flag controls.                                                                                                                                     |

## Documenting a new flag

When a new rollout flag ships, add a page under `rollout-flags/` following this template — it keeps every flag page predictable and maps directly onto the flag's metadata fields (see above), so a reader who knows one flag page already knows how to read the next one.

1. **Intro paragraph** — one or two sentences on what the flag does, from the flag's `description`. Link to the full feature doc if one exists; don't duplicate it.
2. **Quick-reference table** — `Flag key`, `Scope` (global-only, or domain-overridable), `Default`.
3. **`## Dependencies`** — from the flag's `dependencies`, if it has any. Omit this section if the flag has none.
4. **`## What it affects`** — from the flag's `affectedSurfaces`, as a bullet list of product features/surfaces, not raw endpoint paths.
5. **`## Before you disable it`** — from the flag's `rollbackConsiderations`. Say plainly whether disabling is safe or breaking, and exactly what breaks and for whom.
6. **`## Learn more`** — from the flag's `documentationLinks`, as a bullet list.

[Secrets V2](./secrets-v2.md) is the reference example.

## Available flags

- [Secrets V2](./secrets-v2.md)
