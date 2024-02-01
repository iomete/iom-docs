---
title: Configure custom DNS for IOMETE Data Plane
sidebar_label: Custom DNS
description: Learn how to easily configure a custom DNS for your IOMETE Data Plane with our step-by-step guide. Covering everything from identifying the Istio Ingress Gateway address to creating DNS records, this document simplifies DNS setup to enhance your data plane's accessibility.
last_update:
  date: 02/01/2024
  author: Vusal Dadalov
---

This document aims to provide you with a straightforward, step-by-step approach to setting up a DNS name for your IOMETE data plane, enhancing its accessibility and ease of use. 

---

## Understanding the Basics

Before we dive into the technical steps, let's clarify some key concepts:

- **IOMETE Data Plane**: This is the infrastructure component that handles the processing and movement of data within the IOMETE ecosystem.
- **DNS (Domain Name System)**: DNS translates human-friendly domain names (like `www.example.com`) into IP addresses that computers use to identify each other on the network.
- **Istio Ingress Gateway**: This is a crucial component within the IOMETE setup that directs incoming traffic to the right destinations within your data plane.

## Identifying the Istio Ingress Gateway Address

The first step in configuring your DNS is to locate the external IP address of the Istio Ingress Gateway, as all traffic to the IOMETE data-plane goes through it.

### If Your Setup Uses a `LoadBalancer`

IOMETE typically configures the Istio **ingress gateway** as a `LoadBalancer`. To find its external address, use the following command in your terminal:

```shell
kubectl get svc istio-ingress -n istio-system
```

This command returns the external address of the ingress gateway. 

:::info
Note this address, as it could be either an **IP** or a **DNS** address.
:::

### If Your Setup Uses a `NodePort`

In cases where the gateway is configured as a `NodePort`, you'll need to identify the IP address of a Kubernetes worker node, ideally the one hosting the Istio ingress gateway.

## Creating Your DNS Record

With the external address of the Istio Ingress Gateway in hand, you're ready to create a DNS record. This step involves going to your DNS provider and setting up the record that will point to the IOMETE data plane.

- **For an IP Address**: Create an `A` record with your DNS provider, pointing to the IP address you've identified.
- **For a DNS Name**: Create a `CNAME` record that points to the DNS name of the ingress gateway.

Here's a simplified overview of what to do next:

1. **Access Your DNS Provider**: Log into the platform where your domain's DNS settings are managed.
2. **Navigate to DNS Management**: Look for the section where you can add or modify DNS records.
3. **Add the Record**: Depending on your external address:
    - For an IP address, add an `A` record pointing to this IP.
    - For a DNS name, add a `CNAME` record pointing to this name.
4. **Save Changes**: Apply and save your changes. DNS propagation can take some time, so it might not work immediately.


:::tip
Remember, DNS changes can take a while to propagate across the internet, so give it some time before testing.
:::