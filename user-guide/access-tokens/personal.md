---
title: Personal Access Tokens
description: Create and manage personal access tokens to call the IOMETE API without a password.
sidebar_label: Personal Tokens
last_update:
  date: 10/09/2026
  author: Maksym Kryvchun
---

import Img from '@site/src/components/Img';

Use a personal access token to call the **IOMETE API** from code or scripts, instead of your password.

## Creating a Token

1. Go to **Settings** > **Access Tokens** and click **New access token**.
2. Enter a **Token name**, pick an **Expiration**, and click **Create**.
3. Copy the token.

<Img src="/img/user-guide/pat/access-token-create.png" alt="Create access token form" maxWidth="600px"/>

:::warning You see the token only once
Copy it right away and keep it somewhere safe, such as a password manager. If you lose it, delete it and create a new one.
:::

<Img src="/img/user-guide/pat/access-token-created.png" alt="Access token created, with a Copy button" maxWidth="500px"/>

New tokens start with `iomt_`. Older tokens without it keep working.

## Using a Token

Send the token in the `X-API-Token` header. Replace `{your_iomete_host}` with the address you use to open IOMETE.

```python
import requests

r = requests.get("https://{your_iomete_host}/api/v1/....", headers={
    "X-API-Token": "iomt_**************************"
})
```

## Managing a Token

Open the **⋮** menu next to a token:

| Action | What it does |
| -- | -- |
| **Suspend** | Blocks the token right away. Turn it back on with **Activate**. Not available for expired tokens. |
| **Rename** | Changes only the name. Anything using the token keeps working. |
| **Delete** | Removes the token for good. |

<Img src="/img/user-guide/pat/access-token-suspend.png" alt="Token actions menu with Suspend, Rename, Copy name and Delete"/>

:::tip Need a request limit?
To cap how many requests per second a token can make, use a [service account token](./service-account.md).
:::

## Expiry Notifications

IOMETE can email you before a token expires. See [Access Token Expiry Notifications](./expiry-notifications.md).
