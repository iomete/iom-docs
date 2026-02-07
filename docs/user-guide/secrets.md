---
title: Secrets Management
description: Securely store and use credentials in IOMETE
last_update:
  date: 01/08/2026
  author: Sourabh Jajoria
---

import Img from '@site/src/components/Img';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Store passwords, API keys, and credentials securely, then reference them in workloads without exposing sensitive values.

## Domain Secrets

**Domain Secrets** are scoped to a specific domain—only authorized users and workloads within that domain can access them.

<Img src="/img/user-guide/secrets/domain-secrets.png" alt="Domain Secrets List" />

### Create Secret

Click the **New Domain Secret** button. The form requires the following fields:

- **Secret key:** The name used to reference the secret within this domain.
- **Secret value:** The sensitive content of the secret. For security purposes, once the secret is saved, the value can never be viewed again.

<Img src="/img/user-guide/secrets/domain-secret-create.png" alt="Admin Secret create" maxWidth="500px" />

After clicking **`Create`**, the secret will appear in the list with the following details:

- **Secret key**
- **Source**: `IOMETE managed` (Kubernetes) or `Vault`
- **Actions**: Use the button on the right to **Edit** or **Delete**.

<Img src="/img/user-guide/secrets/domain-secret-created.png" alt="Domain Secrets with created" maxWidth="700px" />

:::warning Be aware
Before deleting a secret, ensure it is no longer in use. Deleting an active secret may cause jobs or actions to fail.
:::

### Vault Integrations (HashiCorp Vault)

IOMETE supports HashiCorp Vault alongside Kubernetes. Vault integration is **read-only**—manage Vault data via your existing HashiCorp tools.

Navigate to **Settings** → **Secret Settings** → **Vault Integrations**.

<Img src="/img/user-guide/secrets/vault-integrations.png" alt="Vault Integrations" />

### Create Vault Configuration

Click **`+ New Vault`** to create Vault config.

- **Name:** A unique identifier (e.g., `vault-prod-finance`).
- **Resource bundle:** Select a [resource bundle](./iam/ras/ras.md) to define access control for this integration.
- **Host:** The Vault base URL (e.g., `https://vault.example.com:8200`).
- **Path:** The KV v2 mount point (e.g., `/v1/secret/data/production`). _Note: KV v2 paths typically require the `/data/` segment._
- **HashiCorp namespace** _(Optional)_: Required for Vault Enterprise users specifying non-root namespaces.
- **Authentication method:** Choose **App role** (recommended) or **Token**.
- Click **Test Connection**, then click **Create**.

<Img src="/img/user-guide/secrets/vault-config-create.png" alt="Vault Configuration Create" maxWidth="700px"  />

Once saved, secret selectors throughout IOMETE will aggregate keys from both Kubernetes and Vault.

<Img src="/img/user-guide/secrets/domain-secrets-of-vault.png" alt="Domain Vault Secrets"  />

:::warning Requirements

- **Vault Version:** Requires **HashiCorp Vault KV Secrets Engine v2**. Version 1 is not supported.
- **Vault secrets are read-only** in IOMETE—edit them via your Vault tools.
  :::

### Vault Access Control

Vault access is controlled via [RAS (Resource Authorization System)](./iam/ras/ras.md):

| Permission | Capability                                           |
| ---------- | ---------------------------------------------------- |
| **View**   | View Vault configuration details                     |
| **Update** | Modify Vault configuration (host, path, credentials) |
| **Use**    | List and select secret keys in workloads             |

Users need **Use** permission to see Vault keys in secret selector dropdowns. Without it, keys from that Vault won't appear.

## Global Secrets

**Global Secrets** are **read-only** credentials available across all domains for platform-wide use. They can only be managed directly in Kubernetes editing in Console will be added in a future update.

<Img src="/img/user-guide/secrets/domain-global-secrets.png" alt="Domain Global Secrets Tab" />

:::info Legacy Support
Existing legacy secrets are automatically mapped to the Global scope.
:::

## Usage in Workloads

Secrets can be used in:

- **Spark & Compute:** Environment variables and Spark configuration
- **Jupyter Notebooks:** Environment variables
- **Storage Configs:** S3, MinIO, and other cloud credentials

### How to Reference a Secret

When configuring environment variables or credentials:

- Click the **More** options button (`:`) on the right side of the input field.
- Choose **"Use existing secret"** to select from stored secrets.
- Or select **"Create new secret"** to define a secret inline; it will be saved to your current domain automatically.

Once selected, the UI displays the secret key and its source (**KUBERNETES** or **VAULT**). Values are resolved securely at runtime.

<Img src="/img/user-guide/secrets/domain-secret-spark-env-var.png" alt="Domain Secret usage" maxWidth="600px" centered />

<div className="row">
  <div className="col col--6">
    <Img src="/img/user-guide/secrets/secret-selection.png" alt="Use existing secret dropdown" />
  </div>
  <div className="col col--6">
    <Img src="/img/user-guide/secrets/secret-create-inline.png" alt="Cecret Create Inline" />
  </div>
</div>

:::note Legacy Compatibility
While the selector is the recommended approach, legacy `${secrets.key}` placeholders remain supported for backward compatibility.
:::

---

## Secret Backends

IOMETE supports two backends that can be used simultaneously:

- **Kubernetes** (default): Secrets stored in opaque Secret objects (`iomete-secret-store-{domain}` for domain, `iomete-secret-store` for global) within the same namespace as the data-plane installation
- **HashiCorp Vault**: Customer-managed, read-only integration

## Feature Flag

Enable secrets management in your Helm values:

```yaml
features:
  secretsV2:
    enabled: true
```

---

## API Migration Guide

Secrets V2 replaces inline `${secrets.key}` placeholders with structured secret references in API payloads. Existing placeholders continue to work as migration is incremental, so you can update workloads one at a time.

### Secret Object

All secret references in API payloads use a `secretObject` to identify the secret and its backend:

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

### Compute

**Endpoint:** `POST/PUT /api/v2/domains/{domain}/compute`

<Tabs>
  <TabItem value="V1" label="V1 — Inline Placeholders" default>

```json
{
  "envVars": {
    "DB_PASSWORD": "${secrets.db_password}"
  },
  "sparkConf": {
    "spark.hadoop.fs.s3a.secret.key": "${secrets.warehouse_path}"
  }
}
```

  </TabItem>
  <TabItem value="V2" label="V2 — SecretObject">

```json
{
  "envVars": {
    "APP_MODE": "production"
  },
  "envSecrets": [
    {
      "key": "DB_PASSWORD",
      "secretObject": {
        "key": "db_password",
        "source": { "type": "KUBERNETES", "id": "secret-domain" }
      }
    }
  ],
  "sparkConf": {
    "spark.executor.memory": "4g"
  },
  "sparkConfSecrets": [
    {
        "key": "API_TOKEN",
        "secretObject": {
          "key": "api_token",
          "source": { "type": "VAULT", "id": "vault-config-id" }
        }
      }
  ]
}
```

  </TabItem>
</Tabs>

### Spark Jobs

**Endpoints:**

- `POST/PUT /api/v2/domains/{domain}/spark/jobs`
- `POST/PUT /api/v2/domains/{domain}/spark/streaming/jobs`
- `POST/PUT /api/v2/domains/{domain}/sdk/spark/jobs`

- All three job types use the same structure as [Compute](#compute), nested under `template`.
- Use `template.envSecrets` and `template.sparkConfSecrets` alongside `template.envVars` and `template.sparkConf`.

### Jupyter Containers

**Endpoint:** `POST/PUT /api/v1/domains/{domain}/jupyter-containers`

<Tabs>
  <TabItem value="V1" label="V1 — Inline Placeholders" default>

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
  <TabItem value="V2" label="V2 — SecretObject">

```json
{
  "config": {
    "envVars": {
      "APP_MODE": "production"
    },
    "envSecrets": [
        {
          "key": "DB_PASSWORD",
          "secretObject": {
            "key": "db_password",
            "source": { "type": "KUBERNETES", "id": "secret-domain" }
          }
        },
        {
          "key": "API_TOKEN",
          "secretObject": {
            "key": "api_token",
            "source": { "type": "VAULT", "id": "vault-config-id" }
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

<Tabs>
  <TabItem value="V1" label="V1 — Inline Placeholders" default>

```json
{
  "secretKey": "my-plaintext-secret-value"
}
```

  </TabItem>
  <TabItem value="V2" label="V2 — SecretObject">

```json
// Using Kubernetes:
{
  "storageSecret": {
    "key": "s3_secret_key",
    "source": { "type": "KUBERNETES", "id": "secret-domain" }
  }
}

// Using Vault:
{
  "storageSecret": {
    "key": "s3_secret_key",
    "source": { "type": "VAULT", "id": "vault-config-id" }
  }
}
```

  </TabItem>
</Tabs>

:::note
When both `secretKey` and `storageSecret` are provided, `storageSecret` takes precedence. You can keep `secretKey` as a fallback during migration.
:::

### Migration Checklist

**Before you start:**

- Ensure `features.secretsV2.enabled: true` is set in your Helm values.
- Create secrets in the target domain or global scope before workloads reference them.

**During migration:**

- Update workloads one at a time — V1 and V2 references can coexist.
- Existing `${secrets.key}` placeholders continue to work, no forced cutover.
- Legacy secrets appear under the **[Global](#global-secrets)** scope.
- Use structured secret references for all new configurations.

## Security

- **No plaintext storage**: Databases store only references—values are fetched at runtime.
- **Protected credentials**: Vault credentials stored in dedicated Kubernetes secrets, never exposed via APIs.
- **Scoped access**: Domain secrets guarded by domain permissions; Vault access enforced through [RAS](./iam/ras/ras.md).
- **Rotation**: Update secrets in Kubernetes or Vault, then redeploy workloads.

:::warning Best practices
Rotate secrets regularly. Never commit secret values to version control.
:::
