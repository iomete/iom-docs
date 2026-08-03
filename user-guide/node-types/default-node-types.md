---
title: Default Node Types
sidebar_label: Default Node Types
description: Pre-configured node types that IOMETE imports on first startup for each cloud provider.
last_update:
  date: 07/29/2026
  author: Abhishek Pathania
---

IOMETE ships defaults tailored to each cloud provider, imported on first startup. You can edit or delete any of them at any time. See [Node Types Overview](./overview) for background and [Node Type Sizing](./node-type-sizing) for guidance on choosing the right size.

## On-Premises

On-premises defaults use fixed CPU and memory values with no cloud-provider overhead applied.

| Name | Component | CPU | Memory | Description |
| --- | --- | --- | --- | --- |
| driver-small | Driver | 1 vCPU | 8 GiB | Small driver |
| driver-medium | Driver | 2 vCPU | 16 GiB | Medium driver |
| driver-large | Driver | 4 vCPU | 32 GiB | Large driver |
| driver-x-large | Driver | 8 vCPU | 64 GiB | Extra-large driver |
| exec-small | Executor | 2 vCPU | 16 GiB | Small executor |
| exec-medium | Executor | 4 vCPU | 32 GiB | Medium executor |
| exec-large | Executor | 8 vCPU | 64 GiB | Large executor |
| exec-x-large | Executor | 16 vCPU | 128 GiB | Extra-large executor |

## AWS

AWS defaults reflect allocatable CPU and memory after Kubernetes system overhead, so the numbers aren't round. Executor node types include spot-instance support.

| Name | Component | CPU | Memory | Spot | Description |
| --- | --- | --- | --- | --- | --- |
| driver-small | Driver | ~1 vCPU | ~6 GiB | No | small (1vCPU/8GiB) |
| driver-medium | Driver | ~2 vCPU | ~14 GiB | No | medium (2vCPU/16GiB) |
| driver-large | Driver | ~4 vCPU | ~29 GiB | No | large (4vCPU/32GiB) |
| driver-x-large | Driver | ~8 vCPU | ~61 GiB | No | x-large (8vCPU/64GiB) |
| exec-small | Executor | ~2 vCPU | ~14 GiB | Yes | small (2vCPU/16GiB/118GB SSD) |
| exec-medium | Executor | ~4 vCPU | ~29 GiB | Yes | medium (4vCPU/32GiB/237GB SSD) |
| exec-large | Executor | ~8 vCPU | ~61 GiB | Yes | large (8vCPU/64GiB/474GB SSD) |
| exec-x-large | Executor | ~16 vCPU | ~123 GiB | Yes | x-large (16vCPU/128GiB/950GB NVMe) |

## GCP

GCP defaults map to specific machine types. Values reflect allocatable resources after Kubernetes overhead, which on GKE is substantial: each tier therefore sits on a larger machine than the equivalent tier on other providers.

| Name | Component | CPU | Memory | Description |
| --- | --- | --- | --- | --- |
| driver-small | Driver | ~2 vCPU | ~9 GiB | e2-highmem-2 (2vCPU/16GiB) |
| driver-medium | Driver | ~4 vCPU | ~24 GiB | e2-highmem-4 (4vCPU/32GiB) |
| driver-large | Driver | ~8 vCPU | ~54 GiB | e2-highmem-8 (8vCPU/64GiB) |
| driver-x-large | Driver | ~16 vCPU | ~115 GiB | e2-highmem-16 (16vCPU/128GiB) |
| exec-small | Executor | ~2 vCPU | ~9 GiB | c2d-highmem-2 (2vCPU/16GiB/375GB SSD) |
| exec-medium | Executor | ~4 vCPU | ~24 GiB | c2d-highmem-4 (4vCPU/32GiB/375GB SSD) |
| exec-large | Executor | ~8 vCPU | ~54 GiB | c2d-highmem-8 (8vCPU/64GiB/700GB SSD) |
| exec-x-large | Executor | ~16 vCPU | ~115 GiB | c2d-highmem-16 (16vCPU/128GiB/1500GB SSD) |

## Azure

Azure defaults reflect allocatable CPU and memory after Kubernetes system overhead, so the numbers aren't round.

| Name | Component | CPU | Memory | Description |
| --- | --- | --- | --- | --- |
| driver-small | Driver | ~2 vCPU | ~5 GiB | small (2vCPU/8GiB) |
| driver-medium | Driver | ~2 vCPU | ~12 GiB | medium (2vCPU/16GiB) |
| driver-large | Driver | ~4 vCPU | ~26 GiB | large (4vCPU/32GiB) |
| driver-x-large | Driver | ~8 vCPU | ~57 GiB | x-large (8vCPU/64GiB) |
| exec-small | Executor | ~2 vCPU | ~12 GiB | small (2vCPU/16GiB) |
| exec-medium | Executor | ~4 vCPU | ~26 GiB | medium (4vCPU/32GiB) |
| exec-large | Executor | ~8 vCPU | ~57 GiB | large (8vCPU/64GiB) |
| exec-x-large | Executor | ~16 vCPU | ~116 GiB | x-large (16vCPU/128GiB) |
