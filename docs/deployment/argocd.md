---
title: Installing IOMETE with Argo CD
sidebar_label: Argo CD
description: Install and upgrade the IOMETE Data Plane Enterprise Helm chart with Argo CD, and the chart settings Argo CD needs.
last_update:
  date: 11/11/2026
  author: Maksym Kryvchun
---

Argo CD doesn't run `helm install`. It renders the chart without access to your cluster and applies the result itself. The IOMETE chart supports this with a few settings, listed below.

## Before You Start

- Follow the [On-Premises Deployment Guide](./on-prem/install.md) up to and including **Prepare Your Values File**: namespace, object storage, database and values file.
- Argo CD must be able to reach `https://chartmuseum.iomete.com`.

## Setting Up the Values File

Add these lines to your values file:

```yaml title="example-data-plane-values.yaml"
argocd: true

serviceAccount:
  create: true

crds:
  create: false

webhook:
  create: false
```

| Setting | Why |
| -- | -- |
| `argocd: true` | The chart refuses settings that break under Argo CD. |
| `serviceAccount.create: true` | Argo CD creates the service account and its RBAC, and keeps them up to date. |
| `crds.create: false` | The CRDs are too large for Argo CD's default apply, so an administrator applies them once. |
| `webhook.create: false` | Without cluster access the chart can't reuse the webhook certificate, so every sync would replace it. An administrator applies it once instead. |

## Creating the CRDs and the Webhook

A Kubernetes administrator runs these once, and again after the changes listed below.

1. Apply the Spark Operator CRDs as in step 2 of [Option 2: Have an Administrator Create Them](./on-prem/install.md#option-2-have-an-administrator-create-them).

2. Create the webhook and its certificate. Use the values file you install with. `--set argocd=false` is needed here because that file sets `argocd: true`:

   ```shell
   helm template data-plane iomete/iomete-data-plane-enterprise \
     --namespace iomete-system \
     --version "$IOMETE_VERSION" \
     --values example-data-plane-values.yaml \
     --set webhook.create=true \
     --set argocd=false \
     --show-only templates/lakehouse-runtime/spark-operator-webhook.yaml \
     > spark-operator-webhook.yaml

   kubectl apply -f spark-operator-webhook.yaml
   ```

Apply the webhook again whenever you change `namespaces`. Apply the CRDs again when the release notes of a new version say they changed.

## Creating the Application

Create an Argo CD Application for the chart. Keep `releaseName` the same as the release name in the commands above:

```yaml title="iomete-data-plane.yaml"
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: iomete-data-plane
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://chartmuseum.iomete.com
    chart: iomete-data-plane-enterprise
    targetRevision: "<chart-version>"
    helm:
      releaseName: data-plane
      # Paste the contents of your values file here.
      valuesObject:
        argocd: true
  destination:
    server: https://kubernetes.default.svc
    namespace: iomete-system
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

```shell
kubectl apply -f iomete-data-plane.yaml
```

To upgrade, change `targetRevision` to the new chart version.

:::warning Already installed with `webhook.create: true`?
Apply the webhook as described above **before** you switch to `webhook.create: false`. Otherwise Argo CD deletes the webhook and its certificate on the next sync, and Spark jobs stop starting.
:::

## Versions 4.0.2 and Earlier

These versions have no `argocd` setting, so leave it out of your values file. They also generate three secrets on every render, so each Argo CD sync replaces them. Give the chart Secrets of your own instead.

**Already running IOMETE with Argo CD?** Copy the current Secrets, so data encrypted with the current key stays readable. Do this before any other change, including an upgrade:

```shell
for name in iom-secret-encryption-key iom-socket-system-token iomete-plane-trust-secret; do
  kubectl get secret "$name" -n iomete-system -o json \
    | jq '{apiVersion, kind, type, data, metadata: {name: ("my-" + .metadata.name), namespace: .metadata.namespace}}' \
    | kubectl apply -f -
done
```

Then point the chart at the copies, and keep these settings when you upgrade:

```yaml title="example-data-plane-values.yaml"
secretEncryptionKey:
  existingSecret: my-iom-secret-encryption-key

socketSystemToken:
  existingSecret: my-iom-socket-system-token

multiCluster:
  trustSecret:
    existingSecret: my-iomete-plane-trust-secret
```

**New installation?** Create two Secrets:

```shell
kubectl create secret generic my-iom-secret-encryption-key -n iomete-system \
  --from-literal=SECRET_ENCRYPTION_KEY="$(openssl rand -base64 32)"

kubectl create secret generic my-iom-socket-system-token -n iomete-system \
  --from-literal=token="$(openssl rand -hex 32)"
```

Then point the chart at them, and set the trust secret as a value. Keep these settings when you upgrade:

```yaml title="example-data-plane-values.yaml"
secretEncryptionKey:
  existingSecret: my-iom-secret-encryption-key

socketSystemToken:
  existingSecret: my-iom-socket-system-token

multiCluster:
  trustSecret:
    value: "<output of: openssl rand -hex 32>"
```

## Known Limits

- **CA certificate rotation:** the gateway and MCP server don't restart on their own. Restart them after you rotate the certificate:

  ```shell
  kubectl rollout restart deployment iom-gateway iom-mcp-server -n iomete-system
  ```

- **Install checks:** checks that need the cluster are skipped, for example that the CA certificate Secret has the right key. A mistake shows up later as a pod that doesn't start, so double-check those settings.
- **Configuration comparison and runtime snapshot:** these show nothing in the console for Argo CD installs.
- **Monitoring charts:** the optional Grafana chart recreates its storage on every sync, so install it with Helm instead.
