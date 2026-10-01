---
title: "Air-Gapped Data Lakehouse: Spark & Iceberg Fully Offline"
title_meta: "Air-Gapped Data Lakehouse: Spark & Iceberg Fully Offline"
description: "How to run a full data lakehouse (Spark, Iceberg, SQL, governance) in a disconnected network: architecture, prerequisites and offline install. Book a demo."
slug: air-gapped-data-lakehouse
authors: aytan
hide_table_of_contents: false
tags2: [Educational, Company]
coverImage: img/blog/thumbnails/1.png
draft: true
last_update:
  date: 2026-10-01
---

import DemoCta from '@site/src/components/DemoCta';
import FAQSection from '@site/src/components/FAQSection';

**Short answer:** An air-gapped data lakehouse is a complete analytics platform that runs inside a network with no internet connectivity. It includes:

- open table storage
- SQL and Spark compute
- notebooks
- a catalog
- fine-grained access control

Everything the platform needs is delivered offline: container images, Helm charts, licences and updates. IOMETE supports fully air-gapped deployment on Kubernetes, including Red Hat OpenShift.

<DemoCta variant="B" refId="blog-air-gapped" position="top" />

{/* truncate */}

## Who needs an air-gapped lakehouse

- **Defence and aerospace:** classified programmes and ministry-of-defence-grade environments.
- **Intelligence and public safety:** sensitive investigative data.
- **Central banks and critical financial infrastructure:** isolated networks for supervisory and market data.
- **Government and national data platforms:** sovereign environments with strict network segmentation.
- **Critical national infrastructure:** energy, utilities and telecom operational data.

What these teams share: they want modern analytics (open formats, Spark, SQL, notebooks, governed self-service) without sending data or telemetry anywhere.

## What "air-gapped" requires from a data platform

| Requirement | Why it matters | How IOMETE approaches it |
|---|---|---|
| **No outbound connectivity** | No call-home, external package repositories or SaaS control plane | The control plane and data planes both run inside your network |
| **Offline delivery of software** | Images and charts must arrive through an approved transfer process | Container images and Helm charts loaded into your internal registry [TODO: engineering to confirm the delivery format: image bundle / tarball / OCI archive] |
| **Offline licensing** | Licence checks can't reach the internet | [TODO: engineering/sales to confirm how licences are activated and renewed offline] |
| **Local identity** | Users come from the classified directory | LDAP/Active Directory sync, SAML/OIDC SSO with internal identity providers |
| **Fine-grained, auditable access** | Need-to-know and data classification | Ranger-based policies in the engine: table/column access, row filters, masking, tag-based policies (classify once, enforce everywhere), audit of which policy applied to each query |
| **Local storage** | No cloud object storage | S3-compatible storage inside the enclave: Ceph, MinIO, Dell ECS, Pure, NetApp StorageGRID |
| **Local observability** | Logs and metrics stay inside | Pod logs forwarded to your ELK or Loki stack; Prometheus/Grafana |
| **Controlled upgrades** | Every change goes through accreditation | Versioned releases delivered offline and applied on your schedule [TODO: engineering to describe the offline upgrade procedure] |
| **Isolation between programmes or teams** | Different classification levels or projects | Domains mapped to Kubernetes namespaces, each with its own quotas, catalog permissions and audit logs |

## Reference architecture

```text
                 ┌─────────────────── Air-gapped enclave ───────────────────┐
 Approved        │  Internal container registry  ◄── images/charts loaded   │
 transfer  ────► │  (e.g. Harbor / OpenShift registry)                      │
 (media/diode)   │                                                          │
                 │  Kubernetes / OpenShift cluster                          │
                 │   ├─ IOMETE control plane (UI, catalog, policies, audit) │
                 │   └─ IOMETE data plane(s): Spark SQL endpoints, jobs,    │
                 │      streaming, Jupyter notebooks                        │
                 │                                                          │
                 │  S3-compatible object storage (Iceberg tables)           │
                 │  LDAP / AD · internal IdP · ELK/Loki · Prometheus        │
                 │  BI tools (JDBC/ODBC) inside the enclave                 │
                 └──────────────────────────────────────────────────────────┘
```

[TODO: design to replace this with an IOMETE-styled diagram.]

## Preparing for an air-gapped installation: checklist

- [ ] Kubernetes or OpenShift cluster inside the enclave (the IOMETE Operator is Red Hat OpenShift Certified)
- [ ] Internal container registry reachable from the cluster
- [ ] S3-compatible object storage, with buckets and credentials
- [ ] Database for platform metadata [TODO: engineering to list supported options; see /resources/deployment/backend-databases]
- [ ] LDAP/AD or internal SSO details
- [ ] Internal DNS names and TLS certificates (internal CA) for ingress
- [ ] Approved transfer process for software bundles and updates
- [ ] Log and metrics destinations (ELK/Loki, Prometheus)

## Offline installation steps

[TODO: engineering to supply the offline install steps. At minimum:

1. Download/receive the release bundle (images and Helm charts/Operator bundle) and verify checksums/signatures.
2. Transfer it into the enclave via the approved process.
3. Push images to the internal registry and point Helm values / the Operator at it.
4. Install the control plane and data plane with offline values (no external repositories).
5. Configure storage, identity, TLS and logging.
6. Apply the licence offline.
7. Run the post-install validation.
8. Upgrade procedure for future releases.]

Link the finished steps to the docs: `/resources/deployment/air-gapped-install` (new). Link from `/resources/deployment/on-prem/install`.

<FAQSection faqs={[
  {
    question: "Can a data lakehouse run with no internet access at all?",
    answer: "Yes. IOMETE can be deployed fully air-gapped. The control plane, compute, catalog and storage all run inside your network, and software is delivered offline."
  },
  {
    question: "Which Kubernetes distributions work in air-gapped environments?",
    answer: "IOMETE runs on standard Kubernetes distributions. The IOMETE Operator is Red Hat OpenShift Certified, which is common in classified and regulated environments."
  },
  {
    question: "What storage does an air-gapped lakehouse use?",
    answer: "S3-compatible object storage inside the enclave, such as Ceph, MinIO, Dell ECS, Pure or NetApp StorageGRID. Data is stored as Apache Iceberg tables."
  },
  {
    question: "How are users and permissions managed offline?",
    answer: "Through your internal LDAP/Active Directory and SSO. Access policies (table, column, row, masking and tag-based) are enforced inside the engine and audited."
  },
  {
    question: "Can analysts use BI tools and notebooks in the enclave?",
    answer: "Yes. BI tools connect over JDBC/ODBC inside the network, and Jupyter notebooks run on the platform next to the data."
  }
]} />

## Talk to us about your environment

<DemoCta variant="B" refId="blog-air-gapped" position="bottom" />

**Related:**

- [IOMETE deployment options](https://iomete.com/product/deployment)
- [Migrating off Cloudera/Hadoop](/blog/cloudera-hadoop-migration)
- [A self-hosted alternative for teams leaving SaaS lakehouses](/blog/databricks-alternatives)
- [Apache Ranger data security](/blog/apache-ranger-data-security)

*Red Hat and OpenShift are trademarks of Red Hat, Inc. Apache®, Apache Spark™, Apache Iceberg™ and Apache Ranger™ are trademarks of the Apache Software Foundation. Other names are trademarks of their respective owners.*

**Sources:** https://iomete.com/product/deployment ("Support for air-gapped environments", OpenShift), https://iomete.com/llms.txt (air-gapped, storage list, Ranger, observability), https://iomete.com/faq (air-gapped definition); OpenShift Operator certification announcement 2026-05-20. Engineering must confirm every TODO.
