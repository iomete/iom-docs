---
title: Run History & Metrics
description: View maintenance run history with before/after metrics, and manually trigger operations on demand.
sidebar_label: Run History & Metrics
last_update:
  date: 05/13/2026
  author: Shashank Chaudhary
---

import Img from '@site/src/components/Img';

You can view maintenance runs at two levels:

- **Table-level history** lives on the table's **Maintenance** tab and shows runs for that table only.
- **Catalog-level history** lives under **Monitoring > Maintenance** in the side panel and shows runs across every catalog the domain owns, with filters to narrow the results.

Both views open the same per-run detail page when you click a row.


## Viewing Table-Level History

The table's **Maintenance** tab lists every maintenance run for that table. It's the quickest way to see what ran, why it ran, and what changed.

<Img src="/img/user-guide/table-maintenance/table-history-list.png" alt="Table Maintenance tab showing the run history list with time range, Triggered by, Operation type, and Status filters and a Trigger button in the header"/>

1. Go to **Governance > Data Catalog** from the side panel.
2. Find and open the table details page:
   - **Data Catalog tab**: Search for the table by name and click it.
   - **Data Explorer tab**: Navigate through Catalog > Database > Table.
3. Go to the **Maintenance** tab.
4. Use the filters at the top to narrow results:
    - **Time range**: a date-range picker (maximum range is 30 days).
    - **Triggered by**: filter by the username who triggered the run.
    - **Operation type**: filter by a specific operation.
    - **Status**: filter by status (All, Pending, Running, Completed, etc.).
5. The **Reason** column shows why an operation was scheduled: which threshold condition was met (small average file size, high delete-file ratio, excessive snapshot count, etc.) or whether it was a manual trigger.
<Img src="/img/user-guide/table-maintenance/table-history-reason-entry.png" alt="Maintenance history row with the Reason tooltip expanded showing the threshold conditions that triggered the run"/>
6. For a failed run, hover over the **Failed** badge to see the error message inline.
<Img src="/img/user-guide/table-maintenance/table-history-failed-entry.png" alt="Maintenance history with the error message tooltip visible on hover over the Failed status badge"/>
7. Click any row to open its [run detail page](#viewing-a-run-detail-page).


## Viewing Catalog-Level History

The catalog-level history shows runs across every catalog domain owns and adds Catalog, Database, and Table filters so you can scope the runs however you need.

<Img src="/img/user-guide/table-maintenance/catalog-history-list.png" alt="Catalog-level Maintenance page under Monitoring with Operation Type, Status, Triggered By, time range, Catalog, Database, and Table filters listing runs across multiple tables"/>

1. From the side panel, go to **Monitoring > Maintenance**.
2. Use the filters at the top of the page:
    - **Operation Type**, **Status**, **Triggered By**, **Time range** — same as on the table-level view.
    - **Catalog**, **Database**, **Table** — narrow to a specific scope.
3. The **Table** column shows the full `catalog.database.table` path for each run. Click it to open the [run detail page](#viewing-a-run-detail-page).


## Viewing a Run Detail Page

Clicking a run from either history view opens a dedicated detail page for that run. The page title reflects the operation (for example, **Cleanup Orphan Files Run** or **Expire Snapshots Run**) and lists ID, Status, Operation type, Triggered by, Reason, and timing fields.

<Img src="/img/user-guide/table-maintenance/run-detail-completed.png" alt="Cleanup Orphan Files Run detail page showing the run ID, Completed status, and metadata fields above a metrics table comparing data file and metadata file counts and sizes before and after the run"/>

For **completed** runs, the detail page also shows a **Metrics** table comparing values **Before** and **After** the run, so you can see exactly what changed. Operations that were scheduled automatically also display the **Reason** that triggered them.

<Img src="/img/user-guide/table-maintenance/run-detail-expire-snapshots.png" alt="Expire Snapshots Run detail page for a completed system-triggered run showing the Reason field with the threshold condition that scheduled it"/>

For **failed** runs, the detail page includes a dedicated **Error message** row that shows the full error text.

<Img src="/img/user-guide/table-maintenance/run-detail-failed.png" alt="Cleanup Orphan Files Run detail page for a failed run with an Error message row explaining that orphan cleanup aborted due to threshold exceeded"/>

### Metrics Per Operation

| Operation | Metrics (before/after) |
|---|---|
| Rewrite Data Files | Data File Count, Total File Size |
| Expire Snapshots | Snapshot Count |
| Rewrite Manifest Files | Manifest File Count, Manifest Total Size |
| Cleanup Orphan Files | Total Data File Count, Total Metadata File Count, Total Data File Size, Total Metadata File Size |


## Manually Triggering an Operation

Run any maintenance operation on demand without waiting for the automated cycle. This is useful when testing your configuration or addressing an urgent performance issue.

1. Go to **Governance > Data Catalog** from the side panel.
2. Find and open the table details page:
   - **Data Catalog tab**: Search for the table by name and click it.
   - **Data Explorer tab**: Navigate through Catalog > Database > Table.
3. Go to the **Maintenance** tab.
4. Click the **Trigger** button in the top-right of the history list.
5. In the modal, select the operation type from the dropdown.
<Img src="/img/user-guide/table-maintenance/trigger-dialog.png" alt="Trigger maintenance operation dialog with a Select operation dropdown and Cancel and Trigger buttons"/>
6. Click **Trigger** to confirm.

The operation is queued immediately and shows up in the history list with a `PENDING` status. The history list refreshes automatically after the trigger succeeds.

:::warning Before Triggering
- Both table maintenance and the specific operation must be enabled.
- If a job for the same table and operation is already pending or running, the trigger is rejected. Only one active job per table/operation is allowed at a time.
:::
