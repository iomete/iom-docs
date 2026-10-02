---
slug: /single-sign-on/oidc
title: SSO with OIDC
sidebar_label: OIDC
description: Let users sign in to IOMETE with your identity provider using OpenID Connect (OIDC).
last_update:
  date: 10/02/2026
  author: Maksym Kryvchun
---

import Img from '@site/src/components/Img';

With OpenID Connect (OIDC) single sign-on, users sign in to IOMETE with their account at your identity provider (IdP), such as Okta, Microsoft Entra ID, Google, or Keycloak.

Before you start:

- You need an admin account that can manage IAM in the **Admin portal**.
- Every user who signs in with SSO must already exist in IOMETE. Add them on the [Users](../users.md) page, sync them from [LDAP](../ldap-configuration.md), or provision them with [SCIM](scim.md). IOMETE doesn't create accounts on first sign-in.

## Opening the OIDC Settings

In the **Admin portal**, go to **IAM** > **Single Sign-on** and click **OpenID connect**.

<Img src="/img/user-guide/iam/sso/sso.png" alt="Single Sign-on page with the SAML 2.0 and OpenID connect options" />

The page shows the **IOMETE redirect URL**. Copy it. You'll need it in the next step.

## Creating the App in Your Identity Provider

In your IdP's admin console, create a new web application (sometimes called a client) for IOMETE:

1. Choose **OpenID Connect** as the sign-in method, with the **Authorization Code** grant type.
2. Paste the **IOMETE redirect URL** into the redirect URI (or callback URL) field.
3. Allow the `openid`, `profile`, and `email` scopes.
4. Assign the users or groups who should be able to sign in to IOMETE.
5. Copy these values from the app:
   - **Issuer URL**: copy it exactly as your IdP shows it. Some include a path, for example `https://login.microsoftonline.com/<tenant-id>/v2.0` for Microsoft Entra ID or `https://keycloak.example.com/realms/<realm>` for Keycloak.
   - **Client ID**
   - **Client secret**

IOMETE matches the person signing in to an IOMETE user by their username (the `preferred_username` claim), or by their email address if the IdP doesn't send a username. Make sure one of these matches the user's username or email in IOMETE.

## Configuring OIDC in IOMETE

Back on the OIDC page, fill in the form:

| Field | Description |
|---|---|
| **IOMETE redirect URL** | Read-only. The URL you added to your IdP app. |
| **IDP URL** | The issuer URL of your IdP, including any path but without a trailing slash. IOMETE adds `/.well-known/openid-configuration` to it to find your IdP's settings. |
| **Client ID** | The client ID of the app you created. |
| **Client secret** | The client secret of the app you created. |
| **Scope** | The scopes IOMETE asks for. The default `openid profile email` works for most IdPs. |

<Img src="/img/user-guide/iam/sso/oidc.png" alt="OIDC page with the redirect URL, IDP URL, client ID, client secret, and scope fields" maxWidth="700px" />

Click **Save**. The settings are saved but not active yet. To turn on SSO, click **Enable OIDC SSO** and confirm.

:::info
Only one SSO method can be active at a time. If [SAML 2.0](sso-saml.md) is enabled, disable it before you enable OIDC.
:::

## Signing In with SSO

Once OIDC is enabled, the IOMETE sign-in page shows a **Sign in with SSO** button. Users click it, sign in at your IdP, and return to IOMETE.

Signing in with a username and password still works, so you won't lock yourself out while testing. The Admin portal sign-in page always uses a username and password.

To turn SSO off, click **Disable OIDC SSO**. To remove the settings completely, click **Delete**.

## Troubleshooting

- **"Access Restricted" after signing in**: the user signed in at your IdP, but no IOMETE user matches their username or email. Add the user in IOMETE, or check that the IdP sends the right username or email.
- **"Authentication Failed"**: IOMETE couldn't complete the sign-in with your IdP. Check that the IDP URL, client ID, client secret, and redirect URL are correct, and that the user is assigned to the app in your IdP.
- **Can't enable OIDC**: another SSO method is already enabled. Disable SAML 2.0 first.
- **Changes in your IdP don't apply right away**: IOMETE caches your IdP's settings for up to an hour.
