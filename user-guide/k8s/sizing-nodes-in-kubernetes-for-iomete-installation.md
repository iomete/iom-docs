---
title: Sizing Nodes in Kubernetes for IOMETE Installation
sidebar_label: Sizing Nodes
description: Learn best practices for sizing Kubernetes nodes for IOMETE installations. Optimize performance, efficiency, and scalability.
last_update:
  date: 03/08/2024
  author: Vusal Dadalov
---
import Img from '@site/src/components/Img';


When deploying IOMETE, a modern data lakehouse platform, on Kubernetes, one of the most crucial decisions you'll make is how to size your cluster nodes. This choice significantly impacts your system's performance, efficiency, and scalability. In this guide, we'll explore the key factors to consider when sizing nodes for IOMETE, explain why certain configurations are preferred, and provide practical recommendations for various deployment scales.

:::info Understanding Node Sizing in Kubernetes

Before we dive into IOMETE-specific recommendations, let's clarify what we mean by "node sizing" in Kubernetes:

- A **node** is a worker machine in Kubernetes, which can be a physical or virtual machine.
- **Node sizing** refers to the amount of CPU, memory, and storage resources allocated to each node in your cluster.
- The size and number of nodes in your cluster determine the total resources available for running your applications, including IOMETE.
:::

## Key Considerations

### 1. Resource Requirements

IOMETE, as a data lakehouse platform, has specific resource needs:

- **CPU**: Powers computations for data processing and analytics.
- **Memory**: Crucial for in-memory operations and caching.
- **Storage**: Used for data persistence and temporary storage during processing.

When sizing nodes, you need to ensure that each node can support IOMETE's resource requirements while also allowing for efficient pod scheduling and resource utilization.

### 2. CPU to Memory Ratio

For optimal IOMETE performance, we recommend maintaining a specific ratio between CPU and memory:

:::info Recommended Ratio
1 CPU to 8 GB of memory
:::

This ratio ensures that your nodes have sufficient memory to support the Memory-intensive operations typical in data processing workloads. For example, a node with 16 CPUs should have 128 GB of memory.

### 3. Storage Configuration

IOMETE relies heavily on fast storage for efficient shuffle data read&write. Here are our recommendations:

- **Use locally attached SSD disks** for shuffle storage. Shuffle operations are I/O-intensive intermediate steps in data processing.
- **Allocate 2 TB of SSD** for shuffle storage for every 32 CPUs, or 1 TB for every 16 CPUs.

See [Spark Executor Shuffle Storage Options](spark-executor-shuffle-storage-options) for more details.


:::info Example Node Configuration
- **CPU:** 16 CPUs
- **Memory:** 16 CPUs × 8 GB = 128 GB RAM
- **Storage:** 1 TB SSD for shuffle data
:::

## The Case for Larger Nodes

While it might seem intuitive to use many smaller nodes for greater flexibility, IOMETE generally performs better with fewer, larger nodes. Here's why:

### 1. Improved Resource Utilization

Larger nodes allow for more efficient resource allocation:

- **Reduced OS Overhead**: Each node requires some resources for the operating system and Kubernetes components. Larger nodes mean this overhead is spread over more total resources.
- **Better Pod Packing**: With more resources per node, Kubernetes can more efficiently pack pods, leading to higher overall resource utilization.

### 2. Enhanced Pod Scheduling

Larger nodes provide more flexibility in pod scheduling:

- **Support for Resource-Intensive Pods**: Some IOMETE components may require substantial resources. Larger nodes can accommodate these high-resource pods more easily.
- **Reduced Fragmentation**: With more resources per node, there's less chance of having stranded, unusable resources due to fragmentation.

### 3. Simplified Management

Fewer, larger nodes can simplify cluster management:

- **Reduced Networking Complexity**: Fewer nodes mean fewer network connections to manage.
- **Simplified Monitoring and Maintenance**: With fewer nodes, it's easier to monitor cluster health and perform maintenance tasks.

## Small vs large nodes sizing in Kubernetes

### Larger nodes minimize the resource waste

Below illustration compares resource allocation in Kubernetes clusters with multiple small nodes versus fewer large nodes. It demonstrates how larger nodes significantly reduce the overall operating system overhead, resulting in more efficient resource utilization.

<Img src="/img/k8s/small-nodes-resource-waste.svg"
caption="Small Nodes Resource Waste"
alt="Small Nodes Resource Waste"/>


### Better packing of pods, leading to more efficient resource use

This illustration demonstrates the advantages of using larger nodes in a Kubernetes cluster. 

It compares two scenarios one with four 4-CPU nodes and another with two 8-CPU nodes, both totaling 16 CPUs. The diagram shows how larger nodes allow for more efficient pod packing and resource utilization. In the small node scenario, only 4 pods (2 CPU each) can be scheduled, leaving 4 CPUs wasted. In contrast, the large node setup accommodates 6 pods, utilizing 12 out of 16 available CPUs. This visual emphasizes how larger nodes can significantly improve cluster efficiency by reducing OS overhead and minimizing unused resources, ultimately allowing for better performance in IOMETE deployments.

<Img src="/img/k8s/kubernetes-node-sizing-pod-packing.svg" 
    caption="Node Sizing: Pod Packing" alt="Node Sizing: Pod Packing"/>


### Flexibility in pod scheduling

With larger nodes, Kubernetes can schedule larger pods that may require more resources, which might not fit well on smaller nodes.

<Img src="/img/k8s/kubernetes-large-pod-scheduling.svg"
caption="Scheduling larger pods" alt="Scheduling larger pods"/>

## Recommended Configurations

Let's look at some example configurations for different cluster sizes:

### Example 1: Small Cluster (64 CPUs)

1. **Larger Nodes Configuration:**
    - **Nodes:** 2
    - **Each Node:** 32 CPUs, 256GB RAM, 2 TB SSD
    - **Total Resources:** 64 CPUs, 512GB RAM, 4 TB SSD

2. **Balanced Nodes Configuration:**
    - **Nodes:** 4
    - **Each Node:** 16 CPUs, 128GB RAM, 1 TB SSD
    - **Total Resources:** 64 CPUs, 512GB RAM, 4 TB SSD

3. **Granular Nodes Configuration:**
    - **Nodes:** 8
    - **Each Node:** 8 CPUs, 64GB RAM, 500 GB SSD
    - **Total Resources:** 64 CPUs, 512GB RAM, 4 TB SSD

**Recommended Option: Larger Nodes Configuration (2 Nodes with 32 CPUs each)**

### Example 2: Medium Cluster (320 CPUs)

1. **Larger Nodes Configuration:**
    - **Nodes:** 10
    - **Each Node:** 32 CPUs, 256GB RAM, 2 TB SSD
    - **Total Resources:** 320 CPUs, 2560GB RAM, 20 TB SSD

2. **Balanced Nodes Configuration:**
    - **Nodes:** 20
    - **Each Node:** 16 CPUs, 128GB RAM, 1 TB SSD
    - **Total Resources:** 320 CPUs, 2560GB RAM, 20 TB SSD

3. **Granular Nodes Configuration:**
    - **Nodes:** 40
    - **Each Node:** 8 CPUs, 64GB RAM, 500 GB SSD
    - **Total Resources:** 320 CPUs, 2560GB RAM, 20 TB SSD

**Recommended Option: Larger Nodes Configuration (10 Nodes with 32 CPUs each)**

### Example 3: Large Cluster (3000 CPUs)

1. **Larger Nodes Configuration:**
    - **Nodes:** 31
    - **Each Node:** 96 CPUs, 768GB RAM, 6 TB SSD
    - **Total Resources:** 2976 CPUs, 23808GB RAM, 186 TB SSD

2. **Balanced Nodes Configuration:**
    - **Nodes:** 62
    - **Each Node:** 48 CPUs, 384GB RAM, 3 TB SSD
    - **Total Resources:** 2976 CPUs, 23808GB RAM, 186 TB SSD

3. **Granular Nodes Configuration:**
    - **Nodes:** 125
    - **Each Node:** 24 CPUs, 192GB RAM, 1.5 TB SSD
    - **Total Resources:** 3000 CPUs, 24000GB RAM, 187.5 TB SSD

**Recommended Option: Larger Nodes Configuration (31 Nodes with 96 CPUs each)**


:::info Best Practices and Recommendations
1. **Start with the largest nodes your infrastructure supports**: This maximizes resource utilization and simplifies management.
2. **Maintain the 1:8 CPU to memory ratio**: This ensures balanced resource allocation for IOMETE workloads.
3. **Use local SSDs for shuffle storage**: This significantly improves I/O performance for data processing tasks.
:::

## Conclusion

Proper node sizing is crucial for optimizing IOMETE performance on Kubernetes. By following these guidelines—favoring larger nodes, maintaining the recommended CPU to memory ratio, and providing ample SSD storage—you'll create a robust foundation for your data lakehouse. Remember, the goal is to balance performance, efficiency, and manageability to create a Kubernetes environment where IOMETE can thrive.