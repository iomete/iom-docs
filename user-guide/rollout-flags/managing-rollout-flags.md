---
title: Managing Rollout Flags
description: How to view rollout flags and change their global default from the admin panel.
sidebar_label: Managing Flags
last_update:
  date: 09/22/2026
  author: Sourabh Jajoria
---

import Img from "@site/src/components/Img";

From release `4.0.0` forward, you manage rollout flags directly in the admin panel, under **Administration → Rollout Flags**. Changes take effect at runtime — within about a minute, without redeploying or restarting any service.

## What a Rollout Flag Is

A rollout flag is a runtime switch for one piece of platform behavior. When a release changes how an existing feature works — the SQL Editor engine, for example — the new behavior ships behind a flag, so you can turn it on when you're ready and switch back without a redeploy if it causes problems.

Flags ship with the platform itself, so what you see depends on your version, and the list grows over time: new releases add flags for new behavior, and once a behavior has proven stable, its flag is removed and the behavior becomes permanent. [Available flags](./overview.md#available-flags) lists the current flags, each with its own documentation page.

Every admin panel user can view the flags. Changing one requires the [Administration Manager admin role](../iam/admin-roles.md); without it, the controls are disabled with an access tooltip.

## Viewing Flags

The list shows the rollout flags in your platform version, each with its flag key, current status, and a short description.

<Img src="/img/user-guide/rollout-flags/rollout-flags-list.png" alt="Rollout Flags list in the admin panel" />

The status reflects the flag's global default:

| Status       | Meaning                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| **Enabled**  | The flag is on by default everywhere.                                                                          |
| **Disabled** | The flag is off by default everywhere.                                                                         |
| **Not set**  | Nothing is configured; the flag falls back to its Helm chart value, or off where the chart doesn't define one. |

## Reviewing a Flag Before Toggling

Click a flag to open its details. Each flag documents what it controls, what it requires, which surfaces it touches, and what happens if you roll it back — plus links to its documentation. The **Global default** card also shows who last changed the flag and when. A flag nobody has touched shows the value inherited from the Helm chart, recorded as _Default from helm (values.yaml)_ by `system`.

<Img src="/img/user-guide/rollout-flags/rollout-flag-details.png" alt="Rollout flag details page" />

## Changing the Global Default

Toggle the **Global default** switch. Before anything changes, a confirmation dialog repeats the flag's affected surfaces and rollback considerations, so you see the impact before you commit:

<Img src="/img/user-guide/rollout-flags/rollout-flag-confirm.png" alt="Confirmation dialog when disabling a rollout flag" maxWidth="480px" centered />

Confirming applies the change at runtime. Services pick it up automatically within about a minute — no restart, no redeploy. Rollback considerations differ per flag — some are safe to flip back freely, others are breaking — so read the dialog (or the flag's page under [Available flags](./overview.md#available-flags)) before disabling anything.

## Scope

Flags in the current release support **global changes only** — a toggle applies everywhere at once, and each flag's documentation page records this as _Global only — no per-domain override_. Per-domain overrides, which will let you enable a feature for specific domains before turning it on everywhere, are planned for a future release.
