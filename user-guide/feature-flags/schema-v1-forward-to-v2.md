---
title: Forward V1 Schema API to V2 Feature Flag
description: What the schemaV1ForwardToV2 feature flag controls, its prerequisites and impact area, and what to check before enabling or disabling it.
sidebar_label: Forward V1 Schema API to V2
last_update:
  date: 11/06/2026
  author: Valid Akhundov
---

Answers the V1 schema API from the V2 schema API instead of V1's own code. The V2 schema API is the faster, Arrow Flight based API behind the [Database Explorer](../sql-editor/database-explorer.md); see [Database Explorer API Migration](../sql-editor/database-explorer-api-migration.md) for how the two APIs compare.

This flag only decides what callers of the **V1** schema API receive, such as your own scripts and integrations. Which API the console uses is set separately by `arrowFlightForDbExplorer` in the Helm values, and that setting is unaffected by this flag.

|              |                                      |
| ------------ | ------------------------------------ |
| **Flag key** | `schemaV1ForwardToV2`                |
| **Scope**    | Global only — no per-domain override |
| **Default**  | Disabled                             |

## Prerequisites

### Minimum Compatible Version

IOMETE `4.0.3` or later.

From `4.0.0` up to that release, the V1 schema API was answered by V2 whenever `arrowFlightForDbExplorer` was enabled, with no separate setting. From this release on, V1 runs its own code until you enable this flag, also where `arrowFlightForDbExplorer` is enabled.

### Deployment Setup Changes

- `arrowFlightForDbExplorer` must be enabled in the Helm values (it is by default). It is what serves the V2 schema API; with it disabled, this flag has no effect and V1 runs its own code.
- While this flag is disabled, the V1 schema API needs the `iom-spark-connect-rest-client` service, which is deployed by default (`services.sparkConnect.restClient.enabled`).

### Services to Restart

None **when changed through the feature-flag admin API**. A change takes effect within about a minute, without restarting `iom-cluster` or any other service.

## Impact Area

### V1 Schema API

These V1 routes follow the flag:

| Route | Endpoints |
| ----- | --------- |
| Domain | `GET /api/v1/domains/{domain}/schema/namespaces`, `.../namespaces/v2`, `.../catalogs/{catalog}/namespaces`, `.../catalogs/{catalog}/tables`, `.../catalogs/{catalog}/namespaces/{namespace}/tables`, `.../tables/{table}`, `.../tables/{table}/snapshots-and-refs` |
| Admin | `GET /api/v1/admin/schema/catalogs/{catalog}/namespaces`, `.../namespaces/{namespace}/tables`, `.../tables/{table}` |

- **Enabled:** each call is answered by the matching V2 endpoint, with V2's status code and body. V1 calls always ask V2 for fresh data, as V1 always read the catalog live.
- **Disabled:** each call runs V1's own code, as before V2 existed.

The catalog lists (`GET /api/v1/domains/{domain}/schema/catalogs` and `GET /api/v1/admin/schema/catalogs`) are not affected; they always run V1's own code.

For example, this call returns the same body as `GET /api/v2/domains/{domain}/sql/schema/catalogs/spark_catalog/namespaces/default/tables/orders` while the flag is enabled:

```bash
curl -H "Authorization: Bearer $IOMETE_TOKEN" \
  "https://<your-iomete-host>/api/v1/domains/default/schema/catalogs/spark_catalog/namespaces/default/tables/orders"
```

### Health Check

While the flag is disabled, the `iom-spark-connect-rest-client` service is part of the platform health check, since V1's own code needs it. While both this flag and `arrowFlightForDbExplorer` are enabled, it is left out.

## Rollout Considerations

- V2 answers like V1 in most cases, but some differences remain by design: a missing catalog or namespace returns `404` (or `403` if your domain has no access) instead of `500`, listings are sorted, a catalog that fails to load is left out of a multi-catalog listing instead of failing the whole call, and table properties or comments that look like secrets are returned redacted. Check that your integrations handle these before enabling the flag.
- On very large catalogs, listing every table of a catalog through V2 can hit V2's timeout and return `500`, where V1 waited longer.
- The table details V2 returns depend on the schema server's Spark image. Run the schema server on a current image so V1 callers get the same table details as before.
- V1 and V2 can be used side by side: enabling the flag doesn't change the V2 schema API or the console.

## Rollback Considerations

Disabling the flag is safe: within about a minute, the V1 schema API runs its own code again. No data is stored behind this flag.

Keep in mind:

- V1's own code needs the `iom-spark-connect-rest-client` service. If you turned that service off while V1 was answered by V2, turn it back on before disabling the flag.
- For up to that minute after a change, the platform health check and the V1 routes can disagree about whether `iom-spark-connect-rest-client` is needed.

## References

- [Database Explorer API Migration](../sql-editor/database-explorer-api-migration.md)
- [Database Explorer](../sql-editor/database-explorer.md)
- [Managing Feature Flags](./managing-feature-flags.md)

---

See [Feature Flags](./overview.md) for other flags.
