---
title: Getting started with DBT
description: Getting started with IOMETE & DBT. In this post, we will discuss using `DBT` and using it on the IOMETE data platform to bootstrap your `DBT` journey.
last_update:
  date: 07/11/2022
  author: Vusal Dadalov
---

import Img from '@site/src/components/Img';

# Getting started with DBT

In this post, we will discuss using `DBT` and using it on the IOMETE data platform to bootstrap your `DBT` journey.

## IOMETE & DBT

dbt Core is an open-source tool that enables data teams to transform data using analytics engineering best practices. Read more [here](https://docs.getdbt.com/docs/introduction) about dbt.

**[dbt-iomete](https://docs.getdbt.com/reference/warehouse-setups/iomete-setup)** adapter enable our customers to leverage DBT as their transformation layer. IOMETE Lakehouse is built on two powerful engines, Apache Iceberg and Apache Spark. dbt-iomete adapter bring full support for the Iceberg Tables.

![dbt on the iomete data platform](https://uploads-ssl.webflow.com/62e59e059afb7e3948870885/62e80b69e03720a02a0b5719_dbt-in-iomete-platform.png)

## Prepare Data

:::important
To use DBT on the IOMETE platform, one needs a running lakehouse cluster. See this [doc](/docs/user-guide/virtual-lakehouses) for more details on getting a lakehouse running
:::

Suppose we have two tables, and we’ll use these tables to generate a new table or view using DBT. Let's prepare the two tables to be used by the DBT project.

:::tip
For the sake of demo, we’ll use the IOMETE’s external tables capability, which is the quickest way of bringing some tables to the platform without dealing data movement. You can read our docs and [guide](/docs/guides/sync-data-from-jdbc-sources) about how to work with external tables.
:::

:::important
You can create external tables on flat files (CSV, JSON, ORC, Parquet, etc), as well as from JDBC sources. In this guide will use the JDBC external table
:::

Go to SQL editor in the [iomete app](https://app.iomete.com/editor) and create a new database and two external tables:

```sql
CREATE DATABASE IF NOT EXISTS dbt_database;

CREATE TABLE IF NOT EXISTS dbt_database.employees
    USING org.apache.spark.sql.jdbc
    OPTIONS (
                url "jdbc:mysql://iomete-tutorial.cetmtjnompsh.eu-central-1.rds.amazonaws.com:3306/employees",
                dbtable "employees.employees",
                driver 'com.mysql.cj.jdbc.Driver',
                user 'tutorial_user',
                password '9tVDVEKp'
);

CREATE TABLE IF NOT EXISTS dbt_database.salaries
    USING org.apache.spark.sql.jdbc
    OPTIONS (
                url "jdbc:mysql://iomete-tutorial.cetmtjnompsh.eu-central-1.rds.amazonaws.com:3306/employees",
                dbtable "employees.salaries",
                driver 'com.mysql.cj.jdbc.Driver',
                user 'tutorial_user',
                password '9tVDVEKp'
);
```

:::important
This tables will be used later by dbt project
:::

Check data from the SQL editor:

<Img src="/img/guides/dbt/dbt_data_preparation_sql_editor.png" 
  alt="IOMETE SQL Editor - Create initial datasets for dbt guide" 
  caption="IOMETE SQL Editor - Create initial datasets for dbt guide"/>

Our initial datasets are ready to be used in DBT models. Continue the guide to build your first dbt project

## Build your first project

A project is needed to run our DBT activities. We can easily create our new project by following the commands below.

### Install `db-iomete`

```bash
# Create a dbt-samples directory
mkdir dbt-samples
cd dbt-samples

# Install dbt-iomete in a virtual python environment
virtualenv .env
source .env/bin/activate
pip install --upgrade dbt-iomete
```

### Bootstrap the dbt project

:::important
You can find DBT connection parameters from the **lakehouse page**

<Img src="/img/guides/dbt/dbt_connection_details_tab.jpg" 
  alt="Choose your lakehouse instance from the list and go to DBT tab for the connection details"/>

Choose your lakehouse instance from the list and go to DBT tab for the connection details
:::

:::important
Use `dbt_database` as your schema which we setup earlier.
:::

Run the following command to bootstrap the new dbt project

```bash
# dbt init <your-project-name>
dbt init dbt_project

# and, follow the interactive form to provide the inputs
```

Output should look something like below:

<Img src="/img/guides/dbt/dbt_init_output.png"
  alt="dbt-iomete init command output"
  caption="dbt init command output"/>

:::tip
The `dbt` configuration details are stored in `~/.dbt/profiles.yml` file

```bash
cat ~/.dbt/profiles.yml

# you'll get something like below:
dbt_project:
  outputs:
    dev:
      type: iomete
      host: 4.236.193.224
      port: 80
      https: false
      lakehouse: dbt
      schema: dbt_database
      user: admin
      token: "{{ env_var('DBT_IOMETE_TOKEN') }}"    # use env variables for sensitive information
      threads: 1
      connect_retries: 0
      connect_timeout: 120
  target: dev
```

:::

### Test connection

Run the debug command from your project to confirm that you can successfully connect:

```bash

# Navigate into your project's directory
cd dbt_project

# Run the dbt debug
dbt debug
```

<Img src="/img/guides/dbt/dbt_debug_output.png"
  alt="A successful dbt debug command"
  caption="A successful dbt debug command"/>

## Build your first models

A model is a **select statement**. Models are defined in `.sql` files in your models directory. Each `.sql` file contains one model/select statement. The name of the file is used as the model name.

:::info Remember
We have built two tables employees and salaries on the data preparation section.

Let's create a transformation on top of these tables, which is going to be `join` of these tables.
:::

### Add a new model

Open your project in your favorite code editor and add the following file in the models directory:

```sql title="dbt_project/models/employee_salaries.sql"
SELECT e.emp_no,
       e.first_name,
       e.last_name,
       s.salary
FROM dbt_database.employees e
         JOIN dbt_database.salaries s ON e.emp_no = s.emp_no
```

:::tip
Default materialization is `view` and the above model going to create an `employee_salaries` **view**.
:::

### Run dbt transformation

Run the below command from the project's home directory:

```bash
dbt run
```

<Img src="/img/guides/dbt/dbt_run_output.png"
alt="Successful dbt run command output"
caption="Successful dbt run command output"/>

See the changes on IOMETE.

<Img src="/img/guides/dbt/dbt_transformation_result_as_view.png"
alt="employee_salaries view"
caption="employee_salaries view"/>

### Change materialization type to table

If you want to create a `table` instead of `view`, you can change the `materialization` type to `table`. IOMETE supports table, view and incremental materialization, see [dbt-iomete materializations](./dbt-materializations) to learn more**.**

Quickly change materialization to the `table` and check the result

```sql title="dbt_project/models/employee_salaries.sql"
{{ config(materialized='table') }}

SELECT e.emp_no,
       e.first_name,
       e.last_name,
       s.salary
FROM dbt_database.employees e
         JOIN dbt_database.salaries s ON e.emp_no = s.emp_no
```

Let's run it again:

```bash
dbt run
```

This time dbt created an iceberg table as a result of transformation:

<Img src="/img/guides/dbt/dbt_transformation_result_as_iceberg_table.png"
  alt="employee_salaries iceberg table"
  caption="employee_salaries iceberg table"/>

## Conclusion

We covered a quick intro to DBT, and worked through setting up our environment to get DBT connected to the IOMETE lakehouse.

If you have any questions or feedback related to DBT on the IOMETE lakehouse platform, please reach out to us via our intercom chat.
