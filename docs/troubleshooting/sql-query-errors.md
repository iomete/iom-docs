---
title: SQL Query Errors
description: This documentation provides details to help investigate user errors in SQL queries
slug: /user-guide/troubleshooting/sql-query-errors
---

import Img from '@site/src/components/Img';

---

## Invalid Namespace Error

<Img src="/img/troubleshooting/sql-query-errors/invalid-namespace.png" alt="invalid-namespace" />

When you encounter an `Invalid Namespace` error while running a query, it means your query is missing a valid database reference. This happens when:  
- You haven't specified a database in your query  
- The specified database doesn't exist  
- You don't have access to the specified database  

To resolve this:  
1. Select a database from the dropdown menu in the top-right corner of the IOMETE SQL Editor  
2. OR explicitly include the database name in your query (e.g., SELECT * FROM database_name.table_name)    

The database reference is required for all queries in IOMETE to ensure they execute in the correct context.

