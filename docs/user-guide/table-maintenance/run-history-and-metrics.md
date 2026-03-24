---
title: Run History & Metrics
description: View maintenance run history with before/after metrics, and manually trigger operations on demand.
sidebar_label: Run History & Metrics
last_update:
  date: 03/09/2026
  author: Shashank Chaudhary
---

import Img from '@site/src/components/Img';

## Viewing Maintenance History

The **History** sub-tab lists every maintenance run for a table, including before/after metrics for completed runs. It's the quickest way to see what ran, why it ran, and what changed.

<Img src="/img/user-guide/table-maintenance/table-history-list.png" alt="Maintenance History tab showing a list of maintenance runs with time range, operation type, and status filters"/>

1. Go to **Governance > Data Catalog** from the side panel.
2. Find and open the table details page:
   - **Data Catalog tab**: Search for the table by name and click it.
   - **Data Explorer tab**: Navigate through Catalog > Database > Table.
3. Go to the **Table Maintenance** tab.
4. Click the **History** sub-tab.
5. Use the filters at the top to narrow results:
    - **Time range**: a date-range picker (maximum range is 30 days).
    - **Triggered by**: filter by the username who triggered the run.
    - **Operation type**: filter by a specific operation.
    - **Status**: filter by status (All, Pending, Running, Completed, etc.).
6. To see metrics for a completed run, click to expand a **Completed** row that has metric data. The expanded row shows a metrics table with **Before** and **After** values.
<Img src="/img/user-guide/table-maintenance/table-history-completed-entry.png" alt="Expanded completed maintenance run row showing before and after metrics table"/>
7. To see the error message for a failed run, hover over the **Failed** status badge.
<Img src="/img/user-guide/table-maintenance/table-history-failed-entry.png" alt="Maintenance History failed run with error message tooltip visible on hover over the Failed status badge"/>
8. The **Reason** column shows why an operation was scheduled: which threshold condition was met (small average file size, high delete-file ratio, excessive snapshot count, etc.) or whether it was a manual trigger.
<Img src="/img/user-guide/table-maintenance/table-history-reason-entry.png" alt="Maintenance History row with the Reason column showing the threshold condition that triggered the run"/>

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
3. Go to the **Table Maintenance > History** sub-tab.
4. Click the **Trigger** button in the table header.
<Img src="/img/user-guide/table-maintenance/table-history-trigger-button.png" alt="Maintenance History tab with the Trigger button highlighted in the table header"/>
5. In the modal, select the operation type from the dropdown.
<Img src="/img/user-guide/table-maintenance/trigger-dialog.png" alt="Trigger maintenance operation dialog with a Select operation dropdown and Cancel and Trigger buttons"/>
6. Click **Trigger** to confirm.

The operation is queued immediately and shows up in the history list with a `PENDING` status. The history list refreshes automatically after the trigger succeeds.

:::warning Before Triggering
- Both table maintenance and the specific operation must be enabled.
- If a job for the same table and operation is already pending or running, the trigger is rejected. Only one active job per table/operation is allowed at a time.
:::
