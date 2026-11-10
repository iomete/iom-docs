---
title: Database Explorer API Migration
description: Migrate your Database Explorer API integrations from V1 to V2 and review response changes introduced in IOMETE 4.0.2.
sidebar_label: Database Explorer API Migration
last_update:
  date: 11/06/2026
  author: Shashank Chaudhary
---

# Database Explorer API Migration

The Database Explorer API (schema API) lets you list catalogs, namespaces, and tables and retrieve table details. V1 retrieves metadata through `DESCRIBE` statements. V2 uses Arrow Flight and a shared schema server to support cached listings and apply data security policies for the calling user.

IOMETE 4.0.2 aligns V2 response fields, types, and status codes with V1. Some [behavior differences](#differences-from-v1) remain, so review your client's response handling before migrating.

## Migration Options {#find-your-starting-point}

- **Update your API URLs:** Follow [Migrating an Integration](#migration-checklist) to call V2 directly and use cached metadata listings.
- **Keep your V1 URLs:** Enable [V1 forwarding](#forwarding-v1-to-v2) to use V2 through your existing routes. Forwarded requests always retrieve live metadata.

If you already use V2, review the [changes in IOMETE 4.0.2](#changes-in-4-0-2) before upgrading.

## V2 Benefits {#why-move-to-v2}

- **Cached listings:** V2 caches metadata to reduce retrieval time. Use `forceRefresh=true` when you need live metadata.
- **Data security:** V2 applies the calling user's data security policies when listing catalogs, namespaces, and tables. V1 retrieves metadata as an admin user.
- **Partial listings:** If one catalog or namespace fails, V2 can return results from the others. See [Behavior Differences](#behavior-differences) for the affected requests.
- **Secret redaction:** V2 masks values identified as secrets in properties, comments, and connection options as `*********(redacted)`.

## Requirements {#requirements}

- IOMETE 4.0.2 or later.
- `arrowFlightForDbExplorer` enabled in your Helm values. Without it, V2 returns `409`.

  ```yaml
  arrowFlightForDbExplorer:
    enabled: true
  ```

- The shared schema server on the [Spark 4.1 image](#schema-server-image), which IOMETE 4.0.2 uses by default.

### Schema Server Image {#schema-server-image}

The table details fixes introduced in IOMETE 4.0.2 need the shared schema server on `spark-py:4.1.3-v3` or later (Spark 4.1). IOMETE 4.0.2 uses `4.1.3-v3` by default, so you don't need to change anything unless your Helm values pin an older version in `docker.defaultSparkVersion` or `docker.defaultSparkPyVersion`. In that case, remove the pin or set it to `4.1.3-v3` or later. `docker.defaultSparkPyVersion` changes only the schema server image, not the images your compute clusters use.

On Spark 4.1, V1 responses also change:

- V1 encloses namespace names that begin with a digit in backticks, for example, `` `1db` ``.
- Table details include a `Statistics` row in `detailedTableInfo`.

V2 remains available on older images, including Spark 3.5. Changes to status codes, secret redaction, snapshot timestamps, name matching, and live retrieval for forwarded V1 requests still apply. The following limitations remain until the schema server runs Spark 4.1:

- Table details return `type: TABLE` and the previous column and field type names.
- Additional `DESCRIBE` rows, metadata columns, and column comments are unavailable.
- Table details requests for Hive views return `404`, and catalog-wide table listings omit these views.
- `forceRefresh=true` does not refresh the namespace list.

## Migrating an Integration {#migration-checklist}

1. Upgrade to IOMETE 4.0.2 or later, and make sure your Helm values don't pin the shared schema server to an image older than the [required image](#schema-server-image).
2. Enable `arrowFlightForDbExplorer` in your Helm values.
3. Review the [response changes](#changes-in-4-0-2) and [differences from V1](#differences-from-v1). Update your client to handle status codes, type names, redacted values, and partial listings.
4. Replace your V1 endpoint paths with the V2 paths in the [endpoint reference](#endpoint-mapping-reference). **List Catalogs** remains on V1.
5. Use [`forceRefresh=true`](#refreshing-cached-metadata) after DDL operations, such as creating a namespace or table, when you need the change to appear immediately.

If you need to keep your current URLs, use [V1 forwarding](#forwarding-v1-to-v2) after completing steps 1–3.

### Updating Base Paths

Replace `/api/v1/` with `/api/v2/` and add `/sql/` before `/schema/`:

| Context        | V1 Base Path                       | V2 Base Path                           |
| :------------- | :--------------------------------- | :------------------------------------- |
| **Domain API** | `/api/v1/domains/{domain}/schema/` | `/api/v2/domains/{domain}/sql/schema/` |
| **Admin API**  | `/api/v1/admin/schema/`            | `/api/v2/admin/sql/schema/`            |

## Endpoint Mapping Reference

Use the following mappings to update your requests. Continue using the V1 **List Catalogs** endpoint; it has no V2 equivalent.

### Domain-Level APIs

Use these endpoints for integrations within a specific domain.

| Feature                                | V1 Endpoint                                                                                                | V2 Endpoint                                                                                                    |
| :------------------------------------- | :--------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| **List Catalogs**                      | `GET /api/v1/domains/{domain}/schema/catalogs`                                                             | Continue using V1                                                                                              |
| **List Namespaces**                    | `GET /api/v1/domains/{domain}/schema/catalogs/{catalog}/namespaces`                                        | `GET /api/v2/domains/{domain}/sql/schema/catalogs/{catalog}/namespaces`                                        |
| **List All Namespaces**                | `GET /api/v1/domains/{domain}/schema/namespaces`                                                           | `GET /api/v2/domains/{domain}/sql/schema/namespaces`                                                           |
| **List Namespaces Grouped by Catalog** | `GET /api/v1/domains/{domain}/schema/namespaces/v2`                                                        | `GET /api/v2/domains/{domain}/sql/schema/namespaces/v2`                                                        |
| **List All Tables of a Catalog**       | `GET /api/v1/domains/{domain}/schema/catalogs/{catalog}/tables`                                            | `GET /api/v2/domains/{domain}/sql/schema/catalogs/{catalog}/tables`                                            |
| **List Tables**                        | `GET /api/v1/domains/{domain}/schema/catalogs/{catalog}/namespaces/{ns}/tables`                            | `GET /api/v2/domains/{domain}/sql/schema/catalogs/{catalog}/namespaces/{ns}/tables`                            |
| **Describe Table**                     | `GET /api/v1/domains/{domain}/schema/catalogs/{catalog}/namespaces/{ns}/tables/{table}`                    | `GET /api/v2/domains/{domain}/sql/schema/catalogs/{catalog}/namespaces/{ns}/tables/{table}`                    |
| **Table Snapshots**                    | `GET /api/v1/domains/{domain}/schema/catalogs/{catalog}/namespaces/{ns}/tables/{table}/snapshots-and-refs` | `GET /api/v2/domains/{domain}/sql/schema/catalogs/{catalog}/namespaces/{ns}/tables/{table}/snapshots-and-refs` |

### Admin-Level APIs

Use these endpoints for administrative integrations.

| Feature             | V1 Admin Endpoint                                                            | V2 Admin Endpoint                                                                |
| :------------------ | :--------------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| **List Catalogs**   | `GET /api/v1/admin/schema/catalogs`                                          | Continue using V1                                                                |
| **List Namespaces** | `GET /api/v1/admin/schema/catalogs/{catalog}/namespaces`                     | `GET /api/v2/admin/sql/schema/catalogs/{catalog}/namespaces`                     |
| **List Tables**     | `GET /api/v1/admin/schema/catalogs/{catalog}/namespaces/{ns}/tables`         | `GET /api/v2/admin/sql/schema/catalogs/{catalog}/namespaces/{ns}/tables`         |
| **Describe Table**  | `GET /api/v1/admin/schema/catalogs/{catalog}/namespaces/{ns}/tables/{table}` | `GET /api/v2/admin/sql/schema/catalogs/{catalog}/namespaces/{ns}/tables/{table}` |

## Refreshing Cached Metadata {#refreshing-cached-metadata}

V2 namespace, table listing, and table details endpoints accept the boolean query parameter `forceRefresh`. It defaults to `false`.

Set `forceRefresh=true` to bypass the metadata cache and retrieve live metadata over Arrow Flight. Use it after DDL operations when you need a new namespace or table to appear immediately. With the [required schema server image](#schema-server-image), the parameter refreshes both namespace and table listings.

V1 routes [forwarded to V2](#forwarding-v1-to-v2) always retrieve live metadata, regardless of this parameter.

## Forwarding V1 Routes to V2 {#forwarding-v1-to-v2}

Enable the [`schemaV1ForwardToV2` feature flag](../feature-flags/schema-v1-forward-to-v2.md) to forward V1 domain and admin schema requests to V2 without changing your client URLs. **List Catalogs** continues to use V1.

The flag is disabled by default and requires `arrowFlightForDbExplorer` to be enabled. Forwarded requests use V2 responses and data security checks but always retrieve live metadata.

| `arrowFlightForDbExplorer` | `schemaV1ForwardToV2` | V1 domain and admin routes        | V2 routes |
| :------------------------- | :-------------------- | :-------------------------------- | :-------- |
| Off                        | On or off             | Handled by V1                     | `409`     |
| On                         | Off (default)         | Handled by V1                     | Available |
| On                         | On                    | Forwarded to V2; live metadata    | Available |

Review the [behavior differences](#behavior-differences) before enabling forwarding.

:::warning Upgrading From an Earlier Release
Before IOMETE 4.0.2, enabling `arrowFlightForDbExplorer` also forwarded V1 schema requests to V2. Starting with 4.0.2, you must enable `schemaV1ForwardToV2` to retain this behavior.

Without forwarding, V1 requires the `iom-spark-connect-rest-client` service, which runs by default. If you disabled this service, enable it again or enable V1 forwarding when you upgrade.
:::

## Behavior Differences {#behavior-differences}

Unless noted otherwise, these changes apply to V2 requests and [V1 requests forwarded to V2](#forwarding-v1-to-v2). Forwarded V1 requests always retrieve live metadata, so the caching differences do not apply to them.

### Changes in IOMETE 4.0.2 {#changes-in-4-0-2}

IOMETE 4.0.2 updates V2 responses to align more closely with V1. If you already use V2, review the **Client Action** column for response handling changes before upgrading. Table details fixes also require the [Spark 4.1 schema server image](#schema-server-image), the 4.0.2 default.

If you migrate from V1, review these response formats along with the [differences that remain](#differences-from-v1).

#### Status Codes

| Request                                                                            | Before 4.0.2                        | From 4.0.2                                         | Client Action                                                  |
| :--------------------------------------------------------------------------------- | :---------------------------------- | :------------------------------------------------- | :------------------------------------------------------------- |
| Table details for a missing table, namespace or catalog                            | `200` with an `error` field         | `404`                                              | Handle `404` instead of reading `error` from a `200` response. |
| Table details that fail to load                                                    | `404` or `200`                      | `500`                                              | Handle `500` as a server error, not as a missing table.        |
| Listing a missing catalog or namespace                                             | `200` with `[]`                     | `404`, or `403` if your domain has no access to it | Treat `404` and `403` as errors, not as an empty result.       |
| Any request to a domain you cannot access                                          | `200` with `[]`, or no access check | `403`                                              | Handle `403`.                                                  |
| Listing a namespace that fails to load, such as a REST catalog with an invalid URI | `200` with `[]`                     | `500`                                              | Handle `500` as an error, not as an empty namespace.           |

#### Table Details

| Field                                                                              | Before 4.0.2                                                                                    | From 4.0.2                                                                                                                                                                                                                                                       | Client Action                                                                 |
| :--------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| `type`                                                                             | `TABLE`                                                                                         | `MANAGED` or `EXTERNAL`                                                                                                                                                                                                                                          | Update checks that compare `type` with `TABLE`.                               |
| `columns[].dataType`                                                               | `integer`, `timestamptz`, `array`, `struct`, and `string` for `char` and `varchar` columns      | Spark SQL names, as `DESCRIBE` returns them: `int`, `timestamp`, `array<int>`, `struct<a:int>`, `char(3)`, `varchar(10)`                                                                                                                                         | Update mappings that use the old type names.                                  |
| `fields[].type`                                                                    | `bigint`, `smallint`, `tinyint`, `timestamptz` for `TIMESTAMP`, `timestamp` for `TIMESTAMP_NTZ` | `long`, `short`, `byte`, `timestamp` for `TIMESTAMP`, `timestamp_ntz` for `TIMESTAMP_NTZ`                                                                                                                                                                        | Update type mappings. `timestamp` now means `TIMESTAMP`, not `TIMESTAMP_NTZ`. |
| Table comment                                                                      | Inside `Table Properties`, as `comment=…`                                                       | `detailedTableInfo.Comment`                                                                                                                                                                                                                                      | Read the comment from `detailedTableInfo.Comment`.                            |
| `Table Properties` of V2 tables                                                    | Included `external` and `is_managed_location`                                                   | Omitted, as in V1                                                                                                                                                                                                                                                | Use `type` to tell managed tables from external ones.                         |
| Secrets                                                                            | JDBC passwords shown in plain text in `Table Properties`                                        | Table properties, table comments, Iceberg view properties and JDBC options that look like secrets (name or value contains `password`, `secret` or `token`, for example) return `*********(redacted)`. JDBC options appear under `Storage Properties`, as in V1.  | Use your configured secret store to retrieve credentials.                     |
| `detailedTableInfo`                                                                | Name, Type, Comment, Location, Provider, Owner and the table and storage properties only        | `DESCRIBE TABLE EXTENDED` rows, including `View Text` and `View Query Output Columns`; the `Statistics` exception is listed below                                                                                                                                | None.                                                                         |
| `metadataColumns`, `columnDefaultValues`, `columns[].comment`, `fields[].metadata` | `null` or missing                                                                               | Populated: Iceberg metadata columns (`_spec_id`, `_partition`, `_file`, `_pos`, `_deleted`), `DEFAULT` values, and column comments, nested fields included                                                                                                       | None.                                                                         |
| Hive views in `spark_catalog`                                                      | `404`                                                                                           | `200`, with `columns` and `fields`                                                                                                                                                                                                                               | None.                                                                         |
| Snapshot `committed_at`                                                            | `2026-01-01T10:00:00.123Z`                                                                      | `2026-01-01T10:00:00.123+00:00`                                                                                                                                                                                                                                  | Parse the value as an ISO 8601 timestamp instead of matching the string.      |

#### Listings and Caching

| Behavior                                                   | Before 4.0.2                                                                            | From 4.0.2                                             | Client Action                                                                                                  |
| :--------------------------------------------------------- | :-------------------------------------------------------------------------------------- | :----------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| Table name in table details                                | Matched as a `LIKE` pattern, so `_` and `%` matched any characters                      | Exact name, falling back to one case-insensitive match | Do not pass `_` or `%` as wildcards.                                                                           |
| Namespaces with similar names, such as `my_db` and `myXdb` | Each listed the other's tables                                                          | Each lists only its own tables                         | None.                                                                                                          |
| `forceRefresh=true`                                        | Refreshed only the table list, so a new namespace could take up to 10 minutes to appear | Refreshes namespace and table listings                 | None.                                                                                                          |
| V1 routes forwarded to V2                                  | Could return V2's cached results                                                        | Always retrieves live metadata                         | Listing every table of a very large catalog can be slower, and returns `500` if it exceeds the server timeout. |
| `catalogInfo` in `/namespaces/v2`                          | No `properties`, `credentials` or `resourceTags`                                        | Included, with secrets masked as in V1                 | None.                                                                                                          |
| **List Catalogs**                                          | Unsorted                                                                                | Sorted by name, regardless of flag settings            | Do not rely on the previous order.                                                                             |

### Differences From V1 That Remain {#differences-from-v1}

Account for the following differences when you migrate to V2 or enable V1 forwarding.

| Behavior                                                                    | V1                              | V2                                                                  | Client Action                                                                                |
| :-------------------------------------------------------------------------- | :------------------------------ | :------------------------------------------------------------------ | :------------------------------------------------------------------------------------------- |
| Missing catalog or namespace                                                | `500`                           | `404`, or `403` on listings if your domain has no access to it      | Handle `404` and `403`.                                                                      |
| Hadoop catalog whose warehouse folder does not exist yet                    | `500`                           | `200` with `[]`                                                     | None.                                                                                        |
| Order of `/namespaces/v2` and of table listings with `includeMetadata=true` | Unsorted                        | Sorted                                                              | None.                                                                                        |
| Listing a domain's namespaces when one catalog fails                        | The whole call fails            | Returns `200` with the other catalogs' namespaces                   | A `200` response can be partial. Compare it with the catalog list if you need every catalog. |
| Listing all tables in a catalog when one namespace fails | The entire request fails | Returns `200` with the other namespaces' tables. A timeout causes the entire request to fail with `500`. | A `200` response can contain partial results. List the affected namespace's tables directly to inspect the error. |
| `/namespaces/v2` on a slow namespace or a very large catalog                | Waits                           | Times out with `500`, or a `Timed out fetching namespaces` error    | Retry, or list namespaces one catalog at a time.                                             |
| Access checks                                                               | Lists metadata as an admin user | Lists metadata as the calling user, so data security policies apply | Grant the calling user access to the catalogs, namespaces and tables your integration reads. |
| Table comments and Iceberg view properties that look like secrets           | Returned in full                | `*********(redacted)`                                               | Use your configured secret store to retrieve credentials.                                    |
| `Statistics` row in `detailedTableInfo` (Spark 4.1)                         | Included                        | Omitted                                                             | Run `DESCRIBE TABLE EXTENDED` in the SQL editor if you need it.                              |
| Caching                                                                     | Always live                     | Cached                                                              | Pass `forceRefresh=true` after DDL operations.                                               |
| `arrowFlightForDbExplorer` off                                              | Works                           | Returns `409`                                                       | Enable `arrowFlightForDbExplorer` before you call V2.                                        |
| SQL service (`iom-sql`) unavailable                                         | Works                           | Returns `503`, also on V1 routes forwarded to V2                    | Retry when the service is available.                                                         |
