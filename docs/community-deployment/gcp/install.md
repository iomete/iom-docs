---
title: IOMETE Community Edition Deployment on GCP
sidebar_label: Install
description: This guide will explain how to deploy IOMETE on Google Cloud Services using the GCP and Terraform command line tools
last_update:
  date: 05/01/2024
  author: Vusal Dadalov
---

import Img from '@site/src/components/Img';
import Question from "@site/src/components/Question";

import Card from "@site/src/components/Card";
import GridBox from "@site/src/components/GridBox";
import { Files, Database, Sparkle, Circuitry } from "@phosphor-icons/react";
import YoutubeCard from "@site/src/components/YoutubeCard";

You're about to install the **IOMETE Lakehouse Platform Community Edition on GCP**. The IOMETE Community Edition is **the most generous Data Lakehouse Platform** on the market. Enjoy the benefits of a data lakehouse platform with no
restrictions on data volume, users, or queries.

IOMETE Community Edition is supported by the community. Feel free to join
the [IOMETE Community Discord Server](https://discord.gg/26GeyJx3Ut) for support and discussions.

:::tip Installing the IOMETE platform on GCP should take approximately 25 minutes

- 15 minutes to create the infrastructure (GKE cluster, VPC, etc.) using Terraform
- 5 minutes to install the IOMETE platform using Helm
:::

## Installation Steps

**Steps**

1. [Terraform](#1-terraform) - Create the necessary infrastructure on GCP for IOMETE to run.
2. [Deploy IOMETE Data Plane](#2-deploy-iomete-data-plane) - Deploy the IOMETE Data Plane using Helm.
3. [Configure Ingress Gateway](#3-configure-istio-ingress-gateway) - Configure the ISTIO Ingress Gateway to access the
   IOMETE Data Plane UI.

**Prerequisites**

- An GCP account.
- [gcloud CLI](https://cloud.google.com/sdk/docs/install)
- Terraform CLI. For details on how to install,
  check [Install | Terraform | HashiCorp Developer](https://developer.hashicorp.com/terraform/install).
- Kubectl. [Find Kubectl Install Tools here](https://kubernetes.io/docs/tasks/tools/).
- Helm 3. [Details on installing Helm can be found here](https://helm.sh/docs/intro/install/).

---

## 1. Terraform

Reference: https://registry.terraform.io/modules/iomete/iomete-data-plane/gcp/latest

Terraform is used to create the necessary infrastructure on GCP for IOMETE to run. It will create GCP resources like
VPC, GKE cluster, Service Account, Node Pools etc.

### Prepare Terraform Script

```shell
# 1. Create a directory (e.g. iomete-gcp-deployment)
mkdir iomete-gcp-deployment

# 2. Change to the directory
cd iomete-gcp-deployment

# 3. Download the Terraform script setup
wget https://raw.githubusercontent.com/iomete/terraform-gcp-iomete-data-plane/main/examples/deployment-example/main.tf
```

The `main.tf` file you downloaded looks like this:

```js reference showLineNumbers title="main.tf"
https://github.com/iomete/terraform-gcp-iomete-data-plane/blob/main/examples/deployment-example/main.tf
```

Required variables are **project**, **region**, **zone**, **cluster_name** and **lakehouse_bucket_name**.
You can find the all available [input variables](https://registry.terraform.io/modules/iomete/iomete-data-plane/gcp/latest?tab=inputs) in the module documentation.

### Apply Terraform

Run following commands to apply the Terraform script, and create the necessary infrastructure on GCP:

```shell showLineNumbers
terraform init --upgrade
terraform apply
```

Please make sure that you have the necessary permissions to create the resources in your GCP account.

Once terraform apply is complete, you will see the output similar to the following:

```shell showLineNumbers
gke_connection_command = "gcloud container clusters get-credentials my-lakehouse-cluster --zone us-central1-c --project iom-prj1"
```

Copy and run the command to connect to the GKE cluster using `kubectl`:

```shell showLineNumbers
gcloud container clusters get-credentials my-lakehouse-cluster --zone us-central1-c --project iom-prj1
```

At this point, your GCP infrastructure is ready for IOMETE Data Plane deployment. Continue to the next step to deploy
IOMETE Data Plane.

---

## 2. Deploy IOMETE Data Plane

### Prepare Database

IOMETE requires a PostgreSQL database to store metadata and other information. Refer [Backend Databases](/deployment/backend-databases) for more details.

You can use your own database, or you can use the provided `postgresql` database.

:::info
This postgresql database is for testing purpose only. For production, please use your own database that is optimized for production use.
:::

Add `bitnami` helm repo if you haven't done so.

```shell showLineNumbers
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

Deploy postgresql database, and wait for it to be ready.

```shell
helm upgrade --install -n iomete-system \
  postgresql bitnami/postgresql \
  -f https://raw.githubusercontent.com/iomete/iomete-deployment/main/database/postgresql/postgresql-values.yaml 
```

Wait for postgresql pod to be ready. It takes about **~1 minute**

```shell
kubectl get pods -n iomete-system \
  -l app.kubernetes.io/name=postgresql --watch
```

### Deploy IOMETE Data Plane Helm Chart

Add, IOMETE helm repo:

```shell
helm repo add iomete https://chartmuseum.iomete.com
helm repo update
```

See the [IOMETE Data Plane Helm - GCP Community Version](https://github.com/iomete/iomete-deployment/blob/main/gcp/data-plane-helm/readme.md) 
for more details about available configurations. 
See here for the [data-plane-values.yaml](https://github.com/iomete/iomete-deployment/blob/main/gcp/data-plane-helm/data-plane-values.yaml)

:::tip
You don't need to customize values for a default installation. However, if you want to tailor the installation to your
needs (perhaps you're using your own database and distinct credentials), then you can override the default values.
:::

Deploy IOMETE Data Plane:

```shell
helm upgrade --install -n iomete-system iomete-data-plane \
  iomete/iomete-data-plane-community-gcp --version 1.9 \
  --set ingress.httpsEnabled=false
```

Wait for IOMETE Data Plane pods to be ready. It takes about **~6 minutes** to get everything ready in the first time
installation.

```shell
kubectl get pods -n iomete-system --watch
```

---

## 3. Configure ISTIO Ingress Gateway

Please follow the [Configure ISTIO Ingress Gateway](/deployment/configure-ingress) to configure the Ingress Gateway for
IOMETE Data Plane to be able to access the UI.


---

## 4. Access IOMETE Data Plane

Once, IOMETE Data Plane is deployed and ingress gateway is configured, you can access the IOMETE Data Plane UI.

Get the external IP of the ISTIO Ingress Gateway:
```shell
kubectl get svc istio-ingress -n istio-system
```

From the output, copy the `EXTERNAL-IP` value, and open it in your browser `http://EXTERNAL-IP`

:::info
For the first time use username and password from the `adminUser` configuration (See [data-plane-values.yaml](https://github.com/iomete/iomete-deployment/blob/main/gcp/data-plane-helm/data-plane-values.yaml)). Default values
are `admin` and `admin`. On your first login, you will be asked to change the temporary password.
:::

**That's it!** You've successfully set up IOMETE data plane. If you encounter any issues or have any questions
please join the [IOMETE Community Discord Server](https://discord.gg/26GeyJx3Ut) for support and discussions.


---
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