---
title: Continuous Applications
description: Craft real-time, end-to-end applications with a unified programming interface. Seamlessly support query serving, batch job interaction, and more.
banner_description: Continuous applications are a type of end-to-end application that reacts to data in real-time. Developers can use a single programming interface to support the different aspects of continuous applications, such as query serving or interaction with batch jobs.
alphabet: C
---

# Continuous Applications

## What are Continuous Applications?

Continuous applications are a type of end-to-end application that reacts to data in real-time. Developers can use a single programming interface to support the different aspects of continuous applications, such as query serving or interaction with batch jobs.

Here are some examples of how continuous applications can be used:

- **Updating data that will be served in real-time:** Developers can write a single Spark application that handles both updates and serving, or use an API that automatically performs transactional updates on a serving system like MySQL, Redis, or Apache Cassandra.

- **Extract, transform and load (ETL):** Developers can list the transformations required as in a batch job, and the streaming system will handle coordination with both storage systems to ensure exactly once processing.

- **Creating a real-time version of an existing batch job:** The streaming system guarantees results are always consistent with a batch job on the same data.

- **Online machine learning:** The machine learning library is designed to combine real-time training, periodic batch training, and prediction serving behind the same API.

By leveraging continuous applications, developers can create more efficient and effective systems that can handle real-time data.
