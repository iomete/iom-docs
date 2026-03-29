---
title: Performance Benchmarking
sidebar_label: Performance Benchmarking
description: Benchmark results showing the impact of CPU allocation on Spark query performance.
last_update:
  date: 03/25/2026
  author: Abhishek Pathania
---

import Img from '@site/src/components/Img';

## Benchmark Results

CPU allocation directly affects query speed. Allocating less than 1 vCPU (e.g., 300m) can drastically slow Spark jobs because of CPU throttling. The benchmark below compares different CPU configurations on TPC-DS queries 1 through 4 (1 GB dataset), with results in seconds.

<Img src="/img/user-guide/node-types/bar-graph.png" alt="TPC-DS benchmark results by CPU allocation" maxWidth="600px"/>

**Key takeaways:**
- Always allocate at least **1 vCPU** for both driver and executor nodes.
- Bumping executors to 2 or 4 vCPU noticeably improves throughput on compute-intensive workloads.
- For detailed sizing guidance, see [Node Type Sizing Best Practices](./node-type-sizing).
