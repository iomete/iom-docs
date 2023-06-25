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

**Installing the IOMETE platform is a quick and easy process that won't take up much of your time**

Getting started with IOMETE is simple and can be done with just a few clicks. However, if you're new to using AWS, you'll need to install some tools on your local computer before you can begin. To get started, make sure you have an AWS account, as well as access and secret keys.

If you need help installing the necessary tools, check out the documentation provided by AWS at **[AWS getting started prerequisities](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html)**. 
Once you have everything set up, you can easily install the latest version of the AWS CLI by following the instructions at **[AWS CLI getting started install](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)**.

Once you've successfully installed the AWS CLI, you'll need to install Terraform (v0.14+) as well. Terraform is a command-line tool and can be downloaded from the following link: **[Install | Terraform | HashiCorp Developer](https://developer.hashicorp.com/terraform/downloads)**.

With both AWS CLI and Terraform installed, your environment is ready to go. Now you can install the IOMETE on you AWS. Follow the steps below:

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
The AWS user that will be used to run Terraform needs to have the following permissions:

- Create IAM roles
- Create S3 buckets
- Create EKS clusters
- EC2 full access
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
cluster_name = "iomete-..."
cluster_certificate_authority_data = "LS0tLS1CRU.....URS0tLS0tCg=="
cluster_endpoint = "https://0B...73.gr7.us-east-2.eks.amazonaws.com"
```

Once you have the output values, you can copy and paste them into the IOMETE console. This completes the final step of the setup process.

<Img src="/img/guides/how-to-install/terraform-output.png" alt="Terraform output to IOMETE Console to Complete the installation"/>


Once you hit the `Execute` button, IOMETE will start the installing IOMETE operator inside the Kubernetes cluster. This will take a few minutes.

That's it! You've successfully set up IOMETE using Terraform. If you encounter any issues or have any questions, please don't hesitate to contact our support team at: [support@iomete.com](mailto:support@iomete.com).

:::note
It's important to store your Terraform state file in a secure location to avoid losing it. If you lose the state file, you won't be able to manage the cluster with Terraform anymore. You can store the state file in a git repository, S3 bucket, or local folder. For more information on Terraform backends, please refer the FAQ below about saving terraform state in an external location.
:::


## Installation FAQ

<Question title="Using AWS Profiles">A <b>named profile</b> is a collection of settings and credentials that you can apply to an AWS CLI command. When you specify a profile to run a command, the settings and credentials are used to run that command. Multiple <b>named profiles</b> can be stored in the <code>config</code> and <code>credentials</code> files.

For detailed information see:  [Named profiles for the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html)

### Using profile:

After successfully creating Profile (ex. iomete-stage) need to export the profile to the environment before running terraform. ex:

```bash
export AWS_PROFILE=iomete-stage

## Then run terraform code as below

terraform init
terraform plan
terraform apply
```

P.S. Using the profile in terraform code will create additional works (ex. need to declare profile name in all providers).

We recommend exporting the profile to the environment before running the code.

If using only one account (only default profile) no need to export or separate the AWS profile.

Just run the Terraform code.
</Question>

<Question title="Public Access Restriction">By default, the EKS API (Kubernetes cluster API) is accessible from anywhere. However, it's important to restrict public access to a selected IP range for security reasons.

The IOMETE control plane connects to and manages the data lakehouse and Spark jobs using the EKS (AWS Kubernetes service) API address. By default, the **`kubernetes_public_access_cidrs`** code in the Terraform script is commented out. However, if you need to restrict public access to the EKS API for security or compliance reasons, follow these steps:

Add the following code to the Terraform script:
```terraform
module "customer-stack" {
	...
	kubernetes_public_access_cidrs = ["18.156.67.183/32", "54.235.211.34/32", "your_ip_range/mask"] # <- add this line
}
```
:::info
These are the IOMETE static IP addresses: "18.156.67.183/32", "54.235.211.34/32". This is need to for IOMETE Control Plane communicate with the cluster.
:::

:::info
`your_ip_range/mask` is your IP address. If you don't add your IP address, you will not be able to access the cluster. You can skip this if you will connect through the AWS Private Network, such as bastion host.
:::

:::note
❗️ Only deployed IP addresses will have access to all resources and EKS instances created by Terraform.
:::note

By following these steps, you can restrict public access to your EKS API and ensure that only authorized users can access your IOMETE lakehouse. If you have any questions or need assistance, please don't hesitate to contact our support team.
</Question>

<Question title="Define additional administrators">AWS Key Management Service (KMS) is an Amazon Web Services product that allows administrators to create, delete and control keys that encrypt data stored in AWS databases and products.

AWS KMS can be accessed within [AWS Identity and Access Management](https://www.techtarget.com/searchaws/definition/Amazon-Web-Services-AWS-Identity-and-Access-Management-IAM) by selecting the "Encryption Keys" section or by using the AWS KMS command-line interface or software development kit

IOMETE customer-stack Terraform module will use or create a KMS key only who run the Terraform code if additional administrator ARN`s not added. (AWS KMS see:[https://docs.aws.amazon.com/kms/latest/developerguide/overview.html](https://docs.aws.amazon.com/kms/latest/developerguide/overview.html) )

Adding an additional administrator to the system will grant them access to manage Kubernetes resources in EKS. By default, only the creator of the resources has access to Kubernetes. To add additional administrators, include their user Amazon Resource Names (ARNs) when running the Terraform code. It is important to note that when adding additional ARNs, the creators must include their own ARNs in the list to ensure that they retain access to the resources.

:::tip
Example: additional_administrators = ["arn:aws:iam::1234567890:user/your_arn", "arn:aws:iam::1234567890:user/user2", "arn:aws:iam::1234567890:user/user3"]
:::
</Question>

<Question title="Saving terraform state">
By default, Terraform writes its state file to your local filesystem. This works well for personal projects, but once you start working with a team, things start to get more challenging. In a team, you need to make sure everyone has an up to date version of the state file and ensure that two people aren’t making concurrent changes.

Remote state solves those challenges. Remote state is simply storing that state file remotely, rather than on your local filesystem. With a single state file stored remotely, teams can ensure they always have the most up to date state file. With remote state, Terraform can also lock the state file while changes are being made. This ensures all changes are captured, even if concurrent changes are being attempted.

Configuring remote state in Terraform has always been an involved process. For example, you can store state in an S3 bucket, but you need to create the bucket, properly configure it, set up permissions, and then ensure everyone has proper credentials to write to it.

As a result, setting up remote state can be a stumbling block as teams adopt Terraform.

<Question title="How to save in AWS S3">

## Terraform State File

To move or save Terraform state files to an Amazon S3 bucket, follow these steps:

1. Create an S3 bucket in your AWS account in any region.
2. Add the Terraform code to a configuration file, such as **`main.tf`**.

```bash

terraform {
  backend "s3" {
    bucket         = "your-bucket-name"
    region         = "aws-region"
    key            = "terraform.tfstate"
  }
}
```

3. Run Terraform

```bash
terraform init
terraform plan
terraform apply
```

If the output that you receive is similar to the example displayed below, then you can be assured that your code has been executed successfully.

:::info
**"Successfully configured the backend "s3"! Terraform will automatically
use this backend unless the backend configuration changes."**
:::

```bash
terraform init

Successfully configured the backend "s3"! Terraform will automatically
use this backend unless the backend configuration changes.

Initializing provider plugins...
- Reusing previous version of hashicorp/kubernetes from the dependency lock file
- Reusing previous version of hashicorp/tls from the dependency lock file
- Reusing previous version of hashicorp/aws from the dependency lock file
- Reusing previous version of hashicorp/null from the dependency lock file
- Reusing previous version of hashicorp/helm from the dependency lock file
- Reusing previous version of gavinbunney/kubectl from the dependency lock file
- Reusing previous version of hashicorp/cloudinit from the dependency lock file
- Reusing previous version of hashicorp/local from the dependency lock file
- Reusing previous version of hashicorp/random from the dependency lock file
- Using previously-installed hashicorp/local v2.1.0
- Using previously-installed hashicorp/kubernetes v2.17.0
- Using previously-installed hashicorp/aws v4.53.0
- Using previously-installed hashicorp/helm v2.8.0
- Using previously-installed hashicorp/cloudinit v2.2.0
- Using previously-installed hashicorp/random v3.1.0
- Using previously-installed hashicorp/tls v4.0.4
- Using previously-installed hashicorp/null v3.1.0
- Using previously-installed gavinbunney/kubectl v1.14.0

Terraform has been successfully initialized!

You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure. All Terraform commands
should now work.

If you ever set or change modules or backend configuration for Terraform,
rerun this command to reinitialize your working directory. If you forget, other
commands will detect it and remind you to do so if necessary.
```

To verify that the **`.tfstate`** file has been saved to your bucket, you can check the contents of the bucket to confirm that the file exists. If the file is present, it means that the state file has been successfully saved.
</Question>

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

<Question title="Using EBS encryption">
If you are using EBS encryption, you need to add users to the KMS key policy to allow IOMETE data-plane to access the key. 
<br />
This is necessary for the IOMETE data-plane to access to EBS storage, which allows it to attach EBS volumes to the nodes within the IOMETE data-plane.
<br />
<br />
First you need to determine which key is used for encrypting EBS volumes, you can follow these instructions to find the appropriate key:
<ol>
	<li>Select the appropriate Region in the AWS Management Console.</li>
	<li>Navigate to the EC2 service by clicking on the 'EC2 Dashboard' in the upper menu.</li>
	<li>In the right-side menu, locate the 'Account attributes' section and click on 'EBS encryption'.
		<br />
		<br />
		<ImgBorder src="/img/guides/how-to-install/ec2-ebs.png" alt="KMS Console"/>
	</li>
	<li>On the 'EBS encryption' page, you will find the 'Default encryption key' section.
		<br />
		<br />
		<ImgBorder src="/img/guides/how-to-install/kms-key.png" alt="KMS Console"/>
	</li>
	<li>Note down the key displayed as the 'Default encryption key'.</li>
</ol>
Once you have identified the key, you need to grant access to the IOMETE Data-plane service for this key. This will enable the IOMETE Data-plane to perform necessary operations on the encrypted EBS volumes.
<br />
<br />

To add a user/role to a KMS key using the AWS Management Console, follow these step-by-step instructions:
<ol>
	<li>Open the AWS Management Console and navigate to the AWS KMS service.</li>
	<li>Click on "Customer managed keys" in the left-hand menu.</li>
	<li> Select the KMS key you want to manage.  
		<br />
		<br />
		<ImgBorder src="/img/guides/how-to-install/kms-console.png" alt="KMS Console"/>
	</li>
	<li>Locate the "Key details" section or navigate to the specific tab where the "Key users" tab is available.</li>
	<li>Click on the "Key users" tab.</li>
	<li>Click on "Add" and enter 'iomete' in the search/filter box to narrow down the list of available roles.
		<br />
		<br />
		<ImgBorder src="/img/guides/how-to-install/search.png" alt="KMS Console"/>
	</li>
	<li>Add the following roles to the key policy:
		<ul>
			<li><code>iomete-&#123;cluster_id&#125;-ng-eks-node-group-202...</code></li>
			<li><code>KarpenterIRSA-iomete-&#123;cluster_id&#125;-202...</code></li>
			<li><code>AmazonEKS_EBS_CSI_DriverRole-&#123;cluster_id&#125;</code></li>
		</ul>
		<br />
		<ImgBorder src="/img/guides/how-to-install/kms-list.png" alt="KMS Console"/>
	</li>
	<li>Click on "Save changes" to save the modifications to the KMS key policy.</li>
</ol>
These steps will grant the necessary access to the IOMETE data-plane and enable EBS attachment to the IOMETE data-plane nodes.


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
