---
title: Table-Level Configuration
description: Override catalog maintenance defaults for individual tables — enable, disable, or customize operations per table.
sidebar_label: Table Configuration
last_update:
  date: 03/09/2026
  author: Shashank Chaudhary
---

import Img from '@site/src/components/Img';

Table-level settings override catalog defaults for a specific table. This is useful when a table has different compaction requirements — for example, a high-volume streaming table that needs more aggressive compaction than the catalog default.

1. Go to **Governance > Data Catalog** from the side panel.
2. Find and open the table details page:
   - **Data Catalog tab**: Search for the table by name and click it.
   - **Data Explorer tab**: Navigate through Catalog > Database > Table.
3. Click the **Maintenance** tab. The **Configuration** sub-tab opens by default.

<Img src="/img/user-guide/table-maintenance/table-maintenance-tab-unconfigured.png" alt="Table Maintenance Configuration tab showing the Enable maintenance toggle and four operation cards in default state"/>

4. Use the **Enable maintenance** toggle to enable or disable maintenance for this table.
5. For each operation, choose one of three states:
   - **Inherit**: uses the catalog-level setting. The card shows the inherited state, for example _"Enabled (Inherited from Catalog)"_.
   - **Enabled**: explicitly enables this operation for this table, regardless of the catalog setting.
   - **Disabled**: explicitly disables this operation for this table.
6. To configure operation-specific thresholds, expand **Advanced Settings** on any enabled operation card and add the properties you want to override. See [Advanced Configuration](./advanced-configuration) for all available options.
7. Click **Save Changes** to save. Click **Reset** to discard unsaved changes.

:::info Table Maintenance Defaults
- Tables are disabled for maintenance by default. You must explicitly enable each one (V1 rollout safeguard).
- Table maintenance can't be enabled while catalog-level maintenance is disabled.
:::
