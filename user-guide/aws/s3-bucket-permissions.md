---
title: AWS S3 Buckets Access
sidebar_label: S3 Buckets Access
description: Learn how S3 bucket access works for IOMETE data planes on AWS and outside AWS, and how to grant the right permissions.
last_update:
  date: 04/28/2026
  author: Sourabh Jajoria
---

How IOMETE accesses S3 depends on where your data plane runs.

**On AWS**, the Lakehouse Spark pods run under the Kubernetes service account `lakehouse-service-account`, which is annotated with an IAM role ARN. The EKS OIDC provider federates that Kubernetes identity to an AWS IAM role (IRSA), so pods can access S3 without static credentials. To find your Lakehouse Role ARN, go to **Console > Settings > Data Plane > General**.

**Outside AWS** (MinIO, Dell ECS, on-prem), the data plane uses static access/secret keys pointed at the S3-compatible service endpoint (e.g. `http://minio.my-cluster:9000`). These credentials cannot authenticate against AWS S3 — the rest of this page applies to AWS deployments only.

## Granting Access to an External S3 Bucket (AWS)

There are two ways to grant the Lakehouse role access to an external bucket:

1. **[Bucket Policy](#bucket-policy)** — add a policy on the external bucket that allows the Lakehouse role as a principal. No IAM console access required.
2. **[IAM Role Policy](#iam-role-policy)** — attach a policy directly to the Lakehouse role. Requires IAM console access.

Both methods use the same set of S3 actions. For read-only access, only `s3:GetObject` and `s3:ListBucket` are needed.

---

## Bucket Policy

1. Go to your [S3 console](https://s3.console.aws.amazon.com/s3/home) and select your bucket.
2. Click **Permissions → Bucket Policy**.
3. Paste one of the examples below, replacing `<lakehouse_role>` with the Lakehouse Role ARN and `<your_bucket>` with your bucket name.
4. Click **Save**.

### Full read/write access

```json showLineNumbers
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": { "AWS": ["<lakehouse_role>"] },
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket",
                "s3:ListBucketMultipartUploads",
                "s3:ListMultipartUploadParts",
                "s3:AbortMultipartUpload"
            ],
            "Resource": [
                "arn:aws:s3:::<your_bucket>/*",
                "arn:aws:s3:::<your_bucket>"
            ]
        }
    ]
}
```

### Read-only access

```json showLineNumbers
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": { "AWS": ["<lakehouse_role>"] },
            "Action": ["s3:GetObject", "s3:ListBucket"],
            "Resource": [
                "arn:aws:s3:::<your_bucket>/*",
                "arn:aws:s3:::<your_bucket>"
            ]
        }
    ]
}
```

### Read-only access to a specific folder

Replace `folder` with your prefix.

```json showLineNumbers
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": { "AWS": ["<lakehouse_role>"] },
            "Action": ["s3:GetObject", "s3:ListBucket"],
            "Resource": [
                "arn:aws:s3:::<your_bucket>/folder/*",
                "arn:aws:s3:::<your_bucket>"
            ]
        }
    ]
}
```

---

## IAM Role Policy

1. Go to your [IAM console](https://console.aws.amazon.com/iam/home) and select **Roles**.
2. Search for the Lakehouse role and click it.
3. Click **Permissions → Add inline policy**, paste one of the examples below, and save.

:::note
You can also create a **Managed policy** under **Policies** and attach it to the Lakehouse role instead.
:::

IAM role policies do not include a `Principal` field — the policy is scoped to the role it's attached to.

### Full read/write access

```json showLineNumbers
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket",
                "s3:ListBucketMultipartUploads",
                "s3:ListMultipartUploadParts",
                "s3:AbortMultipartUpload"
            ],
            "Resource": [
                "arn:aws:s3:::<your_bucket>/*",
                "arn:aws:s3:::<your_bucket>"
            ]
        }
    ]
}
```

### Read-only access

```json showLineNumbers
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": ["s3:GetObject", "s3:ListBucket"],
            "Resource": [
                "arn:aws:s3:::<your_bucket>/*",
                "arn:aws:s3:::<your_bucket>"
            ]
        }
    ]
}
```

### Read-only access to a specific folder

```json showLineNumbers
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": ["s3:GetObject", "s3:ListBucket"],
            "Resource": [
                "arn:aws:s3:::<your_bucket>/folder/*",
                "arn:aws:s3:::<your_bucket>"
            ]
        }
    ]
}
```

:::info
To grant access to multiple buckets or folders, add additional entries to the `Resource` array.
:::
