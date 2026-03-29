---
title: GCS Bucket Access
sidebar_label: GCS Bucket Access
description: Learn how to provide access to external GCS buckets in IOMETE, a hybrid (cloud & on-premises based) data platform for data storage and analysis. This guide outlines simple steps to connect to GCS buckets and grant permission to the Lakehouse Service Account.
last_update:
  date: 05/05/2024
  author: Vusal Dadalov
---

IOMETE is a hybrid (cloud & on-premises) platform that allows users to store, manage, and analyze large amounts of data.
One of the key features of IOMETE is the ability to connect any `Google Cloud Storage Buckets` and access data from them.

In order to do this, you need to provide permission to the `Lakehouse Service Account`.

:::info Identify the Lakehouse Service Account
Go to the IOMETE **Console > Settings > Data Plane > General** to locate the `Lakehouse Service Account` email address, which will be in the form `<service-account-name>@<project-id>.iam.gserviceaccount.com`.
:::

:::info `What is the Lakehouse Service Account?`
The Lakehouse Service Account is a Google Cloud IAM service account that is used by IOMETE Data Plane compute resources to access GCS buckets.
The Lakehouse Service Account is created during the IOMETE Data Plane installation process.
:::

## Provide access to GCS bucket

1. Go to your [Google Cloud Console](https://console.cloud.google.com/) and select your desired bucket.
2. Click on the "Permissions" tab, and then click on "Add".
3. Add the `Lakehouse Service Account` as a member and provide the necessary permissions. See [Permission Levels](#permission-levels) for the available permission levels.

### Permission Levels

Google Cloud Storage provides several permission levels that you can assign to the Lakehouse Service Account:

- **Storage Object User**: Allows the Lakehouse Service Account to view, create, and delete objects in the bucket (read-write access).
- **Storage Object Viewer**: Allows the Lakehouse Service Account to view objects in the bucket (readonly access).
- **Storage Object Admin**: Allows the Lakehouse Service Account to view, create, and delete objects in the bucket (full admin access).


Please, consult the [IAM roles for Cloud Storage](https://cloud.google.com/storage/docs/access-control/iam-roles) and [IAM permissions for Cloud Storage](https://cloud.google.com/storage/docs/access-control/iam-permissions) documentation for more information.