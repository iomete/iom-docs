---
title: Installing IOMETE with Argo CD
sidebar_label: Argo CD
description: Install and upgrade IOMETE Data Plane Enterprise with Argo CD.
last_update:
  date: 11/12/2026
  author: Maksym Kryvchun
---

Argo CD installs the IOMETE Helm chart without access to your cluster, so a few things a Helm install creates on its own are created once by a cluster administrator instead.

:::info Supported Versions
Argo CD is supported on chart versions after 4.0.2. Earlier versions aren't supported.
:::

## Installing

1. Follow the [On-Premises Deployment Guide](./on-prem/install.md) up to and including **Prepare Your Values File**.

2. Create a Secret for your credentials, so none of them sit in the Argo CD Application:

   ```shell
   kubectl create secret generic iomete-credentials -n iomete-system \
     --from-literal=db-password='<database password>' \
     --from-literal=db-admin-password='<database admin password>' \
     --from-literal=storage-secret-key='<object storage secret key>'
   ```

3. Add these lines to your values file, and remove any passwords or keys from it:

   ```yaml title="example-data-plane-values.yaml"
   argocd: true
   serviceAccount:
     create: true
   crds:
     create: false
   webhook:
     create: false

   database:
     passwordSecret:
       name: iomete-credentials
       key: db-password
     adminCredentials:
       user: postgres
       passwordSecret:
         name: iomete-credentials
         key: db-admin-password

   storage:
     type: s3_compatible
     s3CompatibleSettings:
       endpoint: "<object storage endpoint>"
       accessKey: "<object storage access key>"
       secretKeySecret:
         name: iomete-credentials
         key: storage-secret-key
   ```

   If your values file has `minioSettings`, move its endpoint and access key into `s3CompatibleSettings` and delete `minioSettings`. The chart ignores it once `s3CompatibleSettings` is set.

   The chart generates its own encryption key, tokens and signing keys on the first install and keeps them, so leave those settings empty.

4. Have a cluster administrator create the Spark Operator CRDs and webhook:

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

5. Tell Argo CD when IOMETE's Spark applications are healthy. Its built-in check waits for Spark executors, which IOMETE's Spark Connect server doesn't start, so the Application otherwise stays **Progressing**. Add this to the `argocd-cm` ConfigMap (under `configs.cm` if you install Argo CD with its Helm chart):

   ```yaml title="argocd-cm"
   data:
     resource.customizations.health.sparkoperator.k8s.io_SparkApplication: |
       hs = {}
       local state = ""
       if obj.status ~= nil and obj.status.applicationState ~= nil and obj.status.applicationState.state ~= nil then
         state = obj.status.applicationState.state
       end
       if state == "RUNNING" or state == "COMPLETED" then
         hs.status = "Healthy"
       elseif state == "FAILED" or state == "SUBMISSION_FAILED" then
         hs.status = "Degraded"
       else
         hs.status = "Progressing"
       end
       hs.message = "SparkApplication is " .. (state ~= "" and state or "being submitted")
       return hs
   ```

6. Create the Argo CD Application. Put the contents of your values file under `valuesObject`:

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

1. Set `IOMETE_VERSION` to the new chart version.
2. Re-run step 4 when:
   - The release notes say the CRDs changed: re-apply the CRDs.
   - You change `namespaces` in your values file: re-apply the webhook.
3. Change `targetRevision` to the new chart version.

:::warning Moving from a Helm install
Argo CD doesn't manage the webhook, so the one Helm created stays in place. If you later run `helm uninstall` on the old release, Helm deletes it: re-apply the webhook (step 4) right after, or Spark jobs stop starting.
:::

## Known Limits

- After you rotate the CA certificate, restart the gateway and MCP server yourself:

  ```shell
  kubectl rollout restart deployment iom-gateway iom-mcp-server -n iomete-system
  ```

- Install checks that need the cluster are skipped, for example the CA certificate Secret's key. A wrong setting shows up later as a pod that doesn't start.
- The console's configuration comparison and runtime snapshot are empty.
- Install the optional Grafana chart with Helm, not Argo CD: Argo CD recreates its storage on every sync.
