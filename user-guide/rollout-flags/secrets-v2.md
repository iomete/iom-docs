---
title: Secrets V2 Rollout Flag
description: What the secretsV2 rollout flag controls, why it exists, and what to check before disabling it.
sidebar_label: Secrets V2
last_update:
  date: 08/18/2026
  author: Sourabh Jajoria
---

`secretsV2` gates the structured, [`secretObject`-based secret references](../secrets.md#api-migration-guide) used across compute, Spark jobs, streaming jobs, Jupyter containers, and storage configs — the mechanism that lets a workload reference a secret backed by an [IOMETE-managed Kubernetes secret or a read-only HashiCorp Vault integration](../secrets.md#secret-backends), instead of only the older `${secrets.key}` inline placeholder.

See [Secrets Management](../secrets.md) for the full feature and its [API Migration Guide](../secrets.md#api-migration-guide). This page only covers the flag itself — see [Rollout Flags](./overview.md) for how flags are evaluated and how to change them.

## Scope

`secretsV2` is a **global-only** flag: it doesn't support a per-domain override, so every domain sees the same value.

## What it affects

- Compute cluster environment variables and Spark configuration
- Spark job and streaming job secrets
- Jupyter container environment variables
- Storage config connection secrets
- Vault config usage authorization (the RAS **Use** permission check on Vault-backed secret references)

## Default

Enabled by default, matching the behavior this flag replaces — existing deployments see no change unless a global override is set.

## Before you disable it

Disabling `secretsV2` is a breaking change for anything already relying on it, not a safe no-op:

- Any compute, Spark job, streaming job, or Jupyter container whose secrets are configured **only** through a structured `secretObject` reference (not the legacy `${secrets.key}` placeholder) will silently lose those secret-backed environment variables and Spark configuration values the next time it deploys. There's no fallback and no error — the workload just starts without the credential.
- Any storage config set up **only** through `storageSecret` (no legacy `secretKey` value ever saved) loses its connection secret the same way.
- Vault-Use authorization checks stop being enforced for all Vault-backed secret references while the flag is off.

Before disabling, confirm nothing depends solely on a `secretObject`/`storageSecret` reference, and let affected users know first.
