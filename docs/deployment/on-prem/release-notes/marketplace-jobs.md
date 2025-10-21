---
title: Marketplace Jobs
sidebar_label: Marketplace Jobs
description: Release notes for IOMETE Marketplace Jobs. Learn about updates, improvements, and bug fixes for various data integration and processing jobs.
---

import Img from '@site/src/components/Img';
import GridBox from '@site/src/components/GridBox';
import MarketplaceJob from '@site/src/components/MarketplaceJob';
import { Release, NewFeatures, Improvements, BugFixes, ReleaseDescription, Deprecations, BreakingChanges } from '@site/src/components/Release';

## Latest Versions

<GridBox>
  <MarketplaceJob
    name="Data Compaction"
    githubPath="data-compaction-job"
    version="1.2.11"
    description="Over time, iceberg tables can slow down and may need data compaction to tidy them up. IOMETE offers a built-in job to execute data compactions for each table."
  />
  <MarketplaceJob
    name="File Streaming"
    githubPath="file-streaming"
    version="0.3.0"
    description="A configuration-based, ready-to-use Spark Streaming job for replicating data from File sources (a directory, S3 location, etc.) to the IOMETE Lakehouse."
  />
  <MarketplaceJob
    name="Catalog Sync"
    githubPath="iomete-catalog-sync"
    version="4.3.3"
    description="Efficiently synchronize your data with the Data Catalog using IOMETE's Catalog Sync Job."
  />
  <MarketplaceJob
    name="MySQL Sync"
    githubPath="iomete-mysql-sync"
    version="3.0.0"
    description="Seamlessly transfer your MySQL tables to IOMETE Lakehouse with our easy-to-configure Spark Job."
  />
  <MarketplaceJob
    name="Kafka Iceberg Stream"
    githubPath="kafka-iceberg-stream"
    version="1.2.0"
    description="A configuration-based, ready-to-use Spark Streaming job for replicating data from Kafka to the IOMETE Lakehouse."
  />
</GridBox>

---

## Recent Releases

<Release name="Data Compaction Job" version="1.2.11" date="October 21, 2025">
  <NewFeatures>
    - **Time-based Snapshot Expiration**: 
      - Added support to remove Iceberg snapshots older than a set number of days using `expire_snapshot.older_than_days`.
      - Works together with `retain_last`. If both are set, we keep snapshots that match either rule. We always keep at least 1 snapshot.
      - Config examples:
        ```
        // Remove snapshots older than 7 days (keep at least 1)
        expire_snapshot: { older_than_days: 7 }

        // Keep last 3 OR anything newer than 7 days (whichever is more)
        expire_snapshot: { retain_last: 3, older_than_days: 7 }

        // Table-specific override
        table_overrides: {
          production.critical_table: {
            expire_snapshot: { retain_last: 10, older_than_days: 30 }
          }
        }
        ```
      - Retention rules:

        | Configuration | Behavior |
        |---------------|----------|
        | None specified | Keeps 1 snapshot (default) |
        | Only `retain_last` | Keeps the last N snapshots |
        | Only `older_than_days` | Removes snapshots older than N days (minimum 1 snapshot always kept) |
        | Both specified | Keeps snapshots matching EITHER condition (maximum retention) |

  </NewFeatures>

  <Improvements>
    - **Selective Operation Execution**: Added support for fine-grained control over compaction operations through an `enabled` flag at both global and table-specific levels. You can now selectively enable or disable specific operations.
  </Improvements>

  <BugFixes>
    - **Table Name Resolution**: 
      - Fixed an issue where table names provided without a database prefix (e.g., `my_table` instead of `db.my_table`) in `table_include`, `table_exclude`, or `table_overrides` would incorrectly run on the entire database.
      - The job now correctly resolves such tables using the `databases` parameter, ensuring targeted execution.
    - **Rewrite Data Files with WHERE Filter**: 
      - Fixed an issue where the `where` filter failed due to incorrect string handling.
      - The job now correctly wraps SQL expressions, allowing compaction with both static and dynamic date filters.
      - Config examples:
        ```
          rewrite_data_files: {
            // Static date filter
            where: "date >= '2025-01-01'"

            // Dynamic filters (recommended - no manual date updates needed)
            // where: "date <= CURRENT_DATE - 30"                         // Data older than 30 days
            // where: "event_time <= CURRENT_TIMESTAMP - INTERVAL 1 DAY"  // Data older than 1 day
          }
        ```
  </BugFixes>
</Release>