---
title: IOMETE Community Edition Deployment on GCP
sidebar_label: Install
description: This guide will explain how to deploy IOMETE on Google Cloud Services using the GCP and Terraform command line tools
last_update:
  date: 01/25/2024
  author: Vusal Dadalov
---

import Img from '@site/src/components/Img';
import Question from "@site/src/components/Question";

import Card from "@site/src/components/Card";
import GridBox from "@site/src/components/GridBox";
import { Files, Database, Sparkle, Circuitry } from "@phosphor-icons/react";
import YoutubeCard from "@site/src/components/YoutubeCard";

You're about to install the **IOMETE Lakehouse Platform Community Edition on GCP**. The IOMETE Community Edition is **the most generous Data Lakehouse Platform** on the market. Enjoy the benefits of a data lakehouse platform with no restrictions on data volume, users, or queries.

IOMETE Community Edition is supported by the community. Feel free to join the [IOMETE Community Discord Server](https://discord.gg/26GeyJx3Ut) for support and discussions.

:::tip Installing the IOMETE platform on GCP should take approximately 25 minutes
- 15 minutes to create the infrastructure (GKE cluster, etc.) using Terraform
- 5 minutes to install the IOMETE platform using Helm
:::

:::info Prerequisites:
- An GCP account with project.
- [gcloud CLI](https://cloud.google.com/sdk/docs/install)
- Terraform CLI. For details on how to install, check [Install | Terraform | HashiCorp Developer](https://developer.hashicorp.com/terraform/install).
- Kubectl. [Find Kubectl Install Tools here](https://kubernetes.io/docs/tasks/tools/).
- Helm 3. [Details on installing Helm can be found here](https://helm.sh/docs/intro/install/).
:::

## Installation Steps

---
### 1. Run terraform

#### Clone the repository

Please clone the [IOMETE Community Edition Deployment on GCP](https://github.com/iomete/iomete-community-gcp) and follow the instructions below.

#### Update the Terraform variables

First, check [terraform/main.tf](https://github.com/iomete/iomete-community-gcp/blob/main/terraform/main.tf) file in the cloned repository, and update the values accordingly. Check here for the [Terraform variables](https://registry.terraform.io/modules/iomete/data-plane-google/google/latest).


#### Run Terraform

```shell
cd terraform
terraform init --upgrade
terraform apply
```


Once Terraform deployment is complete, connect to the GKE cluster using the command provided in the output and proceed to the next step.

:::info
Once terraform is done, you will see the output similar to the following:

```shell
# This is an example output. Your output will be different.
gke_connection_command = "gcloud container clusters get-credentials my-lakehouse-cluster --zone us-central1-c --project iom-prj1"
```
Copy and run the command to connect to the GKE cluster using `kubectl`:

```shell
gcloud container clusters get-credentials my-lakehouse-cluster --zone us-central1-c --project iom-prj1
```
:::

---
### 2. Prepare Database

You can use your own database, or you can use the provided `postgresql` database for testing purposes.

:::info
This postgresql database is for testing purpose only. **It is not recommended to use it in production**. For production, please use your own database that is optimized for production use.
:::

Add `bitnami` helm repo:
```shell
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

Deploy postgresql database, and wait for it to be ready:`
```shell
helm upgrade --install -n iomete-system \
  -f postgresql/postgresql-values.yaml postgresql bitnami/postgresql
```

Wait for postgresql pod to be ready. It takes about **~1 minute**

---
### 3. Deploy IOMETE Data Plane

Update the `data-plane-values.yaml` file with the correct values.  
:::tip 
You don't need to alter anything in this file for a default installation. However, if you want to tailor the installation to your needs (perhaps you're using your own database and distinct credentials), then you can modify the values within this file.
:::

Add, IOMETE helm repo:
```shell
helm repo add iomete https://chartmuseum.iomete.com
helm repo update
```

Deploy IOMETE Data Plane:
```shell
helm upgrade --install -n iomete-system iomete-data-plane \
  iomete/iomete-data-plane-community-gcp \
  -f data-plane-values.yaml --version 1.9.3
```


Wait for IOMETE Data Plane pods to be ready. It takes about **~6 minutes** to get everything ready in the first time installation.
```shell
kubectl get pods -n iomete-system
```

---
### 4. Configure ISTIO Ingress Gateway

Apply the following configuration for an HTTP gateway:
```shell
kubectl -n istio-system apply -f istio-ingress/resources/gateway-http.yaml
```


---
## How to use IOMETE Data Plane

Once, IOMETE Data Plane is deployed, you can access the IOMETE Data Plane UI using the following command:
```shell
kubectl get svc istio-ingress -n istio-system
```

From the output, copy the `EXTERNAL-IP` value, and open it in your browser `http://EXTERNAL-IP`

:::info
For the first time use username and password from `data-plane-values.yaml` file `adminUser` section. Default values are `admin` and `admin`. On your first login, you will be asked to change the temporary password.
:::

**That's it!** You've successfully set up IOMETE using Terraform. If you encounter any issues or have any questions please join the [IOMETE Community Discord Server](https://discord.gg/26GeyJx3Ut) for support and discussions.

:::note
It's important to store your Terraform state file in a secure location to avoid losing it. If you lose the state file, you won't be able to manage the cluster with Terraform anymore. You can store the state file in a git repository, S3 bucket, or local folder. For more information on Terraform backends, please refer the FAQ below about saving terraform state in an external location.
:::

## Quickstart Resources

Start using IOMETE with the following guides

<GridBox>

<Card title="Sync data from JDBC Databases" icon={<Database />} link="tutorials/sync-data-from-jdbc-sources">
Read our guide on how to sync data from JDBC sources, like MySQL, PostgreSQL, and Oracle.
</Card>

<Card title="Getting Started with Spark Jobs" icon={<Sparkle />} link="developer-guide/spark-job/getting-started">
Learn how to run Spark jobs on IOMETE.
</Card>

<Card title="Getting started with DBT" icon={<Circuitry />} link="integrations/dbt/getting-started-with-iomete-dbt">
Learn how to use DBT with IOMETE.
</Card>

</GridBox>
