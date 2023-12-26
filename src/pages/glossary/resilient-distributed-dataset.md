---
title:  What is Resilient Distributed Dataset (RDD)?
description: Explore Resilient Distributed Datasets (RDDs), the primary user-facing API in Spark known for their immutable distributed collections of data elements partitioned across nodes in a cluster. Understand how RDDs offer parallel operation using a low-level API that provides transformations and actions. Learn five reasons to use RDDs, including the need for low-level control over datasets, handling unstructured data, preference for functional programming constructs, lack of a required schema, and willingness to forgo some optimization and performance benefits available with DataFrames and Datasets for structured and semi-structured data.
---

# Resilient Distributed Dataset (RDD)

RDDs have been the primary user-facing API in Spark since its inception. At their core, RDDs are immutable distributed collections of data elements that are partitioned across nodes in a cluster, allowing for parallel operation using a low-level API that offers transformations and actions.

If you're wondering when to use RDDs, here are five reasons:

1. You need low-level control over your dataset, including transformations and actions.
2. Your data is unstructured, such as media streams or streams of text.
3. You prefer to manipulate your data using functional programming constructs rather than domain-specific expressions.
4. You don't require a schema, such as a columnar format, while processing or accessing data attributes by name or column.
5. You're willing to forgo some optimization and performance benefits available with DataFrames and Datasets for structured and semi-structured data.
