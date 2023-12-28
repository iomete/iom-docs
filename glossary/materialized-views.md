---
title: Materialized Views
description: Materialized views differ from regular database views as they store precomputed data as a physical table. This feature makes them well-suited for handling complex queries or aggregations that are frequently performed.
tags: [m]
---

# Materialized Views

**Materialized views** differ from regular database views as they store precomputed data as a physical table. This feature makes them well-suited for handling complex queries or aggregations that are frequently performed.

Creating a materialized view is straightforward with the IOMETE SQL Editor. Simply use the CREATE MATERIALIZED VIEW statement and specify the base tables. Additionally, you have the option to set up automatic refreshes on a predefined schedule to ensure your data remains up-to-date.
