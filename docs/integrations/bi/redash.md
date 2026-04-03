---
title: Redash
sidebar_label: Redash
description: Connect Redash to IOMETE to query your data and build visualizations.
last_update:
  date: 04/03/2026
  author: Vugar Dadalov
---

import Img from '@site/src/components/Img';
import FlexButton from "@site/src/components/FlexButton";
import { Plus, Play } from "@phosphor-icons/react";

# Connecting Redash to IOMETE

[Redash](https://redash.io/) is an open-source business intelligence platform for data visualization and collaboration. It connects to various data sources, lets you write queries, and share dashboards with your team.

This guide walks you through connecting Redash to your IOMETE [compute cluster](/user-guide/compute-clusters/overview).

## Adding IOMETE as a Data Source

1. Click the **Settings** icon, then click <FlexButton label='New Data Source' primary><Plus size={16} /></FlexButton>.

<Img src="/img/guides/redash/new-data-source.png" alt="Redash data sources page with New Data Source button" />

2. Select **Apache Spark SQL** (or **Databricks**) from the list of available data sources.

<Img src="/img/guides/redash/choose-data-source.png" alt="Choosing a data source type in Redash" maxWidth="500px" />

3. Fill in the connection fields using the values from your IOMETE compute cluster connection details.

<Img src="/img/guides/redash/configuration.png" alt="Redash data source configuration form" maxWidth="500px" />

| Property           | Value                                                                  |
| ------------------ | ---------------------------------------------------------------------- |
| Host               | \{domain or IP address}                                                |
| Port               | \{server port}                                                         |
| HTTP Path          | /data-plane/\{namespace}/lakehouse/\{compute_cluster_name}                                     |
| Username (User ID) | \{your user name}                                                      |
| Password           | \{[personal access token](/user-guide/create-a-personal-access-token)} |
| Database           | \{database name}                                                       |
| HTTP Scheme        | http/https                                                             |

You can find these values on the [compute cluster](/user-guide/compute-clusters/managing-clusters#connections-tab) details page in the IOMETE console:

<Img src="/img/guides/redash/iomete-redash-connection.png" alt="IOMETE compute cluster connection details" />

4. Click <FlexButton label='Test Connection'></FlexButton> to verify the connection.

<Img src="/img/guides/redash/test-connection.png" alt="Successful connection test in Redash" maxWidth="500px" />

## Running Your First Query

Once connected, navigate to **Queries** in the navbar. Select your IOMETE data source from the dropdown, write a query in the editor, and click <FlexButton label='Execute' primary><Play size={12} weight="fill" /></FlexButton>.

<Img src="/img/guides/redash/result.png" alt="Query results displayed in Redash" />
