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

<Release name="Spark" version="3.5.7-v4" date="August 3, 2026">
  <ReleaseDescription>
    A maintenance and hardening release: catalog session-lifecycle fixes, finer-grained authorization, and a broad round of security patches across bundled dependencies.
  </ReleaseDescription>

  <Improvements>
    - **Column-level authorization**: Source columns referenced in expressions and predicates are now authorized, closing a gap in column-level access control.
    - **Iceberg branch/tag authorization**: Branch and tag operations are now authorized against the base table.
    - **Configurable catalog auto-sync interval**: The catalog auto-sync interval is now configurable (default 10s), so it can be widened on busy clusters.
    - **Ephemeral-port exhaustion health check**: A new driver health check detects ephemeral-port / socket exhaustion and reports the cluster unhealthy, so a stuck driver is restarted automatically instead of silently failing queries.
    - **Iceberg runtime**: Upgraded to Iceberg `1.9.0-iomete-4`, which restores `iceberg-build.properties` in the published jars.
    - **Security updates**: Patched multiple bundled dependencies — log4j `2.25.4` (CVE-2026-34480, CVE-2026-34481), Netty `4.1.135.Final` (fixes 11 CVEs), Parquet `1.15.2` (CVE-2025-46762), GCS connector `4.0.4` (CVE-2024-7254), jetty-util `9.4.58.v20250814`, MySQL Connector/J `8.2.0` (CVE-2023-22102), and MSSQL/PostgreSQL JDBC drivers (CVE-2025-59250, CVE-2026-42198). The bundled `iceberg-aws-bundle` was also updated to drop a shaded log4j `2.20.0`.
  </Improvements>

  <BugFixes>
    - **Catalog connection leak (port exhaustion)**: Per-session Iceberg REST catalogs were not released when a session ended, so long-running compute clusters could exhaust ephemeral ports and stop servicing queries (`BindException`). Catalogs are now closed across all session paths — Arrow Flight, Thrift `closeSession`, and Spark Connect session expiry — and when a catalog is dropped by auto-sync.
  </BugFixes>
</Release>

<Release name="Spark" version="3.5.7-v3" date="June 8, 2026">
  <ReleaseDescription>
    Re-enables the Enterprise Catalog for the 4.x platform and improves external JDBC catalog support.
  </ReleaseDescription>

  <Improvements>
    - **Enterprise Catalog**: Re-enabled the Enterprise Catalog for the 4.x platform release.
    - **Optional S3 credentials**: S3 credentials are now optional in `CredentialUtil`, allowing instance/role-based S3 authentication.
    - **Oracle dialect registration**: Moved Oracle JDBC dialect registration from the SQL extension to the Spark plugin for more reliable registration.
  </Improvements>
</Release>

<Release name="Spark" version="3.5.7-v2.1" date="July 13, 2026">
  <ReleaseDescription>
    Security update for the IOMETE Spark image.
  </ReleaseDescription>

  <Improvements>
    - **Security updates**: Patched multiple security vulnerabilities across bundled dependencies.
    - **JDBC driver upgrades**: PostgreSQL 42.7.2 → 42.7.13, MySQL Connector/J 8.0.33 → 8.2.0, and Microsoft SQL Server 12.2.0 → 12.2.1.
  </Improvements>
</Release>
