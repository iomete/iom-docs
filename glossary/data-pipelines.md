---
title: Data Pipelines
description: A data pipeline is a series of steps that move data from one system to another, encompassing the source, processing steps, and destination.
banner_description: A data pipeline is a series of steps that move data from one system to another, encompassing the source, processing steps, and destination. Data can be modified during the transfer process, and some pipelines may be used to transform data.
alphabet: D
---

# Data Pipelines

## What is a Data Pipeline?

A data pipeline is a series of steps that move data from one system to another, encompassing the source, processing steps, and destination. Data can be modified during the transfer process, and some pipelines may be used to transform data. There are different types of data pipelines, such as batch and streaming pipelines. A Lambda architecture combines batch-processing and stream-processing methods, while a Delta architecture provides a simpler alternative that ingests, processes, stores, and manages data within Delta Lake.

## How to Build a Data Pipeline?

Building a data pipeline can be done by data engineers, who write code to access data sources, perform transformations, and transfer data to target systems. However, this requires an ongoing investment of time, coding, and engineering resources. An alternative is to use providers that have automated the process of defining end-to-end pipelines. Data pipelines are crucial for modern organizations that rely on data, ensuring data ends up where it should go, helping keep formats consistent, and maintaining high data quality. ETL is a type of data pipeline used to pull data from one database and move it to another, while some data pipelines may not involve data transformation. Tools such as Apache Spark and Apache Iceberg can be used to build and maintain data pipelines.
