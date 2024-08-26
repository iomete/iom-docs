---
title: On-Premises - Upgrade notes for 1.20.0
sidebar_label: Upgrade notes for 1.20.0
description: Upgrade notes for IOMETE On-Premises 1.20.0
last_update:
  date: 08/26/2024
  author: Fuad Musayev
---

## Updated Docker images

```shell showLineNumbers
iomete/iom-app:1.20.0
iomete/iom-catalog:1.20.0
iomete/iom-core:1.20.0
iomete/iom-data-plane-init:1.20.0
iomete/iom-identity:1.20.0
iomete/iom-sql:1.20.0
# Spark Images
iomete/spark:3.5.1-v4
iomete/spark-py:3.5.1-v4

# New docker image (Only used for REST Catalog)
iomete/iom-iceberg-rest-catalog:1.1.0
```

## Fetch Helm Repository

```shell showLineNumbers
helm repo add iomete https://chartmuseum.iomete.com
helm repo update iomete
```

## Base Helm Chart

:::danger Important Note

Due to Kubernetes multi-namespace support, the Base helm chart now uses `ClusterRole` instead of `Role` for the `spark-operator` and `lakehouse-service-account` service accounts.  
Data-Plane Helm chart additionally installs `lakehouse-service-account` ServiceAccount to every connected Kubernetes namespace.

:::

```shell showLineNumbers
helm upgrade --install -n iomete-system data-plane-base \
  iomete/iomete-data-plane-base --version 1.15.0
```

## Data Plane Helm

New properties added to the `values.yaml` file:
```yaml
# ...

secretStore:
    # Currently only Database, Kubernetes and HashiCorp Vault supported.
    type: kubernetes # database, kubernetes, vault
    vaultSettings: {}
      # endpoint: "http://vault.vault.svc.cluster.local:8200"
      # path: "/v1/secret/data/iomete/dev"
      # token: "root"
      # # if tokenSecret is set, the token will be read from the secret
      # tokenSecret: {}
      #   # name: secret-name
      #   # key: token

# Multi-Namespace Support: Spark resources can now be deployed to separate namespaces,
# allowing teams to manage their own CPU and memory resources independently.
# The data plane's namespace is automatically managed and doesn't need to be specified.
namespaces: []
  # - namespace1
  # - namespace2

```

Upgrade:

```shell showLineNumbers
helm upgrade --install -n iomete-system data-plane \
  iomete/iomete-data-plane-enterprise \
  -f example-data-plane-values.yaml --version 1.20.0
```