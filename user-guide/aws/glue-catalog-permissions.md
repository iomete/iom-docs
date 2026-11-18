---
title: AWS Glue Catalog Access
sidebar_label: Glue Catalog Permissions
description: Grant the IAM roles IOMETE uses access to an AWS Glue catalog and its S3 files, set the catalog's region and account, and verify with Test connection and a query.
last_update:
  date: 11/07/2026
  author: Vusal Dadalov
---

An AWS Glue catalog in IOMETE is an external Apache Iceberg catalog: AWS Glue stores the table metadata, and the table files stay in Amazon S3. The IAM roles that IOMETE uses need permissions for both. This guide finds those roles, grants them read and write access to one Glue database and its files, sets the catalog's region and account, and verifies the catalog with **Test connection** and a query.

The examples use a catalog named `aws_glue` for the Glue database `revenue` in region `eu-west-1` of the AWS account `111122223333`. A compute in the `finance` namespace of the `analytics` data plane queries it.

## Understanding Which Roles Use the Catalog {#which-roles-use-the-catalog}

IOMETE calls AWS Glue with the [Lakehouse role](./s3-bucket-permissions.md#lakehouse-role) of the release that runs the caller: the IAM role mapped to that release's `lakehouse-service-account`. Two callers matter:

| Caller | Runs in | Uses the Lakehouse role of |
| --- | --- | --- |
| Computes and Spark jobs | Their workload namespace, such as `finance` | Their data plane's release, such as `analytics` |
| **Test connection** on the catalog form, and the SQL Editor's [Database Explorer](../sql-editor/database-explorer.md) | `iom-spark-connect`, a Spark driver in the control plane's service namespace, `iomete-system` | The control-plane release, `data-plane` |

If both releases use the same role, one policy covers both. Otherwise, grant the permissions to both roles.

## 1. Finding the Roles {#find-the-roles}

For the compute's role, follow [Finding the Lakehouse Role](./s3-bucket-permissions.md#identify-the-workloads-aws-role). For the control plane's role, read the same annotation in the control plane's service namespace, with `kubectl` access to the control plane's cluster:

```bash
CONTROL_PLANE_CONTEXT="<context-of-the-control-plane-cluster>"   # kubectl config get-contexts lists them

kubectl --context "$CONTROL_PLANE_CONTEXT" -n iomete-system \
  get serviceaccount lakehouse-service-account \
  -o jsonpath='{.metadata.annotations.eks\.amazonaws\.com/role-arn}{"\n"}'
```

Each command prints a role ARN, such as `arn:aws:iam::111122223333:role/iomete-analytics-lakehouse`.

## 2. Granting Glue Permissions {#attaching-the-iam-role-policy}

Attach the policy below to each role from step 1:

1. In the [IAM console](https://console.aws.amazon.com/iam/), choose **Roles** and open the role.
2. On the **Permissions** tab, choose **Add permissions**, then **Create inline policy**.
3. Choose **JSON**, replace the editor's content with the policy, and choose **Next**.
4. Enter a policy name and choose **Create policy**.

To reuse the permissions for several roles, create a managed policy under **Policies** and attach it to each role instead.

### Read and Write Policy for One Database {#glue-catalog-iam-policy-template}

Replace `<region>` with the catalog's region (`eu-west-1`), `<catalog-account-id>` with the 12-digit ID of the account that owns the catalog (`111122223333`), and `<database>` with the Glue database (`revenue`).

```json showLineNumbers title="iomete-glue-catalog-policy.json"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadWriteTablesInOneDatabase",
      "Effect": "Allow",
      "Action": [
        "glue:GetDatabase",
        "glue:GetDatabases",
        "glue:GetTable",
        "glue:GetTables",
        "glue:CreateTable",
        "glue:UpdateTable",
        "glue:DeleteTable",
        "glue:GetPartition",
        "glue:GetPartitions",
        "glue:BatchGetPartition",
        "glue:CreatePartition",
        "glue:BatchCreatePartition",
        "glue:UpdatePartition",
        "glue:DeletePartition",
        "glue:BatchDeletePartition"
      ],
      "Resource": [
        "arn:aws:glue:<region>:<catalog-account-id>:catalog",
        "arn:aws:glue:<region>:<catalog-account-id>:database/<database>",
        "arn:aws:glue:<region>:<catalog-account-id>:table/<database>/*"
      ]
    },
    {
      "Sid": "IometeTestConnection",
      "Effect": "Allow",
      "Action": [
        "glue:GetDatabase",
        "glue:CreateDatabase",
        "glue:DeleteDatabase",
        "glue:GetTable",
        "glue:GetTables",
        "glue:CreateTable",
        "glue:DeleteTable"
      ],
      "Resource": [
        "arn:aws:glue:<region>:<catalog-account-id>:catalog",
        "arn:aws:glue:<region>:<catalog-account-id>:database/iomete_connection_test_db",
        "arn:aws:glue:<region>:<catalog-account-id>:table/iomete_connection_test_db/*",
        "arn:aws:glue:<region>:<catalog-account-id>:userDefinedFunction/iomete_connection_test_db/*"
      ]
    }
  ]
}
```

The first statement lets a role list the database and read, create, change and drop tables in it. Glue checks a table action against the table, its database and the catalog, so the statement lists all three levels; see [Glue resource ARNs](https://docs.aws.amazon.com/glue/latest/dg/glue-specifying-resource-arns.html).

The second statement is for **Test connection**. The test creates a database named `iomete_connection_test_db`, creates a table in it, and then drops the table and the database. Dropping a Glue database also needs permission on its tables and functions, so the statement covers those too. Only the control-plane role runs the test: leave this statement out of other roles, or out entirely if you don't use **Test connection**.

Avoid granting `glue:*` on all resources as a shortcut: it lets every workload of the release change any database in the catalog.

<details id="read-only-glue-policy" style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}>
<summary>Granting read-only access instead</summary>

For a role that only reads tables, use this policy with the same placeholders. With it, the **Test connection** checks fail, because they create and drop a database and a table; verify from a compute instead.

```json showLineNumbers
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

</details>

## 3. Granting S3 Access to the Table Files {#grant-s3-access}

Iceberg table files live in S3, under the catalog's **Warehouse** location and each table's location. Give the same roles access to those locations with the [read and write bucket policy](./s3-bucket-permissions.md#example-1-full-readwrite-access-to-your-bucket-from-lakehouse-role). **Test connection** writes and then deletes a small table under the **Warehouse** location, so the control-plane role needs write access there. A role that only reads tables needs only the [read-only bucket policy](./s3-bucket-permissions.md#bucket-policy).

## 4. Filling In the Catalog Form {#fill-in-the-catalog-form}

1. In the console, open **Admin Portal** from the user menu, go to **Data Governance** > **Spark Catalogs**, and choose **New Spark catalog**.
2. Under **External Catalogs**, choose **Iceberg - AWS Glue Catalog**.
3. Enter the **Name** (`aws_glue`) and the **Warehouse**, an `s3a://` location in a bucket that the roles can write to, such as `s3a://<your_bucket>/glue`.
4. If you need them, add the catalog's region and account under **Additional properties** with **Add property**. The form has no other field for them:

| Key | Value | When to add it |
| --- | --- | --- |
| `client.region` | The catalog's region, such as `eu-west-1` | When the catalog isn't in the S3 region set for the control-plane release's storage. IOMETE uses that region by default, or `us-east-1` if none is set. The catalog also uses this region for its S3 requests. |
| `glue.id` | The 12-digit ID of the account that owns the catalog, such as `111122223333` | When the catalog belongs to another AWS account. Without it, Glue uses the account of the calling role. |

IOMETE passes each additional property to Spark under the catalog's prefix, for example as `spark.sql.catalog.aws_glue.client.region`. A property you add replaces IOMETE's own value for the same key.

## 5. Verifying the Catalog {#verify-access-from-the-workload}

1. On the catalog form, choose **Test connection**. Each of the three checks, **Create Database**, **Create Table** and **Drop**, shows a check mark when it passes. For a failed check, select the information icon next to it to read the error.
2. Choose **Create**. Then open the **SQL Editor**, select a compute on the `analytics` data plane in the `finance` namespace, and run:

   ```sql
   SHOW TABLES IN aws_glue.revenue;
   ```

   The query lists the Iceberg tables in `revenue`. Read one of them, replacing `invoices` with its name:

   ```sql
   SELECT * FROM aws_glue.revenue.invoices LIMIT 1;
   ```

   The query returns a row.

**Test connection** checks the control-plane role. The queries check the compute's role, and the second one also reads table files from S3.

If a check or query fails:

- **Not authorized to perform an action such as `glue:CreateDatabase`:** the error names the role IOMETE used and the missing action. Add the action to that role's policy for the resource in the error.
- **Access denied on S3, or HTTP 403:** the role can reach Glue but not the table files. Check step 3, and KMS key permissions if the files use SSE-KMS.
- **Database or table not found:** check `client.region` and `glue.id`. A catalog in another account also needs a Glue resource policy that allows your roles; see [Glue cross-account access](https://docs.aws.amazon.com/glue/latest/dg/cross-account-access.html). A catalog governed by Lake Formation also needs Lake Formation grants.
- **No AWS credentials:** the pod didn't get IRSA credentials. For a compute, see [Verifying Access from a Compute](./s3-bucket-permissions.md#verify-access-from-the-workload). If you added or changed the control-plane release's annotation after `iom-spark-connect` started, delete its driver pod. The Spark operator then starts a new one, which gets the role:

  ```bash
  kubectl --context "$CONTROL_PLANE_CONTEXT" -n iomete-system delete pod iom-spark-connect-driver
  ```
