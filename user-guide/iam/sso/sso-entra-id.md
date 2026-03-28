---
slug: /user-guide/single-sign-on/entra-id
title: SSO to IOMETE with Microsoft Entra ID
description: Learn how to integrate Microsoft Entra ID SSO with the IOMETE Data Plane
last_update:
  date: 10/22/2024
  author: Vugar Dadalov
---

import Img from '@site/src/components/Img';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This guide explains how to use **Microsoft Entra ID** with SAML 2.0 to authenticate users in the IOMETE account console. Follow the steps below to integrate Microsoft Entra ID for Single Sign-On (SSO) with IOMETE.

---

## Microsoft Entra SSO Configuration Steps

### 1. Retrieve the IOMETE Redirect URL

- In the IOMETE console, navigate to **Settings** > **Single Sign-On** under **IAM**.
- Select **SAML 2.0**.
- Copy the **IOMETE Redirect URL** displayed on the SAML configuration page. You will need this when setting up your application in Microsoft Entra ID.

<Img src="/img/user-guide/iam/sso/saml.png" alt="SAML configuration in IOMETE" maxWidth="500px" />

### 2. Add the IOMETE Application in Microsoft Entra ID

- Sign in to the **Microsoft Entra admin center** as a Cloud Application Administrator.
- Navigate to **Enterprise Applications** > **New Application**.
- In the gallery, select a custom app for SAML integration.
- Once the app is added, go to **Single sign-on** and select **SAML** as the method.

<!-- <Img src="/img/user-guide/iam/sso/entra/entra-create-app.png" alt="Creating a new SAML app in Microsoft Entra ID" maxWidth="500px" /> -->

### 3. Configure Basic SAML Settings

- In the **Basic SAML Configuration** section, configure the following:
  - **Identifier (Entity ID)**: Paste the IOMETE Redirect URL.
  - **Reply URL (Assertion Consumer Service URL)**: Paste the same URL from IOMETE.
  - **Sign-on URL**: Paste the IOMETE Redirect URL.
  - **Unique User Identifier**: Set the **Name ID** format to `user.mail`.

<!-- <Img src="/img/user-guide/iam/sso/entra/entra-saml-config.png" alt="SAML configuration settings in Microsoft Entra ID" maxWidth="600px" /> -->

### 4. Download SAML Signing Certificate

- In the **SAML Signing Certificate** section, download the **Federation Metadata XML**. You’ll need this certificate to upload to IOMETE.

<!-- <Img src="/img/user-guide/iam/sso/entra/entra-saml-signing.png" alt="Downloading SAML signing certificate" maxWidth="600px" /> -->

### 5. Configure Microsoft Entra in IOMETE

- Go back to the IOMETE SSO configuration page and input the following information:
  - **Entity ID**: Paste the **Identifier (Entity ID)** from Microsoft Entra.
  - **Single Sign-On URL**: Paste the **Login URL** from Microsoft Entra.
  - **X.509 Certificate**: Upload the downloaded certificate from Microsoft Entra.

Click **Save** and then **Enable SAML SSO** to activate Single Sign-On.

<!-- <Img src="/img/user-guide/iam/sso/entra/entra-saml-fill.png" alt="Filling in SAML details in IOMETE" /> -->

### 6. Assign Users to the IOMETE Application in Microsoft Entra ID

- In the Microsoft Entra admin center, go to **Users and groups** under the IOMETE application.
- Assign users or groups that should have access to IOMETE.


### 7. Test and Enable SSO

- Test the configuration by logging out and attempting to sign back in. If successful, you will be redirected to the Microsoft Entra login page.

<!-- <Img src="/img/user-guide/iam/sso/entra/entra-saml-test.png" alt="Testing the SSO configuration" maxWidth="600px" /> -->

### Conclusion

After configuring Microsoft Entra SSO with IOMETE, test the setup by logging out of the IOMETE page. You should see the Microsoft Entra ID login page!
