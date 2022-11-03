---
title: Apache Superset Connection
description: How to connect iomete and Apache Superset. This guide explains how to effortlessly integrate iomete with one of the most popular BI tools Apache Superset
last_update:
  date: 10/31/2022
  author: Vusal Dadalov
---
![iomete superset](/img/guides/apache-superset-iomete/iomete-superset.png)

Hi! In this guide, we will explain how to effortlessly integrate **iomete** with one of the most popular BI tools: [Apache Superset](https://superset.apache.org/).

## Apache Superset

Apache Superset is a modern data exploration and visualization platform. Superset is fast, lightweight, intuitive, and loaded with options that make it easy for users of all skill sets to explore and visualize their data, from simple line charts to highly detailed geospatial charts.

## Adding iomete database drivers in docker

Superset requires a Python database driver to be installed for each additional type of database you want to connect to. When setting up Superset locally via `docker-compose`, the drivers and packages contained in `requirements.txt` and `requirements-dev.txt` will be installed automatically.

In this section, we'll walk through how to install the connector library for iomete lakehouse.

### Install driver for iomete

As we are currently running inside a Docker container via `docker-compose`, we cannot simply run `pip install py-hive-iomete` on our local shell and expect the drivers to be installed within the Docker containers for superset.

In order to address this, the Superset `docker-compose` setup comes with a mechanism for you to install packages locally, which will be ignored by Git for the purposes of local development. Please follow these steps:

Create `requirements-local.txt`

```bash
# From the repo root...
touch ./docker/requirements-local.txt
```

Add the driver selected in the step above:

```bash
echo "py-hive-iomete" >> ./docker/requirements-local.txt
```

Rebuild your local image with the new driver baked in:

```bash
docker-compose build --force-rm
```

After the rebuild of the Docker images is complete (which make take a few minutes), you can relaunch using the following command:

```bash
docker-compose up
```

The other option is to start Superset via Docker Compose using the recipe in `docker-compose-non-dev.yml`, which will use pre-built frontend assets and skip the building of front-end assets:

```bash
docker-compose -f docker-compose-non-dev.yml pull
docker-compose -f docker-compose-non-dev.yml up
```

## Connect to iomete

Now that you've got a `py-hive-iomete` driver installed locally, you should be able to test it out.

We can now create a Datasource in Superset that can be used to connect the iomete lakehouse. Assuming your Lakehouse cluster is running and can be accessed.

### Get connection details from iomete

For connection details, go to the [iomete app](https://app.iomete.com/), select the lakehouse you want to connect to, and in the **Connection details,** you will find all the required information.

![iomete lakehouse connection details](/img/guides/bi-connections/connection-details.png)

Some properties can be extracted from the connection string, as in the example below:

- Host: `us-east-1.iomete.com`
- Account number: `00000000000`
- Lakehouse name: `demo`

### Add a connection to Superset

Use the following connection string in “SQL Alchemy URI”, by going to Sources > Databases > + icon (to add a new datasource) in Superset.

```
# Connection template
hive://{user}:{password}@{host}/{db}?account_number={account_number}&lakehouse={lakehouse_name}

# example connection string with above values:
hive://user1:user_pass@us-east-1.iomete.com/default?account_number=00000000000&lakehouse=demo
```

![superset add connection form](/img/guides/apache-superset-iomete/superset_iomete_connection.jpg)

Then click “Test Connection”, which should give you an `OK` message. If not, please look at your terminal for error messages, and reach out for help.

## Create a sample chart

### Add dataset

Once connected to iomete, we can add datasets from iomete to Superset and create charts.

![Superset add dataset from iomete lakehouse](/img/guides/apache-superset-iomete/add-dataset.png)

### Create chart

Click on the added dataset to create a sample chart

![Superset sample chart](/img/guides/apache-superset-iomete/sample-chart.png)

That’s all! Repeat the same process to add other datasets and enjoy the rich set of chart libraries of Superset.