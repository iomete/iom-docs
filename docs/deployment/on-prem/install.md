---
title: IOMETE On-Premises Deployment Guide (1.19)
sidebar_label: Install
description:  Detailed instructions for deploying IOMETE on-premises within a Kubernetes environment.
last_update:
  date: 08/15/2024
  author: Vusal Dadalov
---

import Img from '@site/src/components/Img';
import Question from "@site/src/components/Question";

import Card from "@site/src/components/Card";
import GridBox from "@site/src/components/GridBox";
import { Files, Database, Sparkle, Circuitry } from "@phosphor-icons/react";
import YoutubeCard from "@site/src/components/YoutubeCard";

This guide provides detailed instructions for deploying IOMETE on-premises within a Kubernetes environment, ensuring you have a seamless setup process.

## Essential Requirements Before You Start

Before initiating the deployment, ensure your system meets the following prerequisites:

- **Kubernetes Cluster:** Your cluster should include at least one data node with the following specifications:
  - **Minimum Specs for Data Node:** 4 CPU cores and 32GB of RAM.
  - **Resource Allocation:**
    - **IOMETE Controller:** Requires 2 CPU cores and 4GB of RAM.
    - **Spark Driver:** Utilizes the remaining CPU cores and memory.
- **Node Configuration Tips:**
  - Opt for uniform node sizes to simplify management.
  - Larger nodes or VMs provide improved resource efficiency.
- **Object Storage:** Have one of the following ready: Minio, DELL ECS, IBM Cloud Object Storage, AWS S3, Azure Blob Storage, or Google Cloud Storage.
- **Necessary Tools:**
  - `kubectl` for cluster interaction.
  - `helm` for package management.
  - `aws cli` for object storage connectivity.

## Hardware Recommendations

For optimal performance:
- The IOMETE controller should have 4 CPU cores and 8GB RAM.
- It's advisable to equip the data node with a minimum of 4 CPU cores and 32GB RAM.

## Deployment Steps

Ensure you're targeting the right Kubernetes cluster with `kubectl` and have the necessary repository cloned.

:::info
For upgrade instructions, refer to the [Upgrade Guide](releases/1.19.3/upgrade)
:::

### Create namespace for IOMETE 

A dedicated namespace for IOMETE is recommended for better organization. Create it using the following command:

```shell
kubectl create namespace iomete-system

# Label the namespace for IOMETE
kubectl label namespace iomete-system iomete.com/managed=true
```

:::tip
Technically, you can deploy IOMETE in any namespace. If you choose to deploy in a different namespace, ensure you use the correct namespace in the following steps.
:::


### Object Storage

If you need an object storage system, consider deploying Minio, object storage solution. Follow the instructions [here](minio-deployment).

### Deploying Metadata Database (PostgreSQL)

For metadata storage, you need a PostgreSQL database. Please follow the instructions [here](../postgresql-deployment.md).

### Add IOMETE Helm Repository

Add the IOMETE helm repository for access to necessary charts:

```shell showLineNumbers
helm repo add iomete https://chartmuseum.iomete.com
helm repo update
```

### Generating webhook certificates

Required file: [gencerts.sh](https://github.com/iomete/iomete-deployment/blob/main/on-prem/gencerts.sh)

```shell showLineNumbers
wget https://raw.githubusercontent.com/iomete/iomete-deployment/main/on-prem/gencerts.sh
chmod +x gencerts.sh

./gencerts.sh -n iomete-system -s spark-operator-webhook -r spark-operator-webhook-certs
```

### Deploying IOMETE Data Plane Base

IOMETE Data Plane Base is a base deployment for IOMETE Data Plane. It includes CRDs, Lakehouse Service Account, and Roles.

:::note Require Kubernetes Admin Access
This deployment includes cluster-level objects such as CRDs and webhooks. If you do not have the necessary permissions to deploy these objects (i.e., you cannot deploy cluster-level objects), please coordinate with your Kubernetes Admins to perform this step. The Helm chart needs to be deployed by someone with the appropriate access.
:::

See the [IOMETE Data Plane Base Helm](https://github.com/iomete/iomete-deployment/blob/main/on-prem/helm/iomete-data-plane-base/readme.md) for more details about available configurations. 
See here for the [values.yaml](https://github.com/iomete/iomete-deployment/blob/main/on-prem/helm/iomete-data-plane-base/values.yaml)


```shell showLineNumbers
helm upgrade --install -n iomete-system data-plane-base \
  iomete/iomete-data-plane-base --version 1.13
```

### Launching IOMETE Data Plane

See the [IOMETE Data Plane Enterprise Helm](https://github.com/iomete/iomete-deployment/blob/main/on-prem/helm/iomete-data-plane-enterprise/readme.md) for more details about available configurations.
See here for the [values.yaml](https://github.com/iomete/iomete-deployment/blob/main/on-prem/helm/iomete-data-plane-enterprise/values.yaml)

Required file: [example-data-plane-values.yaml](https://github.com/iomete/iomete-deployment/blob/main/on-prem/example-data-plane-values.yaml)

:::tip
`example-data-plane-values.yaml` is a sample configuration file. You can customize it according to your requirements.
:::

```shell showLineNumbers
wget https://raw.githubusercontent.com/iomete/iomete-deployment/main/on-prem/example-data-plane-values.yaml

# helm repo update iomete
helm upgrade --install -n iomete-system data-plane \
  iomete/iomete-data-plane-enterprise \
  -f example-data-plane-values.yaml --version 1.19
```

### Configure ISTIO Ingress Gateway

Please follow the [Configure ISTIO Ingress Gateway](/deployment/configure-ingress) to configure the Ingress Gateway for
IOMETE Data Plane to be able to access the UI.