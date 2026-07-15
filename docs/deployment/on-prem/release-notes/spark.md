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

<Release name="Spark" version="3.5.7-v2.1" date="July 13, 2026">
  <ReleaseDescription>
    Security and stability update on top of 3.5.7-v1. (The 3.5.7-v2 image contained no source changes relative to 3.5.7-v1.)
  </ReleaseDescription>

  <Improvements>
    - **Security updates**: Patched multiple security vulnerabilities across bundled dependencies.
    - **JDBC driver upgrades**: PostgreSQL 42.7.2 → 42.7.13, MySQL Connector/J 8.0.33 → 8.2.0, and Microsoft SQL Server 12.2.0 → 12.2.1.
  </Improvements>
</Release>

<Release name="Spark" version="3.5.7-v1" date="April 25, 2026">
  <ReleaseDescription>
    First IOMETE build on Apache Spark 3.5.7.
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
