---
title: IOMETE Spark Release Notes
sidebar_label: Spark
description: Release notes for IOMETE Spark images. Learn about new features, improvements, security updates, and bug fixes in each Spark image release.
last_update:
  date: 07/13/2026
  author: Rovshan Baghirov
---

import Mailer from '@site/src/components/Mailer';
import { Release, NewFeatures, Improvements, BugFixes, ReleaseDescription, Deprecations, BreakingChanges } from '@site/src/components/Release';

<Mailer/>

IOMETE Spark images ship on their own cadence, independent of platform releases. This page tracks changes between Spark image versions.

<Release version="Spark 3.5.7-v2.1" date="July 13, 2026">
  <ReleaseDescription>
    Security and stability update on top of 3.5.7-v1. (The 3.5.7-v2 image contained no source changes relative to 3.5.7-v1.)
  </ReleaseDescription>

  <Improvements>
    - **JDBC driver security updates**: Upgraded bundled database drivers to address known CVEs:
      - PostgreSQL 42.7.2 → 42.7.13 (CVE-2026-42198)
      - MySQL Connector/J 8.0.33 → 8.2.0 (CVE-2023-22102)
      - Microsoft SQL Server 12.2.0 → 12.2.1 (CVE-2025-59250)
    - **Log4j security update**: Upgraded Log4j to 2.25.4, addressing CVE-2026-34480 and CVE-2026-34481.
  </Improvements>

  <BugFixes>
    - **Docker base image pinned to Ubuntu 24.04** (`eclipse-temurin:17-jre-noble`): Prevents Python package installation failures caused by the previous floating base tag silently upgrading to Ubuntu 26.04.
  </BugFixes>
</Release>

<Release version="Spark 3.5.7-v1" date="April 25, 2026">
  <ReleaseDescription>
    First IOMETE build on Apache Spark 3.5.7. **3.5.5-v12** shipped alongside it with the same fork-level fixes for users staying on the 3.5.5 base.
  </ReleaseDescription>

  <Improvements>
    - **ArrowFlight SQL tab**: Added a new tab to the Spark UI for monitoring ArrowFlight sessions and operations.
    - **ArrowFlight prepared statements**: Allowed binding `NULL` values to prepared statement parameters (e.g. `WHERE (? IS NULL OR col = ?)`).
    - **Asynchronous Ranger audit dispatch**: When using the Event Stream sink for Ranger audit events, dispatch no longer blocks query threads.
    - **Spark UI cleanup**: Removed Spark internal health-check queries from cluttering the SQL tab.
  </Improvements>

  <BugFixes>
    - **Iceberg commit retry safety**: Backported an upstream Apache Iceberg fix ([apache/iceberg#15511](https://github.com/apache/iceberg/pull/15511)) to the IOMETE Iceberg 1.9 fork, preventing table corruption when a commit fails partway through and the client retries.
    - **Cross-catalog permission checks**: Fixed `SHOW DATABASES/TABLES FROM <catalog>` checking permissions against the current catalog instead of the target catalog.
    - **Dynamic partition overwrite authorization**: Fixed `INSERT OVERWRITE` on partitioned Iceberg tables with `partitionOverwriteMode=dynamic` bypassing authorization entirely.
    - **Global temp views in CTEs**: Fixed global temp views inside CTEs crashing the planner; the auth extension was wrapping temp views as permanent and not cleaning up markers inside CTEs.
  </BugFixes>
</Release>
