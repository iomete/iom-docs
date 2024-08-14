---
title: Deploy Minio & Prepare Buckets
sidebar_label: Minio Deployment
description:  Deploy Minio and prepare buckets for the IOMETE deployment.
last_update:
  date: 08/15/2024
  author: Vusal Dadalov
---

## Test Minio deployment

Required file: [minio-test-deployment.yaml](https://github.com/iomete/iomete-deployment/blob/main/minio/minio-test-deployment.yaml)

```shell showLineNumbers
# Download Minio deployment (test) file
wget https://raw.githubusercontent.com/iomete/iomete-deployment/main/minio/minio-test-deployment.yaml

kubectl apply -n iomete-system -f minio-test-deployment.yaml
```
:::tip Other Minio deployment examples
- [minio-test-deployment-with-hostpath-pvc.yaml](https://github.com/iomete/iomete-deployment/blob/main/minio/minio-test-deployment-with-hostpath-pvc.yaml)
:::

:::info
This Minio deployment is for testing purposes only. For production, please use your own object storage that is optimized for production use.
:::

## Prepare Lakehouse Bucket


This bucket will store the data lakehouse (data lake).

```shell showLineNumbers
# export access key and secret key
# If you changed the default values, please update the following values accordingly
export AWS_ACCESS_KEY_ID=admin
export AWS_SECRET_ACCESS_KEY=password
export AWS_REGION=us-east-1
export AWS_ENDPOINT_URL=http://localhost:9000

# create s3 bucket
aws s3 mb s3://lakehouse

# verify buckets
aws s3 ls
```