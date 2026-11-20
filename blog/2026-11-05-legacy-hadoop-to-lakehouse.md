---
title: "Migrate Legacy Hadoop to Iceberg and Spark on Kubernetes"
title_meta: "Migrate Legacy Hadoop to Iceberg and Spark on Kubernetes"
description: "A practical path from legacy Hadoop to an Apache Iceberg lakehouse on Kubernetes, on-premises or air-gapped. Book a migration demo."
slug: legacy-hadoop-to-lakehouse
authors: aytan
hide_table_of_contents: false
tags2: [Educational, Company]
coverImage: img/blog/thumbnails/1.png
date: "11/05/2026"
last_update:
  date: 2026-11-05
---

import DemoCta from '@site/src/components/DemoCta';
import FAQSection from '@site/src/components/FAQSection';

**Short answer:** Most legacy Hadoop modernizations follow the same path:

1. Move data from HDFS to S3-compatible object storage.
2. Convert Hive tables to Apache Iceberg.
3. Run Spark and SQL workloads on Kubernetes.
4. Re-create access policies.
5. Cut over one domain at a time.

IOMETE is a ready-made lakehouse for the target state: one Spark engine, one security model, Iceberg tables, catalog and table maintenance, installed on your own Kubernetes, on-premises or air-gapped.

<DemoCta variant="B" refId="blog-hadoop-migration" position="top" primaryLabel="Book a migration demo" />

{/* truncate */}

## Why Teams Are Planning a Legacy Hadoop Exit

- **License and hardware cost** that keeps rising, while the platform itself changes slowly.
- **Slow, risky upgrades.** Major version moves become multi-month projects, so clusters fall behind.
- **VM-era operations.** Clusters are managed node by node, separately from the Kubernetes platforms the rest of IT now runs.
- **Many engines, many policy sets.** Hive, Impala, Spark and others each need their own tuning and access configuration.
- **Features built by hand.** Ingestion, table maintenance and self-service often end up as in-house scripts.
- **Data residency still matters.** Most of these estates are on-premises for good reasons, and the replacement has to be too.

## What the Target Looks Like

| Layer | Target on IOMETE |
|---|---|
| Storage | S3-compatible object storage you own: Ceph, MinIO, Dell ECS, Pure, NetApp StorageGRID, or a cloud object store |
| Table format | Apache Iceberg: ACID transactions, schema and partition evolution, time travel |
| Catalog | Iceberg REST catalog |
| Compute | Apache Spark on Kubernetes for SQL, batch ETL, streaming and notebooks, with autoscaling compute clusters |
| Security | Built-in data security policies enforced on every query: table/column access, row filters, masking, tag-based policies, audit; LDAP/AD and SSO |
| Operations | Helm or the Red Hat OpenShift Certified Operator; automated Iceberg table maintenance; logs to your ELK/Loki stack |
| Orchestration and BI | Apache Airflow; dbt; BI tools via JDBC/ODBC |

A short way to put it: **a Hadoop distribution gives you components to assemble into a lakehouse; IOMETE gives you the lakehouse already assembled.** (This describes architecture generations, not any vendor's current product.)

## The Migration Path

1. **Inventory the estate.** List:
   - databases and tables (format, partitioning, size)
   - HDFS paths
   - Spark, Hive and Impala jobs
   - schedules (e.g. Oozie)
   - Ranger policies
   - Kerberos/LDAP integration
   - BI connections
2. **Stand up the target in parallel** on your Kubernetes: OpenShift, Rancher or another distribution. Connect object storage and LDAP/SSO ([on-prem install docs](/deployment/on-prem/install)).
3. **Move the data.** Copy HDFS data to object storage, for example with `distcp` or Spark copy jobs. Start with one domain.
4. **Convert to Iceberg in IOMETE's REST catalog.** First register the object-storage copies as staging tables, partition locations included, and leave the live Hive definitions alone. Then create each target Iceberg table in IOMETE's Iceberg REST catalog and bring the data in with Iceberg's Spark procedures ([IOMETE reference](/reference/iceberg-tables/iceberg-procedures), [Apache docs](https://iceberg.apache.org/docs/latest/spark-procedures/)):
   - `snapshot` to test against a staging table without changing it
   - `add_files` to register a staging table's Parquet/ORC files in the new Iceberg table, without rewriting them
   - `CREATE TABLE ... AS SELECT` to rewrite the data into the new table instead

   Don't use `migrate` for the final conversion. It replaces the table in place, so the result stays in the Hive Metastore (`spark_catalog`) instead of the REST catalog, and IOMETE's automated table maintenance only covers IOMETE-managed REST catalogs. Always work from the object-storage copies, not HDFS. Otherwise Iceberg keeps pointing at HDFS, and the table breaks when you decommission it.

   File registration suits non-transactional Parquet and ORC tables. Full-ACID Hive tables keep their state in delta and delete-delta files, so rewrite them with `CREATE TABLE ... AS SELECT`.
5. **Port workloads.** Spark jobs mostly need configuration changes. Review Hive/Impala SQL against Spark SQL. Move schedules to [Airflow](/integrations/airflow/getting-started).
6. **Re-tune for object storage.** Jobs tuned for years on HDFS data locality can behave differently on object storage. Budget time to re-check file sizes, partitioning and parallelism for the heaviest jobs.
7. **Re-create access policies** as IOMETE data security policies. Map each table-level Ranger policy (table and column access, row filters, masking, tags) to its IOMETE equivalent as part of each domain move, and use tags to apply PII masking consistently. HDFS path policies don't carry over, so plan object-storage access separately.
8. **Validate and cut over** one domain at a time: compare counts, checksums and report outputs, then re-point BI and decommission.

**At scale:** a global technology manufacturer consolidated five legacy analytics platforms onto one IOMETE lakehouse. It runs on 100,000+ vCPUs across four of its own data centers. [See the proof points](/blog/sovereign-lakehouse-proof-at-scale).

## Who Typically Makes This Move

- **Banks and central banks** modernizing regulatory reporting and risk data while staying on-premises.
- **Telcos** replacing Hadoop plus MPP warehouses for very high-volume event data.
- **Government agencies** consolidating departmental clusters into one shared, governed platform.
- **Media and research organizations** with long-running Hadoop clusters and growing interactive query needs.

<FAQSection faqs={[
  {
    question: "Can I convert Hive tables to Iceberg without rewriting the data?",
    answer: "For non-transactional Parquet and ORC tables, yes. Once the copies sit in object storage and are registered as staging tables, Iceberg's add_files procedure registers their files in an Iceberg table you create in IOMETE's REST catalog, without rewriting them. Full-ACID Hive tables keep transactional state in delta files, so rewrite them with a query instead."
  },
  {
    question: "Do we have to leave on-premises?",
    answer: "No. IOMETE runs on Kubernetes in your own data center, in a private cloud, or fully air-gapped."
  },
  {
    question: "What replaces HDFS?",
    answer: "S3-compatible object storage. That can be on-prem systems such as Ceph, MinIO or Dell ECS, or a cloud object store."
  },
  {
    question: "Does it run on OpenShift?",
    answer: "Yes. The IOMETE Operator is Red Hat OpenShift Certified. IOMETE also runs on other Kubernetes distributions, such as Rancher."
  },
  {
    question: "What happens to our Ranger policies?",
    answer: "You re-create them as IOMETE data security policies. Table-level Ranger policies (table and column access, row filters, masking and tags) map to IOMETE equivalents during the domain move. HDFS path policies have no IOMETE equivalent, so plan object-storage access separately."
  }
]} />

## Plan Your Migration

<DemoCta variant="B" refId="blog-hadoop-migration" position="bottom" primaryLabel="Book a migration demo" />

**Related:**

- [Cloudera alternatives in 2026](/blog/cloudera-alternatives)
- [S3-compatible storage for a lakehouse](/blog/evaluating-s3-compatible-storage-for-lakehouse)
- [Runtime PII and PHI masking with row-level security](/blog/runtime-pii-phi-masking-row-level-security)

*Red Hat and OpenShift are trademarks of Red Hat, Inc. Apache®, Apache Hadoop®, Apache Hive™, Apache Impala™, Apache Spark™, Apache Iceberg™, Apache Ranger™ and Apache Airflow™ are trademarks of the Apache Software Foundation. Names are used only to identify products.*

## Sources

- [Apache Iceberg Spark procedures](https://iceberg.apache.org/docs/latest/spark-procedures/).
- [Iceberg Spark procedures](/reference/iceberg-tables/iceberg-procedures), IOMETE reference.
- [IOMETE deployment options](https://iomete.com/product/deployment), accessed 5 November 2026.
- [IOMETE capability summary](https://iomete.com/llms.txt), accessed 5 November 2026.
- [IOMETE Operator in Red Hat's certified-operators repository](https://github.com/redhat-openshift-ecosystem/certified-operators/tree/main/operators/iomete-operator). Certification announced 20 May 2026.
- [Proof at scale: the sovereign lakehouse in production](/blog/sovereign-lakehouse-proof-at-scale), IOMETE blog.
 
