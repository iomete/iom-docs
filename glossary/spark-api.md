---
title: Spark API
description: If you're working with Spark, you'll encounter three APIs - DataFrames, Datasets, and RDDs (Resilient Distributed Datasets).
tags: [s]
---

# Spark API

If you're working with Spark, you'll encounter three APIs: DataFrames, Datasets, and RDDs (Resilient Distributed Datasets).

**RDDs** are fault-tolerant, immutable collections of records that support parallel processing. They can be transformed using low-level APIs and are known for their lazy feature, which speeds up Spark operations.

**DataFrames** are distributed collections of rows with named columns, similar to an Excel sheet or a table in a relational database. They're immutable, lazily evaluated, and distributed, just like RDDs. DataFrames can be created in several ways, including loading data from different formats or an existing RDD.

**Datasets** are strongly-typed, immutable collections of objects mapped to a relational schema. They can be created dynamically or by reading from a JSON file using SparkSession.

While each API has its advantages, they also come with their own set of disadvantages, such as the need to optimize RDDs and the requirement for typecasting with Datasets.
