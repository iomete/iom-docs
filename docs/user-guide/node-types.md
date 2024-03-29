---
title: Node types
description: IOMETE offers a feature for configuring node types, such as CPU and memory.
last_update:
  date: 03/29/2024
  author: Vugar Dadalov
---

import { Plus, Trash } from "@phosphor-icons/react";
import Img from '@site/src/components/Img';

IOMETE offers a feature for configuring node types, such as CPU and memory.

---

### Node type list

To see the Node type list, go to the `Settings` menu and click on the `Node types` tab. You'll find built-in node types there. You can edit an existing node type or create a new one.

<!-- Click on the <button class="button button--primary button-iom">Configure</button> button to get started. -->

<Img src="/img/user-guide/node-types/node-types.png" alt="Node types" />

### Create node type

To create new node type, click the <button className="button button--primary button-iom"><Plus size={16}/>Create</button> button.

After that, you'll see the following options for configuration.

- **Name:**
- **Description** This is what user will see on node type selection.
- **CPU in millicores** For 1 CPU, enter 1000.
- **Memory** Memory size in MiB. For 1 GiB, enter 1024 MiB.
- **Available for** Driver and Executor (At least one option should be checked).
- **Resource tags** Tags are custom name/value pairs that you can assign to IOMETE resources. These tags enable you to categorize and organize your resources effectively.

<Img src="/img/user-guide/node-types/node-type-create.png" alt="Node type create" maxWidth="600px"/>

### Using node types

You can utilize node types in [Lakehouses](./virtual-lakehouses.md), [Spark Connect Clusters](./spark-connect.mdx) and [Spark Jobs](../developer-guide/spark-job/getting-started.md).
Let's navigate to the [Lakehouse create](./virtual-lakehouses.md#create-a-new-lakehouse) page. Here, you'l find options for `Node driver` and `Node executor`, which include node type selections. You can also view the Total CPU and Memory based on the selected executor and executor count.

<Img src="/img/user-guide/node-types/lakehouse-node-type-select.png" alt="Lakehouse Node type select" maxWidth="600px"/>

The node type select dropdown looks like this.
<Img src="/img/user-guide/node-types/lakehouse-node-type-select-options.png" alt="Lakehouse Node type select options" maxWidth="600px"/>

### Delete node type

To delete the node type, click the node type that you want to delete and in opened page simply click the <button class="button button--danger button--outline button-iom"><Trash size={16} /> Delete</button> button below the inputs. Afterward, you'll receive a confirmation message; click "Yes, delete" to confirm the deletion.

<Img src="/img/user-guide/node-types/node-type-delete.png" alt="Node type delete" maxWidth="600px"/>
