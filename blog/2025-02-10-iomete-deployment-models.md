---
title: IOMETE Deployment Models and Architecture
description: IOMETE runs within the organization's data center, offering maximum control over the entire stack
authors: vusal
tags2: [Technical, Educational]
slug: iomete-deployment-models
coverImage: img/blog/2025-02-10-iomete-deployment-models/cover.png
banner_description: IOMETE runs within the organization's data center, offering maximum control over the entire stack
date: 02/10/2025
last_update:
  date: 2026-06-02
---

import YoutubeCard from "@site/src/components/YoutubeCard";
import Img from '@site/src/components/Img';
import FAQSection from '@site/src/components/FAQSection';

## **On-Premises Deployment**

In an on-premises deployment, IOMETE operates entirely within the organization's data center infrastructure. This model provides maximum control over the entire stack and is ideal for organizations with strict [data sovereignty](/blog/data-residency-vs-data-sovereignty) requirements or existing data center investments.

<Img src="/img/blog/2025-02-10-iomete-deployment-models/iomete-high-level-architecture.png" alt="IOMETE high level architecture" maxWidth="500px" centered borderless/>

## The architecture consists of several key layers:

#### **Control Plane**

The Control Plane manages the overall platform operations, including resource allocation, security policies, and system monitoring. It runs on [Kubernetes](/blog/kubernetes-native-data-engineering-architecture), providing container orchestration and ensuring high availability of platform services. The control plane manages all data planes and horizontal platform components across the organization's infrastructure.

#### **Data Planes**

The Data Plane layer handles data processing and query execution through multiple independent instances. Each data plane:

- Runs in its own Kubernetes namespace
- Can operate in the same or different Kubernetes clusters
- Contains compute infrastructure for SQL query engine supporting both interactive queries and batch operations
- Supports streaming workloads
- Can scale independently based on workload requirements

Organizations can deploy multiple data planes to scale their compute workloads effectively, with each data plane managed centrally through the control plane while maintaining operational independence.

#### **Storage Layer**

The Storage layer supports both NFS and [S3-compatible object storage](/blog/evaluating-s3-compatible-storage-for-lakehouse) systems, providing flexible storage options while maintaining complete data sovereignty. This layer includes:

- Support for various object storage implementations
- Metadata store for managing table schemas and optimization information
- Cache layer for improving query performance

This flexible storage architecture allows organizations to leverage their existing storage investments while maintaining the performance and scalability benefits of modern object storage systems.

## **Private Cloud Deployment**

Private cloud deployment follows a similar architectural pattern but operates within a private cloud environment. This model combines the control benefits of on-premises deployment with the operational advantages of cloud infrastructure.

The architecture remains consistent with the on-premises model, but organizations can leverage private cloud capabilities for:

- Automated infrastructure provisioning
- Enhanced scalability
- Built-in high availability
- Simplified network management

## **Public Cloud Deployment**

For public cloud deployments, IOMETE can utilize native cloud services while maintaining the same operational model. The platform supports major cloud providers including AWS, Azure, and Google Cloud Platform.

Key considerations for public cloud deployments include:

- Integration with cloud provider authentication systems
- Utilization of cloud-native storage services
- Network security and data transfer optimization
- Cost optimization through cloud provider discounts

## **Public Cloud Deployment**

For public cloud deployments, IOMETE can utilize native cloud services while maintaining the same operational model. The platform's self-hosted nature enables true deployment flexibility across all major cloud providers.

### **AWS, Azure, and GCP**

IOMETE provides comprehensive integration with the top three cloud providers:

Key considerations for major cloud deployments include:

- Integration with cloud provider authentication systems (AWS IAM, Azure AD, Google IAM)
- Utilization of native object storage (S3, Azure Blob Storage, Google Cloud Storage)
- Network security and data transfer optimization
- Cost optimization through provider-specific discounts and reserved instances

### **Other Cloud Providers**

IOMETE's flexible architecture extends beyond the major providers, supporting deployment on:

- Oracle Cloud Infrastructure (OCI)
- IBM Cloud
- Digital Ocean
- Regional cloud providers

This broad provider support enables organizations to:

- Leverage existing cloud provider relationships
- Meet regional data sovereignty requirements
- Optimize costs across different providers
- Maintain consistency across all cloud environments

## **Hybrid and Multi-Cloud Deployments**

IOMETE's architecture supports hybrid and multi-cloud deployments, enabling organizations to distribute workloads across different environments. The Control Plane can manage multiple Data Planes across different locations, providing:

- Workload distribution based on data locality
- Cross-region data access and processing
- Unified governance across environments
- Flexible resource allocation

<Img src="/img/blog/2025-02-10-iomete-deployment-models/iomete-deployment-options.png" alt="IOMETE deployment options" maxWidth="500px" centered borderless/>

---

<FAQSection faqs={[
  {
    question: "What is an on-premises data platform deployment?",
    answer: "An on-premises deployment runs a data platform entirely within an organization's own data center infrastructure rather than a vendor's cloud. This model gives maximum control over the full stack and suits organizations with strict data sovereignty requirements or existing data center investments. IOMETE supports on-premises deployment with a control plane and data planes running on the organization's own Kubernetes clusters."
  },
  {
    question: "What is the difference between a control plane and a data plane?",
    answer: "A control plane manages overall platform operations such as resource allocation, security policies, and monitoring, while a data plane handles the actual data processing and query execution. Separating them lets one control plane oversee many distributed data planes across regions or environments. In IOMETE, the control plane centrally manages multiple independent data planes, each running in its own Kubernetes namespace and scaling on its own."
  },
  {
    question: "What is a hybrid or multi-cloud data deployment?",
    answer: "A hybrid or multi-cloud deployment distributes data workloads across more than one environment, such as on-premises plus one or more public clouds. This lets organizations place workloads based on data locality, regional rules, or cost while keeping unified governance. IOMETE's control plane can manage data planes across different locations at once, enabling cross-region processing and consistent governance across environments."
  },
  {
    question: "How do data sovereignty requirements affect deployment choices?",
    answer: "Data sovereignty requirements dictate where data physically resides and who can access it, which often rules out vendor-managed SaaS where data leaves the organization's control. Meeting these requirements typically favors on-premises, private cloud, or region-specific deployments. IOMETE's self-hosted architecture lets organizations choose object storage and cloud regions that satisfy sovereignty rules while keeping a consistent operational model."
  }
]} />
