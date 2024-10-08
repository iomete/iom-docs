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

----
## Catalog list

To view Spark Catalogs, navigate to the `Settings` menu item and switch to the `Spark Catalogs` tab.
In the list below, you'll find the Spark catalog. The default catalog created by the system is called `spark_catalog`.

<Img src="/img/user-guide/spark-catalogs/spark-catalogs-landing.png" alt="Spark Catalogs" />

## Create a new Catalog

To add new catalog item, click `Create` button (As marked above). You'll see following screen:

<Img src="/img/user-guide/spark-catalogs/spark-catalogs-create.png" alt="Spark Catalog create" maxWidth="600px"/>

For more details on the various catalog options, refer to the [IOMETE Spark Catalog Support](/user-guide/spark-catalogs-info).

If you select **Iceberg REST Catalog** then following page with inputs will open:

- **Name** : Name of the catalog
- **Warehouse** : URL of S3 supported warehouse _(Our platform only supports data warehouses that are integrated with Amazon S3 for storage_)

<Img src="/img/user-guide/spark-catalogs/rest-catalog-create.png" alt="Spark Catalog create" maxWidth="600px"/>

For custom credentials, click on the `Enable Custom Credentials` checkbox. Then, you'll see additional input fields for your credentials.

- **Endpoint -** _If using AWS S3 you can omit the endpoint, for Minio and Dell ECS storage providers the endpoint is mandatory._
- **Access key**
- **Secret key**

<Img src="/img/user-guide/spark-catalogs/spark-custom-credentials.png" alt="Spark Catalog create" maxWidth="600px"/>


Configuring Additional Properties and Resource Tags
1. Additional Properties (Optional)
   - Customize Spark catalog behavior by adding key-value pairs.
   - Click **Add property**
   - Enter **Key** and **Value**
2. Resource Tags (Optional)
   - Organize IOMETE resources with custom tags. 
   - Click **Add tag**
   Enter **Key** and **Value**

<Img src="/img/user-guide/spark-catalogs/catalogs-additional.png" alt="Spark Catalogs" maxWidth="600px"/>


After filling all inputs click `Test Connection` to test the setup and `Create` to save your settings

The new catalog will appear in catalog list.

<Img src="/img/user-guide/spark-catalogs/catalog-landing.png" alt="Spark Catalogs" maxWidth="600px"/>

:::note Edit & Delete
Editing and deleting the `default` catalog is not permitted; you can only make changes to other catalogs.
:::

## Catalog in SQL Editor.

Go to the SQL Editor to view the Spark catalog that has been created.
Check out the `SQL Editior` section in the left panel. If you don't see the created catalog, please refresh by using the <ArrowsClockwise size={16} /> button.
In the given image, we have already created some databases and tables inside the catalog.
<Img src="/img/user-guide/spark-catalogs/sqleditor.png" alt="Spark Catalogs in SQL Editor" maxWidth="600px"/>
