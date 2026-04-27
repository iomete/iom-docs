---
title: Getting started with DBT
description: Getting started with IOMETE & DBT. In this post, we will discuss using `DBT` and using it on the IOMETE data platform to bootstrap your `DBT` journey.
last_update:
  date: 04/27/2026
  author: Shashank Chaudhary
---

import Img from '@site/src/components/Img';

# Getting started with DBT

In this post, we will discuss using `DBT` and using it on the IOMETE data platform to bootstrap your `DBT` journey.

## IOMETE & DBT

dbt Core is an open-source tool that enables data teams to transform data using analytics engineering best practices. Read more [here](https://docs.getdbt.com/docs/introduction) about dbt.

**[dbt-iomete](https://pypi.org/project/dbt-iomete/)** adapter enable our customers to leverage DBT as their transformation layer. IOMETE Lakehouse is built on two powerful engines, Apache Iceberg and Apache Spark. dbt-iomete adapter bring full support for the Iceberg Tables.

![dbt on the iomete data platform](https://uploads-ssl.webflow.com/62e59e059afb7e3948870885/62e80b69e03720a02a0b5719_dbt-in-iomete-platform.png)

## Prepare Data

:::important
To use DBT on the IOMETE platform, you need a running lakehouse. See this [doc](/user-guide/compute-clusters/overview) for more details.
:::

We’ll create two Iceberg tables with sample data in the SQL editor and use them as the source for our DBT project.

Go to the SQL editor and run:

```sql
CREATE DATABASE IF NOT EXISTS iomete_analytics.dbt_database;

CREATE TABLE iomete_analytics.dbt_database.employees (
    emp_no INT,
    first_name STRING,
    last_name STRING
) USING iceberg;

CREATE TABLE iomete_analytics.dbt_database.salaries (
    emp_no INT,
    salary INT
) USING iceberg;

-- Add as many rows as needed
INSERT INTO iomete_analytics.dbt_database.employees VALUES
(1, ‘John’, ‘Doe’),
(2, ‘Jane’, ‘Smith’);

-- Add as many rows as needed
INSERT INTO iomete_analytics.dbt_database.salaries VALUES
(1, 50000),
(2, 60000);
```

<Img src="/img/integrations/dbt/getting-started-base-table-creation.png" alt="IOMETE SQL Editor - Create initial datasets for dbt guide" caption="IOMETE SQL Editor - Create initial datasets for dbt guide"/>

Our source tables are ready. Continue the guide to build your first dbt project.

## Build your first project

A project is needed to run our DBT activities. We can easily create our new project by following the commands below.

### Install `dbt-iomete`

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
You can find DBT connection parameters from the **compute page**

<Img src="/img/integrations/dbt/getting-started-compute-list.png" 
  alt="Choose your compute instance from the list and go to DBT tab for the connection details"/>

<Img src="/img/integrations/dbt/getting-started-compute-connect.png"
alt="Choose your compute instance from the list and go to DBT tab for the connection details"/>

Choose your compute instance from the list and go to DBT tab for the connection details
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

```text
→ dbt init dbt_project

08:27:06 Running with dbt=1.7.19
08:27:06
Your new dbt project "dbt_project" was created!

For more information on how to configure the profiles.yml file,
please consult the dbt documentation here:

  https://docs.getdbt.com/docs/configure-your-profile

One more thing:

Need help? Don't hesitate to reach out to us via GitHub issues or on Slack:

  https://community.getdbt.com/

Happy modeling!

08:27:06 Setting up your profile.
Which database would you like to use?
[1] iomete

(Don't see the one you want? https://docs.getdbt.com/docs/available-adapters)

Enter a number: 1
host (Data plane host.): dev.iomete.cloud
port (Data plane port. e.g., 443) [443]: 443
https (Connection is https. Set to false for http.) [True]: True
dataplane (dataplane name that dbt will connect): spark-resources-1
domain (domain name that dbt will connect): workflow-governance
lakehouse (lakehouse name that dbt will connect): demo-spark-compute
catalog (default catalog that dbt will build objects in): iomete_analytics
schema (default schema/database that dbt will build objects in): dbt_database
user (username): shashank
token (personal access token):
connect_timeout (connection timeout in seconds) [120]: 
connect retries [0]:
threads (1 or more) [1]:
```

:::tip
The `dbt` configuration details are stored in `~/.dbt/profiles.yml` file

```yaml
# ~/.dbt/profiles.yml
dbt_project:
  target: dev
  outputs:
    dev:
      type: iomete
      host: dev.iomete.cloud
      port: 443
      https: true
      dataplane: spark-resources-1
      domain: workflow-governance
      lakehouse: demo-spark-compute
      catalog: iomete_analytics
      schema: dbt_database
      user: "{{ env_var('DBT_IOMETE_USER_NAME') }}"
      token: "{{ env_var('DBT_IOMETE_TOKEN') }}"
      threads: 1
      connect_timeout: 120
      connect_retries: 0
```
Use environment variables for sensitive values — never hardcode credentials.
:::

### Test connection

Run the debug command from your project to confirm that you can successfully connect:

```bash

# Navigate into your project's directory
cd dbt_project

# Run the dbt debug
dbt debug
```

Output should look something like below:

```text
➜ dbt debug
09:01:43  Running with dbt=1.7.19
09:01:43  dbt version: 1.7.19
09:01:43  python version: 3.12.3
09:01:43  python path: /Users/shashankchaudhary/.pyenv/versions/3.12.3/bin/python3.12
09:01:43  os info: macOS-26.4.1-arm64-arm-64bit
09:01:44  Using profiles dir at /Users/shashankchaudhary/.dbt
09:01:44  Using profiles.yml file at /Users/shashankchaudhary/.dbt/profiles.yml
09:01:44  Using dbt_project.yml file at /Users/shashankchaudhary/projects/dbt/dbt-samples/dbt_project/dbt_project.yml
09:01:44  adapter type: iomete
09:01:44  adapter version: 1.7.9
09:01:44  Configuration:
09:01:44    profiles.yml file [OK found and valid]
09:01:44    dbt_project.yml file [OK found and valid]
09:01:44  Required dependencies:
09:01:44   - git [OK found]

09:01:44  Connection:
09:01:44    host: dev.iomete.cloud
09:01:44    port: 443
09:01:44    dataplane: spark-resources-1
09:01:44    lakehouse: demo-spark-compute
09:01:44    database: iomete_analytics
09:01:44    schema: dbt_database
09:01:44  Registered adapter: iomete=1.7.9
09:01:48    Connection test: [OK connection ok]

09:01:48  All checks passed!
```

## Build your first models

A model is a **SELECT statement**. Models are defined in `.sql` files in your models directory. Each `.sql` file contains one model/select statement. The name of the file is used as the model name.

:::info Remember
We have built two tables employees and salaries on the data preparation section.

Let's create a transformation on top of these tables, which is going to be `join` of these tables.
:::

### Add a new model

Open your project in your favorite code editor and add the following file in the models directory:

```sql title="dbt_project/models/example/employee_salaries.sql"
SELECT e.emp_no,
       e.first_name,
       e.last_name,
       s.salary
FROM dbt_database.employees e
       JOIN dbt_database.salaries s
            ON e.emp_no = s.emp_no;
```

:::tip
Default materialization is `view` and the above model going to create an `employee_salaries` **view**.
:::

### Run dbt transformation

Run the below command from the project's home directory:

```bash
dbt run
```

Output should look something like below:

```text
➜ dbt run
09:45:58  Running with dbt=1.7.19
09:45:59  Registered adapter: iomete=1.7.9
09:45:59  Found 1 model, 0 sources, 0 exposures, 0 metrics, 397 macros, 0 groups, 0 semantic models
09:45:59  
09:46:08  Concurrency: 1 threads (target='dev')
09:46:08  
09:46:08  1 of 1 START sql view model dbt_database.employee_salaries ..................... [RUN]
09:46:12  1 of 1 OK created sql view model dbt_database.employee_salaries ................ [OK in 3.90s]
09:46:14  
09:46:14  Finished running 1 view model in 0 hours 0 minutes and 15.48 seconds (15.48s).
09:46:14  
09:46:14  Completed successfully
09:46:14  
09:46:14  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
```

See the changes on IOMETE sql editor.

<Img src="/img/integrations/dbt/getting-started-view-created.png" alt="employee_salaries view" caption="employee_salaries view"/>

### Change materialization type to table

If you want to create a `table` instead of `view`, you can change the `materialization` type to `table`. IOMETE supports table, view and incremental materialization, see [dbt-iomete materializations](./dbt-materializations) to learn more**.**

Quickly change materialization to the `table` and check the result

```sql title="dbt_project/models/example/employee_salaries.sql"
{{ config(materialized='table') }}

SELECT e.emp_no,
       e.first_name,
       e.last_name,
       s.salary
FROM dbt_database.employees e
       JOIN dbt_database.salaries s
            ON e.emp_no = s.emp_no;
```

Let's run it again:

```bash
dbt run
```

This time dbt created an iceberg table as a result of transformation:

<Img src="/img/integrations/dbt/getting-started-table-created.png" alt="employee_salaries iceberg table" caption="employee_salaries iceberg table"/>

## Conclusion

We covered a quick intro to DBT, and worked through setting up our environment to get DBT connected to the IOMETE lakehouse.
