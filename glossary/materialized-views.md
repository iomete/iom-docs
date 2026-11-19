---
title: Materialized Views
description: Materialized views differ from regular database views as they store precomputed data as a physical table.
banner_description: Materialized views differ from regular database views as they store precomputed data as a physical table. This feature makes them well-suited for handling complex queries or aggregations that are frequently performed.
alphabet: M
---

# Materialized Views

**Materialized views** differ from regular database views as they store precomputed data as a physical table. This feature makes them well-suited for handling complex queries or aggregations that are frequently performed.

On IOMETE Spark 4 clusters, you create a materialized view with [Spark Declarative Pipelines](/reference/spark-4-features#declarative-pipelines): define the view in a pipeline's SQL or Python file and run the pipeline over Spark Connect with the `spark-pipelines` CLI. Running `CREATE MATERIALIZED VIEW` directly in the SQL Editor or in a Spark job isn't supported. To refresh the view, run the pipeline again.
