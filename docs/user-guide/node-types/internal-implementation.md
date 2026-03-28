---
title: Internal Implementation
sidebar_label: Internal Implementation
description: How IOMETE translates node types into Spark and Kubernetes configuration — core calculation, memory overhead, and customizable properties.
last_update:
  date: 03/25/2026
  author: Abhishek Pathania
---

IOMETE translates [node types](./overview) into Spark and Kubernetes settings at deploy time. Knowing the math helps when you need to tune performance or troubleshoot resource limits.

## Core Calculation

When you create a node type, IOMETE derives three values from its CPU setting.

| Spark Property | Value | Description |
| --- | --- | --- |
| `spark.driver.cores` / `spark.executor.cores` | `max(ceil(CPU_vCPU * coreFactor), 1)` | Number of Spark cores available to the component. Default `coreFactor` is **1.5**. |
| `spark.kubernetes.driver.request.cores` / `spark.kubernetes.executor.request.cores` | `{cpu}m` | Kubernetes CPU request, set to the node type's raw millicore value. |
| `spark.kubernetes.driver.limit.cores` / `spark.kubernetes.executor.limit.cores` | depends on limit factor | Kubernetes CPU limit. Defaults to the request value (`{cpu}m`), adjustable via `spark.iomete.driver.core.limit.factor` / `spark.iomete.executor.core.limit.factor` (default 1.0). |

**Example**: a node type with 2000 millicores (2 vCPU) and the default core factor of 1.5 produces:
- Spark cores: `ceil(2 * 1.5)` = **3**
- Kubernetes CPU request: **2000m**
- Kubernetes CPU limit: **2000m** (with the default limit factor of 1.0)

## Memory Calculation

When you set a node type's memory, IOMETE splits it between the Spark JVM heap and overhead, which covers off-heap memory, network buffers, and container needs. See [Node Type Sizing](./node-type-sizing) for guidance on choosing memory values.

**Default overhead factors:**
- Standard Spark (JVM): **10%** (factor 0.1)
- PySpark: **40%** (factor 0.4)

**Minimum overhead**: 384 MiB (enforced regardless of factor)

**Calculation:**
1. `sparkMemory = totalMemory / (1 + overheadFactor)`
2. `overhead = totalMemory - sparkMemory`
3. If `overhead < 384 MiB`, then `sparkMemory = totalMemory - 384`

**Example** (4096 MiB total, default factors):
- Spark JVM memory: `4096 / 1.1` = 3723 MiB, but overhead (373) is below the 384 minimum, so final value = `4096 - 384` = **3712 MiB**
- PySpark memory: `4096 / 1.4` = **2925 MiB** (overhead = 1171, above minimum)

If you set `spark.driver.memoryOverhead` or `spark.executor.memoryOverhead` explicitly, that value overrides the factor-based calculation. The 384 MiB minimum still applies. Supported formats: `512m`, `1g`, `536870912b`.

### Memory Overhead Factor Precedence

IOMETE resolves the overhead factor by checking these options in order and using the first match:

1. `spark.driver.memoryOverhead` / `spark.executor.memoryOverhead` (explicit value, highest priority)
2. `spark.driver.memoryOverheadFactor` / `spark.executor.memoryOverheadFactor` (component-specific factor)
3. `spark.kubernetes.memoryOverheadFactor` (Kubernetes-level fallback)
4. Default: 0.1 (Spark) or 0.4 (PySpark)

## Customizing Spark Configuration

The defaults work well for most workloads, but you can override them globally, per [Spark job](/developer-guide/spark-job/spark-application-config), or per [compute cluster](/user-guide/compute-clusters/overview).

### Core Factor Properties

| Property | Default | Description |
| --- | --- | --- |
| `spark.iomete.driver.core.factor` | 1.5 | Multiplier applied to driver vCPU count to calculate Spark cores. |
| `spark.iomete.executor.core.factor` | 1.5 | Multiplier applied to executor vCPU count to calculate Spark cores. |
| `spark.iomete.driver.core.limit.factor` | 1.0 | Multiplier applied to driver CPU request to set the Kubernetes CPU limit. |
| `spark.iomete.executor.core.limit.factor` | 1.0 | Multiplier applied to executor CPU request to set the Kubernetes CPU limit. |

For example, a 2 vCPU node with `spark.iomete.executor.core.factor = 3.0` yields Spark executor cores = `ceil(2 * 3.0)` = **6**.

### Static Core Overrides

These properties set an exact core count, bypassing the factor calculation entirely.

| Property | Description |
| --- | --- |
| `spark.iomete.driver.cores` | Fixed Spark driver core count. |
| `spark.iomete.executor.cores` | Fixed Spark executor core count. |

### Memory Override Properties

| Property | Description |
| --- | --- |
| `spark.driver.memoryOverheadFactor` | Custom overhead factor for driver memory (replaces the default 0.1 / 0.4). |
| `spark.executor.memoryOverheadFactor` | Custom overhead factor for executor memory. |
| `spark.kubernetes.memoryOverheadFactor` | Kubernetes-level fallback factor (used when no component-specific factor is set). |
| `spark.driver.memoryOverhead` | Explicit driver memory overhead value (e.g., `512m`, `1g`). |
| `spark.executor.memoryOverhead` | Explicit executor memory overhead value. |

### Configuration Priority

When multiple settings apply, IOMETE resolves the final Spark configuration in this order:

1. **Static override values** (e.g., `spark.iomete.driver.cores`): highest priority.
2. **Custom factor properties** (e.g., `spark.iomete.driver.core.factor`).
3. **Default factors**: 1.5 for cores, 0.1 / 0.4 for memory overhead.
