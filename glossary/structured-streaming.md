---
title: Structured Streaming
description: What is Structured Streaming? Structured Streaming is a powerful stream processing API that was introduced in Spark 2.2. With Structured Streaming, one can perform the same operations that one does in batch mode using Spark's structured APIs, but in a streaming fashion. This can significantly reduce latency and enable incremental processing.
---

# Structured Streaming

## What is Structured Streaming?

**Structured Streaming** is a powerful stream processing API that was introduced in Spark 2.2. With Structured Streaming, one can perform the same operations that one does in batch mode using Spark's structured APIs, but in a streaming fashion. This can significantly reduce latency and enable incremental processing.

## Key Capabilities and Advantages

Structured Streaming offers several key capabilities and advantages:

- **Unified API:** Perform batch and streaming operations using the same API, allowing seamless transition between batch and streaming processing.

- **Incremental Processing:** Enables processing of real-time data incrementally, reducing latency and improving overall performance.

- **Ease of Development:** Simplifies the development process by allowing developers to prototype a batch job and then convert it to a streaming job with minimal code changes.

- **Fault Tolerance:** Provides built-in fault tolerance mechanisms, ensuring reliability in stream processing.

- **Compatibility:** Compatible with Spark's structured APIs, making it easy for developers familiar with these APIs to work with structured streaming.

## Use Cases

Structured Streaming is well-suited for various use cases, including:

- **Real-time Analytics:** Analyzing and gaining insights from streaming data in real-time.

- **Event Time Processing:** Handling events based on their occurrence time rather than processing time.

- **Continuous Applications:** Building continuous applications that can process data as it arrives.

In summary, Structured Streaming is a versatile stream processing API that brings the simplicity and power of Spark's structured APIs to the world of streaming data, enabling efficient and scalable real-time data processing.
