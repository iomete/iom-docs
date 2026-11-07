---
title: Secrets Management
description: Securely store and use credentials in IOMETE
sidebar_label: Secrets
last_update:
  date: 11/07/2026
  author: Sourabh Jajoria
---

import Img from '@site/src/components/Img';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Store passwords, API keys, and credentials securely, then reference them in workloads without exposing sensitive values.

## Domain Secrets

**Domain Secrets** are scoped to a specific domain—only authorized users and workloads within that domain can access them.

<Img src="/img/user-guide/secrets/domain-secrets.png" alt="Domain Secrets List" />

### Creating a Domain Secret

Click **New domain secret**. The form requires the following fields:

- **Secret key:** The name used to reference the secret within this domain.
- **Secret value:** The sensitive content of the secret. For security purposes, once the secret is saved, the value can never be viewed again.

<Img src="/img/user-guide/secrets/domain-secret-create.png" alt="Admin Secret create" maxWidth="500px" />

After clicking **`Create`**, the secret will appear in the list with the following details:

- **Secret key**
- **Source**: **IOMETE managed**, or the name of the Vault configuration that provides the key
- **Actions**: Use the button on the right to **Edit** or **Delete**.

<Img src="/img/user-guide/secrets/domain-secret-created.png" alt="Domain Secrets with created" maxWidth="700px" />

:::warning Be aware
Before deleting a secret, ensure it is no longer in use. Deleting an active secret may cause jobs or actions to fail.
:::

### Vault Integrations (HashiCorp Vault)

Vault integrations let you reuse secrets you already manage in HashiCorp Vault, so workloads can reference them without copying values into IOMETE. This integration is **read-only**. Manage Vault data with your existing HashiCorp tools.

Navigate to **Settings** → **Secret Settings** → **Vault Integrations**.

<Img src="/img/user-guide/secrets/vault-integrations.png" alt="Vault Integrations" />

### Viewing Vault Configurations

The **Vault Integrations** list shows the Vault connections you can access in the current domain. Each row includes:

- **Name**: The Vault configuration name. Click it to open the details page.
- **Host**: The Vault base URL.
- **Path**: The KV v2 API path IOMETE reads from.
- **Namespace**: The HashiCorp namespace, when one is configured.
- **Actions**: Open the action menu to **View**, **Configure**, or **Delete** the integration.

<Img src="/img/user-guide/secrets/vault-integrations-actions.png" alt="Vault Integrations actions menu" />

The details page shows the configuration **ID**, **Name**, **Host**, **HashiCorp namespace**, **Bundle**, **Path**, and **Auth method**.

### Creating a Vault Configuration

Click **`+ New Vault`** to create a Vault configuration.

- **Name:** A unique identifier (for example, `vault-prod-finance`). Use letters or numbers, and optionally `_`, `-`, or `.`.
- **Resource bundle:** Select a [resource bundle](./iam/ras/ras.md) to define access control for this integration.
- **Host:** The Vault base URL (e.g., `https://vault.example.com:8200`).
- **Path:** The KV v2 mount point (e.g., `/v1/secret/data/production`). _Note: KV v2 paths typically require the `/data/` segment._
- **HashiCorp namespace** _(Optional)_: Required for Vault Enterprise users specifying non-root namespaces.
- **Authentication method:** Choose **App role** (recommended) or **Token**.
- **Token:** Provide a Vault token with read access to the configured path.
- **App role:** Provide both the **Role ID** and **Secret ID**.

Click **Test connection** to validate the settings, then click **Create** to save the integration.

<Img src="/img/user-guide/secrets/vault-config-create.png" alt="Vault Configuration Create" maxWidth="700px"  />

Once saved, secret selectors throughout IOMETE list IOMETE-managed keys and the keys from this Vault configuration together.

<Img src="/img/user-guide/secrets/domain-secrets-of-vault.png" alt="Domain Vault Secrets"  />

### Testing a Vault Connection

Use **Test connection** on the create or update form whenever you want to validate the host, path, namespace, and credentials before saving.

- The check is **optional but recommended**. It does **not** save the configuration.
- If the test succeeds, the form shows a green success indicator next to **Test connection**.
- If the test fails, the form shows a red error indicator. Hover over it to see the returned error message.

Common failures include invalid credentials, missing access to the configured Vault path, or a path that does not match a KV v2 endpoint.

### Updating a Vault Configuration

Open the action menu for a Vault integration, then select **Configure**. You can also open the details page and click **Configure** there.

You can update the **Name**, **Host**, **Path**, **HashiCorp namespace**, **Authentication method**, and credentials. The **Resource bundle** stays fixed after creation, so if you need different access control you must create a new integration with the correct bundle.

If you change the credentials or path, run **Test connection** again before you click **Update**.

### Deleting a Vault Configuration

Open the action menu for a Vault integration and select **Delete**, or delete it from the details page.

Deleting a Vault configuration removes the integration from IOMETE, but it does **not** delete any secrets from HashiCorp Vault. Make sure no workloads still reference secrets from that Vault configuration before you confirm the deletion.

:::warning Requirements

- **Vault Version:** Requires **HashiCorp Vault KV Secrets Engine v2**. Version 1 is not supported.
- **Vault secrets are read-only** in IOMETE—edit them via your Vault tools.
  :::

### Vault Access Control

Vault access is controlled via [RAS (Resource Authorization System)](./iam/ras/ras.md):

| Permission | Capability                                               |
| ---------- | -------------------------------------------------------- |
| **View**   | View Vault configuration details                         |
| **Update** | Modify or delete Vault configurations                    |
| **Use**    | List and select Vault-backed secret keys in workloads    |

Only domain owners or platform admins can create Vault configurations. After a configuration is created, the assigned resource bundle controls who can **View** or **Update** that Vault configuration.

Users need **Use** permission only when they reference secrets from a Vault configuration in workloads. Without **Use** permission, keys from that Vault won't appear in secret selector dropdowns.

:::note
To list secrets in the secret selector, **Use** permission on the Vault configuration is required alongside **List Secrets** domain permission. The **List Secrets** permission is needed because the selector also lists Kubernetes secrets, which are governed by that permission.
:::

## Global Secrets

**Global Secrets** are credentials available across all domains for platform-wide use. They are **read-only** in the domain console. Platform administrators create, update, and delete them through the admin API: `PUT` or `DELETE` `/api/v1/admin/secrets/{key}?scope=GLOBAL`, with a request body such as `{"value": "..."}` for `PUT`.

<Img src="/img/user-guide/secrets/domain-global-secrets.png" alt="Domain Global Secrets Tab" />

:::info Legacy Support
Existing legacy secrets are automatically mapped to the Global scope.
:::

## Usage in Workloads

Secrets can be used in:

- **Spark jobs and streaming jobs:** Environment variables and Spark configuration, in the console form or the API
- **Event streams:** Environment variables
- **Storage Configs:** S3, MinIO, and other cloud credentials
- **Compute clusters and Jupyter containers:** Environment variables (and Spark configuration for computes) through the API only. Their console forms accept plain-text values. See the [API Migration Guide](#api-migration-guide).

### How to Reference a Secret

When configuring environment variables or credentials:

- Click the **More** options button (`:`) on the right side of the input field.
- Choose **"Use existing secret"** to select from stored secrets.
- Or select **"Create new secret"** to define a secret inline; it will be saved to your current domain automatically.

Once selected, the UI displays the secret key and its source: the domain name, **Global**, or the Vault configuration name. Values are resolved securely at runtime.

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

- **IOMETE managed**: Secrets that you create in the console or through the API. IOMETE encrypts each value and stores it in the control-plane database, in the `secret_store` table of the `<prefix>core_db` database. The same store serves workloads on every data plane: choosing a workload namespace on another data plane doesn't change where secrets are kept. In API payloads these secrets have the source type `KUBERNETES`, a name kept for compatibility.
- **HashiCorp Vault**: Customer-managed, read-only integration

Older installations kept IOMETE-managed secrets in Kubernetes Secret objects in the control-plane service namespace: `iomete-secret-store-{domain}` for a domain and `iomete-secret-store` for global secrets. On every install and upgrade, the init job of the control-plane release copies keys that are missing from the database into it. Until a key is copied, IOMETE reads it from Kubernetes. The copy leaves the Kubernetes objects in place, but once a key is in the database, IOMETE uses the database value, so editing the Kubernetes object has no effect.

Legacy `${secrets.key}` placeholders are the exception. They are resolved through the deprecated `secretStore` setting of the control-plane release, which by default (`type: kubernetes`) reads the `iomete-secret-store` Secret object directly. A global secret that exists only in the database isn't available to these placeholders; reference it with a secret object instead. See the [API Migration Guide](#api-migration-guide).

The values in the database are encrypted with the key in the `iom-secret-encryption-key` Secret in the control-plane service namespace, or in the Secret named by `secretEncryptionKey.existingSecret`. Keep that key: without it, IOMETE can't decrypt the stored secrets.

## Feature Flag

Secret objects and the Secrets pages described here depend on the global rollout flag `secretsV2`. Its default comes from `features.secretsV2.enabled` in the values of the control-plane release (`iomete-data-plane-enterprise`), which is `true`:

```yaml
features:
  secretsV2:
    enabled: true
```

A platform administrator can override that default under **Administration → Feature Flags** in the Admin Portal. The runtime chart for an additional data plane has no secrets setting.

:::warning Turning the flag off
If you turn `secretsV2` off, workloads stop receiving the environment variables and Spark settings that come from secret objects the next time they deploy, and the console shows the legacy Secrets page instead. Check that no workload depends on secret objects before you turn it off.
:::

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
| `source.type` | `KUBERNETES` (IOMETE-managed, stored in the control-plane database) or `VAULT` (HashiCorp Vault) |
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

- All three job types use the same structure under `template`.

<Tabs>
  <TabItem value="V1" label="V1 — Inline Placeholders" default>

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
  <TabItem value="V2" label="V2 — SecretObject">

```json
{
  "template": {
    "envVars": {
      "APP_MODE": "production"
    },
    "envSecrets": [
      {
        "key": "API_TOKEN",
        "secretObject": {
          "key": "api_token",
          "source": { "type": "VAULT", "id": "vault-config-id" }
        }
      }
    ],
    "sparkConf": {
      "spark.executor.memory": "4g"
    },
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
