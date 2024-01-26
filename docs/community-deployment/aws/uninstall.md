---
title: How to Uninstall IOMETE on AWS
sidebar_label: Uninstall
description: Step-by-step guide to uninstall IOMETE Data Plane, Kubernetes resources and AWS infrastructure for IOMETE users 
last_update:
    date: 10/07/2023
    author: Vusal Dadalov
---

## 1. Uninstall IOMETE Data Plane

:::info
Make sure Kubectl is configured to use the correct cluster.
:::

```shell
helm uninstall -n iomete-system iomete-dataplane

# Delete other leftover resources
kubectl delete helmrelease -n iomete-system --all
kubectl delete helmrepositories -n iomete-system --all
```

## 2. Uninstall MySQL database

:::info
If you deployed it using helm otherwise delete it using your own method.
:::

```shell
helm uninstall -n iomete-system mysql
```

## 3. Uninstall terraform - AWS Infrastructure

:::info Important
You need to manually delete the contents of S3 buckets, as **AWS does not allow the deletion of non-empty buckets**. Otherwise, the `terraform destroy` command will not succeed.

1. Locate the lakehouse bucket as specified in the terraform file (`lakehouse_bucket_name`).
2. Identify the assets bucket which will be prefixed with `{cluster_name}-assets-{random_string}`. The cluster name can be found in the terraform file (`cluster_name`).

**Empty the contents of these buckets so that Terraform will be able to delete them.**
:::
 



```shell
cd terraform
terraform destroy
```

