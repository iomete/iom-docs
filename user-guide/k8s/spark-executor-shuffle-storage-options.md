---
title: Spark Executor Shuffle Storage Options
sidebar_label: Spark Executor Shuffle Storage Options
description: Optimize Apache Spark performance. Compare executor shuffle storage options - TempFS, HostPath, PVCs, and External Shuffle Service.
last_update:
  date: 03/07/2024
  author: Vusal Dadalov
---

Apache Spark executors require storage space for various operations, particularly for shuffle data during wide
operations such as sorting, grouping, and aggregations.
Wide operations are transformations that require data from different partitions to be combined, often resulting in data
movement across the cluster.
During the map phase, executors write data to shuffle storage, which is then read by reducers.

:::warning Important note
The choice of storage medium can significantly impact the overall performance of Spark jobs.
:::

This guide explores various storage options for Spark executors, focusing on shuffle storage, and discusses their pros
and cons to help IOMETE customers make informed decisions about the right shuffle storage for their needs.

## Storage Options for Spark Executors

### 1. TempFS (RAM-backed)

This option uses RAM as the primary storage medium for Spark executors.

**Pros:**

- Extremely fast read and write operations due to RAM speed
- Lowest latency among all options

**Cons:**

- Limited scalability due to the high cost of RAM
- Competes with memory needed for actual dataset processing
- Not recommended for most use cases due to memory constraints

### 2. HostPath (Node's Local Disk) - Recommended

This option uses the underlying node's disk where the Spark executor pod is running.

**Pros:**

- High performance, second only to RAM-based storage
- Immediate availability, no waiting time for volume provisioning
- Fast executor pod startup times
- Excellent overall job execution performance
- Automatic cleanup of local disk space after job completion

**Cons:**

- Requires IT team involvement to attach extra volumes (e.g., SSDs) to nodes
- May compete with other workloads for node storage resources
- Nodes must have sufficient disk space to support Spark's shuffle storage needs

**Best Practices:**

- Use SSDs, preferably NVMe SSDs, for optimal performance
- Ensure adequate disk space on nodes to accommodate shuffle data

### 3. Persistent Volume Claims (PVCs)

This option uses external, network-based volumes provided by the Kubernetes cluster.

**Pros:**

- Flexibility to request and release volumes as needed
- Avoids filling up node's local disk space, allowing for better resource management in a shared environment

**Cons:**

- Significantly slower than local disk options
- Can become a bottleneck when running multiple Spark jobs simultaneously
- Potential delays in volume provisioning, affecting executor startup times
- Dependency on the reliability and performance of the volume provider
- Potential inefficiency in resource utilization


**See examples of PVC requests in multi-job Spark environments** in the [Extra Information](#examples-pvc-requests-in-multi-job-spark-environments) section below.


:::info Considerations

- Ensure a highly reliable and fast volume provider
- Optimize network performance for attached volumes
- Monitor and tune volume provisioning to minimize delays
  :::

:::warning Inefficiency Consideration
A significant drawback of the PVC option is its potential for resource inefficiency. Every Spark job requests and uses a
separate volume, regardless of its actual shuffle data requirements. This leads to:

1. Unnecessary volume allocation for jobs with minimal shuffle needs
2. Reduced cluster efficiency due to underutilized storage
3. Increased costs in cloud environments
4. Higher provisioning overhead for the Kubernetes cluster
5. Complexity in resource planning and optimization
   :::

### 4. External Shuffle Service

This option offloads shuffle data management to an external service, separating it from the Spark executors.

**Pros:**

- Reduces storage requirements for individual executors
- Dedicated storage management
- Potential for optimized shuffle data handling

**Cons:**

- More complex setup involving additional components (e.g., DaemonSets)
- Potential single point of failure
- Generally lower performance compared to local disk options

## Comparison Table

Here's a comparison of the different storage options for Spark executors based on various criteria:

| Feature                          | TempFS (RAM-backed)               | HostPath (Local Disk)                           | Persistent Volume Claims (PVCs)         | External Shuffle Service                       |
|----------------------------------|-----------------------------------|-------------------------------------------------|-----------------------------------------|------------------------------------------------|
| **Performance**                  | Extremely fast                    | Very fast                                       | Moderate to slow                        | Moderate                                       |
| **Scalability**                  | Limited                           | Good                                            | Excellent                               | Good                                           |
| **Cost**                         | High                              | Moderate                                        | Varies                                  | Moderate                                       |
| **Setup Complexity**             | Low                               | Low                                             | Moderate                                | High                                           |
| **Availability**                 | Immediate                         | Immediate                                       | Delayed (provisioning time)             | Immediate                                      |
| **Cleanup**                      | Automatic                         | Automatic                                       | Manual/Configurable                     | Managed                                        |
| **Resource Competition**         | Competes with application memory  | Competes with node storage                      | Minimal local resource competition      | Minimal executor resource competition          |
| **Best Use Case**                | Small, memory-intensive workloads | General-purpose, performance-critical workloads | Environments with limited local storage | Large-scale deployments with specialized needs |
| **Limitations**                  | Memory constraints                | Requires IT involvement for setup               | Network performance dependent           | Potential single point of failure              |
| **Cloud Compatibility**          | Universal                         | Universal                                       | Excellent                               | Good                                           |
| **Kubernetes Integration**       | Native                            | Native                                          | Native                                  | Requires additional setup                      |
| **Data Persistence**             | Non-persistent                    | Non-persistent                                  | Persistent                              | Configurable                                   |
| **Recommended Storage Hardware** | High-speed RAM                    | NVMe SSDs                                       | High-performance network storage        | Depends on implementation                      |


## Conclusion and Recommendations

After evaluating the various options, we can rank them based on their overall effectiveness for Spark executor storage,
particularly for shuffle operations:

1. **HostPath (Local Disk)**: The best balance of performance, simplicity, and scalability for most use cases.
2. **External Shuffle Service**: A good option for specialized setups that prioritize executor resource efficiency.
3. **Persistent Volume Claims (PVCs)**: Viable when local storage is not feasible, but requires careful consideration of
   the volume provider's capabilities.
4. **TempFS (RAM-backed)**: Generally not recommended due to resource constraints, but may be suitable for specific,
   memory-intensive workloads.

For most Spark deployments, the HostPath option using local SSDs (preferably NVMe) offers the best combination of
performance and practicality. However, the choice may vary depending on specific infrastructure constraints, workload
characteristics, and organizational requirements.

When implementing any of these options, it's crucial to monitor performance, tune configurations, and ensure that the
chosen storage solution aligns with the overall architecture and performance goals of your Spark deployment.

---

## Extra Information

### Examples: PVC Requests in Multi-Job Spark Environments

When using Persistent Volume Claims (PVCs) for Spark executor storage, the number of volume requests can quickly
escalate in environments running multiple jobs concurrently. Here are some examples to illustrate the scale of this
challenge:

#### Example 1: Small-Scale Deployment

- Number of concurrent Spark jobs: 5
- Executors per job: 20
- Total number of executors: 5 * 20 = 100
- Volume requests: 100 PVCs

#### Example 2: Medium-Scale Data Processing

- Number of concurrent Spark jobs: 15
- Executors per job: 50
- Total number of executors: 15 * 50 = 750
- Volume requests: 750 PVCs

#### Example 3: Large-Scale Analytics Platform

- Number of concurrent Spark jobs: 50
- Executors per job: 100
- Total number of executors: 50 * 100 = 5,000
- Volume requests: 5,000 PVCs

#### Example 4: Burst Workload Scenario

- Base number of jobs: 20 with 30 executors each
- Burst jobs: Additional 30 jobs with 80 executors each during peak time
- Total executors during peak: (20 * 30) + (30 * 80) = 3,000
- Volume requests during peak: 3,000 PVCs

These examples underscore why many organizations opt for HostPath (local disk) or External Shuffle Service options for
Spark executor storage, especially in large-scale or dynamic environments.

