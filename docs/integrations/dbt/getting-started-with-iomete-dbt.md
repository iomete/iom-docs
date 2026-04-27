---
title: Getting started with DBT
sidebar_label: Getting Started
description: Learn how to set up the dbt-iomete adapter, connect to your IOMETE lakehouse, and run your first dbt transformation.
last_update:
  date: 04/27/2026
  author: Shashank Chaudhary
---

import Img from '@site/src/components/Img';

# Getting Started with DBT

[dbt](https://docs.getdbt.com/docs/introduction) is an open-source transformation tool that lets data teams write SQL models, test them, and deploy them using software engineering practices. The **[dbt-iomete](https://pypi.org/project/dbt-iomete/)** adapter connects dbt to your IOMETE lakehouse, with full support for Iceberg tables.

This guide walks you through setting up dbt-iomete and running your first transformation.

## Prerequisites

- A running IOMETE compute cluster [See [Compute Clusters](/user-guide/compute-clusters/overview) for setup details].
- Python 3.9 or later.

## Set Up Sample Data

Create two Iceberg tables with sample data in the SQL editor. These tables will be the source for your dbt project.

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
(1, 'John', 'Doe'),
(2, 'Jane', 'Smith');

-- Add as many rows as needed
INSERT INTO iomete_analytics.dbt_database.salaries VALUES
(1, 50000),
(2, 60000);
```

<Img src="/img/integrations/dbt/getting-started-base-table-creation.png" alt="IOMETE SQL Editor showing the employees and salaries tables after creation" caption="IOMETE SQL Editor - Create initial datasets for dbt guide"/>

## Install & Configure dbt-iomete

### Install

```bash
# Create a working directory
mkdir dbt-samples
cd dbt-samples

# Install dbt-iomete in a virtual Python environment
virtualenv .env
source .env/bin/activate
pip install --upgrade dbt-iomete
```

### Initialize the Project

Before running `dbt init`, find your connection parameters on the compute page — navigate to your compute instance, open the **Connect** tab, and select **dbt**.

<Img src="/img/integrations/dbt/getting-started-compute-list.png"
  alt="List of compute instances in the IOMETE console"/>

<Img src="/img/integrations/dbt/getting-started-compute-connect.png"
  alt="Connect tab on the compute detail page showing dbt connection parameters"/>

Run the init command and follow the interactive prompts. When asked for schema, enter `dbt_database` — the database you created earlier.

```bash
dbt init dbt_project
```

```text
→ dbt init dbt_project

08:27:06 Running with dbt=1.7.19
Your new dbt project "dbt_project" was created!

08:27:06 Setting up your profile.
Which database would you like to use?
[1] iomete

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

Your answers are saved to `~/.dbt/profiles.yml`. Use environment variables for sensitive values — never hardcode credentials.

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

### Test the Connection

```bash
cd dbt_project
dbt debug
```

```text
➜ dbt debug
09:01:43  Running with dbt=1.7.19
09:01:43  dbt version: 1.7.19
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

## Run Your First Transformation

A model is a **SELECT statement** defined in a `.sql` file. The file name becomes the model name.

### Create a View Model

The default materialization is `view`. Add the following file to your models directory and run dbt to create an `employee_salaries` view.

```sql title="dbt_project/models/example/employee_salaries.sql"
SELECT e.emp_no,
       e.first_name,
       e.last_name,
       s.salary
FROM dbt_database.employees e
       JOIN dbt_database.salaries s
            ON e.emp_no = s.emp_no;
```

```bash
dbt run
```

```text
➜ dbt run
09:45:59  Registered adapter: iomete=1.7.9
09:45:59  Found 1 model, 0 sources, 0 exposures, 0 metrics, 397 macros, 0 groups, 0 semantic models
09:46:08  Concurrency: 1 threads (target='dev')
09:46:08  1 of 1 START sql view model dbt_database.employee_salaries ..................... [RUN]
09:46:12  1 of 1 OK created sql view model dbt_database.employee_salaries ................ [OK in 3.90s]
09:46:14  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
```

<Img src="/img/integrations/dbt/getting-started-view-created.png" alt="employee_salaries view visible in the IOMETE SQL editor" caption="employee_salaries view"/>

### Change to Table Materialization

To create a `table` instead of a `view`, add the `config` block. IOMETE supports `table`, `view`, and `incremental` materializations — see [dbt-iomete materializations](./dbt-materializations) to learn more.

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

Since a view with the same name already exists, drop it first in the SQL editor:

```sql
DROP VIEW dbt_database.employee_salaries;
```

Then run dbt:

```bash
dbt run
```

This time dbt creates an Iceberg table as the result of the transformation:

<Img src="/img/integrations/dbt/getting-started-table-created.png" alt="employee_salaries Iceberg table visible in the IOMETE SQL editor" caption="employee_salaries Iceberg table"/>

## Next Steps

- Explore [dbt-iomete materializations](./dbt-materializations) — `table`, `view`, `incremental`, and snapshots.
- Learn about [incremental models](./dbt-incremental-models) to handle large datasets efficiently.
- See [incremental models by example](./dbt-incremental-models-by-examples) for hands-on patterns.
