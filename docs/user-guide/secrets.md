---
title: Secrets Management
description: Centralized, multi-backend secrets management in IOMETE
last_update:
  date: 01/08/2026
  author: Sourabh Jajoria
---

import Img from '@site/src/components/Img';

IOMETE Secrets Management provides a centralized, secure way to store credentials. By keeping sensitive values out of configuration files and databases, it ensures security while allowing teams to reference credentials through a unified UI.

---

Managing credentials across multiple workloads, teams, and environments is often complex. Hardcoding passwords or scattering configuration files creates significant security risks and operational overhead. IOMETE addresses these challenges with a **multi-backend secrets management system**. This architecture keeps sensitive data out of your configurations while providing every IOMETE component with secure, unified access to the credentials they need.

## Core Capabilities

- **Unified Secrets Service:** A single API mediates all read and write operations across every product surface.
- **Multiple Backends:** Support for simultaneous use of IOMETE-managed Kubernetes stores and customer-managed HashiCorp Vault instances.
- **Scoped Access:** Secrets are isolated per domain, with specialized Global and Admin scopes for shared or platform-level credentials.
- **Full Coverage:** Integrated support across Spark Jobs, Compute clusters, Jupyter notebooks, Storage Configs, Email, and LDAP.
- **Backward Compatibility:** Legacy `${secrets.key}` placeholders remain supported, ensuring a smooth transition during migration.

## Secret Scopes & Isolation

IOMETE uses a three-tier scoping system to enforce strict isolation and the principle of least privilege. These scopes determine secret access and storage location, allowing administrators to manage shared credentials while keeping team resources private.

- **[Admin Secrets](#admin-secrets):** Provides access to platform control-plane secrets for centralized security management.
  - **Backing object:** `iomete-secret-store-admin`
- **[Global Secrets](#admin-global-secrets):** Shared credentials accessible across all domains.
  - **Backing object:** `iomete-secret-store`
- **[Domain Secrets](#domain-secret-settings):** Team-specific credentials isolated to ensure teams only access their own resources.
  - **Backing object:** `iomete-secret-store-{domain}` (Kubernetes) or any Vault config bound to the domain

### Scope Principles

- **Isolation:** Secrets in one Domain are completely invisible to others, preventing credential leakage between teams.
- **Unified Backends:** Scopes apply uniformly across both Kubernetes and Vault backends.
- **Visibility:** Each secret is represented by its key plus a source, providing clear visibility into how the value is managed.

<!-- Scopes apply uniformly across both Kubernetes and Vault backends. Each secret is represented by its key plus a source, making it clear how the value is managed. -->

> _This hierarchy ensures strict isolation between functional teams while maintaining high-level administrative oversight._


## Admin Secrets

To manage Admin or Global secrets, navigate to **Admin page** → **Settings** → **Secrets**.
<!-- Vault-backed keys appear automatically after Vault configuration; their values remain in Vault but are selectable in IOMETE. -->
<!-- Use the delete action in the table to remove unneeded Kubernetes keys. Vault keys are managed externally. -->

<Img src="/img/user-guide/secrets/admin-secrets.png" alt="Admin Secrets" />

### Create Admin Secret

Click the `New Admin Secret` button to create a new secret. The creation form includes the following fields:

<div className="row">
  <div className="col col--5">
    **Secret key:** The unique identifier for the secret. This name remains visible in the list after saving.
    
    **Secret value:** The sensitive content of the secret. For security purposes, once the secret is saved, the value can never be viewed again.
  </div>
  <div className="col col--7">
    <Img src="/img/user-guide/secrets/admin-secret-create.png" alt="Admin Secret create" maxWidth="400px" />
  </div>
</div>

After clicking `Create`, the secret is created and will appear in the list. Note that only the **Secret key** is visible in the table.

Each item includes an **Actions** button on the right side with the following options:

- **Edit:** Update the secret value.
- **Delete:** Permanently remove the secret.

<Img src="/img/user-guide/secrets/admin-secrets-created.png" alt="Admin Secrets with created" maxWidth="700px" />

:::warning Be aware
Before deleting a secret, ensure it is no longer in use. Deleting an active secret may cause jobs or actions to fail.
:::

### Admin Global Secrets

Global Secrets function the same as regular secrets but with an expanded scope that **allows you to share credentials across all domains**. These are managed exclusively through the **Admin page**, making them accessible to any resource regardless of the domain to which it belongs.

<Img src="/img/user-guide/secrets/admin-global-secrets.png" alt="Admin Global Secrets"/>

:::info legacy secrets
Existing legacy secrets entries appear automatically under the Global tab.
:::

## Domain Secrets

**Domain Secrets** are scoped to a specific domain. They are ideal for team-level credentials, ensuring that sensitive data is accessible only to the workloads and users within that particular domain.

To manage Domain secrets, navigate to **Settings** → **Secret Settings** → **Secrets**.

<Img src="/img/user-guide/secrets/domain-secrets.png" alt="Domain Secrets List" />

### Creating a Domain Secret

Click the **New Domain Secret** button. The form requires the same fields as [Admin Secrets](#create-admin-secrets):

- **Secret Key:** The name used to reference the secret within this domain.
- **Secret Value:** The encrypted content, which becomes write-only upon saving.

### Domain Global Secrets

You can view Global Secrets by switching to the **Global Secrets** tab. Within a domain, Global Secrets are **read-only**; they can only be managed via the [Admin Global Secrets](#admin-global-secrets).

You can utilize Global Secrets alongside Domain Secrets to streamline credential management for resources used across the entire platform.

<Img src="/img/user-guide/secrets/domain-global-secrets.png" alt="Domain Global Secrets Tab" />

:::info Isolation Note
A secret created in **Domain A** is completely invisible to **Domain B**. This ensures that different teams can use the same **Secret Key** (e.g., `DB_PASSWORD`) without any risk of conflict or unauthorized access.
:::

## Vault Integrations (HashiCorp Vault)

IOMETE supports the simultaneous use of Kubernetes and HashiCorp Vault. Even if your platform operates primarily on Kubernetes secrets, domain operators can add Vault configurations for selective workloads, and vice versa.

:::info
IOMETE Secrets Management is a "read-only" integration for Vault. It does not write data to Vault; you should continue to manage your Vault data directly through your existing HashiCorp tooling.
:::

To manage Vault configurations, navigate to **Settings** → **Secret Settings** → **Vault Integrations**.

<Img src="/img/user-guide/secrets/vault-integrations.png" alt="Vault Integrations" />

### Create Vault Configuration

1. Click the **`+ New Vault`** button.
2. Complete the following fields:
   - **Name:** A human-readable identifier (e.g., `vault-prod-finance`). This name distinguishes between multiple Vault integrations within the UI.
   - **Host:** The Vault base URL, including the scheme and port (e.g., `https://vault.example.com:8200`).
   - **Path:** The mount point and path for the KV v2 secrets engine (e.g., `/v1/secret/data/production`). Note that for KV v2, the path typically includes the `/data/` segment.
   - **HashiCorp Namespace (Optional):** Required for Vault Enterprise users to specify a namespace other than the root.
   - **Authentication Method:** Select between **AppRole** (requires Role ID and Secret ID) or **Token-based** authentication. AppRole is recommended for machine-to-machine integrations.
3. Click **Test Connection** to validate that IOMETE can communicate with Vault and access the specified path.
4. **Save** the configuration. Once saved, secret selectors throughout the IOMETE UI will display keys from both Kubernetes and Vault.

<Img src="/img/user-guide/secrets/vault-config-create.png" alt="Vault Configuration Create" maxWidth="600px" centered />

:::warning Vault Requirements
IOMETE specifically requires the **HashiCorp Vault KV Secrets Engine Version 2 (v2)**. Ensure your mount path is configured as KV v2 before proceeding, as version 1 is not supported.
:::


## Usage in Workloads

Every IOMETE feature integrates with a unified **Secrets Catalogue**. Whether you are configuring a specific resource or platform settings, you can securely reference credentials without exposing them in plain text.

The secret selector is available across all platform surfaces that require sensitive values, including:
- **Spark & Compute:** Environment variables and Spark configuration entries.
- **Jupyter Notebooks:** Environment variable rows.
- **Storage Configs:** S3, MinIO, and other cloud storage credentials.
- **System Settings:** Email (SMTP) and LDAP integration bind credentials.

### How to Reference a Secret
Configuration inputs allow you to switch between plaintext values and secure references seamlessly. 

#### Example: Compute Environment Variables
When setting up environment variables, you don't need to type passwords manually:

1. Click the **More** options button (`:`) on the right side of the input field.
2. Choose **"Use existing secret"** to select from stored secrets.
3. Or select **"Create new secret"** to define a secret inline; it will be saved to your current scope automatically.

Once selected, the UI displays the secret key and its source (**KUBERNETES** or **VAULT**). The platform resolves the actual value securely only at runtime.

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
While the selector is the recommended path, legacy `${secrets.key}` placeholders remain supported for backward compatibility.
:::
---


## Secret backends

Backends define where secrets live. IOMETE supports **[Kubernetes](#kubernetes)** (automated) and **[HashiCorp Vault](#hashicorp-vault)** (customer-managed), which can be used simultaneously.

:::note Secret References
To keep data safe, IOMETE never stores actual passwords in its database. It only stores a **reference**:

- **Runtime Fetching:** Values are retrieved only when needed at runtime.
- **No Leaks:** Sensitive data never appears in logs, UIs, or permanent storage.
:::

### Kubernetes

Kubernetes is the default backend for secrets management. Each domain has its own opaque Secret object named `iomete-secret-store-{domain}`, with individual keys stored as base64-encoded fields. Global and admin stores follow similar naming, and Vault credentials per domain reside in `iomete-vault-credentials-{domain}`. Use the Secrets dashboard to create, rotate, or delete entries.


## Feature flag

**Secrets management** is controlled through the `secretsV2` feature flag. Ensure it is turned on in your Helm values so object-based secrets, Vault integrations, and the new APIs are available.

```yaml
features:
  secretsV2:
    enabled: true
```

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
