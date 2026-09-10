---
title: What is a Compute Credit in a Cloud Data Platform?
description: How compute credits are defined, consumed, and priced by managed cloud data platforms, and what actually drives your compute bill.
slug: snowflake-compute-credit
image: img/blog/thumbnails/1.png
coverImage: img/blog/thumbnails/1.png
hide_table_of_contents: true
tags2: [Engineering]
authors: aytan
banner_description: Understanding how compute credits are consumed
---

import FAQSection from '@site/src/components/FAQSection';

import MiniCard from "@site/src/components/MiniCard";

Most managed cloud data platforms bill compute through credits. A compute credit is **a unit of measure defined by the vendor**, and it is consumed only while resources are being used — when a virtual warehouse or compute cluster is running, when the platform's service layer performs work, or when serverless features execute.

<!-- truncate -->

:::note
Managed cloud data platforms usually run on AWS, Azure, or Google Cloud. They typically publish credit consumption per cluster size, but not the underlying instance types behind it. That is a normal vendor choice, and it means you cannot map credits to hardware yourself.
:::

## How to Calculate Compute Costs in a Consumption Model

Managed cloud data platforms use a consumption-based cost model, where the more data you compute over, the more you pay. The formula is simple: (a = b x c):

:::note
Compute cost = Number of Compute Credits X Price per Compute Credit.
:::

## The Price Per Compute Credit

The price per compute credit typically depends on:

1. The cloud provider (AWS, Azure or Google Cloud).
2. The cloud region (e.g. "US East (Northern Virginia)").
3. The plan or edition you purchased, since vendors sell tiers with different feature sets.

Because all three vary, the same workload can carry a different bill in two regions or on two plan tiers. Vendor pricing pages are the only reliable source for current per-credit figures, and those figures change over time.

<!-- <MiniCard link="https://sandbox.iomete.com/auth/realms/iomete/protocol/openid-connect/registrations?client_id=app&response_type=code&scope=openid&redirect_uri=http://sandbox.iomete.com" linkName="Try Sandbox">Discovering the data lakehouse platform?</MiniCard> -->

## The Number of Compute Credits

:::note
Compute cost = **Number of Compute Credits** X Price per Compute Credit.
:::

Managed cloud data platforms generally use t-shirt sizing for compute clusters to configure how many nodes they will have. The size specifies the compute resources per cluster available to the warehouse, and each increase to the next larger size approximately doubles both the computing power and the number of credits billed per full hour that the cluster runs. So the credit count for a workload comes down to two things: which size you picked, and how long it stayed running.

## Why You Cannot Convert Credits Into Instance Hours

Vendors do not generally publish which cloud instance types back each cluster size, so there is no confirmed way to convert a credit into an equivalent number of EC2, Azure, or Google Cloud instance hours. Any such conversion would be an assumption, and it could change at any time without notice, because the vendor is free to change the hardware behind a given size.

What you can work with is the part vendors do publish: credits consumed per cluster size per hour, and the price per credit for your plan and region.

:::note
A credit is not only raw compute. It also covers the managed service around it: platform services, query optimization, availability, and support. Storage is usually billed separately, per terabyte, and is not part of a compute credit.
:::

## In Conclusion

In a consumption-priced cloud data platform, compute cost is credits consumed multiplied by the price per credit.

Credits consumed depend on cluster size and how long the cluster runs. Each step up in size roughly doubles both capacity and credits per hour.

Price per credit depends on cloud provider, region, and plan tier. Always check your vendor's current pricing page, since prices vary by region and change over time.

The practical way to control this spend is to control runtime and size: right-size clusters, suspend idle ones, and cache repeated results. If you want direct control over the compute instances themselves rather than paying per vendor-defined credit, a self-hosted lakehouse such as IOMETE runs the compute inside your own infrastructure.

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
    question: "Why does consumption-based pricing add up at scale?",
    answer: "Consumption-based pricing accumulates every hour compute runs, so as query volume and concurrency grow, more and larger clusters run for longer and spend compounds. Teams often respond by tuning resource allocation, adding caching, restricting access, or moving some workloads to architectures with more direct control over compute, such as a self-hosted lakehouse like IOMETE."
  },
  {
    question: "How can teams reduce data warehouse compute costs?",
    answer: "Teams can reduce compute costs by right-sizing clusters, suspending idle warehouses, caching frequent results, and limiting access to compute resources to only the workloads that need them. Choosing architectures that separate storage from compute lets each scale independently and avoids paying for idle capacity. Running analytics on a self-hosted lakehouse such as IOMETE gives teams direct control over the compute instances and their utilization rather than paying per vendor-defined credit."
  }
]} />
