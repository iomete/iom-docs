---
title: Webhook Notifications
description: Send Spark job alerts to Slack, Microsoft Teams or your own HTTPS endpoint, verify signed requests and check webhook delivery status.
sidebar_label: Webhooks
last_update:
  date: 10/22/2026
  author: Maksym Kryvchun
---

import Img from '@site/src/components/Img';

Webhooks send job alerts to a Slack channel, a Microsoft Teams channel, or any HTTPS endpoint you run. Setup has two steps: add a webhook to the domain, then subscribe jobs to it.

| Type | Sends | Use it for |
| --- | --- | --- |
| **Slack** | A chat message to one channel | Team alerts in Slack |
| **Teams** | A card to one channel | Team alerts in Microsoft Teams |
| **Generic** | Signed JSON to any HTTPS URL | Your own services, on-call tools, automation |

:::info Who can do what
Domain owners and domain managers add and change webhooks. Every domain member can see them and subscribe jobs to them.
:::

## Getting a Webhook URL

Get the URL from your chat tool first. You paste it into IOMETE in the next section.

**Slack**

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and click **Create New App** → **From scratch**.
2. Open **Incoming Webhooks** and switch it on.
3. Click **Add New Webhook**, pick the channel, and click **Allow**.
4. Copy the URL. It starts with `https://hooks.slack.com/services/`.

**Microsoft Teams**

1. In the Teams channel, open the **⋯** menu and choose **Workflows**.
2. Pick the **Send webhook alerts to a channel** template, then finish the wizard.
3. Copy the URL it shows. It ends in `logic.azure.com` or `powerplatform.com`.

**Generic**

Any `https://` URL that accepts a `POST` with a JSON body.

## Adding a Webhook

<Img src="/img/guides/webhooks/webhooks-list.png" alt="Webhooks page in domain settings listing Slack, Teams and Generic webhooks with their status and last delivery" />

1. Go to **Settings** → **Webhooks** and click **New webhook**.
2. Pick the **Type**, enter a **Name**, and paste the **Webhook URL**.
3. Click **Send test message**. A green **Test message delivered** box means the URL works.
4. Click **Create**.

<Img src="/img/guides/webhooks/webhooks-create-slack.png" alt="Create webhook drawer with Slack selected, a name and URL filled in, and a Test message delivered confirmation" maxWidth="560px" />

For a **Generic** webhook, IOMETE shows a signing secret once, right after you click **Create**. Copy it to your receiver now. You need it to [verify requests](#verifying-generic-webhook-requests).

<Img src="/img/guides/webhooks/webhooks-signing-secret.png" alt="Webhook created panel showing the signing secret with a Copy button and a warning that it is shown only once" maxWidth="560px" />

:::note
IOMETE stores the URL encrypted and never shows it in full again. To point a webhook somewhere else, open it, click **Configure**, and paste a new URL.
:::

## Subscribing a Job

1. Open the job and go to the **Notifications** tab.
2. Click **Subscribe** and choose the **Webhook** channel.
3. Pick a webhook and the events to send, then click **Subscribe**.

<Img src="/img/guides/webhooks/webhooks-subscribe-job.png" alt="Subscribe to job notifications dialog with the Webhook channel, the data-alerts webhook and two event types selected" maxWidth="640px" />

Only enabled webhooks show up in the list. **Silence** on the Notifications tab pauses webhook alerts too, the same as email. See [Spark Job Notifications](./spark-jobs/notifications.md) for silencing and editing subscriptions.

## Verifying Generic Webhook Requests

Each Generic request has an `X-Iomete-Signature` header:

```
X-Iomete-Signature: t=1792656000,v1=5f2b...e9a1
```

`t` is the send time in Unix seconds. `v1` is an HMAC-SHA256 of `<t>.<raw request body>`, keyed with the signing secret, in hex. To check a request:

1. Rebuild the HMAC from the raw body, before any JSON parsing.
2. Accept the request if it matches any `v1` value.
3. Reject it if `t` is more than 5 minutes old, so old requests cannot be replayed.

```python
import hashlib
import hmac
import time


def is_from_iomete(secret: str, header: str, body: bytes) -> bool:
    pairs = [part.split("=", 1) for part in header.split(",")]
    timestamp = next(value for key, value in pairs if key == "t")
    signatures = [value for key, value in pairs if key == "v1"]

    if abs(time.time() - int(timestamp)) > 300:
        return False

    expected = hmac.new(secret.encode(), f"{timestamp}.".encode() + body, hashlib.sha256).hexdigest()
    return any(hmac.compare_digest(expected, signature) for signature in signatures)
```

To replace the secret, open the webhook's **⋯** menu and click **Rotate signing secret**. For the next 24 hours each request carries two `v1` signatures, one per secret, so you can update the receiver without dropping alerts.

### Payload

A failed run sends a body like this:

```json
{
  "id": "evt_1b4e28ba-2fa1-31d2-883f-0016d3cca427",
  "apiVersion": "v1",
  "type": "job.run.failed",
  "eventType": "FAILED",
  "resourceType": "SPARK_JOB",
  "resourceId": "b51e2f4c-...",
  "occurredAt": "2026-10-22T08:00:00Z",
  "title": "IOMETE - Spark Job 'daily-sales-etl' Failed",
  "body": "Spark job has failed. Please check the logs for error details.",
  "data": {
    "domain": "analytics",
    "jobId": "b51e2f4c-...",
    "jobName": "daily-sales-etl",
    "runId": "a7c3...",
    "startedAt": "2026-10-22T07:41:12Z",
    "endedAt": "2026-10-22T07:59:58Z",
    "error": "...",
    "runUrl": "https://<your-iomete-host>/..."
  }
}
```

- `type` is one of `job.run.succeeded`, `job.run.failed`, `job.run.aborted`, `job.run.startup_timeout`, `job.run.execution_timeout`, `job.suspended`, `job.resumed`, or `webhook.test` for test messages.
- `id` is the same on every retry of one event. Use it to skip duplicates.
- Answer with any `2xx` status within 10 seconds.

## Checking Delivery

The **Last delivery** column on the Webhooks page shows how the latest alert went. Open a webhook to see the error in full.

<Img src="/img/guides/webhooks/webhooks-detail.png" alt="Webhook detail page showing Last delivery as Failed, will retry with the error Receiver answered HTTP 503" />

| Status | Meaning | What to do |
| --- | --- | --- |
| **Delivered** | The receiver answered `2xx`. | Nothing. |
| **Failed, will retry** | No answer, a timeout, `408`, `429` or `5xx`. IOMETE retries for about a day. | Fix the receiver; the next retry picks it up. |
| **Gave up** | Retries ran out, or the receiver answered another `4xx`. The alert is dropped. | Check the URL and the receiver, then **Send test message**. |

After 20 alerts in a row end in **Gave up**, IOMETE disables the webhook and emails the domain owners. Fix the receiver, then open the webhook's **⋯** menu and click **Enable**.

Account admins can see every domain's webhooks, with a **Failures in a row** count, under **Admin** → **Webhooks**.
