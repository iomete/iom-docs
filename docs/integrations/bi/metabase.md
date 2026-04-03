---
title: Metabase
sidebar_label: Metabase
description: Connect Metabase to IOMETE to build dashboards and explore your data without writing SQL.
last_update:
  date: 04/03/2026
  author: Vugar Dadalov
---

import Img from '@site/src/components/Img';

# Connecting Metabase to IOMETE

[Metabase](https://www.metabase.com/) is an open-source business intelligence tool that lets teams build dashboards and explore data without writing SQL. It also supports SQL queries for advanced users.

This guide walks you through connecting Metabase to your IOMETE [compute cluster](/user-guide/compute-clusters/overview).

## Running Metabase Locally

Skip this section if you already have a Metabase instance running.

You can run Metabase locally using [Docker](https://www.metabase.com/docs/latest/installation-and-operation/running-metabase-on-docker):

```bash
docker pull metabase/metabase:latest

docker run -d -p 3000:3000 --name metabase metabase/metabase
```

Metabase will be available at `http://localhost:3000`. See the [Metabase installation docs](https://www.metabase.com/docs/latest/installation-and-operation/installing-metabase) for other deployment options.

## Adding IOMETE as a Data Source

You can add IOMETE during the initial Metabase setup or later from **Admin Settings**.

1. Select **Spark SQL** as your database type.

<Img src="/img/guides/metabase-bi/choose-datasource.png" alt="Selecting Spark SQL as database type in Metabase" borderless maxWidth="500px" />

2. Fill in the connection fields using values from the [compute cluster](/user-guide/compute-clusters/managing-clusters#connections-tab) details page in the IOMETE console.

<Img src="/img/guides/metabase-bi/connection-details.png" alt="IOMETE compute cluster connection details" />

| Property                | Value                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| Host                    | \{domain or IP address}                                                                           |
| Port                    | \{server port}                                                                                    |
| Database                | \{database name}                                                                                  |
| Username (User ID)      | \{your user name}                                                                                 |
| Password                | \{[personal access token](/user-guide/create-a-personal-access-token)}                            |
| Additional JDBC options | `;transportMode=http;ssl=true;httpPath=data-plane/{namespace}/lakehouse/{compute_cluster_name}` |

<Img src="/img/guides/metabase-bi/connecting-metabase-and-iomete-2.png" alt="Metabase connection form filled with IOMETE details" maxWidth="500px" />

3. After connecting, Metabase syncs metadata from IOMETE. You can track progress in the bottom-right corner.

<Img src="/img/guides/metabase-bi/metabase-connection-syncing.png" alt="Metabase syncing metadata from IOMETE" />

## Exploring Data and Building Dashboards

Once the sync completes, your tables appear in the Metabase database explorer.

<Img src="/img/guides/metabase-bi/metabase-explorer.png" alt="IOMETE tables in the Metabase database explorer" />

From here you can create dashboards and visualizations.

<Img src="/img/guides/metabase-bi/metabase-dashboard.png" alt="Example Metabase dashboard with IOMETE data" />
