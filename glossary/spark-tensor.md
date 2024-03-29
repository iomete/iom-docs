---
title: Sparse Tensor
description: Leverage Sparse Tensor in pytensor for efficient multi-dimensional array handling. Explore Sptensor, a vital class representing sparse tensors.
banner_description: Sparse Tensor is a powerful tool for handling multi-dimensional arrays and serves as a vital component in developing the pytensor library. One of the key classes in pytensor is the Sptensor, which represents sparse tensors.
alphabet: S
---

# Sparse Tensor

## What is Sparse Tensor?

**Sparse Tensor** is a powerful tool for handling multi-dimensional arrays and serves as a vital component in developing the pytensor library. One of the key classes in pytensor is the Sptensor, which represents sparse tensors. Sparse tensors are datasets with mostly zero entries, like large diagonal matrices. Sptensors store only non-zero values and their coordinates, reducing storage needs and avoiding unnecessary calculations with zero values.

Sptensors have several primary attributes:

- `vals` (a 1D array of non-zero values)
- `subs` (a 2D array of coordinates)
- `shape` (the sparse tensor's shape)

The class also includes various functions such as:

- `tondarray` (returning a numpy.ndarray object with the same values as the sptensor)
- `permute` (returning a permuted sptensor object)
- `nnz` (returning the number of non-zero elements in the sptensor).

Understanding the Sptensor class and its functions is crucial when working with tensors in Python.
