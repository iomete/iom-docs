---
title: Read external S3 bucket
description: Run Your First Spark Job. In this guide we explain how to run your first spark job on IOMETE
last_update:
  date: 10/04/2022
---

# How to Provide Access to Read External S3 Buckets in IOMETE

IOMETE is a cloud-based data platform that allows users to store, manage, and analyze large amounts of data. One of the key features of IOMETE is the ability to connect to external S3 buckets. In order to do this, you need to provide permission to the Lakehouse role.

## Granting Access to the Lakehouse Role

The easiest way to grant access to the Lakehouse role is to create a bucket policy that allows the role to access the bucket. Since the Lakehouse clusters, Spark jobs, and notebooks are all running under the Lakehouse role, you only need to provide access to the Lakehouse role.

To find the Lakehouse role, go to the IOMETE console -> Settings -> Workspace Info -> Lakehouse Role.

## Creating a Bucket Policy

Let's say you have a bucket called `my-bucket` and you want to give access to the Lakehouse role. You can create a bucket policy that looks like this. Replace `<lakehouse_role>` with the Lakehouse role and `<your_bucket>` with the name of your bucket.

### Example 1. Full read/write access to your bucket from Lakehouse role:

```json
{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "ListObjectsInBucket",
        "Effect": "Allow",
        "Principal": {
          "AWS": ["<lakehouse_role>"]
        },
        "Action": ["s3:ListBucket"],
        "Resource": ["arn:aws:s3:::<your_bucket>"]
      },
      {
        "Sid": "AllObjectActions",
        "Effect": "Allow",
        "Principal": {
          "AWS": ["<lakehouse_role>"]
        },
        "Action": "s3:*Object",
        "Resource": ["arn:aws:s3:::<your_bucket>/*"]
      }
    ]
  }
```

This policy provides full read/write access to your bucket from the Lakehouse role.

### Example 2. Read-only access to your bucket from Lakehouse role:

```json
{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "ListObjectsInBucket",
        "Effect": "Allow",
        "Principal": {
          "AWS": ["<lakehouse_role>"]
        },
        "Action": ["s3:ListBucket"],
        "Resource": ["arn:aws:s3:::<your_bucket>"]
      },
      {
        "Sid": "AllObjectActions",
        "Effect": "Allow",
        "Principal": {
          "AWS": ["<lakehouse_role>"]
        },
        "Action": "s3:GetObject",
        "Resource": ["arn:aws:s3:::<your_bucket>/*"]
      }
    ]
  }
```

This policy provides read-only access to your bucket from the Lakehouse role.

### Example 3. Read-only access to a specific folder in your bucket from Lakehouse role:

```json
{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "ListObjectsInBucket",
        "Effect": "Allow",
        "Principal": {
          "AWS": ["<lakehouse_role>"]
        },
        "Action": ["s3:ListBucket"],
        "Resource": ["arn:aws:s3:::<your_bucket>"]
      },
      {
        "Sid": "AllObjectActions",
        "Effect": "Allow",
        "Principal": {
          "AWS": ["<lakehouse_role>"]
        },
        "Action": "s3:GetObject",
        "Resource": ["arn:aws:s3:::<your_bucket>/folder/*"]
      }
    ]
  }
```

This policy provides read-only access to a specific folder in your bucket from the Lakehouse role.

By following these steps, you can easily provide access to read external S3 buckets in IOMETE.