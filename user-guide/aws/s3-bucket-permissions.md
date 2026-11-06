---
title: AWS S3 Buckets Access
sidebar_label: S3 Buckets Access
description: Identify the AWS identity used by an IOMETE workload, grant scoped S3 permissions, and verify a read from the intended data plane and namespace.
last_update:
  date: 11/06/2026
  author: Abhishek Pathania
---

To read or write an Amazon S3 bucket, grant access to the AWS identity used by the workload that accesses it. A data plane ID, Kubernetes namespace, and AWS IAM role are different things. Workloads in different namespaces or data planes can use different roles, even when their Kubernetes service accounts have the same name.

This guide walks through granting read access with a bucket policy, then verifying a read from the intended workload. It assumes the workload already has an AWS identity. Additional policy examples cover writes, a specific folder, and IAM role policies.

This guide covers IAM-backed access to Amazon S3. For an S3-compatible store such as MinIO or Ozone, use that store's credential and endpoint configuration. The EKS identity discovery steps below apply to workloads on Amazon EKS.

## 1. Identifying the Workload’s AWS Role {#identify-the-workloads-aws-role}

Start with the compute or Spark job that needs access. On its **Details** tab, record **Data plane** and **Namespace**. Ask your platform administrator which Kubernetes context hosts that data plane. Use the workload namespace, which can differ from the namespace containing the data plane's management services.

Run these read-only commands with access to that cluster. Replace the example values with your own:

```bash
KUBE_CONTEXT="<context-for-the-selected-data-plane>"
WORKLOAD_NS="finance"

kubectl --context "$KUBE_CONTEXT" -n "$WORKLOAD_NS" get pods \
  -o custom-columns=NAME:.metadata.name,SERVICEACCOUNT:.spec.serviceAccountName

WORKLOAD_POD="<pod-for-the-intended-workload>"
WORKLOAD_SA=$(kubectl --context "$KUBE_CONTEXT" -n "$WORKLOAD_NS" \
  get pod "$WORKLOAD_POD" -o jsonpath='{.spec.serviceAccountName}')
printf 'Kubernetes service account: %s\n' "$WORKLOAD_SA"
```

The IOMETE charts normally use `lakehouse-service-account`, but read the pod's actual value. Then expand the method your installation uses to identify its IAM role. Ask your administrator if you do not know which method is configured.

<details id="iam-roles-for-service-accounts-irsa" style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}>
<summary>Finding the role for IRSA</summary>

For IRSA, inspect the service account's role annotation:

```bash
kubectl --context "$KUBE_CONTEXT" -n "$WORKLOAD_NS" \
  get serviceaccount "$WORKLOAD_SA" \
  -o jsonpath='{.metadata.annotations.eks\.amazonaws\.com/role-arn}{"\n"}'
```

Expect an IAM role ARN such as `arn:aws:iam::123456789012:role/finance-reader`. Your administrator must also configure the role's trust policy for the EKS cluster's OIDC provider and the correct namespace/service account. An annotation alone does not establish that trust. See [Assign IAM roles to Kubernetes service accounts](https://docs.aws.amazon.com/eks/latest/userguide/associate-service-account-role.html).

If the owning IOMETE Helm release manages the Kubernetes service accounts (`serviceAccount.create: true`), retain the annotation in that release's existing values:

```yaml
serviceAccount:
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::<account-id>:role/<workload-role>
```

The chart applies these annotations to the service accounts it creates in its managed namespaces. It does not create the AWS IAM role or its trust policy. For administrator-managed accounts, update their existing configuration instead of changing Helm ownership just to add an annotation.

</details>

<details id="eks-pod-identity" style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}>
<summary>Finding the role for EKS Pod Identity</summary>

EKS Pod Identity uses an association for a specific cluster, namespace, and service account. It does not require an IRSA annotation on the Kubernetes account. With AWS CLI access to the selected EKS cluster, inspect the association:

```bash
CLOUD_PROFILE="<aws-profile-for-the-cluster-account>"
EKS_REGION="<cluster-region>"
EKS_CLUSTER="<eks-cluster-name>"

aws --profile "$CLOUD_PROFILE" --region "$EKS_REGION" \
  eks list-pod-identity-associations --cluster-name "$EKS_CLUSTER" \
  --namespace "$WORKLOAD_NS" --service-account "$WORKLOAD_SA" \
  --query 'associations[].associationId' --output text

ASSOCIATION_ID="<association-id-from-the-result>"
aws --profile "$CLOUD_PROFILE" --region "$EKS_REGION" \
  eks describe-pod-identity-association --cluster-name "$EKS_CLUSTER" \
  --association-id "$ASSOCIATION_ID" \
  --query 'association.{RoleArn:roleArn,TargetRoleArn:targetRoleArn}'
```

Review the associated role and any target role with your AWS administrator. The Pod Identity Agent and a supported workload SDK credential chain are also required. See [EKS Pod Identity](https://docs.aws.amazon.com/eks/latest/userguide/pod-identities.html) and [association configuration](https://docs.aws.amazon.com/eks/latest/userguide/pod-id-association.html).

</details>

If neither method identifies the role, ask your administrator how this workload obtains credentials. Do not choose a role from its name alone. Application-specific credentials or role assumption can also change the effective identity; verify from the workload after configuring access.

## Options to Provide Access to S3 Buckets

Continue with the bucket-policy example below to grant read access. If your organization manages permissions through IAM role policies, use the [IAM role policy examples](#iam-role-policy) instead.

For cross-account access, permissions are required on both the identity and resource sides. Have the account administrators configure both before verification; see [AWS cross-account S3 access](https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-walkthroughs-managing-access-example2.html).

## 2. Granting Read Access with a Bucket Policy {#bucket-policy}

A bucket policy can grant access to the verified workload role. Repeat the identity check for other workloads that need access; do not assume every compute, job, or notebook uses this role.

To set the bucket policy, you need to navigate to your S3 bucket's permissions page.

1. Go to your [S3 console](https://s3.console.aws.amazon.com/s3/home) and select your desired bucket.
2. Click on the "Permissions" tab, and then click on "Bucket Policy".
3. Merge the read-only statements below into the existing bucket policy, preserving unrelated access.
4. Replace `<workload_role_arn>` with the full IAM role ARN, such as `arn:aws:iam::123456789012:role/finance-reader`, and `<your_bucket>` with the bucket name. A role name or an STS assumed-role session ARN is not the IAM role ARN used here.
5. Click on "Save".

Saving the policy confirms only that AWS accepted the policy change. [Verify a read from the intended workload](#verify-access-from-the-workload) before relying on the grant.

### Read-Only Bucket Policy {#example-2-read-only-access-to-your-bucket-from-lakehouse-role}

```json showLineNumbers
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "<workload_role_arn>"
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

This policy provides read-only access to your bucket from the workload role.

## 3. Verifying Access from the Workload {#verify-access-from-the-workload}

If AWS CLI is already available in the intended workload container, check its effective identity without printing credentials:

```bash
WORKLOAD_CONTAINER="<container-name>"
kubectl --context "$KUBE_CONTEXT" -n "$WORKLOAD_NS" \
  exec "$WORKLOAD_POD" -c "$WORKLOAD_CONTAINER" -- aws sts get-caller-identity
```

The returned account and assumed-role ARN should match the intended role. A command on your laptop verifies your laptop's credentials, not the pod's. The CLI can also use a different credential chain from Spark if the application has explicit storage credentials.

Finish with an actual read through the workload's configured storage connector. For a compute, select that compute in SQL Editor and read a known small Parquet file that should be allowed:

```sql
SELECT * FROM parquet.`s3a://<your_bucket>/folder/sample.parquet` LIMIT 1;
```

For a Spark job, perform the equivalent read in that job on its selected data plane and namespace. A successful read verifies that path for that workload; it does not prove write access or access from other workloads.

If access is denied, check the effective identity, bucket and object policy scope, and any explicit denies. SSE-KMS objects also require the relevant KMS permissions and key policy access; see [SSE-KMS permissions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html). If credentials are unavailable, resolve the IRSA trust or Pod Identity setup before broadening S3 permissions.

## Additional Access Patterns

Use these examples when the read-only bucket policy does not match the workload's requirements. Apply only the permissions it needs, then repeat the workload verification above.

<details id="example-1-full-readwrite-access-to-your-bucket-from-lakehouse-role" style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}>
<summary>Granting read and write access</summary>

Use this policy when the workload needs to read, write, and delete objects. Replace `<workload_role_arn>` with the full IAM role ARN and `<your_bucket>` with the bucket name.

```json showLineNumbers
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "<workload_role_arn>"
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

This policy provides full read/write access to your bucket from the workload role.

</details>

<details id="example-3-read-only-access-to-a-specific-folder-in-your-bucket-from-lakehouse-role" style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}>
<summary>Restricting read access to one folder</summary>

```json showLineNumbers
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::<your_bucket>"
            ],
            "Condition": {
                "StringLike": {
                    "s3:prefix": [
                        "folder",
                        "folder/*"
                    ]
                }
            },
            "Principal": {
                "AWS": "<workload_role_arn>"
            }
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::<your_bucket>/folder/*"
            ],
            "Principal": {
                "AWS": "<workload_role_arn>"
            }
        }
    ]
}
```

This example permits object reads under `folder/` and listing with that prefix. It does not grant listing of the bucket root. See [S3 prefix conditions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/amazon-s3-policy-keys.html#amazon-s3-policy-keys-prefix).

</details>

## IAM Role Policy

Another way to provide access to the workload role is to create an IAM role policy that allows access to the S3 bucket
and attach it to the workload role.

### Attaching the IAM Role Policy

To attach the IAM role policy to the workload role, you need to navigate to the IAM console.

1. Go to your [IAM console](https://console.aws.amazon.com/iam/home) and select `Roles` from the left-hand menu.
2. Search for the workload role in the list of roles and click on it.
3. Click on the Permissions tab, and then click on Add `inline policy`.
4. See below for the examples to create a policy. You can copy and paste the policy into the JSON editor.
5. Click on `Review policy`. Give your policy a name and click on `Create policy`.

After attaching the policy, [verify access from the workload](#verify-access-from-the-workload). A successful policy save does not prove that the workload uses this role or that all required permissions are present.

:::note
Alternative to `Inline policy`, you can also create a `Managed policy` from `Policies` in the IAM console and attach it
to the workload role.
:::

Here are some examples of IAM role policies that you can attach to the workload role:

### Example 1. Full read/write access to your bucket:

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

Replace `<your_bucket>` with the name of your S3 bucket that you want to provide access to.

:::info
You already noticed that, IAM role policy does not require to specify the `Principal` field as it is already attached to
the workload role.
:::

### Example 2. Read-only access to your bucket:

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

### Example 3. Read-only access to a specific folder in your bucket:

```json showLineNumbers
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::<your_bucket>"
            ],
            "Condition": {
                "StringLike": {
                    "s3:prefix": [
                        "folder",
                        "folder/*"
                    ]
                }
            }
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::<your_bucket>/folder/*"
            ]
        }
    ]
}
```

:::info
In the `Resource` field, you can specify multiple resources by separating them with a comma to provide access to
multiple buckets or folders.
:::
