---
title: How to Uninstall IOMETE on GCP
sidebar_label: Uninstall
description: Step-by-step guide to uninstall IOMETE Data Plane, Kubernetes resources and GCP infrastructure for IOMETE users 
last_update:
    date: 10/07/2023
    author: Vusal Dadalov
---

## 1. Uninstall IOMETE Data Plane

:::info
Make sure Kubectl is configured to use the correct cluster.
:::

```shell
helm uninstall -n iomete-system iomete-data-plane

# Delete other leftover resources
kubectl delete helmrepositories -n iomete-system --all
```

## 2. Uninstall MySQL database

:::info
If you deployed it using helm otherwise delete it using your own method.
:::

```shell
helm uninstall -n iomete-system postgresql
```

## 3. Uninstall terraform - GCP Infrastructure

```shell
cd terraform
terraform destroy
```

