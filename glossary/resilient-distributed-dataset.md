---
title: Resilient Distributed Dataset (RDD)
description: RDDs, Spark's API, are immutable distributed collections across nodes, enabling parallel operations through a low-level interface with transformations and actions.
banner_description: RDDs have been the primary user-facing API in Spark since its inception. At their core, RDDs are immutable distributed collections of data elements that are partitioned across nodes in a cluster, allowing for parallel operation using a low-level API that offers transformations and actions.
alphabet: R
---

# Resilient Distributed Dataset (RDD)

RDDs have been the primary user-facing API in Spark since its inception. At their core, RDDs are immutable distributed collections of data elements that are partitioned across nodes in a cluster, allowing for parallel operation using a low-level API that offers transformations and actions.

If you're wondering when to use RDDs, here are five reasons:

1. You need low-level control over your dataset, including transformations and actions.
2. Your data is unstructured, such as media streams or streams of text.
3. You prefer to manipulate your data using functional programming constructs rather than domain-specific expressions.
4. You don't require a schema, such as a columnar format, while processing or accessing data attributes by name or column.
5. You're willing to forgo some optimization and performance benefits available with DataFrames and Datasets for structured and semi-structured data.
