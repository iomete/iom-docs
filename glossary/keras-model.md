---
title: Keras Model
description: Keras is a powerful high-level library for deep learning built on top of Theano and Tensorflow. It provides an easy and efficient way to create a range of deep learning models in Python. Keras has become one of the most popular high-level neural network APIs for developing and testing neural networks.
---

# Keras Model

## What is Keras Model?

Keras is a powerful high-level library for deep learning built on top of Theano and Tensorflow. It provides an easy and efficient way to create a range of deep learning models in Python. Keras has become one of the most popular high-level neural network APIs for developing and testing neural networks. A Keras model is made up of fully configurable modules that can be combined to create new models.

These modules include neural layers, cost functions, optimizers, initialization schemes, dropout, loss, activation functions, and regularization schemes. One of the main advantages of Keras is its modularity, allowing easy addition of new features as separate modules, making it flexible and suitable for innovative research.

## Sequential and Functional Development of Keras Model

There are two ways to develop a Keras model: Sequential and Functional.

### Sequential API

The Sequential API is the simplest model, ideal for configuring models layer-by-layer for most problems. However, it is limited in its topology and does not allow configuring models with shared layers or multiple inputs or outputs.

### Functional API

The Functional API is ideal for creating complex models that require extended flexibility. It allows you to define models featuring layers connected to more than just the previous and next layers. With this model, you can connect layers to any other layer, making it possible to create complex networks such as siamese networks, residual networks, multi-input/multi-output models, directed acyclic graphs (DAGs), and models with shared layers.
