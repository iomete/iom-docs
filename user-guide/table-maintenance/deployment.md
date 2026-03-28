---
title: Kubernetes Deployment
description: Deploy and tune the iom-maintenance service — feature flag, resource limits, and archival configuration.
sidebar_label: Deployment
last_update:
  date: 03/09/2026
  author: Shashank Chaudhary
---

This section covers deployment and tuning for Kubernetes administrators.

## Feature Flag

The maintenance service is disabled by default. Enable it in your Helm values:

```yaml
features:
  enableAutomatedMaintenance:
    enabled: true
```

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

The archival batch size is `500` records per cycle and archival runs hourly by default.
