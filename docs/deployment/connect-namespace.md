---
title: Install Data-Plane to Kubernetes Namespace
sidebar_label: Install Data-Plane (Namespace)
description: Learn how to install and connect a new Data-Plane to IOMETE Control-Plane.
last_update:
  date: 11/09/2024
  author: Fuad Musayev
---

import Img from '@site/src/components/Img';
import Question from "@site/src/components/Question";

import Card from "@site/src/components/Card";
import GridBox from "@site/src/components/GridBox";

This document will guide you through the process of installing and connecting a new Data-Plane to the IOMETE Control-Plane.

:::danger Namespace names
In this document, we use `data-plane-ns` and `iomete-system` as the namespace names for the Data-Plane and Control-Plane instances. You can replace it with your desired namespace name.  
Note that the Control-Plane namespace should be the same as the one you used during the Control-Plane installation.
:::

### Create new namespace for Data-Plane instance  

```shell
# Change `new-data-plane` to your desired namespace name
kubectl create namespace data-plane-ns

# Label the namespace for IOMETE
kubectl label namespace data-plane-ns iomete.com/managed=true
```

### Create Service Account and Role
Required file: [service-account.yaml](https://github.com/iomete/iomete-deployment/blob/main/service-account.yaml)
```shell showLineNumbers
wget https://raw.githubusercontent.com/iomete/iomete-deployment/main/service-account.yaml

kubectl apply -n data-plane-ns -f service-account.yaml

wget https://raw.githubusercontent.com/iomete/iomete-deployment/main/role-binding-to-control-plane.yaml

export CP_NAMESPACE=iomete-system

sed -i "s/{{control-plane-namespace}}/$CP_NAMESPACE/g" role-binding-to-control-plane.yaml
#For macOS use the following command
# sed -i '' "s/{{control-plane-namespace}}/$CP_NAMESPACE/g" role-binding-to-control-plane.yaml

kubectl apply -n data-plane-ns -f role-binding-to-control-plane.yaml
```

### Update IOMETE Control Plane

In `values.yaml` file of the IOMETE Control Plane, add the following configuration to the `namespaces` section:

```yaml showLineNumbers
# Multi-Namespace Support: Spark resources can now be deployed to separate namespaces,
# allowing teams to manage their own CPU and memory resources independently.
# The data plane's namespace is automatically managed and doesn't need to be specified.
namespaces:
  - data-plane-ns
```

```yaml showLineNumbers
# helm repo update iomete
helm upgrade --install -n iomete-system data-plane iomete/iomete-data-plane-enterprise -f values.yaml
```
