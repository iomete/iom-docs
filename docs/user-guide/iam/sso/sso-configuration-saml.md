---
slug: /user-guide/sso-configuration-saml
title: SSO with SAML 2.0
description: Learn how to integrate SAML SSO within the IOMETE Data Plane
last_update:
  date: 10/18/2024
  author: Vugar Dadalov
---

import Img from '@site/src/components/Img';

The following guide explains how to use SAML 2.0 to authenticate users in the IOMETE account console. This is particularly useful for organizations looking to centralize user authentication and enhance security through Single Sign-On (SSO).

---

To begin, navigate to the `Settings` menu and switch to the `Single Sign-On` tab under `IAM`.
You will see options for **SAML 2.0** and [OpenID connect](/user-guide/sso-configuration-oidc). Click on SAML to start the configuration.

<Img src="/img/user-guide/iam/sso/sso.png" alt="SSO configuration"/>

## SAML configuration steps

Once on the SAML configuration page, follow these steps to integrate SAML 2.0 with your identity provider (IdP):

### 1. Retrieve the IOMETE redirect URL

On the SAML configuration page, you’ll find the **IOMETE redirect URL**. Copy this URL, as it will be required when setting up your application in the identity provider.

<Img src="/img/user-guide/iam/sso/saml.png" alt="SSO SAML configuration" maxWidth="500px" />

### 2. Set up IOMETE in your identity provider

In a new browser window or tab, proceed to your identity provider and create an application for IOMETE. Follow these steps:

- **Go to your identity provider (IdP)**: Open your IdP’s admin console. This could be services like Okta, Microsoft Entra ID, OneLogin, or others.
- **Create a new client application**: When prompted, choose to create a new web client application. Use your provider's documentation for reference if needed.
- **Input the IOMETE SAML URL**: In the SAML URL field (sometimes labeled as the `redirect URL`), paste the IOMETE SAML redirect URL you copied earlier.
- **Configure attribute mappings**: Ensure that the following fields are mapped in your IdP:
  - `username`
  - `email`
  - `firstName`
  - `lastName`
- **Copy necessary information from your identity provider**: You will need to copy and save the following from your IdP:
  - **The identity provider issuer**: This unique identifier is sometimes called the `Issuer URL` or `Entity ID`.
  - **The single-sign-on (SSO) URL**: This is the URL used to initiate SSO. It is sometimes called the `SAML endpoint`.
  - **The x.509 certificate**: This digital certificate is provided by your IdP to secure communication between IOMETE and your IdP.

### 3. Configure SAML in IOMETE

Return to the IOMETE SSO configuration page in your browser. Enter the following information from your IdP:

- `Entity ID`
- `Single Sign-On URL`
- `x.509 Certificate`

After inputting these details, follow these steps:

- Click **`Save`** to store your settings.
- Click **`Enable SAML SSO`** to activate Single Sign-On for your account.
- Test logging into the IOMETE console using SSO to ensure it works as expected.

<Img src="/img/user-guide/iam/sso/saml-configured.png" alt="SSO SAML configuration" maxWidth="500px" />

### 4. Grant user access in the identity provider

Once your SSO is configured, ensure that users are granted access to the IOMETE application in your IdP. Depending on your IdP, you might need to adjust the permissions for users to access the IOMETE application.

:::info **Tip**  
During the SSO testing phase, it’s recommended to keep the IOMETE account console open in a separate browser window. This will prevent you from being locked out while making changes.  
:::
