---
title: Monitoring - Grafana Dashboards
sidebar_label: Monitoring
description: Collect IOMETE service and Spark metrics with Prometheus, import the IOMETE Grafana dashboards, and link them from the console, with your own monitoring stack or the IOMETE monitoring chart.
last_update:
  date: 11/07/2026
  author: Vusal Dadalov
---
import Img from '@site/src/components/Img';

IOMETE services and Spark workloads publish metrics in the Prometheus format. Three parts work together to turn them into dashboards: IOMETE exposes the metrics, **Prometheus** collects and stores them, and **Grafana** queries Prometheus and draws the dashboards.

You can run Prometheus and Grafana in one of two ways:

- **Your own Prometheus and Grafana.** This is the main path on this page: enable monitoring, configure Prometheus collection, import the IOMETE dashboards, and link the job dashboard from IOMETE.
- **The IOMETE monitoring chart**, `iomete-monitoring-chart`. It installs Prometheus and Grafana next to the control plane, collects IOMETE metrics, and loads the IOMETE dashboards. The console's default Grafana links expect this chart. See [Using the IOMETE Monitoring Chart](#using-the-iomete-monitoring-chart).

The examples use one Kubernetes cluster. The control-plane release `data-plane` installs the services of the control plane and of the default data plane, `default`, into the service namespace `iomete-system`. An additional data plane, `analytics`, runs its services in `iomete-analytics` and its workloads in the workload namespaces `finance` and `marketing`. See [IOMETE Architecture](/resources/getting-started/architecture) for how these parts fit together.

## Prerequisites

Before you start, you need:

- A Prometheus installation that can discover and scrape the example's namespaces: `iomete-system`, `iomete-analytics`, `finance`, and `marketing`. It needs Kubernetes permissions (RBAC) to discover the pods there, and the network policies in those namespaces must let it connect.
- A Grafana installation with a data source for that Prometheus, and permission to import dashboards.
- Helm and `kubectl` access to the cluster, with permission to upgrade the control-plane release.
- An IOMETE account with the **Administration Manager** admin role, to link the job dashboard.

## Enabling Monitoring

The `monitoring.enabled` Helm value defaults to `false` in both IOMETE charts: `iomete-data-plane-enterprise` for the control-plane release, and `iomete-lakehouse-runtime` for the runtime release of an additional data plane. In IOMETE 4.0.1, setting it to `true` has these effects:

- **Control-plane release:** adds Prometheus scrape annotations to the IOMETE JVM services, such as `iom-core`, `iom-sql`, `iom-identity`, `iom-cluster`, and `iom-rest-catalog`, and to the default data plane's Spark operator. It also adds the Grafana dashboard links to System Config and turns on the **Metrics** links of Spark job runs and computes.
- **Runtime release of an additional data plane:** adds scrape annotations to that data plane's Spark operator.

The flag doesn't install Prometheus, Grafana, `ServiceMonitor` or `PodMonitor` resources, or dashboards, and the metrics endpoints answer whether or not it's set. The Spark drivers of computes and jobs carry scrape annotations with or without it.

To enable monitoring on the control-plane release and keep its other settings:

1. Find the chart version that the release runs:

   ```bash
   KUBE_CONTEXT=your-kubernetes-context
   helm --kube-context "$KUBE_CONTEXT" -n iomete-system list --filter '^data-plane$'
   ```

   Replace `your-kubernetes-context` with the context of the example cluster. The **CHART** column shows the version, for example `iomete-data-plane-enterprise-4.0.1`.

2. Save the release's current values:

   ```bash
   IOMETE_VERSION=4.0.1
   helm --kube-context "$KUBE_CONTEXT" -n iomete-system \
     get values data-plane -o yaml > data-plane-values.yaml
   ```

   Set `IOMETE_VERSION` to the version from step 1, so that the upgrade changes nothing else. The file can contain credentials, so keep it private.

3. Open `data-plane-values.yaml` and set the value. If the file already has a `monitoring` section, change `enabled` there instead of adding a second section.

   ```yaml
   monitoring:
     enabled: true
   ```

4. Upgrade the release:

   ```bash
   helm --kube-context "$KUBE_CONTEXT" -n iomete-system upgrade data-plane \
     iomete/iomete-data-plane-enterprise --version "$IOMETE_VERSION" \
     -f data-plane-values.yaml
   ```

   The command uses the `iomete` chart repository from the [installation guide](/resources/deployment/on-prem/install). If Helm can't find the version, run `helm repo update` and try again. Helm reports `STATUS: deployed`, and the annotated services restart with the new setting.

5. Check the annotation on `iom-core`:

   ```bash
   kubectl --context "$KUBE_CONTEXT" -n iomete-system get deployment iom-core \
     -o jsonpath='{.spec.template.metadata.annotations.prometheus\.io/path}{"\n"}'
   ```

   Expected output: `/q/metrics`. In the admin portal, **Administration → System Config** now lists `spark-application.job.metrics-dashboard-url`, `external-grafana.service-availability.dashboard-url`, and `external-grafana.alerting-rules.dashboard-url`.

The `analytics` runtime release needs the flag only if your Prometheus finds targets through the annotations. To set it, repeat steps 1 to 4 for release `analytics` in namespace `iomete-analytics`, with chart `iomete/iomete-lakehouse-runtime`.

## Configuring Prometheus Collection

Configure your Prometheus to scrape these endpoints. The ports are container ports of the pods:

| Metrics | Pods Run In | Port and Path |
| --- | --- | --- |
| IOMETE JVM services, such as `iom-core` | The control-plane release's service namespace, `iomete-system` | `8080` (named `http`), `/q/metrics` |
| Spark operator | Each data plane's service namespace: `iomete-system` for `default`, `iomete-analytics` for `analytics` | `10254` (named `metrics`), `/metrics`. The `spark-operator-webhook` Service exposes the same port. |
| Spark drivers of computes and jobs | Workload namespaces, such as `finance` and `marketing` | `4040` (named `spark-ui`), `/metrics/executors/prometheus` |

The dashboards filter on labels that Prometheus adds when it scrapes, not on labels inside the metrics:

- The [IOMETE Service Dashboard](#iomete-service-dashboard) needs `namespace`, and `service` set to the service name, such as `iom-core`. IOMETE service pods carry a `service` label with that name that your relabeling can copy, and a `ServiceMonitor` on the IOMETE Services sets the same value.
- The [IOMETE Job Metrics Dashboard](#iomete-job-metrics-dashboard) needs `namespace`, and `pod` set to the driver pod name.

Set up collection with the mechanism your Prometheus uses:

- **Prometheus Operator:** create `ServiceMonitor` resources for the IOMETE services' Services and the `spark-operator-webhook` Service, and a `PodMonitor` for pods labeled `spark-role: driver` in the workload namespaces, with the ports and paths above. The `Prometheus` resource must select these monitors and their namespaces.
- **Kubernetes service discovery in the Prometheus configuration:** add scrape jobs for these namespaces, with relabeling that keeps the right port and sets the labels above.

For a data plane in another Kubernetes cluster, collect its metrics in that cluster and make them available to Grafana, for example as a separate data source.

<details>
<summary>If you discover targets through the IOMETE annotations</summary>

Prometheus doesn't read `prometheus.io/*` annotations by itself; your relabeling rules apply them. In IOMETE 4.0.1:

- `prometheus.io/port` holds a port **name**, `http` or `metrics`, on the services and operators, and a number, `4040`, on Spark drivers. Rules that accept only port numbers don't resolve the names.
- Two annotations point at a port that the pod doesn't have. `spark-operator-submit-service` is annotated with port `metrics`, but it serves `/metrics` on its `http` port, `7070`. In the control-plane release, `spark-proxy-server-iomete-system` is annotated with `/q/metrics` on port `http`, but it serves `/metrics` on its `metrics` port, `9090`. Skip these targets or scrape their actual ports; the IOMETE dashboards don't use them.
- `prometheus.io/interval` suggests 15 seconds. Your Prometheus configuration sets the actual scrape interval.

</details>

To check collection, open the target page in the **Status** menu of Prometheus: the service, operator, and running driver targets should be **UP**. Then run these queries in Prometheus:

| Query | Expected Result |
| --- | --- |
| `count by (service) (http_server_requests_seconds_count{namespace="iomete-system"})` | One row for each IOMETE service, such as `iom-core`. A single row without a `service` value means the `service` label is missing. |
| `sum(spark_application_running_count)` | The number of running Spark applications. |
| `count by (pod) (metrics_executor_memoryUsed_bytes{namespace="finance"})` | One row for each running driver in `finance`. |

If a query returns nothing, see [Troubleshooting](#troubleshooting).

## Deploying Grafana Dashboards

The IOMETE dashboards are JSON files in the [`iomete/on-prem-deployment`](https://github.com/iomete/on-prem-deployment/tree/main/observability/monitoring/grafana) repository on GitHub. The repository is archived, so these files no longer change:

| Dashboard | What It Shows | With IOMETE 4.0.1 |
| --- | --- | --- |
| [IOMETE Service Dashboard](https://github.com/iomete/on-prem-deployment/blob/main/observability/monitoring/grafana/iom-quarkus-micrometer-service-dashboard.json) | HTTP, JVM, and database connection-pool metrics of one IOMETE JVM service | Works |
| [IOMETE Job Metrics Dashboard](https://github.com/iomete/on-prem-deployment/blob/main/observability/monitoring/grafana/iom-job-metrics-dashboard.json) | Executors, tasks, garbage collection, shuffle, and memory of one Spark driver | Works |
| [Spark Operator Dashboard](https://github.com/iomete/on-prem-deployment/blob/main/observability/monitoring/grafana/iom-spark-operator-detailed-dashboard.json) | Spark operator activity | Stays empty. See [Spark Operator Dashboard](#spark-operator-dashboard). |

Importing dashboards is a Grafana task. It doesn't depend on Prometheus Operator or on `monitoring.enabled`.

### Importing Dashboards Manually {#for-non-prometheus-operator-setup}

1. Download the dashboard's JSON file. On GitHub, use the raw file or the download button, rather than saving the web page.
2. In Grafana, open the dashboard import page (**Dashboards → New → Import** in recent versions) and upload the file. If the upload fails, paste the file's contents into the page's JSON text box instead.

   <Img src="/img/k8s/monitoring/spark-job-grafana-import-1.png"
   caption="Pasting the dashboard JSON"
   alt="Grafana Import dashboard page with the IOMETE - Spark Job Metrics JSON pasted into the JSON text box"/>

3. Click **Load**, check the name, folder, and UID, and click **Import**. The form doesn't ask for a data source, because the IOMETE dashboard files declare no import inputs.

   <Img src="/img/k8s/monitoring/spark-job-grafana-import-2.png"
   caption="Import options"
   alt="Grafana import options with the Name, Folder, and UID fields and no data source field"/>

4. Open the dashboard and choose your Prometheus data source in **Prometheus Data Source** at the top. Then choose the namespace and the other filters, and a time range that has collected data.
5. Save the dashboard. In the save dialog, choose to update the default variable values, so that the selected data source becomes the dashboard's default. IOMETE's **Metrics** links don't choose a data source.

Expected result: the dashboard is in Grafana's dashboard list, and its panels show data for a running service or workload.

<details id="for-prometheus-operator-setup" style={{scrollMarginTop: 'calc(var(--ifm-navbar-height) + 0.5rem)'}}>
<summary>Alternative: Provisioning dashboards from ConfigMaps</summary>

Use this instead of manual import if your Grafana loads dashboards from labeled ConfigMaps through a dashboard sidecar, as installations from the Grafana Helm chart can. The Prometheus Operator doesn't import dashboards by itself.

1. Find the label and the namespaces that the sidecar watches. In the Grafana Helm chart, they're the `sidecar.dashboards.label`, `sidecar.dashboards.labelValue`, and `sidecar.dashboards.searchNamespace` values. This example uses the label `grafana_dashboard=1` and Grafana's namespace, `monitoring`.
2. Create a ConfigMap from the downloaded file, and label it:

   ```bash
   kubectl --context "$KUBE_CONTEXT" -n monitoring create configmap iomete-job-metrics-dashboard \
     --from-file=iom-job-metrics-dashboard.json
   kubectl --context "$KUBE_CONTEXT" -n monitoring label configmap iomete-job-metrics-dashboard \
     grafana_dashboard=1
   ```

3. Wait for the sidecar to load the file, then open the dashboard in Grafana. If it doesn't appear, check the sidecar container's logs.
4. Check which data source the dashboard selects. IOMETE's **Metrics** links open the dashboard with that data source.

</details>

### Selecting a Cluster, Data Plane, and Namespace

The IOMETE dashboards have a data-source selector and namespace filters, but no cluster or data-plane selector:

| Dashboard | What to Select |
| --- | --- |
| IOMETE Service Dashboard | In **Namespace**, the control-plane release's service namespace, `iomete-system`. Then the service, in **IOMETE Quarkus Service**. |
| IOMETE Job Metrics Dashboard | In **Namespace**, the workload namespace, such as `finance`. Then the driver, in **Driver Pod Name**. |

When several clusters reuse namespace or pod names, use a separate Grafana data source for each cluster, or add a cluster label, a dashboard variable, and a matching filter to **every** query before you compare results. A data plane ID such as `analytics` isn't a namespace: select its workload namespaces, such as `finance`.

## Grafana Dashboards

### IOMETE Service Dashboard

The [IOMETE Service Dashboard](https://github.com/iomete/on-prem-deployment/blob/main/observability/monitoring/grafana/iom-quarkus-micrometer-service-dashboard.json) shows HTTP requests, JVM memory, garbage collection, threads, and the database connection pool of one IOMETE JVM service, such as `iom-core`, `iom-sql`, or `iom-identity`. Panels for features that a service doesn't use, such as the GraphQL panels, stay empty.

<span id="to-install-the-iomete-service-dashboard"></span>

After you [import it](#for-non-prometheus-operator-setup), set **Namespace** to the control-plane release's service namespace; the dashboard's default is `iomete-system`. Then choose a service in **IOMETE Quarkus Service**. The list stays empty until Prometheus adds the `service` label described in [Configuring Prometheus Collection](#configuring-prometheus-collection).

<Img src="/img/k8s/monitoring/iomete-service-dashboard.png"
caption="IOMETE Service Dashboard"
alt="IOMETE Service Dashboard"/>

### Spark Operator Dashboard

:::warning Not for IOMETE 4.x
The archived [Spark Operator Dashboard](https://github.com/iomete/on-prem-deployment/blob/main/observability/monitoring/grafana/iom-spark-operator-detailed-dashboard.json) stays empty with IOMETE 4.0.1. It was built for an earlier Spark operator: its panels and its namespace list query `spark_app_*` metrics, while the operator in IOMETE 4.0.1 exports `spark_application_*` and `spark_executor_*` metrics. Don't import it for a 4.x installation.
:::

To follow the operator without that dashboard, query its metrics in Prometheus or in your own Grafana panels, for example `spark_application_running_count`, `spark_application_submit_count`, and `spark_application_failure_count`. The [IOMETE monitoring chart](#using-the-iomete-monitoring-chart) includes an **IOMETE - Spark Processing Overview Dashboard** that reads these metrics.

### IOMETE Job Metrics Dashboard

The job dashboard focuses on one Spark driver. Open it with the **Metrics** link of a job run or a compute in IOMETE, or choose the workload namespace and the driver pod in Grafana.

<Img src="/img/k8s/monitoring/spark-job-metrics-link.png"
caption="Spark Job - Metrics Link"
alt="Spark Job - Metrics Link"/>

IOMETE adds the workload namespace, the driver pod, and a time range to the dashboard URL. It doesn't choose a Grafana data source or a cluster, so the dashboard opens with its default data source.

<Img src="/img/k8s/monitoring/spark-job-dashboard.png"
caption="Spark Job - Grafana Dashboard"
alt="Spark Job - Grafana Dashboard"/>

The dashboard has these panels:

| Panel | What It Shows |
| --- | --- |
| **Executors** | The number of executors over time. |
| **Total Completed Tasks**, **Total Failed Tasks** | Task totals. Failed tasks should ideally stay at zero. |
| **Total GC time** | Time spent in garbage collection. |
| **Total Tasks Time per Executor**, **Total Tasks per Executor**, **Active Tasks per Executor** | How the work spreads across executors. An executor far above or below the others points to uneven work. |
| **Executor GC time** | The garbage collection rate of each executor. |
| **Shuffle Bytes Read**, **Shuffle Bytes Written** | The shuffle traffic of each executor. |
| **Memory Used** | Memory used by each executor and by the driver. |

The panels show collected samples, so their detail depends on the scrape interval. The dashboard refreshes every 30 seconds.

#### Setting Up the Job Metrics Dashboard

The **Metrics** links use one System Config value, `spark-application.job.metrics-dashboard-url`, shared by every data plane. Its default, `/monitoring/d/iom-spark-app/iomete-spark-application-metrics?orgId=1`, points to the dashboard of the [IOMETE monitoring chart](#using-the-iomete-monitoring-chart). With your own Grafana, point it to your imported dashboard:

1. Import the [IOMETE Job Metrics Dashboard](https://github.com/iomete/on-prem-deployment/blob/main/observability/monitoring/grafana/iom-job-metrics-dashboard.json) and set its data source, as described in [Importing Dashboards Manually](#for-non-prometheus-operator-setup).
2. Open the dashboard and copy its URL. Remove any namespace, driver, and time-range parameters, because IOMETE adds them. For example: `https://grafana.example.com/d/iom-spark-job/iomete-spark-job-metrics?orgId=1`.

   <Img src="/img/k8s/monitoring/spark-job-grafana-dashboard-url.png"
   caption="Spark Job Grafana Dashboard - Copy URL"
   alt="Spark Job Grafana Dashboard - Copy URL"/>

3. In the IOMETE admin portal, open **Administration → System Config**. In the actions menu of the `spark-application.job.metrics-dashboard-url` row, choose **Edit value**, paste the URL into **Value**, and click **Save**. This needs the **Administration Manager** role. If the key is missing, enable monitoring on the control-plane release, as described in [Enabling Monitoring](#enabling-monitoring).
4. Open **Metrics** on a running job run or compute. Expected result: Grafana opens the job dashboard with **Namespace** and **Driver Pod Name** set to that workload, and the panels show data.

For the Grafana cards on the admin portal's Monitoring page, see [External Grafana Dashboards](../monitoring/overview.md#external-grafana-dashboards).

<details>
<summary>Why a short job can have an empty dashboard</summary>

A driver that finishes quickly can stop before Prometheus discovers it and collects enough samples. For example, at a 15-second scrape interval, the value that the IOMETE annotations suggest, a job that runs for only a minute or two leaves few samples, and the panels that use 1-minute and 5-minute rates can stay empty. Discovery delay and the interval your Prometheus actually uses change the exact cutoff.

<Img src="/img/k8s/monitoring/short-running-spark-job.png"
caption="Short-Running Spark Job"
alt="Short-Running Spark Job"/>

<Img src="/img/k8s/monitoring/spark-job-dashboard-for-short-running-job.png"
caption="Short-Running Spark Job - Grafana Dashboard"
alt="Short-Running Spark Job - Grafana Dashboard"/>

An empty dashboard doesn't mean that a job ran well. Check the run status, the logs, and the Spark UI or Spark History Server when available. A shorter scrape interval captures more of future short runs, at the cost of more collection and storage; it can't recover samples that were never collected.

</details>

## Using the IOMETE Monitoring Chart

The IOMETE monitoring chart, `iomete-monitoring-chart`, is a separate Helm chart in the IOMETE chart repository. It installs:

- Prometheus, which finds the IOMETE services, Spark operators, and Spark drivers through their Kubernetes Services in the namespaces you list, so it doesn't rely on the scrape annotations.
- Grafana with the IOMETE dashboards, including **IOMETE - Spark Application Metrics** for the **Metrics** links and **IOMETE - Spark Processing Overview Dashboard** for the Spark operator.
- Kubernetes and node metrics exporters and, by default, Loki and Promtail for logs.

Install it when you don't run Prometheus and Grafana yourself, or when you want the console's default Grafana links to work as they are. Those defaults are relative `/monitoring/...` paths. The console forwards them to a Grafana Service named `prometheus-grafana` in the control-plane release's service namespace, and this chart creates that Service when you install it there.

With the chart, you still [enable monitoring](#enabling-monitoring) on the control-plane release for the links, but you skip the collection and import sections.

1. Create `monitoring-values.yaml`. In `dataPlaneNamespaces`, list every namespace to scrape besides the chart's own: each additional data plane's service namespace, and the workload namespaces of every data plane, including the default data plane's.

   ```yaml
   dataPlaneNamespaces:
     - iomete-analytics
     - finance
     - marketing
   grafana:
     adminPassword: replace-with-a-strong-password
   prometheus:
     persistence:
       # Empty uses the cluster's default storage class.
       # The chart's own default asks for a class named "default".
       storageClassName: ""
   ```

   If the control-plane release uses another service namespace, also set `iometeSystemNamespace` to it. To review the other settings, such as `loki.enabled`, run `helm show values iomete/iomete-monitoring-chart --version 2.2.7`.

2. Install the chart into the control-plane release's service namespace:

   ```bash
   helm repo add iomete https://chartmuseum.iomete.com
   helm repo update
   helm --kube-context "$KUBE_CONTEXT" -n iomete-system install monitoring \
     iomete/iomete-monitoring-chart --version 2.2.7 -f monitoring-values.yaml
   ```

   Always pass `--version`. This page was checked against version 2.2.7; the repository also holds older 3.0.x releases, which Helm otherwise picks as the highest version. The chart creates cluster-wide RBAC, DaemonSets, and persistent volume claims, so install it with an account that may create them.

3. Check that Grafana runs:

   ```bash
   kubectl --context "$KUBE_CONTEXT" -n iomete-system get service prometheus-grafana
   kubectl --context "$KUBE_CONTEXT" -n iomete-system get pods -l app=grafana
   ```

   Expected result: the Service exists, and the Grafana pod is `Running`.

4. In the admin portal, open **Monitoring** and click **Grafana - Service availability**. Expected result: Grafana opens in a new tab under `https://iomete.example.com/monitoring/`.

Users reach this Grafana through the console's `/monitoring/` path, and the chart creates its Services as cluster-internal `ClusterIP` Services. Keep them internal. The chart collects metrics only from its own Kubernetes cluster.

## Troubleshooting

Check the stages in order: target discovery, sample collection, the dashboard query, and then the IOMETE link.

| Symptom | What to Check |
| --- | --- |
| No Prometheus target | Namespace discovery, Kubernetes RBAC, monitor selectors or annotation relabeling, and the port and path from [Configuring Prometheus Collection](#configuring-prometheus-collection). `monitoring.enabled` alone doesn't create a scrape job. |
| Target is down | The target's scrape error. Check connectivity, network policies, and whether the endpoint listens on that port. For `spark-operator-submit-service` and `spark-proxy-server-iomete-system`, the 4.0.1 annotations name a port that the pod doesn't have. |
| Target is up but panels are empty | Query the panel's metric in Prometheus and compare its labels with the dashboard's filters: `namespace`, `service`, or `pod`. Also check the data source, namespace, driver, time range, and retention. |
| Panels are slow or have gaps | Prometheus and Grafana may need more CPU, memory, or storage. Check the network between Prometheus and the targets. Keep the scrape interval well below one minute, because several panels use 1-minute rates. |
| Spark Operator Dashboard is empty | Expected with IOMETE 4.x. See [Spark Operator Dashboard](#spark-operator-dashboard). |
| Results mix unrelated workloads | The data source may span clusters that reuse namespace or pod names. Select a data source for one cluster, or add cluster filters to every query. |
| Dashboard didn't appear after provisioning | The sidecar's label, watched namespaces, and logs. Alternatively, import the JSON manually. |
| Dashboard import fails | Your Grafana permissions, and that the file is the raw dashboard JSON, not a saved web page. Try pasting the JSON into the import page's text box instead of uploading the file. A much older Grafana version may fail to import the files, so use a current version. |
| **Metrics** is disabled, with the tooltip "Enable monitoring to see metrics" | `monitoring.enabled` is off on the control-plane release. See [Enabling Monitoring](#enabling-monitoring). **Metrics** is also disabled for runs that are still enqueued. |
| **Metrics** or a Grafana card shows an error instead of Grafana | The value still has its default `/monitoring/...` path, but the control-plane release's service namespace has no `prometheus-grafana` Service. Install the [IOMETE monitoring chart](#using-the-iomete-monitoring-chart), or set the value to your dashboard's full URL. |
| **Metrics** opens the dashboard without data | The dashboard's default data source must be the Prometheus that scrapes the workload's namespace; see step 5 of [Importing Dashboards Manually](#for-non-prometheus-operator-setup). Users also need access to Grafana. |
| Short job has no samples | The run's status and logs, the scrape interval, and the dashboard's time range. Use the Spark UI or Spark History Server for execution details. |
