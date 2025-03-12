---
title: What is common table expression?
description: Common Table Expressions (CTEs) are a powerful feature in SQL that allows you to define temporary result sets that can be referenced multiple times within a SQL statement
slug: common-table-expression
hide_table_of_contents: true
tags2: [Engineering]
authors: aytan
banner_description: powerful feature in IOMETE SQL editor that allows you to define temporary result sets
coverImage: img/blog/thumbnails/3.png
---

import MiniCard from "@site/src/components/MiniCard";

Common Table Expressions (CTEs) are a powerful feature in SQL that allows you to define temporary result sets that can be referenced multiple times within a SQL statement. They are often used in SELECT statements to simplify complex queries and improve readability.

<!-- truncate -->

## **What is SQL WITH Clause?**

A CTE is defined using the WITH clause, followed by the name of the expression and the query that defines it. The result of the query is stored temporarily and can be referenced later in the main SQL statement.

Here's an example to illustrate how CTEs work:

```sql
WITH cte AS ( SELECT column1, column2 FROM table1 WHERE condition)
SELECT * FROM cte JOIN table2 ON cte.column1 = table2.column1;
```

In this example, the CTE named **`cte`** is the result of the SELECT statement. It can then be referenced in the main SELECT statement to join another table by selecting **`column1`** and **`column2`** from **`table1`** based on a specified condition.

## **How to Use a CTE**

To employ a CTE, you need to define it within your SQL query. The syntax for creating a CTE is as follows:

```sql
WITH <CTE_name> (<column_name>, ...) AS (
  <query>
)
```

- **`WITH`**: This keyword is used to define the CTE.
- **`<CTE_name>`**: Assign a name to your CTE.
- **`<column_name>`**: Specify the column names for your CTE (optional).
- **`<query>`**: Write the query that defines the CTE.

Once you've defined a CTE, you can utilize it in your main SQL statement using the **`FROM`** clause:

```sql
SELECT *
FROM <CTE_name>
WHERE ...
```

## **Advantages of Using CTEs**

CTEs offer several benefits when working with SQL:

1. **Enhanced Readability:** CTEs help simplify intricate queries, making your SQL code more comprehensible.
2. **Reusability:** You can reuse CTEs across multiple queries, saving time and effort when dealing with similar data processing tasks.
3. **Nesting Flexibility:** CTEs can be nested within one another, empowering you to craft complex queries methodically.

## **Disadvantages of Using CTEs**

Despite their advantages, CTEs have certain drawbacks:

1. **Readability Challenges:** Excessive use of CTEs can lead to overly complicated SQL queries, potentially making them harder to follow.
2. **Performance Considerations:** In some scenarios, CTEs may not be as efficient as alternative SQL constructs like subqueries or temporary tables.
3. **Limited Compatibility:** CTEs may not be supported in all SQL dialects, so their usage can be constrained based on your database platform.

## **How to Write SQL Queries Using Common Table Expressions?**

Now, let's explore how to write SQL queries using CTEs with practical examples. Example: Payment amounts are greater than the average payment amount

Example using a Common Table Expression (CTE) with the **`demo_db.customer`** table and the **`PAYMENT_AMT`** column to select customers whose payment amounts are greater than the average payment amount:. Here's how you can use a CTE:

```sql
-- Define a Common Table Expression (CTE) named average_payment
WITH average_payment AS (
    SELECT AVG(PAYMENT_AMT) AS avg_payment_amt
    FROM demo_db.customer
)
-- Select customers with payment amounts greater than the average
SELECT c.*
FROM demo_db.customer c
JOIN average_payment a ON c.PAYMENT_AMT > a.avg_payment_amt;
```

![CTE example](/img/blog/2023-09-14-common-table-expression/common-table-expression-example.png)

In this example:

1. We create a CTE named **`average_payment`** that calculates the average payment amount (**`avg_payment_amt`**) from the **`demo_db.customer`** table.
2. After defining the CTE, we query it in the subsequent SELECT statement. We select all columns (**`c.*`**) from the **`demo_db.customer`** table and join it with the **`average_payment`** CTE on the condition that the customer's **`PAYMENT_AMT`** is greater than the calculated average payment amount.

This query return the customer records where the **`PAYMENT_AMT`** is higher than the average payment amount in the **`demo_db.customer`** table.

<!-- <MiniCard link="https://sandbox.iomete.com/auth/realms/iomete/protocol/openid-connect/registrations?client_id=app&response_type=code&scope=openid&redirect_uri=http://sandbox.iomete.com" linkName="Try Sandbox">Discovering the data lakehouse platform?</MiniCard> -->

## Using multiple CTE

```sql
WITH cte1 AS (
    SELECT 1
),
cte2 AS (
    SELECT 2
)
SELECT *
FROM cte1, cte2;
```

Now, let's explain the query step by step:

- **Common Table Expressions (CTEs)**: Two CTEs are defined - cte1 and cte2.

- **cte1** selects the integer 1
- **cte2** selects the integer 2

- **SELECT Statement**: The main SELECT statement retrieves data from these CTEs.

**Comma**: separates cte1 and cte2, indicating that you're defining two separate CTEs. Each CTE can be thought of as a temporary table or result set that you can reference within the main query.

**Cross Join**: The query uses a cross join (cartesian product) to combine the rows from cte1 and cte2. Since there is no explicit JOIN condition or WHERE clause, this results in a combination of all possible rows from the two CTEs.

**Result Set**: The result set will have one row for each combination of rows from cte1 and cte2, resulting in 1 x 1 = 1 row. The columns in the result set will be the values 1 and 2 from cte1 and cte2, respectively.

So, the final result of this query will be a single row with the values 1 and 2.

![multiple CTE example](/img/blog/2023-09-14-common-table-expression/multiple-cte-example.png)

## **Conclusion**

CTEs are particularly useful when performing complex calculations or transformations on a subset of data before using it in the main query. They can also improve query performance by allowing the database to optimize the execution plan. If you have any specific questions or need more detailed examples, feel free to ask

You can find more information about CTEs in the [IOMETE documentation](/reference/spark-sql/common-table-expression-cte) section of our documentation.
