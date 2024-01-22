---
title: Platform Tour
description: Explore powerful IOMETE features. Lakehouses, SQL Editor, Spark Jobs, Data Catalog, Data Security, Notebooks. Simplify data management seamlessly.
---

import Img from '@site/src/components/Img';

The IOMETE Platform interface is composed of the following sections:

1. **User Menu:** - Use this menu to switch themes, access the settings menu, and log out.

2. **Navigation Menu:** - Navigate through different Platform areas including Lakehouses, SQL Editor, Spark jobs, Data catalog and more.

3. **Help Menu:** - Access this menu to redirect to Community & Support and Documentation for assistance.

4. **Content:** - When a Platform menu item is selected, the associated content is displayed in the content pane.

  <Img src="/img/getting-started/platform-tour/dashboard-page.png" alt="Dashboards page"/>

## Lakehouses page

A **virtual lakehouse** is a cluster of compute resources that provide the required resources, such as CPU, memory to perform the querying processing.
Before using the **SQL Editor**, you should create a lakehouse.

<Img src="/img/getting-started/platform-tour/lakehouse-page.png" alt="Lakehouses page"/>

For more details, see [Virtual Lakehouses](/docs/user-guide/virtual-lakehouses.md)

## SQL Editor page

The main components of the SQL Editor are highlighted below:

- **Worksheets** offer a simple method for you to write SQL queries, execute the queries, and see the results.
- **Database explorer** is used to explore your database objects, which includes namespaces, tables, views, and their columns (even complex columns), and partitions.
- **Lakehouse and Namespace selection** are required to execute SQL queries.
- **SQL Editor** is used to write SQL queries using autocomplete feature. IOMETE tracks database objects and suggests them as autocomplete options
- **Query result view** provide executed queries results. You can filter each column in the results and toggle on Charts to visualize the results as graphs.

<Img src="/img/getting-started/platform-tour/sql-editor-page.png" alt="SQL Editor page"/>

For more details, see [SQL Editor](/docs/user-guide/sql-editor.md)

<!-- ## Connect clusters page

A **virtual lakehouse** is a cluster of compute resources that provide the required resources, such as CPU, memory to perform the querying processing.

<Img src="/img/getting-started/platform-tour/connect-cluster.png" alt="Connect clusters page"/> -->

<!-- For more details, see [Connect clusters](/docs/user-guide/virtual-lakehouses.md). -->

## Spark Jobs page

IOMETE offers [PySpark quickstart template for AWS](https://github.com/iomete/spark-job-template) or [PySpark quickstart template for GCP](https://github.com/iomete/spark-job-template-gcp) helping you kickstart your first Spark Job. Follow the README instructions to use the template, which includes a sample job reading a CSV file from an S3 bucket, applying transformations, and writing the output to an Iceberg Table. Use it as a starting point for your custom jobs.

<Img src="/img/getting-started/platform-tour/spark-jobs-page.png" alt="Spark jobs page"/>

For more details, see [Spark job](/docs/developer-guide/spark-job/getting-started.md)

## Data security page

Data security at IOMETE is maintained through access control using a user interface for consistent administration. Security admins set policies for databases, tables, and columns, managing permissions for groups or users. IOMETE offers the following types of data security.

- **Access Policy** policy comprises rules and permissions that specify who can access specific resources and the actions they can take after gaining access.
- **Data masking** is a method to hide sensitive information by changing it into fake data while keeping its appearance intact. It safeguards private details during testing or sharing.
- **Row-level filtering** limits who can see certain rows in a database.

For more details, see [Data security overview](/docs/user-guide/data-security/overview.mdx)

## Data catalog page

The data catalog interface offers metadata for all tables.
You can easily filter by _Schemas_, _Table type_, _Provider_ and _Tags_, and use the search function to find what you need. Additionally, you have the option to bookmark tables for quick access.

<Img src="/img/getting-started/platform-tour/data-catalog-page.png" alt="Data catalog page"/>

In the detailed view of a table, you can view comprehensive information such as Created time, Updated time, Last sync time, Table type, Table owner, Tags, Description, and Columns. For more convenience, you can edit table tags, owner, and description. Similarly, you can edit column tags and descriptions. This user-friendly interface allows you to manage and customize the information according to your needs.

<Img src="/img/getting-started/platform-tour/data-catalog-page-detail.png" alt="Data catalog page detail"/>

## Notebook

Jupyter Notebook is a powerful tool for interactive data exploration and prototyping. By connecting to IOMETE's Jupyter Gateway you will be able to explore and analyze data stored in IOMETE's data lake directly from your local environment.

<Img src="/img/getting-started/platform-tour/notebook-page.png" alt="Notebook page detail"/>

For more details, see [Starting with Notebook](/docs/developer-guide/notebook/starting-with-notebook.mdx)
