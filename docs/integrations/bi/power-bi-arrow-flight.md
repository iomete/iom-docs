---
title: Power BI Arrow Flight - IOMETE ODBC Connector
sidebar_label: Power BI Arrow Flight
description: Effortlessly integrate IOMETE with Power BI using ODBC Driver - Step-by-step guide to connect, visualize and analyze data. Create reports and visualizations with Power BI resources.
---

import Img from '@site/src/components/Img';

# Power BI Arrow Flight - IOMETE ODBC Connector

This guide provides step-by-step instructions on how to download, install, and configure the IOMETE ODBC driver using the Arrow Flight protocol for Power BI.  

#### Prerequisites  

Before proceeding with the installation, ensure that you have the following:  
- Administrator privileges on your Windows machine.  
- Power BI Desktop installed.  
- Access to the IOMETE GitHub repository to download the connector bundle.  
- A valid IOMETE user account with an access token.  

---

## Step 1: Download the IOMETE Connector Bundle
1. Navigate to the official IOMETE GitHub repository: [iomete/iomete-artifacts](https://github.com/iomete/iomete-artifacts).
2. Download the latest release of the connector bundle: **`iomete-odbc-connector.zip`**.
3. Extract the downloaded ZIP file.

After extracting, you will find the following files:
- `IOMETEConnector.mez`
- `arrow-odbc-iomete.zip`

---

## Step 2: Install the Arrow ODBC Driver
1. Extract **`arrow-odbc-iomete.zip`** to the following location:
   ```
   C:\Program Files\IOMETE Connector
   ```
3. Run as Administrator file the following file `register-arrow-odbc-iomete` in the extracted folder:
   ```
   C:\Program Files\IOMETE Connector\arrow-odbc-iomete
   ```
   This step ensures that the Arrow ODBC driver is properly registered on your system.

    <Img src="/img/integrations/powerbi/register.png" alt="Power BI ODBC Register"/>

---

## Step 3: Install the Power BI Custom Connector
1. Copy **`IOMETEConnector.mez`** to the following directory:
   ```
   C:\Users\<YourUser>\Documents\Power BI Desktop\Custom Connectors
   ```
   (Replace `<YourUser>` with your actual Windows username.)
2. If you are using SSL certificates, place the certificate file (`custom.cert` or `.pem`) in the same folder as the `.mez` file:
   ```
   C:\Users\<YourUser>\Documents\Power BI Desktop\Custom Connectors
   ```
    <Img src="/img/integrations/powerbi/mez.png" alt="Power BI .mez Location"/>

---

## Step 4: Connect to IOMETE Data Source
1. Open Power BI Desktop.
2. Click **Get Data** → **More...**.
3. Search for **IOMETE Arrow Flight Connector** and select it.
4. Click **Connect**.

<Img src="/img/integrations/powerbi/connector.png" alt="Power BI connector"/>

---

## Step 5: Configure Connection Settings
In the connection dialog, provide the following details:

- **Server URL**: Example: `dev.iomete.com:443`
- **Compute Cluster Name**: Example: `medium-cluster`
- **Data Plane (Kubernetes namespace where compute is deployed)**: Example: `spark-resources`
- **Certificate Path**: Path to the SSL certificate if used (same directory as `.mez` file)
- **Data Connectivity Mode**: Choose **Direct Query** for real-time data access

<Img src="/img/integrations/powerbi/details.png" alt="Power BI details"/>

---

## Step 6: Authenticate
1. Enter your **IOMETE username** and **access token**.
2. Click **Sign In**.

---

## Step 7: Start Building Dashboards
Once connected successfully, you can start creating dashboards using IOMETE data. Use Power BI's features to visualize and analyze your data in real-time.

---

## Troubleshooting
### Issue: Power BI does not recognize the connector
1. Open Power BI Desktop.
2. Navigate to **File** → **Options and Settings** → **Options**.
3. Under **Security**, locate **Data Extensions**.
4. Select **(Not Recommended) Allow any extension to load without validation or warning**.
5. Click **OK** and restart Power BI Desktop.

---

## Conclusion
You have now successfully installed and configured the IOMETE ODBC driver and connected it to Power BI. You can begin creating insightful dashboards with your data. If you encounter any issues, please reach out to the IOMETE support team or refer to the troubleshooting section above.

Happy Data Analytics with IOMETE!

