---
title: Webhook Notifications
description: Send Spark job and compute alerts to Slack, Microsoft Teams, PagerDuty or your own HTTPS endpoint, verify signed requests and check webhook delivery status.
sidebar_label: Webhooks
last_update:
  date: 11/03/2026
  author: Maksym Kryvchun
---

import Img from '@site/src/components/Img';

Webhooks send job and compute alerts to a Slack channel, a Microsoft Teams channel, PagerDuty, or any HTTPS endpoint you run. Setup has two steps: add a webhook to the domain, then subscribe jobs or computes to it.

| Type | Sends | Use it for |
| --- | --- | --- |
| **Slack** | A chat message to one channel | Team alerts in Slack |
| **Teams** | A card to one channel | Team alerts in Microsoft Teams |
| **PagerDuty** | An incident on one PagerDuty service | On-call paging |
| **Generic** | Signed JSON to any HTTPS URL | Your own services, other on-call tools, automation |

:::info Who can do what
Domain owners and domain managers add and change webhooks. Every domain member can see them and subscribe jobs and computes to them.
:::

## Getting a Webhook URL

Get the URL, or for PagerDuty the integration key, first. You paste it into IOMETE in the next section.

**Slack**

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and click **Create New App** → **From scratch**.
2. Open **Incoming Webhooks** and switch it on.
3. Click **Add New Webhook**, pick the channel, and click **Allow**.
4. Copy the URL. It starts with `https://hooks.slack.com/services/`.

**Microsoft Teams**

1. In the Teams channel, open the **⋯** menu and choose **Workflows**.
2. Pick the **Send webhook alerts to a channel** template, then finish the wizard.
3. Copy the URL it shows. Its host ends in `logic.azure.com` or `powerplatform.com`, and its path contains `/workflows/`.

**PagerDuty**

1. In PagerDuty, open the service that should receive the alerts and go to **Integrations**.
2. Click **Add an integration** and choose **Events API V2**.
3. Copy the **Integration Key**. It is 32 characters long.

**Generic**

Any `https://` URL that accepts a `POST` with a JSON body. By default it must resolve to a public address. Private networks, `localhost` and cloud metadata addresses are refused, unless an account admin [allows the host](#allowing-generic-webhook-hosts).

## Adding a Webhook

<Img src="/img/guides/webhooks/webhooks-list.png" alt="Webhooks page in domain settings listing Slack, Teams and Generic webhooks with their status and last delivery" />

1. Go to **Settings** → **Webhooks** and click **New webhook**.
2. Pick the **Type**, enter a **Name**, and paste the **Webhook URL**. For PagerDuty, paste the **Integration key** instead.
3. Click **Send test message**. A green **Test message delivered** box means the URL works.
4. Click **Create**.

<Img src="/img/guides/webhooks/webhooks-create-slack.png" alt="Create webhook drawer with Slack selected, a name and URL filled in, and a Test message delivered confirmation" maxWidth="560px" />

For a **Generic** webhook, IOMETE shows a signing secret once, right after you click **Create**. Copy it to your receiver now. You need it to [verify requests](#verifying-generic-webhook-requests).

<Img src="/img/guides/webhooks/webhooks-signing-secret.png" alt="Webhook created panel showing the signing secret with a Copy button and a warning that it is shown only once" maxWidth="560px" />

:::note
IOMETE stores the URL encrypted and never shows it in full again. The webhook's page shows only the host, plus a short webhook id for Slack and Teams, so you can tell webhooks apart. Slack and Teams alerts show the same id. To point a webhook somewhere else, open it, click **Configure**, and paste a new URL.
:::

### PagerDuty Incidents

<Img src="/img/guides/webhooks/webhooks-create-pagerduty.png" alt="Create webhook drawer with PagerDuty selected, a name, and a 32-character integration key filled in" maxWidth="560px" />

- Each job or compute has one incident. Repeat alerts update it instead of opening new ones.
- Failed runs and timeouts open an `error` incident. Other events open a `warning` incident.
- A job's next successful run resolves its incident, so subscribe the job to **On Success** as well.
- Compute restart incidents do not close on their own. Resolve them in PagerDuty.
- **Send test message** opens an `info` incident and resolves it right away.

### Custom Headers

Generic webhooks can send up to 10 extra headers with every request, for example an API key your receiver checks. Click **Add header** and enter a name and value.

<Img src="/img/guides/webhooks/webhooks-custom-headers.png" alt="Create webhook drawer for a Generic webhook with a Custom headers section holding one X-Team header" maxWidth="560px" />

- Plain values are stored and shown as text on the webhook's page. For API keys and tokens, click the lock button next to the value and pick a [domain secret](./secrets.md) instead.
- Headers IOMETE sets itself, such as `Content-Type`, `User-Agent` and `X-Iomete-Signature`, cannot be overridden.

## Subscribing a Job or Compute

1. Open the job or compute and go to the **Notifications** tab.
2. Click **Subscribe** and choose the **Webhook** channel.
3. Pick a webhook and the events to send, then click **Subscribe**.

<Img src="/img/guides/webhooks/webhooks-subscribe-job.png" alt="Subscribe to job notifications dialog with the Webhook channel, the data-alerts webhook and two event types selected" maxWidth="640px" />

Computes have one event, **Restarted**, sent when IOMETE restarts a compute automatically.

<Img src="/img/guides/webhooks/webhooks-subscribe-compute.png" alt="Subscribe to compute notifications dialog with the Webhook channel, the platform-on-call PagerDuty webhook and the Restarted event selected" maxWidth="640px" />

Only enabled webhooks show up in the list. **Silence** on the Notifications tab pauses webhook alerts too, the same as email. See [Spark Job Notifications](./spark-jobs/notifications.md) for silencing and editing subscriptions.

## Verifying Generic Webhook Requests

Each Generic request has an `X-Iomete-Signature` header:

```
X-Iomete-Signature: t=1792656000,v1=5f2b...e9a1
```

`t` is the send time in Unix seconds. `v1` is an HMAC-SHA256 of `<t>.<raw request body>`, keyed with the signing secret, in hex. To check a request:

1. Reject the request if `t` is more than 5 minutes off your clock, so old requests cannot be replayed.
2. Rebuild the HMAC from the raw body, before any JSON parsing.
3. Accept the request only if it matches one of the `v1` values.

```python
import hashlib
import hmac
import time


def is_from_iomete(secret: str, header: str, body: bytes) -> bool:
    pairs = [part.split("=", 1) for part in header.split(",") if "=" in part]
    timestamps = [value for key, value in pairs if key == "t"]
    signatures = [value for key, value in pairs if key == "v1"]
    if len(timestamps) != 1 or not timestamps[0].isdigit() or not signatures:
        return False

    timestamp = timestamps[0]
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

A compute restart has `"type": "compute.restarted"`, `"resourceType": "COMPUTE"`, and this `data`:

```json
{
  "domain": "analytics",
  "computeId": "3f9d1c2e-...",
  "computeName": "analytics-cluster",
  "namespace": "iomete-analytics",
  "applicationUid": "8e41...",
  "restartCount": 2,
  "detectedAt": "2026-11-03T09:15:00Z",
  "lastSubmissionAttemptTime": "2026-11-03T09:14:31Z",
  "reason": "...",
  "computeUrl": "https://<your-iomete-host>/..."
}
```

- `type` is one of `job.run.succeeded`, `job.run.failed`, `job.run.aborted`, `job.run.startup_timeout`, `job.run.execution_timeout`, `job.suspended`, `job.resumed`, `compute.restarted`, or `webhook.test` for test messages.
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

## Allowing Generic Webhook Hosts

Account admins control where Generic webhooks may send, in **Admin** → **System Config**. Search for `webhooks.generic` to see both settings, or follow the **System Config** link on **Admin** → **Webhooks**.

<Img src="/img/guides/webhooks/webhooks-system-config-hosts.png" alt="System Config filtered to webhooks.generic, showing the allowed-hosts and internal-hosts settings with the internal-hosts description expanded" />

| Setting | What it does |
| --- | --- |
| `webhooks.generic.internal-hosts` | Hosts that may resolve to a private network address, for example a receiver inside your own network. |
| `webhooks.generic.allowed-hosts` | When set, Generic webhooks may only send to these hosts, on the default HTTPS port. Leave it empty to allow any public host. |

Both take a comma-separated list of host names or `*.domain` wildcards, for example `alerts.corp.internal,*.example.com`. `internal-hosts` also takes IPv4 addresses. `localhost`, link-local and cloud metadata addresses stay blocked whatever you list.

IOMETE checks the host when you save a webhook and again before every send, so a host that later points to a private address is still refused. Slack, Teams and PagerDuty webhooks are not affected by these settings.
