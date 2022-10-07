---
title: Database Connection Options
---

<!-- <head>
  <title>Database Connection Options</title>
  <meta
    name="description"
    content="Database Connection Options"
  />
</head> -->

___

There are three ways to connect **Iomete** to your database:

- Directly by [whitelisting Iomete's IP](./iomete-ip-addresses)
- Via an SSH tunnel

## Whitelist iomete's IP

The fastest and easiest way to connect is to allow [iomete's IP](./iomete-ip-addresses) direct access to your database port. For more information about how to do this, visit the setup guide for your database.

<br/>


## SSH Tunnel

If it's not possible to provide direct access to your database port, you can connect to iomete via an SSH tunnel. You can also choose this connection method for an added layer of security. To connect via an SSH tunnel, you need to setup an SSH tunnel server that has access to your database port. The tunnel server's SSH port needs to be accessible from [iomete's IP](./iomete-ip-addresses)

<br/>

### Allow port access

Make sure that port access is allowed from:

1. [iomete's IP](./iomete-ip-addresses) to your tunnel server's SSH port
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

6. Select **SSH**, enter [iomete's IP](./iomete-ip-addresses), and click **Save**:
![SSH tunnel for iomete's IP](/img/administration-guide/selecting-SSH-AWS.png)


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

Second step is to copy public key from iomete's Console application.
![iomete console SSH tunnel](/img/administration-guide/copying-public-key-from-iomete-Console.png)

Add the public key provided by iomete to the ```authorized_keys``` file in your SSH Server. The key must be all on one line. Make sure that you don’t introduce any line breaks when cutting and pasting. Afterward, you'll need to allow port access. 

Now you should be able to connect to your database through SSH Tunnel.
Go to iomete's Console Application and fill our the form, you can look at the example below

![connecting AWS to iomete console with tunnel](/img/administration-guide/connect-to-your-database-through-SSH-Tunnel.png)
