---
title: "Who Runs What in an IOMETE Kubernetes-Native Lakehouse?"
description: "Trace an order from source to BI in a Kubernetes-native lakehouse. See what IOMETE packages, what you supply, and which OpenShift versions it has tested."
keywords: [Kubernetes-native lakehouse, OpenShift, Spark Operator]
slug: kubernetes-lakehouse-component-ownership
authors: fuad
tags2: [Technical, Educational]
coverImage: img/blog/thumbnails/lightStone.png
date: 11/26/2026
hide_table_of_contents: false
last_update:
  date: 2026-11-26
  author: Fuad Musayev
---

A dashboard stops updating after the morning orders arrive. Who checks the source feed, the Spark job, the catalog, and the BI connection? Installing a Kubernetes-native lakehouse doesn't assign those responsibilities.

IOMETE packages the services that run Spark applications, manage Iceberg catalogs, and serve SQL. You supply Kubernetes, object storage, a metadata database, and the network paths between them. Following one order through those layers gives you a practical ownership checklist.

{/* truncate */}

import FAQSection from '@site/src/components/FAQSection';

## Following a Workload Through the Kubernetes-Native Lakehouse

For a daily orders report, a successful Spark run tells you nothing about whether the right rows arrived or the dashboard can read them. Follow the order through five steps:

1. **Ingestion:** Your extraction or CDC process delivers records from the source. That process needs source credentials, schema handling, retries, and a recovery position. Alternatively, IOMETE's optional Event Stream accepts HTTP events and writes Iceberg tables. It isn't a universal source connector.
2. **Storage:** Object storage holds table files and Iceberg metadata files. IOMETE configures access to that storage; installing the platform doesn't provision your production storage service.
3. **Processing:** A Spark application reads the input and writes curated Iceberg tables. Spark drivers and executors consume Kubernetes capacity independently of the stored data.
4. **Catalog:** The Iceberg catalog resolves table metadata for engines. The user-facing Data Catalog adds discovery, descriptions, and classifications. PostgreSQL backs platform and catalog services; it isn't the warehouse for order rows.
5. **Analytics:** A BI client connects to a running compute endpoint. The gateway routes connections, while Spark executes SQL against the tables.

The [architecture overview](/resources/getting-started/architecture) documents these services. Keep the catalog, storage, and compute dependencies separate in your failure diagram.

## Separating Packaged Services From Supplied Infrastructure

Packaging tells you what installs together, not who operates everything. The [deployment architecture reference](/resources/deployment/architecture-deployment) lists the chart's services and feature flags.

| Boundary | IOMETE Provides | Your Deployment Supplies |
|---|---|---|
| Platform | Console, gateway, identity, SQL services, and Data Catalog | DNS, certificates, ingress, identity-provider configuration |
| Execution | Spark Operator, submission services, history service, and orchestration components | Kubernetes nodes, capacity, quotas, scratch storage, and image access |
| Persistence | Iceberg catalog and metastore services | Reachable object storage, PostgreSQL, backups, and tested restoration |
| Data Movement | Spark execution and optional Event Stream | Source systems, extraction logic, credentials, and replay strategy |
| Consumption | Compute endpoints and documented client integrations | BI tools, drivers, client configuration, and report ownership |

This is a technical boundary, not a support-contract assignment. Record the operator for each dependency in your runbook. The [deployment options](https://iomete.com/product/deployment) provide broader context, but local recovery responsibilities still need an explicit agreement.

## Distinguishing Controllers and Schedulers

Several components influence execution, so “the scheduler” isn't a useful incident description. Identify whether work is waiting for submission, application reconciliation, node placement, or execution inside Spark.

- **IOMETE platform services** manage compute definitions, application submission, access settings, and execution status.
- **The OpenShift IOMETE Operator** reconciles the platform installation from its custom resource. It isn't the Spark Operator.
- **The Spark Operator** watches `SparkApplication` resources and manages application lifecycle. Its webhook validates and mutates submissions.
- **Kubernetes controllers** reconcile resources such as Deployments. The [Kubernetes scheduler](https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/) assigns pending pods to suitable nodes.
- **The Job Orchestrator** queues application runs according to priority and resource availability. It doesn't replace Kubernetes pod placement.
- **Spark's driver and scheduler** coordinate execution across executors. [Spark's Kubernetes documentation](https://spark.apache.org/docs/latest/running-on-kubernetes.html) distinguishes application execution from pod scheduling.

A queued application and a pending driver pod therefore require different checks. Start with the orchestrator's queue reason for the former; inspect Kubernetes events and placement constraints for the latter.

## Reading Supported and Validated Configurations

Support ranges and validation results answer different questions. A supported range states coverage; a validated configuration identifies a combination explicitly tested in the documentation.

The public [OpenShift deployment guide](/resources/deployment/openshift) lists:

| Component | Documented Support | Explicit Validation |
|---|---|---|
| Red Hat OpenShift | 4.18 and later | OpenShift 4.22 with IOMETE Operator 1.0.0 |
| IOMETE Operator | 1.0.0 and later | The combination above |
| Data Plane Enterprise through Helm | 4.0.3 and later on OpenShift | No separate Helm validation combination stated |
| Other Kubernetes distributions | Installation guide names EKS, AKS, GKE, RKE2, and k3s | No release-specific version matrix found in the reviewed guides |

OpenShift support appears in the [v4.0.3 release notes](/resources/deployment/on-prem/release-notes/), dated November 18, 2026. The guide uses the default `restricted-v2` security constraint. It excludes Doris compute and Host Path volumes, and requires supplied PostgreSQL and object storage.

Don't interpret a named Kubernetes distribution as validation of every version, storage driver, or network policy. Pin the platform, operator, Kubernetes, Spark image, and client versions in your acceptance record.

## Connecting External Tools Without Expanding the Promise

Integration doesn't mean inclusion. External ingestion tools still own source capture; your BI platform still owns dashboards and semantic models.

For ingestion, the documented Kafka Iceberg Stream application consumes Kafka topics; brokers and source capture remain outside the platform package. Airflow's plugin triggers and monitors IOMETE Spark applications from an external DAG. Choose one authoritative pipeline trigger to avoid duplicate runs.

For analytics, Power BI and Tableau remain external clients. For governance, the integration directory lists OpenMetadata and Ataccama. Those tools need their own deployment and metadata collection configuration. A catalog listing isn't evidence of complete end-to-end lineage.

AI access has a separate release boundary. The release notes label the managed MCP server **beta**, disabled by default. It connects AI clients to platform tools; it doesn't supply model hosting or a complete model lifecycle. Check client reachability and approved data-egress paths before connecting an externally hosted client.

## Running a Small Acceptance Test

A two-row fixture tests more than a successful login. Run this SQL on a configured compute with a writable Iceberg catalog and permission to create a test namespace. Use a fresh, disposable namespace for each run; the statements deliberately fail if the test names already exist.

```sql
CREATE DATABASE architecture_acceptance;

CREATE TABLE architecture_acceptance.orders_raw
  (order_id BIGINT, amount DECIMAL(12,2)) USING iceberg;

INSERT INTO architecture_acceptance.orders_raw
VALUES (1, 12.50), (2, 17.50);

CREATE TABLE architecture_acceptance.orders_summary
  (order_count BIGINT, total_amount DECIMAL(22,2)) USING iceberg;

INSERT INTO architecture_acceptance.orders_summary
SELECT COUNT(*), SUM(amount)
FROM architecture_acceptance.orders_raw;

SELECT * FROM architecture_acceptance.orders_summary;
```

Expect `order_count = 2` and `total_amount = 30.00`. This fixture substitutes for ingestion; it doesn't validate your source connector.

Repeat the final query through the intended BI connection, then stop and restart the compute and query again. Verify catalog discovery after its configured sync. Test a restricted identity for the expected denial or filtering.

Finally, replay a small source batch through the real ingestion path and reconcile record counts. Record the recovery point, duplicate-handling result, and responsible operator. **Accept the architecture when those boundaries work, not merely when every pod is running.**

## Sources

- [IOMETE Deployment Architecture](/resources/deployment/architecture-deployment)
- [IOMETE on OpenShift](/resources/deployment/openshift)
- [IOMETE Integrations](/resources/integrations/overview)
- [Kubernetes Scheduler](https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/)

<FAQSection faqs={[
  {
    question: "Does a Kubernetes-Native Lakehouse Include Kubernetes and Storage?",
    answer: "The platform package and its infrastructure are separate dependencies. IOMETE supplies platform services; your deployment supplies Kubernetes, object storage, PostgreSQL, and their recovery procedures.",
    answerContent: <p>{"The platform package and its infrastructure are separate dependencies. IOMETE supplies platform services; your deployment supplies Kubernetes, object storage, PostgreSQL, and their recovery procedures."}</p>
  },
  {
    question: "Does Supported Mean Every Configuration Is Validated?",
    answer: "A support range doesn't identify every tested combination. IOMETE's OpenShift guide names a specific validated combination, which is narrower than its supported version range.",
    answerContent: <p>{"A support range doesn't identify every tested combination. IOMETE's OpenShift guide names a specific validated combination, which is narrower than its supported version range."}</p>
  },
  {
    question: "Does a Data Catalog Include End-to-End Lineage?",
    answer: "Discovery and lineage are separate capabilities. IOMETE's catalog documentation supports discovery and classification claims; it doesn't establish complete lineage across every external ingestion and BI tool.",
    answerContent: <p>{"Discovery and lineage are separate capabilities. IOMETE's catalog documentation supports discovery and classification claims; it doesn't establish complete lineage across every external ingestion and BI tool."}</p>
  }
]} />
