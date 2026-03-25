---
title: Modern Secrets Management for Data Platforms
description: How IOMETE's secrets management centralizes credential management across Spark jobs, notebooks, storage configs, and integrations with multi-backend support
slug: secrets-management
authors: [sourabh,vugar]
hide_table_of_contents: false
tags2: [Engineering, Technical]
coverImage: img/blog/thumbnails/darkRacing.png
---

import Img from '@site/src/components/Img';
import FAQSection from '@site/src/components/FAQSection';

Data platforms accumulate credentials fast — database passwords, API keys, cloud storage access keys, service account tokens — and they end up everywhere: Spark job configs, notebooks, storage connections, integration endpoints. Every credential pasted into a config file or a UI form is an exposure you'll eventually have to track down.

The failure mode is always the same. The same AWS key lives in a Spark job config, three notebooks, and a storage connection. When that key needs rotation, someone hunts through every config, every environment variable field, every integration — hoping they don't miss one. Compliance audits flag the plaintext secrets sitting in the database. There's no central inventory, no audit trail, no obvious fix.

IOMETE's secrets management addresses this by centralizing credentials into a single catalog that every component — Spark jobs, notebooks, storage configs, integrations — references at runtime. Credentials are stored once, referenced by key, and rotated in one place.

<!-- truncate -->

## References instead of values

The key design choice: configurations never hold actual secret values. They store a key name and a source indicator. When a Spark job starts, a notebook launches, or a storage connection is tested, the platform resolves the reference — fetches the real value from the backend and injects it into the runtime environment. That value exists only in memory for the duration of the workload. It never gets persisted to the database, never shows up in logs, never comes back through an API response.

| | Traditional approach | IOMETE secrets management |
|---|---|---|
| **Secret storage** | Hardcoded in configs, notebooks, database columns | Stored once in a domain or global catalog (Vault or IOMETE-managed) |
| **Rotation** | Update every workload manually and hope nothing is missed | Update one entry, redeploy on your schedule |
| **Cross-team isolation** | Manual trust and naming conventions | Enforced domain scopes backed by separate storage |
| **Logs and debugging** | Credential values leak into logs and error output | Only references stored; values masked by Spark's redaction regex |
| **Audit** | No centralized view of which credentials exist or who uses them | Per-domain dashboard with last-modified timestamps |
| **Backend flexibility** | Tied to one storage mechanism | Vault and IOMETE-managed side by side, per domain |

## Scopes and isolation

Secrets live in two tiers.

**Domain scopes** hold team-specific credentials. The analytics team's S3 key lives in the `analytics` domain scope — isolated in its own backing store. The finance team, working in a different domain, cannot see it, list it, or reference it. This isn't a convention; it's enforced at the platform and storage level with separate backing per domain.

**Global scopes** hold credentials shared across the platform: SMTP servers, shared data lake keys, centralized logging endpoints. Any domain can reference global secrets, but only platform administrators can create or modify them. Domain users see them as read-only entries in the secret selector.

<Img src="/img/user-guide/secrets/domain-global-secrets.png" alt="Global secrets — read-only for domain users, managed by platform administrators" />

| Scope | Who manages | Who can reference |
|-------|-----------|-------------------|
| Domain | Domain admins and maintainers | Users within that domain only |
| Global | Platform administrators | All domains (read-only) |

## Storage backends

Two options, usable independently or together.

**HashiCorp Vault** is the natural fit for organizations that already operate a centralized secrets infrastructure. IOMETE integrates with Vault's KV Secrets Engine v2, supports both token and AppRole authentication, and maintains strictly read-only access — IOMETE never creates, modifies, or deletes anything in your Vault instance. Your existing policies, namespaces, rotation schedules, and audit logging remain fully in effect. Vault Enterprise namespaces are supported for multi-tenant setups. For enterprises with established security postures, this means IOMETE plugs into your existing secrets lifecycle rather than replacing it.

**IOMETE-managed** storage provides a built-in option for teams that don't need an external secrets manager or want a simpler path for non-production credentials. Secrets are managed through the IOMETE dashboard with encryption at rest handled by the underlying infrastructure. No external dependencies required.

Both backends surface through the same secret selector. When configuring a workload, the dropdown shows all available secrets: Vault entries tagged with the integration name, IOMETE-managed entries labeled accordingly. The person picking a secret doesn't need to care which backend it lives in.

<Img src="/img/user-guide/secrets/domain-secrets-of-vault.png" alt="Domain secrets showing IOMETE-managed and Vault sources side by side — Vault entries are read-only within IOMETE" />

## Resolution and rotation

Secrets resolve at deployment time, not continuously. When a Spark job's driver pod starts, the platform contacts the relevant backend, retrieves the values, and injects them as environment variables or Spark configuration properties. Notebooks receive secrets when their container launches. Storage configs fetch credentials during connection tests.

The resolved values exist only in the runtime environment. Spark logs get an additional layer of protection via a built-in redaction regex that masks values matching patterns like `secret`, `password`, and `token` in log output.

Rotation follows an explicit pattern: update the secret value in the catalog (or in Vault directly), then redeploy affected workloads. The next deployment picks up the new value automatically. This is a deliberate trade-off — running jobs never break from an upstream credential rotation. You control when new values take effect.

## Access control

Access to secrets is governed through IOMETE's Resource Authorization System (RAS), which layers platform-level controls on top of whatever policies your backend already enforces.

For Vault integrations, RAS provides granular control over who can even see that a connection exists:

| Permission | What it controls |
|-----------|-----------------|
| **View** | See the Vault configuration details (endpoint, path) |
| **Update** | Modify the configuration (host, path, auth credentials) |
| **Use** | List and select Vault secrets in workload configurations |

Without **Use** permission on a Vault integration, its secrets don't show up in the selector — even if you know the key names. A team might have View to audit what's connected but need explicit Use granted before they can wire secrets into their jobs. This is in addition to whatever Vault policies govern the underlying paths.

For IOMETE-managed secrets, `MANAGE_SECRETS` and `LIST_SECRETS` permissions govern who can create, modify, delete, and view secrets within a domain. Cross-domain access doesn't exist — there's no API path for it.

Global secrets add another boundary: domain users can reference them, but creation and modification is restricted to platform administrators.

<Img src="/img/blog/2026-01-06-secrets-management/secrets_v2_settings_admin.png" alt="Admin secrets panel — only platform administrators can manage admin and global secrets" />

## Using secrets in practice

**Creating a secret.** In your domain, go to `Settings → Secret Settings → Secrets` and click "New Domain Secret." Enter a key name and the value. The value is write-only — once saved, it cannot be retrieved through the dashboard or API. Only the key name appears in listings afterward.

<Img src="/img/user-guide/secrets/domain-secret-create.png" alt="Create domain secret — the value cannot be viewed after saving" maxWidth="500px" centered />

**Referencing a secret.** Open any workload configuration — Spark job environment variables, storage config credentials, integration passwords. Click the menu on the value field and choose "Use existing secret." The dropdown lists secrets from your domain and global scope, each labeled with its source. Pick one and save. The configuration stores the reference, not the value.

<Img src="/img/blog/2026-01-06-secrets-management/secrets_v2_dropdown.png" alt="Environment variable configuration showing 'Use existing secret' and 'Create new secret' options" />

Need to create a secret without leaving the configuration flow? The same menu offers "Create new secret" inline — the credential gets stored in the current domain immediately.

**Rotating a secret.** Find the key in `Settings → Secret Settings → Secrets`, click Edit, enter the new value. Then redeploy the affected Spark jobs and restart active notebooks. Storage configs pick up the new value on their next connection test.

## Setting up Vault integration

For teams running HashiCorp Vault:

1. Navigate to `Settings → Secret Settings → Vault Integrations` in your domain and click "New Vault"
2. Fill in the connection details — name, resource bundle (governs RAS access), Vault endpoint URL, secret path (e.g., `/v1/secret/data/production`), and optionally a Vault Enterprise namespace
3. Choose authentication — AppRole for machine-to-machine setups, or token-based for simpler configurations
4. Click "Test connection" to verify IOMETE can reach your Vault and authenticate
5. Save

<Img src="/img/user-guide/secrets/vault-config-create.png" alt="Vault integration setup — endpoint, path, optional namespace, and choice of AppRole or Token authentication" maxWidth="600px" centered />

Vault secrets now appear in the secret selector alongside IOMETE-managed ones, tagged with the integration name. The platform caches Vault authentication tokens briefly to reduce round-trips and refreshes them automatically.

## Best practices

**Name secrets descriptively.** A convention like `{team}-{service}-{credential}` scales well: `finance-stripe-api-key`, `analytics-s3-secret-key`. Six months from now, descriptive names save you from guessing what `key-1` was for.

**Default to domain scope.** Global scope makes secrets available to every domain. Reserve it for credentials that genuinely need platform-wide sharing — shared SMTP, cross-domain data lake access. Everything else belongs in the owning team's domain.

**Rotate on a schedule.** For high-value credentials — database passwords, cloud access keys — establish a cadence (30 to 90 days depending on your compliance requirements). The single-update-then-redeploy workflow makes this practical.

**Review inventory periodically.** The secrets dashboard shows every key in a domain with last-modified timestamps. A quarterly pass catches stale credentials and forgotten test keys that should have been removed.

**Use Vault for production, IOMETE-managed for the rest.** If your organization already runs Vault, connect it for production and compliance-sensitive credentials — IOMETE respects your existing policies and audit trails. IOMETE-managed secrets can handle development or internal-only credentials where a lighter-weight path makes sense. Both backends work simultaneously within the same domain.

## Known constraints

Worth being upfront about what the system doesn't do:

- **Vault integration is read-only.** IOMETE reads from your Vault but cannot write to, modify, or delete secrets. Secret lifecycle management — creation, rotation policies, expiration — stays with your existing Vault tooling and processes.
- **Rotation requires redeployment.** Workloads must restart to pick up new secret values. This is by design — it prevents running jobs from breaking mid-execution — but it means coordinating a maintenance window for sensitive rotations.
- **Global secret management via UI is limited.** Creation and editing of global secrets currently requires infrastructure tooling; dashboard support is planned.
- **Size limits follow backend defaults.** Vault's per-secret size limit depends on your storage backend configuration. For IOMETE-managed secrets, the underlying infrastructure enforces its own limits. Large artifacts like certificates or keystores are better stored in object storage, referenced by a smaller secret.

## Enabling secrets management

Add the feature flag to your platform configuration:

```yaml
features:
  secretsV2:
    enabled: true
```

Apply the update. Secrets management becomes available under `Settings → Secret Settings` across all domains. IOMETE-managed secrets work immediately; Vault integrations can be configured per domain from the same settings page.

<FAQSection faqs={[
  {
    question: "How are secret values protected from ending up in logs or metadata?",
    answer: "Configurations store only key references, never actual values. The platform resolves secrets at deployment time and injects them into the runtime environment only.",
    answerContent: (
      <>
        <p>Configurations store only key references, never actual values. The platform resolves secrets at deployment time and injects them into the runtime environment only — they never reach the database, API responses, or control-plane logs.</p>
        <p>Spark logs are additionally protected by a built-in redaction regex that masks values matching patterns like <code>secret</code>, <code>password</code>, and <code>token</code>. And since the dashboard enforces write-only secret values, there's no way to read them back after creation.</p>
      </>
    )
  },
  {
    question: "Can I use both Vault and IOMETE-managed backends at the same time?",
    answer: "Yes. Each domain can have one or more Vault integrations alongside IOMETE-managed secrets. The secret selector shows entries from all configured backends, labeled by source.",
    answerContent: (
      <>
        <p>Yes. Each domain can have one or more Vault integrations alongside IOMETE-managed secrets simultaneously. The secret selector shows entries from all backends, clearly labeled by source.</p>
        <p>A common pattern in enterprise deployments: Vault for production and compliance-sensitive credentials (leveraging your existing audit trails and rotation policies), IOMETE-managed for development or internal-only secrets where a lighter-weight path is sufficient.</p>
      </>
    )
  },
  {
    question: "What happens to running Spark jobs when I rotate a secret?",
    answer: "Nothing — running jobs keep the value they received at startup. Secrets resolve once at deployment time. Redeploy to pick up the new value.",
    answerContent: (
      <>
        <p>Nothing — running jobs keep the value they received at startup. Secrets resolve once at deployment time, not continuously. After updating a secret, redeploy affected workloads to pick up the change.</p>
        <p>This avoids the failure mode where a credential rotation mid-flight causes unexpected job failures. You choose when the new value takes effect.</p>
      </>
    )
  },
  {
    question: "Does IOMETE write to or modify anything in my Vault?",
    answer: "No. The integration is strictly read-only — IOMETE authenticates, lists keys, and reads values. It never creates, updates, or deletes secrets in Vault.",
    answerContent: (
      <>
        <p>No. The Vault integration is strictly read-only. IOMETE authenticates, lists keys, and reads values — nothing more. Your existing Vault policies, namespaces, and audit logging stay fully under your control.</p>
      </>
    )
  },
  {
    question: "Can one domain access another domain's secrets?",
    answer: "No. Domain secrets are isolated at the storage level — each domain has its own Kubernetes secret object. There's no API or UI path for cross-domain access.",
    answerContent: (
      <>
        <p>No. Each domain's secrets live in a separate Kubernetes secret object. There is no API endpoint or UI flow that allows one domain to see, list, or reference another domain's secrets.</p>
        <p>If teams need to share a credential, the right approach is to place it in global scope, where all domains can reference it as a read-only entry.</p>
      </>
    )
  },
  {
    question: "How does this relate to SOC 2, GDPR, or HIPAA compliance?",
    answer: "The architecture supports key compliance requirements: encryption at rest (Kubernetes or Vault), domain-scoped access control, no plaintext credential storage in application databases, and write-only values.",
    answerContent: (
      <>
        <p>Several properties align with common compliance frameworks: secrets encrypted at rest (Kubernetes encryption layer or Vault's storage backend), access controlled per domain with RAS permissions, no plaintext credential storage alongside application data, and write-only values that prevent unauthorized reading.</p>
        <p>For SOC 2, the centralized per-domain inventory and permission model provide documented access controls. For GDPR, domain isolation keeps credential access within team boundaries. Vault integration adds enterprise audit logging for regulated workloads. The exact compliance mapping depends on your deployment and policies — these properties give you the building blocks.</p>
      </>
    )
  },
  {
    question: "What Vault authentication methods are supported?",
    answer: "Token-based and AppRole. Token is simpler to configure; AppRole is better suited for production since it's designed for machine-to-machine authentication.",
    answerContent: (
      <>
        <p>Two methods: token-based and AppRole.</p>
        <p>Token auth is the simpler option — provide a Vault token with read permissions on your configured path. AppRole is better for production environments: it uses role IDs and secret IDs for machine-to-machine authentication, avoiding long-lived tokens. IOMETE handles the login flow and caches resulting tokens briefly to reduce round-trips.</p>
      </>
    )
  },
]} />
