---
title: Managing Rollout Flags
description: How to view rollout flags and change their global default or per-domain overrides from the admin panel.
sidebar_label: Managing Flags
last_update:
  date: 09/22/2026
  author: Sourabh Jajoria
---

import Img from "@site/src/components/Img";

From release `4.0.0` forward, you manage rollout flags directly in the admin panel, under **Administration → Rollout Flags**. Changes take effect at runtime — within about a minute, without redeploying or restarting any service.

Every admin panel user can view the flags. Changing them — the global default or a domain override — requires the [Administration Manager admin role](../iam/admin-roles.md); without it, the controls are disabled with an access tooltip.

## Viewing Flags

The list shows every rollout flag the platform ships with, its flag key, its current status, and a short description.

<Img src="/img/user-guide/rollout-flags/rollout-flags-list.png" alt="Rollout Flags list in the admin panel" />

The status reflects the flag's global default:

| Status       | Meaning                                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Enabled**  | The flag is on by default everywhere.                                                                             |
| **Disabled** | The flag is off by default everywhere.                                                                            |
| **Not set**  | Nothing is configured; the flag falls back to its Helm chart value, or off where the chart doesn't define one.    |

If a flag has domain overrides that diverge from the global default, the status also shows a hint such as _Disabled in 2 domains_.

## Reviewing a Flag Before Toggling

Click a flag to open its details. Each flag documents what you need to judge a toggle safely — what it controls, what it requires, which surfaces it touches, and what happens if you roll it back — plus links to its documentation. The **Global default** card also shows who last changed the flag and when. A flag nobody has touched shows the value inherited from the Helm chart, recorded as _Default from helm (values.yaml)_ by `system`.

<Img src="/img/user-guide/rollout-flags/rollout-flag-details.png" alt="Rollout flag details page" />

## Changing the Global Default

Toggle the **Global default** switch. Before anything changes, a confirmation dialog repeats the flag's affected surfaces and rollback considerations, so the impact is in front of you at the moment you commit:

<Img src="/img/user-guide/rollout-flags/rollout-flag-confirm.png" alt="Confirmation dialog when disabling a rollout flag" maxWidth="480px" centered />

Confirming applies the change at runtime. Services pick it up automatically within about a minute — no restart, no redeploy. Rollback considerations differ per flag — some are safe to flip back freely, others are breaking — so read the dialog (or the flag's page under [Available flags](./overview.md#available-flags)) before disabling anything.

## Domain Overrides

Flags that support per-domain scope show an **Overrides** section on the details page, where you can roll a feature out gradually:

- **Add Override** — pick one or more domains to give a value different from the global default.
- Toggle or remove an override from its row. Removing one puts the domain back on the global default.
- Each override records notes plus who changed it and when.

A domain override always wins over the global default for that domain. Flags marked **Global only** on their documentation page (currently all shipped flags) don't have this section — they can only be toggled globally.
