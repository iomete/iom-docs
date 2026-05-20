---
title: Your Compute Cluster Failed. Here's How to Find Out Why.
description: A short field guide to diagnosing compute cluster failures in IOMETE — Logs, Kubernetes events, decoding OOMKilled and friends, and finding the right person to escalate to.
slug: troubleshooting-compute-cluster-failures
authors: Soltan
hide_table_of_contents: false
tags2: [Engineering]
banner_description: When a compute cluster goes red, two UI tabs and one bundle link will get you 90% of the way to the cause.
coverImage: img/blog/thumbnails/darkStone.png
date: 05/20/2026
---

# Your Compute Cluster Failed. Here's How to Find Out Why.

*When a compute cluster goes red, two UI tabs and one bundle link will get you 90% of the way to the cause.*

---

A compute cluster turns red. The channel goes quiet. Somebody pings you, and now you're the person who has to figure out whether it's an OOM, a bad image tag, a missing node, or a thing somebody else owns.

Most of the time, the answer is sitting in two tabs of the cluster detail page — and a third tab tells you who to call when it isn't.

By the time you see `Failed`, the platform has already retried the cluster up to five times. Whatever you're looking at survived that, so it needs a human.

Here's the short version of the flow we just documented in detail:

- **Read the status first.** The driver badge on the **Details** tab shows `Failed`; hovering it reveals the underlying error message from the Spark operator. That tooltip alone resolves a surprising number of cases.
- **Read the events.** The **Kubernetes events** tab decodes the rest. `OOMKilled` means a pod exceeded its memory limit. `FailedScheduling` means no node fit. `ImagePullBackOff` means the Docker image couldn't be pulled. The `Message` column quotes the underlying error verbatim. (Heads up: Kubernetes only keeps these events for about an hour — capture them while they're fresh.)
- **Find the owner.** If the fix isn't yours to make, the **Bundle** row on the Details tab links to the cluster's resource bundle, and the bundle page names its owner. Reach out through your usual team channel.

We wrote the full runbook — including a decoder table for the common Kubernetes event reasons and exactly what to share when you escalate — over at **[Troubleshooting Compute Cluster Failures](/user-guide/compute-clusters/troubleshooting)**. Bookmark it before the next time a cluster falls over.
