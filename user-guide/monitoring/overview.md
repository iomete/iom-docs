---
title: Monitoring
description: Reach every platform-wide monitoring surface in IOMETE — control-plane and data-plane health, namespace quotas, query monitoring, search engine metrics, deployment configuration, and external Grafana dashboards — from one admin portal page.
sidebar_label: Overview
last_update:
  date: 11/07/2026
  author: Valid Akhundov
---

import Img from '@site/src/components/Img';

Monitoring is the admin portal's directory of every platform-wide monitoring surface in IOMETE: control-plane and data-plane health, namespace resource usage, query activity, search engine metrics, the deployment configuration, and, when monitoring is enabled, external Grafana dashboards. The page itself renders no metrics. Each card links to the page that does.

Sign in with an admin account and open the admin portal, then click **Monitoring** in the left sidebar. Any admin role can open it, so you won't need a special permission just to find it.

<Img src="/img/monitoring/overview.png" alt="Monitoring landing page in the admin portal, showing the card grid and the External Grafana dashboards section" />

## Monitoring Cards

Each card has an image or icon, a title, and a short description, so you don't have to memorize a URL for every monitoring surface in IOMETE. Click any of the five standard cards to open it, all in **the same browser tab**:

| Card | What It Opens | Description |
|------|---------------|--------------|
| **Control-plane and data planes health** | The [Health Check](./health-check.md) page | Shows shared control-plane services and services grouped by data plane. |
| **Namespace quotas across data planes** | The **Namespace Quotas** page, under **Monitoring** | Shows Kubernetes resource quota usage for every namespace of every data plane. See [Namespace Quotas](../namespace-quotas.md). |
| **SQL query monitoring** | The [Query Monitoring](./query-monitoring.md) page | Tracks query execution times and resource consumption patterns. |
| **Search engine (Typesense)** | The [Search Engine Monitoring](./typesense.md) page | Tracks search collections, system metrics, and request statistics. |
| **Deployment configuration** | The **Deployment configuration** page | Shows the control-plane release's Helm values, read-only, with passwords, keys, and tokens masked. |

The **Search engine (Typesense)** card is visible to any admin, but its page requires the **Administration Manager** role for every request. See [Search Engine Monitoring](./typesense.md#access-permissions) for details. The **Deployment configuration** page also requires the **Administration Manager** role.

## External Grafana Dashboards

When monitoring is enabled, a second section titled **External Grafana dashboards** appears below the main card grid. Unlike the standard cards, its two cards open in a **new browser tab**, because they lead to Grafana, outside the admin portal:

- **Grafana - Service availability**
- **Grafana - Alerting rules**

The section depends on the Helm value `monitoring.enabled` of the **control-plane release**, which defaults to `false`. When it's `true`, IOMETE adds the two dashboard-URL keys to System Config with default values, and a value can't be blank, so both cards always appear. When it's `false`, the keys don't exist and the section doesn't render. Enabling monitoring only on an additional data plane's runtime release doesn't add the keys. If you can't find them, ask the administrator of the control-plane release to check the setting. An Administration Manager can also look for `monitoring` on the **Deployment configuration** page.

The default values, `/monitoring/d/serv-avail/iomete-service-availability` and `/monitoring/alerting/list`, open the Grafana of the [IOMETE monitoring chart](../k8s/monitoring.md#using-the-iomete-monitoring-chart), which must run in the control-plane release's service namespace. With your own Grafana, replace them with the full URLs of your dashboards. Dashboard links don't configure metrics collection: Prometheus must separately discover and scrape the service and workload namespaces. See [Monitoring Setup](../k8s/monitoring.md) for collection and Grafana configuration.

If a dashboard URL is entered as a full address (starting with `http://` or `https://`), IOMETE links to it as-is. If it's a relative path instead (starting with `/`), IOMETE resolves it against the console's own address: the same protocol, host, and port you're using to view the admin portal.

### Configuring the Dashboard Links

To point these cards at other dashboards, set the corresponding System Config values. This requires the **Administration Manager** role. Without it, the edit action is disabled and shows an access-denied tooltip.

1. Sign in with an account that has the **Administration Manager** role.
2. In the left sidebar, under **Administration**, click **System Config**.
3. Find the key for the dashboard you want to link:
   - `external-grafana.service-availability.dashboard-url`
   - `external-grafana.alerting-rules.dashboard-url`

4. Open the row's actions menu and choose **Edit value**.

   <Img src="/img/monitoring/system-config-row-actions.png" alt="System Config list with the row-actions menu open on a Grafana dashboard-url row, showing Edit value and Reset to default" />

5. Enter the URL of the corresponding Grafana dashboard, then save.

   <Img src="/img/monitoring/system-config-edit-value.png" alt="Edit config dialog with the external-grafana.service-availability.dashboard-url key and a dashboard URL entered in the Value field" />

If the value you enter fails validation, the dialog shows the error inline on the field instead of saving:

| Trigger | Error Message |
|---------|---------------|
| Value is left empty | "Required" |
| Value contains only spaces | "Dashboard URL cannot be blank" |
| Value doesn't start with `http://`, `https://`, or `/` | "URL should either be relative (starts with '/') or start with http:// or https://" |

If validation passes, IOMETE shows a "Config updated successfully" toast and closes the dialog. The next time anyone opens the Monitoring page, the matching card links to the new URL.

You can also choose **Reset to default** from the same row-actions menu to remove your override and revert to the key's built-in default (`/monitoring/d/serv-avail/iomete-service-availability` for service availability, `/monitoring/alerting/list` for alerting rules). This also requires the **Administration Manager** role.

## Access Permissions

Who can see Monitoring and who can edit its Grafana links are two different questions, governed by two independent permission checks:

| Role | View Monitoring Page & Cards | Edit / Reset Grafana Dashboard URLs |
|------|:---:|:---:|
| Any admin role | ✅ | ❌ |
| **Administration Manager** | ✅ | ✅ |

There's no resource-level permission model for this page. Access is governed entirely by admin role, independent of any workspace- or namespace-scoped permissions you might have elsewhere.
