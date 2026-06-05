---
title: "Data Sovereignty for Regulated Finance: DORA & Private Cloud"
description: "Data sovereignty for banks under DORA and the EU AI Act: why a self-hosted, private-cloud lakehouse answers infrastructure-control requirements."
slug: data-sovereignty-regulated-finance-dora-private-cloud
tags2: [Technical, Company]
authors: [aytan]
hide_table_of_contents: false
coverImage: img/blog/thumbnails/1.png
---

import FAQSection from '@site/src/components/FAQSection';

For a bank, "where does the data live" stopped being an infrastructure question and became a regulatory one. Two EU regulations now ask for evidence of control at the data infrastructure layer, not a contractual promise that control exists somewhere upstream. The [Digital Operational Resilience Act (DORA)](https://eur-lex.europa.eu/eli/reg/2022/2554/oj) has been in force since January 17, 2025. The [EU AI Act](https://eur-lex.europa.eu/eli/reg/2024/1689/oj) adds high-risk enforcement from August 2, 2026. Both point at the same thing: financial institutions have to demonstrate custody and resilience of the systems their data and models run on.

That is a data-sovereignty problem wearing a compliance label. This post – the finance entry in a cluster on the [sovereign data platform](/resources/blog/sovereign-data-platform-private-cloud-ai) – walks through what regulated institutions actually need from their data platform, and why a self-hosted, private-cloud lakehouse maps onto the requirements more cleanly than a managed alternative.

{/* truncate */}

## What DORA actually asks of your data infrastructure

DORA does not mention lakehouses. It asks for outcomes, and those outcomes land squarely on the data platform. Read across the articles that touch infrastructure and a checklist emerges:

- **ICT risk management and data classification** (Art. 8) – you can classify data and show how it is protected.
- **Access control and audit logging** (Art. 9) – fine-grained access, with a complete, tamper-evident audit trail.
- **Incident detection and reporting** (Art. 17–19) – you can detect, investigate, and report incidents on time.
- **Third-party ICT risk** (Art. 28–30) – you can manage and exit dependence on external ICT providers, including concentration risk.
- **Resilience testing** (Art. 25) – you can test and prove the system recovers.

The EU AI Act overlaps on data governance for high-risk systems (Art. 10, 12, 13): data quality, logging, and traceability for the data that trains and feeds models. The two frameworks were written separately and converge on one demand – auditable control at the infrastructure layer. For the regulation-by-regulation breakdown, see [DORA and the EU AI Act for financial institutions](/resources/blog/dora-eu-ai-act-financial-institutions-data-infrastructure).

## Why the third-party concentration clause changes the calculus

Article 28 is the one that quietly reshapes platform decisions. It requires financial entities to manage concentration risk from third-party ICT providers and to have a workable exit strategy. When the data platform, the storage, and the compute all belong to a single external cloud provider, that provider becomes a concentrated dependency the regulator now expects you to be able to unwind.

A direct answer for a featured snippet: **a self-hosted data platform reduces DORA third-party concentration risk because the institution operates the platform on infrastructure it controls, stores data in open formats, and can therefore demonstrate a credible exit without a re-platforming project.** The dependency on any single external provider shrinks, and the exit strategy stops being a paragraph nobody believes.

The companion to this is jurisdictional reach – the reality that a provider headquartered under foreign law may be compelled to produce data regardless of where it is stored. The [CLOUD Act reality check](/resources/blog/cloud-act-reality-check) covers why physical residency alone does not settle the sovereignty question.

## What banks are actually starting from

The compliance pressure lands on top of an architecture that was not built for it. A typical institution has run an Oracle data warehouse for 12 to 20 years. There is usually a Hadoop cluster on the side for data science, a scatter of reporting databases that grew organically, a SQL Server instance somewhere, and spreadsheet-driven uploads from operational portals.

One metric tells the story: single-instance warehouses reaching 4,000+ tables, most of them derived – a `final_v3_corrected` copy for every reporting request over fifteen years, none of it decommissioned because nobody could prove it was safe to. That accumulation is not bad engineering. It is the predictable result of running one platform for a decade and a half without lineage, without version-controlled transformations, and without a forcing function to consolidate. The problem with this estate is not that it lacks features. It is that you cannot produce the lineage, classification, and audit evidence DORA expects from it.

## The architecture that answers the requirements

Features come and go; architecture is durable. When a regulated institution evaluates a platform, the question is not "does it have feature X" but "does the architecture make X possible without compromise." Four properties do the work:

**Sovereignty by deployment.** The platform runs inside the bank's own perimeter – on-premises, private cloud, a regional sovereign cloud, or fully air-gapped – with no vendor data plane in the path. This is what turns Article 28's exit strategy from aspiration into architecture.

**Open formats for portability.** Data stored as [Apache Iceberg](https://iceberg.apache.org/) tables on object storage the bank controls is readable by any Iceberg-compatible engine. Exit is symmetric with entry – the credible-exit requirement satisfied at the storage layer, not the contract.

**Governance as evidence.** Fine-grained access control by table, column, and row, dynamic masking for PII, and end-to-end lineage produce the audit file DORA Art. 9 and AI Act Art. 12 ask for. The controls are the evidence. See how [data governance](https://iomete.com/product/data-platform/data-governance) and [data security](https://iomete.com/product/architecture/data-security) are implemented.

**Reproducibility for model traceability.** Time travel and dataset tagging tie every model and report to the exact data version behind it – the traceability the AI Act expects for high-risk systems, and the answer to "show me the data that produced this number" in an audit.

## How IOMETE maps to DORA and the AI Act

[IOMETE](/resources/blog/data-lakehouse-for-regulated-enterprises) is a sovereign data platform built for exactly this profile. It is self-hosted on the institution's own Kubernetes clusters, built on Apache Iceberg and Apache Spark, and runs on-premises, in private or sovereign clouds, or air-gapped – with no IOMETE-operated data plane. Fine-grained access control, masking, lineage, and reproducibility provide the auditable controls the regulations expect, and the platform is SOC 2 Type II, HIPAA, and GDPR aligned. IOMETE publishes a DORA and EU AI Act compliance checklist that maps each requirement area to a concrete infrastructure control, so an institution can mark what is implemented and turn the gaps into a remediation roadmap.

This is the architecture behind real modernizations: tier-1 commercial banks and national central banks migrating from long-running Oracle warehouses to a sovereign lakehouse on Iceberg, with anomaly detection on transactional payment data running in production. None of those institutions could send that data to a managed AI service, which is the entire point.

To finish the cluster: the [pillar on sovereign data platforms](/resources/blog/sovereign-data-platform-private-cloud-ai) frames the strategy, [sovereign AI and ML](/resources/blog/sovereign-ai-ml-private-cloud-lakehouse) covers the model side, and the [self-hosted architecture post](/resources/blog/self-hosted-data-platform-private-cloud-architecture) covers the infrastructure.

## FAQ

<FAQSection faqs={[
  {
    question: "What does DORA require from a bank's data infrastructure?",
    answerContent: (
      <>
        <p>DORA requires evidence of control at the data infrastructure layer: data classification, fine-grained access control with audit logging, incident detection and reporting, third-party ICT risk management, and resilience testing.</p>
        <p>These map to Articles 8, 9, 17–19, 25, and 28–30, and the practical effect is that the data platform itself must produce the lineage, access, and audit evidence rather than relying on a vendor's assurances. IOMETE produces those controls natively – lineage, fine-grained access, and audit logging – so the evidence is a byproduct of normal operation.</p>
      </>
    )
  },
  {
    question: "How does a self-hosted data platform help with DORA third-party risk?",
    answerContent: (
      <>
        <p>A self-hosted platform reduces DORA Article 28 concentration risk because the institution operates it on infrastructure it controls and stores data in open formats, making a credible exit strategy demonstrable.</p>
        <p>Dependence on any single external ICT provider shrinks, and the required exit plan becomes an architectural fact rather than a contractual paragraph. Because IOMETE runs on the institution's own Kubernetes clusters and stores data in open Apache Iceberg tables, that exit path is built into the architecture.</p>
      </>
    )
  },
  {
    question: "Is data sovereignty the same as data residency for a bank?",
    answerContent: (
      <>
        <p>No. Data residency only fixes where data is physically stored; data sovereignty also requires control over who can compel access and which jurisdiction's law applies.</p>
        <p>A provider under foreign law may be obligated to produce data regardless of where it sits, which is why residency alone does not satisfy sovereignty requirements for regulated finance. IOMETE keeps storage, compute, and metadata inside the bank's own perimeter, so there is no vendor-operated plane a foreign jurisdiction could compel.</p>
      </>
    )
  },
  {
    question: "Does the EU AI Act affect a bank's data platform?",
    answerContent: (
      <>
        <p>Yes. For high-risk AI systems, the EU AI Act requires data governance, logging, and traceability (Articles 10, 12, 13) on the data that trains and feeds models.</p>
        <p>In practice this means the platform must record which data version produced which model, which a lakehouse delivers through time travel and dataset tagging. On IOMETE, Apache Iceberg time travel and dataset tagging tie every model and report to the exact data version behind it.</p>
      </>
    )
  },
  {
    question: "Can a sovereign data platform run in an air-gapped bank environment?",
    answerContent: (
      <>
        <p>Yes. A correctly designed self-hosted platform runs in clusters with no outbound connectivity, because no part of its operation depends on a vendor-operated control plane.</p>
        <p>Air-gapped operation is common for central banks and payment systems, and IOMETE supports it directly.</p>
      </>
    )
  },
  {
    question: "How does a lakehouse produce the audit evidence DORA expects?",
    answerContent: (
      <>
        <p>Through fine-grained access control, complete audit logging, end-to-end lineage, and reproducible data versions – the controls themselves are the evidence.</p>
        <p>Because IOMETE enforces access, masking, and lineage in the query path rather than bolting them on per tool, the audit file is a byproduct of normal operation rather than a separate project.</p>
      </>
    )
  },
  {
    question: "Why do banks struggle to meet DORA with legacy data warehouses?",
    answerContent: (
      <>
        <p>Legacy warehouses accumulated thousands of derived tables over 15 to 20 years without lineage or version-controlled transformations, so they cannot produce the classification and audit evidence DORA requires.</p>
        <p>The gap is structural: the estate was built for reporting, not for demonstrable infrastructure control, which is why modernization onto a governed lakehouse like IOMETE is the common path.</p>
      </>
    )
  },
  {
    question: "Does moving to a self-hosted lakehouse mean losing cloud scalability?",
    answerContent: (
      <>
        <p>No. A Kubernetes-native lakehouse scales compute and storage independently on private cloud or on-premises infrastructure, delivering elastic scale without a public-cloud data plane.</p>
        <p>IOMETE runs multi-tenant, multi-region workloads in production on this architecture, so scalability is preserved while sovereignty is regained.</p>
      </>
    )
  }
]} />
