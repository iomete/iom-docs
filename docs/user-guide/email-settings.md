---
title: Email Settings
description: IOMETE offers a feature to configure your own email server.
last_update:
  date: 03/25/2024
  author: Vugar Dadalov
---

import { Trash } from "@phosphor-icons/react";
import Img from '@site/src/components/Img';

IOMETE offers a feature to configure your own email server.

---

### Configuration

To view Email Settings, navigate to the `Settings` menu item and switch to the `Email Settings` tab.
Click on the <button className="button button--primary button-iom">Configure</button> button to get started.

<Img src="/img/user-guide/email-settings/email-settings.png" alt="Email configuration" />

### Configuration options

After that, you'll see the following options for configuration.

- **From:** Sender Email Address
- **From Display Name** Display Name for Sender Email Address
- **Host** SMTP Host
- **Port** SMTP Port
- **User** Login Username
- **Password** Login Password

<Img src="/img/user-guide/email-settings/email-settings-inputs.png" alt="Email configuration inputs" maxWidth="600px"/>

### Test connection

After filling in the input, you can test the connection by clicking the <button className="button button--default button-iom">Test connection</button> button.

<Img src="/img/user-guide/email-settings/email-settings-test-connection.png" alt="Email configuration test connection" maxWidth="600px"/>

### Delete email setting

To delete the email setting, simply click the <button className="button button--danger button--outline button-iom"><Trash size={16} /> Delete</button> button below the inputs. Afterward, you'll receive a confirmation message; click "Yes, delete" to confirm the deletion.

<Img src="/img/user-guide/email-settings/email-settings-delete.png" alt="Email configuration delete" maxWidth="600px"/>
