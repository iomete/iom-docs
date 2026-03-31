---
title: Searching for Data Assets
description: Use full-text and semantic search to find tables by name, schema, column, or tag in the IOMETE Data Catalog.
sidebar_label: Search
last_update:
  date: 03/26/2026
  author: Abhishek Pathania
---

import Img from '@site/src/components/Img';

When you're looking for a specific table across hundreds of assets, the **Data Catalog** tab is the fastest way to find it. It searches table names, catalogs, schemas, columns, and tags using keyword and semantic matching.

<Img src="/img/data-catalog/search-overview.png" alt="Data Catalog search tab with search box, filter dropdowns, and result cards" />

## Running a Search

Finding what you need usually takes a few keystrokes and an optional filter or two.

1. Open the **Data Catalog** tab (the default view).
2. Type a query in the **Search data assets** field. Results update as you type.
3. Narrow results with the filter dropdowns. Each supports multi-select:
   - **Catalogs**: filter by catalog name
   - **Schemas**: filter by schema or database name
   - **Tags**: filter by classification tags
4. Toggle the **Deleted** switch to include deleted tables (hidden by default).
5. Click **Clear** to reset every filter at once.

The page shows a result count and paginates at 25 items per page.

<Img src="/img/data-catalog/result-card.png" alt="Search result card showing table name, catalog, schema, columns, rows, provider, tags, and owners" />

:::tip Semantic Search
Results aren't limited to exact keyword matches. A query like "customer orders" can surface a table named `purchase_history` if its description is semantically close.
:::

## Reading Search Result Cards

Each card gives you a quick snapshot of a table. Click any table name to open its [detail page](./table-details).

- **Table name**: highlighted match text, links to the detail page
- **Catalog / Schema**: where the table lives
- **Columns / Rows**: column count and record count
- **Provider**: table provider (e.g., `iceberg`, `hive`)
- **Tags**: up to 3 classification tags, with a "+N more" badge for extras
- **Owners**: avatar group showing up to 2 owners, with a "+N" overflow indicator

<Img src="/img/data-catalog/result-card.png" alt="Search result card showing table name, catalog, schema, columns, rows, provider, tags, and owners" />

## Empty and Error States

A couple of edge cases are worth knowing about.

If nothing matches your query, the page displays "No data found." If no search index exists yet because the sync job hasn't run, you'll see a prompt to deploy the required Spark job instead.

<Img src="/img/data-catalog/no-results.png" alt="No data found message when search returns no results" />

:::warning Table Not Found
If you follow a detail link to a deleted table, the page displays a "details not found" message. For recently created tables that don't appear in search yet, run the catalog sync job to rebuild the index.
:::
