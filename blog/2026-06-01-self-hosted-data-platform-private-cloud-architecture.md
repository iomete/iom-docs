---
title: "Self-Hosted Data Platform on Private Cloud: Architecture"
description: "How a self-hosted data platform runs on private cloud: Kubernetes-native deployment, Apache Iceberg storage, open engines, and no vendor data plane."
slug: self-hosted-data-platform-private-cloud-architecture
tags2: [Technical, Company]
authors: [aytan]
hide_table_of_contents: false
coverImage: img/blog/thumbnails/2.png
last_update:
  date: 2026-06-06
---

import FAQSection from '@site/src/components/FAQSection';

A self-hosted data platform looks simple on a slide – your hardware, your data, your rules. The interesting part is the architecture underneath, because that is what decides whether "self-hosted" means a genuinely portable system you operate or a vendor appliance you happen to host. The two are very different when a regulator asks where the encryption keys live, or when you want to move a workload from on-premises to a sovereign cloud without re-platforming.

This post walks through how a self-hosted data platform is actually built to run on a private cloud: the deployment model, the storage layer, the compute engines, and the security boundary. It is the infrastructure companion to the [sovereign data platform pillar](/resources/blog/sovereign-data-platform-private-cloud-ai) and the [sovereign AI and ML post](/resources/blog/sovereign-ai-ml-private-cloud-lakehouse).

{/* truncate */}

## What "self-hosted" has to mean architecturally

A self-hosted data platform is software that runs entirely inside the customer's own infrastructure, with no control plane or data plane operated by the vendor. The customer deploys it, scales it, secures it, and can run it disconnected from the internet.

That last clause is the real test. Plenty of platforms describe themselves as self-hosted while still phoning home to a vendor-operated control plane for orchestration, metadata, or licensing. The moment any part of your data or operational telemetry has to traverse the vendor's environment, the platform is hosted-with-extra-steps, not self-hosted. A genuine self-hosted architecture has four properties: it deploys on infrastructure you own, it stores data in open formats, it runs open engines, and it can operate air-gapped.

## Kubernetes as the deployment substrate

Private cloud is not one thing. It is bare-metal in your own data center, OpenStack or VMware, a regional sovereign cloud, or a hyperscaler region carved off for residency reasons. A self-hosted platform needs a deployment substrate that abstracts all of those without a rewrite per environment. That substrate is [Kubernetes](https://kubernetes.io/).

Running the platform as Kubernetes-native components – rather than a fixed appliance – is what gives it portability across those targets. The same packaging deploys on a private Kubernetes cluster on-premises, on a managed Kubernetes service in a sovereign cloud, or on an air-gapped cluster with no outbound connectivity. Compute and storage are decoupled, so you scale query and ML compute independently of the data footprint, and you can run multiple isolated tenants on shared infrastructure. The patterns here are worth understanding on their own; [Kubernetes-native data engineering architecture](/resources/blog/kubernetes-native-data-engineering-architecture) covers them in depth.

There is an operational objection worth naming: not every data team wants to become a Kubernetes shop. The answer is "Kubernetes by choice, not by capability" – the orchestration is there for the teams that want full control, and field engineers handle it for the teams that do not. The architecture does not force every customer to staff a platform team.

## The storage layer: open formats, no lock-in

Underneath the compute, the storage layer is where lock-in is won or lost. A self-hosted platform that stores data in a proprietary format is only portable until you try to leave. Open table formats remove that trap.

The platform stores data as [Apache Iceberg](https://iceberg.apache.org/) tables on S3-compatible object storage, with Parquet underneath. Iceberg brings ACID transactions, schema evolution, time travel, and hidden partitioning to data sitting in plain object storage – the warehouse-grade guarantees without a warehouse's proprietary engine. Metadata runs through an Iceberg REST catalog rather than a closed metastore. The practical consequence: migration off the platform is symmetric with migration on, because the tables are readable by any Iceberg-compatible engine. If you want the format-level reasoning, [why Apache Iceberg is winning the table format](/resources/blog/why-apache-iceberg-is-winning-table-format) lays it out, and running [Iceberg on-premises](/resources/blog/iceberg-onprem) has its own operational considerations.

This is the difference between owning your data and renting access to it. With open formats on storage you control, walking away from the vendor does not mean walking away from years of data.

## The compute engines

One storage layer, many workloads. A self-hosted lakehouse runs [Apache Spark](https://spark.apache.org/) for distributed ETL, ML feature pipelines, and batch analytics, alongside a SQL engine for interactive querying and BI, plus streaming ingestion – all against the same Iceberg tables. Query federation extends the SQL surface across systems whose data cannot move: Oracle, SQL Server, Postgres, Kafka, and object storage queried where they sit, without a copy.

The architectural payoff is consolidation. An enterprise running a warehouse for BI, a separate lake for ML, a streaming stack for real-time, and a notebook environment for data science can collapse all four into one lakehouse on shared infrastructure. Fewer copies, one governance model, one place to secure.

## The security boundary

In a self-hosted architecture, the entire platform sits inside a customer-controlled boundary, and nothing crosses it to a vendor. That changes what security and compliance look like:

- Network policies, encryption at rest and in transit, identity providers (SSO, LDAP), and audit pipelines are configured to your standards, not pinned to a vendor's defaults.
- Access control is fine-grained – row-level, column-level, dynamic masking, and tag-based policies – enforced in the query path. The mechanics are in [column-level data masking at scale](/resources/blog/column-level-data-masking-scale).
- Compliance alignment (SOC 2, HIPAA, GDPR) becomes structural, because you can demonstrate custody of keys, compute, and logs rather than pointing at a contract.

For regulated workloads, that demonstrable custody is frequently the whole point. A contractual guarantee that a vendor will not look at your data is a different thing from an architecture where they cannot.

## How IOMETE implements this

[IOMETE](https://iomete.com/product/deployment) is a self-hosted data platform built on exactly this stack: Kubernetes-native deployment, Apache Iceberg tables on S3-compatible object storage, Apache Spark and a SQL engine for compute, an Iceberg REST catalog for metadata, and fine-grained security enforced in the query path. It runs on-premises, in private or sovereign clouds, hybrid, or fully air-gapped, with no IOMETE-operated data plane. Field Data Engineers handle Kubernetes operations for teams that prefer not to run it themselves.

The scale evidence is in production. Dell Technologies runs a global data lake on this architecture – 70,000 vCPUs across 20+ PB, spanning 4 data centers and 14 production clusters, multi-tenant and multi-region, for over two years – and national government, central-banking, and payments platforms run the same stack in sovereign and air-gapped environments. IOMETE was named in the 2025 Gartner® Market Guide for Data Lakehouse Platforms.

To zoom back out to the strategy, the [sovereign data platform pillar](/resources/blog/sovereign-data-platform-private-cloud-ai) ties the architecture to the business case; for the ML angle, see [sovereign AI on a private-cloud lakehouse](/resources/blog/sovereign-ai-ml-private-cloud-lakehouse).

## FAQ

<FAQSection faqs={[
  {
    question: "What is a self-hosted data platform?",
    answerContent: (
      <>
        <p>A self-hosted data platform is software that runs entirely inside the customer's own infrastructure, with no control plane or data plane operated by the vendor.</p>
        <p>The customer deploys, scales, and secures it, and a genuine self-hosted platform can run air-gapped with no outbound connectivity – the test that separates self-hosted from hosted-with-extra-steps. IOMETE is built this way: Kubernetes-native components inside your own account, with no IOMETE-operated data plane in the path.</p>
      </>
    )
  },
  {
    question: "Why is Kubernetes used for self-hosted data platforms?",
    answerContent: (
      <>
        <p>Kubernetes abstracts away the differences between bare-metal, OpenStack, VMware, sovereign clouds, and hyperscaler regions, so the same platform deploys across all of them without a rewrite.</p>
        <p>It also decouples compute from storage, enabling independent scaling and multi-tenant isolation on shared infrastructure, which is why IOMETE deploys as Kubernetes-native components across bare-metal, sovereign clouds, and air-gapped clusters from the same packaging.</p>
      </>
    )
  },
  {
    question: "Does a self-hosted data platform require a Kubernetes team?",
    answerContent: (
      <>
        <p>Not necessarily. The orchestration is available for teams that want full control, while field engineers can handle Kubernetes operations for teams that do not.</p>
        <p>IOMETE describes this as "Kubernetes by choice, not by capability" – the architecture does not force every customer to staff a dedicated platform team.</p>
      </>
    )
  },
  {
    question: "How does a self-hosted lakehouse avoid vendor lock-in?",
    answerContent: (
      <>
        <p>By storing data in open Apache Iceberg tables and Parquet files on object storage you control, queried through an open metadata catalog and open engines.</p>
        <p>IOMETE stores everything as open Iceberg tables and Parquet on object storage you control, and because those tables are readable by any Iceberg-compatible engine, migrating off the platform is symmetric with migrating on – there is no proprietary format holding the data hostage.</p>
      </>
    )
  },
  {
    question: "Can a self-hosted data platform run fully air-gapped?",
    answerContent: (
      <>
        <p>Yes. A correctly designed self-hosted platform runs in clusters with no outbound internet connectivity, because no part of its operation depends on a vendor-operated control plane.</p>
        <p>Air-gapped support is a hard requirement for many defense, government, and financial deployments, and it is only possible when orchestration, metadata, and licensing all run locally – which is how IOMETE is built to deploy.</p>
      </>
    )
  },
  {
    question: "What storage does a self-hosted lakehouse use?",
    answerContent: (
      <>
        <p>S3-compatible object storage holding data as Apache Iceberg tables with Parquet files underneath, managed through an Iceberg REST catalog.</p>
        <p>On IOMETE this gives ACID transactions, schema evolution, and time travel on commodity object storage, without depending on a proprietary warehouse engine.</p>
      </>
    )
  },
  {
    question: "How does a self-hosted platform handle data that cannot be moved?",
    answerContent: (
      <>
        <p>Through query federation: one SQL surface queries external systems – Oracle, SQL Server, Postgres, Kafka, object storage – where the data already sits, without copying it.</p>
        <p>This lets you bring siloed and non-movable data into one queryable layer while respecting residency and ownership constraints on the source systems. IOMETE's query federation reaches Oracle, SQL Server, Postgres, Kafka, and object storage where the data already sits.</p>
      </>
    )
  },
  {
    question: "Is a self-hosted data platform compliant with GDPR, HIPAA, and SOC 2?",
    answerContent: (
      <>
        <p>Self-hosting makes compliance structural: you can demonstrate custody of encryption keys, compute, and audit logs rather than relying on a vendor's contractual assurances.</p>
        <p>IOMETE is SOC 2 Type II, HIPAA, and GDPR aligned, with fine-grained access control and masking enforced in the query path and support for air-gapped deployment.</p>
      </>
    )
  }
]} />
