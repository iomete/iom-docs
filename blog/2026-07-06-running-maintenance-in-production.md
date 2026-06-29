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

The maintenance job showed green but the table wasn't actually healthier.

That gap between a successful maintenance run and an actually healthier table captures why table maintenance is more than just executing maintenance operations. 

In [Part 4](/blog/2026-06-22-how-we-built-automated-maintenance.md), we explained how the system was designed and why it was built that way. This post shifts the focus from architecture to operations, what it takes to keep automated maintenance effective when hundreds of production tables are being updated continuously. 

Running compaction, snapshot expiration, orphan cleanup, and manifest optimization across hundreds of actively written tables is a different problem altogether. The maintenance operations don't change. The environment does.
Shared compute, continuous ingestion, competing workloads, resource limits, and the need to keep everything observable without turning every table into its own monitoring project quickly changed the nature of the problem. Table maintenance stopp being a background task and become a scheduling, resource management, and reliability challenge.

The architecture gave us the foundation. Production workloads tested every assumption behind it. The rest of this post walks through the challenges we encountered and how we addressed them.

## The Challenges We Encountered

### Not Every Table Needs the Same Maintenance

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

In [Part 4](/blog/2026-06-22-how-we-built-automated-maintenance.md), we described how our evaluate phase uses table metrics and configurable thresholds to make these decisions dynamically. More broadly, any production-grade maintenance system needs a mechanism to adapt maintenance behavior based on table characteristics, whether through table tiers, per-table policies, or metric-driven triggers.

### Monitoring Table Health

Maintenance is easy to automate. Knowing whether it is working is much harder.

Teams can usually tell you whether a maintenance job succeeded or failed. What they often cannot answer is:

**Did the table actually become healthier?**

A successful compaction job doesn't necessarily mean the small file problem is resolved. A completed snapshot expiration doesn't mean metadata growth is under control. Operational success and table health are related, but they are not the same thing.

The metrics that reveal actual table health are things like small file count, average file size, snapshot count, metadata file growth, and storage consumption. These move slowly — a problem building over days or weeks rarely announces itself until it surfaces as slower queries or unexpectedly rising storage costs.

Without visibility into these signals, maintenance becomes reactive. By the time something is obviously wrong, the debt has already accumulated.

The goal of observability isn't reporting for its own sake. It's the difference between knowing that maintenance *ran* and knowing that maintenance *worked*.

### Protecting Shared Catalog Infrastructure

Most maintenance discussions focus on individual tables. In production, the bigger concern is often the catalog itself.

Every maintenance operation ultimately interacts with the catalog. Compaction commits new snapshots. Snapshot expiration updates metadata. Manifest optimization rewrites metadata structures. Even evaluating table health requires catalog reads.

On a single table, this activity is negligible. Across hundreds or thousands of tables running in parallel, it becomes a steady stream of metadata operations and that stream competes with everything else sharing the same catalog: ingestion pipelines, interactive queries, production commits.

Running maintenance across a large table fleet simultaneously can create bursts of catalog load that cause slower table loading, increased metadata latency, and longer commit durations for workloads that have nothing to do with maintenance.

At that point, the objective is no longer just keeping tables healthy. It is keeping the entire platform healthy.

The controls that help are concrete: limit how many tables can be maintained at the same time, introduce cooldown periods so recently-touched tables aren't immediately re-evaluated, and reduce catalog reads by caching frequently accessed settings. The underlying principle is simple — maintenance should behave like a good background service, consuming spare capacity when the platform is quiet and stepping back when production workloads need it.

### Managing Configuration Across Multiple Layers

Configuration seems straightforward when a maintenance system is first deployed. A few global settings, a handful of thresholds, and everything behaves predictably.

That simplicity rarely lasts.

As adoption grows, different teams begin to require different maintenance behaviors. Some tables need longer retention periods for compliance. Others need more aggressive compaction because they support latency-sensitive analytics. Over time, configuration spreads across platform defaults, catalog policies, namespace rules, and table-level overrides.

The challenge is not supporting these layers. The challenge is ensuring they remain understandable.

Conflicts inevitably emerge. A platform administrator may configure snapshot expiration after 30 days, while a specific table requires 90-day retention for regulatory reasons. A catalog may define compaction thresholds that don't fit the requirements of a high-volume streaming table. In production, predictability matters as much as flexibility, and a system that cannot explain its own behavior undermines both.

Users should always be able to answer one question:

**Why did this maintenance action run?**

If the answer requires digging through multiple layers, the system has transferred its complexity to its users. The effective configuration should always be visible, not inferred.

### Keeping Defaults Simple

One of the easiest ways to make automated maintenance difficult to adopt is to expose every available tuning parameter.

From an engineering perspective, configurability is attractive. Iceberg exposes a rich set of maintenance controls, and it is tempting to surface all of them to users. In practice, most users don't want to become experts in compaction strategies, snapshot lifecycle management, or resource allocation. They simply want their tables to remain healthy.

Every additional setting introduces another decision, another potential misconfiguration, and another reason to delay adoption. What begins as flexibility quickly becomes complexity.

The goal is not to eliminate configurability. It is to make configuration optional.

Users should be able to turn on automated maintenance and immediately see results. The best maintenance system is the one nobody has to think about.

### Building for Failure and Scale

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

## What We Built Differently

The challenges above shaped many of the design decisions in our maintenance platform. Rather than treating maintenance as a collection of scheduled jobs, we approached it as a production service that needed to be observable, resource-aware, and predictable at scale.

### Making Maintenance Observable

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

### Minimizing Catalog Load

Protecting shared catalog infrastructure was another key design requirement.

Rather than treating maintenance as a single workflow, we separated it into three independent stages: Detection, Evaluation, and Execution. This allows load to be controlled independently at each stage and prevents expensive maintenance operations from overwhelming the system. (Part 4 covers this architecture in greater detail.)

We also introduced several optimizations to reduce unnecessary catalog activity:

* Frequently accessed catalog and table-level maintenance settings are cached within the service.  
* Configurable cooldown periods prevent recently evaluated or maintained tables from being reconsidered immediately.  
* Evaluation cycles are intentionally designed to avoid repeatedly scanning the same tables before maintenance effects have had time to materialize.

These mechanisms significantly reduce metadata lookups, catalog traffic, and redundant evaluations.

Most importantly, they allow the system to continuously monitor table health without generating excessive load on the catalog itself.

The objective is not to run maintenance as aggressively as possible. The objective is to improve table health while remaining a well-behaved citizen within a shared lakehouse environment.

### Keeping Configuration Predictable

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

### Building for Reliability and Scale

Maintenance operations are long-running and not immune to failures. Infrastructure interruptions, transient catalog issues, and workload spikes are all realities of production environments.

To keep maintenance reliable at scale, we built several safeguards into the platform:

* **Cooldown periods** prevent tables from being repeatedly evaluated or maintained, reducing unnecessary work and catalog load.  
* **Persistent task tracking** ensures maintenance state survives service restarts and allows tasks to be monitored throughout their lifecycle.  
* **Automatic retries** help recover from transient failures without requiring manual intervention.  
* **Operation timeouts** detect and terminate stalled maintenance tasks before they impact the system.  
* **Distributed workers** allow maintenance capacity to scale horizontally as the number of tables and maintenance workload grows.

Together, these mechanisms help ensure that the maintenance platform remains resilient, scalable, and capable of operating continuously across large production environments.

## Lessons Learned

After helping teams operate large Iceberg deployments, several patterns emerge:

1. Maintenance schedules become obsolete as environments grow.  
2. Table health metrics are more valuable than cron schedules.  
3. Cost control is essential.  
4. Automation without observability creates operational risk.  
5. The objective is not perfect tables—it is predictable performance at acceptable cost.

## Conclusion

Iceberg maintenance is often discussed as a collection of table operations. In production, it becomes an operational discipline.

The challenge is no longer how to compact files, expire snapshots, or optimize metadata. The challenge is deciding when maintenance should run, which tables need attention, and how to balance table health against operational cost and platform stability.

Organizations that approach maintenance as a production system rather than a collection of maintenance tasks gain more than healthier tables. They achieve more predictable performance, better resource utilization, lower operational overhead, and a more reliable lakehouse platform.

As lakehouse environments continue to grow, the success of a maintenance strategy will depend less on the individual maintenance operations and more on the systems used to manage them at scale.

