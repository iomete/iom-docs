---
title: Health Check
description: Monitor control-plane services and services grouped by data plane from the admin portal.
sidebar_label: Health Check
last_update:
  date: 11/05/2026
  author: Ruturaj Bhokre
---

import Img from '@site/src/components/Img';

Health Check shows service status in two groups: **Control plane services**, which support the shared platform, and **Data plane services**, grouped by the data plane that runs them. Use it to check whether an incident affects a shared service or a particular data plane, review uptime over the last 48 hours, and compare failures with the timing of broken jobs and queries.

Health results are collected from the control plane and reported by data planes. The page displays 48 hours of results, aggregated into 1-hour bars. Each service renders as a card with a status badge, a 48-bar timeline, and an uptime percentage.

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

<Img src="/img/health-check/sidebar-monitoring.png" alt="Admin sidebar with Monitoring highlighted, showing the Monitoring landing page and the Control-Plane health card on the right" />

Either path opens the Health Check page.

## Reading the Page

Once the page is open, you see a toolbar followed by **Control plane services** and **Data plane services**. Expand a data plane to inspect its service cards. When investigating a workload failure, use the **Data plane** shown on that workload's **Details** tab to find the relevant group.

<Img src="/img/health-check/overview.png" alt="Full Health Check page showing the metric selector toolbar at the top and a grid of service cards below, all reporting healthy uptime" />

### Toolbar

The toolbar runs across the top of the page and contains:

- A segmented control with the labels **P50**, **P90**, **P95**, **P99**, and **P100**. This is the uptime metric selector (see [Choosing an Uptime Metric](#choosing-an-uptime-metric) below).
- A small information icon next to the segmented control. Hover it for a popover titled **Uptime metric for bar status** that explains each metric.
- A **Refresh** button on the right. Click it to fetch the latest data immediately. While a fetch is in flight, the button shows a loading spinner and is disabled.

<Img src="/img/health-check/toolbar.png" alt="Health Check toolbar with the P50 to P100 metric selector, an open Uptime metric for bar status popover listing each threshold, and the Refresh button on the right" />

### Service Cards

Each section shows one card per service. A service name can appear under several data planes, so keep the data plane name with the service name when reporting a problem. Each card has the service name, a status badge, a 48-bar timeline, and a footer with the start of the window, the uptime percentage, and **Now**.

<Img src="/img/health-check/service-card.png" alt="Close-up of a single service card showing the service name, the 48-bar timeline of green hourly status bars, and the footer with 48 hours ago, uptime percentage, and Now labels" />

### Status Timeline

The timeline runs left to right with one coloured bar per 1-hour window over the last 48 hours. The right-most bar is the current hour. Hover any bar for a popover with:

- **Period**: the bar's time range, formatted `DD MMM HH:mm - HH:mm`.
- **Status**: Operational or Outage for that hour.

If a service has fewer than 48 hours of history, the timeline is left-padded with grey bars. Grey means "no data yet," not a problem.

## Status Meanings

Every service and every bar is in one of two states. The icon and colour are the same on the service-level badge and on each timeline bar.

| Status | Icon | Colour | What it means |
|---|---|---|---|
| **Operational** | Filled circle | Green | The service is responding healthily. |
| **Outage** | Alert circle | Red | The service is failing health checks beyond the threshold for the selected metric. |

## Choosing an Uptime Metric

The segmented control at the top of the page sets how strictly a 1-hour window has to fail before its bar turns red. The metric only affects bar colouring; the underlying probe data is the same regardless of which one you pick.

| Metric | Threshold |
|---|---|
| **P100** | Immediate. Any failure marks an OUTAGE. |
| **P99** | Strict. OUTAGE if failures exceed 36 sec within an hour. |
| **P95** | Standard. OUTAGE if failures exceed 3 mins within an hour. |
| **P90** | Balanced. OUTAGE if failures exceed 6 mins within an hour. |
| **P50** | Broad. OUTAGE if failures exceed 30 mins within an hour. |

The default is **P90**.

:::tip
Use **P100** to see every individual probe failure as red, which is useful for catching transient blips. Use **P50** to see only sustained outages. The current selection is mirrored to the URL query string (for example, `?metric=P95`), so links to the Health Check page are shareable and preserve the strictness you chose.
:::

## Troubleshooting

The Health Check page doesn't expose individual probe logs. For deeper investigation, inspect the affected service with your usual Kubernetes tooling in the cluster and namespace hosting that service. A data plane's management services can run in a different namespace from its workloads.

If the page itself fails to load, check the failed request and control-plane logs for `iom-core`, which serves the health-check API. A page-load failure alone does not identify which monitored service is unhealthy.
