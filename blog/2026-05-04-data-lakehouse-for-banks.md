---
title: "Data lakehouse for banks: what regulated institutions actually need from their data platform"
description: "The architectural needs we hear most often during banking lakehouse assessments — and how a sovereign, Iceberg-based lakehouse maps to each one."
slug: "data-lakehouse-for-banks"
authors: "aytan"
tags2: [Educational, Company]
coverImage: "img/blog/thumbnails/3.png"
date: "05/04/2026"
hide_table_of_contents: false
---

import FAQSection from '@site/src/components/FAQSection';

Across central bank and financial institution conversations over the past year, the same set of problems keeps surfacing. They aren't exotic. They aren't new. They are structural — rooted in how legacy data warehouse stacks evolved at banks over the past 15 to 20 years, and they show up almost identically whether the institution is a national central bank in Central Asia or a commercial bank in Western Europe.

This piece walks through the needs we hear most often during banking lakehouse assessments. Then it maps each need to the architectural property that addresses it. The framing matters: features come and go, but architecture is durable. When a bank evaluates a lakehouse platform, the right question is not *"does this have feature X?"* — it is *"does the architecture make X possible without compromise?"*

One note on naming. We work with banks under varying NDA terms, and this piece refers to no specific institution. The patterns described below are synthesized across multiple engagements. Where a number is named, it represents a real observation — just not attributed.

<!-- truncate -->

## Where banks are starting from

A typical bank we engage with has been running an Oracle data warehouse for 12 to 20 years. The ETL layer is built on Oracle Data Integrator or a similar proprietary tool. There's often a Hadoop cluster on the side for data science, a constellation of reporting databases that grew organically, a SQL Server instance somewhere, a SAS estate the analytics team won't give up, and Excel-driven uploads from operational portals.

The data warehouse table count is the first metric that tells you something is wrong. We've seen single-instance DWHs reach 4,000+ tables, most of them derived. Each business reporting requirement, over time, generated its own staging table, its own intermediate aggregation, its own `final_v3_corrected` copy. Nobody decommissioned anything because nobody could prove it was safe to.

That accumulation is not a sign of bad engineering. It is the predictable outcome of running a single platform for 15 years without lineage tooling, without version-controlled transformations, and without a forcing function to consolidate. Every bank we've assessed has some version of this picture.

For broader context on how the industry got here, see our deeper write-up on [the evolution from data warehouses to lakehouses](https://iomete.com/resources/blog/from-data-warehouses-to-data-lakehouses).

## What banks need from a data lakehouse

The needs split into three layers: operational, regulatory, and strategic. We'll go through them in roughly the order they tend to come up during an assessment.

### 1. Stop ETL processes from writing to source systems

This one surprises engineers from outside banking. In many bank ETL environments, the ETL service account has DELETE and UPDATE permissions on source tables. Some processes use those permissions actively — to clean staging records, to mark rows as "processed," or as part of legacy CDC patterns built before proper change-data-capture tools existed.

The risk is obvious in retrospect. A misfiring transformation deletes rows from a transactional system. The audit trail in the source system gets contaminated with ETL activity. Reconciliation between source and warehouse becomes structurally impossible because the source has been mutated by the warehouse process. Banks need a clean separation: ingestion reads, never writes.

### 2. Make incremental load reliable without timestamp columns

Many bank source tables — especially those built before 2010 — don't have a `last_updated_at` column. The CDC patterns layered on top tend to be unreliable: log tables that drift, snapshot diffs that miss out-of-order updates, custom triggers that break during DDL changes.

Banks need either source-system schema work to introduce reliable change-tracking columns, or a CDC layer that doesn't depend on source schema at all. Neither is trivial. Both are necessary for high-value source domains where data correctness matters.

### 3. Trace what changed, when, and why

Data lineage is the single most common gap. When a regulator asks *"show me how this number in your TCFD disclosure was derived,"* and the answer is *"let me ask the developer who wrote that SQL eight years ago,"* the bank has a problem.

The need is column-level lineage that survives transformation logic changes, joins, and unions. SQL parsing-based tools approximate this. Iceberg snapshot history adds a temporal dimension. Together they get close to what regulators actually expect under DORA, NIS2, and the EU AI Act.

### 4. Decouple reporting from source-system developers

In banks where the ETL layer never fully matured — common in payment systems, where transactional throughput took priority over analytics — analysts produce reports by asking source-system developers to write queries against operational databases. The pattern works until it doesn't. It puts source systems under reporting load. It blocks analysts behind developer schedules. It creates inconsistent definitions of basic metrics like *"active customer."*

Banks need a self-service analytics layer that doesn't touch operational systems and that gives analysts a stable, modeled view of the data.

### 5. Replace proprietary ETL with version-controlled, open transformation logic

Proprietary ETL platforms work, but their transformation logic is locked inside vendor-specific objects, often visualized in a GUI but not version-controlled in any way the rest of the engineering organization recognizes. Hard-coded SQL accumulates inside scenarios. Dependencies are implicit. Testing is ad hoc. Code review is structurally impossible.

The need is for transformation logic that lives in Git, runs through a CI/CD pipeline, has documented dependencies, and can be tested before it touches production. dbt has become the de facto answer. Airflow handles orchestration. The combination is not novel — it is what every modern data team converges on after enough pain with proprietary alternatives.

### 6. Distinguish real-time, near real-time, and batch — without overspending

Every bank has business stakeholders asking for "real-time" reports. Most of those requests, when examined, are satisfied by 30-minute or hourly refresh cycles. True real-time — sub-second freshness with streaming infrastructure — costs significantly more in compute, monitoring, and operational expertise.

Banks need a clear SLA framework: which use cases truly require streaming CDC, which are well-served by near real-time micro-batching, and which can stay on overnight batch. Without that framework, banks either over-engineer everything or under-deliver on the cases where freshness genuinely matters.

### 7. Reduce table sprawl and rebuild around a clean data model

Going from 4,000 tables to a manageable model is not a refactoring project. It is an archaeology project. Banks need a target architecture that imposes structure: raw, cleaned, modeled, served. The Medallion pattern — Bronze, Silver, Gold — has become the default because it makes the contract between layers explicit and enforceable.

### 8. Sovereignty by architecture, not by contract clause

This is the need that has shifted most over the last 18 months. EU banks operating under DORA, banks in jurisdictions with explicit data residency mandates, central banks running monetary-policy-adjacent workloads — none of them can rely on a contractual clause that says *"your data stays in region X."* They need the platform to run inside their trust perimeter, on infrastructure they control, with no provider data plane, no shared metadata service, and no mandatory egress to a vendor-controlled control plane.

This is what we mean when we talk about sovereignty by architecture. The data sovereignty test isn't where the data sits — it's whose infrastructure makes the rules.

### 9. A compliance posture that survives audit

DORA Article 8 ICT risk management. NIS2 essential entity obligations. GDPR data subject rights at the row level. EU AI Act Article 10 data governance for training datasets. Each of these maps to specific technical capabilities at the data platform layer: documented data classification, audit logs that survive query workloads, time travel for historical reconstruction, governed data masking, and granular access controls.

Banks need a platform where these capabilities are inherent, not bolted on. We covered the specific control mappings in our [DORA and EU AI Act compliance checklist](https://iomete.com/resources/blog/dora-eu-ai-act-financial-institutions-data-infrastructure).

### 10. Predictable cost as data volume grows

Usage-based pricing on managed cloud lakehouse platforms can create budget unpredictability. A poorly written analyst query can cost thousands. A growing data volume scales costs faster than budget cycles. Banks operating under fixed annual IT budgets — which is most of them — need cost predictability that lets them plan three-year capacity expansions without surprises.

## How a sovereign lakehouse architecture addresses these needs

This is where the architecture-first principle pays off. Instead of mapping needs to features, we map them to architectural properties.

| Banking need | Architectural property that addresses it |
| :---- | :---- |
| Stop ETL writing to source | Read-only ingestion patterns; no platform component requires write access to source systems |
| Reliable incremental load | Apache Iceberg snapshot-based change tracking; merge-on-read ensures consistent CDC consumption regardless of source schema |
| Column-level lineage | Iceberg snapshot history combined with dbt's model-level lineage graph; together they give end-to-end traceability from source through to gold-layer reports |
| Decoupled analytics | Multi-cluster shared-data architecture: analyst workloads run on isolated compute clusters reading from the same Iceberg tables, without touching source systems |
| Version-controlled transformations | Native dbt and Airflow integration; transformation logic stored in Git, tested in CI, deployed via standard pipelines |
| Real-time, near real-time, batch SLA tiers | Spark Structured Streaming for streaming workloads; Spark batch for everything else; the same engine, different SLA tiers |
| Medallion model enforcement | Iceberg's namespace and schema controls combined with dbt project structure make Bronze/Silver/Gold separation explicit and enforceable |
| Sovereignty by architecture | Self-hosted, Kubernetes-native deployment; runs entirely inside the bank's trust perimeter on the bank's own infrastructure; no vendor-controlled data plane |
| Audit-grade compliance posture | Iceberg time travel for historical reconstruction; row-level security and column-level masking enforced at query time; access logs stay in the bank's network |
| Predictable cost | License model decoupled from data volume and query count; infrastructure costs scale with the bank's own hardware budget |

The mapping is deliberately not "feature X solves problem Y." It is structural. Apache Iceberg is an open table format, and that property — open, standardized, well-documented — is what makes lineage, time travel, snapshot history, and engine portability possible at the same time. You cannot get those properties from a proprietary table format, no matter how many features get added on top.

This is also why we lead with Iceberg in conversations with regulated banking customers. Open standards are not a marketing position — they are the substrate that makes compliance, sovereignty, and operational flexibility possible together.

For a deeper architectural breakdown of how the components fit, see our guide on [building a self-hosted data lakehouse on Kubernetes](https://iomete.com/resources/blog/self-hosted-data-lakehouse-kubernetes).

## What the migration usually looks like

The phased approach we recommend across banking engagements has six stages. We don't do all of them in one go, and we don't recommend big-bang cutover. Banks that try to migrate the whole estate in a single weekend tend to fail. Banks that run parallel and migrate by source domain tend to succeed.

**Phase 1 — Assessment.** Map the legacy DWH tables, classify by usage, identify the report-driving tables versus the abandoned scaffolding. This phase usually reveals that 30 to 50 percent of the table inventory is genuinely unused.

**Phase 2 — Bronze ingestion.** Stand up the lakehouse alongside the legacy DWH. Begin ingesting source data into the Bronze layer using read-only patterns. Validate against the existing system row by row.

**Phase 3 — Silver modeling.** Build the cleaned, conformed Silver layer for the highest-value source domains first. Most banks start with a single source group — payments, or core banking, or customer master.

**Phase 4 — Gold reporting.** Migrate the top 10 to 20 reports onto Gold-layer marts. Run parallel for one to two reporting cycles. Cut over once reconciliation passes.

**Phase 5 — Analyst onboarding.** Move analytical users from source-system queries onto the lakehouse. This is where the source-system load reduction shows up — and where the operational case for the migration becomes visible to the business.

**Phase 6 — Legacy decommission.** Phased shutdown of the legacy DWH and ETL stack. For a mid-sized bank, this typically takes 12 to 24 months from the start of Phase 4 to full decommission.

## Where this is heading

For European banks, [DORA](https://www.eiopa.europa.eu/digital-operational-resilience-act-dora_en) has shifted the timeline. The regulation has been in force since January 2025, and the enforcement posture has hardened through 2025 and into 2026. Banks that previously treated sovereignty as a "nice to have" now treat it as a contractual obligation passed through to their own ICT third-party providers.

For banks outside the EU — particularly in Central Asia, the Caucasus, the Middle East, and parts of Africa — the driver is different. National sovereignty mandates and central bank policy directives are pushing institutions away from US-cloud-hosted SaaS data platforms. The pattern repeats across regions: a national authority issues guidance, banks reassess their cloud commitments, and platforms that depend on a US-controlled control plane stop being viable options.

What banks need across both contexts is the same: a data platform that runs where they need it to run, on infrastructure they control, using open standards that don't lock them into a single vendor's roadmap.

That is the architecture worth building toward. The needs are clear. The solutions are not exotic — they are open, mature, and operating in production today.

If you're assessing a banking lakehouse migration and want to talk through your specific source-system landscape and compliance posture, [get in touch](https://iomete.com/contact-us).

## FAQ

<FAQSection faqs={[
  {
    question: "How many engineers does a self-hosted banking lakehouse actually require to operate?",
    answerContent: (
      <>
        <p>A typical banking deployment runs steady-state with 2 to 4 platform engineers familiar with Kubernetes, plus the existing data engineering team for transformation work.</p>
        <p>In IOMETE banking engagements, the platform team handles cluster operations, Iceberg maintenance jobs like compaction and metadata cleanup, and capacity planning. The data engineering team owns dbt models and Airflow DAGs using skills the bank already has. The operational effort is front-loaded — onboarding and Bronze ingestion are the heavy phases, after which day-to-day operations stabilize. For banks without in-house Kubernetes capacity, Field Data Engineer support during the migration phase is the common pattern.</p>
      </>
    )
  },
  {
    question: "What does data sovereignty actually mean for a central bank's data platform?",
    answerContent: (
      <>
        <p>It means the platform runs inside the bank's trust perimeter, on infrastructure the bank controls, with no vendor data plane mediating access to the data.</p>
        <p>The test is structural: if the platform vendor can be compelled by their home jurisdiction to produce or restrict access to data, sovereignty is contractual rather than architectural. Central banks running IOMETE on their own Kubernetes infrastructure remove this exposure structurally — there is no vendor-controlled control plane, no required egress to a hosted service, and no provider-managed metadata layer.</p>
      </>
    )
  },
  {
    question: "How does Apache Iceberg help with banking compliance?",
    answerContent: (
      <>
        <p>Iceberg provides snapshot history, time travel, and schema evolution as native table-format capabilities, all of which directly support regulatory audit requirements.</p>
        <p>In IOMETE production deployments, compliance teams use Iceberg time travel to reconstruct the exact state of any dataset at any historical point using standard SQL. Schema changes are documented automatically. For DORA Article 8 ICT risk management and EU AI Act Article 10 data governance, this means the audit trail is structural rather than bolted on after the fact.</p>
      </>
    )
  },
  {
    question: "Can a self-hosted lakehouse replace Oracle Data Integrator?",
    answerContent: (
      <>
        <p>Yes. The standard replacement pattern is dbt for transformation logic, Airflow for orchestration, and Spark for compute on top of an Iceberg-based lakehouse.</p>
        <p>The migration is rarely a one-to-one mapping. Legacy ODI scenarios contain accumulated business logic that should be re-modeled rather than copied. Banks running IOMETE typically find the dbt rebuild produces 30 to 50 percent fewer tables, with explicit dependencies, version-controlled code, and automated tests — none of which the legacy stack supported.</p>
      </>
    )
  },
  {
    question: "How do banks implement Medallion architecture in regulated environments?",
    answerContent: (
      <>
        <p>Banks separate raw ingestion (Bronze), cleaned and conformed data (Silver), and analytics-ready marts (Gold) into distinct namespaces with enforced access boundaries between layers.</p>
        <p>This pattern imposes a clear contract: raw data is preserved for audit, business logic lives in Silver, and reporting consumes only Gold. In IOMETE deployments, the separation is enforced through Iceberg namespace controls combined with dbt project structure — making lineage, testing, and governance enforceable in ways flat DWH architectures cannot achieve.</p>
      </>
    )
  },
  {
    question: "Can a self-hosted lakehouse really handle the same scale as managed cloud platforms?",
    answerContent: (
      <>
        <p>Yes. Modern self-hosted lakehouses run on the same engines — Spark and Iceberg — that power managed cloud platforms; the architecture, not the deployment model, determines scale.</p>
        <p>In IOMETE banking deployments, multi-cluster shared-data architecture lets analyst workloads, batch jobs, and streaming pipelines run on isolated compute clusters that all read from the same Iceberg tables. The bank controls the underlying hardware budget, but the engines scale horizontally the same way they do in any cloud-native deployment. Petabyte-scale central bank workloads run on this pattern in production.</p>
      </>
    )
  },
  {
    question: "How does a sovereign lakehouse handle DORA Article 28 ICT third-party risk requirements?",
    answerContent: (
      <>
        <p>DORA Article 28 requires financial entities to maintain control over critical ICT third-party providers, including the ability to exit, audit, and substitute providers without operational disruption.</p>
        <p>Sovereign lakehouse architecture addresses this structurally. Banks running IOMETE inside their own Kubernetes infrastructure store data in open formats — Apache Iceberg and Parquet — that any compliant query engine can read. There is no vendor-controlled metadata service, no required egress to a hosted control plane, and no proprietary table format. Provider substitution becomes a compute-layer change, not a data migration.</p>
      </>
    )
  },
  {
    question: "How long does a banking lakehouse migration typically take?",
    answerContent: (
      <>
        <p>18 to 36 months from assessment through legacy DWH decommission for a mid-sized institution.</p>
        <p>In IOMETE banking engagements, the first production workloads usually go live within 4 to 6 months. The longer end-to-end timeline reflects the parallel-run period for high-stakes reports, the source-system schema work to support reliable incremental load, and the analyst onboarding cycle. Big-bang migrations rarely succeed; phased migration by source domain is the standard pattern.</p>
      </>
    )
  },
]} />
