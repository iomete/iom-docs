---
title: Apache Kylin
description: Supercharge analytics with Apache Kylin—a distributed OLAP engine for Big Data. Use SQL, integrate seamlessly with BI tools via ODBC, JDBC, and REST APIs.
banner_description: Apache Kylin is a distributed open-source online analytics processing (OLAP) engine designed for interactive Big Data analytics. It provides a SQL interface and multi-dimensional analysis (OLAP) on Hadoop and Spark and easily integrates with BI tools through ODBC drivers, JDBC drivers, and REST APIs.
alphabet: A
---

## What is Apache Kylin?

Apache Kylin is a distributed open-source online analytics processing (OLAP) engine designed for interactive Big Data analytics. It provides a SQL interface and multi-dimensional analysis (OLAP) on Hadoop and Spark and easily integrates with BI tools through ODBC drivers, JDBC drivers, and REST APIs.

Created by eBay in 2014, it became a Top-Level Project of the Apache Software Foundation in 2015 and won the Best Open Source Big Data Tool award in 2015 and 2016. Today, thousands of companies worldwide rely on Apache Kylin for their critical analytics applications. Unlike other OLAP engines, Kylin delivers query responses in milliseconds and offers sub-second query latency on datasets scaling to petabytes. This speed is achieved by precomputing dimensional combinations and measure aggregates using Hive queries and populating HBase with the results.

## How Does Apache Kylin Work?

Kylin's query engine can be accessed through its user-friendly UI, an API, or via JDBC. It leverages the Apache Calcite query processor and HBase features for rapid lookups. Kylin depends on the Hadoop ecosystem:

- **Hive** – Input source, pre-join star schema during cube building
- **MapReduce** – Aggregate metrics during cube building
- **HDFS** – Store intermediate files during cube building
- **HBase** – Store and query data cubes
- **Calcite** – SQL parsing, code generation, optimization

## How Can Apache Kylin Benefit Your Organization?

- **Very Fast OLAP Engine at Scale** – Kylin reduces query latency on Hadoop for 10+ billion-row datasets to seconds.
- **ANSI SQL Interface on Hadoop** – Kylin supports most ANSI SQL query functions, making it accessible to analysts and engineers without programming.
- **Seamless Integration with BI Tools** – Kylin integrates with BI tools like Tableau, JDBC, ODBC and Rest API.
- **Interactive Query Capability** – Users can interact with Hadoop data via Kylin at sub-second latency.
- **MOLAP Cube Query Serving on Billions of Rows** – Users can define a data model and pre-build it in Kylin, even with 10+ billion raw data records.

**Open-source ODBC driver** – Kylin's ODBC driver is built from scratch and works seamlessly with Tableau.
