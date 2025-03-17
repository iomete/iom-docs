---
title: Troubleshooting IOMETE on AWS
sidebar_label: Troubleshooting
description: Find solutions and troubleshooting tips for IOMETE on AWS, including AWS Infrastructure, Karpenter, Kubernetes, and more.
last_update:
    date: 10/07/2023
    author: Vusal Dadalov
---

This document contains troubleshooting tips for IOMETE on AWS. This document will be updated as we discover new issues and solutions. Feel free to join the [IOMETE Community Server](https://community.iomete.com) for support and discussions.


## New AWS Account Related Issues

1. [Missing Service Linked Role](#missing-service-linked-role)


## Karpenter - Node Provisioner Related Issues

Please check [Karpenter troubleshooting guide](https://karpenter.sh/docs/troubleshooting/) if you don't find the solution her

### Missing Service Linked Role

Unless your AWS account has already onboarded to EC2 Spot, you will need to create the service linked role to avoid ServiceLinkedRoleCreationNotPermitted.

Karpenter error message looks like this:
```shell
controller.provisioning	launching node, creating cloud provider instance, with fleet error(s), AuthFailure.ServiceLinkedRoleCreationNotPermitted: The provided credentials do not have permission to create the service-linked role for EC2 Spot Instances
```
This can be resolved by creating the [Service Linked Role](https://docs.aws.amazon.com/batch/latest/userguide/spot_fleet_IAM_role.html).

```shell
aws iam create-service-linked-role --aws-service-name spot.amazonaws.com
```