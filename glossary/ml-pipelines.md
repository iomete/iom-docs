---
title:  What are ML Pipelines?
description: Explore ML Pipelines, a crucial aspect of machine learning that addresses the challenges of connecting various stages like pre-processing, feature extraction, model fitting, and validation. Learn about the ML Pipelines API in MLlib, specifically under the "spark.ml" package, which provides a solution for creating and tuning pipelines, particularly suitable for large-scale datasets. Understand the key components, including Transformers and Estimators, and discover how this powerful tool simplifies tasks such as classifying text documents through segmentation, cleaning, feature extraction, and training with cross-validation.
---

# ML Pipelines

Machine learning algorithms involve multiple stages, from pre-processing to feature extraction, model fitting, and validation. Connecting these stages, especially with large-scale datasets, can be challenging. Many ML libraries are not optimized for distributed computation or pipeline creation and tuning.

Fortunately, the ML Pipelines API for MLlib, located under the "spark.ml" package, offers a solution. A pipeline is a sequence of stages, including Transformer and Estimator. Transformers enhance datasets, while Estimators generate models that transform input datasets. This powerful tool simplifies tasks like classifying text documents by handling segmentation, text cleaning, feature extraction, and training a classification model with cross-validation.
