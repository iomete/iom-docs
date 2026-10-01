---
title: "Lakehouse Platform vs Federated Query Engine: Which to Use"
title_meta: "Lakehouse Platform vs Federated Query Engine: Which to Use"
description: "When to build a Spark + Iceberg lakehouse, when to federate queries across sources with an engine like Trino, and how to combine both. Book a demo."
slug: lakehouse-vs-federated-query
authors: aytan
hide_table_of_contents: false
tags2: [Educational, Company]
coverImage: img/blog/thumbnails/1.png
last_update:
  date: 2026-10-01
---

import DemoCta from '@site/src/components/DemoCta';
import FAQSection from '@site/src/components/FAQSection';

**Short answer:**

- A **federated query engine** (for example, the open-source Trino project) queries data where it already lives, across many systems.
- A **lakehouse platform** such as IOMETE ingests, transforms and stores data as open Apache Iceberg tables, then serves SQL, ETL, streaming and notebooks from one governed place.

Many enterprises need a lakehouse; some add federation on top.

<DemoCta variant="B" refId="blog-lakehouse-vs-federation" position="top" />

{/* truncate */}

## When federation is the right tool

- Many operational databases and warehouses need ad-hoc joins across them, before any pipelines exist.
- Data must stay in its source systems for ownership or licensing reasons.
- Workloads are mostly interactive SQL.

## When you need a lakehouse platform

- You need **pipelines**: batch ETL, CDC and streaming ingestion, data-quality jobs.
- You want **one curated copy** in an open format (Apache Iceberg) with ACID transactions, time travel and schema evolution.
- You want **Python, Scala and notebooks** next to SQL, under the same access policies.
- BI users shouldn't **hammer operational databases**. Federate to explore, then persist curated Iceberg tables for dashboards.
- You must run **inside your own perimeter**: on-premises, private cloud or air-gapped.

## How IOMETE fits

IOMETE is a self-hosted lakehouse on Kubernetes:

- Apache Spark for SQL endpoints (JDBC/ODBC), jobs, streaming and notebooks
- Apache Iceberg tables in your object storage
- Ranger-based row/column/tag policies enforced in the engine
- Query federation to JDBC databases and files when you need to join live sources

## Using both

Iceberg is an open format, so Iceberg-compatible engines, including Trino, can read the tables IOMETE writes through a shared catalog. [TODO: engineering to confirm the recommended catalog configuration and link the doc.]

<FAQSection faqs={[
  {
    question: "Is a federated query engine a lakehouse?",
    answer: "Not by itself. It queries data in place. A lakehouse also stores and manages data in an open table format and runs the pipelines that produce it."
  },
  {
    question: "Can a lakehouse also federate?",
    answer: "Yes. IOMETE can query JDBC databases and files alongside Iceberg tables."
  },
  {
    question: "Can Trino read IOMETE tables?",
    answer: "IOMETE stores data as Apache Iceberg tables, which Iceberg-compatible engines such as Trino can read via a compatible catalog."
  }
]} />

## Next step

<DemoCta variant="B" refId="blog-lakehouse-vs-federation" position="bottom" />

*Trino is a trademark of The Linux Foundation. Apache®, Apache Spark™, Apache Iceberg™ and Apache Ranger™ are trademarks of the Apache Software Foundation.*
