---
title: How to Uninstall IOMETE on GCP
sidebar_label: Uninstall
description: Step-by-step guide to uninstall IOMETE Data Plane, Kubernetes resources and GCP infrastructure for IOMETE users 
last_update:
    date: 05/01/2024
    author: Vusal Dadalov
---

## 1. Uninstall IOMETE Data Plane Helm
:::info
Make sure Kubectl is configured to use the correct cluster.
:::

```shell
# Delete Spark Applications
kubectl -n iomete-system delete sparkapplications --all

helm uninstall -n iomete-system iomete-data-plane
```

## 2. Uninstall terraform - GCP Infrastructure

Change to the directory where the Terraform configuration files are located.
```shell
terraform destroy
```

