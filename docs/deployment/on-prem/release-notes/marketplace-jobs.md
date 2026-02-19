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

| Name                     | Image                   | Version | Link                                                                       |
| ------------------------ | ----------------------- | ------- | -------------------------------------------------------------------------- |
| Data Compaction          | iomete_data_compaction  | 1.2.12  | [Open ↗](/resources/open-source-spark-jobs/data-compaction-job)            |
| File Streaming           | iomete_file_streaming   | 0.3.0   | [Open ↗](/resources/open-source-spark-jobs/file-streaming-job)             |
| Catalog Sync             | iom-catalog-sync        | 5.0.0   | [Open ↗](/resources/open-source-spark-jobs/catalog-sync-job)               |
| MySQL Sync               | iomete_mysql_sync       | 3.0.0   | [Open ↗](/resources/open-source-spark-jobs/mysql-database-replication-job) |
| Kafka Iceberg Stream     | kafka-iceberg-stream    | 1.2.0   | [Open ↗](/resources/open-source-spark-jobs/kafka-streaming-job)            |
| TPC-DS Iceberg Generator | tpcds-iceberg-generator | 3.5.5   | Use job-templates in IOMETE                                                |

---

## Recent Releases

<Release name="Catalog Sync Job" version="5.0.0" date="February 16, 2026">
    <Improvements>
      As part of IOMETE Release 3.16.x and our move toward a unified metadata collection experience, we have updated the Catalog Sync Job to ensure full compatibility with this release.  
      What’s New: 
      - ✅ Aligned with the unified metadata collection framework introduced in IOMETE 3.16.x
      - ✅ Improved consistency in metadata synchronization workflows
      
      **Compatibility**  
      This version of the Catalog Sync Job is fully compatible with IOMETE Release 3.16.x.  

      We recommend upgrading to this version when running IOMETE 3.16.x to ensure optimal performance and metadata consistency.
    </Improvements>
</Release>

<Release name="Catalog Sync Job" version="4.3.5" date="January 7, 2026">
    <Improvements>
      Added new metrics to track Iceberg table and database sizes including all snapshots:
        - Number of files for an Iceberg table including all snapshots (so showing true number of files for a table if they look into their storage)
        - Total size of an Iceberg table including all snapshots
        - Total DB/schema size including all snapshots
      
          <Img src="/img/getting-started/release-notes/3.15.0/new-metrics.png" alt="New Metrics" />

      These metrics are new columns in the existing tables in iomete_catalog_db:
        - **table_metadata**: *total_table_nums_files*, *total_table_size_in_bytes*
        - **schema_metadata**: *total_db_size_in_bytes*
          <GridBox>
            <Img src="/img/getting-started/release-notes/3.15.0/table-metadata.png" alt="Table Metadata"  />
            <Img src="/img/getting-started/release-notes/3.15.0/schema-metadata.png" alt="Schema Metadata"  />
          </GridBox>
    </Improvements>
</Release>

<Release name="Useful SQL tools" version="1.0.0" date="January 7, 2026">
    <NewFeatures>
      This is not a Docker image release, but rather a release of a set of useful SQL tools for managing and querying Iceberg tables in IOMETE. See sql scripts in the GitHub repository: [iomete/iomete-marketplace-jobs/sql-tools](https://github.com/iomete/iomete-marketplace-jobs/tree/main/useful-sql-tools)
      
      Currently, these tools include:
      
        - Creation of iomete_spark_audit_external_table to audit Spark jobs. From this table, one can query
          - run time (using eventTime column)
          - run date (using day column)
          - user (using user column)
          - job/query id (using eventId column)

        - Creation of view for Daily jobs counts for a particular day of interest (day has to be hardcoded). This will create table stats for that day like below:

          <Img src="/img/getting-started/release-notes/3.15.0/stats.png" alt="Schema Metadata"  />

        - Query that filters Spark jobs for multiple days. This query can last for some time depending on how much data accumulated on each day, and how many days is being queried:

          <Img src="/img/getting-started/release-notes/3.15.0/multiple-days.png" alt="Schema Metadata"  />

        - Query that helps track IOMete Database Objects Definitions (DDL) Change Tracking and Audit Capability
    </NewFeatures>
</Release>


<Release name="Data Compaction Job" version="1.2.12" date="November 3, 2025">
    <NewFeatures>
        - Implemented table-level locking system to prevent concurrent compaction operations on the same table
        - Config examples:
          ```
              lock {
                enabled = true
                ttl_seconds = 172800  # 48 hours (covers 1-day worst-case + buffer)
              }
          ```
    </NewFeatures>
</Release>


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

        | Configuration          | Behavior                                                             |
        | ---------------------- | -------------------------------------------------------------------- |
        | None specified         | Keeps 1 snapshot (default)                                           |
        | Only `retain_last`     | Keeps the last N snapshots                                           |
        | Only `older_than_days` | Removes snapshots older than N days (minimum 1 snapshot always kept) |
        | Both specified         | Keeps snapshots matching EITHER condition (maximum retention)        |

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