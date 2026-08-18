---
title: Secrets V2 Rollout Flag
description: What the secretsV2 rollout flag controls, its prerequisites and impact area, and what to check before enabling or disabling it.
sidebar_label: Secrets V2
last_update:
  date: 08/18/2026
  author: Sourabh Jajoria
---

Enables structured `secretObject` references for compute, Spark jobs, Jupyter containers, and storage configs, backed by IOMETE-managed Kubernetes secrets or read-only HashiCorp Vault integrations, alongside the existing legacy `${secrets.key}` inline-placeholder substitution. See [Secrets Management](../secrets.md) for the full feature.

|              |                                      |
| ------------ | ------------------------------------ |
| **Flag key** | `secretsV2`                          |
| **Scope**    | Global only — no per-domain override |
| **Default**  | Disabled                             |

## Prerequisites

Requires IOMETE `3.16.0` or later.

## Impact Area

- Compute cluster environment variables and Spark configuration
- Spark job and streaming job secrets
- Jupyter container environment variables
- Storage config connection secrets
- Vault config usage authorization (the RAS **Use** permission check on Vault-backed secret references)

## Rollout Considerations

Enabling `secretsV2` turns on structured `secretObject` support — it does not change or require migrating any existing workload. Legacy `${secrets.key}` placeholders keep resolving exactly as before, and V1 and V2 references can coexist on the same workload while you migrate one at a time. To reference a Vault-backed secret through `secretObject`, a Vault integration must already be configured for the domain — see [Vault Integrations](../secrets.md#vault-integrations-hashicorp-vault).

## Rollback Considerations

Disabling `secretsV2` is a breaking change for anything already relying on it, not a safe no-op:

- Any compute, Spark job, streaming job, or Jupyter container whose secrets are configured **only** through a structured `secretObject` reference (not the legacy `${secrets.key}` placeholder) will silently lose those secret-backed environment variables and Spark configuration values the next time it deploys. There's no fallback and no error — the workload just starts without the credential.
- Any storage config set up **only** through a structured secret reference loses its connection secret the same way, with no legacy value to fall back to.
- Vault-Use authorization checks stop being enforced for all Vault-backed secret references while the flag is off.

Before disabling, confirm nothing depends solely on a `secretObject` reference, and let affected users know first.

## References

- [Secrets Management](../secrets.md)

---

See [Rollout Flags](./overview.md) for other flags.
