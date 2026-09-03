---
title: What is a Snowflake Compute Credit?
description: How Snowflake compute credits are priced and consumed, and how credit cost compares with the underlying cloud instances.
slug: snowflake-compute-credit
image: img/blog/snowflake-compute-credit/snowflake-compute-credits.jpg
coverImage: img/blog/thumbnails/1.png
hide_table_of_contents: true
tags2: [Engineering]
authors: aytan
banner_description: Understanding your consumption of Snowflake credits
---

import FAQSection from '@site/src/components/FAQSection';

import MiniCard from "@site/src/components/MiniCard";

Snowflake credits are used to pay for the consumption of resources on Snowflake. A Snowflake credit is **a unit of measure defined by Snowflake**, and it is consumed only when a customer is using resources, such as when a virtual warehouse is running, the cloud services layer is performing work, or serverless features are used.

<!-- truncate -->

:::note
Snowflake runs on AWS, Azure, or Google Cloud. Snowflake publishes credit consumption per warehouse size, but not the underlying instance types it uses. That is a normal vendor choice, and it means you cannot map credits to hardware yourself.
:::

## How to Calculate Snowflake Compute Costs

Snowflake uses a consumption-based cost model, where the more data one computes, the more one pays. The formula is simple: (a = b x c):

:::note
Snowflake compute cost = Number of Compute Credits X Price per Compute Credit.
:::

## The Price Per Snowflake Compute Credit

The Price per Compute Credit depends on:

1. The Cloud provider (AWS, Azure or Google Cloud).
2. The Cloud region (e.g. "US East (Northern Virginia)").
3. The Snowflake Plan (i.e. Standard, Enterprise, Business Critical, VPS).

![Snowflake plans](/img/blog/snowflake-compute-credit/snowflake-plans.png)

Snowflake pricing page as published on May 26, 2023. Check Snowflake's current pricing page for up-to-date figures.

<!-- <MiniCard link="https://sandbox.iomete.com/auth/realms/iomete/protocol/openid-connect/registrations?client_id=app&response_type=code&scope=openid&redirect_uri=http://sandbox.iomete.com" linkName="Try Sandbox">Discovering the data lakehouse platform?</MiniCard> -->

## The Number of Compute Credits

:::note
Snowflake compute cost = **Number of Compute Credits** X Price per Compute Credit.
:::

For Snowflake accounts running on Amazon Web Services (AWS), a node would be equivalent to a single EC2 instance. Snowflake uses t-shirt sizing for its warehouses to configure how many nodes they will have. In the below table, the size specifies the compute resources per cluster available to the warehouse. Each increase in size to the next larger warehouse approximately doubles the computing power and the number of credits billed per full hour that the warehouse runs.

![Virtual Warehouse sizes](/img/blog/snowflake-compute-credit/virtual-warehouse-sizes.png)

## What Is the Equivalent of Snowflake XS on AWS EC2?

Snowflake does not publish a vendor-confirmed hardware mapping. Independent researchers inferred the instance class from performance data. You can read more in [this academic paper](http://vldb.org/pvldb/vol14/p1606-leis.pdf) and the [Stack Overflow discussion](https://stackoverflow.com/questions/58973007/what-are-the-specifications-of-a-snowflake-server).

![What is Snowflake XS](/img/blog/snowflake-compute-credit/what-is-snowflake-xs.png)

> So Snowflake does not specify the hardware configuration. However, performance debugging information suggests that, on EC2, Snowflake currently relies on relatively small **c5d.2xlarge** instances (8 vCPUs, 16 GB DRAM, one 200 GB NVMe SSD).

Public research suggests XS warehouses run on **[c5d.2xlarge](https://instances.vantage.sh/aws/ec2/c5d.2xlarge?pricing_unit=vcpu)** class instances, so one XS credit is roughly one hour of that node. Treat the numbers below as an estimate, not a vendor-confirmed figure.

:::note
This compares only compute list price against raw EC2 on-demand price. A credit also covers the managed service around the compute: cloud services, query optimization, availability, and support. Storage is billed separately, per terabyte, and is not part of a compute credit. The multiple is a pricing gap, not a like for like cost comparison.
:::

![Snowflake Computing on AWS EC2](/img/blog/snowflake-compute-credit/reality-of-snowflake-computing.png)

## In Conclusion

One Snowflake compute credit costs $2 on the Standard plan, $3 on Enterprise, and $4 on Business Critical. These are list prices for most US regions, and they vary by region. Prices verified September 2026 (AWS US East, on-demand list).

One Snowflake compute credit is roughly one hour of an XS warehouse.

There is no vendor-confirmed mapping of warehouse sizes to instance types. Based on public research, the XS instance on AWS appears to be a c5d.2xlarge.

1 hour of c5d.2xlarge on-demand pricing is $0.384 for most US AWS regions.

On that instance and region, credit list prices are about 5x, 8x, and 10x the AWS on-demand instance price for Standard, Enterprise, and Business Critical. That gap pays for the managed service, so read it as a pricing comparison, not a total cost of ownership figure.

---

*Snowflake is a trademark of Snowflake Inc. IOMETE is not affiliated with or endorsed by Snowflake Inc. All figures cited here come from publicly available sources.*

<FAQSection faqs={[
  {
    question: "What is a compute credit in a managed data warehouse?",
    answer: "A compute credit is a vendor-defined unit of measure used to bill for processing resources consumed while a warehouse runs or serverless features execute. The number of credits used depends on the size of the compute cluster and how long it stays active, while the price per credit varies by cloud provider, region, and plan tier. This consumption-based model means total cost rises with both the amount of compute provisioned and how long it runs."
  },
  {
    question: "How is consumption-based data warehouse cost calculated?",
    answer: "Consumption-based cost is generally the number of compute units consumed multiplied by the price per unit, so the more data you process and the longer compute runs, the more you pay. Cluster size typically doubles capacity and credit consumption with each step up, and per-unit pricing changes by region and plan. Understanding both factors helps teams forecast spend and avoid surprises from idle or oversized warehouses."
  },
  {
    question: "Why do managed cloud data warehouses get expensive at scale?",
    answer: "Managed cloud data warehouses get expensive at scale because pricing is tied to consumption units that carry a markup over the underlying cloud instances, and costs accumulate every hour compute runs. As query volume and concurrency grow, more and larger warehouses run for longer, compounding spend. Teams often respond by tuning resource allocation, adding caching, restricting access, or moving some workloads to architectures with more direct control over compute, such as a self-hosted lakehouse like IOMETE."
  },
  {
    question: "How can teams reduce data warehouse compute costs?",
    answer: "Teams can reduce compute costs by right-sizing clusters, suspending idle warehouses, caching frequent results, and limiting access to compute resources to only the workloads that need them. Choosing architectures that separate storage from compute lets each scale independently and avoids paying for idle capacity. Running analytics on a self-hosted lakehouse such as IOMETE gives teams direct control over the compute instances and their utilization rather than paying per vendor-defined credit."
  }
]} />
