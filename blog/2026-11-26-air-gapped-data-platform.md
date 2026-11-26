---
title: "How IOMETE Keeps Data Sovereign in an Air-Gapped Lakehouse"
description: "Air-gapped data platform architecture: how IOMETE runs a full Spark and Iceberg lakehouse with no vendor control plane, local metadata and in-cluster identity."
keywords: [air-gapped data platform, air-gapped lakehouse, sovereign data platform, on-premise data lakehouse, disconnected kubernetes analytics, self-hosted lakehouse]
slug: air-gapped-data-platform
authors: aytan
tags2: [Technical, Security]
coverImage: img/blog/thumbnails/darkStone.png
date: 11/26/2026
hide_table_of_contents: false
last_update:
  date: 2026-11-26
---

For most data platforms, "on-premises" still comes with a cable back to the vendor. Your data may sit in your data center, but the control plane, license checks or metadata service live in someone else's cloud. Cut that cable and the platform stops working.

In defense, government, central banking and healthcare, that cable is exactly what isn't allowed. The network is air-gapped: no inbound connection from the internet, and usually no outbound one either. This post explains how IOMETE is designed so that every part of the lakehouse runs inside your own perimeter.

{/* truncate */}

import FAQSection from '@site/src/components/FAQSection';

## What Does an Air-Gapped Data Platform Require?

An air-gapped data platform must run every component it needs inside the isolated network, with no call to an outside service. That changes the design question. You stop asking "where is the data stored?" and start asking "which component needs the internet to work?" For a lakehouse, the answer has to be none of them.

In practice, that means five requirements:

1. **No vendor-operated control plane.** Cluster management, job scheduling and the UI run locally.
2. **Local metadata.** The table catalog and schemas don't depend on a hosted service.
3. **Local identity and policy.** Authentication and authorization work against your own directory.
4. **Local software supply.** Container images come from a registry inside the network.
5. **Local storage.** Table data sits on storage you own.

The rest of this post shows how IOMETE answers each one.

## The Control Plane Runs in Your Cluster

The control plane is the part of a platform that decides what runs, where and for whom. If it lives outside your network, you don't fully control your platform. IOMETE deploys as a Helm chart into your Kubernetes cluster, and every platform service runs there as a Kubernetes Deployment.

That includes the gateway, cluster management, the SQL service, the data catalog, identity and job orchestration. There's no hosted IOMETE service the installation has to call home to.

This is the key difference from cloud-first platforms with "private" deployment options. In those, the data plane may run in your account, but the control plane never leaves the vendor's cloud. With IOMETE, both stay with you.

You can also place platform services on dedicated control plane nodes and Spark workloads on data plane nodes. Node selectors and tolerations keep the two apart, so a heavy Spark job can't starve the services that run the platform.

## Metadata Stays Local

Metadata tells every engine what your tables are and where their files live. Lose control of it and you lose control of the data, even if the files never move. IOMETE keeps all platform metadata in a PostgreSQL server you run.

The platform creates separate databases inside it for the Hive Metastore, the Iceberg catalog, access policies and each microservice. You don't provision them by hand.

Tables use the open [Apache Iceberg](https://iceberg.apache.org/) format, and IOMETE exposes them through its own implementation of the [Iceberg REST Catalog specification](https://iceberg.apache.org/rest-catalog-spec/). Because the format is open, your data stays readable by any Iceberg-compatible engine. Sovereignty includes the right to leave.

## Identity and Access Control Work Without the Internet

Access control is only sovereign if the system that decides "who are you?" and "what may you see?" runs where your data runs. IOMETE handles authentication in-cluster through its Identity Service. It connects to what you already operate: LDAP, or single sign-on over SAML or OIDC with an internal identity provider.

Authorization works at three levels:

- **Platform level:** who can create compute clusters or change settings.
- **Data level:** data security policies for table permissions, row-level filtering and column masking. IOMETE checks table access on every request through its Iceberg REST Catalog, and its Spark engine applies row filters and masks.
- **Resource level:** view, update and manage permissions on individual compute clusters, Spark jobs, workspaces and namespaces.

Read the [data security overview](/resources/user-guide/data-security/overview) for how policies are configured.

## Software Comes From Your Registry

In a disconnected network, nothing can be pulled from Docker Hub. Every image the platform runs has to come from inside. IOMETE lets you register [private container registries](/resources/user-guide/private-docker-registry) per Kubernetes namespace, so you mirror platform and Spark images once and serve them internally.

Kubernetes [network policies](/resources/deployment/network-policies) then define which IOMETE components may talk to each other. A shared label on IOMETE-managed namespaces keeps traffic limited to what the platform needs.

## Storage You Own

Compute and storage are fully decoupled in IOMETE. Table data, Spark event logs and query results all live in object storage. IOMETE supports S3-compatible on-premises storage such as Dell ECS and MinIO, alongside cloud object stores.

In an air-gapped deployment, that means the bytes never leave hardware your organization controls.

## What Runs Inside the Gap?

Once installed, the full platform works without external connectivity. Your teams get the same capabilities they'd expect from a cloud lakehouse:

- **SQL compute clusters** reachable over JDBC/ODBC, Spark Connect and Arrow Flight for BI tools and applications.
- **Spark jobs** in Scala or PySpark, scheduled with the built-in [Job Orchestrator](/resources/user-guide/spark-jobs/job-orchestrator).
- **Jupyter containers** for data science and ML development.
- **Event streams** powered by Papyrus, a Rust-based ingestion engine that writes incoming events directly to Iceberg tables.
- **A data catalog** with search, classification tags and access permissions.

## Does Sovereign Mean Small?

No. Running inside your perimeter doesn't cap how far you can scale. Dell runs IOMETE in production across 100,000 vCPUs and 40+ PB of data, after replacing Databricks, Cloudera and Dremio. Read the [proof-at-scale story](/resources/blog/sovereign-lakehouse-proof-at-scale) for details.

## The Bottom Line

You don't need to worry about which component will try to phone home. Because IOMETE runs its control plane, metadata, identity, policy engine and compute inside your own Kubernetes cluster, an air gap is a deployment detail, not a redesign.

Read the [architecture overview](/resources/getting-started/architecture) or [talk to our team](https://iomete.com/contact-us) about your air-gapped requirements.

<FAQSection faqs={[
  {
    question: "What is an air-gapped data platform?",
    answer: "An air-gapped data platform runs every component it needs, including the control plane, metadata, identity and storage, inside a network with no connection to the internet.",
    answerContent: (<><p>An air-gapped data platform runs every component it needs, including the control plane, metadata, identity and storage, inside a network with no connection to the internet.</p></>)
  },
  {
    question: "Does IOMETE need a connection to a vendor cloud?",
    answer: "No. IOMETE deploys as a Helm chart into your own Kubernetes cluster, and all platform services, including the control plane, run there.",
    answerContent: (<><p>No. IOMETE deploys as a Helm chart into your own Kubernetes cluster, and all platform services, including the control plane, run there.</p></>)
  },
  {
    question: "Where does IOMETE store metadata?",
    answer: "In a PostgreSQL server you run. IOMETE creates separate databases in it for the Hive Metastore, the Iceberg catalog, access policies and each platform service.",
    answerContent: (<><p>In a PostgreSQL server you run. IOMETE creates separate databases in it for the Hive Metastore, the Iceberg catalog, access policies and each platform service.</p></>)
  },
  {
    question: "How do I get container images into an air-gapped cluster?",
    answer: "Mirror the images into a container registry inside your network and register it in IOMETE as a private Docker registry for the relevant namespace.",
    answerContent: (<><p>Mirror the images into a container registry inside your network and register it in IOMETE as a private Docker registry for the relevant namespace.</p></>)
  },
  {
    question: "Which storage can IOMETE use on-premises?",
    answer: "S3-compatible object storage such as Dell ECS and MinIO, as well as cloud object stores when they're allowed.",
    answerContent: (<><p>S3-compatible object storage such as Dell ECS and MinIO, as well as cloud object stores when they're allowed.</p></>)
  }
]} />

## Sources

- [IOMETE Architecture Overview](/resources/getting-started/architecture)
- [IOMETE Scalability](/resources/getting-started/scalability)
- [IOMETE Kubernetes Network Policies](/resources/deployment/network-policies)
- [IOMETE Private Docker Registry](/resources/user-guide/private-docker-registry)
- [Apache Iceberg REST Catalog Specification](https://iceberg.apache.org/rest-catalog-spec/)
