---
title: "Sovereign AI: Run ML on a Private-Cloud Lakehouse"
description: "Sovereign AI keeps model training and ML on your private cloud. Here is how to run feature engineering, training, and notebooks on a self-hosted lakehouse."
slug: sovereign-ai-ml-private-cloud-lakehouse
tags2: [Technical, Company]
authors: [aytan]
hide_table_of_contents: false
coverImage: img/blog/thumbnails/3.png
---

import FAQSection from '@site/src/components/FAQSection';

Most machine learning starts on a laptop. A data scientist pulls a sample, fits a model in scikit-learn, and everything works – until the sample stops being representative and the real dataset is 200 million rows sitting in a system the laptop cannot reach. The usual fix is to copy that data somewhere the ML tooling lives. For a regulated bank, a government agency, or any team with data-residency obligations, that copy is the moment sovereignty breaks.

Sovereign AI is the practice of training and serving models without that copy ever happening. The feature engineering, the training runs, the notebooks, and the model artifacts all stay inside your private cloud, on data that never leaves your perimeter. This post – part of a cluster on the [sovereign data platform](/resources/blog/sovereign-data-platform-private-cloud-ai) – is about how that works in practice.

{/* truncate */}

## What sovereign AI means

Sovereign AI is AI and ML where the training data, compute, feature store, and model artifacts all stay inside infrastructure the customer controls. The data is never moved to a vendor's environment to be trained on; the models come to the data instead.

That definition rules out a common pattern: data lives under a residency mandate, but the ML platform sits in a managed cloud, so teams quietly export "just the training set" to get work done. The export is rarely logged the way the source system is, rarely masked the way production is, and almost never reproducible a year later when an auditor asks which exact rows produced a given model. Sovereign AI closes that gap by keeping the whole lifecycle in one governed place.

## Why ML breaks sovereignty by default

ML workloads pull hard against data control for three reasons, and each one is structural rather than a tooling preference.

**Scale forces data movement.** Training on real volumes needs distributed compute. If that compute lives in a different environment than the data, the data has to travel to it. Teams that start on a laptop hit an out-of-memory wall, and the path of least resistance is to ship the data to wherever the GPUs and clusters already are.

**Feature pipelines fan out copies.** A feature store, an experiment-tracking system, and a model registry each tend to hold their own slice of the data. Every copy is a new place PII can leak and a new thing to govern. Without a single platform, governance is applied unevenly across all of them.

**Reproducibility gets dropped first.** Under deadline pressure, "which version of the data trained this model" is the question nobody answers. When the data has been copied across three systems, answering it later is often impossible. That is fine until a regulator, an incident, or a model rollback makes it urgent.

A platform that runs ML directly against governed lakehouse data removes all three pressures at once – because there is nothing to move, nothing to copy, and one place where lineage is recorded.

## Running ML on a self-hosted lakehouse

The architecture that makes sovereign AI practical is a lakehouse that treats ML as a first-class workload rather than a bolt-on. A few pieces matter.

**Distributed feature engineering where the data lives.** [Apache Spark](https://spark.apache.org/) runs feature pipelines across the cluster, against the same tables that serve BI and analytics. There is no separate copy of the data for ML – the feature engineering reads the lakehouse directly. The honest version of this also tells you when Spark is overkill: small data is faster in single-node Python, and a good platform lets you choose rather than forcing distribution on every job. The practicalities are covered in [scaling machine learning from your laptop to the lakehouse](/resources/blog/scaling-machine-learning-iomete-lakehouse).

**Notebook-native workflows inside the perimeter.** Data scientists work in Jupyter notebooks that execute against lakehouse data through Spark, inside the same Kubernetes environment as the platform. The notebook, the data, and the compute are all in your account – not a hosted notebook service reaching back into your systems.

**Reproducibility through time travel.** Apache Iceberg's time travel and dataset tagging let you pin every training run to the exact table snapshot it used. A model is no longer "trained on the customer table" – it is trained on a specific, named version you can reconstruct on demand. That is the difference between a model you can defend in an audit and one you cannot.

**Streaming features without a separate stack.** High-velocity events can be written straight into ACID-compliant Iceberg tables through a simple HTTP ingestion layer, so real-time features and batch features share one storage layer instead of two pipelines that drift apart.

For the AI-agent generation of workloads specifically, [local enterprise AI development](/resources/blog/local-enterprise-ai-development-iomete) goes into how agents query governed data without leaving the perimeter.

## Governance is what makes it trustworthy

Sovereign AI is not only about location. Only 20% of enterprises report a mature governance model for autonomous AI agents, and that gap is where most AI risk actually lives. Running ML on the lakehouse means the same controls that protect production data protect the training process:

- Row-level, column-level, and tag-based access control, so a training job sees only the data its owner is cleared for.
- Dynamic masking of PII and PHI, applied in the query path rather than in a one-off pre-processing script that someone forgets to run.
- Lineage and AI-readable documentation, so every feature and model has a traceable origin.

When governance lives in the platform, you do not re-implement it per ML tool. That is the practical reason to keep [on-premises data engineering, ML, and AI](/resources/blog/on-prem-data-engineering-ml-ai) on one system rather than a federation of point tools.

## How IOMETE runs sovereign AI

[IOMETE](https://iomete.com/product/data-platform/machine-learning) runs the full ML lifecycle on a self-hosted lakehouse inside your own Kubernetes clusters. Feature engineering runs on Apache Spark against Apache Iceberg tables; data scientists work in notebooks that execute in the same environment; time travel and dataset tagging give every model a reproducible data version; and the platform's row-, column-, and tag-based access controls plus dynamic masking apply to training and serving alike. None of it requires the data to leave your perimeter, and the platform supports fully air-gapped deployment.

This is not theoretical at scale. Dell Technologies consolidated analytics, ML, and streaming onto a single IOMETE lakehouse – 40,000+ vCPUs across more than 40 PB, multi-tenant and multi-region, in production for over two years. The same architecture runs in air-gapped government and central-banking environments where sending data to a managed AI service was never an option.

For the broader picture, start with the [sovereign data platform pillar](/resources/blog/sovereign-data-platform-private-cloud-ai); for the infrastructure underneath, see the [self-hosted data platform architecture](/resources/blog/self-hosted-data-platform-private-cloud-architecture).

## FAQ

<FAQSection faqs={[
  {
    question: "What is sovereign AI?",
    answerContent: (
      <>
        <p>Sovereign AI is machine learning and AI where the training data, compute, feature store, and model artifacts all stay inside infrastructure the customer controls, rather than being moved to a vendor's environment.</p>
        <p>The models are brought to the data instead of the data being copied to the models, which keeps the entire ML lifecycle inside the customer's security perimeter and under one governance model.</p>
      </>
    )
  },
  {
    question: "Can you train machine learning models without moving data to the cloud?",
    answerContent: (
      <>
        <p>Yes. A self-hosted lakehouse runs distributed feature engineering and model training directly against the data where it already lives, so no copy to an external cloud is required.</p>
        <p>On IOMETE this runs on Apache Spark against Apache Iceberg tables inside your own Kubernetes clusters, including fully air-gapped environments.</p>
      </>
    )
  },
  {
    question: "How do you make ML training reproducible for audits?",
    answerContent: (
      <>
        <p>Pin every training run to a specific data snapshot using table time travel and dataset tagging, so the exact rows that produced a model can be reconstructed later.</p>
        <p>Apache Iceberg's time travel makes this native to the lakehouse: a model is tied to a named table version rather than to "the data as it was at the time," which is what an auditor or a rollback actually needs.</p>
      </>
    )
  },
  {
    question: "When is Apache Spark worth it for machine learning?",
    answerContent: (
      <>
        <p>Spark is worth it when the dataset no longer fits comfortably in single-node memory or when feature pipelines need to run across a cluster. For small samples, single-node Python is usually faster.</p>
        <p>A good sovereign platform lets you choose per job instead of forcing distributed execution on everything, so you only pay the Spark overhead when scale justifies it.</p>
      </>
    )
  },
  {
    question: "How is governance applied to ML on a lakehouse?",
    answerContent: (
      <>
        <p>The same row-level, column-level, and tag-based access controls and dynamic masking that protect production data are applied to training and serving queries.</p>
        <p>Because governance lives in the platform rather than in each ML tool, a training job only sees the data its owner is cleared for, and PII masking happens in the query path automatically.</p>
      </>
    )
  },
  {
    question: "Can AI agents query enterprise data without it leaving the perimeter?",
    answerContent: (
      <>
        <p>Yes. When agents query a self-hosted lakehouse, the data and the compute both stay inside the customer's infrastructure, and the same access controls and lineage apply to agent queries as to human ones.</p>
        <p>This is the safer pattern for the 80% of enterprises that lack a tested governance model for autonomous agents, because it keeps agent activity inside one auditable system.</p>
      </>
    )
  },
  {
    question: "Do streaming and batch features need separate pipelines?",
    answerContent: (
      <>
        <p>No. High-velocity events can be written directly into ACID-compliant Iceberg tables, so real-time and batch features share one storage layer instead of two pipelines that drift apart.</p>
        <p>On IOMETE a simple HTTP-based ingestion layer writes streams straight into Iceberg, avoiding a separate streaming stack to author and maintain.</p>
      </>
    )
  },
  {
    question: "Does sovereign AI mean giving up modern ML tooling?",
    answerContent: (
      <>
        <p>No. Sovereign AI runs standard tools – Spark, Python, Jupyter notebooks, Iceberg – inside your perimeter rather than swapping them for proprietary equivalents.</p>
        <p>The constraint is on where the workload runs, not on which libraries or frameworks you use, so data science teams keep their existing skills and workflows.</p>
      </>
    )
  }
]} />
