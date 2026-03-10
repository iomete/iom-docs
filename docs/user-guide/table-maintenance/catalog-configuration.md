---
title: Catalog-Level Configuration
description: Configure compute resources, service accounts, and maintenance operations at the catalog level.
sidebar_label: Catalog Configuration
last_update:
  date: 03/09/2026
  author: Shashank Chaudhary
---

import Img from '@site/src/components/Img';

Catalog-level maintenance sets the default behavior for all tables in a catalog. Resources must be configured before you can enable any operations.

## Step 1: Opening the Catalog Maintenance Tab

1. Go to the Spark Catalogs page:
   - **Platform Admins**: Admin Portal > Spark Catalogs
   - **Domain Admins**: Domain > Settings > Spark Catalogs
2. Open a qualifying catalog (see [Prerequisites](./overview#prerequisites)).
3. Click the **Maintenance** tab.

<Img src="/img/user-guide/table-maintenance/catalog-maintenance-tab-unconfigured.png" alt="Catalog Maintenance tab in unconfigured state with empty Resources and Operations sections"/>

:::info Owner domain required
Maintenance controls are disabled until an owner domain is assigned. See [Catalog Owner Domain](#catalog-owner-domain) to assign one.
<Img src="/img/user-guide/table-maintenance/missing-owner-error-maintenance-tab.png" alt="Catalog Maintenance tab showing the owner domain missing alert with the Assign owner link"/>
:::

## Step 2: Configuring Resources

The maintenance service requires a compute cluster and a service account to run operations.

1. In the **Resources** section, select a **Compute** cluster from the dropdown. The list shows clusters that belong to the catalog's owner domain.
2. Select a **Service Account** from the dropdown. The list shows all service accounts in the domain.
3. Click **Save** to apply the resource configuration.

<Img src="/img/user-guide/table-maintenance/configure-resources.png" alt="Catalog Maintenance Resources section with Compute cluster and Service Account dropdowns"/>

Once resources are saved, the **Maintenance Operations** section becomes active.

:::warning Resource Requirements
- The compute cluster must be active when a maintenance job runs. If it's stopped or disabled, the operation fails.
- The service account must have `CONSUME` permission on the chosen compute cluster. Otherwise, the save is rejected with a permission error. See [Granting Access to Users and Groups](/user-guide/ras/resource-bundles#granting-access-to-users-and-groups) to assign the required permission.
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

1. Toggle **Enable maintenance** to **ON**. This is the master switch for the entire catalog.
2. For each of the four operations, set the toggle to **Enabled** or **Disabled**:
   - **Expire Snapshots**: removes old snapshots to free storage and improve metadata performance.
   - **Rewrite Data Files**: compacts small files and optimizes data layout for better query performance.
   - **Rewrite Manifest Files**: optimizes manifest files for faster query planning.
   - **Cleanup Orphan Files**: removes files no longer referenced by table metadata.
3. To configure operation-specific thresholds, expand **Advanced Settings** on any enabled operation card and add the properties you want to override. See [Advanced Configuration](./advanced-configuration) for all available options.
4. Click **Save Operations** to save. Click **Reset** to discard unsaved changes.

<Img src="/img/user-guide/table-maintenance/configure-catalog-config.png" alt="Catalog Maintenance Operations section showing four operation toggles with Advanced Settings"/>


## Catalog Owner Domain

Every catalog that uses maintenance must have an **owner domain** assigned. The owner domain determines which compute clusters and service accounts are available for maintenance jobs. Resources are always scoped to a domain, so the catalog must belong to one before any maintenance configuration is possible.

To assign an owner domain:

1. Open the catalog in **Admin Portal > Spark Catalogs**.
2. Select the catalog.
3. Go to the **Permissions** tab.
4. Click the `⋮` (three-dot menu) next to the domain and select **Set as catalog owner**.

<Img src="/img/user-guide/table-maintenance/assign-catalog-owner.png" alt="Domain list with vertical three-dot menu open showing the Set as catalog owner option"/>
