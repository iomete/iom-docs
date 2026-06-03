---
title: Apache Iceberg in on-prem
description: Explore the benefits of Apache Iceberg's table format for on-premise environments that seeking efficient, scalable, and compliant data management solutions
slug: iceberg-onprem
hide_table_of_contents: true
tags2: [Engineering]
authors: fuad
banner_description: cloud-native table format in on premise
coverImage: img/blog/thumbnails/3.png
---

import FAQSection from '@site/src/components/FAQSection';

For on-premise data storages, streamlining data operations is a key requirement to maintain efficiency and reduce operational costs. Apache Iceberg is reshaping how companies store and analyze huge amounts of data. It's an open table format that's making big waves in the tech world. Here's the cool part: IOMETE, a [data lakehouse](/glossary/data-lakehouse) platform, is built on Apache Iceberg. It comes with fantastic features like [ACID transactions](/glossary/acid-transactions), time travel, snapshots, schema evolution, data versioning, concurrency control, metadata management, and partitioning. Plus, it's powered by the open [Apache Spark](/glossary/apache-spark) engine. Together, Iceberg and Spark make IOMETE super fast, adaptable, and able to grow with your needs.

![IOMETE-on-prem-iceberg](/img/blog/2023-12-04-on-prem-apache-iceberg/iceberg-onprem-iomete.png)

### **Apache Iceberg's Role in Local Servers**

Iceberg is like a magic tool for handling massive data in a "lakehouse" system. Don't worry, it doesn't actually store your data – it just organizes it in a super smart way. This means your data is not only safer but also more accurate and easier to use. It speeds up how you search and query through your data, a big help when you're not using powerful cloud-based systems.

![Apache Iceberg in on-premise](/img/blog/2023-12-04-on-prem-apache-iceberg/iceberg-tables-query-onprem.png)

**IOMETE: Handling Lots of Data**

We've got IOMETE running on Kubernetes, dealing with data stored in object storage. This combo maximizes your data's potential. Iceberg steps in to give your data structure and ease of use.

Our setup involves object storage for all types of data, which is crucial for advanced analytics and machine learning. The lakehouse approach merges the best of cloud data management in your local environments. Iceberg is just a table format in this setup.

You can easily find your data from a mass storage using data catalog. It is a super-organized filing system for your data. In an on-premise setup, where you might have tons of data in different formats, Iceberg's catalog brings order to potential chaos.

![Data Catalog in on-premise](/img/blog/2023-12-04-on-prem-apache-iceberg/data-catalog-onprem.png)

You can have better control over your data, ensuring that only the right people have access to the right information. Plus, it's easier to comply with [data security](/glossary/data-security) and privacy regulations (backed by [Apache Ranger](/blog/apache-ranger-data-security)).

**Iceberg in Action: Simplifying Data Usage**

Apache Iceberg really proves its value when you start organizing and using your data. You don’t need to migrate your data to IOMETE. Your data stays right on your server, and Iceberg makes sifting through it quicker and handles data changes like a pro.

### **Conclusion**

In a nutshell, Apache Iceberg can transform a local data storage system into a powerful, feature-rich lakehouse. It improves on traditional data storage methods, helping you get the most from large data sets. Interested in using it in your on-premise setup? We're here to help. Just hit "Book a Demo" and see how it works for your specific needs.

---

<FAQSection faqs={[
  {
    question: "What is Apache Iceberg?",
    answer: "Apache Iceberg is an open table format that organizes large analytic datasets so engines can query them reliably and efficiently. It does not store data itself; it adds structure and metadata over files in object storage, enabling features like ACID transactions, time travel, snapshots, and schema evolution. This brings database-like management to data-lake files. IOMETE is a data lakehouse platform built on Apache Iceberg and the Apache Spark engine."
  },
  {
    question: "Can Apache Iceberg run on-premises?",
    answer: "Yes, Apache Iceberg runs on-premises over local object storage, giving on-site data the same structured table management used in cloud lakehouses. It speeds up querying and handles data changes without moving data off your servers. This suits organizations that must keep data in their own data center for security or compliance. IOMETE runs Iceberg on Kubernetes against on-premises object storage, so data stays on your own infrastructure."
  },
  {
    question: "Do you need to migrate data to use Apache Iceberg?",
    answer: "No, Iceberg can organize data where it already resides rather than requiring a migration into a separate system. It works as a table layer over files in your existing storage, adding catalog structure and faster querying in place. This keeps data on your own servers while making it easier to find and analyze. With IOMETE, your data stays on your server and Iceberg organizes it without moving it elsewhere."
  },
  {
    question: "What features does Apache Iceberg add to a data lake?",
    answer: "Apache Iceberg adds ACID transactions, time travel, snapshots, schema evolution, data versioning, concurrency control, metadata management, and partitioning to data stored in a lake. These features bring reliability and governance that raw file storage lacks, so analytics and machine learning run on consistent data. A data catalog also makes scattered files easier to discover. IOMETE provides these Iceberg capabilities and pairs them with Apache Ranger for access control on-premises."
  }
]} />
