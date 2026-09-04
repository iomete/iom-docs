---
title: Integration Release Notes
sidebar_label: Integrations
description: Release notes for IOMETE integrations, including dbt-iomete and the IOMETE Airflow Plugin.
last_update:
  date: 09/04/2026
  author: Abhishek Pathania
---

import { Release, NewFeatures, Improvements, BugFixes, BreakingChanges } from '@site/src/components/Release';

IOMETE integrations are released independently from the IOMETE platform. Check this page before upgrading `dbt-iomete` or `iomete-airflow-plugin`, especially if your environment pins package versions.

## Latest Versions

| Integration | Package | Version | Compatibility | Guide | Source |
| --- | --- | --- | --- | --- | --- |
| dbt | [`dbt-iomete`](https://pypi.org/project/dbt-iomete/) | 1.8.3 | dbt Core 1.8.x; Python 3.9–3.12 | [Open](../../../integrations/dbt/getting-started-with-iomete-dbt.md) | [GitHub](https://github.com/iomete/iomete-integrations/tree/main/dbt-iomete) |
| Airflow | [`iomete-airflow-plugin`](https://pypi.org/project/iomete-airflow-plugin/) | 3.1.0 | Airflow `>=2.10.5,<4.0.0`; Python 3.10–3.13 | [Open](../../../integrations/airflow/getting-started.mdx) | [GitHub](https://github.com/iomete/iomete-integrations/tree/main/iomete-airflow-plugin) |

---

## Recent Releases

<Release name="dbt-iomete" version="1.8.3" date="September 4, 2026">
  <NewFeatures>
    - **Loading duplicate unique keys**: Use the new `delete+insert` strategy when one incremental run can return several rows with the same `unique_key`. It removes matching target rows, then inserts the complete result from the current run. The delete and insert are separate operations. If the insert fails, rerun the model or perform a full refresh to restore the deleted rows.
    - **Replacing Iceberg partitions**: Use the new `insert_overwrite` strategy when each run returns the complete contents of the partitions it updates. Only partitions present in the current result are replaced. Without `partition_by`, the strategy replaces the whole table in one atomic operation. See [Incremental Models](../../../integrations/dbt/dbt-incremental-models.md) for configuration guidance.
  </NewFeatures>
</Release>

<Release name="dbt-iomete" version="1.8.2" date="August 25, 2026">
  <Improvements>
    - **Faster schema discovery**: dbt now reads table and view metadata directly from Spark. This avoids schema-service failures and improves discovery in schemas with many relations.
    - **Separate metadata concurrency**: Use `list_relations_threads` to control how many relations dbt inspects at once without increasing the `threads` used to build models. The default is `100`; lower it if metadata discovery puts too much load on your data plane.
    - **Configuration cleanup**: Remove `IOMETE_DBT_SCHEMA_TIMEOUT_SECONDS` from your environment after upgrading. Version 1.8.2 no longer uses it.
  </Improvements>
</Release>

<Release name="dbt-iomete" version="1.8.1" date="June 25, 2026">
  <BugFixes>
    - **Metadata requests for large catalogs**: Increased the schema-service timeout from 10 to 120 seconds to prevent timeouts while loading large catalogs. You could override it with `IOMETE_DBT_SCHEMA_TIMEOUT_SECONDS`; version 1.8.2 later removed the need for this setting.
  </BugFixes>
</Release>

<Release name="dbt-iomete" version="1.8.0" date="June 25, 2026">
  <Improvements>
    - **dbt Core 1.8 support**: Added compatibility with the dbt Core 1.8 release line.
    - **Security update**: Upgraded protobuf to 5.29.6 to address CVE-2026-0994.
  </Improvements>

  <BreakingChanges>
    - **Python 3.7 and 3.8 support removed**: Upgrade to Python 3.9–3.12 before installing this version.
  </BreakingChanges>
</Release>

<Release name="IOMETE Airflow Plugin" version="3.1.0" date="June 22, 2026">
  <NewFeatures>
    - **Airflow 2 support**: You can use the plugin with Airflow 2.10.5 or with Airflow 3.x versions below 4.0.0.
    - **Python 3.13 support**: The supported Python range is now 3.10–3.13.
  </NewFeatures>

  <Improvements>
    - **Airflow-version compatibility**: The plugin loads its web components only when the installed Airflow version supports them.
  </Improvements>
</Release>

<Release name="IOMETE Airflow Plugin" version="3.0.1" date="June 15, 2026">
  <Improvements>
    - **Security update**: Requires `requests` 2.33.0 or later so installations receive the patched dependency.
  </Improvements>
</Release>

<Release name="IOMETE Airflow Plugin" version="3.0.0" date="June 4, 2026">
  <NewFeatures>
    - **Multiple IOMETE environments**: Each `IometeOperator` task can use its own host, domain, and token. One Airflow instance can now run jobs against different IOMETE environments.
    - **Safer token lookup**: Use `access_token_variable` to resolve a token from an Airflow Variable only when the task runs. The token stays out of DAG code and Airflow's rendered template fields.
  </NewFeatures>

  <BreakingChanges>
    - **Task-level connection settings required**: Global IOMETE Airflow Variables and `variable_prefix` are no longer supported. Pass `host`, `domain`, and either `access_token` or `access_token_variable` to each task. Follow [Migrating from 2.x](../../../integrations/airflow/getting-started.mdx#migrating-from-2x) before upgrading.
  </BreakingChanges>
</Release>

<Release name="IOMETE Airflow Plugin" version="2.0.2" date="May 28, 2026">
  <Improvements>
    - **Security updates**: Added minimum patched versions for `urllib3`, `idna`, `Mako`, and `python-multipart`. Reinstall or upgrade the plugin to receive these dependency versions.
  </Improvements>
</Release>

<Release name="IOMETE Airflow Plugin" version="2.0.1" date="May 28, 2026">
  <Improvements>
    - **Airflow security updates**: Raised the minimum Airflow version from 3.2.0 to 3.2.1 to include upstream security fixes.
  </Improvements>
</Release>

<Release name="IOMETE Airflow Plugin" version="2.0.0" date="February 25, 2026">
  <NewFeatures>
    - **Domain-aware connections**: The plugin now sends the IOMETE domain with each request, allowing jobs to run in the selected domain.
  </NewFeatures>

  <Improvements>
    - **IOMETE SDK 3 support**: Upgraded the plugin to IOMETE SDK 3.1 or later.
    - **More reliable job startup**: The plugin waits briefly after submitting a job before requesting its status, reducing failures while the run is being created.
  </Improvements>

  <BreakingChanges>
    - **Updated runtime requirements**: This release requires Python 3.10–3.12 and Airflow 3.1.6 or later.
  </BreakingChanges>
</Release>

<Release name="dbt-iomete" version="1.7.9" date="May 9, 2025">
  <NewFeatures>
    - **Setting Iceberg table properties**: Use `tblproperties` in model configuration to apply table properties when dbt creates a relation.
    - **Reducing merge scans**: Use `incremental_predicates` to limit the target rows scanned during an incremental merge.
  </NewFeatures>

  <BugFixes>
    - **Removing model columns**: `merge` and `append` runs now handle columns removed from a model correctly.
  </BugFixes>
</Release>

<Release name="dbt-iomete" version="1.7.8" date="May 6, 2025">
  <BugFixes>
    - **dbt-common compatibility**: Fixed failures caused by the dbt-common package not being found.
  </BugFixes>
</Release>

<Release name="dbt-iomete" version="1.7.7" date="May 5, 2025">
  <NewFeatures>
    - **Composite unique keys**: Incremental models can use several columns together as a `unique_key`.
  </NewFeatures>

  <BugFixes>
    - **Snapshots outside the default catalog**: Snapshots now work correctly when their target is in another catalog.
  </BugFixes>
</Release>

<Release name="dbt-iomete" version="1.7.6" date="April 30, 2025">
  <BugFixes>
    - **Synchronizing incremental schemas**: Fixed incremental models using `on_schema_change: sync_all_columns`.
  </BugFixes>
</Release>

<Release name="dbt-iomete" version="1.7.5" date="March 10, 2025">
  <BugFixes>
    - **Correct relation types**: dbt now identifies views as views instead of tables.
    - **Accurate run results**: A failed model is no longer reported as successful.
  </BugFixes>
</Release>

<Release name="dbt-iomete" version="1.7.4" date="January 22, 2025">
  <NewFeatures>
    - **Domains and multiple catalogs**: dbt projects can connect to an IOMETE domain and create models outside the default catalog.
  </NewFeatures>

  <BugFixes>
    - **Creating incremental tables**: Fixed the first run of a new incremental model.
  </BugFixes>
</Release>
