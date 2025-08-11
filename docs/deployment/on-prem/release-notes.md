---
title: IOMETE Release Notes
sidebar_label: Release Notes
description: Get latest release notes for IOMETE. Learn about new features, enhancements, and bug fixes in each release.
last_update:
  date: 07/31/2024
  author: Fuad Musayev
---

import Img from '@site/src/components/Img';
import GridBox from '@site/src/components/GridBox';
import Mailer from '@site/src/components/Mailer';
import { Release, ReleaseTitle, ReleaseSection, ReleaseDescription } from '@site/src/components/Release';

<Mailer/>

<Release version="3.11.0" date="August 11, 2025" title="PriorityClass Mappings, Log Management">
  <ReleaseSection title="💥 IOMETE Spark">
    - Spark version spark-3.5.5 is a default version set.
  </ReleaseSection>

  <ReleaseSection title="PriorityClass Mappings">
    - Implemented Priority Class Mappings, which enables to configure priority classes mappings in helm charts.
  </ReleaseSection>
  
  <ReleaseSection title="Log Management">
    - Built Executor Logs feature enabling real-time viewing of compute and Spark job executor logs in the UI.
    - Added support for downloading logs from external logging systems including Splunk, Loki, and EFK.
  </ReleaseSection>

  <ReleaseSection title="Job Orchestrator">
    - Job Priority Restrictions:
        - Only Domain Admins can upgrade jobs to HIGH priority.
        - Regular users can manage NORMAL jobs, edit HIGH, and downgrade to NORMAL.
        - Existing jobs and normal operations remain unaffected.
    - Worker Deployment Changes: Workers moved to respective data planes, reduced resource usage, and added per-namespace configurations.
    - Spark Job Quota Enhancements: Added PriorityClass quota support; system now applies the most restrictive limit across namespace and job-specific quotas for CPU, Memory, and Pods.
  </ReleaseSection>

  <ReleaseSection title="🏷️ Tag Filtering on Spark/Streaming Job List">
      You can **search** and **filter** the Spark/Streaming job list by **resource tags**.
      <Img src="/img/getting-started/release-notes/3.11.0/job-filter-by-tag.png" alt="Job Filter By Tag" />
  </ReleaseSection>

  <ReleaseSection title="New SQL Chart Types">
      You can now visualize SQL query results with:  
      - **Pie Charts**
        <Img src="/img/getting-started/release-notes/3.11.0/sql-pie-chart.png" alt="SQL Pie Chart" />
      - **Scatter Plots**
        <Img src="/img/getting-started/release-notes/3.11.0/sql-scatter-chart.png" alt="SQL Scatter Chart" />
      - **Treemaps**
        <Img src="/img/getting-started/release-notes/3.11.0/sql-treemap-chart.png" alt="SQL Treemap Chart" />
      - **Composed Charts**
        <Img src="/img/getting-started/release-notes/3.11.0/sql-composed-chart.png" alt="SQL Composed Chart" />
  </ReleaseSection>

  <ReleaseSection title="⚡️ Other Improvements">
    - Implemented exposing the token management operations in the API / swagger.
  </ReleaseSection>
 
  <ReleaseSection title="🐛 Bug Fixes">
    - Fixed an issue where resources quotas in the homepage picked up the priority class quota instead of the namespace quota.
  </ReleaseSection>
</Release>

<Release version="3.10.2" date="August 3, 2025" title="Patch Release">
  <ReleaseSection title="🐛 Bug Fixes">
    - Fixed an issue where the `spark.dynamicAllocation.enabled` flag was always set to false.
    - Fixed an issue where the `spark.executor.instances` was set to 1 even when dynamic allocation was disabled.
    - Fixed an issue where the user failed to query the view when they lack the permission to the underlying table, even if the user has a permission to the view. 
    - Disabled `delete table` button in database explorer within SQL Editor sidebar.
  </ReleaseSection>
</Release>

<Release version="3.9.3" date="July 23, 2025" title="Patch Release">
  <ReleaseSection title="🐛 Bug Fixes">
  - Patched `antiAffinity` rules, customers can now configure soft affinity rules for Spark driver pods to help distribute them across nodes and reduce the probability of most drivers ending up on the same node. This can be enabled by setting the flag `iometeSparkDriverAntiAffinity.enabled` to true in values.yaml during installation.
  - The iom-core pod now dynamically reloads any `docker.tagAliases` defined in `values.yaml`, removing the need to restart the pod.  
  </ReleaseSection>
</Release>

<Release version="3.10.1" date="July 22nd, 2025" title="Patch Release">
  <ReleaseSection title="🐛 Bug Fixes">
    - Fixed an issue where column descriptions and tags were being unintentionally overridden by the catalog-sync job.  
      - Descriptions will now be preserved if already present.  
      - Tags from the sync job will be merged with existing tags instead of replacing them.
    - Added validations of tags and label names based on the rules mentioned [here](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set).
      - It has been implemented in API level, so that integrated tools to be validated as well.
      - It has been implemented in UI level as well, so the users to be informed about valid syntax formats.
  </ReleaseSection>
</Release>

<Release version="3.10.0" date="July 15, 2025" title="Job Orchestrator, LDAP Group Inheritance and Jupyter Containers">
  <ReleaseSection title="🧩 Job Orchestrator [Beta]">
    This is the beta release of our broader initiative to bring orchestration to IOMETE. To enable it, set the flag `jobOrchestrator.enabled` in `values.yaml`.
    - <b>Priority-based Scheduling</b>: Users can now prioritize the scheduling of business-critical jobs over regular-priority jobs.
      <Img src="/img/guides/spark-job/job-update-page.png" alt="Job Update Page" maxWidth="600px" centered />
    - <b>Resource-aware Execution</b>: Jobs are only submitted when there is sufficient cluster capacity, helping prevent failed or stuck jobs. 
    - <b>Built-in observability</b>: We've added rich metrics to monitor queue state, job wait times, and scheduling patterns in real time.
      <Img src="/img/guides/spark-job/job-metrics-monitoring-graphs.png" alt="Job Monitoring Graph" />
    For an in-depth overview, check out the official [press release](/docs/developer-guide/spark-job/job-orchestrator.md).
  </ReleaseSection>

  <ReleaseSection title="📒 Jupyter Containers [Beta]">
    Jupyter Containers is a powerful new feature that brings familiar Jupyter development environments directly into your IOMETE Platform. This enhancement enables data engineers and analysts to spin up dedicated, pre-configured Jupyter environments with just a few clicks.  
    Key highlights:  
    - Create isolated Jupyter containers with customizable resource allocation.  
    - Each container comes with JupyterLab pre-installed and ready to use. Click "Open JupyterLab" to directly access Jupyter environment from IOMETE UI.  
    - Pre-installed Spark libraries for immediate access to distributed computing.  
    - Direct connectivity to IOMETE Compute clusters via Spark Connect.  
    - Essential developer tools pre-installed: git, aws cli, sparksql-magic, pandas, other libraries and extensions.  
    - Authentication: Use your IOMETE username as the default token. Optionally, setup a password to protect sensitive files within container.  
    
    Platform admins can enable it during installation by setting `jupyterContainers.enabled` in `values.yaml`.  
    For more details please refer to Jupyter Container's user guide: [Jupyter Containers - Developer Guide](/docs/developer-guide/notebook/jupyter-containers.mdx).
  </ReleaseSection>

  <ReleaseSection title="👥 LDAP Group Inheritance">
    - Group hierarchies synced from LDAP are now taken into account when evaluating Data Security policies. Groups inherit data policies from parent groups in the same way users inherit them.
    - For example, in the diagram below, any data policies applied to the "Data Science Team" will also apply to the "ML Engineers" and "Data Analysts" groups — in addition to any policies directly assigned to those child groups.
      <Img src="/img/getting-started/release-notes/3.10.0/ldap-group-inheritance.png" alt="LDAP Group Inheritance" />
    - This behavior is enabled by default in IOMETE. It can be disabled by setting the feature flag `ldapGroupInheritance.enabled` to `false` in `values.yaml` during Helm installation.
  </ReleaseSection>

  <ReleaseSection title="💥 IOMETE Spark">
    - Customers can now configure soft affinity rules for Spark driver pods to help distribute them across nodes and reduce the probability of most drivers ending up on the same node. This can be enabled by setting the flag `iometeSparkDriverAntiAffinity.enabled` to `true` in `values.yaml` during installation.
  </ReleaseSection>

  <ReleaseSection title="🔍 Activity Monitoring">
    - We are releasing the beta of our own Spark Query Plan viewer. You no longer need to access the UI to view query plans! Enable this feature via `activityMonitoringQueryPlans.enabled` in `values.yaml` during installation.
    <Img src="/img/getting-started/release-notes/3.10.0/query-monitoring-plan.png" maxWidth="700px" centered />
    - Improved visualization of shuffle metrics on the Query Monitoring Details page.
    - Domain owners can now view and cancel all queries within their domain, while regular users can only see and cancel their own queries.
      <Img src="/img/getting-started/release-notes/3.10.0/query-monitoring-domain-member-filter.png" alt="Query Monitoring filter by domain members" maxWidth="700px" />
  </ReleaseSection>

  <ReleaseSection title="🐛 Bug Fixes">
    - Added support to configure the maximum allowed cookie size for HTTP requests. This is useful for customers encountering issues with large cookies. Set the value via `services.gateway.settings.maxCookieSize` in `values.yaml` (default: `128k`).
    - Fixed an issue with access token renewal when executing SQL queries.
    - Patched the data-plane init job to ensure the metastore starts correctly post-install when special characters are used in the PostgreSQL password.
    - Fixed a bug where updates to LDAP settings were not reflected in periodic LDAP syncs.
    - Minor fix to ensure the `iom-catalog` service consistently appears on the health check page.
    - Git Repositories in sql editor now has support for subgroups in gitlab.
    - Allow trailing semicolon in Iceberg CALL statements for better Spark SQL compatibility
  </ReleaseSection>

  <ReleaseSection title="⚡️ Other Improvements">
  - Moved hardcoded `iom-openapi` pod resource settings into `values.yaml` in the Helm chart for easier customization.
  - The number of applications shown on the Spark History summary page is now configurable. Set this in `values.yaml` under `services.sparkHistory.settings.maxApplications`.  
    See the Spark property [`spark.history.ui.maxApplications`](https://spark.apache.org/docs/latest/monitoring.html) for more information.
  - Added a new option in the SQL Editor’s Database Explorer to delete tables directly from the Iceberg REST Catalog. This is useful when a table is corrupted and Spark cannot delete it. The user must have `DROP TABLE` privileges to perform this operation.  
    <GridBox>
      <Img src="/img/getting-started/release-notes/3.10.0/delete-table-action.png" alt="Data explorer delete table" />
      <Img src="/img/getting-started/release-notes/3.10.0/delete-table-confirm.png" alt="Data explorer delete table" />
    </GridBox>

    - Added a context menu with `Close` and `Close All` options to SQL Editor worksheet tabs for quickly closing the current or all tabs.

  <Img src="/img/getting-started/release-notes/3.10.0/sql-tab-close-all.png" alt="SQL editor tab close all" maxWidth="700px" centered />
    - Tags attached to Spark jobs are now propagated to the corresponding Kubernetes pods as labels.This enables resource management or categorization based on job-specific tags.  
   <Img src="/img/k8s/tag-pod-label-propagation.png" alt="Job Tag As a Pod Label" />
  </ReleaseSection>
  </Release>

<Release version="3.9.2" date="July 14th, 2025" title="Patch release">
  <ReleaseSection title="Job resource accounting using tags">
  - Tags that are attached to the spark jobs will be propagated to the pod as labels, which could be used for resource management of jobs categorized by specific tags.
     <Img src="/img/k8s/tag-pod-label-propagation.png" alt="Job Tag As a Pod Label" />
  </ReleaseSection>
  <ReleaseSection title="🐛 Bug Fixes">
  - Move hard coded iom-openapi pod resources to values.yaml in chart.
  - Access token renewal issue while executing SQL queries is fixed.
  - Fixed bug where LDAP settings updates were not reflected in periodic LDAP sync.
  </ReleaseSection>
</Release>

<Release version="3.9.1" date="July 4th, 2025" title="Patch release">
  <ReleaseSection title="🐛 Bug Fixes">
  - Fixed an issue where queries run from the SQL Editor were missing automatic `LIMIT` clauses. This was resolved by updating `defaultSparkVersion` in the default HELM chart (`v17`), as older Spark image versions did not enforce limits correctly.
  - Removed unintended debug logging from the `iom-socket` pod to reduce log noise.
  </ReleaseSection>
</Release>

<Release version="3.9.0" date="June 25, 2025" title="Sensitive data improvements">
  <ReleaseSection title="🔰 Sensitive data improvements on UI">
  - Users can now mark variables in the global spark settings as 'sensitive', which shows them redacted on the UI going forward
    <Img src="/img/getting-started/release-notes/3.9.0/spark-settings-masking.png" alt="Sensitive Spark Settings" />
  - On installation, admins can specify `docker.sparkLogMaskingRegexes` in the `values.yaml` which will help mask sensitive data shown on the compute logs.
    This should be specified as named key-value pairs, in the example below we mask passwords, vault tokens and ports:
    ```yaml
    docker:
      sparkLogMaskingRegexes:
        password_mask: "(?i)(password\\s*=\\s*)[^&\\s]+"
        vault_token_mask: "(?i)(vault\\\\s*token\\\\s*[:=]\\\\s*)(s\\.[a-zA-Z0-9]{20,})"
        port_mask: "(?i)(on\s+port\s+)(\d{2,5})"
    ```
    <Img src="/img/getting-started/release-notes/3.9.0/compute-log-masking.png" alt="Compute log masking" />
  </ReleaseSection>

  <ReleaseSection title="⚡️ UI Improvements">
  - The SQL editor in the IOMETE console now supports multiple tabs. Each tab can be configured with a different compute/catalog/database combination.
    <Img src="/img/getting-started/release-notes/3.9.0/sql-editor-tabs.png" alt="SQL Editor tabs" />
  </ReleaseSection>

  <ReleaseSection title="🐛 Bug Fixes">
  - Fixed a bug in the IOMETE Console that prevented Jupyter kernel configurations from displaying.
  - Patched the logic behind the "Cancel" action in the SQL Editor to prevent it from hanging.
  - The `iom-core` pod now dynamically reloads any `docker.tagAliases` defined in `values.yaml`, removing the need to restart the pod.
  - Fixed issues that could prevent scheduled Spark applications from sending failure notifications.
  </ReleaseSection>
</Release>

<Release version="3.8.2" date="June 24, 2025" title="Patch Release">
  <ReleaseSection title="🐛 Bug Fixes">
  - Minor bug fix on the IOMETE console that prevented Jupyter kernel configuration from showing
  </ReleaseSection>
</Release>

<Release version="3.7.3" date="June 24, 2025" title="Patch Release">
  <ReleaseSection title="🐛 Bug Fixes">
  - Patched the logic behind the "Cancel" action in the SQL Editor to prevent it from hanging.
  - The `iom-core` pod now dynamically reloads any `docker.tagAliases` defined in `values.yaml`, removing the need to restart the pod.
  - Fixed issues that could prevent scheduled Spark applications from sending failure <notifications></notifications>
  </ReleaseSection>  
</Release>

<Release version="3.8.1" date="June 9, 2025" title="Spark 3.5.5-v1 available">
  <ReleaseSection title="📢 Notifications">
  - We added the ability for users to select the type of security to use when connecting to their SMTP
    <Img src="/img/getting-started/release-notes/3.8.1/smtp-configuration.png" alt="Configure SMTP" />
  </ReleaseSection>

  <ReleaseSection title="🐛 Bug Fixes">
  - Fixed a bug that users were not able to use the "restart" button for Compute clusters
  - We added pagination to tables in the data explorer and data catalog
  </ReleaseSection>
</Release>

<Release version="3.8.0" date="June 9, 2025" title="Spark 3.5.5-v1 available">
  <ReleaseSection title="💥 IOMETE Spark">
  - IOMETE Spark version `3.5.5-v1` is now available for testing! We recommend configuring it in the `docker.additionalSparkVersions` section of `values.yaml` during installation. This enables users to select this version as a custom image when setting up a lakehouse. You can also use it as the base image for your Spark jobs.
  - We released a patch for IOMETE Spark `3.5.3-v14` that fixes an issue preventing it from starting correctly when feature flags for Activity Monitoring were not enabled.
  </ReleaseSection>

  <ReleaseSection title="🐛 Bug Fixes">
  - Fixed a bug introduced in version `3.7.0` that prevented IOMETE from being installed from scratch if `docker.tagAliases` was not explicitly set in `values.yaml`.
  - When users are not allowed to view certain columns in a table, the error message now correctly lists the columns they *do* have access to, instead of the generic "access denied" message previously shown in the SQL Editor.
  - Improved the IOMETE REST Catalog to better handle high load and avoid out-of-memory errors.
  - Added pagination to the LDAP sync job to prevent oversized requests and ensure all users and groups can be synchronized to IOMETE in manageable chunks.
  - Made a small update to worksheet duplication to avoid naming conflicts when a duplicate already exists.
  - Proper support has been added for `-` and `.` characters in secret names.
  - Restored the `Runs as user` field in the Spark Applications section to indicate the privileges under which a job was executed.
  </ReleaseSection>
</Release>

<Release version="3.7.0" date="May 26, 2025" title="Custom Spark labels and minor fixes">
  <ReleaseSection title="🔍 Activity Monitoring">
  - Users can now only view their own queries within a domain, enhancing data privacy and security.  
  - A new **Shuffle Metrics** section has been added to the Query Monitoring Details page, providing deeper insights into query performance.  
    <Img src="/img/getting-started/release-notes/3.7.0/shuffle_metrics.png" alt="Shuffle Metrics" />
  - We've also introduced **Total Memory Spilled** to the Performance Metrics section, helping users better diagnose memory-intensive queries.
  </ReleaseSection>

  <ReleaseSection title="💥 IOMETE Spark">
  - Administrators can now define **Docker image tag aliases** using the `docker.tagAliases` field in the `values.yaml` 
    file of the Helm chart used during installation. These aliases simplify image version management for Spark jobs configured 
    in the IOMETE console—allowing teams to reference a friendly name (like `stable` or `experimental`) instead of specific tags. 
    A dedicated UI for managing these aliases is planned for a future release.  
    <Img src="/img/getting-started/release-notes/3.7.0/spark_job_labels.png" alt="Spark Job Docker image tag aliases" />
  - Users can now select specific **IOMETE Spark Images** when running jobs on compute clusters. 
    The list of selectable images is configurable via the `docker.additionalSparkVersions` field in the same `values.yaml` file.  
    <Img src="/img/getting-started/release-notes/3.7.0/compute_cluster_custom_docker_image.png" alt="Compute cluster custom Docker image" />
  - Spark jobs now explicitly set the `SPARK_USER` environment variable on their Kubernetes pods to ensure jobs run under 
    the intended user to avoid Spark falling back on the OS default under specific circumstances.
  - We've improved the **retry logic** for Spark Connect authentication to reduce failures caused by temporary issues.
  </ReleaseSection>

  <ReleaseSection title="🛠️ Technical Details">
  - During installation, administrators can configure **Docker image tag aliases** in the `docker.tagAliases` section of 
    the `values.yaml` file. These aliases can be referenced when setting up Spark jobs in the IOMETE console. For example, 
    aliases like `stable` and `experimental` can point to specific versions:
    ```yaml
    docker:
      tagAliases:
        stable: 4.2.0
        experimental: latest
    ```
    We intend to move the configuration of these aliases from the Helm chart to the IOMETE console in a future release.
  - In addition to tag aliases, administrators can control which **IOMETE Spark images** are available for compute clusters. 
    The `docker.defaultSparkVersion` field defines the default image used at startup, while `docker.additionalSparkVersions` 
    allows users to choose from a list of alternative versions. This enables testing of new Spark versions or fallback to 
    older ones if issues arise. For example:
    ```yaml
    docker:
      defaultSparkVersion: 3.5.3-v12
      additionalSparkVersions: [3.5.3-v11, 3.5.3-v13, 3.5.5-v1]
    ```
  </ReleaseSection>

  <ReleaseSection title="⚡️ UI Improvements">
  - We moved job notifications to a separate tab in the **Job Details** page
    <Img src="/img/getting-started/release-notes/3.7.0/job_notifications_tab.png" alt="Job Notifications Tab" />
  </ReleaseSection>

  <ReleaseSection title="🐛 Bug Fixes">
  - In the **Query Monitoring** section, users within a domain can now only view their own queries for security reasons. 
    Administrators retain the ability to view all queries across users via the **Query Monitoring** page in the Admin Portal.
  - When **Registering an Iceberg Table** via the SQL Editor, we now select the metadata file with the **latest timestamp**, 
    rather than the one with the highest lexicographical name. This ensures that the most recent schema and snapshot information is used, 
    addressing issues where compactions could cause the lexicographical order to be out of sync with the actual modification time.
  - Fixed an issue where adding or removing notifications from a job would cause the schedules of scheduled jobs to be unintentionally reset.
  </ReleaseSection>

</Release>

<Release version="3.6.0" date="May 12, 2025" title="Spark job archival and improvements">
  <ReleaseSection title="🔍 Activity Monitoring">
  - Spark job metrics can now be automatically archived to the IOMETE system table `activity_monitoring_spark_jobs` in Iceberg when feature flag `sparkJobArchival` is enabled. 
  </ReleaseSection>

  <ReleaseSection title="⚡️ UI Improvements">
  - Removed the option to set the number of executors when running in single-node mode, as it is not applicable in driver-only configurations
  - Fix bug that can prevent worksheet creation in SQL editor
  </ReleaseSection>

  <ReleaseSection title="🛠️ Technical Details">
  - IOMETE Spark now treats all catalogs used in queries as case-insensitive. This behavior can be disabled by setting the Spark configuration `spark.iomete.lowercaseCatalogNames.enabled` to false at the cluster or global level.
  - Added new feature flags:
    - `sparkJobArchival`: If set, spark job statistics will be periodically archived to IOMETE system table `activity_monitoring_spark_jobs` in Iceberg
  </ReleaseSection>

  <ReleaseSection title="🐛 Bug Fixes">
  - Patch to automatically detect whether SSL/TLS should be used based on the SMTP port
  - Fixed issue where some pods did not initiate leader election after losing leadership, causing IOMETE internal maintenance jobs to stop running
  - Fixed issue where Spark status events were intermittently not sent to the frontend due to leader election instability
  - Fixed issue where the iom-identity pod intermittently returned incorrect permissions for tag-mask policies
  - Fixed permission enforcement issue in Spark Connect where queries using `spark.sql(...).explain(...)` did not correctly validate the permissions of the user issuing the request. This did not affect queries of the form `spark.sql("EXPLAIN ...")`
  - Restored logging functionality for pod iom-socket
  </ReleaseSection>
</Release>

<Release version="3.4.2" date="May 11, 2025" title="Patch Release">
  <ReleaseSection title="🐛 Bug Fixes">
  - Fixed iom-identity pod intermittently returning incorrect permissions on tag-mask policies
  - Restored logging functionality for pod iom-socket
  </ReleaseSection>
</Release>

<Release version="3.5.1" date="Apr 30, 2025" title="Patch Release">
  <ReleaseSection title="🐛 Bug Fixes">
  - Scheduled Data Compaction jobs now support namespaces other than the default
  </ReleaseSection>
</Release>

<Release version="3.5.0" date="Apr 29, 2025" title="Query Monitoring and System Improvements">
  <ReleaseSection title="🔍 Activity Monitoring">
  - Administrators can now cancel running queries directly from the IOMETE console
  <Img src="/img/getting-started/release-notes/3.5.0/activity_monitoring_cancel_query.png" alt="Cancelling Queries" />
  </ReleaseSection>

  <ReleaseSection title="📢 Notifications">
  - Administrators can now add an SMTP server integration on the IOMETE console to allow IOMETE to send e-mail notifications
  <Img src="/img/getting-started/release-notes/3.5.0/smtp_integration.png" alt="SMTP Integration" />
  - Users can add e-mail addresses to the configuration of a Spark job and select on which job events they wish to trigger an e-mail
  <Img src="/img/getting-started/release-notes/3.5.0/job_notifications.png" alt="Job Notifications`" />
  </ReleaseSection>

  <ReleaseSection title="🛡️ Custom masking expressions">
  - Next to our predefined masking rules, users can now configure custom masking expressions. In addition, we also support configuring under which conditions this custom masking expression should be applied.
  <Img src="/img/getting-started/release-notes/3.5.0/custom_masking_expression.png" alt="Custom Masking" />
  </ReleaseSection>

  <ReleaseSection title="⚙️ Kubernetes workload isolations">
  - Kubernetes administrators can configure dataplantolerations during IOMETE installation, allowing Spark workloads to be assigned to specific nodes.
  - Priority Classes can also be configured during installation, 
  </ReleaseSection>

  <ReleaseSection title="🔄 API Improvements">
  - Data security APIs verifies validity date windows are in correct format
  - Catalog creation endpoint enforces that catalog names have lowercase alphanumeric characters an underscores only to match UI validation
  - Catalog lookup and deletion APIs are now case-insensitive
  </ReleaseSection>

  <ReleaseSection title="🛠️ Technical Details">
  - Added new feature flags:
    - `priorityClasses`: enabling administrators to limit node allocation for workloads like compute, spark-job, and notebook, and manage resources more effectively across namespaces.
    - `iometeSparkLivenessProbe`: adds a liveness probe as part of the default spark template to monitor if Compute Clusters and jobs are healthy and not in a zombie state. Requires all jobs and compute clusters to run `3.5.3-v10` or newer.
  - When launching a compute cluster with AutoScale enabled, the system will now start with a single executor. Additional executors will automatically scale up based on demand, up to the defined maximum limit.
  </ReleaseSection>

  <ReleaseSection title="🐛 Bug Fixes">
  - Fixed Catalog sync Job breaking on Iceberg nested namespaces
  - IOMETE Iceberg REST Catalog returning HTTP 500 instead of HTTP 503 if connection pool is saturated, preventing Iceberg clients from doing retries 
  </ReleaseSection>
</Release>

<Release version="3.4.0" date="Apr 9, 2025" title="Query Monitoring and System Improvements">
  <ReleaseSection title="🔍 Query Monitoring">
  - Added new query monitoring feature where users can view all running queries and their resource utilization. Active running queries are prioritized at the top for better visibility, with the rest sorted by time. Available in both Admin Panel and Domain page.  
    <Img src="/img/getting-started/release-notes/3.4.0/query-monitoring.png" alt="Query Monitoring" />
  </ReleaseSection>
  <ReleaseSection title="🔄 API Improvements">
  - Upgraded IOMETE API Reference tool to support V3 OpenAPI Specifications  
  - Data Catalog v2 APIs implemented with extended fields:  
    - New APIs for retrieving catalogs with metrics: `totalSchemaCount`, `totalTableCount`, `totalSizeInBytes`, `totalFiles`  
    - New APIs to list databases with metrics: `totalTableCount`, `totalViewCount`, `totalSizeInBytes`, `totalFiles`, `failedTableCount`  
    - New APIs for getting table details and metadata, making it easier to retrieve tables by name instead of ID 
      <Img src="/img/getting-started/release-notes/3.4.0/data-catalog-v2.png" alt="Data Catalog new APIs" />  
  - Added new APIs under IAM Service for checking if user or group exists and retrieving group members  
    <Img src="/img/getting-started/release-notes/3.4.0/user-group-apis.png" alt="New user/group APIs" />  
  - ⚠️ **Deprecation Notice**: Data Catalog v1 APIs and Connect Cluster Resource APIs are now deprecated and planned for removal in the next release  
  </ReleaseSection>
  <ReleaseSection title="⚡️ UI Improvements">
  - Improved input formats on UI and API, now supporting spaces, uppercase characters, and increased length limits
    - Special validation rules remain in place for:
      - Spark catalogs (underscores only)
      - Lakehouses (hyphens, max 53 length)
      - Usernames
  - Standardized UI titles for create actions across all pages
  - Added warning on Data Security page to clarify access permissions when using predefined `{USER}` or `public` group
    <Img src="/img/getting-started/release-notes/3.4.0/security-warning.png" alt="Security Warning" />
  </ReleaseSection>
  <ReleaseSection title="🛠️ Technical Details">
  - Spark now launches with new listeners for monitoring and collecting metrics for running queries (requires restart)
  - SQL Limit enforcer moved to Spark with fallback to previously used `iom-spark-connect` service, removing a potential bottleneck
  - Removed default `autoBroadcastJoinThreshold` config (Spark default is 10mb)
  - Moved spark-config configmap generation process from Helm to init-job for easier deployment process
  - Added new metric to underlying database to track users' last login time
  - Added new feature flags:
    - `caseInsensitiveIcebergIdentifiers`: Makes all table and database names case insensitive in Iceberg REST Catalog
    - `icebergRestCatalogStrictMode`: Enforces users to create database before creating tables
  </ReleaseSection>
  <ReleaseSection title="🐛 Bug Fixes">
  - Fixed security issue where expiration on policies was not working
  - Restored Manage Catalog permission
  - Fixed issue when creating multi-level database where the separator was replaced by non-UTF(01xf) character, causing problems on storage layer
  - Fixed issue with pagination on Gitlab Repositories
  - Fixed issue where job Resume was triggering jobs even if scheduling time passed
  - Fixed issue with Helm where curly braces on `adminCredentials: {}` caused deployment failure
  - Fixed access issue to systems underlying `default_cache_iceberg` virtual catalog
  - Multiple additional bug fixes and improvements across the platform
  </ReleaseSection>
</Release>

<Release version="3.2.0" date="Mar 10, 2025" title="Branding and Stability">
  <ReleaseSection title="🧑‍🎨 Branding">
  - Color schemes adjusted to match our new Branding Identity 🫶
  - New Login Page with brand colors and our New Logo 🚀
    <Img src="/img/getting-started/release-notes/3.2.0/login-page.png" alt="Login Page" />
  </ReleaseSection> 
  <ReleaseSection title="⚡️ Improvements">
  - SQL Editor now has "View Logs" functionality to quickly access Compute logs without quitting the page and navigating to Compute / details / logs.
    <Img src="/img/getting-started/release-notes/3.2.0/view-logs.png" alt="View Logs" />
  - Logs Panel is now redesigned, highlighting log levels and keywords like WARN, ERROR, etc. for visual prominence. Made buttons "Scroll to Bottom" and "Copy" more accessible and user-friendly.
    <Img src="/img/getting-started/release-notes/3.2.0/logs.png" alt="Logs" />
  - Added special feature flag for controlling the export/download of SQL Query results into CSV. This enables Enterprise companies to implement enhanced security measures in preventing data breaches within their organizations.
  - Added FeatureFlags into our Deployment Helm Values. Now features like Jupyter Notebooks, ArrowFlight, Data Products (Experimental), and Monitoring can be disabled individually.
    <Img src="/img/getting-started/release-notes/3.2.0/feature-flags.png" alt="Feature Flags" />
  - Removed the custom right-click context menu from the SQL Editor section and restored the standard browser context menu.
  - Hiding non-relevant information from Data Catalog for non-Iceberg tables. Statistics, Partitions, Snapshots, etc. are now only available for Managed Iceberg Tables.
    <Img src="/img/getting-started/release-notes/3.2.0/data-catalog.png" alt="Data Catalog" />
  - Added Breadcrumbs and removed “Back” icons, for improving the navigation experience.
    <Img src="/img/getting-started/release-notes/3.2.0/breadcrumb.png" alt="Breadcrumb" />
  - Improved experience with Git integrations. Users can now add git integration from a single modal. Removed the project ID field for streamlined setup.
    <Img src="/img/getting-started/release-notes/3.2.0/git.png" alt="Git" />
  - Added “Reset Connection” to SQL Editor Menu. During Connection or network problems users can reset their existing connections and reconnect to Compute instance.
    <Img src="/img/getting-started/release-notes/3.2.0/reset-conn.png" alt="Reset Conn" />
  - Added Rename / Duplicate functionalities to SQL Worksheets
    <Img src="/img/getting-started/release-notes/3.2.0/rename.png" alt="Rename" />
  - Significant amount of vulnerabilities remediated across our systems for enhanced security. 
  - Upgraded Spark Version to 3.5.4 (prev 3.5.3).
  - Upgraded Apache Iceberg version from 1.6.1 to 1.7.1 in our Spark images.
  - IOMETE is now switching to Azure Container Registry `iomete.azurecr.io/iomete` to enable image immutability and avoid limitations of docker hub.
  - Set default `spark.sql.thriftServer.incrementalCollect=true` Spark config. Can be overridden from Global Spark Settings per domain.
  </ReleaseSection>  
  <ReleaseSection title="🛠️ Bug Fixes">
  - Fixed hard-coded Kubernetes’s Cluster DNS (cluster.local) in some internal network calls
  - Ticket CS-194 - resolved - ServiceAccount page was throwing an internal error when end-users within the same group attempted to access its tokens.
  - CS-166, CS-178 - To address cases where artifacts added using --jars or --packages are not being loaded in the executor, we introduced the property `spark.executor.iomete.loadInitialUserArtifactsForEachSession`. Enabling this property for a compute cluster ensures that each session connecting to Spark will load these artifacts. Please note, this property is currently experimental.
  - Auto-Complete issue fixed in Data Security Policy management page.
  </ReleaseSection> 
</Release>

<Release version="3.1.3" date="Feb 11, 2025" title="Granular Admin Roles">
  <ReleaseSection title="⚡ Improvements">
  - Implemented Granular Admin Roles. Admins can now assign specific roles to users for more precise control over platform management.
  - Deleting files from SQL Workspace now does soft delete, allowing users to recover files if needed.
  </ReleaseSection>  
  <ReleaseSection title="🛠️ Bug Fixes">
  - Fixed migration issue with SQL Workspace.
  - Added configuration property to NGINX Gateway, solving timeout issue with SQL Alchemy library when executing long-running quesries. 
  </ReleaseSection> 
</Release>

<Release version="3.1.2" date="Feb 07, 2025" title="Service Account Token Access Fix">
  <ReleaseSection title="🛠️ Bug Fixes" />  
  - Fixed an issue where users could not view access tokens for Service Accounts within the same LDAP group.
</Release>

<Release version="3.0.2" date="Feb 03, 2025" title="Data-Mesh, Arrow Flight, Git, Monitoring">
  <ReleaseSection title="🚀 Domain-Centric Platform">  
    - All resources, including Compute, Spark Jobs, Data Catalog, and SQL Workspace, are now organized by domains.  
    - Each domain can manage its own resources, members, and user roles independently.  
  </ReleaseSection>

  <ReleaseSection title="🛠️ New Admin Portal">  
    <ReleaseDescription>
      A brand-new Admin Portal has been introduced to centralize management, including:
    </ReleaseDescription>
    - Domains and their resources  
    - LDAP and SSO settings  
    - User groups and role management  
    - Compute configurations (node types, volumes, Docker registries)  
    - Spark catalogs and data security policies  
    - Audit and monitoring tools
  </ReleaseSection>

  <ReleaseSection title="🔥 Unified Compute Clusters">  
    - Lakehouse and Spark Connect have been merged into a single Compute Cluster for improved efficiency. 
      <Img src="/img/getting-started/release-notes/3.1.2/compute.png" alt="Compute" /> 
  </ReleaseSection>

  <ReleaseSection title="⚡ Arrow Flight JDBC/ODBC Support">  
    - Added support for Arrow Flight JDBC/ODBC connections for faster and more efficient data transfer.  
    - Introduced a custom IOMETE ODBC Driver over Arrow Flight protocol, enabling seamless integration with Power BI.  
    - The IOMETE ODBC Driver now supports multi-catalog access, allowing users to view and interact with multiple Spark catalogs through a single connection. Previously, each connection was limited to a single catalog.  
      <Img src="/img/getting-started/release-notes/3.1.2/arrow.png" alt="Arrow Flight" /> 
  </ReleaseSection>

  <ReleaseSection title="🎨 SQL Workspace Redesign">  
    <ReleaseDescription>
      The SQL Editor has been redesigned for improved usability and organization:  
    </ReleaseDescription>
    - Vertical tabs for seamless navigation between:
      -	Worksheets
      -	Database Explorer
      -	Query History
    - Sub-folder support in SQL Workspace for better file organization.  
    - Shared Folders and Git Repositories integration, enabling enhanced collaboration and version control.  
      <Img src="/img/getting-started/release-notes/3.1.2/sql.png" alt="SQL Workspace"/> 
  </ReleaseSection>

  <ReleaseSection title="🔗 GitLab Integration"> 
    <ReleaseDescription>
      Domain owners can now seamlessly integrate and manage GitLab repositories within their domains.
    </ReleaseDescription>
    - Adding repositories for collaborative development within the domain.  
    - Viewing repository content and switching branches directly from the platform.  
    - Commit and push functionality is planned for future releases.  
  </ReleaseSection>

  <ReleaseSection title="📖 Data Catalog Improvements">  
    - The Data Catalog details page has been redesigned, now providing more comprehensive insights.  
      <Img src="/img/getting-started/release-notes/3.1.2/data-catalog.png" alt="Data Catalog"/> 
  </ReleaseSection>

  <ReleaseSection title="🚀 Experimental Launch: Data Products"> 
    <ReleaseDescription> 
      The Data Products section has been introduced as an experimental feature, providing a structured way to package, manage, and share curated datasets across teams. This feature enables:  
    </ReleaseDescription>

    - Domain-driven data product creation, ensuring governance and ownership.
    - Enhanced discoverability, allowing users to find and reuse high-quality data assets.

    This marks the first step towards self-service data sharing, with more enhancements planned in future releases.

  </ReleaseSection>

  <ReleaseSection title="🔐 Centralized Security & Catalog Management">  
    - Data Security and Spark Catalog Management are now fully centralized in the Admin Portal, streamlining governance and access control.  
  </ReleaseSection>

  <ReleaseSection title="📈 New Monitoring System">  
    - A new Monitoring Chart has been introduced, powered by IOMETE-supported Prometheus/Grafana integration.  
    - Pre-configured Grafana Dashboards for built-in monitoring and alerting.  
  </ReleaseSection>

  <ReleaseSection title="🔄 Service Account Improvements">  
    - Restricted login access, preventing unauthorized usage.  
    - Granular token visibility, ensuring that Service Account tokens can only be accessed and managed by members within the same group who hold appropriate roles.  
  </ReleaseSection>
</Release>

<ReleaseTitle version="2.2.0" date="November 29, 2024" title="Enhanced Spark Management, Security, and Usability" />

- File and Artifact Upload in Spark Jobs. You can now directly upload files and artifacts to Spark Jobs within the
  IOMETE Console.
- Introduced a Single-Node Spark instance ideal for development and running small-scale jobs, offering a
  resource-efficient option.  
  <Img src="/img/getting-started/release-notes/single-node.png" alt="Single Node"/>
- Major Upgrade to Spark Operator. Upgraded the Spark Operator to version 2.0.2, enabling control over multiple
  data-plane namespaces. The Spark Operator and webhook can now be deployed exclusively to the controller namespace for
  improved management.
- Added a dedicated page for managing Streaming Jobs, providing better oversight and control over streaming operations.
- Introduced a Health page to overview the state of system components, enhancing system monitoring capabilities.  
  <Img src="/img/getting-started/release-notes/health-page.png" alt="Health Page"/>
- Any changes to Spark Catalogs are now fetched automatically within 10 seconds, eliminating the need to restart the
  lakehouse and Spark resources.
- Added a description field to Spark Catalogs for better documentation.
- Included necessary libraries to support the ClickHouse Catalog, expanding data source compatibility.
- Implemented more granular data security controls with separated database permissions.
- SSO Improvements. Relaxed mandatory validations for the SSO protocol to enhance compatibility and user experience.
- Admins can now change or reset users password directly within the platform.
- Introduced support for service accounts. Users can mark accounts as service accounts and create tokens for them, which
  can be used in Spark Jobs and other integrations.
- Cleaned up logs by removing unnecessary messages, improving log readability.

<ReleaseTitle version="2.1.0" date="October 31, 2024" title="Enhanced Control & Performance Release" />

**New Features & Improvements**

- Improved performance of the Spark History Server, optimizing responsiveness and handling of large workloads.
- Added a new global Spark configuration, spark.sql.thriftserver.scheduler.pool, to resolve issues related to the FAIR
  Scheduler.
- Introduced a new Job Marketplace in the IOMETE Console, empowering users to share and explore Spark job templates.
  Admins can manage, curate, and publish templates directly to the marketplace for streamlined collaboration.
- Introduced the LOG_LEVEL environment variable, allowing users to independently set log levels for both Spark Jobs and
  Lakehouses.
- _Access Token Management Enhancements_: New System Config for Access Token expiration policy `access-token.lifetime`
  to set global expiration limits.
- _Access Token Management Enhancements_: Users can now set custom expiration times for Access Tokens directly in the UI
  Console.
- _Access Token Management Enhancements_: Added `lastUsed` field for Access Tokens to enhance tracking and security.
- Substantial optimizations to the Spark policy download process, ensuring smooth performance in large-scale
  deployments.
- Updated the Data-Compaction job to support catalog, database, and table filters, giving users greater control over
  data organization.
- Implemented the System for Cross-domain Identity Management (SCIM) API, facilitating simplified user provisioning and
  management.
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
- Introduced the “Run as User” property in Spark job configuration, allowing user impersonation for special accounts (
  e.g., service accounts) when running Spark jobs.

**Bugs Fixed**

- Resolved an issue with LDAP sync that caused User, Group, and Role Mappings to be removed after synchronization.
- Fixed an issue in Jupyter Notebook where database queries returned no results.
- Resolved a failure when querying Iceberg metadata tables due to row-level filtering policies.
- Fixed LDAP login issue that occurred with case-sensitive usernames.

<ReleaseTitle version="2.0.0" date="October 07, 2024" title="Major Upgrade with Integrated Security, Data Governance, and Enhanced Performance" />

:::info
This release introduces major architectural, functional, and user experience improvements to IOMETE, including
significant changes to user and security management, data access and governance, and catalog performance.
:::

:::warning Major Release
This is a major release with significant changes to the architecture and user experience. IOMETE 2.0.0 is not backward
compatible with IOMETE 1.22.0 or earlier versions. We recommend reviewing the upgrade documentation carefully before
proceeding.
:::

**User and Security Management Enhancements**

### Keycloak Removal & LDAP Integration

We have removed `Keycloak` and transitioned all its functionality—`user`, `group`, and `role` management, as well as
`LDAP` and `SAML/OIDC Connect` support—directly into IOMETE. This shift centralizes control within IOMETE, enhancing
security and simplifying management for large-scale deployments.

Key Improvements:

- Optimized LDAP support for large-scale user integrations, addressing performance issues experienced with Keycloak.
- Support for both user-based and group-based synchronization.
- Service accounts support (users without standard identifiers such as email or first name).

This change improves performance and simplifies maintenance by reducing external dependencies.

**Data Access and Governance Enhancements**

### Ranger Removal & Integrated Policy Management

We have removed Apache Ranger, fully integrating its data access policy management functionality within IOMETE. This
offers better control, performance, and security while reducing the complexity of managing separate systems.

Key Benefits:

- Improved performance and streamlined management of data access policies.
- Reduced security concerns by eliminating the dependency on open-source Ranger.

### Tag-Based Access Control & Masking

We are introducing Tag-Based Access Control and Tag-Based Masking, simplifying data governance within IOMETE by allowing
policies to be triggered automatically based on tags.

Key Features:

- Dynamic Policy Activation: Automatically apply access or masking policies based on tags assigned to tables or columns.
- Tag-Based Access Control: Define user or group access based on tags.
- Tag-Based Masking: Dynamically apply data masking policies for sensitive data based on tags.

This feature streamlines governance processes and provides a more efficient solution for large datasets.

**Catalog and Performance Improvements**

### Integrated Iceberg REST Catalog

IOMETE now includes a fully integrated Iceberg REST Catalog, replacing the previous Iceberg JDBC catalog. This upgrade
delivers enhanced performance, scalability, and security for Spark jobs, Lakehouse clusters, and SparkConnect clusters.

Key Benefits:

- Centralized Caching: Shared metadata cache across all Spark jobs and clusters, improving query resolution times and
  overall system performance.
- Reduced Database Load: Pooled connections significantly reduce strain on the Postgres metadata database.
- Integrated Authentication and Authorization: Supports token-based authentication, OpenConnect, OAuth, and ensures data
  access policies are enforced across REST catalog interactions.
- Multi-Catalog Support: Manage multiple catalogs simultaneously for greater flexibility.
- Openness and Interoperability: Aligns with IOMETE’s vision of openness, supporting external platforms like Dremio,
  Databricks, and Snowflake via standard Iceberg REST protocol.

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

- Centralized Secret Management: Users can now create and manage secrets centrally from the settings page and inject
  them into Spark applications. Supports integration with Kubernetes and HashiCorp Vault for storing secrets. Learn
  more [here](../../user-guide/secrets).
- Added Logs Panel for Spark Connect.
- Resolved an issue related to `tmpfs` storage.
- Spark Job API: Added the ability to override `instanceConfig` in the Spark job API.
- Multi-Namespace Support: Spark resources can now be deployed across different namespaces, enhancing multi-tenant and
  organizational capabilities.
- Iceberg REST Catalog Support: Added support for the Iceberg REST Catalog, expanding the range of catalog integrations.
- JDBC Catalog Support: Introduced support for JDBC Catalog, allowing connections to a wider array of databases.
- Catalog-Level Access Control: Security improvements now allow access control to be managed at the catalog level for
  more granular permissions management.

<ReleaseTitle version="1.19.2" date="August 5, 2024" title="Spark Submission Performance" />

- Optimized performance of spark-operator for handling large numbers of Spark job submissions.

<ReleaseTitle version="1.19.0" date="July 31, 2024" title="Spark Applications, Reuse PVC Options" />

- Restuctured sidebar menu in the IOMETE Console.
  <Img src="/img/getting-started/release-notes/sidebar.png" alt="Sidebar"/>
- **Spark Applications**: Introduced a new Spark Applications page featuring a zoomable timeline chart. This enhancement
  allows for easy tracking and visualization of applications across all Spark jobs.  
  <Img src="/img/getting-started/release-notes/spark-apps.png" alt="Spark Applications"/>
- **Persistent Volume Claim (PVC) Options**: When creating a Volume, you can now choose the "Reuse Persistent Volume
  Claim" and "Wait to Reuse Persistent Volume Claim" options on a per-PVC basis. This feature allows for customized
  volume configurations for different lakehouse and Spark resources, providing greater flexibility and control over
  resource management.
  <Img src="/img/getting-started/release-notes/volumes-reusable-pvc.png" alt="PVC Volume"/>

<ReleaseTitle version="1.18.0" date="July 16, 2024" title="SQL Editor Improvements, Fixed Integrations" />

- Fixed issue with `explain ...` sql statement.
- Added cell expand to the SQL Editor result grid. You can double click on the cell with multi-line value to expand it.
- Added import/download functionality to the worksheets in SQL Editor.
- Fixed issue with DBeaver and Power BI integrations.
- UI / Design improvements in SQL Editor.

<ReleaseTitle version="1.17.0" date="July 8, 2024" title="Data Explorer, SQL Editor Improvements" />

- Fixed issue where nessie catalog displayed wrong list of databases/tables in the SQL Explorer
- Launched beta version of Data-Catalog Explorer (Available in the Data-Catalog menu: from right-top side choose
  Explorer)
- Fixed "Invalid YeafOfEra" issue during Registration of Iceberg Tables.
- SQL Editor: Database Explorer improvements
  - Added partitions folder, you can view table partition columns.
  - Added Iceberg View support. `view` folder now available for iceberg catalogs
  - Improved error messaging in SQL Editor
  - Added item "Open in explorer" to the right-context menu. You can open the selected table in the Data-Catalog
    Explorer to view detailed information and snapshots
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
