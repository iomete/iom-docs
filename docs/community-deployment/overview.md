---
title: IOMETE Community Edition
sidebar_label: Overview
description: IOMETE Community Deployment Overview - provides a comprehensive insight into the deployment process and configuration of the IOMETE community platform.
last_update:
  date: 01/13/2024
  author: Vusal Dadalov
---

import Img from '@site/src/components/Img';
import Question from "@site/src/components/Question";
import FAQSection from '@site/src/components/FAQSection';

import Card from "@site/src/components/Card";
import GridBox from "@site/src/components/GridBox";
import { Files, Database, Sparkle, Circuitry,Cloud, GoogleLogo, AmazonLogo, WindowsLogo, HardDrives } from "@phosphor-icons/react";

Welcome to the future of data management and analytics with the **IOMETE Lakehouse Platform Community Edition**. This edition stands out as **the most generous Data Lakehouse Platform available in the market today**, offering an unparalleled blend of freedom and functionality in data handling. 

---
## The World's Most Generous Free Modern Lakehouse Platform

IOMETE Community Edition is completely free with no hidden costs. Your data remains within your control, never leaving your account or data lake.

- **Managed Data Lakehouse**: Experience the power of Managed Apache Spark and Iceberg for efficient data management.
- **Speed, Scale, and Simplicity**: Enjoy a modern, intuitive UI that simplifies complex tasks
- **Scalable from TB to PB**: Unparalleled performance and reliability.
- **No Lock-In**: Open data lakehouse with Apache Spark & Iceberg - no vendor lock-in, top-class engines.
- **Cost Efficiency and Control**: Only pay for the infrastructure you use with options for Spot and Reserved instances for additional savings.
- **Flexible Deployment**: Compatible with cloud or on-premise environments.
- **Generosity**: Recognized as the most generous free Lakehouse platform globally.
- **Free**: Use it for personal or commercial projects without any restrictions.

## Start Using IOMETE Community Edition

IOMETE is compatible with several leading cloud service providers. Choose the platform that best suits your needs and follow the instructions to get started and join the [IOMETE Community Server](https://community.iomete.com) for support and discussions.

<GridBox>

<Card title="AWS" icon={<AmazonLogo />} link="community-deployment/aws/install">
AWS Community Edition Deployment
</Card>

<Card title="GCP" icon={<GoogleLogo />} link="community-deployment/gcp/install">
Google Cloud Community Edition Deployment
</Card>

<Card title="Azure" icon={<WindowsLogo />} link="community-deployment/azure/install">
Azure Community Edition Deployment
</Card>

<Card title="On-premise" icon={<HardDrives />} link="community-deployment/on-prem/install">
On-premise Community Edition Deployment
</Card>

</GridBox>

---
## Frequently Asked Questions (FAQ)

<FAQSection faqs={[
  {
    question: "Can I run IOMETE on a single node?",
    answer: "Yes. IOMETE can run on a single node for development and testing. Details are available on the single node deployment page."
  },
  {
    question: "Does IOMETE run entirely within my infrastructure?",
    answer: "Yes. IOMETE operates entirely within your infrastructure and does not transmit data to external cloud services."
  },
  {
    question: "Is internet connectivity required for IOMETE?",
    answer: "By default, yes. IOMETE needs an internet connection to download necessary docker images. For air-gapped (no-internet access clusters) environments, contact us for assistance."
  },
  {
    question: "Differences between cloud and on-premise deployments?",
    answer: "IOMETE provides a unified experience across cloud and on-premise deployments. However, there are some differences: Cloud uses terraform for infrastructure setup and helm charts for IOMETE installation, while on-premise requires manual infrastructure setup with helpful deployment scripts. Cloud utilizes managed services like AWS S3, Azure Blob Storage, Google Cloud Storage, while on-premise requires setting up S3 compatible storages like MinIO, DELL ECS, etc. Cloud has built-in auto-scaling features, while on-premise typically uses static resource allocation."
  },
  {
    question: "Differences between Community and Enterprise versions?",
    answer: "Refer to IOMETE Pricing page for a detailed comparison between Community and Enterprise versions."
  },
  {
    question: "Support for Community Edition?",
    answer: "IOMETE Community Edition is supported by the community. Feel free to join the IOMETE Community Server for support and discussions."
  },
  {
    question: "Dedicated Support?",
    answer: "Dedicated support is available for Enterprise customers. Enterprise customers receive dedicated support via Slack or MS Teams, including full maintenance and updates."
  },
  {
    question: "How to get Enterprise Version?",
    answer: "Schedule a call to discuss your requirements and obtain a quote."
  }
]} />
