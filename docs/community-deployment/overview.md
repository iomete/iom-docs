---
title: IOMETE Community Deployment Overview
sidebar_label: Overview
description: IOMETE Community Deployment Overview - provides a comprehensive insight into the deployment process and configuration of the IOMETE community platform.
last_update:
  date: 01/13/2024
  author: Vusal Dadalov
---

Welcome to the IOMETE Community Deployment Overview.

This overview will help you deploy the IOMETE Lakehouse platform, a leading free Lakehouse solution. Whether you're looking to use IOMETE for personal projects or commercial endeavors, this guide will assist you in setting up the platform in your preferred environment.

## Introduction to IOMETE Community Version

:::info IOMETE Community Version
**The most generous free Modern Lakehouse platform in the world!**
:::

The IOMETE Community Version is a robust and freely accessible Lakehouse platform. Its versatility allows deployment across various environments, including cloud and on-premise setups.

- **Cost-Free**: Use it for personal or commercial projects without any restrictions.
- **Versatility**: Compatible with cloud or on-premise environments.
- **Generosity**: Recognized as the most generous free Lakehouse platform globally.

For a comparison with the Enterprise version, visit [IOMETE Pricing](https://iomete.com/pricing).

## Supported Cloud Providers

IOMETE is compatible with several leading cloud service providers, ensuring flexibility and ease of deployment:

- [Amazon Web Services](https://aws.amazon.com/)
- [Google Cloud Platform](https://cloud.google.com/)
- [Microsoft Azure](https://azure.microsoft.com/)
- [Digital Ocean](https://www.digitalocean.com/)

## Deployment Instructions

To begin your IOMETE deployment:

1. Clone the [IOMETE Community Deployment](https://github.com/iomete/iomete-community) repository.
2. Follow the detailed instructions provided in the repository to complete the deployment process.

## Frequently Asked Questions (FAQ)

### Can I run IOMETE on a single node?

**Yes.** IOMETE can run on a single node for development and testing. Details are available on the [single node deployment page](https://github.com/iomete/iomete-community/blob/main/kubernetes/local-k3s-guide.md).

### Does IOMETE run entirely within my infrastructure?

**Yes.** IOMETE operates entirely within your infrastructure and does not transmit data to external cloud services.

### Is internet connectivity required for IOMETE?

**By default, yes.** IOMETE needs an internet connection to download necessary docker images.

:::info air-gapped environments
For air-gapped (no-internet access clusters) environments, contact us for assistance.
:::

### Differences between cloud and on-premise deployments?

IOMETE provides a unified experience across cloud and on-premise deployments.
However, there are some differences due to the nature of the environments:

:::info Installation

- **Cloud:** Uses terraform for infrastructure setup and helm charts for IOMETE installation.
- **On-premise:** Manual infrastructure setup with helpful deployment scripts, followed by helm chart installation.
  :::

:::info Object Storage

- **Cloud:** Utilizes managed services like AWS S3, Azure Blob Storage, Google Cloud Storage.
- **On-premise:** Requires setting up S3 compatible storages like [MinIO](https://min.io/), [DELL ECS](https://www.delltechnologies.com/en-us/storage/ecs/index.htm), etc.
  :::

:::info Auto Scaling

- **Cloud:** Built-in auto-scaling features to optimize resource usage.
- **On-premise:** Typically static resource allocation, but dynamic scaling can be utilized.
  :::

### Differences between Community and Enterprise versions?

Refer to [IOMETE Pricing](https://iomete.com/pricing) for a detailed comparison.

### Support for Community Version?

IOMETE Community Version is supported by the community. Feel free to join the [IOMETE Community Discord Server](https://discord.gg/5Qj8Gwq) for support and discussions.

### Dedicated Support?

Dedicated support is available for Enterprise customers. Enterprise customers receive dedicated support via Slack or MS Teams, including full maintenance and updates.

### How to get Enterprise Version?

Schedule a call [here](https://calendly.com/iomete/iomete-discovery-call) to discuss your requirements and obtain a quote.
