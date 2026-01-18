# IOMETE Documentation Internal Linking Site Map

**Date**: January 18, 2026
**Purpose**: Visual representation of internal linking structure and content relationships

---

## Hub-and-Spoke Structure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     ENTRY POINTS (Tier 1 Hubs)                  │
│                                                                 │
│  ┌───────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ What is       │  │ Architecture │  │ Iceberg Getting    │  │
│  │ IOMETE?       │──│  Overview    │──│ Started            │  │
│  │ (22 links)    │  │ (35+ links)  │  │ (17 links)         │  │
│  └───────┬───────┘  └──────┬───────┘  └─────────┬──────────┘  │
│          │                 │                      │             │
│          └─────────────────┴──────────────────────┘             │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
          ┌──────────────────┴──────────────────┐
          │                                     │
┌─────────▼──────────┐              ┌──────────▼──────────┐
│  User Experience   │              │  Technical Reference│
│     Hubs           │              │      Hubs           │
│                    │              │                     │
│ Virtual Lakehouses │              │ Data Security       │
│   (25+ links)      │              │   (20+ links)       │
└────────────────────┘              └─────────────────────┘
```

---

## Content Cluster Map

### 1. Getting Started Cluster
**Hub**: What is IOMETE + Architecture

```
What is IOMETE (Entry Point)
    ├── Architecture (Deep Dive) ────────┐
    ├── Platform Tour (Visual Guide)     │
    ├── Scalability (Capabilities)       │
    ├── Support (Help Resources)         │
    └── Deployment Options ──────────────┤
                                         │
        ┌────────────────────────────────┘
        │
        ├── Community Deployment Overview
        │   ├── AWS Installation
        │   ├── Azure Installation
        │   ├── GCP Installation
        │   └── On-Premises Installation
        │
        └── Enterprise Deployment
            ├── Kubernetes Setup
            ├── Backend Databases
            ├── Custom DNS
            ├── Ingress Configuration
            └── Network Policies
```

### 2. Apache Iceberg Cluster
**Hub**: Iceberg Getting Started

```
Iceberg Getting Started (Hub)
    │
    ├── Core Operations
    │   ├── Iceberg DDL (CREATE, ALTER, DROP)
    │   ├── Iceberg Writes (INSERT, UPDATE, MERGE, DELETE)
    │   ├── Iceberg Queries (SELECT, metadata tables)
    │   └── Iceberg Time Travel (snapshots, rollback)
    │
    ├── Advanced Features
    │   ├── Iceberg Maintenance (optimization)
    │   └── Iceberg Procedures (system calls)
    │
    ├── Automation
    │   └── Data Compaction Job (scheduled maintenance)
    │
    └── Learning Resources
        ├── Blog: Iceberg Maintenance Runbook
        ├── Blog: Iceberg Deep Dive (CoW)
        ├── Blog: Why Apache Iceberg Wins
        ├── Blog: Iceberg Compaction Performance
        ├── Blog: Iceberg Disaster Recovery
        ├── Blog: Iceberg Catalog Guide
        ├── Blog: Merge-on-Read vs Copy-on-Write
        └── Tutorial: Compaction (CoW vs MoR)
```

### 3. Compute & Workloads Cluster
**Hub**: Virtual Lakehouses

```
Virtual Lakehouses (Hub)
    │
    ├── Configuration
    │   ├── Node Types & Sizing
    │   ├── Workspaces (organization)
    │   ├── Volumes (storage)
    │   └── Spark Settings (tuning)
    │
    ├── Connectivity
    │   ├── SQL Editor (Worksheets, Query History, Dashboards)
    │   ├── JDBC Driver
    │   ├── SQL Alchemy Driver
    │   └── Connection Options
    │
    ├── BI Integrations
    │   ├── Tableau
    │   ├── Power BI (3 connection methods)
    │   ├── Metabase
    │   ├── Apache Superset
    │   └── Redash
    │
    ├── Developer Tools
    │   ├── DBT Integration
    │   ├── DBeaver
    │   └── Git Integration
    │
    ├── Data Processing
    │   ├── Spark Jobs Overview
    │   │   ├── Getting Started (Custom Jobs)
    │   │   ├── IOMETE SDK
    │   │   ├── Airflow Integration
    │   │   ├── Job Orchestrator
    │   │   ├── Spark Debugging
    │   │   └── Spark Logging
    │   │
    │   └── Marketplace Jobs
    │       ├── Data Compaction
    │       ├── MySQL Replication
    │       ├── Query Scheduler
    │       ├── Catalog Sync
    │       ├── Kafka Streaming
    │       └── File Streaming
    │
    └── Jupyter Notebooks
        ├── Getting Started
        ├── VSCode Integration
        └── Jupyter Containers
```

### 4. Security & IAM Cluster
**Hub**: Data Security Overview

```
Data Security Overview (Hub)
    │
    ├── Data Access Policies
    │   ├── Access Policies (table/column-level)
    │   ├── Data Masking (field obfuscation)
    │   ├── Row-Level Filtering (dynamic filtering)
    │   ├── Tag-Based Access Policies
    │   └── Tag-Based Data Masking
    │
    ├── Identity & Access Management
    │   ├── IAM Users (user management)
    │   ├── IAM Groups (group organization)
    │   ├── IAM Roles (permission sets)
    │   └── RAS - Resource Access System (workspaces)
    │
    ├── Authentication
    │   ├── Personal Access Tokens
    │   ├── LDAP Configuration
    │   └── SSO Configuration
    │       ├── SAML SSO
    │       ├── OIDC SSO
    │       ├── Okta SSO
    │       ├── OneLogin SSO
    │       ├── Entra ID (Azure AD) SSO
    │       └── SCIM Provisioning (Okta)
    │
    ├── API & Automation
    │   └── Data Security API
    │
    └── Learning Resources
        ├── Blog: Data Platform Security
        ├── Blog: Apache Ranger Guide
        ├── Blog: SSO with SAML
        ├── Blog: Secure Data Processing
        └── Blog: LDAP Integration
```

### 5. Data Sources & Integration Cluster
**Hub**: JDBC Sources (Reference) + Tutorials

```
Data Integration
    │
    ├── Data Sources Reference
    │   ├── JDBC Sources (primary)
    │   ├── CSV Files
    │   ├── JSON Files
    │   ├── Parquet Files
    │   ├── ORC Files
    │   └── Snowflake Connector
    │
    ├── Tutorials (Practical Guides)
    │   ├── Sync Data from JDBC Sources
    │   └── Export as CSV File
    │
    ├── SQL Quick Start
    │   ├── SQL DDL Examples
    │   ├── DML Operations
    │   ├── Tables from JDBC/CSV/JSON
    │   ├── Query Federation
    │   ├── MS SQL Server Datasource
    │   └── Oracle Datasource
    │
    └── Advanced Features
        ├── Query Federation
        └── Data Catalog
```

### 6. SQL Reference Cluster
**Hub**: SQL Quick Start (cross-links to be added in future work)

```
Spark SQL Reference
    │
    ├── DDL Commands
    │   ├── CREATE DATABASE
    │   ├── ALTER DATABASE
    │   ├── DROP DATABASE
    │   ├── CREATE TABLE
    │   ├── ALTER TABLE
    │   ├── DROP TABLE
    │   ├── CREATE VIEW
    │   └── DROP VIEW
    │
    ├── DML Operations (Writes)
    │   ├── INSERT INTO
    │   ├── INSERT OVERWRITE
    │   ├── MERGE INTO
    │   └── TRUNCATE TABLE
    │
    ├── Query Clauses
    │   ├── SELECT
    │   ├── WHERE Clause
    │   ├── GROUP BY Clause
    │   ├── HAVING Clause (future: link to GROUP BY)
    │   ├── ORDER BY Clause
    │   ├── SORT BY Clause
    │   ├── CLUSTER BY Clause
    │   ├── DISTRIBUTE BY Clause
    │   ├── LIMIT Clause
    │   └── Common Table Expressions (CTE)
    │
    ├── Advanced Queries
    │   ├── JOIN Operations
    │   ├── Window Functions
    │   ├── CASE Clause
    │   ├── PIVOT Clause
    │   ├── LATERAL VIEW Clause
    │   ├── Table-Valued Functions
    │   ├── Sampling Queries
    │   ├── Set Operators (UNION, INTERSECT, EXCEPT)
    │   └── TRANSFORM
    │
    └── Reference Materials
        ├── Functions (built-in)
        ├── Operators
        ├── Literals
        ├── Identifiers
        ├── Column Types
        ├── Datetime Patterns
        ├── Null Semantics
        ├── Hints
        ├── Inline Tables
        └── File Operations
```

### 7. Deployment & Infrastructure Cluster
**Hub**: Deployment Overview + Kubernetes

```
Deployment (Multi-Hub Structure)
    │
    ├── Community Edition
    │   ├── Overview (hub)
    │   ├── AWS
    │   │   ├── Installation
    │   │   ├── Advanced Settings
    │   │   ├── Permissions
    │   │   ├── Data Plane Cost
    │   │   ├── Troubleshooting
    │   │   └── Uninstall
    │   ├── Azure
    │   │   ├── Installation
    │   │   └── Upgrade
    │   ├── GCP
    │   │   ├── Installation
    │   │   └── Uninstall
    │   └── On-Premises
    │       └── Installation
    │
    ├── Enterprise Edition
    │   ├── Kubernetes Deployment (hub)
    │   ├── Backend Databases (PostgreSQL, MySQL, MinIO)
    │   ├── Configure Custom DNS
    │   ├── Configure Ingress
    │   ├── Connect Namespace
    │   ├── Network Policies
    │   ├── Truststore Configuration
    │   └── Life Cycle Management
    │
    ├── Cloud-Specific
    │   ├── AWS
    │   │   ├── S3 Bucket Permissions
    │   │   ├── Glue Catalog Permissions
    │   │   └── Read Files from S3
    │   └── GCP
    │       └── GCS Bucket Permissions
    │
    ├── Kubernetes Management
    │   ├── Node Sizing
    │   ├── CPU vs vCPU
    │   ├── Monitoring
    │   ├── Private Docker Registry
    │   └── Spark Executor Shuffle Storage
    │
    ├── Release Notes
    │   └── Version-specific release notes
    │       ├── 1.19.3
    │       ├── 1.20.0
    │       ├── 1.22.0
    │       ├── 2.0.1
    │       ├── 2.1.0
    │       └── 2.2.0
    │
    └── Learning Resources
        ├── Blog: Deployment Models
        ├── Blog: Kubernetes-Native Architecture
        ├── Blog: On-Premise Lakehouse
        └── Blog: Kubernetes Best Practices
```

---

## Blog Post to Documentation Mapping

### Iceberg Technical Blogs → Iceberg Docs
```
┌──────────────────────────────────────┐
│  Iceberg Blog Posts (7)              │
├──────────────────────────────────────┤
│ • Maintenance Runbook        ────────┼──► Iceberg Getting Started
│ • Deep Dive (CoW)            ────────┼──► Iceberg Writes
│ • Why Iceberg Wins           ────────┼──► Iceberg DDL
│ • Compaction Performance     ────────┼──► Iceberg Maintenance
│ • Disaster Recovery          ────────┼──► Iceberg Time Travel
│ • Catalog Guide              ────────┼──► Iceberg Procedures
│ • MoR vs CoW                 ────────┼──► Data Compaction Job
└──────────────────────────────────────┘   Compaction Tutorial
```

### Security Blogs → Security Docs
```
┌──────────────────────────────────────┐
│  Security Blog Posts (2)             │
├──────────────────────────────────────┤
│ • Data Platform Security     ────────┼──► Data Security Overview
│ • LDAP Integration           ────────┼──► Access Policies
└──────────────────────────────────────┘   Data Masking
                                           Row-Level Filtering
                                           IAM Roles/Users/Groups
                                           SSO Configuration
                                           LDAP Configuration
```

### Platform Blogs → Platform Docs
```
┌──────────────────────────────────────┐
│  Platform Blog Posts (5)             │
├──────────────────────────────────────┤
│ • Job Orchestrator Design    ────────┼──► Spark Jobs
│ • Kubernetes Architecture    ────────┼──► Architecture
│ • Deployment Models          ────────┼──► Virtual Lakehouses
│ • Enterprise Data Platform   ────────┼──► Kubernetes Deployment
│ • Databricks Alternatives    ────────┼──► What is IOMETE
│ • Snowflake vs IOMETE        ────────┼──► Community Deployment
└──────────────────────────────────────┘   Deployment guides
```

---

## Link Distribution Statistics

### Tier 1 Hubs (6 pages) - Average: 23 links per page
```
What is IOMETE              ████████████████████████ 22 links
Architecture                ████████████████████████████████████ 35 links
Iceberg Getting Started     ███████████████████ 17 links
Virtual Lakehouses          ███████████████████████████ 25 links
Data Security Overview      ████████████████████ 20 links
Platform Tour               ██████████ 10 links (estimated)
```

### Blog Posts Enhanced (14 posts) - Average: 5 links per post
```
Each blog post now has:
• 3-8 documentation links
• Contextual callout boxes
• "Related Documentation" sections
• "Learn More" sections
```

### Content Clusters (6 clusters)
```
1. Getting Started         █████████ 8 pages fully linked
2. Iceberg                ██████████████ 13 pages (hub + 6 docs + 6 blogs)
3. Compute & Workloads    ████████████ 10+ pages partially linked
4. Security & IAM         ██████████ 9 pages fully linked
5. Data Integration       ███████ 6 pages identified
6. SQL Reference          ████████████████████ 20+ pages (future work)
```

---

## User Journey Maps

### Journey 1: "I want to deploy IOMETE"
```
Entry: What is IOMETE
  ↓
  ├─► Architecture (understand platform)
  ├─► Deployment Models (blog: choose approach)
  ├─► Community Deployment Overview
  │   ↓
  │   └─► AWS Installation / Azure / GCP / On-Prem
  │       ↓
  │       ├─► Kubernetes Setup
  │       ├─► Backend Databases
  │       ├─► Configure DNS
  │       └─► Network Policies
  │
  └─► Next: Create Virtual Lakehouse
```

### Journey 2: "I need to manage Iceberg tables"
```
Entry: Architecture (or) What is IOMETE
  ↓
  ├─► Iceberg Getting Started
  │   ↓
  │   ├─► Iceberg DDL (create tables)
  │   ├─► Iceberg Writes (insert data)
  │   ├─► Iceberg Queries (read data)
  │   │
  │   └─► Blog: Maintenance Runbook (learn best practices)
  │       ↓
  │       └─► Iceberg Maintenance
  │           ↓
  │           ├─► Iceberg Procedures
  │           └─► Data Compaction Job (automate)
  │
  └─► Tutorial: Compaction (CoW vs MoR)
```

### Journey 3: "I want to secure my data"
```
Entry: Architecture (security section)
  ↓
  ├─► Data Security Overview
  │   ↓
  │   ├─► Access Policies (table/column permissions)
  │   ├─► Data Masking (obfuscate sensitive fields)
  │   ├─► Row-Level Filtering (dynamic access)
  │   │
  │   ├─► IAM Roles (permission sets)
  │   ├─► IAM Groups (organize users)
  │   ├─► IAM Users (manage identities)
  │   │
  │   └─► SSO Configuration
  │       ↓
  │       └─► Okta / Entra ID / OneLogin / SAML
  │
  └─► Blog: Data Platform Security (best practices)
```

### Journey 4: "I want to connect BI tools"
```
Entry: Virtual Lakehouses
  ↓
  ├─► Create Lakehouse (node types, sizing)
  │   ↓
  │   ├─► Personal Access Token (authentication)
  │   ├─► Connection Options (configuration)
  │   │
  │   └─► Choose BI Tool:
  │       ├─► Tableau Integration
  │       ├─► Power BI Integration
  │       ├─► Metabase Integration
  │       ├─► Apache Superset Integration
  │       └─► Redash Integration
  │
  ├─► JDBC Driver (technical details)
  └─► SQL Editor (alternative: built-in interface)
```

---

## Orphan Page Priorities (Future Work)

### High-Priority Orphans (Should be linked from 3+ places)
```
Priority 1 (Core Features):
  • Scalability Guide          ←── Link from: Architecture, What is IOMETE, Deployment
  • Data Catalog              ←── Link from: Architecture, Getting Started, Catalog Service
  • Secrets Management        ←── Link from: Spark Jobs, Tutorials, Integrations
  • Workspaces                ←── Link from: Virtual Lakehouses, Storage Configs
  • Volumes                   ←── Link from: Virtual Lakehouses, Spark Jobs

Priority 2 (Infrastructure):
  • Network Policies          ←── Link from: Kubernetes, Security Overview
  • Monitoring                ←── Link from: Kubernetes, Deployment, Architecture
  • Node Types                ←── Link from: Virtual Lakehouses, Sizing Guide
  • Email Settings            ←── Link from: IAM, Users

Priority 3 (Troubleshooting):
  • SQL Query Errors          ←── Link from: SQL Editor, Iceberg Queries
  • Python Errors             ←── Link from: Jupyter, Spark Jobs
  • Lakehouse OOM Errors      ←── Link from: Virtual Lakehouses, Troubleshooting
```

---

## Next Implementation Phases

### Phase 1: Expand Hub Pages (Weeks 1-2)
```
Enhance 10 more hub pages:
  1. Spark Jobs Getting Started
  2. SQL Editor Overview
  3. Open Source Jobs Marketplace
  4. Deployment Overview
  5. Kubernetes Setup
  6. DBT Integration
  7. Power BI Hub (all connection methods)
  8. Roles & Permissions
  9. SQL Quick Start
  10. Tutorial Hub

Target: Each hub should have 8-15 outgoing links
```

### Phase 2: Connect Reference Docs (Weeks 3-4)
```
SQL Reference Cross-Linking:
  • WHERE ←→ HAVING (filtering)
  • GROUP BY ←→ HAVING, aggregate functions
  • ORDER BY ←→ SORT BY, CLUSTER BY
  • JOIN ←→ lateral-view, subqueries
  • CTE ←→ SELECT, subqueries
  • Window Functions ←→ ORDER BY, PARTITION BY

Target: Every reference page has 3-5 related links
```

### Phase 3: Tutorial Expansion (Weeks 5-6)
```
Enhance existing tutorials:
  • Sync Data from JDBC → Add 8-10 reference links
  • Export as CSV → Add 5-6 links
  • Compaction CoW/MoR → Add more Iceberg links

Create tutorial index page with links to all tutorials
```

### Phase 4: Orphan Reduction (Weeks 7-10)
```
Systematically connect:
  • 50 high-value orphans (Priority 1-2)
  • Create hub pages for orphan clusters
  • Add "Common Issues" sections linking to troubleshooting
  • Connect all release notes to deployment overview

Target: Reduce orphans from 234 to <100
```

---

## Visualization Legend

```
Symbols Used:
  ────►  Links to (outgoing link)
  ◄────  Linked from (incoming link)
  ←→     Bidirectional link
  │      Parent-child relationship
  ├──    Branch in hierarchy
  └──    Last item in branch
  █      Visual bar for statistics
  ◄══►   Strong relationship (hub ←→ spoke)
```

---

## Maintenance Guidelines

### Adding New Documentation
1. **Identify the cluster**: Which topic cluster does it belong to?
2. **Find the hub page**: Link to/from the appropriate hub
3. **Add contextual links**: 3-5 related pages
4. **Update hub page**: Add new page to hub's "Related Documentation"
5. **Check for orphans**: Ensure page has incoming links

### Updating Existing Pages
1. **Review current links**: Are they still relevant?
2. **Check for new opportunities**: Have new related pages been added?
3. **Update hub pages**: If this is a hub, maintain 15+ links
4. **Bidirectional linking**: Ensure links go both ways where appropriate

### Quality Checks
- ✅ All new pages have 3+ outgoing links
- ✅ All new pages have 1+ incoming links (not orphans)
- ✅ Hub pages have 15+ outgoing links
- ✅ Related content is cross-linked
- ✅ Blog posts link to documentation
- ✅ Tutorials link to reference docs
- ✅ Anchor text is descriptive

---

This site map provides a comprehensive view of the internal linking structure implemented and serves as a guide for future enhancements.
