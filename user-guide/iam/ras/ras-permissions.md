---
slug: /ras/permissions
title: RAS Permissions Reference
description: Detailed reference for every Resource Authorization System (RAS) permission, what each one allows, and which resource types accept it.
sidebar_label: RAS Permissions
last_update:
  date: 05/06/2026
  author: Ruturaj Bhokre
---

## Overview

The Resource Authorization System (RAS) controls who can do what to your platform resources. Access is granted through a [Resource Bundle](./ras.md), which groups related resources (compute clusters, Spark jobs, workspaces, schedules, and so on) along with the people allowed to use them.

To grant access, the bundle owner adds a user or group as a member of the bundle and selects which actions that member can perform on each resource type the bundle contains. This page is the per-permission reference: what each permission grants, and what it doesn't.

For bundle creation, adding resources, and the **Members & Permissions** UI flow, see [Resource Bundles](./ras.md).

## Resource Permissions

Each resource type accepts a specific set of permissions. The table below shows the full map. If you try to grant a permission outside this list for a given resource type, the platform rejects it.

| Resource Type | Available Permissions |
|---|---|
| Compute | View, Update, Delete, Execute, Consume |
| Spark Job | View, Update, Delete, Suspend, Run |
| Workspace | View, Put, Move, Delete, Edit Files |
| Jupyter Container | View, Update, Delete, Run |
| Schedule | View, Update, Delete, Suspend, Run |
| Event Stream | View, Update, Delete, Execute, Consume |
| Storage Configs | Consume |
| Vault Configuration | View, Update, Use |
| Namespace | Use |

:::info
The same permission name means different things on different resource types. **View** on a compute lets you read cluster status and logs. **View** on a Spark job lets you read job runs and metrics. **View** on a workspace lets you open it. There's no global **View**; each one is scoped to its own resource type.
:::

The sections below describe each resource type in detail.

### Compute

A compute is a Spark cluster (lakehouse). It's the resource type you'll grant on most often.

| Permission | What it allows |
|---|---|
| **View** | Read-only access. The user can see the cluster in the list, open its detail page, read driver and instance logs (including downloads), browse activity history, and read Kubernetes events. |
| **Update** | Edit the cluster's configuration: size, autoscaling, Spark config, environment variables, node type, and other settings. |
| **Delete** | Permanently remove the cluster. |
| **Execute** | Start and stop the cluster. Someone with only **View** can see the cluster but can't bring it up or down. |
| **Consume** | Use this compute as a target. For example, a scheduled job pinned to this cluster can run on it, or SQL queries can route to it. Required for schedules that target this compute. Doesn't allow start, stop, or config changes. |

**What View doesn't allow:** starting or stopping (needs **Execute**), editing config (needs **Update**), or deleting (needs **Delete**).

**What Execute doesn't allow:** editing the cluster. **Update** and **Execute** are independent. Someone with only **Execute** can start and stop the cluster but can't change its configuration.

### Spark Job

A Spark Job is a Spark application (batch or streaming) you've registered with the platform. Authoring and execution are separate permissions, so one team can trigger runs without being able to edit the job definition.

| Permission | What it allows                                                                                                                    |
|---|-----------------------------------------------------------------------------------------------------------------------------------|
| **View** | Read the job definition and its metadata, list runs, read run logs and metrics, and read run details.                             |
| **Update** | Edit the job definition: image, arguments, schedule, configuration, etc.                                                          |
| **Delete** | Delete the job.                                                                                                                   |
| **Run** | Trigger a job run on demand and retry an existing run. Doesn't allow editing the job definition.                                  |
| **Suspend** | Pause and resume the job's schedule. While suspended, scheduled runs stop firing, but manual triggers via **Run** are unaffected. |

### Workspace

A SQL editor workspace holds your worksheets and folders, backed by S3-compatible storage. Because it's a file tree underneath, workspaces use file-system-style permissions: separate rights to read, write, move, and delete.

| Permission | What it allows |
|---|---|
| **View** | Open the workspace, read its file tree, and open and read existing worksheets and folders. |
| **Put** | Create new worksheets and folders inside the workspace, and save changes to existing worksheets. This is the default permission required for write access to your own workspace area. |
| **Move** | Move and rename worksheets and folders, including across workspaces. Both the source and destination paths are checked. |
| **Delete** | Delete worksheets and folders within the workspace. |
| **Edit Files** | Edit worksheets that have been shared with you. Distinct from **Put**, which covers create and save in your own workspace area. |

:::info
Every domain has two built-in workspaces, **My Workspace** and **Shared**, that aren't configured through bundles. They follow implicit access rules and don't appear in the bundle permission UI.
:::

### Jupyter Container

A Jupyter Container is a managed Jupyter notebook environment. **Run** is required to launch it; **View** alone just tells you the container exists.

| Permission | What it allows |
|---|---|
| **View** | Read the container's metadata, status, logs, instances, and events. |
| **Update** | Edit the container's configuration: image, resources, environment variables. |
| **Delete** | Delete the Jupyter container. |
| **Run** | Start the container and access its running session, including opening the notebook UI and retrieving the running URL. Without **Run**, the user can see that the container exists but can't launch it. |

### Schedule

A schedule is a cron or interval definition that triggers a target, typically a Spark job or a compute action. The permissions mirror Spark Job: separate authoring (**Update**), execution (**Run**), and pausing (**Suspend**).

| Permission | What it allows |
|---|---|
| **View** | Read the schedule definition and its run history. |
| **Update** | Edit the schedule: cron expression, target, parameters. |
| **Delete** | Remove the schedule. |
| **Run** | Trigger an ad-hoc run of the schedule. |
| **Suspend** | Pause and resume the schedule. While suspended, the scheduler skips firing this schedule. |

:::warning
**Cross-resource dependency.** A schedule that targets a compute also requires **Consume** on that compute (to pin the schedule to it), plus **Execute** when the schedule auto-starts the compute. **Run** on the schedule alone isn't always enough; the user also needs the right permissions on the downstream compute for the run to actually fire.
:::

### Event Stream

An event stream is a streaming pipeline you've registered with the platform, such as a Kafka-driven processor. Its permissions match Compute: separate controls for editing, starting and stopping, and downstream consumption.

| Permission | What it allows |
|---|---|
| **View** | Read stream definition, status, run history, logs, and metrics. |
| **Update** | Edit stream configuration: sources, sinks, processing logic, scaling. Also required when starting after an edit. |
| **Delete** | Delete the event stream. |
| **Execute** | Start and stop the stream's runtime. |
| **Consume** | Allow downstream resources to use this stream as a source. Mirrors **Compute.Consume**. |

### Storage Configs

A storage config is a configuration entry that points the platform at an external object store (S3, GCS, Azure, or S3-compatible).

| Permission | What it allows                                                                                                                                                                                                |
|---|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Consume** | Use this storage config as a target when creating or editing other resources, such as when creating a workspace using the storage config. Without **Consume**, the storage config is hidden and unselectable. |

### Vault Configuration

A vault configuration entry points the platform at an external secrets vault (HashiCorp Vault or similar). It's separate from per-secret access; the secret values themselves are managed at the domain level.

| Permission | What it allows |
|---|---|
| **View** | Read the vault config's metadata: name, type, and endpoint reference. Doesn't expose any secret material. |
| **Update** | Edit the vault configuration. |
| **Use** | Reference this vault config when wiring secrets into compute clusters or jobs. Without **Use**, the user can't pull secrets from this vault into a new resource, and the vault config is filtered out of selection lists. |

### Namespace

A namespace is a Kubernetes namespace mapping registered with the data plane and used as a deployment target for compute clusters and Spark jobs. There's nothing to read or edit on it directly; you only need permission to deploy into it.

| Permission | What it allows |
|---|---|
| **Use** | Deploy resources into this namespace by selecting it as the deployment namespace when creating a compute or Spark job. |

Namespace supports only this one permission.

## How Permissions Are Grouped

Permissions apply **at the bundle level, per resource type**, not per individual resource.

- A bundle holds many resources across many resource types.
- Each grant ties a user or group to a resource type and a set of permissions, scoped to one bundle.
- Granting **Compute.View** to user `alice` on bundle `X` gives alice **View** on **every** compute in bundle `X`. You can't grant **View** on one specific compute but not another within the same bundle. The bundle is the unit of grouping.
- For finer control, split your resources across more bundles. A team that needs different access on different clusters should put those clusters in different bundles.

## Related Documentation

- [Resource Bundles](./ras.md): bundle creation, adding resources, member UI flows, and archival.
- [Roles](../roles.md): the RBAC role system that complements RAS with platform-level permissions.
- [Admin Roles](../admin-roles.md): admin role definitions that bypass bundle ownership checks.
- [Groups](../groups.md): group hierarchy matters here. Subgroups of a bundle owner group inherit ownership, and permissions granted to a group are inherited by all descendant members.
