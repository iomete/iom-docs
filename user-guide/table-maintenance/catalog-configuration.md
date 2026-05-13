---
title: Catalog-Level Configuration
description: Configure compute resources, service accounts, and maintenance operations at the catalog level.
sidebar_label: Catalog Configuration
last_update:
  date: 05/13/2026
  author: Shashank Chaudhary
---

import Img from '@site/src/components/Img';

Catalog-level maintenance sets the default behavior for all tables in a catalog. Resources and operations are configured together on a single Maintenance tab.

## Step 1: Opening the Catalog Maintenance Tab

1. Go to the Spark Catalogs page:
   - **Platform Admins**: Admin Portal > Spark Catalogs
   - **Domain Admins**: Domain > Settings > Spark Catalogs
2. Open a qualifying catalog (see [Prerequisites](./overview#prerequisites)).
3. Click the **Maintenance** tab.

<Img src="/img/user-guide/table-maintenance/catalog-maintenance-tab-unconfigured.png" alt="Catalog Maintenance tab in its unconfigured state with the Enable maintenance toggle off, empty Compute and Service Account dropdowns, and operation cards inherited from the platform default"/>

:::info Owner domain required
Maintenance controls are disabled until an owner domain is assigned. The tab shows a banner with an **Assign owner** shortcut.
<Img src="/img/user-guide/table-maintenance/missing-owner-error-maintenance-tab.png" alt="Catalog Maintenance tab showing the owner domain missing banner with the Assign owner link"/>
See [Catalog Owner Domain](#catalog-owner-domain) to assign one.
:::

## Step 2: Enabling Maintenance and Selecting Resources

1. Turn on the **Enable maintenance** toggle at the top of the tab. This is the master switch for the entire catalog. No operation runs while it's off.
2. Select a **Compute** cluster from the dropdown. The list shows clusters that belong to the catalog's owner domain.
3. Select a **Service Account** from the dropdown. The list shows all service accounts in the domain.

<Img src="/img/user-guide/table-maintenance/configure-resources.png" alt="Catalog Maintenance tab with Enable maintenance toggled on, a Compute cluster, and a Service Account selected"/>

:::warning Resource Requirements
- The compute cluster must be active when a maintenance job runs. If it's stopped or disabled, the operation fails.
- The service account must have `CONSUME` permission on the chosen compute cluster. Otherwise, the save is rejected with a permission error. See [Granting Access to Users and Groups](/user-guide/ras/resource-bundles#granting-access-to-users-and-groups) to assign the required permission.
- The service account must have write access on the tables included in maintenance. Without it, maintenance operations on those tables will fail.
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

## Step 3: Configuring Operations

For each of the four operations, choose **Enabled** or **Disabled** from the dropdown on its card:

- **Rewrite Data Files**: compacts small files and optimizes data layout for better query performance.
- **Rewrite Manifest Files**: optimizes manifest files for faster query planning.
- **Expire Snapshots**: removes old snapshots to free storage and improve metadata performance.
- **Cleanup Orphan Files**: removes files no longer referenced by table metadata.

To configure operation-specific thresholds, expand **Advanced Settings** on any enabled operation card and add the properties you want to override. See [Advanced Configuration](./advanced-configuration) for all available options.

<Img src="/img/user-guide/table-maintenance/configure-catalog-config.png" alt="Catalog Maintenance tab showing four operation cards — Rewrite data files, Rewrite manifest files, Expire snapshots, and Cleanup orphan files — each with its own enable dropdown and Advanced Settings panel"/>

Click **Save Changes** to commit all settings on the page (Enable maintenance, resources, and operations). Click **Reset** to discard unsaved changes.


## Catalog Owner Domain

Every catalog that uses maintenance must have an **owner domain** assigned. The owner domain determines which compute clusters and service accounts are available for maintenance jobs. Resources are always scoped to a domain, so the catalog must belong to one before any maintenance configuration is possible.

To assign an owner domain:

1. Open the catalog in **Admin Portal > Spark Catalogs**.
2. Select the catalog.
3. Go to the **Domain permissions** tab.
4. Click the `⋮` (three-dot menu) next to the domain and select **Set as Catalog Owner**.

<Img src="/img/user-guide/table-maintenance/assign-catalog-owner.png" alt="Domain permissions tab with the three-dot menu open on a domain showing the Set as Catalog Owner option"/>
