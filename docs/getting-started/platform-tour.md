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

## Engine

### Lakehouses page

A **virtual lakehouse** is a cluster of compute resources that provide the required resources, such as CPU, memory to perform the querying processing.
Before using the **SQL Editor**, you should create a lakehouse.

<Img src="/img/getting-started/platform-tour/lakehouse-page.png" alt="Lakehouses page"/>

For more details, see [Virtual Lakehouses](/docs/user-guide/virtual-lakehouses.md)

### Jupyter Kernels page

Jupyter Notebook is a powerful tool for interactive data exploration and prototyping. By connecting to IOMETE's Jupyter Gateway you will be able to explore and analyze data stored in IOMETE's data lake directly from your local environment.

<Img src="/img/getting-started/platform-tour/notebook-page.png" alt="Notebook page detail"/>

For more details, see [Starting with Notebook](/docs/developer-guide/notebook/starting-with-notebook.mdx)

## SQL

### SQL Editor page

The main components of the SQL Editor are highlighted below:

- **Worksheets** offer a simple method for you to write SQL queries, execute the queries, and see the results.
- **Database explorer** is used to explore your database objects, which includes namespaces, tables, views, and their columns (even complex columns), and partitions.
- **Lakehouse and Namespace selection** are required to execute SQL queries.
- **SQL Editor** is used to write SQL queries using autocomplete feature. IOMETE tracks database objects and suggests them as autocomplete options
- **Query result view** provide executed queries results. You can filter each column in the results and toggle on Charts to visualize the results as graphs.

<Img src="/img/getting-started/platform-tour/sql-editor-page.png" alt="SQL Editor page"/>

For more details, see [SQL Editor](/docs/user-guide/sql-editor/worksheets)

### Query History page

Query Histories track each query you run, adding it as a new item in the SQL history. You can revisit previous queries to view their results and reopen them in the active worksheet.

<Img src="/img/getting-started/platform-tour/query-history-page.png" alt="Query History  page"/>

For more details, see [Query History](/user-guide/sql-editor#query-histories)

## Applications

### Spark Applications page

The Spark Applications page provides a centralized view of all Spark applications across various jobs, visualized with interactive charts. Users can filter applications by time range, user, status, or tags to efficiently monitor and analyze performance. This comprehensive view aids in tracking application progress, identifying issues, and optimizing resource usage.

<Img src="/img/getting-started/platform-tour/spark-applications.png" alt="Spark Applications page"/>

### Job Templates page

IOMETE offers [PySpark quickstart template for AWS](https://github.com/iomete/spark-job-template) or [PySpark quickstart template for GCP](https://github.com/iomete/spark-job-template-gcp) helping you kickstart your first Spark Job. Follow the README instructions to use the template, which includes a sample job reading a CSV file from an S3 bucket, applying transformations, and writing the output to an Iceberg Table. Use it as a starting point for your custom jobs.

<Img src="/img/getting-started/platform-tour/job-templates.png" alt="Spark jobs page"/>

For more details, see [Spark job](/docs/developer-guide/spark-job/getting-started.md)

## Governance

### Search

The data catalog interface offers metadata for all tables.
You can easily filter by _Schemas_, _Table type_, _Provider_ and _Tags_, and use the search function to find what you need. Additionally, you have the option to bookmark tables for quick access.

<Img src="/img/getting-started/platform-tour/catalog-search.png" alt="Data catalog page"/>

### Data Explorer page

The Catalog Explorer page allows you to view and manage all catalogs, namespaces, and tables with ease. You can register or snapshot tables and access detailed information, including table details, partition information, column data, and snapshots.

<Img src="/img/getting-started/platform-tour/data-explorer-page.png" alt="Data Explorer page"/>

<Img src="/img/getting-started/platform-tour/explorer-snapshots.png" alt="Data Explorer page"/>

### Data security page

Data security at IOMETE is maintained through access control using a user interface for consistent administration. Security admins set policies for databases, tables, and columns, managing permissions for groups or users. IOMETE offers the following types of data security.

- **Access Policy** policy comprises rules and permissions that specify who can access specific resources and the actions they can take after gaining access.
- **Data masking** is a method to hide sensitive information by changing it into fake data while keeping its appearance intact. It safeguards private details during testing or sharing.
- **Row-level filtering** limits who can see certain rows in a database.

For more details, see [Data security overview](/docs/user-guide/data-security/overview.mdx)
