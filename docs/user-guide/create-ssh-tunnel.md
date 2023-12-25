---
title: SSH Tunnel
description: Learn securely connect your private subnet database with IOMETE using SSH Tunnel. Choose from CloudFormation Automation or Manual Configuration options
last_update:
  date: 12/09/2022
  author: Nurlan Mammadov
---

import Img from '@site/src/components/Img';

## Intro

If your database is in the private subnet, you can establish a secure channel between your database and IOMETE using an **SSH Tunnel**.

:::info
You can also choose this connection method for an added layer of security too.
:::

<Img src="/img/user-guide/ssh-tunnel/ssh-tunnel.png" alt="SSH Tunnel"/>

## Create SSH Tunnel in IOMETE

In **IOMETE**, there are two ways to set up an **SSH tunnel** connection.

- **CloudFormation Automation**
  - Automated SSH Server setup using **AWS CloudFormation** service.
- **Manual Configuration**
  - Set up the SSH Server manually with a step-by-step guide.

Go to the **Settings > SSH Tunnel** and click the **Create New** button

<Img src="/img/user-guide/ssh-tunnel/create-new.png"
  alt="SSH generate new"/>

### Create Automatically

**1.** Select **CloudFormation Automation** card and click **Next** button
<Img src="/img/user-guide/ssh-tunnel/create-automate.png" alt="SSH create Automate"/>

**2.** Under the **Tunnel name**, give the tunnel a name.
:::info
This **name** will be used as the hostname for the connections.
:::

**3.** Under **AWS Credentials** give **AWS** **access** and **secret** keys
:::info **We do not store your credentials.**
After the SSH setup is completed, we will delete your credentials. For security reasons, you can create temporary AWS credentials with expiration time. We need access to EC2 Instance, RDS Instance View, Run CloudFormation, etc.
:::

**4.** Click the **Retrieve RDS Instances** button

<Img src="/img/user-guide/ssh-tunnel/retrieve-button.png" alt="Click retrieve button"/>

**5.** Under **Select RDS Instance**, choose the **database instance** to get its public subnets.
<Img src="/img/user-guide/ssh-tunnel/select-rds.png" alt="Select RDS"/>

**6.** From the public subnets, choose the **subnet** where you want the SSH Server should be deployed.
<Img src="/img/user-guide/ssh-tunnel/select-subnets.png" alt="Select Subnets"/>

**7.** Click **Confirm** button. This will deploy a Cloudformation Script into your AWS account.
<Img src="/img/user-guide/ssh-tunnel/confirm-automate.png" alt="Confirm Automate"/>

**8.** After **Confirming,** we should see this message. Click **Go details** button to going details page of creating **tunnel**

:::info
The setup process will be completed in a few minutes
:::

<Img src="/img/user-guide/ssh-tunnel/go-details.png" alt="Go details"/>

We can see **SSH Tunnel** details view.
<Img src="/img/user-guide/ssh-tunnel/details.png" alt="Details"/>

### Create Manually

**1.** Select **Manual Configuration** card and click **Next** button
<Img src="/img/user-guide/ssh-tunnel/create-manual.png" alt="Create  Manual"/>

**2.** Under the **Tunnel name**, give the tunnel a name.
:::info
This **name** will be used as the hostname for the connections.
:::

**3.** Under **Host** and **Port** give parameters of **destination** service.
<Img src="/img/user-guide/ssh-tunnel/destination-host-port.png" alt="Manual Name host port"/>

:::info
Open the AWS **[EC2 console](https://console.aws.amazon.com/ec2/home?#Instances:instanceState=running)** and create new EC2 Instance in the same VPC as your RDS database.
:::

**4.** Add **IOMETE Public Key**.
<Img src="/img/user-guide/ssh-tunnel/copy-ssh-key.png" alt="Copy SSH key"/>

**5.** Under **SSH Server Details** give \*\*\*\*username , EC2 instance Public DNS and Port details.

:::info
**Username** and **Port** parameters already filled with default values.
:::
<Img src="/img/user-guide/ssh-tunnel/ssh-server-details.png" alt="SSH server details"/>

**6.** Click **Create** button
<Img src="/img/user-guide/ssh-tunnel/manual-create-button.png" alt="Manual Create"/>

After clicking **Create** button we should see
<Img src="/img/user-guide/ssh-tunnel/manual-details.png" alt="Manual Details"/>

## Statuses

- ### Connected

  Connection established successfully.

- ### Pending

  SSH Tunnel being deployed and connection establishment is in progress. Normally takes less than a minute. If took more than 2-3 minutes check logs or contact support

- ### Setup in progress

  Cloudformation script is running, usually takes 2-3 minutes maximum

- ### Failed

  Connection failed. Please check logs for more details.
