---
title: Data Mart
description: A data mart is a curated database designed to serve the specific needs of a single data team, community, or line of business, such as the marketing or engineering department.
---

# Data Mart

## What is a Data Mart?

A data mart is a curated database designed to serve the specific needs of a single data team, community, or line of business, such as the marketing or engineering department. It is smaller and more focused than a data warehouse, generally existing as a subset of an organization's larger enterprise data warehouse. **Data marts are commonly used for analytics, business intelligence, and reporting.**

## Characteristics of Data Marts

- Typically built and managed by the enterprise data team or business unit SMEs.
- Business group data stewards maintain the data mart, and end users have read-only access.
- Typically uses a dimensional model and star schema.
- Contains a curated subset of data from the larger data warehouse.
- Designed around the unique needs of a particular line of business or use case.
- Users typically query the data using SQL commands.

## Types of Data Marts

Today, there are three basic types of Data Marts:

- **Independent data marts:** Not part of a data warehouse and typically focused on one area of business or subject area.
- **Dependent data marts:** Built into an existing data warehouse.
- **Hybrid data marts:** Combine data taken from a data warehouse and "other" data sources.

## Benefits of Data Marts

- Single source of truth for a particular line of business.
- Simplicity for business users looking for data.

## Challenges with Data Marts

Different business units have different data needs and objectives, resulting in data marts becoming data silos and shadow copies of data. When many departments do this, there is no single version of truth.

## How the Data Lakehouse solves the challenges with Data Marts

A Data Lakehouse puts all of the enterprise data warehouses and data marts on one platform, with unified security and governance, while still offering different teams the flexibility to have their own sandboxes. The Data Lakehouse's data catalog ensures that any augmented copy is made discoverable by all, preventing similar duplicate copies.
