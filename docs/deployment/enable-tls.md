---
title: Configure TLS/HTTPS for IOMETE Data Plane
sidebar_label: Enable TLS/HTTPS
description: Learn how to enable TLS/HTTPS for secure communications on your IOMETE Data Plane. This guide covers the process from creating a TLS secret to configuring HTTPS traffic, ensuring encrypted data transfer.
last_update:
  date: 02/01/2024
  author: Vusal Dadalov
---

This guide is designed to help you secure your IOMETE Data Plane communications using TLS (Transport Layer Security), ensuring that your data traffic is encrypted and protected. 

The process involves creating a secret with your TLS certificate and private key then configuring the IOMETE Data Plane to use this certificate for HTTPS traffic. 

---

## Prerequisites

Before you begin, ensure you have the following ready:
- **IOMETE Data Plane Deployment**: Your IOMETE Data Plane should be up and running.
- **DNS Configuration**: The DNS for your IOMETE Data Plane must be set up. See [Configure Custom DNS for IOMETE Data Plane](/deployment/configure-custom-dns).
- **TLS Certificate and Private Key**: You need a TLS certificate and a private key, valid for your IOMETE Data Plane's DNS name.

## Step 1: Configuring TLS Secret for ISTIO Ingress Gateway

The first step involves creating a Kubernetes secret to store your TLS certificate and private key. This secret will be used by the ISTIO ingress gateway to enable TLS traffic.

### Create the TLS Secret

1. **Encode Your Certificate and Private Key**: Use base64 to encode your TLS certificate and private key.

2. **Create a Secret Configuration File**: With your encoded certificate and key, create a secret configuration file (`tls-my-domain-com.yaml`) as shown below:

```shell
apiVersion: v1
kind: Secret
metadata:
  name: tls-my-domain-com # example name, replace with your own
data:
  tls.crt: >-
    <base64 encoded certificate>
  tls.key: >-
    <base64 encoded private key>
type: kubernetes.io/tls
```

:::note
`tls-my-domain-com.yaml` and `tls-my-domain-com` secret names are examples. Replace them with your own values.
:::

3. **Deploy the TLS Secret**: Deploy the created secret to the `istio-system` namespace using the following command:

```shell
kubectl apply -n istio-system -f tls-my-domain-com.yaml
```

## Step 2: Upgrading IOMETE Data Plane with TLS Configuration

After deploying the TLS secret, you need to configure the IOMETE Data Plane to recognize and use this secret for TLS traffic.

1. **Configure IOMETE Data Plane Helm Values**: Locate the `istioGateway` section in your IOMETE Data Plane helm values file (`data-plane-values.yaml`). Specify the name of your TLS secret in the TLS section as follows:

```yaml
istioGateway:
  tlsCertSecretName: "tls-my-domain-com"
```

2. **Upgrade IOMETE Data Plane**: Apply the changes by upgrading your IOMETE Data Plane deployment with the modified helm values:

```shell
helm upgrade --install -n iomete-system iomete-dataplane iomete/iomete-dataplane-enterprise -f data-plane-values.yaml --version <version>
```

:::info
For exact version and upgrade command, please refer to the deployment guide.
:::


## Completion

Once the upgrade is complete, your IOMETE Data Plane will be configured to use TLS for secure HTTPS traffic. 
Now you can access your IOMETE Data Plane using `https://your-domain.com`.


If you encounter any issues during this process, please refer to the IOMETE documentation or contact support for assistance.