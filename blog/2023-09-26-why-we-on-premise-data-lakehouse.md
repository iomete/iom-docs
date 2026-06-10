---
title: Why we choose to be the on premise data lakehouse
description: This wide range of deployment possibilities makes IOMETE extremely versatile from a product perspective. For large enterprises there are real benefits of having a data lakehouse platform that is agnostic as to where your data lives
slug: why-we-choose-to-be-the-on-premise-data-lakehouse
hide_table_of_contents: true
tags2: [Company]
authors: piet
banner_description: why we position ourselves as the on premise data lakehouse
coverImage: img/blog/thumbnails/2.png
---

import FAQSection from '@site/src/components/FAQSection';

import MiniCard from "@site/src/components/MiniCard";

IOMETE is a modern and open [data lakehouse](/glossary/data-lakehouse) with a wide range of deployment options. IOMETE can run:

- On any major cloud, i.e. AWS, Azure, Google Cloud.
- On premise, i.e. leveraging your own private data center.
- On your private cloud, i.e. a cloud computing environment that is dedicated to a single organization.
- Hybrid, i.e. a combination of cloud and on-premise deployments.

<!-- truncate -->

This wide range of deployment possibilities makes IOMETE extremely versatile from a product perspective. For large enterprises there are real benefits of having a data lakehouse platform that is agnostic as to where your data lives.

But…there are big risks hiding under that versatility.

If you try to be everything to everyone, you will end up being nothing to no one.

That’s why we position ourselves as **the on premise data lakehouse**.

![Why-on-premise-data-lakehouse](/img/blog/2023-09-26-why-we-on-premise-data-lakehouse/why-on-premise-lakehouse.png)

In this post I will discuss the reasoning behind focusing on on premise deployments and - as a result - explicitly ignoring cloud in our positioning statements and go-to-market.

## Fight there where you can win

> "If you know the enemy and know yourself, you need not fear the result of a hundred battles. If you know yourself but not the enemy, for every victory gained you will also suffer a defeat. If you know neither the enemy nor yourself, you will succumb in every battle." - Sun Tzu

Companies like [Snowflake](/blog/snowflake-iomete) and [Databricks](/blog/databricks-alternatives) built magnificent brands and sales organizations. Even though we know IOMETE combines the strengths of Snowflake and Databricks - is better, faster and easier to use at less than half the cost - we realize it is hard to fight a perception that has been carefully crafted over the past decade on the back of billions of VC funding.

The on premise market is served by companies like [Cloudera](/blog/cloudera-alternatives) and [Oracle](/blog/oracle-to-spark-migration) that have archaic architecture compared to IOMETE.

## On premise is here to stay

Here are some of the reasons why the non-cloud market is still significant:

- Some organizations have regulatory or compliance requirements that prevent them from moving to the cloud. Many organizations outside of the US are hesitant to store their data on a US cloud and some are even prohibited to do so by their government.
- Data ownership. Many organizations prefer to truly own their data and keep it within their own trust perimeter.
- [Data security](/glossary/data-security). For certain use cases in government, healthcare, financial institutions keeping the data on premise is the most secure solution.
- Cost. Despite all its promises cloud computing is not always cheaper than on premise. Especially large enterprises can save millions by moving some of their data on premise.

It’s hard to get exact numbers on the on premise market. It is clear that cloud is bigger and growing at a faster pace, but by most estimates the IT on premise market is > $50Bn. In our book that’s big enough to build a sizeable organization.

## It makes sense

If we get asked “what do you do?” the shortest way to answer would be “We are Snowflake for on premise”. If we swim in the same lane as Snowflake and Databricks, we would have to answer “We are like Snowflake or Databricks but better for reasons A, B and C”. Even though it might be true, it’s just a hard sell because you get pushed in defensive mode and you are fighting against the billions of marketing spend Snowflake and Databricks used to bend perception in their favor.

## So will IOMETE not serve any cloud customers?

Yes, we do and will continue to do so, but we will not lead with it in our go-to-market motion. We will present ourselves as the on premise lakehouse experts because - frankly - we are.

<MiniCard link="https://sandbox.iomete.com/auth/realms/iomete/protocol/openid-connect/registrations?client_id=app&response_type=code&scope=openid&redirect_uri=http://sandbox.iomete.com" linkName="Try Sandbox">Discovering the data lakehouse platform?</MiniCard>

---

<FAQSection faqs={[
  {
    question: "What is an on-premises data lakehouse?",
    answer: "An on-premises data lakehouse is a lakehouse platform that runs inside an organization's own data center rather than on public cloud infrastructure. It combines open data lake storage with warehouse-style management and keeps all data within the organization's control. This deployment suits organizations with regulatory, data ownership, or security requirements that prevent using public cloud. IOMETE positions itself as an on-premises lakehouse and can also run in private cloud, public cloud, or hybrid setups."
  },
  {
    question: "Why do organizations still keep data on-premises?",
    answer: "Organizations keep data on-premises for several reasons: regulatory or compliance rules that prohibit cloud storage, a preference to truly own data within their own trust perimeter, security needs in sectors like government and finance, and cost control for large steady workloads. For some, especially outside the US, government restrictions prevent storing data on foreign cloud providers. These factors keep a substantial market for on-premises data platforms even as cloud adoption grows."
  },
  {
    question: "Can a single platform support both on-premises and cloud deployments?",
    answer: "Yes, some lakehouse platforms are deployment-agnostic and can run on-premises, in a private cloud, on public cloud, or in a hybrid combination of these. This versatility lets enterprises keep a consistent data platform regardless of where individual datasets live. The main benefit is a unified environment across mixed infrastructure. IOMETE runs across all these models while focusing its positioning on on-premises deployments."
  },
  {
    question: "Is on-premises always cheaper than cloud for data analytics?",
    answer: "No, on-premises is not automatically cheaper, but it can be for certain workloads, particularly large and steady ones where elastic cloud scaling is not needed. Cloud computing carries ongoing usage costs and provider margins that, at scale, can exceed the cost of running infrastructure in-house. The right choice depends on workload patterns, compliance needs, and how predictable demand is, so organizations should compare total cost for their specific case."
  }
]} />
