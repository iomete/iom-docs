---
title: AWS S3 Buckets Access
sidebar_label: S3 Buckets Access
description: Find the IAM role an IOMETE data plane uses on Amazon EKS, grant it access to an Amazon S3 bucket, and verify the access with a query from a compute.
last_update:
  date: 11/07/2026
  author: Abhishek Pathania
---

To read or write an Amazon S3 bucket from IOMETE, grant access to the IAM role that the data plane uses. This guide starts from a compute that needs the bucket. It finds the compute's IAM role, grants that role read access with a bucket policy, and ends with a query that reads the bucket from the compute.

The examples use a compute in the `finance` workload namespace of the `analytics` data plane. The `analytics` runtime release installs that data plane's services in the `iomete-analytics` service namespace. The AWS account is `111122223333`.

This guide is for data planes that store their data in Amazon S3 (`storage.type: aws_s3`) on Amazon EKS. A data plane on S3-compatible storage, such as MinIO, Apache Ozone or Dell ECS, uses the endpoint and static keys under `storage.s3CompatibleSettings` in its Helm values instead of an IAM role; see [Object Storage](/resources/deployment/architecture-deployment#object-storage). To read one bucket with different credentials, see [Accessing Specific Buckets](../spark-jobs/accessing-specific-buckets.md).

## Understanding the Lakehouse Role {#lakehouse-role}

IOMETE services and workloads, including computes, Spark jobs and Jupyter containers, run as a Kubernetes service account named `lakehouse-service-account`. On Amazon EKS, IOMETE uses [IAM roles for service accounts (IRSA)](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html): the `eks.amazonaws.com/role-arn` annotation on that service account names an IAM role, and Spark reads S3 with temporary credentials for that role. The IOMETE documentation calls this role the **Lakehouse role**.

Each IOMETE Helm release sets the annotation in its `serviceAccount.annotations` value, which goes on `lakehouse-service-account` in the release's service namespace and in every workload namespace. Everything a release runs therefore shares one Lakehouse role. For the `analytics` runtime release:

| Namespace | What runs there | Lakehouse role |
| --- | --- | --- |
| `iomete-analytics` (service namespace) | The data plane's services | `iomete-analytics-lakehouse` |
| `finance` (workload namespace) | Computes, Spark jobs and Jupyter containers | `iomete-analytics-lakehouse` |
| `marketing` (workload namespace) | Computes, Spark jobs and Jupyter containers | `iomete-analytics-lakehouse` |

So a bucket grant to the Lakehouse role of `analytics` reaches every workload in `finance` and `marketing`, and the release's own services. You can't grant a bucket to `finance` alone through this role. The control-plane release `data-plane` has its own `serviceAccount.annotations`: its role covers the control-plane services in `iomete-system` and the workloads of the `default` data plane.

:::note EKS Pod Identity isn't supported
IOMETE 4.0.1 and 4.0.2 configure Spark's S3 connector (S3A) to get credentials only from the IRSA web identity token. With EKS Pod Identity alone, `s3a://` reads fail, even though tools that use the standard AWS credential chain, such as `aws sts get-caller-identity`, report the associated role. Use IRSA.
:::

## 1. Finding the Lakehouse Role {#identify-the-workloads-aws-role}

On the compute's **Details** tab, note **Data plane** and **Namespace**: `analytics` and `finance` in this example. Spark jobs and Jupyter containers show the same two fields.

With `kubectl` access to the cluster that runs that data plane, read the role annotation on `lakehouse-service-account` in the workload namespace:

```bash
KUBE_CONTEXT="<context-of-the-analytics-cluster>"   # kubectl config get-contexts lists them

kubectl --context "$KUBE_CONTEXT" -n finance \
  get serviceaccount lakehouse-service-account \
  -o jsonpath='{.metadata.annotations.eks\.amazonaws\.com/role-arn}{"\n"}'
```

The command prints the Lakehouse role's ARN:

```text
arn:aws:iam::111122223333:role/iomete-analytics-lakehouse
```

Use this full ARN in step 2. If the command prints an empty line, the release doesn't map the service account to a role, so workloads in that namespace have no AWS credentials. Ask the administrator who manages the release to add the annotation.

<details id="iam-roles-for-service-accounts-irsa" style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}>
<summary>Adding or changing the role annotation</summary>

An administrator with access to the release's values and to AWS IAM does this once for each release:

1. Create the IAM role, or choose an existing one. Its trust policy must trust the cluster's IAM OIDC provider for `lakehouse-service-account` in every namespace of the release. For `analytics`, those are `system:serviceaccount:iomete-analytics:lakehouse-service-account`, `system:serviceaccount:finance:lakehouse-service-account` and `system:serviceaccount:marketing:lakehouse-service-account`. From 4.0.2, also trust `system:serviceaccount:iomete-analytics:iomete-data-plane-init`: the release's initialization job runs as that account, gets the same annotation, and writes to the release's bucket. See [Assign IAM roles to Kubernetes service accounts](https://docs.aws.amazon.com/eks/latest/userguide/associate-service-account-role.html).
2. Add the annotation to the release's existing values file, and keep its other settings:

   ```yaml title="analytics-values.yaml"
   serviceAccount:
     annotations:
       eks.amazonaws.com/role-arn: arn:aws:iam::111122223333:role/iomete-analytics-lakehouse
   ```

3. Upgrade the release with that values file at its current chart version. `helm list -n iomete-analytics` shows the version in the **CHART** column.

   ```bash
   export IOMETE_VERSION="<current-chart-version>"   # for example 4.0.2

   helm upgrade --kube-context "$KUBE_CONTEXT" -n iomete-analytics analytics \
     iomete/iomete-lakehouse-runtime \
     --version "$IOMETE_VERSION" \
     -f analytics-values.yaml
   ```

   For the control-plane release, use `data-plane`, `iomete/iomete-data-plane-enterprise` and `iomete-system` instead. With `serviceAccount.create: true`, the chart writes the annotation to every namespace of the release. If an administrator creates the service accounts instead, they regenerate and apply them as described in [Have an Administrator Create Them](/resources/deployment/on-prem/install#option-2-have-an-administrator-create-them). The chart doesn't create the IAM role or its trust policy.

4. Restart running computes with **Restart** in the console. Amazon EKS adds the role's credentials to a pod only when it creates the pod, so pods that were already running don't get them. Spark jobs get them on their next run.

</details>

<span id="options-to-provide-access-to-s3-buckets" style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}></span>

## 2. Granting Access with a Bucket Policy {#bucket-policy}

A bucket policy names the Lakehouse role as a principal on the bucket. This example grants read-only access. The sections after it cover read and write access, a single folder, and attaching the permissions to the role instead of the bucket.

1. In the [Amazon S3 console](https://console.aws.amazon.com/s3/), open the bucket and choose the **Permissions** tab.
2. Under **Bucket policy**, choose **Edit**.
3. Paste the policy below. If the bucket already has a policy, add the statement to its `Statement` list and keep the existing statements.
4. Replace `<lakehouse_role_arn>` with the ARN from step 1, and `<your_bucket>` with the bucket name.
5. Choose **Save changes**.

### Read-Only Bucket Policy {#example-2-read-only-access-to-your-bucket-from-lakehouse-role}

```json showLineNumbers
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "<lakehouse_role_arn>"
                ]
            },
            "Action": [
                "s3:GetObject",
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

If AWS rejects the policy with `Invalid principal in policy`, the ARN doesn't name an existing IAM role; compare it with the output of step 1. Saving the policy shows only that AWS accepted it. Step 3 checks that the compute can read the bucket.

If the bucket belongs to another AWS account, the Lakehouse role's own account must also allow the access, with an IAM policy on the role. See [cross-account access](https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-walkthroughs-managing-access-example2.html). Objects encrypted with SSE-KMS also need permission to use the KMS key; see [SSE-KMS permissions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html).

<details id="example-1-full-readwrite-access-to-your-bucket-from-lakehouse-role" style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}>
<summary>Granting read and write access</summary>

Use this policy when workloads write or delete objects, for example when they create tables in the bucket or use it as a Glue catalog's warehouse. Replace the placeholders as in the read-only policy.

```json showLineNumbers
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "<lakehouse_role_arn>"
                ]
            },
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

</details>

<details id="example-3-read-only-access-to-a-specific-folder-in-your-bucket-from-lakehouse-role" style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}>
<summary>Restricting read access to one folder</summary>

This policy lets the role read objects under one folder (key prefix) and list that folder, but not list the rest of the bucket. Replace `<your_folder>` with the prefix, without a trailing slash.

```json showLineNumbers
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "<lakehouse_role_arn>"
            },
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::<your_bucket>"
            ],
            "Condition": {
                "StringLike": {
                    "s3:prefix": [
                        "<your_folder>",
                        "<your_folder>/*"
                    ]
                }
            }
        },
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "<lakehouse_role_arn>"
            },
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::<your_bucket>/<your_folder>/*"
            ]
        }
    ]
}
```

See [listing objects with a specific prefix](https://docs.aws.amazon.com/AmazonS3/latest/userguide/amazon-s3-policy-keys.html#condition-key-bucket-ops-2) for how the `s3:prefix` condition works.

</details>

<span id="attaching-the-iam-role-policy" style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}></span>
<span id="example-1-full-readwrite-access-to-your-bucket" style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}></span>
<span id="example-2-read-only-access-to-your-bucket" style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}></span>
<span id="example-3-read-only-access-to-a-specific-folder-in-your-bucket" style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}></span>

<details id="iam-role-policy" style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}>
<summary>Granting access with an IAM policy on the role instead</summary>

If your organization manages permissions on IAM roles rather than on buckets, attach the permissions to the Lakehouse role:

1. In the [IAM console](https://console.aws.amazon.com/iam/), choose **Roles** and open the Lakehouse role from step 1.
2. On the **Permissions** tab, choose **Add permissions**, then **Create inline policy**.
3. Choose **JSON**, replace the editor's content with the policy, and choose **Next**.
4. Enter a policy name and choose **Create policy**.

An IAM policy applies to the role it's attached to, so it has no `Principal` element. This one grants read-only access. For other access levels, use the statements of the bucket policies above without their `Principal` elements.

```json showLineNumbers
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
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

To reuse the permissions for other roles, create a managed policy under **Policies** and attach it to each role instead. To cover several buckets or folders, add their ARNs to `Resource`.

</details>

## 3. Verifying Access from a Compute {#verify-access-from-the-workload}

Check the grant from IOMETE itself, through the same S3 connector your workloads use. The public IOMETE Spark images don't include the AWS CLI, and an AWS command on your own machine uses your credentials, not the compute's.

1. Open the **SQL Editor** and select a running compute on the `analytics` data plane in the `finance` namespace.
2. Read a small object that you know exists in the bucket. For a Parquet file:

   ```sql
   SELECT * FROM parquet.`s3a://<your_bucket>/<path-to-a-small-file>.parquet` LIMIT 1;
   ```

   Use the `s3a://` scheme. For a CSV file, use `csv.` instead of `parquet.`.

The query returns a row from the file. That proves read access for the compute's Lakehouse role, not write access. For a Spark job, read the same path from the job.

If the query fails, the error shows what's missing:

- **Access denied, or HTTP 403:** the compute has credentials, but its role lacks permission. Check the principal ARN, the bucket and object ARNs in the policy, any explicit `Deny` statement, and KMS key permissions for SSE-KMS objects.
- **No AWS credentials:** an error such as `No AWS Credentials provided by WebIdentityTokenFileCredentialsProvider` means the compute's pods didn't get IRSA credentials. Check the annotation from step 1 and the role's trust policy. If the annotation was added or changed after the compute started, restart the compute.

To check whether a running compute got the role, look for `AWS_ROLE_ARN` in its driver pod, which IOMETE names `cc-<compute-name>-driver`:

```bash
COMPUTE_NAME="<compute-name>"   # the compute's Name in the console

kubectl --context "$KUBE_CONTEXT" -n finance \
  describe pod "cc-${COMPUTE_NAME}-driver" | grep AWS_ROLE_ARN
```

A pod with IRSA credentials shows the role:

```text
      AWS_ROLE_ARN:                 arn:aws:iam::111122223333:role/iomete-analytics-lakehouse
```

No output means the pod started without the role. Fix the annotation, then restart the compute.
