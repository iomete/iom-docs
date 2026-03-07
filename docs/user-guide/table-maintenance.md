---
title: Table Maintenance (Beta)
description: Automate Iceberg table housekeeping — compaction, snapshot expiry, orphan file cleanup, and manifest optimization — at the catalog or table level.
sidebar_label: "Table Maintenance (Beta)"
last_update:
  date: 03/05/2026
  author: Shashank Chaudhary
---

import Img from '@site/src/components/Img';
import FAQSection from '@site/src/components/FAQSection';

Iceberg tables naturally accumulate metadata and file overhead as they grow. Frequent writes create many small files, every commit adds a snapshot, failed or interrupted jobs leave orphan files behind, and manifests expand with each operation. Over time, this increases storage usage and slows down query planning and execution.

**Table Maintenance** is an automated background service that continuously keeps tables healthy. It runs a **detect → evaluate → execute** pipeline:

* **Detect** tables that have changed.
* **Evaluate** whether maintenance is required based on configurable thresholds.
* **Execute** the appropriate Iceberg maintenance procedures.

Default rules are defined once at the catalog level, with the option to override them for individual tables. Each run records before/after metrics so you can see what changed, and you can trigger any operation manually when needed.


## How Table Maintenance Works

IOMETE runs a background detection pipeline that continuously monitors your Iceberg tables for changes. Every few minutes, the pipeline identifies tables that have been modified, evaluates whether they require maintenance based on metrics such as file sizes, snapshot age, delete-file ratios, and manifest counts, and automatically runs the necessary maintenance operations when required.

Configuration follows a two-level inheritance model:

- **Catalog level**: sets defaults for every table in a qualifying catalog. You also specify the compute cluster and service account that runs all jobs for that catalog.
- **Table level**: each table can override any catalog-level setting or inherit it. By default, all tables inherit the operation settings and their advanced properties.

Automatic maintenance only runs when a table meets the configured conditions. If a table does not meet those conditions but maintenance is still required, the operation can be triggered manually. See [Manually Triggering an Operation](#manually-triggering-an-operation).

:::info Key Behaviors
- **Catalog as master switch**: catalog-level maintenance must be enabled before any table in it can run maintenance. Trying to enable table maintenance while the catalog is disabled returns an error.
- **Tables don't auto-inherit the enabled state**: even when catalog maintenance is on, each table must be explicitly enabled. This is a deliberate V1 safeguard. Individual operation settings (e.g., rewrite data files, expire snapshots) do inherit normally.
- **Cooldown between runs**: after each successful run, the system enforces a **60-minute cooldown** before the same table and operation can be picked up again. This prevents redundant back-to-back executions on frequently-updated tables. Manual triggers bypass the cooldown and run immediately.
:::


## Prerequisites

Before configuring table maintenance, confirm:

- The catalog meets all of these criteria (not every catalog supports automated maintenance):
  - Catalog type is `ICEBERG`
  - Catalog subtype is `REST`
  - Catalog classification is `INTERNAL` (IOMETE-managed)
  - Catalog isn't in the excluded list (the built-in `spark_catalog` is excluded)
<Img src="/img/user-guide/table-maintenance/iceberg-rest-catalog.png" alt="Spark Catalogs list highlighting an internal Iceberg REST catalog eligible for maintenance"/>
- The catalog has an [owner domain](#catalog-owner-domain) assigned. All maintenance resources (compute cluster, service account) are scoped to it.
<Img src="/img/user-guide/table-maintenance/catalog-owner-set.png" alt="Catalog Permissions tab showing an owner domain assigned"/>
- You're a domain owner of the catalog's owner domain, or a platform administrator.
- The `iom-maintenance` service is deployed. If it isn't, ask your platform administrator to enable it in Helm (see [Feature Flag](#feature-flag)).

## Configuring Catalog-Level Maintenance

Catalog-level maintenance sets the default behavior for all tables in a catalog. Resources must be configured before you can enable any operations.

### Step 1: Opening the Catalog Maintenance Tab

1. Go to **Admin Console > Spark Catalogs** (or **Domain > Settings > Spark Catalogs**).
2. Open a qualifying catalog (see [Prerequisites](#prerequisites)).
3. Click the **Maintenance** tab.

<Img src="/img/user-guide/table-maintenance/catalog-maintenance-tab-unconfigured.png" alt="Catalog Maintenance tab in unconfigured state with empty Resources and Operations sections"/>

:::info Owner domain required
Maintenance controls are disabled until an owner domain is assigned. See [Catalog Owner Domain](#catalog-owner-domain) to assign one.
<Img src="/img/user-guide/table-maintenance/missing-owner-error-maintenance-tab.png" alt="Catalog Maintenance tab showing the owner domain missing alert with the Assign owner link"/>
:::

### Step 2: Configuring Resources

The maintenance service needs a compute cluster and a service account to run operations.

1. In the **Resources** section, select a **Compute** cluster from the dropdown. The list shows clusters that belong to the catalog's owner domain.
2. Select a **Service Account** from the dropdown. The list shows all service accounts in the domain.
3. Click **Save** to save the resource configuration.

<Img src="/img/user-guide/table-maintenance/configure-resources.png" alt="Catalog Maintenance Resources section with Compute cluster and Service Account dropdowns"/>

Once resources are saved, the **Maintenance Operations** section becomes active.

:::warning Resource Requirements
- The compute cluster must be active when a maintenance job runs. If it's stopped or disabled, the operation fails.
- The service account must have `CONSUME` permission on the chosen compute cluster, otherwise saving the resource configuration fails.
- Reassigning the owner domain for a catalog disables maintenance and clears all configured resources. Re-enable maintenance and reconfigure resources after the change.
:::

<details>
<summary>**Recommended Compute Resources**</summary>

Rewrite Data Files and Rewrite Manifest Files run as Spark SQL jobs on the configured compute cluster. Under-resourced clusters cause operations to run slowly or fail entirely. Minimum recommended settings:

| Component | CPU | Memory |
|---|---|---|
| Driver | ≥ 0.5 vCPU | ≥ 0.5 GiB |
| Executor | ≥ 0.5 vCPU | ≥ 0.5 GiB |

- **Executor count**: ≥ 1
- **Autoscaling**: Enabled (with a scale-down delay of at least 5 minutes to avoid premature shutdown mid-job)
</details>

### Step 3: Configuring Operations

1. Toggle **Enable maintenance** to ON. This is the master switch for the entire catalog.
2. For each of the four operations, set the toggle to **Enabled** or **Disabled**:
   - **Expire Snapshots**: removes old snapshots to free storage and improve metadata performance.
   - **Rewrite Data Files**: compacts small files and optimizes data layout for better query performance.
   - **Rewrite Manifest Files**: optimizes manifest files for faster query planning.
   - **Cleanup Orphan Files**: removes files no longer referenced by table metadata.
3. To configure operation-specific thresholds, expand **Advanced Settings** on any enabled operation card and add the properties you want to override. See [Advanced Operation Properties](#advanced-operation-properties) for all available options.
4. Click **Save Operations** to save. Click **Reset** to discard unsaved changes.

<Img src="/img/user-guide/table-maintenance/configure-catalog-config.png" alt="Catalog Maintenance Operations section showing four operation toggles with Advanced Settings"/>

## Configuring Table-Level Maintenance

Table-level settings override catalog defaults for a specific Iceberg table. This is useful when a table has different compaction needs — for example, a high-volume streaming table that needs more aggressive compaction than the catalog default.

1. Go to **Data Catalog**, open a catalog, and navigate to an Iceberg table.
2. Click the **Maintenance** tab. The **Configuration** sub-tab opens by default.

<Img src="/img/user-guide/table-maintenance/table-maintenance-tab-unconfigured.png" alt="Table Maintenance Configuration tab showing the Enable maintenance toggle and four operation cards in default state"/>

3. Use the **Enable maintenance** toggle to enable or disable maintenance for this table.
4. For each operation, choose one of three states:
   - **Inherit**: uses the catalog-level setting. The card shows the inherited state, for example _"Enabled (Inherited from Catalog)"_.
   - **Enabled**: explicitly enables this operation for this table, regardless of the catalog setting.
   - **Disabled**: explicitly disables this operation for this table.
5. To configure operation-specific thresholds, expand **Advanced Settings** on any enabled operation card and add the properties you want to override. See [Advanced Operation Properties](#advanced-operation-properties) for all available options.
6. Click **Save Changes** to save. Click **Reset** to discard unsaved changes.

:::info Table Maintenance Defaults
- Tables are disabled for maintenance by default. You must explicitly enable each one (V1 rollout safeguard).
- Table maintenance can't be enabled while catalog-level maintenance is disabled.
:::


## Catalog Owner Domain

Every catalog that uses maintenance must have an **owner domain** assigned. The owner domain determines which compute clusters and service accounts are available for maintenance jobs. Resources are always scoped to a domain, so the catalog must belong to one before any maintenance configuration is possible.

To assign an owner domain:

1. Open the catalog in **Admin Console > Spark Catalogs**.
2. Select the catalog.
3. Go to the **Permissions** tab.
4. Click the `⋮` (three-dot menu) next to the domain and select **Set as catalog owner**.

<Img src="/img/user-guide/table-maintenance/assign-catalog-owner.png" alt="Domain list with vertical three-dot menu open showing the Set as catalog owner option"/>


## Advanced Operation Properties

Each operation card has an **Advanced Settings** section where you can override individual properties. Add properties one at a time using the **Add Property** dropdown. To revert a property to its inherited default, click the `❌` button next to it.

<Img src="/img/user-guide/table-maintenance/operation-advanced-props.png" alt="Operation card with Advanced Settings panel expanded showing property input fields"/>

_Validation errors display inline below each field. If an error is inside a collapsed **Advanced Settings** panel, the panel expands automatically and the page scrolls to the first invalid field._

### Operations

<details>
<summary>**Rewrite Data Files**</summary>

As data arrives in small batches (through streaming, frequent appends, or small updates), tables accumulate many tiny data files. Each file adds query-planning overhead, and reading dozens of small files is far less efficient than reading a few large ones.

This operation combines small files into larger ones, targeting an optimal file size. The result is shorter query-planning time and better I/O throughput.

| Property | Type | Platform Default     | Description                                                                                                                                     |
|---|---|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| Strategy | String | `binpack`            | Must be `binpack` or `sort`. Use `sort` to cluster data by sort order; requires a sort order to be defined on the table or set in `Sort Order`. |
| Sort Order | String | —                    | Sort order for `sort` strategy, e.g. `col1 DESC, col2 ASC`. Falls back to the table's default sort order if not set.                            |
| Where Clause | String | —                    | Optional filter to restrict which files are compacted.                                                                                          |
| Target File Size Bytes | Long | 512 MB               | Desired output file size after compaction                                                                                                       |
| Min File Size Bytes | Long | 128 MB  | Files smaller than this are candidates for compaction.                                                                                          |
| Max File Size Bytes | Long | 1 GB   | Files larger than this are excluded.                                                                                                            |
| Min Input Files | Integer | 5                    | Minimum number of files required to trigger compaction in a group.                                                                              |
| Max Concurrent File Group Rewrites | Integer | 5                    | Higher values increase parallelism but risk commit conflicts.                                                                                   |
| Delete File Threshold | Integer | 2,147,483,647        | Number of delete files that triggers compaction of a file group.                                                                                |
| Delete Ratio Threshold | Double | 0.3                  | Ratio of delete entries to data rows that triggers compaction.                                                                                  |
| Partial Progress Enabled | Boolean | false                | Commits progress incrementally instead of all at once. Useful for very large tables.                                                            |
| Partial Progress Max Commits | Integer | 10                   | Max number of incremental commits per run.                                                                                                      |
| Partial Progress Max Failed Commits | Integer | 10                   | Maximum amount of commits that this rewrite is allowed to produce if partial progress is enabled.                                               |
| Max File Group Size Bytes | Long | 100 GB | Largest amount of data that should be rewritten in a single file group.                                                                         |
| Remove Dangling Deletes | Boolean | false                | Remove delete files that no longer reference any data rows.                                                                                     |

</details>

<details>
<summary>**Rewrite Manifest Files**</summary>

Each snapshot references data files through manifest files. Over time the manifest count grows, and the query engine must read every one of them during planning. This operation consolidates manifests, reducing the metadata the query planner needs to scan.

| Property | Type | Default | Description |
|---|---|---|---|
| Use Caching | Boolean | false | Enable Spark caching during the operation. This can increase executor memory usage. |

</details>

<details>
<summary>**Expire Snapshots**</summary>

Every write, update, or delete creates a new Iceberg snapshot. Over time, hundreds of snapshots pile up, each retaining references to old data files. This bloats metadata and prevents old data files from being garbage collected.

Expiring snapshots removes anything beyond a retention window, freeing the referenced data files for cleanup.

| Property | Type | Default | Description |
|---|---|---|---|
| Older Than | Duration | 5 days | Snapshots older than this value are eligible for removal. |
| Retain Last | Integer | 1 | Minimum number of snapshots to keep, regardless of age. |

</details>

<details>
<summary>**Cleanup Orphan Files**</summary>

Failed writes, aborted jobs, and certain table operations can leave files on storage that aren't referenced by any snapshot. These "orphan" files consume storage without serving any purpose. This operation scans the entire table storage location and removes unreferenced files.

Because it's a full scan, it **runs on its own cron schedule** rather than triggering on every table change.

| Property | Type | Default | Description                                                                                 |
|---|---|---|---------------------------------------------------------------------------------------------|
| Older Than | Duration | 3 days | Remove orphaned files older than this duration.                                             |
| Cron Schedule | Cron | `0 0 * * 7` (weekly, Sunday midnight) | Schedule for orphan cleanup. Weekly or monthly is recommended. (Requires 5-field UNIX cron) |

Orphan cleanup has several built-in safety mechanisms:

- **Minimum retention period**: the backend enforces a minimum retention of 3 days. If the configured `Older Than` value is below this minimum, the run fails with a non-retryable error.
- **Orphan percentage threshold**: if orphan files exceed 30% of total files, the operation aborts to prevent accidental mass deletion. This typically indicates a misconfiguration or a concurrent operation.
- **Batched deletion**: files are deleted in batches with a cooldown between each batch to avoid overwhelming storage.
- **Flink file exclusion**: files matching an active Flink job's checkpoint pattern (`flink.job-id.*`) are automatically skipped, even if they appear unreferenced.

</details>

:::info Execution Model
- **Rewrite Data Files** and **Rewrite Manifest Files** run as Spark SQL jobs on your configured compute cluster.
- **Expire Snapshots** and **Cleanup Orphan Files** run directly on the `iom-maintenance` service. No compute cluster is needed, but they consume service CPU and memory. If either is slow or causing service degradation, tune the service resources under [Resource Defaults](#resource-defaults).
:::

### How Property Values Are Resolved

Every property value is resolved through a five-level precedence chain. The system works down the list and uses the first value it finds:

| Priority | Source | What it is                                                                                                                                                                                                            |
|---|---|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | **Table maintenance config** | Values you've explicitly set for this table from the IOMETE UI. Highest priority; always wins.                                                                                                                       |
| 2 | **Iceberg table properties** | Raw Iceberg properties set directly on the table (e.g., via `ALTER TABLE SET TBLPROPERTIES`). Only a few IOMETE properties read from here ([more details](#iceberg-properties)). |
| 3 | **Catalog maintenance config** | The catalog-level defaults you've configured from IOMETE UI. Applies to all tables in the catalog unless overridden.                                                                                                  |
| 4 | **Iceberg catalog properties** | Raw Iceberg properties set at the catalog level. Same as table properties but catalog-scoped.                                                                                                                         |
| 5 | **Platform defaults** | Built-in IOMETE defaults. Used as the final fallback when nothing else is set.                                                                                                                                        |

<details id="iceberg-properties">
<summary>**Why do Iceberg properties affect maintenance settings?**</summary>

These are **native Iceberg properties**, not IOMETE maintenance settings. They're defined on the **table or catalog** and influence how maintenance operations run.

If a table already defines one of these properties, IOMETE **uses it as the default** instead of requiring the same value in the maintenance configuration. This means your existing table settings are respected automatically.

Only a few IOMETE settings map to Iceberg properties. If these exist on the table or catalog and are **not overridden** in the maintenance configuration, their values are used.

The maintenance settings that read from Iceberg properties:

| IOMETE Property | Operation | Iceberg Property |
|---|---|---|
| Target File Size Bytes | Rewrite Data Files | `write.target-file-size-bytes` |
| Older Than | Expire Snapshots | `history.expire.max-snapshot-age-ms` |
| Retain Last | Expire Snapshots | `history.expire.min-snapshots-to-keep` |

</details>


## Viewing Maintenance History

The **History** sub-tab lists every maintenance run for a table, including before/after metrics for completed runs. It's the fastest way to see what ran, why it ran, and what changed.

<Img src="/img/user-guide/table-maintenance/table-history-list.png" alt="Maintenance History tab showing a list of maintenance runs with time range, operation type, and status filters"/>

1. Go to the table's **Table Maintenance** tab.
2. Click the **History** sub-tab.
3. Use the filters at the top to narrow results:
    - **Time range**: a date-range picker (maximum range is 30 days)
    - **Triggered by**: filter by the username who triggered the run.
    - **Operation type**: filter to a specific operation.
    - **Status**: filter by status (All, Pending, Running, Completed, etc.)
4. To see metrics for a completed run, click to expand a **Completed** row that has metric data. The expanded row shows a metrics table with **Before** and **After** values.
<Img src="/img/user-guide/table-maintenance/table-history-completed-entry.png" alt="Expanded completed maintenance run row showing before and after metrics table"/>
5. To see the error message for a failed run, hover over the **Failed** status badge.
<Img src="/img/user-guide/table-maintenance/table-history-failed-entry.png" alt="Maintenance History failed run with error message tooltip visible on hover over the Failed status badge"/>
6. The **Reason** column shows why an operation was scheduled: which threshold condition was met (small average file size, high delete-file ratio, snapshot count exceeded retention, etc.) or whether it was a manual trigger.
<Img src="/img/user-guide/table-maintenance/table-history-reason-entry.png" alt="Maintenance History row with the Reason column showing the threshold condition that triggered the run"/>

### Metrics Per Operation

| Operation | Metrics(before/after) |
|---|---|
| Rewrite Data Files | Data File Count, Total File Size |
| Expire Snapshots | Snapshot Count |
| Rewrite Manifest Files | Manifest File Count, Manifest Total Size |
| Cleanup Orphan Files | Total Data File Count, Total Metadata File Count, Total Data File Size, Total Metadata File Size |


## Manually Triggering an Operation

Run any maintenance operation on demand without waiting for the automated schedule. This is useful when testing your configuration or addressing an urgent performance issue.

1. Go to the table's **Table Maintenance > History** sub-tab.
2. Click the **Trigger** button in the table header.
<Img src="/img/user-guide/table-maintenance/table-history-trigger-button.png" alt="Maintenance History tab with the Trigger button highlighted in the table header"/>
3. In the modal, select the operation type from the dropdown.
<Img src="/img/user-guide/table-maintenance/trigger-dialog.png" alt="Trigger maintenance operation dialog with a Select operation dropdown and Cancel and Trigger buttons"/>
4. Click **Trigger** to confirm.

The operation is queued immediately and shows up in the history list with a `PENDING` status. The history list refreshes automatically after the trigger succeeds.

:::warning Before Triggering
- Both table maintenance and the specific operation must be enabled.
- If a job for the same table and operation is already pending or running, the trigger is rejected. Only one active job per table/operation is allowed at a time.
:::

## Kubernetes Deployment

This section covers deployment and tuning for Kubernetes administrators.

### Feature Flag

The maintenance service is disabled by default. Enable it in your Helm values:

```yaml
features:
  enableAutomatedMaintenance:
    enabled: true
```

### Resource Defaults

Tune CPU and memory limits for the `iom-maintenance` service via Helm:

```yaml
services:
  maintenance:
    resources:
      requests:
        memory: "200Mi"
        cpu: "1000m"
      limits:
        memory: "1000Mi"
        cpu: "2000m"
```

### Archival Configuration

Completed maintenance runs are archived to Iceberg tables for long-term retention. Configure via Helm:

```yaml
services:
  maintenance:
    archival:
      enabled: true
      retentionDays: 30
```

The archival batch size is `500` records per cycle and archival runs hourly by default.


<FAQSection faqs={[
  {
    question: "I saved my configuration but nothing changed. Why?",
    answer: "Configuration changes take up to 1 minute to propagate. The detection pipeline caches table configuration with a 1-minute TTL, so newly saved settings won't apply until the next cache refresh."
  },
  {
    question: "Why can't I configure maintenance for my catalog?",
    answerContent: (
      <>
        <p>Maintenance only works with IOMETE-managed internal Iceberg REST catalogs. Unsupported types include <code>spark_catalog</code>, external catalogs (not owned by IOMETE), non-Iceberg catalogs, and non-REST Iceberg implementations.</p>
        <p>If your catalog falls into one of these categories, you'll need to use a different catalog. See the <a href="#prerequisites">Prerequisites</a> section for the full list of requirements.</p>
      </>
    )
  },
  {
    question: "Why are maintenance controls disabled?",
    answerContent: (
      <>
        <p>The catalog doesn't have an owner domain assigned. All maintenance resources (compute clusters and service accounts) are scoped to the owner domain, so one must be set before any controls become active.</p>
        <p>Go to the catalog's <strong>Permissions</strong> tab and assign an owner domain.</p>
      </>
    )
  },
  {
    question: "Why can't I enable table maintenance?",
    answerContent: (
      <>
        <p>Table maintenance requires catalog-level maintenance to be enabled first. It acts as a master switch: even if individual operations are configured at the table level, they won't run until the catalog switch is on.</p>
        <p>See <a href="#configuring-catalog-level-maintenance">Configuring Catalog-Level Maintenance</a>.</p>
      </>
    )
  },
  {
    question: "Table not found or not accessible?",
    answerContent: (
      <>
        <p>This usually means the table doesn't exist in the selected catalog, or your account doesn't have the required permissions to access it.</p>
        <p>Verify the table exists, confirm you're looking in the right catalog, and check that you're a member of the catalog's owner domain or a platform administrator.</p>
      </>
    )
  },
  {
    question: "Can concurrent writes affect maintenance operations?",
    answerContent: (
      <>
        <p>Yes, in two ways:</p>
        <p><strong>Commit failures.</strong> Iceberg uses optimistic concurrency control. Maintenance operations read and rewrite files, then attempt to commit a new snapshot. If concurrent writes modify the same table in the meantime, that commit can fail because the snapshot has changed. For metadata-only conflicts, Iceberg may retry automatically. For data conflicts (e.g., compaction and a streaming writer touching the same partition simultaneously), the operation may fail entirely and gets retried by the maintenance service on the next cycle.</p>
        <p><strong>Metric discrepancies.</strong> Before-and-after metrics are captured at job start and job completion. If concurrent writes commit between those two points, the "before" snapshot may no longer reflect the actual table state when the operation ran, and the "after" metrics may include changes from those writes rather than just the maintenance run itself. This is expected behavior on high-write-frequency tables and doesn't indicate a problem.</p>
        <p>Both situations are uncommon under normal write loads but are more likely on tables with continuous streaming ingestion.</p>
      </>
    )
  },
  {
    question: "Why did a pending job fail without ever running?",
    answerContent: (
      <>
        <p>Jobs that remain in <code>PENDING</code> for more than <strong>24 hours</strong> are automatically failed by the system. This prevents stale jobs from accumulating indefinitely.</p>
      </>
    )
  },
  {
    question: "Why isn't the history table updating automatically?",
    answerContent: (
      <>
        <p>The history table doesn't auto-refresh, so job status changes (such as a run moving from <code>PENDING</code> to <code>RUNNING</code> to <code>COMPLETED</code>) aren't pushed to the page automatically. Use the <strong>Refresh</strong> button to reload the latest status.</p>
        <p>Real-time updates are planned for a future release.</p>
      </>
    )
  },
  {
    question: "Does the system retry failed maintenance operations?",
    answerContent: (
      <>
        <p>Yes. When a maintenance operation fails (for example, due to a commit conflict from concurrent writes), the system automatically puts it back to <code>PENDING</code> and retries it. Up to <strong>3 retries</strong> are attempted, giving transient issues like concurrent write conflicts time to resolve.</p>
        <p>If all 3 retries are exhausted, the operation moves to <code>FAILED</code> and won't be retried automatically. You can see the retry count in the History tab by enabling the <strong>Retries</strong> column through the column visibility controls.</p>
      </>
    )
  },
  {
    question: "Why are some files skipped during orphan file cleanup?",
    answerContent: (
      <>
        <p>If your Iceberg table is written by a Flink streaming job, orphan cleanup automatically skips files that belong to that job. Flink stores in-progress checkpoint data as temporary metadata files before committing them to a snapshot. These files aren't yet referenced by any snapshot, so they look like orphans, but deleting them would corrupt the Flink job's state.</p>
        <p>To prevent this, IOMETE reads the <code>flink.job-id</code> from the table's snapshot summaries and excludes metadata files whose names match that job ID. These files are identified as orphans but are marked ineligible for deletion. This exclusion applies only to metadata files; data files written by Flink are not affected.</p>
        <p>This is safe and expected behavior when Flink and orphan cleanup run concurrently on the same table.</p>
      </>
    )
  }
]} />




