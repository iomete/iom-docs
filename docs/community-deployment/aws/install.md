---
title: IOMETE Community Edition Deployment on AWS
sidebar_label: Install
description: This guide will explain how to deploy IOMETE on Amazon Web Services using the AWS CLI and Terraform command line tools
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

You're about to install the **IOMETE Lakehouse Platform Community Edition on AWS**. The IOMETE Community Edition is **the most generous Data Lakehouse Platform** on the market. Enjoy the benefits of a data lakehouse platform with no
restrictions on data volume, users, or queries.

IOMETE Community Edition is supported by the community. Feel free to join
the [IOMETE Community Discord Server](https://discord.gg/26GeyJx3Ut) for support and discussions.

:::tip Installing the IOMETE platform on AWS should take approximately 25 minutes

- 15 minutes to create the infrastructure (EKS cluster, VPC, etc.) using Terraform
- 5 minutes to install the IOMETE platform using Helm
  :::

<YoutubeCard link="https://www.youtube.com/embed/gNtZrnKNg4Y" title="Install IOMETE Community Edition on AWS: Free Data Lakehouse Tutorial" />

## Installation Steps

**Steps**

1. [Terraform](#1-terraform) - Create the necessary infrastructure on AWS for IOMETE to run.
2. [Deploy IOMETE Data Plane](#2-deploy-iomete-data-plane) - Deploy the IOMETE Data Plane using Helm.
3. [Configure Ingress Gateway](#3-configure-istio-ingress-gateway) - Configure the ISTIO Ingress Gateway to access the
   IOMETE Data Plane UI.

**Prerequisites**

- AWS CLI.
  See [AWS CLI getting started install](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- Terraform CLI. For details on how to install,
  check [Install | Terraform | HashiCorp Developer](https://developer.hashicorp.com/terraform/install).
- Kubectl. [Find Kubectl Install Tools here](https://kubernetes.io/docs/tasks/tools/).
- Helm 3. [Details on installing Helm can be found here](https://helm.sh/docs/intro/install/).

---

## 1. Terraform

Reference: https://registry.terraform.io/modules/iomete/iomete-data-plane/aws/latest

Terraform is used to create the necessary infrastructure on AWS for IOMETE to run. It will create AWS resources like
VPC, EKS cluster, Roles and Policies, etc.

### Prepare Terraform Script

```shell
# 1. Create a directory (e.g. iomete-aws-deployment)
mkdir iomete-aws-deployment

# 2. Change to the directory
cd iomete-aws-deployment

# 3. Download the Terraform script setup
wget https://raw.githubusercontent.com/iomete/terraform-aws-iomete-data-plane/main/examples/deployment-example/main.tf
```

The `main.tf` file you downloaded looks like this:

```js reference showLineNumbers title="main.tf"
https://github.com/iomete/terraform-aws-iomete-data-plane/blob/main/examples/deployment-example/main.tf
```

Update the `main.tf` file with the necessary variables.
Required variables are **region**, **cluster_name**, and **lakehouse_bucket_name**.
You can find the all
available [input variables](https://registry.terraform.io/modules/iomete/iomete-data-plane/aws/latest?tab=inputs) in the
module documentation.

:::tip Please also check the following specific settings

- You have AWS named profiles, see [Using AWS Profiles](aws-advanced-settings#using-aws-profiles) for more details.
- You want to restrict public access to the EKS API,
  see [Public Access Restriction](aws-advanced-settings#public-access-restriction) for more details.
- You want to define additional administrators,
  see [Define additional administrators](aws-advanced-settings#define-additional-administrators) for more details.
- Your AWS Account is using EBS encryption,
  see [EBS Encryption by Default](aws-advanced-settings#ebs-encryption-by-default) for more details.
  :::

### Apply Terraform

Run following commands to apply the Terraform script, and create the necessary infrastructure on AWS:

```shell showLineNumbers
terraform init --upgrade
terraform apply
```

Please make sure that you have the necessary permissions to create the resources in your AWS account. Please see
for [Required Permissions to Deploy IOMETE on AWS](permissions) for more details.

Once terraform apply is complete, you will see the output similar to the following:

```shell showLineNumbers
eks_update_kubeconfig_command = "aws eks update-kubeconfig --region us-east-1 --name test-deployment1"
```

Copy and run the command to connect to the EKS cluster using `kubectl`:

```shell showLineNumbers
aws eks update-kubeconfig --region us-east-1 --name test-deployment1
```

At this point, your AWS infrastructure is ready for IOMETE Data Plane deployment. Continue to the next step to deploy
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

See
the [IOMETE Data Plane Helm - AWS Community Version](https://github.com/iomete/iomete-deployment/blob/main/aws/data-plane-helm/readme.md)
for more details about available configurations.
See here for
the [data-plane-values.yaml](https://github.com/iomete/iomete-deployment/blob/main/aws/data-plane-helm/data-plane-values.yaml)

:::tip
You don't need to customize values for a default installation. However, if you want to tailor the installation to your
needs (perhaps you're using your own database and distinct credentials), then you can override the default values.
:::

Deploy IOMETE Data Plane:

```shell
helm upgrade --install -n iomete-system iomete-data-plane \
  iomete/iomete-data-plane-community-aws --version 1.12
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
For the first time use username and password from the `adminUser` configuration (See [data-plane-values.yaml](https://github.com/iomete/iomete-deployment/blob/main/aws/data-plane-helm/data-plane-values.yaml)). Default values
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

<Card title="Querying Files in AWS S3" icon={<Files />} link="aws/read-files-from-aws-s3">
If you have data files in AWS S3, you can directly query them using the S3 connector.
</Card>

<Card title="Getting Started with Spark Jobs" icon={<Sparkle />} link="developer-guide/spark-job/getting-started">
Learn how to run Spark jobs on IOMETE.
</Card>

<Card title="Getting started with DBT" icon={<Circuitry />} link="integrations/dbt/getting-started-with-iomete-dbt">
Learn how to use DBT with IOMETE.
</Card>

</GridBox>
