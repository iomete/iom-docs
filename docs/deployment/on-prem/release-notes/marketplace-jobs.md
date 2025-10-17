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

<Release name="Data Compaction Job" version="1.2.11" date="October 20, 2025">
  <NewFeatures>
    - **Time-based Snapshot Expiration**: 
        - Added support to expire snapshots based on time filters, enabling efficient management of historical data.
            - Use static filters: `where: "date >= '2025-01-01'"`
            - Use dynamic filters: `where: "date <= CURRENT_DATE - 30"`
        - Example configuration:
        ```JSON
        {
            catalog: "spark_catalog",

            // Compact recent data (works best with partition column)
            rewrite_data_files: {
                // Static date filter
                where: "date >= '2025-01-01'"

                // Dynamic filters (recommended - no manual date updates needed)
                // where: "date <= CURRENT_DATE - 30"                         // Data older than 30 days
                // where: "date <= CURRENT_DATE - 7"                          // Data older than 7 days
                // where: "date <= add_months(CURRENT_DATE, -6)"              // Data older than 6 months
                // where: "date <= trunc(CURRENT_DATE, 'MM')"                 // Data before current month
                // where: "event_time <= CURRENT_TIMESTAMP - INTERVAL 1 DAY"  // Data older than 1 day
            }

            // Table-specific filters
            table_overrides: {
                analytics.events: {
                    rewrite_data_files: {
                        where: "event_date <= CURRENT_DATE - 14"
                    }
                }
            }
        }
        ```
  </NewFeatures>

  <Improvements>
    - **Selective Operation Execution**: Added support for fine-grained control over compaction operations through an `enabled` flag at both global and table-specific levels. You can now selectively enable or disable specific operations.
  </Improvements>

  <BugFixes>
    - **Table Name Resolution**: 
        - Fixed an issue where table names provided without a database prefix (e.g., `my_table` instead of `db.my_table`) in `table_include`, `table_exclude`, or `table_overrides` would incorrectly run on the entire database.
        - The job now correctly resolves such tables using the `databases` parameter, ensuring targeted execution.
  </BugFixes>
</Release>