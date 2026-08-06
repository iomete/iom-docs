---
title: How We Built Disaster Recovery for IOMETE Without Changing the Platform
description: How we built disaster recovery for IOMETE, the active/passive architecture, the gap Kubernetes-native state creates during failover, and the secret-sync and CRD-sync tooling we built to close it.
slug: how-we-built-disaster-recovery
authors: [tural]
hide_table_of_contents: false
tags2: [Technical, Engineering]
keywords: [disaster recovery, kubernetes, active passive architecture, failover, spark operator, kubernetes secrets sync, CRD sync, high availability, iomete]
banner_description: If a cluster goes down, the platform needs to fail over to a standby without losing data or requiring a redesign. This is how we built disaster recovery for IOMETE, and the gap Kubernetes-native state creates during failover.
coverImage: img/blog/thumbnails/darkStone.png
last_update:
  date: 2026-08-05
---

# How We Built Disaster Recovery for IOMETE Without Changing the Platform

*Disaster recovery is a requirement for any production data platform, not an afterthought. If a cluster goes down, the platform needs to fail over to a standby without losing data or requiring a redesign. This post covers how we approached disaster recovery for IOMETE: the active/passive architecture, the gap that Kubernetes-native state creates during failover, and the tooling we built to close it.*

import Img from '@site/src/components/Img';

For a look at recovery from the storage and metadata side, see our earlier post on [Iceberg disaster recovery](/blog/iceberg-disaster-recovery), which covers snapshot rollback and `register_table`. This post covers the Kubernetes-native layer above it.

## The Setup

IOMETE runs on Kubernetes. We run two clusters: one with an active IOMETE handling all traffic, and another with a passive IOMETE on standby. Both clusters talk to the exact same load balancer endpoints for PostgreSQL and S3, not two different addresses. What differs is what's behind those endpoints: the PostgreSQL load balancer routes to the main database if you're the active side and to its replica if you're passive, while the S3 load balancer routes each side to whichever S3 endpoint is geographically closer, independent of active/passive status.

<Img src="/img/blog/2026-08-05-disaster-recovery/dr.png" darkImageSrc="/img/blog/2026-08-05-disaster-recovery/dr-dark.png" alt="IOMETE DR setup: two Kubernetes clusters sharing a PostgreSQL database and S3 storage through load balancers" centered />

Because both IOMETEs share a database, job definitions, users, domains, and catalog metadata are already available on both sides at all times. That part is free.

The problem is Kubernetes state. Computes, Spark jobs, scheduled Spark jobs, streaming jobs, and Jupyter containers exist as CRDs, controlled by the Spark Operator in Kubernetes. On top of that, IOMETE creates Secrets inside the cluster through its UI, for example docker registry secrets, vault secrets, or secrets holding environment variables. Here's a domain-level secret created in IOMETE:

<Img src="/img/blog/2026-08-05-disaster-recovery/domain-secret.png" alt="Domain level secret in IOMETE" centered />

The passive cluster knows nothing about these local Kubernetes objects. So when the active cluster goes down and you switch over, you land on an empty Kubernetes environment even though every piece of metadata is sitting right there in the database.

## What Needed to Stay in Sync

Two things needed to move between clusters on their own.

**Kubernetes Secrets.** IOMETE stores credentials, vault configs, and docker registry pull secrets as K8s Secrets. None of that lives in the database. If a secret is missing on the passive cluster when it becomes active, nothing works.

**Kubernetes CRDs.** At failover, IOMETE needs to recreate every Compute, Spark job, streaming job, event stream, orchestrator job, and Jupyter container on the new active cluster. The data is in the database, but the K8s resources still need to be triggered into existence.

## Secret Sync Runs Constantly

We built a CronJob that runs every few minutes on both clusters, staggered a couple of minutes apart so the two runs never land at the same instant. It syncs IOMETE secrets from whichever cluster currently holds the active IOMETE to the other one.

The core of it is active/passive detection, and we get that for free from `iom-gateway`, the NGINX ingress that routes traffic to IOMETE. It only runs, or is scaled up, on the active cluster. So before doing anything else, the CronJob pings the local `iom-gateway` health endpoint. A healthy response means this cluster is active, so it skips the sync. An unreachable gateway means this cluster is passive, so it proceeds.

That self-detection is what lets us deploy the exact same CronJob on both clusters without touching it at failover time. Even if nothing else changes, it will never sync in the wrong direction. We do layer one more thing on top, purely for tidiness: after a failover, we flip a `suspend` flag on the CronJob, suspended on the newly active side, enabled on the newly passive side, so the side that's always going to skip doesn't spin up a pod every cycle. That flag is an optimization, not a requirement. The self-detection is the real safety net if anyone forgets to flip it.

For the secrets themselves, we match IOMETE secret stores and vault credentials by name prefix, and docker pull secrets by type. Every secret we write gets labeled `iomete.com/dr-synced=true`, and we use that label for cleanup: if a secret disappears from the active side, the next sync run finds its counterpart on the passive side and deletes it. Docker pull secrets need this label especially, since their names are user-defined and we can only safely delete the ones we know we wrote ourselves.

<Img src="/img/blog/2026-08-05-disaster-recovery/dr-secret-sync.png" darkImageSrc="/img/blog/2026-08-05-disaster-recovery/dr-secret-sync-dark.png" alt="Secret sync CronJob replicating secrets between the active and passive IOMETE clusters" centered />

## CRD Sync Runs at Failover

The second piece is a one-time Job that runs when you actually trigger the failover. It runs inside the cluster and calls IOMETE's REST APIs on the newly active instance to recreate the K8s resources.

It works in three phases:

| Phase | What it does |
| --- | --- |
| **Phase&nbsp;0** | Deletes any stale `ScheduledSparkApplication` CRDs via `kubectl`, matched by label, so the cluster starts clean. |
| **Phase&nbsp;1** | Walks every domain and, for each resource type, triggers the API call that recreates its CRD as a side effect: aborts running manual Spark applications, starts Computes, un-suspends scheduled Spark jobs (also aborting any run in flight), stops and restarts streaming jobs and active event streams, resumes orchestrator jobs, and starts stopped Jupyter containers. |
| **Phase&nbsp;2** | Triggers the catalog-sync Spark job to rebuild the Typesense search index, so Data Catalog works in the UI. Skipped automatically if the source domain never had a catalog-sync job. |

Phase 0 can look redundant next to step 2 of the failover script below, which also offers to clean up Spark CRDs. The difference is which cluster and when: step 2 cleans the outgoing side at the moment it steps down to passive, so the cluster becoming active here may well have already been cleaned the last time it made that same transition. Phase 0 still runs the deletion again, because that earlier cleanup is optional and confirmed by the operator each time, so it's easy to skip, and CRDs can accumulate in the time between failovers regardless. Most of the time Phase 0 has nothing to delete. It's extra caution, not a load-bearing assumption.

A couple of details matter in Phase 1. Aborted runs are only resubmitted if you explicitly opt in; the default is abort-only, since silently restarting jobs mid-failover isn't something that should happen by accident. IOMETE's own long-running Spark Connect application is explicitly excluded, so the script never kills and resubmits it.

The Job uses in-cluster DNS, so there are no external URLs to configure, and it auto-detects whether to talk to `iom-cluster` (3.17+) or `iom-core` (3.15.x) by checking which service resolves in DNS.

## Wrapping It into a Failover Script

You don't run the CRD sync Job by hand. It's wrapped in a small failover script that handles the entire cutover, confirming with the operator at each step:

1. Scale the outgoing active side's workloads down to zero, saving each one's replica count as an annotation first, so scaling back up later restores the same capacity instead of defaulting everything to a single replica.
2. Offer to clean up any Spark and scheduled-Spark application CRDs left running on that side, again excluding the system-managed `iom-spark-connect` app.
3. Scale the new active side's workloads back up from its saved replica counts.
4. Once those workloads are ready, trigger the CRD sync Job automatically, asking first whether to resubmit aborted jobs (default: no).

<Img src="/img/blog/2026-08-05-disaster-recovery/dr-failover-flow.svg" alt="Failover sequence between the two IOMETE clusters" width="650" height="430" maxWidth="650px" centered borderless />

<p align="center"><em>A failover swaps roles between the two clusters: the outgoing active side scales down and optionally cleans up Spark CRDs, then the newly active side scales up and runs the CRD sync job before traffic moves over.</em></p>

## What You Actually Need to Set Up

Not much. Both clusters already have a `lakehouse-service-account` with the right permissions, and we reuse it everywhere. The only new things are:

- A long-lived token from each cluster's `lakehouse-service-account`
- A kubeconfig file per cluster, each pointing at the other one
- Two Kubernetes Secrets to store those kubeconfigs
- Two CronJob deployments, one per cluster
- A one-time Job manifest for CRD sync, run during failover

No new service accounts. No new RBAC. No changes to IOMETE itself.

## What We Learned

The shared database does more of the work than you'd expect. User auth, job definitions, catalog metadata: all of it is just there on the passive cluster already. The real gap is much narrower than it sounds. You need secrets, and a way to kick off CRD recreation at failover time. That's it.

Active/passive detection based on gateway reachability turned out to be simple and reliable. The gateway being up is a strong signal that a cluster is actually serving traffic. If it's down or scaled to zero, that cluster clearly isn't the active one.

Whatever wraps this tooling should double-check which cluster it's actually pointed at before scaling anything down. A `kubectl` context name is just a local label, and it can be renamed or reused. The safer check is against a property of the cluster itself, such as its API server URL, with the operator typing the cluster name back as a final confirmation before anything destructive happens.

One thing worth planning around before going to production: the first sync after deploying will label all existing secrets on the passive side, but secrets that were synced before the label existed won't get cleaned up until they show up in a sync run. Run it once and let it backfill the labels before relying on the deletion logic.