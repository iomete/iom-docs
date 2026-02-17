---
title: "Access Delegation in Apache Iceberg: Credential Vending and Remote Signing"
description: "Eliminating long-lived storage credentials in modern data lakehouses"
slug: "iceberg-access-delegation"
authors: "rocco"
tags2: ["Security", "Technical"]
coverImage: "img/blog/thumbnails/4.png"
date: "02/09/2026"
---

import Img from '@site/src/components/Img';

In most lakehouse deployments today, every compute engine needs credentials to reach the object store. That often means injecting long-lived cloud credentials directly into Spark, Trino, Flink, and a proliferating zoo of batch and streaming jobs. Many organizations end up sharing the same static keys across dozens or hundreds of workloads. Generating per-job credentials improves security somewhat, but the operational overhead quickly explodes at scale.

Worse still, these credentials are typically massively over-privileged. Bucket-wide read/write access remains common because native IAM policies don't understand Iceberg concepts like tables, snapshots, partitions, or query intent. A single compromised key can therefore expose the entire lakehouse. At scale, key rotation, access auditing, and enforcing true least privilege all become brittle and error-prone.

This problem is a direct consequence of one of Iceberg's greatest strengths: the clean separation of compute and storage. Apache Iceberg is now the de facto table format powering modern lakehouses, replacing the tightly coupled architectures of traditional data warehouses and Hadoop-era data lakes. We cover that evolution in more detail in [this article](/blog/from-data-warehouses-to-data-lakehouses).

The decoupling maximizes throughput by letting multiple independent engines read and write the same data concurrently, with no need to route everything through a central choke-point service. It also preserves full ACID guarantees, as covered in [this article](/blog/apache-iceberg-acid-transactions-catalog). But it means every engine needs its own path to the object store. Traditionally, that path has been paved with static credentials.

Apache Iceberg addresses this through a mechanism called access delegation, built into the [Iceberg REST Catalog specification](https://iceberg.apache.org/spec/#iceberg-rest-catalog). Instead of distributing storage credentials to every engine and job, authorization decisions are centralized in the catalog, which enforces governance rules and issues tightly scoped, short-lived access on demand. This article covers how access delegation works, and the two approaches it supports: **credential vending** and **remote signing**.

<!-- truncate -->

---

## What is Access Delegation?
In many lakehouse deployments today, storage access looks a bit like a hostel that shares a single front door code with all its guests. Everyone can come and go freely. Usually it works fine, until it doesn’t. When a credential leaks or a job misbehaves, there is no easy way to limit the blast radius. Rotating the access code can be disruptive, slow, and error-prone, especially once dozens or hundreds of jobs depend on it.

Access delegation moves lakehouse access to a hotel-style model. There is a front desk where you check in. It knows your reservation, what extra services you booked, and how long you are allowed to stay. Guests do not get permanent access to the building. Instead, access is granted dynamically, scoped to exactly what they booked, and their access automatically expires.

In an Iceberg-based platform, that front desk is the Iceberg REST Catalog. Authorization decisions are delegated to the REST Catalog, which enforces governance rules and issues storage access according to your data governance rules.

## The Data Governance Layer and Storage Layer Mismatch
Most modern lakehouse platforms include a data governance layer. This is where organizations define what users and services are allowed to do with which datasets. These rules are usually expressed in terms of table-level operations, such as *SELECT*, *INSERT*, *CREATE TABLE*, and similar SQL semantics.

Storage systems, however, operate at a very different level. Object stores think in terms of buckets, paths, files, and objects. They have no concept of tables, schemas, snapshots, or partitions. They also have no awareness of your data governance rules, which may change frequently as users, roles, and policies evolve.

Because of this mismatch, restricting compute engines and batch jobs to exactly the files they should access is hard. Storage permissions are defined upfront, long before the engine knows which tables or snapshots it will touch. Keeping those permissions tight and up to date quickly becomes an operational headache.

In short, access delegation lets the Iceberg REST Catalog enforce governance at the table level, while the storage layer remains simple, scalable, and unaware of Iceberg table semantics.

## Credential Vending: Short‑Lived Access Keys for Compute Engines
Back to our hotel analogy. Some hotels still give out old-fashioned metal keys to their guests. Each key opens a specific room. If a guest loses that key off-premises, there’s a real risk that someone else might later try to access the room. There is also no way to know whether a previous guest made a copy. Most people would feel uneasy knowing a stranger could walk into their room while they sleep. If a key is lost or stolen, the only option is to replace the physical lock.

Most modern hotels no longer do this. Instead, guests receive a plastic key card with an NFC chip at check-in. That card only works for the duration of the stay and automatically expires at check-out. If a guest loses the card, hotel staff can revoke it instantly and issue a replacement. No locks need to be changed, and no long-term risk remains.

Credential vending in Iceberg works the same way. When a compute engine needs to read from or write to an Iceberg table, it makes a call to the Iceberg REST Catalog to find out the metadata location. In addition, it will request temporary credentials to access that table in the storage.

The REST Catalog authenticates the request and checks the caller’s privileges against the data governance layer. This determines the allowed Iceberg operations: *SELECT*, *INSERT*, *CREATE TABLE*, and so on. The catalog then translates those high-level permissions into the minimum storage access required: only the specific paths, and only what the compute engine is allowed to do with them: read this file, write that file, list this folder.

It then obtains short-lived credentials from the storage provider, scoped tightly to those paths and actions, and valid for a limited time. The REST Catalog returns the usual table metadata along with these temporary credentials and their expiration time. The compute engine uses the credentials directly to access the object store. No long-lived keys are configured, no broad bucket permissions are granted. If the credentials expire during a long-running job, the compute engine simply makes another catalog call to obtain fresh ones.

This approach enables least-privilege access. Permissions are derived directly from Iceberg-level governance rules and enforced centrally by the REST Catalog. If credentials are ever compromised, the impact remains contained: short-lived, table-scoped, and automatically expiring.

<Img src="/img/blog/2026-02-08-iceberg-access-delegation/credential-vending-flow.png" alt="Credential vending flow" />

## Remote Signing: Per‑File Access with Pre‑Signed Requests

Remote signing goes a step further. In our hotel analogy, imagine instead of handing you a temporary key card, the hotel gives you no key at all. When you need to access a room, a concierge escorts you and unlocks the door for you. The concierge has been briefed on exactly which rooms you are allowed to enter, and what you are allowed to do there. The same governance rules apply as before, but they are enforced differently. You never carry anything that could be lost, copied, or stolen. Every access is mediated, logged, and closed immediately after use.

Remote signing in Apache Iceberg works in much the same way. When a compute engine wants to read from or write to an Iceberg table, it makes its usual call to the Iceberg REST Catalog to load table metadata or prepare a write.

The REST Catalog authenticates the request and validates it against the data governance rules, determining what operations the compute engine is allowed to perform on the table. Instead of issuing storage credentials, the catalog returns a signing endpoint. In practice, this endpoint is operated alongside the REST Catalog and uses its authorization context to mint [**pre-signed requests**](https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-authenticating-requests.html).

These are commonly referred to as [**pre-signed URLs**](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html), since they are often delivered as a URL with signature parameters attached. In practice, however, what is signed is the full HTTP request: the method (GET for reads, PUT for writes), headers, path, and expiration. A signed read request cannot be repurposed as a write, even if leaked.

As the compute engine begins processing the query or job, it needs to access specific files: metadata, manifest, and data files. For each file, it calls the signing endpoint. The endpoint validates the request and, if allowed, returns a pre-signed request for that specific file and operation.

The compute engine then uses the signed request to access the object store directly. The key distinction from credential vending is that compute engines never receive any storage credentials at all, not even temporary ones. They only ever receive pre-signed requests. If a signed request leaks, the damage is minimal: one file, one operation, only for a few minutes. No table-wide access, no reusable credential, no ability to escalate from a read to a write.

<Img src="/img/blog/2026-02-08-iceberg-access-delegation/remote-signing-flow.png" alt="Remote signing flow" />

## Choosing the Right Approach for Your Lakehouse

Static credentials remain common in lakehouse deployments, but the rest of the industry moved past them years ago. We moved away from them for databases, APIs, and service-to-service communication. OIDC, workload identity, and short-lived tokens are now the norm. Spark, Trino, and Flink should not be the exception.

Credential vending is a practical middle ground. There is some overhead: every table access requires a round-trip to the catalog to mint scoped, temporary credentials. But the compute engine can only touch what it was explicitly granted. If a credential leaks, the blast radius is typically one table, for a few minutes. No path for privilege escalation, no rotation panic.

Remote signing is the tightest model. The compute engine never holds storage credentials at all. Every file access requires a call to the signing endpoint, which can add overhead for jobs that touch hundreds of files. There are no reusable credentials to leak. Each pre-signed request is scoped to a single file and operation, and expires within minutes. Every access can be logged individually. For sufficiently sensitive data, the additional overhead is often worth the stronger isolation.

To sum this up:

| | **Static Credentials** | **Credential Vending** | **Remote Signing** |
| --- | --- | --- | --- |
| Overhead | None | Per-table | Per-file |
| Credential exposure | Permanent, broad | Temporary, table-scoped | None |
| Blast radius if leaked | Entire bucket/lakehouse | One table, minutes | One file, seconds to minutes |
| Privilege escalation risk | High | None | None |
| Auditability | Coarse | Per-table | Per-file |
| Delay in key revocation | Manual/slow | Minutes | Instant |
| Best for | High-throughput/full scans | Most workloads | Sensitive data |

## Access Delegation in IOMETE

Starting with release 3.16.0, IOMETE supports both credential vending and remote signing for S3-compatible storage. Compute engines not managed by the IOMETE platform, such as your own Spark, Trino, or Flink deployments, can connect to IOMETE's REST Catalog and access data without long-lived storage credentials. Your governance policies are enforced at the catalog level, with least-privilege access out of the box.
