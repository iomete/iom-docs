---
title: Personal Access Tokens
description: Create and manage personal access tokens to call the IOMETE API without a password.
sidebar_label: Personal Tokens
last_update:
  date: 10/09/2026
  author: Maksym Kryvchun
---

import Img from '@site/src/components/Img';

A personal access token lets you call the **IOMETE API** from code or CLI tools without using your password.

### Creating a Token

1. Go to **Settings** > **Access Tokens**.
2. Click **New access token**.
3. Fill in the form:
   - **Token name**: a name that tells you what the token is for.
   - **Expiration**: how long the token stays valid. Pick **No expiration** only if you really need it.
   - **Max RPS** (optional): the most requests per second the token can make. You only see this field when [rate limiting](#rate-limiting) is turned on.
4. Click **Create**.

<Img src="/img/user-guide/pat/access-token-create.png" alt="Create access token form" maxWidth="600px"/>

5. Copy the token.

<Img src="/img/user-guide/pat/access-token-created.png" alt="Access token created, with a Copy button" maxWidth="500px"/>

:::warning Copy your token now
You see the full token only once, right after you create it. After that, the list shows a shortened version like `iomt_ABC…XYZ`.

Save the token somewhere safe, such as a password manager. If you lose it, delete it and create a new one.
:::

<Img src="/img/user-guide/pat/access-tokens.png" alt="Access tokens list showing the shortened token"/>

### Using a Token

Send the token in the `X-API-Token` HTTP header. Replace `{your_iomete_account_host}` with your IOMETE host.

```python
import requests

r = requests.get("https://{your_iomete_account_host}/api/v1/....", headers={
    "X-API-Token": "iomt_**************************"
})
```

### Token Format

- New tokens start with `iomt_`, so they are easy to spot, and secret scanners can catch one that leaks.
- A mistyped or incomplete token is rejected straight away.
- Older tokens without the `iomt_` prefix keep working.

### Renaming a Token

Open the token's actions menu and choose **Rename**. Anything using the token keeps working, because only the name changes. Each token needs a unique name.

<Img src="/img/user-guide/pat/access-token-rename.png" alt="Rename access token dialog" maxWidth="450px"/>

### Suspending and Reactivating a Token

:::info New in 3.16.0
:::

Open the token's actions menu and choose **Suspend** to block it right away without deleting it. For example, to stop a misbehaving client or during an investigation.

<Img src="/img/user-guide/pat/access-token-suspend.png" alt="Suspend an access token"/>

Choose **Activate** to let the token work again. Nothing needs restarting.

<Img src="/img/user-guide/pat/access-token-activate.png" alt="Activate an access token"/>

### Rate Limiting

:::info New in 3.16.0
:::

Set **Max RPS** on a token to cap how many requests per second it can make to the [Iceberg REST Catalog](/user-guide/spark-catalogs/internal#rate-limiting). This stops one client from overloading the catalog.

<Img src="/img/user-guide/pat/access-tokens-rps.png" alt="Access token list showing the Max RPS limit"/>

:::note
Rate limiting works only when the `features.ratelimiter.enabled` Helm flag is `true`.
:::

### Expiry Notifications

IOMETE can email you before a token expires. See [Access Token Expiry Notifications](./expiry-notifications).
