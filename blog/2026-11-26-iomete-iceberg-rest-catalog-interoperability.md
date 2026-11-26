---
title: "Choosing and Testing an Apache Iceberg Catalog in IOMETE"
description: "Choose an Apache Iceberg catalog in IOMETE. Trace metadata and storage, compare managed and external catalogs, and test reads and writes from a second engine."
keywords: [Apache Iceberg catalog, Iceberg REST catalog, external Spark]
slug: iomete-iceberg-rest-catalog-interoperability
authors: fuad
tags2: [Technical, Educational]
coverImage: img/blog/thumbnails/lightLake.png
date: 11/26/2026
hide_table_of_contents: false
last_update:
  date: 2026-11-26
  author: Fuad Musayev
---

A second Spark cluster can list your Iceberg tables and still fail to read a single row. Listing tables proves it can reach the catalog; reading them also requires a route to the warehouse and permission to read the files.

When choosing an Apache Iceberg catalog in IOMETE, start with the table's owner. Which service commits updates today? Which engines need to read or write next? Use one small table to test those answers before you move production data.

{/* truncate */}

import FAQSection from '@site/src/components/FAQSection';

## Separating Table Files, Metadata, and Catalog State

Separating these layers prevents a common deployment mistake: treating the catalog database as the warehouse. For Iceberg v2 tables, object storage holds data files, delete files when present, and Iceberg metadata files.

The [Apache Iceberg specification](https://iceberg.apache.org/spec/) describes the file hierarchy. Table metadata JSON records schemas, partition specifications, and snapshots. A snapshot references a manifest list, which references manifests describing data and delete files.

The catalog maps a table identifier to its current metadata location and coordinates atomic metadata updates. Writers create new files, then commit through the catalog. Readers resolve a snapshot and read its files.

IOMETE's existing [explanation of Iceberg transactions and catalogs](/resources/blog/apache-iceberg-acid-transactions-catalog) covers this commit mechanism. Here, the operational consequence matters: protect both the object-store contents and the catalog's transactional state. Neither alone is a complete recovery plan.

## Choosing an Apache Iceberg Catalog in IOMETE

Choose the managed Iceberg REST Catalog when you want the platform to run the catalog service inside your deployment and expose its REST interface to other engines. Connect an external catalog when another service already owns the tables. Registering a second catalog entry isn't a substitute for connecting to that authority.

The [Spark Catalogs overview](/resources/user-guide/spark-catalogs/overview) lists these choices:

- **Managed Iceberg REST Catalog:** Iceberg tables, platform-integrated access policies, and authenticated external access.
- **Enterprise Catalog:** Multi-format tables for internal IOMETE workloads. It's in preview and isn't intended for production.
- **External REST:** An existing Iceberg REST service. Configure its URI, warehouse, and required authentication.
- **AWS Glue:** An existing Glue catalog. Configure its endpoint, warehouse, and AWS permissions.
- **Nessie:** An existing versioned catalog. Configure its URI, warehouse, reference, and authentication.
- **JDBC integration:** A database connection configured with a JDBC URL, credentials, and driver. Don't confuse relational database federation with an Iceberg catalog whose backend happens to use JDBC.

Keep the preconfigured `spark_catalog` distinct from new named catalogs. The Enterprise Catalog documentation identifies it as the Hive Metastore-backed session catalog.

Before choosing, record the warehouse URI, storage endpoint, credential owner, identifier casing, and required engine operations. “REST-compatible” describes an interface, not a complete compatibility certificate.

## Understanding the REST Service and Its Storage

The managed REST catalog runs as a platform service, not a separate catalog inside every Spark cluster. Its durable catalog state and warehouse files have different storage requirements.

The current [deployment architecture](/resources/deployment/architecture-deployment) documents `iom-rest-catalog` as a Kubernetes Deployment in the `iomete-data-plane-enterprise` Helm chart. The gateway routes `/catalogs/` requests to it. PostgreSQL stores Iceberg catalog state in a dedicated database, while the warehouse holds table files and Iceberg metadata files.

The [managed catalog guide](/resources/user-guide/spark-catalogs/internal) requires an S3-compatible warehouse. Catalogs inherit installation storage credentials unless you configure custom credentials and an endpoint.

Don't infer support for every warehouse protocol from the platform's broader storage-provider list. This catalog guide specifically documents S3-compatible storage. It also documents replicas and optional autoscaling for the REST service; those don't remove the PostgreSQL dependency.

## Defining External-Client and Cross-Cluster Boundaries

External engines need access to both the catalog and the table files. Reaching the REST endpoint only proves that the metadata service is reachable.

For a catalog named `lakehouse`, configure the client URI as `https://<console-host>/catalogs/lakehouse`, without appending `/v1`. The configuration endpoint beneath it is `/v1/config`. Authentication accepts an access token through `Authorization: Bearer <token>` or `X-API-Token`.

Check four boundaries:

1. **Catalog connectivity:** DNS, routing, TLS trust, and gateway access from the client network.
2. **Catalog authorization:** The token's identity needs the required catalog, namespace, and table policies.
3. **Storage connectivity:** Readers and writers need routes to the object-store endpoints referenced by table metadata.
4. **Storage authorization:** Supply storage credentials or configure a supported access-delegation mode.

IOMETE introduced credential vending and remote signing in 3.16.0 and are disabled by default. Vending requires compatible STS AssumeRole functionality and permissions. Client support must match the chosen mode.

Another Kubernetes cluster can use the same authority if these conditions hold. That doesn't replicate files, rewrite their locations, or make a private endpoint reachable. IOMETE's Spark engine enforces its row filters and column masks. Granting an external engine catalog access doesn't extend those Spark controls to that engine.

## Registering Tables and Testing Interoperability

Use a small disposable table to test the complete path before moving production tables. Successful namespace discovery doesn't prove reads, commits, or authorization behave correctly.

With a managed catalog named `lakehouse` configured on your IOMETE compute, run this Spark SQL:

```sql
CREATE NAMESPACE IF NOT EXISTS lakehouse.catalog_acceptance;
CREATE TABLE lakehouse.catalog_acceptance.probe (
  id BIGINT,
  message STRING
) USING iceberg
TBLPROPERTIES ('format-version' = '2');

INSERT INTO lakehouse.catalog_acceptance.probe
VALUES (1, 'from-iomete');

SELECT id, message
FROM lakehouse.catalog_acceptance.probe;
```

Expect one row: `1, from-iomete`.

For an existing Iceberg table, use the documented [registration procedure](/resources/reference/iceberg-tables/iceberg-procedures). Replace the example metadata URI below with the authoritative current metadata file, and use an unused destination name:

```sql
CALL lakehouse.system.register_table(
  table => 'catalog_acceptance.imported_orders',
  metadata_file =>
    's3://example-warehouse/orders/metadata/00042-example.metadata.json'
);
```

Registration records existing Iceberg metadata; it doesn't convert loose Parquet files or copy data. Capture the current metadata location during a controlled handover, rather than guessing from filenames.

**Don't register an actively managed table independently in two catalogs.** The [upstream registration warning](https://iceberg.apache.org/docs/1.9.2/spark-procedures/#register_table) explains how independent writers can lose updates or corrupt the table.

For acceptance:

1. Connect external Spark using the managed guide's client configuration and dependencies matching its Spark and Scala versions.
2. Read `probe` through the same catalog. Expect the identical row.
3. With an authorized writer, append `(2, 'from-external')`; refresh the IOMETE table and confirm both rows.
4. Repeat with an identity with read-only table permissions. Reads should succeed and writes should fail.
5. Test required operations separately, including deletes, schema changes, and snapshot reads. Repeat from the second cluster's actual network.

Record the platform release, Spark image, Iceberg client, storage implementation, and authentication mode with the results.

## Release-Specific Compatibility and Limitations

Pin platform and engine versions separately because IOMETE Spark images ship independently. The table summarizes documented boundaries, not a claim that every client combination passes.

Sources: [platform release notes](/resources/deployment/on-prem/release-notes/), [Spark release notes](/resources/deployment/on-prem/release-notes/spark), and the [Enterprise Catalog guide](/resources/user-guide/spark-catalogs/enterprise).

| Release or Scope | Documented Status | Compatibility Boundary |
|---|---|---|
| Managed Iceberg REST Catalog, current guide | Documented for internal and external compute | External REST access is documented; this isn't universal engine certification. |
| Platform 3.16.0 | Credential vending and remote signing introduced | Disabled by default; storage and client prerequisites still apply. |
| Platform 3.16.2 | Global client metadata-cache settings added | Case-insensitive identifiers require matching cache configuration. |
| Enterprise Catalog, introduced in 3.16.0 | Preview, not for production | Internal IOMETE workloads only; external REST access and namespace/table ACLs remain planned. |
| Spark 3.5.7-v3 | Enterprise Catalog re-enabled for platform 4.x | Re-enablement doesn't establish GA status. |
| Platform 4.0.3 and Spark 4.2.1-v1 | Latest entries observed on November 26, 2026 | No exhaustive public cross-engine certification matrix verified. Test your exact combination. |

Record which engine passed each operation. A read-only BI workload and a second writer don't need the same sign-off.

## Sources

- [Managed Iceberg REST Catalog](/resources/user-guide/spark-catalogs/internal)
- [IOMETE Enterprise Catalog (Preview)](/resources/user-guide/spark-catalogs/enterprise)
- [Apache Iceberg Table Specification](https://iceberg.apache.org/spec/)

<FAQSection faqs={[
  {
    question: "Where are Iceberg table rows stored, and what do I need to back up?",
    answer: "The rows live in data files, so backing up the catalog database alone won't recover the table. For an IOMETE managed REST catalog, protect both the warehouse objects, including Iceberg metadata files, and the catalog state in PostgreSQL. Test that a restored catalog points to files you can still read.",
    answerContent: (<>
      <p>{"The rows live in data files, so backing up the catalog database alone won't recover the table."}</p>
      <p>{"For an IOMETE managed REST catalog, protect both the warehouse objects, including Iceberg metadata files, and the catalog state in PostgreSQL. Test that a restored catalog points to files you can still read."}</p>
    </>)
  },
  {
    question: "How can two Spark clusters safely write to the same Iceberg table?",
    answer: "Have both clusters commit through one authoritative catalog, rather than registering the same table independently in two catalogs. With the IOMETE managed REST catalog, each cluster needs compatible clients, table permissions, and access to the warehouse. Append a row from each cluster and check that a fresh read sees both commits.",
    answerContent: (<>
      <p>{"Have both clusters commit through one authoritative catalog, rather than registering the same table independently in two catalogs."}</p>
      <p>{"With the IOMETE managed REST catalog, each cluster needs compatible clients, table permissions, and access to the warehouse. Append a row from each cluster and check that a fresh read sees both commits."}</p>
    </>)
  },
  {
    question: "Which Iceberg catalog should I use if external engines need production access?",
    answer: "Choose a catalog with a supported external interface for the engines and operations you need. IOMETE documents external reads and writes through its managed Iceberg REST catalog. Its multi-format Enterprise Catalog is still in preview for internal workloads; don't assume it exposes the same interface.",
    answerContent: (<>
      <p>{"Choose a catalog with a supported external interface for the engines and operations you need."}</p>
      <p>{"IOMETE documents external reads and writes through its managed Iceberg REST catalog. Its multi-format Enterprise Catalog is still in preview for internal workloads; don't assume it exposes the same interface."}</p>
    </>)
  },
  {
    question: "Why can an engine list an Iceberg table but not read its rows?",
    answer: "Listing a table tests catalog access; reading its rows also requires access to the data files in storage. An external engine using the IOMETE REST catalog must reach the warehouse endpoint with suitable storage permissions. Test a row read with the intended identity before testing a write.",
    answerContent: (<>
      <p>{"Listing a table tests catalog access; reading its rows also requires access to the data files in storage."}</p>
      <p>{"An external engine using the IOMETE REST catalog must reach the warehouse endpoint with suitable storage permissions. Test a row read with the intended identity before testing a write."}</p>
    </>)
  }
]} />
