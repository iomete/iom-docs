---
title: Redash - Connecting to IOMETE
sidebar_label: Redash
description: Discover the seamless integration of IOMETE with Redash, a powerful Business Intelligence (BI) platform.
---

import Img from '@site/src/components/Img';
import FlexButton from "@site/src/components/FlexButton";
import { Plus, Play } from "@phosphor-icons/react";

# Redash - Connecting to IOMETE

Discover the seamless integration of <b>IOMETE</b> with Redash, a powerful Business Intelligence (BI) platform.

## What is Redash?

Redash is also a Business Intelligence (BI) tool, but it focuses on data visualization and collaboration. It is an open-source platform that allows users to connect to various data sources, visualize data, and share insights with others. Redash is designed to be easy to use, even for non-technical users.

## Add IOMETE as the data source

Now, establish a connection between the <b>IOMETE</b> Lakehouse and Redash.

The initial step involves connecting a <b>data source</b>. Navigate to the Data Sources management page by clicking the Settings icon and <FlexButton label='New Data Source' primary><Plus size={16} /></FlexButton> button:

<Img src="/img/guides/redash/new-data-source.png" alt="IOMETE data source"  />

Once you've clicked on the <FlexButton label='New Data Source' primary><Plus size={16} /></FlexButton>, proceed by selecting the desired data source from the available list.

<Img src="/img/guides/redash/choose-data-source.png" alt="IOMETE data source choose" maxWidth="500px"/>

In the configuration window, complete all the necessary fields by providing the required information.

<Img src="/img/guides/redash/configuration.png" alt="IOMETE data source configuration" maxWidth="500px"/>

Extract all connection properties from the connection string, referencing the "lakehouse" details sheet in IOMETE (refer to the sample picture below):

| Property           | Value                        |
| ------------------ | ---------------------------- |
| Host               | \{domain or IP address}      |
| Port               | \{server port}               |
| HTTP Path          | /lakehouse/\{lakehouse_name} |
| Username (User ID) | \{your user name}            |
| Password           | \{personal access token}     |
| Database           | \{database name}             |
| HTTP Scheme        | http/https                   |

<Img src="/img/guides/redash/iomete-redash-connection.png" alt="IOMETE data source connection" />

After filling out all the fields in the configuration, proceed to test the connection by clicking the <FlexButton label='Test Connection' ></FlexButton> button to ensure that the connection is successful.

<Img src="/img/guides/redash/test-connection.png" alt="IOMETE data source test connection" maxWidth="500px"/>

Once the platform is successfully connected, navigate to the Query section in the navbar menu. Select the data source from the top-left side, and in the editor, write your query. Simply hit the <FlexButton label='Execute' primary><Play size={12} weight="fill" /></FlexButton> button.

Tadaa🎉🎉🎉, view your results.
<Img src="/img/guides/redash/result.png" alt="IOMETE data source results"/>
