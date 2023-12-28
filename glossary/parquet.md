---
title: Parquet
description: Apache Parquet is an open-source, column-oriented data file format designed for efficient data storage and retrieval. It offers effective data compression and encoding schemes, enhancing performance when handling large amounts of complex data. Apache Parquet serves as a common interchange format for both batch and interactive workloads.
tags: [p]
---

# Parquet

## What is Parquet?

**Apache Parquet** is an open-source, column-oriented data file format designed for efficient data storage and retrieval. It offers effective data compression and encoding schemes, enhancing performance when handling large amounts of complex data. Apache Parquet serves as a common interchange format for both batch and interactive workloads.

## Characteristics of Parquet

- **Free and open-source file format**
- **Language agnostic**
- **Column-based format** - organizes files by column rather than row, saving storage space and accelerating analytics queries
- **Used for analytics (OLAP) use cases**, typically alongside traditional OLTP databases
- **Highly efficient** data compression and decompression
- **Supports complex data types** and advanced nested data structures

## Benefits of Parquet

- **Suitable for storing various types of big data** (structured data tables, images, videos, documents)
- **Saves cloud storage space** through efficient column-wise compression and flexible encoding schemes for columns with different data types
- **Boosts data throughput and performance** using techniques like data skipping, allowing queries to fetch specific column values without reading the entire row of data

Apache Parquet employs the record-shredding and assembly algorithm, which supports the complex data structures used for data storage. Parquet is optimized for handling large amounts of complex data and offers various methods for efficient data compression and encoding types. This approach is especially beneficial for queries that need to read specific columns from a large table, as Parquet only reads the required columns, significantly reducing IO.

## Advantages of Storing Data in a Columnar Format:

- Columnar storage, like Apache Parquet, offers efficiency compared to row-based files like CSV. When querying columnar storage, non-relevant data can be quickly skipped, making aggregation queries faster than row-oriented databases. This storage method results in hardware savings and reduced latency when accessing data.
- Apache Parquet is built from the ground up to support advanced nested data structures. Its data file layout is optimized for queries that process large data volumes, with each file typically in the gigabyte range.
- Parquet supports flexible compression options and efficient encoding schemes. Since data types for each column are similar, column compression is straightforward, further speeding up queries. Data can be compressed using one of several available codecs, allowing different data files to be compressed differently.
- Apache Parquet works well with interactive and serverless technologies like AWS Athena, Amazon Redshift Spectrum, Google BigQuery, and Google Dataproc.

## Difference Between Parquet and CSV

CSV is a simple, widely-used format compatible with many tools such as Excel, Google Sheets, and others. Although CSV files are the default format for data processing pipelines, they have some disadvantages:

- Amazon Athena and Spectrum charge based on the amount of data scanned per query
- Google and Amazon charge according to the amount of data stored on GS/S3
- Google Dataproc charges are time-based

Parquet has helped users reduce storage requirements by at least one-third for large datasets while significantly improving scan and deserialization times, reducing overall costs. The following table compares the savings and speedup achieved by converting data from CSV to Parquet.
