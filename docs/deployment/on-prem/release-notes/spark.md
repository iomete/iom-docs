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
    Security update for the IOMETE Spark image.
  </ReleaseDescription>

  <Improvements>
    - **Security updates**: Patched multiple security vulnerabilities across bundled dependencies.
    - **JDBC driver upgrades**: PostgreSQL 42.7.2 → 42.7.13, MySQL Connector/J 8.0.33 → 8.2.0, and Microsoft SQL Server 12.2.0 → 12.2.1.
  </Improvements>
</Release>
