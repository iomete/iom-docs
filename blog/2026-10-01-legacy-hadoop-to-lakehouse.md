---
title: "Migrate Legacy Hadoop to Iceberg and Spark on Kubernetes"
title_meta: "Migrate Legacy Hadoop to Iceberg and Spark on Kubernetes"
description: "A practical path from legacy Hadoop to an Apache Iceberg lakehouse on Kubernetes, on-premises or air-gapped. Book a migration demo."
slug: legacy-hadoop-to-lakehouse
authors: aytan
hide_table_of_contents: false
tags2: [Educational, Company]
coverImage: img/blog/thumbnails/1.png
last_update:
  date: 2026-10-01
---

import DemoCta from '@site/src/components/DemoCta';
import FAQSection from '@site/src/components/FAQSection';
import JsonLd from '@site/src/components/JsonLd';

<JsonLd data={{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Migrate a legacy Hadoop estate to an Apache Iceberg lakehouse on Kubernetes",
  "step": [
    {"@type": "HowToStep", "name": "Inventory the estate", "text": "List databases and tables, HDFS paths, Spark, Hive and Impala jobs, schedules, Ranger policies, Kerberos/LDAP integration and BI connections."},
    {"@type": "HowToStep", "name": "Stand up the target in parallel", "text": "Install IOMETE on your Kubernetes or OpenShift cluster and connect object storage and LDAP/SSO."},
    {"@type": "HowToStep", "name": "Move the data", "text": "Copy HDFS data to S3-compatible object storage, starting with one domain."},
    {"@type": "HowToStep", "name": "Convert to Iceberg", "text": "Use Apache Iceberg Spark procedures: snapshot to test, migrate to convert in place, add_files to register existing files."},
    {"@type": "HowToStep", "name": "Port workloads", "text": "Update Spark job configuration, review Hive and Impala SQL against Spark SQL, and move schedules to Airflow."},
    {"@type": "HowToStep", "name": "Re-tune for object storage", "text": "Re-check file sizes, partitioning and parallelism for the heaviest jobs."},
    {"@type": "HowToStep", "name": "Re-create access policies", "text": "Map Ranger policies to IOMETE domains and use tags for consistent masking."},
    {"@type": "HowToStep", "name": "Validate and cut over", "text": "Compare counts, checksums and report outputs per domain, re-point BI, then decommission."}
  ]
}} />

**Short answer:** Most legacy Hadoop modernisations follow the same path:

1. Move data from HDFS to S3-compatible object storage.
2. Convert Hive tables to Apache Iceberg.
3. Run Spark and SQL workloads on Kubernetes.
4. Re-create access policies.
5. Cut over one domain at a time.

IOMETE is a ready-made lakehouse for the target state: one Spark engine, one security model, Iceberg tables, catalog and table maintenance, installed on your own Kubernetes, on-premises or air-gapped.

<DemoCta variant="B" refId="blog-hadoop-migration" position="top" primaryLabel="Book a migration demo" />

{/* truncate */}

## Why teams are planning a legacy Hadoop exit

- **Licence and hardware cost** that keeps rising, while the platform itself changes slowly.
- **Slow, risky upgrades.** Major version moves become multi-month projects, so clusters fall behind.
- **VM-era operations.** Clusters are managed node by node, separately from the Kubernetes platforms the rest of IT now runs.
- **Many engines, many policy sets.** Hive, Impala, Spark and others each need their own tuning and access configuration.
- **Features built by hand.** Ingestion, table maintenance and self-service often end up as in-house scripts.
- **Data residency still matters.** Most of these estates are on-premises for good reasons, and the replacement has to be too.

## What the target looks like

| Layer | Target on IOMETE |
|---|---|
| Storage | S3-compatible object storage you own: Ceph, MinIO, Dell ECS, Pure, NetApp StorageGRID, or a cloud object store |
| Table format | Apache Iceberg: ACID transactions, schema and partition evolution, time travel |
| Catalog | Iceberg REST catalog |
| Compute | Apache Spark on Kubernetes for SQL, batch ETL, streaming and notebooks, with autoscaling compute clusters |
| Security | One policy engine inside Spark, built on Apache Ranger: table/column access, row filters, masking, tag-based policies, audit; LDAP/AD and SSO |
| Operations | Helm or the Red Hat OpenShift Certified Operator; automated Iceberg table maintenance; logs to your ELK/Loki stack |
| Orchestration and BI | Apache Airflow; dbt; BI tools via JDBC/ODBC |

A short way to put it: **a Hadoop distribution gives you components to assemble into a lakehouse; IOMETE gives you the lakehouse already assembled.** (This describes architecture generations, not any vendor's current product.)

## The migration path

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
4. **Convert to Iceberg** with Apache Iceberg's Spark procedures ([docs](https://iceberg.apache.org/docs/latest/spark-procedures/)):
   - `snapshot` to test without touching the source
   - `migrate` to convert in place
   - `add_files` to register existing Parquet/ORC files
5. **Port workloads.** Spark jobs mostly need configuration changes. Review Hive/Impala SQL against Spark SQL. Move schedules to [Airflow](/integrations/airflow/getting-started).
6. **Re-tune for object storage.** Jobs tuned for years on HDFS data locality can behave differently on object storage. Budget time to re-check file sizes, partitioning and parallelism for the heaviest jobs.
7. **Re-create access policies** in IOMETE's Ranger-based policy engine, and use tags to apply PII masking consistently. [TODO: engineering to confirm whether existing Ranger policies can be imported.]
8. **Validate and cut over** one domain at a time: compare counts, checksums and report outputs, then re-point BI and decommission.

[TODO: approved proof point. Add a permissioned migration example (anonymised wording approved by the customer), or delete this line.]

## Who typically makes this move

- **Banks and central banks** modernising regulatory reporting and risk data while staying on-premises.
- **Telcos** replacing Hadoop plus MPP warehouses for very high-volume event data.
- **Government agencies** consolidating departmental clusters into one shared, governed platform.
- **Media and research organisations** with long-running Hadoop clusters and growing interactive query needs.

<FAQSection faqs={[
  {
    question: "Can I convert Hive tables to Iceberg without rewriting the data?",
    answer: "For Parquet and ORC tables, yes. Iceberg's migrate and add_files procedures create Iceberg metadata over existing files, once the files sit in storage the new platform can reach."
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
    answer: "IOMETE's access control is built on Apache Ranger, so the concepts carry over: table and column access, row filters, masking and tags. Policies are mapped into IOMETE's domains during migration."
  }
]} />

## Plan your migration

<DemoCta variant="B" refId="blog-hadoop-migration" position="bottom" primaryLabel="Book a migration demo" />

**Related:**

- [S3-compatible storage for a lakehouse](/blog/evaluating-s3-compatible-storage-for-lakehouse)
- Air-gapped data lakehouse (unpublished until the offline install steps are ready)
- [Apache Ranger data security](/blog/apache-ranger-data-security)

*Red Hat and OpenShift are trademarks of Red Hat, Inc. Apache®, Apache Hadoop®, Apache Hive™, Apache Impala™, Apache Spark™, Apache Iceberg™, Apache Ranger™ and Apache Airflow™ are trademarks of the Apache Software Foundation. Names are used only to identify products.*

## Sources

- [Apache Iceberg Spark procedures](https://iceberg.apache.org/docs/latest/spark-procedures/).
- [IOMETE deployment options](https://iomete.com/product/deployment), accessed 1 October 2026.
- [IOMETE capability summary](https://iomete.com/llms.txt), accessed 1 October 2026.
- OpenShift certification: IOMETE announcement, 20 May 2026. [TODO: link the Red Hat catalog entry.]
