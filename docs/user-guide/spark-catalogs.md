---
title: Spark Catalogs
description: IOMETE offers a convenient feature for configuring Spark Catalogs interface.
last_update:
  date: 06/02/2024
  author: Vugar Dadalov
---

import { ArrowsClockwise } from "@phosphor-icons/react";
import Img from '@site/src/components/Img';

IOMETE offers a feature for configuring Spark Catalogs interface.

---

## Catalog list

To view Spark Catalogs, navigate to the `Settings` menu item and switch to the `Spark Catalogs` tab.
In the list below, you'll find the Spark catalog. The default catalog created by the system is called `spark_catalog`.

<Img src="/img/user-guide/spark-catalogs/spark-catalogs.png" alt="Spark Catalogs" />

## Add catalog

To add new catalog item, click `Add catalog` button. You'll see following inputs:

- **Name**
- **Lakehouse directory**
- **Type -** _Currently, only 'iceberg' type is supported._

<Img src="/img/user-guide/spark-catalogs/catalog-create.png" alt="Spark Catalog create" maxWidth="600px"/>

For custom credentials, click on the `Configure credentials` radio button. Then, you'll see additional input fields for your credentials.

- **Endpoint -** _If using AWS S3 you can omit the endpoint, for Minio and Dell ECS storage providers the endpoint is mandatory._
- **Access key**
- **Secret key**

<Img src="/img/user-guide/spark-catalogs/create-credentials.png" alt="Spark Catalog create" maxWidth="600px"/>

After filling all inputs click `Add`.

<Img src="/img/user-guide/spark-catalogs/spark-catalog-list.png" alt="Spark Catalogs" maxWidth="600px"/>

:::note Edit & Delete
Editing and deleting the `default` catalog is not permitted; you can only make changes to other catalogs.
:::

## Catalog in SQL Editor.

Go to the SQL Editor to view the Spark catalog that has been created.
Check out the `Database Explorer` section in the left panel. If you don't see the created catalog, please refresh by using the <ArrowsClockwise size={16} /> button.
In the given image, we have already created some databases and tables inside the catalog.
<Img src="/img/user-guide/spark-catalogs/sql-editor-catalogs.png" alt="Spark Catalogs in SQL Editor" maxWidth="600px"/>
