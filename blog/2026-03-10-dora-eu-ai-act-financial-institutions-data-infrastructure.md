---
title: "DORA and EU AI Act compliance: data infrastructure checklist for financial institutions"
description: "DORA is live. EU AI Act high-risk AI deadline hits August 2026. Here's what your data infrastructure needs to satisfy both — and where self-hosted architecture matters."
slug: "dora-eu-ai-act-financial-institutions-data-infrastructure"
authors: "aytan"
tags2: [Educational, Company]
coverImage: "img/blog/thumbnails/4.png"
date: "03/10/2026"
hide_table_of_contents: false
---

import FAQSection from '@site/src/components/FAQSection';

DORA went live in January 2025. The EU AI Act's high-risk AI provisions deadline lands August 2, 2026. That puts financial institutions in a five-month window to close whatever gaps remain — and for most, the data infrastructure layer is where the exposure sits.

This isn't about the business logic of your applications or the model architecture of your AI systems. It's about whether the platform where data is stored, processed, and accessed can produce the audit evidence regulators will ask for, and whether the operational controls are actually inside your governance boundary rather than a vendor's.

<!-- truncate -->

## What DORA actually requires at the data layer

DORA (Regulation EU 2022/2554) applies to EU financial entities — banks, investment firms, insurance companies, payment institutions, crypto-asset service providers, and others — plus their critical ICT third-party providers. It's been in force since January 17, 2025.

The provisions most directly relevant to data infrastructure are:

**Article 8 — ICT risk management:** Financial entities must maintain ICT risk management frameworks that include identification of all functions and information assets, and the classification of data according to criticality. Your data platform is a critical asset, and you need documented evidence of how it's controlled.

**Article 9 — Protection and prevention:** Requires "appropriate mechanisms to detect anomalous activities" and "data integrity checking mechanisms." At the data layer, this means audit logs, access monitoring, and controls that can detect unauthorized data access or modification.

**Article 17–19 — ICT-related incident classification and reporting:** Incidents affecting data availability, confidentiality, or integrity need to be classified and potentially reported to competent authorities within defined timelines. If your data platform has an outage or breach, how quickly can you characterize the impact? What data was affected? Who had access during the window?

**Article 28–30 — ICT third-party risk management:** This is where managed cloud data platforms create the most exposure. Any critical ICT third-party provider must be subject to a formal arrangement with specific contractual requirements including audit rights, incident notification obligations, and termination provisions. If your data platform vendor is an ICT third-party provider, you need that arrangement documented and the vendor's compliance with it auditable.

**Article 25 — Testing:** Digital operational resilience testing requirements, including threat-led penetration testing for significant financial entities. Your data infrastructure needs to be within scope of these tests.

The practical implication: if your data platform runs on vendor-managed cloud infrastructure, the vendor controls the resilience, the incident timeline, and the access logs. That creates a documentation challenge that doesn't go away with good contractual terms.

## What the EU AI Act adds on top

The EU AI Act (Regulation EU 2024/1689) introduces additional requirements for high-risk AI systems. For financial services, high-risk AI includes systems used for creditworthiness assessment, insurance risk and pricing, and certain customer-facing systems.

The August 2, 2026 deadline applies to providers and deployers of high-risk AI systems under Annex III. Key requirements that directly touch your data infrastructure:

**Article 10 — Data and data governance:** Training, validation, and testing datasets for high-risk AI systems must have documented governance practices, including data collection, preparation, labeling, and quality assessment processes. You need to know what data trained each model version, at what point in time, and with what governance controls applied.

**Article 12 — Record-keeping:** High-risk AI systems must automatically log events throughout their lifecycle. Relevant for systems that query your data platform — the data access that fed the model's inference needs to be in an auditable log you control.

**Article 13 — Transparency:** Deployers of high-risk AI need to be able to explain inputs and decisions to regulators and affected individuals. If you can't reconstruct what data was available to a model at a specific point in time, that explanation is incomplete.

**Article 9 — Risk management:** Requires identification and mitigation of foreseeable risks arising from data quality issues. Your data platform's data quality controls and lineage capabilities are evidence in your risk management documentation.

The key intersection with DORA: both frameworks require evidence of control. DORA requires it for operational resilience; the AI Act requires it for AI system trustworthiness. Both point to the same infrastructure layer.

## The self-hosted architecture advantage

For financial institutions, the argument for self-hosted data infrastructure isn't primarily about performance or cost — though both are often favorable. It's about where the evidence chain lives.

When your data platform runs inside your own infrastructure boundary:

**Audit log integrity is under your governance.** Access logs, query logs, job execution records — all generated by infrastructure you operate. A regulator asking for evidence of who accessed what data during a specific window gets records from your SIEM, not from a vendor portal that may have different retention policies or limited export formats.

**Incident timelines are yours.** Under DORA Article 17, ICT-related incident classification starts from when you become aware of the incident. If your data platform is managed by a vendor, you become aware when they notify you — which may be after their internal investigation is complete. On infrastructure you operate, your monitoring tools see the incident when it happens.

**Third-party risk documentation is cleaner.** If IOMETE runs as software on your Kubernetes cluster, you document it as a software component, not as a critical third-party ICT service in the DORA sense. Your DORA third-party risk register stays focused on vendors who actually control operational dependencies — not on every piece of software you license.

**Data residency is provable.** You can show an auditor the infrastructure topology and confirm that data does not leave defined geographic or network boundaries. This is harder to demonstrate with convincing evidence when residency depends on a vendor's configuration settings.

## The practical checklist

Here's what your data infrastructure needs to satisfy both frameworks, organized by requirement area:

### Data classification and inventory (DORA Art. 8)

- All data assets catalogued with sensitivity classification
- Critical data assets documented in ICT risk management framework
- Data lineage tracked from source to consumption — know what system produced each dataset
- Schema history preserved (Apache Iceberg maintains schema evolution history natively)

### Access control and audit (DORA Art. 9, AI Act Art. 12)

- Row-level and column-level security enforced at query time, not just at application layer
- All data access events logged with user identity, query, dataset, and timestamp
- Logs forwarded to SIEM under your governance, with retention policy you control
- Dynamic data masking applied to PII fields for non-authorized roles
- Privileged access (admin, infrastructure) audited separately from query access

### Incident detection and response (DORA Art. 17-19)

- Anomaly detection on query patterns (volume spikes, off-hours access, unusual column access)
- Data integrity checks — can you detect if records were modified without authorization?
- Incident classification capability: given an incident, can you scope what data was affected?
- Recovery time objective documented and tested for data platform availability

### Third-party risk (DORA Art. 28-30)

- Data platform vendor documented in ICT third-party risk register
- Contractual audit rights in place (or infrastructure is self-hosted and this is moot)
- Exit strategy documented — can you migrate off the platform without data loss?
- Vendor's own DORA compliance status assessed if they are a regulated entity

### AI Act data governance (AI Act Art. 10, 13)

- Training datasets for high-risk AI systems have documented provenance
- Time travel capability on training data — can you reproduce the dataset state at training time?
- Data quality assessment process documented for datasets used in high-risk AI
- Data minimization enforced — ML pipelines only access columns they're authorized to see
- Right-to-erasure workflow that can remove individual records without full table rewrite

### Resilience testing (DORA Art. 25)

- Data platform included in resilience testing scope
- Recovery from backup tested and documented
- Multi-node failure scenarios tested on Kubernetes cluster
- RTO/RPO documented and reviewed against business continuity requirements

## Where IOMETE fits in this picture

IOMETE is a Kubernetes-native data lakehouse built on Apache Spark and Apache Iceberg. It deploys entirely inside your infrastructure — on-premises, sovereign cloud, or private cloud. There is no data plane in IOMETE's infrastructure.

The architecture maps directly to the checklist above:

**Apache Iceberg's time travel capability** handles AI Act data provenance — you can query the exact dataset state at any historical snapshot. Iceberg's snapshot history documents schema evolution over time.

**Row-level security, column-level masking, and tag-based policies** are enforced at query time inside your infrastructure, integrated with your identity provider. Access logs stay in your network.

**IOMETE's open-format architecture** means data is stored as standard Parquet files with Iceberg metadata. There is no proprietary lock-in format. If you need to move to a different query engine or add an additional compute layer, your data stays readable.

For DORA third-party risk purposes, IOMETE deployed on your Kubernetes cluster is a software component you operate, not a critical ICT service dependency with an SLA you're accountable for to regulators.

You can read more about how self-hosted architecture affects the [CLOUD Act exposure analysis](/blog/cloud-act-reality-check) and the [encryption architecture for data at rest](/blog/iceberg-encryption-lab).

The [platform architecture documentation](/blog/iomete-platform-components-enterprise-architecture) covers the control plane / data plane separation in technical detail.

## FAQ

<FAQSection faqs={[
  {
    question: "Does IOMETE support DORA Article 28 ICT third-party risk requirements?",
    answer: "IOMETE deployed in self-hosted mode on your own Kubernetes infrastructure is not an external ICT service dependency in the DORA Article 28 sense — it's software running on your infrastructure.",
    answerContent: (
      <>
        <p>IOMETE deployed in self-hosted mode on your own Kubernetes infrastructure is not an external ICT service dependency in the DORA Article 28 sense — it's software running on your infrastructure.</p>
        <p>This distinction matters: DORA Article 28 targets third parties that provide services your operations depend on externally. When IOMETE runs on your cluster, operational resilience of the data platform is under your governance and testing scope, not a vendor's SLA. You can document IOMETE as a licensed software component rather than as a critical ICT third-party provider, which significantly simplifies your DORA third-party risk register for data infrastructure.</p>
      </>
    )
  },
  {
    question: "How does self-hosted data infrastructure help with DORA incident reporting timelines?",
    answer: "Under DORA Articles 17-19, incident classification timelines begin when your organization becomes aware of an incident affecting critical ICT systems. When your data platform runs on infrastructure you operate, your monitoring stack sees incidents as they happen.",
    answerContent: (
      <>
        <p>Under DORA Articles 17-19, incident classification timelines begin when your organization becomes aware of an incident affecting critical ICT systems. When your data platform runs on infrastructure you operate, your monitoring stack sees incidents as they happen.</p>
        <p>With a managed cloud platform, you become aware of incidents when the vendor notifies you — which is after their internal investigation. The gap between incident occurrence and your awareness can compress your reporting timeline significantly. On self-operated infrastructure, your SIEM alerts, log correlation, and on-call processes control the detection and classification timing, keeping you within the regulatory window.</p>
      </>
    )
  },
  {
    question: "What EU AI Act requirements apply to data infrastructure for financial institutions?",
    answer: "The EU AI Act's high-risk AI provisions (Annex III) cover creditworthiness assessment, insurance risk and pricing, and certain other financial services use cases. The August 2, 2026 deadline applies to deployers and providers of these systems.",
    answerContent: (
      <>
        <p>The EU AI Act's high-risk AI provisions (Annex III) cover creditworthiness assessment, insurance risk and pricing, and certain other financial services use cases. The August 2, 2026 deadline applies to deployers and providers of these systems.</p>
        <p>Data infrastructure requirements primarily arise from Articles 10 (data governance for training data), 12 (automatic logging), and 13 (transparency and explainability). You need documented data provenance for model training datasets, auditable data access logs for inference-time queries, and the ability to reconstruct what data was available to a model at any point in its lifecycle. Apache Iceberg's time travel and IOMETE's query logging capability address these requirements when deployed in self-hosted mode.</p>
      </>
    )
  },
  {
    question: "How does Apache Iceberg time travel support AI Act data provenance requirements?",
    answer: "Apache Iceberg maintains a complete snapshot history of every table, allowing you to query the exact state of any dataset at any historical point in time using standard SQL syntax.",
    answerContent: (
      <>
        <p>Apache Iceberg maintains a complete snapshot history of every table, allowing you to query the exact state of any dataset at any historical point in time using standard SQL syntax.</p>
        <p>For AI Act Article 10 compliance, this means you can reconstruct the training dataset as it existed at the time a model was trained — including which records were present, what schema was in use, and what transformations had been applied. This is direct evidence for "data and data governance" documentation requirements. The snapshot metadata is stored as immutable files in your object storage, making the history tamper-evident.</p>
      </>
    )
  },
  {
    question: "Can IOMETE's access controls satisfy DORA Article 9 protection requirements?",
    answer: "Yes. IOMETE enforces row-level security, column-level masking, and tag-based access policies at query time, integrated with your existing identity provider.",
    answerContent: (
      <>
        <p>Yes. IOMETE enforces row-level security, column-level masking, and tag-based access policies at query time, integrated with your existing identity provider.</p>
        <p>DORA Article 9 requires mechanisms to detect anomalous activities and protect information assets. IOMETE's access control operates at the infrastructure level — not the application level — so policies apply consistently regardless of which tool a user accesses data through. Query logs capture every data access event with user identity, query text, and affected tables, and can be forwarded to your SIEM for the anomaly detection and audit trail requirements.</p>
      </>
    )
  },
  {
    question: "Is the August 2026 EU AI Act deadline relevant for data engineering teams?",
    answer: "Yes, if your organization deploys or provides high-risk AI systems under EU AI Act Annex III — which includes credit scoring, insurance pricing, and certain financial advisory systems.",
    answerContent: (
      <>
        <p>Yes, if your organization deploys or provides high-risk AI systems under EU AI Act Annex III — which includes credit scoring, insurance pricing, and certain financial advisory systems.</p>
        <p>Data engineering teams are responsible for the training data governance (Article 10), the data access logs that feed model inference (Article 12), and the data lineage that supports explainability (Article 13). These requirements are infrastructure requirements, not just model requirements. If your data platform can't produce auditable evidence of data provenance and access controls, your AI Act compliance posture has a gap at the foundation layer.</p>
      </>
    )
  },
  {
    question: "How does IOMETE handle right-to-erasure requirements at scale?",
    answer: "Apache Iceberg supports equality deletes and position deletes, which allow individual records to be logically deleted without rewriting entire table partitions.",
    answerContent: (
      <>
        <p>Apache Iceberg supports equality deletes and position deletes, which allow individual records to be logically deleted without rewriting entire table partitions.</p>
        <p>For GDPR right-to-erasure at analytics scale, this is significant — you can remove a specific customer's records from large tables without the operational burden of full partition rewrites. The delete is recorded as an Iceberg metadata operation, so the deletion event is auditable. Combined with IOMETE's time travel, you can confirm a record existed before deletion and confirm it's absent after — which is the evidence structure data protection authorities often request when assessing erasure compliance.</p>
      </>
    )
  },
  {
    question: "What does IOMETE's architecture look like for a financial institution's compliance team?",
    answer: "From a compliance documentation perspective, IOMETE deployed in your infrastructure is a Kubernetes application processing data in your object storage. Your data never leaves your defined infrastructure boundary.",
    answerContent: (
      <>
        <p>From a compliance documentation perspective, IOMETE deployed in your infrastructure is a Kubernetes application processing data in your object storage. Your data never leaves your defined infrastructure boundary.</p>
        <p>For your DPO: data residency is governed by the infrastructure topology you control, not by vendor settings. For your CISO: access controls and audit logs are generated by infrastructure in your security perimeter. For your DORA team: the platform's operational resilience is your responsibility and under your testing scope. For your AI Act team: data governance documentation can reference your own infrastructure controls rather than vendor attestations. This end-to-end internal control chain is what makes self-hosted architecture genuinely useful for regulated enterprise compliance documentation.</p>
      </>
    )
  }
]} />
