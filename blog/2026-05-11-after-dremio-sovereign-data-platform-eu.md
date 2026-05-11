---
title: "After Dremio: what sovereign data platform means in the EU now"
description: "After SAP's Dremio deal, EU buyers face a sharper sovereignty test. Contracts allocate responsibility; they don't create the evidence regulators ask for."
slug: after-dremio-sovereign-data-platform-eu-2026
authors: ruturaj
tags2: [Compliance, Opinion]
hide_table_of_contents: false
date: 05/11/2026
coverImage: img/blog/thumbnails/3.png
---

import FAQSection from '@site/src/components/FAQSection';

On May 4, 2026, [SAP announced](https://news.sap.com/2026/05/sap-to-acquire-dremio-unify-sap-and-non-sap-data-power-agentic-ai/) it had agreed to acquire Dremio, with the transaction expected to close in Q3 2026 pending regulatory approval. The public framing was clear within a week: an EU-headquartered vendor running an Iceberg-native lakehouse, with a stated commitment to continue contributing to Apache Iceberg, Polaris, and Arrow. It is a short step to conclude that the combination qualifies as a "sovereign data platform" for EU-regulated workloads.

It isn't. Not automatically, and not in the way that matters under DORA.

The argument in this post is narrow and worth saying out loud, because it is going to get muddied in the next quarter of vendor briefings. Contractual compliance and architectural compliance are two different conversations. A signed DPA, a CTPP designation, a German parent company, an Iceberg commitment – none of those is a runtime property. Sovereignty is a runtime property. After Dremio, EU data leaders need a sharper test for it.

{/* truncate */}

## What actually changed on May 4

The facts of the deal, briefly. SAP is acquiring Dremio to "expand SAP Business Data Cloud's ability to combine SAP and non-SAP data" for agentic AI workloads, with Apache Iceberg as the native foundation. SAP's CTO framed the rationale as a data-readiness problem rather than a model-quality problem. [Dremio's leadership reaffirmed open-source stewardship](https://www.dremio.com/blog/sap-intends-to-acquire-dremio/) of Iceberg (the table format), Polaris (the catalog), and Arrow (the in-memory data format). [The Register reported](https://www.theregister.com/2026/05/05/sap_dremio/) that Dremio carried a roughly $2 billion valuation in 2022 and discussed implications for SAP's existing partnership with Databricks. Terms were not disclosed.

As with most pending acquisitions, the announcement and Dremio's customer note focus on the SAP Business Data Cloud integration path and Iceberg, Polaris, and Arrow stewardship, and do not yet describe the post-close product roadmap in detail. Dremio today ships in three forms: Dremio Cloud, Dremio Enterprise (self-hosted), and the community build. If you currently run Dremio Enterprise self-hosted, request roadmap clarification directly from Dremio as part of normal change-of-control diligence under DORA Article 28, and document the response. That conversation is the kind of artifact your supervisor will expect to see at the next inspection.

## How post-acquisition sovereignty claims tend to be structured

Three arguments commonly appear in post-acquisition sovereignty discussions in this market. EU domicile of the contracting party brings EU jurisdiction. Open table formats (Iceberg, Polaris, Arrow) provide format portability. And the platform's data-processing locations and access provisions can be contractually fixed under DORA Article 30, which already governs the financial-services side of the relationship.

Each of those is true on its own terms. None of them is sovereignty.

[DORA](https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng) went into force on January 17, 2025, and the European Supervisory Authorities (EBA, EIOPA, and ESMA) [designated the first 19 critical ICT third-party providers (CTPPs)](https://www.eba.europa.eu/publications-and-media/press-releases/european-supervisory-authorities-designate-critical-ict-third-party-providers-under-digital) in late 2025. [AWS](https://aws.amazon.com/blogs/security/aws-designated-as-a-critical-third-party-provider-under-eus-dora-regulation/), Microsoft, Google Cloud, IBM, and Oracle are all in that initial set. The CTPP framework is, in effect, the EU's acknowledgment that contractual oversight alone cannot manage concentration risk when a small set of vendors operates the runtime for most regulated entities. The [ECB has documented](https://www.bankingsupervision.europa.eu/press/supervisory-newsletters/newsletter/2024/html/ssm.nl240221.en.html) that nearly all significant EU credit institutions use cloud services, with most providers located outside the EU, and that bank outsourcing budgets concentrate heavily on a small number of providers. That concentration is the architectural problem the CTPP framework was built to address. Dremio Cloud is currently delivered on hyperscaler infrastructure; the post-close hosting topology of any SAP-operated managed Dremio offering has not been disclosed. EU-domiciled ownership at the contracting layer does not, by itself, change the underlying infrastructure dependency at the layer below; that dependency is an architectural question to be confirmed against the deployed topology, not inferred from headquarters.

## What "sovereign" actually has to mean

"Sovereign" is doing a lot of work in 2026 procurement language, so it is worth being concrete about which property is being claimed. There are at least five.

| Sovereignty dimension | What it asserts | How it's evidenced |
|---|---|---|
| Legal jurisdiction | EU law applies to the contracting entity | Counterparty domicile, contract choice of law |
| Data residency | Bytes do not leave a named region | Region-pinning configuration, audit logs |
| Operational sovereignty | The operator controls the runtime | Where compute, control plane, and support pathways execute |
| Key custody | The operator controls encryption keys | KMS topology, BYOK / HYOK, key-rotation control |
| Exit | The operator can leave without vendor cooperation | Open table format, portable catalog, customer-managed IAM |

A managed cloud service operated by an EU vendor can satisfy the first two through contract language and configuration. The last three are properties of where the software actually runs. They can be satisfied by an EU vendor, a US vendor, or your own platform team – but only if the architecture admits them. Vendor headquarters is not the operative variable.

DORA's text reflects the same distinction. Article 28 requires a register of information and a third-party risk strategy covering every contractual arrangement. Article 30 mandates location-of-processing detail, exit strategies, audit and access rights, and subcontracting visibility for ICT services supporting critical or important functions. These are real obligations. They are also obligations on the relationship between you and the vendor. They do not make the vendor's runtime your runtime. That is the substance-over-form discipline the regulation requires: evidence the platform must produce, not promises the contract can make.

## Contracts allocate responsibility. They do not create evidence.

The line I keep coming back to, including in last week's [DORA, NIS2, and EU AI Act compliance map](/blog/dora-nis2-eu-ai-act-data-platform-compliance-map-2026), is this: contracts allocate responsibility for obligations; they cannot create the evidence the regulator asks for. Post-Dremio, that distinction is sharper, not weaker. No combined SAP+Dremio product has shipped, so the three patterns below are illustrative of how managed-platform architectures tend to allocate evidence custody, not a verdict on any specific vendor's eventual offering.

If your audit logs live in a vendor portal you query through a support ticket, the logs are not in your custody. That is an architectural fact. A DPA can say you have audit rights. The DORA Article 30 audit clause can be in place. The vendor can be an EU entity. None of those changes where the logs live.

If your incident-detection telemetry depends on a vendor SLA for notification, the DORA Article 19 reporting clock, which starts when the financial entity becomes aware of an ICT-related incident, is being driven by the vendor's runbook, not your platform's instrumentation. An EU-headquartered vendor's runbook still doesn't put the clock on your side.

If your exit strategy is "Iceberg tables are open, so we can leave," but the catalog state, IAM, audit history, and lineage are not portable, then "we can leave" is an aspiration. Open table formats are necessary. They are not, by themselves, sufficient for [DORA Article 30](https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng) exit obligations.

The same architecture argument applies in the AI direction. High-risk AI obligations under the [EU AI Act](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng) (Articles 10, 12, 19, 26(6)) require dataset reproducibility and tamper-evident logs through August 2, 2026 and beyond. The question is not whose entity holds the data. It is whose runtime produces the artifact and where the artifact lives.

## The post-Dremio question set

If you are a data or platform leader evaluating sovereignty claims from any vendor in the wake of this acquisition (SAP+Dremio, the hyperscaler-aligned lakehouses, or anyone else), the questions worth asking on the first call are architectural, not contractual.

1. **Where does the control plane execute?** Inside our tenancy or vendor-operated? If vendor-operated, what privileged access do vendor SREs hold to our metadata, query history, and table state, and how is that access logged in our SIEM rather than theirs?
2. **Who holds the encryption keys, in what KMS, under what rotation policy?** Is it HYOK (Hold-Your-Own-Key, keys never leave your HSM), BYOK with vendor-operated KMS, or vendor-managed throughout?
3. **Where do audit logs land?** Vendor portal, vendor-side object store, or our SIEM directly? What is the maximum delay between event and our visibility?
4. **What does "exit" look like in code, not in the MSA?** Can we walk away with Iceberg tables, catalog metadata, IAM bindings, and lineage history, without vendor cooperation, on a 90-day exercise?
5. **What is the deployment commitment for the self-hosted option, with a written timeline?** Post-acquisition, what is the support and feature-parity commitment for any deployment model that is not the vendor's managed cloud?
6. **Where does support access execute from, and through what pathway?** Vendor-side support engineers reaching into our environment is operationally a cross-border data-access pathway, regardless of where the storage lives.
7. **What concentration risk profile does this vendor create?** If the answer routes back to one of the [existing 19 designated CTPPs](https://www.eba.europa.eu/publications-and-media/press-releases/european-supervisory-authorities-designate-critical-ict-third-party-providers-under-digital), the architectural concentration didn't go away with the acquisition. It just moved up one level in the stack.

If a vendor's answers to those seven questions land on contractual phrasing rather than runtime properties, the platform is contractually compliant. Useful, but a different property.

## Between now and Q3 close

Four practical actions for the next 90 days regardless of which platform you run today:

1. Update the Article 28 register of information to flag the SAP+Dremio change of control as pending.
2. Request a written deployment-parity statement for any non-managed-cloud deployment option, with a timeline.
3. Re-open the Article 30 exit clause before integration absorbs it. Negotiate transition-period length and concrete exit deliverables (catalog export, IAM bindings, audit history) into the contract while the leverage exists.
4. Run a 90-day exit rehearsal against your current lakehouse, whoever the vendor is. The evidence is what the regulator asks for, not the architecture diagram.

## Closing

Two notes before signing off. DORA places accountability for ICT third-party risk on the management body itself. "The vendor said so" is not an audit-defensible answer when the examiner asks. And the architectural test has a real cost: operational sovereignty has a TCO and a staffing implication, and that cost is the price of having an answer when the regulator does.

[IOMETE](https://iomete.com/product/deployment) ships a [self-hosted, Kubernetes-native lakehouse](/blog/self-hosted-data-lakehouse-kubernetes) where audit logs, lineage, dataset state, and encryption keys remain in the operator's tenancy. The acquisition announcement does not change that architectural distinction. It does increase the importance, for buyers, of testing contractual answers against runtime evidence.

"Sovereign data platform" as a phrase will get sloppier before it gets sharper. The sharpening will come from buyers asking better questions on the first call, the ones above. Contracts allocate responsibility for obligations. They do not create the evidence the regulator asks for. That is the test.

<FAQSection faqs={[
  {
    question: "Did SAP's acquisition of Dremio actually close, and does that matter for DORA assessments today?",
    answerContent: (
      <>
        <p>No. SAP <a href="https://news.sap.com/2026/05/sap-to-acquire-dremio-unify-sap-and-non-sap-data-power-agentic-ai/">announced its agreement</a> to acquire Dremio on May 4, 2026, with the deal expected to close in Q3 2026 pending regulatory approval.</p>
        <p>For DORA Article 28 register-of-information purposes, the contracting counterparty is still Dremio today. The change of control at close is a material change that should trigger a register update and a re-assessment under the <a href="https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng">Article 30 change-management workflow</a>. Treat the announcement as advance notice, not a completed change, but start the register update workflow now.</p>
      </>
    )
  },
  {
    question: "Does an EU-headquartered vendor automatically satisfy DORA's third-party risk requirements?",
    answerContent: (
      <>
        <p>No. <a href="https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng">DORA Article 28's third-party risk strategy and the Article 30 contractual provisions</a> apply to every ICT third-party arrangement, regardless of the vendor's headquarters.</p>
        <p>The Critical ICT Third-Party Provider (CTPP) framework under DORA exists specifically because contractual oversight alone cannot manage concentration risk. The <a href="https://www.eba.europa.eu/publications-and-media/press-releases/european-supervisory-authorities-designate-critical-ict-third-party-providers-under-digital">first 19 CTPPs designated</a> in late 2025 include vendors of multiple nationalities. Domicile is one input. It is not the test.</p>
      </>
    )
  },
  {
    question: "What is the difference between contractual compliance and architectural compliance under DORA?",
    answerContent: (
      <>
        <p>Contractual compliance means the DORA Article 30 clauses are in the master agreement. Architectural compliance means the platform can produce the evidence those clauses promise.</p>
        <p>The gap shows up at exit, at incident reporting, at audit-log custody, and at subcontracting visibility. A signed DPA does not move audit logs into your SIEM, does not start the DORA Article 19 reporting clock on your telemetry, and does not make a proprietary catalog portable. Architecture is what produces the artifact.</p>
      </>
    )
  },
  {
    question: "Is Apache Iceberg by itself enough for a DORA Article 30 exit strategy?",
    answerContent: (
      <>
        <p>It is necessary, not sufficient. Iceberg gives you table-format portability and a path to migrate the data without rewriting.</p>
        <p><a href="https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng">DORA Article 30 exit obligations</a> also cover catalog metadata, IAM bindings, audit history, lineage, operational runbooks, and a tested transition period. If those live in vendor-controlled services and cannot be exported on a 90-day exercise without vendor cooperation, the exit is contractual on paper and operational nowhere. Open table format is one piece of the answer.</p>
      </>
    )
  },
  {
    question: "What does the CTPP designation mean for buyers evaluating sovereignty claims?",
    answerContent: (
      <>
        <p>It means the EU regulator has formally acknowledged that certain ICT providers carry concentration risk significant enough to warrant <a href="https://www.eba.europa.eu/publications-and-media/press-releases/european-supervisory-authorities-designate-critical-ict-third-party-providers-under-digital">direct EU-level oversight</a> by EBA, EIOPA, and ESMA.</p>
        <p>CTPP designation does not relieve the financial entity of its own Article 28 and Article 30 obligations. It adds a supervisory layer above the vendor, not below it. The architectural concentration risk, <a href="https://www.bankingsupervision.europa.eu/press/supervisory-newsletters/newsletter/2024/html/ssm.nl240221.en.html">measured by what fraction of regulated workloads run on a given provider's infrastructure</a>, is unchanged by acquisitions.</p>
      </>
    )
  },
  {
    question: "What should current Dremio Enterprise self-hosted customers do before the deal closes?",
    answerContent: (
      <>
        <p>Dremio and SAP have publicly committed to <a href="https://news.sap.com/2026/05/sap-to-acquire-dremio-unify-sap-and-non-sap-data-power-agentic-ai/">Apache Iceberg, Polaris, and Arrow stewardship</a> and to the SAP Business Data Cloud integration path. As with most pending acquisitions, the announcement does not yet describe the post-close product roadmap in detail.</p>
        <p>Customers operating Dremio Enterprise self-hosted may wish to request roadmap clarification directly from Dremio as part of normal change-of-control diligence under <a href="https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng">DORA Article 28</a>. Document that conversation, since it supports both register-of-information updates and Article 30 subcontracting analysis.</p>
      </>
    )
  },
  {
    question: "What is operational sovereignty, and why isn't it the same as data residency?",
    answerContent: (
      <>
        <p>Data residency asserts that bytes do not leave a named region. Operational sovereignty asserts that the operator, not the vendor, controls where the runtime executes, who holds privileged access, and through which pathways support reaches into the environment.</p>
        <p>A managed cloud service can pin storage to Frankfurt while support engineers in another jurisdiction hold privileged credentials. That is residency without operational sovereignty. The two are not interchangeable, and DORA's audit and access provisions probe operational sovereignty whether or not the contract uses the word. More on the residency-vs-sovereignty boundary in our earlier post on <a href="/blog/data-residency-vs-data-sovereignty">data residency vs. data sovereignty</a>.</p>
      </>
    )
  },
  {
    question: "What should EU data leaders ask a vendor on the first call now?",
    answerContent: (
      <>
        <p>Where does the control plane execute? Who holds the encryption keys? Where do audit logs land in real time? What does exit look like in code, not in the MSA? What is the written deployment commitment for any non-managed-cloud option? Where does support access execute from? What is the concentration-risk profile?</p>
        <p>If the answers route to contract clauses rather than runtime properties, the platform is contractually compliant. That meets one category of DORA obligation; operational sovereignty is a different category, and the regulation requires evidence of both.</p>
      </>
    )
  }
]} />

*Dremio, SAP, Databricks, AWS, Microsoft, Google Cloud, IBM, Oracle, and Apache Iceberg, Polaris, and Arrow are trademarks of their respective owners. References to these marks are nominative and do not imply endorsement, sponsorship, or affiliation.*
