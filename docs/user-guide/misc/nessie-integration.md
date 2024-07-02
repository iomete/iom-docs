---
title: Nessie Library
sidebar_label: Nessie Library
description: Learn how to add Nessie library to Spark Resources.
---

import Img from "@site/src/components/Img";

Starting from Data-Plane version `1.16.0`, we have added support for the Nessie catalog. The extension `org.projectnessie.spark.extensions.NessieSparkSessionExtensions` is included by default when deploying Spark resources. IOMETE's Spark version `3.5.1-v1` includes the Nessie jar library `nessie-spark-extensions-3.5_2.12` version `0.78.0`. For older Spark versions, you can add the Nessie dependency to your Spark resources to access and use the Nessie catalog.

## Adding Nessie Dependency

To add the Nessie dependency, follow these steps:  
1. **Navigate to Settings:**  
  Go to the IOMETE Console, then proceed to `Settings -> Spark Settings (Global Spark Settings)`.  

2. **Add Dependency:**  
  You can add the dependency using either of the following methods:  

   - Option 1: **Using Packages:**
     Add the Nessie package from the Maven repository using the following configuration:
     ```
     spark.jars.packages org.projectnessie.nessie-integrations:nessie-spark-extensions-3.5_2.12:0.78.0
     ```

   - Option 2: **Using JAR Files:**
     Upload the JAR file to the default lakehouse bucket specified during the IOMETE installation. This could be S3, Minio, or Dell ECS. Then, add the JAR file path:
     ```
     spark.jars s3a://lakehouse_bucket/nessie-spark-extensions-3.5_2.12-0.78.0.jar
     ```

     You can download the JAR file from the Maven Central Repository using the following command:  
     ```shell
     wget https://repo1.maven.org/maven2/org/projectnessie/nessie-integrations/nessie-spark-extensions-3.5_2.12/0.78.0/nessie-spark-extensions-3.5_2.12-0.78.0.jar
     ```

:::info
Make sure to use version `0.78.0`. Newer version are currently incompatible with IOMETE.  
:::

:::note
After adding the Nessie library, restart the Lakehouses and Spark Jobs.
:::