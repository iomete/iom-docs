---
title: Secrets V2 Rollout Flag
description: What the secretsV2 rollout flag controls, its dependencies and affected surfaces, and what to check before disabling it.
sidebar_label: Secrets V2
last_update:
  date: 08/18/2026
  author: Sourabh Jajoria
---

Enables structured `secretObject` references for compute, Spark jobs, Jupyter containers, and storage configs, backed by IOMETE-managed Kubernetes secrets or read-only HashiCorp Vault integrations, alongside the existing legacy `${secrets.key}` inline-placeholder substitution. See [Secrets Management](../secrets.md) for the full feature.

| | |
| --- | --- |
| **Flag key** | `secretsV2` |
| **Scope** | Global only — no per-domain override |
| **Default** | Enabled |

## Dependencies

Requires `iom-cluster` to reach `iom-core`'s rollout-flag evaluation API, and deployments to provide the `secretsV2` rollout-flag default.

## What it affects

- Compute cluster environment variables and Spark configuration
- Spark job and streaming job secrets
- Jupyter container environment variables
- Storage config connection secrets
- Vault config usage authorization (the RAS **Use** permission check on Vault-backed secret references)

## Before you disable it

Disabling `secretsV2` is a breaking change for anything already relying on it, not a safe no-op:

- Any compute, Spark job, streaming job, or Jupyter container whose secrets are configured **only** through a structured `secretObject` reference (not the legacy `${secrets.key}` placeholder) will silently lose those secret-backed environment variables and Spark configuration values the next time it deploys. There's no fallback and no error — the workload just starts without the credential.
- Any storage config set up **only** through `storageSecret` (no legacy `secretKey` value ever saved) loses its connection secret the same way.
- Vault-Use authorization checks stop being enforced for all Vault-backed secret references while the flag is off.

Before disabling, confirm nothing depends solely on a `secretObject`/`storageSecret` reference, and let affected users know first.

## Learn more

- [Secrets Management](../secrets.md)

---

See [Rollout Flags](./overview.md) for how flags like this one are evaluated and how to change them.
