---
title: Marketplace Jobs
sidebar_label: Marketplace Jobs
description: Release notes for IOMETE Marketplace Jobs. Learn about updates, improvements, and bug fixes for various data integration and processing jobs.
last_update:
  date: 10/21/2026
  author: Abhishek Pathania
---

import Img from '@site/src/components/Img';
import GridBox from '@site/src/components/GridBox';
import MarketplaceJob from '@site/src/components/MarketplaceJob';
import { Release, NewFeatures, Improvements, BugFixes, ReleaseDescription, Deprecations, BreakingChanges } from '@site/src/components/Release';

## Latest Versions

| Name                     | Image                   | Version  | Link                                                                       |
| ------------------------ | ----------------------- | -------- | -------------------------------------------------------------------------- |
| Data Compaction          | iomete_data_compaction  | 1.2.16 | [Open ↗](/resources/open-source-spark-jobs/data-compaction)            |
| File Streaming           | iomete-file-streaming   | 1.0.1    | [Open ↗](/resources/open-source-spark-jobs/file-streaming-job)             |
| Catalog Sync             | iom-catalog-sync        | 5.1.1 | [Open ↗](/resources/open-source-spark-jobs/catalog-sync)               |
| MySQL Sync               | iomete_mysql_sync       | 3.0.0    | [Open ↗](/resources/open-source-spark-jobs/mysql-db-sync)                  |
| Kafka Iceberg Stream     | kafka-iceberg-stream    | 1.3.0 | [Open ↗](/resources/open-source-spark-jobs/kafka-iceberg-stream)           |
| Query Scheduler          | spark-py                | 3.5.7-v1 | [Open ↗](/resources/open-source-spark-jobs/query-scheduler-job)            |
| TPC-DS Iceberg Generator | tpcds-iceberg-generator | 3.5.5    | Use job-templates in IOMETE                                                |
| Lakehouse Backup         | iomete-lakehouse-backup | 1.4.2    | [Open ↗](../../../open-source-spark-jobs/lakehouse-backup.mdx)          |
| Cleanup Untracked Table Folders | cleanup-untracked-table-folders | 0.1.5 | [Open ↗](/resources/open-source-spark-jobs/cleanup-untracked-table-folders) |
---

## Recent Releases

<Release name="Cleanup Untracked Table Folders Job" version="0.1.6" date="November 17, 2026">
  <ReleaseDescription>
    This release builds on v0.1.5 with the following changes.
  </ReleaseDescription>

  <NewFeatures>
    - **Second cleanup root**: When a database keeps tables in both `<warehouse>/<database>.db` and `<warehouse>/<database>`, the job now cleans both folders. The second folder counts only when the catalog places this database's tables there and at least one table the job can see is stored there. All safety checks run under both folders, and an unresolved table or a failed read under either folder blocks deletion in both.
    - **Tables of other databases and catalogs**: When a folder has no owner after the existing checks, the job now reads the tables it can see in the catalog's other databases, and in the other catalogs of its Spark session that are in the same bucket or have no `warehouse` setting. A folder that one of these tables uses is never deleted. This protects tables renamed into another database and tables created or registered with an explicit location.
    - **Final read before deleting**: In deletion mode, the job reads the storage of other databases and catalogs again right before deleting. A folder claimed in the meantime is kept and recorded as `folder_kept_at_final_check`.
    - **Ownership checks in reports and audit rows**: Every audit row lists the ownership checks that ran in `diagnostic_details.ownership_checks`, and the checks that did not run in `ownership_not_checked`. Every cleanup report starts with an `OWNERSHIP CHECKS` section.
  </NewFeatures>

  <BugFixes>
    - **Vanished and empty folders**: A candidate folder that disappears before inspection or before deletion no longer fails the database. It is recorded as `folder_not_found` or `folder_not_found_at_deletion`. Folders skipped after inspection are now reported by reason: `folder_not_found`, `statistics_unavailable`, `empty_folder`, or `unknown_age`. Empty folders are never deleted.
    - **Databases with only unresolved tables**: These are now recorded as `BLOCKED` with `status_reason=unresolved_catalog_ownership` and the correct `unresolved_table_count`, instead of `SKIPPED` with `no_active_tables_in_database`. Storage is not scanned.
    - **Unresolved table counts**: `unresolved_table_count` and the unresolved table sample are now filled on every audit row written after discovery, including rows for a missing database location, an unsafe scan root, too many candidate folders, and failures after discovery.
    - **JDBC tables**: A JDBC table's default location holds no files. It no longer chooses the cleanup root, counts as the visible table a cleanup root needs, or counts toward coverage. Its location stays protected.
    - **`s3://` and `s3a://` paths**: Two spellings of the same folder now count as one parent when the job chooses storage roots.
    - **Coverage**: `scan_plan_coverage` is `complete` only when every visible table is stored under a cleanup root and no table is unresolved, so it now agrees with `status_reason=partial_scan_coverage`.
  </BugFixes>

  <Improvements>
    - **Cleanup report**: Each report is written as one log entry, so lines from different databases no longer mix in log viewers. Each path is listed once. Unresolved tables are listed with their reason. The report for `too_many_candidate_folders` is always logged and lists the folders. A root with no child folders shows `scanned, no folders`.
    - **Documented limits**: The job documentation now explains what deletion mode can and cannot prove. The job does not check tables it cannot see, catalogs outside its Spark session or with their warehouse in another bucket, tables of nested namespaces, or files a table uses outside its own folder. This includes the old folder after `ALTER TABLE ... SET LOCATION`, which can still hold files the table reads, and files added with `add_files`. Protect such folders with `exclude_paths`.
    - **Versioned buckets**: The documentation now explains why deleting a folder on a versioned bucket may not free storage, and which bucket lifecycle rules do.
  </Improvements>

  <BreakingChanges>
    - **Deletion in `<warehouse>/<database>`**: After upgrading, a database with tables in both folders also deletes orphans in `<warehouse>/<database>`. `max_candidate_folders_per_database` counts candidates from both folders together.
    - **New block reason**: `BLOCKED` with `status_reason=other_table_unresolved` means a table of another database or catalog cannot be resolved, so its files could be in any folder. One such table blocks deletion for every configured database that has a folder with no other owner. Repair or drop that table. `other_database_storage_unknown` now also covers failed reads of other databases' tables, of other catalogs, and of the final read.
    - **Databases with JDBC tables**: Results can change in both directions. Folders that were not cleaned before can become candidates, so check that `exclude_database_folders` still names the folders you want to keep. A database can also be skipped or blocked, for example a database with only JDBC tables is `SKIPPED` with `no_active_tables_in_database`.
    - **Audit values**: A database with only unresolved tables is `BLOCKED` instead of `SKIPPED`. Some rows that showed `scan_plan_coverage=complete` now show `partial`. On a `too_many_candidate_folders` row with unresolved tables, the folders are counted in `potentially_untracked_folder_count` instead of the candidate fields. Update audit queries that filter on these values.
    - **Run a dry run first**: Run the job with `dry_run=true` after upgrading, and review the candidates and audit rows before enabling deletion.
  </BreakingChanges>
</Release>

<Release name="Catalog Sync Job" version="5.1.0" date="October 21, 2026">
  <BugFixes>
    - **Catalog configuration in logs**: Fixed the job writing a catalog's full configuration, including object-storage credentials such as `fs.s3a.access.key` and `fs.s3a.secret.key`, to the job logs when the catalog was excluded from indexing by name or by properties. The log message now contains only the catalog name. If you ran an earlier version with catalog exclusion rules, rotate the storage credentials of the excluded catalogs and remove old job logs.
  </BugFixes>

  <Improvements>
    - **Spark upgrade**: The job image base moved from Spark 3.5.5 to Spark 3.5.7.
  </Improvements>
</Release>

<Release name="Cleanup Untracked Table Folders Job" version="0.1.5" date="October 16, 2026">
  <ReleaseDescription>
    This release builds on v0.1.4 with the following changes.
  </ReleaseDescription>

  <NewFeatures>
    - **Report-only storage roots**: When a database's tables are stored under more than one folder, the job now also lists those folders for review, including locations you approve in the new optional `report_only_storage_roots` setting. Nothing in a report-only root is ever deleted.
    - **Protection for other databases and Iceberg write paths**: Storage that belongs to another database visible in the catalog, and folders named by an Iceberg table's `write.data.path`, `write.metadata.path`, `write.object-storage.path`, or `write.folder-storage.path`, are never deletion candidates.
  </NewFeatures>

  <BugFixes>
    - **Table metadata edge cases**: Tables whose storage could be misread as absent, such as a table with a column named `provider` or `location`, a table with no location, or a table lookup that was denied, now block deletion for their database instead of leaving their folders unprotected.
  </BugFixes>

  <Improvements>
    - **Folder age**: A folder's age is now the modification time of the newest object inside it. Folders whose age cannot be established are skipped.
    - **Safer cleanup roots**: Databases whose location is a bucket root, or equals or contains the catalog warehouse root, are no longer scanned and are reported as `SKIPPED`. Deletion is also blocked when no visible table is stored under the cleanup root.
    - **Unresolved table ownership**: More cases now block deletion with `status_reason=unresolved_catalog_ownership`, including Iceberg tables with `gc.enabled` set to anything but `true`, a custom `write.location-provider.impl`, or a write path without a scheme and bucket.
    - **Deletion and audit failures**: A deletion that fails partway is recorded as `FAILED` with `status_reason=deletion_failed` and lists only the folders that were actually deleted. If an audit row cannot be written, the job deletes nothing more in that run.
    - **Cleanup report**: The end-of-run report in the driver logs shows whether the run was a dry run, separates folders that belong to catalog tables from folders protected or skipped for other reasons, lists storage roots, and reports table locations outside the scanned root.
    - **Size statistics**: Object count and size are always collected for candidate folders. The `collect_size_statistics` setting is deprecated and ignored; no action is required, and it can be removed from your configuration.
  </Improvements>

  <BreakingChanges>
    - **Action required for `exclude_paths`**: Every entry must be a full path with a scheme and bucket, such as `s3a://bucket/data/analytics/manual_archive`. A configuration with a path like `/data/analytics/manual_archive` now fails at startup. Such entries never matched a folder in earlier versions.
    - **Unsupported storage**: Databases stored on filesystems other than S3-compatible storage, Google Cloud Storage, or Azure storage, such as HDFS, are reported as `SKIPPED` with `status_reason=invalid_storage_location`.
    - **Stricter deletion rules**: Some databases that were cleaned by earlier versions may now be reported as `SKIPPED` or `BLOCKED`, for example a database whose location is the catalog warehouse root. Run in dry-run mode after upgrading and review the audit table before enabling deletion.
  </BreakingChanges>
</Release>

<Release name="Cleanup Untracked Table Folders Job" version="0.1.4" date="September 25, 2026">
  <BugFixes>
    - **Catalog-scoped object storage access**: Fixed a failure where the job used Spark's global Hadoop configuration for direct object-storage operations. When the selected catalog used a different S3-compatible endpoint than the platform storage, storage folder discovery could fail with a bucket-not-found error even though catalog discovery succeeded. The job now resolves the selected catalog's own storage settings and uses an isolated filesystem instance for discovery, size collection, and deletion.
  </BugFixes>

  <Improvements>
    - Platform storage credentials are no longer inherited when accessing a catalog that declares its own endpoint
    - The job fails closed when a catalog's storage configuration cannot be resolved, instead of falling back to platform storage
    - New `BLOCKED` audit status for databases where a table's storage location cannot be read. Storage reconciliation still runs and reports what it found, but nothing is deleted (`status_reason=unresolved_catalog_ownership`)
    - New audit columns `unresolved_table_count` and `potentially_untracked_folder_count`. `candidate_folder_count` is now reserved for folders confirmed as eligible for deletion
    - Reworked end-of-run summary report in the driver logs, with separate sections for protected, excluded, untracked, and deleted folders
  </Improvements>
</Release>

<Release name="Lakehouse Backup Job" version="1.4.2" date="September 22, 2026">
  <BugFixes>
    - **Environment variable credentials**: Fixed `${VAR_NAME}` references in `application.json` being passed as literal values. The job now resolves them from **Environment Variables** at startup.
  </BugFixes>
</Release>

<Release name="Data Compaction Job" version="1.2.14" date="September 18, 2026">
  <Improvements>
    - **Multi-cluster connectivity**
      - Added support for the job to connect back to the platform when job is running in a separate data-plane cluster.
      - Needed for multi-cluster deployments. No impact on single-cluster deployments.
  </Improvements>
</Release>

<Release name="Catalog Sync Job" version="5.0.4" date="September 18, 2026">
  <Improvements>
    - **Multi-cluster connectivity**
      - Added support for the job to connect back to the platform when job is running in a separate data-plane cluster.
      - Needed for multi-cluster deployments. No impact on single-cluster deployments.
  </Improvements>
</Release>

<Release name="Lakehouse Backup Job" version="1.4.1" date="September 1, 2026">
  <BugFixes>
    - **S3-to-S3 copy failures**: Fixed intermittent `NoSuchMethodError` failures caused by conflicting AWS SDK libraries in the job image. Some executors loaded incompatible classes during the final S3 rename and repeatedly failed their copy tasks. The image now contains one AWS SDK library.
  </BugFixes>
</Release>

<Release name="Lakehouse Backup Job" version="1.4.0" date="August 19, 2026">
  <NewFeatures>
    - **Timestamped backup folders**: Added `copy.targetTimestampFolder` to write backups to hourly, daily, weekly, or monthly UTC folders. Runs started in the same period reuse the folder, so retries can skip files already copied when `copy.skipIdentical` is enabled.
  </NewFeatures>
</Release>

<Release name="Lakehouse Backup Job" version="1.3.0" date="August 18, 2026">
  <NewFeatures>
    - **Run history**: Added Iceberg tables for run status, file and byte counts, failures, stage timings, executor timings, and the configuration used by each backup.
  </NewFeatures>
  <Improvements>
    - **Job-wide bandwidth limit**: Added `copy.maxBandwidthMbPerSec` to cap aggregate copy throughput across all executors.
    - **Copy concurrency**: Added vCPU-based copy slots with `copy.slotsPerVcpu`, allowing network-bound copies to use more concurrency without changing executor CPU requests.
    - **Weighted task planning**: Balanced tasks by file size and estimated per-file cost with `copy.tasksPerSlot`, `copy.perFileOverheadBytes`, and `copy.maxBytesPerTask`.
    - **Performance testing**: Added a load-testing runbook for comparing backup throughput with controlled datasets and configuration changes.
  </Improvements>
  <BreakingChanges>
    - **Legacy task-planning settings**: `copy.filesPerTask` and `copy.bytesPerTask` are still accepted but no longer affect planning. Use `copy.tasksPerSlot`, `copy.perFileOverheadBytes`, and `copy.maxBytesPerTask` instead.
  </BreakingChanges>
</Release>

<Release name="Catalog Sync Job" version="5.0.3" date="August 6, 2026">
  <Improvements>
    - **Iceberg metadata extraction**: Added a direct Iceberg metadata path for Iceberg tables, avoiding the per-table Spark SQL metadata queries previously used during catalog sync.
    - **Faster statistics collection**: Current and historical table metrics are now read from Iceberg snapshot summaries instead of running multiple Spark SQL queries for each table.
    - **Metadata parity**: The optimized path preserves table schemas, comments, partition details, properties, and current and historical table metrics.
  </Improvements>
</Release>

<Release name="Lakehouse Backup Job" version="1.2.0" date="August 4, 2026">
  <NewFeatures>
    - **Idempotent reruns**: Added target-file checks that skip files with the same length and a sufficiently newer modification time. Set `copy.skipIdentical` to `false` to force a full copy.
  </NewFeatures>
  <Improvements>
    - **Verified file publishing**: Files are now written to a temporary target path, checked against the source length, and renamed into place only after verification succeeds.
    - **Byte-balanced task planning**: Replaced file-count partitioning with size-aware batches so large files start earlier and are distributed more evenly across the cluster.
  </Improvements>
</Release>

<Release name="Lakehouse Backup Job" version="1.1.0" date="July 28, 2026">
  <NewFeatures>
    - **HDFS backup and restore**: Added HDFS-compatible storage as both a source and a target, enabling copies between S3, Dell Isilon or OneFS, and Hadoop filesystems.
    - **Empty-directory restore**: Added recreation of empty directories when copying from an HDFS source.
  </NewFeatures>
</Release>

<Release name="Lakehouse Backup Job" version="1.0.0" date="July 14, 2026">
  <NewFeatures>
    - **Initial release**: Added recursive S3-to-S3 backups with independent source and target credentials, prefix preservation, parallel Spark execution, and per-file retries.
    - **Failure reporting**: Added run-level failure when any source file cannot be copied, preventing incomplete backups from being reported as successful.
  </NewFeatures>
</Release>

<Release name="Cleanup Untracked Table Folders Job" version="0.1.0" date="June 9, 2026">
  <NewFeatures>
    Added a new marketplace job for safely identifying and cleaning up untracked table folders in object storage.

    This first release introduces an on-demand cleanup workflow that compares catalog active table locations with physical storage folders before taking any destructive action.

    - Dry-run mode to review cleanup candidates before deletion
    - Active table protection based on catalog metadata
    - Exclusion rules for protected paths and database folders
    - Age filtering and candidate limits for safer cleanup
    - Controlled deletion with audit logging for each run
  </NewFeatures>
</Release>


<Release name="Catalog Sync Job" version="5.0.1" date="April 29, 2026">
    <Improvements>
      This release focuses on improving catalog sync performance by reducing heavy Spark metadata queries and introducing parallelism for schema processing and indexing.

      What's New:
      - ✅ Optimized Iceberg table statistics extraction by querying snapshots once and deriving totals from snapshot summaries
      - ✅ Parallelized schema scraping and concurrent table/schema indexing HTTP calls for faster sync
      - ✅ Configurable parallelism via environment variables:
        - `SCHEMA_PARALLELISM` — controls the number of schemas processed in parallel (defaults to available CPU cores)
        - `HTTP_PARALLELISM` — controls the thread pool size for concurrent HTTP indexing calls (defaults to 16)

      **Compatibility**  
      This version of the Catalog Sync Job is fully compatible with IOMETE Release 3.16.x.

      We recommend upgrading to this version when running IOMETE 3.16.x to ensure optimal performance and metadata consistency.
    </Improvements>
</Release>

<Release name="Catalog Sync Job" version="4.3.6" date="May 7, 2026">
    <Improvements>
      This release improves catalog sync performance and adds better monitoring.

      - ✅ Faster table statistics collection with fewer Spark SQL queries
      - ✅ Skipped unnecessary queries for tables with no snapshots
      - ✅ Added failure-tracking metrics (`table_process_failures`, `data_sync_failures`) for better observability
      - ✅ Configurable parallelism via `HTTP_PARALLELISM` environment variable (defaults to available CPU cores, minimum 4)
      - ✅ Fixed inaccurate storage metrics where files referenced across multiple snapshots were counted repeatedly, inflating total size and file count
    </Improvements>
</Release>

<Release name="Data Compaction Job" version="1.2.13" date="March 6, 2026">
  <BugFixes>
    - **Rewrite data files sort-order SQL error**: Fixed an issue where using `strategy: sort` with a `sort_order` config would fail with a `missing STRING at ','` error.
  </BugFixes>
</Release>

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