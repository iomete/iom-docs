---
title: SSO with SAML 2.0
description: Learn how to integrate SAML SSO within the IOMETE Data Plane
last_update:
  date: 03/26/2024
  author: Vugar Dadalov
---

import { Trash } from "@phosphor-icons/react";
import Img from '@site/src/components/Img';

IOMETE offers an interface to configure your SSO for authentication.

---
# SAML 2.0

The following instructions describe how to use SAML 2.0 to authenticate account console users.


1. View the account console SSO page and copy the SAML URL:
   - As an account admin, log in to the IOMETE Console and click the **Settings** icon in the sidebar. 
   - Click the **Single Sing-on** tab under **IAM**. 
   - Choose **SAML 2.0**. 
   - Copy the value in the **IOMETE Redirect URI** field. You will need the IOMETE SAML URL for a later step.

2. In another browser window or tab, create a IOMETE application in your identity provider:
   - Go to your identity provider (IdP). 
   - Create a new client application (web):
     - Use your identity provider’s documentation as needed.
     - For the SAML URL field (which might be called a redirect URL), use the IOMETE SAML URL that you copied from the IOMETE page. 
   - IOMETE looks for the following fields during authentication. Ensure that your identity provider has the relevant attribute mappings. 
     - username 
     - email 
     - firstName 
     - lastName 
   - Copy the following objects and fields from your new IOMETE application:
     - **The x.509 certificate**: A digital certificate provided by your Identity Provider for securing communications between IOMETE and the Identity Provider 
     - **The single-sign-on (SSO) UR**L for your identity provider. This is the URL that initiates SSO with your identity provider. It is also sometimes referred to as the SAML endpoint. 
     - **The identity provider issuer**: This is the unique identifier for your SAML identity provider. This is sometimes referred to as the Entity ID or Issuer URL.
     
3. Set your IOMETE account to use your identity provider:

<Img src="/img/user-guide/sso/saml2.0sso.png" alt="SAML configuration" />

   - Return to the browser tab or window with the IOMETE account console SSO page. 
   - Type or paste the following fields from your identity provider’s IOMETE application: the single sign-on URL, the identity provider entity ID, and the x.509 Certificate. 
   - Click **Save**. 
   - Click **Enable SAML SSO** to enable single sign-on for your account. 
   - Test IOMETE Console login with SSO. 
   
4. Grant users access to the IOMETE application in your identity provider. You might need to modify the access permissions for the application.


:::info
To prevent getting locked out of IOMETE during single sign-on testing, IOMETE recommends keeping the account console open in a different browser window.
:::