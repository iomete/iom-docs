---
title: Accessing Specific Buckets
description: Learn how to configure per-bucket Spark properties to access specific S3 buckets from IOMETE Spark jobs.
last_update:
  date: 03/27/2026
  author: IOMETE Documentation Team
---

import Img from '@site/src/components/Img';

By default, IOMETE Spark jobs access storage through the Lakehouse Role configured during platform installation. When a Spark job needs to read from or write to a bucket that uses **different credentials** — such as a bucket in another AWS account, a partner-owned bucket, or a bucket with a custom endpoint — you need to supply per-bucket Spark properties directly in the job's Spark Config.

## How Per-Bucket Configuration Works

Hadoop's S3A connector supports bucket-level credential overrides through properties of the form:

```
spark.hadoop.fs.s3a.bucket.<bucket-name>.<property>
```

When Spark resolves a path like `s3a://my-other-bucket/path/to/data`, it checks for bucket-specific properties first. If found, those credentials are used instead of the global defaults. This lets a single Spark job read from and write to multiple buckets, each with its own credentials, without any code changes.

---

## Configuring Spark Properties

To supply bucket-specific credentials, open your Spark Job in the IOMETE console, go to **Configurations → Spark Config**, and add the properties from the table below.

### Per-Bucket Properties

Replace `<bucket-name>` with the exact name of the S3 bucket (without the `s3a://` prefix or any path).

| Key | Example Value | Description |
|-----|---------------|-------------|
| `spark.hadoop.fs.s3a.bucket.<bucket-name>.access.key` | `AKIAIOSFODNN7EXAMPLE` | AWS access key ID for this bucket. |
| `spark.hadoop.fs.s3a.bucket.<bucket-name>.secret.key` | `wJalrXUtnFEMI/K7MDENG` | AWS secret access key for this bucket. |
| `spark.hadoop.fs.s3a.bucket.<bucket-name>.endpoint` | `s3.us-west-2.amazonaws.com` | Optional. Override the S3 endpoint for this bucket. Required for non-standard regions or S3-compatible services (e.g. MinIO). |

**Example:** for a bucket named `my-specific-bucket`:

| Key | Value |
|-----|-------|
| `spark.hadoop.fs.s3a.bucket.my-specific-bucket.access.key` | `AKIAIOSFODNN7EXAMPLE` |
| `spark.hadoop.fs.s3a.bucket.my-specific-bucket.secret.key` | `wJalrXUtnFEMI/K7MDENG` |
| `spark.hadoop.fs.s3a.bucket.my-specific-bucket.endpoint` | `s3.us-west-2.amazonaws.com` |

:::warning Sensitive values
Mark secret key values as secrets in the job config to prevent them from appearing in logs. Rename the key to include `secret` or `password` so IOMETE automatically masks the value in the UI and run logs.
:::

---

## Setting Up the Job

1. Navigate to **Job Templates** and open (or create) your Spark job.
2. Open **Configurations → Spark Config** and add the per-bucket properties from the table above.
3. For secret keys, ensure the key name contains `secret` or `password` so the value is masked.
4. Save and run the job.

---

## Related Resources

- [Application Config](./spark-application-config.md) — full reference for Spark Config, Environment Variables, and Config Maps
- [AWS S3 Bucket Access](/aws/s3-bucket-permissions) — granting the Lakehouse Role access to S3 buckets via bucket policy or IAM
