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
- **tmpfs:** (RAM-backed filesystem): Mounts a temporary directory in the container's memory. More details provided below.

If selected type is **Host Path:**

- **Host Path:** Provide directory to mount.
  <Img src="/img/user-guide/volumes/host-path-create.png" alt="Host Path create" maxWidth="600px" />

If selected type is **On Demand PVC:**

- **Storage class name:** Name for storage class. Available list of storage classes can be retrieved with `kubectl get storageclass` command.
- **Max size:** Maximum storage capacity requested in a PVC per executor.

  <Img src="/img/user-guide/volumes/on-demand-create.png" alt="On Demand PVC create" maxWidth="600px" />

- **Resource tags** Tags are custom name/value pairs that you can assign to IOMETE resources. These tags enable you to categorize and organize your resources effectively.

### Using volumes

You can utilize node types in [Lakehouses](./virtual-lakehouses.md), [Spark Connect Clusters](./spark-connect.md) and [Spark Jobs](../developer-guide/spark-job/getting-started.md).
Let's navigate to the [Lakehouse create](./virtual-lakehouses.md#create-a-new-lakehouse) page. Here, you'l find options for `Volume` which include volume selections.

<Img src="/img/user-guide/volumes/select-volume.png" alt="Lakehouse Volume select" maxWidth="600px"/>

### Delete volume

To delete a volume, locate it in the volumes list, click the "Edit" button, and then click the <button className="button button--danger button--outline button-iom"><Trash size={16} /> Delete</button> button below the inputs. Afterward, you'll receive a confirmation message; click "Yes, delete" to confirm the deletion.

<Img src="/img/user-guide/volumes/volume-delete.png" alt="Node type delete" maxWidth="600px"/>


## tmpfs

`tmpfs` storage type could be used for certain high-performance, ephemeral data storage needs. `tmpfs` is a RAM-backed filesystem that provides very fast read and write operations, making it ideal for specific use cases where speed is critical. 

### Kubernetes `emptyDir` Volumes with `tmpfs`

In Kubernetes, `emptyDir` volumes are a type of ephemeral storage that is created when a Pod is assigned to a node. This volume is initially empty and can be accessed by all containers within the same Pod. The data stored in an `emptyDir` volume is deleted when the Pod is removed from the node, making it a suitable option for temporary storage needs.

### Using `tmpfs` with `emptyDir`

By default, `emptyDir` volumes use the node's backing storage, such as disk, SSD, or network storage. However, to achieve higher performance, particularly in environments where disk-based storage might be a bottleneck (e.g., diskless nodes or remote network storage), user can configure the `emptyDir` to use `tmpfs`.

To enable `tmpfs`, the `emptyDir.medium` field is set to "Memory" in the Kubernetes Pod specification. This configuration mounts the `emptyDir` volume as a RAM-backed filesystem (`tmpfs`). While this provides significant performance benefits due to the speed of RAM, it is important to note that data stored in `tmpfs` will consume memory from the container's memory allocation. This means that the size of files stored in this volume counts against the container's memory limit.

### Spark Integration with `tmpfs`

In our Spark workloads, `tmpfs` is used for local storage to avoid performance degradation caused by heavy I/O operations on remote storage. By default, Spark utilizes Kubernetes' `emptyDir` volumes for local storage, which uses the node's backing storage.

### Enabling `tmpfs` in Spark

To configure Spark to use `tmpfs` for local storage, we set the `spark.kubernetes.local.dirs.tmpfs=true` property in the Spark configuration. This ensures that the `emptyDir` volumes are RAM-backed, significantly speeding up operations that rely heavily on local storage.

### Memory Management Considerations

Since `tmpfs` uses the container's memory, enabling it for Spark's local storage will increase the memory usage of your Spark pods. To accommodate this, you may need to adjust the memory overhead allocated to Spark's driver and executor pods by configuring `spark.{driver,executor}.memoryOverheadFactor`. This ensures that your Spark workloads have enough memory to handle both their regular tasks and the additional overhead introduced by using `tmpfs`.

### Use Cases

- **Scratch Space for Computations:** `tmpfs` provides an ideal location for temporary storage during complex computations, such as disk-based merge sorts, where speed is crucial.
  
- **Checkpointing:** It is beneficial for storing intermediate data that needs to be quickly accessed and processed before being discarded.

- **Content Staging:** In scenarios where one container fetches data and another serves it, `tmpfs` can be used to stage files rapidly before they are served.

### Resources:
- Kubernetes (https://kubernetes.io/docs/concepts/storage/volumes/#emptydir)
- Spark (https://spark.apache.org/docs/latest/running-on-kubernetes.html#using-ram-for-local-storage)