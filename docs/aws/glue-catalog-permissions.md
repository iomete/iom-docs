---
title: AWS Glue Catalog Access
sidebar_label: Glue Catalog Permissions
description: Learn how to provide access to the AWS Glue Catalog in IOMETE, a hybrid (cloud & on-premises based) data platform for data storage and analysis. This guide outlines simple steps to connect to the AWS Glue Catalog and grant permission to the Lakehouse role.
last_update:
  date: 05/05/2024
  author: Vusal Dadalov
---

In IOMETE, when you add `AWS Glue Catalog` as a catalog, you need to provide permission to the `Lakehouse Role` to access the Glue Catalog.

:::info
To find the Lakehouse role, go to the IOMETE **Console &gt; Settings &gt; Data Plane &gt; General** and look for
the `Lakehouse Role ARN` field.
:::

### Attaching the IAM Role Policy

To attach the IAM role policy to the Lakehouse role, you need to navigate to the IAM console.

1. Go to your [IAM console](https://console.aws.amazon.com/iam/home) and select `Roles` from the left-hand menu.
2. Search for the Lakehouse role in the list of roles and click on it.
3. Click on the Permissions tab, and then click on Add `inline policy`.
4. See below for the example to create a policy. You can copy and paste the policy into the JSON editor.
5. Click on `Review policy`. Give your policy a name and click on `Create policy`.

You have now successfully attached the IAM role policy to the Lakehouse role. IOMETE can now access the Glue Catalog.

:::note
Alternative to `Inline policy`, you can also create a `Managed policy` from `Policies` in the IAM console and attach it
to the Lakehouse role.
:::

### Glue Catalog IAM Policy Template

Below is an example of an **IAM policy template** that provides full access to the Glue Catalog for the `Lakehouse role`.

```js showLineNumbers title="iomete-glue-catalog-policy.json"
{
   "Version": "2012-10-17", 
    "Statement": [
      {
         "Sid": "AllConnectors",
         "Effect": "Allow",
         "Action": [
            "glue:*"
         ],
         "Resource": [
            "arn:aws:glue:<region>:<aws-account-number>:*"
         ]
      }
   ]
}
```

Please replace `<region>` and `<aws-account-number>` with your AWS region and account number respectively.

**Example**

Here is an example of a policy that provides full access to the Glue Catalog for the Lakehouse role in the `us-east-1` region.

```js showLineNumbers
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllConnectors",
            "Effect": "Allow",
            "Action": [
                "glue:*"
            ],
            "Resource": [
                "arn:aws:glue:us-east-1:680330367469:*"
            ]
        }
    ]
}
```

For more granular permissions, please consult the [AWS Glue Catalog documentation](https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html).