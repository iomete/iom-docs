---
title: How-to Sync Data From JDBC Sources
slug: /how-to-sync-data-from-jdbc
---

Intro
-----

This is an end-to-end guide about how to migrate **tables** from JDBC sources (MySQL, PostgreSQL, etc.) to iomete and display it in the BI dashboard. 

> 📘 
> 
> First, you need to establish an SSH tunnel between iomete and your database in your private network. See [Database Connection Options](https://docs.iomete.com/docs/database-connection-options)

***

Database to migrate
-------------------

Let's assume that we want to replicate the MySQL database (or any other supported JDBC database) to the **iomete** warehouse

> 📘 
> 
> In this tutorial, we will be using a publicly accessible iomete-tutorial database instance that contains the [Employees Sample Database. ](https://dev.mysql.com/doc/employee/en/sakila-structure.html)

> 📘 
> 
> In case of connecting to your own database instance see [Database Connection Options](https://docs.iomete.com/docs/database-connection-options) for the details

Here are the details of `iomete-tutorial` public database:

```
Host: iomete-tutorial.cetmtjnompsh.eu-central-1.rds.amazonaws.com
Port: 3306
Username: tutorial_user
Password: 9tVDVEKp
```

The database contains the following tables:

| Table name   | Row count |
| :----------- | :-------- |
| employees    | 300024    |
| departments  | 9         |
| dept_manager | 24        |
| dept_emp     | 331603    |
| titles       | 443308    |
| salaries     | 2844047   |

***

Create warehouse
----------------

Create a new warehouse instance

![](https://files.readme.io/8dd28b1-Screen_Shot_2022-02-20_at_15.04.32.png "Screen Shot 2022-02-20 at 15.04.32.png")

***

Querying  Source Table
----------------------

After having the warehouse created, we create a table using JDBC Sources using [CREATE TABLE](https://docs.iomete.com/docs/create-table) command. In the OPTIONS part we specify credentials of the database to which we want to connect as follows (see [JDBC Sources](https://docs.iomete.com/docs/jdbc-sources)): 

```sql
CREATE TABLE IF NOT EXISTS employees_proxy
USING org.apache.spark.sql.jdbc
OPTIONS (
  url "jdbc:mysql://iomete-tutorial.cetmtjnompsh.eu-central-1.rds.amazonaws.com:3306/employees",
  dbtable "employees.employees",
  driver 'com.mysql.cj.jdbc.Driver',
  user 'tutorial_user',
  password '9tVDVEKp'
);

SELECT * FROM employees_proxy limit 100;
```

> 📘 
> 
> This table doesn't hold the actual data. Data will be retrieved from the actual source once we query the table

[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/62f62fa-sql_editor.png",
        "sql_editor.png",
        3478
      ],
      "caption": "Query Editor"
    }
  ]
}
[/block]

***

Migrating Data
--------------

To move the data from the source to the warehouse, you can use one of the following options:

**  Non-partitioned Table    **
-------------------------------

- **Option 1. Create a table from select**

```sql
-- Create table directly from the query
CREATE TABLE employees 
  AS SELECT  * FROM employees_proxy;
-- To inspect the table use the following query
DESC TABLE EXTENDED employees;
```

- **Option 2. Insert into to existing table**

```sql
--just append data
INSERT INTO employees
  SELECT  * FROM employees_proxy
--or you can use the follwing command to overwerite data
--first clean an existing data and then insert new data
INSERT OVERWRITE TABLE employees
  SELECT  * FROM employees_proxy
```

- **Option 3. Merge with existing data**

```sql
MERGE INTO employees
  USING (SELECT  * FROM employees_proxy) updates
  ON employees.emp_no = updates.emp_no
WHEN MATCHED THEN
  UPDATE SET *
WHEN NOT MATCHED
  THEN INSERT *
```

Partitioning data to speed up queries or DML that have predicates involving the partition columns. Here let's create an artificial column `birth_year` from `birth_date` and partition data by `birth_year`

```sql
SELECT SUBSTRING(birth_date, 0, 4) as birth_year, * FROM employees_proxy LIMIT 100;
```

**Partitioned Table**
---------------------

- **Option 1. Create a partitioned table from select**

```sql
-- Create a partitioned table directly from the query
CREATE TABLE employees_partitioned 
  PARTITIONED BY (birth_year)
AS SELECT SUBSTRING(birth_date, 0, 4) as birth_year, * FROM 
      employees_proxy order by birth_year; 

-- To inspect the table use the following query
DESC TABLE EXTENDED employees_partitioned;
```

- **Option 2. Insert into to existing table**

```sql
--just append data
INSERT INTO employees_partitioned
   SELECT SUBSTRING(birth_date, 0, 4) as birth_year, * FROM employees_proxy order by birth_year;

--or you can use the follwing command to overwerite data

--first clean an existing data and then insert new data
INSERT OVERWRITE TABLE employees_partitioned
   SELECT SUBSTRING(birth_date, 0, 4) as birth_year, * FROM employees_proxy order by birth_year;
```

- **Option 3. Merge with existing data**

```sql
MERGE INTO employees_partitioned
 USING (SELECT 
   SUBSTRING(birth_date, 0, 4) as birth_year, * FROM employees_proxy) updates
 ON employees_partitioned.emp_no = updates.emp_no
WHEN MATCHED THEN
  UPDATE SET *
WHEN NOT MATCHED
  THEN INSERT *
```

<!-- <hr> -->
  

Visualize Data
--------------

Let's move `employees.salaries` before moving to BI visualization 

```sql
CREATE TABLE IF NOT EXISTS salaries_proxy
USING org.apache.spark.sql.jdbc
OPTIONS (
  url "jdbc:mysql://iomete-tutorial.cetmtjnompsh.eu-central-1.rds.amazonaws.com:3306/employees",
  dbtable "employees.salaries",
  driver 'com.mysql.cj.jdbc.Driver',
  user 'tutorial_user',
  password '9tVDVEKp'
);

CREATE TABLE salaries
  AS SELECT  * FROM salaries_proxy;
```

Create a view joining `employees` and `salaries` tables

```
CREATE OR REPLACE VIEW employee_salaries AS 
 SELECT e.emp_no, e.first_name, e.last_name, e.gender, s.salary FROM employees e
  JOIN salaries s ON e.emp_no = s.emp_no;
```

Open BI Application
-------------------

![](https://files.readme.io/969080c-Screenshot_2021-07-05_at_19.52.21.png "Screenshot 2021-07-05 at 19.52.21.png")

Add new dataset
---------------

To add a new dataset, choose `Dataset` link from the Data menu and click the `+Dataset` button:

![](https://files.readme.io/bb5d276-Screenshot4_2021-07-12_at_01.05.55.png "Screenshot4 2021-07-12 at 01.05.55.png")

Create a new chart
------------------

Click on the newly created dataset `employee_salaries` which opens chart view. Let's create a `table` visualization for the `Top 10 High Salary Employees`

![](https://files.readme.io/b2b8c20-Screenshot5_2021-07-12_at_01.10.43.png "Screenshot5 2021-07-12 at 01.10.43.png")

Save the chart to a dashboard

![](https://files.readme.io/0cb9d3b-Screenshot6_2021-07-12_at_01.11.08.png "Screenshot6 2021-07-12 at 01.11.08.png")

Create another chart. This time `Female/Male Salary Distribution` using `PieChart` visualization

![](https://files.readme.io/d055fea-Screenshot7_2021-07-12_at_01.12.49.png "Screenshot7 2021-07-12 at 01.12.49.png")

Save this chart to the dashboard too and navigate to the dashboard. And, here is the dashboard of the Employees that we just created

![](https://files.readme.io/3fc195c-Screenshot8_2021-07-12_at_01.13.20.png "Screenshot8 2021-07-12 at 01.13.20.png")

Congratulations 🎉🎉🎉

> 📘 Bonus part
> 
> There is a dedicated python library to help to automate this table replication with just a configuration. Please, check out [Syncing JDBC Sources](https://docs.iomete.com/docs/sync-jdbc-sources)