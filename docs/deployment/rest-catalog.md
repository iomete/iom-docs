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


## Installing REST Catalog Service in Kubernetes

List of resources to be installed:
| Resource     | Name                                    | Version |
| ------------ | --------------------------------------- | ------- |
| Docker image | `iomete/iom-iceberg-rest-catalog:1.2.0` |         |
| Helm Chart   | `iomete/iom-iceberg-rest-catalog`       | `1.2.0` |


To install our Iceberg REST Catalog implementation, follow these steps.  

1. Download the values.yaml file from the [IOMETE Deployment repository](https://github.com/iomete/iomete-deployment)
    ```bash showLineNumbers
    wget https://raw.githubusercontent.com/iomete/iomete-deployment/main/on-prem/helm/iom-iceberg-rest-catalog/values.yaml
    ```

2. For the `values.yaml` file, provide the following set of properties:
    ```yaml showLineNumbers
    catalog:
      name: catalog1 # the name of the Iceberg Catalog to use
      warehouse: s3://lakehouse/data # the path in your lakehouse where you want table metadata for tables in your catalog to be stored
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
    ```

3. Then, use the following command to install  
    ```bash showLineNumbers
    # Ensure you've added & updated the IOMETE Helm repository
    # Add the IOMETE Helm repository if you haven't already
    # helm repo add iomete https://chartmuseum.iomete.com

    helm repo update iomete

    helm upgrade --install -n iomete-system iceberg-rest-catalog iomete/iom-iceberg-rest-catalog -f /path/to/values.yaml
    ```
    Replace `/path/to/values.yaml` with the path to your `values.yaml` file and `iomete-system` namespace if you are using a different namespace.


## Configuring the REST Catalog in IOMETE Console

To set up a REST catalog in the IOMETE Console, navigate to **Settings → Spark Catalog**. In the top right, click **Create** and select **Rest (Iceberg)** from the menu.

<Img src="/img/deployment/rest-catalog/menu-dropdown.png" alt="Menu Dropdown"/>

On the next page, provide the following information:

- Name: The display name for this Catalog in the IOMETE Console
- Warehouse: The path in the data lake for Spark jobs to use
- Custom Credentials (Optional): The endpoint and credentials to connect to Dell ECS, MinIO or other S3-compatible storage.
- URI: The URI of the Iceberg REST Catalog to connect to (e.g., http://iom-iceberg-rest-catalog:8181 for the IOMETE-installed version)

After filling in the details, click **Test Connection** to verify that the configuration is correct and has sufficient privileges to run various Apache Spark workloads using this REST Catalog.

Once verified, click **Create** to finalize your catalog.

<Img src="/img/deployment/rest-catalog/rest-catalog-form.png" alt="Create Form"/>

To test your setup, navigate to the **SQL Editor** page. Use the **Database explorer** to view the tables and views in your REST Catalog. You can then run queries against these tables and views to confirm the configuration is working correctly.
