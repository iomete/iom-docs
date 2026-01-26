---
title: Scaling Machine Learning: From Your Laptop to the IOMETE Lakehouse
description: We've all been there: You write a scikit-learn script on your laptop, it works beautifully on a sample of data, and then - BAM - you try to run it on the full dataset and see the dreaded out of memory error.
slug: scaling-machine-learning-laptop-to-iomete-lakehouse
authors: aytan
hide_table_of_contents: true
tags2: ["Technical", "Educational"]
coverImage: img/blog/2026-01-26-scaling-ml-laptop-to-lakehouse/cover.png
---

import Img from '@site/src/components/Img';

We've all been there: You write a scikit-learn script on your laptop, it works beautifully on a sample of data, and then - _BAM_ - you try to run it on the full dataset and see the dreaded out of memory error.

In this guide, we'll explore how to move your Machine Learning (ML) workloads from a single-node environment to a **Distributed Spark Cluster** using IOMETE. We'll also be honest about the "Spark Tax" and when it's actually worth paying. All codes referenced below are publicly available at [IOMETE ML Quickstart Repo](https://github.com/iomete/iomete-ml-quickstart).

<!-- truncate -->

## The Experiment: Synthetic Data at Scale

To demo the power of ML training on IOMETE, we generate synthetic data including three feature columns (x's below) using a random uniform distribution, and a "Target" (the label we want to predict) using a non-linear mathematical function:

<Img src="/img/blog/2026-01-26-scaling-ml-laptop-to-lakehouse/formula.png" alt="Formula: y = 2x₁ + 3x₂² - √x₃ + ε" />

_(Where epsilon is random Gaussian noise to make the target a little bit stochastic)_

Here is a code snippet:

```python
def generate_spark_data(spark, rows=10_000_000):
    print(f"Generating {rows} rows across the cluster...")

    # 1. Create an empty DataFrame with the desired number of rows
    # Spark distributes these rows across all workers immediately
    df = spark.range(0, rows)

    # 2. Use Spark SQL functions to generate random data in parallel
    df = df.withColumn("feature_col1", F.rand() * 100) \
           .withColumn("feature_col2", F.rand() * 100) \
           .withColumn("feature_col3", F.rand() * 100) \
           .withColumn("noise", F.randn() * 30)

    # 3. Apply your formula (y = 2x1 + 3x2^2 - sqrt(x3) + noise)
    # This calculation happens on the workers, not the driver!
    df = df.withColumn("target_col",
        (F.col("feature_col1") * 2) +
        (F.pow(F.col("feature_col2"), 2) * 3) -
        (F.sqrt(F.col("feature_col3"))) +
        F.col("noise")
    )

    # Drop the helper 'id' and 'noise' columns as we don't need them for ML training
    df = df.drop("id", "noise")
    return df
```

## Distributed Training in Action

When running ML workloads on IOMETE's distributed Spark cluster, the work is automatically distributed across multiple executors. Here's what that looks like in practice:

<Img src="/img/blog/2026-01-26-scaling-ml-laptop-to-lakehouse/executor-metrics.png" alt="Spark executor metrics dashboard showing distributed workload" />

The dashboard above shows how tasks are evenly distributed across 20+ executors, with each executor handling roughly equal work. This parallel execution is what enables processing of datasets that would crash a single machine.

### Spark Stages and Task Distribution

<Img src="/img/blog/2026-01-26-scaling-ml-laptop-to-lakehouse/spark-stages.png" alt="Spark UI showing completed stages for ML training" />

The Spark UI reveals the completed stages of our ML training job—44 stages completed successfully, with tasks distributed across 120 parallel workers for the heavier operations like `mapPartitions` and `treeAggregate`.

### Model Performance

After training on 10 million rows distributed across the cluster, our model achieves:

```
==============================
SPARK MODEL METRICS
R2 Score: 0.9805
RMSE:     1249.8114
MSE:      1562028.6346
==============================
```

An R² score of 0.9805 indicates the model explains 98% of the variance in our target variable—demonstrating that distributed ML training on IOMETE delivers production-quality results at scale.
