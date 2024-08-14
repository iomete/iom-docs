---
title: On-Premises - Upgrade notes for 1.19.3
sidebar_label: Upgrade notes for 1.19.3
description: Upgrade notes for IOMETE On-Premises 1.19.3
last_update:
  date: 08/15/2024
  author: Vusal Dadalov
---

## Updated Docker images

No docker images are updated in this release.

## Update Helm Repository

```shell showLineNumbers
helm repo add iomete https://chartmuseum.iomete.com
helm repo update iomete
```

## Upgrade IOMETE Data Plane

Ensure your `data-plane-values.yaml` file is correctly configured before deploying the IOMETE Data Plane:

```shell showLineNumbers
helm repo update iomete

helm upgrade --install -n iomete-system data-plane \
  iomete/iomete-data-plane-enterprise \
  -f example-data-plane-values.yaml --version 1.19.3
```