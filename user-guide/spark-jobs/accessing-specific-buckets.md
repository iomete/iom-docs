---
title: Accessing Specific Buckets
description: Configure per-bucket Spark properties to access specific S3 buckets from IOMETE Spark jobs.
sidebar_label: Accessing Specific Buckets
last_update:
  date: 11/07/2026
  author: IOMETE Documentation Team
---

import Img from '@site/src/components/Img';

By default, IOMETE Spark jobs access S3 with the data plane's storage credentials. On Amazon S3 storage, that's the [Lakehouse role](../aws/s3-bucket-permissions.md#lakehouse-role), the IAM role mapped to `lakehouse-service-account`; on S3-compatible storage, it's the keys in the Helm values. But sometimes a job needs a bucket with different credentials (another AWS account, a partner-owned bucket, or a custom endpoint). In that case, you add per-bucket Spark properties to the job's Spark Config.

## How Per-Bucket Configuration Works

Hadoop's S3A connector supports bucket-level credential overrides through properties of the form:

```
spark.hadoop.fs.s3a.bucket.<bucket-name>.<property>
```

When Spark resolves a path like `s3a://my-other-bucket/path/to/data`, it looks for bucket-specific properties first and uses those credentials instead of the global defaults. That means a single job can read from and write to multiple buckets, each with its own credentials, without any code changes.

---

## Configuring Spark Properties

Each bucket you want to access needs its own set of credential properties. To add them, open your Spark Job in the IOMETE console, go to **Configurations → Spark Config**, and enter the properties listed below.

### Per-Bucket Properties

Replace `<bucket-name>` with the exact name of the S3 bucket (without the `s3a://` prefix or any path).

| Key | Example Value | Description |
|-----|---------------|-------------|
| `spark.hadoop.fs.s3a.bucket.<bucket-name>.access.key` | `<AWS_ACCESS_KEY_ID>` | AWS access key ID for this bucket. |
| `spark.hadoop.fs.s3a.bucket.<bucket-name>.secret.key` | `<AWS_SECRET_ACCESS_KEY>` | AWS secret access key for this bucket. |
| `spark.hadoop.fs.s3a.bucket.<bucket-name>.aws.credentials.provider` | `org.apache.hadoop.fs.s3a.SimpleAWSCredentialsProvider` | Makes S3A use the two keys above for this bucket. Required when the data plane stores its data in Amazon S3. IOMETE then sets S3A's credentials provider to `WebIdentityTokenFileCredentialsProvider`, which uses the Lakehouse role and ignores access keys. |
| `spark.hadoop.fs.s3a.bucket.<bucket-name>.endpoint` | `s3.us-west-2.amazonaws.com` | Optional. Overrides the S3 endpoint. Required for non-standard regions or S3-compatible services like Apache Ozone or MinIO. |

**Example:** for a bucket named `my-specific-bucket`:

| Key | Value |
|-----|-------|
| `spark.hadoop.fs.s3a.bucket.my-specific-bucket.access.key` | `<AWS_ACCESS_KEY_ID>` |
| `spark.hadoop.fs.s3a.bucket.my-specific-bucket.secret.key` | `<AWS_SECRET_ACCESS_KEY>` |
| `spark.hadoop.fs.s3a.bucket.my-specific-bucket.aws.credentials.provider` | `org.apache.hadoop.fs.s3a.SimpleAWSCredentialsProvider` |
| `spark.hadoop.fs.s3a.bucket.my-specific-bucket.endpoint` | `s3.us-west-2.amazonaws.com` |

:::warning Sensitive Values
The secret key value is sensitive. Mark it as a secret in the job config so IOMETE masks it in the UI and run logs.
:::

---

## Setting Up the Job

Once you've identified the properties you need, here's how to wire them up:

1. Open (or create) your Spark job under **Job Templates**.
2. Go to **Configurations → Spark Config** and add the per-bucket properties from the table above.

   <Img src="/img/spark-job/config/spark-config.png" alt="Spark Config tab with per-bucket credential properties added as key-value rows" maxWidth="700px"/>

3. For the secret key value, mark it as a secret in the job config so the value is masked in the UI and logs.
4. Save and run the job.

---

## Related Resources

- [Application Config](./spark-application-config): full reference for Spark Config, Environment Variables, and Config Maps
- [AWS S3 Bucket Access](../aws/s3-bucket-permissions.md): granting the Lakehouse role access to S3 buckets with a bucket policy or an IAM policy
