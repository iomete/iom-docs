---
title: Spark Applications
description: What are Spark Applications? Spark Applications are made up of a driver process and a set of executor processes. The driver process is responsible for maintaining information about the application, responding to user input, and distributing work across the executors.
---

# Spark Applications

## What are Spark Applications?

**Spark Applications** are made up of a driver process and a set of executor processes. The driver process is responsible for maintaining information about the application, responding to user input, and distributing work across the executors. Executors execute the assigned code and report the computation state back to the driver node. The cluster manager controls physical machines and allocates resources to Spark Applications, allowing multiple applications to run simultaneously.
