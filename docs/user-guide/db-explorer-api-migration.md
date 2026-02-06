---
title: Database Explorer API Migration
description: Technical reference for transitioning to the optimized Schema APIs.
last_update:
  date: 02/06/2026
  author: IOMETE Engineering
---

# Database Explorer API Migration

IOMETE has introduced an optimized version of the Database Explorer APIs, designed to provide significant performance improvements and high-concurrency metadata retrieval for enterprise-scale environments.

This guide provides a structured path for migrating your existing API integrations from V1 to V2.

## 1. Path Transformation Pattern

The migration follows a consistent structural shift in the API base paths. The most notable changes are the transition to `v2` versioning and the inclusion of the `/sql/` service segment.

| Context | Legacy Base Path (V1) | Modern Base Path (V2) |
| :--- | :--- | :--- |
| **Domain API** | `/api/v1/domains/{domain}/schema/` | `/api/v2/domains/{domain}/sql/schema/` |
| **Admin API** | `/api/v1/admin/schema/` | `/api/v2/admin/sql/schema/` |

---

## 2. Endpoint Mapping Reference

The following tables provide the full URI mapping for functional requirements. Note that the **Catalogs discovery** remains on the V1 service.

### Domain-Level APIs
Targeted at specific domains for standard user integrations.

| Feature | Legacy V1 Endpoint | Modern V2 Endpoint |
| :--- | :--- | :--- |
| **List Catalogs** | `GET /api/v1/domains/{domain}/schema/catalogs` | *No change (Stays on V1)* |
| **List Namespaces** | `GET /api/v1/domains/{domain}/schema/catalogs/{catalog}/namespaces` | `GET /api/v2/domains/{domain}/sql/schema/catalogs/{catalog}/namespaces` |
| **List Tables** | `GET /api/v1/domains/{domain}/schema/catalogs/{catalog}/namespaces/{ns}/tables` | `GET /api/v2/domains/{domain}/sql/schema/catalogs/{catalog}/namespaces/{ns}/tables` |
| **Describe Table** | `GET /api/v1/domains/{domain}/schema/catalogs/{catalog}/namespaces/{ns}/tables/{table}` | `GET /api/v2/domains/{domain}/sql/schema/catalogs/{catalog}/namespaces/{ns}/tables/{table}` |
| **Table Snapshots** | `GET /api/v1/domains/{domain}/schema/catalogs/{catalog}/namespaces/{ns}/tables/{table}/snapshots-and-refs` | `GET /api/v2/domains/{domain}/sql/schema/catalogs/{catalog}/namespaces/{ns}/tables/{table}/snapshots-and-refs` |

### Admin-Level APIs
Targeted at administrative integrations.

| Feature | Legacy V1 Admin Endpoint | Modern V2 Admin Endpoint |
| :--- | :--- | :--- |
| **List Catalogs** | `GET /api/v1/admin/schema/catalogs` | *No change (Stays on V1)* |
| **List Namespaces** | `GET /api/v1/admin/schema/catalogs/{catalog}/namespaces` | `GET /api/v2/admin/sql/schema/catalogs/{catalog}/namespaces` |
| **List Tables** | `GET /api/v1/admin/schema/catalogs/{catalog}/namespaces/{ns}/tables` | `GET /api/v2/admin/sql/schema/catalogs/{catalog}/namespaces/{ns}/tables` |
| **Describe Table** | `GET /api/v1/admin/schema/catalogs/{catalog}/namespaces/{ns}/tables/{table}` | `GET /api/v2/admin/sql/schema/catalogs/{catalog}/namespaces/{ns}/tables/{table}` |

---

## 3. Query Parameter Reference

The V2 APIs introduce new control capabilities while maintaining full compatibility with existing parameters.

### `forceRefresh` (Boolean) - NEW
*   **Default:** `false`
*   **Description:** When `true`, the service bypasses the internal metadata cache and performs a live fetch from the source catalog via Arrow Flight. This is recommended after DDL operations (e.g., creating a table) to ensure immediate visibility.
*   **Applicability:** All V2 endpoints (Namespaces, Tables, and Table Details).

---

## 4. Migration Checklist

To ensure a successful transition, please follow these steps:

1.  **Update Routing:** Update your API client base URLs to incorporate the `/v2/` and `/sql/` path segments.
2.  **Verify Feature Flag:** Ensure the `arrowFlightForDbExplorer` feature flag is enabled in your environment.
4.  **Enable On-Demand Refresh:** Optionally incorporate the `forceRefresh` parameter into your application's metadata synchronization logic to allow users to bypass cached data and retrieve live schema updates.