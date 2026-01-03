---
title: Secrets V2
description: Centralized, multi-backend secrets management
sidebar_label: Secrets V2
last_update:
  date: 12/31/2025
  author: Sourabh Jajoria
---

import Img from '@site/src/components/Img';

Secrets Management V2 is the central, supported way to store credentials in IOMETE. It keeps sensitive values out of configs and databases while letting every team reference them through the same UI.


## Secrets management overview

- A unified secrets catalogue spans admin, global, and domain scopes so every workload uses the same secure references.
- The Secrets UI captures the secret key plus its source (Kubernetes store or Vault integration); the value is fetched securely at runtime.
- Spark jobs, compute clusters, notebooks, Storage Configs, Email, and LDAP all tap into this catalogue through the same “Use existing / Create new” selector.

<Img src="/img/user-guide/secretsv2/secrets_v2_settings_domain.png" alt="Secrets Domain Secrets" />

The screenshot above shows the **Domain** experience (`Settings → Secret Settings → Secrets`). Domain users can toggle between domain-scoped and global secrets from here. Admin users have their own console (shown later) for platform-wide credentials.


## Core capabilities

- **Unified secrets service** – a single API mediates reads/writes for every product surface.
- **Multiple backends** – IOMETE-managed Kubernetes stores and customer-managed HashiCorp Vault instances can be used simultaneously.
- **Scoped access** – secrets are isolated per domain, with Global and Admin scopes for shared or platform-level credentials.
- **Full coverage** – Spark Jobs, Compute clusters, Jupyter notebooks, Storage Configs, Email, and LDAP integrations all read from the same catalogue.
- **Backward compatibility** – legacy `${secrets.key}` placeholders continue to work until you complete your migration (see the [Secrets V1 guide](./secrets.md) for historical behavior).


## Secret scopes & isolation

| Scope | Typical use | Backing object |
| --- | --- | --- |
| **Domain** | Team-specific workloads and connectors | `iomete-secret-store-{domain}` (Kubernetes) or any Vault config bound to the domain |
| **Global** | Shared credentials across domains | `iomete-secret-store` |
| **Admin** | Control-plane only secrets | `iomete-secret-store-admin` |

Each secret is represented by its key plus a source (Kubernetes secret store or Vault configuration), making it clear how the value is managed. Scopes apply uniformly across Kubernetes and Vault so that domain operators only see what they own.


## Secret backends

### Kubernetes

Kubernetes is the default backend for Secrets V2. Each domain has its own opaque Secret object named `iomete-secret-store-{domain}`, with individual keys stored as base64-encoded fields. Global and admin stores follow similar naming, and Vault credentials per domain reside in `iomete-vault-credentials-{domain}`. Use the Secrets dashboard to create, rotate, or delete entries.

### HashiCorp Vault

Bring your own Vault by defining per-domain configurations (available only under **Domain Settings → Secret Settings → Vault Integrations**):

1. Navigate to **Domain Settings → Vault configurations**.
2. Provide the required fields:
   - **Name** – A human-readable identifier for the Vault integration. This name is used to distinguish between multiple Vault configurations.
   - **Host** – Vault base URL (including scheme and optional port).
   - **Path** – The location inside Vault where secrets are stored.
   - **HashiCorp namespace** (optional) – Vault Enterprise namespace if you are not using the root namespace.
   - **Authentication method** – AppRole (with role ID and secret ID) or token-based authentication.
3. Use **Test connection** to validate access before saving.
4. Save the configuration. Secret selectors throughout the UI now display keys from both Kubernetes and Vault.

Kubernetes and Vault can be used simultaneously. Even if the platform operates entirely on Kubernetes secrets, domain operators can add Vault configurations for selective workloads, and vice versa.

:::info
Secrets V2 does not write to Vault; manage Vault data directly through your existing tooling.
:::

## Feature flag

- **Secrets V2** is controlled through the `secretsV2` feature flag. Ensure it is turned on in your Helm values so object-based secrets, Vault integrations, and the new APIs are available.

```yaml
features:
  secretsV2:
    enabled: true
```


## Managing secrets in the console

<Img src="/img/user-guide/secretsv2/secrets_v2_settings_admin.png" alt="Secrets Admin View" />

The admin console contains separate tabs for Admin secrets and Global secrets, while domain operators see Domain and Global tabs. Vault configuration remains in the domain dashboard for now.

1. Go to **Settings → Secrets** and choose a scope.
2. Click **Create secret** to define a new key/value pair. The value is stored directly in the Kubernetes secret for that scope.
3. Vault-backed keys appear automatically after Vault configuration; their values remain in Vault but are selectable in IOMETE.
4. Use the delete action in the table to remove unneeded Kubernetes keys. Vault keys are managed externally.
5. Existing Secrets V1 entries appear automatically under the **Global** tab.

Configuration screens support both plaintext values and secure references:

- Choose **Use existing secret** to select from stored secrets.
- Choose **Create new secret** to define a secret inline; it will be saved to the appropriate scope before being referenced.
- Once selected, the configuration keeps only the secret key + source metadata. The platform resolves the value securely at runtime.

Selectors in Spark, Compute, Jupyter, Storage, Email, and LDAP forms surface these stored keys along with their source (`KUBERNETES` or `VAULT`) so you can wire them into workloads safely. All references are stored behind the scenes (for example, as `envSecrets`, `sparkConfSecrets`, or `storageSecret`), so the UI simply asks you to choose a secret from the dropdown.

<Img src="/img/user-guide/secretsv2/secrets_v2_dropdown.png" alt="Secrets dropdown" />
<Img src="/img/user-guide/secretsv2/secrets_v2_dropdown_use_existing.png" alt="Use existing secret modal" />


## Where secrets are used

Every workflow exposes a **Secret** selector so you can reuse stored credentials without worrying about underlying fields:

- **Spark Jobs & Compute**: Environment variables and Spark config entries let you choose “Use existing secret” or “Create new secret” right from the form.
- **Jupyter notebooks**: Environment variable rows include the same dropdown for referencing existing secrets while you migrate notebooks.
- **Storage Configs**: Secret-key inputs have a selector so you can attach stored S3/MinIO credentials.
- **Email settings**: SMTP password fields allow selecting secrets instead of storing passwords inline.
- **LDAP integrations**: Bind credential inputs expose the selector so you can reuse a stored secret for LDAP binds.
- **Other services**: Any surface that previously required sensitive values now offers the same dropdown experience.

`${secrets.key}` legacy placeholders remain supported for backward compatibility (see [Secrets V1](./secrets.md)), but the selector is the recommended path.


## Migration notes

- Legacy `${secrets.key}` placeholders and Secrets V1 entries continue to work; there is no forced cutover.
- Migrating to the Secrets V2 selector experience is recommended so you benefit from Vault integrations, scoped governance, and future enhancements without additional changes later.


## Secret resolution at runtime

- When a workload launches, the control plane fetches each secret from its declared source (Kubernetes store or Vault integration) and injects the value into the runtime environment.
- Resolved values are never persisted in database, logs, or user-visible metadata.
- Access checks respect domain scope (Domain vs Global vs Admin) and any Vault path/namespace policies.
- Secrets are resolved at deployment time. Rotate a value by updating it in Kubernetes or Vault and redeploying the associated job, cluster, or integration.


## Key benefits

- Centralized management across workloads and domains, regardless of backend.
- Separation between configuration and secret values; selectors keep sensitive data out of configs.
- Strong isolation via domain scoping, Vault namespaces, and access controls.
- Pluggable backends with first-class support for HashiCorp Vault.
- Safe by default—no plaintext exposure in the UI, APIs, or logs.


## Security practices & notes

- Databases only store secret references (`SecretKeyWithSource`), never the resolved value.
- Domain isolation is enforced via per-domain Kubernetes objects and Vault path policies.
- Vault credentials are stored in dedicated Kubernetes secrets and never exposed via APIs.
- Access to domain secrets is guarded by domain-level permissions; admin secrets require admin privileges.
- IOMETE currently reads from Vault but does not create/update Vault secrets on your behalf.
