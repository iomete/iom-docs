---
title: Convolutional Layer
description: A convolutional neural network (CNN or ConvNet) is a type of deep neural network used for recognizing patterns in images, as well as for spatial data analysis, computer vision, natural language processing, signal processing, and more.
alphabet: C
---

# Convolutional Layer

## What is a Convolutional Layer?

A convolutional neural network (CNN or ConvNet) is a type of deep neural network used for recognizing patterns in images, as well as for spatial data analysis, computer vision, natural language processing, signal processing, and more. The architecture of a Convolutional Network is inspired by the organization of the Visual Cortex and resembles the connectivity pattern of neurons in the human brain.

CNNs use filters (or kernels) to detect features like edges in an image. The four main operations in a CNN are Convolution, Non-Linearity (ReLU), Pooling or Sub-Sampling, and Classification (Fully Connected Layer).

The first layer of a CNN is always a Convolutional Layer, which applies a convolution operation to the input. The most common type of convolution used is the 2D convolution layer (conv2D), which "slides" over the 2D input data, performing an element-wise multiplication. Dilated or Atrous Convolutions and Separable Convolutions are other types of convolutions that can be used in different applications. Transposed Convolutions, also known as deconvolutions or fractionally strided convolutions, carry out a regular convolution but revert its spatial transformation
