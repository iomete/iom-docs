---
title: Power BI (Arrow Flight) - Connecting to IOMETE
sidebar_label: Arrow Flight
description: Install the IOMETE Power BI connector and connect Power BI Desktop or an on-premises data gateway to IOMETE through Arrow Flight SQL.
last_update:
  date: 09/30/2026
  author: Abhishek Pathania
---

import Img from '@site/src/components/Img';

## Overview

The IOMETE Power BI connector connects Power BI to IOMETE through the IOMETE Arrow Flight SQL ODBC driver. It adds an **IOMETE Arrow Flight Connector** data source to Power BI and supports both Import and DirectQuery.

You build reports in Power BI Desktop. To refresh published reports from the Power BI Service, you also install the driver and connector on an on-premises data gateway. Both setups use the same connector bundle. If you need the older Thrift Server connection instead, see [Power BI (Thrift)](./thrift.md).

## Prerequisites

Before you begin, make sure you have:

- A [running IOMETE compute cluster](/user-guide/compute-clusters/overview)
- An IOMETE username and [personal access token](/user-guide/access-tokens/personal)
- Administrator access to every Windows machine where you install the driver: your Power BI Desktop machine and, for scheduled refresh, every gateway node
- Power BI Desktop, and for scheduled refresh, an [on-premises data gateway](https://learn.microsoft.com/en-us/data-integration/gateway/service-gateway-install). DirectQuery through a gateway requires standard mode.

## Downloading the Connector Bundle

1. Download **`iomete-odbc-connector.zip`** from the [iomete-artifacts](https://github.com/iomete/iomete-artifacts) repository.
2. Extract the ZIP file. It contains `IOMETEConnector.mez`, the Power BI connector, and `arrow-odbc-iomete.zip`, the ODBC driver.

## Installing the ODBC Driver

Install the driver on every machine that runs IOMETE queries: your Power BI Desktop machine and every gateway node.

1. Extract **`arrow-odbc-iomete.zip`** to `C:\Program Files\IOMETE Connector`.
2. In `C:\Program Files\IOMETE Connector\arrow-odbc-iomete`, right-click **`register-arrow-odbc-iomete`** and select **Run as administrator**. The script registers the driver with Windows.

<Img src="/img/integrations/powerbi/register.png" alt="Power BI ODBC Register"/>

## Connecting From Power BI Desktop

1. Copy **`IOMETEConnector.mez`** to `C:\Users\<YourUser>\Documents\Power BI Desktop\Custom Connectors`, replacing `<YourUser>` with your Windows username. Create the folder if it does not exist, then restart Power BI Desktop.

   <Img src="/img/integrations/powerbi/mez.png" alt="Power BI .mez Location"/>

2. In Power BI Desktop, select **Get Data** → **More...**, search for **IOMETE Arrow Flight Connector**, and select **Connect**. If the connector is not listed, see [Troubleshooting](#troubleshooting).

   <Img src="/img/integrations/powerbi/connector.png" alt="Power BI connector"/>

3. Fill in the [connection settings](#connection-settings) and select **OK**.

   <Img src="/img/integrations/powerbi/details.png" alt="Power BI details"/>

4. Enter your IOMETE username and access token, and select **Connect**.

The Navigator then lists the catalogs and tables you can access, and you can start building your report.

### Connection Settings

| Field | Value | Example |
|---|---|---|
| Server URL | Host and port of your IOMETE Arrow Flight endpoint | `dev.iomete.com:443` |
| Cluster | Name of the compute cluster | `medium-cluster` |
| Data Plane | Kubernetes namespace where the compute cluster runs | `spark-resources` |
| Certificate Path | Optional. Leave blank to use the Windows certificate store. See [Trusting the Server Certificate](#trusting-the-server-certificate). | `C:\certs\iomete-ca.pem` |
| Data Connectivity mode | **Import** copies data into the report; **DirectQuery** queries IOMETE live | DirectQuery |

## Refreshing Through an On-premises Data Gateway

The Power BI Service refreshes published reports through the on-premises data gateway, so every gateway node needs the driver and the connector. The gateway runs as a Windows service, `NT SERVICE\PBIEgwService` by default, so it cannot see files in your user profile or certificates in your personal certificate store.

### Setting Up Each Gateway Node

Repeat these steps on every node of the gateway cluster, and use the same connector version everywhere:

1. [Install the ODBC driver](#installing-the-odbc-driver).
2. Copy **`IOMETEConnector.mez`** to a folder the gateway service account can read, for example `C:\Program Files\IOMETE Connector\Custom Connectors`.
3. In the on-premises data gateway app, open **Connectors**, and under **Load custom data connectors from folder**, select that folder.
4. Make sure the node trusts the IOMETE server certificate. See [Trusting the Server Certificate](#trusting-the-server-certificate).
5. Restart the gateway from **Service Settings** in the gateway app.

### Creating the Gateway Connection

1. In the Power BI Service, go to **Settings** → **Manage connections and gateways** and create a new on-premises connection on your gateway cluster.
2. Select **IOMETE Arrow Flight Connector** as the connection type, and enter the **Server URL**, **Cluster**, and **Data Plane** values your report uses. The gateway matches the connection to the report on these three values, so they must be identical.
3. Select **Basic** authentication and enter your IOMETE username and access token.
4. Create the connection. Power BI tests it before saving.
5. In your semantic model's settings, under **Gateway and cloud connections**, map the IOMETE data source to this connection.

The connection test always uses the gateway node's Windows certificate store, even when your report sets a **Certificate Path**. If your nodes trust the server only through a PEM file, the test fails, so select **Skip test connection** before creating the connection. Scheduled refresh still uses the **Certificate Path** from your report.

## Trusting the Server Certificate

The driver always verifies the TLS certificate of your IOMETE server. **Certificate Path** only decides which certificate authority (CA) the driver trusts for that check. It is not a client certificate and never contains a private key.

| Certificate Path | The driver trusts | Use it when |
|---|---|---|
| Blank (recommended) | The Windows certificate store | The server certificate is publicly trusted, or your organization's root CA is in the Windows certificate store |
| Path to a PEM file | Only the certificates in that file | You cannot change the Windows certificate store, or you want to trust a single CA |

If your server certificate comes from your organization's own CA and that CA is not yet trusted, import the root CA certificate into **Trusted Root Certification Authorities** for the **local computer** (`certlm.msc`). The local computer store works for both Power BI Desktop and the gateway service account, whereas the current user store is invisible to the gateway.

If you use a PEM file instead, it must contain the root CA certificate as Base64 text starting with `-----BEGIN CERTIFICATE-----`. Put the file at the same path on every machine that runs the report, including every gateway node, and make sure the user running Power BI or the gateway service can read it.

To see which CA issued your server certificate, run this from any machine with OpenSSL, replacing `<server-host>:<port>` with your **Server URL**. If your Server URL has no port, the connector uses `443`. The last `i:` line names the root CA:

```bash
openssl s_client -connect <server-host>:<port> -showcerts </dev/null | grep -E 's:|i:'
```

## Upgrading From an Earlier Connector Version

Connector versions earlier than `24.0.0-iomete.2` required **Certificate Path** and could not be used with an on-premises data gateway. To check which version you have, open the connection dialog in Power BI Desktop: if the field reads **Certificate Path** instead of **Certificate Path (optional)**, you have an earlier version.

After you replace `IOMETEConnector.mez` with the current version:

- Power BI Desktop asks for your credentials again the next time you refresh. You can remove the old entry under **File** → **Options and settings** → **Data source settings**.
- Recreate any gateway connections that were created with the earlier version.
- Earlier versions ignored **Certificate Path** and always used the Windows certificate store. The current version uses the file you enter, so if your reports pass a path that does not point to a valid PEM file, clear it or fix the file before you refresh.

## Troubleshooting

When a report works in Power BI Desktop but fails through the gateway, the cause is usually something installed for your Windows user instead of for the gateway service account. Check the [gateway node setup](#setting-up-each-gateway-node) first.

### Power BI Desktop Does Not List the Connector

- Check that `IOMETEConnector.mez` is in `Documents\Power BI Desktop\Custom Connectors`, and restart Power BI Desktop after copying it. If your Documents folder is redirected to OneDrive, use that Documents folder.
- Power BI Desktop blocks uncertified connectors by default. Go to **File** → **Options and settings** → **Options** → **Security**, and under **Data Extensions**, select **(Not Recommended) Allow any extension to load without validation or warning**. Select **OK** and restart Power BI Desktop.

### "Data source name not found and no default driver specified"

The ODBC driver is not registered on the machine running the query. [Install the ODBC driver](#installing-the-odbc-driver) on that machine. For gateway refreshes, install it on every gateway node.

### Saving Gateway Credentials Fails

Power BI tests the connection on a gateway node before it saves the credentials, so the test depends on that node's setup, not on your Desktop machine.

- **"3 arguments were passed to a function that expects 4"**: the node runs an earlier connector version. Install the current `IOMETEConnector.mez` on every gateway node, restart the gateway, and recreate the connection. See [Upgrading From an Earlier Connector Version](#upgrading-from-an-earlier-connector-version).
- **Any other error**: check that the driver is registered on every node and that the server's CA is in the **local computer** certificate store. If your nodes trust the server only through a PEM file, the test cannot pass, so select **Skip test connection**.

### Refresh Does Not Use the Gateway Connection

If the semantic model settings show the IOMETE data source without a mapped connection, the **Server URL**, **Cluster**, or **Data Plane** on the gateway connection differs from the values in your report. They must match character for character, including the port, so `dev.iomete.com` and `dev.iomete.com:443` count as different data sources. Recreate the connection with the values from your report.

### Connection Fails With "Could not open certificate"

The file in **Certificate Path** does not exist or cannot be read on the machine running the query. On a gateway, that means every gateway node, and the gateway service account needs read access to the file. Fix the path, or clear **Certificate Path** to use the Windows certificate store.

### Connection Fails With a Certificate Verification Error

The driver could not verify the server certificate. Check that:

- The CA that issued the server certificate is trusted where the query runs. On a gateway, it must be in the **local computer** store, because the gateway cannot see your user store.
- A PEM file in **Certificate Path** contains the CA certificate, not the server's own certificate, and is Base64 text starting with `-----BEGIN CERTIFICATE-----`.
- **Server URL** uses the host name on the server certificate, not an IP address or an alias the certificate does not cover.

See [Trusting the Server Certificate](#trusting-the-server-certificate).

### Sign-in Fails

Check your IOMETE username and that your personal access token has not expired or been revoked. The gateway stores its own copy of the credentials, so after you rotate a token, update the credentials on the gateway connection as well.
