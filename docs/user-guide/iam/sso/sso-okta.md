---
slug: /user-guide/single-sign-on/okta
title: SSO to IOMETE with Okta
description: Learn how to integrate Okta SSO with the IOMETE Data Plane
last_update:
  date: 10/22/2024
  author: Vugar Dadalov
---

import Img from '@site/src/components/Img';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This guide explains how to use **Okta** with SAML 2.0 to authenticate users in the IOMETE account console. Follow the steps below to integrate Okta for Single Sign-On (SSO) with IOMETE.

---

## Okta SSO Configuration Steps

### 1. Retrieve the IOMETE Redirect URL

- In the IOMETE console, navigate to **Settings** > **Single Sign-On** under **IAM**.
- Select **SAML 2.0**.
- Copy the **IOMETE redirect URL** displayed on the SAML configuration page. You will need this when setting up your application in Okta.

<Img src="/img/user-guide/iam/sso/saml.png" alt="SAML configuration in IOMETE" maxWidth="500px" />

### 2. Create an IOMETE Application in Okta

- Log in to the Okta Admin Console.
- From the sidebar, go to **Applications** and click **Create App Integration**.
- Choose **SAML 2.0** as the sign-on method and click **Next**.

<div className="row">
  <div className="col col--6">
    <Img src="/img/user-guide/iam/sso/okta/okta-create-app.png" alt="Creating a new SAML app in Okta" maxWidth="400px" />
  </div>
  <div className="col col--6">
    <Img src="/img/user-guide/iam/sso/okta/okta-create-app-saml.png" alt="SAML app creation steps in Okta" maxWidth="400px" />
  </div>
</div>

- For **App Name**, enter the name of your app and click **Next**.

  <Img src="/img/user-guide/iam/sso/okta/okta-saml-general.png" alt="General settings for Okta SAML" maxWidth="500px" />

- **Single sign-on URL**: Paste the IOMETE redirect URL you copied earlier.
- **Audience URI (SP Entity ID)**: Paste the IOMETE redirect URL again.
- **Name ID format**: Choose `Persistent`.

<Img src="/img/user-guide/iam/sso/okta/okta-saml-config.png" alt="SAML configuration settings in Okta" maxWidth="600px" />

### 3. Configure Attribute Statements

In the **Attribute Statements** section, set up the following attributes to map user details from Okta to IOMETE:

| Name        | Name Format | Value            |
| ----------- | ----------- | ---------------- |
| `username`  | Unspecified | `user.login`     |
| `email`     | Unspecified | `user.email`     |
| `firstName` | Unspecified | `user.firstName` |
| `lastName`  | Unspecified | `user.lastName`  |

<Img src="/img/user-guide/iam/sso/okta/okta-saml-attributes.png" alt="Configuring SAML attribute statements in Okta" maxWidth="600px" />

Click **Next** to proceed.

### 4. Obtain SAML Integration Information

After the setup is complete, Okta will provide you with the following details. These are required to configure IOMETE:

- **Identity Provider Issuer (Entity ID)**.
- **Single Sign-On URL** (also known as the SAML endpoint).
- **X.509 Certificate**.

<Img src="/img/user-guide/iam/sso/okta/okta-saml-props.png" alt="SAML integration details in Okta" maxWidth="600px" />

### 5. Configure Okta in IOMETE

Go back to the IOMETE SSO configuration page and enter the information obtained from Okta:

- **Entity ID**: Paste the Okta Issuer URL.
- **Single Sign-On URL**: Paste the Okta SAML endpoint.
- **X.509 Certificate**: Upload the certificate provided by Okta.

Click **Save** to save your settings, and then click **Enable SAML SSO** to activate Single Sign-On.

<Img src="/img/user-guide/iam/sso/okta/okta-saml-fill.png" alt="Filling in SAML details in IOMETE" />

### 6. Assign Users to the IOMETE Application in Okta

After configuring SAML SSO, ensure users have access to the IOMETE app in Okta:

1. In the Okta Admin Console, navigate to **Applications** > **Assignments**.
2. Assign users or groups who should have access to IOMETE.

<Img src="/img/user-guide/iam/sso/okta/okta-saml-assign-users.png" alt="Assigning users to the IOMETE app in Okta" maxWidth="600px" />

### Conclusion

After successfully configuring Okta SSO with IOMETE, you can test the integration. Try logging out of the IOMETE page, and tada—you should see the Okta login page!

<Img src="/img/user-guide/iam/sso/okta/okta-sign-in.png" alt="Okta signin page" maxWidth="300px" />

:::info **Tip**  
During the SSO testing phase, it's advisable to keep the IOMETE account console open in a separate browser window to avoid being locked out.
:::
