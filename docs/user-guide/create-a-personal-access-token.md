---
title: Personal access token
description: A Personal Access Token (PAT) is pivotal for secure authentication. This guide elucidates the process of generating a Personal Access Token in IOMETE.
last_update:
  date: 12/09/2022
  author: Vugar Dadalov
---

import Img from '@site/src/components/Img';

You can create a personal access token to use in place of a password with the **IOMETE API**.

---

### About personal access token

Personal access tokens are an alternative to using passwords for authentication to IOMETE when using IOMETE API. In this article, we will explain to you how to create and use Personal Access Tokens for IOMETE API.

### Create new access token

**1.** Navigate to **Settings** menu

<!-- <Img src="/img/user-guide/pat/pat-go-to-settings.png"
  alt="PAT settings menu" maxWidth="256px"/> -->

**2.** Click **Personal Access Token(PAT)** tab

<!-- <Img src="/img/user-guide/pat/pat-tab.png"
  alt="PAT tab"/> -->

**3.** Click **Generate new token**

<Img src="/img/user-guide/pat/pat-generate.png"
  alt="PAT generate new"/>

**4.** Under **Token name**, give the token a name.

**5.** Under **Expiration**, select an expiration for the token.

:::caution Expiration notifications
Users receive two notifications during the lifetime of a **Personal Access Token**: one day and seven days before the expiration date.
:::

**6.** Click **Generate**.

<Img src="/img/user-guide/pat/pat-generate-view.png"
  alt="PAT generate view" maxWidth="456px"/>

**7.** After genereting you should see

<Img src="/img/user-guide/pat/pat-generated-view.png"
  alt="PAT generate view" maxWidth="456px"/>

:::caution Download or Copy
Make sure to copy your personal access token now. You won't be able to see it again.
:::

**8.** Click **Done**.

**9.** We can see generated token in list view.

<Img src="/img/user-guide/pat/pat-list.png"
  alt="PAT generate view"/>

:::success How to use Personal Access Token
**IOMETE API** can be accessed through code or CLI tools using the Personal Access Token. You should send the API token in the HTTP header `X-API-Token`. Below we provided simple example written in Python.

You will see your **IOMETE region host** instead of _\{your_iomete_account_host}_

```python
 import requests

  r = requests.get("https://{your_iomete_account_host}/api/v1/....", headers = {
	  "X-API-Token": "**************************"
  })
```

:::
