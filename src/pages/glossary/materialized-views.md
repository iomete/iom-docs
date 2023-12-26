---
title:  What are Materialized Views?
description: Explore the concept of materialized views, which store precomputed data as physical tables, making them ideal for frequently performed complex queries or aggregations. Learn how to easily create materialized views using the IOMETE SQL Editor and set up automatic refreshes for up-to-date data.
---

# Materialized Views

**Materialized views** differ from regular database views as they store precomputed data as a physical table. This feature makes them well-suited for handling complex queries or aggregations that are frequently performed.

Creating a materialized view is straightforward with the IOMETE SQL Editor. Simply use the CREATE MATERIALIZED VIEW statement and specify the base tables. Additionally, you have the option to set up automatic refreshes on a predefined schedule to ensure your data remains up-to-date.
