---
slug: /iomete-lakehouse-platform
title: Platform
description: An overview of the components of the IOMETE lakehouse platform. Snowflake Databricks alternative with a built-in data catalog that users can become data-driven
---

On this page we give an overview of the components that make up the IOMETE lakehouse platform. The IOMETE lakehouse platform was designed to provide a unified experience with one source of truth. The platform is complete with a built-in data catalog so that users can become data-driven in an easy and cost-effective manner.

<!-- We deliver data-infrastructure-as-one-single-platform. We are on the cloud (AWS) and provide a fully managed experience. We also provide local cloud, on-premise and hybrid solutions. -->

The platform includes:

1. Lakehouse
   1. Data Plane
   2. Control Plane
2. Customer Tools (Tableau, Power BI, Looker, Metabase, Superset etc.)


![IOMETE data stack](/img/intro/how-it-works.png)

<br/>


<!-- ### Decoupled Compute and Storage

IOMETE lakehouse uses decoupled compute & storage architecture, aka multi-cluster shared-data architecture.

In this architecture, the data is stored in a cloud object store (like AWS S3) and run multiple compute-cluster on top of the shared data. 

Why is running multiple compute clusters on shared data important? Here are the advantages of this architecture:

- Single source of truth of your all company data, as opposed to having different data silos
- Isolate your compute workloads based on team or use cases without duplicating data. _For instance, different teams have different compute clusters or separate ETL workloads from BI workloads, etc. Moreover, as your organization grows, the system can scale horizontally._

### Data Governance

Data governance is a collection of processes, roles, policies, standards, and metrics that ensure the effective and efficient use of information in enabling an organization to achieve its goals. It establishes the processes and responsibilities that ensure the quality and security of the data used across a business or organization. Data governance defines who can take what action, upon what data, in what situations, using what methods.

IOMETE provides the following services to control all these. 

### Advanced Data Authorization Control & Auditing

IOMETE provides a state-of-the-art centralized data access control. You can manage:

- Table, Column access control
- Data Masking
- And even tag-based access control, and this reduces hundreds of data access policies only to a few.

Moreover, data auditing enables to track who consumes what data.

### Data Catalog & Discovery

IOMETE data catalog is a collection of metadata, combined with data management and search tools, that helps analysts and other data users find the data they need. It serves as an inventory of available data and provides information to evaluate fitness data for intended uses.

Here are the benefits of the IOMETE data catalog:

- Keep all vital data assets information central: Databases, tables, views, columns, descriptions, tags, statistics, etc.
- Google-like search for your data assets. Quickly find any data asset you’re looking for — tables, views, databases — all in one place.
- Smart auto-tag-detection. IOMETE profiles data and automatically tags datasets with PII/PCI (email, address, person, location, credit card, etc.)
- Data lineage. Reveal how data has evolved through its lifecycle, where it has come from, and foresee the assets that will be impacted due to change going forward.

### Data monitoring & observability

Observability is no longer just for software engineering. With the rise of data downtime and the increasing complexity of the data stack, observability has emerged as a critical concern for data teams, too.

IOMETE provides:

- Automated data quality profiling: automatically profiles your data to identify missing values, outliers & other data anomalies. 
- Quality checks: Define checks on the datasets to define the health level. When datasets are not conforming to the checks defined on them, the platform will alert the team about the problem.

### Serverless Job Service (ETL)

Serverless Job Service is a serverless job service for Apache Spark applications with an intuitive user experience. You can think of it, Heroku for Spark applications.

### Data Loaders

Data Loaders are connectors to move data from 3rd party applications, like Mixpanel, HubSpot, and hundreds of others. More will come on this.

<!-- ### BI

Fast, lightweight, intuitive, and loaded with options that make it easy for users of all skill sets to explore and visualize their data, from simple line charts to highly detailed geospatial charts. If you wish to connect your favorite third party BI tool instead (e.g. Tableau or Looker): piece of cake. --> -->

## IOMETE Control Plane

Located in the cloud and powered by Kubernetes, the Control Plane is essentially the brain of the IOMETE platform. It manages various crucial aspects:

**Data Plane Services:** These include handling Lakehouse Clusters, managing Spark jobs, providing SQL Editor interfaces, organizing the Data Catalog, and overseeing Data Security.

**Authentication and Authorization:** Utilizes Role-Based Access Control (RBAC) to ensure secure and appropriate access to resources.

**API Gateway:** Manages all inbound requests and offers API key authentication. It's complemented by SDKs to facilitate customer interactions with IOMETE's APIs.

**Private Databases Interaction:** Direct communication with private databases for data retrieval and storage.

**Message Queue Interaction:** Enables asynchronous communication with the Data Plane, enhancing system responsiveness.

**IOMETE Console UI** - Web Application: The primary user interface for interacting with the IOMETE platform.

### Control Plane Locations

For robustness and performance optimization, the Control Plane is replicated across major regions worldwide:

- United States (US) Region
- European Union (EU) Region
- Asia Pacific (AP) Region


### Benefits of Control Plane Replication

- High Availability
- Load Balancing
- Disaster Recovery
- Latency Optimization
- Compliance and Data Sovereignty


## IOMETE Data Plane

Hosted on the customer's cloud infrastructure (AWS, GCP, Azure), the Data Plane is focused on data processing and analysis:

**Apache Spark Engine:** Used for large-scale data processing.

**Jupyter EG:** Provides an interactive computational environment for data science and machine learning.

**Apache Ranger:** Manages security across the lakehouse data.

**IOMETE Services:** Microservices architecture for system monitoring and maintenance.

**Interaction with Control Plane:** Communication through Load Balancer and Message Queues.

**Storage Service:** Uses cloud storage services for data and metadata storage.

**Databases:** Store security policies and metadata for external Hive tables.


## Connecting to Lakehouse Endpoints

Customers can connect to Lakehouse endpoints using various tools, ensuring data remains within their cloud. The Lakehouse endpoints manage authentication and authorization, and execute actions based on user privileges.


**Control Plane and Data Plane Communication**

A simplified example illustrates how these two components interact during processes like Lakehouse Cluster creation. This involves load balancing, metadata storage, and YAML deployment via Kubernetes in the Data Plane.