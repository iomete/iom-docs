---
title: Kubernetes Deployment
description: Tune the iom-maintenance service — resource limits and archival configuration.
sidebar_label: Deployment
last_update:
  date: 09/30/2026
  author: Shashank Chaudhary
---

This section covers deployment and tuning for Kubernetes administrators. The `iom-maintenance` service is always deployed, so there is no feature flag to enable.

## Resource Defaults

Tune CPU and memory limits for the `iom-maintenance` service via Helm:

```yaml
services:
  maintenance:
    resources:
      requests:
        memory: "1000Mi"
        cpu: "2000m"
      limits:
        memory: "1000Mi"
        cpu: "2000m"
```

:::warning Requests and limits must match
Set `requests` and `limits` to the same values. Mismatched values can cause maintenance operations to run in loops.
:::

## Archival Configuration

Completed maintenance runs are archived to Iceberg tables for long-term retention. Configure via Helm:

```yaml
services:
  maintenance:
    archival:
      enabled: true
      retentionDays: 30
```

How archival works:

- **Schedule**: archival runs every hour.
- **What moves**: finished runs older than `retentionDays` are moved in batches of 500.
- **Where they go**: three Iceberg tables in `spark_catalog.iomete_system_db`:
  - `maintenance_evaluation_runs`
  - `maintenance_execution_runs`
  - `maintenance_sql_runs`

:::note
Archived runs no longer appear in the console's run history. To see runs older than `retentionDays`, query the archive tables in the SQL Editor.
:::
