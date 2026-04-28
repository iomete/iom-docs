---
title: Notifications
description: Receive email alerts for Spark job events by subscribing to job notifications, with optional silencing for planned maintenance.
sidebar_label: Notifications
last_update:
  date: 04/28/2026
  author: Shashank Chaudhary
---

import Img from '@site/src/components/Img';
import FlexButton from '@site/src/components/FlexButton';
import { Bell, BellSlash } from '@phosphor-icons/react';

## Overview

IOMETE keeps you informed about Spark job events through email notifications. Job notification subscriptions let you register one or more email recipients to receive alerts for specific events on a Spark job or Spark Streaming job, with optional silencing for planned maintenance windows.

## Job Notification Subscriptions

Job notification subscriptions let you register one or more email recipients to receive alerts for specific events on a Spark job or Spark Streaming job. Subscriptions can target any email address, making them suitable for team distribution lists or on-call rotations.

:::info Prerequisites
An SMTP server must be configured before notifications can be sent. See [Email Configuration](../email-settings.md) to set it up.
:::

### Subscribing to a Job

<Img src="/img/guides/spark-job/notifications-tab.png" alt="Notifications tab on a job detail page showing the Email and Event types table with Silence and Subscribe buttons" />

1. Open a job from the left sidebar — **Applications** → **Job Templates** → *job name*, or **Applications** → **Streaming Jobs** → *job name*.
2. Click the **Notifications** tab in the job detail.
3. Click <FlexButton label="Subscribe" primary><Bell size={14} /></FlexButton>.
4. The **Subscribe to job notifications** modal opens.
5. Select one or more **Event Types** using the checkboxes. Use **Select all** to choose every event in one click.
6. Enter a **Recipient** email address. Your own email is pre-filled, but you can replace it with any valid email address.
7. Click <FlexButton label="Subscribe" primary /> to save.

<Img src="/img/guides/spark-job/notifications-subscribe-modal.png" alt="Subscribe to job notifications modal showing event type checkboxes and a recipient email field" />

On success, a **Job subscription created successfully** notification appears and the new subscription shows up in the table.

:::warning
Each `(job, recipient)` pair must be unique. If a subscription already exists for the same recipient on the same job, the request is rejected with *"Notification setting already exists for recipient \{email\}"*.
:::

### Available Event Types

- **On Success**
- **On Failure**
- **On Abort**
- **On Startup Timeout**
- **On Execution Timeout**

### Editing or Deleting a Subscription

<Img src="/img/guides/spark-job/notifications-subscription-actions.png" alt="Notifications tab showing a subscription row with the action menu open, revealing Edit and Delete options" />

1. On the **Notifications** tab, open the action menu on the subscription row.
2. Click **Edit** to reopen the subscription modal with existing values pre-filled, change the events or recipient, and click <FlexButton label="Save" primary />. A success notification confirms **Job subscription updated successfully**.
3. Click **Delete** and confirm in the popup dialog to remove the subscription. A success notification confirms **Job subscription deleted successfully**.

### Silencing Job Notifications

Silencing temporarily suppresses email delivery for every subscription on a job, without removing the subscriptions themselves. Use it during planned maintenance or known incidents to prevent alert noise.

1. On the **Notifications** tab, click <FlexButton label="Silence"><BellSlash size={14} /></FlexButton>.
2. A **Silence notifications** popover opens with a grid of duration choices: 15 min, 30 min, 1 hour, 2 hours, 4 hours, 8 hours, 12 hours, 1 day, 2 days, and 1 week.
3. Click a duration to silence notifications for that period. A **Job subscription silenced successfully** notification confirms the silence is active.

<Img src="/img/guides/spark-job/notifications-silence-popover.png" alt="Silence notifications popover showing a grid of duration options from 15 minutes to 1 week" />

When a silence is active, the <FlexButton label="Silence"><BellSlash size={14} /></FlexButton> button shows a yellow badge with the end date and time plus remaining duration (for example, **4/28/2026, 9:07 PM (0h 14m left)**). To end the silence early, click it again and click **Remove silence** in the popover.

<Img src="/img/guides/spark-job/notifications-silence-active.png" alt="Notifications tab with an active silence, showing the Silence button with a yellow badge displaying the end time and remaining duration" />

:::info
You cannot stack silences. If a silence is already active for the job, you must remove it before starting a new one.
:::