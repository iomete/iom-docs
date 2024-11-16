---
slug: /user-guide/single-sign-on/scim-okta
title: Okta SCIM Configuration Steps
description: Learn how to provision users and groups from Okta with SCIM standards
last_update:
  date: 11/16/2024
  author: Soltan Garayev
---

import Img from '@site/src/components/Img';

This guide provides step-by-step instructions for integrating **Okta** with SCIM to provision users and groups in the IOMETE Account Console.
Follow the steps below to seamlessly configure Okta for SCIM with IOMETE.

---

# Okta SCIM Configuration Steps

### 1. Enable SCIM Provisioning

- In `General`tab of the `SAML client you created for IOMETE`, edit `App Setting`.
- Select option `SCIM` for `Provisioning`.
- Click `Save` button to enable SCIM Provisioning

<Img src="/img/user-guide/iam/scim/okta/enable-scim-okta.png" alt="Enable SCIM" maxWidth="600px" />

Once saved, a tab labeled `Provisioning` will appear.

<Img src="/img/user-guide/iam/scim/okta/enabled-scim-okta.png" alt="Enabled SCIM" maxWidth="600px" />

### 2. Configure SCIM Provisioning

- Go to `Provisioning` tab, and click `Edit` button
- Ensure all relevant information is entered into the input fields.
  - Follow the steps <a href="/resources/user-guide/single-sign-on/scim" target="_blank">here</a> for a detailed guide on the required inputs and configurations for setting up SCIM.
- Click the `Test Connector Configuration` button to verify if the configuration is valid.
- Close this window and proceed to the next section.

<div className="row">
  <div className="col col--6">
    <Img src="/img/user-guide/iam/scim/okta/configure-scim-okta.png" alt="Configure SCIM" />
  </div>
  <div className="col col--6">
    <Img src="/img/user-guide/iam/scim/okta/test-connector-configuration-result-okta.png" alt="Test connector configuration result" maxWidth="260px" />
  </div>
</div>

:::tip Verify
If everything is configured correctly, the window shown in the image on the right will appear.
:::

<br/>
Once everything is set up, check the `Enable` checkboxes based on the actions you want to provision, as illustrated in the picture below.

<Img src="/img/user-guide/iam/scim/okta/enable-provisioning-to-app-from-okta.png" alt="Enable provisioning to app from okta" maxWidth="600px" />


### 3. Provision Users

- Navigate to the `Assignments` tab and assign the desired **users** or **groups** to the `SAML client you created for IOMETE`.

<Img src="/img/user-guide/iam/scim/okta/provision-users-okta.png" alt="Provision users" maxWidth="600px" />

---

Once this is done, the assigned users or members of the assigned groups will be provisioned from Okta to IOMETE with an `IDP` origin

<Img src="/img/user-guide/iam/scim/okta/provisioned-users-okta.png" alt="Provisioned users from Okta"/>

### 4. Provision Groups

- Navigate to the `Push Groups` tab.
- Click `+ Push Groups ▼` button, and select **group** or **groups** to provision.
- Push status `Active` means that group has been provisioned to IOMETE.

<Img src="/img/user-guide/iam/scim/okta/provision-groups-okta.png" alt="Provision groups" />

---

Once this is done, the pushed group or groups will be provisioned from Okta to IOMETE with an `IDP` origin.
Picture below shows groups in IOMETE console `Groups` page.

<Img src="/img/user-guide/iam/scim/okta/provisioned-group-okta.png" alt="Provisioned group from Okta" />

If you navigate to the group's information page, you will see `IDP` mappings between Okta users and groups, 
as members are provisioned along with the group. 

<Img src="/img/user-guide/iam/scim/okta/group-detailed-page-okta.png" alt="Group detailed page" maxWidth="600px" />

As user-group mappings are provisioned, the user's information page is updated accordingly.
The pictures below illustrate the **before** and **after** versions of the user's information page following group provisioning in IOMETE.

<div className="row">
  <div className="col col--6">
    <Img src="/img/user-guide/iam/scim/okta/user-detailed-page-before-group-provisioning-okta.png" alt="User page before group provisioning" />
  </div>
  <div className="col col--6">
    <Img src="/img/user-guide/iam/scim/okta/user-detailed-page-after-group-provisioning-okta.png" alt="User page after group provisioning" />
  </div>
</div>

---
#### Add user to a group in Okta

- Navigate to group's information page in Okta
- Click `Assign People` button
- Add a user to this group by clicking `+` button

<Img src="/img/user-guide/iam/scim/okta/add-user-to-group-okta.png" alt="Add a user to a group in Okta" />

Once this process is complete, the group members in IOMETE will be updated after a short interval.

<Img src="/img/user-guide/iam/scim/okta/added-user-to-group-okta.png" alt="Added user to a group in Okta provisioned to IOMETE" />

When members of the provisioned group are assigned to the `SAML client you created for IOMETE`, 
a new user will be created in IOMETE if that user does not already exist.

<Img src="/img/user-guide/iam/scim/okta/created-member-okta.png" alt="New member of group is created in IOMETE" />

---
#### Remove user from a group in Okta

- Navigate to group's information page in Okta
- Remove any user grom this group by clicking `x` button

<Img src="/img/user-guide/iam/scim/okta/remove-user-from-group-okta.png" alt="Remove a user from a group in Okta" />

Once this process is complete, the group members in IOMETE will be updated after a short interval.

<Img src="/img/user-guide/iam/scim/okta/removed-user-from-group-okta.png" alt="Remove user from a group in Okta provisioned to IOMETE" />

When members are removed from the provisioned group assigned to the `SAML client you created for IOMETE`, 
the corresponding user will be deleted in IOMETE if they are no longer part of any provisioned group.

<Img src="/img/user-guide/iam/scim/okta/removed-member-okta.png" alt="Removed member of group is deleted in IOMETE" />

