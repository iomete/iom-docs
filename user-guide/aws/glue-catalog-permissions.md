---
title: AWS Glue Catalog Access
sidebar_label: Glue Catalog Permissions
description: Grant an IOMETE workload scoped AWS Glue metadata permissions and verify catalog and data access from its selected data plane and namespace.
last_update:
  date: 11/05/2026
  author: Vusal Dadalov
---

An AWS Glue catalog stores table metadata. The Spark compute or job that uses the catalog needs permission to read that metadata, as well as separate permission to read the table's data in S3.

First identify the AWS role used by the intended workload. Record its **Data plane** and **Namespace** in IOMETE, then inspect the pod's Kubernetes service account and its IRSA or EKS Pod Identity configuration. Follow [Identify the Workload's AWS Role](./s3-bucket-permissions.md#identify-the-workloads-aws-role). The same Kubernetes service-account name in another namespace or cluster does not establish which AWS role it uses.

If the catalog configuration explicitly supplies credentials or assumes another IAM role, check that configuration too: the effective Glue identity can differ from the pod's initial identity.

### Attaching the IAM Role Policy

1. Open [IAM Roles](https://console.aws.amazon.com/iam/home#/roles) in the account that owns the verified role.
2. Select that role and add an inline policy or attach an existing managed policy for the required Glue operations.
3. Review the resource scope and save the policy. Preserve unrelated permissions when editing an existing policy.
4. [Verify access from the workload](#verify-access-from-the-workload). Saving the policy is not an end-to-end access test.

### Glue Catalog IAM Policy Template

This example permits read-only metadata operations for one existing database and its tables. Replace `<region>`, `<catalog-account-id>`, and `<database>` with the region, 12-digit AWS account ID owning the catalog, and database name. The catalog account can differ from the workload's account.

```json showLineNumbers title="iomete-glue-catalog-policy.json"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadSelectedDatabaseMetadata",
      "Effect": "Allow",
      "Action": [
        "glue:GetDatabase",
        "glue:GetTables",
        "glue:GetTable",
        "glue:GetTableVersion",
        "glue:GetTableVersions",
        "glue:GetPartition",
        "glue:GetPartitions",
        "glue:BatchGetPartition"
      ],
      "Resource": [
        "arn:aws:glue:<region>:<catalog-account-id>:catalog",
        "arn:aws:glue:<region>:<catalog-account-id>:database/<database>",
        "arn:aws:glue:<region>:<catalog-account-id>:table/<database>/*"
      ]
    }
  ]
}
```

Glue checks table operations against the table and its parent database and catalog, which is why all three ARN levels are present. See [Glue resource ARNs and permission rules](https://docs.aws.amazon.com/glue/latest/dg/glue-specifying-resource-arns.html).

This policy does not grant catalog-wide database discovery or create, update, and delete operations. Add only the operations your workload needs, scoped to the intended resources. For example, a workload that manages Iceberg tables can need `glue:CreateTable`, `glue:UpdateTable`, and `glue:DeleteTable`; creating databases requires separate permissions. Avoid using `glue:*` as a default access grant.

### Verify Access from the Workload

Select the intended compute in SQL Editor and use a configured Glue catalog with an existing database and table. Replace `glue_catalog`, `analytics`, and `events` below with your IOMETE catalog name, Glue database, and table:

```sql
SHOW TABLES IN glue_catalog.analytics;
SELECT * FROM glue_catalog.analytics.events LIMIT 1;
```

For a Spark job, run the equivalent checks in that job's configured environment. The first check tests metadata discovery for the chosen database; the second also reads table data. Neither proves write access.

If metadata access fails, check the Glue region/catalog account, effective IAM role, and resource ARNs. Cross-account catalogs and catalogs governed by Lake Formation can require additional resource policies or Lake Formation grants; see [Glue cross-account access](https://docs.aws.amazon.com/glue/latest/dg/cross-account-access.html). If metadata is visible but reading rows fails, check [S3 permissions](./s3-bucket-permissions.md) and any KMS key permissions for the table's storage.
