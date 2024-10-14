---
title: On-Premises - Upgrade notes for 2.0.1
sidebar_label: Upgrade notes for 2.0.1
description: Upgrade notes for IOMETE On-Premises 2.0.1
last_update:
  date: 09/18/2024
  author: Fuad Musayev
---

## Updated Docker images

```shell showLineNumbers
iomete/iom-data-plane-init:2.0.1
iomete/iom-app:2.0.1
iomete/iom-catalog:2.0.1
iomete/iom-core:2.0.1
iomete/iom-identity:2.0.1
iomete/iom-sql:2.0.1
iomete/iom-rest-catalog:2.0.1

iomete/spark:3.5.1-v6
iomete/spark-py:3.5.1-v6
iomete/kernel-pyspark:3.5.1-v6
iomete/kernel-spark-scala:3.5.1-v6
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
  -f example-data-plane-values.yaml --version 2.0.1
```