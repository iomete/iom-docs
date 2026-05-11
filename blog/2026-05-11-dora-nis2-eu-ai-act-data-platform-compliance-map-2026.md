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

For data platforms serving EU-regulated workloads, three regulations now decide what the audit looks like: DORA, NIS2, and the EU AI Act. For most operators in regulated sectors, all three apply or shape supply-chain expectations, so naming the right one is the easy part. The harder question is which obligations the data platform itself has to satisfy through architecture, and which ones a vendor can paper over with contractual language. Contracts allocate responsibility for obligations. They cannot create the evidence. That distinction is where the audit risk sits.

[DORA](https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng) has been in force since January 17, 2025, covering EU financial entities and their critical ICT providers. [NIS2](https://digital-strategy.ec.europa.eu/en/policies/nis2-directive) was due in member-state law by October 17, 2024; per the [ECSO transposition tracker](https://ecs-org.eu/activities/nis2-directive-transposition-tracker/), 21 of 27 Member States had transposed it by March 2026, covering essential and important entities across 18 sectors. The [EU AI Act](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng)'s high-risk provisions become fully applicable on August 2, 2026, covering high-risk AI systems and the data that trains, validates, and feeds them.

{/* truncate */}

## What DORA demands at the data layer

DORA (Regulation EU 2022/2554) targets EU financial entities (banks, insurers, investment firms, payment institutions, crypto-asset service providers) and their critical ICT third-party providers. Most operational detail sits in Level 2 measures (the RTS on ICT risk management, the RTS on subcontracting, the ITS on the register of information). The Level 1 articles are the anchor points:

- **Article 8 – ICT risk management.** Identification and classification of all information assets, including the data platform, with documented control evidence.
- **Article 9 – Protection and prevention.** ICT security policies and tools maintaining authenticity, integrity, and confidentiality of data, including encryption and access controls at the storage layer.
- **Article 10 – Detection.** Mechanisms to promptly detect anomalous activities, including ICT network performance issues and ICT-related incidents. Audit logs, access monitoring, and tamper detection sit here.
- **Articles 17 to 19 – Incident classification and reporting.** Article 18 sets classification criteria; Article 19 sets the reporting clock to competent authorities. Once an incident is classified as major, the initial notification is due within 4 hours, with intermediate and final reports following on the timelines set by the RTS on reporting.
- **Article 28 – Third-party risk strategy.** A register of information on all contractual arrangements for ICT services, reported to competent authorities (per the ITS), covering service type, provider category, and the function supported.
- **Article 30 – Key contractual provisions.** For ICT services supporting critical or important functions, the written contract must include service-level descriptions with quantitative performance targets, audit and access rights, incident notification, exit strategies, sub-contracting conditions, and termination triggers.

If the data platform vendor controls operational dependencies for a critical function, every Article 30 clause has to be enforceable in practice. Signing it is the easy part.

## What NIS2 demands at the data layer

NIS2 (Directive EU 2022/2555) sets cybersecurity risk-management baselines and incident reporting for essential and important entities across sectors including energy, transport, banking, financial-market infrastructure, health, drinking water, digital infrastructure, ICT service management, and public administration.

Three obligations show up directly on the data platform:

- **Risk-management measures (Article 21).** Ten mandatory measures including encryption, access controls with MFA, network and system security, supply-chain security, vulnerability handling, and policies on the use of cryptography. [ENISA's technical implementation guidance](https://www.enisa.europa.eu/sites/default/files/2025-06/ENISA_Technical_implementation_guidance_on_cybersecurity_risk_management_measures_version_1.0.pdf) (v1.0, June 2025) is the operative reference for what "appropriate" looks like in practice. Both managed and self-hosted platforms can comply; the difference is who holds the evidence when the supervisor asks.
- **Incident reporting (Article 23).** A 24-hour early warning to the CSIRT or competent authority, a 72-hour incident notification with severity, impact, and indicators of compromise, and a final report within one month. Hitting 24 hours requires telemetry the operator can actually query.
- **Supply-chain security and management accountability.** Operators must assess the cybersecurity practices of their direct suppliers and service providers. NIS2 additionally makes management bodies personally responsible for the risk-management measures (Articles 20 and 32(6)), with explicit reference to personal liability that the other two regimes do not match.

Unlike DORA, NIS2 is a directive, so the exact penalties and audit cadence depend on each member state's transposing law. The substantive obligations on the data platform are broadly consistent.

## What the EU AI Act demands at the data layer

The EU AI Act (Regulation EU 2024/1689) regulates AI systems by risk class. For high-risk systems, including credit scoring, insurance pricing, employment, and several public-service uses, the data layer carries specific obligations.

- **Article 10 – Data and data governance.** Training, validation, and testing datasets must be relevant, representative, "to the best extent possible, free of errors and complete," with documented governance covering collection, preparation, labeling, bias detection, and mitigation. For high-risk uses such as credit scoring, Article 10(2)(f)–(g) requires examination of datasets for biases likely to affect health, safety, or fundamental rights, with measures to detect, prevent, and mitigate them. Translated to platform requirements: you have to be able to reproduce the exact training dataset for each model version. A policy document does not count.
- **Article 12 – Record-keeping.** High-risk AI systems must automatically log events throughout their lifecycle, sufficient to identify risks and substantial modifications. Article 12(2)(c) specifically requires logs to identify the natural persons performing oversight under Article 14. Where the system queries a lakehouse for inference, that access trail belongs in a log the deployer controls.
- **Articles 19 and 26(6) – Log retention.** Providers retain the Article 12 logs for at least six months unless other Union or national law specifies longer (Article 19). Deployers retain logs to the extent they are under their control, on the same six-month floor (Article 26(6)).

High-risk obligations apply from August 2, 2026 for most categories. Annex I product-safety integrations get an extra year, to August 2, 2027.

## The overlap map

Across the three regimes, five data-platform capabilities carry overlapping obligations.

| Capability                          | DORA                                       | NIS2                                            | EU AI Act                                  |
|-------------------------------------|--------------------------------------------|-------------------------------------------------|--------------------------------------------|
| Tamper-evident audit logs           | Detection and integrity (Articles 9, 10)   | Logging requirements (Articles 21, 23)          | Automatic event logs (Articles 12, 19, 26(6)) |
| Access control and identity         | Protection (Article 9)                     | Access controls including MFA (Article 21)      | Cybersecurity (Article 15)                 |
| Data lineage and dataset versioning | Asset classification (Article 8)           | Asset management (Article 21)                   | Data governance (Articles 10, 13)          |
| Incident detection and reporting    | Major-incident clock (Articles 18–19)      | 24h / 72h / 1-month reporting (Article 23)      | Serious incidents (Article 73)             |
| Third-party / supply-chain control  | Third-party risk (Articles 28, 30)         | Supply-chain security (Article 21(2)(d))        | Value-chain duties (Article 25)            |

Incident reporting is where it gets painful. Add GDPR's 72-hour breach-notification clock underneath, and a regulated platform runs against four different reporting windows: DORA's 4 hours from major-incident classification, NIS2's 24-hour early warning, GDPR's 72 hours, and the AI Act's Article 73 serious-incident report. Instrument for the tightest applicable window per event type and route per-regulation in production, or audits will find the seams.

**What it costs to be wrong.** Under NIS2, fines reach at least EUR 10 million or 2% of global annual turnover for essential entities (whichever is higher), and at least EUR 7 million or 1.4% for important entities (Article 34). AI Act fines for non-compliance with provider and deployer obligations reach EUR 15 million or 3% of global turnover (whichever is higher); prohibited-practice violations under Article 5 reach EUR 35 million or 7% (Article 99). DORA penalties for financial entities are set by national competent authorities under Article 50; the European Supervisory Authorities can additionally impose periodic penalty payments at 1% of average daily worldwide turnover, applied daily for up to six months, on designated critical ICT third-party providers (Article 35(6)–(7)).

## Where vendors close the gap with contracts, not architecture

The contracts versus architecture distinction is the audit trap. Several common gaps:

- **Audit log custody.** Managed platforms generate the logs and expose them through vendor-controlled portals or APIs. Contractual export and retention clauses are not the same as logs landing directly in the operator's SIEM. DORA Article 30 audit rights and NIS2's 24-hour clock, in practice, require the operator to answer the regulator without filing a vendor ticket.
- **Incident timelines.** Under DORA Articles 18 and 19, the classification and reporting clock starts when the entity becomes aware of an ICT-related incident. Under NIS2 Article 23, it starts when the entity becomes aware of a significant incident. If the vendor's runbook says "notify customer within 24 hours of confirmed severity-1 event," the regulatory clock can already be expired by the time the vendor notification arrives.
- **Subcontracting visibility.** DORA Article 30(3) and the RTS on subcontracting expect the contract to specify subcontracting conditions for critical or important functions, including material changes the operator must be able to object to. Concentration risk under Article 29 turns a shared managed platform into a supervisory concern, not just an internal one.
- **Data-residency proofs.** Contracts assert that data stays in a region. The architectural proof is that the storage, compute, and metadata services are demonstrably bound to that region, with no implicit cross-border replication or support-pathway egress.
- **Exit and termination.** DORA Article 30 requires documented exit strategies. With proprietary table formats and catalog APIs, exit is expensive even when the contract permits it. Open table formats are a necessary part of the architectural answer, alongside portable catalog metadata, externalised IAM, and operational runbooks the operator owns.
- **AI dataset reproducibility.** Article 10 expects the training dataset for a high-risk model to be governed and documented. If the catalog stores schema history but not snapshot-level dataset state, the operator cannot reproduce the dataset that fed a given model version from contract language alone.

Contracts allocate responsibility for obligations. They cannot create the evidence. If the architecture cannot produce the artifact the regulation requires, no clause in the master services agreement will.

## The 2026 buying question: code or PDF?

Every regulatory obligation the three regimes care about has a weak and a strong answer. The weak answer is contractual. The strong answer is architectural.

| Capability                       | Weak (contractual) answer                | Strong (architectural) answer                                                       |
|----------------------------------|------------------------------------------|-------------------------------------------------------------------------------------|
| Audit-log custody                | "Logs available on request"              | Tamper-evident logs landing in the operator's SIEM, documented retention            |
| Incident detection (24h clock)   | "We notify customers within our SLA"     | Operator-side telemetry that meets the regulatory clock without vendor input        |
| Data residency                   | "EU-only per the DPA"                    | Region pinning enforced in code, with control-plane evidence                        |
| DORA Article 30 exit             | "Migration support available"            | Self-serve export in open table formats, portable catalog metadata, customer-managed keys |
| AI Act Article 10 reproducibility | "Schema history is logged"               | Snapshot-level dataset state with row-level lineage, governed retention             |

If the answers cluster on the left, the audit risk sits with whoever owns the platform – vendor or in-house. If they cluster on the right, the platform speaks for itself.

**If your platform is mostly on the left column:** the gap between architecture and contract is real, and your audit-evidence position depends on a counterparty's cooperation. The remediation usually starts with audit-log custody and dataset reproducibility, because those unblock the others.

IOMETE keeps audit logs, lineage, and dataset state inside the operator's tenancy. More on the architecture in [Kubernetes-native deployment](https://iomete.com/product/deployment), [Iceberg encryption and lineage](https://iomete.com/resources/blog/data-lakehouse-encryption-iceberg), and the [DORA and EU AI Act infrastructure checklist](https://iomete.com/resources/blog/dora-eu-ai-act-financial-institutions-data-infrastructure).

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
        <p>Documented practices for dataset collection, preparation, labeling, bias detection, and quality assessment, with datasets that are relevant, representative, and as error-free as practicable (<a href="https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-10">AI Act Article 10</a>).</p>
        <p>Operationally, the data platform must let the operator reconstruct which dataset version trained which model version, including schema and row-level state at training time.</p>
      </>
    )
  },
  {
    question: "Do NIS2 and DORA conflict for financial entities?",
    answerContent: (
      <>
        <p>NIS2 Article 4 codifies the lex specialis relationship: for ICT risk-management and incident-reporting subject matter, <a href="https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng">DORA</a>'s specific provisions disapply the corresponding NIS2 obligations (notably Articles 21 and 23) for in-scope financial entities.</p>
        <p>That carve-out is subject-matter scoped, not entity-wide. Financial entities still confirm with national transposing law and remain subject to NIS2 outside the DORA-equivalent areas.</p>
      </>
    )
  },
  {
    question: "What is the difference between contractual and architectural compliance?",
    answerContent: (
      <>
        <p>Contractual compliance allocates responsibility for an obligation in writing. Architectural compliance produces the evidence the regulation requires without depending on the counterparty.</p>
        <p>The gap matters under DORA Article 30 audit rights, NIS2's 24-hour notification clock, and AI Act Article 12 record-keeping. Each pushes the operator to produce evidence directly, without relying on the counterparty.</p>
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
    question: "Is a non-EU cloud or platform provider in scope for these regulations?",
    answerContent: (
      <>
        <p>Yes. DORA applies to non-EU providers offering ICT services to EU financial entities. NIS2 applies to non-EU providers operating in NIS2-covered sectors in the EU. The AI Act applies to non-EU providers that place AI systems on the EU market, or where the AI system's output is used in the EU. A non-EU headquarters does not exempt a provider from any of them.</p>
        <p>The EU entity remains responsible under its own regime, and the obligations cascade through the contract. DORA Articles 28 and 30, NIS2 Article 21(2)(d), and AI Act Article 25 all attach the obligation to whoever serves the EU regulated workload.</p>
      </>
    )
  }
]} />

## Sources

1. [DORA – Regulation (EU) 2022/2554](https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng) – EUR-Lex
2. [NIS2 – Directive (EU) 2022/2555](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022L2555) – EUR-Lex
3. [NIS2 Directive overview](https://digital-strategy.ec.europa.eu/en/policies/nis2-directive) – European Commission
4. [NIS2 Transposition Tracker](https://ecs-org.eu/activities/nis2-directive-transposition-tracker/) – European Cyber Security Organisation (ECSO)
5. [ENISA Technical Implementation Guidance on NIS2 cybersecurity risk-management measures (v1.0, June 2025)](https://www.enisa.europa.eu/sites/default/files/2025-06/ENISA_Technical_implementation_guidance_on_cybersecurity_risk_management_measures_version_1.0.pdf)
6. [EU AI Act – Regulation (EU) 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng) – EUR-Lex
7. [AI Act Article 10 – Data and data governance](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-10) – European Commission AI Act Service Desk
8. [AI Act Article 12 – Record-keeping](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-12) – European Commission AI Act Service Desk
9. [DORA Article 28 – ICT third-party risk management](https://www.digital-operational-resilience-act.com/Article_28.html)
10. [DORA Article 30 – Key contractual provisions](https://www.digital-operational-resilience-act.com/Article_30.html)
