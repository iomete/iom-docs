---
title: "Running Iceberg Maintenance in Production: Safety Mechanisms and Hard-Won Lessons"
description: Production lessons from running automated Apache Iceberg table maintenance — write conflict handling, orphan cleanup safety, and operational patterns.
slug: under-the-hood-optimizations
authors: [ujjawal,Shashank,abhishek]
hide_table_of_contents: true
tags2: [Engineering]
banner_description: Most maintenance guides explain what operations to run. Few discuss what happens after those operations are deployed across a production lakehouse.
date: 06/07/2026
---

# Running Iceberg Maintenance in Production

<details>
  <summary><strong>This is Part 5 of our Apache Iceberg Table Maintenance series. Explore the full series:</strong></summary>

* Part 1: [The Hidden Debt in Your Lakehouse Tables](/blog/hidden-debt-in-lakehouse-tables)
* Part 2: [What Iceberg Gives You for Table Maintenance](/blog/iceberg-maintenance-operations)
* Part 3: [The Iceberg Table Maintenance Landscape](/blog/iceberg-maintenance-alternatives)
* Part 4: [How We Built Automated Table Maintenance](/blog/how-we-built-automated-maintenance)
* Part 5: Running Iceberg Maintenance in Production
* Part 6: Why We Rebuilt Orphan File Cleanup from Scratch *(coming soon)*
</details>

---

In [Part 4](/blog/how-we-built-automated-maintenance), we explored the architecture behind our automated maintenance system: the detect-evaluate-execute pipeline, the split execution model, and the configuration hierarchy. That post focused on how we built the system. This one focuses on what happened after we put it into production.

Running compaction on a single table is relatively straightforward. Running compaction, snapshot expiration, orphan cleanup, and manifest optimization across hundreds of tables on shared infrastructure, while production workloads continue uninterrupted, is an entirely different challenge. The operations themselves do not change. The operating environment does.

As organizations move from manual or scheduled maintenance to automation at scale, they tend to encounter the same set of problems. Not because the underlying tools are insufficient, but because production introduces constraints that rarely appear in isolated examples: shared compute resources, continuous ingestion, competing workloads, cost controls, and the need to keep the entire system observable without creating an operational burden.

At that point, table maintenance stops being a collection of background jobs and becomes a scheduling, resource management, and reliability problem.

This post explores those challenges and the lessons we learned while running automated Iceberg maintenance across large-scale production environments.

—-

## **Challenge \#1: Not Every Table Needs the Same Maintenance**

One of the first mistakes teams make when automating table maintenance is treating every table the same.

The logic is understandable. A single compaction threshold, a single snapshot retention policy, and a single schedule are easy to configure and easy to explain. Unfortunately, they rarely survive contact with a real production environment.

Tables within a lakehouse behave very differently depending on how they are written, queried, and consumed:

* Fact tables fed by streaming pipelines can generate thousands of small files every day. They often require frequent compaction and aggressive snapshot expiration.  
* Dimension tables may change only a few times per week. Running daily maintenance against them consumes resources without delivering meaningful benefits.  
* Append-only log tables grow continuously but rarely receive updates or deletes. Snapshot cleanup may be important, while compaction can often be deferred.  
* Historical or archived tables may remain untouched for months. In many cases, the best maintenance strategy is to leave them alone entirely.

A uniform policy inevitably creates one of two outcomes: either active tables accumulate maintenance debt because thresholds are too conservative, or quiet tables consume unnecessary compute because thresholds are too aggressive.

Neither scales well.

As the number of tables grows, maintenance becomes a prioritization problem rather than a scheduling problem. The system must be able to distinguish between tables that need attention and tables that do not.

In Part 4, we described how our evaluate phase uses table metrics and configurable thresholds to make these decisions dynamically. More broadly, any production-grade maintenance system needs a mechanism to adapt maintenance behavior based on table characteristics, whether through table tiers, per-table policies, or metric-driven triggers.

## **Challenge \#2: Monitoring Table Health**

Maintenance is easy to automate. Knowing whether it is working is much harder.

One of the most common operational blind spots we see is the absence of meaningful table health visibility. Teams can often tell you whether a maintenance job succeeded or failed, but they cannot easily answer a more important question:

**Did the table actually become healthier?**

A successful compaction job does not necessarily mean small file problems have been resolved. A completed snapshot expiration task does not automatically mean metadata growth is under control. Operational success and table health are related, but they are not the same thing.

To understand whether maintenance is delivering value, teams need visibility into metrics such as:

* Small file count  
* Average file size  
* Metadata file growth  
* Snapshot count  
* Storage consumption  
* Maintenance backlog  
* Query performance trends

These indicators provide an early warning system for emerging maintenance debt. A gradual increase in small file counts or snapshot growth often appears long before users notice slower queries or rising infrastructure costs.

Without this visibility, maintenance becomes reactive. Problems are discovered only after performance degrades, storage costs increase, or maintenance jobs begin falling behind.

At scale, observability is not just a reporting feature. It is what allows teams to understand the health of their lakehouse, prioritize maintenance work intelligently, and measure whether their maintenance strategy is actually producing results.

## **Challenge \#3: Protecting Shared Catalog Infrastructure**

Most maintenance discussions focus on individual tables. In production, the bigger concern is often the catalog itself.

Every maintenance operation ultimately interacts with the catalog. Compaction commits new snapshots. Snapshot expiration updates metadata. Manifest optimization rewrites metadata structures. Even evaluating table health requires catalog reads.

On a single table, this activity is negligible. Across hundreds or thousands of tables, it can become a significant source of load.

A common mistake is treating maintenance as a purely table-level concern. In reality, maintenance generates a continuous stream of catalog operations, and excessive maintenance activity can impact completely unrelated workloads sharing the same catalog infrastructure.

For example, running maintenance across a large fleet of tables simultaneously can create bursts of metadata reads, commit operations, and catalog updates. As load increases, users may experience slower table loading times, increased metadata latency, or longer commit durations for production workloads.

The challenge becomes especially visible in multi-tenant environments where ingestion pipelines, interactive queries, and maintenance jobs all depend on the same catalog service.

At that point, the objective is no longer just keeping tables healthy. It is keeping the entire platform healthy.

Production systems need safeguards to prevent maintenance workloads from overwhelming shared infrastructure:

* Concurrency limits  
* Catalog-aware scheduling  
* Backpressure mechanisms  
* Maintenance workload throttling  
* Load-aware execution policies

These controls allow maintenance to progress steadily without competing aggressively with production traffic.

The most effective maintenance systems behave like good background services: they consume available capacity when the platform is quiet and back off when higher-priority workloads need resources. The goal is to reduce maintenance debt without introducing operational debt elsewhere in the platform.

## **Challenge \#4: Managing Configuration Across Multiple Layers**

Configuration seems straightforward when a maintenance system is first deployed. A few global settings, a handful of thresholds, and everything behaves predictably.

That simplicity rarely lasts.

As adoption grows, different teams begin to require different maintenance behaviors. Some tables need longer retention periods for compliance. Others need more aggressive compaction because they support latency-sensitive analytics. Over time, configuration naturally spreads across multiple layers:

* Platform defaults  
* Catalog-level configuration  
* Namespace-level policies  
* Table-level overrides

The challenge is not supporting these layers. The challenge is ensuring they remain understandable.

Conflicts inevitably emerge. A platform administrator may configure snapshot expiration after 30 days, while a specific table requires 90-day retention for regulatory reasons. A catalog may define compaction thresholds that differ from the optimization requirements of a high-volume streaming table.

Without a clear model, maintenance behavior becomes difficult to reason about. Users see actions being executed but cannot easily determine which configuration triggered them.

In production, predictability matters as much as flexibility.

A maintenance platform should provide:

* A well-defined configuration hierarchy  
* Explicit override behavior  
* Visibility into effective settings  
* Validation and guardrails for unsafe configurations

Most importantly, users should always be able to answer a simple question:

**Why did this maintenance action run?**

If the answer requires tracing multiple configuration layers manually, the system will become increasingly difficult to operate as it scales.

## **Challenge \#5: Keeping Defaults Simple**

One of the easiest ways to make automated maintenance difficult to adopt is to expose every available tuning parameter.

From an engineering perspective, configurability is attractive. Iceberg exposes a rich set of maintenance controls, and it is tempting to surface all of them to users. In practice, this often creates more problems than it solves.

Most users do not want to become experts in:

* Compaction strategies  
* Snapshot lifecycle management  
* Metadata growth patterns  
* Maintenance scheduling policies  
* Resource allocation decisions

They simply want their tables to remain healthy.

The reality is that every additional setting introduces another decision, another potential misconfiguration, and another operational burden. What begins as flexibility can quickly become complexity.

A successful maintenance platform should provide sensible defaults that work for the vast majority of tables while still allowing advanced users to override behavior when necessary.

The goal is not to eliminate configurability. It is to make configuration optional.

Users should be able to enable automated maintenance and receive meaningful benefits immediately, without spending hours tuning thresholds or studying maintenance internals. The platform should absorb the operational complexity and expose only the controls that users genuinely need.

In our experience, adoption is driven far more by good defaults than by extensive configuration options. The most successful maintenance systems are often the ones users rarely have to think about.

---

## **Challenge \#7: Building for Failure and Scale**

Maintenance operations are long-running, resource-intensive, and inherently unpredictable.

A compaction job that normally completes in a few minutes may suddenly take hours because of increased data volume, infrastructure issues, storage bottlenecks, or contention with other workloads. Snapshot expiration may encounter transient catalog failures. A worker process may restart halfway through a maintenance task.

In production, failures are not exceptional events. They are expected.

Any maintenance system that assumes every operation will complete successfully will eventually become unreliable. The question is not whether failures will occur, but how the system behaves when they do.

Production-grade maintenance platforms require safeguards such as:

* Timeouts for stalled operations  
* Automatic retries for transient failures  
* Recovery after service restarts  
* Detection of orphaned or stuck tasks  
* Persistent task state and progress tracking

Without these protections, failures can leave maintenance work in an unknown state. Tasks may run indefinitely, work may be duplicated, or the system may simply lose track of maintenance operations altogether.

Reliability, however, is only half of the challenge.

A maintenance service that performs well for 100 tables may struggle when responsible for thousands. As table counts and data volumes increase, the maintenance platform itself must scale without becoming a bottleneck.

This introduces a different set of requirements:

* Efficient processing of large table fleets  
* Independent scaling of workers, catalogs, and compute resources  
* Distribution of maintenance work across multiple service instances  
* Predictable behavior during spikes in maintenance demand

At scale, the maintenance platform becomes part of the critical infrastructure of the lakehouse. It must be designed with the same reliability and scalability expectations as any other production service.

Ultimately, the maintenance system should require less operational attention than the tables it is responsible for maintaining. If operators spend more time managing the maintenance platform than benefiting from it, the automation has failed its primary purpose.

---

## **What We Built Differently**

The challenges above shaped many of the design decisions in our maintenance platform. Rather than treating maintenance as a collection of scheduled jobs, we approached it as a production service that needed to be observable, resource-aware, and predictable at scale.

### **Making Maintenance Observable**

One of our primary goals was to make maintenance visible rather than something users simply trust is working.

For every maintenance operation, we capture metrics before and after execution so users can immediately understand its impact. Instead of reporting only that a maintenance task succeeded, we show what actually changed.

For example:

* **Rewrite Data Files** tracks data file count and total data file size.  
* **Expire Snapshots** tracks snapshot count.  
* **Rewrite Manifest Files** tracks manifest file count and total manifest size.  
* **Cleanup Orphan Files** tracks data and metadata file counts along with their storage footprint.

This allows users to answer practical questions such as:

* Did compaction actually reduce the number of small files?  
* How many snapshots were removed?  
* Did manifest optimization reduce metadata overhead?  
* How much storage was reclaimed through orphan file cleanup?

Observability becomes even more important when maintenance fails. Every operation records its execution status and surfaces error information directly to the user. This eliminates the need to inspect service logs or investigate maintenance jobs externally.

Our goal was simple: users should always be able to understand what maintenance did, why it ran, and whether it produced the expected outcome.

### **Minimizing Catalog Load**

Protecting shared catalog infrastructure was another key design requirement.

Rather than treating maintenance as a single workflow, we separated it into three independent stages: Detection, Evaluation, and Execution. This allows load to be controlled independently at each stage and prevents expensive maintenance operations from overwhelming the system. (Part 4 covers this architecture in greater detail.)

We also introduced several optimizations to reduce unnecessary catalog activity:

* Frequently accessed catalog and table-level maintenance settings are cached within the service.  
* Configurable cooldown periods prevent recently evaluated or maintained tables from being reconsidered immediately.  
* Evaluation cycles are intentionally designed to avoid repeatedly scanning the same tables before maintenance effects have had time to materialize.

These mechanisms significantly reduce metadata lookups, catalog traffic, and redundant evaluations.

Most importantly, they allow the system to continuously monitor table health without generating excessive load on the catalog itself.

The objective is not to run maintenance as aggressively as possible. The objective is to improve table health while remaining a well-behaved citizen within a shared lakehouse environment.

### **Keeping Configuration Predictable**

As maintenance capabilities grow, configuration management can quickly become a source of complexity.

Many platforms accumulate configuration layers over time—global defaults, environment-specific overrides, namespace policies, table-level settings, and operation-specific exceptions. While flexible, these approaches often make maintenance behavior difficult to understand and troubleshoot.

We deliberately chose a simpler model.

Maintenance configuration exists at only two levels:

* Catalog-level configuration  
* Table-level configuration

Both IOMETE-specific maintenance properties and native Iceberg properties are stored alongside catalog and table metadata, creating a single source of truth for maintenance behavior.

Just as importantly, we wanted maintenance decisions to be explainable. Every maintenance run records and displays the effective configuration that was used, allowing users to understand exactly why a compaction, snapshot expiration, manifest rewrite, or orphan cleanup operation was executed with a particular set of parameters.

When multiple configurations are present, the following precedence order is applied:

1. IOMETE table configuration  
2. Iceberg table configuration  
3. IOMETE catalog configuration  
4. Iceberg catalog configuration

This approach provides flexibility where it is needed while keeping configuration resolution transparent and predictable.

Users should never have to guess which setting was applied. The effective configuration is always visible, making maintenance behavior easier to understand, validate, and troubleshoot.

### **Building for Reliability and Scale**

Maintenance operations are long-running and not immune to failures. Infrastructure interruptions, transient catalog issues, and workload spikes are all realities of production environments.

To keep maintenance reliable at scale, we built several safeguards into the platform:

* **Cooldown periods** prevent tables from being repeatedly evaluated or maintained, reducing unnecessary work and catalog load.  
* **Persistent task tracking** ensures maintenance state survives service restarts and allows tasks to be monitored throughout their lifecycle.  
* **Automatic retries** help recover from transient failures without requiring manual intervention.  
* **Operation timeouts** detect and terminate stalled maintenance tasks before they impact the system.  
* **Distributed workers** allow maintenance capacity to scale horizontally as the number of tables and maintenance workload grows.

Together, these mechanisms help ensure that the maintenance platform remains resilient, scalable, and capable of operating continuously across large production environments.

## **Lessons Learned**

After helping teams operate large Iceberg deployments, several patterns emerge:

1. Maintenance schedules become obsolete as environments grow.  
2. Table health metrics are more valuable than cron schedules.  
3. Cost control is essential.  
4. Automation without observability creates operational risk.  
5. The objective is not perfect tables—it is predictable performance at acceptable cost.

## **Conclusion**

Iceberg maintenance is often discussed as a collection of table operations. In production, it becomes an operational discipline.

The challenge is no longer how to compact files, expire snapshots, or optimize metadata. The challenge is deciding when maintenance should run, which tables need attention, and how to balance table health against operational cost and platform stability.

Organizations that approach maintenance as a production system rather than a collection of maintenance tasks gain more than healthier tables. They achieve more predictable performance, better resource utilization, lower operational overhead, and a more reliable lakehouse platform.

As lakehouse environments continue to grow, the success of a maintenance strategy will depend less on the individual maintenance operations and more on the systems used to manage them at scale.

