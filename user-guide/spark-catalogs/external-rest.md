---
title: REST Iceberg Catalog Integration
description: Configure IOMETE to connect to existing Iceberg REST Catalogs.
date: 06/02/2024
author: Vugar Dadalov
---

import Img from '@site/src/components/Img';

IOMETE can connect to any existing **Iceberg REST Catalogs**. This integration allows you to manage your external data sources seamlessly.

Follow these steps to connect to an existing REST Catalog:

- **Name**: The name of the catalog.
- **Warehouse**: The URL of an S3-compatible warehouse.
- **URI**: The HTTP(S) URL of the REST Catalog.

<Img src="/img/user-guide/spark-catalogs/create-external-rest-catalog.png" alt="Create External REST Catalog" />

### Examples of REST Catalogs
- [Polaris Catalog](https://www.snowflake.com/en/blog/introducing-polaris-catalog/)
- [Unity Catalog](https://www.databricks.com/product/unity-catalog)

Complete the form and test the connection before saving.
