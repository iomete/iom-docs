---
title: IOMETE Spark Release Notes
sidebar_label: Spark
description: Release notes for IOMETE Spark images. Learn about new features, improvements, security updates, and bug fixes in each Spark image release.
last_update:
  date: 08/07/2026
  author: Mateus Aubin
---

import Mailer from '@site/src/components/Mailer';
import { Release, NewFeatures, Improvements, BugFixes, ReleaseDescription, Deprecations, BreakingChanges } from '@site/src/components/Release';

<Mailer/>

IOMETE Spark images ship on their own cadence, independent of platform releases. This page tracks changes between Spark image versions, newest first across all supported Spark lines.

<Release name="Spark" version="TBD" date="TBD">
  <BugFixes>
    - **Authorization Check Hardening**: Fixed an internal authorization check (`onlyCatalogOrDatabaseUseAccess`) that could treat a combined catalog/database action as USE-only if just one part of the request was a plain USE, even when the other part required broader access such as CREATE. Both parts must now be USE-only for the check to pass.
  </BugFixes>
</Release>

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
