---
title: IOMETE Release Notes
sidebar_label: Platform
description: Get latest release notes for IOMETE. Learn about new features, enhancements, and bug fixes in each release.
last_update:
  date: 07/31/2024
  author: Fuad Musayev
---

import Img from '@site/src/components/Img';
import GridBox from '@site/src/components/GridBox';
import Mailer from '@site/src/components/Mailer';
import { Release, NewFeatures, Improvements, BugFixes, ReleaseDescription, Deprecations, BreakingChanges } from '@site/src/components/Release';

<Mailer/>

<Release version="3.14.0" date="October 27, 2025">
  {/*
    =============================================================================
    RELEASE 3.14.0 - COMPLETE COMMIT DETAILS BY CONTRIBUTOR  
    =============================================================================
    
    Abhishek Pathania
      KOTLIN:
      - Creating/updating notification settings for Spark Jobs failed with a Jackson error when parsing eventTypes
    
    Altay
      SPARK:
      - fix for the arrowflight and spark security authorization exception (#211)
      - Unit test fixes and adding ranger to configurations to be able to run… (#218)

    Aslan Bakirov
      KOTLIN:
      - Upgrade spark in jupyter containers (#1240)
    
    azsefi
      SPARK:
      - Use app_id from env (#212)

    Fuad Musayev
      KOTLIN:
      - Added stale data cleanup logic (#1231)
        - Added transactional annotation to docker alias list
        - SSO login - fixing issues
        - SSO login improvements
        - SSO login log changed to debug
        - SSO login logs
        INFRA:
        - Increased sync-timeout of spark-operator
        - Spark operator bump to 4.0.3

    garayevs
      KOTLIN:
      - Add copy API (#1238)
        - Add priorityClassName to deployment (#1230)
        - Bugfix Copy-To Worksheet/Folder (#1247)
        - IE-100 / S3 Location of Worksheets (#1234)
        - Keep files after copy
        - Load tag aliases only if image has alias
        - Resolve write permission issue in PVC and NFS by adding fsGroup (#1232)

    Mammad Mammadli
      CONSOLE:
        - Add alias for admin/hooks
        - Add docker tag alias management (#445)
        - call bundle asset count from details
        - feat: improve Docker tag alias UI and user experience
        - fix: improve Docker tag alias validation and UX
        - fix: improve scrolling to new Docker tag alias row
        - fix: resolve Docker tag alias list state management issues
        - Implement create flow for docker image
        - Implement delete functionality for docker image
        - Implement edit and delete docker tag alias
        - Implement editing for docker image
        - Implement getting all docker images service
        - Implement onSearch for DataTableV2.tsx
        - implement proper structure for spark versions and docker images
        - make new rows persist after hitting save button
        - Migrate all DataTable with v2 (#425)
        - refactor: rename Docker Images to Docker Settings across the application
        - refactor: reorganize Docker tag alias UI into global and domain sections
        - remove notifications on actions
        - Remove unncessary delete notification
        - Rename docker registries with docker images
        - rename the permission name

    Mateus Aubin
      SPARK:
      - build(arrow-server): add newly required ENV_ARGS (#215)
        - build(arrow-server): fix scalastyle complaints (#214)

    Nurlan Mammadov
      CONSOLE:
        -   feat: add conditional rendering for Spark Job permissions based on onboardSparkJobRas
        -   feat: replace popconfirm with modal confirmation for compute deletion
        -   fix: enable SSO OIDC delete button by removing unused access denied tooltip
        -   fix: handle non-array data in namespace quotas by resource type
        -   fix: show volume warning message during Jupyter container creation if volume not selected
        -   refactor: simplify StorageConfigForm and TestConnection components
        -  fix: handle undefined domainData in GeneralInfo component
        - fix: `Storage class name` added to `Volume` details in details view:
        - fix: add back button to ErrorResult component in StorageConfigCreate
        - fix: handle empty data case in ResourceQuotasByType component
        - refactor: combine namespace quota components into unified tabbed interface

    Sourabh Jajoria
      KOTLIN:
        - Adding TTL based cache expiry to system-config to solve pod cache invalidation issue (#1227)
        - Adding validations to ensure tags added to docker image versions are unique in domain (#1233)
        - Creating a new service to manage docker tag aliases (#1239)
        - Dashboard enablement to manage docker image tag (#1198)
        - Pe 144/migrating spark tag alias resolution to database managed (#1243)
        - Updating docker image migration version to avoid conflict (#1228)
        - Updating error messages for docker image management (#1235)
      INFRA:
        - Adding /docker route to iom-core to support docker configuration via dashboard (#252)

    Vugar Dadalov
      CONSOLE:
      - feat: add 'Run as user' column to job list and update filters (V1)
        - feat: add baseUrl prop to SparkJobForm and SparkJobFormSubmit components
        - feat: add copy options to FolderNodeMenu and WorksheetNodeMenu for folder and worksheet data
        - feat: add delete action to SparkJobForm and SparkStreamingJobForm components
        - feat: add jobUser (Run as user) parameter to various Spark (V2) app and job components for enhanced filtering
        - feat: add sparkAppsTimeline query key and update useSparkAppTimeline to accept jobUser parameter for enhanced filtering
        - feat: add storage provider options and update StorageConfigForm and columns for improved selection and display
        - feat: refactor move and copy functionality to use unified payload structure across components
        - feat: update copy options in FolderNodeMenu and WorksheetNodeMenu to use fullPath instead of path and storagePath
        - fix: add danger prop to Abort button in SparkAppAbortAction component
        - fix: adjust icon margin in FolderNodeMenuCopyItems for better alignment
        - fix: disable buttons when user lacks management permissions in SparkJobFormSubmit
        - fix: simplify className assignment for visibility in FolderNodeMenuCopyItems
        - fix: update button properties to set block to false in SparkJobCreate and SparkStreamingJobCreate components
        - fix: update Marketplace button to disable based on marketplace management permissions

    =============================================================================
  */}

  <NewFeatures>
    {/* Review: Mammad Mammadli, Sourabh Jajoria */}
    - **Docker Settings Management**:
      - Introduced centralized Docker Settings management in the Admin Portal, replacing the previous Docker Registries configuration.
      - Admins can now manage Docker images and their versions directly from the IOMETE Console.
      - Added support for configuring custom Docker images for Spark Jobs and Compute Clusters.

    {/* Review: Mammad Mammadli, Sourabh Jajoria, Fuad Musayev */}
    - **Docker Tag Alias Management**:
      - Added UI-based management for Docker tag aliases, enabling admins to create, edit, and delete aliases directly from the Console.
      - Docker tag aliases can now be managed at both global (Admin Portal) and domain levels.
      - Tag aliases are now stored in the database rather than Helm chart configuration, allowing dynamic updates without pod restarts.
      - Added validation to ensure tag aliases are unique within each domain.

    {/* Review: Vugar Dadalov, garayevs */}
    - **Worksheet and Folder Copy Functionality**:
      - Users can now copy worksheets and folders within SQL Workspace with improved payload structure.
      - Added copy options to folder and worksheet context menus for enhanced usability.
      - Files are retained after copy operations for better data management.
  </NewFeatures>

  <Improvements>
    - **Spark Job Filtering Enhancements**:
      - Added "Run as user" column to Job Template and Streaming Job listing pages.
      - Implemented filtering by "Job User" (Run as user) for both Job Runs and Job Listings.
      - Improved time-based filtering to include running jobs that started before the selected time window, ensuring active jobs remain visible regardless of when they were initiated.

    {/* Review: Vugar Dadalov, garayevs */}
    - **SQL Workspace Improvements**:
      - Worksheets now display their S3 storage location for better transparency.
      - Added copy functionality with improved path handling using `fullPath` instead of `path` and `storagePath`.

    {/* Review: Vugar Dadalov, Nurlan Mammadov */}
    - **Storage Configuration Enhancements**:
      - Added storage provider options to Storage Config form for improved selection and display.
      - Simplified StorageConfigForm and TestConnection components for better maintainability.
      - Added back button to ErrorResult component in StorageConfigCreate for improved navigation.

    {/* Review: Nurlan Mammadov */}
    - **Resource Management**:
      - Combined namespace quota components into a unified tabbed interface for better organization.
      - Added `Storage class name` to Volume details view for improved visibility.
      - Improved handling of non-array data in namespace quotas by resource type.

    {/* Review: Fuad Musayev */}
    - **Spark Operator Upgrade**: Upgraded Spark Operator to version 4.0.3 with improved performance and stability.

    {/* Review: Aslan Bakirov, garayevs */}
    - **Jupyter Container Improvements**:
      - Upgraded Spark version in Jupyter Containers for better compatibility.
      - Resolved write permission issues in PVC and NFS volumes by adding `fsGroup` configuration.

    {/* Review: Altay, Mateus Aubin */}
    - **Spark ArrowFlight Enhancements**:
      - Arrow Flight server can now run on `iom-spark-connect` for improved scalability.
      - Fixed ArrowFlight authorization exceptions for better security enforcement.

    {/* Review: Sourabh Jajoria, Fuad Musayev */}
    - **System Configuration**:
      - Added TTL-based cache expiry to system-config to resolve pod cache invalidation issues.
      - Stale data cleanup logic implemented for improved system hygiene.

    {/* Review: Mammad Mammadli, Nurlan Mammadov, Vugar Dadalov */}
    - **UI/UX Improvements**:
      - Migrated all DataTable components to DataTableV2 for improved performance and consistency.
      - Replaced popconfirm with modal confirmation for compute deletion to prevent accidental deletions.
      - Added conditional rendering for Spark Job permissions based on `onboardSparkJobRas` feature flag.
      - Standardized button behavior across Spark Job and Marketplace forms.
      - Improved Docker tag alias UI with better validation and user experience.

    {/* Review: garayevs */}
    - **Infrastructure**:
      - Added `priorityClassName` to deployments for better resource management.
  </Improvements>

  <BugFixes>
    {/* Review: Vugar Dadalov */}
    - **Spark Job Issues**:
      - Fixed Jackson parsing error when creating or updating notification settings for Spark Jobs due to eventTypes parsing failure.
      - Fixed issue where running Spark jobs were not included in search results when filtering by time range.

    {/* Review: Sourabh Jajoria */}
    - **SSO Login Improvements**:
      - Fixed various SSO login issues with improved error handling and logging.
      - SSO login logs changed to debug level to reduce log noise.

    {/* Review: Vugar Dadalov */}
    - **Jupyter Container Fixes**:
      - Fixed volume warning message display during Jupyter Container creation when no volume is selected.

    {/* Review: Mammad Mammadli, Nurlan Mammadov */}
    - **UI Fixes**:
      - Fixed SSO OIDC delete button by removing unused access denied tooltip.
      - Fixed handling of undefined `domainData` in GeneralInfo component.
      - Fixed empty data case handling in ResourceQuotasByType component.
      - Improved scrolling behavior when adding new Docker tag alias rows.
      - Resolved Docker tag alias list state management issues.

    {/* Review: Vugar Dadalov, garayevs */}
    - **Worksheet and Folder Operations**:
      - Fixed Copy-To Worksheet/Folder functionality with improved payload structure.
  </BugFixes>
</Release>



<Release version="3.13.1" date="October 28, 2025">
  <Improvements>
  - Added support for optional bundle in Spark Job creation via API call. Spark Job is added to default resource bundle if no bundle id is provided in request payload
  </Improvements>
  <BugFixes>
  - Fixed Spark Job logs permission issue
  </BugFixes>
</Release>

<Release version="3.13.0" date="October 13, 2025">
  <Improvements>
    - **Jupyter Containers**:
        - Implemented automatic sign-in when launching a new Jupyter Container instance, removing the need for manual authentication.
        - Added persistent storage support for Jupyter Container instances using **PVC** and **NFS**. Volume attachment is now **optional** — users can choose to launch temporary Jupyter Containers without any volume attached.
        - Onboarded Jupyter Containers to the [RAS framework](/docs/user-guide/iam/ras/ras.md), enabling management through resource bundles.  You can now streamline access control by granting permissions to users and groups at the resource bundle level.
    - **Spark Applications filtering optimizations in UI**:
      - Optimized SQL queries for filtering Spark applications by resource tags.
    - **Resource Bundles**:
      - Added search and sort functionality to the resource bundle listing dashboard to improve resource bundle user experience.
    - **Spark Job Metrics Link**:
      - Updated Grafana links on the Job Run page to include a **5-minute time buffer** around job duration to account for ingestion delays.
      - Added **`var-app_id`** and **`var-job_id`** query parameters for precise filtering directly from the console.
    - **External Grafana Dashboard**:
      - Added support for configuring external Grafana dashboard URLs via system configuration with given properties 
        - `external-grafana.service-availability.dashboard-url`
        - `external-grafana.alerting-rules.dashboard-url`
      - This allows monitoring links to work seamlessly even when Grafana is hosted externally.
    - **Resource Quotas Visualization enhancements**:
      - Added resource quota visualization to both the **Admin Portal → Namespaces** page and the **Domain Home Page**, showing usage for Compute Clusters, Spark Jobs, and (if enabled) Jupyter Containers at the namespace level.
      - These visualizations appear only when Priority Classes are enabled in helm chart.
      - Moved the **tooltip** to the right side and aligned **values** inside the tooltip to the right for better readability.
      <Img src="/img/user-guide/home-page/resource-quota.png" alt="Home Page" maxWidth="800px" centered />
    - **Resource Quota Enforcement**:
      - **All Resources**:
        - Introduced **volume-based threshold checks** in addition to existing quota checks for **Compute Clusters**, **Spark Jobs**, and **Jupyter Containers**.
        - Added **frontend validations** so users can instantly see if their resource requests exceed quotas before submitting.
          <Img src="/img/user-guide/spark-jobs/quota-validation-frontend.png" alt="Resource Quota Validation" maxWidth="800px" centered />
        - Added a **Resource Allocation Summary** on create/edit pages to show how much of each resource will be used versus maximum limits.
          <Img src="/img/user-guide/spark-jobs/quota-summary.png" alt="Resource Quota Summary" maxWidth="800px" centered />
        - Quotas continue to be enforced at both the **namespace** and **priority-class** levels (when configured).
      - **Spark Job**:
        - For jobs using the new **Job Orchestrator** flow, additional quota checks have been added to further improve **job queuing** when limits are reached. This ensures consistent quota enforcement across both **job creation/update** and **job scheduling**.
          - CPU (requests)
          - Memory (requests)
          - Storage (general & storage-class-specific)
          - PersistentVolumeClaims (PVCs) (general & storage-class-specific)
        - **Grafana Dashboard Update**: Job Orchestrator dashboards now display updated quota utilization insights.
    - **Resource Create/Edit Page**: Displayed the **storage class name** for **On-Demand PVC** volumes, making it easier for users to identify which storage class will be used for each volume.
      <Img src="/img/user-guide/spark-jobs/on-demand-pvc.png" alt="On Demand PVC" maxWidth="800px" centered />
    - **Spark Images for Spark Jobs**:
      - Added support for selecting configurable IOMETE Spark images when creating Spark Jobs, with available versions defined via the `docker.defaultSparkVersion` and `docker.additionalSparkVersions` fields in the Helm chart’s `values.yaml` file.  
      - Image options are shown dynamically based on the chosen application type — **Python** displays Python based images, while **JVM** displays JVM based images.
      <Img src="/img/user-guide/spark-jobs/spark-image.png" alt="Spark Image List" maxWidth="800px" centered /> 
    - **Deployment Flow Renamed**: Renamed the deployment flow from **Prefect** to **Priority-Based**.
    - **Spark Job Access Management**: Onboarded Spark Jobs to the [RAS framework](/docs/user-guide/iam/ras/ras.md), enabling management through resource bundles. You can now streamline access control by granting permissions to users and groups at the resource bundle level eliminating the need to manage role based permissions
    - **SQL Editor CSV Export permission**: CSV export functionality in the SQL Editor is now role-based. A new permission has been added to roles to control access to exporting result sets as CSV files.
    <Img src="/img/user-guide/iam/roles/sql-export.png" alt="SQL Editor CSV Export" maxWidth="800px" centered />
    - **Admins are now fully authorized users in RAS**: **Super Admin**, **Domain Manager Admins** and **Domain Owners** have full authorization within the [RAS framework](/docs/user-guide/iam/ras/ras.md).
    - **Spark/Arrowflight**: 
      - Added possibility to override the content-type for the Arrow file format when uploading data to S3 (Offload mode enabled). For overriding you can set spark configuration per compute or on a global level `spark.iomete.arrow.flight.sql.arrowFetch.storage.s3.contentTypeOverride`.
      - Onboarded Spark to new RAS Authorization. Now external clients using JDBC/ODBC or Spark Connect will have to have a `consume` rights on RAS in order to utilize Spark.
  
  </Improvements>

  <BugFixes>
    - **Spark Jobs**: 
      - **Job Validation Fix**:
        - Fixed an issue where jobs could be created or updated with type **SCHEDULED** without providing a schedule, causing broken entries in the Jobs UI.  
        - **Cause**: Missing validation allowed `SCHEDULED` jobs to be created without a schedule.  
        - **Fix**: Added validation requiring a schedule when creating or updating `SCHEDULED` jobs.
            - **Note/Important: If missing, the API now throws an error.**
        - **Migration**: Existing invalid jobs are automatically corrected by changing their type to **MANUAL**.
      - **Restart Policy Fix**:
        - Fixed an issue where Spark jobs configured with the **Restart Policy = Always** failed to restart and got stuck in the **Failing** state.
      - **Streaming Job Status Fix**: Fixed an issue where streaming job status remained outdated during startup or execution timeouts because only the Spark application status was being updated.
      - Removed validation which required connection tests to pass while creating storage configs
    - **SQL Editor**:
      - Fixed an issue where selected database was not being propagated when connecting via Arrow Flight.
      - Fixed an issue where appending a query tag to the end of the SQL statement caused a syntax error.
    - **Access Token Expiry Notifications**:
      - Fixed an issue where system-managed tokens were being incorrectly included in expiry notifications.
    - **Spark History**:
      - Fixed the issue where clicking "Spark UI" to access Spark History sometimes resulted in "Application not found" error. To enable this optimization, set the following values:
        - spark.history.provider=org.apache.spark.deploy.history.IometeFsHistoryProvider
        - spark.history.fs.update.interval=2147000000 (large number, nearly Int.MAX_VALUE)
  </BugFixes>
</Release>

<Release version="3.12.2" date="September 25, 2025">
  <BugFixes>
  - Improved NFS validation, to ensure multiple NFS storages can exists and be used for different workloads
  - Removed validation which required connection tests to pass while creating storage configs
  - **Resource Bundle list**
    - Fixed issue where the **Archive** button did not work in the dropdown menu.

  - **Resource Bundle Form**
    - Made the **Description** field optional.
    - Set the default **Owner** type to **Group**.

  - **Resource Bundle Detail – Permissions Form**
    - Set the default **Actor** type to **Group**.
    - Removed the **Permission Preview** page.

  - **Spark (ArrowFlight)**
    - Resolved an issue where queries with LIMIT over the ArrowFlight protocol still triggered a full table scan.
    - Removed an unnecessary bucket-level permission check in ArrowFetch that was causing incorrect “access denied” errors.

  - **SQL Editor**
    - Fixed manual scrollbar dragging issue in Database Explorer.
  </BugFixes>
</Release>

<Release version="3.12.1" date="September 23, 2025">
  <BugFixes>
  - Fixed compute cluster single-node cluster creation failure due to resource quota validation issue.
  </BugFixes>
</Release>

<Release version="3.12.0" date="September 22, 2025">
:::caution **Caution**  
Upgrade with caution. Core Authorization System has changed to RAS, in case you enable it (via helm feature flag) you will have to perform the migration Spark Job from [IOMETE Marketplace](https://github.com/iomete/iomete-marketplace-jobs/tree/main/ras-onboarding)
:::
  <NewFeatures>
  - **Spark ArrowFlight S3 Offload (ArrowFetch mode)**
      - We’re introducing ArrowFetch, a powerful new way to export large datasets.
      This feature leverages direct export from Spark executors to S3, eliminating the driver bottleneck and enabling faster, more scalable, and memory-safe exports.
      With ArrowFetch, you can accelerate exports of big and huge datasets, making it especially valuable for external clients such as BI tools, QA tools, and enterprise data pipelines.
      To enable this feature, set the configuration: `spark.iomete.arrow.flight.sql.arrowFetch=true`
      and provide the required S3 settings as shown in the documentation.
  <Img src="/img/user-guide/spark-arrow/arrowfetch.png" alt="ArrowFetch configurations" maxWidth="650px" centered /> 
  - **Resource Authorization System (RAS) - Resource Bundles**
      - We're excited to introduce **Resource Bundles**, a powerful new feature that revolutionizes how you organize and manage access to your IOMETE resources. Resource Bundles allow you to group related resources — such as compute clusters, storage configurations, and workspaces — into logical collections with centralized permission management.
      - With Resource Bundles, you can now streamline access control by granting permissions to users and groups at the resource bundle level eliminating the need to manage role based permissions. The system supports flexible ownership models, allowing resource bundles to be owned by individual users or groups, with automatic inheritance through group hierarchies. You can easily transfer assets between resource bundles, set granular permissions for different resource types, and maintain organized, secure access to your platform resources.
      - See here for detailed information: [Resource Authorization System Documentation](/docs/user-guide/iam/ras/ras.md)

   <Img src="/img/user-guide/iam/ras/bundle-list.png" alt="Resource Bundle List" maxWidth="1000px" centered />

    - **Storage Configurations**:
      - Configure external storage backends with secure authentication.
      - Onboard resources to these storages and manage access through resource bundles.
      <Img src="/img/user-guide/storage-configs/storage-config-list.png" alt="Storage Configurations" />
      See the [Storage Configs documentation](docs/user-guide/storage-configs.md) for details.
    - **Workspaces**:
      - Organize SQL worksheets into custom workspaces with folder hierarchies.
      - Assign dedicated storages to workspaces via storage configs for data isolation & compliance.
      - Control access through resource bundles, restricting view/write permissions for specific users or groups.
      <Img src="/img/user-guide/workspaces/workspace-list.png" alt="Workspaces" />
      Learn more in the [Workspaces documentation](docs/user-guide/workspaces.md).

    - **EmptyDir Volume Support**

      We've added support for **EmptyDir** as a new volume type.
      With EmptyDir it will be possible to isolate different workloads, automatic post-cleanup, defining usage
      limits while using node local disk which is not possible with Host Path volume type.
      <Img src="/img/user-guide/volumes/emptydir-create.png" alt="On Demand PVC create" maxWidth="600px" />
      Check [documentation](docs/user-guide/volumes.md#emptydir)

    - **NFS Volume Support**:

      We’ve added support for **NFS (Network File System)** as a new volume type.
      With this update, users can now mount external NFS shares directly into their workloads.
      When creating a new volume, simply select **NFS**, provide the **server address** and **exported path**, and the system will handle the rest.
      <Img src="/img/getting-started/release-notes/3.12.0/volume-nfs.png" alt="NFS Volume" />

  </NewFeatures>

  <Improvements>
    - **Access Token Expiry Notifications**: Added support for configurable notifications when access tokens are nearing expiry. Two notification levels are available: *WARNING* and *CRITICAL*. Administrators can define how many days in advance of a token’s expiry the notification should be sent to its owner(s). These settings are configurable in the *System Config* screen using the properties: `access-tokens.notifications.warning` and `access-tokens.notifications.critical`.
    - **Domain Creation Enhancements**:
      - Users no longer need to provide a *Display Name* when creating a domain.  
        - The system now automatically uses the Domain ID as the display name.  
        - Users can still update the display name if they prefer a different name.
      <Img src="/img/user-guide/domain/domain-create.png" alt="Domain Create Page" maxWidth="45rem" centered />
      - Domain IDs now support hyphens (`-`), aligning with conventions already used elsewhere in the platform.
      - **Benefit**: Makes domain creation easier and more consistent, reducing friction during setup.
    - **Spark Applications**
      - We added the namespace column to the *Spark Applications* page inline with the *Job Templates* and *Streaming Jobs* pages 
    - **Resource Quota Enforcement**:
      - Added threshold checks for *Compute Clusters*, *Spark Jobs*, and *Jupyter Containers*.  
      - Users can no longer create or update these resources if doing so would exceed:
        - Namespace-level resource quotas  
        - Or quota limits defined for the **priority class** of the resource (if configured)
      - **Benefit**: Prevents creation of resources that cannot actually run due to quota breaches, ensuring more predictable behavior.
    - **Job Orchestrator (New Spark Deployment Flow)**:  
        - **Prevent Job Starvation**:  
          - Introduced Weighted Round Robin (WRR) scheduling between high- and normal-priority jobs, configurable via `job-orchestrator.queue.high.scheduling-share-percentage` system config.
          - With this configuration, instead of scheduling only high-priority jobs until the high-priority queue is empty, the system allocates 90% of slots to high-priority jobs and 10% to normal-priority jobs by default. This ensures normal-priority jobs still progress and prevents starvation, while high-priority jobs continue to receive preference.
          - Config updates are applied automatically every minute, and admins can adjust the config at any time to match their requirements.
        - **Queued Jobs Visibility**:  
          - Queued jobs are now visible in the IOMETE console on both the Spark Applications listing page and within individual job runs page.
          - Users can also abort queued jobs when needed, providing better control over job management.
    - **JVM Memory Management**: Optimized JVM memory management for the control plane service to maximise the utilisation of allocated memory.
    - **Spark Connect RestClient**: Added liveness and readiness probes to the Spark Connect RestClient to ensure it is healthy and responsive.
    - **Spark Operator Submit Service**: Implemented metrics endpoint for tracking job submission and JVM metrics.
    - **Spark Overhead Memory Customization**: Spark overhead memory is now customizable within the pod memory limits.
  </Improvements>

  <BugFixes>
    - **Global Spark Settings**: Fixed an issue where settings marked as *secret* were incorrectly saved as masked values (`*******`) instead of preserving the original value.
    - **IOM-Catalog Service**: Fixed an OOM issue in the catalog service that occurred during export of tags-related metadata. 
      - **Cause**: Entire tags metadata was being loaded into memory leading to crashes.  
      - **Solution**: Optimized export to filter metadata at the database level and process only what’s required, preventing excessive memory usage.
    - **Spark Operator Submit Service**: Fixed a memory leak issue in the spark operator submit service that occurred when submitting large numbers of Spark jobs.
      - **Cause**: The spark operator submit service was not properly cleaning up in memory error tracking logs after job submission.
      - **Solution**: Implemented proper cleanup of error tracking logs in memory after job submission.
    - **SQL Editor Worksheets**: Fix disappeared words in the worksheet that occurred when navigating to another worksheet and back.
      - **Cause**: The S3 upload was causing truncation when UTF-8 characters required multiple bytes (e.g., accented characters, emojis).
      - **Solution**: Fixed by calculating actual UTF-8 byte length instead of character count to ensure complete file uploads.
  </BugFixes>
</Release>

<Release version="3.11.2" date="September 22, 2025">
  <BugFixes>
  - Fixed users not being able to turn off sending events to Spark History in their Spark jobs. We corrected that we always overwrote setting `spark.eventLog.enabled` to `true`   
  </BugFixes>
</Release>

<Release version="3.11.1" date="August 24, 2025">
  <NewFeatures>
    - **Hybrid Log Retrieval with Kubernetes Hot Storage**:
      - We have added **hot storage** support, allowing recent logs to be served directly from Kubernetes whenever pod logs are available, and the system automatically falls back to external storage like Splunk, Loki, or Elasticsearch if pod logs are not found.
      - This configuration is only valid when using external log sources (Splunk, Loki, or Elasticsearch). Kubernetes cannot be used as a log source together with hot storage.
      - **Helm configuration example for Splunk** (`values.yaml`):
        ```yaml
        logging:
          source: "splunk"          # splunk | loki | elasticsearch
          splunkSettings:
            endpoint: "https://splunk.example.com"
            token: "bearer-token"   # bearer token created in Splunk Settings -> Tokens
            indexName: "main"
          hotStorage:
            enabled: true
            source: "kubernetes"    # currently only kubernetes is supported
        ```
      - **Notes**:
        - Ensure Kubernetes log retention is configured to cover the time ranges you care about; once pods are gone, logs will only be available in external storage.
        - If `hotStorage.enabled: false`, all requests use the external integration if configured.
  </NewFeatures>
  <BugFixes>
    - Fixed missing YAML document separator (`---`) that caused both `spark-log-masking-regexes` and `priority-class-mappings` ConfigMaps to be invalid and not created during Helm upgrades.
    - Fixed an issue where the `useSparkConnectForDbExplorer` feature flag was not respected in the frontend, causing DB Explorer to use v2 APIs (using compute cluster for metadata retrieval) instead of the intended Spark Connect service.
  </BugFixes>
</Release>

<Release version="3.11.0" date="August 11, 2025">
  <NewFeatures>
    - **IOMETE Spark**: Spark version spark-3.5.5 is a default version set.
    - **PriorityClass Mappings**: Implemented Priority Class Mappings, which enables to configure priority classes mappings in helm charts.
    - **Log Management**: 
      - Built Executor Logs feature enabling real-time viewing of compute and Spark job executor logs in the UI. 
      - Added support for downloading logs from external logging systems including Splunk, Loki, and EFK.
    - **Tag Filtering on Spark/Streaming Job List**: You can **search** and **filter** the Spark/Streaming job list by **resource tags**.
      <Img src="/img/getting-started/release-notes/3.11.0/job-filter-by-tag.png" alt="Job Filter By Tag" />
    - **New SQL Chart Types**: You can now visualize SQL query results with **Pie Charts**, **Scatter Plots**, **Treemaps**, and **Composed Charts**.

      <Img src="/img/getting-started/release-notes/3.11.0/sql-pie-chart.png" alt="SQL Pie Chart" />
      <Img src="/img/getting-started/release-notes/3.11.0/sql-scatter-chart.png" alt="SQL Scatter Chart" />
      <Img src="/img/getting-started/release-notes/3.11.0/sql-treemap-chart.png" alt="SQL Treemap Chart" />
      <Img src="/img/getting-started/release-notes/3.11.0/sql-composed-chart.png" alt="SQL Composed Chart" />
    - **Parent-Child Relationship for Groups**:
      - On the **Group Details** page, users can now see both their **directly assigned** and **parent** groups.
      - Added two tabs:
        - **Sub groups** (Inheriting to)
        - **Parent groups** (Inherited from)
      - Same updates applied to **Domain Group Members**.
      - ***Note**: Currently, group relationships apply only to LDAP members.*
      <Img src="/img/getting-started/release-notes/3.11.0/sub-groups.png" alt="Sub groups" maxWidth="700px" centered />
      <Img src="/img/getting-started/release-notes/3.11.0/parent-groups.png" alt="Parent groups" maxWidth="700px" centered />

  </NewFeatures>

  <Improvements>
    - **Job Orchestrator**:
      - Job Priority Restrictions:
          - Only Domain Admins can upgrade jobs to HIGH priority.
          - Regular users can manage NORMAL jobs, edit HIGH, and downgrade to NORMAL.
          - Existing jobs and normal operations remain unaffected.
      - Worker Deployment Changes: Workers moved to respective data planes, reduced resource usage, and added per-namespace configurations.
      - Spark Job Quota Enhancements: Added PriorityClass quota support; system now applies the most restrictive limit across namespace and job-specific quotas for CPU, Memory, and Pods.
    - **API Improvements**: Implemented exposing the token management operations in the API / swagger.
  </Improvements>
 
  <BugFixes>
    - Fixed an issue where resources quotas in the homepage picked up the priority class quota instead of the namespace quota.
    - Fixed an issue where the USE command on a catalog failed with access_denied when the user had access to only specific databases, by adding proper catalog-level USE privilege support.
  </BugFixes>
</Release>

<Release version="3.10.2" date="August 3, 2025">
  <BugFixes>
    - Fixed an issue where the `spark.dynamicAllocation.enabled` flag was always set to false.
    - Fixed an issue where the `spark.executor.instances` was set to 1 even when dynamic allocation was disabled.
    - Fixed an issue where the user failed to query the view when they lack the permission to the underlying table, even if the user has a permission to the view. 
    - Disabled `delete table` button in database explorer within SQL Editor sidebar.
  </BugFixes>
</Release>

<Release version="3.9.3" date="July 23, 2025">
  <BugFixes>
  - Patched `antiAffinity` rules, customers can now configure soft affinity rules for Spark driver pods to help distribute them across nodes and reduce the probability of most drivers ending up on the same node. This can be enabled by setting the flag `iometeSparkDriverAntiAffinity.enabled` to true in values.yaml during installation.
  - The iom-core pod now dynamically reloads any `docker.tagAliases` defined in `values.yaml`, removing the need to restart the pod.  
  </BugFixes>
</Release>

<Release version="3.10.1" date="July 22nd, 2025">
  <BugFixes>
    - Fixed an issue where column descriptions and tags were being unintentionally overridden by the catalog-sync job.  
      - Descriptions will now be preserved if already present.  
      - Tags from the sync job will be merged with existing tags instead of replacing them.
    - Added validations of tags and label names based on the rules mentioned [here](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set).
      - It has been implemented in API level, so that integrated tools to be validated as well.
      - It has been implemented in UI level as well, so the users to be informed about valid syntax formats.
  </BugFixes>
</Release>

<Release version="3.10.0" date="July 15, 2025">
  <NewFeatures>
    - **Job Orchestrator [Beta]**: This is the beta release of our broader initiative to bring orchestration to IOMETE. To enable it, set the flag `jobOrchestrator.enabled` in `values.yaml`.
      - **Priority-based Scheduling**: Users can now prioritize the scheduling of business-critical jobs over regular-priority jobs.
        <Img src="/img/guides/spark-job/job-update-page.png" alt="Job Update Page" maxWidth="600px" centered />
      - **Resource-aware Execution**: Jobs are only submitted when there is sufficient cluster capacity, helping prevent failed or stuck jobs. 
      - **Built-in observability**: We've added rich metrics to monitor queue state, job wait times, and scheduling patterns in real time.
        <Img src="/img/guides/spark-job/job-metrics-monitoring-graphs.png" alt="Job Monitoring Graph" />
      For an in-depth overview, check out the official [press release](/docs/developer-guide/spark-job/job-orchestrator.md).

    - **Jupyter Containers [Beta]**: Jupyter Containers is a powerful new feature that brings familiar Jupyter development environments directly into your IOMETE Platform. This enhancement enables data engineers and analysts to spin up dedicated, pre-configured Jupyter environments with just a few clicks.
      Key highlights:
      - Create isolated Jupyter containers with customizable resource allocation.
      - Each container comes with JupyterLab pre-installed and ready to use. Click "Open JupyterLab" to directly access Jupyter environment from IOMETE UI.
      - Pre-installed Spark libraries for immediate access to distributed computing.
      - Direct connectivity to IOMETE Compute clusters via Spark Connect.
      - Essential developer tools pre-installed: git, aws cli, sparksql-magic, pandas, other libraries and extensions.
      - Authentication: Use your IOMETE username as the default token. Optionally, setup a password to protect sensitive files within container.

      Platform admins can enable it during installation by setting `jupyterContainers.enabled` in `values.yaml`.
      For more details please refer to Jupyter Container's user guide: [Jupyter Containers - Developer Guide](/docs/developer-guide/notebook/jupyter-containers.mdx).

    - **LDAP Group Inheritance**: Group hierarchies synced from LDAP are now taken into account when evaluating Data Security policies. Groups inherit data policies from parent groups in the same way users inherit them.
      - For example, in the diagram below, any data policies applied to the "Data Science Team" will also apply to the "ML Engineers" and "Data Analysts" groups — in addition to any policies directly assigned to those child groups.
        <Img src="/img/getting-started/release-notes/3.10.0/ldap-group-inheritance.png" alt="LDAP Group Inheritance" />
      - This behavior is enabled by default in IOMETE. It can be disabled by setting the feature flag `ldapGroupInheritance.enabled` to `false` in `values.yaml` during Helm installation.

    - **Activity Monitoring**: We are releasing the beta of our own Spark Query Plan viewer. You no longer need to access the UI to view query plans! Enable this feature via `activityMonitoringQueryPlans.enabled` in `values.yaml` during installation.
      <Img src="/img/getting-started/release-notes/3.10.0/query-monitoring-plan.png" maxWidth="700px" centered />
      - Improved visualization of shuffle metrics on the Query Monitoring Details page.
      - Domain owners can now view and cancel all queries within their domain, while regular users can only see and cancel their own queries.
        <Img src="/img/getting-started/release-notes/3.10.0/query-monitoring-domain-member-filter.png" alt="Query Monitoring filter by domain members" maxWidth="700px" />

  </NewFeatures>

  <Improvements>
    - **IOMETE Spark**: Customers can now configure soft affinity rules for Spark driver pods to help distribute them across nodes and reduce the probability of most drivers ending up on the same node. This can be enabled by setting the flag `iometeSparkDriverAntiAffinity.enabled` to `true` in `values.yaml` during installation.
    - Moved hardcoded `iom-openapi` pod resource settings into `values.yaml` in the Helm chart for easier customization.
    - The number of applications shown on the Spark History summary page is now configurable. Set this in `values.yaml` under `services.sparkHistory.settings.maxApplications`.  
      See the Spark property [`spark.history.ui.maxApplications`](https://spark.apache.org/docs/latest/monitoring.html) for more information.
    - Added a new option in the SQL Editor's Database Explorer to delete tables directly from the Iceberg REST Catalog. This is useful when a table is corrupted and Spark cannot delete it. The user must have `DROP TABLE` privileges to perform this operation.  
      <GridBox>
        <Img src="/img/getting-started/release-notes/3.10.0/delete-table-action.png" alt="Data explorer delete table" />
        <Img src="/img/getting-started/release-notes/3.10.0/delete-table-confirm.png" alt="Data explorer delete table" />
      </GridBox>
    - Added a context menu with `Close` and `Close All` options to SQL Editor worksheet tabs for quickly closing the current or all tabs.
      <Img src="/img/getting-started/release-notes/3.10.0/sql-tab-close-all.png" alt="SQL editor tab close all" maxWidth="700px" centered />
    - Tags attached to Spark jobs are now propagated to the corresponding Kubernetes pods as labels.This enables resource management or categorization based on job-specific tags.
      <Img src="/img/k8s/tag-pod-label-propagation.png" alt="Job Tag As a Pod Label" />
  </Improvements>
 
  <BugFixes>
    - Added support to configure the maximum allowed cookie size for HTTP requests. This is useful for customers encountering issues with large cookies. Set the value via `services.gateway.settings.maxCookieSize` in `values.yaml` (default: `128k`).
    - Fixed an issue with access token renewal when executing SQL queries.
    - Patched the data-plane init job to ensure the metastore starts correctly post-install when special characters are used in the PostgreSQL password.
    - Fixed a bug where updates to LDAP settings were not reflected in periodic LDAP syncs.
    - Minor fix to ensure the `iom-catalog` service consistently appears on the health check page.
    - Git Repositories in sql editor now has support for subgroups in gitlab.
    - Allow trailing semicolon in Iceberg CALL statements for better Spark SQL compatibility
  </BugFixes>
</Release>

<Release version="3.9.2" date="July 14th, 2025">
  <Improvements>
    - **Job resource accounting using tags**: Tags that are attached to the spark jobs will be propagated to the pod as labels, which could be used for resource management of jobs categorized by specific tags.
       <Img src="/img/k8s/tag-pod-label-propagation.png" alt="Job Tag As a Pod Label" />
  </Improvements>
  
  <BugFixes>
    - Move hard coded iom-openapi pod resources to values.yaml in chart.
    - Access token renewal issue while executing SQL queries is fixed.
    - Fixed bug where LDAP settings updates were not reflected in periodic LDAP sync.
  </BugFixes>
</Release>

<Release version="3.9.1" date="July 4th, 2025">
  <BugFixes>
    - Fixed an issue where queries run from the SQL Editor were missing automatic `LIMIT` clauses. This was resolved by updating `defaultSparkVersion` in the default HELM chart (`v17`), as older Spark image versions did not enforce limits correctly.
    - Removed unintended debug logging from the `iom-socket` pod to reduce log noise.
  </BugFixes>
</Release>

<Release version="3.9.0" date="June 25, 2025">
  <NewFeatures>
    - **Sensitive data improvements on UI**: Users can now mark variables in the global spark settings as 'sensitive', which shows them redacted on the UI going forward
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
  </NewFeatures>

  <Improvements>
    - **UI Improvements**: The SQL editor in the IOMETE console now supports multiple tabs. Each tab can be configured with a different compute/catalog/database combination.
      <Img src="/img/getting-started/release-notes/3.9.0/sql-editor-tabs.png" alt="SQL Editor tabs" />
  </Improvements>

  <BugFixes>
    - Fixed a bug in the IOMETE Console that prevented Jupyter kernel configurations from displaying.
    - Patched the logic behind the "Cancel" action in the SQL Editor to prevent it from hanging.
    - The `iom-core` pod now dynamically reloads any `docker.tagAliases` defined in `values.yaml`, removing the need to restart the pod.
    - Fixed issues that could prevent scheduled Spark applications from sending failure notifications.
  </BugFixes>
</Release>

<Release version="3.8.2" date="June 24, 2025">
  <BugFixes>
    - Minor bug fix on the IOMETE console that prevented Jupyter kernel configuration from showing
  </BugFixes>
</Release>

<Release version="3.7.3" date="June 24, 2025">
  <BugFixes>
    - Patched the logic behind the "Cancel" action in the SQL Editor to prevent it from hanging.
    - The `iom-core` pod now dynamically reloads any `docker.tagAliases` defined in `values.yaml`, removing the need to restart the pod.
    - Fixed issues that could prevent scheduled Spark applications from sending failure.
  </BugFixes>  
</Release>

<Release version="3.8.1" date="June 9, 2025">
  <NewFeatures>
    - **Notifications**: We added the ability for users to select the type of security to use when connecting to their SMTP
      <Img src="/img/getting-started/release-notes/3.8.1/smtp-configuration.png" alt="Configure SMTP" />
  </NewFeatures>

  <BugFixes>
    - Fixed a bug that users were not able to use the "restart" button for Compute clusters
    - We added pagination to tables in the data explorer and data catalog
  </BugFixes>
</Release>

<Release version="3.8.0" date="June 9, 2025">
  <NewFeatures>
    - **IOMETE Spark**: IOMETE Spark version `3.5.5-v1` is now available for testing! We recommend configuring it in the `docker.additionalSparkVersions` section of `values.yaml` during installation. This enables users to select this version as a custom image when setting up a lakehouse. You can also use it as the base image for your Spark jobs.
    - We released a patch for IOMETE Spark `3.5.3-v14` that fixes an issue preventing it from starting correctly when feature flags for Activity Monitoring were not enabled.
  </NewFeatures>

  <BugFixes>
    - Fixed a bug introduced in version `3.7.0` that prevented IOMETE from being installed from scratch if `docker.tagAliases` was not explicitly set in `values.yaml`.
    - When users are not allowed to view certain columns in a table, the error message now correctly lists the columns they *do* have access to, instead of the generic "access denied" message previously shown in the SQL Editor.
    - Improved the IOMETE REST Catalog to better handle high load and avoid out-of-memory errors.
    - Added pagination to the LDAP sync job to prevent oversized requests and ensure all users and groups can be synchronized to IOMETE in manageable chunks.
    - Made a small update to worksheet duplication to avoid naming conflicts when a duplicate already exists.
    - Proper support has been added for `-` and `.` characters in secret names.
    - Restored the `Runs as user` field in the Spark Applications section to indicate the privileges under which a job was executed.
  </BugFixes>
</Release>

<Release version="3.7.0" date="May 26, 2025">
  <NewFeatures>
    - **Activity Monitoring**: 
      - Users can now only view their own queries within a domain, enhancing data privacy and security.  
      - A new **Shuffle Metrics** section has been added to the Query Monitoring Details page, providing deeper insights into query performance.  
        <Img src="/img/getting-started/release-notes/3.7.0/shuffle_metrics.png" alt="Shuffle Metrics" />
      - We've also introduced **Total Memory Spilled** to the Performance Metrics section, helping users better diagnose memory-intensive queries.
    
    - **IOMETE Spark**: 
      - Administrators can now define **Docker image tag aliases** using the `docker.tagAliases` field in the `values.yaml` 
        file of the Helm chart used during installation. These aliases simplify image version management for Spark jobs configured 
        in the IOMETE console—allowing teams to reference a friendly name (like `stable` or `experimental`) instead of specific tags. 
        A dedicated UI for managing these aliases is planned for a future release.  
        <Img src="/img/getting-started/release-notes/3.7.0/spark_job_labels.png" alt="Spark Job Docker image tag aliases" />
      - Users can now select specific **IOMETE Spark Images** when running jobs on compute clusters. 
        The list of selectable images is configurable via the `docker.additionalSparkVersions` field in the same `values.yaml` file.  
        <Img src="/img/getting-started/release-notes/3.7.0/compute_cluster_custom_docker_image.png" alt="Compute cluster custom Docker image" />
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
  </NewFeatures>

  <Improvements>
    - Spark jobs now explicitly set the `SPARK_USER` environment variable on their Kubernetes pods to ensure jobs run under 
      the intended user to avoid Spark falling back on the OS default under specific circumstances.
    - We've improved the **retry logic** for Spark Connect authentication to reduce failures caused by temporary issues.
    - **UI Improvements**: We moved job notifications to a separate tab in the **Job Details** page
      <Img src="/img/getting-started/release-notes/3.7.0/job_notifications_tab.png" alt="Job Notifications Tab" />
  </Improvements>

  <BugFixes>
    - In the **Query Monitoring** section, users within a domain can now only view their own queries for security reasons. 
      Administrators retain the ability to view all queries across users via the **Query Monitoring** page in the Admin Portal.
    - When **Registering an Iceberg Table** via the SQL Editor, we now select the metadata file with the **latest timestamp**, 
      rather than the one with the highest lexicographical name. This ensures that the most recent schema and snapshot information is used, 
      addressing issues where compactions could cause the lexicographical order to be out of sync with the actual modification time.
    - Fixed an issue where adding or removing notifications from a job would cause the schedules of scheduled jobs to be unintentionally reset.
  </BugFixes>

</Release>

<Release version="3.6.0" date="May 12, 2025">
  <NewFeatures>
    - **Activity Monitoring**: Spark job metrics can now be automatically archived to the IOMETE system table `activity_monitoring_spark_jobs` in Iceberg when feature flag `sparkJobArchival` is enabled.
    - **Spark Job Archival**: Added new feature flags to archive spark job statistics. If set, spark job statistics will be periodically archived to IOMETE system table `activity_monitoring_spark_jobs` in Iceberg
  </NewFeatures>

  <Improvements>
    - **UI Improvements**: 
      - Removed the option to set the number of executors when running in single-node mode, as it is not applicable in driver-only configurations
      - Fix bug that can prevent worksheet creation in SQL editor
    - IOMETE Spark now treats all catalogs used in queries as case-insensitive. This behavior can be disabled by setting the Spark configuration `spark.iomete.lowercaseCatalogNames.enabled` to false at the cluster or global level.
  </Improvements>

  <BugFixes>
    - Patch to automatically detect whether SSL/TLS should be used based on the SMTP port
    - Fixed issue where some pods did not initiate leader election after losing leadership, causing IOMETE internal maintenance jobs to stop running
    - Fixed issue where Spark status events were intermittently not sent to the frontend due to leader election instability
    - Fixed issue where the iom-identity pod intermittently returned incorrect permissions for tag-mask policies
    - Fixed permission enforcement issue in Spark Connect where queries using `spark.sql(...).explain(...)` did not correctly validate the permissions of the user issuing the request. This did not affect queries of the form `spark.sql("EXPLAIN ...")`
    - Restored logging functionality for pod iom-socket
  </BugFixes>
</Release>

<Release version="3.4.2" date="May 11, 2025">
  <BugFixes>
    - Fixed iom-identity pod intermittently returning incorrect permissions on tag-mask policies
    - Restored logging functionality for pod iom-socket
  </BugFixes>
</Release>

<Release version="3.5.1" date="Apr 30, 2025">
  <BugFixes>
    - Scheduled Data Compaction jobs now support namespaces other than the default
  </BugFixes>
</Release>

<Release version="3.5.0" date="Apr 29, 2025">
  <NewFeatures>
    - **Activity Monitoring**: Administrators can now cancel running queries directly from the IOMETE console
      <Img src="/img/getting-started/release-notes/3.5.0/activity_monitoring_cancel_query.png" alt="Cancelling Queries" />
    - **Notifications**: 
      - Administrators can now add an SMTP server integration on the IOMETE console to allow IOMETE to send e-mail notifications
        <Img src="/img/getting-started/release-notes/3.5.0/smtp_integration.png" alt="SMTP Integration" />
      - Users can add e-mail addresses to the configuration of a Spark job and select on which job events they wish to trigger an e-mail
        <Img src="/img/getting-started/release-notes/3.5.0/job_notifications.png" alt="Job Notifications`" />
    - **Custom masking expressions**: Next to our predefined masking rules, users can now configure custom masking expressions. In addition, we also support configuring under which conditions this custom masking expression should be applied.
      <Img src="/img/getting-started/release-notes/3.5.0/custom_masking_expression.png" alt="Custom Masking" />
    - **Kubernetes workload isolations**: 
      - Kubernetes administrators can configure dataplantolerations during IOMETE installation, allowing Spark workloads to be assigned to specific nodes.
      - Priority Classes can also be configured during installation.
  </NewFeatures>

  <Improvements>
    - **API Improvements**: 
      - Data security APIs verifies validity date windows are in correct format
      - Catalog creation endpoint enforces that catalog names have lowercase alphanumeric characters an underscores only to match UI validation
      - Catalog lookup and deletion APIs are now case-insensitive
    - **Technical Details**: 
      - Added new feature flags:
        - `priorityClasses`: enabling administrators to limit node allocation for workloads like compute, spark-job, and notebook, and manage resources more effectively across namespaces.
        - `iometeSparkLivenessProbe`: adds a liveness probe as part of the default spark template to monitor if Compute Clusters and jobs are healthy and not in a zombie state. Requires all jobs and compute clusters to run `3.5.3-v10` or newer.
      - When launching a compute cluster with AutoScale enabled, the system will now start with a single executor. Additional executors will automatically scale up based on demand, up to the defined maximum limit.
  </Improvements>

  <BugFixes>
    - Fixed Catalog sync Job breaking on Iceberg nested namespaces
    - IOMETE Iceberg REST Catalog returning HTTP 500 instead of HTTP 503 if connection pool is saturated, preventing Iceberg clients from doing retries
  </BugFixes>
</Release>

<Release version="3.4.0" date="Apr 9, 2025">
  <NewFeatures>
    - **Query Monitoring**: Added new query monitoring feature where users can view all running queries and their resource utilization. Active running queries are prioritized at the top for better visibility, with the rest sorted by time. Available in both Admin Panel and Domain page.
      <Img src="/img/getting-started/release-notes/3.4.0/query-monitoring.png" alt="Query Monitoring" />
  </NewFeatures>

  <Improvements>
    - **API Improvements**: 
      - Upgraded IOMETE API Reference tool to support V3 OpenAPI Specifications
      - Data Catalog v2 APIs implemented with extended fields:
        - New APIs for retrieving catalogs with metrics: `totalSchemaCount`, `totalTableCount`, `totalSizeInBytes`, `totalFiles`
        - New APIs to list databases with metrics: `totalTableCount`, `totalViewCount`, `totalSizeInBytes`, `totalFiles`, `failedTableCount`
        - New APIs for getting table details and metadata, making it easier to retrieve tables by name instead of ID
          <Img src="/img/getting-started/release-notes/3.4.0/data-catalog-v2.png" alt="Data Catalog new APIs" />
      - Added new APIs under IAM Service for checking if user or group exists and retrieving group members
        <Img src="/img/getting-started/release-notes/3.4.0/user-group-apis.png" alt="New user/group APIs" />
    - **UI Improvements**: 
      - Improved input formats on UI and API, now supporting spaces, uppercase characters, and increased length limits
        - Special validation rules remain in place for:
          - Spark catalogs (underscores only)
          - Lakehouses (hyphens, max 53 length)
          - Usernames
      - Standardized UI titles for create actions across all pages
      - Added warning on Data Security page to clarify access permissions when using predefined `{USER}` or `public` group
        <Img src="/img/getting-started/release-notes/3.4.0/security-warning.png" alt="Security Warning" />
    - **Technical Details**: 
      - Spark now launches with new listeners for monitoring and collecting metrics for running queries (requires restart)
      - SQL Limit enforcer moved to Spark with fallback to previously used `iom-spark-connect` service, removing a potential bottleneck
      - Removed default `autoBroadcastJoinThreshold` config (Spark default is 10mb)
      - Moved spark-config configmap generation process from Helm to init-job for easier deployment process
      - Added new metric to underlying database to track users' last login time
      - Added new feature flags:
        - `caseInsensitiveIcebergIdentifiers`: Makes all table and database names case insensitive in Iceberg REST Catalog
        - `icebergRestCatalogStrictMode`: Enforces users to create database before creating tables
  </Improvements>

  <BugFixes>
    - Fixed security issue where expiration on policies was not working
    - Restored Manage Catalog permission
    - Fixed issue when creating multi-level database where the separator was replaced by non-UTF(01xf) character, causing problems on storage layer
    - Fixed issue with pagination on Gitlab Repositories
    - Fixed issue where job Resume was triggering jobs even if scheduling time passed
    - Fixed issue with Helm where curly braces on `adminCredentials: {}` caused deployment failure
    - Fixed access issue to systems underlying `default_cache_iceberg` virtual catalog
    - Multiple additional bug fixes and improvements across the platform
  </BugFixes>

  <Deprecations>
    - Data Catalog v1 APIs and Connect Cluster Resource APIs are now deprecated and planned for removal in the next release
  </Deprecations>
</Release>

<Release version="3.2.0" date="Mar 10, 2025">
  <NewFeatures>
    - **Branding**: 
      - Color schemes adjusted to match our new Branding Identity
      - New Login Page with brand colors and our New Logo
        <Img src="/img/getting-started/release-notes/3.2.0/login-page.png" alt="Login Page" />
  </NewFeatures>

  <Improvements>
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
    - Added Breadcrumbs and removed "Back" icons, for improving the navigation experience.
      <Img src="/img/getting-started/release-notes/3.2.0/breadcrumb.png" alt="Breadcrumb" />
    - Improved experience with Git integrations. Users can now add git integration from a single modal. Removed the project ID field for streamlined setup.
      <Img src="/img/getting-started/release-notes/3.2.0/git.png" alt="Git" />
    - Added "Reset Connection" to SQL Editor Menu. During Connection or network problems users can reset their existing connections and reconnect to Compute instance.
      <Img src="/img/getting-started/release-notes/3.2.0/reset-conn.png" alt="Reset Conn" />
    - Added Rename / Duplicate functionalities to SQL Worksheets
      <Img src="/img/getting-started/release-notes/3.2.0/rename.png" alt="Rename" />
    - Significant amount of vulnerabilities remediated across our systems for enhanced security.
    - Upgraded Spark Version to 3.5.4 (prev 3.5.3).
    - Upgraded Apache Iceberg version from 1.6.1 to 1.7.1 in our Spark images.
    - IOMETE is now switching to Azure Container Registry `iomete.azurecr.io/iomete` to enable image immutability and avoid limitations of docker hub.
    - Set default `spark.sql.thriftServer.incrementalCollect=true` Spark config. Can be overridden from Global Spark Settings per domain.
  </Improvements>

  <BugFixes>
    - Fixed hard-coded Kubernetes's Cluster DNS (cluster.local) in some internal network calls
    - Ticket CS-194 - resolved - ServiceAccount page was throwing an internal error when end-users within the same group attempted to access its tokens.
    - CS-166, CS-178 - To address cases where artifacts added using --jars or --packages are not being loaded in the executor, we introduced the property `spark.executor.iomete.loadInitialUserArtifactsForEachSession`. Enabling this property for a compute cluster ensures that each session connecting to Spark will load these artifacts. Please note, this property is currently experimental.
    - Auto-Complete issue fixed in Data Security Policy management page.
  </BugFixes>
</Release>

<Release version="3.1.3" date="Feb 11, 2025">
  <Improvements>
    - Implemented Granular Admin Roles. Admins can now assign specific roles to users for more precise control over platform management.
    - Deleting files from SQL Workspace now does soft delete, allowing users to recover files if needed.
  </Improvements>

  <BugFixes>
    - Fixed migration issue with SQL Workspace.
    - Added configuration property to NGINX Gateway, solving timeout issue with SQL Alchemy library when executing long-running queries.
  </BugFixes>
</Release>

<Release version="3.1.2" date="Feb 07, 2025">
  <BugFixes>
    - Fixed an issue where users could not view access tokens for Service Accounts within the same LDAP group.
  </BugFixes>
</Release>

<Release version="3.0.2" date="Feb 03, 2025">
  <NewFeatures>
    - **Domain-Centric Platform**: All resources, including Compute, Spark Jobs, Data Catalog, and SQL Workspace, are now organized by domains. Each domain can manage its own resources, members, and user roles independently.
    - **New Admin Portal**: A brand-new Admin Portal has been introduced to centralize management, including:
      - Domains and their resources  
      - LDAP and SSO settings  
      - User groups and role management  
      - Compute configurations (node types, volumes, Docker registries)  
      - Spark catalogs and data security policies  
      - Audit and monitoring tools
    - **Unified Compute Clusters**: Lakehouse and Spark Connect have been merged into a single Compute Cluster for improved efficiency. 
      <Img src="/img/getting-started/release-notes/3.1.2/compute.png" alt="Compute" /> 
    - **Arrow Flight JDBC/ODBC Support**: 
      - Added support for Arrow Flight JDBC/ODBC connections for faster and more efficient data transfer.  
      - Introduced a custom IOMETE ODBC Driver over Arrow Flight protocol, enabling seamless integration with Power BI.  
      - The IOMETE ODBC Driver now supports multi-catalog access, allowing users to view and interact with multiple Spark catalogs through a single connection. Previously, each connection was limited to a single catalog.  
        <Img src="/img/getting-started/release-notes/3.1.2/arrow.png" alt="Arrow Flight" />
    - **GitLab Integration**: Domain owners can now seamlessly integrate and manage GitLab repositories within their domains.
      - Adding repositories for collaborative development within the domain.  
      - Viewing repository content and switching branches directly from the platform.  
      - Commit and push functionality is planned for future releases.
    - **Experimental Launch: Data Products**: The Data Products section has been introduced as an experimental feature, providing a structured way to package, manage, and share curated datasets across teams. This feature enables:
      - Domain-driven data product creation, ensuring governance and ownership.
      - Enhanced discoverability, allowing users to find and reuse high-quality data assets.
      
      This marks the first step towards self-service data sharing, with more enhancements planned in future releases.
    - **New Monitoring System**: 
      - A new Monitoring Chart has been introduced, powered by IOMETE-supported Prometheus/Grafana integration.  
      - Pre-configured Grafana Dashboards for built-in monitoring and alerting.
  </NewFeatures>

  <Improvements>
    - **SQL Workspace Redesign**: The SQL Editor has been redesigned for improved usability and organization:
      - Vertical tabs for seamless navigation between:
        - Worksheets
        - Database Explorer
        - Query History
      - Sub-folder support in SQL Workspace for better file organization.  
      - Shared Folders and Git Repositories integration, enabling enhanced collaboration and version control.  
        <Img src="/img/getting-started/release-notes/3.1.2/sql.png" alt="SQL Workspace"/>
    - **Data Catalog Improvements**: The Data Catalog details page has been redesigned, now providing more comprehensive insights.  
      <Img src="/img/getting-started/release-notes/3.1.2/data-catalog.png" alt="Data Catalog"/>
    - **Centralized Security & Catalog Management**: Data Security and Spark Catalog Management are now fully centralized in the Admin Portal, streamlining governance and access control.
    - **Service Account Improvements**: 
      - Restricted login access, preventing unauthorized usage.  
      - Granular token visibility, ensuring that Service Account tokens can only be accessed and managed by members within the same group who hold appropriate roles.
  </Improvements>
</Release>

<Release version="2.2.0" date="November 29, 2024">
  <NewFeatures>
    - **File and Artifact Upload in Spark Jobs**: You can now directly upload files and artifacts to Spark Jobs within the IOMETE Console.
    - **Single-Node Spark Instance**: Introduced a Single-Node Spark instance ideal for development and running small-scale jobs, offering a resource-efficient option.  
      <Img src="/img/getting-started/release-notes/single-node.png" alt="Single Node"/>
    - **Streaming Jobs Management**: Added a dedicated page for managing Streaming Jobs, providing better oversight and control over streaming operations.
    - **Health Monitoring**: Introduced a Health page to overview the state of system components, enhancing system monitoring capabilities.  
      <Img src="/img/getting-started/release-notes/health-page.png" alt="Health Page"/>
    - **Service Accounts Support**: Introduced support for service accounts. Users can mark accounts as service accounts and create tokens for them, which can be used in Spark Jobs and other integrations.
  </NewFeatures>

  <Improvements>
    - **Major Spark Operator Upgrade**: Upgraded the Spark Operator to version 2.0.2, enabling control over multiple data-plane namespaces. The Spark Operator and webhook can now be deployed exclusively to the controller namespace for improved management.
    - **Automatic Catalog Updates**: Any changes to Spark Catalogs are now fetched automatically within 10 seconds, eliminating the need to restart the lakehouse and Spark resources.
    - **Spark Catalog Documentation**: Added a description field to Spark Catalogs for better documentation.
    - **ClickHouse Catalog Support**: Included necessary libraries to support the ClickHouse Catalog, expanding data source compatibility.
    - **Enhanced Data Security**: Implemented more granular data security controls with separated database permissions.
    - **SSO Improvements**: Relaxed mandatory validations for the SSO protocol to enhance compatibility and user experience.
    - **User Management**: Admins can now change or reset users password directly within the platform.
    - **Log Management**: Cleaned up logs by removing unnecessary messages, improving log readability.
  </Improvements>
</Release>

<Release version="2.1.0" date="October 31, 2024">
  <NewFeatures>
    - **Job Marketplace**: Introduced a new Job Marketplace in the IOMETE Console, empowering users to share and explore Spark job templates. Admins can manage, curate, and publish templates directly to the marketplace for streamlined collaboration.
    - **LOG_LEVEL Environment Variable**: Introduced the LOG_LEVEL environment variable, allowing users to independently set log levels for both Spark Jobs and Lakehouses.
    - **SCIM API**: Implemented the System for Cross-domain Identity Management (SCIM) API, facilitating simplified user provisioning and management.
    - **Configurable SQL Query Limits**: Added a configurable Limit property (default value: 100) to the SQL Editor, giving users control over query results.  
      <Img src="/img/getting-started/release-notes/query-limit.png" alt="SQL Limit"/>
  </NewFeatures>

  <Improvements>
    - **Spark History Server Performance**: Improved performance of the Spark History Server, optimizing responsiveness and handling of large workloads.
    - **FAIR Scheduler Configuration**: Added a new global Spark configuration, spark.sql.thriftserver.scheduler.pool, to resolve issues related to the FAIR Scheduler.
    - **Access Token Management Enhancements**: 
      - New System Config for Access Token expiration policy `access-token.lifetime` to set global expiration limits.
      - Users can now set custom expiration times for Access Tokens directly in the UI Console.
      - Added `lastUsed` field for Access Tokens to enhance tracking and security.
    - **Spark Policy Optimization**: Substantial optimizations to the Spark policy download process, ensuring smooth performance in large-scale deployments.
    - **Data Compaction Enhancements**: 
      - Updated the Data-Compaction job to support catalog, database, and table filters, giving users greater control over data organization.
      - Updated Data-Compaction job to support catalog, database, table include/exclude filters.
    - **Query Scheduler Logging**: The Query Scheduler job now logs SQL query results, enabling easier debugging and tracking of job outcomes.
    - **Data Security for Views**: Added support for VIEWs, enhancing data access control options.
  </Improvements>

  <BugFixes>
    - Resolved an issue where the Spark UI link was unresponsive from the SQL Editor page.
    - **Data Security**: Fixed INSERT and DELETE permissions (also covering TRUNCATE operations).
  </BugFixes>
</Release>

<Release version="2.0.1" date="October 14, 2024">
  <Improvements>
    - **Database Driver Support**: Added out-of-the-box support for Oracle and Microsoft SQL Server JDBC drivers.
    - **User Impersonation**: Introduced the "Run as User" property in Spark job configuration, allowing user impersonation for special accounts (e.g., service accounts) when running Spark jobs.
  </Improvements>

  <BugFixes>
    - Resolved an issue with LDAP sync that caused User, Group, and Role Mappings to be removed after synchronization.
    - Fixed an issue in Jupyter Notebook where database queries returned no results.
    - Resolved a failure when querying Iceberg metadata tables due to row-level filtering policies.
    - Fixed LDAP login issue that occurred with case-sensitive usernames.
  </BugFixes>
</Release>

<Release version="2.0.0" date="October 07, 2024">
    :::info
    This release introduces major architectural, functional, and user experience improvements to IOMETE, including significant changes to user and security management, data access and governance, and catalog performance.
    :::
    :::warning Major Release
    This is a major release with significant changes to the architecture and user experience. IOMETE 2.0.0 is not backward compatible with IOMETE 1.22.0 or earlier versions. We recommend reviewing the upgrade documentation carefully before proceeding.
    :::

  <BreakingChanges>
    - **Keycloak Removal**: We have removed `Keycloak` and transitioned all its functionality—`user`, `group`, and `role` management, as well as `LDAP` and `SAML/OIDC Connect` support—directly into IOMETE. This shift centralizes control within IOMETE, enhancing security and simplifying management for large-scale deployments.
      
      Key Improvements:
      - Optimized LDAP support for large-scale user integrations, addressing performance issues experienced with Keycloak.
      - Support for both user-based and group-based synchronization.
      - Service accounts support (users without standard identifiers such as email or first name).

      This change improves performance and simplifies maintenance by reducing external dependencies.

    - **Ranger Removal**: We have removed Apache Ranger, fully integrating its data access policy management functionality within IOMETE. This offers better control, performance, and security while reducing the complexity of managing separate systems.

      Key Benefits:
      - Improved performance and streamlined management of data access policies.
      - Reduced security concerns by eliminating the dependency on open-source Ranger.

  </BreakingChanges>

  <NewFeatures>
    - **Tag-Based Access Control & Masking**: We are introducing Tag-Based Access Control and Tag-Based Masking, simplifying data governance within IOMETE by allowing policies to be triggered automatically based on tags.

      Key Features:
      - Dynamic Policy Activation: Automatically apply access or masking policies based on tags assigned to tables or columns.
      - Tag-Based Access Control: Define user or group access based on tags.
      - Tag-Based Masking: Dynamically apply data masking policies for sensitive data based on tags.

      This feature streamlines governance processes and provides a more efficient solution for large datasets.

    - **Integrated Iceberg REST Catalog**: IOMETE now includes a fully integrated Iceberg REST Catalog, replacing the previous Iceberg JDBC catalog. This upgrade delivers enhanced performance, scalability, and security for Spark jobs, Lakehouse clusters, and SparkConnect clusters.

      Key Benefits:
      - Centralized Caching: Shared metadata cache across all Spark jobs and clusters, improving query resolution times and overall system performance.
      - Reduced Database Load: Pooled connections significantly reduce strain on the Postgres metadata database.
      - Integrated Authentication and Authorization: Supports token-based authentication, OpenConnect, OAuth, and ensures data access policies are enforced across REST catalog interactions.
      - Multi-Catalog Support: Manage multiple catalogs simultaneously for greater flexibility.
      - Openness and Interoperability: Aligns with IOMETE's vision of openness, supporting external platforms like Dremio, Databricks, and Snowflake via standard Iceberg REST protocol.

  </NewFeatures>
</Release>

<Release version="1.22.0" date="September 18, 2024">
  <BreakingChanges>
    - **Deployment Process Changes**: 
      - The `data-plane-base` Helm chart has been deprecated and is no longer required for installation.  
      - `ClusterRole`, previously added for multi-namespace support, has been removed, and the system now uses only namespaced Roles.   
      - Spark-Operator is now deployed separately to each connected namespace.  
      - The process for connecting a new namespace has been updated. Please refer to the Advanced Deployment Guides for more information.
  </BreakingChanges>

  <Improvements>
    - **UI Console Pagination**: Added pagination to user related components on UI Console.
  </Improvements>
</Release>

<Release version="1.20.2" date="September 3, 2024">
  <NewFeatures>
    - **Scheduled Job Suspension**: Added possibility to suspend Scheduled Spark applications.
  </NewFeatures>

  <BugFixes>
    - Fixed issue with private docker repos not being visible on UI.
  </BugFixes>
</Release>

<Release version="1.20.0" date="August 26, 2024">
  <NewFeatures>
    - **Centralized Secret Management**: Users can now create and manage secrets centrally from the settings page and inject them into Spark applications. Supports integration with Kubernetes and HashiCorp Vault for storing secrets. Learn more [here](docs/user-guide/secrets.md).
    - **Multi-Namespace Support**: Spark resources can now be deployed across different namespaces, enhancing multi-tenant and organizational capabilities.
    - **Iceberg REST Catalog Support**: Added support for the Iceberg REST Catalog, expanding the range of catalog integrations.
    - **JDBC Catalog Support**: Introduced support for JDBC Catalog, allowing connections to a wider array of databases.
    - **Catalog-Level Access Control**: Security improvements now allow access control to be managed at the catalog level for more granular permissions management.
  </NewFeatures>

  <Improvements>
    - **Spark Connect Logging**: Added Logs Panel for Spark Connect.
    - **Spark Job API Enhancement**: Added the ability to override `instanceConfig` in the Spark job API.
  </Improvements>

  <BugFixes>
    - Resolved an issue related to `tmpfs` storage.
  </BugFixes>
</Release>

<Release version="1.19.2" date="August 5, 2024">
  <Improvements>
    - **Spark Operator Performance**: Optimized performance of spark-operator for handling large numbers of Spark job submissions.
  </Improvements>
</Release>

<Release version="1.19.0" date="July 31, 2024">
  <NewFeatures>
    - **Spark Applications**: Introduced a new Spark Applications page featuring a zoomable timeline chart. This enhancement allows for easy tracking and visualization of applications across all Spark jobs.  
      <Img src="/img/getting-started/release-notes/spark-apps.png" alt="Spark Applications"/>
    - **Persistent Volume Claim (PVC) Options**: When creating a Volume, you can now choose the "Reuse Persistent Volume Claim" and "Wait to Reuse Persistent Volume Claim" options on a per-PVC basis. This feature allows for customized volume configurations for different lakehouse and Spark resources, providing greater flexibility and control over resource management.
      <Img src="/img/getting-started/release-notes/volumes-reusable-pvc.png" alt="PVC Volume"/>
  </NewFeatures>

  <Improvements>
    - **UI Restructuring**: Restructured sidebar menu in the IOMETE Console.
      <Img src="/img/getting-started/release-notes/sidebar.png" alt="Sidebar"/>
  </Improvements>
</Release>

<Release version="1.18.0" date="July 16, 2024">
  <Improvements>
    - **SQL Editor Enhancements**: 
      - Added cell expand to the SQL Editor result grid. You can double click on the cell with multi-line value to expand it.
      - Added import/download functionality to the worksheets.
      - UI / Design improvements in SQL Editor.
  </Improvements>

  <BugFixes>
    - Fixed issue with `explain ...` sql statement.
    - Fixed issue with DBeaver and Power BI integrations.
  </BugFixes>
</Release>

<Release version="1.17.0" date="July 8, 2024">
  <NewFeatures>
    - **Data-Catalog Explorer**: Launched beta version of Data-Catalog Explorer (Available in the Data-Catalog menu: from right-top side choose Explorer)
  </NewFeatures>

  <Improvements>
    - **SQL Editor Database Explorer**: 
      - Added partitions folder, you can view table partition columns.
      - Added Iceberg View support. `view` folder now available for iceberg catalogs
      - Improved error messaging in SQL Editor
      - Added item "Open in explorer" to the right-context menu. You can open the selected table in the Data-Catalog Explorer to view detailed information and snapshots
      - Redesigned result charts
    - **System Information**: Added Spark / Iceberg / Scala version information to the Data-Plane Information page in the Settings menu
    - **Spark Job**: Improved Cron editor in Spark Job configuration
    - **Design Improvements**: Overall design improvements: slowly moving to a more compact design
  </Improvements>

  <BugFixes>
    - Fixed issue where nessie catalog displayed wrong list of databases/tables in the SQL Explorer
    - Fixed "Invalid YearOfEra" issue during Registration of Iceberg Tables.
  </BugFixes>
</Release>

<Release version="1.16.0" date="July 1, 2024">
  <NewFeatures>
    - **Nessie Catalog Support**: Added Nessie catalog support `Beta`
  </NewFeatures>

  <Improvements>
    - **Spark Operator Updates**: Updated spark-operator with performance optimizations and bug fixes
      - Enhances overall system stability and efficiency
    - **Node Type Validation**: Implemented stricter validation for Node Types
      - CPU: Minimum 300 milli-cores
      - Memory: Minimum 900 MiB
      - Ensures compliance with Spark requirements for optimal performance
    - **UI Enhancements**: Various UI improvements for better user experience
  </Improvements>

  <BugFixes>
    - Resolved issue with "STARTING" status in Spark Jobs
      - Improves job status accuracy and monitoring
  </BugFixes>
</Release>

<Release version="1.15.0" date="June 24, 2024">
  <Improvements>
    - **Spark Operator Enhancements**: 
      - Improved performance to handle ~1000 Spark Job submissions per minute
      - Fixed conflict issues when submitting Spark jobs via API
      - Added comprehensive metrics to Spark run details view
      - Implemented Timeline (beta) feature for tracking status changes
      - Integrated Kubernetes events for Spark Resources (Run, Lakehouse)
    - **Job Management**: 
      - Introduced Job retry policy
      - Spark run metrics now available during "running" state
      - Implemented periodic garbage collection for failed jobs in Kubernetes
      - Added support for job run tags and filtering by tag
      - Introduced option to re-trigger runs with the same configuration
    - **Monitoring and Logging**: 
      - Added support for Splunk logging
      - Implemented new System Config in UI Console
      - Added "Spark Jobs alive time" to new "System Config" page
      - Separated Driver and Executor task durations
      - Display summary of total running/complete/pending runs on Spark job page
      - Spark job log view now auto-scrolls to bottom when new logs are added
      - Implemented "Spark Jobs alive time" configuration
    - **UI/UX Enhancements**: 
      - Added time filter to Job Runs
      - Displaying Scheduler Next Run information on UI
      - Added ID to Spark Run Details page
    - **Performance Optimizations**: Fixed long job names causing Spark driver service name conflicts
  </Improvements>

  <BugFixes>
    - Fixed issue where Spark UI occasionally failed to update
    - Resolved Spark History redirection issue (now opens correct page on first load)
    - Addressed Spark driver service name conflicts caused by long job names
  </BugFixes>
</Release>

<Release version="1.14.0" date="June 13, 2024">
  <BugFixes>
    - **Ranger Audit**: Ranger Audit now working as expected. Page added to Data Security section in IOMETE Console.
    - Fixed issue with PowerBI integration.
  </BugFixes>
</Release>
