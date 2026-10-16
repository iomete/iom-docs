---
title: "Hybrid Iceberg Lakehouse on Wasabi: Reference Architecture"
description: "Hybrid Iceberg lakehouse reference architecture: restricted data on on-prem storage, the rest on Wasabi, one catalog per data class, one set of access policies."
keywords: [hybrid lakehouse, apache iceberg, wasabi hot cloud storage, iceberg rest catalog, s3-compatible storage, egress fees, self-hosted lakehouse, data residency]
slug: hybrid-iceberg-lakehouse-wasabi
authors: abhishek
tags2: [Technical, Educational]
coverImage: img/blog/thumbnails/lake-3.png
date: 10/13/2026
hide_table_of_contents: false
last_update:
  date: 2026-10-13
---

import FAQSection from '@site/src/components/FAQSection';
import Img from '@site/src/components/Img';

If you run a lakehouse on your own hardware, storage is usually the first thing to fill up. Adding more means another hardware purchase, sized for years of growth. Moving the overflow to AWS or Azure is cheap to store, but you pay every time your on-premises engines read it back.

A hybrid Iceberg lakehouse sits between the two. You keep restricted data on storage you own and put the rest on flat-priced, S3-compatible cloud storage such as [Wasabi Hot Cloud Storage](https://wasabi.com), with one catalog and one set of access policies across both. This guide walks through how to split the data, who the setup suits and who it doesn't, and what to check before you put production tables on it.

{/* truncate */}

## Why Lakehouse Storage Gets Stuck Between CapEx and Egress

On-premises object storage is the right home for data that must never leave your data center. The problem is how it grows. Storage arrives in purchase cycles, and each cycle needs budget approval and lead time. You also buy more disk than your data takes up, because the storage system keeps extra copies or recovery data so it can survive a failed disk. A lakehouse also grows faster than the source data, because every Iceberg snapshot keeps old files around until maintenance removes them.

Hyperscaler object storage removes the purchase cycle but changes what you pay for. Storing a terabyte is cheap. Reading it from outside that cloud is not: [Amazon S3 list pricing](https://aws.amazon.com/s3/pricing/) charges for data transfer out to the internet, starting at $0.09 per GB in US East, plus a fee per thousand GET and LIST requests. If your Spark cluster runs on-premises and scans 100 TB a month from S3, transfer alone comes to close to $8,000 a month at list price, before request fees.

Lakehouse workloads make this worse than most. An Iceberg query reads metadata files, manifest lists, manifests and then Parquet data files, so a single dashboard refresh issues thousands of requests. Analysts rerun the same queries every day, and the bill follows the reads.

| | On-premises object storage | Hyperscaler object storage | Wasabi Hot Cloud Storage |
| --- | --- | --- | --- |
| Capacity cost model | Hardware purchase plus operations, paid up front | Per GB per month, varies by storage class | Flat per-TB per month, single storage class |
| Egress and API requests | No fees, limited by your network | Billed per GB out and per request | No egress or API request fees, subject to [fair use](https://wasabi.com/pricing/faq) |
| Where the bytes live | Your data center | Provider region | Wasabi region you choose |
| Latency to on-prem compute | LAN | WAN or private link | WAN or [Wasabi Direct Connect](https://wasabi.com/cloud-object-storage/tools/direct-connect) |
| Best for | Restricted data, hot tables scanned all day | Compute that runs in the same cloud | Large internal and confidential datasets read by compute outside a hyperscaler |

No column wins every row. Each one is a good fit for some data and a poor fit for the rest, which is why the architecture below uses two of them at once.

## What Does the Hybrid Iceberg Lakehouse Architecture Look Like?

<Img src="/img/blog/2026-10-13-hybrid-iceberg-lakehouse-wasabi/reference-architecture.png" alt="Hybrid Iceberg lakehouse reference architecture: IOMETE runs inside your perimeter, restricted catalogs write to on-premises object storage, and other catalogs write Iceberg tables to Wasabi Hot Cloud Storage" centered />

Users and tools sit on the left: data teams, BI tools, dbt and notebooks. They connect over SQL, JDBC/ODBC or Arrow Flight to a lakehouse platform that runs inside your perimeter, whether that is an on-premises data center, a private cloud or a colocation facility. Compute, the Iceberg catalog and the policy engine all live there.

Storage splits by catalog. Restricted catalogs write to on-premises object storage such as MinIO or Ceph, so those bytes never cross the perimeter. All other catalogs write over the S3 API, through HTTPS or a private link, to a Wasabi bucket in the region you pick.

Three properties make the design hold together:

- **Compute and policy stay inside your perimeter.** Every query, wherever its data lives, is planned and authorized by an engine you operate.
- **Placement is a catalog decision, not a per-query one.** A table's storage location follows from the catalog it was created in, so nobody chooses storage by accident.
- **Every table is open Apache Iceberg.** Parquet data files and Iceberg metadata sit in buckets you own, readable by any Iceberg engine. Moving a table between storage tiers later is a copy, not a format migration.

## How Do You Place Data by Class?

Think of a library with a locked reading room for rare manuscripts and an offsite stack for the general collection. Readers don't care where a book is shelved, because one catalog and one librarian decide who gets what. The lakehouse version uses one Iceberg catalog per data class, and each catalog has its own warehouse location.

Most organizations already have a data classification scheme. Map it directly:

| Data class | Example | Catalog | Storage |
| --- | --- | --- | --- |
| Restricted | Customer PII, payment data, regulated reporting inputs | `restricted` | On-premises object storage |
| Confidential | Pseudonymized transactions, risk model features | `confidential` | Wasabi, region matching your residency requirement |
| Internal | Product analytics, operational logs, finance aggregates | `internal` | Wasabi |
| Sandbox | Exploratory copies, dev and test data | `sandbox` | Wasabi |

Classes change rarely, while teams and projects change constantly. Tying catalogs to classes rather than to teams keeps the storage map stable when the organization chart moves.

### One Set of Policies Across Every Catalog

Placement only works if governance does not fork with it. Access policies, data masking and row-level filters are evaluated in the query engine, so a masked column on Wasabi is masked exactly like one on-premises, and a row filter tied to a user's region applies the same way in both. Storage location never appears in a policy.

A single engine session can also read both tiers, which is where hybrid placement pays off for analysts. They write ordinary Spark SQL across catalogs:

```sql
-- customers lives on-premises; events lives on Wasabi
SELECT c.segment, COUNT(*) AS sessions
FROM restricted.crm.customers c
JOIN internal.web.events e ON e.customer_id = c.customer_id
WHERE e.event_date >= DATE '2026-09-01'
GROUP BY c.segment;
```

Masking and row filters on `restricted.crm.customers` apply before the join, so the result contains only what the user may see.

### Watch the Write Path Between Classes

Cross-catalog reads are useful. Cross-catalog writes are how restricted data leaks onto cloud storage. A user who can read `restricted` and write to `internal` can run `CREATE TABLE internal.x AS SELECT * FROM restricted.y`, and the copy lands on Wasabi.

Keep write permission on cloud-backed catalogs separate from read permission on restricted ones, and review any role that holds both. Reclassifying a table works the same way: it is an explicit copy into the other catalog followed by a drop, done by someone allowed to do it.

## Who Is This Architecture For?

The pattern fits three starting points. They differ in where compute runs today, but end in the same place: compute and policy you control, storage placed by data class.

### Regulated On-Premises Estates

Banks, insurers, telcos and public-sector bodies running a lakehouse on their own hardware often hit the storage ceiling first. Restricted data has to stay on-premises, but most of the estate is internal or confidential data that only needs to stay in a particular region. Moving those catalogs to Wasabi in a chosen region frees on-premises capacity for the data that really needs it, without a new storage purchase. Our [on-premises lakehouse reference architecture for banks](/resources/blog/on-premises-lakehouse-reference-architecture-banks) covers the on-premises half in more depth.

### Teams Paying Egress on Snowflake or Databricks

Teams on Snowflake or Databricks with data in S3 or ADLS pay twice for heavy analytics: the SaaS compute bill and the hyperscaler storage and transfer bill. Running a self-hosted lakehouse in a colocation facility or any cloud, with Wasabi as primary storage, replaces both with costs you can forecast. Moving the data is a one-time copy into Wasabi-backed catalogs, which is also the last time you pay hyperscaler egress on it in bulk.

### Teams on Self-Managed Cloudera, Dremio or Starburst

Self-managed Cloudera, Dremio or Starburst clusters on-premises are common starting points for teams that are now out of storage capacity or consolidating platforms. Modernizing onto an Iceberg-native platform and extending storage to Wasabi solves both at once, and keeping tables in open Iceberg keeps the next move cheap. For Dremio specifically, our [Dremio migration guide](/resources/blog/dremio-sap-migration-guide) walks through moving tables, views and policies.

## Who Should Not Use It

Some workloads should stay entirely on storage you own. Classified data, air-gapped environments, central-bank-grade systems and anything under a strict domicile requirement belong on on-premises object storage, with no cloud tier.

Wasabi is a US-headquartered cloud provider. Choosing a European region gives you data residency, which controls where the bytes are stored, but not full sovereignty over who has legal reach to them. If your regulator or risk committee draws that line, keep the affected catalogs on-premises. The distinction is covered in [data residency vs data sovereignty](/resources/blog/data-residency-vs-data-sovereignty).

## Setting Up a Wasabi Catalog in IOMETE

[IOMETE](https://iomete.com) is a self-hosted data lakehouse platform built on Apache Iceberg and Apache Spark. It runs on-premises, in a private cloud, in any public cloud or fully air-gapped, and it ships a built-in Iceberg REST catalog, a SQL editor, Spark jobs and notebooks. Access policies, data masking and row-level filters are enforced inside the engine. IOMETE was named in the 2025 Gartner Market Guide for Data Lakehouse Platforms.

Adding a Wasabi-backed catalog takes four steps. You need IOMETE 3.19.1 or later, Admin Portal access and a running compute cluster, plus a Wasabi account. The full walkthrough with screenshots is the [IOMETE with Wasabi guide](https://docs.wasabi.com/docs/iomete-with-wasabi) in Wasabi's knowledge base.

### Step 1: Create the Bucket and a Scoped User in Wasabi

Create a bucket in the region you need, with versioning and Object Lock disabled. Then create a policy that grants only what Iceberg needs, and attach it to a user with an API access key:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket", "s3:GetBucketLocation", "s3:ListBucketMultipartUploads"],
      "Resource": "arn:aws:s3:::lakehouse-internal"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:AbortMultipartUpload", "s3:ListMultipartUploadParts"],
      "Resource": "arn:aws:s3:::lakehouse-internal/*"
    }
  ]
}
```

### Step 2: Create the Catalog in IOMETE

In the Admin Portal, go to **Data Governance → Spark Catalogs → New Spark catalog** and pick the **Iceberg REST Catalog** card under Managed Catalogs, not the external one. Set the warehouse to `s3://lakehouse-internal`, enable custom credentials, and set the endpoint to the Wasabi service URL for the bucket's region, for example `https://s3.eu-west-1.wasabisys.com`. Run **Test connection**: List, Write, Read and Delete must all pass before you click **Create**. The [Iceberg REST Catalog guide](/resources/user-guide/spark-catalogs/internal) describes each field.

### Step 3: Register the Catalog and Grant Access

Add the catalog to a domain under **Domains → Catalogs → Add Catalog**. Then create an [access policy](/resources/user-guide/data-security/access-policy) under **Data Governance → Data Security → Access**, scoped to the catalog, database, table or column. Add [data masking](/resources/user-guide/data-security/data-masking) and [row-level filters](/resources/user-guide/data-security/row-level-filter) the same way you would for an on-premises catalog.

### Step 4: Verify With a Write Cycle

Run a create, insert, update and delete, then check that each write produced a snapshot:

```sql
CREATE DATABASE wasabi_catalog.wasabi_test;

CREATE TABLE wasabi_catalog.wasabi_test.test_table (id INT, name STRING) USING iceberg;

INSERT INTO wasabi_catalog.wasabi_test.test_table VALUES (1, 'alpha'), (2, 'beta');
UPDATE wasabi_catalog.wasabi_test.test_table SET name = 'gamma' WHERE id = 2;
DELETE FROM wasabi_catalog.wasabi_test.test_table WHERE id = 1;

SELECT * FROM wasabi_catalog.wasabi_test.test_table;

SELECT committed_at, snapshot_id, operation
FROM wasabi_catalog.wasabi_test.test_table.snapshots
ORDER BY committed_at;
```

The snapshots query returns one row per write: an `append` for the insert and an `overwrite` or `delete` for the update and delete, depending on the table's write mode. In the bucket, each table appears as a folder with `data/` for Parquet files and `metadata/` for Iceberg metadata.

## What to Watch Before Going to Production

Each of these is easy to get right on day one and expensive to discover in month three.

### Endpoint Must Match the Bucket's Region

A Wasabi endpoint from the wrong region still serves reads, but rejects writes and deletes. A catalog configured this way looks healthy until the first insert fails. Use the service URL for the bucket's own region, and treat a failed Write or Delete in the connection test as a configuration error, not a permissions one.

### Keep Versioning and Object Lock Off on Table Buckets

Iceberg owns its file lifecycle: snapshot expiry and orphan-file cleanup permanently delete files that no snapshot references. With versioning on, those deletes only add delete markers, old versions keep accumulating, and storage never shrinks. Object Lock blocks the deletes outright. Keep both off on any bucket that holds live tables.

### Plan Maintenance Around Minimum Storage Duration

On pay-as-you-go, Wasabi bills a 90-day minimum storage duration, and objects deleted earlier are charged for the remainder as Timed Deleted Storage. Compaction and snapshot expiry delete files by design, so a schedule that rewrites the same large partitions every week pays for each rewritten file several times over. Compact once data settles, avoid repeatedly rewriting large partitions, and set snapshot retention with the 90 days in mind. Our [table maintenance overview](/resources/user-guide/table-maintenance/overview) covers the schedules IOMETE runs.

### Size Scan-Heavy Workloads Against Fair Use

Free egress is a fair-use guideline, not an unlimited allowance. Wasabi's [pricing FAQ](https://wasabi.com/pricing/faq) treats a use case as a good fit when monthly egress stays at or below the volume of active storage, and regular excess may lead Wasabi to limit service. A 100 TB catalog scanned in full three times a month would exceed that. Iceberg's partition pruning and column projection mean most queries read a fraction of each table, but estimate real read volume per catalog and keep tables that are scanned all day on-premises.

### Place Compute Close to the Region

Iceberg query planning reads several metadata files before the first data file, and each one is a round trip. Over a WAN, that latency adds up on small interactive queries.

Pick the Wasabi region nearest your compute; Wasabi runs [16 storage regions](https://wasabi.com/company/storage-regions), including Amsterdam, Frankfurt, London, Paris and Milan in Europe. For on-premises compute, [Wasabi Direct Connect](https://wasabi.com/cloud-object-storage/tools/direct-connect) offers private 1, 10 or 100 Gbps links. Benchmark your own dashboards before committing either way.

## Next Steps

Three things decide whether this architecture works for you. First, map your data classes to catalogs before you create any bucket, and decide who may write across them. Second, estimate monthly read volume per catalog, and keep anything scanned many times its own size each month on-premises. Third, run a pilot catalog on Wasabi and check the endpoint, versioning and maintenance settings above before moving production tables.

The canonical setup reference is the [IOMETE with Wasabi guide](https://docs.wasabi.com/docs/iomete-with-wasabi). For Wasabi's pricing model, see [Wasabi pricing](https://wasabi.com/pricing), and for how IOMETE runs inside your infrastructure, see the [deployment architecture](/resources/deployment/architecture-deployment). If you want help sizing a hybrid lakehouse, [talk to our team](https://iomete.com/contact-us).

## FAQ

<FAQSection faqs={[
  {
    question: "What is a hybrid Iceberg lakehouse?",
    answer: "A hybrid Iceberg lakehouse keeps Apache Iceberg tables on more than one storage system under a single catalog layer and policy engine. A common split keeps restricted data on on-premises object storage and puts internal and confidential data on S3-compatible cloud storage such as Wasabi, with compute and governance running inside your own perimeter."
  },
  {
    question: "Can one IOMETE lakehouse use both on-premises storage and Wasabi?",
    answer: "Yes. Each IOMETE catalog has its own warehouse location and credentials, so restricted catalogs can point at on-premises object storage while other catalogs point at Wasabi buckets. The same access policies, data masking and row-level filters apply to every catalog, and a single query can read from both."
  },
  {
    question: "Does Wasabi charge egress fees for lakehouse queries?",
    answer: "Wasabi does not charge egress or API request fees, subject to its fair-use policy. That policy treats a use case as a good fit when monthly egress is no more than the volume of active storage, so size scan-heavy workloads accordingly and keep the most heavily scanned tables close to compute."
  },
  {
    question: "Should Iceberg table buckets on Wasabi use versioning or Object Lock?",
    answer: "No. Iceberg maintenance has to permanently delete expired and orphaned files. Versioning turns those deletes into delete markers so storage keeps growing, and Object Lock blocks the deletes. Keep both disabled on buckets that hold live Iceberg tables."
  },
  {
    question: "Is Wasabi suitable for classified or strict-domicile data?",
    answer: "Wasabi region choice provides data residency, not full sovereignty, because Wasabi is a US-headquartered cloud provider. Classified, air-gapped or strict-domicile workloads should stay on on-premises object storage."
  }
]} />
