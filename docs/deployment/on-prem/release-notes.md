---
title: IOMETE Release Notes
sidebar_label: Release Notes
description: Get latest release notes for IOMETE. Learn about new features, enhancements, and bug fixes in each release.
last_update:
  date: 07/31/2024
  author: Fuad Musayev
---

import Img from '@site/src/components/Img';
import ReleaseTitle from '@site/src/components/ReleaseTitle';

<ReleaseTitle version="1.20.2" date="September 3, 2024" title="Fixed issues from previous release" />
- Fixed issue with private docker repos not being visible on UI.

<ReleaseTitle version="1.20.0" date="August 26, 2024" title="Multi-Namespace, Secret Management" />

- Centralized Secret Management: Users can now create and manage secrets centrally from the settings page and inject them into Spark applications. Supports integration with Kubernetes and HashiCorp Vault for storing secrets. Learn more [here](https://iomete.com/resources/user-guide/secrets).  
- Added Logs Panel for Spark Connect.  
- Resolved an issue related to `tmpfs` storage.  
- Spark Job API: Added the ability to override `instanceConfig` in the Spark job API.  
- Multi-Namespace Support: Spark resources can now be deployed across different namespaces, enhancing multi-tenant and organizational capabilities.  
- Iceberg REST Catalog Support: Added support for the Iceberg REST Catalog, expanding the range of catalog integrations.  
- JDBC Catalog Support: Introduced support for JDBC Catalog, allowing connections to a wider array of databases.  
- Catalog-Level Access Control: Security improvements now allow access control to be managed at the catalog level for more granular permissions management.  


<ReleaseTitle version="1.19.2" date="August 5, 2024" title="Spark Submission Performance" />

- Optimized performance of spark-operator for handling large numbers of Spark job submissions.


<ReleaseTitle version="1.19.0" date="July 31, 2024" title="Spark Applications, Reuse PVC Options" />

- Restuctured sidebar menu in the IOMETE Console.
  <Img src="/img/getting-started/release-notes/sidebar.png" alt="Sidebar"/>
- **Spark Applications**: Introduced a new Spark Applications page featuring a zoomable timeline chart. This enhancement allows for easy tracking and visualization of applications across all Spark jobs.  
  <Img src="/img/getting-started/release-notes/spark-apps.png" alt="Spark Applications"/>
- **Persistent Volume Claim (PVC) Options**: When creating a Volume, you can now choose the "Reuse Persistent Volume Claim" and "Wait to Reuse Persistent Volume Claim" options on a per-PVC basis. This feature allows for customized volume configurations for different lakehouse and Spark resources, providing greater flexibility and control over resource management.
  <Img src="/img/getting-started/release-notes/volumes-reusable-pvc.png" alt="PVC Volume"/>


<ReleaseTitle version="1.18.0" date="July 16, 2024" title="SQL Editor Improvements, Fixed Integrations" />

- Fixed issue with `explain ...` sql statement.
- Added cell expand to the SQL Editor result grid. You can double click on the cell with multi-line value to expand it.
- Added import/download functionality to the worksheets in SQL Editor.
- Fixed issue with DBeaver and Power BI integrations.
- UI / Design improvements in SQL Editor.


<ReleaseTitle version="1.17.0" date="July 8, 2024" title="Data Explorer, SQL Editor Improvements" />

- Fixed issue where nessie catalog displayed wrong list of databases/tables in the SQL Explorer
- Launched beta version of Data-Catalog Explorer (Available in the Data-Catalog menu: from right-top side choose Explorer)
- Fixed "Invalid YeafOfEra" issue during Registration of Iceberg Tables.
- SQL Editor: Database Explorer improvements
  - Added partitions folder, you can view table partition columns.
  - Added Iceberg View support. `view` folder now available for iceberg catalogs
  - Improved error messaging in SQL Editor
  - Added item "Open in explorer" to the right-context menu. You can open the selected table in the Data-Catalog Explorer to view detailed information and snapshots
  - Redesigned result charts
- Added Spark / Iceberg / Scala version information to the Data-Plane Informatino page in the Settings menu
- Improved Cron editor in Spark Job configuration
- Overall design improvements: slowly moving to a more compact design

<ReleaseTitle version="1.16.0" date="July 1, 2024" title="Nessie Catalog" />

- 🆕 Added Nessie catalog support `Beta`
- 🛠 Updated spark-operator with performance optimizations and bug fixes
  - Enhances overall system stability and efficiency
- 🛠 Implemented stricter validation for Node Types:
  - CPU: Minimum 300 milli-cores
  - Memory: Minimum 900 MiB
  - Ensures compliance with Spark requirements for optimal performance
- 🎨 Various UI improvements for better user experience
- 🐞 Resolved issue with "STARTING" status in Spark Jobs
  - Improves job status accuracy and monitoring

<ReleaseTitle version="1.15.0" date="June 24, 2024" title="Monitoring, Spark Operator, Job Management" />

- 🛠 Spark Operator Enhancements:
  - Improved performance to handle ~1000 Spark Job submissions per minute
  - Fixed conflict issues when submitting Spark jobs via API
  - Added comprehensive metrics to Spark run details view
  - Implemented Timeline (beta) feature for tracking status changes
  - Integrated Kubernetes events for Spark Resources (Run, Lakehouse)

- 🛠 Job Management Improvements:
  - Introduced Job retry policy
  - Spark run metrics now available during "running" state
  - Fixed issue where Spark UI occasionally failed to update
  - Resolved Spark History redirection issue (now opens correct page on first load)
  - Addressed Spark driver service name conflicts caused by long job names
  - Implemented periodic garbage collection for failed jobs in Kubernetes
  - Added support for job run tags and filtering by tag
  - Introduced option to re-trigger runs with the same configuration

- 🆕 Monitoring and Logging:
  - Added support for Splunk logging
  - Implemented new System Config in UI Console
  - Added "Spark Jobs alive time" to new "System Config" page
  - Separated Driver and Executor task durations
  - Display summary of total running/complete/pending runs on Spark job page
  - Spark job log view now auto-scrolls to bottom when new logs are added

- 🎨 UI/UX Enhancements:
  - Added time filter to Job Runs
  - Displaying Scheduler Next Run information on UI
  - Added ID to Spark Run Details page

- 🛠 Performance Optimizations:
  - Fixed long job names causing Spark driver service name conflicts

- Implemented "Spark Jobs alive time" configuration

<ReleaseTitle version="1.14.0" date="June 13, 2024" title="Fixes for Audit and PowerBI" />

- Ranger Audit now working as expected. Page added to Data Security section in IOMETE Console.
- Fixed issue with PowerBI integration.
