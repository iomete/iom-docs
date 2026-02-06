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

**1.** Navigate to **Settings** menu

**2.** Click **Access Tokens** tab

**3.** Click **Generate new token**

<Img src="/img/user-guide/pat/access-tokens.png"
  alt="Access tokens"/>

**4.** Under **Token name**, give the token a name.

**5.** Click **Generate**. After genereting you should see

  <div className="row">
    <div className="col col--6">
      <Img src="/img/user-guide/pat/access-token-create.png" alt="Access token create" maxWidth="305px"/>
    </div>
    <div className="col col--6">
      <Img src="/img/user-guide/pat/access-token-created.png" alt="Access token created" maxWidth="400px"/>
    </div>
</div>

**6.** Click **Done**.

**7.** We can see generated token in list view.

<Img src="/img/user-guide/pat/access-token-list.png"
  alt="Access token list"/>

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

A suspended token can be **reactivated** at any time to restore access. No service restart or redeployment is required.

### Rate Limiting (maxRPS)

:::info New in 3.16.0
:::

Each access token can have a **maximum requests per second (maxRPS)** configured. When set, the token is rate-limited at the [Iceberg REST Catalog](/user-guide/spark-catalogs/internal#rate-limiting) level.

This is useful for controlling external client throughput and preventing any single client from overwhelming the catalog.

:::note
Rate limiting requires the `features.ratelimiter.enabled` Helm flag to be set to `true`. See the [Iceberg REST Catalog — Rate Limiting](/user-guide/spark-catalogs/internal#rate-limiting) documentation for details.
:::
