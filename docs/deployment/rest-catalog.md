---
title: REST Catalog Deployment
sidebar_label: REST Catalog
description: Learn how to deploy the REST Catalog in IOMETE platform.
last_update:
  date: 09/06/2024
  author: Rocco Verhoef
---

import Img from '@site/src/components/Img';

Apache Iceberg supports a REST Catalog, which provides a RESTful interface for managing metadata operations. This catalog can be implemented by wrapping around existing catalog implementations, such as JDBC or Glue, enabling interactions with Iceberg tables through standard HTTP requests. It simplifies integration with external systems by offering a consistent and accessible API for metadata management.

IOMETE currently offers a beta implementation of a REST Catalog that delegates to an underlying JDBC catalog. At present, it utilizes the Hadoop file system to access data in S3-compatible storage. Future versions will incorporate the newer S3FileIO implementation as well.

## Installing REST Catalog Service in` Kubernetes

List of resources to be installed:
| Resource | Name | Version |
| ------------ | --------------------------------------- | ------- |
| Docker image | `iomete/iom-iceberg-rest-catalog` | `1.2.0` |
| Helm Chart | `iomete/iom-iceberg-rest-catalog` | `1.2.1` |

To install our Iceberg REST Catalog implementation, follow these steps.

1. Download the values.yaml file from the [IOMETE Deployment repository](https://github.com/iomete/iomete-deployment/blob/main/on-prem/helm/iom-iceberg-rest-catalog/values.yaml)

   ```bash showLineNumbers
   wget https://raw.githubusercontent.com/iomete/iomete-deployment/main/on-prem/helm/iom-iceberg-rest-catalog/values.yaml
   ```

2. For the `values.yaml` file, provide the following set of properties:

   ```yaml showLineNumbers
   catalog:
     name: demo_catalog # the name of the Iceberg Catalog to use
     warehouse: s3://lakehouse/demo_catalog # the path in your lakehouse where you want table metadata for tables in your catalog to be stored
     cacheEnabled: true # spark-setting to indicate if catalogs should be cached or not
     clients: 50 # how many concurrent requests the catalog can handle
     s3:
       endpoint: http://minio:9000 # the s3 compatible service endpoint to connect to
       region: us-east-1 # the s3 compatible service endpoint to connect to
       pathStyleAccess: true # wether to use path-style URLs in your s3 compatible service or not
       accessKeyId: minioadmin # access key id to your s3 compatible service
       secretAccessKey: minioadmin # access key secret to your s3 compatible service
     jdbc:
       uri: jdbc:postgresql://postgresql:5432/iomete_iceberg_db # the jdbc url of your JDBC catalog this REST catalog will wrap around
       useSSL: true # enables SSL/TLS encryption for JDBC connections
       user: db_user # username to use for connections to the database
       password: db_password # password to use for connections to the database
       passwordSecret: {} # can be used instead of plain-text username/pass to get secrets from Kubernetes instead
     javaTrustStore:
       enabled: false # enables the use of a truststore to connect over https to postgress/s3
       secretName: java-truststore # name of the secret with the truststore.jks file
       fileName: truststore.jks # the truststore file name
       password: changeit # the password to allow the program to access the trust store
       mountPath: /etc/ssl/iomete-certs # location where the certificates will be loaded
   ```

3. Then, use the following command to install

   ```bash showLineNumbers
   # Ensure you've added & updated the IOMETE Helm repository
   # Add the IOMETE Helm repository if you haven't already
   # helm repo add iomete https://chartmuseum.iomete.com

   helm repo update iomete

   helm upgrade --install -n iomete-system <release name> iomete/iom-iceberg-rest-catalog -f /path/to/values.yaml --version <version number>
   ```

   In here:

   - Replace `/path/to/values.yaml` with the path to your `values.yaml` file.
   - Change `iomete-system` namespace if you are using a different namespace.
   - Specify `<version number>` of the version you want to install.

- The `<release name>` will designate both the service name and its accessible URL.
  :::tip Recommendation
  We recommend selecting a `<release name>` value that reflects the catalog name, such as `demo-catalog-rest`. This ensures that the service is accessible within the Kubernetes cluster at a corresponding URL, like http://demo-catalog-rest/.
  :::

## Configuring the REST Catalog in IOMETE Console

:::info Prerequisites
You will need to the following items set in the previous step to configure the catalog in the IOMETE Console:

- The name of the catalog.
- The warehouse location set for this catalog.
- The URL the REST catalog runs on.
  :::

To set up a REST catalog in the IOMETE Console, navigate to **Settings → Spark Catalog**. In the top right, click **Create** and select **Rest (Iceberg)** from the menu.

<Img src="/img/deployment/rest-catalog/menu-dropdown.png" alt="Menu Dropdown"/>

On the next page, provide the following information:

- Name: The display name for this Catalog in the IOMETE Console.
- Warehouse: The path in the data lake for Spark jobs to use.
- Custom Credentials (Optional): The endpoint and credentials to connect to Dell ECS, MinIO or other S3-compatible storage.
- URI: The URI of the Iceberg REST Catalog to connect to (e.g. http://demo-catalog-rest)

:::warning Important
If the Spark operator runs in a different Kubernetes namespace from the REST catalog, use the FQDN format `<namespace>.svc.cluster.local` for the REST catalog URI (e.g., http://demo-catalog-rest.iomete-system.svc.cluster.local), replacing `<namespace>` with the namespace where the REST catalog is deployed.
Additionally, ensure that [network policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/) allow traffic from the Spark operator’s namespace to the namespace where the REST catalog is deployed.
:::

After filling in the details, click **Test Connection** to verify that the configuration is correct and has sufficient privileges to run various Apache Spark workloads using this REST Catalog.

Once verified, click **Create** to finalize your catalog.

:::tip Recommendation
We recommend using the same name in the IOMETE Console and warehouse location to match the name of catalog set in the `values.yaml` during the rest-catalog installation.
:::

<Img src="/img/deployment/rest-catalog/rest-catalog-form.png" alt="Create Form"/>

To test your setup, navigate to the **SQL Editor** page. Use the **Database explorer** to view the tables and views in your REST Catalog. You can then run queries against these tables and views to confirm the configuration is working correctly.

<Img src="/img/deployment/rest-catalog/new-rest-catalog-in-sql-editor.png" alt="SQL Editor"/>
