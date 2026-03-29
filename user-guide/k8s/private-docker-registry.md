---
title: Private Docker Registry Authentication
sidebar_label: Docker Registry Authentication
description: Providing access to private Docker registries in IOMETE platform using Kubernetes. Learn how to add a new private Docker registry authentication secret and use it in your jobs.
last_update:
  date: 10/05/2024
  author: Vusal Dadalov
---

When you create a Spark job, you may want to use a custom Docker image stored in your private registry. At this time, you need to authenticate with the private Docker registry to pull the image.

In that case, you need to create an authentication Docker Pull Secret and add it to the `Lakehouse Service Account` in the Kubernetes. So, all resources linked to the Lakehouse Service Account can securely pull Docker images from private repositories.

## Adding an Authentication Secret to the Lakehouse Service Account

### Creating an Authentication Secret

Use the following YAML configuration to create an `Image Pull Secret`:

```yaml title="iomete-image-pull-secret.yaml" showLineNumbers
apiVersion: v1
kind: Secret
metadata:
  name: iomete-image-pull-secret
type: kubernetes.io/dockerconfigjson
stringData:
  .dockerconfigjson: |
    {
      "auths": {
        "https://index.docker.io/v1/": {
          "auth": "base64(username:password)"  # Base64 encoded "username:password"
        }
      }
    }
```

:::info 
Replace `username:password` with your Docker Hub credentials encoded in base64.
:::

:::note
You can use a different name for the secret, but make sure to use the same name when patching the `Lakehouse Service Account`.
:::

**Apply the secret** to your Kubernetes cluster using the following command:

```bash
kubectl apply -n iomete-system -f iomete-image-pull-secret.yaml
```


### Patching the Lakehouse Service Account

After creating the secret, patch the `Lakehouse Service Account` with the secret using the following command:
```bash
kubectl patch serviceaccount \
  -n iomete-system lakehouse-service-account \
   -p '{"imagePullSecrets": [{"name": "iomete-image-pull-secret"}]}'
```

:::info
Replace `iomete-image-pull-secret` with the name you used when creating the secret.
:::

## How This Works
The `lakehouse-service-account` is used by the Lakehouse cluster, Spark jobs, and other related resources. By patching this account with the secret, all resources linked to it can securely pull Docker images from private repositories.