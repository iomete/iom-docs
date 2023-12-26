---
title: Z-ORDER sorting during compaction
description: to force the whole dataset sorting during compaction to be ordered using Z-ORDER, you can use the following steps
slug: z-order-sorting
hide_table_of_contents: true
tags: [Engineering]
authors: aytan
banner_description: To force the whole dataset to be ordered using Z-ORDER
coverImage: img/blog/thumbnails/2.png
---

import MiniCard from "@site/src/components/MiniCard";

Apache Iceberg supports Z-ORDER sorting during compaction (rewrite_data_files), but not during normal inserts or as a create table configuration.

<!-- truncate -->

To force the whole dataset to be ordered using Z-ORDER, you can use the following steps:

1. Set a default WRITE ORDERED BY for the table.

   ```jsx
   ALTER TABLE db.table_name WRITE ORDERED BY (col1, col2);
   ```

2. Perform a rewrite_data_files operation with the `sort` strategy specified and `rewrite-all` option set to `true`.

   ```jsx
   CALL spark_catalog.system.rewrite_data_files(
   	table => 'db.table_name',
   	strategy => 'sort',
   	sort_order => 'zorder(col1, col2)',
   	options => map('rewrite-all', 'true')
   );
   ```

<MiniCard link="https://form.typeform.com/to/ofF9ZQYd" linkName="Try Sandbox">Discovering the data lakehouse platform?</MiniCard>

**Additional notes**

- It is important to note that rewriting the whole dataset can be a very expensive operation, so it is important to only do this when necessary.
- It is also worth noting that there is an [open issue on GitHub](https://github.com/apache/iceberg/issues/8674) to add support for Z-ORDER sorting during normal inserts.
