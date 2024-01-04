---
title: ML Pipelines
description: Machine learning algorithms involve multiple stages, from pre-processing to feature extraction, model fitting, and validation.
banner_description: Machine learning algorithms involve multiple stages, from pre-processing to feature extraction, model fitting, and validation. Connecting these stages, especially with large-scale datasets, can be challenging. Many ML libraries are not optimized for distributed computation or pipeline creation and tuning.
alphabet: M
---

# ML Pipelines

Machine learning algorithms involve multiple stages, from pre-processing to feature extraction, model fitting, and validation. Connecting these stages, especially with large-scale datasets, can be challenging. Many ML libraries are not optimized for distributed computation or pipeline creation and tuning.

Fortunately, the ML Pipelines API for MLlib, located under the "spark.ml" package, offers a solution. A pipeline is a sequence of stages, including Transformer and Estimator. Transformers enhance datasets, while Estimators generate models that transform input datasets. This powerful tool simplifies tasks like classifying text documents by handling segmentation, text cleaning, feature extraction, and training a classification model with cross-validation.
