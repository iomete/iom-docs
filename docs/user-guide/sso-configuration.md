---
title: SSO Configuration
sidebar_label: Overview
description: Learn how to integrate SSO authentication within the IOMETE Data Plane
last_update:
  date: 03/26/2024
  author: Vugar Dadalov
---

import { Trash } from "@phosphor-icons/react";
import Img from '@site/src/components/Img';

IOMETE offers an interface to configure your SSO for authentication.

---

## Setup

To view the SSO configuration page, navigate to the `Settings` menu item and switch to the `Single Sign-On` tab under `IAM`.

<Img src="/img/user-guide/sso/sso-landing.png" alt="LDAP configuration" />

On this page, you'll find SSO supports using either SAML 2.0 or [OpenID Connect (OIDC)](https://openid.net/developers/how-connect-works/).
Your identity provider (IdP) must support at least one of these protocols.

Currently IOMETE provides SSO via Okta.

#### 1. [Configure SSO with SAML 2.0](/user-guide/sso-configuration-saml)

#### 2. [Configure SSO with OIDC](/user-guide/sso-configuration-oidc)

The process is similar for any identity provider that supports OIDC or SAML 2.0.

:::info `Enable/disable`
IOMETE can function without any SSO enabled. But if enabling SSO, **only one** of the above two options can be enabled.
If **SAML2.0** is enabled then **OIDC** cannot be enabled and vice versa.
:::
