---
title: Private Docker Registry
sidebar_label: Private Docker Registry
description: Connect private Docker registries to IOMETE so Spark jobs and other workloads can pull images from Docker Hub, AWS ECR, GCP, DigitalOcean, and Quay.io.
last_update:
  date: 06/30/2026
  author: Valid Akhundov
---

import Img from '@site/src/components/Img';

## Overview

When running Spark jobs or other workloads on IOMETE, you may need to pull images from a private Docker registry. The **Docker Settings** page lets you register credentials for any container registry so the platform can authenticate on your behalf.

Navigate to the **Admin Portal**, then open **Docker Settings** in the left sidebar under **Compute** to see your configured registries.

<Img src="/img/user-guide/docker-registries/docker-registries.png" alt="Docker Registries list" />

Each registry entry shows its **Name**, **Host**, and the Kubernetes **Namespace** it is deployed to.

## Adding a Registry

Click **+ New Docker Registry** to open the creation dialog.

<Img src="/img/user-guide/docker-registries/docker-registries-create.png" alt="Create New Docker Registry dialog" />

Fill in the following fields:

| Field | Description |
|-------|-------------|
| **Name** | A unique identifier for this registry. Cannot be changed after creation. Deleting a registry that is referenced by running or scheduled jobs will make those jobs invalid. |
| **Host** | The registry server URL (e.g. `docker.io` for Docker Hub). |
| **Deploy to Kubernetes namespace** | The Kubernetes namespace where the image pull secret will be created. |
| **Username** | Your registry account username or access token. |
| **Password** | Your registry account password or access token. |

Click **Create** to save. The new registry appears in the table immediately.

## Editing a Registry

Click the **⋮** menu on any row and select **Edit**.

<Img src="/img/user-guide/docker-registries/docker-registries-actions.png" alt="Registry row actions menu" />

The edit dialog is pre-filled with the current values. Update any field and click **Save**.

<Img src="/img/user-guide/docker-registries/docker-registries-edit.png" alt="Edit Docker Registry dialog" />

## Deleting a Registry

Click the **⋮** menu on any row and select **Delete**. Confirm in the dialog that appears.

<Img src="/img/user-guide/docker-registries/docker-registries-delete.png" alt="Delete Docker Registry confirmation" />

This action cannot be undone. Any Spark jobs referencing this registry will fail to pull their images after deletion.

## Using a Registry in a Spark Job

When creating or editing a Spark job, go to the **Deployment** section and enter the full image path in the **Docker Image** field. Use the dropdown to the left of that field to select the matching private registry.

## Registry-Specific Setup

### Docker Hub

**Host**: `docker.io`  
**Username**: your Docker Hub username  
**Password**: your Docker Hub password or access token

### AWS ECR

AWS ECR uses short-lived tokens. Generate one before adding the registry:

```bash
aws ecr get-login-password --region YOUR_REGION
```

**Host**: `YOUR_AWS_ACCOUNT_ID.dkr.ecr.YOUR_REGION.amazonaws.com`  
**Username**: `AWS`  
**Password**: the token output by the command above

For details, see the [AWS ECR authentication docs](https://docs.aws.amazon.com/AmazonECR/latest/userguide/registry_auth.html).

### Quay.io

**Host**: `quay.io`  
**Username**: your Quay.io username  
**Password**: your Quay.io password

### DigitalOcean

Create an API token with **Read** access in the DigitalOcean control panel under **API → Tokens/Keys**, then use the token for both username and password.

**Host**: `registry.digitalocean.com`  
**Username**: your API token  
**Password**: your API token

See [DigitalOcean container registry docs](https://docs.digitalocean.com/products/container-registry/how-to/use-registry-docker-kubernetes/) for more.

### GCP / Google Container Registry

**Host**: `gcr.io` (US region; see [GCR docs](https://cloud.google.com/container-registry/docs/pushing-and-pulling) for other regions)  
**Username**: `_json_key`  
**Password**: the full contents of your GCP service account JSON key file

The service account must have the **Storage Object Viewer** IAM role on the `artifacts.YOUR_GCP_PROJECT.appspot.com` bucket.

See [GCR advanced authentication](https://cloud.google.com/container-registry/docs/advanced-authentication) for details.

## Resources

- [Kubernetes: Pull an Image from a Private Registry](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/)
- [AWS ECR Registry Authentication](https://docs.aws.amazon.com/AmazonECR/latest/userguide/registry_auth.html)
- [DigitalOcean Container Registry with Kubernetes](https://docs.digitalocean.com/products/container-registry/how-to/use-registry-docker-kubernetes/)