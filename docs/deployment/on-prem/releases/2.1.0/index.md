---
title: On-Premises - Upgrade notes for 2.1.0
sidebar_label: Upgrade notes for 2.1.0
description: Upgrade notes for IOMETE On-Premises 2.1.0
last_update:
  date: 10/31/2024
  author: Fuad Musayev
---

## Updated Docker images

```shell showLineNumbers
iomete/iom-data-plane-init:2.1.0
iomete/iom-app:2.1.0
iomete/iom-catalog:2.1.0
iomete/iom-core:2.1.0
iomete/iom-identity:2.1.0
iomete/iom-sql:2.1.0
iomete/iom-rest-catalog:2.1.0

iomete/spark:3.5.3
iomete/spark-py:3.5.3

iomete/spark-operator:3.5.3

iomete/kernel-pyspark:3.5.3
iomete/kernel-spark-scala:3.5.3

iomete/iomete_data_compaction:1.2.0
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
  -f example-data-plane-values.yaml --version 2.1.0
```