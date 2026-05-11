---
title: "DORA, NIS2, EU AI Act: the data platform compliance map for 2026"
description: "DORA, NIS2, and EU AI Act in 2026: what each demands from the data platform, where the obligations overlap, and where vendor contracts cannot close the gap."
slug: dora-nis2-eu-ai-act-data-platform-compliance-map-2026
authors: ruturaj
tags2: [Technical, Educational]
hide_table_of_contents: false
date: 05/11/2026
coverImage: img/blog/thumbnails/3.png
---

import FAQSection from '@site/src/components/FAQSection';

**Who this is for:** technical decision-makers at EU-regulated entities – banks, insurers, healthcare, energy, public-sector operators – figuring out which obligations from DORA, NIS2, and the EU AI Act land directly on the data platform, and which ones a contract cannot solve.

Three EU regulations now land on the same square of the architecture diagram. [DORA](https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng) has been in force since January 17, 2025. [NIS2](https://digital-strategy.ec.europa.eu/en/policies/nis2-directive)'s transposition deadline passed on October 17, 2024, and member-state implementation remains [uneven into 2026](https://www.jonesday.com/en/insights/2024/11/nis-2-directive-transposition-period-is-up-for-eu-member-states), with Germany and several others still finalising their transposing acts. The [EU AI Act](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng)'s high-risk provisions become fully applicable on August 2, 2026. The square they all hit is the data platform: the storage, compute, catalog, and access layer underneath every application that processes regulated data.

The harder question is no longer which regulation applies. For many EU operators, all three apply or shape supply-chain expectations. The question is which obligations the data platform itself has to satisfy through architecture, and which ones a vendor can paper over with contractual language. Contracts allocate responsibility for obligations. They cannot create the evidence. That distinction is where the audit risk sits.

{/* truncate */}

## Three regulations at a glance

DORA is operational resilience for financial entities and their critical ICT providers. NIS2 is baseline cybersecurity and incident reporting for essential and important entities across 18 sectors. The EU AI Act regulates high-risk AI systems and the data that trains, validates, and feeds them. Different scopes, overlapping demands on the same data layer.

## What DORA demands at the data layer

DORA (Regulation EU 2022/2554) targets EU financial entities (banks, insurers, investment firms, payment institutions, crypto-asset service providers) and their critical ICT third-party providers. Most operational detail sits in Level 2 measures (the RTS on ICT risk management, the RTS on subcontracting, the ITS on the register of information). The Level 1 articles below are the anchor points:

- **Article 8 – ICT risk management.** Identification and classification of all information assets, including the data platform, with documented control evidence.
- **Article 9 – Protection and prevention.** ICT security policies and tools maintaining authenticity, integrity, and confidentiality of data, including encryption and access controls at the storage layer.
- **Article 10 – Detection.** Mechanisms to promptly detect anomalous activities, including ICT network performance issues and ICT-related incidents. Audit logs, access monitoring, and tamper detection sit here.
- **Articles 17 to 19 – Incident classification and reporting.** Article 18 sets classification criteria; Article 19 sets the reporting clock to competent authorities. Timing thresholds are operationalised through the Commission Delegated Regulation on classification of major ICT-related incidents.
- **[Article 28](https://www.digital-operational-resilience-act.com/Article_28.html) – Third-party risk strategy.** A register of information on all contractual arrangements for ICT services, reported to competent authorities (per the ITS), covering service type, provider category, and the function supported.
- **[Article 30](https://www.digital-operational-resilience-act.com/Article_30.html) – Key contractual provisions.** For ICT services supporting critical or important functions, the written contract must include service-level descriptions with quantitative performance targets, audit and access rights, incident notification, exit strategies, sub-contracting conditions, and termination triggers.

If the data platform vendor controls operational dependencies for a critical function, every Article 30 clause has to be enforceable on them in practice. Signing it is the easy part.

## What NIS2 demands at the data layer

NIS2 (Directive EU 2022/2555) sets cybersecurity risk-management baselines and incident reporting for essential and important entities across sectors including energy, transport, banking, financial-market infrastructure, health, drinking water, digital infrastructure, ICT service management, and public administration.

Three obligations show up directly on the data platform:

- **Risk-management measures (Article 21).** Encryption, access controls, network and system security, supply-chain security, vulnerability handling, and policies on the use of cryptography. Both managed and self-hosted platforms can comply; the difference is who holds the evidence when the supervisor asks.
- **Incident reporting (Article 23).** A 24-hour early warning to the CSIRT or competent authority, a 72-hour incident notification with severity, impact, and indicators of compromise, and a final report within one month. Hitting 24 hours requires telemetry the operator can actually query.
- **Supply-chain security.** Operators must assess the cybersecurity practices of their direct suppliers and service providers. A managed data platform vendor generally qualifies as a direct supplier in NIS2 terms.

Unlike DORA, NIS2 is a directive, so the exact penalties and audit cadence depend on each member state's transposing law. The substantive obligations on the data platform are broadly consistent.

## What the EU AI Act demands at the data layer

The EU AI Act (Regulation EU 2024/1689) regulates AI systems by risk class. For high-risk systems, including credit scoring, insurance pricing, employment, and several public-service uses, the data layer carries specific obligations.

- **[Article 10](https://artificialintelligenceact.eu/article/10/) – Data and data governance.** Training, validation, and testing datasets must be relevant, representative, "to the best extent possible, free of errors and complete," with documented governance covering collection, preparation, labeling, bias detection, and mitigation. For high-risk uses such as credit scoring, Article 10(2)(f)–(g) requires examination of datasets for biases likely to affect health, safety, or fundamental rights, with measures to detect, prevent, and mitigate them. The operational implication: the dataset state that trained each model version must be reproducible from the platform, not asserted in a policy document.
- **[Article 12](https://artificialintelligenceact.eu/article/12/) – Record-keeping.** High-risk AI systems must automatically log events throughout their lifecycle, sufficient to identify risks and substantial modifications. Where the system queries a lakehouse for inference, that access trail is most usefully captured in a log the deployer controls.
- **Article 19 (AI Act) – Automatically generated logs.** Providers retain the Article 12 logs to the extent they are under their control, generally for at least six months unless other Union or national law specifies longer.

High-risk obligations apply from August 2, 2026 for most categories. Annex I product-safety integrations get an extra year, to August 2, 2027.

## The overlap map

The three regulations, plus GDPR sitting underneath, converge on five data-platform capabilities. The map below is the practical compliance surface.

| Capability                          | DORA                          | NIS2                            | EU AI Act                           | GDPR (for context)             |
|-------------------------------------|-------------------------------|---------------------------------|-------------------------------------|---------------------------------|
| Tamper-evident audit logs           | Art. 9, 10, 18, 19            | Art. 21, 23                     | Art. 12, 19                         | Art. 30, 32                     |
| Access control and identity         | Art. 9                        | Art. 21                         | Art. 15                             | Art. 5, 25, 32                  |
| Data lineage and dataset versioning | Art. 8, 9                     | Art. 21 (asset management)      | Art. 10, 13                         | Art. 5(2) accountability        |
| Incident detection and reporting    | Art. 18, 19 (timed windows)   | Art. 23 (24h / 72h / 1 month)   | Art. 73 (serious incidents)         | Art. 33 (72h breach notice)     |
| Third-party / supply-chain control  | Art. 28, 30                   | Art. 21(2)(d)                   | Art. 25 (value-chain duties)        | Art. 28 (processor contracts)   |

Same handful of capabilities, four overlapping regimes, four evidence formats. An audit log good enough for DORA's incident reconstruction is usually good enough for NIS2's 24-hour notification window and the AI Act's Article 12 record. The reverse is rarely true: an AI Act-shaped model-event log will not reconstruct an ICT incident timeline.

**What it costs to be wrong.** NIS2 administrative fines reach EUR 10 million or 2% of global annual turnover for essential entities, and EUR 7 million or 1.4% for important entities. AI Act penalties for non-compliance with high-risk obligations reach EUR 15 million or 3% of global turnover; prohibited-practice violations reach EUR 35 million or 7%. DORA penalties are set by national competent authorities and can include periodic penalty payments calculated daily.

## Where vendors close the gap with contracts, not architecture

The contracts versus architecture distinction is the audit trap. Several common gaps:

- **Audit log custody.** Managed platforms generate the logs and expose them through vendor-controlled portals or APIs. Contractual export and retention clauses are not the same as logs landing directly in the operator's SIEM. DORA Article 30 audit rights and NIS2's 24-hour clock, in practice, require the operator to answer the regulator without filing a vendor ticket.
- **Incident timelines.** Under DORA Articles 18 and 19, the classification and reporting clock starts when the entity becomes aware of an ICT-related incident. Under NIS2 Article 23, it starts when the entity becomes aware of a significant incident. If the vendor's runbook says "notify customer within 24 hours of confirmed severity-1 event," the regulatory clock can already be expired by the time the vendor notification arrives.
- **Sub-contracting visibility.** DORA Article 30(3) and the RTS on subcontracting expect the contract to specify sub-contracting conditions for critical or important functions, including material changes the operator must be able to object to. Concentration risk under Article 29 turns a shared managed platform into a supervisory concern, not just an internal one.
- **Data-residency proofs.** Contracts assert that data stays in a region. The architectural proof is that the storage, compute, and metadata services are demonstrably bound to that region, with no implicit cross-border replication or support-pathway egress.
- **Exit and termination.** DORA Article 30 requires documented exit strategies. With proprietary table formats and catalog APIs, exit is expensive even when the contract permits it. Open table formats are a necessary part of the architectural answer, alongside portable catalog metadata, externalised IAM, and operational runbooks the operator owns.
- **AI dataset reproducibility.** Article 10 expects the training dataset for a high-risk model to be governed and documented. If the catalog stores schema history but not snapshot-level dataset state, the operator cannot reproduce the dataset that fed a given model version from contract language alone.

Contracts allocate responsibility for obligations. They cannot create the evidence. If the architecture cannot produce the artifact the regulation requires, no clause in the master services agreement will.

## What to ask about your own data platform

A five-question screen that maps cleanly to all three regulations:

1. Can you produce a tamper-evident access log for any dataset across any 30-day window without filing a vendor ticket?
2. Can your monitoring detect an availability, integrity, or confidentiality incident within the window required to issue a 24-hour notification?
3. Can you reconstruct the exact contents of a training dataset at a past point in time, including schema and row-level state?
4. Can you demonstrate – not assert – that data and compute remain within a declared geographic boundary?
5. If you exited the vendor today, would your tables and catalog be portable in open formats, or rewritten?

A platform that answers yes to all five is satisfying the data-layer obligations of DORA, NIS2, and the AI Act with architecture. Anything less is being closed with contractual language and operator hope.

**If you answered no to two or more:** the architecture–contract gap is real and your audit-evidence position depends on a counterparty's cooperation. The remediation usually starts with audit-log custody (question 1) and dataset reproducibility (question 3), because those unblock the others.

IOMETE is published by a self-hosted lakehouse vendor. For the architectural rationale we apply to the questions above, see our notes on [Kubernetes-native deployment](https://iomete.com/product/deployment), [Iceberg encryption and lineage](https://iomete.com/resources/blog/data-lakehouse-encryption-iceberg), and the [DORA and EU AI Act infrastructure checklist](https://iomete.com/resources/blog/dora-eu-ai-act-financial-institutions-data-infrastructure).

<FAQSection faqs={[
  {
    question: "When does the EU AI Act apply to high-risk AI systems?",
    answerContent: (
      <>
        <p>August 2, 2026 for most high-risk categories under Annex III; August 2, 2027 for Annex I product-safety integrations (<a href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng">Regulation EU 2024/1689</a>).</p>
        <p>Prohibited practices and AI-literacy obligations applied from February 2, 2025. GPAI governance rules applied from August 2, 2025.</p>
      </>
    )
  },
  {
    question: "Does NIS2 actually require a 24-hour incident report?",
    answerContent: (
      <>
        <p>An early warning to the CSIRT or competent authority within 24 hours of awareness, a full notification within 72 hours, and a final report within one month (<a href="https://digital-strategy.ec.europa.eu/en/policies/nis2-directive">NIS2 Directive overview</a>).</p>
        <p>Under NIS2 Article 23(4), the early warning need not contain root-cause detail, but it must identify the incident, its suspected cross-border or malicious nature, and any indicators of compromise available at the time.</p>
      </>
    )
  },
  {
    question: "Is my data platform vendor an ICT third-party provider under DORA?",
    answerContent: (
      <>
        <p>If the platform supports a critical or important function, yes – and it must appear in the <a href="https://www.digital-operational-resilience-act.com/Article_28.html">Article 28</a> register with an <a href="https://www.digital-operational-resilience-act.com/Article_30.html">Article 30</a>-compliant contract.</p>
        <p>For self-hosted software running on the financial entity's own infrastructure, the vendor is generally a software supplier rather than a critical ICT third-party provider, which materially simplifies the third-party register. Support arrangements with privileged operational access can pull the same vendor back into ICT-TPP scope, so the assessment turns on the support model as much as the deployment topology.</p>
      </>
    )
  },
  {
    question: "What does Article 10 of the EU AI Act expect from training data governance?",
    answerContent: (
      <>
        <p>Documented practices for dataset collection, preparation, labeling, bias detection, and quality assessment, with datasets that are relevant, representative, and as error-free as practicable (<a href="https://artificialintelligenceact.eu/article/10/">AI Act Article 10</a>).</p>
        <p>Operationally, the data platform must let the operator reconstruct which dataset version trained which model version, including schema and row-level state at training time.</p>
      </>
    )
  },
  {
    question: "Do NIS2 and DORA conflict for financial entities?",
    answerContent: (
      <>
        <p>On ICT risk-management and incident-reporting subject matter, <a href="https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng">DORA</a> is lex specialis: its specific provisions disapply the corresponding NIS2 obligations (notably Articles 21 and 23) for in-scope financial entities.</p>
        <p>That carve-out is subject-matter scoped, not entity-wide. Financial entities still confirm with national transposing law and remain subject to NIS2 outside the DORA-equivalent areas.</p>
      </>
    )
  },
  {
    question: "What is the difference between contractual and architectural compliance?",
    answerContent: (
      <>
        <p>Contractual compliance allocates responsibility for an obligation in writing. Architectural compliance produces the evidence the regulation requires without depending on the counterparty.</p>
        <p>The gap matters under DORA Article 30 audit rights, NIS2's 24-hour notification clock, and AI Act Article 12 record-keeping: each, in practice, requires the operator to produce evidence directly.</p>
      </>
    )
  },
  {
    question: "How long must high-risk AI system logs be retained under the AI Act?",
    answerContent: (
      <>
        <p>At least six months, unless other Union or national law specifies a longer period, and only to the extent the logs are under the provider's control (AI Act Article 19, <a href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng">Regulation EU 2024/1689</a>).</p>
        <p>Deployers in regulated sectors will usually retain longer to align with DORA, NIS2, or sectoral retention rules.</p>
      </>
    )
  },
  {
    question: "Which architectural properties help with dataset reproducibility and exit?",
    answerContent: (
      <>
        <p>Open table formats with immutable snapshot history, schema-evolution metadata, and multi-engine support give the operator a foundation for AI Act Article 10 reproducibility and DORA Article 30 exit strategies. Apache Iceberg, Delta Lake, and Apache Hudi all offer this shape with different trade-offs.</p>
        <p>The format is necessary but not sufficient: operators still govern snapshot retention so training-time state is not expired, maintain dataset-to-model linkage in a registry, and capture feature-derivation lineage above the table layer.</p>
      </>
    )
  }
]} />

## Sources

1. [DORA – Regulation (EU) 2022/2554](https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng) – EUR-Lex
2. [NIS2 Directive overview](https://digital-strategy.ec.europa.eu/en/policies/nis2-directive) – European Commission
3. [EU AI Act – Regulation (EU) 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng) – EUR-Lex
4. [AI Act Article 10 – Data and data governance](https://artificialintelligenceact.eu/article/10/)
5. [AI Act Article 12 – Record-keeping](https://artificialintelligenceact.eu/article/12/)
6. [DORA Article 28 – ICT third-party risk management](https://www.digital-operational-resilience-act.com/Article_28.html)
7. [DORA Article 30 – Key contractual provisions](https://www.digital-operational-resilience-act.com/Article_30.html)
8. [NIS2 transposition status](https://www.jonesday.com/en/insights/2024/11/nis-2-directive-transposition-period-is-up-for-eu-member-states) – Jones Day, November 2024
