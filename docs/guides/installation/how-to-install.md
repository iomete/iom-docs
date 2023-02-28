---
title: How to install IOMETE
description: This guide will explain how to install IOMETE on Amazon Web Services using the AWS CLI and Terraform command line tools
last_update:
  date: 10/04/2022
---

# Installing the IOMETE module is a quick and easy process that won't take up much of your time.

Getting started with IOMETE is simple and can be done with just a few clicks. However, if you're new to using AWS, you'll need to install some tools on your local computer before you can begin. To get started, make sure you have an AWS account, as well as access and secret keys.

If you need help installing the necessary tools, check out the documentation provided by AWS at **[AWS getting started prerequisities](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html)**. 
Once you have everything set up, you can easily install the latest version of the AWS CLI by following the instructions at **[AWS CLI getting started install](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)**.

Once you've successfully installed the AWS CLI, you'll need to install Terraform (v0.14+) as well. Terraform is a command-line tool and can be downloaded from the following link: **[Install | Terraform | HashiCorp Developer](https://developer.hashicorp.com/terraform/downloads)**.

With both AWS CLI and Terraform installed, your environment is ready to go. Now you can install the IOMETE module. There are two ways to do this:

1. Through  IOMETE Console - [Console | iomete](https://app.iomete.cloud/dashboard)

1. Using Terraform registry  - [Terraform Registry](https://registry.terraform.io/modules/iomete/customer-stack/aws/latest)

We recommend using our console to get Terraform code. Our console provides ready code (with cluster id and other necessary changes). To get started, follow the steps below:

1. Register for an account on the IOMETE console and create an organization.
2. Navigate to the New Cluster section of the console and follow the prompts to add a cluster.

![new cluster](/img/guides/how-to-install/iomete-new-cluster.png)

Next, select the provider (we currently support only AWS) and select the region where the cluster will be installed. 

![cluster setup](/img/guides/how-to-install/iomete-cluster-setup.png)

Next, need to define **the workspace** name (workspaces are isolated spaces that can be used by different departments, divisions, and so.).

![define workspace](/img/guides/how-to-install/iomete-define-workspace.png)

Next, the system will generate code including unique cluster_id.  

:::danger

Don’t change cluster_id, this ID will be used to access your cluster (ex. connect external BI tools).

:::

Please note that the cluster_id used to create your Kubernetes cluster may collide with existing IDs in our system, which can cause issues with external tools accessing the system. If you encounter any issues, please reach out to our support team for assistance.

![Terraform execute](/img/guides/how-to-install/iomete-terraform-execute.png)

The AWS user that will be used to run Terraform needs to have the following permissions:

- Create IAM roles
- Create S3 buckets
- Create EKS clusters
- EC2 full access

**Download iomete-terraform.tf file and navigate this folder in CLI.**

### To run Terraform, execute the following commands in your terminal:

```bash
terraform init
terraform plan
terraform apply
```

Once the **`terraform apply`** the command has finished, you should see an output similar to the following:

```bash
cluster_name = "iomete-cgaiqk"
cluster_certificate_authority_data = "LS0tLS1CRU.....URS0tLS0tCg=="
cluster_endpoint = "https://0B...73.gr7.us-east-2.eks.amazonaws.com"
```

Once you have the output values, you can copy and paste them into the IOMETE console. This completes the final step of the setup process.

![output](/img/guides/how-to-install/iomete-endpoint-output.png)

:::note
It's important to store your Terraform state file in a secure location to avoid losing it. If you lose the state file, you won't be able to manage the cluster with Terraform anymore. You can store the state file in a git repository, S3 bucket, or local folder. For more information on Terraform backends, please refer to our documentation: [ Saving “.tfstate” in a different place](docs/guides/installation/installation-faq.mdx) 

:::

 

That's it! You've successfully set up IOMETE using Terraform. If you encounter any issues or have any questions, please don't hesitate to contact our support team.