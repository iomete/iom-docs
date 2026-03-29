---
title: CPU vs vCPU - Understanding vCPUs and IOMETE Licensing on Kubernetes
sidebar_label: CPU vs vCPU
description: CPU vs vCPU -  Understanding vCPUs and IOMETE Licensing on Kubernetes
last_update:
  date: 03/08/2024
  author: Vusal Dadalov
---
import Img from '@site/src/components/Img';

IOMETE is a powerful Data Lakehouse platform designed to run on Kubernetes. Our licensing model is based on per-vCPU usage, as vCPUs are the visible metric for IOMETE. 
This article explains how vCPUs differ from physical CPUs, how they are allocated in on-premises, private and public cloud environments, and how they impact IOMETE licensing costs.

## What is a vCPU?

A vCPU (virtual CPU) is a share of a physical CPU allocated to a virtual machine (VM) or a container. In Kubernetes, a vCPU represents a unit of compute capacity that can be assigned to a pod or container.

### Key Concepts:

1. **Physical CPU (pCPU)**: The actual hardware processor in a computer or server.
2. **Core**: A processing unit within a physical CPU that can handle its own set of instructions.
3. **Thread**: A virtual core that allows a single physical core to handle multiple instruction streams simultaneously.
4. **Hyper-threading**: A technology that allows a single physical core to act as two logical cores, potentially improving performance for certain workloads.

## CPU Architecture and Hyper-threading

Different CPU manufacturers implement their architectures in various ways:

- **Intel**: Introduced Hyper-Threading Technology (HTT), where each physical core can run two threads simultaneously.
- **AMD**: Uses Simultaneous Multi-Threading (SMT), similar to Intel's Hyper-Threading.
- **ARM**: Implements its own version of multi-threading, which can vary between different ARM designs.

### How Hyper-threading Works

Hyper-threading enables a single physical core to handle multiple threads (logical cores), allowing better utilization of CPU resources. It helps in parallel processing by allowing more tasks to be processed concurrently, which can lead to performance gains in certain types of workloads.

### Relationship between vCPU and Hyper-threading

1. **vCPU Allocation**: When a hypervisor allocates vCPUs to a VM, it considers the underlying physical CPU cores and their hyper-threading capabilities.
2. **Resource Efficiency**: With hyper-threading, each physical core can support two vCPUs, potentially doubling the vCPU count per physical core.
3. **Performance Impact**: While hyper-threading can improve performance, it doesn't double the performance, as the two threads share some of the physical core's resources.


:::info Best Practice
Most vendors follow this best practice for calculation: If hyper-threading or multi-threading is enabled, the number of vCPUs is calculated by multiplying the number of physical cores by 2. If hyper-threading or multi-threading is not available, the number of vCPUs matches the number of physical cores.
:::

In general, these architectures map physical cores to logical cores as follows:

- Without hyper-threading: 1 physical core = 1 logical core
- With hyper-threading: 1 physical core = 2 logical cores (threads)

:::warning Over-subscription
Some virtualization environments like VMware allow CPU over-subscription, where more vCPUs are allocated than physically available. Since IOMETE licensing is based on the vCPUs visible to Kubernetes, it'll license based on the allocated vCPUs not the physical cores.
:::

## vCPUs in Cloud Environments

Cloud providers like AWS typically present vCPUs to customers, which are often mapped to hardware threads. Here are some examples of how AWS maps physical cores to vCPUs for different processor types:

### Intel-based Instances

- **Architecture**: x86
- **Hyper-Threading**: Enabled
- **Example**: m5.4xlarge instance
    - vCPUs: 16
    - Physical Cores: 8 (with Hyper-Threading)
    - **Mapping**: 1 physical core = 2 vCPUs
    - **Use Case**: General-purpose workloads with balanced compute, memory, and networking resources

### AMD-based Instances

- **Architecture**: x86
- **Simultaneous Multi-Threading (SMT)**: Enabled
- **Example**: m5a.4xlarge instance
    - vCPUs: 16
    - Physical Cores: 8 (with SMT)
    - **Mapping**: 1 physical core = 2 vCPUs
    - **Use Case**: General-purpose workloads with cost-efficiency benefits compared to Intel-based instances

### AWS Graviton (ARM-based) Instances

- **Architecture**: ARM
- **Multi-threading**: Varies by generation
- **Example**: m6g.4xlarge instance
    - vCPUs: 16
    - Physical Cores: 16 (no hyper-threading in Graviton2)
    - **Mapping**: 1 physical core = 1 vCPU (for Graviton2)
    - **Use Case**: Compute-intensive workloads that benefit from ARM's energy efficiency and cost savings

These mappings can change as new instance types and processor generations are introduced.

## vCPUs in Kubernetes

Kubernetes sees and works with vCPUs as reported by the underlying infrastructure. When running on bare metal, this typically corresponds to the number of hardware threads. In cloud environments, it matches the vCPUs provided by the cloud instance.