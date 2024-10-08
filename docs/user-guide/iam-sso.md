---
title: SSO Configuration
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
Your identity provider (IdP) must support at least one of these protocols. options divided into three parts:

### 1. SAML 2.0

On selecting **SAML2.0** following inputs are expected:

1. **IOMETE Redirect URL**:
This is the URL that IOMETE will use to handle SAML authentication responses. It is automatically set and cannot be modified.

`https://dev.iomete.cloud/api/v1/identity/auth/saml-acs`

2. Entity ID:
The unique identifier (Entity ID) for your SAML Identity Provider (IdP). This is typically provided by your IdP and should match the configuration in their system.

`https://auth.pingone.eu/54013162-b4d9-4d88-a89a-3330fd02399b`

3. Single Sign-On URL:
The URL for SAML-based Single Sign-On. This should be provided by your IdP and is used to redirect users for authentication. 

`https://auth.pingone.eu/54013162-b4d9-4d88-a89a-3330fd02399b/saml20/idp/sso`

4. x.509 Certificate:
The x.509 certificate is used to establish trust between IOMETE and your SAML Identity Provider. 
Paste the certificate content provided by your IdP here.

`It should be in PEM format, starting with -----BEGIN CERTIFICATE----- and ending with -----END CERTIFICATE-----.
`

Once all fields are correctly filled, click the `Enable SAML SSO` button to activate SAML-based Single Sign-On for your IOMETE account.

If you want to remove the current SAML SSO configuration, click the `Delete button`. 
This will disable the SAML SSO setup.
After making changes, click the `Save button` to store the updated SSO configuration.

<Img src="/img/user-guide/sso/sso-saml-config.png" alt="LDAP configuration" />


### 2. OIDC 

On selecting **OIDC** following inputs are expected:

1. **IOMETE Redirect URL**:
This is the URL where IOMETE will receive OpenID Connect (OIDC) authentication responses. It is automatically set and cannot be modified.

`https://dev.iomete.cloud/api/v1/identity/auth/oidc/callback`

2. IDP URL:
The Identity Provider (IdP) URL used for OIDC-based Single Sign-On. This URL is provided by your OIDC provider and should point to the OpenID configuration endpoint.

` https://auth.pingone.eu/54013162-b4d9-4d88-a89a-3330fd02399b/as/.well-known/openid-configuration`

3. Client ID:
The Client ID is a unique identifier for your application within the OIDC provider's system. This is typically provided by your OIDC provider. 

`98f26da1-d15d-44a0-9a6c-1deb4348fc08 `

4. Client Secret:
The Client Secret is used to authenticate the application with the OIDC provider. This should be kept secure and is also provided by the OIDC provider.

`MMO2ZTnpSbJznkRhkBgR5tIz_Fu.s2jFTQxEAY2ax64i4xM8-jpTJdjq7jpylAEUe`

5. Scope:
Defines the permissions or claims that the OIDC provider will grant. In this case, the scope requests access to OpenID, profile, and email information. 

`openid profile email`

Once all fields are filled out correctly, click the **Enable OIDC SSO** button to activate OpenID Connect-based Single Sign-On for your IOMETE account.

If you want to remove the current OIDC SSO configuration, click the **Delete button**. 
This will disable the OIDC SSO setup.
After making any changes, click the **Save button** to store your updated configurations.

<Img src="/img/user-guide/sso/sso-oidc.png" alt="LDAP configuration" />



The process is similar for any identity provider that supports OIDC or SAML 2.0.

:::info `Enable/disable`
IOMETE can function without any SSO enabled. But if enabling SSO, **only one** of the above two options can be enabled.
If **SAML2.0** is enabled then **OIDC** cannot be enabled and vice versa.
:::