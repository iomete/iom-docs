---
title: Tableau (Arrow Flight) - Connecting to IOMETE
sidebar_label: Arrow Flight
description: Install the IOMETE Tableau connector and connect Tableau Desktop or Server to IOMETE through Arrow Flight SQL.
last_update:
  date: 09/09/2026
  author: Abhishek Pathania
---

import Img from '@site/src/components/Img';

## Overview

The IOMETE Tableau connector connects Tableau to IOMETE through the Arrow Flight SQL JDBC driver. It adds an **IOMETE (Arrow Flight SQL)** connection dialog to Tableau and supports both live connections and extracts.

The connector and JDBC driver are installed separately. If you need the older Thrift Server connection instead, see [Tableau (Thrift)](./thrift.md).

## Supported Setup

| Component | Supported value |
|---|---|
| Tableau | Desktop or Server 2024.2 and later |
| Platforms | Windows, macOS, and Linux |
| Connection modes | Live and extract |
| Authentication | IOMETE username and access token |
| Transport | JDBC with TLS |

## Prerequisites

Before you begin, make sure you have:

- A [running IOMETE compute cluster](/user-guide/compute-clusters/overview)
- An IOMETE username and [personal access token](/user-guide/access-tokens/personal)
- Administrator access to the computer or Tableau Server nodes where you install the connector
- Tableau Desktop or Tableau Server 2024.2 or later

## Downloading the Connector and Driver

Download these files before installing the connector:

1. Open the [Tableau connector releases](https://github.com/iomete/iomete-integrations/releases?q=tableau-connector) page and select the latest `tableau-connector-v*` release.
2. Download the `.taco` connector, `iomete-taco.cer`, and `SHA256SUMS` files from that release.
3. Download the latest IOMETE Arrow Flight SQL JDBC driver from the [iomete-artifacts](https://github.com/iomete/iomete-artifacts) repository. Driver files follow the naming convention `flight-sql-jdbc-driver-<upstream>-iomete.<release>.jar`.

The `.taco` file does not include the JDBC driver, so Tableau needs both files in their respective installation directories.

## Installing on Tableau Desktop

Place the files in the directories for your operating system:

| Platform | `.taco` connector | JDBC driver |
|---|---|---|
| macOS | `~/Documents/My Tableau Repository/Connectors/` | `~/Library/Tableau/Drivers/` |
| Windows | `C:\Users\[user]\Documents\My Tableau Repository\Connectors` | `C:\Program Files\Tableau\Drivers` |

Create a missing directory if needed, then restart Tableau Desktop after installing or replacing either file.

## Installing on Tableau Server

Place the connector and driver in these directories on every Tableau Server node:

| Platform | `.taco` connector | JDBC driver |
|---|---|---|
| Linux | `/opt/tableau/connectors` | `/opt/tableau/tableau_driver/jdbc` |
| Windows | `C:\Program Files\Tableau\Connectors` | `C:\Program Files\Tableau\Drivers` |

Make both files readable by the Tableau Server run-as account, then restart Tableau Server. A multi-node deployment cannot use the connector reliably until every node has the same connector and driver files.

## Trusting the Connector Certificate

IOMETE currently signs the `.taco` file with a self-signed certificate. Tableau does not trust that certificate automatically, so import `iomete-taco.cer` into Tableau's Java truststore before opening the connector.

The same certificate signs each self-signed release. You only need to import it again if IOMETE rotates the certificate or a Tableau upgrade replaces the truststore.

If the certificate import does not work in a test environment, see [Testing With Signature Verification Disabled](#testing-with-signature-verification-disabled).

### macOS Desktop

Set `TABLEAU_JRE` to the JRE inside your Tableau application. The following example uses Tableau Desktop 2026.2 for Apple silicon, so adjust the application name and version for your installation:

```bash
TABLEAU_JRE="/Applications/Tableau Desktop (Apple silicon) 2026.2.app/Contents/Plugins/jre"
sudo cp "$TABLEAU_JRE/lib/security/cacerts" "$TABLEAU_JRE/lib/security/cacerts.bak"
sudo keytool -importcert -noprompt -alias iomete-taco \
  -file /path/to/iomete-taco.cer \
  -keystore "$TABLEAU_JRE/lib/security/cacerts" -storepass changeit
```

### Windows Desktop

Run PowerShell as Administrator and adjust the Tableau version in the path:

```powershell
$TableauJre = 'C:\Program Files\Tableau\Tableau <version>\Plugins\jre'
Copy-Item "$TableauJre\lib\security\cacerts" "$TableauJre\lib\security\cacerts.bak"
keytool -importcert -noprompt -alias iomete-taco `
  -file C:\path\to\iomete-taco.cer `
  -keystore "$TableauJre\lib\security\cacerts" -storepass changeit
```

Restart Tableau Desktop after importing the certificate.

### Tableau Server

Tableau Server does not document a stable JRE truststore path across versions and platforms. Confirm the path for your exact installation, back up its `cacerts` file, and import `iomete-taco.cer` on every node with `keytool`. Restart Tableau Server after the import.

## Connecting to IOMETE

1. Start Tableau and open **Connect > To a Server > More**.
2. Select **IOMETE (Arrow Flight SQL)**.

<Img src="/img/integrations/tableau/connector-list.png" alt="Tableau Connect pane showing the installed IOMETE (Arrow Flight SQL) connector" />

3. Complete the connection dialog:

| Field | What to enter |
|---|---|
| **Server** | Your IOMETE hostname without `https://` |
| **Port** | `443`, unless your deployment uses another port |
| **Compute Cluster** | The name of your running IOMETE compute cluster |
| **Namespace** | Your IOMETE namespace name |
| **Catalog** | Optional. Leave blank to browse all accessible catalogs, or enter a catalog to limit discovery |
| **Username** | Your IOMETE username |
| **Access Token** | Your IOMETE personal access token |
| **Query Timeout** | Optional. Maximum query duration in seconds; blank means no timeout |
| **Connection Timeout** | Optional. Connection timeout in seconds; blank uses the driver's 10-second default |
| **Client Thread Pool Size** | Optional. Number of parallel Flight endpoint workers; blank uses the driver default of `1` |
| **Disable Certificate Verification** | Leave off unless the IOMETE endpoint uses a certificate Tableau does not trust |

TLS encryption is always enabled. **Disable Certificate Verification** skips validation of the IOMETE server's TLS certificate, but it does not disable encryption or bypass `.taco` signature verification.

<Img src="/img/integrations/tableau/connection-dialog.png" alt="IOMETE (Arrow Flight SQL) connection dialog with server, port, compute cluster, namespace, username, and access token filled in" />

4. Confirm that the compute cluster is running, then select **Sign In**.
5. Select a catalog and schema, then drag tables onto the canvas to start building a data source.

<Img src="/img/integrations/tableau/data-source.png" alt="Tableau data source page showing the IOMETE catalog, schema, and a table dragged onto the canvas" />

With the connection in place, continue to [Building a Dashboard](./overview.md#building-a-dashboard).

## Testing With Signature Verification Disabled

If you cannot edit Tableau's truststore in a test environment, you can temporarily disable connector signature verification.

:::warning Testing only
Disabling signature verification allows Tableau to load any unsigned or untrusted connector. Do not use this setting as a permanent alternative to trusting `iomete-taco.cer`.
:::

On macOS, adjust the Tableau application name and version first:

```bash
TABLEAU_APP="/Applications/Tableau Desktop (Apple silicon) 2026.2.app"
"$TABLEAU_APP/Contents/MacOS/Tableau" \
  -DDisableVerifyConnectorPluginSignature=true
```

On Windows, run:

```powershell
& 'C:\Program Files\Tableau\Tableau <version>\bin\tableau.exe' `
  '-DDisableVerifyConnectorPluginSignature=true'
```

On Tableau Server, disable verification through TSM and apply the pending change:

```bash
tsm configuration set -k native_api.disable_verify_connector_plugin_signature -v true --force-keys
tsm pending-changes apply
```

The Desktop flags last only for that launch, but the TSM setting survives restarts. Re-enable verification as soon as the test finishes:

```bash
tsm configuration set -k native_api.disable_verify_connector_plugin_signature -v false --force-keys
tsm pending-changes apply
```

## Troubleshooting

### The Connector Does Not Appear

Confirm that the `.taco` file is in the correct connector directory and restart Tableau. If the connector still does not appear, import `iomete-taco.cer` into Tableau's JRE truststore or use the testing-only signature verification bypass.

### Tableau Cannot Find the Driver

Confirm that the latest `flight-sql-jdbc-driver-<upstream>-iomete.<release>.jar` file is in the driver directory for the computer or Tableau Server node running the connection. On Tableau Server, check every node.

### The Connection Fails

Confirm that:

- The compute cluster is running.
- The server, port, compute cluster, and namespace match your IOMETE deployment.
- The username and access token are valid.
- The IOMETE endpoint's TLS certificate is trusted. Use **Disable Certificate Verification** only to diagnose a certificate validation problem.
