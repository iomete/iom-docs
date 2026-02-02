---
title: Query Scheduling
description: Automate query execution based on custom intervals from the SQL Editor.
---

import Img from '@site/src/components/Img';

# Query Scheduling

From release `3.16.0` forward, IOMETE allows you to schedule your queries directly from the SQL Editor. This feature enables you to automate query execution based on custom intervals, manage resources, and monitor run histories effectively.

## Creating a Schedule

You can create a new schedule based on the content of your currently open worksheet.

1.  Open the worksheet containing the query you wish to automate.
2.  Click the **Schedule** icon located in the new UI.
<Img src="/img/user-guide/sql-editor/scheduling/new-worksheet-navbar.png" alt="Worksheet Navbar" centered  />
3.  A configuration modal will appear with four tabs to customize your schedule.
<Img src="/img/user-guide/sql-editor/scheduling/create-schedule.png" alt="Create New Schedule" centered />


### Configuration Tabs

*   **General:** This tab contains the mandatory fields required to create a schedule with minimum effort. You must provide a **Name** and select a **Resource Bundle**. Here, you also define the scheduling information, including the **Time Zone** and **Interval**. You can also enable **Cron Syntax** to define more complex schedule intervals.
*   **Configuration:** Configure the execution environment. The **Compute**, **Catalog**, and **Database** fields are automatically pre-filled based on your worksheet selections.
    *   **Run as user:** This is a required field. You can select either yourself or a Service Account to execute the query.
    *   **Parameters:** If your query contains parameters, they will be listed here for configuration.

<Img src="/img/user-guide/sql-editor/scheduling/create-schedule-config-tab.png" alt="Create New Schedule Configuration Tab" centered />

*   **Resource Tags:** Define resource tags for your schedule to help with organization and cost tracking.
*   **Review:** A final view to verify your settings before creation.

## Managing Schedules

Once created, you can manage your automation via the **Schedules** menu item, located in the Workspace section below the SQL Editor and Query Monitoring.

The Schedules list provides an overview of all your scheduled jobs, displaying:
*   **Schedule Name** and **ID**
*   **Compute resource** used
*   **Run as user**
*   **Schedule Interval**
*   **Status** (Active or Paused)

<Img src="/img/user-guide/sql-editor/scheduling/schedule-list.png" alt="Schedules List View" centered />

## Monitoring Runs and Details

Clicking on a schedule’s name or selecting **View** (in action menu) navigates you to the details page. This page contains three specific tabs:

1.  **Details:** Displays information including ID, status, run as user, infrastructure configuration, and metadata.
<Img src="/img/user-guide/sql-editor/scheduling/schedule-details.png" alt="Schedules Details View" centered />
2.  **Runs:** Automatically opens upon navigation. It lists historical executions, showing the status, start time, end time, and namespace for each run.
<Img src="/img/user-guide/sql-editor/scheduling/schedule-runs.png" alt="Schedules Runs View" centered />
3.  **SQL:** Displays the actual SQL queries currently scheduled.
<Img src="/img/user-guide/sql-editor/scheduling/schedule-sql.png" alt="Schedule SQL View" centered />


### Run Details

To investigate a specific execution, click on the **Run Name** or **ID** in the Runs tab. This opens the **Run Details** page, providing a detailed view of that specific execution instance.

<Img src="/img/user-guide/sql-editor/scheduling/schedule-run-details.png" alt="Schedule Run Details View" centered />

### Viewing Run Tasks
By navigating to the **Tasks** tab within the Run Details page, you can see the individual queries executed within that run.

<Img src="/img/user-guide/sql-editor/scheduling/schedule-run-tasks.png" alt="Schedule Run Tasks View" centered />

:::note
Each query counts as a single task. If your schedule contains two queries, each run will generate two tasks.
:::

### Run Graph
The **Graph** tab provides a visual representation of the query execution flow, showing how individual tasks relate to each other within a run.

<Img src="/img/user-guide/sql-editor/scheduling/schedule-run-graph.png" alt="Schedule Run Graph View" centered />

## Editing a Schedule

To modify an existing schedule:

1.  Navigate to the schedule's details page and click the **Configure** button.
2.  This opens a tab in the SQL Editor displaying your scheduled queries.
3.  You can modify the SQL code directly. In order to save query changes or to update schedule settings (such as Interval, Time Zone, or Infra), click the highlighted **Edit schedule settings** icon.

If you attempt to close the tab without saving, you will be prompted to Discard, Keep Editing, or Save & Close.

<Img src="/img/user-guide/sql-editor/scheduling/schedule-update-discard-card.png" alt="Close tab without saving changes" maxWidth="512px" centered />
