---
title: Modern Secrets Management for Data Platforms
description: How IOMETE's secrets management centralizes credentials across Spark jobs, notebooks, storage configs, and integrations with multi-backend support
slug: secrets-management
authors: [sourabh,vugar]
hide_table_of_contents: false
tags2: [Engineering, Technical]
coverImage: img/blog/thumbnails/darkRacing.png
---

import Img from '@site/src/components/Img';
import FAQSection from '@site/src/components/FAQSection';

The same AWS key lives in a Spark job config, three notebooks, and a storage connection. When that key needs rotation, someone hunts through every config, every environment variable field, every integration — hoping they don't miss one. Compliance audits flag the plaintext secrets in the database. There's no central inventory, no audit trail, no obvious fix.

IOMETE's secrets management addresses this by centralizing credentials into a single catalog that every workload references at runtime. Credentials are stored once, referenced by key, and rotated in one place.

<!-- truncate -->

## A rotation story: before and after

Consider a data team that stores an AWS secret key in five places: two Spark jobs, a notebook, a storage connection, and an integration endpoint. Security policy requires rotating it every 90 days.

**Without centralized secrets**, someone opens each config one by one, pastes the new key, redeploys, and hopes nothing was missed. If a storage connection still holds the old key, the team finds out when a pipeline breaks at 2 AM.

**With IOMETE secrets management**, that AWS key exists in one place — a domain secret called `analytics-aws-secret-key`. All five workloads reference that key by name. Rotation means updating a single entry and redeploying. No hunting, no missed configs.

## References instead of values

Configurations never hold actual secret values. They store a key name and a source indicator. When a workload starts, the platform resolves the reference, fetches the real value from the backend, and injects it into the runtime environment. That value exists only in memory for the duration of the workload. It never gets persisted to the database, never shows up in logs, never comes back through an API response.

| | Traditional approach | IOMETE secrets management |
|---|---|---|
| **Secret storage** | Hardcoded in configs, notebooks, database columns | Stored once in a domain or global catalog |
| **Rotation** | Update every workload manually and hope nothing is missed | Update one entry, redeploy on your schedule |
| **Cross-team isolation** | Manual trust and naming conventions | Enforced domain scopes backed by separate storage |
| **Logs and debugging** | Credential values leak into logs and error output | Only references stored; values masked by Spark's redaction regex |
| **Audit** | No centralized view of which credentials exist or who uses them | Per-domain dashboard with last-modified timestamps |
| **Backend flexibility** | Tied to one storage mechanism | Vault and IOMETE-managed side by side, per domain |

## Scopes and isolation

Secrets live in two tiers.

**Domain scopes** hold team-specific credentials. The analytics team's S3 key lives in the `analytics` domain scope — isolated in its own backing store. The finance team, working in a different domain, cannot see it, list it, or reference it. This isn't a naming convention; it's enforced at the storage level with separate backing per domain.

**Global scopes** hold credentials shared across the platform: SMTP servers, shared data lake keys, centralized logging endpoints. Any domain can reference global secrets, but only platform administrators can create or modify them.

<Img src="/img/user-guide/secrets/domain-global-secrets.png" alt="Global secrets — read-only for domain users, managed by platform administrators" />

## Storage backends

Two options, usable independently or together.

**HashiCorp Vault** fits organizations that already operate a centralized secrets infrastructure. IOMETE integrates with Vault's KV Secrets Engine v2 and supports both token and AppRole authentication. The integration is strictly read-only — IOMETE never creates, modifies, or deletes anything in your Vault instance. Your existing policies, rotation schedules, and audit logging stay in effect.

**IOMETE-managed** storage provides a built-in option for teams that don't need an external secrets manager. Secrets are managed through the IOMETE dashboard with encryption at rest handled by the underlying infrastructure. No external dependencies required.

Both backends surface through the same secret selector. The person picking a secret doesn't need to care which backend it lives in.

<Img src="/img/user-guide/secrets/domain-secrets-of-vault.png" alt="Domain secrets showing IOMETE-managed and Vault sources side by side" />

## Resolution and rotation

Secrets resolve at deployment time, not continuously. When a workload starts, the platform contacts the relevant backend, retrieves the values, and injects them as environment variables or Spark configuration properties. The resolved values exist only in the runtime environment. Spark logs get additional protection via a built-in redaction regex that masks values matching patterns like `secret`, `password`, and `token`.

Rotation follows an explicit pattern: update the secret value in the catalog (or in Vault directly), then redeploy affected workloads. Running jobs keep their original values and never break mid-execution — you control when new values take effect.

## Access control

IOMETE's Resource Authorization System (RAS) adds platform-level access controls on top of your backend's own policies.

For Vault integrations, RAS controls who can see that a connection exists, modify it, or use its secrets in workloads. Without **Use** permission on a Vault integration, its secrets don't show up in the selector — even if you know the key names. A team might have **View** to audit what's connected but need explicit **Use** granted before they can wire secrets into their jobs.

For IOMETE-managed secrets, `MANAGE_SECRETS` and `LIST_SECRETS` permissions govern who can create, modify, delete, and view secrets within a domain. Cross-domain access doesn't exist — there's no API path for it. Global secrets add another boundary: domain users can reference them, but only platform administrators can create or modify them.

<Img src="/img/blog/2026-01-06-secrets-management/secrets_v2_settings_admin.png" alt="Admin secrets panel — only platform administrators can manage global secrets" />

## Best practices

**Use the naming convention `{team}-{service}-{credential}`.** When the secrets dashboard shows 50 entries, `finance-stripe-api-key` is self-documenting. `key-1` means a Slack message six months from now asking "does anyone know what key-1 is?"

**Default to domain scope.** Reserve global scope for credentials that genuinely need platform-wide sharing — shared SMTP, cross-domain data lake access. Everything else belongs in the owning team's domain, where isolation is enforced at the storage level.

**Pair rotation with the redeploy workflow.** Since IOMETE resolves secrets at deployment time, rotation is a two-step operation: update the value, then redeploy. Build this into your rotation runbook so redeployment isn't an afterthought.

**Split backends by environment.** Use Vault for production and compliance-sensitive credentials — IOMETE respects your existing policies and audit trails. Use IOMETE-managed secrets for development or internal-only credentials where a lighter-weight path makes sense. Both backends work simultaneously within the same domain.

## Getting started

For step-by-step instructions on creating secrets, referencing them in workloads, and setting up Vault integrations, see the [Secrets Management documentation](/docs/user-guide/secrets).

To enable the feature, add `features.secretsV2.enabled: true` to your platform Helm values and apply the update.

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
        <p>A common pattern: Vault for production and compliance-sensitive credentials, IOMETE-managed for development or internal-only secrets.</p>
      </>
    )
  },
  {
    question: "What happens to running Spark jobs when I rotate a secret?",
    answer: "Nothing — running jobs keep the value they received at startup. Secrets resolve once at deployment time. Redeploy to pick up the new value.",
    answerContent: (
      <>
        <p>Nothing — running jobs keep the value they received at startup. Secrets resolve once at deployment time, not continuously. After updating a secret, redeploy affected workloads to pick up the change.</p>
        <p>This avoids the failure mode where a credential rotation mid-flight causes unexpected job failures.</p>
      </>
    )
  },
  {
    question: "Can one domain access another domain's secrets?",
    answer: "No. Domain secrets are isolated at the storage level — each domain has its own Kubernetes secret object. There's no API or UI path for cross-domain access.",
    answerContent: (
      <>
        <p>No. Each domain's secrets live in a separate Kubernetes secret object. There is no API endpoint or UI flow that allows one domain to see, list, or reference another domain's secrets.</p>
        <p>If teams need to share a credential, place it in global scope, where all domains can reference it as a read-only entry.</p>
      </>
    )
  },
  {
    question: "How does this relate to SOC 2, GDPR, or HIPAA compliance?",
    answer: "The architecture supports key compliance requirements: encryption at rest (Kubernetes or Vault), domain-scoped access control, no plaintext credential storage in application databases, and write-only values.",
    answerContent: (
      <>
        <p>Several properties align with common compliance frameworks: secrets encrypted at rest, access controlled per domain with RAS permissions, no plaintext credential storage alongside application data, and write-only values that prevent unauthorized reading.</p>
        <p>For SOC 2, the centralized per-domain inventory and permission model provide documented access controls. For GDPR, domain isolation keeps credential access within team boundaries. Vault integration adds enterprise audit logging for regulated workloads.</p>
      </>
    )
  },
  {
    question: "What Vault authentication methods are supported?",
    answer: "Token-based and AppRole. Token is simpler to configure; AppRole is better suited for production since it's designed for machine-to-machine authentication.",
    answerContent: (
      <>
        <p>Two methods: token-based and AppRole.</p>
        <p>Token auth is the simpler option — provide a Vault token with read permissions on your configured path. AppRole is better for production: it uses role IDs and secret IDs for machine-to-machine authentication, avoiding long-lived tokens.</p>
      </>
    )
  },
]} />
