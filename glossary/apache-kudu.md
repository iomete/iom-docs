---
title: Apache Kudu
description: Apache Kudu is a free and open-source columnar storage system developed for Apache Hadoop. This engine is designed for structured data and supports low-latency random access to individual rows, along with efficient analytical access patterns. Kudu bridges the gap between the widely used Hadoop Distributed File System and HBase NoSQL Database.
tags: [a]
---

## What is Apache Kudu?

Apache Kudu is a free and open-source columnar storage system developed for Apache Hadoop. This engine is designed for structured data and supports low-latency random access to individual rows, along with efficient analytical access patterns. Kudu bridges the gap between the widely used Hadoop Distributed File System and HBase NoSQL Database.

### Real-time analytics on fast data

Apache Kudu combines the advantages of HBase and Parquet. It's as fast as HBase for data ingestion and nearly as quick as Parquet for analytical queries. Kudu supports various query types, enabling you to:

- Search for a specific value using its key.
- Search for a range of sorted keys.
- Execute arbitrary queries across multiple columns.

### Fully distributed and fault-tolerant

Apache Kudu employs the RAFT consensus algorithm, allowing for horizontal scaling as needed. It also supports an update-in-place feature.

### Optimized for next-generation hardware

Kudu is optimized for SSDs and designed to leverage the upcoming generation of persistent memory. It can scale to tens of cores per server and benefit from SIMD operations for data-parallel computation.

### Supports mutability for BI on big data

Kudu features a 'slowly changing dimension' (SCD), which enables users to track changes within dimensional reference data.

### SQL support with Spark or Impala

If you want to access data via SQL, Apache Kudu offers tight integration with Apache Impala and Spark. As a result, you can use these tools to insert, query, update, and delete data from Kudu tablets using SQL syntax. Additionally, you can connect existing or new applications, frameworks, and business intelligence tools to your Kudu data via JDBC or ODBC, using Impala as the intermediary.
