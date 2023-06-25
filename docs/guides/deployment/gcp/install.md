---
title: IOMETE deployment on AWS
sidebar_label: Install
description: This guide will explain how to deploy IOMETE on Amazon Web Services using the AWS CLI and Terraform command line tools
last_update:
  date: 10/04/2022
---
import Img from '@site/src/components/Img';
import ImgBorder from '@site/src/components/ImgBorder';
import Question from "@site/src/components/Question";

import Card from "@site/src/components/Card";
import GridBox from "@site/src/components/GridBox";
import { Files, Database, Sparkle, Circuitry } from "@phosphor-icons/react";

# IOMETE deployment on GCP

**Installing the IOMETE platform is a quick and easy process that won't take up much of your time**

Getting started with IOMETE is simple and can be done with just a few clicks. However, if you're new to using GCP, you'll need to install some tools on your local computer before you can begin. To get started, make sure you have a GCP account.

>  To install new resources you have to provide a PROJECT ID. Possible to use the existing but,  we recommend creating a new project id to isolate access and resources. 

Follow the below steps to install required tools

1. **Installing Google CLI:**
	- Visit the Google CLI installation guide: [https://cloud.google.com/sdk/docs/install-sdk) - Follow the instructions specific to your operating system to install Google CLI. 
	 - Once installed, open a command prompt or terminal and run the `gcloud init` command to sign in to your Google account. 

2. **Installing Terraform:** 
	- Visit the Terraform installation guide: [https://learn.hashicorp.com/tutorials/terraform/install-cli](https://learn.hashicorp.com/tutorials/terraform/install-cli) 
	- Follow the instructions specific to your operating system to install Terraform. 
	- Once installed, open a command prompt or terminal and verify the installation by running the `terraform --version` command. 

3. **Running Terraform code:** 
	- Create a new directory for your Terraform project and navigate to it in the command prompt or terminal. 
	- Inside the project directory, create a new file with a `.tf` extension (e.g., `main.tf`) and open it with a text editor.
	- Paste terraform code copied from the IOMETE control plane when created a new cluster.

 
4. **Saving the result to the IOMETE_DATA file:** 
   - (Generating the IOMETE_DATA file) After running Terraform apply to create or update your resources, Terraform will automatically generate the IOMETE_DATA file with the necessary information. Locate the IOMETE_DATA file in your Terraform project directory. 
  Open the IOMETE_DATA file using a text editor. Copy the contents of the file, which should include the following information: 
   
    

   
:::info

   - GKE Name 
   - GKE Endpoint
   - Cluster CA Certificate: 
   - Service Service Account Key: 

:::
5. **Copying and pasting the data:** 
	  - Open the IOMETE control plane interface. Find the appropriate section or field to register your cluster. Paste the copied information from the IOMETE_DATA file into the respective fields in the IOMETE control plane. Follow any additional instructions or steps in the IOMETE control plane to complete the registration process. Please note that the Terraform code provided is just an example, and you'll need to customize it based on your specific requirements and resources. Additionally, ensure you have the necessary Google permissions and credentials to perform the operations mentioned.



With both Google CLI and Terraform installed, your environment is ready to go. Now you can install the IOMETE Data-Plane on you Cloud. Follow the steps below:

## 1. Register for an account on the [IOMETE Console](https://app.iomete.cloud/dashboard) and create an organization.

<Img src="/img/guides/how-to-install/new-org-1.png" alt="New Org"/>

<Img src="/img/guides/how-to-install/new-org-2.png" alt="New Org"/>

## 2. Continue to the New Cluster section

Select the provider (we currently support only AWS) and select the region where the cluster will be installed.

<Img src="/img/guides/how-to-install/cluster-setup.png" alt="Cluster Setup"/>

## 3. Define the workspace name

Workspaces are isolated spaces that can be used by different departments, divisions, and so.

<Img src="/img/guides/how-to-install/workspace-setup.png" alt="Workspace Setup"/>


## 4. Terraform configuration
  
The system will generate a terraform script including unique `cluster_id`.

<Img src="/img/guides/how-to-install/generated-terraform-script.png" alt="Workspace Setup"/>

:::danger
Don’t change cluster_id, this ID will be used to access your cluster (ex. connect external BI tools).
:::

## 5. Execute the terraform script

Download the terraform script file and navigate to the folder in CLI.

:::info
The GCP user that will be used to run Terraform needs to have the following permissions:

- Create IAM roles
- Create Storage buckets
- Create GKE clusters
- Create Service Accounts


:::

### To run Terraform, execute the following commands in your terminal:

```bash
# Initialize Terraform
terraform init

# Create a plan
terraform plan

# Apply the changes to your AWS account
terraform apply
```

Once the **`terraform apply`** the command has finished, you should see an output similar to the following:

```bash
cluster_ca_certificate = <sensitive>
cluster_endpoint = "22.121.22.54"
cluster_service_account_key = <sensitive>
gke_name = "iomete-iom-..."
```

Once you have the output values, you can copy and paste them into the IOMETE console. This completes the final step of the setup process.

<Img src="/img/guides/how-to-install/terraform-output.png" alt="Terraform output to IOMETE Console to Complete the installation"/>


Once you hit the `Execute` button, IOMETE will start the installing IOMETE operator inside the Kubernetes cluster. This will take a few minutes.

That's it! You've successfully set up IOMETE using Terraform. If you encounter any issues or have any questions, please don't hesitate to contact our support team at: [support@iomete.com](mailto:support@iomete.com).

:::note
It's important to store your Terraform state file in a secure location to avoid losing it. If you lose the state file, you won't be able to manage the cluster with Terraform anymore. You can store the state file in a git repository, S3 bucket, or local folder. For more information on Terraform backends, please refer the FAQ below about saving terraform state in an external location.
:::


## Installation FAQ
 

<Question title="Saving terraform state">
By default, Terraform writes its state file to your local filesystem. This works well for personal projects, but once you start working with a team, things start to get more challenging. In a team, you need to make sure everyone has an up to date version of the state file and ensure that two people aren’t making concurrent changes.

Remote state solves those challenges. Remote state is simply storing that state file remotely, rather than on your local filesystem. With a single state file stored remotely, teams can ensure they always have the most up to date state file. With remote state, Terraform can also lock the state file while changes are being made. This ensures all changes are captured, even if concurrent changes are being attempted.

Configuring remote state in Terraform has always been an involved process. For example, you can store state in an S3 bucket, but you need to create the bucket, properly configure it, set up permissions, and then ensure everyone has proper credentials to write to it.

As a result, setting up remote state can be a stumbling block as teams adopt Terraform.

<Question title="How to save in Terraform Cloud"> Unlike other remote state solutions that require complicated setup, Terraform Cloud offers an easy way to get started with remote state:

- Step 0 — Sign up for a Terraform Cloud account [here](https://app.terraform.io/signup)
- Step 1 — An email will be sent to you, follow the link to activate your free Terraform Cloud account.
- Step 2 — When you log in, you’ll land on a page where you can create your organization or join an existing one if invited by a colleague.

![https://www.datocms-assets.com/2885/1560203125-start.png](https://www.datocms-assets.com/2885/1560203125-start.png)

- Step 3 — Next, go into User Settings and generate a token.
- Step 4 — Take this token and create a local ~/.terraformrc file:

```
credentials "app.terraform.io" {
	token = "mhVn15hHLylFvQ.atlasv1.jAH..."
}

```

- Step 5 — Configure Terraform Cloud as your backend

In your Terraform project, add a terraform block to configure your backend:

```
terraform {
	backend "remote" {
		organization = "my-org" # org name from step 2.
		workspaces {
			name = "my-app" # name for your app's state.
		}
	}
}

```
- Step 6— Run `terraform init` and you’re done.

Your state is now being stored in Terraform Cloud. You can see the state in the UI:

![Remote state setup Terraform](/img/guides/remote-state-setup-terraform.png)

Detailed information and learn how to use Terraform cloud see: [https://www.hashicorp.com/blog/using-terraform-cloud-remote-state-management](https://www.hashicorp.com/blog/using-terraform-cloud-remote-state-management)
</Question>
</Question>
 
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
