---
title: Access Token
description: An Access Token is pivotal for secure authentication. This guide elucidates the process of generating an Access Token in IOMETE.
last_update:
  date: 01/29/2024
  author: Vugar Dadalov
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

Once you filled inputs click to `Generate`. That is it! You have successfully created an access token. You can copy the token value and use it for authentication in your API requests.

<Img src="/img/user-guide/pat/access-tokens-rps.png" alt="Access token rps"/>

:::success How to use Access Token
**IOMETE API** can be accessed through code or CLI tools using the Access Token. You should send the API token in the HTTP header `X-API-Token`. Below we provided simple example written in Python.

You will see your **IOMETE region host** instead of _\{your_iomete_account_host}_

```python
 import requests

  r = requests.get("https://{your_iomete_account_host}/api/v1/....", headers = {
	  "X-API-Token": "**************************"
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
