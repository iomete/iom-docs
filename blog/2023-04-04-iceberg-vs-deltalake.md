---
title: Apache Iceberg vs Delta Lake case study
description: A case study article about IOMETE's decision to chose Apache Iceberg over Delta Lake and the unique experience and key takeaways that came out of it
slug: apache-iceberg-delta-lake
image: img/blog/2023-04-04-iceberg-vs-deltalake/cover.png
coverImage: img/blog/2023-04-04-iceberg-vs-deltalake/cover.png
hide_table_of_contents: true
featured_blog: true
tags2: [Engineering]
authors: vusal
banner_description: Why IOMETE chooses Apache Iceberg over Delta Lake?
---

import MiniCard from "@site/src/components/MiniCard";

When it comes to storing and managing large amounts of data, the choice of technology can make all the difference. At IOMETE, we have evaluated several options and ultimately decided to use [Apache Iceberg](https://iomete.com/iceberg) over Delta Lake. In this blog post, we will explain why we chose Iceberg over Delta Lake.

<!-- truncate -->

## **Engine Agnostic**

Its engine agnostic nature and complete independence from Apache Spark is one of the reasons we selected Apache Iceberg. This means that Iceberg can be used with any engine, including Apache Spark, Apache Flink, Apache Presto, and others. This is a big advantage over Delta Lake, which is tightly coupled with Apache Spark.

In the beginning, Delta Lake's tight coupling provided a competitive advantage, as it could take advantage of many Spark optimizations. However, Iceberg has closed that gap over the last few years.. With Iceberg, we have the flexibility to choose the best engine for our specific use case.

## **Fully Open Source Apache Iceberg**

In addition to its open-source nature, Apache Iceberg is also a part of the Apache Software Foundation. This means that Iceberg is a fully open-source project and is not owned by any company. This is a big advantage of Apache Iceberg over Delta Lake because Delta Lake is owned by Databricks.

Being fully open source means that Iceberg is community-driven and has a wider range of contributors. This can lead to faster development and more innovation.

## **Becoming a Standard in the Industry**

While Delta Lake is mostly backed by Databricks, Iceberg is backed by many companies, including Netflix, Adobe, Alibaba, and many others. This means that Iceberg is becoming a standard in the industry. Wider open source commitment and adoption are huge by the industry.

Many vendors are already baking Iceberg support. For example, DuckDB, Snowflake, ClickHouse, and many others have announced Iceberg support. This means that Iceberg is a safe choice for the future, as it is likely to be supported by many different platforms.

## **Limitations of Iceberg**

While we believe that Apache Iceberg is the best choice for our use case, it is important to note that it does have some limitations. One of the main limitations was streaming support, which was a bit behind other engines like Delta Lake and Hudi.

However, Iceberg has recently added support for merge-on-read functionality, which is a huge step forward. This means that stream updates could cause a lot of small files because the default strategy is copy-on-write. But with the merge-on-read strategy, you will end up with fewer files, which is a huge improvement in streaming write (update/delete) performance.

<!-- <MiniCard link="https://sandbox.iomete.com/auth/realms/iomete/protocol/openid-connect/registrations?client_id=app&response_type=code&scope=openid&redirect_uri=http://sandbox.iomete.com" linkName="Try Sandbox">Discovering the data lakehouse platform?</MiniCard> -->

## **Conclusion**

In conclusion, Apache Iceberg is a great open-source project and is becoming a standard in the industry. At IOMETE, we are big fans of Apache Iceberg. Our main product is a fully managed lakehouse platform based on Apache Spark + Iceberg. With the IOMETE Lakehouse Platform, you can set up a lakehouse platform in a few minutes and get all the amazing functionalities like Virtual Lakehouse Clusters, Spark Job Service, Notebook service, Advanced Data Access Control, and many other functionalities. If you want to learn more [book a discovery call](https://calendly.com/iomete/iomete-discovery-call) with us. If you want to reach more about Apache Iceberg you can access the [Ultimate Guide to Apache Iceberg](https://iomete.com/the-ultimate-guide-to-apache-iceberg).
