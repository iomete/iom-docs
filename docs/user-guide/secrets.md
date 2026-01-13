---
title: Secrets Management
description: Centralized, multi-backend secrets management in IOMETE
last_update:
  date: 01/08/2026
  author: Sourabh Jajoria
---

import Img from '@site/src/components/Img';

IOMETE secrets management is the central, supported way to store credentials in IOMETE. It keeps sensitive values out of configs and databases while letting every team reference them through the same UI.


## Secrets management overview

Managing credentials across multiple workloads, teams, and environments is complex. Hardcoded passwords, scattered configuration files, and inconsistent secret storage create security risks and operational overhead. IOMETE's secrets management solves this by providing a centralized, multi-backend secrets management system that keeps sensitive values out of your configurations while giving every IOMETE component secure, unified access to credentials.


### Key concepts

**Scopes** determine secret access through three isolated levels, ensuring the principle of least privilege across the platform:

* **[Admin secrets](#admin-secrets):** Provides access to platform control-plane secrets, allowing for centralized security management.
* **Global:** Used for shared resources and credentials that need to be accessible across all domains.
* **Domain:** Reserved for team-specific credentials. Secrets are isolated to ensure teams only access the resources they own.


> *This hierarchy ensures strict isolation between functional teams while maintaining high-level administrative oversight.*

### Admin secrets

To manage Admin or Global secrets, navigate to `Admin page` > `Settings` > `Secrets`.


<Img src="/img/user-guide/secretsv2/admin-secrets.png" alt="Admin Secrets" />

Click to `New Admin Secret` button to create a new Secret.
The Create Secret form includes the following fields:

<div className="row">
  <div className="col col--5">
    **Secret key:** The unique identifier for the secret. This name remains visible in the list after saving.
    
    **Secret value:** The sensitive content of the secret. For security purposes, once the secret is saved, the value can never be viewed again.
  </div>
  <div className="col col--7">
    <Img src="/img/user-guide/secretsv2/admin-secret-create.png" alt="Admin Secret create" maxWidth="400px" />
  </div>
</div>

After clicking `Create`, the secret is created and will appear in the list. Note that only the `Secret key` is visible in the table.
Each item includes an Actions button on the right side with the following options:
- **Edit** - Update the secret value.
- **Delete** - Permanently remove the secret.

<Img src="/img/user-guide/secretsv2/admin-secrets-created.png" alt="Admin Secrets with created" maxWidth="700px" />

:::warning Be aware
Before deleting a secret, ensure it is no longer in use. Deleting an active secret may cause jobs or actions to fail.
:::


### Unified experience

Every IOMETE feature integrates with the same **Secrets Catalogue**. Whether you are configuring a Spark job, a Jupyter notebook, or email settings, you will always see the same interface: **`Use existing secret`** or **`Create new secret`**.

**Key Benefits:**
* **Define Once, Reuse Everywhere:** No need to re-enter credentials for different tasks.
* **Consistency:** Unified security practices across all workloads.
* **Single Source of Truth:** One central place for all sensitive configurations.
* **Easy Migration:** Simple path to move away from legacy secret management.

<Img src="/img/user-guide/secretsv2/secrets_v2_settings_domain.png" alt="Secrets Domain Secrets" />

The screenshot above shows the **Domain** experience (`Settings → Secret Settings → Secrets`). Domain users can toggle between domain-scoped and global secrets from this interface. Admin users have their own console (shown later) for managing platform-wide credentials.

This centralized approach replaces the legacy `${secrets.key}` placeholder pattern with an object-based system that supports multiple backends, fine-grained access control, and seamless integration across the platform.

---

## Core capabilities

- **Unified secrets service** – a single API mediates reads/writes for every product surface.
- **Multiple backends** – IOMETE-managed Kubernetes stores and customer-managed HashiCorp Vault instances can be used simultaneously.
- **Scoped access** – secrets are isolated per domain, with Global and Admin scopes for shared or platform-level credentials.
- **Full coverage** – Spark Jobs, Compute clusters, Jupyter notebooks, Storage Configs, Email, and LDAP integrations all read from the same catalogue.
- **Backward compatibility** – legacy `${secrets.key}` placeholders continue to work until you complete your migration.


## Secret scopes & isolation

IOMETE enforces strict isolation between teams and platform components through a three-tier scoping system. Each scope determines who can access secrets and where they're stored, ensuring teams operate independently while platform administrators maintain control over shared and system-level credentials.

| Scope | Typical use | Backing object |
| --- | --- | --- |
| **Domain** | Team-specific workloads and connectors | `iomete-secret-store-{domain}` (Kubernetes) or any Vault config bound to the domain |
| **Global** | Shared credentials across domains | `iomete-secret-store` |
| **Admin** | Control-plane only secrets | `iomete-secret-store-admin` |

Scopes apply uniformly across both Kubernetes and Vault backends. Each secret is represented by its key plus a source, making it clear how the value is managed.

---

## Secret backends

Backends define where secrets live. IOMETE supports **[Kubernetes](#kubernetes)** (automated) and **[HashiCorp Vault](#hashicorp-vault)** (customer-managed), which can be used simultaneously.

:::note Secret References
To keep data safe, IOMETE never stores actual passwords in its database. It only stores a **reference**:
* **Runtime Fetching:** Values are retrieved only when needed at runtime.
* **No Leaks:** Sensitive data never appears in logs, UIs, or permanent storage.
:::

### Kubernetes

Kubernetes is the default backend for secrets management. Each domain has its own opaque Secret object named `iomete-secret-store-{domain}`, with individual keys stored as base64-encoded fields. Global and admin stores follow similar naming, and Vault credentials per domain reside in `iomete-vault-credentials-{domain}`. Use the Secrets dashboard to create, rotate, or delete entries.

### HashiCorp Vault

:::warning Vault requirements
IOMETE requires HashiCorp Vault with KV Secrets Engine v2. Ensure your Vault instance is configured with the KV v2 engine before proceeding.
:::

Bring your own Vault by defining per-domain configurations (available only under **Domain Settings → Secret Settings → Vault Integrations**):

1. Navigate to **Domain Settings → Vault configurations**.
2. Provide the required fields:
   - **Name** – A human-readable identifier for the Vault integration (e.g., `vault-prod-finance`). This name is used to distinguish between multiple Vault configurations.
   - **Host** – Vault base URL (including scheme and optional port).
   - **Path** – The location inside Vault where secrets are stored (e.g., `/v1/secret/data/production`).
   - **HashiCorp namespace** (optional) – Vault Enterprise namespace if you are not using the root namespace.
   - **Authentication method** – AppRole (with role ID and secret ID) or token-based authentication.
3. Use **Test connection** to validate access before saving.
4. Save the configuration. Secret selectors throughout the UI now display keys from both Kubernetes and Vault.

<Img src="/img/user-guide/secretsv2/vault_create.png" alt="Vault Configuration" />

Kubernetes and Vault can be used simultaneously. Even if the platform operates entirely on Kubernetes secrets, domain operators can add Vault configurations for selective workloads, and vice versa.

:::info
IOMETE secrets management does not write to Vault; manage Vault data directly through your existing tooling.
:::

## Feature flag

**Secrets management** is controlled through the `secretsV2` feature flag. Ensure it is turned on in your Helm values so object-based secrets, Vault integrations, and the new APIs are available.

```yaml
features:
  secretsV2:
    enabled: true
```

---

## Managing secrets in the console

<Img src="/img/user-guide/secretsv2/secrets_v2_settings_admin.png" alt="Secrets Admin View" />

The admin console contains separate tabs for Admin secrets and Global secrets, while domain operators see Domain and Global tabs. Vault configuration remains in the domain dashboard for now.

1. Go to **Settings → Secrets** and choose a scope.
2. Click **Create secret** to define a new key/value pair. The value is stored directly in the Kubernetes secret for that scope.
3. Vault-backed keys appear automatically after Vault configuration; their values remain in Vault but are selectable in IOMETE.
4. Use the delete action in the table to remove unneeded Kubernetes keys. Vault keys are managed externally.
5. Existing legacy secrets entries appear automatically under the **Global** tab.

Configuration screens support both plaintext values and secure references:

- Choose **Use existing secret** to select from stored secrets.
- Choose **Create new secret** to define a secret inline; it will be saved to the appropriate scope before being referenced.
- Once selected, the configuration keeps only the secret key + source metadata. The platform resolves the value securely at runtime.

Selectors in Spark, Compute, Jupyter, Storage, Email, and LDAP forms surface these stored keys along with their source (`KUBERNETES` or `VAULT`) so you can wire them into workloads safely. The UI simply asks you to choose a secret from the dropdown.

<Img src="/img/user-guide/secretsv2/secrets_v2_dropdown.png" alt="Secrets dropdown" />
<Img src="/img/user-guide/secretsv2/secrets_v2_dropdown_use_existing.png" alt="Use existing secret modal" />

---

## Where secrets are used

Every workflow exposes a **Secret** selector so you can reuse stored credentials without worrying about underlying fields:

- **Spark Jobs & Compute**: Environment variables and Spark config entries let you choose "Use existing secret" or "Create new secret" right from the form.
- **Jupyter notebooks**: Environment variable rows include the same dropdown for referencing existing secrets while you migrate notebooks.
- **Storage Configs**: Secret-key inputs have a selector so you can attach stored S3/MinIO credentials.
- **Email settings**: SMTP password fields allow selecting secrets instead of storing passwords inline.
- **LDAP integrations**: Bind credential inputs expose the selector so you can reuse a stored secret for LDAP binds.
- **Other services**: Any surface that previously required sensitive values now offers the same dropdown experience.

`${secrets.key}` legacy placeholders remain supported for backward compatibility, but the selector is the recommended path.

---

## Advanced usage: Programmatic access

While the secrets selector interface is the recommended approach for most use cases, you can also access secrets programmatically within Spark applications using the backend-specific SDK or API.

### Accessing Vault secrets via API

When utilizing HashiCorp Vault as your secret backend, you can use the Vault API for direct access and management of IOMETE secrets. This is useful for:

- Custom automation workflows
- Integration with external systems
- Advanced secret rotation strategies
- Programmatic secret management outside IOMETE UI

For detailed instructions on using the Vault API, please refer to the [HashiCorp Vault API documentation](https://www.vaultproject.io/api).

:::note
When accessing secrets programmatically, ensure you respect the same scope and permission boundaries enforced by the IOMETE platform (Domain/Global/Admin).
:::

---

## Migration from legacy secrets

The current secrets management system represents a significant evolution in how IOMETE handles credentials, but we've maintained backward compatibility to ensure smooth transitions.

### Legacy placeholder pattern

The original secrets approach used `${secrets.key}` placeholders in configuration fields. These placeholders were resolved at runtime by fetching values from the configured backend. This pattern:

- Required manual placeholder syntax
- Lacked scope isolation
- Provided limited visibility into which secrets were in use
- Did not support multiple backends simultaneously

### Modern selector approach

The modern approach introduces an object-based system with:

- **UI-driven selectors**: Choose "Use existing secret" or "Create new secret" from dropdowns
- **Multi-scope support**: Domain, Global, and Admin isolation
- **Multi-backend support**: Use Kubernetes and Vault simultaneously
- **Better governance**: Clear visibility of secret sources and usage

### Migration strategy

1. **No forced cutover**: Legacy `${secrets.key}` placeholders continue to work
2. **Incremental migration**: Migrate workloads one at a time using the new selector
3. **Legacy secrets visible**: Existing legacy entries automatically appear under the **Global** scope
4. **Recommended approach**: Use selectors for all new configurations

:::tip Migration recommendation
While legacy placeholders remain supported for backward compatibility, migrating to the secrets selector experience is strongly recommended. This ensures you benefit from Vault integrations, scoped governance, and future enhancements without requiring additional changes later.
:::

---

## Secret resolution at runtime

- When a workload launches, the control plane fetches each secret from its declared source (Kubernetes store or Vault integration) and injects the value into the runtime environment.
- Resolved values are never persisted in database, logs, or user-visible metadata.
- Access checks respect domain scope (Domain vs Global vs Admin) and any Vault path/namespace policies.
- Secrets are resolved at deployment time. Rotate a value by updating it in Kubernetes or Vault and redeploying the associated job, cluster, or integration.

---

## Key benefits

- Centralized management across workloads and domains, regardless of backend.
- Separation between configuration and secret values; selectors keep sensitive data out of configs.
- Pluggable backends with first-class support for HashiCorp Vault.
- Safe by default—no plaintext exposure in the UI, APIs, or logs.

---

## Security practices & notes

IOMETE secrets management is designed with security-first principles to protect sensitive credentials across your platform:

- **No plaintext storage**: Databases only store secret references, never the resolved value.
- **Protected credentials**: Vault credentials are stored in dedicated Kubernetes secrets and never exposed via APIs.
- **Permission-based access**: Access to domain secrets is guarded by domain-level permissions; admin secrets require admin privileges.
- **Read-only Vault integration**: IOMETE currently reads from Vault but does not create/update Vault secrets on your behalf.

:::warning Security best practices
Always rotate secrets regularly and ensure proper access controls are configured for your Kubernetes cluster and Vault instances. Never commit secret values to version control or expose them in logs.
:::
