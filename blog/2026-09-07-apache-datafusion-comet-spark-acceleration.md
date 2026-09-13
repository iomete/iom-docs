---
title: "Comet in IOMETE 4.0: Same SQL, 42% Less Time"
description: "Apache DataFusion Comet in IOMETE 4.0 accelerates Spark SQL natively. TPC-DS results, memory setup, and when to leave the switch off."
keywords: [apache datafusion comet, spark query acceleration, comet spark plugin, native spark execution, tpc-ds benchmark, apache iceberg, vectorized query engine]
slug: apache-datafusion-comet-spark-acceleration
authors: rovshan
tags2: [Technical, Engineering]
coverImage: img/blog/thumbnails/darkLake.png
date: 09/07/2026
hide_table_of_contents: false
last_update:
  date: 2026-09-07
---

Spark has been the engine under IOMETE from the start, and it has earned that place. It also carries a cost that most Spark users stopped noticing years ago. Operators run on the JVM, and once data leaves the Parquet reader it moves through the plan one row at a time. Memory belongs to a garbage collector that was never designed for scanning billions of values. The SIMD units in every modern CPU sit mostly idle.

Apache DataFusion Comet closes most of that gap without asking anyone to leave Spark. IOMETE 4.0, released on September 7, 2026, ships Comet 1.0.0 in the Spark 4.1.3 image, and every new compute has a Query acceleration switch on the General tab. Turn it on and the same SQL runs through Comet. In our TPC-DS run, it cut the total time for 103 queries by 42%.

{/* truncate */}

import FAQSection from '@site/src/components/FAQSection';
import Img from '@site/src/components/Img';

We first mentioned Comet as a roadmap item in last year's post on [lakehouse architecture](/resources/blog/datalakehouse-architecture-in-2025). This is the follow-through.

## What Comet Is

Comet is a plugin for [Apache Spark](https://spark.apache.org/), and it matters because it moves execution off the JVM without changing a line of your SQL. It started inside Apple, was donated to the [Apache DataFusion](https://datafusion.apache.org/comet/) project in 2024, and reached 1.0.0 on August 7, 2026 after two years of 0.x releases. DataFusion itself is a query engine written in Rust, and Comet is the bridge that lets Spark hand work to it.

The mechanism is a physical plan rewrite. After Spark's optimizer finishes, Comet's session extension walks the physical plan and looks at each operator. Filters, projections, hash aggregates, sorts, joins, and Parquet or Iceberg scans that Comet supports get swapped for Comet versions. Runs of consecutive Comet operators are grouped into a single native stage, serialized as a protobuf plan, and passed across the JNI boundary. DataFusion executes that stage and returns the results as Apache Arrow batches.

Whatever Comet does not support stays in Spark. An expression it cannot translate yet, an unusual data type, a user-defined function: Comet leaves that operator alone and inserts the conversion the two sides need to exchange data. The query still runs and still returns the same rows. Part of it simply runs at Spark speed instead of Comet speed. That per-operator fallback is what makes Comet low-risk to try on a workload you already run, but it is not a blanket compatibility guarantee: the upstream 1.0 notes document edge cases, such as a `NullType` column in Parquet, that fail inside native decoding before fallback can take over. Validate your own workload on a non-production compute before turning the switch on for good.

Version 1.0 is also where Comet adopted semantic versioning, which is what we wanted before shipping it on the platform. It supports Spark 3.4 through 4.1 and Iceberg 1.11, including format version 3.

## Where the Speed Comes From

Four changes do the work, and each one removes a different tax the JVM plan pays.

**Batches instead of rows.** Comet operators process Arrow batches, 8,192 rows at a time by default. A filter over a batch is a tight loop over a contiguous array of values, and that is exactly the code shape compilers turn into SIMD instructions. Spark's whole-stage code generation produces a loop too, but it is a loop over Java objects running under a JIT, and it cannot get close to the same throughput.

**No garbage collector in the hot path.** Native operators allocate from an off-heap memory pool that Comet manages itself. The JVM heap on each executor gets smaller, and garbage collection pauses stop growing with the amount of data a query touches.

**Columnar from the file to the result.** Spark's Parquet reader is vectorized, but it converts to rows immediately after the scan, and the rest of the plan works on rows. Comet's native Parquet and Iceberg readers decode straight into Arrow, and every downstream operator consumes Arrow. The data does not become rows until it is handed back to your client.

**Native shuffle and native joins.** Shuffle is where Spark spends much of its time turning rows into bytes and back. Comet's shuffle manager writes Arrow batches to disk in Arrow IPC format, partitions them in Rust, and reads them back as Arrow. Comet 1.0 also executes hash joins, sort-merge joins, and broadcast joins natively, so multi-way joins between fact and dimension tables stay in Rust end to end rather than bouncing back to the JVM at each join.

## What It Did to TPC-DS

Comet cut the total runtime of the 103 TPC-DS queries from 28.6 minutes to 16.5 minutes, a saving of 42%. Every percentage below is time saved, so a query that took 10 seconds and now takes 6 saved 40%.

The workload was TPC-DS at the 100 GB scale factor, 103 queries in total (the 99 standard queries, four of which have two variants), each run once, one at a time. Both runs used the same compute: one driver with 4 vCPU and 16 GiB, and four executors with 8 vCPU and 64 GiB each, on the IOMETE Spark 4.1.3 image. The only difference between the runs was the Query acceleration switch. Each query ran once, so these are single-run measurements without a variance estimate: read the large differences as real and treat anything within roughly 10% as indistinguishable from run-to-run noise.

|  | Comet off | Comet on |
|---|---|---|
| Total time, 103 queries | 28.6 min | 16.5 min |
| Time saved |  | 42% |

Ninety-nine of the 103 queries were faster in this run. The median query saved 40%.

| Time saved | Queries |
|---|---|
| 50% or more | 30 |
| 33% to 50% | 35 |
| 20% to 33% | 21 |
| Under 20% | 13 |
| Slower | 4 |

The biggest gains came from queries that spend their time joining and aggregating the large fact tables, which is where native shuffle and native joins pay off most. The six queries with the largest savings all fit that description.

| Query | What it does | Comet off | Comet on | Time saved |
|---|---|---|---|---|
| q29 | Joins store sales, store returns and catalog sales, then totals quantities per item and store | 16.2 s | 4.4 s | 73% |
| q85 | Joins web returns with two customer demographics tables and addresses, averaged per return reason | 17.4 s | 4.9 s | 72% |
| q93 | Store sales net of returns, totalled per customer | 42.5 s | 12.2 s | 71% |
| q78 | Sales minus returns across the store, web and catalog channels, per customer and item | 46.1 s | 14.9 s | 68% |
| q22 | Average inventory on hand, rolled up through the product hierarchy | 14.1 s | 4.6 s | 68% |
| q82 | Items that were both in stock and sold, filtering inventory against store sales | 13.7 s | 4.4 s | 68% |

The heavy queries improved as much as the light ones. q9, which scans the store sales table again and again to compute one set of aggregates per quantity bucket, dropped from 87 seconds to 30. The ten longest queries under plain Spark account for 36% of the total runtime, and together they finished in 46% less time with Comet on. That figure includes the one real regression.

## Where It Got Slower

Four queries took longer with Comet, and it is worth knowing what they look like before you flip the switch on a production workload. Three of them were slower by small margins: q59 by 13%, q77 by 7%, and q69 by 2% — small enough, on a single run each, that we would not call them measured regressions. The fourth is q72, which joins catalog sales against inventory, warehouses, items, two demographics tables and three copies of the date dimension to count promoted versus unpromoted sales. It is one of the heaviest joins in the suite and the query that comes up in every Spark discussion of TPC-DS. It went from 60 seconds to 109, an 82% increase. We are looking into the plan for that query. If one of your workloads hits a case like it, the fix is one switch on one compute, described below.

## A Note on Scale

100 GB is a modest scale factor, chosen so that both runs finished in an afternoon on a shared development cluster. The upstream project reports roughly half the runtime on TPC-DS at 1 TB, and AWS's engineers measured Comet 0.16.0 at 32% faster than plain Spark on TPC-DS at 3 TB on Amazon EKS, and 37% faster on Iceberg tables. Our numbers land in the same range, on a much smaller cluster.

## How IOMETE 4.0 Ships It

Enabling Comet by hand means adding a plugin, a session extension, and a shuffle manager to your Spark configuration, choosing an off-heap memory size, and rebalancing executor memory so the pods still fit on your nodes. In IOMETE 4.0 all of that is behind one switch.

<Img src="/img/blog/2026-09-07-comet-spark-acceleration/query-acceleration-switch.png" alt="Query acceleration switch on the General tab of the IOMETE compute form" borderless/>

The switch is off by default in 4.0, and it is available on any compute that runs a Spark 4 image. Since 4.1.3 is the default image, a new compute qualifies without any other change. Comet needs Spark 4 on IOMETE, so the platform will not let you enable it on a Spark 3.5 image.

When the switch is on, the compute receives a single flag, and the Spark image expands it at startup into the full Comet configuration. The Comet plugin and session extension are added alongside the Iceberg extension and IOMETE's own extensions rather than replacing them. The shuffle manager is switched to Comet's native one. Native Iceberg scans are enabled, which matters because every table in IOMETE is an Iceberg table, so the very first scan of the very first query already runs in Rust.

Memory is the part people usually get wrong when they set Comet up themselves. Comet needs an off-heap pool, and the obvious way to add one is on top of the executor's existing memory. On Kubernetes that means pods that no longer fit on their nodes, and you find out through Pending pods or OOMKilled executors. IOMETE carves the off-heap pool out of the node's memory budget instead. Half of each executor node's memory goes to Comet, the JVM heap shrinks to match, and on-heap plus overhead plus off-heap still fits the node. The driver keeps its full heap, because Comet's native execution happens on executors. If half is too much or too little for a particular workload, `spark.iomete.comet.offHeap.fraction` in the compute's Spark configuration adjusts it per compute. The same node-budget discipline applies to the rest of a [self-hosted lakehouse on Kubernetes](/resources/blog/self-hosted-data-lakehouse-kubernetes).

Fallback reporting is enabled as well. The query plan shows which operators ran in Comet and which fell back to Spark, along with the reason, so you can see exactly where a slow query is spending its time.

We build Comet from the upstream 1.0.0 source into a single jar that carries native libraries for both amd64 and arm64, so the same Spark image accelerates queries on x86 nodes and on ARM nodes such as Graviton.

## When to Turn It On

For most computes that spend their time on SQL, the answer is straight away. The switch is off by default in 4.0, so nothing changes for an existing compute until you decide it should, and turning it on is one edit to the compute, applied the next time it starts.

There are two situations where leaving it off is the better call.

If a workload is built around operators that Comet cannot run natively, the switch may cost more than it saves. A query that spends most of its time in an operator that falls back to Spark pays for the columnar conversion at the boundary without getting the native speedup to make up for it. Workloads built around Scala or Python UDFs are the usual example, and q72 above shows that a plain SQL query can hit the same wall. Turn it on, check the plan for the queries that matter, and turn it back off if they regress.

If a compute is memory-constrained and depends on a large executor JVM heap, for example one that caches big DataFrames in executor memory or runs wide aggregations and joins that spill once the heap shrinks, halving the executor heap may hurt more than native execution helps. (The driver keeps its full heap either way, so driver-side work is unaffected.) Lower the off-heap fraction first, and leave Comet off if that is not enough.

Either decision applies to one compute and nothing else. There is no cluster-wide setting to coordinate and no SQL to rewrite.

<Img src="/img/blog/2026-09-07-comet-spark-acceleration/compute-details-query-acceleration.png" alt="Compute details in IOMETE showing Query acceleration disabled by default" maxWidth="700px" centered/>

## Getting Started

Create a compute in IOMETE 4.0, keep the Spark 4.1.3 image, and turn on Query acceleration at the bottom of the General tab. Run the SQL you already have. To bring an existing compute onto Comet, edit it, move it to a Spark 4 image if it is not on one already, and turn the switch on.

For details on the compute form, see [Creating a Compute Cluster](/user-guide/compute-clusters/creating-clusters). For Comet itself, the [Apache DataFusion Comet documentation](https://datafusion.apache.org/comet/) covers the supported operators and expressions and the tuning knobs behind the defaults IOMETE picks for you.

## FAQ

<FAQSection faqs={[
  {
    question: "What is Apache DataFusion Comet?",
    answer: "Apache DataFusion Comet is a Spark plugin that replaces supported Spark operators with native Rust operators from the DataFusion engine, so the same SQL runs columnar and off-heap instead of row by row on the JVM. IOMETE ships Comet 1.0.0 inside the Spark 4.1.3 image, behind a Query acceleration switch on each compute.",
    answerContent: (<><p>Apache DataFusion Comet is a Spark plugin that replaces supported Spark operators with native Rust operators from the DataFusion engine, so the same SQL runs columnar and off-heap instead of row by row on the JVM.</p><p>IOMETE ships Comet 1.0.0 inside the Spark 4.1.3 image, behind a Query acceleration switch on each compute. Operators Comet cannot run natively stay in Spark, so queries keep returning the same rows.</p></>)
  },
  {
    question: "How much faster is Spark with Comet enabled?",
    answer: "In a TPC-DS run at the 100 GB scale factor, Comet cut the total time for 103 queries by 42%, from 28.6 minutes to 16.5 minutes, with a median saving of 40% per query. The run used one IOMETE compute with four executors of 8 vCPU and 64 GiB each on the Spark 4.1.3 image, changing only the Query acceleration switch.",
    answerContent: (<><p>In a TPC-DS run at the 100 GB scale factor, Comet cut the total time for 103 queries by 42%, from 28.6 minutes to 16.5 minutes, with a median saving of 40% per query.</p><p>The run used one IOMETE compute with four executors of 8 vCPU and 64 GiB each on the Spark 4.1.3 image. The only difference between the two runs was the Query acceleration switch.</p></>)
  },
  {
    question: "Does enabling Comet change query results or require rewriting SQL?",
    answer: "No. Comet rewrites the physical plan after Spark's optimizer runs, so the SQL, the API, and the returned rows stay the same. On IOMETE the change is one switch on one compute, applied the next time that compute starts.",
    answerContent: (<><p>No. Comet rewrites the physical plan after Spark's optimizer runs, so the SQL, the API, and the returned rows stay the same.</p><p>On IOMETE the change is one switch on one compute, applied the next time that compute starts. There is no cluster-wide setting to coordinate.</p></>)
  },
  {
    question: "What happens to operators Comet does not support?",
    answer: "Unsupported operators keep running in Spark, and Comet inserts the conversion the two sides need to exchange data. IOMETE turns on fallback reporting by default, so the query plan names each operator that fell back to Spark and the reason for it.",
    answerContent: (<><p>Unsupported operators keep running in Spark, and Comet inserts the conversion the two sides need to exchange data. An unusual data type, an untranslated expression, or a user-defined function all stay on the JVM.</p><p>IOMETE turns on fallback reporting by default, so the query plan names each operator that fell back to Spark and the reason for it.</p></>)
  },
  {
    question: "How does Comet affect executor memory on Kubernetes?",
    answer: "Comet needs an off-heap memory pool, and adding it on top of existing executor memory produces pods that no longer fit their nodes. IOMETE carves the pool out of the node budget instead: half of each executor node's memory goes to Comet, the JVM heap shrinks to match, and spark.iomete.comet.offHeap.fraction adjusts the split per compute.",
    answerContent: (<><p>Comet needs an off-heap memory pool, and adding it on top of existing executor memory produces pods that no longer fit their nodes, which shows up as Pending pods or OOMKilled executors.</p><p>IOMETE carves the pool out of the node budget instead. Half of each executor node's memory goes to Comet, the JVM heap shrinks to match, and <code>spark.iomete.comet.offHeap.fraction</code> adjusts the split per compute.</p></>)
  },
  {
    question: "Which workloads should keep Comet turned off?",
    answer: "Two kinds: workloads dominated by operators Comet cannot run natively, such as Scala or Python UDFs, and memory-constrained computes that depend on a large executor JVM heap for caching or for aggregations and joins that would otherwise spill. On IOMETE the switch is per compute, so a workload that regresses can stay on plain Spark while the rest of the platform runs accelerated.",
    answerContent: (<><p>Two kinds. Workloads dominated by operators Comet cannot run natively, such as Scala or Python UDFs, pay for columnar conversion at the boundary without the native speedup. Memory-constrained computes that depend on a large executor JVM heap for caching, or for aggregations and joins that spill once the heap shrinks, can also lose more than they gain; the driver heap is untouched.</p><p>On IOMETE the switch is per compute, so a workload that regresses can stay on plain Spark while the rest of the platform runs accelerated.</p></>)
  },
  {
    question: "Does Comet work with Apache Iceberg tables?",
    answer: "Yes. Comet 1.0 supports Iceberg 1.11 including format version 3, with native scans that decode straight into Arrow. Every table in IOMETE is an Iceberg table, so native Iceberg scans are enabled with the switch and the first scan of a query already runs in Rust.",
    answerContent: (<><p>Yes. Comet 1.0 supports Iceberg 1.11 including format version 3, with native scans that decode straight into Arrow.</p><p>Every table in IOMETE is an Iceberg table, so native Iceberg scans are enabled together with the switch, and the first scan of the first query already runs in Rust.</p></>)
  }
]} />
