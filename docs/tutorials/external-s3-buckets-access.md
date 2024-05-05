---
title: AWS S3 Buckets Access
sidebar_label: S3 Buckets Access
description: Learn how to provide access to external S3 buckets in IOMETE, a hybrid (cloud & on-premises based) data platform for data storage and analysis. This guide outlines simple steps to connect to S3 buckets and grant permission to the Lakehouse role.
last_update:
  date: 05/05/2024
  author: Vusal Dadalov
---

IOMETE is a hybrid (cloud & on-premises) platform that allows users to store, manage, and analyze large amounts of data.
One of the key features of IOMETE is the ability to connect any S3 buckets and access data from them.

In order to do this, you need to provide permission to the `Lakehouse Role`.

:::info
To find the Lakehouse role, go to the IOMETE **Console > Settings > Data Plane > General** and look for
the `Lakehouse Role ARN` field.
:::

:::info `What is the Lakehouse Role?`
The Lakehouse role is an AWS IAM role that is used by IOMETE Data Plane compute resources to access external S3 buckets.
The Lakehouse role is created during the IOMETE Data Plane installation process.
:::

## Options to provide access to S3 buckets

AWS provides essentially two ways to provide access to S3 buckets:

1. [Bucket Policy](#bucket-policy): You can create a bucket policy that allows access to the S3 bucket from the
   Lakehouse role.
2. [IAM Role Policy](#iam-role-policy): You can create an IAM role policy that allows access to the S3 bucket and attach
   it to the Lakehouse role.

---

## Bucket Policy

The easiest way to grant access to the Lakehouse role is to create a bucket policy that allows the role to access the
bucket. Since the Lakehouse clusters, Spark jobs, and notebooks are all running under the Lakehouse role, you only need
to provide access to the Lakehouse role.

To set the bucket policy, you need to navigate to your S3 bucket's permissions page.

1. Go to your [S3 console](https://s3.console.aws.amazon.com/s3/home) and select your desired bucket.
2. Click on the "Permissions" tab, and then click on "Bucket Policy".
3. Copy and paste the appropriate policy from the examples below into the bucket policy editor.
4. Replace `<lakehouse_role>` with the name of your Lakehouse role, and `<your_bucket>` with the name of your S3 bucket.
5. Click on "Save".

Once saved, you should see a message at the top of the page that says "Bucket policy has been updated." You have now
successfully granted access to your external S3 bucket for your Lakehouse role!

### Example 1. Full read/write access to your bucket from Lakehouse role:

Let's say you have a bucket called `my-bucket` and you want to give access to the Lakehouse role. You can create a
bucket policy that looks like this. Replace `<lakehouse_role>` with the Lakehouse role and `<your_bucket>` with the name
of your bucket.

```js showLineNumbers
{
    "Version"
:
    "2012-10-17",
        "Statement"
:
    [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": ["<lakehouse_role>"]
            },
            "Action": [
                "s3:*Object",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::<your_bucket>/*",
                "arn:aws:s3:::<your_bucket>"
            ]
        }
    ]
}
```

This policy provides full read/write access to your bucket from the Lakehouse role.

### Example 2. Read-only access to your bucket from Lakehouse role:

```js showLineNumbers
{
    "Version"
:
    "2012-10-17",
        "Statement"
:
    [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": ["<lakehouse_role>"]
            },
            "Action": [
                // highlight-start
                "s3:GetObject",
                // highlight-end
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::<your_bucket>/*",
                "arn:aws:s3:::<your_bucket>"
            ]
        }
    ]
}
```

Only the highlighted line is different from the previous policy.
This policy provides read-only access to your bucket from the Lakehouse role.

### Example 3. Read-only access to a specific folder in your bucket from Lakehouse role:

```js showLineNumbers
{
    "Version"
:
    "2012-10-17",
        "Statement"
:
    [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": ["<lakehouse_role>"]
            },
            "Action": [
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                // highlight-start
                "arn:aws:s3:::<your_bucket>/folder/*",
                // highlight-end
                "arn:aws:s3:::<your_bucket>"
            ]
        }
    ]
}
```

See highlighted lines for the difference from the previous policy. This policy provides read-only access to a specific
folder in your bucket from the Lakehouse role.

---

## IAM Role Policy

Another way to provide access to the Lakehouse role is to create an IAM role policy that allows access to the S3 bucket
and attach it to the Lakehouse role.

### Attaching the IAM Role Policy

To attach the IAM role policy to the Lakehouse role, you need to navigate to the IAM console.

1. Go to your [IAM console](https://console.aws.amazon.com/iam/home) and select `Roles` from the left-hand menu.
2. Search for the Lakehouse role in the list of roles and click on it.
3. Click on the Permissions tab, and then click on Add `inline policy`.
4. See below for the examples to create a policy. You can copy and paste the policy into the JSON editor.
5. Click on `Review policy`. Give your policy a name and click on `Create policy`.

You have now successfully attached the IAM role policy to the Lakehouse role. You can now use the Lakehouse role to
access the S3 bucket from IOMETE.

:::note
Alternative to `Inline policy`, you can also create a `Managed policy` from `Policies` in the IAM console and attach it
to the Lakehouse role.
:::

Here are some examples of IAM role policies that you can attach to the Lakehouse role:

### Example 1. Full read/write access to your bucket:

```js showLineNumbers
{
    "Version"
:
    "2012-10-17",
        "Statement"
:
    [
        {
            "Effect": "Allow",
            "Action": [
                "s3:*Object",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::<your_bucket>/*",
                "arn:aws:s3:::<your_bucket>"
            ]
        }
    ]
}
```

Replace `<your_bucket>` with the name of your S3 bucket that you want to provide access to.

:::info
You already noticed that, IAM role policy does not require to specify the `Principal` field as it is already attached to
the Lakehouse role.
:::

### Example 2. Read-only access to your bucket:

```js showLineNumbers
{
    "Version"
:
    "2012-10-17",
        "Statement"
:
    [
        {
            "Effect": "Allow",
            "Action": [
                // highlight-start
                "s3:GetObject",
                // highlight-end
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::<your_bucket>/*",
                "arn:aws:s3:::<your_bucket>"
            ]
        }
    ]
}
```

Only the highlighted line is different from the previous policy.

### Example 3. Read-only access to a specific folder in your bucket:

```js showLineNumbers
{
    "Version"
:
    "2012-10-17",
        "Statement"
:
    [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                // highlight-start
                "arn:aws:s3:::<your_bucket>/folder/*",
                // highlight-end
                "arn:aws:s3:::<your_bucket>"
            ]
        }
    ]
}
```

See highlighted lines for the difference from the previous policy.

:::info
In the `Resource` field, you can specify multiple resources by separating them with a comma do provide access to
multiple buckets or folders.
:::

---
If you have any questions or need further assistance, please feel free to reach out to our support team. We are always
here to help you with any questions or issues you may have.