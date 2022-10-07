---
slug: cheat-sheet-for-apache-iceberg
title: Spark SQL Cheat Sheet for Apache Iceberg
authors: fuad
hide_table_of_contents: true
tags: [Engineering]
---

Apache Iceberg is a high-performance format for huge analytic tables. It has built-in metadata tables for inspection and procedures for data compaction and table maintenance. Also, its snapshot architecture making it easy time-travel over data versions.

<!-- truncate -->

In the lakehouse platform, we are using Apache Iceberg with Apache Spark. Even though Apache Iceberg has great [documentation](https://iceberg.apache.org/docs/latest/getting-started) for working with Spark SQL, we have created a helpful cheat sheet for quick access to the most popular commands.

We included DDL operations for creating databases and tables, altering table structures, basic read / write queries, SQL queries for time travel. In the third column we included base Apache Iceberg SQL procedures with arguments that are most likely to be used.

![](/blog/2022-08-25-cheat-sheet/iceberg-cheat-sheet.jpeg)

Download the PDF version [here](/blog/2022-08-25-cheat-sheet/iceberg-cheat-sheet.pdf). We hope you find it useful. 🤗