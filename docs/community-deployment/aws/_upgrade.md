---
title: IOMETE AWS Upgrade
sidebar_label: Upgrade
description: This guide will walk you through upgrading your IOMETE platform using Terraform on Amazon Web Services (AWS).
last_update:
  date: 04/19/2023
  author: Vusal Dadalov
---

Upgrading the IOMETE platform is a simple process that ensures you're using the latest features and improvements. This guide will provide you with the necessary steps to upgrade your IOMETE installation on Amazon Web Services (AWS) using Terraform.

Before proceeding, ensure you have the following:

1.  An active IOMETE account and a working IOMETE installation.
2.  AWS CLI and Terraform (v0.14+) are installed on your local machine. If you need help installing these tools, refer to the [IOMETE Installation Guide](install).
3.  Access to your Terraform configuration files and state files.

:::info
Before upgrading, it's essential to back up your Terraform state file.
This file contains information about your infrastructure and must be preserved to avoid losing control over your resources.
You can either store the state file in a git repository, an S3 bucket, or a local folder.
:::

## 1. Upgrade to the latest IOMETE Terraform module

Review the [IOMETE Changelog](changelog) to learn about the new features, improvements, and bug fixes in the latest version. Understanding the changes will help you prepare for potential impacts on your existing infrastructure or custom configurations.

From the changelog, obtain the latest Terraform module. Replace the existing `customer-stack` module in your Terraform configuration with the new version.

```hcl
module "customer-stack" {
  source  = "iomete/customer-stack/aws"
  version = "X.Y.Z" # example: 1.3.0
  ...
}
```

Replace `X.Y.Z` with the latest version number provided by IOMETE.

## 2. Review and apply the changes

Before applying the changes, it's a good idea to run `terraform plan` to review any modifications to your infrastructure.

```bash
terraform init --upgrade
terraform plan
```

If the plan output looks correct, proceed with the upgrade by running the `terraform apply` command.

```bash
terraform apply
```

Terraform will update the IOMETE platform resources on your AWS account, and the process may take several minutes to complete.
Once it's finished, your IOMETE platform will be upgraded to the latest version.

## 4. Verify the upgrade

After the upgrade is complete, verify that everything is running smoothly. Access the IOMETE Console and ensure all your data and configurations are intact. Additionally, perform some basic operations like running queries or creating new resources to confirm that the platform is functioning correctly.

:::success That's it 🎉🎉🎉
You've successfully upgraded your IOMETE platform using Terraform. If you encounter any issues or have any questions, please join the [IOMETE Community Server](https://community.iomete.com) for support and discussions.
:::

## Troubleshooting

If you encounter issues during the upgrade process, try the following:

1.  Review the Terraform output for error messages or warnings.
2.  Consult the IOMETE documentation or release notes for known issues and their resolutions.
3.  If necessary, roll back to your previous IOMETE installation.
4.  Reach out to the IOMETE support team at [IOMETE Community Server](https://community.iomete.com).
