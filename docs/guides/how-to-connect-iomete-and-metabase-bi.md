---
title: Metabase Connection
description: How to connect iomete and Metabase BI. This guide explains how to effortlessly integrate iomete with one of the most popular BI tools Metabase
last_update:
  date: 10/31/2022
  author: Fuad Musayev
---

![iomete metabase](/img/guides/metabase-bi/iomete-metabase.png)

Hi! In this guide, we will explain how to effortlessly integrate **iomete** with one of the most popular BI tools: **Metabase**.

## What is Metabase?

As data engineers or analysts, we can understand SQL language. But other departments and teams are not. Metabase is an open-source Business Intelligence interface that allows querying no SQL required. With Metabase interactive dashboards and automated reports are available for teams. Advanced embedding capabilities make it simple to share your data in presentations, publications, and even products.

### How to run Metabase Locally

We first provide basic instructions on how to set up and run Metabase locally. You can skip this step if you wish to run a Metabase instance in a production or development environment.

Let’s run [Metabase on Docker](https://www.metabase.com/docs/latest/installation-and-operation/running-metabase-on-docker).

Run this commands in your terminal:

```bash
docker pull metabase/metabase:latest

docker run -d -p 3000:3000 --name metabase metabase/metabase

# Optionally to view logs (for debug purposes)
docker logs -f metabase
```

Now you should be able to access [http://localhost:3000](http://localhost:3000) 

Read more in [Metabase documentation](https://www.metabase.com/docs/latest/installation-and-operation/installing-metabase)

Now let’s go to the main part of this guide👇🏻

### Add iomete as the data source

The next step is to connect the iomete lakehouse to Metabase.

You can also do this during the Metabase setup process or later from the **Admin Settings** menu.

Select **Spark SQL** as your database:

![Choose datasource](/img/guides/metabase-bi/choose-datasource.png)

For connection details go to the [iomete app](https://app.iomete.com), select the lakehouse you want to connect to, and in the **Connection details,** you will find all the required information.

![Connection details](/img/guides/bi-connections/connection-details.png)

Some properties can be extracted from the connection string, as in the example below:

| Property | Value and Description |
| --- | --- |
| Display Name | iomete-tpcds-db <br /> _note_: Could be anything, like iomete-{db-name} |
| Host | us-east-1.iomete.com <br /> _note_: extracted from the connection string |
| Port | 443 <br /> _note_: iomete exposes connection to HTTPS 443 port |
| Database Name | tpcds_db_10gb <br /> _note_: in our example, we connect to tpcds database |
| Username / Password | Here goes your iomete account credentials |
| Additional JDBC options | ;transportMode=http;ssl=true;httpPath=lakehouse/000000000000/demo <br /><br /> _note_: Just copy this line from the end of the connection string with your account number and lakehouse name |

![How to connect Metabase](/img/guides/metabase-bi/connecting-metabase-and-iomete.png)

After connecting the iomete database to Metabase, it will require a couple of minutes to sync all the metadata from iomete. You will be able to track progress in the bottom right corner:

![Metabase connection syncing](/img/guides/metabase-bi/metabase-connection-syncing.png)

After the synchronization process is completed you will be able to see your tables in the Metabase database explorer:

![Metabase explorer](/img/guides/metabase-bi/metabase-explorer.png)

The last step is to create a dashboard. In the example we created a simple bar graph - which probably is useless - but good enough for tutorial purposes 😄:

![Metabase dashboard](/img/guides/metabase-bi/metabase-dashboard.png)

As we told you, it is effortless. Reach out to us if you have any questions.