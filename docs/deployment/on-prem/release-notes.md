---
title: IOMETE Release Notes
sidebar_label: Release Notes
description: Get latest release notes for IOMETE. Learn about new features, enhancements, and bug fixes in each release.
last_update:
  date: 07/31/2024
  author: Fuad Musayev
---

import Img from '@site/src/components/Img';
import Mailer from '@site/src/components/Mailer';
import ReleaseTitle from '@site/src/components/ReleaseTitle';

<Mailer/>

<ReleaseTitle version="2.2.0" date="November 29, 2024" title="Enhanced Spark Management, Security, and Usability" />

- File and Artifact Upload in Spark Jobs. You can now directly upload files and artifacts to Spark Jobs within the IOMETE Console.  
- Introduced a Single-Node Spark instance ideal for development and running small-scale jobs, offering a resource-efficient option.  
  <Img src="/img/getting-started/release-notes/single-node.png" alt="Single Node"/>
- Major Upgrade to Spark Operator. Upgraded the Spark Operator to version 2.0.2, enabling control over multiple data-plane namespaces. The Spark Operator and webhook can now be deployed exclusively to the controller namespace for improved management.  
- Added a dedicated page for managing Streaming Jobs, providing better oversight and control over streaming operations.  
- Introduced a Health page to overview the state of system components, enhancing system monitoring capabilities.  
  <Img src="/img/getting-started/release-notes/health-page.png" alt="Health Page"/>
- Any changes to Spark Catalogs are now fetched automatically within 10 seconds, eliminating the need to restart the lakehouse and Spark resources.  
- Added a description field to Spark Catalogs for better documentation.  
- Included necessary libraries to support the ClickHouse Catalog, expanding data source compatibility.  
- Implemented more granular data security controls with separated database permissions.  
- SSO Improvements. Relaxed mandatory validations for the SSO protocol to enhance compatibility and user experience.  
- Admins can now change or reset users password directly within the platform.  
- Introduced support for service accounts. Users can mark accounts as service accounts and create tokens for them, which can be used in Spark Jobs and other integrations.  
- Cleaned up logs by removing unnecessary messages, improving log readability.  


<ReleaseTitle version="2.1.0" date="October 31, 2024" title="Enhanced Control & Performance Release" />

**New Features & Improvements**  

- Improved performance of the Spark History Server, optimizing responsiveness and handling of large workloads.  
- Added a new global Spark configuration, spark.sql.thriftserver.scheduler.pool, to resolve issues related to the FAIR Scheduler.  
- Introduced a new Job Marketplace in the IOMETE Console, empowering users to share and explore Spark job templates. Admins can manage, curate, and publish templates directly to the marketplace for streamlined collaboration.   
- Introduced the LOG_LEVEL environment variable, allowing users to independently set log levels for both Spark Jobs and Lakehouses.  
- _Access Token Management Enhancements_: New System Config for Access Token expiration policy `access-token.lifetime` to set global expiration limits.  
- _Access Token Management Enhancements_: Users can now set custom expiration times for Access Tokens directly in the UI Console.  
- _Access Token Management Enhancements_: Added `lastUsed` field for Access Tokens to enhance tracking and security.  
- Substantial optimizations to the Spark policy download process, ensuring smooth performance in large-scale deployments.  
- Updated the Data-Compaction job to support catalog, database, and table filters, giving users greater control over data organization.  
- Implemented the System for Cross-domain Identity Management (SCIM) API, facilitating simplified user provisioning and management.  
- Updated Data-Compaction job to support catalog, database, table include/exclude filters.  
- The Query Scheduler job now logs SQL query results, enabling easier debugging and tracking of job outcomes.  
- _Data Security_: Added support for VIEWs, enhancing data access control options.  
- Added a configurable Limit property (default value: 100) to the SQL Editor, giving users control over query results.  
  <Img src="/img/getting-started/release-notes/query-limit.png" alt="SQL Limit"/>

**Bugs Fixed**  
- Resolved an issue where the Spark UI link was unresponsive from the SQL Editor page.  
- _Data Security_: Fixed INSERT and DELETE permissions (also covering TRUNCATE operations).  


<ReleaseTitle version="2.0.1" date="October 14, 2024" title="Post-Major Release Patch" />

**Improvements**

- Added out-of-the-box support for Oracle and Microsoft SQL Server JDBC drivers.
- Introduced the “Run as User” property in Spark job configuration, allowing user impersonation for special accounts (e.g., service accounts) when running Spark jobs.

**Bugs Fixed**

- Resolved an issue with LDAP sync that caused User, Group, and Role Mappings to be removed after synchronization.
- Fixed an issue in Jupyter Notebook where database queries returned no results.
- Resolved a failure when querying Iceberg metadata tables due to row-level filtering policies.
- Fixed LDAP login issue that occurred with case-sensitive usernames.

<ReleaseTitle version="2.0.0" date="October 07, 2024" title="Major Upgrade with Integrated Security, Data Governance, and Enhanced Performance" />

:::info
This release introduces major architectural, functional, and user experience improvements to IOMETE, including significant changes to user and security management, data access and governance, and catalog performance.
:::

:::warning Major Release
This is a major release with significant changes to the architecture and user experience. IOMETE 2.0.0 is not backward compatible with IOMETE 1.22.0 or earlier versions. We recommend reviewing the upgrade documentation carefully before proceeding.
:::

**User and Security Management Enhancements**

### Keycloak Removal & LDAP Integration

We have removed `Keycloak` and transitioned all its functionality—`user`, `group`, and `role` management, as well as `LDAP` and `SAML/OIDC Connect` support—directly into IOMETE. This shift centralizes control within IOMETE, enhancing security and simplifying management for large-scale deployments.

Key Improvements:

- Optimized LDAP support for large-scale user integrations, addressing performance issues experienced with Keycloak.
- Support for both user-based and group-based synchronization.
- Service accounts support (users without standard identifiers such as email or first name).

This change improves performance and simplifies maintenance by reducing external dependencies.

**Data Access and Governance Enhancements**

### Ranger Removal & Integrated Policy Management

We have removed Apache Ranger, fully integrating its data access policy management functionality within IOMETE. This offers better control, performance, and security while reducing the complexity of managing separate systems.

Key Benefits:

- Improved performance and streamlined management of data access policies.
- Reduced security concerns by eliminating the dependency on open-source Ranger.

### Tag-Based Access Control & Masking

We are introducing Tag-Based Access Control and Tag-Based Masking, simplifying data governance within IOMETE by allowing policies to be triggered automatically based on tags.

Key Features:

- Dynamic Policy Activation: Automatically apply access or masking policies based on tags assigned to tables or columns.
- Tag-Based Access Control: Define user or group access based on tags.
- Tag-Based Masking: Dynamically apply data masking policies for sensitive data based on tags.

This feature streamlines governance processes and provides a more efficient solution for large datasets.

**Catalog and Performance Improvements**

### Integrated Iceberg REST Catalog

IOMETE now includes a fully integrated Iceberg REST Catalog, replacing the previous Iceberg JDBC catalog. This upgrade delivers enhanced performance, scalability, and security for Spark jobs, Lakehouse clusters, and SparkConnect clusters.

Key Benefits:

- Centralized Caching: Shared metadata cache across all Spark jobs and clusters, improving query resolution times and overall system performance.
- Reduced Database Load: Pooled connections significantly reduce strain on the Postgres metadata database.
- Integrated Authentication and Authorization: Supports token-based authentication, OpenConnect, OAuth, and ensures data access policies are enforced across REST catalog interactions.
- Multi-Catalog Support: Manage multiple catalogs simultaneously for greater flexibility.
- Openness and Interoperability: Aligns with IOMETE’s vision of openness, supporting external platforms like Dremio, Databricks, and Snowflake via standard Iceberg REST protocol.

---

<ReleaseTitle version="1.22.0" date="September 18, 2024" title="Changes in Deployment Process" />
- The `data-plane-base` Helm chart has been deprecated and is no longer required for installation.  
- `ClusterRole`, previously added for multi-namespace support, has been removed, and the system now uses only namespaced Roles.   
- Spark-Operator is now deployed separately to each connected namespace.  
- The process for connecting a new namespace has been updated. Please refer to the Advanced Deployment Guides for more information.  
- Added pagination to user related components on UI Console.

<ReleaseTitle version="1.20.2" date="September 3, 2024" title="Pause for Scheduled Job" />
- Fixed issue with private docker repos not being visible on UI.
- Added possibility to suspend Scheduled Spark applications.

<ReleaseTitle version="1.20.0" date="August 26, 2024" title="Multi-Namespace, Secret Management" />

- Centralized Secret Management: Users can now create and manage secrets centrally from the settings page and inject them into Spark applications. Supports integration with Kubernetes and HashiCorp Vault for storing secrets. Learn more [here](../../user-guide/secrets).
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
