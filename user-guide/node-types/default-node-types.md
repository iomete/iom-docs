---
title: Default Node Types
sidebar_label: Default Node Types
description: Pre-configured node types that IOMETE imports on first startup for each cloud provider.
last_update:
  date: 03/25/2026
  author: Abhishek Pathania
---

IOMETE ships defaults tailored to each cloud provider, imported on first startup. You can edit or delete any of them at any time. See [Node Types Overview](./overview) for background and [Node Type Sizing](./node-type-sizing) for guidance on choosing the right size.

## On-Premises

On-premises defaults use fixed CPU and memory values with no cloud-provider overhead applied.

| Name | Component | CPU | Memory | Description |
| --- | --- | --- | --- | --- |
| driver-x-small | Driver | 1 vCPU | 4 GiB | Extra-small driver |
| driver-small | Driver | 1 vCPU | 8 GiB | Small driver |
| driver-medium | Driver | 2 vCPU | 16 GiB | Medium driver |
| driver-large | Driver | 4 vCPU | 32 GiB | Large driver |
| exec-x-small | Executor | 2 vCPU | 8 GiB | Extra-small executor |
| exec-small | Executor | 2 vCPU | 16 GiB | Small executor |
| exec-medium | Executor | 8 vCPU | 64 GiB | Medium executor |
| exec-large | Executor | 16 vCPU | 128 GiB | Large executor |

## AWS

AWS defaults reflect allocatable CPU and memory after Kubernetes system overhead, so the numbers aren't round. Executor node types include spot-instance support.

| Name | Component | CPU | Memory | Spot | Description |
| --- | --- | --- | --- | --- | --- |
| driver-small | Driver | ~1 vCPU | ~6 GiB | No | small (1vCPU/8GB) |
| driver-medium | Driver | ~2 vCPU | ~14 GiB | No | medium (2vCPU/16GB) |
| driver-large | Driver | ~4 vCPU | ~29 GiB | No | large (4vCPU/32GB) |
| exec-small | Executor | ~2 vCPU | ~14 GiB | Yes | small (2vCPU/16GB/118GB SSD) |
| exec-medium | Executor | ~8 vCPU | ~61 GiB | Yes | medium (8vCPU/64GB/474GB SSD) |
| exec-large | Executor | ~16 vCPU | ~123 GiB | Yes | large (16vCPU/128GB/950GB NVMe) |

## GCP

GCP defaults map to specific machine types. Values reflect allocatable resources after Kubernetes overhead.

| Name | Component | CPU | Memory | Description |
| --- | --- | --- | --- | --- |
| driver-small | Driver | ~1 vCPU | ~2 GiB | e2-medium (2vCPU/4GB) |
| driver-medium | Driver | ~2 vCPU | ~9 GiB | e2-highmem-2 (2vCPU/16GB) |
| driver-large | Driver | ~4 vCPU | ~24 GiB | e2-highmem-4 (4vCPU/32GB) |
| executor-small | Executor | ~2 vCPU | ~9 GiB | c2d-highmem-2 (2vCPU/16GB/375GB SSD) |
| executor-medium | Executor | ~4 vCPU | ~24 GiB | c2d-highmem-4 (4vCPU/32GB/375GB SSD) |
| executor-large | Executor | ~8 vCPU | ~54 GiB | c2d-highmem-8 (8vCPU/64GB/700GB SSD) |

## Azure

Azure defaults omit explicit CPU and memory columns because the values come directly from the VM SKU described in each row.

| Name | Component | Description |
| --- | --- | --- |
| driver-small | Driver | small (2vCPU/16GB) |
| driver-medium | Driver | medium (4vCPU/32GB) |
| exec-small | Executor | small (2vCPU/16GB/75GB NVMe) |
| exec-medium | Executor | medium (8vCPU/64GB/300GB NVMe) |
| exec-large | Executor | large (16vCPU/128GB/600GB NVMe) |
