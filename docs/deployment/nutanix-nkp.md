---
title: Deploying IOMETE on Nutanix Kubernetes Platform (NKP)
sidebar_label: Nutanix NKP
description: Deploy IOMETE Data Plane Enterprise on Nutanix Kubernetes Platform (NKP), with Nutanix Objects for lakehouse data, Nutanix Volumes for persistent volumes, CloudNativePG for the metadata database and Traefik for console access.
last_update:
  date: 10/22/2026
  author: Abhishek Pathania
---

:::info Nutanix Ready
IOMETE Data Plane Enterprise is Nutanix Ready validated and supported on Nutanix Kubernetes Platform (NKP) 2.18. Validated on IOMETE 3.19.0 and supported on 3.19.0 and later.
:::

The whole platform runs inside your NKP cluster and uses Nutanix storage for both lakehouse data and persistent volumes, so you get a self-hosted lakehouse on your existing Nutanix infrastructure.

## Validated Versions

| Component | Version |
| -- | -- |
| IOMETE Data Plane Enterprise | 3.19.0 |
| Nutanix Kubernetes Platform (NKP) | 2.18.0 (Kubernetes 1.35.2) |
| Nutanix AOS | 7.6.0.6 |
| Nutanix AHV | 11.2.0.2 |
| Prism Central | 7.6.0.6 |
| Node OS | Ubuntu 24.04 |

## Architecture on NKP

| IOMETE component | Runs on |
| -- | -- |
| Platform services and Spark compute | NKP workload cluster. The Helm chart installs the platform services into a namespace such as `iomete-system`, and Spark workloads run there or in [additional namespaces](./connect-namespace.md) |
| Lakehouse data and Iceberg metadata | Nutanix Objects, through its S3-compatible API |
| Persistent volumes (event stream, search index, Spark shuffle and spill data) | Nutanix Volumes, through the Nutanix CSI driver and the `nutanix-volume` StorageClass |
| Metadata database | PostgreSQL managed by CloudNativePG (CNPG), the operator that ships with NKP |
| User access to the IOMETE console | NKP's built-in Traefik ingress |

## Prerequisites

- An NKP 2.18 or later workload cluster with the capacity listed in the [On-Premises Deployment Guide](./on-prem/install.md#essential-requirements-before-you-start), and `kubectl` and `helm` set up for it.
- A Nutanix Objects object store reachable from the cluster, with a bucket and an access key for IOMETE.
- The CloudNativePG platform application enabled in your NKP workspace.
- The `nutanix-volume` StorageClass, which is the default on NKP.
- metrics-server, only if you plan to enable autoscaling.

## Installing on NKP

Follow the [On-Premises Deployment Guide](./on-prem/install.md) and use the settings below for the NKP-specific parts. Istio is not needed on NKP: the built-in Traefik ingress gives users access to the IOMETE console.

### Object Storage: Nutanix Objects

Create a bucket and an access key in Nutanix Objects, then point IOMETE at the Objects endpoint:

```yaml title="data-plane-values.yaml"
storage:
  type: "s3_compatible"
  bucketName: "iomete"
  s3CompatibleSettings:
    endpoint: "http://<nutanix-objects-endpoint>"
    accessKey: "<access-key>"
    secretKeySecret:
      name: "<secret-name>"
      key: "<secret-key>"
```

`s3CompatibleSettings` needs IOMETE 3.19.1 or later. For earlier versions, see [Object Storage](./architecture-deployment.md#object-storage).

If the Objects endpoint uses HTTPS with a certificate from a private CA, add that CA to IOMETE's truststore. See [Custom Java Truststore](./truststore.md).

### Metadata Database: CloudNativePG

Enable the CloudNativePG platform application in your NKP workspace and create a PostgreSQL cluster with at least three instances, so CNPG can fail over automatically. Then point IOMETE at the cluster's read-write service, which always routes to the current primary:

```yaml title="data-plane-values.yaml"
database:
  type: "postgresql"
  host: "<cnpg-cluster>-rw.<cnpg-namespace>.svc.cluster.local"
  port: "5432"
  user: "<db-user>"
  passwordSecret:
    name: "<secret-name>"
    key: "<secret-key>"
```

See [Backend Databases](./backend-databases.md) for the user and databases IOMETE needs.

### Persistent Volumes: Nutanix Volumes

IOMETE's own volumes, for the event stream and the search index, use the cluster's default StorageClass. `nutanix-volume` is the default on NKP, so they need no extra settings. If your cluster uses a different default, set the storage class explicitly:

```yaml title="data-plane-values.yaml"
services:
  eventStream:
    persistence:
      storageClassName: "nutanix-volume"
  typesense:
    persistence:
      storageClassName: "nutanix-volume"
```

Spark writes shuffle data, and data that spills out of memory, to local disk. To put that on Nutanix Volumes, create an [On-Demand PVC volume](/user-guide/volumes#on-demand-pvc) with the `nutanix-volume` storage class and attach it to your compute clusters and jobs.

### Console Access: NKP Traefik Ingress

NKP ships with Traefik. Create an Ingress for the IOMETE gateway service:

```yaml title="iomete-ingress.yaml"
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: iomete
  namespace: iomete-system
spec:
  ingressClassName: kommander-traefik
  rules:
    - host: iomete.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: iom-gateway
                port:
                  number: 80
```

NKP redirects HTTP to HTTPS and serves Traefik's default certificate. To use your own, add a `tls` section to the Ingress that references a certificate Secret, for example one issued by cert-manager, which NKP includes.

### Autoscaling (Optional)

Several IOMETE services can scale with load through a Horizontal Pod Autoscaler (HPA):

- **Services:** `gateway`, `core`, `identity`, `dataCatalog`, `cluster`, `restCatalog` and any other service with an `autoscaling` block in your chart's `values.yaml`.
- **Enabling:** set it per service, for example `services.gateway.autoscaling.enabled: true`.
- **Resources:** from IOMETE 4.0, the chart requires a service's resource requests to equal its limits when autoscaling is on.
- **Metrics:** the HPA needs metrics-server, which NKP workload clusters don't always run. Install it if `kubectl top nodes` returns an error.
