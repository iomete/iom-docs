---
title: Health Check
description: Monitor control-plane services and services grouped by data plane from the admin portal.
sidebar_label: Health Check
last_update:
  date: 11/07/2026
  author: Ruturaj Bhokre
---

import Img from '@site/src/components/Img';

Health Check shows service status in two groups: **Control plane services**, which support the shared platform, and **Data plane services**, grouped by the data plane that runs them. Use it to check whether an incident affects a shared service or a particular data plane, review uptime over the last 48 hours, and compare failures with the timing of broken jobs and queries.

The control plane checks its own services and the default data plane's services every 10 seconds. Each additional data plane reports the status of its services to the control plane. If a data plane stops reporting, the control plane marks it as disconnected, and its services show **No data** from then on. The page shows 48 hours of results, aggregated into 1-hour bars. Each service renders as a card with a status badge, a timeline of hourly bars, and an uptime percentage.

## Opening the Health Check Page

You can reach Health Check two ways from the admin portal. Both land on the same page, so pick whichever fits your workflow.

### From Settings

1. Sign in with an admin account and open the admin portal.
2. In the left sidebar, scroll to the **Other** group and click **Settings**.
3. In the Settings inner sidebar, click **Health Check**.

### From the Monitoring Tab

1. Sign in with an admin account and open the admin portal.
2. In the left sidebar, click **Monitoring**.
3. On the Monitoring page, click the **Control-plane and data planes health** card.

<Img src="/img/health-check/sidebar-monitoring.png" alt="Admin sidebar with Monitoring highlighted, and the health card on the Monitoring page to the right" />

Either path opens the Health Check page.

## Reading the Page

Once the page is open, you see a toolbar followed by **Control plane services** and **Data plane services**. **Data plane services** groups each data plane's own services, such as **Spark Operator Webhook** and **Spark History**, under the data plane's ID, for example `default` or `analytics`. Expand a data plane to inspect its service cards. When investigating a workload failure, use the **Data plane** shown on that workload's **Details** tab to find the relevant group.

### Toolbar

The toolbar runs across the top of the page and contains:

- A segmented control with the labels **P50**, **P90**, **P95**, **P99**, and **Max**. This is the uptime metric selector (see [Choosing an Uptime Metric](#choosing-an-uptime-metric) below).
- A small information icon next to the segmented control. Click it for a popover titled **Uptime metric for bar status** that explains each metric.
- A **Refresh** button on the right. Click it to fetch the latest data immediately. While a fetch is in flight, the button shows a loading spinner and is disabled.

If a service changes status while the page is open, a warning says that the data is outdated. Click **Refresh** to load the latest results.

<Img src="/img/health-check/toolbar.png" alt="Health Check toolbar with the P50 to P100 metric selector, an open Uptime metric for bar status popover listing each threshold, and the Refresh button on the right" />

### Service Cards

Each section shows one card per service. A service name can appear under several data planes, so keep the data plane name with the service name when reporting a problem. Each card has the service name, a status badge, a timeline, and a footer with **48 hours ago**, the uptime percentage, and **Now**. The uptime percentage counts only the time when the service was observed. If it was never observed in the window, the footer shows **N/A uptime**.

<Img src="/img/health-check/service-card.png" alt="Close-up of a single service card showing the service name, the 48-bar timeline of green hourly status bars, and the footer with 48 hours ago, uptime percentage, and Now labels" />

### Status Timeline

The timeline runs left to right: one coloured bar for each hour of the last 48 hours, ending with the current hour, and then a final bar for the current status. Click a bar for a popover with:

- **Period**: the bar's time range, formatted `DD MMM HH:mm - HH:mm`.
- **Status**: the bar's status.
- For an hour with problems, each period in which the service wasn't operational, with its start and end times. Hover a period's status to see the recorded error message, if there is one.

Hours before IOMETE started checking a service, for example just after installation, show as grey **No data** bars.

## Status Meanings

The status badge on each card, the colour of each bar, and the **Status** in each popover use the same states:

| Status | Icon | Colour | What it means |
|---|---|---|---|
| **Operational** | Circle | Green | The service is responding healthily. |
| **Outage** | Alert circle | Red | The service is failing health checks beyond the threshold for the selected metric. |
| **No data** | Dashed circle | Grey | The control plane didn't observe the service for enough of that time, for example before checks began, while the health checker wasn't running, or while the service's data plane was disconnected. |

## Choosing an Uptime Metric

The segmented control at the top of the page sets how strictly a 1-hour window has to fail before its bar turns red. The same threshold applies to unobserved time: if more of the hour than the threshold allows went unobserved, the bar shows **No data**. The metric only affects bar colouring; the uptime percentage and the underlying check results stay the same whichever one you pick.

| Metric | Threshold |
|---|---|
| **Max** | Immediate. Any failure marks an OUTAGE. |
| **P99** | Strict. OUTAGE if failures exceed 36 sec within an hour. |
| **P95** | Standard. OUTAGE if failures exceed 3 mins within an hour. |
| **P90** | Balanced. OUTAGE if failures exceed 6 mins within an hour. |
| **P50** | Broad. OUTAGE if failures exceed 30 mins within an hour. |

The default is **P90**. For the services that the control plane checks itself every 10 seconds, the 36-second **P99** threshold is about four failed checks in an hour.

:::tip
Use **Max** to turn any hour with a failure red, which is useful for catching transient blips. Use **P50** to see only sustained outages. The current selection is mirrored to the URL query string (for example, `?metric=P95`; **Max** appears as `?metric=P100`), so links to the Health Check page are shareable and preserve the strictness you chose.
:::

## Troubleshooting

The Health Check page doesn't expose individual probe logs. For deeper investigation, inspect the affected service with your usual Kubernetes tooling in the cluster and namespace hosting that service. A data plane's services run in the service namespace of its release, such as `iomete-analytics`, not in its workload namespaces.

If the page itself fails to load, check the failed request and control-plane logs for `iom-core`, which serves the health-check API. A page-load failure alone does not identify which monitored service is unhealthy.
