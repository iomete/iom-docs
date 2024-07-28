---
title: Volumes
description: IOMETE offers a feature for customization of Kubernetes Volume types attached to Spark workloads.
last_update:
  date: 05/01/2024
  author: Nurlan Mammadov
---

import { Plus, Trash } from "@phosphor-icons/react";
import Img from '@site/src/components/Img';

IOMETE offers a feature for customization of Kubernetes Volume types attached to Spark workloads.

---

### Volume list

To see the Volume list, go to the `Settings` menu and click on the `Volumes` tab. You can edit an existing volume or create a new one.

<!-- Click on the <button className="button button--primary button-iom">Configure</button> button to get started. -->

<Img src="/img/user-guide/volumes/volumes.png" alt="Volumes" />

### Create volume

To create new volume, click the <button className="button button--primary button-iom"><Plus size={16}/>Create</button> button.

After that, you'll see the following options for configuration.

There are 2 types:

- **Host Path:** Mounts a directory directly from the host (node) machine's filesystem into a pod.
- **On Demand PVC:** You can mount a dynamically-created persistent volume claim per executor by using this OnDemand option.

If selected type is **Host Path:**

- **Host Path:** Provide directory to mount.
  <Img src="/img/user-guide/volumes/host-path-create.png" alt="Host Path create" maxWidth="600px" />

If selected type is **On Demand PVC:**

- **Storage class name:** Name for storage class. Available list of storage classes can be retrieved with `kubectl get storageclass` command.
- **Max size:** Maximum storage capacity requested in a PVC per executor.

  <Img src="/img/user-guide/volumes/on-demand-create.png" alt="On Demand PVC create" maxWidth="600px" />

- **Resource tags** Tags are custom name/value pairs that you can assign to IOMETE resources. These tags enable you to categorize and organize your resources effectively.

### Using volumes

You can utilize node types in [Lakehouses](./virtual-lakehouses.md), [Spark Connect Clusters](./spark-connect.mdx) and [Spark Jobs](../developer-guide/spark-job/getting-started.md).
Let's navigate to the [Lakehouse create](./virtual-lakehouses.md#create-a-new-lakehouse) page. Here, you'l find options for `Volume` which include volume selections.

<Img src="/img/user-guide/volumes/select-volume.png" alt="Lakehouse Volume select" maxWidth="600px"/>

### Delete volume

To delete a volume, locate it in the volumes list, click the "Edit" button, and then click the <button className="button button--danger button--outline button-iom"><Trash size={16} /> Delete</button> button below the inputs. Afterward, you'll receive a confirmation message; click "Yes, delete" to confirm the deletion.

<Img src="/img/user-guide/volumes/volume-delete.png" alt="Node type delete" maxWidth="600px"/>
