---
title: Database Explorer
sidebar_label: Database Explorer
description: Learn how to explore your database objects in IOMETE SQL Editor.
last_update:
  date: 01/22/2024
  author: Vugar Dadalov
---

import { DotsThreeVertical } from "@phosphor-icons/react";
import Img from "@site/src/components/Img";

Database explorer panel is used to explore your database objects, which includes **namespaces, tables, views,** and their **columns** (even complex columns), and partitions.

To view database objects, expand a database. Each object in the database explorer has a corresponding options menu <DotsThreeVertical size={16} weight="duotone"/>.
You can also open the menu by right-clicking on the item.

<div className="row">
    <div className="col col--6">
      <Img src="/img/user-guide/sql-editor/db-menu.png" alt="SQL Editor - Database menu" maxWidth="400px"/>
    </div>
    <div className="col col--6">
      <Img src="/img/user-guide/sql-editor/table-menu.png" alt="SQL Editor - Table menu" maxWidth="400px"/>
    </div>
</div>

:::info v3.16.0 API Migration
See the [Database Explorer API Migration](./database-explorer-api-migration.md) to update your API integrations.
:::