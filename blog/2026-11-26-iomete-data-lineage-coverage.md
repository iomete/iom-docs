---
title: "Data Lineage in IOMETE: What Can You Verify Today?"
description: "Assess data lineage in IOMETE. Separate catalog metadata from lineage, trace a revenue field through SQL and PySpark, and test what a governance review needs."
keywords: [data lineage in IOMETE, column-level lineage, Spark lineage]
slug: iomete-data-lineage-coverage
authors: fuad
tags2: [Technical, Educational]
coverImage: img/blog/thumbnails/lightGeode.png
date: 11/26/2026
hide_table_of_contents: false
last_update:
  date: 2026-11-26
  author: Fuad Musayev
---

A finance analyst asks why a cancelled order didn't count toward daily revenue. Your catalog can show the revenue column and its type. To answer the analyst, you need the filter that excluded the order and a record of the run that applied it.

As of November 26, 2026, IOMETE documents catalog discovery and table metadata. Its public [Data Lineage roadmap](https://iomete.com/roadmap/data-lineage) lists native lineage as **Backlog**. Here's how to tell what the catalog shows today and test the coverage your data product needs.

{/* truncate */}

import FAQSection from '@site/src/components/FAQSection';
import Img from '@site/src/components/Img';

## Mapping a Source-to-Product Flow

Write down the dependencies before opening the lineage view. For a daily revenue report, the expected path might look like this:

`Order Feed → raw_orders → paid_orders → daily_revenue → BI Report`

Here, `daily_revenue` is the technical output of a data product. Its owner, definition, access rules, and freshness commitment complete the product contract. The [data-as-a-product article](/resources/blog/2025/02/09/data-mesh-data-product) explains that broader ownership model.

Run this Spark SQL in a disposable namespace on an Iceberg-enabled catalog where you have create and write permissions. The inline rows stand in for an ingested feed. They don't test the feed-to-table connection.

```sql
CREATE DATABASE lineage_demo;

CREATE TABLE lineage_demo.raw_orders USING iceberg AS
SELECT * FROM VALUES
  (1, DATE '2026-11-25', 2, CAST(10.00 AS DECIMAL(10,2)), 'paid'),
  (2, DATE '2026-11-25', 1, CAST(10.00 AS DECIMAL(10,2)), 'paid'),
  (3, DATE '2026-11-25', 1, CAST(50.00 AS DECIMAL(10,2)), 'cancelled')
AS orders(order_id, order_date, quantity, unit_price, status);

CREATE TABLE lineage_demo.paid_orders USING iceberg AS
SELECT order_id, order_date, quantity * unit_price AS revenue
FROM lineage_demo.raw_orders
WHERE status = 'paid';

CREATE TABLE lineage_demo.daily_revenue USING iceberg AS
SELECT order_date, SUM(revenue) AS revenue
FROM lineage_demo.paid_orders
GROUP BY order_date;

SELECT * FROM lineage_demo.daily_revenue;
```

The expected result is one row: `2026-11-25`, with revenue of `30.00`. This uses Spark's documented [CREATE TABLE AS SELECT syntax](https://spark.apache.org/docs/3.5.7/sql-ref-syntax-ddl-create-table-datasource.html). Use a fresh namespace for reruns.

<Img src="/img/blog/lakehouse-architecture-guides/lineage-revenue.png" alt="Two paid orders of 20.00 and 10.00 add up to 30.00. The status filter excludes a cancelled order of 50.00." maxWidth="680px" centered borderless />

## Distinguishing Table-Level and Column-Level Visibility

Table-level lineage tells you which datasets depend on one another. Column-level lineage explains which input fields produce or influence each output field. Neither follows automatically from a catalog listing schemas, tags, owners, or snapshots. For a release decision, test the dependency edges separately from the presence of metadata.

In the example, table-level evidence connects `raw_orders` to `paid_orders`, then to `daily_revenue`.

Column-level evidence traces the final `revenue` value through the sum to `quantity` and `unit_price`. It also records that `status` influences which rows contribute. `order_date` determines the grouping.

[OpenLineage's Spark column-lineage documentation](https://openlineage.io/docs/integrations/spark/spark_column_lineage/) distinguishes direct field dependencies from indirect dependencies such as filters. This is a useful testing model, not evidence that IOMETE implements it.

## Capturing and Storing Lineage Metadata

A useful lineage system must preserve execution evidence, not merely draw a graph. Separate metadata capture, transport, persistent storage, and display when you evaluate an implementation.

The upstream [OpenLineage object model](https://openlineage.io/docs/spec/object-model/) represents datasets, processing definitions, and individual runs. Events identify inputs and outputs; facets add information such as schemas, source-code versions, and column dependencies.

Its [Spark integration](https://openlineage.io/docs/integrations/spark/) uses a Spark listener to extract execution metadata. A receiving backend still needs to retain events and make dependencies queryable.

For IOMETE, the public [Data Catalog guide](/resources/user-guide/data-catalog/overview) documents a scheduled sync that indexes metadata. The [table-details guide](/resources/user-guide/data-catalog/table-details) describes columns, descriptions, owners, classifications, and Iceberg metadata.

Neither guide establishes a lineage event store. The reviewed sources don't verify IOMETE's lineage collector, storage backend, retention period, replay behavior, or export interface. Don't substitute catalog sync or snapshot history for those answers.

## Comparing SQL and PySpark Coverage

SQL and PySpark need separate tests because a language label doesn't define capture coverage. The execution plan, connector, and transformation all affect what a collector can observe.

For example, this PySpark DataFrame expression expresses the same paid-order transformation:

```python
from pyspark.sql import functions as F

paid = (
    spark.table("lineage_demo.raw_orders")
    .filter(F.col("status") == "paid")
    .select("order_id", "order_date",
            (F.col("quantity") * F.col("unit_price")).alias("revenue"))
)
paid.writeTo("lineage_demo.paid_orders_python").using("iceberg").create()
```

OpenLineage documents extraction from Spark dependency graphs and logical plans. That doesn't establish IOMETE support or SQL/PySpark parity. Repeat the test with Python UDFs, RDD operations, external API calls, and your actual connectors. Treat missing evidence as a gap, not an implied dependency.

## Establishing Production Readiness and Domain Boundaries

Production readiness requires a versioned support statement and reproducible results. The public roadmap is dated October 13, 2025. It doesn't establish general availability or a supported preview.

The [platform release notes](/resources/deployment/on-prem/release-notes/), headed by version 4.0.3 dated November 18, contain no lineage announcement. The roadmap lists automatic extraction, cross-domain visualization, dashboard dependencies, and a lineage API as planned features.

Also distinguish **cross-catalog querying** from **cross-domain lineage**. Reading two datasets doesn't prove a permission-aware graph connects them. External ingestion, separate domains, BI calculations, and exports remain boundaries to verify.

## Running a Buyer Acceptance Test

Approve lineage against an expected dependency inventory, not a convincing screenshot. Use the example as a baseline, then replace its synthetic input and report boundary with real integrations.

1. **Fix the scope.** Record platform, Spark, connector, and collector versions. List expected tables, fields, transformations, and external edges.
2. **Verify capture.** Execute SQL and PySpark variants. Match their outputs and run identifiers to captured events within an agreed delay.
3. **Check completeness.** Find both table edges, the revenue calculation, aggregation, filter influence, and grouping dependency. Count missing and incorrect edges separately.
4. **Cross boundaries.** Test a real ingestion connector, another domain, and a BI report. Record unsupported edges explicitly.
5. **Test restricted access.** Repeat as a limited user. Confirm the graph follows the agreed policy without exposing protected metadata.
6. **Test operations.** Fail a run, retry it, rename an input, and interrupt collection. Verify run states, duplicate handling, recovery, and retained history.

Accept only when every required edge passes or has an explicit scope exception. A partial graph can still help operations, but it isn't complete source-to-product evidence.

## Sources

- [IOMETE Data Lineage Roadmap](https://iomete.com/roadmap/data-lineage)
- [IOMETE Data Catalog: Table Details](/resources/user-guide/data-catalog/table-details)
- [OpenLineage Spark Integration](https://openlineage.io/docs/integrations/spark/)

<FAQSection faqs={[
  {
    question: "How can I tell whether a revenue report has end-to-end data lineage?",
    answer: "Trace one reported figure back to its source fields through the transformations that actually ran, including the final BI calculation. If a cancelled order drops out, the trace should identify the status filter and the run that applied it. IOMETE documents catalog discovery, but its public roadmap lists native data lineage as Backlog.",
    answerContent: (<>
      <p>{"Trace one reported figure back to its source fields through the transformations that actually ran, including the final BI calculation."}</p>
      <p>{"If a cancelled order drops out, the trace should identify the status filter and the run that applied it. IOMETE documents catalog discovery, but its public roadmap lists native data lineage as Backlog."}</p>
    </>)
  },
  {
    question: "What's the difference between a column list and column-level lineage?",
    answer: "A column list tells you which fields exist; column-level lineage tells you which inputs and transformations produced a field's value. The IOMETE Data Catalog shows column types, tags, and descriptions. Seeing a revenue column there doesn't tell you whether it uses unit price before or after discounts.",
    answerContent: (<>
      <p>{"A column list tells you which fields exist; column-level lineage tells you which inputs and transformations produced a field's value."}</p>
      <p>{"The IOMETE Data Catalog shows column types, tags, and descriptions. Seeing a revenue column there doesn't tell you whether it uses unit price before or after discounts."}</p>
    </>)
  },
  {
    question: "Will a lineage tool capture the same dependencies in SQL and PySpark?",
    answer: "SQL and PySpark can produce identical rows without giving a lineage tool identical evidence. Run the same transformation both ways, then compare the recorded input fields, filters, and outputs. IOMETE supports Spark workloads, but that alone doesn't establish native lineage coverage for Python UDFs or external calls.",
    answerContent: (<>
      <p>{"SQL and PySpark can produce identical rows without giving a lineage tool identical evidence."}</p>
      <p>{"Run the same transformation both ways, then compare the recorded input fields, filters, and outputs. IOMETE supports Spark workloads, but that alone doesn't establish native lineage coverage for Python UDFs or external calls."}</p>
    </>)
  }
]} />
