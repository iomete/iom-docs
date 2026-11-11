---
title: Installing IOMETE with Argo CD
sidebar_label: Argo CD
description: Install and upgrade IOMETE Data Plane Enterprise with Argo CD.
last_update:
  date: 11/11/2026
  author: Maksym Kryvchun
---

Argo CD installs the IOMETE Helm chart without access to your cluster, so a few things a Helm install creates on its own are created once by a cluster administrator instead.

:::info Supported Versions
Argo CD is supported on chart versions after 4.0.2. Earlier versions aren't supported.
:::

## Installing

1. Follow the [On-Premises Deployment Guide](./on-prem/install.md) up to and including **Prepare Your Values File**.

2. Add these lines to your values file:

   ```yaml title="example-data-plane-values.yaml"
   argocd: true
   serviceAccount:
     create: true
   crds:
     create: false
   webhook:
     create: false
   ```

3. Have a cluster administrator create the Spark Operator CRDs and webhook:

   - For the CRDs, follow step 2 of [Option 2: Have an Administrator Create Them](./on-prem/install.md#option-2-have-an-administrator-create-them).
   - For the webhook, run:

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

4. Create the Argo CD Application. Put the contents of your values file under `valuesObject`:

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
         valuesObject:
           argocd: true
           # ...the rest of your values file
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

## Upgrading

Change `targetRevision` to the new chart version.

Also re-run step 3 when:

- You change `namespaces` in your values file: re-apply the webhook.
- The release notes say the CRDs changed: re-apply the CRDs.

:::warning Switching from `webhook.create: true`
Apply the webhook (step 3) **before** you set `webhook.create: false`. Otherwise Argo CD deletes the webhook on the next sync and Spark jobs stop starting.
:::

## Known Limits

- After you rotate the CA certificate, restart the gateway and MCP server yourself:

  ```shell
  kubectl rollout restart deployment iom-gateway iom-mcp-server -n iomete-system
  ```

- Install checks that need the cluster are skipped, for example the CA certificate Secret's key. A wrong setting shows up later as a pod that doesn't start.
- The console's configuration comparison and runtime snapshot are empty.
- Install the optional Grafana chart with Helm, not Argo CD: Argo CD recreates its storage on every sync.
