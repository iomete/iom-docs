---
title: Database Connection Options
description: This guide explains how to connect iomete to your database through Whiitelist iomete's IP or SSh tunnel or AWS
---

There are three ways to connect **IOMETE** to your database:

- Directly by [whitelisting IOMETE's IP](./iomete-ip-addresses)
- Via an SSH tunnel

## Whitelist IOMETE's IP

The fastest and easiest way to connect is to allow [IOMETE's IP](./iomete-ip-addresses) direct access to your database port. For more information about how to do this, visit the setup guide for your database.

<br/>


## SSH Tunnel

If it's not possible to provide direct access to your database port, you can connect to IOMETE via an SSH tunnel. You can also choose this connection method for an added layer of security. To connect via an SSH tunnel, you need to setup an SSH tunnel server that has access to your database port. The tunnel server's SSH port needs to be accessible from [IOMETE's IP](./iomete-ip-addresses)

<br/>

### Allow port access

Make sure that port access is allowed from:

1. [IOMETE's IP](./iomete-ip-addresses) to your tunnel server's SSH port
2. Your SSH tunnel server to your source database port

If your SSH server and database happen to be in AWS, you can follow the instructions below to configure port access.

### AWS

1. To configure an SSH server in AWS, open the EC2 console and select **Running Instances:**

![AWS EC2 console Running Instances](/img/administration-guide/MYSQL-RDS-click-running-instances.png)

2. Select the instance you intend to use as an SSH tunnel:
![AWS SSH tunnel](/img/administration-guide/MYSQL-RDS-click-ssh-tunnel-instance.png)

3. Select the **Security groups** and then select **default:**
![AWS security groups](/img/administration-guide/MYSQL-RDS-click-ssh-tunnel-security-group-new.png)

4. Select the **Inbound** tab.
   
5. Click Edit.
![AWS security group inbound tab](/img/administration-guide/mysql-rds-click-inbound-edit.png)

1. Select **SSH**, enter [IOMETE's IP](./iomete-ip-addresses), and click **Save**:
![SSH tunnel for IOMETE's IP](/img/administration-guide/selecting-SSH-AWS.png)


### SSH Connection

Now to connect to database through SSH tunnel you need to add `authorized_keys` to your EC2 instance.
To do so, connect to your EC2 instance through terminal. 
Create folder 
```bash
mkdir .ssh/
```
if not exists and create file *authorized_keys* (you can use vim or any editor)
```bash
cd .ssh;
vim authorized_keys
```

Second step is to copy public key from IOMETE's Console application.
![IOMETE console SSH tunnel](/img/administration-guide/copying-public-key-from-iomete-Console.png)

Add the public key provided by IOMETE to the ```authorized_keys``` file in your SSH Server. The key must be all on one line. Make sure that you don’t introduce any line breaks when cutting and pasting. Afterward, you'll need to allow port access. 

Now you should be able to connect to your database through SSH Tunnel.
Go to IOMETE's Console Application and fill our the form, you can look at the example below

![connecting AWS to IOMETE console with tunnel](/img/administration-guide/connect-to-your-database-through-SSH-Tunnel.png)
