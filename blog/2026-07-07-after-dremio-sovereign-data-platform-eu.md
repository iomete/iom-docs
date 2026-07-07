---
title: "After Dremio: what sovereign data platform means in the EU now"
description: "After SAP's Dremio deal, EU buyers face a sharper sovereignty test. Contracts allocate responsibility; they don't create the evidence regulators ask for."
slug: after-dremio-sovereign-data-platform-eu-2026
authors: ruturaj
tags2: [Compliance, Opinion]
hide_table_of_contents: false
date: 07/07/2026
coverImage: img/blog/thumbnails/3.png
---

import FAQSection from '@site/src/components/FAQSection';

On May 4, 2026, [SAP announced](https://news.sap.com/2026/05/sap-to-acquire-dremio-unify-sap-and-non-sap-data-power-agentic-ai/) it had agreed to acquire Dremio. On July 6, the transaction [closed](https://news.sap.com/2026/07/sap-completes-dremio-acquisition/), early in the Q3 window SAP had guided to. The public framing was clear within a week of the announcement: an EU-headquartered vendor running an Iceberg-native lakehouse, with a stated commitment to continue contributing to Apache Iceberg, Polaris, and Arrow. It is a short step to conclude that the combination qualifies as a "sovereign data platform" for EU-regulated workloads.

Whether that conclusion holds depends on architecture, not on the contracting party's domicile. "Sovereign" in 2026 procurement language asserts at least five distinct properties, and a managed cloud service operated by an EU vendor covers two of them. The other three are runtime properties.

{/* truncate */}

## What "sovereign" actually has to mean

| Sovereignty dimension | What it asserts | How it's evidenced |
|---|---|---|
| Legal jurisdiction | EU law applies to the contracting entity | Counterparty domicile, contract choice of law |
| Data residency | Bytes do not leave a named region | Region-pinning configuration, audit logs |
| Operational sovereignty | The operator controls the runtime | Where compute, control plane, and support pathways execute |
| Key custody | The operator controls encryption keys | KMS topology, BYOK / HYOK, key-rotation control |
| Exit | The operator can leave without vendor cooperation | Open table format, portable catalog, customer-managed IAM |

A managed cloud service operated by an EU vendor can satisfy the first two through contract language and configuration. The last three are properties of where the software actually runs. They can be satisfied by an EU vendor, a US vendor, or your own platform team – but only if the architecture admits them. Vendor headquarters is not the operative variable.

DORA draws the same line. Article 28 requires a register of information and a third-party risk strategy covering every contractual arrangement. Article 30 mandates location-of-processing detail, exit strategies, audit and access rights, and subcontracting visibility for ICT services supporting critical or important functions. These are obligations on the relationship between you and the vendor. They do not make the vendor's runtime your runtime.

## What the acquisition actually changes

SAP acquired Dremio to "expand SAP Business Data Cloud's ability to combine SAP and non-SAP data" for agentic AI workloads, with Apache Iceberg as the native foundation. SAP's CTO framed the rationale as a data-readiness problem rather than a model-quality problem. [Dremio's leadership reaffirmed open-source stewardship](https://www.dremio.com/blog/sap-intends-to-acquire-dremio/) of Iceberg (the table format), Polaris (the catalog), and Arrow (the in-memory data format). [The Register reported](https://www.theregister.com/2026/05/05/sap_dremio/) a roughly $2 billion 2022 valuation for Dremio and discussed implications for SAP's existing partnership with Databricks. Terms were not disclosed.

Both the May announcement and the [completion release](https://news.sap.com/2026/07/sap-completes-dremio-acquisition/) focus on the SAP Business Data Cloud integration path and Iceberg, Polaris, and Arrow stewardship. Neither describes the product roadmap in detail. The completion release confirms the close and restates the agentic-AI rationale; it says nothing about deployment models or hosting topology. Dremio today ships as Dremio Cloud, Dremio Enterprise (self-hosted), and a community build. If you run Dremio Enterprise self-hosted, request roadmap clarification directly from Dremio as part of normal change-of-control diligence under DORA Article 28, and document the response. That conversation is the kind of artifact your supervisor will expect at the next inspection.

## The concentration argument that does not go away

Three claims anchor most post-acquisition sovereignty discussions: EU domicile of the contracting party brings EU jurisdiction; open table formats (Iceberg, Polaris, Arrow) provide format portability; and data-processing locations can be contractually fixed under DORA Article 30. Each is true on its own terms. None of them is sovereignty.

[DORA](https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng) has applied since January 17, 2025, and the European Supervisory Authorities (EBA, EIOPA, and ESMA) [designated the first 19 critical ICT third-party providers (CTPPs)](https://www.eba.europa.eu/publications-and-media/press-releases/european-supervisory-authorities-designate-critical-ict-third-party-providers-under-digital) in late 2025. [AWS](https://aws.amazon.com/blogs/security/aws-designated-as-a-critical-third-party-provider-under-eus-dora-regulation/), Microsoft, Google Cloud, IBM, and Oracle are all in that initial set. So is SAP SE. The acquirer in this transaction is itself under direct ESA oversight as a critical ICT third-party provider. The CTPP framework is, in effect, the EU's acknowledgment that contractual oversight alone cannot manage concentration risk when a small set of vendors operates the runtime for most regulated entities. The [ECB has documented](https://www.bankingsupervision.europa.eu/press/supervisory-newsletters/newsletter/2024/html/ssm.nl240221.en.html) that nearly all significant EU credit institutions use cloud services, with most providers located outside the EU, and that bank outsourcing budgets concentrate heavily on a small number of providers. Dremio Cloud is currently delivered on hyperscaler infrastructure; the hosting topology of any SAP-operated managed Dremio offering remains undisclosed, including in the completion announcement. EU-domiciled ownership at the contracting layer does not, by itself, change the dependency at the layer below.

## Contracts allocate responsibility. They do not create evidence.

Two patterns show how managed-platform architectures allocate evidence custody. They describe the gap, not a verdict on any specific vendor's eventual offering.

If your audit logs live in a vendor portal you query through a support ticket, the logs are not in your custody. A DPA can say you have audit rights, the DORA Article 30 audit clause can be in place, and the vendor can be an EU entity. None of those changes where the logs live. Incident detection works the same way: the DORA Article 19 reporting clock starts when the entity becomes aware of an ICT-related incident, and if your telemetry depends on a vendor SLA for notification, the clock is being driven by the vendor's runbook, not your platform.

If your exit strategy is "Iceberg tables are open, so we can leave," but the catalog state, IAM, audit history, and lineage are not portable, then "we can leave" is an aspiration. Open table formats are necessary. They are not, by themselves, sufficient for [DORA Article 30](https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng) exit obligations.

## The post-Dremio question set

If you are a data or platform leader evaluating sovereignty claims from any vendor in the wake of this acquisition (SAP+Dremio, the hyperscaler-aligned lakehouses, or anyone else), the questions worth asking on the first call are architectural, not contractual.

1. **Where does the control plane execute?** Inside our tenancy or vendor-operated? If vendor-operated, what privileged access do vendor SREs hold to our metadata, query history, and table state, and how is that access logged in our SIEM rather than theirs?
2. **Who holds the encryption keys, in what KMS, under what rotation policy?** Is it HYOK (Hold-Your-Own-Key, keys never leave your HSM), BYOK with vendor-operated KMS, or vendor-managed throughout?
3. **Where do audit logs land?** Vendor portal, vendor-side object store, or our SIEM directly? What is the maximum delay between event and our visibility?
4. **What does "exit" look like in code, not in the MSA?** Can we walk away with Iceberg tables, catalog metadata, IAM bindings, and lineage history, without vendor cooperation, on a 90-day exercise?
5. **What is the deployment commitment for the self-hosted option, with a written timeline?** Post-acquisition, what is the support and feature-parity commitment for any deployment model that is not the vendor's managed cloud?
6. **Where does support access execute from, and through what pathway?** Vendor-side support engineers reaching into our environment is operationally a cross-border data-access pathway, regardless of where the storage lives.
7. **What concentration risk profile does this vendor create?** If the answer routes back to one of the [existing 19 designated CTPPs](https://www.eba.europa.eu/publications-and-media/press-releases/european-supervisory-authorities-designate-critical-ict-third-party-providers-under-digital) – a list that includes SAP itself – the architectural concentration didn't go away with the acquisition. It just moved up one level in the stack.

If a vendor's answers to those seven questions land on contractual phrasing rather than runtime properties, the platform is contractually compliant. Useful, but a different property.

## What to do this quarter

DORA places accountability for ICT third-party risk on the management body itself. "The vendor said so" is not an audit-defensible answer when the examiner asks. Four practical actions regardless of which platform you run today:

1. Update the Article 28 register of information to record the SAP+Dremio change of control, effective July 6.
2. Request a written deployment-parity statement for any non-managed-cloud deployment option, with a timeline.
3. Re-open the Article 30 exit clause before integration absorbs it. Contract novation to SAP entities is the window to negotiate transition-period length and concrete exit deliverables (catalog export, IAM bindings, audit history) – your negotiating position weakens once the re-papering is done.
4. Run a 90-day exit rehearsal against your current lakehouse, whoever the vendor is. The evidence is what the regulator asks for, not the architecture diagram.

[IOMETE](https://iomete.com/product/deployment) ships a [self-hosted, Kubernetes-native lakehouse](/blog/self-hosted-data-lakehouse-kubernetes) where audit logs, lineage, dataset state, and encryption keys remain in the operator's tenancy. The acquisition does not change that architectural distinction. It does increase the importance, for buyers, of testing contractual answers against runtime evidence. That test costs more to run than the contractual one. Operational sovereignty has a TCO and a staffing implication, and that cost is the price of having an answer when the regulator does.

"Sovereign data platform" as a phrase will get sloppier before it gets sharper. The sharpening will come from buyers asking better questions on the first call. Contracts allocate responsibility for obligations. They do not create the evidence the regulator asks for. That is the test.

<FAQSection faqs={[
  {
    question: "Did SAP's acquisition of Dremio actually close, and does that matter for DORA assessments today?",
    answerContent: (
      <>
        <p>Yes. SAP <a href="https://news.sap.com/2026/05/sap-to-acquire-dremio-unify-sap-and-non-sap-data-power-agentic-ai/">announced its agreement</a> to acquire Dremio on May 4, 2026 and <a href="https://news.sap.com/2026/07/sap-completes-dremio-acquisition/">completed the acquisition on July 6, 2026</a>.</p>
        <p>For DORA Article 28 register-of-information purposes, the change of control is now effective, not pending. It is a material change: update the register to reflect the new ownership and run the re-assessment under the <a href="https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng">Article 30 change-management workflow</a>. If you opened the register workflow at announcement, close it out with the completion date. If you did not, start it now.</p>
      </>
    )
  },
  {
    question: "Does an EU-headquartered vendor automatically satisfy DORA's third-party risk requirements?",
    answerContent: (
      <>
        <p>No. <a href="https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng">DORA Article 28's third-party risk strategy and the Article 30 contractual provisions</a> apply to every ICT third-party arrangement, regardless of the vendor's headquarters.</p>
        <p>The Critical ICT Third-Party Provider (CTPP) framework under DORA exists specifically because contractual oversight alone cannot manage concentration risk. The <a href="https://www.eba.europa.eu/publications-and-media/press-releases/european-supervisory-authorities-designate-critical-ict-third-party-providers-under-digital">first 19 CTPPs designated</a> in late 2025 include vendors of multiple nationalities, EU-headquartered SAP SE among them. Domicile is one input. It is not the test.</p>
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
    question: "What should current Dremio Enterprise self-hosted customers do now that the deal has closed?",
    answerContent: (
      <>
        <p>At announcement, Dremio and SAP publicly committed to <a href="https://news.sap.com/2026/05/sap-to-acquire-dremio-unify-sap-and-non-sap-data-power-agentic-ai/">Apache Iceberg, Polaris, and Arrow stewardship</a> and to the SAP Business Data Cloud integration path. The <a href="https://news.sap.com/2026/07/sap-completes-dremio-acquisition/">completion release</a> adds no roadmap detail beyond that.</p>
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
