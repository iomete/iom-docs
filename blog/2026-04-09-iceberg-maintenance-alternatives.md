---
title: "The Iceberg Table Maintenance Landscape: From Open-Source to Fully Managed"
description: Honest comparison of every Iceberg table maintenance option — Apache Amoro, Snowflake, Databricks, AWS, and more. What each offers and what's still missing.
slug: iceberg-maintenance-alternatives
authors: abhishek
hide_table_of_contents: true
tags2: [Engineering]
banner_description: From open-source projects to fully managed platforms — an honest assessment of every Iceberg table maintenance option available today.
date: 04/09/2026
---

# The Iceberg Table Maintenance Landscape: From Open-Source to Fully Managed

The previous post covered what Iceberg gives you out of the box — the four maintenance procedures, what each does at the file level, and where the DIY path leads. This post maps the alternatives: from open-source projects attempting to automate Iceberg maintenance, to fully managed platforms that handle it invisibly, to the gaps that persist across all of them.

This is the third post in our series on Iceberg table maintenance. [Part 1](/blog/hidden-debt-in-lakehouse-tables) covered why unmaintained tables rot. [Part 2](/blog/iceberg-maintenance-operations) went deep on the operations themselves. Here, we evaluate the options — honestly.

## Open-Source Projects

Two open-source projects tackle Iceberg maintenance automation directly. Both are free and self-hosted, but at very different maturity levels.

**[Apache Amoro](https://amoro.apache.org/)** (incubating) is the most ambitious project in this space. It's a standalone management service that provides [self-optimizing tables](https://amoro.apache.org/docs/latest/self-optimizing/) for Iceberg, with continuous monitoring and automatic maintenance.

The architecture is straightforward: an [AMS (Amoro Management Service)](https://amoro.apache.org/docs/latest/admin-guides/deployment-on-kubernetes/) coordinates everything, Spark-based "optimizer" pods execute the actual work on Kubernetes, and a REST Catalog integration provides metadata access. The AMS polls tables every minute, evaluates them against thresholds, creates optimization plans, and dispatches tasks to optimizer pods.

Amoro's compaction is different from Iceberg's built-in procedures. It implements its own planning and sizing logic across three tiers: Minor (compact small files, convert equality deletes to positional deletes), Major (merge undersized files, rewrite files with high delete ratios), and Full (rewrite entire partitions on a configurable interval). The project [claims up to 10x better efficiency](https://medium.com/@jinsong.zhou1990/10x-efficiency-boost-compared-to-spark-rewritefiles-procedure-how-apache-amoro-efficiently-7e7a993950d7) than Spark's native `RewriteDataFiles` for upsert/CDC workloads, attributed to its custom file-group planning.

What Amoro gets right: it thinks about maintenance as a continuous system, not individual procedure calls. It has a health score (0-100) for each table, a cost-based priority system for partitions, optimizer groups for workload isolation, and a dashboard showing optimization history.

What we found during evaluation: Amoro is tightly coupled to its mixed-Iceberg architecture (a legacy of its Hudi/mixed-format origins). The metadata fetching is heavy; it calls `loadTable()` and downloads manifest files on every planning cycle for every table. No database-level configuration scope. No dynamic SQL filters (like `WHERE date > CURRENT_DATE - INTERVAL 7 DAYS`). No visibility into snapshot expiration or orphan cleanup runs (those only appear in debug logs). The Docker image carries critical security vulnerabilities from bundled dependencies.

Our conclusion: Amoro provides a strong foundation but requires substantial forking and modification for production use. For teams willing to invest in customization, it's worth evaluating. For teams that want something turnkey, it's not there yet. We cover our detailed engineering evaluation of Amoro — and why we ultimately built our own system — in [Part 4](/blog/how-we-built-automated-maintenance).

**[Floe](https://github.com/nssalian/floe)** is a newer project (January 2026) that takes a different approach: declarative, policy-driven maintenance for Iceberg tables across multiple catalog types — including [Apache Polaris](https://polaris.apache.org/), REST Catalog, [Nessie](https://projectnessie.org/), Hive Metastore, [Lakekeeper](https://lakekeeper.io/), [Gravitino](https://gravitino.apache.org/), and DataHub. You define policies specifying which tables to target, what operations to run, and under what conditions. Floe connects to a catalog, discovers tables, assesses their health, and dispatches maintenance jobs to Spark (via [Livy](https://livy.apache.org/)) or [Trino](https://trino.io/).

The interesting design choice is signal-based triggers alongside cron-based schedules. Floe computes a "debt score" per table based on health metrics — small file percentage, delete file count, time since last maintenance, failure history — and prioritizes higher-debt tables. Compaction fires when small file percentage exceeds a threshold, not because it's Tuesday at midnight. This is conceptually similar to the approach we independently arrived at when building IOMETE's maintenance system.

Supported operations cover the full set: data file compaction (binpack), snapshot expiration, orphan file cleanup, and manifest rewriting.

The caveat: Floe is very early stage. Version 0.1.1, a single contributor, fewer than 30 GitHub stars. It's a solo project by [Neelesh Salian](https://github.com/nssalian), not a production-grade system. The architectural ideas are sound — policy-driven, signal-based, catalog-aware — but teams evaluating it should treat it as an emerging concept, not a deployable solution. Worth watching, not yet worth adopting.

## The Paid Options: What Each Platform Offers

Here's an honest assessment of what the major platforms do. We benchmarked against these when designing our own system. The platforms fall into three categories based on where they run and what tables they can maintain.

### Cloud-Native Platforms (Managed Tables Only)

These platforms offer the smoothest maintenance experience — zero-config, invisible, fully automated. The tradeoff: automation only applies to tables managed within their own ecosystem. Bring an external catalog and you're back to manual maintenance.

**[Snowflake](https://docs.snowflake.com/en/user-guide/tables-iceberg)** — Snowflake's [managed Iceberg tables](https://docs.snowflake.com/en/user-guide/tables-iceberg-manage) get full automatic maintenance: compaction, manifest compaction, and snapshot expiry. All enabled by default. Manifest compaction and snapshot expiry can't even be disabled. As of September 2025, a new [`ENABLE_DATA_COMPACTION`](https://docs.snowflake.com/en/release-notes/2025/other/2025-09-22-enable-data-compaction-parameter) parameter lets you toggle data compaction off, but there's no knob for *how* it runs.

Truly invisible, which is exactly what most users want. But it only works for Snowflake-managed Iceberg tables. External catalog? Back to manual maintenance. Snowflake does provide an [`ICEBERG_STORAGE_OPTIMIZATION_HISTORY`](https://docs.snowflake.com/en/sql-reference/account-usage/iceberg_storage_optimization_history) Account Usage view with 365 days of compaction history (credits used, bytes scanned, rows written), but it only covers data compaction — no visibility into manifest compaction or snapshot expiry, and no before/after structural comparisons.

**[Databricks](https://docs.databricks.com/aws/en/optimizations/predictive-optimization)** — Databricks runs "[Predictive Optimization](https://docs.databricks.com/aws/en/optimizations/predictive-optimization)" for [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) managed tables. It automatically executes OPTIMIZE, VACUUM, and ANALYZE using serverless compute. Enabled by default for accounts created after November 2024, rolling out to existing accounts through April 2026. It now integrates with [Lakeflow Spark Declarative Pipelines](https://docs.databricks.com/aws/en/ldp/), bringing automatic maintenance to Materialized Views and Streaming Tables.

Zero-config, predictive (not just scheduled), and it uses serverless compute so you don't need a running cluster. Since June 2025, Predictive Optimization also applies to [Databricks-managed Iceberg tables](https://docs.databricks.com/aws/en/iceberg/) (Public Preview) — it's actually a prerequisite for creating them. But it remains limited to tables managed within Unity Catalog; external Iceberg tables don't benefit. And while you can enable/disable Predictive Optimization at the account, catalog, or schema level and configure VACUUM retention windows, there are no fine-grained knobs for how OPTIMIZE or ANALYZE run.

**AWS** — AWS offers two paths. **[Glue Data Catalog table optimizers](https://docs.aws.amazon.com/glue/latest/dg/table-optimizers.html)** support compaction (binpack, sort, z-order), snapshot retention, and orphan file deletion for Iceberg tables registered in Glue. Compaction triggers when a partition reaches a [configurable file count threshold](https://docs.aws.amazon.com/glue/latest/dg/compaction-management.html) (Glue's default: 100 files) and file size threshold (75% of target size). The optimizers run as managed background processes.

**[S3 Tables](https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-tables-maintenance.html)** take it further: fully managed Iceberg tables with automatic compaction enabled by default (target size: 512 MB, configurable between 64 MB and 512 MB). [Sort and z-order compaction were added in June 2025](https://aws.amazon.com/about-aws/whats-new/2025/06/amazon-s3-sort-z-order-compaction-apache-iceberg-tables/). AWS reports [up to 3x query performance improvement](https://aws.amazon.com/blogs/storage/how-amazon-s3-tables-use-compaction-to-improve-query-performance-by-up-to-3-times/) from their automatic compaction vs. uncompacted tables, and up to 8.5x fewer S3 read requests.

Deep AWS integration, serverless execution, and S3 Tables makes Iceberg maintenance genuinely invisible. The catch: entirely cloud-locked. Glue optimizers only work with Glue Data Catalog. S3 Tables only work on S3. No multi-cloud, no self-hosted, no external catalogs. [Onehouse published a detailed analysis](https://www.onehouse.ai/blog/s3-managed-tables-unmanaged-costs-the-20x-surprise-with-aws-s3-tables) showing S3 Tables can generate up to 20x higher costs than expected due to how compaction interacts with S3 pricing — though AWS subsequently [reduced S3 Tables compaction costs by up to 90%](https://aws.amazon.com/about-aws/whats-new/2025/07/amazon-s3-tables-reduce-compaction-costs/) in July 2025, narrowing the gap.

**[Dremio](https://www.dremio.com/)** — Dremio provides [`OPTIMIZE TABLE`](https://docs.dremio.com/current/reference/sql/commands/apache-iceberg-tables/optimize-table/) as a SQL command with parameters for target file size (default: 512 MB), min/max file sizes, and minimum input files. It handles data file compaction, manifest rewriting, and partition evolution.

Their newer offering, [Dremio Enterprise Catalog](https://docs.dremio.com/current/developer/data-formats/apache-iceberg/table-maintenance-optimization/automated-maintenance/) (powered by [Apache Polaris](https://polaris.apache.org/)), adds [automatic optimization](https://www.dremio.com/blog/introducing-the-enterprise-catalog-powered-by-apache-polaris-incubating/): continuous analysis of tables for small-file buildup, oversized files, and metadata sprawl, with background execution. As of April 2026, they also run policy-based snapshot expiration and orphan file cleanup automatically.

Strong Iceberg-native story, and the Polaris-based catalog brings automation that was missing from the open-source ecosystem. But automatic maintenance only works for tables in Dremio's own catalog. Tables in external catalogs get the manual `OPTIMIZE TABLE` command but no automation.

### On-Prem and Hybrid Platforms

These run on your own infrastructure — private cloud or on-prem — with automation tied to their platform layer. You get more control over where compute runs, but maintenance features still require their ecosystem.

**[Cloudera](https://www.cloudera.com/)** — Cloudera supports the full suite of Iceberg maintenance operations via Spark procedures: `rewrite_data_files`, `expire_snapshots`, `remove_orphan_files`, `rewrite_manifests`, and notably `rewrite_position_delete_files` — a procedure that addresses dangling position delete files left behind after compaction rewrites their referenced data files. Cloudera is one of the few vendors that explicitly documents and promotes this operation.

On the automation front, Cloudera introduced the [Lakehouse Optimizer (CLO)](https://docs.cloudera.com/management-console/cloud/clo/index.html), a managed service that automates maintenance through policy-based rules. Policies support both schedule-based execution (cron expressions) and [event-based triggers](https://community.cloudera.com/t5/Engineering-Blogs/Cloudera-Lakehouse-Optimizer-Refining-Optimizations-through/ba-p/413125) (fired on insert/update/delete). Different operations can use different trigger types — compaction event-driven, snapshot expiry on a cron, orphan cleanup monthly. CLO gathers Iceberg metadata statistics to prioritize which tables need attention.

Broadest maintenance operation coverage of any vendor, with genuine automation via CLO. But CLO requires [CDP](https://www.cloudera.com/products/cloudera-data-platform.html) infrastructure. The underlying Spark procedures are portable, but the automation layer is CDP-only. Tables managed outside Cloudera's catalog cannot benefit from CLO's scheduling.

**[Starburst](https://www.starburst.io/)** — Starburst offers scheduled maintenance with broad scope control: you can schedule tasks for a single table, an entire schema, or a full catalog. Operations include compaction, statistics collection, snapshot expiration, and orphan file removal. They call it "[Automated Table Maintenance](https://docs.starburst.io/starburst-galaxy/data-engineering/optimization-performance-and-quality/observability/data-maintenance.html)" and it's part of their [Galaxy](https://www.starburst.io/platform/starburst-galaxy/) managed platform.

The scope-based scheduling is practical for organizations with hundreds of tables, and it's [Trino](https://trino.io/)-native so you don't need Spark. [Starburst Enterprise](https://docs.starburst.io/latest/data-engineering/data-maintenance.html) (self-hosted) also supports scheduled data maintenance with the same four operations and cron expressions, though Galaxy's managed experience is more turnkey. And it's schedule-based, not reactive. If a streaming table suddenly accumulates 100,000 small files, it waits for the next scheduled window.

### Engine-Agnostic Platforms (Work Everywhere)

These sit above your existing stack — any engine, any catalog, any cloud. They don't replace your compute or storage layer; they orchestrate maintenance across whatever you already run. The tradeoff: newer companies, less battle-tested at scale.

**[Ryft](https://www.ryft.io/)** — Ryft is a dedicated Iceberg table management platform, backed by [$8M in seed funding](https://www.ryft.io/blog/ryft-seed-funding) (July 2025, Index Ventures and Bessemer). Available on [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-ymwhra25hkif4).

The platform covers compaction, snapshot expiry, orphan file cleanup, manifest optimization, and data reordering based on observed query patterns. Rather than fixed schedules, Ryft observes actual query and ingestion patterns per table and adjusts maintenance accordingly — making it one of the few platforms that claims truly adaptive, workload-aware maintenance.

Ryft integrates across engines ([Spark](https://spark.apache.org/), [Trino](https://trino.io/), Snowflake, [Athena](https://aws.amazon.com/athena/) confirmed; Flink and Presto implied) with multi-cloud support (AWS, GCP, Azure). The positioning is engine-agnostic and catalog-agnostic — a standalone management layer that works with whatever stack you already run. Still early-stage as a company, but the product scope is ambitious and the multi-engine approach addresses a real gap in the landscape.

**[LakeOps](https://lakeops.dev/)** — LakeOps positions itself as a data lake control plane — an optimization and automation layer that sits above Iceberg catalogs and query engines. The platform covers compaction, snapshot expiry, orphan cleanup, manifest rewrites, and schema evolution management.

The notable technical claim is a custom Rust-based compaction engine, which LakeOps says runs 20x faster compaction than traditional approaches. Maintenance is telemetry-driven: set policies once and the system handles ongoing execution, with event-based triggers on table size changes, query latency degradation, or cost spikes. LakeOps also supports [Delta Lake](https://delta.io/) alongside Iceberg.

Multi-engine (Spark, Trino, [Flink](https://flink.apache.org/), Snowflake, Databricks) and multi-cloud (AWS, Azure, GCP). The control-plane positioning is interesting — it doesn't replace your compute or catalog, it orchestrates maintenance across whatever you already run. The Rust-based engine claim, if validated, could be a genuine differentiator for teams where Spark-based compaction is a bottleneck.

## What We Learned and Why We Built Our Own

Evaluating this landscape taught us more than any individual platform did. Each category solved part of the problem while leaving gaps that mattered for our customers.

Cloud-native platforms proved that invisible maintenance is the right user experience. Snowflake and Databricks customers don't think about compaction — it just happens. That's the bar. But their approach only works when you control the entire stack. Our customers run Iceberg across [Spark](https://spark.apache.org/), [Trino](https://trino.io/), and [Flink](https://flink.apache.org/), often with external catalogs. "Just use our managed tables" wasn't an option.

On-prem platforms like Cloudera showed the value of event-based triggers over fixed schedules. CLO's ability to fire compaction on insert events rather than cron schedules was a design validation for what we'd independently been thinking. But their automation is tied to CDP infrastructure, and our customers needed something that works within IOMETE's Kubernetes-native architecture.

The engine-agnostic platforms (Ryft, LakeOps) confirmed that the market recognizes this as a standalone problem worth solving. Their control-plane positioning — sit above whatever stack you run — aligned with our thinking. But our customers don't need a separate vendor for maintenance. They need it built into the platform they already use.

Across all categories, several patterns shaped our design:

**Schedules aren't enough.** Most platforms run maintenance on fixed intervals. A streaming table that commits every second generates 86,400 snapshots per day — it needs reactive triggers based on table health, not a cron expression.

**Not everything needs a Spark cluster.** Snapshot expiration is a metadata operation. Compaction rewrites data files. Treating them the same wastes compute. We saw this gap in platforms that route all operations through a single execution path.

**Configuration needs multiple levels.** Some platforms offer table-level knobs. Some offer catalog-level defaults. Nobody offered the full inheritance chain we needed: platform defaults → catalog properties → catalog config → table properties → table config.

**Observability can't be an afterthought.** When we evaluated Amoro, the most mature open-source option, we found that snapshot expiration and orphan cleanup produced no run-level history. For a customer-facing feature, every operation needs full visibility — what ran, what changed, what it cost.

These lessons became the design principles for what we built at IOMETE: a detect-evaluate-execute pipeline with event-based detection, threshold-based triggering, split execution paths for heavy vs. lightweight operations, and full observability for every run. [Part 4](/blog/how-we-built-automated-maintenance) covers the engineering story in detail.

## Choosing Your Path

If you're evaluating options, the decision tree is straightforward. Using a single managed platform (Snowflake, Databricks, S3 Tables)? Take their built-in automation and don't look back — it's genuinely invisible and works well. Running on-prem or in a hybrid environment? Cloudera and Starburst have you covered, though automation is tied to their platform layer. Running Iceberg across multiple engines or clouds? You need an engine-agnostic orchestration layer, whether that's Ryft, LakeOps, or something you build yourself.

We chose to build. Not because the existing options are bad — many are excellent for their target environments — but because our customers needed maintenance that was invisible like Snowflake's, reactive like Cloudera's CLO, and native to IOMETE's Kubernetes-based architecture. The next post covers exactly how we did it.

---

*This is Part 3 of our series on Apache Iceberg table maintenance. [Part 1](/blog/hidden-debt-in-lakehouse-tables) covered why unmaintained tables rot. [Part 2](/blog/iceberg-maintenance-operations) explained what Iceberg gives you out of the box. Next: [Part 4](/blog/how-we-built-automated-maintenance) covers how we built automated maintenance at IOMETE.*

## Resources & further reading

### Open-Source Projects
- [Apache Amoro](https://amoro.apache.org/) — incubating project for self-optimizing Iceberg tables with continuous monitoring ([GitHub](https://github.com/apache/amoro))
- [Amoro Self-Optimizing Documentation](https://amoro.apache.org/docs/latest/self-optimizing/) — Minor, Major, and Full compaction tiers explained
- [10x Efficiency Boost: How Apache Amoro Compacts Iceberg Tables](https://medium.com/@jinsong.zhou1990/10x-efficiency-boost-compared-to-spark-rewritefiles-procedure-how-apache-amoro-efficiently-7e7a993950d7) — benchmark comparing Amoro's compaction to Spark's `RewriteDataFiles`
- [Floe](https://github.com/nssalian/floe) — declarative, policy-driven Iceberg maintenance with signal-based triggers
- [Floe and Apache Polaris: Policy-Driven Table Maintenance](https://polaris.apache.org/blog/2026/02/04/floe-and-apache-polaris-policy-driven-table-maintenance-for-apache-iceberg/) — design overview and architecture walkthrough

### Cloud-Native Platforms
- [Snowflake Managed Iceberg Tables](https://docs.snowflake.com/en/user-guide/tables-iceberg-manage) — automatic compaction, manifest compaction, and snapshot expiry
- [Snowflake ICEBERG_STORAGE_OPTIMIZATION_HISTORY](https://docs.snowflake.com/en/sql-reference/account-usage/iceberg_storage_optimization_history) — Account Usage view for compaction history
- [Databricks Predictive Optimization](https://docs.databricks.com/aws/en/optimizations/predictive-optimization) — automatic OPTIMIZE, VACUUM, and ANALYZE for Unity Catalog tables
- [Databricks Managed Iceberg Tables](https://docs.databricks.com/aws/en/iceberg/) — Iceberg support with Predictive Optimization integration
- [AWS Glue Table Optimizers](https://docs.aws.amazon.com/glue/latest/dg/table-optimizers.html) — compaction, snapshot retention, and orphan file deletion for Glue-registered Iceberg tables
- [AWS S3 Tables Maintenance](https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-tables-maintenance.html) — fully managed compaction for S3 Tables
- [How S3 Tables Use Compaction to Improve Query Performance](https://aws.amazon.com/blogs/storage/how-amazon-s3-tables-use-compaction-to-improve-query-performance-by-up-to-3-times/) — AWS benchmark results
- [Onehouse: S3 Managed Tables, Unmanaged Costs](https://www.onehouse.ai/blog/s3-managed-tables-unmanaged-costs-the-20x-surprise-with-aws-s3-tables) — independent cost analysis of S3 Tables compaction
- [Dremio OPTIMIZE TABLE Reference](https://docs.dremio.com/current/reference/sql/commands/apache-iceberg-tables/optimize-table/) — SQL command for manual Iceberg maintenance
- [Dremio Automated Maintenance](https://docs.dremio.com/current/developer/data-formats/apache-iceberg/table-maintenance-optimization/automated-maintenance/) — automatic optimization via Enterprise Catalog

### On-Prem and Hybrid Platforms
- [Cloudera Lakehouse Optimizer (CLO)](https://docs.cloudera.com/management-console/cloud/clo/index.html) — policy-based automation with schedule and event triggers
- [CLO Tuning Guide](https://community.cloudera.com/t5/Engineering-Blogs/Cloudera-Lakehouse-Optimizer-Refining-Optimizations-through/ba-p/413125) — optimizing CLO policies for production workloads
- [Starburst Galaxy Data Maintenance](https://docs.starburst.io/starburst-galaxy/data-engineering/optimization-performance-and-quality/observability/data-maintenance.html) — scheduled Iceberg maintenance at table, schema, or catalog scope
- [Starburst Enterprise Data Maintenance](https://docs.starburst.io/latest/data-engineering/data-maintenance.html) — self-hosted scheduled maintenance with cron expressions

### Engine-Agnostic Platforms
- [Ryft](https://www.ryft.io/) — workload-aware Iceberg table management platform ([AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-ymwhra25hkif4))
- [LakeOps](https://lakeops.dev/) — data lake control plane with Rust-based compaction engine

