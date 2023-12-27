---
title: Medallion Architecture
description: Explore Medallion Architecture, a data design pattern used in lakehouse setups to enhance data quality across different layers. Learn about the Bronze, Silver, and Gold tables in the architecture, how IOMETE simplifies data pipeline creation, and how Medallion Architecture aligns with the scalable and performant nature of lakehouse architectures and the broader concept of a data mesh.
---

# Medallion Architecture

**Medallion Architecture** is a data design pattern employed to organize data within a lakehouse, aiming to enhance data quality as it traverses each layer of the architecture.

IOMETE facilitates the creation of data pipelines with Bronze, Silver, and Gold tables through just a few lines of code. The Bronze layer serves as the landing place for data from external source systems, while the Silver layer focuses on cleansing and conforming the data. The Gold layer is dedicated to reporting and utilizes consumption-ready databases.

A lakehouse architecture combines the strengths of data lakes and data warehouses, offering high scalability and performance. The Medallion architecture seamlessly aligns with the principles of a data mesh.
