---
title: IOMETE Deployment Models and Architecture
description: IOMETE runs within the organization's data center, offering maximum control over the entire stack
authors: vusal
tags2: [Educational, Technical]
coverImage: /img/blog/thumbnails/3.png
banner_description: IOMETE runs within the organization's data center, offering maximum control over the entire stack
date: 02/10/2025
---

import YoutubeCard from "@site/src/components/YoutubeCard";
import Img from '@site/src/components/Img';

## **On-Premises Deployment**

In an on-premises deployment, IOMETE operates entirely within the organization's data center infrastructure. This model provides maximum control over the entire stack and is ideal for organizations with strict data sovereignty requirements or existing data center investments.

<Img src="/img/blog/2025-02-10-iomete-deployment-models/iomete-high-level-architecture.png" alt="IOMETE high level architecture" maxWidth="500px" centered borderless/>

## The architecture consists of several key layers:

#### **Control Plane**

The Control Plane manages the overall platform operations, including resource allocation, security policies, and system monitoring. It runs on Kubernetes, providing container orchestration and ensuring high availability of platform services. The control plane manages all data planes and horizontal platform components across the organization's infrastructure.

#### **Data Planes**

The Data Plane layer handles data processing and query execution through multiple independent instances. Each data plane:

- Runs in its own Kubernetes namespace
- Can operate in the same or different Kubernetes clusters
- Contains compute infrastructure for SQL query engine supporting both interactive queries and batch operations
- Supports streaming workloads
- Can scale independently based on workload requirements

Organizations can deploy multiple data planes to scale their compute workloads effectively, with each data plane managed centrally through the control plane while maintaining operational independence.

#### **Storage Layer**

The Storage layer supports both NFS and S3-compatible object storage systems, providing flexible storage options while maintaining complete data sovereignty. This layer includes:

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