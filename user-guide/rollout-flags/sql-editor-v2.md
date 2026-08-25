---
title: SQL Editor V2 Rollout Flag
description: What the sqlEditorV2 rollout flag controls, its prerequisites and impact area, and what to check before enabling or disabling it.
sidebar_label: SQL Editor V2
last_update:
  date: 08/25/2026
  author: Shahriyar Novruzov
---

Switches the [SQL Editor](../sql-editor/overview.md) and Query Monitoring to the V2 engine. V2 brings more reliable query execution, automatic recovery of interrupted queries, better handling of large results, real-time status updates, and faster monitoring and search.

A single flag controls both surfaces — the SQL Editor and Query Monitoring switch together. When the flag is disabled, both run on the V1 engine.

|              |                                      |
| ------------ | ------------------------------------ |
| **Flag key** | `sqlEditorV2`                        |
| **Scope**    | Global only — no per-domain override |
| **Default**  | Disabled                             |

## Prerequisites

### Minimum Compatible Version

IOMETE `4.0.0` or later.

Compute clusters must run Spark image `3.5.7-v4` or later (including Spark 4.x). Queries submitted through V2 against a compute on an older image fail with a message asking to update the compute — so update your compute clusters to a compatible image **before** enabling the flag.

### Deployment Setup Changes

None. No additional Helm values, infrastructure, or configuration are needed to turn this flag on or off.

### Services to Restart

None. Toggling the flag takes effect automatically — users get the new engine the next time they load or reload the SQL Editor or Query Monitoring page.

## Impact Area

Both surfaces switch between engines together:

### SQL Editor

Query submission, execution, results, cancellation, and query history all run through the selected engine. On V2, queries survive service restarts and are recovered automatically, large results are handled more reliably, and query status updates arrive in real time.

### Query Monitoring

The Query Monitoring (Activity Monitoring) pages and APIs read from the selected engine's history. V2 monitoring is faster and search is more responsive.

Queries are recorded by the engine that ran them: queries submitted on V2 are visible in V2 monitoring, and queries submitted on V1 are visible in V1 monitoring.

## Rollout Considerations

1. Update all compute clusters to a V2-capable Spark image (`3.5.7-v4` or later, including Spark 4.x) — see [Minimum Compatible Version](#minimum-compatible-version).
2. Enable the `sqlEditorV2` flag.
3. Users switch to V2 the next time they load or reload the SQL Editor or Query Monitoring page — queries already running on V1 at that moment continue to completion on V1.

No data migration is needed to enable the flag.

## Rollback Considerations

Disabling the flag is safe: users switch back to V1 on the next page reload, with no deployment needed.

Keep in mind:

- Queries running on V2 at the moment of rollback continue to completion and remain recorded, but V2-submitted queries are not visible in V1 monitoring while the flag is off.
- New queries run through the V1 engine, so V1 limitations return: queries can be lost on service restarts, large results are handled less reliably, and monitoring is slower.

## References

- [SQL Editor](../sql-editor/overview.md)
- [Query Monitoring](../monitoring/query-monitoring.md)

---

See [Rollout Flags](./overview.md) for other flags.
