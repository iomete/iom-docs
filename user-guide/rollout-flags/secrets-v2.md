---
title: Secrets V2 Rollout Flag
description: What the secretsV2 rollout flag controls, its prerequisites and impact area, and what to check before enabling or disabling it.
sidebar_label: Secrets V2
last_update:
  date: 08/18/2026
  author: Sourabh Jajoria
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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

Enabling `secretsV2` lets API payloads use a `secretObject` in place of an inline `${secrets.key}` placeholder, per surface below. Existing `${secrets.key}` placeholders keep working regardless of the flag, so workloads can migrate one field at a time.

### Secret Object

A `secretObject` identifies a secret and its backend:

```json
{
  "key": "secret_key_in_store",
  "source": {
    "type": "KUBERNETES | VAULT",
    "id": "<domain-name or vault-config-id>"
  }
}
```

| Field         | Description                                                |
| ------------- | ---------------------------------------------------------- |
| `key`         | Secret key name in the store                               |
| `source.type` | `KUBERNETES` (IOMETE-managed) or `VAULT` (HashiCorp Vault) |
| `source.id`   | Domain name for Kubernetes, or Vault config ID for Vault   |

When the flag is off, a `secretObject` entry resolves to nothing instead of a value — the environment variable or Spark config key is simply absent from the workload, with no error at deploy time.

### Compute

**Endpoint:** `POST/PUT /api/v2/domains/{domain}/compute`

The same two secrets, expressed both ways — a `DB_PASSWORD` environment variable and an S3 secret key in Spark config:

<Tabs>
  <TabItem value="v1" label="V1 — Inline Placeholders" default>

```json
{
  "envVars": {
    "DB_PASSWORD": "${secrets.db_password}"
  },
  "sparkConf": {
    "spark.hadoop.fs.s3a.secret.key": "${secrets.s3_secret_key}"
  }
}
```

  </TabItem>
  <TabItem value="v2" label="V2 — SecretObject">

```json
{
  "envSecrets": [
    {
      "key": "DB_PASSWORD",
      "secretObject": {
        "key": "db_password",
        "source": { "type": "KUBERNETES", "id": "secret-domain" }
      }
    }
  ],
  "sparkConfSecrets": [
    {
      "key": "spark.hadoop.fs.s3a.secret.key",
      "secretObject": {
        "key": "s3_secret_key",
        "source": { "type": "VAULT", "id": "vault-config-id" }
      }
    }
  ]
}
```

  </TabItem>
</Tabs>

`envVars`/`sparkConf` (plain values) and `envSecrets`/`sparkConfSecrets` (`secretObject` references) are separate fields on the same payload — you can keep non-secret settings in the plain fields while migrating secrets one at a time.

### Spark Jobs

**Endpoints:** `POST/PUT /api/v2/domains/{domain}/spark/jobs`, `POST/PUT /api/v2/domains/{domain}/spark/streaming/jobs`, `POST/PUT /api/v2/domains/{domain}/sdk/spark/jobs` — all three job types use the same structure under `template`.

The same two secrets, expressed both ways — an `API_KEY` environment variable and an S3 access key in Spark config:

<Tabs>
  <TabItem value="v1" label="V1 — Inline Placeholders" default>

```json
{
  "template": {
    "envVars": {
      "API_KEY": "${secrets.api_key}"
    },
    "sparkConf": {
      "spark.hadoop.fs.s3a.access.key": "${secrets.s3_access_key}"
    }
  }
}
```

  </TabItem>
  <TabItem value="v2" label="V2 — SecretObject">

```json
{
  "template": {
    "envSecrets": [
      {
        "key": "API_KEY",
        "secretObject": {
          "key": "api_key",
          "source": { "type": "VAULT", "id": "vault-config-id" }
        }
      }
    ],
    "sparkConfSecrets": [
      {
        "key": "spark.hadoop.fs.s3a.access.key",
        "secretObject": {
          "key": "s3_access_key",
          "source": { "type": "KUBERNETES", "id": "secret-domain" }
        }
      }
    ]
  }
}
```

  </TabItem>
</Tabs>

### Jupyter Containers

**Endpoint:** `POST/PUT /api/v1/domains/{domain}/jupyter-containers`

The same secret, expressed both ways — a `DB_PASSWORD` environment variable:

<Tabs>
  <TabItem value="v1" label="V1 — Inline Placeholders" default>

```json
{
  "config": {
    "envVars": {
      "DB_PASSWORD": "${secrets.db_password}"
    }
  }
}
```

  </TabItem>
  <TabItem value="v2" label="V2 — SecretObject">

```json
{
  "config": {
    "envSecrets": [
      {
        "key": "DB_PASSWORD",
        "secretObject": {
          "key": "db_password",
          "source": { "type": "KUBERNETES", "id": "secret-domain" }
        }
      }
    ]
  }
}
```

  </TabItem>
</Tabs>

### Storage Configs

**Endpoint:** `POST/PUT /api/v1/domains/{domain}/storage-configs`

Unlike the other surfaces, storage configs keep a legacy plaintext field as a real fallback, not just a separate code path. The same S3 secret key, expressed both ways:

<Tabs>
  <TabItem value="v1" label="V1 — Plaintext" default>

```json
{
  "secretKey": "my-plaintext-secret-value"
}
```

  </TabItem>
  <TabItem value="v2" label="V2 — SecretObject">

```json
{
  "storageSecret": {
    "key": "s3_secret_key",
    "source": { "type": "KUBERNETES", "id": "secret-domain" }
  }
}
```

  </TabItem>
</Tabs>

When both fields are set, the structured reference takes precedence; when the flag is off, resolution falls back to the plaintext field if one was ever saved, or comes back blank if it wasn't.

### Vault Config Usage Authorization

Creating or updating a compute cluster, Spark job, streaming job, or Jupyter container checks that the requesting user has **Use** permission on any Vault configuration referenced in its `secretObject` entries, at request time, before the resource is created. While the flag is off, this check is skipped (consistent with the fact that those references won't resolve to anything anyway) — so a request containing a Vault-backed `secretObject` the user doesn't have **Use** permission for is accepted rather than rejected. This has no effect on Kubernetes-backed secrets or on `${secrets.key}` placeholders, which were never gated by this permission.

## Rollout Considerations

Enabling `secretsV2` requires no migration of existing workloads (see above) and can be turned on ahead of anyone actually using `secretObject`. The only extra setup: to reference a Vault-backed secret through `secretObject`, a Vault integration must already be configured for the domain — see [Vault Integrations](../secrets.md#vault-integrations-hashicorp-vault).

## Rollback Considerations

Disabling `secretsV2` is a breaking change once anything is relying on it, not a safe no-op: every case in [Impact Area](#impact-area) where an entry resolves to nothing or falls back also applies here, in reverse. Concretely: any compute, Spark job, streaming job, or Jupyter container whose secrets are set **only** through `secretObject` (no `${secrets.key}` placeholder) loses those environment variables/Spark config values on its next deploy, silently and without error, and any storage config set up only through a structured secret reference loses its connection secret the same way.

Before disabling, confirm nothing depends solely on a structured secret reference, and let affected users know first.

## References

- [Secrets Management](../secrets.md)

---

See [Rollout Flags](./overview.md) for other flags.
