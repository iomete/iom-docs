---
title: How to install
last_update:
  date: 10/04/2022 

---

It is very easy to install the IOMETE module.

It is just a simple few clicks. But you have to install (if you never used it before) some tools on your local computer. If you're using AWS, you've got an account, access, and secret keys. If need help see [https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html) 

> To install the AWS CLI version 2, see [Installing or updating the latest version of the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
> 

After successfully installing AWS CLI, need to install Terraform (v0.14+). It is CLI tool and can be installed through this link: 

[Install | Terraform | HashiCorp Developer](https://developer.hashicorp.com/terraform/downloads)

Now the environment is ready and the IOMETE module can be installed. There are 2 ways to install the IOMETE module;

1. Through  IOMETE Console 

[Console | iomete](https://app.iomete.cloud/dashboard)

1. Using Terraform registry  

[Terraform Registry](https://registry.terraform.io/modules/iomete/customer-stack/aws/latest)

We are suggesting using our console to get terraform. This document will explain how to use the module through the IOMETE console.

After completing registration on the console and creating an organization you need to add a cluster.

![new cluster](/img/guides/how-to-install/new-cluster.png)

Next, need to select the provider (we are currently supporting only AWS) and select the region where will install the cluster. 

![cluster setup](/img/guides/how-to-install/cluster-setup.png)

Next, need to define **the workspace** name (workspaces are isolated spaces that can be used by different departments, divisions, and so.).

![define-workspace](/img/guides/how-to-install/define-workspace.png)

Next, the system will generate code including unique cluster_id.  

<aside>
❗ Don’t change cluster_id, this ID will be used to access your cluster (ex. connect external BI tools).

</aside>

Changing ID can collide with existing ID in our system. In this situation, external tools will not access the system

By default EKS API (Kubernetes cluster API) is accessible anywhere. Restrict access to selected IP range uncomment `kubernetes_public_access_cidrs`  and change [0.0.0.0/0] to your IP range (example: `kubernetes_public_access_cidrs = ["54.235.211.34/32", "5.195.3.45/32"]`), don't change `"54.235.211.34/32"` This is out control plane IP address where you will control your lakehouse.

Creating resources AWS will use the creator KMS key and any operation (delete, change, and so.) over these resources will available for this user. If need an additional administrator, need to uncomment `additional_administrators`  and add additional ARNs (hint: you have to include your own ARN as well, otherwise you won't be able to access the resources).

![terraform](/img/guides/how-to-install/terraform-execute.png)

The AWS user that will be used to run Terraform needs to have the following permissions:

- Create IAM roles
- Create S3 buckets
- Create EKS clusters
- EC2 full access

**Download `iomete-terraform.tf` file navigate this folder in CLI.**

### **Running Terraform**

```bash
terraform init
terraform plan
terraform apply
```

After the terraform apply command has finished, you should see the following output:

```bash
cluster_name = "iomete-cgaiqk"
cluster_certificate_authority_data = "LS0tLS1CRU.....URS0tLS0tCg=="
cluster_endpoint = "https://0B...73.gr7.us-east-2.eks.amazonaws.com"
```

**Please copy the output values and send them to IOMETE support.**

<aside>
❗ Make sure you store the Terraform state file in a safe place. If you lose it, you will not be able to manage the cluster with Terraform anymore.

You can store the state files in a git repository, in an S3 bucket, or in a local folder. See the available Terraform backends for more information:  -->

1)  Save tfstate in defferentplace [ Saving “.tfstate” in a different place](/docs/guides/installation/installation-faq) 

2) Using different AWS profile  [Different profiles](/docs/guides/installation/different-profiles)  

</aside>

The Final STEP

Copy outputs and paste the exact place in the IOMETE console.

![output](/img/guides/how-to-install/output.png) 

That's all! Congratulations 🎉🎉🎉