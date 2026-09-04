---
title: What is a Snowflake Compute Credit?
description: How Snowflake compute credits are defined, consumed, and priced, and what actually drives your compute bill.
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

## Why You Cannot Convert Credits Into Instance Hours

Snowflake does not publish which cloud instance types back each warehouse size, so there is no vendor-confirmed way to convert a credit into an equivalent number of EC2, Azure, or Google Cloud instance hours. Any such conversion would be an assumption, and it could change at any time without notice, because the vendor is free to change the hardware behind a warehouse size.

What you can work with is the part Snowflake does publish: credits consumed per warehouse size per hour, and the price per credit for your plan and region.

:::note
A credit is not only raw compute. It also covers the managed service around it: cloud services, query optimization, availability, and support. Storage is billed separately, per terabyte, and is not part of a compute credit.
:::

## In Conclusion

Snowflake compute cost is credits consumed multiplied by the price per credit.

Credits consumed depend on warehouse size and how long the warehouse runs. Each step up in size roughly doubles both capacity and credits per hour.

Price per credit depends on cloud provider, region, and plan. As of September 2026, list prices in most US regions are $2 per credit on Standard, $3 on Enterprise, and $4 on Business Critical. Always check Snowflake's current pricing page, since prices vary by region and change over time.

The practical way to control this spend is to control runtime and size: right-size warehouses, suspend idle ones, and cache repeated results. If you want direct control over the compute instances themselves rather than paying per vendor-defined credit, a self-hosted lakehouse such as IOMETE runs the compute in your own cloud account.

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
