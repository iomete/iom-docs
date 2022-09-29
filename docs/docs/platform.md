---
title: The iomete Lakehouse Platform
slug: /iomete-lakehouse-platform
tags: [iomete Intro, Getting started, iomete docs]
keywords: [iomete, datalake, lakehouse, warehouse]
---

<!-- <head>
  <title>The iomete lakehouse platform</title>
  <meta
    name="description"
    content="The iomete lakehouse platform"
  />
</head> -->

On this page we give an overview of the components that make up the iomete lakehouse platform. The iomete lakehouse platform was designed to provide a unified experience with one source of truth. The platform is complete with a built-in data catalog and built-in BI so that users can become data-driven in an easy and cost-effective manner.

We deliver data-infrastructure-as-one-single-platform. We are on the cloud (AWS) and provide a fully managed experience. We also provide local cloud, on-premise and hybrid solutions.

The platform includes:

1. Lakehouse
2. Data Governance
   1. Advanced Data Authorization Control & Auditing
   2. Data catalog & discovery
   3. Data monitoring & observability
3. Serverless Job Service (ETL)
4. Data Loaders (Data migration from 3rd party services, aka data connectors)
5. Built-in BI Solution (but also works with 3rd party BI solution such as Tableau, Looker and the likes)


![How it works](/img/docs/how-it-works.png)

<br/>

### Lakehouse

At the center, iomete provides a data** lakehouse. **Lakehouse is an environment designed to combine the data structure and data management features of a data warehouse with the low-cost storage of a data lake.

To understand **lakehouse**, let’s explore the pros & cons of data lakes: 

Data lakes have been known for their cost-effectiveness, unlimited scalability, and shared-data architecture. But this approach also brought certain challenges. It doesn’t have the database interface we are accustomed to, no support for update/insert/delete, no ACID, data access control on column level, etc. You need to deal directly with the physical files instead of high-level database operations.

Lakehouse solves all those challenges of data lakes and keeps the advantages of data lakes. Simply think **Lakehouse = Data Warehouse + Data Lake. **

The iomete lakehouse provides the following advantages:

- Cost-effective: use cheap cloud blob storage (AWS S3, Google Cloud Storage, etc.)
- Unlimited scalability: provided by cloud storage
- Decoupled compute and storage. That allows multiple compute clusters to use the shared data. 
- ACID (atomic, consistent, isolated, durable) support and insert/update/delete support
- Working with database/table/view/columns abstraction instead of physical files
- Granular data access control up to column/row level
- Schema enforcement. Data should conform to the schema of the table.
- Store the data as-is, without having to structure the data first, and run different types of analytics to guide better decisions, building dashboards and visualizations from big data processing, real-time analytics, and machine learning. 

Incredible isn’t it?!

One of the exciting concepts we mentioned above is **decoupled compute and storage**. Next, let’s learn what it is.

### Decoupled Compute and Storage

iomete lakehouse uses decoupled compute & storage architecture, aka multi-cluster shared-data architecture.

In this architecture, the data is stored in a cloud object store (like AWS S3) and run multiple compute-cluster on top of the shared data. 

Why is running multiple compute clusters on shared data important? Here are the advantages of this architecture:

- Single source of truth of your all company data, as opposed to having different data silos
- Isolate your compute workloads based on team or use cases without duplicating data. _For instance, different teams have different compute clusters or separate ETL workloads from BI workloads, etc. Moreover, as your organization grows, the system can scale horizontally._

### Data Governance

Data governance is a collection of processes, roles, policies, standards, and metrics that ensure the effective and efficient use of information in enabling an organization to achieve its goals. It establishes the processes and responsibilities that ensure the quality and security of the data used across a business or organization. Data governance defines who can take what action, upon what data, in what situations, using what methods.

iomete provides the following services to control all these. 

### Advanced Data Authorization Control & Auditing

iomete provides a state-of-the-art centralized data access control. You can manage:

- Table, Column access control
- Data Masking
- And even tag-based access control, and this reduces hundreds of data access policies only to a few.

Moreover, data auditing enables to track who consumes what data.

### Data Catalog & Discovery

Iomete data catalog is a collection of metadata, combined with data management and search tools, that helps analysts and other data users find the data they need. It serves as an inventory of available data and provides information to evaluate fitness data for intended uses.

Here are the benefits of the iomete data catalog:

- Keep all vital data assets information central: Databases, tables, views, columns, descriptions, tags, statistics, etc.
- Google-like search for your data assets. Quickly find any data asset you’re looking for — tables, views, databases — all in one place.
- Smart auto-tag-detection. Iomete profiles data and automatically tags datasets with PII/PCI (email, address, person, location, credit card, etc.)
- Data lineage. Reveal how data has evolved through its lifecycle, where it has come from, and foresee the assets that will be impacted due to change going forward.

### Data monitoring & observability

Observability is no longer just for software engineering. With the rise of data downtime and the increasing complexity of the data stack, observability has emerged as a critical concern for data teams, too.

iomete provides:

- Automated data quality profiling: automatically profiles your data to identify missing values, outliers & other data anomalies. 
- Quality checks: Define checks on the datasets to define the health level. When datasets are not conforming to the checks defined on them, the platform will alert the team about the problem.

### Serverless Job Service (ETL)

Serverless Job Service is a serverless job service for Apache Spark applications with an intuitive user experience. You can think of it, Heroku for Spark applications.

### Data Loaders

Data Loaders are connectors to move data from 3rd party applications, like Mixpanel, HubSpot, and hundreds of others. More will come on this.

### BI

Fast, lightweight, intuitive, and loaded with options that make it easy for users of all skill sets to explore and visualize their data, from simple line charts to highly detailed geospatial charts. If you wish to connect your favorite third party BI tool instead (e.g. Tableau or Looker): piece of cake.