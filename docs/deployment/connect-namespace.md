---
title: Install Data-Plane to Kubernetes Namespace
sidebar_label: Install Data-Plane (Namespace)
description: Learn how to install and connect a new Data-Plane to IOMETE Control-Plane.
last_update:
  date: 11/02/2026
  author: Vusal Dadalov
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

### Add the Namespace to Your Values File

In the `values.yaml` file of the IOMETE Control Plane, add the new namespace to the `namespaces` section:

```yaml showLineNumbers
# Multi-Namespace Support: Spark resources can now be deployed to separate namespaces,
# allowing teams to manage their own CPU and memory resources independently.
# The data plane's namespace is automatically managed and doesn't need to be specified.
namespaces:
  - data-plane-ns
```

### Create the Service Account and Role

The new namespace needs `lakehouse-service-account` with its Role and RoleBinding.

- **If `serviceAccount.create` is `true` in `values.yaml`**, skip this step. The Helm upgrade below creates them.
- **If it is `false`**, have a Kubernetes administrator re-create the file from step 1 of [Option 2 in the install guide](./on-prem/install.md#option-2-have-an-administrator-create-them) and apply it before you upgrade. The file covers every namespace listed in `values.yaml`, so it includes the new one.
- **On 3.19.0 or earlier**, create them manually before you upgrade, as shown in [Installing 3.19.0 or Earlier](#installing-3190-or-earlier).

### Add the Namespace to the Webhook

Skip this step if `webhook.create` is `true`. Helm updates the webhook during the upgrade.

If an administrator created the webhook with the install guide commands, add the new namespace to it. List the Control Plane namespace and every namespace from `values.yaml`:

```shell
kubectl patch mutatingwebhookconfiguration spark-operator-iomete-system \
  --type=strategic \
  -p='{"webhooks":[{"name":"webhook.sparkoperator.k8s.io","namespaceSelector":{"matchExpressions":[{"key":"kubernetes.io/metadata.name","operator":"In","values":["iomete-system","data-plane-ns"]}]}}]}'
```

If the webhook was created with `gencerts.sh`, skip this step. The `iomete.com/managed=true` label you added to the namespace is enough.

### Create Secrets in the New Namespace

The Helm upgrade doesn't copy these Secrets, and pods in the new namespace can't start without the ones they use. Before you upgrade, create each of these that applies to your install:

- **Private registry:** every Secret under `docker.imagePullSecrets`. See [Private Docker Registry Authentication](/user-guide/k8s/private-docker-registry). If you patched `lakehouse-service-account` by hand, patch it in the new namespace too.
- **`javaTrustStore.enabled` is `true`:** the `java-truststore` Secret. See [Create a Kubernetes Secret](./truststore.md#3-create-a-kubernetes-secret-with-the-truststorejks-file).

A default install uses neither, so it can skip this step.

### Upgrade IOMETE

Use the chart version you already run, so the upgrade doesn't move you to a newer release:

```shell showLineNumbers
export IOMETE_VERSION="<chart-version>"   # the version you installed, for example 3.19.1

helm upgrade --install -n iomete-system data-plane iomete/iomete-data-plane-enterprise \
  --version "$IOMETE_VERSION" \
  -f values.yaml
```

### Restart `iom-cluster`

`iom-cluster` reads the namespace list once, when it starts, and checks every assignment against that list. Until it restarts, it refuses the new namespace. On 4.0.0 or later, the console already offers the namespace during that time. On earlier versions, the console doesn't list it until the restart.

- **On 4.0.2 or later**, the Helm upgrade restarts it. Wait for the rollout to finish:

  ```shell
  kubectl rollout status deployment/iom-cluster -n iomete-system
  ```

- **On 3.16 through 4.0.1**, the Helm upgrade doesn't restart it, so restart it yourself:

  ```shell
  kubectl rollout restart deployment/iom-cluster -n iomete-system
  kubectl rollout status deployment/iom-cluster -n iomete-system
  ```

- **On 3.15 or earlier**, run the same two commands with `deployment/iom-core`.

Then check that the pods in the new namespace are running:

```shell
kubectl get pods -n data-plane-ns
```

`helm rollback` doesn't restore the namespace list. After rolling back across a `namespaces` change, run the Helm upgrade with the list you want, then restart `iom-cluster` yourself, on any version.

### Assign the Namespace to a Domain

1. In the admin console, open **Domains** and select the domain.
2. Open the **Namespaces** tab.
3. Select **Add Namespace** and choose the new namespace. On 4.0.0 or later, then select **Add**.

:::info Assignment fails
If the assignment fails with `Namespace data-plane-ns is not allowed`, `iom-cluster` is still using the old list. This isn't a permissions problem. Follow [Restart `iom-cluster`](#restart-iom-cluster), then try again. On 4.0.2 or later, the same failure reads `Namespace data-plane-ns is not known to iom-cluster for data plane default`.
:::

### Installing 3.19.0 or Earlier

<details>
<summary>Manual steps for chart versions 3.19.0 and earlier</summary>

On these versions, create the service account and Role by hand before the Helm upgrade. Required file: [service-account.yaml](https://github.com/iomete/iomete-deployment/blob/main/service-account.yaml)

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

</details>
