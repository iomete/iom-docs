---
title: Integration Release Notes
sidebar_label: Integrations
description: Release notes for IOMETE integrations, including dbt-iomete, the IOMETE Airflow Plugin, the IOMETE Tableau connector, and the Arrow Flight SQL JDBC driver.
last_update:
  date: 09/14/2026
  author: Abhishek Pathania
---

import { Release, NewFeatures, Improvements, BugFixes, BreakingChanges } from '@site/src/components/Release';

IOMETE integrations and drivers are released independently from the IOMETE platform. Check this page before upgrading one, especially if your environment pins package versions.

## Latest Versions

| Integration | Package | Version | Compatibility | Guide | Source |
| --- | --- | --- | --- | --- | --- |
| dbt | [`dbt-iomete`](https://pypi.org/project/dbt-iomete/) | 1.8.3 | dbt Core 1.8.x; Python 3.9–3.12 | [Open](../../../integrations/dbt/getting-started-with-iomete-dbt.md) | [GitHub](https://github.com/iomete/iomete-integrations/tree/main/dbt-iomete) |
| Airflow | [`iomete-airflow-plugin`](https://pypi.org/project/iomete-airflow-plugin/) | 3.1.0 | Airflow `>=2.10.5,<4.0.0`; Python 3.10–3.13 | [Open](../../../integrations/airflow/getting-started.mdx) | [GitHub](https://github.com/iomete/iomete-integrations/tree/main/iomete-airflow-plugin) |
| Tableau | [`tableau-connector`](https://github.com/iomete/iomete-integrations/releases?q=tableau-connector) | 0.1.0 | Tableau Desktop and Server 2024.2 and later | [Open](../../../integrations/bi/tableau/arrow-flight.md) | [GitHub](https://github.com/iomete/iomete-integrations/tree/main/tableau-connector) |
| Arrow Flight SQL JDBC | [`flight-sql-jdbc-driver`](https://github.com/iomete/iomete-artifacts) | 19.0.0-iomete.4 | Java 11 or later; Tableau Desktop and Server 2024.2 or later | [Open](/user-guide/driver/arrow-flight-jdbc-driver) | Closed source |

---

## Recent Releases

<Release name="Arrow Flight SQL JDBC Driver" version="19.0.0-iomete.4" date="September 14, 2026">
  <BugFixes>
    - **Pre-1970 timestamps**: Corrected timestamps before 1970 that include a time-of-day component, preventing affected dates from being reported one day late.
    - **Tableau timestamp precision**: Added `compatibilityMode=tableau`, which reports zoned timestamp columns as JDBC `TIMESTAMP` metadata so Tableau preserves fractional seconds. Timestamp values and metadata for other clients remain unchanged.
  </BugFixes>
</Release>

<Release name="Tableau Connector" version="0.1.0" date="September 14, 2026">
  <NewFeatures>
    - **Tableau over Arrow Flight SQL**: Added a signed `.taco` connector that adds an **IOMETE (Arrow Flight SQL)** dialog to Tableau Desktop and Server 2024.2 and later, on Windows, macOS, and Linux. See [Tableau (Arrow Flight)](../../../integrations/bi/tableau/arrow-flight.md).
    - **Spark-accurate calculations and filters**: Tuned the connector's SQL dialect and capabilities for Spark, so `CONTAINS` handles search terms containing regular-expression characters, numeric casts of a date return Tableau's date numbering, and boolean fields group and filter without failing the query.
    - **Certified against Tableau's test suite**: The connector passes all 926 tests in Tableau's Datasource Verification Tool (TDVT) suite, run against a live IOMETE compute cluster.
  </NewFeatures>
</Release>

<Release name="dbt-iomete" version="1.8.3" date="September 4, 2026">
  <NewFeatures>
    - **Loading duplicate unique keys**: Added the `delete+insert` incremental strategy for runs that can return several rows with the same `unique_key`. It removes matching target rows, then inserts the complete result from the current run. The delete and insert are separate operations, so if the insert fails, rerun the model or perform a full refresh to restore the deleted rows.
    - **Replacing Iceberg partitions**: Added the `insert_overwrite` incremental strategy for runs that return the complete contents of the partitions they update. Only partitions present in the current result are replaced. Without `partition_by`, the strategy replaces the whole table in one atomic operation. See [Incremental Models](../../../integrations/dbt/dbt-incremental-models.md) for configuration guidance.
  </NewFeatures>
</Release>

<Release name="dbt-iomete" version="1.8.2" date="August 25, 2026">
  <Improvements>
    - **Faster schema discovery**: Changed table and view metadata reads to come directly from Spark, which avoids schema-service failures and improves discovery in schemas with many relations.
    - **Separate metadata concurrency**: Added `list_relations_threads` to control how many relations dbt inspects at once without increasing the `threads` used to build models. The default is `100`; lower it if metadata discovery puts too much load on your data plane.
    - **Configuration cleanup**: Removed the `IOMETE_DBT_SCHEMA_TIMEOUT_SECONDS` setting. Delete it from your environment after upgrading.
  </Improvements>
</Release>

<Release name="Arrow Flight SQL JDBC Driver" version="19.0.0-iomete.3" date="July 22, 2026">
  <Improvements>
    - **Catalog scoping for BI tools**: Added opt-in catalog filtering for clients that use two-part table names. Set `compatibilityMode=oracle` or `catalogFilterEnabled=true`, then provide the catalog through `schema`.
    - **Actionable query errors**: Moved the server error, SQL statement, and compute cluster name into the top-level `SQLException`. Set `enrichErrorMessages=false` to retain the previous error format.
  </Improvements>

  <BugFixes>
    - **Empty result metadata**: Preserved column metadata when a query or metadata call returns no rows, so JDBC clients can still resolve columns by name.
  </BugFixes>
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
    - **Python 3.7 and 3.8 support removed**: Removed support for Python 3.7 and 3.8. Upgrade to Python 3.9–3.12 before installing this version.
  </BreakingChanges>
</Release>

<Release name="IOMETE Airflow Plugin" version="3.1.0" date="June 22, 2026">
  <NewFeatures>
    - **Airflow 2 support**: Added support for Airflow 2.10.5 alongside Airflow 3.x versions below 4.0.0.
    - **Python 3.13 support**: Extended the supported Python range to 3.10–3.13.
  </NewFeatures>

  <Improvements>
    - **Airflow-version compatibility**: Changed web component loading so the plugin registers them only when the installed Airflow version supports them.
  </Improvements>
</Release>

<Release name="IOMETE Airflow Plugin" version="3.0.1" date="June 15, 2026">
  <Improvements>
    - **Security update**: Raised the `requests` floor to 2.33.0 so installations receive the patched dependency.
  </Improvements>
</Release>

<Release name="IOMETE Airflow Plugin" version="3.0.0" date="June 4, 2026">
  <NewFeatures>
    - **Multiple IOMETE environments**: Added per-task `host`, `domain`, and token parameters to `IometeOperator`, so one Airflow instance can run jobs against different IOMETE environments.
    - **Safer token lookup**: Added `access_token_variable`, which resolves a token from an Airflow Variable only when the task runs. The token stays out of DAG code and Airflow's rendered template fields.
  </NewFeatures>

  <BreakingChanges>
    - **Task-level connection settings required**: Removed support for global IOMETE Airflow Variables and `variable_prefix`. Pass `host`, `domain`, and either `access_token` or `access_token_variable` to each task. Follow [Migrating from 2.x](../../../integrations/airflow/getting-started.mdx#migrating-from-2x) before upgrading.
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

<Release name="Arrow Flight SQL JDBC Driver" version="17.0.0-iomete.1" date="May 22, 2026">
  <NewFeatures>
    - **Java 8 compatibility**: Added a Java 8 build with HTTP CONNECT proxy support, connection-level query timeouts, named parameters, and catalog selection through JDBC session options.
  </NewFeatures>
</Release>

<Release name="Arrow Flight SQL JDBC Driver" version="19.0.0-iomete.2" date="May 14, 2026">
  <NewFeatures>
    - **Connection-level query timeout**: Added the `queryTimeout` connection property, which applies a default timeout to every statement on the connection.
    - **Named parameters**: Added `:name` parameters to prepared statements as an alternative to positional `?` markers.
  </NewFeatures>
</Release>

<Release name="Arrow Flight SQL JDBC Driver" version="19.0.0-iomete.1" date="May 14, 2026">
  <NewFeatures>
    - **HTTP CONNECT proxy support**: Added automatic JVM proxy detection and connection-specific proxy settings for routing Arrow Flight traffic through enterprise HTTP proxies.
  </NewFeatures>
</Release>

<Release name="IOMETE Airflow Plugin" version="2.0.0" date="February 25, 2026">
  <NewFeatures>
    - **Domain-aware connections**: Added the IOMETE domain to each request, allowing jobs to run in the selected domain.
  </NewFeatures>

  <Improvements>
    - **IOMETE SDK 3 support**: Upgraded the plugin to IOMETE SDK 3.1 or later.
    - **More reliable job startup**: Added a short wait after submitting a job before requesting its status, reducing failures while the run is being created.
  </Improvements>

  <BreakingChanges>
    - **Updated runtime requirements**: Raised the requirements to Python 3.10–3.12 and Airflow 3.1.6 or later.
  </BreakingChanges>
</Release>

<Release name="dbt-iomete" version="1.7.9" date="May 9, 2025">
  <NewFeatures>
    - **Setting Iceberg table properties**: Added `tblproperties` to model configuration, applying table properties when dbt creates a relation.
    - **Reducing merge scans**: Added `incremental_predicates` to limit the target rows scanned during an incremental merge.
  </NewFeatures>

  <BugFixes>
    - **Removing model columns**: Fixed `merge` and `append` runs so they handle columns removed from a model.
  </BugFixes>
</Release>

<Release name="dbt-iomete" version="1.7.8" date="May 6, 2025">
  <BugFixes>
    - **dbt-common compatibility**: Fixed failures caused by the dbt-common package not being found.
  </BugFixes>
</Release>

<Release name="dbt-iomete" version="1.7.7" date="May 5, 2025">
  <NewFeatures>
    - **Composite unique keys**: Added support for using several columns together as a `unique_key` in incremental models.
  </NewFeatures>

  <BugFixes>
    - **Snapshots outside the default catalog**: Fixed snapshots whose target is in another catalog.
  </BugFixes>
</Release>

<Release name="dbt-iomete" version="1.7.6" date="April 30, 2025">
  <BugFixes>
    - **Synchronizing incremental schemas**: Fixed incremental models using `on_schema_change: sync_all_columns`.
  </BugFixes>
</Release>

<Release name="dbt-iomete" version="1.7.5" date="March 10, 2025">
  <BugFixes>
    - **Correct relation types**: Fixed relation detection so views are identified as views instead of tables.
    - **Accurate run results**: Fixed run reporting so a failed model is no longer reported as successful.
  </BugFixes>
</Release>

<Release name="dbt-iomete" version="1.7.4" date="January 22, 2025">
  <NewFeatures>
    - **Domains and multiple catalogs**: Added support for connecting a dbt project to an IOMETE domain and creating models outside the default catalog.
  </NewFeatures>

  <BugFixes>
    - **Creating incremental tables**: Fixed the first run of a new incremental model.
  </BugFixes>
</Release>
