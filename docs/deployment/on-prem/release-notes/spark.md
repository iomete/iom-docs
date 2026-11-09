---
title: IOMETE Spark Release Notes
sidebar_label: Spark
description: Release notes for IOMETE Spark images. Learn about new features, improvements, security updates, and bug fixes in each Spark image release.
last_update:
  date: 11/09/2026
  author: Jabrail Gadgiev
---

import Mailer from '@site/src/components/Mailer';
import { Release, NewFeatures, Improvements, BugFixes, ReleaseDescription, Deprecations, BreakingChanges } from '@site/src/components/Release';

<Mailer/>

IOMETE Spark images ship on their own cadence, independent of platform releases. This page tracks changes between Spark image versions, newest first across all supported Spark lines.

{/*
  SORT = date DESC, then version DESC, by hand: the component does not sort.
  - Version numbers are usually chronological, but not always, and date wins when
    they disagree: 3.5.7-v2.1 (Jul 13) is a patch on v2 and sits above 3.5.7-v3
    (Jun 12). Intended, leave it. Keep all of this out of the entries below, which
    are customer-facing.

  DATE = public announcement date, not image build date.
  - Shipped as a GA platform default: use that release's date from ./index.md.
    3.5.7-v4 hit ACR Aug 3, announced with 3.18.0 Aug 5, so this page says Aug 5.
    Source: defaultSparkVersion at the GA tag (not rcN) in infra
    deployment/iomete-data-plane-enterprise, the only customer-facing path in
    that repo. additionalSparkVersions ships [] by design, but if a release ever
    lists an image there, that release shipped it: date it to that release too.
  - Otherwise: GA image tag push date, from
    `az acr repository show-tags -n iomete --repository iomete/spark --detail`.
    Never an rc push or the tagged commit date; both predate availability.
*/}

<Release name="Spark" version="4.1.3-v3" date="November 9, 2026">
  <ReleaseDescription>
    A maintenance release for the Spark 4 line that brings the V2 [Database Explorer APIs](/user-guide/sql-editor/database-explorer-api-migration) in line with V1: column comments, exact column types, `DESCRIBE` details for tables and views, and errors instead of empty listings when a REST catalog answers 404 or a namespace fails to list. Column comments, exact types and `DESCRIBE` details appear in the V2 APIs from IOMETE 4.0.2, which reads the new metadata Spark sends. The bug fixes work on any platform version.
  </ReleaseDescription>

  <Improvements>
    - **Column Comments over Arrow Flight SQL**: Table schemas that Spark returns to Flight SQL `GetTables` requests now carry column comments as the standard `ARROW:FLIGHT:SQL:REMARKS` column metadata, including on nested struct fields, also inside arrays and maps. The Arrow Flight SQL JDBC driver's `getColumns` returns top-level comments in its `REMARKS` column. From IOMETE 4.0.2, the V2 table details API returns comments as V1 does: top-level in `columns[].comment`, at every level in `fields[].metadata`.
    - **V2 Table Details Match V1**: Spark now sends each table's Spark schema and what `DESCRIBE TABLE EXTENDED` shows for it alongside the Flight SQL table schema. From IOMETE 4.0.2, the V2 table details API uses them to return what V1 returns: `char(n)` and `varchar(n)` types instead of `string`, column data types as `DESCRIBE` prints them, a `type` of `MANAGED` or `EXTERNAL` instead of `TABLE`, every `DESCRIBE` row for Hive tables in `detailedTableInfo`, Iceberg metadata columns such as `_spec_id`, `_partition`, `_file`, `_pos` and `_deleted` in `metadataColumns`, and column default values in `columnDefaultValues`. Views get V1's view rows in `detailedTableInfo` too: `View Text`, `View Original Text`, `View Catalog and Namespace` and `View Query Output Columns` for Hive views; `Comment`, `View Catalog and Namespace`, `View Query Output Columns`, `View Properties` and `Created By` for Iceberg views, which have no view text in V1 either. Table, storage and view properties in `detailedTableInfo` whose key or value looks like a secret are redacted with Spark's patterns, `spark.redaction.regex` and `spark.sql.redaction.options.regex`, read from the compute's Spark configuration.
  </Improvements>

  <BugFixes>
    - **Views Returned 404 from V2 Table Details**: Hive views in `spark_catalog` were listed by the V2 APIs but returned 404 "Table not found" when described. They now return their columns. Arrow Flight SQL clients that list columns, such as the JDBC driver's `getColumns`, now get these views' columns too. Describing a view reads its stored metadata only and never scans the tables it references.
    - **Failing Catalogs Listed as Empty**: Listing the namespaces of a REST catalog whose server answers 404, for example behind a wrong URI, prefix or proxy, now returns the catalog's error instead of an empty list. An empty REST catalog still lists as empty. Listing the tables of a namespace whose name contains `_`, such as `my_db`, likewise returns the error when that namespace fails, instead of an empty list.
    - **New Tables Missing after a Refresh**: A table listing with `forceRefresh=true` now also refreshes the cached namespaces, so a table just created in a new database shows up right away instead of after the namespace cache expires (10 minutes by default).
  </BugFixes>
</Release>

<Release name="Spark" version="4.1.3-v2" date="November 4, 2026">
  <ReleaseDescription>
    A maintenance release for the Spark 4 line: data-security fixes for column-scoped users, Arrow Flight streaming that no longer overloads the driver, `SHOW VIEWS` on JDBC catalogs, and security updates to bundled dependencies.
  </ReleaseDescription>

  <Improvements>
    - **SHOW VIEWS on JDBC Catalogs**: `SHOW VIEWS` now works on JDBC catalogs, where it previously failed with `MISSING_CATALOG_ABILITY.VIEWS`. Data-security policies apply as they do to `SHOW TABLES`: `USE` on the schema is required and only permitted views are listed. The IOMETE Spark extension that provides this is enabled on compute clusters by default; set `spark.iomete.extension.enabled=false` to opt out.
    - **Arrow Flight Streaming to Slow Clients**: A client that reads results slower than Spark produces them, such as a Tableau extract, no longer makes the driver buffer the whole result in memory until it is killed. Result batches are now paced to what the client is ready to receive, and cancelling the query also ends a stream that is waiting on the client. The statement timeout still covers the whole transfer, so a very large extract read slowly can hit the default one-hour limit.
    - **Flight SQL Column Precision**: Column metadata returned to Arrow Flight SQL clients now reports the JDBC/ODBC column size (digits for numeric types, 10 for `DATE`, 26 for timestamps) instead of Spark's in-memory byte estimate, which showed `INT` and `DATE` as 4 and `STRING` as 20.
    - **Oracle Boolean Pushdown by Default**: The IOMETE Spark plugin that fixes boolean-literal filter pushdown to Oracle versions before 23c now loads on compute clusters by default instead of only where `spark.plugins` was set by hand. Set `spark.iomete.plugin.enabled=false` to opt out. Spark jobs with their own entrypoint are unaffected.
    - **Security Updates**: Bundled dependencies are updated, closing 94 published security advisories.
    - **Dependency Upgrades**: Scala `2.13.18`, ORC `2.3.1`, Avro `1.12.2` and Jersey `3.1.12`, among other library updates.
  </Improvements>

  <BugFixes>
    - **Column-Scoped Access Broken by Masking and Row-Filter Policies**: A user granted `SELECT` on some columns of a table was denied every query on it as soon as a masking policy existed on the table, even for queries touching only granted columns. A row-filter policy whose predicate used a column the user was not granted caused the same denial. Columns a policy injects no longer count as the user's reads; a user's own predicate on an ungranted column is still denied.
    - **CREATE VIEW over an Iceberg View**: Creating a view over an Iceberg view was denied for want of `SELECT` on the base tables, even when the user had `SELECT` on the view and `CREATE` on the target. It is now authorized against the view, as a plain `SELECT` from it already was, and requires `SELECT` only on the columns the view references.
  </BugFixes>
</Release>

<Release name="Spark" version="4.1.3-v1" date="October 1, 2026">
  <ReleaseDescription>
    The first release of the Spark 4 line.
  </ReleaseDescription>

  <NewFeatures>
    - Initial support for [Spark 4](../../../reference/spark-4-features.md).
    - Initial support for Iceberg 1.11, including format V3.
    - Initial support for [Comet 1.0.0](/blog/apache-datafusion-comet-spark-acceleration).
  </NewFeatures>

  <Improvements>
    - **Security Updates**: Security-related upgrades to bundled dependencies, including the Ranger plugin and the PostgreSQL JDBC driver.
    - Includes every fix and improvement shipped in 3.5.7-v7.
  </Improvements>
</Release>

<Release name="Spark" version="3.5.7-v7" date="October 1, 2026">
  <ReleaseDescription>
    A fix for data-security policies that stopped refreshing on long-running clusters, correct query-to-cluster attribution in multi-data-plane deployments, and Spark History Server reliability fixes.
  </ReleaseDescription>

  <Improvements>
    - **Multi-Cluster Query Attribution**: In deployments with more than one data plane, SQL monitoring (V2) now links each query to the Spark UI on the data plane that actually ran it. Previously these links could point at the wrong data plane.
  </Improvements>

  <BugFixes>
    - **Data-Security Policies Stopped Refreshing**: A compute cluster could stop picking up data-security policy changes after a brief interruption of the identity service, and only a restart brought it back. The Ranger plugin is upgraded from 2.4.0 to 2.8.0, which carries the upstream fix. Audit output is unchanged.
    - **Driver Logs Silenced**: An older SLF4J bundled with the catalog extension shadowed Spark's logging and left driver logs empty. It is no longer bundled, so driver logs are back.
    - **Spark History Server — Storage Failures No Longer Hidden**: When object-storage access fails, the history server now surfaces the real storage error instead of reporting the application as "not found," so storage incidents are no longer misdiagnosed as missing Spark applications.
    - **Spark History Server — Recovery from an Unusable Storage Client**: The history server now detects when its storage client has become locally unusable and recovers without a manual pod restart, while still correctly distinguishing this from a genuine object-storage (S3/ECS) outage. Filesystem resources are also reliably released on shutdown.
  </BugFixes>
</Release>

<Release name="Spark" version="3.5.7-v6" date="August 19, 2026">
  <ReleaseDescription>
    Security policy support for Iceberg-specific queries and clearer external catalog errors.
  </ReleaseDescription>

  <Improvements>
    - Security policy support for Iceberg-specific queries.
    - Security policy enforcement is now enabled by default and can not be disabled with the `rangerEnabled` flag.
  </Improvements>

  <BugFixes>
    - **External Catalog Authentication Errors**: Queries against an external catalog with an expired or invalid token now return a clear authentication error instead of a generic internal error.
    - **Spark History Server OOM on Large Event Logs**: The history server no longer attempts to rebuild oversized event logs that exceed the configured size limit (`spark.history.fs.maxEventLogSizeBytes`, default 500MB), preventing OOM crashes caused by long-running apps with large logs.
    - **Spark History Server Crash on Missing Subfolder**: The Spark History server now auto-creates its required S3 subfolder if it is missing, instead of failing with a startup error.
    - **View Authorization with Subqueries**: Queries against a view now succeed when the user has access to the view but not to its underlying tables, even when the view definition contains a subquery (for example an aggregate or scalar subquery). Previously the subquery was authorized separately and the query was denied.
  </BugFixes>
</Release>

<Release name="Spark" version="3.5.7-v5" date="August 7, 2026">
  <ReleaseDescription>
    A hotfix for 3.5.7-v4. Upgrade if you are running 3.5.7-v4.
  </ReleaseDescription>

  <BugFixes>
    - **Driver and Executor Startup Crashes**: The Netty `4.1.135.Final` upgrade shipped in 3.5.7-v4 conflicted with Netty classes pulled in by upstream jars, so driver and executor pods crashed on startup non-deterministically — roughly half of all attempts, on clean computes. Netty is reverted to `4.1.100.Final`, which restores reliable startup. The conflicting classes come from jars outside IOMETE's control, so `4.1.135.Final` could not be kept. Note the trade-off: this reopens the 11 Netty CVEs that 3.5.7-v4 closed.
    - **Audit Events Lost on Shutdown**: Pending audit events are now flushed when the JVM shuts down, instead of being dropped.
  </BugFixes>
</Release>

<Release name="Spark" version="3.5.7-v4" date="August 5, 2026">
  <ReleaseDescription>
    A maintenance and hardening release: catalog session-lifecycle fixes, finer-grained authorization, and a broad round of security patches across bundled dependencies.
  </ReleaseDescription>

  <Improvements>
    - **Iceberg Branch/Tag Authorization**: Branch and tag operations are now authorized against the base table.
    - **Column-Level Authorization**: Source columns referenced in expressions and predicates are now authorized, closing a gap in column-level access control.
    - **Iceberg Runtime**: Upgraded to Iceberg `1.9.0-iomete-5`, which restores `iceberg-build.properties` in the published jars and drops a shaded log4j `2.20.0` from `iceberg-aws-bundle`.
    - **Security Updates**: Patched multiple bundled dependencies — log4j `2.25.4` (CVE-2026-34480, CVE-2026-34481), Netty `4.1.135.Final` (fixes 11 CVEs), Parquet `1.15.2` (CVE-2025-46762), GCS connector `4.0.4` (CVE-2024-7254), jetty-util `9.4.58.v20250814`, MySQL Connector/J `8.2.0` (CVE-2023-22102), and MSSQL/PostgreSQL JDBC drivers (CVE-2025-59250, CVE-2026-42198).
    - **Configurable Catalog Sync Interval**: Compute clusters refreshed their catalog configuration on a fixed 10-second tick. The interval is now configurable with `spark.iomete.catalogUpdates.interval`, so deployments with many catalogs or an external REST catalog can widen it and reduce both driver connection churn and load on core services. Stop the cluster, then add it under **Spark config** on the [Configurations tab](/user-guide/compute-clusters/creating-clusters#configurations-tab). To apply it to every cluster at once, use [Global Spark Settings](/user-guide/global-spark-settings) instead; a per-cluster value overrides the global one. Values accept ISO-8601 or short forms (`PT5M`, `1m`, `30s`) and default to 10 seconds, which preserves the previous behavior. Values below the 5-second floor are raised to it with a warning, an unparseable value falls back to the default rather than failing the driver, and the effective interval is logged at driver startup.
    - **Compute Driver Socket Exhaustion Detection**: A new driver health check samples the driver's ephemeral TCP port usage, logs a warning at 85% and reports the cluster unhealthy at 95%, so the Spark liveness probe restarts a stuck driver automatically instead of leaving it to silently fail queries. The check runs only on the driver and is enabled by default. Keys below omit the `spark.iomete.healthChecks.ephemeralPorts.` prefix.

      | Key | Default | Description |
      |-----|---------|-------------|
      | `enabled` | `true` | Whether the check runs. |
      | `initialDelayMilliseconds` | `30000` | Wait before the first run. |
      | `checkIntervalMilliseconds` | `60000` | Period between runs. |
      | `warnThresholdPercent` | `85` | Port usage at which a warning is logged. |
      | `unhealthyThresholdPercent` | `95` | Port usage at or above which the driver reports unhealthy. |
      | `warnRepeatIntervalSeconds` | `1800` | Minimum gap between repeated warnings while usage stays high. |

      Invalid thresholds (warn at or above unhealthy, or outside 0-100) fall back to 85 and 95.
  </Improvements>

  <BugFixes>
    - **External Catalog Connection Leak**: Per-session Iceberg REST catalogs were not released when a session ended, so long-running compute clusters could exhaust ephemeral ports and stop servicing queries with `BindException: Cannot assign requested address`, recoverable only by restarting the cluster. Catalogs are now closed across all session paths — Arrow Flight, Thrift `closeSession`, and Spark Connect session expiry — and when a catalog is dropped by auto-sync.
    - **Partial Catalog Failures in Schema/Table Listing**: `getSchemas`/`getTables` requests could fail entirely if any one federated catalog was down, even when only some catalogs were affected. Broken catalogs (or namespaces) are now isolated and skipped during unfiltered listings, while an explicitly requested catalog still surfaces its error. A single broken table's schema no longer drops the rest of the table listing either.
  </BugFixes>
</Release>

<Release name="Spark" version="3.5.5-v16" date="August 5, 2026">
  <ReleaseDescription>
    A maintenance release that backports the catalog session-lifecycle fixes and operational health checks from the 3.5.7 line to the 3.5.5 image.
  </ReleaseDescription>

  <Improvements>
    - **Configurable Catalog Sync Interval**: Compute clusters refreshed their catalog configuration on a fixed 10-second tick. The interval is now configurable with `spark.iomete.catalogUpdates.interval`, so deployments with many catalogs or an external REST catalog can widen it. Stop the cluster, then add it under **Spark config** on the [Configurations tab](/user-guide/compute-clusters/creating-clusters#configurations-tab), or use [Global Spark Settings](/user-guide/global-spark-settings) to cover every cluster. Values accept ISO-8601 or short forms (`PT5M`, `1m`, `30s`) and default to 10 seconds; values below the 5-second floor are raised to it with a warning.
    - **Compute Driver Socket Exhaustion Detection**: A new driver health check samples the driver's ephemeral TCP port usage, logs a warning at 85% and reports the cluster unhealthy at 95%, so the Spark liveness probe restarts a stuck driver automatically instead of leaving it to silently fail queries. The check runs only on the driver and is enabled by default, with the same `spark.iomete.healthChecks.ephemeralPorts.` keys and defaults listed under 3.5.7-v4 above.
  </Improvements>

  <BugFixes>
    - **External Catalog Connection Leak**: Per-session Iceberg REST catalogs were not released when a session ended, so long-running compute clusters could exhaust ephemeral ports and stop servicing queries with `BindException: Cannot assign requested address`, recoverable only by restarting the cluster. Catalogs are now closed across all session paths — Arrow Flight, Thrift `closeSession`, and Spark Connect session expiry — and when a catalog is dropped by auto-sync.
    - **Partial Catalog Failures in Schema/Table Listing**: `getSchemas`/`getTables` requests could fail entirely if any one federated catalog was down, even when only some catalogs were affected. Broken catalogs (or namespaces) are now isolated and skipped during unfiltered listings, while an explicitly requested catalog still surfaces its error. A single broken table's schema no longer drops the rest of the table listing either.
  </BugFixes>
</Release>

<Release name="Spark" version="3.5.7-v2.1" date="July 13, 2026">
  <ReleaseDescription>
    Security update for the IOMETE Spark image.
  </ReleaseDescription>

  <Improvements>
    - **Security Updates**: Patched multiple security vulnerabilities across bundled dependencies.
    - **JDBC Driver Upgrades**: PostgreSQL 42.7.2 → 42.7.13, MySQL Connector/J 8.0.33 → 8.2.0, and Microsoft SQL Server 12.2.0 → 12.2.1.
  </Improvements>
</Release>

<Release name="Spark" version="3.5.7-v3" date="June 12, 2026">
  <ReleaseDescription>
    Re-enables the Enterprise Catalog for the 4.x platform and improves external JDBC catalog support.
  </ReleaseDescription>

  <Improvements>
    - **Enterprise Catalog**: Re-enabled the Enterprise Catalog for the 4.x platform release.
    - **Optional S3 Credentials**: S3 credentials are now optional in `CredentialUtil`, allowing instance/role-based S3 authentication.
    - **Oracle Dialect Registration**: Moved Oracle JDBC dialect registration from the SQL extension to the Spark plugin for more reliable registration.
  </Improvements>
</Release>
