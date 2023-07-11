---
title: IOMETE deployment on Azure
sidebar_label: Install
description: This guide will explain how to deploy IOMETE on Amazon Web Services using the Azure CLI and Terraform command line tools
last_update:
  date: 07/11/2023
---
import Img from '@site/src/components/Img';
import ImgBorder from '@site/src/components/ImgBorder';
import Question from "@site/src/components/Question";

import Card from "@site/src/components/Card";
import GridBox from "@site/src/components/GridBox";
import { Files, Database, Sparkle, Circuitry } from "@phosphor-icons/react";

# IOMETE deployment on Azure

**Installing the IOMETE platform is a quick and easy process that won't take up much of your time**

Getting started with IOMETE is simple and can be done with just a few clicks. However, if you're new to using Azure, you'll need to install some tools on your local computer before you can begin. To get started, make sure you have a Azure account.


## Required tools

Make sure you have the following tools installed on your local computer:

- **Azure CLI:**: Visit the [Azure CLI installation guide](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli).
- **Terraform:**: Visit the [Terraform installation guide](https://learn.hashicorp.com/tutorials/terraform/install-cli)
    

## Signup for IOMETE

### Create an organization

Register for an account on the [IOMETE Console](https://app.iomete.cloud/dashboard) and create an organization.

<Img src="/img/guides/deployments/org-list.png" alt="IOMETE Organizations"/>

<Img src="/img/guides/deployments/org-create.png" alt="IOMETE Organization create"/>

### Create a New Cluster

Select the provider and select the region where the cluster will be installed.

<Img src="/img/guides/deployments/az-setup-cluster.png" alt="Cluster Setup"/>

### Define the workspace name

Workspaces are isolated spaces that can be used by different departments, divisions, and so.

<Img src="/img/guides/deployments/define-workspace.png" alt="Workspace define"/>


### Terraform configuration
  
The system will generate a terraform script including unique `cluster_id`.

<Img src="/img/guides/deployments/az-terraform-conf.png" alt="Terraform configuration"/>

:::danger
Don’t change cluster_id, this ID will be used to access your cluster (ex. connect external BI tools).
:::

## Deploy IOMETE to Azure

Download the terraform script file provided in the IOMETE console and execute it.

:::info
The use who will run the terraform script needs to have the following permissions:
- Azure Subscription Owner/Contributor
:::

### 1. Navigate to the folder in CLI.

Navigate to the folder where you downloaded the terraform script file in your terminal.

### 2. Authenticate to Azure

```bash
azure login
```


### 3. Apply the terraform script

```bash
# Initialize Terraform
terraform init

# Create a plan
terraform plan

# Apply the changes to your Azure
terraform apply
```

Once the **`terraform apply`** the command has finished, you should see a new file called **`IOMETE_DATA`** in the same folder where you ran the terraform script. This file contains the information you need to register your cluster with IOMETE.
Open the IOMETE control plane interface. Find the appropriate section or field to register your cluster. Paste the copied information from the IOMETE_DATA file into the respective fields in the IOMETE control plane. Follow any additional instructions or steps in the IOMETE control plane to complete the registration process.

:::info
Here are the fields you need to copy from the IOMETE_DATA file:
- AKS Name
- AKS Endpoint
- Cluster CA Certificate
- Client Certificate
- Client Key
:::

<Img src="/img/guides/deployments/az-terraform-output.png" alt="Terraform output to IOMETE Console to Complete the installation"/>


Once you hit the `Execute` button, IOMETE will start the installing IOMETE operator inside the Kubernetes cluster. This will take a few minutes.

That's it! You've successfully set up IOMETE using Terraform. If you encounter any issues or have any questions, please don't hesitate to contact our support team at: [support@iomete.com](mailto:support@iomete.com).

:::note
It's important to store your Terraform state file in a secure location to avoid losing it. If you lose the state file, you won't be able to manage the cluster with Terraform anymore. You can store the state file in a git repository, S3 bucket, or local folder. For more information on Terraform backends, please refer the FAQ below about saving terraform state in an external location.
:::
 
## Additional Resources

Start using IOMETE with the following guides

<GridBox>

<Card title="Sync data from JDBC Databases" icon={<Database />} link="/docs/guides/sync-data-from-jdbc-sources">
Read our guide on how to sync data from JDBC sources, like MySQL, PostgreSQL, and Oracle.
</Card>

<Card title="Querying Files in AWS S3" icon={<Files />} link="/docs/guides/read-files-from-aws-s3">
If you have data files in AWS S3, you can directly query them using the S3 connector.
</Card>
 
<Card title="Getting Started with Spark Jobs" icon={<Sparkle />} link="/docs/guides/spark-job/getting-started">
Learn how to run Spark jobs on IOMETE.
</Card>

<Card title="Getting started with DBT" icon={<Circuitry />} link="/docs/guides/dbt/getting-started-with-iomete-dbt">
Learn how to use DBT with IOMETE.
</Card>

</GridBox>
