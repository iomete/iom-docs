---
title: Medallion Architecture
description: Medallion Architecture is a data design pattern employed to organize data within a lakehouse, aiming to enhance data quality as it traverses each layer of the architecture.
---

# Medallion Architecture

**Medallion Architecture** is a data design pattern employed to organize data within a lakehouse, aiming to enhance data quality as it traverses each layer of the architecture.

IOMETE facilitates the creation of data pipelines with Bronze, Silver, and Gold tables through just a few lines of code. The Bronze layer serves as the landing place for data from external source systems, while the Silver layer focuses on cleansing and conforming the data. The Gold layer is dedicated to reporting and utilizes consumption-ready databases.

A lakehouse architecture combines the strengths of data lakes and data warehouses, offering high scalability and performance. The Medallion architecture seamlessly aligns with the principles of a data mesh.
