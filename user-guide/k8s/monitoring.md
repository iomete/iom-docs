---
title: Monitoring - Grafana Dashboards
sidebar_label: Monitoring
description: Configure Prometheus collection and Grafana dashboards for IOMETE services and Spark workloads across data planes and Kubernetes namespaces.
last_update:
  date: 11/05/2026
  author: IOMETE
---
import Img from '@site/src/components/Img';

IOMETE provides [Grafana dashboards](https://github.com/iomete/on-prem-deployment/tree/main/observability/monitoring/grafana) for platform services, Spark operators, and Spark workloads. Three parts must work together: IOMETE exposes metrics, **Prometheus** collects and stores them, and **Grafana** queries Prometheus to draw the dashboards.

A data plane runs compute workloads in one or more Kubernetes namespaces. The shared control plane manages those data planes. Monitoring therefore needs to cover both the control-plane services and the namespaces where each data plane runs its services and workloads. See [IOMETE Architecture](/resources/getting-started/architecture) for the relationship between these components.

## Prerequisites

Before changing IOMETE settings, identify:

- A running Prometheus installation with permission and network access to discover and scrape the required Kubernetes namespaces.
- A running Grafana installation with a working Prometheus data source and permission to import dashboards.
- The Kubernetes cluster, Helm release, service namespace, and workload namespaces for each IOMETE installation you want to monitor.

For example, one cluster might contain the control plane in `iomete-system`, an additional data plane named `dp-2` with services in `iomete-dp-2`, and its workloads in `dp2-analytics` and `dp2-batch`. Prometheus must discover all four namespaces to cover those services and workloads. A second data plane does not require a second Grafana installation.

### Enabling Monitoring

Add this setting to the complete values file for the release you are updating:

```yaml
monitoring:
  enabled: true
```

Enable it on the **control-plane release** to expose the monitoring dashboard settings in IOMETE and generate links to workload metrics. Enable it on each **additional runtime release** where you want the chart's Spark operator scrape annotations. Preserve the release's existing configuration and follow the [upgrade procedure](/resources/deployment/life-cycle-management#upgrade-example).

In the IOMETE **4.0.1 enterprise and runtime charts**, this setting adds Prometheus annotations to the applicable pod templates. It does **not** install Prometheus, Grafana, `ServiceMonitor` or `PodMonitor` resources, or dashboard ConfigMaps. These charts have no `serviceMonitor.enabled` or `podMonitor.enabled` setting. Check the values and templates for your installed chart version before using instructions for a different monitoring stack.

Metrics endpoints and scraping are separate. Some endpoints, including the Spark operator's metrics endpoint, are enabled independently of this flag. An annotation only helps when your Prometheus configuration actually reads it.

After upgrading, check the annotations on the deployments. Replace `your-kubernetes-context` with the context for the example cluster; adjust the namespace and deployment names for your installation:

```bash
IOMETE_CONTEXT=your-kubernetes-context

kubectl --context "$IOMETE_CONTEXT" -n iomete-system \
  get deployment iom-core \
  -o jsonpath='{.spec.template.metadata.annotations}{"\n"}'

kubectl --context "$IOMETE_CONTEXT" -n iomete-dp-2 \
  get deployment spark-operator \
  -o jsonpath='{.spec.template.metadata.annotations}{"\n"}'
```

Expect `prometheus.io/scrape: true`, with `/q/metrics` for the core service and `/metrics` for the Spark operator. This confirms the chart configuration; it does not yet prove that Prometheus is collecting samples.

### Configuring Prometheus Collection

Use the discovery mechanism supported by your monitoring installation:

| Setup | What You Configure |
| --- | --- |
| Prometheus Operator | Create or supply appropriate `ServiceMonitor` or `PodMonitor` resources. Their selectors, namespaces, endpoint paths, and ports must match the targets. The Prometheus resource must also select those monitors and their namespaces. See the [Operator's setup guide](https://prometheus-operator.dev/docs/developer/getting-started/). |
| Prometheus with Kubernetes service discovery | Configure scrape jobs for the required namespaces and endpoints. If you use annotations, configure relabeling to interpret them and resolve the annotated ports; Prometheus does not read them automatically. |
| Separate IOMETE monitoring chart | Configure that chart's discovery scope. Its `iometeSystemNamespace` and `dataPlaneNamespaces` values belong to the monitoring chart, not the enterprise or runtime release. Check the values for your monitoring chart version. |

For the separate IOMETE monitoring chart, the example scope is:

```yaml
# Values for the monitoring chart only.
iometeSystemNamespace: iomete-system
dataPlaneNamespaces:
  - iomete-dp-2
  - dp2-analytics
  - dp2-batch
```

Include any other default-plane or additional-plane workload namespaces as well. Namespace discovery also requires matching Kubernetes RBAC and network access. For data planes in other Kubernetes clusters, configure collection in those clusters and make the resulting metrics available to Grafana.

In Prometheus, open the target status page and confirm that the expected service, operator, and running Spark driver targets are **UP**. The job dashboard needs samples from the driver's `/metrics/executors/prometheus` endpoint, with `namespace` and `pod` labels identifying the workload namespace and driver pod. Its queries use metrics such as `metrics_executor_memoryUsed_bytes`; an UP target with different metric names or labels will still produce empty panels.

## Deploying Grafana Dashboards

Dashboard provisioning is a Grafana configuration task. Installing Prometheus Operator or enabling IOMETE monitoring does not, by itself, import dashboards into Grafana.

### Using Prometheus Operator {#for-prometheus-operator-setup}

Some monitoring stacks bundle Grafana with a **dashboard sidecar**: a container that watches labeled ConfigMaps and copies their JSON files into Grafana's dashboard directory. Automatic discovery works only when that sidecar is enabled, the ConfigMaps match its label selector, and it can read their namespaces. Check those settings in your Grafana chart. The Prometheus Operator itself does not perform this import.

The separate IOMETE monitoring chart uses another approach: it mounts its bundled dashboard ConfigMaps into Grafana and supplies file-provisioning configuration. An unrelated Grafana installation will not discover those ConfigMaps automatically. For details of file provisioning, see [Grafana's provisioning guide](https://grafana.com/docs/grafana/latest/administration/provisioning/#dashboards).

### Importing Dashboards Manually {#for-non-prometheus-operator-setup}

Manual import works with or without Prometheus Operator:

1. Download the JSON file for a dashboard listed below. On GitHub, use the raw file or download action, rather than saving the surrounding web page.
2. In Grafana, open **Dashboards → Import** and upload the JSON file.
3. Select the Prometheus data source that contains the desired cluster's metrics, then import.
4. Open the dashboard, select its namespace and other filters, and choose a time range containing collected samples.

A successful import adds the dashboard to Grafana. Confirm that at least one expected service or running workload has data before configuring IOMETE's dashboard links.

### Selecting a Cluster, Data Plane, and Namespace

The linked dashboard JSON files provide a Prometheus data-source selector and namespace filters. They do **not** provide a built-in data-plane or cluster selector.

| Dashboard | What to Select |
| --- | --- |
| IOMETE Service Dashboard | The namespace of the JVM services, such as `iomete-system`, then the service. |
| Spark Operator Dashboard | The namespace represented by the operator metrics. Check the metric's actual labels, especially if your scrape configuration also adds a namespace label. |
| IOMETE Job Metrics Dashboard | The workload namespace, such as `dp2-analytics`, then the Spark driver pod. Repeat with `dp2-batch` for workloads there. |

When multiple clusters reuse namespace or pod names, select a data source restricted to the intended cluster. If your Prometheus data source combines clusters, add a cluster label, dashboard variable, and matching filters to **all relevant queries** before relying on it for comparison. A namespace name alone does not identify a cluster, and selecting `dp-2` is not a substitute for selecting its workload namespace.

## Grafana Dashboards

### IOMETE Service Dashboard

The [IOMETE Service Dashboard JSON](https://github.com/iomete/on-prem-deployment/blob/main/observability/monitoring/grafana/iom-quarkus-micrometer-service-dashboard.json) covers JVM/Quarkus service metrics, including request rates, JVM memory, and database connection pools. Use it for services such as IOMETE Core, SQL, and Identity when their metrics are collected. It is not a dashboard for every component or for Spark executors.

#### Installing the IOMETE Service Dashboard {#to-install-the-iomete-service-dashboard}

Import the JSON using the steps above. Select the Prometheus data source, enter the service namespace, and select a service. The supplied dashboard defaults to `iomete-system`; change this if your control plane uses another namespace.

<Img src="/img/k8s/monitoring/iomete-service-dashboard.png"
caption="IOMETE Service Dashboard"
alt="IOMETE Service Dashboard"/>

### Spark Operator Dashboard

The [Spark Operator Dashboard JSON](https://github.com/iomete/on-prem-deployment/blob/main/observability/monitoring/grafana/iom-spark-operator-detailed-dashboard.json) shows operator activity, including application submissions and failures. Import it using the same procedure, then select the correct data source and namespace.

Dashboard queries depend on the metrics exposed by your operator version. If a panel is empty, check whether its metric, such as `spark_app_submit_count`, exists in Prometheus before changing the dashboard filters.

<Img src="/img/k8s/monitoring/spark-operator.png"
caption="Spark Operator Dashboard"
alt="Spark Operator Dashboard"/>

### IOMETE Job Metrics Dashboard

The job dashboard shows executor counts, completed and failed tasks, garbage collection, shuffle activity, and memory use for a Spark workload. You can select the workload namespace and driver directly in Grafana, or open **Metrics** from a job run in IOMETE.

<Img src="/img/k8s/monitoring/spark-job-metrics-link.png"
caption="Spark Job - Metrics Link"
alt="Spark Job - Metrics Link"/>

IOMETE adds the run's namespace, driver pod, and time range to the configured dashboard URL. It does not automatically select a cluster or Prometheus data source. Check those filters when opening a run from another cluster.

<Img src="/img/k8s/monitoring/spark-job-dashboard.png"
caption="Spark Job - Grafana Dashboard"
alt="Spark Job - Grafana Dashboard"/>

The panels show collected samples. Their freshness depends on the Prometheus scrape interval and Grafana's refresh interval; they are not a continuous record of every Spark event.

:::note Short-Running Spark Jobs

A short job can finish before Prometheus discovers and scrapes its driver. Some queries also need more than one sample. There is no universal one- or two-minute threshold: discovery delay, scrape interval, and the query determine what appears.

<Img src="/img/k8s/monitoring/short-running-spark-job.png"
caption="Short-Running Spark Job"
alt="Short-Running Spark Job"/>

<Img src="/img/k8s/monitoring/spark-job-dashboard-for-short-running-job.png"
caption="Short-Running Spark Job - Grafana Dashboard"
alt="Short-Running Spark Job - Grafana Dashboard"/>

An empty dashboard does not prove that a job is optimized or that it ran without problems. Check the run status, logs, and Spark UI or History Server when available. Confirm the dashboard's time range and Prometheus retention. A shorter scrape interval may capture more detail in future runs, at the cost of collection and storage load; it cannot recover samples that were never collected.
:::

#### Setting Up the Job Metrics Dashboard

1. Import the [IOMETE Job Metrics Dashboard JSON](https://github.com/iomete/on-prem-deployment/blob/main/observability/monitoring/grafana/iom-job-metrics-dashboard.json), selecting the appropriate Prometheus data source.

   <Img src="/img/k8s/monitoring/spark-job-grafana-import-1.png"
   caption="Spark Job - Grafana Dashboard Import 1"
   alt="Spark Job - Grafana Dashboard Import 1"/>

   <Img src="/img/k8s/monitoring/spark-job-grafana-import-2.png"
   caption="Spark Job - Grafana Dashboard Import 2"
   alt="Spark Job - Grafana Dashboard Import 2"/>

2. Copy the imported dashboard's URL. Remove any existing job-specific namespace, driver, or time-range parameters; IOMETE supplies them when you open a run.

   <Img src="/img/k8s/monitoring/spark-job-grafana-dashboard-url.png"
   caption="Spark Job Grafana Dashboard - Copy URL"
   alt="Spark Job Grafana Dashboard - Copy URL"/>

3. With the **Administration Manager** role, open **Settings → System Config** and set `spark-application.job.metrics-dashboard-url` to that URL. This is a shared control-plane setting, not a separate URL per data plane. If the key is missing, confirm that monitoring is enabled on the control-plane release.

   <Img src="/img/k8s/monitoring/metrics-dashboard-url-setting-1.png"
   caption="Spark Job Grafana Dashboard Settings 1"
   alt="Spark Job Grafana Dashboard Settings 1"/>

   <Img src="/img/k8s/monitoring/metrics-dashboard-url-setting-2.png"
   caption="Spark Job Grafana Dashboard Settings 2"
   alt="Spark Job Grafana Dashboard Settings 2"/>

4. Open **Metrics** for a run with collected samples. Confirm that the URL selects the run's workload namespace and driver, and that the Grafana data source contains metrics from the right cluster.

For the separate links on the admin portal's Monitoring page, see [External Grafana Dashboards](../monitoring/overview.md#external-grafana-dashboards).

## Troubleshooting

Check the stages in order: target discovery, sample collection, dashboard query, then the IOMETE link.

| Symptom | Check |
| --- | --- |
| No Prometheus target | Confirm namespace discovery, Kubernetes RBAC, monitor selectors or annotation relabeling, and the endpoint path and port. Enabling `monitoring.enabled` alone does not create a scrape job. |
| Target is DOWN | Inspect the target's scrape error. Check connectivity, network policies, authentication where required, and whether the metrics endpoint is listening. |
| Target is UP but panels are empty | Query the panel's metric directly in Prometheus. Check its labels, the Grafana data source, namespace, driver, time range, and retention. Operator and Spark versions can change available metrics. |
| Results combine unrelated workloads | Check whether the data source spans clusters with repeated namespace or pod names. Add cluster-aware queries or select a cluster-specific data source. |
| Dashboard did not appear automatically | Check Grafana provisioning or the sidecar's labels, watched namespaces, and permissions. Alternatively, import the JSON manually. |
| Dashboard import fails | Check Grafana permissions and that the downloaded file is dashboard JSON. Review the import error for unsupported panels or data-source settings. |
| Metrics link is missing or points to the wrong dashboard | Check control-plane `monitoring.enabled` and the shared `spark-application.job.metrics-dashboard-url` value. Confirm that users can reach and sign in to Grafana. |
| Short job has no samples | Check the run's status and logs, discovery and scrape intervals, and the dashboard time range. Use Spark UI or History Server when available for additional execution details. |
