---
title: What is a Snowflake Compute Credit?
description: Using Snowflake Compute Credit to save your cloud computing bills by 50%. Want to know how much does it means exactly? Check our blog
slug: snowflake-compute-credit
image: img/blog/snowflake-compute-credit/snowflake-compute-credits.jpg
hide_table_of_contents: true
tags: [Engineering]
authors: aytan
banner_description: Understanding your consumption of Snowflake credits
---

import MiniCard from "@site/src/components/MiniCard";

Snowflake credits are used to pay for the consumption of resources on Snowflake. A Snowflake credit is **a unit of measure defined by Snowflake**, and it is consumed only when a customer is using resources, such as when a virtual warehouse is running, the cloud services layer is performing work, or serverless features are used.

<!-- truncate -->

:::note
Snowflake runs on AWS, Azure or Google Cloud. Snowflake does not disclose what AWS, Azure, or Google Cloud nodes it uses. Many users have asked Snowflake to disclose the nodes it leverages under the hood, but the company choses to keep this close to the vest. Not very transparent. After all, if we fly Delta Airlines they don’t hide whether we’re flying an Airbus 777 or Boeing 767 and we even know whether they use the latest GE or Rolls Royce engine. Why would Snowflake hide what nodes it uses? Show your nodes!!(btw: Great name for a new marketing campaign 😊).
:::

## How to calculate Snowflake compute costs

Snowflake uses a consumption-based cost model, where the more data one computes, the more one pays. The formula is simple: (a = b x c):

:::note
Snowflake compute cost = Number of Compute Credits X Price per Compute Credit.
:::

## The Price per Snowflake Compute Credit

The Price per Compute Credit depends on:

1. The Cloud provider (AWS, Azure or Google Cloud).
2. The Cloud region (e.g. “US East (Northern Virginia)).
3. The Snowflake Plan (i.e. Standard, Enterprise, Business Critical, VPS).

![Snowflake plans](/img/blog/snowflake-compute-credit/snowflake-plans.png)

Snowflake pricing page (May 26, 2023)

<MiniCard link="https://form.typeform.com/to/ofF9ZQYd" linkName="Try Sandbox">Discovering the data lakehouse platform?</MiniCard>

## The Number of Compute Credits

:::note
Snowflake compute cost = **Number of Compute Credits** X Price per Compute Credit.
:::

For Snowflake accounts running on Amazon Web Services (AWS), a node would be equivalent to a single EC2 instance. Snowflake uses t-shirt sizing for its warehouses to configure how many nodes they will have. In the below table, the size specifies the compute resources per cluster available to the warehouse. Each increase in size to the next larger warehouse approximately doubles the computing power and the number of credits billed per full hour that the warehouse runs.

![Virtual Warehouse sizes](/img/blog/snowflake-compute-credit/virtual-warehouse-sizes.png)

## What is the equivalent of Snowflake XS on AWS EC2?

As mentioned earlier, Snowflake tries to keep this information close to the vest but the information was leaked. You can read more in [this academic paper](http://vldb.org/pvldb/vol14/p1606-leis.pdf) and the below [Stackoverflow discussion.](https://stackoverflow.com/questions/58973007/what-are-the-specifications-of-a-snowflake-server)

![What is Snowflake XS](/img/blog/snowflake-compute-credit/what-is-snowflake-xs.png)

> So Snowflake does not specify the hardware configuration. However, performance debugging information suggests that, on EC2, Snowflake currently relies on relatively small **c5d.2xlarge** instances (8 vCPUs, 16 GB DRAM, one 200 GB NVMe SSD).

Based on this, 1 XS compute credit seems to be equal to using the **[c5d.2xlarge](https://instances.vantage.sh/aws/ec2/c5d.2xlarge?pricing_unit=vcpu)** node on AWS for one hour. As we see in the example below depending on whether one is on the Snowflake Standard, Enterprise or Business Critical Snowflake’s price is between 5 and 10 times higher than the AWS instance that is allegedly used under the hood…

![Snowflake Computing on AWS EC2](/img/blog/snowflake-compute-credit/reality-of-snowflake-computing.png)

## In conclusion

One Snowflake Compute Credit cost $2 on the Standard Plan, $3 on the Enterprise Plan and $4 on the Business Critical Plan (note: this is the price for most of the US Regions and varies per region).

One Snowflake Compute Credit = 1 hour XS instance.

Although Snowflake is not transparent about what nodes it uses under the hood, the XS instance that seems to be leveraged for AWS is the c5d.2xlarge.

1 hour of c5d.2xlarge on-demand pricing is $0.384 for most US AWS regions.

Based on this instance and region, Snowflake prices are 5x, 8x, 10x (for Standard, Enterprise, Business Critical) higher than AWS on-demand pricing.
