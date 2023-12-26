---
title: Bayesian Neural Network (BNN)
description: Delve into Bayesian Neural Networks (BNNs), a neural network variant employing statistical methodology. BNNs uniquely assign probability distributions to all elements, including model parameters, enhancing the understanding and uncertainty estimation in neural network predictions.
---

# Bayesian Neural Network

## What Are Bayesian Neural Networks and Their Advantages?
Bayesian Neural Networks (BNNs) are a type of neural network that uses statistical methodology to attach a probability distribution to everything, including model parameters. By extending standard networks with posterior inference, BNNs can control over-fitting and obtain better results for a vast number of tasks, especially in domains where data is scarce, such as molecular biology and medical diagnosis.

One of the main advantages of BNNs is the ability to estimate uncertainty in predictions, which is a great feature for fields like medicine. Additionally, BNNs allow you to automatically calculate an error associated with your predictions when dealing with data of unknown targets.

Moreover, Bayesian methods enable you to consider an entire distribution of answers, which is useful for addressing issues such as regularization and model selection/comparison without the need for a separate cross-validation data set.

Recently, there has been a lot of activity in this area, with the advent of numerous probabilistic programming libraries such as PyMC3, Edward, Stan, etc. Bayesian methods are used in lots of fields, from game development to drug discovery.
