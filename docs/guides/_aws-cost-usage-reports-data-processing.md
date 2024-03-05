---
title: AWS Cost & Usage Reports Data Processing
description: Learn how to build a strong monitoring capability for the usage of the cloud platform for the best cost management for data processing.
sidebar_label: AWS Cost & Usage
last_update:
  date: 12/23/2022
  author: Ruslan Butdayev
---

import Img from '@site/src/components/Img';

Cloud provides excellent power with even greater responsibility. Cost Management is one of those greater responsibilities to be managed by companies. Companies have to build a strong monitoring capability to restrict any abnormal usage of the cloud platform. Because a little issue or mistake in the building of a pipeline, an application not monitored well enough can lead to a huge bill at the end of the month. That's why companies utilizing Cloud platforms are turning towards cloud analysis and monitoring tools. Cloud providers themselves provide cloud monitoring tools but also there are aggregators, 3rd party specialist tools for monitoring and management.

Today we will talk about AWS usage costs. There are various ways to manage costs in AWS, such as

1. Set budget
2. Cost explorers
3. Cost and Usage Reports
4. And many more…😎

> All of these methods are powerful on their own.

Let's choose AWS Cost and Usage Reports method which is logging all usage and saving it in **_Parquet_** file format. What is Parquet? Apache Parquet is an open-source, column-oriented data file format designed for efficient data storage and retrieval. It provides efficient data compression and encoding schemes with enhanced performance to handle complex data in bulk.
To start to log all usage go to the AWS Billing dashboard and then click Cost & Usage Reports. (pic. 1)

<!-- ![AWS cost&usage reports](/img/guides/aws-cost-usage/aws-cost-usage-reports.png) -->

<Img src="/img/guides/aws-cost-usage/aws-cost-usage-reports.png" alt="AWS cost&usage reports"/>

Following up, select “**Create Report**” and choose the name of the report, then you have to choose the **S3** **bucket** (or you can select the existing one) time granularity (I am choosing daily) and the last step is choosing Compression type is Parquet (pic. 2).

<!-- ![S3 bucket delivery options](/img/guides/aws-cost-usage/s3-bucket-delivery-options.png) -->

<Img src="/img/guides/aws-cost-usage/s3-bucket-delivery-options.png" alt="S3 bucket delivery options"/>

After creating this the data starts to be loaded into an S3 bucket every hour, after 24 hours there would be 24 snapshots of the logs stored in this location.
Data is available in the S3 bucket, providing an opportunity for analysis. You can use AWS Glue to crawl data(need to set up and configure), create a database then configure Athena and import the data into the database. It is a **_complicated_** process. Alternatively choosing **_IOMETE_**, you can start analyzing the data in a few simple steps.

Open IOMETE console and select SQL Editor. (pic. 3), create a new file by clicking on “+”, we named the file “Parquet”.

<!-- ![Screenshot 2022-12-09 at 02.36.32.png](AWS%20Cost%20&%20Usage%20Reports%20Data%20Processing%2041222eb656c243398b7f0a748b9ed0b2/Screenshot_2022-12-09_at_02.36.32.png) -->

<Img src="/img/guides/aws-cost-usage/iomete-sql-editor.png" alt="IMOETE SQL Editor"/>

Now we need to select an engine(executor) that will analyze our parquet stored in the S3 bucket. (pic. 4)

<!-- ![Screenshot 2022-12-09 at 02.37.35.png](static/img/guides/aws-cost-usage/select-ececutor-to-analyze-parquet.png) -->

<Img src="/img/guides/aws-cost-usage/select-ececutor-to-analyze-parquet.png" alt="select executor to analyze parquet file"/>

If the S3 bucket is already connected or you know the ARN then there is nothing to be done, if not use the following steps.

As you remember we have created an S3 bucket for saving logs, we need to get the ARN of this bucket. (to copy this ARN you need to go to S3 and select saved parquet file and copy ARN). After coping ARN we need to change the below code and replace ARN with ours.

The following template would provide a way to query the parquet files directly from the S3 bucket. An example of how to use this is provided in the next section.

```rust
SELECT *
FROM parquet.`s3a://bucket.name/file.name.parquet`
LIMIT 100;
```

In this situation our ARN **_“iom-lakehouse-parquet/kubecost-report-00001.snappy.parquet”_** and we will replace the code. My bucket name is: **_iom-lakehouse-parquet_** and Usage LOG filename: **_kubecost-report-00001.snappy.parquet._** Ready code will be like below.

```rust
SELECT *
FROM parquet.`***iom-lakehouse-parquet/kubecost-report-00001.snappy.parquet***`
LIMIT 100;
```

Execute the code in SQL editor and click Run (pic. 4).

<!-- ![Screenshot 2022-12-09 at 02.40.32.png](static/img/guides/aws-cost-usage/run-sql-editor.png) -->

<Img src="/img/guides/aws-cost-usage/select-ececutor-to-analyze-parquet.png" alt="select executor to analyze parquet file"/>

\***\*Voilà\*\*** 🥳!

Our script ran and we now have the usage data. Further analytics can be done on top of data to get more insights. Also, find information in our [documentation](/docs/).

**Results:**

<Img src="/img/guides/aws-cost-usage/parquet-files-iomete.png" alt="IOMETE parquet file results"/>

<!-- ![IOMETE parquet file results](/img/guides/aws-cost-usage/parquet-files-iomete.png) -->

That’s all.
Next post I will show you, how you can Visualise data on our Platform.
