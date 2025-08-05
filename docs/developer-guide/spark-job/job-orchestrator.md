import Img from '@site/src/components/Img';

# Job Orchestrator [Beta]

## Overview

The **Job Orchestrator** is a new addition to IOMETE’s job management platform, designed to enable
- **Priority-based scheduling**: Prioritize business-critical jobs over routine workloads.
- **Resource-aware execution**: Submit jobs only when sufficient cluster resources are available.
- **Built-in observability**: Gain real-time visibility into job execution and resource usage.

---

## Key Features

### Priority-Aware Scheduling
Easily configure job priority (`High` vs `Normal`) to ensure critical jobs are executed first. The system maintains separate queues for each priority level, with high-priority jobs always processed before normal-priority ones.

### Resource-Aware Execution
Jobs are submitted **only when cluster capacity is available**, reducing the chances of failure due to insufficient compute resources. The orchestrator continuously monitors CPU & memory availability before scheduling job execution.

### FIFO Queue Processing
Within each priority level, jobs are processed in **First-In-First-Out (FIFO) order**. The system will process the first job in the queue completely before moving to the next job, even if resources are available for subsequent jobs.

**Queue behavior:**
- High-priority queue is always processed before normal-priority queue.
- Within each queue, jobs execute in the order they were submitted.
- If the first job in queue cannot run due to resource constraints, subsequent jobs wait until resources become available or the blocking job completes.

### Integrated Monitoring
Includes a Prometheus exporter and ready-to-use Grafana dashboard to track:
- Cluster usage trends per namespace, domain, priority & job.
- Job wait times by priority level.
- Resource allocation patterns.

### Flexible Enable/Disable Options
You can opt in or out at the **system level** or **individual job level**, allowing gradual migration and testing.

---

## Using the New Flow

### How to Enable

#### Enable First at the System Level
In your Helm `values.yaml`, set:
```yaml
jobOrchestrator:
  enabled: true
```
This will deploy the orchestrator server, workers, and metrics exporter components across your IOMETE deployment.

#### Then at a Job Level
1. Navigate to **Spark Jobs** and create a new job or configure an existing one.
2. Go to **Advanced Settings** section
3. Change **Deployment Flow** from `Legacy` to `Prefect`
4. Select your **Priority**:
   - **High** - for time-sensitive, business-critical tasks
   - **Normal** - for regular data processing workloads

<Img src="/img/guides/spark-job/job-update-page.png" alt="Job Update Page" />

:::tip
Start by testing the orchestrator with non-critical jobs before migrating production workloads.
:::

### How to Disable

#### At the job level
Change `Deployment Flow` back to `Legacy` in the job's advanced settings to opt out of orchestration for specific jobs.

#### At the system level
Set `jobOrchestrator.enabled: false` in your Helm values to disable orchestration platform-wide.

:::note
Before disabling the flag, please move all jobs back to the `Legacy` flow at once by using  this API endpoint:

```bash
curl --location 'https://<IOMETE_URL>/api/v1/domains/<DOMAIN_NAME>/spark/jobs/migrate-from-prefect' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <TOKEN>' \
--data '{}'
```
Please replace: 
- `<IOMETE_URL>` with your actual IOMETE instance URL
- `<DOMAIN_NAME>` with the actual domain name.
- `<TOKEN>` with your authentication token.
:::

---

## Monitoring

Monitoring is enabled out-of-the-box with a complete observability stack:

**Components:**
- **Metrics Exporter** - Deployed alongside the orchestrator to collect performance data.
- **Prometheus Integration** - Scrapes metrics for storage and alerting.
- **Grafana Dashboards** - Pre-built visualizations for job resources usage & run metrics.

<Img src="/img/guides/spark-job/job-metrics-monitoring-graphs.png" alt="Job Monitoring Graph" />

### Custom Prometheus Setup

If you have your own **Prometheus** installation, add this scrape configuration:

```yaml
# Job Orchestrator Metrics
- job_name: 'job-orchestrator-metrics'
  scrape_interval: 30s
  kubernetes_sd_configs:
    - role: pod
      namespaces:
        names:
          - {{ .Release.Namespace }}
  metrics_path: /metrics
  relabel_configs:
    - source_labels: [__meta_kubernetes_pod_label_app]
      regex: iom-job-orchestrator-metrics-exporter
      action: keep
```
:::note
By default, metrics from the `iom-job-orchestrator-metrics-exporter` are exposed on port `8000`.
:::

---

## How to Troubleshoot Common Issues

### 1. Prefect Server Won't Start - PostgreSQL Extension Error

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

**Cause:** Prefect uses the `pg_trgm` extension for partial string search functionality in the database.

**Solution:** Enable the extension in your PostgreSQL database: 
🔗 [Allow extensions in Azure PostgreSQL](https://go.microsoft.com/fwlink/?linkid=2301063)

### 2. Jobs Stuck in Queue Due to Resource Constraints

**Problem:** Jobs remain queued even when cluster appears to have available resources.

**Potential Causes:**
- First job in queue requires more resources than currently available.
  - FIFO processing means subsequent jobs wait for the first job to complete.
- Resource fragmentation across different node types.

**Solutions:**
- Check resource requirements of the first job in queue.
- Monitor cluster capacity through Grafana dashboards.
- Consider adjusting job resource requirements or scaling cluster capacity.
- Temporarily change problematic jobs to `Legacy` deployment flow to unblock the queue.

### 3. All Jobs Stuck Due to One Problematic Job

**Quick Fix:**
1. Navigate to the problematic job's configuration page
2. Change the **Deployment Flow** from `Prefect` to `Legacy`
3. This removes the job from the orchestrator queue and allows other jobs to proceed
4. Debug the problematic job separately before re-enabling orchestration
