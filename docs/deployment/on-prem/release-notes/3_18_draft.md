<Release version="3.19.0" date="24 August 2026">
  <NewFeatures>
    - **Ephemeral Storage Reservation for Volumes**: Added a new **Reserve capacity on the node** option for `EMPTY_DIR` volumes. When enabled, the Kubernetes scheduler reserves ephemeral storage on the node for the executor pod, ensuring capacity is available before scheduling. Enabling this option requires setting a **Max size**, which becomes mandatory. The new `schedulerReserved` field defaults to `false`, so existing volumes are unaffected. Configure this option when creating or editing an `EMPTY_DIR` volume in the console.
    - **LDAP Group Membership Audit Events**: LDAP group membership changes detected during sync now emit audit events to `platform_event_logs`. When LDAP sync adds or removes a user from a group, each change is recorded as a distinct event, giving administrators a complete audit trail of group membership changes driven by directory sync.
    - **Data Access Audit for Spark Jobs**: Data access audit logging, previously available only for compute clusters, now covers Spark jobs as well. Ranger audit events from Spark job queries are recorded through the Event Stream audit pipeline, providing a unified audit trail across all Spark workloads.
  </NewFeatures>

  <Improvements>
    - **Spark Job Next Run Display**: Spark jobs using the Priority-Based deployment flow now display their next scheduled run time in the jobs list and detail views. Previously, only jobs on the legacy deployment flow showed a next-run time, while Priority-Based jobs always showed no value.
    - **Spark Job Stuck-State Reconciler**: Added a periodic reconciler that detects Spark job runs stuck in a non-terminal state (such as RUNNING or SUBMITTED) after their corresponding Kubernetes resource has been removed. When the reconciler confirms the Kubernetes resource is gone, it marks the run as FAILED. Runs whose Kubernetes resources are still present are left to the existing event pipeline. This prevents job runs from appearing stuck indefinitely after a missed Kubernetes event.
    - **Compute Executor Defaults**: New compute clusters now default to 1 minimum executor and 2 maximum executors, providing a more practical baseline for autoscaling. Existing clusters are not affected.
    - **Spark Driver Memory Overhead**: Increased the default Spark driver memory overhead to 40% of the driver memory allocation, reducing the likelihood of driver pods being OOM-killed under heavy metadata or broadcast workloads.
    - **Unique Iceberg Table Locations**: The Iceberg REST catalog now assigns a unique storage path to each table by default, preventing the `remove_orphan_files` maintenance procedure from accidentally deleting data files belonging to a different table that shares the same location. Configurable via the `enforceUniqueIcebergTableLocations` setting on the REST catalog.
    - **Spark History Server Max Event Log Size**: Added `spark.history.fs.maxEventLogSizeBytes` to the Spark History Server Helm chart. Event logs exceeding this limit are skipped during rebuild, preventing OOM crashes caused by oversized logs from long-running applications. Default: 500 MB. Configurable via `services.sparkHistory.settings.maxEventLogSizeBytes`.
    - **Metastore Resource Configuration**: Metastore pod CPU and memory resources are now configurable via Helm values, and the previously hardcoded node selector has been removed. Administrators can adjust metastore sizing to match their workload without modifying templates directly.
    - **Job Orchestrator Log Verbosity**: Added `services.jobOrchestrator.verboseLogging` to control job orchestrator server and worker log output. When set to `false` (the default), both components log at ERROR level. Set to `true` to switch to INFO level for troubleshooting. This controls process stdout logging and is separate from `s3Logging`, which governs job and flow run log persistence.
    - **OpenAPI UI Improvements**: The aggregated OpenAPI UI served by the platform now loads updated assets reliably after an upgrade without requiring a hard browser refresh. The search box also filters by endpoint path, HTTP method, summary, and operation ID in addition to tag name, making it easier to locate specific endpoints.
    - **Leader Election Reliability for Schedulers**: Fixed an issue where an exception during leader election callbacks could permanently stop leadership re-election for SQL-related schedulers (query archival, query recovery, cleanup). Scheduler tasks are now created once at startup and gated by a leader flag, so a leadership transition cannot crash the election loop.
    - **Access Token Expiry Notifications**: Access token expiry notifications now include the account name associated with the token, making it easier to identify which account needs attention. Additionally, a single orphaned token record no longer prevents expiry notifications from being evaluated for all other tokens.
    - **Event Stream Liveness Probe**: Updated the Event Stream container liveness probe from `/ready` to `/health`, improving pod restart accuracy when the service is alive but temporarily not ready to accept new events.
    - **Spark Operator**: Upgraded the Spark operator from 4.0.8 to 4.0.9, picking up upstream bug fixes and security patches.
    - **Access Policy Catalog Filter**: The catalog filter in the data security access policy UI now shows the correct set of catalogs available to administrators, matching the admin catalog list.
    - **Platform Security Updates**
      - Patched the `spark-submit-service` image to version `1.0.5`, incorporating dependency updates.
      - Updated the `papyrus` Event Stream image to `2.0.2` and the `papyrus-loader` image to `2.0.3`, incorporating the updated liveness probe and stability fixes.
  </Improvements>

  <BugFixes>
    - **Spark Connect Driver Configuration**: Fixed Spark Connect driver pod configuration to apply Helm-level settings to the driver template.
  </BugFixes>

      **Spark version:** [3.5.7-v6-rc3](./spark.md)
      **Iceberg version:** <!-- TODO: confirm Iceberg version from deployment artifacts -->

</Release>