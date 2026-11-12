---
title: V1 Schema API Forwarding Feature Flag
description: What the schemaV1ForwardToV2 feature flag controls, its prerequisites and impact area, and what to check before enabling or disabling it.
sidebar_label: V1 Schema API Forwarding
last_update:
  date: 11/06/2026
  author: Shashank Chaudhary
---

The `schemaV1ForwardToV2` flag forwards V1 [Database Explorer API](../sql-editor/database-explorer-api-migration.md) requests to V2. Your integrations use V2 metadata retrieval and data security checks while keeping their existing V1 URLs.

|              |                                      |
| ------------ | ------------------------------------ |
| **Flag key** | `schemaV1ForwardToV2`                |
| **Scope**    | Global only — no per-domain override |
| **Default**  | Disabled                             |

## Prerequisites

### Minimum Compatible Version

IOMETE `4.0.2` or later.

Enable `arrowFlightForDbExplorer` in your Helm values before enabling this flag. Keep the shared schema server on the [required Spark 4.1 image](../sql-editor/database-explorer-api-migration.md#schema-server-image), the IOMETE 4.0.2 default, to apply all table details fixes introduced in 4.0.2.

### Deployment Setup Changes

After you meet the prerequisites, no additional deployment changes are required to enable or disable this flag.

### Services to Restart

None. Changes take effect within about a minute as services refresh their feature flags.

## Impact Area

The flag applies to the following V1 domain and admin schema routes:

- `/api/v1/domains/{domain}/schema/...`
- `/api/v1/admin/schema/...`

**List Catalogs** continues to use V1. The console's Database Explorer uses the API selected by `arrowFlightForDbExplorer` independently of this flag.

Forwarded requests return V2 responses and always retrieve live metadata. V2 applies the calling user's data security policies and can return partial listings when a catalog or namespace fails. Review the [differences from V1](../sql-editor/database-explorer-api-migration.md#differences-from-v1) before enabling the flag.

## Rollout Considerations

1. Enable `arrowFlightForDbExplorer` and check that the schema server runs the [required image](../sql-editor/database-explorer-api-migration.md#schema-server-image).
2. Update your V1 clients to handle the [V2 response differences](../sql-editor/database-explorer-api-migration.md#behavior-differences), including status codes, access checks, and partial listings.
3. Enable `schemaV1ForwardToV2` under **Administration → Feature Flags**. See [Managing Feature Flags](./managing-feature-flags.md).

No data migration is required.

:::warning Upgrading From an Earlier Release
Before IOMETE 4.0.2, `arrowFlightForDbExplorer` alone forwarded V1 schema requests to V2. Enable `schemaV1ForwardToV2` when you upgrade to retain forwarding. If you leave it disabled, V1 requires the `iom-spark-connect-rest-client` service.
:::

## Rollback Considerations

Before disabling the flag, ensure that the `iom-spark-connect-rest-client` service is running and that your clients can handle V1 responses.

Disabling the flag restores V1 request handling within about a minute. No data migration is required. During this interval, the platform health check and V1 routes may use different flag values and disagree on whether the service is required.

## References

- [Database Explorer API Migration](../sql-editor/database-explorer-api-migration.md)
- [Managing Feature Flags](./managing-feature-flags.md)

---

See [Feature Flags](./overview.md) for other flags.
