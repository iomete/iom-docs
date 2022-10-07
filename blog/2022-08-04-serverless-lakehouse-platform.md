---
slug: the-rise-of-the-serverless-lakehouse-platform
title: The Rise of the Serverless Lakehouse Platform
authors: piet
hide_table_of_contents: true
tags: [Educational]
---

<head>
  <title>Database Connection Options</title>
  <meta name="robots" content="noindex, nofollow" />
  <meta name="googlebot" content="noindex"/>
</head>

![serverless-lakehouse-platform](/blog/2022-08-04-serverless-lakehouse-platform/serverless-lakehouse-platform.png)

<!-- truncate -->

## The data warehouse
In the 1980s, data warehouses (DWs) or enterprise data warehouses (EDWs) appeared. The term "data warehouse" refers to a repository for structured, filtered data from one or more disparate sources. In addition to analytical and business reporting purposes, it is also used to optimize business operations by keeping records and analyzing data.

One of the major drawbacks of data warehouses is their rigidity. Data warehouses are at their best when working with structured, filtered data. This triggered the industry to develop a solution that offered a higher degree of flexibility.

## The data lake
Data lakes, such as Databrick's delta lake, were developed to overcome the limitations of data warehouses. The modern use cases most companies seek to address cannot be addressed by data warehouses, despite their ability to offer high-performance and scalable analytics.

Essentially, a data lake is a central repository for unstructured data - e.g. text, numbers, images, videos or audi0 - that can be used whatever way we see fit, now or in the future. This type of data can be a big unlock for organizations.

A data lake is a flexible architecture and allows organizations to keep all data in one repository. It does, however, have some shortcomings. In the absence of a data catalog, data integrity can become an issue.

## The data lakehouse
With today's storage architectures, users with big datasets have yet another option to choose from: the "data lakehouse" architecture.

Data lakehouses house both structured and unstructured data, just like data lakes. Thus, businesses that can benefit from working with unstructured data only need one data repository instead of two.

For larger organization or data-intensive startups it may make sense to use both. BI analytics are fed by the warehouse, and data in the lake is used for data science and storage for future undefined uses. The data lake architecture is increasingly used for machine learning (ML) and artificial intelligence (AI).

Unstructured data of the type that would typically be stored in a data lake is able to be structured and "schema-ed" like that stored in a data warehouse. As a result, data users can access information more quickly. In addition to data scientists, other functions - e.g. supply chain, finance, and human resources - may benefit from analytics capabilities too.

To categorize and classify unstructured data, a data lakehouse might use metadata layers to act as a middleman between the unstructured data and the data user. The data can be structured effectively by identifying and extracting features, allowing it to be cataloged and indexed just like structured data.

## Serverless computing
The rise of cloud computing has enabled a lot of progress in data infrastructure over the past two decades. Gone are the days of basements or garages with grumpy back-end engineers (Gilfoyle!).

Service providers handle all hardware and OS requirements for serverless computing, so organizations don't have to worry about it.

A cloud provider (e.g. AWS, Google Cloud, Azure, DigitalOcean) dynamically allocates only the compute resources and storage needed to execute a specific piece of code or run a particular query using serverless computing. Although there are still servers involved, the provider takes care of their provisioning and maintenance.

The code for serverless functions is only invoked when triggered by a request. Instead of charging a flat yearly/monthly fee for maintaining a physical or virtual server, the provider charges only for compute time used.

With serverless computing, developers can concentrate on the business goals of their code instead of worrying about infrastructure. Furthermore, users only pay for the resources they actually use, instead of buying physical hardware or renting cloud instances that mostly sit idle.

## The serverless lakehouse
Serverless lakehouses combine the benefits of serverless (cloud) computing with those of data lakes. It's the culmination of forty years of innovation in data infrastructure.

Who is the data lakehouse architecture designed for? Organizations that are interested in moving from BI to AI are one of the key groups of users. Due to the rich insight that can be derived from unstructured data, businesses are increasingly using it for data-driven operations and decision-making.

As an example, if you count the number of customers visiting your chain of restaurants each day and store the data as a simple number, you will only ever know one thing: the number of customers.

A video recording of them coming in can provide you with all sorts of information - what is their age range, how do they dress? Are they overweight or thin? When someone walks through your door, you might be able to detect their mood based on facial analytics. Hopefully they're happier when they leave than when they came in!

If one would put all of that information into a data lake there would be important issues of data governance to address - such as the fact that you're dealing with personal information. In a lakehouse architecture, compliance procedures would be automated - possibly even anonymized. This is why we at iomete decided to integrate an advanced data catalog in our lakehouse platform; it guarantees that data is structured and organized and avoids that your data turns into a stinky data swamp.

Unlike data warehouses, which must be manually adapted to the organization's formats and schemas, data lakes are inexpensive to scale because integrating new data sources is automated. Also, the data can be accessed from anywhere using any tool, as opposed to only being available through applications that can only handle structured data (such as SQL).

As more organizations begin to realize the value of unstructured data combined with AI and machine learning, the data lakehouse approach has become increasingly popular. For organizations seeking to continue with legacy BI and analytics workflows while migrating to smart, automated data initiatives, it is a step up in maturity from the combined data lake and data warehouse model that has been considered the only option up until now.

## The iomete lakehouse platform
The lakehouse is considered the latest innovation in data infrastructure that combines the benefits of a data warehouse and a data lake. iomete has taken it a few steps further. While the core of the [iomete platform](https://iomete.com/#platform) is a blazing-fast serverless lakehouse, it includes an advanced data catalog, serverless spark jobs, a SQL-editor and built-in BI. Why? So you don't have to do the complex and expensive integrations of standalone solutions.

Apart from complete, the platform is flexible too. The iomete lakehouse is built on open source Apache Iceberg and Apache Spark and uses Apache Parquet as the data format. One can use the built-in BI which is based on Apache Superset or we can easily connect third party solutions such as Tableau, Looker, and PowerBI.

All of this comes with the most aggressive value proposition in the data industry: The iomete compute price is equal to the AWS on-demand compute [price](https://iomete.com/pricing) with no mark-up, so AWS users get the iomete platform basically for free.