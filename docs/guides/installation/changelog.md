---
title: Changelog
description: Release notes for IOMETE installation module. Stay informed on the latest changes, enhancements, and issue resolutions within the IOMETE platform's ongoing development.
last_update:
  date: 04/19/2022
  author: Fuad Musayev
---

Release notes for IOMETE installation module.  
   
We hope these improvements will make your experience with IOMETE even better. As always, please let us know if you have any feedback or suggestions for further enhancements.

## **v1.3.0**: Reduce cloud costs by ~50% 💰
We're excited to announce some major improvements to IOMETE that will help you save costs and optimize your infrastructure.

**📢 What's New**  
- We've grouped all nodes in the same availability zone to prevent data transfer charges. Additionally, we've decreased the desired node count from 2 to 1, resulting in up to 50% cost savings.
- We've added NAT Public IP to Workspace settings to simplify network configuration and management.
- We've increased node disk size to 100GB to prevent disk pressure issues that were present in earlier versions.

**🐞 Bugs Fixed**  
- Cluster role ARN is not displayed correctly in workspace settings (now renamed to cluster_role_arn).
- Fixed the IOMETE Terraform module version to ensure compatibility with other modules and dependencies.


## **v1.0.1**: Disabled detailed monitoring by default 🔧

**📢 What's New**  
- Disabled detailed monitoring of EC2 nodes. If you need to enable detailed monitoring add `enable_monitoring = true` under the module.
  - **Basic monitoring**: Data is available automatically in 5-minute periods. | No charge.
  - **Detailed monitoring:** Data is available in 1-minute periods. | You are charged per metric that is sent to CloudWatch

## **v1.0.0**: Launched IOMETE Terraform module 🚀

**🎉 Announcement**  
- The initial release of the IOMETE Terraform module. This module allows you to install IOMETE on your own AWS infrastructure.
- Added to [Terraform Registry](https://registry.terraform.io/modules/iomete/customer-stack/aws/latest)
- Source code is available on [GitHub](https://github.com/iomete/terraform-aws-customer-stack)
