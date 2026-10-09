---
title: Personal Access Tokens
description: An Access Token is pivotal for secure authentication. This guide elucidates the process of generating an Access Token in IOMETE.
sidebar_label: Personal Tokens
last_update:
  date: 10/09/2026
  author: Maksym Kryvchun
---

import Img from '@site/src/components/Img';

You can create an access token to use in place of a password with the **IOMETE API**.

---

Access tokens are an alternative to using passwords for authentication to IOMETE when using IOMETE API. In this article, we will explain to you how to create and use Access Tokens for IOMETE API.

### Create new access token

To manage access tokens navigate to **Settings** -> **Access Tokens** tab. To create new access token click **`Generate new token`** button.


<Img src="/img/user-guide/pat/access-tokens.png"
  alt="Access tokens"/>


In the form includes following fields:

- **Token name**: A descriptive name for the token to identify its purpose.
- **Max RPS**: (Optional) Maximum requests per second allowed for this token.
- **Expiration**: (Optional) Set an expiration date for the token to enhance security.

<Img src="/img/user-guide/pat/access-token-create-rps.png" alt="Access token create with" maxWidth="500px"/>

Once you filled inputs click to `Generate`. That is it! You have successfully created an access token. Copy the token value and use it for authentication in your API requests.

:::warning Copy your token now
The full token value is shown only once, right after you create it. After that, the token list shows only a shortened version, such as `iomt_ABC…XYZ`, and there is no way to see the full value again. Store it somewhere safe, such as a password manager or secrets store.

If you lose a token, you cannot recover it. Delete it and generate a new one.
:::

<Img src="/img/user-guide/pat/access-tokens-rps.png" alt="Access token rps"/>

### Token Format

New access tokens start with `iomt_`. The prefix makes IOMETE tokens easy to recognize, and lets secret scanners flag one that is accidentally committed to a repository or pasted into a log.

The last characters of each token are a check value. IOMETE rejects a mistyped or incomplete token straight away as invalid.

Tokens created before this format was introduced have no prefix. They keep working as before.

### Renaming a Token

To rename a token, open its actions menu in the token list and choose **Rename**. Only the name changes, so anything using the token keeps working. You can rename active, suspended and expired tokens. The new name must be unique among your tokens.

:::success How to use Access Token
**IOMETE API** can be accessed through code or CLI tools using the Access Token. You should send the API token in the HTTP header `X-API-Token`. Below we provided simple example written in Python.

You will see your **IOMETE region host** instead of _\{your_iomete_account_host}_

```python
 import requests

  r = requests.get("https://{your_iomete_account_host}/api/v1/....", headers = {
	  "X-API-Token": "iomt_**************************"
  })
```

:::

---

### Suspending and Reactivating Tokens

:::info New in 3.16.0
:::

Access tokens can be **suspended** to immediately block all requests using that token, without deleting it. This is useful for:
- Temporarily disabling a misbehaving client
- Revoking access during an investigation
- Rotating access without recreating tokens

<Img src="/img/user-guide/pat/access-token-suspend.png" alt="Access token suspend"/>

A suspended token can be **reactivated** at any time to restore access. No service restart or redeployment is required.

<Img src="/img/user-guide/pat/access-token-activate.png" alt="Access token activate"/>

### Rate Limiting (maxRPS)

:::info New in 3.16.0
:::

Each access token can have a **maximum requests per second (maxRPS)** configured. When set, the token is rate-limited at the [Iceberg REST Catalog](/user-guide/spark-catalogs/internal#rate-limiting) level.

This is useful for controlling external client throughput and preventing any single client from overwhelming the catalog.

<Img src="/img/user-guide/pat/access-token-create-rps.png" alt="Access token create with" maxWidth="500px"/>
<Img src="/img/user-guide/pat/access-tokens-rps.png" alt="Access token rps"/>


:::note
Rate limiting requires the `features.ratelimiter.enabled` Helm flag to be set to `true`. See the [Iceberg REST Catalog — Rate Limiting](/user-guide/spark-catalogs/internal#rate-limiting) documentation for details.
:::

### Expiry Notifications

IOMETE can email you before your tokens expire. See [Access Token Expiry Notifications](./expiry-notifications) for setup and configuration.
