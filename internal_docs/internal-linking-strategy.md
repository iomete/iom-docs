# Internal Linking Strategy & Implementation Plan

**Generated:** 2026-01-18
**Based on:** Internal Linking Audit Report + Content Analysis of 25+ key files

---

## Executive Summary

**Current State:**
- 285 total files (208 docs, 77 blogs)
- 185 pages with 0 internal links (65%)
- 234 orphan pages (82%)
- Average links per file: 1.11
- 228 broken links need fixing

**Strategic Goal:**
Transform IOMETE documentation from a collection of isolated pages into an interconnected knowledge graph that:
- Guides users through learning journeys
- Surfaces related content naturally
- Improves SEO through strategic link equity distribution
- Reduces bounce rates and increases time on site

**Expected Outcomes:**
- Increase average links per page from 1.11 to 5-8
- Reduce orphan pages from 234 to <50
- Create 15-20 pillar hub pages
- Establish 8 major content clusters

---

## Content Analysis: Clusters Identified

Based on analysis of 25+ key files across sections, the following content clusters emerged:

### 1. **Getting Started & Platform Fundamentals** (Pillar Cluster)
**Hub Pages:**
- `/docs/getting-started/what-is-iomete.md` - Primary entry point
- `/docs/getting-started/architecture.md` - Technical overview
- `/docs/getting-started/platform-tour.md` - Feature walkthrough

**Cluster Content:**
- Deployment guides (all environments)
- Scalability overview
- Support resources

**Natural Connections:**
- → Virtual Lakehouses (compute layer)
- → Spark Jobs (compute services)
- → Data Security (architecture components)
- → Iceberg tables (storage layer)

---

### 2. **Apache Iceberg Operations** (High-Value Pillar)
**Hub Pages:**
- `/docs/reference/iceberg-tables/getting-started.mdx` - Primary Iceberg guide
- `/docs/reference/iceberg-tables/maintenance.mdx` - Maintenance hub
- `/docs/tutorials/compaction-cow-mor.md` - Practical guide

**Cluster Content:**
- DDL operations (all `/docs/reference/iceberg-tables/ddl.mdx` files)
- Time travel & queries
- Writes & merge operations
- Iceberg procedures

**Natural Connections:**
- → Blog: Iceberg Maintenance Runbook
- → Blog: Iceberg Deep Dive (CoW)
- → Blog: Why Apache Iceberg Wins
- → Spark Jobs (maintenance automation)
- → Data compaction job

**Blog Cross-Links:**
- `blog/2025-12-04-iceberg-maintenance-runbook.md` → maintenance docs
- `blog/2025-05-22-iceberg-deep-dive.md` → getting-started, writes
- `blog/2023-08-25-why-apache-iceberg-win.md` → getting-started
- `blog/2025-09-25-iceberg-compaction-slow.md` → maintenance, compaction job
- `blog/2025-09-30-iceberg-disaster-recovery.md` → time-travel, maintenance

---

### 3. **Virtual Lakehouses & Compute** (Core User Journey)
**Hub Page:**
- `/docs/user-guide/virtual-lakehouses.md` - Comprehensive guide

**Cluster Content:**
- Node types & sizing
- Auto-suspend configuration
- Connection guides (BI tools)
- Workspaces & volumes

**Natural Connections:**
- → Architecture (compute layer explanation)
- → Spark Settings (global & lakehouse-level)
- → SQL Editor (query interface)
- → BI Integrations (all connection types)
- → Developer Guide (JDBC, drivers)

---

### 4. **Spark Jobs & Data Processing** (Developer Focus)
**Hub Pages:**
- `/docs/user-guide/spark-jobs.md` - Overview & marketplace
- `/docs/developer-guide/spark-job/getting-started.md` - Custom jobs
- `/docs/open-source-spark-jobs/getting-started.mdx` - Marketplace hub

**Cluster Content:**
- All marketplace jobs (MySQL replication, compaction, query scheduler, Kafka streaming, etc.)
- Airflow integration
- Spark debugging & logging
- Nessie integration
- IOMETE SDK

**Natural Connections:**
- → Virtual Lakehouses (execution environment)
- → Iceberg Maintenance (compaction jobs)
- → Blog: Job Orchestrator Design
- → Jupyter Notebooks (alternative interface)
- → Data sources (JDBC, CSV, JSON, etc.)

---

### 5. **Identity, Access & Security** (Enterprise Focus)
**Hub Pages:**
- `/docs/user-guide/iam/roles.md` - Roles overview
- `/docs/user-guide/data-security/overview.mdx` - Security hub
- `/docs/user-guide/iam/sso/sso.md` - SSO configuration

**Cluster Content:**
- Users, Groups, Roles
- SSO providers (Okta, OneLogin, Entra ID)
- SCIM provisioning
- LDAP configuration
- Data masking & row-level filtering
- Tag-based policies
- RAS (Resource Access System)

**Natural Connections:**
- → Architecture (IAM service explanation)
- → Blog: Data Platform Security
- → Blog: LDAP Integration
- → API Reference (token-based access)
- → Secrets management

---

### 6. **Deployment & Infrastructure** (DevOps Focus)
**Hub Pages:**
- `/docs/deployment/kubernetes.md` - k8s setup guide
- `/docs/community-deployment/overview.md` - Community edition
- `/docs/deployment/backend-databases.md` - Database requirements

**Cluster Content:**
- Cloud-specific guides (AWS, Azure, GCP)
- On-premise installation
- Network policies
- Ingress configuration
- Custom DNS
- MinIO, MySQL, PostgreSQL deployment
- Truststore configuration

**Natural Connections:**
- → Architecture (deployment layer)
- → Blog: Deployment Models
- → Blog: Kubernetes-Native Architecture
- → Blog: On-Premise Lakehouse
- → Storage configs
- → Life cycle management

---

### 7. **Data Integration & BI Tools** (Analyst Focus)
**Hub Pages:**
- `/docs/tutorials/sync-data-from-jdbc-sources.md` - End-to-end tutorial
- `/docs/reference/data-sources/jdbc-sources.mdx` - JDBC reference

**Cluster Content:**
- All BI integrations (Power BI, Tableau, Metabase, Superset, Redash)
- DBT integration & materializations
- Data source references (CSV, JSON, Parquet, ORC, Snowflake)
- DBeaver & DataGrip
- Git integration

**Natural Connections:**
- → Virtual Lakehouses (connection details)
- → SQL Editor Dashboards
- → Tutorials (practical guides)
- → SQL Quick Start guides
- → Connection options

---

### 8. **SQL & Query Reference** (Technical Reference)
**Hub Pages:**
- `/docs/reference/sql-quick-start/sql-ddl-examples.md` - Quick start
- `/docs/reference/spark-sql/queries/select.md` - Core query syntax

**Cluster Content:**
- All DDL commands (CREATE, ALTER, DROP)
- All DML operations (INSERT, UPDATE, DELETE, MERGE)
- Query clauses (WHERE, GROUP BY, HAVING, ORDER BY, etc.)
- Functions, operators, literals
- Window functions & CTEs
- Cache & hints

**Natural Connections:**
- → Iceberg writes & queries
- → Tutorials (practical examples)
- → SQL Editor
- → Blog: Long SQL Query Optimization
- → Blog: Common Table Expressions

---

## Hub-and-Spoke Model Mapping

### Tier 1 Pillars (Should have 15+ outgoing links, receive 20+ incoming)
1. **What is IOMETE** (`/docs/getting-started/what-is-iomete.md`)
   - Links to: All major feature areas, deployment options, use cases
   - Linked from: Homepage, architecture, all getting-started pages

2. **Architecture** (`/docs/getting-started/architecture.md`)
   - Links to: All service components, deployment guides, user guides
   - Linked from: Getting started, deployment guides, technical blogs

3. **Iceberg Getting Started** (`/docs/reference/iceberg-tables/getting-started.mdx`)
   - Links to: All Iceberg operations, maintenance, procedures, tutorials
   - Linked from: Architecture, blogs, tutorials, spark jobs

4. **Virtual Lakehouses** (`/docs/user-guide/virtual-lakehouses.md`)
   - Links to: Node types, connections, SQL editor, BI tools, workspaces
   - Linked from: Getting started, architecture, tutorials, integrations

5. **Data Security Overview** (`/docs/user-guide/data-security/overview.mdx`)
   - Links to: All policy types, IAM components, API reference
   - Linked from: Architecture, roles, groups, enterprise blogs

### Tier 2 Hubs (Should have 8-12 outgoing links, receive 10+ incoming)
6. Spark Jobs Overview
7. SSO Configuration
8. JDBC Sources Tutorial
9. Iceberg Maintenance
10. SQL Quick Start
11. Deployment Overview
12. Open Source Spark Jobs Marketplace
13. Roles & Permissions
14. Backend Databases
15. Kubernetes Setup

### Spokes (Should have 3-5 contextual links)
- Individual DDL/DML reference pages
- Specific BI tool guides
- Cloud provider deployment pages
- Individual marketplace jobs
- Specific SQL query clauses

---

## Cross-Linking Opportunities

### 1. Blog ↔ Documentation

**High-Priority Blog Post Linking:**

| Blog Post | Should Link To | Why |
|-----------|---------------|-----|
| Iceberg Maintenance Runbook | maintenance.mdx, iceberg-procedures.mdx, compaction job | Technical deep-dive needs operational docs |
| Iceberg Deep Dive (CoW) | getting-started.mdx, writes.mdx, ddl.mdx | Explains concepts shown in docs |
| Data Platform Security | data-security/overview.mdx, iam/roles.md, iam/ras/ras.md | Real-world implementation of doc concepts |
| Job Orchestrator Design | spark-jobs.md, getting-started (spark-job) | Explains underlying system architecture |
| Databricks Alternatives | what-is-iomete.md, architecture.md, deployment models | Sales content → product docs |
| Why Apache Iceberg Wins | iceberg-tables/getting-started.mdx | Marketing → technical guide |
| Kubernetes-Native Architecture | deployment/kubernetes.md, architecture.md | Technical blog → deployment guides |
| On-Premise Lakehouse | community-deployment/overview.md, deployment guides | Use case → implementation |
| LDAP Integration | iam/ldap-configuration.md | Feature announcement → how-to |
| Snowflake vs IOMETE | what-is-iomete.md, deployment models | Comparison → product info |

**Documentation → Blog (Related Reading):**
Every major doc page should have "Related Articles" section linking to 2-3 relevant blogs.

---

### 2. Tutorial ↔ Reference Documentation

**Tutorial Enhancement (Add "Learn More" Sections):**

`/docs/tutorials/sync-data-from-jdbc-sources.md` should link to:
- `/docs/reference/data-sources/jdbc-sources.mdx` (detailed reference)
- `/docs/reference/sql-quick-start/tables-from-jdbc-csv-json.md` (alternative approaches)
- `/docs/reference/spark-sql/ddl/create-table.mdx` (DDL syntax)
- `/docs/reference/iceberg-tables/writes.mdx` (MERGE syntax)
- `/docs/integrations/bi/` (visualization after migration)

`/docs/tutorials/compaction-cow-mor.md` should link to:
- `/docs/reference/iceberg-tables/maintenance.mdx` (comprehensive guide)
- `/docs/reference/iceberg-tables/iceberg-procedures.mdx` (procedure syntax)
- `/docs/open-source-spark-jobs/data-compaction-job.mdx` (automation)
- Blog: Iceberg Maintenance Runbook (operational guide)

`/docs/tutorials/export-as-a-csv-file.md` should link to:
- `/docs/reference/data-sources/csv-files.mdx` (format details)
- `/docs/aws/s3-bucket-permissions.md` (already linked)
- `/docs/user-guide/secrets.md` (secure credential storage)

---

### 3. Getting Started → Advanced Topics

**Progressive Disclosure Pattern:**

`/docs/getting-started/what-is-iomete.md` should link to:
- Architecture (already mentioned conceptually)
- Virtual Lakehouses (compute layer)
- Spark Jobs (data processing)
- Iceberg Getting Started (storage format)
- Data Security Overview (security layer)
- Quick Start Tutorial (hands-on)
- Deployment Overview (installation)

`/docs/getting-started/architecture.md` should link to:
- Each microservice mentioned (IAM, SQL Service, Catalog, etc.)
- Virtual Lakehouses (workloads section)
- Spark Jobs (workloads section)
- Jupyter Notebooks (workloads section)
- Data Security (security section)
- Spark History (monitoring section)
- Hive/Iceberg Metastore (catalogs section)

---

### 4. Reference Documentation Internal Linking

**SQL Reference Cross-Links:**
- Each query clause should link to related clauses
  - WHERE → HAVING (filtering)
  - GROUP BY → HAVING, aggregate functions
  - ORDER BY → SORT BY, CLUSTER BY, DISTRIBUTE BY
  - JOIN → lateral-view, subqueries
  - CTE → SELECT, subqueries
  - Window Functions → ORDER BY, PARTITION BY

**Iceberg Reference Cross-Links:**
- DDL → Writes → Queries → Maintenance → Procedures (circular knowledge flow)
- Each should link to relevant blog posts for practical examples

**Data Sources Cross-Links:**
- All data source pages should link to:
  - JDBC Sources (most comprehensive)
  - SQL Quick Start (how to use)
  - Tutorials (practical examples)
  - Secrets (credential management)

---

### 5. Integration Guides Cross-Links

**BI Tools Should All Link To:**
- Virtual Lakehouses (connection source)
- SQL Editor Dashboards (alternative)
- JDBC/ODBC drivers (technical details)
- Create Personal Access Token (authentication)

**Power BI Specific:**
- `/docs/integrations/bi/power-bi.md` → power-bi-odbc.md, power-bi-arrow-flight.md
- Create comprehensive "Power BI Hub" with all connection methods

**DBT Integration:**
- Link all three DBT pages together (getting-started, materializations, incremental-models)
- Link to Iceberg Writes (for MERGE operations)
- Link to Virtual Lakehouses (execution environment)

---

## Priority Implementation Plan

### Phase 1: Critical Hubs (Week 1-2)
**Goal:** Establish main navigation pathways

**Actions:**
1. **Fix Top 5 Pillar Pages** (15-20 links each):
   - what-is-iomete.md: Add links to all major sections
   - architecture.md: Link to all services and components mentioned
   - getting-started.mdx (Iceberg): Link to all operations
   - virtual-lakehouses.md: Link to connections, node types, settings
   - data-security/overview.mdx: Link to all policy types

2. **Create "Related Content" Sections:**
   - Template: ## Related Documentation / ## See Also / ## Next Steps
   - Add to all Tier 1 & 2 hub pages

**Success Metric:** Average links per hub page >12

---

### Phase 2: Blog Integration (Week 3-4)
**Goal:** Connect blog thought leadership to documentation

**Actions:**
1. **Add Documentation Links to Top 20 Blogs:**
   - Iceberg blogs (5 posts) → Iceberg docs
   - Security blog → Security docs
   - Deployment blogs (4 posts) → Deployment docs
   - Kubernetes blogs (3 posts) → K8s setup
   - Job orchestrator → Spark Jobs
   - Databricks/Snowflake comparisons → What is IOMETE

2. **Add "Related Articles" to Documentation:**
   - Iceberg maintenance.mdx → 3 Iceberg blogs
   - Spark jobs.md → Job orchestrator blog
   - IAM docs → Security blog, LDAP blog
   - Deployment docs → Kubernetes blogs, on-prem blogs

**Success Metric:** Every blog with technical content has 2-3 doc links; Every major doc has 1-2 blog links

---

### Phase 3: Tutorial & Reference Linking (Week 5-6)
**Goal:** Create learning pathways from tutorials to references

**Actions:**
1. **Enhance 3 Tutorials:**
   - sync-data-from-jdbc-sources.md: Add 8-10 reference links
   - compaction-cow-mor.md: Add 6-8 links to Iceberg docs
   - export-as-a-csv-file.md: Add 5-6 links

2. **Cross-Link SQL Reference:**
   - Add "Related Clauses" section to each query page
   - Link DDL to Iceberg DDL where applicable
   - Add "See Also" to every reference page (minimum 3 links)

3. **Connect Data Sources:**
   - Create hub structure for data-sources/ directory
   - Link all formats to JDBC sources and tutorials

**Success Metric:** Tutorial pages have 8+ links; Reference pages have 4+ links

---

### Phase 4: Deployment & Integration Guides (Week 7-8)
**Goal:** Help users get started and integrate tools

**Actions:**
1. **Fix Deployment Orphans:**
   - community-deployment/overview.md → Link to all provider guides
   - Each cloud provider guide → Link to prerequisites, troubleshooting
   - kubernetes.md → Link to sizing, monitoring, private registry

2. **Integrate BI Tools:**
   - Create BI integration hub page
   - Link all BI tools to virtual-lakehouses connections
   - Cross-link similar tools (Power BI variants, DBT pages)

3. **Connect Developer Guides:**
   - spark-job/getting-started → Link to marketplace, templates
   - drivers (JDBC, SQLAlchemy) → Link to connection guides
   - notebooks → Link to getting started, examples

**Success Metric:** No deployment page with <3 links; All BI guides linked to lakehouses

---

### Phase 5: Systematic Orphan Reduction (Week 9-10)
**Goal:** Eliminate remaining orphans through strategic linking

**Priority Orphans to Connect:**

**High-Value Orphans (Should be linked from 3+ places):**
1. `/docs/getting-started/scalability.md` → Link from architecture, what-is-iomete, deployment
2. `/docs/user-guide/data-catalog.md` → Link from architecture, getting-started, catalog service
3. `/docs/user-guide/secrets.md` → Link from spark-jobs, tutorials, integrations
4. `/docs/user-guide/workspaces.md` → Link from virtual-lakehouses, storage-configs
5. `/docs/user-guide/volumes.md` → Link from virtual-lakehouses, spark-jobs
6. `/docs/deployment/network-policies.md` → Link from kubernetes, security overview
7. `/docs/k8s/monitoring.md` → Link from kubernetes, deployment, architecture
8. `/docs/troubleshooting/` (all pages) → Link from related feature docs

**Actions:**
1. **Create Troubleshooting Hub:**
   - Link from every major feature (Lakehouses, Spark Jobs, SQL Editor)
   - Add "Common Issues" sections to user guides

2. **Fix Settings & Configuration Pages:**
   - global-spark-settings.md → Link from virtual-lakehouses, spark-jobs
   - email-settings.md → Link from IAM, users
   - docker-tag-aliases.md → Link from spark-jobs, deployment
   - node-types.md → Link from virtual-lakehouses, sizing guide

3. **Connect Release Notes:**
   - All `/docs/deployment/on-prem/releases/` → Link from deployment overview
   - Create "Release History" hub page

**Success Metric:** Orphan pages reduced from 234 to <75

---

### Phase 6: Advanced Cross-Linking & Optimization (Week 11-12)
**Goal:** Create contextual links and topic clusters

**Actions:**
1. **Create Glossary Link Integration:**
   - Extract glossary from what-is-iomete.md
   - Create dedicated glossary page
   - Link key terms throughout documentation

2. **Add "Prerequisites" Sections:**
   - Advanced tutorials → Link to basic concepts
   - Integration guides → Link to required setup steps

3. **Create "Learning Paths":**
   - Beginner path: What is IOMETE → Virtual Lakehouses → SQL Editor → First Query
   - Developer path: Architecture → Spark Jobs → JDBC Integration → Tutorial
   - Admin path: Deployment → IAM → Security → Monitoring
   - Data Engineer path: Iceberg → Maintenance → Compaction → Best Practices

4. **Implement Breadcrumb Enhancement:**
   - Every reference page links to its section hub
   - Every guide links to parent category

**Success Metric:** Average links per page >5; Clear navigation paths exist for all user types

---

## Specific Linking Recommendations

### Top 50 Pages with 0 Links - What to Add

#### Getting Started Section
| Page | Add Links To |
|------|-------------|
| `scalability.md` | architecture.md, virtual-lakehouses.md, node-types.md, deployment/kubernetes.md |
| `support.md` | getting-started/overview, troubleshooting/*, community links |
| `_console-tour.md` | platform-tour.md, virtual-lakehouses.md, sql-editor/worksheets.md |

#### AWS Section
| Page | Add Links To |
|------|-------------|
| `s3-bucket-permissions.md` | storage-configs.md, secrets.md, deployment/aws/permissions.mdx |
| `glue-catalog-permissions.md` | spark-catalogs/external-glue.md, iam/roles.md |

#### Deployment Section
| Page | Add Links To |
|------|-------------|
| `backend-databases.md` | mysql-deployment.md, postgresql-deployment.md, deployment/overview |
| `kubernetes.md` | monitoring.md, network-policies.md, node-sizing guide |
| `network-policies.md` | kubernetes.md, deployment/overview, security/overview |
| `truststore.md` | deployment/overview, security configuration |

#### User Guide Section
| Page | Add Links To |
|------|-------------|
| `data-catalog.md` | architecture.md, catalog service, metadata management |
| `secrets.md` | spark-jobs.md, integrations/*, tutorials/* |
| `email-settings.md` | iam/users.md, notification configuration |
| `global-spark-settings.md` | virtual-lakehouses.md, spark-jobs.md, spark-settings/overview.md |
| `workspaces.md` | virtual-lakehouses.md, storage-configs.md, volumes.md |
| `volumes.md` | virtual-lakehouses.md, workspaces.md, spark-jobs.md |

#### IAM Section
| Page | Add Links To |
|------|-------------|
| `groups.md` | users.md, roles.md, sso/*, data-security/* |
| `roles.md` | users.md, groups.md, permissions, control policies |
| `ldap-configuration.md` | iam/users.md, sso/sso.md, blog: LDAP integration |
| `sso/*.md` (all SSO pages) | iam/users.md, roles.md, groups.md, each other |

#### Data Security Section
| Page | Add Links To |
|------|-------------|
| Each policy type | overview.mdx, iam/roles.md, api-reference.md |
| `ras/ras.md` | storage-configs.md, roles.md, blog: data-platform-security |

#### Reference - Iceberg Tables Section
| Page | Add Links To |
|------|-------------|
| `ddl.mdx` | getting-started.mdx, spark-sql/ddl/*, writes.mdx |
| `queries.mdx` | getting-started.mdx, time-travel.mdx, spark-sql/queries/* |
| `time-travel.mdx` | getting-started.mdx, queries.mdx, snapshots, blog posts |
| `writes.mdx` | getting-started.mdx, ddl.mdx, maintenance.mdx, spark-sql/writes/* |

#### Reference - Spark SQL Section
| Page | Add Links To (for each) |
|------|-------------|
| All DDL pages | Related DDL operations, iceberg-tables/ddl.mdx, examples |
| All query clauses | Related clauses, select.md, examples, tutorials |
| All writes | iceberg-tables/writes.mdx, tutorials, examples |
| `functions.md` | Query pages using functions, window-functions, operators |
| `operators.md` | Query pages, functions.md, literals.md |

#### Reference - Data Sources Section
| Page | Add Links To |
|------|-------------|
| All format pages | jdbc-sources.mdx, tutorials/sync-data-from-jdbc-sources.md, sql-quick-start |

#### SQL Quick Start Section
| Page | Add Links To |
|------|-------------|
| `iceberg-advanced-features.md` | iceberg-tables/*, maintenance.mdx, procedures.mdx |
| `ms-sql-server-datasource.md` | jdbc-sources.mdx, oracle-datasource.md, tutorials |
| `oracle-datasource.md` | jdbc-sources.mdx, spark-catalogs/*, tutorials |

#### Developer Guide Section
| Page | Add Links To |
|------|-------------|
| `jdbc-driver.mdx` | connection-options.md, virtual-lakehouses.md, integrations/dbtools/* |
| `sql-alchemy-driver.md` | jdbc-driver.mdx, connection-options.md, jupyter notebooks |
| `notebook/*.mdx` | getting-started-with-jupyter.md, spark-jobs.md, driver docs |
| `spark-job/*.md` | spark-jobs.md, marketplace, examples, configuration |

#### Open Source Spark Jobs Section
| Page | Add Links To |
|------|-------------|
| `getting-started.mdx` | spark-jobs.md, developer-guide/spark-job/getting-started.md |
| Each marketplace job | getting-started.mdx, related docs, tutorials, spark-jobs.md |

#### Integrations Section
| Page | Add Links To |
|------|-------------|
| All BI tools | virtual-lakehouses.md, connection-options.md, sql-editor/dashboards.md |
| DBT pages | Link to each other, iceberg-tables/writes.mdx, virtual-lakehouses.md |
| `dbeaver.md` | jdbc-driver.mdx, connection-options.md, other db tools |
| `git-integration.md` | spark-jobs.md, notebooks, version control |

#### Kubernetes Section
| Page | Add Links To |
|------|-------------|
| `cpu-vs-vcpu.md` | node-types.md, sizing guide, virtual-lakehouses.md |
| `monitoring.md` | kubernetes.md, deployment/*, architecture.md |
| `private-docker-registry.md` | spark-jobs.md, deployment/*, docker-tag-aliases.md |
| `spark-executor-shuffle-storage-options.md` | virtual-lakehouses.md, node-types.md, sizing guide |

#### Troubleshooting Section
| Page | Add Links To |
|------|-------------|
| `python-errors.md` | notebooks/*, spark-job/*, pyspark/* |
| `sql-query-errors.md` | sql-editor/*, spark-sql/*, iceberg-tables/* |

#### Tutorials Section
| Page | Add Links To |
|------|-------------|
| `compaction-cow-mor.md` | maintenance.mdx, procedures.mdx, compaction job, blogs |

---

### Orphan Pages - Where to Link From

**Critical Orphans (high-value, currently isolated):**

| Orphan Page | Should Be Linked From |
|-------------|---------------------|
| `getting-started/scalability.md` | what-is-iomete.md, architecture.md, deployment guides |
| `getting-started/support.md` | what-is-iomete.md, all troubleshooting pages, footer |
| `user-guide/data-catalog.md` | architecture.md (catalog service), getting-started, metadata management |
| `user-guide/secrets.md` | spark-jobs.md, all integration guides, tutorials (JDBC) |
| `user-guide/workspaces.md` | virtual-lakehouses.md, storage-configs.md |
| `deployment/network-policies.md` | kubernetes.md, deployment/overview, security docs |
| `k8s/monitoring.md` | kubernetes.md, architecture.md (monitoring section), deployment guides |
| `troubleshooting/*` | Every related feature page (add "Troubleshooting" section) |

**Connect Community Deployment Pages:**
- All `community-deployment/aws/*` → Link from community-deployment/overview.md
- All `community-deployment/azure/*` → Link from overview
- All `community-deployment/gcp/*` → Link from overview
- All `community-deployment/on-prem/*` → Link from overview
- overview.md → Link from deployment/overview, getting-started

**Connect Release Notes:**
- Create `/docs/deployment/on-prem/release-notes/index.md` as hub
- Link all individual release pages from hub
- Link hub from deployment/overview, changelog blog posts

---

## Content Cluster Deep Dives

### Iceberg Content Cluster - Detailed Linking Map

**Hub Structure:**
```
Iceberg Getting Started (Tier 1 Hub)
├── Operations
│   ├── DDL (CRUD tables)
│   ├── Writes (INSERT, UPDATE, DELETE, MERGE)
│   ├── Queries (SELECT, time travel)
│   └── Time Travel (snapshots, rollback)
├── Maintenance (Tier 2 Hub)
│   ├── Expire Snapshots
│   ├── Remove Orphan Files
│   ├── Compact Data Files
│   └── Rewrite Manifests
├── Procedures Reference
│   └── All system procedures
└── Tutorials & Blogs
    ├── Compaction Tutorial
    ├── Maintenance Runbook Blog
    ├── Deep Dive Blog
    └── Why Iceberg Wins Blog
```

**Implementation:**
1. **Getting Started page** should have sections:
   - "Creating Tables" → link to ddl.mdx
   - "Writing Data" → link to writes.mdx
   - "Querying Data" → link to queries.mdx
   - "Table Maintenance" → link to maintenance.mdx
   - "Advanced Features" → link to time-travel.mdx, procedures.mdx
   - "Practical Examples" → link to tutorial, blogs

2. **Maintenance page** should have sections:
   - "Prerequisites" → link to getting-started.mdx
   - Each maintenance operation → link to procedures.mdx
   - "Automation" → link to data-compaction-job.mdx
   - "Best Practices" → link to Maintenance Runbook blog
   - "Troubleshooting" → link to troubleshooting pages

3. **Each operation page** should have:
   - "Overview" → link to getting-started.mdx
   - "Related Operations" → link to related pages
   - "Procedures Reference" → link to procedures.mdx
   - "Examples" → link to tutorials
   - "Learn More" → link to blogs

---

### Security Content Cluster - Detailed Linking Map

**Hub Structure:**
```
Data Security Overview (Tier 1 Hub)
├── Resource-Based Policies
│   ├── Access Policy
│   ├── Data Masking
│   └── Row-Level Filter
├── Tag-Based Policies
│   ├── Tag-Based Access
│   └── Tag-Based Masking
├── IAM Components
│   ├── Users
│   ├── Groups
│   ├── Roles (Tier 2 Hub)
│   └── RAS (Resource Access System)
├── SSO & Integration (Tier 2 Hub)
│   ├── SSO Overview
│   ├── SAML
│   ├── OIDC
│   ├── Okta
│   ├── OneLogin
│   └── Entra ID
└── Advanced
    ├── LDAP
    ├── SCIM
    └── API Security
```

**Cross-Links to Add:**
- architecture.md → security overview (security section)
- virtual-lakehouses.md → roles.md (permissions)
- spark-jobs.md → roles.md, secrets.md
- api-reference.md → create-access-token.md, data-security-api.md
- All IAM pages → cross-link to each other
- Blog: Data Platform Security → link to all RAS docs

---

### Spark Jobs Content Cluster - Detailed Linking Map

**Hub Structure:**
```
Spark Jobs (User Guide - Tier 1 Hub)
├── Getting Started (Developer Guide - Tier 2 Hub)
│   ├── Custom Jobs
│   ├── Templates
│   ├── Docker Images
│   └── Deployment
├── Marketplace (Tier 2 Hub)
│   ├── MySQL Replication
│   ├── Data Compaction
│   ├── Query Scheduler
│   ├── Catalog Sync
│   ├── Kafka Streaming
│   └── File Streaming
├── Advanced
│   ├── Airflow Integration
│   ├── Nessie Integration
│   ├── Spark Debugging
│   ├── Spark Logging
│   └── IOMETE SDK
└── Configuration
    ├── Application Config
    ├── Spark Settings
    └── Job Orchestrator
```

**Cross-Links to Add:**
- virtual-lakehouses.md → spark-jobs.md (alternative compute)
- architecture.md → spark-jobs.md (workloads section)
- Each marketplace job → getting-started pages, tutorials
- developer-guide/spark-job/* → user-guide/spark-jobs.md
- Blog: Job Orchestrator → spark-jobs.md, architecture.md
- All jobs → link to secrets.md, configuration docs

---

## Linking Patterns & Best Practices

### 1. Contextual Linking Strategy
**When to Link:**
- First mention of concept → Link to definitive guide
- Technical term → Link to glossary or reference
- "Learn more" / "See" / "Read about" → Natural link opportunities
- Prerequisites → Link to required reading
- Related topics → Link to complementary content

**Example Pattern for Tutorials:**
```markdown
## Prerequisites
Before starting this tutorial, you should:
- [Create a Virtual Lakehouse](/docs/user-guide/virtual-lakehouses)
- Understand [JDBC data sources](/docs/reference/data-sources/jdbc-sources)
- Have [S3 bucket permissions](/docs/aws/s3-bucket-permissions) configured

## What You'll Learn
This tutorial covers... For a comprehensive reference, see [SQL Quick Start](/docs/reference/sql-quick-start/sql-ddl-examples).

## Next Steps
Now that you've migrated data, you can:
- [Visualize with Power BI](/docs/integrations/bi/power-bi)
- [Run automated jobs](/docs/user-guide/spark-jobs)
- [Optimize with compaction](/docs/tutorials/compaction-cow-mor)
```

---

### 2. Progressive Disclosure Pattern
**Structure:** Basic → Intermediate → Advanced

**Example for Iceberg:**
1. Getting Started → Basic CRUD operations
2. Writes → Advanced operations (MERGE)
3. Maintenance → Optimization techniques
4. Procedures → Low-level control
5. Blogs → Real-world patterns

**Link Flow:**
- Getting Started mentions "maintenance" → link to maintenance.mdx
- Maintenance shows procedures → link to procedures.mdx
- Procedures need examples → link back to tutorials
- Tutorials want best practices → link to blogs

---

### 3. Hub Page Pattern
**Every hub should have:**

```markdown
# [Topic Name]

[Introduction paragraph with overview]

## Quick Start
- [Link to getting started guide]
- [Link to first tutorial]

## Core Concepts
- [Link to concept 1] - Brief description
- [Link to concept 2] - Brief description
- [Link to concept 3] - Brief description

## How-To Guides
- [Link to guide 1]
- [Link to guide 2]
- [Link to guide 3]

## Reference Documentation
- [Link to reference 1]
- [Link to reference 2]

## Related Topics
- [Link to related topic 1]
- [Link to related topic 2]

## Further Reading
- [Link to blog 1]
- [Link to blog 2]
```

---

### 4. Reference Page Pattern
**Every reference page should have:**

```markdown
# [Command/Feature Name]

[Brief description]

## Syntax
[Syntax block]

## Parameters
[Parameter descriptions]

## Examples
[Code examples]

## Related Commands
- [Link to related command 1]
- [Link to related command 2]
- [Link to related command 3]

## See Also
- [Link to conceptual guide]
- [Link to tutorial]
- [Link to parent reference]
```

---

### 5. Tutorial Pattern
**Every tutorial should have:**

```markdown
# [Tutorial Title]

[What you'll learn in this tutorial]

## Prerequisites
- [Link to prerequisite 1]
- [Link to prerequisite 2]

## Overview
[High-level explanation with links to concepts]

## Steps
[Step-by-step instructions with contextual links]

## Troubleshooting
[Link to troubleshooting page]

## Next Steps
- [Link to related tutorial]
- [Link to advanced topic]
- [Link to reference documentation]

## Related Articles
- [Blog post 1]
- [Blog post 2]
```

---

## Link Equity Distribution Strategy

### High-Value Pages (Should Receive Most Links)
**Priority 1 (Target: 20+ incoming links):**
1. What is IOMETE
2. Architecture
3. Virtual Lakehouses
4. Iceberg Getting Started
5. Data Security Overview

**Priority 2 (Target: 10-15 incoming links):**
6. Spark Jobs
7. SSO Configuration
8. Roles
9. Deployment Overview
10. Kubernetes Setup
11. JDBC Tutorial
12. Iceberg Maintenance
13. Backend Databases
14. SQL Quick Start
15. Marketplace Hub

**How to Achieve:**
- Link from navigation elements
- Link from all related pages
- Link from blogs discussing these topics
- Link from tutorials as prerequisites
- Link from troubleshooting pages

---

### Link Distribution by Page Type

**Hub Pages:** 15-25 outgoing links, 15-30 incoming links
- Comprehensive overview with links to all cluster content
- Linked from navigation, parent pages, related topics

**Tutorial Pages:** 8-12 outgoing links, 5-10 incoming links
- Prerequisites, concepts, next steps
- Linked from hubs, related tutorials, blogs

**Reference Pages:** 4-8 outgoing links, 3-8 incoming links
- Related references, parent hub, tutorials
- Linked from tutorials, hubs, other references

**Blog Pages:** 3-6 outgoing links, 2-5 incoming links
- Related docs, other blogs
- Linked from docs, related blogs

**Orphan/Specialized Pages:** 3-5 outgoing links, 2-4 incoming links
- Parent hub, related pages
- Linked from hub, specific use cases

---

## Automation & Maintenance

### Monthly Review Tasks
1. **Audit New Content:**
   - Every new page should have minimum 3 links
   - Add new pages to relevant hubs
   - Update related pages with links to new content

2. **Broken Link Check:**
   - Run automated link checker
   - Fix or redirect broken links
   - Update changed URLs

3. **Orphan Detection:**
   - Identify pages with <2 incoming links
   - Add to relevant hubs
   - Create contextual links

4. **Link Quality Review:**
   - Ensure link text is descriptive
   - Verify links add value (not just for SEO)
   - Check for circular linking issues

### Quarterly Analysis
1. **Traffic Patterns:**
   - Identify high-traffic pages
   - Ensure they link to related content
   - Add CTAs to guide users

2. **Content Gaps:**
   - Pages with high bounce rates need better linking
   - Dead-end pages need "next steps" links
   - Isolated clusters need connecting

3. **User Journey Mapping:**
   - Track common navigation paths
   - Strengthen weak connections
   - Add shortcut links for common journeys

---

## Success Metrics

### Immediate Targets (Month 1)
- [ ] Average links per page: 5+
- [ ] Hub pages with 15+ links: 10
- [ ] Orphan pages reduced to: <150
- [ ] Broken links fixed: 100%
- [ ] Top 20 blogs linked to docs: 100%

### Short-Term Goals (Month 3)
- [ ] Average links per page: 6+
- [ ] Hub pages with 15+ links: 15
- [ ] Orphan pages reduced to: <75
- [ ] All tutorials have 8+ links: 100%
- [ ] All reference pages have 4+ links: 80%

### Long-Term Goals (Month 6)
- [ ] Average links per page: 7-8
- [ ] Hub pages with 15+ links: 20
- [ ] Orphan pages reduced to: <50
- [ ] All pages have 3+ links: 90%
- [ ] Clear learning paths exist: 5+

### SEO Impact Metrics
- Pages ranking for related keywords
- Average session duration increase
- Bounce rate decrease
- Pages per session increase
- Internal search usage decrease (finding content easier)

---

## Implementation Checklist

### Week 1-2: Foundation
- [ ] Fix What is IOMETE (add 15+ links)
- [ ] Fix Architecture (add 15+ links)
- [ ] Fix Virtual Lakehouses (add 12+ links)
- [ ] Fix Iceberg Getting Started (add 15+ links)
- [ ] Fix Data Security Overview (add 12+ links)

### Week 3-4: Blog Integration
- [ ] Add doc links to Iceberg Maintenance Runbook
- [ ] Add doc links to Iceberg Deep Dive
- [ ] Add doc links to Data Platform Security
- [ ] Add doc links to Job Orchestrator Design
- [ ] Add doc links to Databricks Alternatives
- [ ] Add doc links to 15 more high-traffic blogs
- [ ] Add "Related Articles" to 10 major doc pages

### Week 5-6: Tutorials & References
- [ ] Enhance JDBC tutorial (8+ links)
- [ ] Enhance Compaction tutorial (6+ links)
- [ ] Enhance CSV export tutorial (5+ links)
- [ ] Cross-link all SQL query clauses
- [ ] Cross-link all Iceberg operations
- [ ] Cross-link all data sources

### Week 7-8: Integrations & Deployment
- [ ] Fix community deployment overview
- [ ] Link all AWS deployment pages
- [ ] Link all Azure deployment pages
- [ ] Link all GCP deployment pages
- [ ] Cross-link all BI tools
- [ ] Cross-link all DBT pages
- [ ] Link all developer guides

### Week 9-10: Orphan Reduction
- [ ] Connect all getting-started orphans
- [ ] Connect all user-guide orphans
- [ ] Connect all deployment orphans
- [ ] Connect all IAM orphans
- [ ] Create troubleshooting hub
- [ ] Connect all K8s pages
- [ ] Connect all release notes

### Week 11-12: Optimization
- [ ] Create glossary page with term linking
- [ ] Add prerequisites to advanced pages
- [ ] Create 3 learning path guides
- [ ] Implement breadcrumb linking
- [ ] Add "Next Steps" to all tutorials
- [ ] Review and optimize all hubs

---

## Conclusion

This internal linking strategy transforms IOMETE documentation from isolated pages into an interconnected knowledge graph. By implementing this plan systematically over 12 weeks, we will:

1. **Improve User Experience:** Readers find related content naturally
2. **Boost SEO:** Distribute link equity strategically
3. **Increase Engagement:** Reduce bounce rates, increase pages per session
4. **Support Learning Journeys:** Guide users from basic to advanced topics
5. **Reduce Support Load:** Better self-service through connected documentation

**Key Success Factors:**
- Start with high-value hubs (Phases 1-2)
- Connect blogs to documentation (Phase 2)
- Build out clusters systematically (Phases 3-4)
- Eliminate orphans strategically (Phase 5)
- Optimize and maintain (Phase 6)

**Next Steps:**
1. Review and approve this strategy
2. Assign implementation ownership for each phase
3. Set up tracking for success metrics
4. Begin Phase 1 implementation
5. Schedule weekly progress reviews

---

*This strategy document should be treated as a living document, updated quarterly based on content additions, user feedback, and analytics data.*
