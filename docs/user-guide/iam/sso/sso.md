---
slug: /user-guide/single-sign-on
title: SSO Configuration
sidebar_label: Overview
description: Learn how to integrate SSO authentication within the IOMETE Data Plane
last_update:
  date: 10/18/2024
  author: Vugar Dadalov
---

import Img from '@site/src/components/Img';

This article introduces SSO configurations in IOMETE.

---

Single sign-on enables you to authenticate your users using your organization’s identity provider. IOMETE recommends configuring SSO for greater security and improved usability. Once SSO is configured, you can enable fine-grained access control, such as multi-factor authentication, via your identity provider.

:::info
If you don’t configure single sign-on, users can login to IOMETE using the username & password.
:::

## Setup

IOMETE offers an interface to configure your single sign-on SSO for authentication. SSO supports using either SAML 2.0 or [OpenID Connect (OIDC)](https://openid.net/developers/how-connect-works/). Your identity provider (IdP) must support at least one of these protocols.

See how to configure IOMETE's SSO with SAML and OIDC.

#### 1. [SAML 2.0](sso-saml.md)

#### 2. [OpenID connect (OIDC)](sso-oidc.md)

<Img src="/img/user-guide/iam/sso/sso.png" alt="SSO configuration"/>

The process is similar for any identity provider that supports OIDC or SAML 2.0.

<!-- :::info `Enable/disable`
IOMETE can function without any SSO enabled. But if enabling SSO, **only one** of the above two options can be enabled.
If **SAML2.0** is enabled then **OIDC** cannot be enabled and vice versa.
::: -->

You can read the instructions on how to configure SSO to the following identity providers:

<!-- Microsoft Entra ID (formerly Azure Active Directory) -->

- #### [Okta](sso-okta.md)

<!-- One Login -->
