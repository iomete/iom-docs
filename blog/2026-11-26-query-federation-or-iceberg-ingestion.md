---
title: "Query Federation or Iceberg Ingestion for a Shared Report?"
description: "Choose between query federation and Iceberg ingestion for a reporting workload. Compare two SQL paths and test freshness, source load, access, and availability."
keywords: [query federation, Iceberg ingestion, cross-catalog joins]
slug: query-federation-or-iceberg-ingestion
authors: fuad
tags2: [Technical, Educational]
coverImage: img/blog/thumbnails/lightRacing.png
date: 11/26/2026
hide_table_of_contents: false
last_update:
  date: 2026-11-26
  author: Fuad Musayev
---

A dashboard joins orders in Iceberg to customer segments in a live database. Query federation is a good first move: you can answer the question without maintaining another table. But when the customer database goes down, should the sales dashboard go down with it?

If yesterday's segments are acceptable and the dashboard needs to stay available, persist that dimension in Iceberg. If a decision needs a change made seconds ago, test a live lookup. Here's how to compare the two paths using the same report.

{/* truncate */}

import FAQSection from '@site/src/components/FAQSection';
import Img from '@site/src/components/Img';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What Query Federation Actually Reads

Query federation lets you join external data at query time, so you can investigate a source before committing to a pipeline. A JDBC proxy table stores connection information rather than the source rows. When you query it, the engine reads the database.

Cross-catalog joins address a different boundary. A query can reference `catalog.namespace.table` in two configured catalogs, including catalogs describing existing Iceberg tables. That doesn't necessarily involve an operational database or require copying those tables.

Neither pattern means “no data movement.” Rows still travel to compute. Nor does one SQL statement establish a synchronized transaction across independent databases and Iceberg snapshots.

## Comparing the Operational Trade-Offs

Federation favors immediate access; ingestion favors reusable, independently served data. Start with the failure mode your users can tolerate, then compare the work each path creates.

| Concern | Live Federation | Persisting in Iceberg |
|---|---|---|
| Freshness | Reads source-visible data during execution, subject to isolation and any caching. | Reflects the last successful load or applied changes. |
| Source Load | Repeated reads consume source connections and compute. | Loads consume source capacity; later queries read the copy. |
| Latency | Depends on source response, network transfer, and join execution. | Avoids remote database reads, but table layout and compute still matter. |
| Governance | Requires controls for the query engine, source account, and transferred results. | Adds another dataset requiring permissions, retention, and deletion handling. |
| Availability | Queries depend on reachable sources. | Reads can continue from committed data when a source fails, with increasing staleness. |

Don't assume the engine sends an entire join to the database. [Apache Spark's JDBC documentation](https://spark.apache.org/docs/3.5.7/sql-data-sources-jdbc.html) describes predicate pushdown and connection limits. Aggregate pushdown has additional V2-specific conditions. Inspect the plan and source-side activity instead of assuming every filter or aggregation runs remotely.

Persist shared data when repeated reads exceed the cost of refreshing and maintaining it. You exchange repeated extraction for storage, ingestion, and table maintenance. There's no universal query-count threshold.

## A Decision Tree for Each Dataset

Choose the path per dataset so one demanding lookup doesn't dictate the whole analytics architecture. Use these questions in order:

1. **May you create a persistent copy?** If not, evaluate federation and the rules governing transient processing and results. Federation alone doesn't establish sovereignty.
2. **Must results reflect changes faster than your ingestion pipeline can deliver?** Test live reads, including source isolation and latency.
3. **Do broad scans, repeated joins, or concurrency exceed the source's agreed budget?** Persist the shared subset in Iceberg.
4. **Must reports remain available during source outages?** Persist their required inputs and define a maximum acceptable data age.
5. **Do requirements differ?** Ingest shared reporting data while keeping selective operational lookups live.

For the broader mechanics, the existing [federated query explainer](/resources/blog/federated-query-explained) provides background. The decision here is narrower: which dependencies belong on your reporting path?

## A Staged Adoption Example in IOMETE

Start with a live join, then persist only the repeatedly used input. This limits pipeline work while exposing source-load problems early.

Compare the two diagrams to see which input changes. Both versions read the same orders.

<Tabs defaultValue="live">
<TabItem value="live" label="Live lookup">

<Img src="/img/blog/lakehouse-architecture-guides/report-live.png" alt="The report joins Iceberg order amounts with customer segments read from the source database over JDBC on each run." maxWidth="680px" centered borderless />

</TabItem>
<TabItem value="copy" label="Iceberg copy">

<Img src="/img/blog/lakehouse-architecture-guides/report-copy.png" alt="The report joins the same orders with a customer-segment table in Iceberg. Segment values reflect the last refresh." maxWidth="680px" centered borderless />

</TabItem>
</Tabs>

IOMETE documents [JDBC proxy queries](/resources/reference/sql-quick-start/query-federation) and [multiple Spark catalogs](/resources/user-guide/spark-catalogs/overview). Use connectors supported by your installed release, with network access and read-only source credentials configured.

Assume `customers_live` is a registered JDBC proxy in your current namespace, exposing unique `customer_id` values and `segment`. Also assume:

- `archive.sales.orders` is an Iceberg table in a configured external catalog, with `customer_id`, `order_date`, and decimal `amount`.
- `lakehouse.analytics` is an existing, writable namespace in an Iceberg catalog.
- Your identity has the required read and create permissions.

First, run the live join:

```sql
SELECT c.segment, SUM(o.amount) AS revenue
FROM archive.sales.orders o
JOIN customers_live c
  ON o.customer_id = c.customer_id
WHERE o.order_date >= DATE '2026-11-01'
GROUP BY c.segment;
```

This date filter restricts orders, not necessarily customer extraction. Measure the database reads before adding dashboard users.

Next, persist the shared customer attributes using [Iceberg's documented CTAS syntax](https://iceberg.apache.org/docs/1.9.0/spark-ddl/):

```sql
CREATE TABLE lakehouse.analytics.customer_segments
USING iceberg
AS SELECT customer_id, segment
FROM customers_live;
```

Then move reporting to the persisted input:

```sql
SELECT c.segment, SUM(o.amount) AS revenue
FROM archive.sales.orders o
JOIN lakehouse.analytics.customer_segments c
  ON o.customer_id = c.customer_id
WHERE o.order_date >= DATE '2026-11-01'
GROUP BY c.segment;
```

The final query joins two catalogs without reading the customer database. It still depends on both catalogs and their storage.

Both queries classify orders by the customer segment they read, not necessarily the segment at purchase time. If you need historical attribution, use a dated dimension and join on the order date.

CTAS creates a one-time copy, not a refresh service. Before production, define refresh frequency and handle updates, deletes, schema changes, and failed loads. IOMETE's [JDBC ingestion tutorial](/resources/tutorials/sync-data-from-jdbc-sources) covers copy and merge patterns.

## Testing Before Moving a Query to a Persisted Copy

Federation can remove a separate virtualization hop for a workload that only needs supported SQL access and joins. That doesn't establish a replacement for semantic models, API delivery, identity delegation, caching, or lineage.

Assess [IOMETE's data governance scope](https://iomete.com/product/data-platform/data-governance) separately from connector support, especially when a shared database account executes remote reads.

For the example, use this acceptance test:

1. Freeze source changes and compare both queries' grouped totals and row counts. Check duplicate keys and null handling.
2. Run representative concurrent dashboards. Record p95 latency, source CPU, connections, and transferred rows against limits set before testing.
3. Change a customer's segment. Confirm the live result changes, then refresh and verify the persisted result within your freshness target.
4. On an isolated test compute, point the test JDBC connection at an unavailable endpoint. Confirm live-query failure and continued reads of the persisted dimension. Monitor its age.
5. Test an unauthorized identity against the proxy and copied table. Verify that neither path exposes prohibited data.

Adopt the hybrid only when correctness, freshness, source load, and access checks pass. A faster query isn't enough.

## Sources

- [IOMETE Query Federation](/resources/reference/sql-quick-start/query-federation)
- [IOMETE JDBC Ingestion Tutorial](/resources/tutorials/sync-data-from-jdbc-sources)
- [Spark JDBC Data Source](https://spark.apache.org/docs/3.5.7/sql-data-sources-jdbc.html)

<FAQSection faqs={[
  {
    question: "When should a dashboard read an Iceberg copy instead of querying a live database?",
    answer: "Use a copy when repeated reads strain the source or the dashboard must survive a source outage, provided the last refresh is recent enough. You can compare those paths in IOMETE using a JDBC proxy and an Iceberg table loaded from the same rows. Measure source load and data age alongside query time.",
    answerContent: (<>
      <p>{"Use a copy when repeated reads strain the source or the dashboard must survive a source outage, provided the last refresh is recent enough."}</p>
      <p>{"You can compare those paths in IOMETE using a JDBC proxy and an Iceberg table loaded from the same rows. Measure source load and data age alongside query time."}</p>
    </>)
  },
  {
    question: "Does a cross-catalog join always query the source database?",
    answer: "A cross-catalog join identifies tables in different catalogs; the connector for each table determines where the rows come from. In IOMETE, a join between two Iceberg tables reads their data files, whereas a join to a JDBC proxy reads the connected database. Check each input before estimating source load.",
    answerContent: (<>
      <p>{"A cross-catalog join identifies tables in different catalogs; the connector for each table determines where the rows come from."}</p>
      <p>{"In IOMETE, a join between two Iceberg tables reads their data files, whereas a join to a JDBC proxy reads the connected database. Check each input before estimating source load."}</p>
    </>)
  },
  {
    question: "Can we remove the virtualization layer from one report without changing what users see?",
    answer: "You can remove that dependency if direct queries reproduce the report's results, freshness, and access controls. For an IOMETE JDBC proxy, check which identity the source database sees, then run the report as both an allowed and a restricted user. Matching totals alone won't reveal a permissions mismatch.",
    answerContent: (<>
      <p>{"You can remove that dependency if direct queries reproduce the report's results, freshness, and access controls."}</p>
      <p>{"For an IOMETE JDBC proxy, check which identity the source database sees, then run the report as both an allowed and a restricted user. Matching totals alone won't reveal a permissions mismatch."}</p>
    </>)
  }
]} />
