---
title: "On-premises lakehouse reference architecture for banks"
description: "An on-premises data lakehouse reference architecture for banks: Kubernetes topology, Iceberg storage layout, network zones, and the controls auditors ask about."
keywords: [on-premises data lakehouse, banking data architecture, apache iceberg banking, kubernetes data platform, data residency, DORA, self-hosted lakehouse]
slug: on-premises-lakehouse-reference-architecture-banks
authors: aytan
tags2: [Technical, Educational]
coverImage: img/blog/thumbnails/lightLake.png
date: 08/27/2026
hide_table_of_contents: false
last_update:
  date: 2026-08-27
---

Most banking data architecture diagrams die in the security review. Not because the design is wrong, but because nobody wrote down which network zone each component sits in, where the encryption keys live, and what happens when the storage cluster in the primary data center goes dark. The architecture that survives is the boring one – the one that answers those questions before anyone asks.

This is a reference architecture for running a data lakehouse on-premises in a bank. It is deliberately specific about topology, storage layout, and control points, because those are the parts that turn a diagram into something a risk committee will sign.

{/* truncate */}

import FAQSection from '@site/src/components/FAQSection';

## Why banks land on on-premises for the analytical layer

Three pressures push analytical workloads back inside the perimeter, and they compound.

**Residency is a hard boundary, not a preference.** Supervisory expectations across the EU treat the location of data and the jurisdiction of the entity processing it as separate questions. A dataset physically stored in-region, processed by an entity subject to foreign disclosure law, is still exposed – the distinction is covered in [data residency vs data sovereignty](/resources/blog/data-residency-vs-data-sovereignty).

**Exit plans have to be real.** [DORA](https://www.digital-operational-resilience-act.com/) requires financial entities to demonstrate that they can exit a critical ICT provider without an unacceptable disruption. That is very hard to evidence when table formats, catalog, and compute are all proprietary to one vendor.

**The cost curve inverts at steady state.** Elastic pricing wins for spiky, unpredictable workloads. Regulatory reporting is neither. A risk-data pipeline that runs the same shape of job every night, every quarter-end, for years, is the workload where owned capacity is cheapest.

## The four planes

Split the architecture into four planes before drawing a single box. Each has a different failure mode, a different owner, and a different audit question.

| Plane | What it holds | Primary control question |
| --- | --- | --- |
| Storage | Iceberg tables, Parquet files, metadata, manifests | Where do the bytes live, and who can read them at rest? |
| Compute | Spark executors, SQL endpoints, notebooks, jobs | Which identity ran which query, against which rows? |
| Control | Catalog, scheduler, policy engine, platform services | Who changed a policy, and when? |
| Access | JDBC, BI tools, APIs, notebooks | How does a request reach the engine, and through which zone? |

The split matters operationally. Losing the control plane for twenty minutes means new jobs cannot be scheduled while running jobs continue – survivable. Losing storage means everything stops. Sizing, replication, and recovery budgets should follow that asymmetry, not be spread evenly. The same boundary inside Kubernetes is walked through in [control plane vs data plane](/resources/blog/control-plane-vs-data-plane).

## Storage layer

Object storage is the foundation, and in an on-premises bank it is almost always an S3-compatible cluster – MinIO, Ceph, or a vendor appliance – rather than a filesystem.

Practical layout that holds up over time:

- **One bucket per trust zone**, not per team. Zones map to your existing data classification (public, internal, confidential, restricted). Teams change; classifications do not.
- **Iceberg as the table format across all zones.** Portability is the exit plan: an [Apache Iceberg](https://iceberg.apache.org/spec/) table plus its metadata can be read by any Iceberg-compatible engine, which is the concrete answer to "how would we leave".
- **Separate buckets for warehouse data and for job artifacts.** Mixing them makes lifecycle policies impossible to reason about.
- **Three replicas minimum in the primary site, asynchronous replication to the secondary.**

Storage choice is where most on-premises designs quietly go wrong – throughput and consistency behaviour differ enough between S3-compatible implementations to change query performance. The trade-offs are benchmarked in [evaluating S3-compatible storage for a lakehouse](/resources/blog/evaluating-s3-compatible-storage-for-lakehouse).

## Compute layer

Compute runs on Kubernetes, with each workload class in its own namespace and its own resource quota. Four classes cover most banking estates:

1. **Scheduled batch** – overnight risk, finance, and regulatory pipelines. Predictable, gets guaranteed capacity.
2. **Interactive SQL** – analysts and BI tools. Latency-sensitive, needs headroom rather than raw size.
3. **Notebooks and ML** – data scientists. Bursty, and the class most likely to need a hard quota.
4. **Platform maintenance** – compaction, snapshot expiry, orphan-file cleanup. Small, constant, and the one teams forget until query times double.

[Spark on Kubernetes](https://spark.apache.org/docs/latest/running-on-kubernetes.html) makes this split explicit: each class scales on its own axis, and a runaway notebook cannot starve the regulatory batch window.

## Network zones

The zone map is what the security review actually reads.

- **Restricted zone** – object storage, the catalog, and the key management system. No inbound traffic from user networks at all.
- **Processing zone** – Kubernetes worker nodes running Spark. Reaches storage; is not reachable from outside.
- **Access zone** – SQL endpoints and API gateways. The only zone user traffic terminates in.
- **Management zone** – observability, backup, and CI. Read-mostly, separately authenticated.

Encryption keys stay in the restricted zone, in the bank's own KMS or HSM. Any architecture where the platform vendor can reach the keys is a residency finding waiting to happen – a point worth reading alongside [the CLOUD Act reality check](/resources/blog/cloud-act-reality-check).

## Where the controls sit

Access control belongs in the query engine, not in the BI layer. If masking is applied by a semantic layer or a set of curated views, then a notebook, a batch job, or a JDBC client that goes straight to the table bypasses it. Enforcing policy inside the engine means every access path gets the same evaluation. The mechanics of that are covered in [runtime PII and PHI masking with row-level security](/resources/blog/runtime-pii-phi-masking-row-level-security).

Four control points to define explicitly:

- **Row-level filters** – tied to entity, book, or jurisdiction. Usually the hardest to get right, because the rules live in someone's head.
- **Column masking** – applied dynamically, based on the requesting identity's tags, so one table serves both masked and unmasked audiences.
- **Catalog-level grants** – who can create, alter, or drop, separated from who can read.
- **Immutable audit** – query text, identity, timestamp, and rows returned, written somewhere the platform team cannot edit.

## How IOMETE fits this shape

[IOMETE](https://iomete.com/product/data-platform/platform-overview) deploys entirely inside the bank's own Kubernetes clusters, which is what makes the zone map above enforceable: the compute, the catalog, and the encryption keys never leave the customer's infrastructure. Tables are Apache Iceberg on S3-compatible storage, so the exit path is the table format itself rather than an export process.

Row-level security and dynamic column masking are enforced in the Spark query engine, which is the reason a notebook and a JDBC session see the same policy result. [Deployment options](https://iomete.com/product/deployment) cover single-cluster, multi-data-center, and fully air-gapped topologies – the last of which is the shape most restricted banking environments end up in.

Operations are the part teams underestimate. Kubernetes expertise is not a prerequisite for running the platform; IOMETE's Field Data Engineers handle cluster operations, which is what makes "self-hosted" viable for a data team that does not want to become a platform team.

## What to decide before you build

- Which regulatory reports must run inside the perimeter, and which analytical workloads genuinely can sit elsewhere.
- Your recovery point and recovery time objectives per plane, not per system.
- Whether the secondary site is warm or cold, and who signs off the failover decision.
- Which team owns table maintenance – because compaction and snapshot expiry are not optional at scale, as [the hidden debt in lakehouse tables](/resources/blog/hidden-debt-in-lakehouse-tables) shows.

The architecture is not the hard part. The hard part is deciding these four things before the first cluster is provisioned.

## FAQ

<FAQSection faqs={[
  {
    question: "What is an on-premises data lakehouse?",
    answer: "An on-premises data lakehouse is a lakehouse architecture – open table formats over object storage with decoupled compute – deployed inside an organization's own data centers rather than a vendor's cloud. The data, the compute, and the encryption keys all stay within infrastructure the organization controls.",
    answerContent: (
      <>
        <p>An on-premises data lakehouse is a lakehouse architecture – open table formats over object storage with decoupled compute – deployed inside an organization's own data centers rather than a vendor's cloud.</p>
        <p>The data, compute, and encryption keys all remain within infrastructure the organization controls, which is what separates it from a managed service running in a chosen region. IOMETE deploys this way by default, running Apache Spark on the customer's own Kubernetes clusters against Apache Iceberg tables on S3-compatible storage.</p>
      </>
    )
  },
  {
    question: "Does a bank need Kubernetes expertise to run a self-hosted lakehouse?",
    answer: "No. Kubernetes is the deployment substrate, not something the data team has to operate day to day, provided the platform vendor takes on cluster operations.",
    answerContent: (
      <>
        <p>No. Kubernetes is the deployment substrate, not something a data team has to operate day to day.</p>
        <p>The distinction is who holds the operational burden: the infrastructure is self-hosted, but cluster operations can be handled by the platform provider. IOMETE's Field Data Engineers run that layer, so the bank's data team works with SQL, jobs, and notebooks rather than with cluster internals.</p>
      </>
    )
  },
  {
    question: "How does an on-premises lakehouse support a DORA exit strategy?",
    answer: "An exit strategy is demonstrable when the data stays in an open, portable format that another engine can read without a migration project. Apache Iceberg tables plus their metadata can be read by any Iceberg-compatible engine.",
    answerContent: (
      <>
        <p>An exit strategy is demonstrable when the data stays in an open, portable format that another engine can read without a migration project.</p>
        <p>Proprietary table formats make the exit test hard to evidence, because leaving means exporting and re-ingesting everything. IOMETE stores all tables as Apache Iceberg on the customer's own object storage, so the tables remain readable by any Iceberg-compatible engine independently of the platform.</p>
      </>
    )
  },
  {
    question: "Where should data masking be enforced in a banking lakehouse?",
    answer: "Masking should be enforced inside the query engine, so that every access path – SQL, notebooks, batch jobs, JDBC – is evaluated against the same policy. Masking applied only in a BI or semantic layer is bypassed by direct table access.",
    answerContent: (
      <>
        <p>Masking should be enforced inside the query engine, so every access path – SQL, notebooks, batch jobs, JDBC – is evaluated against the same policy.</p>
        <p>Controls that live in a BI tool or a set of curated views are bypassed the moment someone reads the underlying table directly. IOMETE applies row-level security and dynamic column masking inside the Spark query engine, which means the policy is evaluated before rows are returned regardless of the client.</p>
      </>
    )
  },
  {
    question: "What object storage works for an on-premises Iceberg lakehouse?",
    answer: "Any S3-compatible object storage that provides strong read-after-write consistency and sufficient parallel throughput for the query engine. Common on-premises choices are MinIO, Ceph, and hardware storage appliances.",
    answerContent: (
      <>
        <p>Any S3-compatible object storage with strong read-after-write consistency and enough parallel throughput for the query engine will work. Common on-premises choices are MinIO, Ceph, and storage appliances.</p>
        <p>Behaviour differs enough between implementations to change query performance, so the choice deserves a benchmark rather than a vendor datasheet. IOMETE runs against S3-compatible storage in the customer's own data center, with Iceberg metadata and Parquet data files stored in the same buckets the customer administers.</p>
      </>
    )
  },
  {
    question: "How many data centers does a resilient on-premises lakehouse need?",
    answer: "Two sites are the practical minimum for a bank: a primary that serves all workloads and a secondary that holds asynchronously replicated storage and can take over the critical batch window.",
    answerContent: (
      <>
        <p>Two sites are the practical minimum: a primary serving all workloads and a secondary holding asynchronously replicated storage that can take over the critical batch window.</p>
        <p>Recovery objectives should be set per plane rather than per system, because storage loss and control plane loss have very different blast radii. IOMETE supports multi-data-center and multi-Kubernetes-cluster deployment, so the secondary site can run the same platform against replicated Iceberg tables.</p>
      </>
    )
  }
]} />
