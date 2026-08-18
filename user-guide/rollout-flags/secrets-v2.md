---
title: Secrets V2 Rollout Flag
description: What the secretsV2 rollout flag controls, its prerequisites and impact area, and what to check before enabling or disabling it.
sidebar_label: Secrets V2
last_update:
  date: 08/18/2026
  author: Sourabh Jajoria
---

Enables structured `secretObject` references for compute, Spark jobs, Jupyter containers, and storage configs, backed by IOMETE-managed Kubernetes secrets or read-only HashiCorp Vault integrations. See [Secrets Management](../secrets.md) for the full feature.

This is purely additive: the existing `${secrets.key}` inline-placeholder syntax is a separate code path that this flag does not touch, in any of the areas below. Toggling this flag only changes whether the _new_ `secretObject` syntax works — nothing that currently uses `${secrets.key}` changes behavior, whether the flag is on or off.

|              |                                      |
| ------------ | ------------------------------------ |
| **Flag key** | `secretsV2`                          |
| **Scope**    | Global only — no per-domain override |
| **Default**  | Disabled                             |

## Prerequisites

### Minimum compatible version

IOMETE `3.16.0` or later.

### Deployment setup changes

None. No additional Helm values, infrastructure, or configuration are needed to turn this flag on or off.

### Services to restart

None. Toggling the flag through the rollout-flag admin API takes effect automatically — each service picks up the new value on its next refresh, within about a minute, without restarting `iom-core`, `iom-cluster`, or any other service.

## Impact Area

**Compute, Spark jobs, streaming jobs, and Jupyter containers** — a `secretObject` entry in `envSecrets` (environment variables) or `sparkConfSecrets` (Spark configuration) resolves to its actual secret value and gets set on the pod when the flag is on. When the flag is off, that entry resolves to nothing: the environment variable or Spark config key is simply absent from the pod, with no error at deploy time. `${secrets.key}` placeholders in the same workload's `envVars`/`sparkConf` are unaffected either way — they go through a separate, always-on resolver.

**Storage configs** — a structured secret reference for the connection secret (S3/MinIO/other cloud storage) resolves the same way when the flag is on. When it's off, IOMETE falls back to the storage config's legacy plaintext secret value instead, if one was ever saved; if it wasn't, the connection secret comes back blank.

**Vault config usage authorization** — creating or updating a compute cluster, Spark job, streaming job, or Jupyter container checks that the requesting user has **Use** permission on any Vault configuration referenced in its `secretObject` entries, at request time, before the resource is created. While the flag is off, this check is skipped (consistent with the fact that those references won't resolve to anything anyway) — so a request containing a Vault-backed `secretObject` the user doesn't have **Use** permission for is accepted rather than rejected. This has no effect on Kubernetes-backed secrets or on `${secrets.key}` placeholders, which were never gated by this permission.

## Rollout Considerations

Enabling `secretsV2` requires no migration of existing workloads (see above) and can be turned on ahead of anyone actually using `secretObject`. The only extra setup: to reference a Vault-backed secret through `secretObject`, a Vault integration must already be configured for the domain — see [Vault Integrations](../secrets.md#vault-integrations-hashicorp-vault).

## Rollback Considerations

Disabling `secretsV2` is a breaking change once anything is relying on it, not a safe no-op: every case in [Impact Area](#impact-area) where an entry resolves to nothing or falls back also applies here, in reverse. Concretely: any compute, Spark job, streaming job, or Jupyter container whose secrets are set **only** through `secretObject` (no `${secrets.key}` placeholder) loses those environment variables/Spark config values on its next deploy, silently and without error, and any storage config set up only through a structured secret reference loses its connection secret the same way.

Before disabling, confirm nothing depends solely on a structured secret reference, and let affected users know first.

## References

- [Secrets Management](../secrets.md)

---

See [Rollout Flags](./overview.md) for other flags.
