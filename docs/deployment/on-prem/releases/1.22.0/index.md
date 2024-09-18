---
title: On-Premises - Upgrade notes for 1.22.0
sidebar_label: Upgrade notes for 1.22.0
description: Upgrade notes for IOMETE On-Premises 1.22.0
last_update:
  date: 09/18/2024
  author: Fuad Musayev
---

## Updated Docker images

```shell showLineNumbers
iomete/iom-app:1.22.0
iomete/iom-catalog:1.22.0
iomete/iom-core:1.22.0
iomete/iom-data-plane-init:1.22.0
iomete/iom-identity:1.22.0
iomete/iom-sql:1.22.0
```

## Fetch Helm Repository

```shell showLineNumbers
helm repo add iomete https://chartmuseum.iomete.com
helm repo update iomete
```

## Data Plane Helm

```shell showLineNumbers
helm upgrade --install -n iomete-system data-plane \
  iomete/iomete-data-plane-enterprise \
  -f example-data-plane-values.yaml --version 1.22.0
```