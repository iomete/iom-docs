---
title: Modern Secrets Management for Data Platforms
description: How IOMETE's secrets management centralizes credential management across Spark jobs, notebooks, storage configs, and integrations with multi-backend support
slug: secrets-management
authors: [sourabh,vugar]
hide_table_of_contents: true
tags2: [Engineering, Technical]
coverImage: img/blog/thumbnails/darkRacing.png
---

import Img from '@site/src/components/Img';

Modern data platforms manage dozens of secrets—database passwords, API keys, cloud credentials, service account tokens—scattered across jobs, notebooks, storage systems, and integration points. Each credential is a potential security risk, and managing them consistently is a constant challenge.

The traditional approach leads to predictable problems. Credentials get hardcoded in configurations and checked into version control. The same secret key gets copied into multiple places. Platform configurations store credentials in plaintext. When it's time to rotate a credential, you're hunting through configuration files, environment variables, and UI forms trying to remember everywhere you pasted that secret six months ago.

Domain isolation breaks down when credential access depends on each team remembering to restrict sharing rather than being enforced by the platform. Compliance audits flag plaintext secrets. There's no audit trail showing who accessed which credentials or when they were last rotated. And the painful truth: rotating a compromised credential means updating code, redeploying jobs, and hoping you found all the places it was used.

IOMETE's secrets management solves this by centralizing credential management across the entire platform. One catalog, multiple backends, and strong isolation.

---

## What is IOMETE Secrets Management?

IOMETE's secrets management is a centralized secrets catalog that spans every IOMETE component. Instead of storing credential values directly in configurations, you store them once in the secrets catalog and reference them everywhere they're needed. The platform resolves these references securely at runtime, ensuring sensitive values never appear in databases, logs, or user-visible metadata.

The system supports two backend storage options that can be used independently or simultaneously. IOMETE-managed Kubernetes secret stores provide immediate functionality with zero configuration—secrets are automatically organized per domain in Kubernetes objects. For enterprises with existing HashiCorp Vault infrastructure, IOMETE integrates seamlessly with customer-managed Vault instances, respecting your existing policies and namespaces while maintaining read-only access.

Two-tier scoping provides the right level of isolation for different use cases. Domain-scoped secrets keep team-specific credentials isolated—the finance team's AWS keys remain invisible to the marketing team. Global secrets enable sharing of common resources like company-wide SMTP servers across all domains.

The architecture separates configuration from secrets. When you configure a Spark job or storage integration, you don't paste credential values. Instead, you select a secret reference from a dropdown showing available secrets and their source (Kubernetes or Vault). The configuration stores only the secret key and source metadata. When the job runs or the integration connects, the platform fetches the actual value securely, injects it into the runtime environment, and never persists it.

This approach delivers immediate benefits: a single source of truth for each credential, referenced across multiple workloads without duplication. Customer-managed Vault support means enterprises can use their existing security infrastructure while gaining IOMETE's unified credential management.

<Img src="/img/user-guide/secrets/domain-secrets.png" alt="IOMETE Secrets Management Dashboard" />

The secrets management dashboard provides a centralized view of all credentials across domain and global scopes, with clear indicators of each secret's source (Kubernetes or Vault).

---

## How It Works: Architecture & Components

Understanding how IOMETE organizes and resolves credentials helps you use it effectively.

### Secret Scopes & Isolation

The two-tier scoping system enforces strict boundaries between teams while enabling shared resources.

**Domain** scopes hold team-specific credentials. When the analytics team creates a secret for their S3 bucket, it exists in the `analytics` domain scope. Only users with permissions in that domain can see or use it. The marketing team working in a different domain sees only their own secrets. This isolation is enforced at the platform layer and backed by separate Kubernetes secret objects or Vault path restrictions.

**Global** scopes enable credential sharing across domains. Common resources like company SMTP servers, shared data lake credentials, or centralized logging endpoints fit here. Any domain can reference global secrets, enabling teams to use shared infrastructure credentials without duplication.

| Scope | Use Case | Example |
|-------|----------|---------|
| Domain | S3 bucket for analytics team | `aws-analytics-secret-key` |
| Global | Shared email server | `smtp-company-password` |

### Secret Backends

IOMETE's secrets management supports two storage backends, each serving different operational needs.

**Kubernetes** is the default backend, IOMETE-managed and immediately available. Each domain gets its own Kubernetes secret object named `iomete-secret-store-{domain}`. Global secrets live in `iomete-secret-store`. Individual secret keys are stored as base64-encoded fields within these objects (base64 is Kubernetes' standard encoding format, not encryption—Kubernetes handles encryption at rest separately). You create, rotate, and delete secrets through the IOMETE dashboard, and the platform handles the Kubernetes API interactions. No setup required, no external dependencies—it works out of the box.

**HashiCorp Vault** provides customer-managed secret storage for enterprises with existing Vault infrastructure. IOMETE integrates with Vault using the KV Secrets Engine v2, supporting both token-based and AppRole authentication methods. You configure per-domain Vault connections through the dashboard, specifying your Vault endpoint, secret path, and authentication credentials. IOMETE maintains read-only access to your Vault—you control policies, path organization, and access rules. The platform caches Vault tokens to minimize authentication overhead while respecting your configured time-to-live settings.

Why support both? Start with Kubernetes for immediate functionality and simple workflows. Graduate to Vault as compliance requirements grow or when you need to integrate IOMETE with company-wide credential management. Use both simultaneously—Kubernetes for development secrets, Vault for production credentials—with different workloads pulling from whichever backend makes sense.

### Secret Resolution Flow

Understanding how secrets move from storage to runtime clarifies the security model.

When you configure a workload—a Spark job, storage config, or integration—you select a secret from the available catalog. The configuration stores the secret key and its source (Kubernetes or Vault). When you deploy the workload, the platform contacts the specified backend, retrieves the secret value, and injects it into the environment as an environment variable or configuration parameter.

This resolution happens at deployment time, not continuously. Your Spark job receives secrets when the driver pod starts. Your notebook gets secrets when the container launches. Storage configs retrieve credentials when testing connections or executing operations. The resolved values live only in the runtime environment—they never get written back to the database, never appear in control-plane logs, and aren't exposed through APIs.

Secret rotation follows this same pattern. Update the value in Kubernetes or Vault, then redeploy affected workloads. The next deployment picks up the new value automatically. This explicit redeployment requirement trades convenience for predictability—you control exactly when credential changes take effect rather than having mid-flight jobs suddenly fail when credentials rotate underneath them.

---

## Real-World Scenario: Before & After

Meet DataCo, a mid-size analytics company with three teams operating on IOMETE. The Finance team (led by Emma) processes sensitive financial data in their `finance` domain. The Marketing team (led by Alex) analyzes customer behavior in the `marketing` domain. The Platform team (led by Jordan) maintains the overall IOMETE deployment.

### Before IOMETE Secrets Management

Emma's team needs AWS credentials to access their S3 bucket containing financial reports. Following past practices, they store the AWS secret access key in several places:

The primary Spark job configuration includes the secret in an environment variable, and that YAML file is checked into the team's Git repository. Five different team notebooks have the same AWS credentials pasted into their environment configurations. The storage config for the S3 bucket contains the secret key in a database field, visible in plaintext to anyone who can query that table.

This creates several problems. When AWS requires them to rotate the access key for compliance, Emma must update seven different places—the main job config, five notebooks, and the storage config. Each update risks typos. Each deployment must be verified separately. The rotation that should take minutes stretches into hours.

Alex from marketing, while helping debug a cross-team issue, accidentally sees finance's AWS credentials in a shared notebook that Emma created for a one-off analysis. The credentials weren't meant to be shared, but once pasted into the notebook environment, they became visible to anyone with notebook access.

When the security team runs a compliance audit, they flag the plaintext storage of AWS credentials in the database and the presence of secrets in version-controlled configuration files. The findings require immediate remediation but offer no clear path forward.

Jordan has no visibility into what secrets exist across the platform. There's no central inventory, no way to audit which credentials are used where, and no mechanism to enforce rotation policies. When a contractor leaves the company, Jordan can't quickly identify and rotate all the credentials that contractor had access to.

### After IOMETE Secrets Management

Jordan enables IOMETE's secrets management for the platform by setting the feature flag in the deployment configuration:

```yaml
features:
  secretsV2:
    enabled: true
```

Emma navigates to `Settings → Secrets` in the finance domain and creates a secret named `finance-s3-secret-key`. She enters the AWS secret access key value, and the platform stores it in the Kubernetes secret object `iomete-secret-store-finance`. The marketing team, operating in their own domain, can't see this secret at all—it doesn't appear in their secret lists, and they can't reference it in their configurations.

Now Emma goes through their seven configuration points. In the Spark job environment section, she clicks "Use existing secret" and selects `finance-s3-secret-key` from the dropdown, which shows `(KUBERNETES)` as the source. In the storage config for the S3 bucket, she uses the secret selector to choose the same secret. In each of the five notebooks, she removes the hardcoded credential and selects the secret from the environment variable dropdown.

One secret definition, referenced seven times. The configuration files store only the secret key and source—no actual credential values. Git commits now show secret references instead of the actual AWS key.

When it's time to rotate the credential, Emma goes to `Settings → Secrets`, finds `finance-s3-secret-key`, and clicks Update. She enters the new AWS key value. Then she redeploys the affected Spark job and restarts any active notebooks. The storage config picks up the new value on its next connection test. Total time: about ten minutes. Places where she might have made a typo: zero.

The compliance audit shows secrets stored as references in the database, actual values isolated in Kubernetes secret objects. Git history shows secret references, not values. The audit passes. Jordan gains visibility through the secrets dashboard—he can see every secret defined in every domain, when it was last modified, and by whom. When credentials need rotation, the path forward is clear and centralized.

---

## Key Features & Benefits

Beyond the architecture and workflow covered above, several additional capabilities round out the secrets management experience.

### Access Control

Secrets inherit the same permissions model described in the official documentation. Domain secrets stay inside their domain boundary—domain administrators and delegated maintainers can create, rotate, or delete them, while other domains can't even list their keys. Global secrets remain read-only platform credentials that only platform administrators control via Kubernetes, ensuring cross-domain sharing never bypasses governance.

Vault access adds an extra layer enforced through the Resource Authorization System (RAS):

| Permission | Capability |
| --- | --- |
| **View** | Read Vault configuration details |
| **Update** | Edit configuration values (host, path, credentials) |
| **Use** | List and select Vault keys inside workloads |

Users need the **Use** permission for a Vault configuration to see its secrets inside selectors; without it, Vault-managed keys simply don't appear. This maps blog guidance directly to the product behavior, so readers know the precise permissions required before onboarding teams.

### Security-First Design

The platform never stores credential values alongside configurations. Databases retain only references (key + source), and the actual secret gets fetched just-in-time when workloads start. That runtime-only exposure keeps credentials out of Git history, audit logs, and metadata APIs. Combined with domain boundaries and read-only Vault integrations that honor your existing policies, secrets stay confined to the teams and systems you intended, and platform administrators still have centralized oversight without touching the values themselves.

### Unified Secret Selector

Every IOMETE component—Spark jobs, notebooks, storage configs, email integrations, LDAP connections—uses the same secret selector interface with source indicators (`KUBERNETES` or `VAULT`). One consistent pattern everywhere reduces cognitive load and prevents mistakes.

---

## Getting Started

Adopting IOMETE's secrets management involves three straightforward steps.

### 1. Enable the feature flag

If secrets management isn't already enabled in your deployment, add the feature flag to your platform configuration:

```yaml
features:
  secretsV2:
    enabled: true
```

Apply the updated configuration, and the secrets management features become available across the platform.

### 2. Create your first secret

Navigate to `Settings → Secrets` in your chosen scope—domain or global depending on the credential's intended use. Click "Create secret". Enter a descriptive key like `prod-db-password` or `analytics-aws-secret-key`. Enter the actual credential value. Save the secret.

The secret now appears in the catalog, available for selection across all IOMETE services. For domain secrets, only users in that domain can see and use them. For global secrets, any domain can reference them.

### 3. Use the secret

Find any configuration that requires a credential—a Spark job's environment variables, a storage config's secret key field, an email integration's password. Look for the credential input field and you'll see the option to "Use existing secret". Click it, select your secret from the dropdown, and note the source indicator (KUBERNETES or VAULT). Save the configuration.

When you deploy the workload or test the connection, the platform retrieves the secret value from the specified backend and injects it where needed. You never see the actual value in the configuration again—just the reference.

<Img src="/img/user-guide/secrets/domain-secret-spark-env-var.png" alt="Secret Selector Dropdown" />

<Img src="/img/user-guide/secrets/secret-selection.png" alt="Use Existing Secret Modal" />

The unified secret selector appears consistently across all IOMETE services, showing available secrets with their source clearly marked.

### Optional: Configure Vault

For teams with existing Vault infrastructure, connecting IOMETE takes a few additional steps but unlocks enterprise-grade secret management.

Navigate to `Domain Settings → Vault Configurations`. Click to add a new configuration. Provide your Vault endpoint URL (e.g., `https://vault.company.com`), the secret path where IOMETE should look for credentials (e.g., `/v1/secret/data/production`), and choose your authentication method—token-based for simplicity or AppRole for better security. Enter the required credentials.

<Img src="/img/user-guide/secrets/vault-config-create.png" alt="Vault Configuration Create"  maxWidth="600px" centered />

Vault integration setup requires just a few fields—endpoint, path, namespace, and authentication method—making it straightforward to connect your existing Vault infrastructure.

Click "Test connection" to verify IOMETE can authenticate and access your Vault paths. If the test succeeds, save the configuration. Secrets stored in your configured Vault paths now appear in the secret selector dropdowns throughout IOMETE, marked with `VAULT` as the source. You select and use them exactly like Kubernetes secrets—the platform handles the backend differences transparently.

---

## Conclusion

IOMETE's secrets management transforms credential management from a scattered, error-prone process into a centralized, secure, and auditable system. Whether you're managing a handful of secrets in Kubernetes or integrating with enterprise Vault infrastructure, IOMETE provides the foundation for secure credential handling at scale.

The architectural choice to separate configuration from secrets—storing references instead of values—eliminates entire classes of security vulnerabilities. Combined with domain-scoped access controls and multi-backend flexibility, it gives platform teams confidence that credentials are managed consistently without sacrificing developer productivity.

IOMETE's secrets management is available now. Check your platform's feature flags or contact your administrator to get started with centralized, secure credential management today.
