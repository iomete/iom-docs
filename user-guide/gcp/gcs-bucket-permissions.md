---
title: GCS Bucket Access
sidebar_label: GCS Bucket Access
description: Identify the Google Cloud identity an IOMETE data plane uses on GKE, grant it access to a Cloud Storage bucket, and verify the access with a query from a compute.
last_update:
  date: 11/07/2026
  author: Vusal Dadalov
---

To read or write a Cloud Storage bucket from IOMETE on GKE, grant access to the Google Cloud identity that the workload uses. This guide starts from a compute that needs the bucket. It identifies the compute's identity, grants that identity read access on the bucket, and ends with a query that reads the bucket from the compute.

The examples use a compute in the `finance` workload namespace of the `analytics` data plane. The `analytics` runtime release runs that data plane's services in the `iomete-analytics` service namespace, on a GKE cluster in the Google Cloud project `example-project`.

This guide assumes the cluster uses Workload Identity Federation for GKE. If your deployment gives workloads Google Cloud credentials another way, ask your platform administrator which principal to grant.

## Understanding the Workload's Identity {#workload-identity}

IOMETE services and workloads, including computes, Spark jobs and Jupyter containers, run as the Kubernetes service account `lakehouse-service-account`. A Kubernetes service account isn't a Google Cloud IAM service account. With Workload Identity Federation for GKE, Google Cloud identifies a pod by three things: the project's workload identity pool, the pod's namespace, and its Kubernetes service account. Your administrator sets up one of two methods:

- **IAM service-account impersonation:** the `iam.gke.io/gcp-service-account` annotation on `lakehouse-service-account` names an IAM service account, which the pods act as. Each IOMETE Helm release sets the annotation in its `serviceAccount.annotations` value, and it goes on the account in the release's service namespace and in every workload namespace. The `analytics` release's namespaces, `iomete-analytics`, `finance` and `marketing`, therefore act as one IAM service account, and a bucket grant to it reaches all of them.
- **Direct federated access:** you grant roles on the bucket to the Kubernetes identity itself. Its principal identifier names one namespace, so a grant for `finance` reaches every workload in `finance`, but not `marketing`.

The identity is only the namespace and the service-account name in the project's workload identity pool, and every GKE cluster in a project shares that pool. If two data planes run in clusters of the same project and both have a `finance` namespace, a direct grant to `finance` reaches both. With impersonation, both `finance` namespaces are allowed to act as the IAM service account. To keep data planes apart, give their namespaces different names, or put their clusters in separate projects. See [identity sameness](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/workload-identity#identity_sameness).

## 1. Identifying the Workload's Identity {#identify-the-workloads-identity}

On the compute's **Details** tab, note **Data plane** and **Namespace**: `analytics` and `finance` in this example. Spark jobs and Jupyter containers show the same two fields.

With `kubectl` access to the cluster that runs that data plane, read the IAM service-account annotation on `lakehouse-service-account` in the workload namespace:

```bash
KUBE_CONTEXT="<context-of-the-analytics-cluster>"   # kubectl config get-contexts lists them

kubectl --context "$KUBE_CONTEXT" -n finance \
  get serviceaccount lakehouse-service-account \
  -o jsonpath='{.metadata.annotations.iam\.gke\.io/gcp-service-account}{"\n"}'
```

The output tells you the method and the principal to grant:

- **An email**, such as `iomete-analytics@example-project.iam.gserviceaccount.com`, means impersonation. Grant access to that IAM service account. It must also give `roles/iam.workloadIdentityUser` to `lakehouse-service-account` in each namespace that uses it; the annotation alone isn't enough.
- **An empty line** means direct federated access, if your administrator set it up. The principal is:

  ```text
  principal://iam.googleapis.com/projects/<project-number>/locations/global/workloadIdentityPools/example-project.svc.id.goog/subject/ns/finance/sa/lakehouse-service-account
  ```

  Replace `<project-number>` with the number of the cluster's project, which owns the workload identity pool and can differ from the bucket's project. `gcloud projects describe example-project --format="value(projectNumber)"` prints it.

See Google's [GKE workload authentication guide](https://docs.cloud.google.com/kubernetes-engine/docs/how-to/workload-identity) for both methods and their prerequisites. Installing a data plane doesn't create an IAM service account or grant bucket access.

<details style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}>
<summary>Maintaining the service-account annotation in Helm</summary>

For impersonation, the release's values carry the annotation:

```yaml
serviceAccount:
  annotations:
    iam.gke.io/gcp-service-account: iomete-analytics@example-project.iam.gserviceaccount.com
```

With `serviceAccount.create: true`, the chart writes these annotations to `lakehouse-service-account` in every namespace of the release. From 4.0.2, it also writes them to `iomete-data-plane-init`, which runs the release's initialization job in its service namespace; that job needs bucket access only when the release's own storage is in Cloud Storage. The chart doesn't create the IAM service account, configure Workload Identity Federation, or grant `roles/iam.workloadIdentityUser`. Keep the release's existing values when you upgrade it.

</details>

## 2. Granting Read Access {#provide-access-to-gcs-bucket}

Grant the principal from step 1 the **Storage Object Viewer** role (`roles/storage.objectViewer`) on the bucket. For write access, pick another role from [Choosing a Role](#permission-levels). Adding a binding keeps the bucket's existing bindings.

### IAM Service-Account Impersonation

In the Google Cloud console, go to **Cloud Storage** > **Buckets**, open the bucket, and choose **Permissions** > **Grant access**. Enter the IAM service-account email under **New principals**, select **Storage Object Viewer**, and choose **Save**. Or run:

```bash
GCS_BUCKET="<bucket-name>"
GCS_IAM_SA="iomete-analytics@example-project.iam.gserviceaccount.com"

gcloud storage buckets add-iam-policy-binding "gs://$GCS_BUCKET" \
  --member="serviceAccount:$GCS_IAM_SA" \
  --role="roles/storage.objectViewer"
```

<details id="direct-federated-access" style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}>
<summary>Granting access to a direct federated identity instead</summary>

Direct federated principals work only on buckets with [uniform bucket-level access](https://docs.cloud.google.com/storage/docs/uniform-bucket-level-access): Cloud Storage rejects federated identities on buckets that use fine-grained ACLs. Check the bucket first:

```bash
GCS_BUCKET="<bucket-name>"

gcloud storage buckets describe "gs://$GCS_BUCKET" \
  --format="default(uniform_bucket_level_access)"
```

Continue when the output shows `uniform_bucket_level_access: true`. If it's off, ask your storage administrator to review the bucket's ACL-based access before turning it on, because turning it on disables bucket and object ACLs.

In the Google Cloud console, use the same **Grant access** dialog as above and enter the full `principal://` identifier from step 1 under **New principals**. Or run:

```bash
GCS_PRINCIPAL="principal://iam.googleapis.com/projects/<project-number>/locations/global/workloadIdentityPools/example-project.svc.id.goog/subject/ns/finance/sa/lakehouse-service-account"

gcloud storage buckets add-iam-policy-binding "gs://$GCS_BUCKET" \
  --member="$GCS_PRINCIPAL" \
  --role="roles/storage.objectViewer"
```

</details>

<details id="permission-levels" style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}>
<summary>Choosing a role for write access or object administration</summary>

Grant the role the workload needs, at bucket scope:

| Role | Purpose |
| --- | --- |
| **Storage Object Viewer** (`roles/storage.objectViewer`) | View and list objects. |
| **Storage Object User** (`roles/storage.objectUser`) | Read, create, update and delete objects. |
| **Storage Object Admin** (`roles/storage.objectAdmin`) | Full control of objects, including their permissions and retention settings. It doesn't include bucket administration. |

See [Cloud Storage IAM roles](https://docs.cloud.google.com/storage/docs/access-control/iam-roles) for the complete permission sets.

</details>

## 3. Verifying Access from a Compute {#verify-access-from-the-workload}

Check the grant from IOMETE itself. A command on your own machine uses your credentials, not the compute's.

1. Open the **SQL Editor** and select a running compute on the `analytics` data plane in the `finance` namespace.
2. Read a small object that you know exists in the bucket. For a Parquet file:

   ```sql
   SELECT * FROM parquet.`gs://<bucket-name>/<path-to-a-small-file>.parquet` LIMIT 1;
   ```

   For a CSV file, use `csv.` instead of `parquet.`.

The query returns a row from the file. That proves read access for the compute's identity, not write access. For a Spark job, read the same path from the job.

If the query fails:

- **Permission denied, or HTTP 403:** the principal has no role on the bucket. Check the principal and role from step 2 and, for direct federated access, uniform bucket-level access.
- **No credentials, or a failed token request:** check that Workload Identity Federation for GKE is on for the cluster and the node pool, the annotation from step 1, and for impersonation, the `roles/iam.workloadIdentityUser` binding.

Credentials that a job supplies itself, such as a key file in its Spark configuration, replace the pod's identity. Check the job's configuration if the identity isn't the one you expect.
