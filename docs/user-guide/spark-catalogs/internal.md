---
title: Internal Spark Catalogs
description: Configure and manage internal Spark Catalogs in IOMETE.
last_update:
  date: 06/02/2024
  author: Vugar Dadalov
---

import Img from '@site/src/components/Img';

IOMETE allows users to create new catalogs that function as **Iceberg REST Catalogs**, managed internally by IOMETE. These catalogs are accessible externally via the path `/catalogs/<catalog name>` and integrate seamlessly with data security rules enforcing role-based access control (RBAC). A valid session or a [PAT token](../create-a-personal-access-token.md) is required for authentication.

<Img src="/img/user-guide/spark-catalogs/rest-catalog-sol.png" alt="Spark Rest Catalogs Solution" />

Select **Iceberg REST Catalog** from the **Managed Catalogs** section, and the following input fields will appear:

- **Name**: The name of the catalog.
- **Warehouse**: The URL of an S3-compatible warehouse _(IOMETE only supports object stores compatible with Amazon S3 APIs)_.

<Img src="/img/user-guide/spark-catalogs/internal-rest-catalog-create.png" alt="Spark Catalog create" maxWidth="600px" />

### [Optional] Configuring a different S3 Compatible Storage

By default, IOMETE will use the S3 compatible storage and credentials that are configured by your administrator when installing IOMETE.
If you wish to use different credentials or a different storage provider for this catalog,
click on the `Enable Custom Credentials` checkbox. Then, you'll see additional input fields for your credentials.

- **Endpoint -** _If using AWS S3 you can omit the endpoint, for Minio and Dell ECS storage providers the endpoint is mandatory._
- **Access key**
- **Secret key**

<Img src="/img/user-guide/spark-catalogs/spark-custom-credentials.png" alt="Spark Catalog create" maxWidth="600px"/>

### [Optional] Configuring Additional Properties and Resource Tags

You can configure Additional Properties that Catalog Properties that IOMETE will expose for this Catalog. You may also
add Resource Tagging.

1. Additional Properties (Optional)
   - Customize Spark catalog behavior by adding key-value pairs.
   - Click **Add property**
   - Enter **Key** and **Value**
2. Resource Tags (Optional)
   - Organize IOMETE resources with custom tags.
   - Click **Add tag**
     Enter **Key** and **Value**

<Img src="/img/user-guide/spark-catalogs/catalogs-additional.png" alt="Spark Catalogs" maxWidth="600px"/>

### Validating and Saving

After filling all inputs click `Test Connection` to test the setup. This will run a series of tests to validate connectivity
and various permissions.

Click `Create` or `Save` to save your settings. The new catalog will appear in catalog list.

<Img src="/img/user-guide/spark-catalogs/catalog-test-connection.png" alt="Test Connection" maxWidth="600px"/>

:::note Edit & Delete
Editing and deleting the `default` catalog is not permitted; you can only make changes to other catalogs.
:::

:::note Using a new catalog
Make sure to restart relevant Lakehouses and Spark Connect instances to ensure a newly created Catalog can be used
:::
