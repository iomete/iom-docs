---
title: On-Premises Deployment Guide
sidebar_label: Install
description:  Detailed instructions for deploying IOMETE on-premises within a Kubernetes environment.
last_update:
  date: 09/30/2026
  author: Abhishek Pathania
---

import Img from '@site/src/components/Img';
import Question from "@site/src/components/Question";

import Card from "@site/src/components/Card";
import GridBox from "@site/src/components/GridBox";
import { Files, Database, Sparkle, Circuitry } from "@phosphor-icons/react";
import YoutubeCard from "@site/src/components/YoutubeCard";

This guide provides detailed instructions for deploying IOMETE on-premises within a Kubernetes environment, ensuring you have a seamless setup process.

:::tip Terraform option
There is also a [Terraform configuration](https://github.com/iomete/iomete-deployment/tree/main/terraform) that handles all the steps below in one go (Kubernetes cluster, PostgreSQL, MinIO, data plane, and monitoring). This is currently available for Azure.
:::

## Essential Requirements Before You Start

Have the following ready before you start:

- **Kubernetes cluster** with room for two kinds of workloads:
  - **IOMETE services:** at least 12 CPU cores and 24GB of RAM. This includes headroom for Kubernetes system pods and Istio.
  - **Spark workloads:** at least one node with 4 CPU cores and 32GB of RAM for Spark drivers and executors.
- **Object storage:** MinIO, Dell ECS, IBM Cloud Object Storage or any other S3-compatible storage, AWS S3, Azure Blob Storage, or Google Cloud Storage. If you don't have one, see [MinIO deployment](../minio-deployment.md).
- **PostgreSQL database** for IOMETE metadata. If you don't have one, see [PostgreSQL deployment](../postgresql-deployment.md).
- **Istio**, to give users access to the IOMETE UI. See [Configure ISTIO Ingress Gateway](../configure-ingress.md).
- **Tools:**
  - `kubectl` and `helm`, set up for the target cluster.
  - `yq` v4, only if an administrator creates the cluster-level resources (option 2 below).
  - `aws` CLI (optional), to create a bucket when you use MinIO.

## Deployment Steps

Make sure `kubectl` points at the right Kubernetes cluster before you continue.

### Create namespace for IOMETE 

A dedicated namespace for IOMETE is recommended for better organization. Create it using the following command:

```shell title="Create and label the namespace"
kubectl create namespace iomete-system

# Label the namespace for IOMETE
kubectl label namespace iomete-system iomete.com/managed=true
```

:::tip
Technically, you can deploy IOMETE in any namespace. If you choose to deploy in a different namespace, ensure you use the correct namespace in the following steps.

To run Spark workloads in more namespaces, see [Install Data-Plane (Namespace)](../connect-namespace.md).
:::


### Object Storage (MinIO)

If you need an object storage system, consider deploying MinIO, object storage solution. Follow the instructions [here](../minio-deployment.md).

### Deploying Metadata Database (PostgreSQL)

For metadata storage, you need a PostgreSQL database. Please follow the instructions [here](../postgresql-deployment.md).

### Add IOMETE Helm Repository

Add the IOMETE helm repository for access to necessary charts:

```shell showLineNumbers title="Add the IOMETE Helm repository"
helm repo add iomete https://chartmuseum.iomete.com
helm repo update
```

Set the chart version you are installing. Every `helm` command below uses it, so all of them work from the same chart:

```shell title="Set the chart version"
export IOMETE_VERSION="<chart-version>"   # for example 3.19.1
```

### Prepare Your Values File

[![Artifact Hub](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/iomete)](https://artifacthub.io/packages/search?repo=iomete)

Required file: [example-data-plane-values.yaml](https://github.com/iomete/iomete-deployment/blob/main/on-prem/example-data-plane-values.yaml)

```shell title="Download the example values file"
wget https://raw.githubusercontent.com/iomete/iomete-deployment/main/on-prem/example-data-plane-values.yaml
```

This is a sample file. Edit it for your setup before you continue. For every available setting, see the [IOMETE Data Plane Enterprise](https://artifacthub.io/packages/helm/iomete/iomete-data-plane-enterprise) page on Artifact Hub.

### Create Cluster-Level Resources

IOMETE needs three sets of Kubernetes resources before its pods can start:

- The `lakehouse-service-account` service account, with its Role and RoleBinding.
- The Spark Operator CRDs.
- The Spark Operator webhook and its certificate.

The Helm chart can create all of them for you. Use option 1 if your Helm user has permission to create them. If it doesn't, use option 2 and have a Kubernetes administrator create them.

:::info Installing 3.19.0 or earlier?
The chart creates these resources from version 3.19.1 onward. On 3.19.0 or earlier, option 1 isn't available. Create the same resources by hand, as described in [Installing 3.19.0 or Earlier](#installing-3190-or-earlier).
:::

#### Option 1: Let Helm Create Them (Recommended)

Add these lines to `example-data-plane-values.yaml`:

```yaml title="example-data-plane-values.yaml"
serviceAccount:
  create: true
crds:
  create: true
webhook:
  create: true
```

With these set, Helm creates the resources during installation. It keeps the service account and the webhook up to date on every upgrade. It creates the CRDs only on the first installation and never updates them, so apply CRD changes yourself as described in [Upgrading the CRDs](#upgrading-the-crds).

If another Helm release or an administrator already manages the Spark Operator CRDs, leave `crds.create` set to `false`. Helm 4 fails the installation when an existing CRD differs from the one in the chart.

Your Helm user needs permission to create CRDs, a `MutatingWebhookConfiguration`, service accounts, Roles, RoleBindings and Secrets. If the installation fails with a `forbidden` error, set the failing switch back to `false` and use option 2 for that resource.

:::note Upgrading an existing installation
If you created these resources by hand in an earlier installation, the chart leaves them as they are. You don't need to change anything.

Turning on `crds.create` for an existing installation creates nothing, because Helm installs CRDs only on a release's first installation.
:::

#### Option 2: Have an Administrator Create Them

A Kubernetes administrator generates the resources from the chart and applies them. The commands need [`yq`](https://github.com/mikefarah/yq) v4 and must run with the same values file you install with.

1. Create the service account, Role and RoleBinding:

   ```shell
   helm template data-plane iomete/iomete-data-plane-enterprise \
     --namespace iomete-system \
     --version "$IOMETE_VERSION" \
     --values example-data-plane-values.yaml \
     --set serviceAccount.create=true \
     | yq 'select(.metadata.name == "lakehouse-service-account" or .metadata.name == "iomete-lakehouse-role" or .metadata.name == "iomete-lakehouse-role-binding")
           | del(.metadata.annotations."helm.sh/hook", .metadata.annotations."helm.sh/hook-weight")' \
     > lakehouse-service-account.yaml

   kubectl apply -f lakehouse-service-account.yaml
   ```

2. Create the Spark Operator CRDs. The chart ships them as plain files, so download the chart and apply them from it. The CRD files are large, so they must be applied with `--server-side`:

   ```shell
   helm pull iomete/iomete-data-plane-enterprise \
     --version "$IOMETE_VERSION" \
     --untar --untardir "chart-$IOMETE_VERSION"

   kubectl apply --server-side -f "chart-$IOMETE_VERSION"/iomete-data-plane-enterprise/charts/operator-crds/crds/
   ```

3. Create the webhook and its certificate:

   ```shell
   helm template data-plane iomete/iomete-data-plane-enterprise \
     --namespace iomete-system \
     --version "$IOMETE_VERSION" \
     --values example-data-plane-values.yaml \
     --set webhook.create=true \
     | yq 'select(.kind == "MutatingWebhookConfiguration" or (.kind == "Secret" and .metadata.name == "spark-operator-webhook-certs"))' \
     > spark-operator-webhook.yaml

   kubectl apply -f spark-operator-webhook.yaml
   ```

4. Keep all three switches off in `example-data-plane-values.yaml`, so Helm doesn't try to create them:

   ```yaml title="example-data-plane-values.yaml"
   serviceAccount:
     create: false
   crds:
     create: false
   webhook:
     create: false
   ```

Helm doesn't update resources an administrator created. Repeat step 1 after you [add a namespace](../connect-namespace.md) or change `namespaces`, `docker.imagePullSecrets` or `serviceAccount.annotations`, and apply CRD changes as described in [Upgrading the CRDs](#upgrading-the-crds) when you upgrade to a new chart version.

:::tip Mixing both options
You can combine the two options. For example, let Helm create the service account and have an administrator create the CRDs and the webhook. Set each switch to `true` only for what Helm creates.
:::

#### Upgrading the CRDs

`helm upgrade` never updates or deletes the Spark Operator CRDs, whether Helm or an administrator created them. When the release notes for the version you are upgrading to say the CRDs changed, apply them before you run the upgrade:

```shell
helm pull iomete/iomete-data-plane-enterprise \
  --version "$IOMETE_VERSION" \
  --untar --untardir "chart-$IOMETE_VERSION"

kubectl apply --server-side --force-conflicts -f "chart-$IOMETE_VERSION"/iomete-data-plane-enterprise/charts/operator-crds/crds/
```

`--force-conflicts` lets `kubectl` take over the fields Helm set when it created the CRDs. Without it, `kubectl` refuses the change.

#### Installing 3.19.0 or Earlier

<details>
<summary>Manual steps for chart versions 3.19.0 and earlier</summary>

These are the same three resources as in option 2, but the files come from the [iomete-deployment](https://github.com/iomete/iomete-deployment) repository instead of the chart. A Kubernetes administrator runs them, since they create cluster-level objects. There are no `create` switches to set on these versions.

1. Create the service account, Role and RoleBinding:

   ```shell
   wget https://raw.githubusercontent.com/iomete/iomete-deployment/main/service-account.yaml

   kubectl apply -n iomete-system -f service-account.yaml
   ```

2. Create the Spark Operator CRDs:

   ```shell
   wget https://raw.githubusercontent.com/iomete/iomete-deployment/main/iomete-crds.yaml

   kubectl apply --server-side -f iomete-crds.yaml
   ```

3. Create the webhook and its certificate. The `gencerts.sh` script generates the certificate and writes `spark-operator-webhook.yaml`:

   ```shell
   wget https://raw.githubusercontent.com/iomete/iomete-deployment/main/gencerts.sh
   chmod +x gencerts.sh

   ./gencerts.sh -n iomete-system -s spark-operator-webhook -r spark-operator-webhook-certs

   kubectl apply -n iomete-system -f spark-operator-webhook.yaml
   ```

When you later upgrade to 3.19.1 or newer, you don't need to redo anything. The chart finds these resources and leaves them as they are.

</details>

### Launching IOMETE Data Plane

```shell showLineNumbers title="Install the IOMETE data plane"
helm upgrade --install -n iomete-system data-plane \
  iomete/iomete-data-plane-enterprise \
  --version "$IOMETE_VERSION" \
  -f example-data-plane-values.yaml
```

Run the same command later to upgrade.

### Configure ISTIO Ingress Gateway

Please follow the [Configure ISTIO Ingress Gateway](/deployment/configure-ingress) to configure the Ingress Gateway for
IOMETE Data Plane to be able to access the UI.