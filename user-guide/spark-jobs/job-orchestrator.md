---
title: Job Orchestrator
description: Learn about the new Job Orchestrator for priority-based scheduling and resource-aware execution for Spark jobs on the IOMETE platform.
sidebar_label: Job Orchestrator
last_update:
   date: 11/07/2026
   author: Abhishek Pathania
---

import Img from '@site/src/components/Img';

# Job Orchestrator

## Overview

The **Job Orchestrator** is a new addition to IOMETE’s job management platform, designed to enable
- **Priority-based scheduling**: Prioritize business-critical jobs over routine workloads.
- **Quota-aware submission**: Keep jobs queued when their resource requirements exceed the available namespace quota.

---

## Key Features

### Priority-Aware Scheduling
Configure job priority (`High` or `Normal`) to influence submission order. The orchestrator maintains separate queues and allocates scheduling slots according to the [weighted scheduling share](#weighted-round-robin-scheduling-3120), so normal-priority jobs can still progress.

### Resource-Aware Execution
The orchestrator checks resource requirements against available namespace quota before submitting jobs. Passing this check does not reserve physical nodes or guarantee that Kubernetes can place every pod. Node capacity, selectors, taints and storage availability can still leave a submitted job Pending.

### FIFO Queue Processing
Within each priority queue, jobs are considered in **First-In-First-Out (FIFO) order**. This describes submission order, not a promise that one running job must finish before another can start.

**Queue behavior:**
- Scheduling slots are shared between the high and normal queues according to the configured weights.
- Within each queue, jobs are considered for submission in queue order; execution and completion times can differ.
- If the first job in queue cannot run due to resource constraints, subsequent jobs wait until resources become available or the blocking job completes.

### Per-Job Opt-In
Each job independently opts in or out via its **Deployment Flow** setting, allowing gradual migration and testing.

---

## Using the New Flow

### How to Enable

New Spark jobs created in the console use `Priority-Based` by default. To move an existing job:

1. Navigate to **Spark Jobs** and open the job's configuration.
2. Change **Deployment Flow** from `Legacy` to `Priority-Based`.
3. Select your **Priority**:
   - **High** - for time-sensitive, business-critical tasks
   - **Normal** - for regular data processing workloads

<Img src="/img/guides/spark-job/job-update-page-renamed.png" alt="Spark job form with Priority-Based selected as the deployment flow and Normal priority" />

:::tip
Start by testing the orchestrator with non-critical jobs before migrating production workloads.
:::

### How to Disable

Change **Deployment Flow** to `Legacy` in the job's configuration to opt out of orchestration for a specific job.

:::tip
To move all jobs in a domain back to the `Legacy` flow at once, use this API endpoint:

```bash
curl --location 'https://<IOMETE_URL>/api/v1/domains/<DOMAIN_NAME>/spark/jobs/migrate-from-prefect' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <TOKEN>' \
--data '{}'
```
Please replace: 
- `<IOMETE_URL>` with your actual IOMETE instance URL
- `<DOMAIN_NAME>` with the actual domain name
- `<TOKEN>` with your authentication token
:::

---

## Configuration

### Helm Chart Settings

The **control-plane release** (`iomete-data-plane-enterprise`) hosts the orchestrator's Prefect server. Each data plane runs workers in its service namespace and workload namespaces: the control-plane release configures the default data plane's workers, and an additional data plane's `iomete-lakehouse-runtime` release configures its own workers.

Set server options, database access and run cleanup in the control-plane release. Set worker batch size, resources and logging in the release that owns those workers; updating the control-plane values does not update workers in a separate runtime release. Keep each release's complete values file and namespace list when applying changes through [Life Cycle Management](/resources/deployment/life-cycle-management).

For example, the control-plane release's values can contain:

```yaml
services:
  jobOrchestrator:
    # Verbose (INFO-level) stdout logging for server/worker pods (default: false, i.e. ERROR-level)
    verboseLogging: false
    settings:
      # Maximum jobs deployed in a single batch
      batchSize: 20
      # Job run cleanup configuration
      jobRunCleanup:
        enabled: true
        # Retention period in seconds (default: 30 days)
        retentionPeriod: 2592000
```

#### Settings Reference

| Setting | Default | Since | Description |
|----------|---------|-------|-------------|
| `verboseLogging` | false | 3.19.0 | Enables verbose (INFO-level) stdout logging for job orchestrator server and worker pods. Leave disabled for reduced (ERROR-level) log volume. |
| `settings.batchSize` | 20 | 3.15.0 | Worker batch size; configure in each owning release. |
| `settings.jobRunCleanup.enabled` | true | 3.15.0 | Enable server-side cleanup of completed queue runs and logs; control-plane release only. |
| `settings.jobRunCleanup.retentionPeriod` | 2592000 | 3.15.0 | Server cleanup retention in seconds (30 days); control-plane release only. |

### S3 Log Storage [3.17.0+]

Job orchestrator logs can be persisted to S3-compatible object storage (Apache Ozone, Dell ECS, MinIO, etc.).

```yaml
services:
  jobOrchestrator:
    s3Logging:
      enabled: true  # disabled by default
      # Optional overrides — credentials and endpoint are derived from storage.s3CompatibleSettings
      # by default, or from the deprecated storage.minioSettings or storage.dellEcsSettings
      # when s3CompatibleSettings is not set.
      # Override only if using a separate bucket.
      # endpoint: "https://your-s3-endpoint"
      # accessKey: "your-access-key"
      # secretKey: "your-secret-key"
      # bucket: "your-bucket"
      # folderPath: "job-orchestrator-logs"
```

### SSL Database Connection [3.17.0+]

The **control-plane Prefect server** connects to PostgreSQL. In the 4.0 enterprise chart, encrypt and verify that connection with `database.ssl`, not the legacy `clusterDatabase.ssl` setting. `database.ssl` applies to every service of the control-plane release that connects to PostgreSQL, not only Prefect, so all of them must trust the CA that signed the database certificate.

These services check the database certificate against two files in the truststore Secret, `javaTrustStore.secretName` (default `java-truststore`) in the control-plane release's service namespace:

- **The Java truststore**, `javaTrustStore.fileName` (default `truststore.jks`), used by the Java services. Add your PostgreSQL CA to it as described in [Custom Java Truststore](/resources/deployment/truststore).
- **The PEM bundle** named by `javaTrustStore.caCertFileName`, used by the services that can't read the Java truststore, including the Prefect server.

The PEM bundle is shared. Several services use it as their only list of trusted CAs, so it must hold the public CAs as well as your private CAs, including the one that signed the PostgreSQL certificate:

| Service | Uses the PEM bundle to verify |
|---|---|
| Prefect server, `iom-ai-services` and `iom-mcp-server` | The PostgreSQL certificate, through `PGSSLROOTCERT` |
| `iom-socket` | The PostgreSQL certificate, through `sslrootcert` |
| `iom-gateway`, and the default data plane's `iom-gateway-dp` | The certificates of other planes it calls over HTTPS. The bundle replaces the system CAs. |
| The default data plane's Prefect workers | The object storage endpoint, when [S3 log storage](#s3-log-storage-3170) is on |

Don't point `caCertFileName` at a file that holds only the PostgreSQL CA. The gateways would then reject publicly signed certificates, and calls to data planes that use them would fail.

If the Secret already has a PEM bundle, keep its key and add the PostgreSQL CA to that bundle. Otherwise, build one from the system CAs and your CA, then write it to the Secret together with the files the Secret already holds, such as `truststore.jks`:

```shell
cat /etc/ssl/certs/ca-certificates.crt postgres-ca.crt > ca.crt

# Export truststore.jks first if you don't have the current copy:
kubectl get secret java-truststore --namespace iomete-system \
  -o jsonpath='{.data.truststore\.jks}' | base64 --decode > truststore.jks

kubectl create secret generic java-truststore \
  --namespace iomete-system \
  --from-file=truststore.jks --from-file=ca.crt \
  --dry-run=client -o yaml | kubectl apply --server-side -f -
```

Use server-side apply: with a full system CA bundle, the two files are too large for client-side `kubectl apply`, which fails with `metadata.annotations: Too long`.

Then merge these settings into the control-plane release's complete values file, keeping its other truststore settings, such as the password:

```yaml
javaTrustStore:
  enabled: true
  secretName: java-truststore
  caCertFileName: ca.crt # or the bundle key your Secret already uses

database:
  ssl:
    enabled: true
    mode: verify-full
```

Apply the change with the [upgrade procedure](/resources/deployment/life-cycle-management#upgrade-example). With `verify-full`, the database hostname in `database.host` must match its certificate. Afterwards, check that the `prefect-server` and `iom-socket` pods are ready and that every data plane still shows **Connected** on the **Data Planes** page of the Admin Portal.

If `services.jobOrchestrator.database.enabled` selects a custom connection-URL Secret, configure the TLS parameters in that URL as well; the generated database URL is not used in that case.

Workers on an additional data plane call the control-plane API rather than opening this PostgreSQL connection. Their runtime release's `database.ssl` settings concern that runtime's metastore, not the control-plane orchestrator database. Configure worker HTTPS trust separately when the control plane uses a private CA.

### System Properties

Configure queue behavior in **System Config**: open the **Admin Portal** from the user menu, then **System Config** under **Administration**.

| Property | Default | Since | Description |
|----------|---------|-------|-------------|
| `job-orchestrator.queue.high.scheduling-share-percentage` | 90 | 3.12.0 | Percentage of scheduling slots allocated to high-priority jobs. Remaining slots go to normal-priority jobs. |
| `job-orchestrator.queue.head-timeout-seconds` | 3600 | 3.15.0 | Time (seconds) a job can remain blocked at queue head before timeout action. |
| `job-orchestrator.queue.head-retry-count` | 0 | 3.15.0 | Number of retry attempts before cancelling a blocked job. Set to 0 for immediate cancellation after timeout. |

---

## Advanced Features

### Weighted Round Robin Scheduling [3.12.0+]

To prevent normal-priority job starvation, the orchestrator uses Weighted Round Robin (WRR) scheduling between priority queues.

**Default behavior (90/10 split):**
- 90% of scheduling slots go to high-priority jobs
- 10% go to normal-priority jobs

This ensures normal-priority jobs still progress even when the high-priority queue is busy.

### Queue Head Blocking Prevention [3.15.0+]

Jobs blocked at the queue head due to quota limits are now automatically retried or cancelled after configurable thresholds. This prevents a single resource-intensive job from indefinitely blocking the entire queue.

**How it works:**
1. When a job at queue head cannot be scheduled due to quota limits, the timeout counter starts.
2. After `head-timeout-seconds` elapses, the system retries scheduling (if `head-retry-count > 0`).
3. After exhausting retries, the job is automatically cancelled with a clear reason.

### Job Queue Visibility [3.15.0+]

Job details now show the specific resource blocking deployment when a job is waiting in the queue:
- **CPU** - Insufficient CPU quota
- **Memory** - Insufficient memory quota
- **Pods** - Pod count limit reached
- **Storage** - Storage quota exceeded

The UI also displays queue timeout retries, cancellation reasons, and reschedule events.

<Img src="/img/guides/spark-job/job-queue-reason.png" alt="Job queue visibility" />

### Scheduling Reliability [3.15.0+]

Jobs incorrectly scheduled due to stale quota data are now automatically retried. This reduces failures caused by timing mismatches between quota checks and actual resource allocation.

### Cleanup & Maintenance [3.15.0+]

The orchestrator automatically cleans up completed queue runs and logs to prevent unbounded data growth. Configure retention via `jobRunCleanup` settings in Helm values.

---

## How to Troubleshoot Common Issues

### 1. Job Orchestrator Won't Start - PostgreSQL Extension Error

**Error Message:**
```text
sqlalchemy.exc.DBAPIError: (sqlalchemy.dialects.postgresql.asyncpg.Error)
<class 'asyncpg.exceptions.FeatureNotSupportedError'>: extension "pg_trgm"
is not allow-listed for users in Azure Database for PostgreSQL
HINT: to learn how to allow an extension or see the list of allowed extensions,
please refer to https://go.microsoft.com/fwlink/?linkid=2301063
[SQL: CREATE EXTENSION IF NOT EXISTS pg_trgm;]
(Background on this error at: https://sqlalche.me/e/20/dbapi)
```

**Cause:** The Job Orchestrator uses the `pg_trgm` extension for partial string search functionality in the database.

**Solution:** Enable the extension in your PostgreSQL database:
[Allow extensions in Azure PostgreSQL](https://go.microsoft.com/fwlink/?linkid=2301063)

### 2. Jobs Stuck in Queue Due to Resource Constraints

**Problem:** Jobs remain queued even when cluster appears to have available resources.

**Potential Causes:**
- The job at the queue head requires more quota than remains in its target namespace.
- Another workload consumes the available quota, even when some nodes have spare capacity.
- Quota usage has not yet reflected recently terminated workloads.

If the job was submitted but its pods are Pending, inspect Kubernetes scheduling events for node capacity, selectors, taints or volume problems. That is different from being held in the orchestrator queue.

**Automatic Handling (3.15.0+):**

Starting from version 3.15.0, the orchestrator automatically handles blocked jobs:
1. Jobs blocked at queue head are monitored via `head-timeout-seconds` (default: 1 hour)
2. After timeout, the system retries based on `head-retry-count` setting
3. If retries are exhausted, the job is automatically cancelled with a clear reason
4. The UI shows which resource (CPU, memory, pods, storage) is blocking deployment

**Manual Solutions:**
- Check the job details page to see which resource is blocking deployment
- Monitor cluster capacity through Grafana dashboards
- Adjust job resource requests or namespace quotas as appropriate. Adding nodes alone does not increase a ResourceQuota limit.
- Changing a job to `Legacy` bypasses the orchestrator queue, but does not remove Kubernetes quotas or scheduling constraints.

### 3. All Jobs Stuck Due to One Problematic Job

:::info Automatic Resolution (3.15.0+)
With Queue Head Blocking Prevention enabled, this issue is now handled automatically. Jobs that cannot be scheduled are retried or cancelled after the configured timeout, preventing queue blockage.
:::

**Manual Fix (if needed):**
1. Navigate to the problematic job's configuration page
2. Change the **Deployment Flow** from `Priority-Based` to `Legacy`
3. This removes the job from the orchestrator queue and allows other jobs to proceed
4. Debug the problematic job separately before re-enabling orchestration