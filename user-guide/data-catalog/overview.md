---
title: Data Catalog Overview
description: Search, browse, and tag every table in IOMETE from one place using the Data Catalog.
sidebar_label: Overview
last_update:
  date: 03/26/2026
  author: Abhishek Pathania
---

import Img from '@site/src/components/Img';

Instead of hunting through individual catalogs, the Data Catalog lets you search, browse, and tag every table from one place. A scheduled [Catalog Sync Job](/open-source-spark-jobs/catalog-sync-job) indexes metadata automatically, so the catalog stays up to date on its own.

Interface organized into five tabs:

- **[Data Catalog](./search)**: full-text and semantic search across indexed assets (the default view)
- **[Data Explorer](./data-explorer)**: hierarchical browser (catalog > database > table)
- **[Favorites](./favorites)**: tables you've bookmarked for quick access
- **[Classifications](./classification-tags)**: tag definitions, managed by admins
- **[Classification Requests](./classification-tags#classification-requests-tab)**: approval workflow for adding or removing tags

<Img src="/img/data-catalog/data-catalog-main.png" alt="Data Catalog main page showing the five tabs, search bar, filter dropdowns, and indexed table results" />

:::info Indexed Data Only
Both the Data Catalog and Data Explorer show only indexed data. A recently created table won't appear until the next scheduled [Catalog Sync Job](/open-source-spark-jobs/catalog-sync-job) completes.
:::

## Opening the Data Catalog

Everything lives under a single sidebar entry, so you're never more than one click away.

Select **Data Catalog** in the sidebar to land on the search tab, then switch views using the tab bar at the top. You'll need the **View Data Catalog** domain bundle permission. Without it, the page returns a 403 error. See [Access Permissions](./access-permissions) for the full permission model.
