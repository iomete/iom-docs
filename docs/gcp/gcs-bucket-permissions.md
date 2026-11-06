---
title: GCS Bucket Access
sidebar_label: GCS Bucket Access
description: Identify the Google Cloud identity used by an IOMETE workload, grant bucket-scoped access, and verify a read from the intended data plane and namespace.
last_update:
  date: 11/06/2026
  author: Vusal Dadalov
---

Grant Cloud Storage access to the identity used by the compute or Spark job that reads the bucket. A Kubernetes service account is not a Google Cloud IAM service account. On GKE, a workload can use a federated Kubernetes identity directly or impersonate an IAM service account.

This guide covers existing Workload Identity Federation for GKE setups. If your deployment uses another credential method, ask your platform administrator to identify the effective principal before changing bucket permissions.

## 1. Identifying the Workload’s Identity {#identify-the-workloads-identity}

On the workload's **Details** tab in IOMETE, record **Data plane** and **Namespace**. Obtain the Kubernetes context for the cluster hosting that data plane. Use the workload namespace, which can differ from the data plane's management namespace.

```bash
KUBE_CONTEXT="<context-for-the-selected-data-plane>"
WORKLOAD_NS="finance"

kubectl --context "$KUBE_CONTEXT" -n "$WORKLOAD_NS" get pods \
  -o custom-columns=NAME:.metadata.name,SERVICEACCOUNT:.spec.serviceAccountName

WORKLOAD_POD="<pod-for-the-intended-workload>"
WORKLOAD_SA=$(kubectl --context "$KUBE_CONTEXT" -n "$WORKLOAD_NS" \
  get pod "$WORKLOAD_POD" -o jsonpath='{.spec.serviceAccountName}')
printf 'Kubernetes service account: %s\n' "$WORKLOAD_SA"

kubectl --context "$KUBE_CONTEXT" -n "$WORKLOAD_NS" \
  get serviceaccount "$WORKLOAD_SA" \
  -o jsonpath='{.metadata.annotations.iam\.gke\.io/gcp-service-account}{"\n"}'
```

Use the pod's actual service account, even if you expect the chart's usual `lakehouse-service-account` name. Interpret the annotation result according to the configured identity method:

- **IAM service-account impersonation:** the annotation contains an email such as `finance-reader@example-project.iam.gserviceaccount.com`. Confirm that this IAM account grants `roles/iam.workloadIdentityUser` to the correct workload pool, namespace, and Kubernetes service account. The annotation and IAM binding are both required.
- **Direct federated access:** there may be no IAM service-account annotation or email. Your administrator identifies the principal from the workload pool, namespace, and Kubernetes service account instead.

See Google's [GKE workload authentication guide](https://docs.cloud.google.com/kubernetes-engine/docs/how-to/workload-identity) for both methods and their prerequisites. Creating a data plane or a Kubernetes service account does not itself create a Google Cloud IAM service account or grant bucket access.

<details>
<summary>Maintaining an existing service-account annotation in Helm</summary>

For chart-managed Kubernetes accounts, the owning IOMETE release accepts `serviceAccount.annotations`. In an existing impersonation setup, its values can include:

```yaml
serviceAccount:
  annotations:
    iam.gke.io/gcp-service-account: finance-reader@example-project.iam.gserviceaccount.com
```

The chart applies these annotations to each Kubernetes account it creates in its managed namespaces. It does not create the IAM account, configure Workload Identity Federation, or grant impersonation permission. Preserve the release's existing ownership and identity configuration.

</details>

## 2. Granting Read Access {#provide-access-to-gcs-bucket}

Grant permissions on the intended bucket to the verified principal. Use **Storage Object Viewer** for this read-only example. Follow the section matching the identity method you identified above, then verify the read in step 3.

### IAM Service-Account Impersonation

For the impersonation method, add the annotated IAM service-account email to the bucket's IAM policy:

```bash
GCS_BUCKET="<bucket-name>"
GCS_IAM_SA="<verified-iam-service-account-email>"

gcloud storage buckets add-iam-policy-binding "gs://$GCS_BUCKET" \
  --member="serviceAccount:$GCS_IAM_SA" \
  --role="roles/storage.objectViewer"
```

<details id="direct-federated-access">
<summary>Using a direct federated identity instead of an IAM service account</summary>

Direct federated principals require [uniform bucket-level access](https://docs.cloud.google.com/storage/docs/uniform-bucket-level-access). Check the bucket before granting access:

```bash
GCS_BUCKET="<bucket-name>"
gcloud storage buckets describe "gs://$GCS_BUCKET" \
  --format="default(uniform_bucket_level_access)"
```

Continue when the output shows `uniform_bucket_level_access: true`. If it is disabled, ask your storage administrator to review existing ACL-based access before enabling it: enabling this setting disables bucket and object ACLs. Adding a federated principal to the IAM policy alone does not grant access while this setting is disabled.

For direct access, use the exact Kubernetes principal identified by your administrator. The standard GKE principal format is:

```text
principal://iam.googleapis.com/projects/<pool-project-number>/locations/global/workloadIdentityPools/<pool-project-id>.svc.id.goog/subject/ns/<namespace>/sa/<kubernetes-service-account>
```

The project number and ID belong to the workload identity pool, which can differ from the project owning the bucket. Use the actual namespace and service account discovered above:

```bash
GCS_BUCKET="<bucket-name>"
GCS_PRINCIPAL="<verified-principal-identifier>"

gcloud storage buckets add-iam-policy-binding "gs://$GCS_BUCKET" \
  --member="$GCS_PRINCIPAL" \
  --role="roles/storage.objectViewer"
```

A Kubernetes service-account name alone is not enough to identify the principal. Conversely, matching namespace/service-account identities in clusters that share a workload identity pool can receive the same IAM access. Check that scope before granting access; see [GKE identity sameness](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/workload-identity#identity_sameness).

</details>

## 3. Verifying Access from the Workload {#verify-access-from-the-workload}

Saving an IAM binding does not prove the workload can use it. Select the intended compute in SQL Editor and read a known small Parquet file in the bucket:

```sql
SELECT * FROM parquet.`gs://<bucket-name>/sample.parquet` LIMIT 1;
```

For a Spark job, perform the equivalent read in that job on its selected data plane and namespace. The runtime must have its GCS connector and authentication configured. A successful read verifies that path for that workload, not write access or access from another data plane. A read from your laptop tests your local credentials instead.

If credentials are unavailable, check Workload Identity Federation on the cluster and the workload's node pool, the actual pod service account, and any impersonation binding. If access is denied, check the bucket principal and role. Application-supplied credentials can override the identity you expected from the Kubernetes account, so inspect the application's configured credential source as well.

<details id="permission-levels">
<summary>Choosing a role for write access or object administration</summary>

Choose the role required by the workload and grant it at bucket scope:

| Role | Purpose |
| --- | --- |
| **Storage Object Viewer** (`roles/storage.objectViewer`) | Read objects and list them. |
| **Storage Object User** (`roles/storage.objectUser`) | Read, create, update, and delete objects. |
| **Storage Object Admin** (`roles/storage.objectAdmin`) | Manage objects and their permissions. This is not full bucket administration. |

See [Cloud Storage IAM roles](https://docs.cloud.google.com/storage/docs/access-control/iam-roles) for the complete permission sets. Keep existing unrelated bucket bindings when adding access.

</details>
