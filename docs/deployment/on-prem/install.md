---
title: On-Premises Deployment Guide
sidebar_label: Install
description:  Detailed instructions for deploying IOMETE on-premises within a Kubernetes environment.
last_update:
  date: 11/05/2026
  author: Abhishek Pathania
---

This guide installs an IOMETE **control plane and its default data plane** in the `iomete-system` namespace. You open the console on the control plane; the default data plane runs compute workloads. The Helm release is named `data-plane` and uses the `iomete-data-plane-enterprise` chart.

| What you need | Where to start |
|---|---|
| A new IOMETE installation, including the console | Follow this guide. |
| Another workload namespace for an existing data plane | Follow [Adding a Kubernetes Namespace](../connect-namespace.md). You do not need another control plane. |
| An additional data plane connected to an existing control plane | Review [Multi-Cluster Setup](../multi-cluster-setup.mdx). An additional plane uses its own `iomete-lakehouse-runtime` release and service namespace. |
| An upgrade of an existing release | Follow [Life Cycle Management](../life-cycle-management.mdx). |

One data plane can manage several workload namespaces in its Kubernetes cluster. Several data planes can share a Kubernetes cluster when their releases and managed namespaces are separate. A workload namespace must not be managed by two IOMETE releases.

:::tip Terraform option
There is also a [Terraform configuration](https://github.com/iomete/iomete-deployment/tree/main/terraform) that handles all the steps below in one go (Kubernetes cluster, PostgreSQL, Apache Ozone, data plane, and monitoring). This is currently available for Azure.
:::

:::tip Nutanix Kubernetes Platform
Installing on Nutanix Kubernetes Platform (NKP)? Follow this guide together with [Deploying IOMETE on NKP](../nutanix-nkp.md), which covers the NKP-specific settings for Nutanix Objects, Nutanix Volumes, CloudNativePG and the built-in Traefik ingress. Istio is not needed on NKP.
:::

## Essential Requirements Before You Start

Have the following ready before you start:

- **Kubernetes cluster** with room for two kinds of workloads:
  - **IOMETE services:** at least 12 CPU cores and 24GB of RAM. This includes headroom for Kubernetes system pods and Istio.
  - **Spark workloads:** at least one node with 4 CPU cores and 32GB of RAM for Spark drivers and executors.
- **Object storage:** Apache Ozone, Dell ECS, IBM Cloud Object Storage, MinIO or any other S3-compatible storage, AWS S3, Azure Blob Storage, or Google Cloud Storage. If you don't have one, see [Apache Ozone deployment](../ozone-deployment.md) or [MinIO deployment](../minio-deployment.md).
- **PostgreSQL database** for IOMETE metadata. If you don't have one, see [PostgreSQL deployment](../postgresql-deployment.md).
- **An ingress controller and a hostname** for the control plane. This guide uses [Istio](../configure-ingress.md); deployments with an existing controller can use its equivalent HTTP, WebSocket and gRPC routing. Use a TLS certificate trusted by your users and services.
- **Tools:**
  - `kubectl` and `helm`, set up for the target cluster.
  - `yq` v4, only if an administrator creates the cluster-level resources (option 2 below).
  - `aws` CLI (optional), to create a bucket when you use Apache Ozone or MinIO.

## Deployment Steps

Confirm the target cluster and check for existing IOMETE releases before you continue:

```shell
kubectl config current-context
helm list --all-namespaces
```

The steps below assume a new installation. If `data-plane` already exists in `iomete-system`, use the upgrade guide instead.

### Creating the IOMETE Namespace {#create-namespace-for-iomete}

A dedicated namespace for IOMETE is recommended for better organization. Create it using the following command:

```shell title="Create and label the namespace"
kubectl create namespace iomete-system

# Label the namespace for IOMETE
kubectl label namespace iomete-system iomete.com/managed=true
```

:::tip
Technically, you can deploy IOMETE in any namespace. If you choose to deploy in a different namespace, ensure you use the correct namespace in the following steps.

The release namespace is included automatically in the plane’s managed namespaces. To add dedicated workload namespaces, see [Adding a Kubernetes Namespace](../connect-namespace.md).
:::


### Object Storage

If you need an object storage system, you can deploy Apache Ozone, an open-source S3-compatible object store. Follow the instructions in [Apache Ozone deployment](../ozone-deployment.md). You can also use [MinIO](../minio-deployment.md).

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
export IOMETE_VERSION="<approved-chart-version>"
```

### Preparing Your Values File {#prepare-your-values-file}

[![Artifact Hub](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/iomete)](https://artifacthub.io/packages/search?repo=iomete)

Required file: [example-data-plane-values.yaml](https://github.com/iomete/iomete-deployment/blob/main/on-prem/example-data-plane-values.yaml)

```shell title="Download the example values file"
wget https://raw.githubusercontent.com/iomete/iomete-deployment/main/on-prem/example-data-plane-values.yaml
```

Edit the sample for your setup before continuing. Replace the example database and storage credentials and set your storage endpoint and bucket. Keep the values file private if it contains credentials. Compare it with the defaults of the version you selected:

```shell
helm show values iomete/iomete-data-plane-enterprise \
  --version "$IOMETE_VERSION" > chart-defaults.yaml
```

For an HTTPS ingress, set `ingress.httpsEnabled: true`; the downloaded example uses HTTP. This setting changes forwarded URLs and headers inside IOMETE. It does not create a TLS listener or a certificate.

Set `adminUser.temporaryPassword` to a new password before the initial install. If you use a private image registry, create the referenced pull Secret in each managed namespace and configure `docker.imagePullSecrets` in this file. The chart does not copy Secrets across namespaces. Use `serviceAccount.create: true` below to have Helm attach the configured pull Secrets when it creates the service accounts; do not patch a service account that has not been created yet.

Keep `defaultDataPlane.enabled: true` for the installation described here. Setting it to `false` is a control-plane-only configuration and requires separately installed data planes before users can create compute workloads.

### Creating Service Accounts, CRDs and the Webhook {#create-cluster-level-resources}

IOMETE needs the following Kubernetes resources. Service accounts, Roles, RoleBindings and certificate Secrets are namespaced; CRDs and webhook configurations are cluster-wide:

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

With these set, Helm creates the resources during installation. It keeps resources owned by this release up to date on upgrades. It does not take over administrator-owned service accounts or webhooks. It creates the CRDs only on the first installation and never updates them, so apply CRD changes yourself as described in [Upgrading the CRDs](#upgrading-the-crds).

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

Helm doesn't update resources an administrator created. Repeat step 1 after you [add a namespace](../connect-namespace.md) or change `namespaces`, `docker.imagePullSecrets` or `serviceAccount.annotations`. When namespaces change, also update the existing webhook’s namespace selector as described in that guide; do not regenerate its certificate just to change the selector. Apply CRD changes as described in [Upgrading the CRDs](#upgrading-the-crds).

:::tip Mixing both options
You can combine the two options. For example, let Helm create the service account and have an administrator create the CRDs and the webhook. Set each switch to `true` only for what Helm creates.
:::

#### Upgrading the CRDs

`helm upgrade` never updates or deletes the Spark Operator CRDs, whether Helm or an administrator created them. When the release notes for the version you are upgrading to say the CRDs changed, apply them before you run the upgrade:

```shell
helm pull iomete/iomete-data-plane-enterprise \
  --version "$IOMETE_VERSION" \
  --untar --untardir "chart-$IOMETE_VERSION"

kubectl apply --server-side -f "chart-$IOMETE_VERSION"/iomete-data-plane-enterprise/charts/operator-crds/crds/
```

CRDs are shared by every Spark Operator in the Kubernetes cluster. Coordinate the change with their owners and check version compatibility first. If server-side apply reports a field ownership conflict, review the conflicting fields with the administrator; use `--force-conflicts` only when intentionally taking ownership of those fields.

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

### Installing IOMETE {#launching-iomete-data-plane}

```shell title="Install the control plane and default data plane"
helm install data-plane iomete/iomete-data-plane-enterprise \
  --namespace iomete-system \
  --version "$IOMETE_VERSION" \
  --values example-data-plane-values.yaml \
  --wait --timeout 15m
```

Check the release and its services:

```shell
helm status data-plane --namespace iomete-system
kubectl get deployments,pods --namespace iomete-system
kubectl get events --namespace iomete-system --sort-by=.lastTimestamp
```

The release should be `deployed` and the service Deployments should have their requested ready replicas. If installation fails, inspect the failing pod or initialization Job before retrying. A registry pull error, missing Secret or database connection error needs a configuration fix; increasing the timeout does not resolve it.

### Configuring Ingress and Verifying Access {#configure-istio-ingress-gateway}

Follow [Configuring Ingress](../configure-ingress.md) to route your hostname to the control plane. Open that hostname in a browser and sign in with the admin credentials from your values file. Change the temporary password when prompted.

Verify that the default data plane is connected. Then follow [Adding a Kubernetes Namespace](../connect-namespace.md) if you need separate workload namespaces, assign a namespace to a domain, and run a small compute query such as `SELECT 1`. This checks workload access in addition to console access.

Keep the values file and approved chart version for [future upgrades](../life-cycle-management.mdx).
