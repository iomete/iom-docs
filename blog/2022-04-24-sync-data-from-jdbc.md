---
slug: sync-data-from-jdbc-sources
title: Sync Data From JDBC Sources
authors: namig
hide_table_of_contents: true
tags: [Engineering]
---

<head>
  <title>Sync Data From JDBC Sources | iomete blog</title>
  <meta name="robots" content="noindex, nofollow" />
  <meta name="googlebot" content="noindex"/>
</head>

## Intro
‌This is an end-to-end guide about migrating **tables** from JDBC sources (MySQL, PostgreSQL, etc.) to iomete and display it in the BI dashboard.

:::info
First, you need to establish an SSH tunnel between iomete and your database in your private network. See [Database Connection Options](/docs/administration-guide/database-connection-options)
:::

<!-- truncate -->

## Given database to migrate
‌Let's assume that we want to replicate the MySQL database (or any other supported JDBC database) to the **iomete** warehouse

:::info
In this tutorial, we will be using a publicly accessible iomete-tutorial database instance that contains the [Employees Sample Database.](https://dev.mysql.com/doc/employee/en/sakila-structure.html)
:::

:::info
In case of connecting to your own database instance see [Database Connection Options](/docs/administration-guide/database-connection-options) for the details‌.
:::

<br/>

Here are the details of iomete-tutorial public database:
```
Host: iomete-tutorial.cetmtjnompsh.eu-central-1.rds.amazonaws.com
Port: 3306
Username: tutorial_user
Password: 9tVDVEKp
```

The database contains the following tables:

| Table name   	| Row count 	|
| ------------- | -----------	|
| employees    	| 300024    	|
| departments  	| 9         	|
| dept_manager 	| 24        	|
| dept_emp     	| 331603    	|
| titles       	| 443308    	|
| salaries     	| 2844047   	|


## Create lakehouse
‌Create a new lakehouse instance:

![Create lakehouse](/blog/2022-04-24-sync-data-from-jdbc/lakehouse-create.png)


## Querying  Source Table
After having the warehouse created, we create a table using JDBC Sources using the CREATE TABLE command. In the OPTIONS part we specify credentials of the database to which we want to connect as follows (see [JDBC Sources](/docs/data-sources/jdbc-sources)):

```sql
CREATE TABLE IF NOT EXISTS employees_proxy USING org.apache.spark.sql.jdbc OPTIONS (
    url "jdbc:mysql://iomete-tutorial.cetmtjnompsh.eu-central-1.rds.amazonaws.com:3306/employees",
    dbtable "employees.employees",
    user 'tutorial_user',
    password '9tVDVEKp'
);

SELECT * FROM employees_proxy limit 100;
```

:::info
This table doesn't hold the actual data. Data will be retrieved from the actual source once we query the table
:::

![iomete sql editor](/blog/2022-04-24-sync-data-from-jdbc/sql-editor.png)

## Migrating Data
To move the data from the source to the warehouse, you can use one of the following options:

**Option 1. Create a table from select**

```sql
-- Create table directly from the query     
CREATE TABLE employees USING delta       
AS SELECT  * FROM employees_proxy;-- 

To inspect the table use the following query     
DESC TABLE EXTENDED employees;
```

<br/>

**Option 2. Insert into to existing table**

```sql
--just append data
INSERT INTO employees
SELECT  * FROM employees_proxy

--or you can use the follwing command to overwrite data

--first clean an existing data and then insert new data   
INSERT OVERWRITE TABLE employees
SELECT  * FROM employees_proxy
```

<br/>

## Option 3. Merge with existing data

```sql 
MERGE INTO employees
USING (SELECT  * FROM employees_proxy) updates
ON employees.emp_no = updates.emp_no
WHEN MATCHED THEN
UPDATE SET *WHEN NOT MATCHED
THEN INSERT *
```

<br/>

## Visualize Data

Let's move employees.salaries before moving to BI visualization:
```sql
CREATE TABLE IF NOT EXISTS salaries_proxy
USING org.apache.spark.sql.jdbc
OPTIONS (  url "jdbc:mysql://iomete-tutorial.cetmtjnompsh.eu-central-1.rds.amazonaws.com:3306/employees", 
dbtable "employees.salaries",  user 'tutorial_user',  password '9tVDVEKp');

CREATE TABLE salaries USING delta   
AS SELECT  * FROM salaries_proxy;
```

<br/>

Create a view joining employees and salaries tables:
```sql
CREATE OR REPLACE VIEW employee_salaries AS
SELECT e.emp_no, e.first_name, e.last_name, e.gender, s.salary 
FROM employees e 
JOIN salaries s ON e.emp_no = s.emp_no;
```

## Open BI Application
![Open BI Application](/blog/2022-04-24-sync-data-from-jdbc/bi.png)

To add a new database connection, choose Databases link from the Data menu and click the +Database button:

![](/blog/2022-04-24-sync-data-from-jdbc/create-database.png)

## Choose Database Type
Here you need to choose **Apache Hive** from the dropdown:
![Choose Database Type](/blog/2022-04-24-sync-data-from-jdbc/connect-database.png)


Replace iomete_username and warehouse_name with your values accordingly:

```
hive://:XXXXXXXXXX@-warehouse-thriftserver:10000/?auth=CUSTOM&transport_mode=http
```

<br/>

![Connect database](/blog/2022-04-24-sync-data-from-jdbc/connect-selected-database.png)

## Add new dataset
To add a new dataset, choose Dataset link from the Data menu and click the + Dataset button:

![](/blog/2022-04-24-sync-data-from-jdbc/add-new-dataset.png)

## Create a new chart
Click on the newly created dataset employee_salaries which opens chart view. Let's create a table visualization for the Top 10 High Salary Employees:

![Create a new chart](/blog/2022-04-24-sync-data-from-jdbc/create-new-chart.png)

Save the chart to a dashboard:
![Save chart](/blog/2022-04-24-sync-data-from-jdbc/save-chart.png)

<br/>

Create another chart. This time Female/Male Salary Distribution using PieChart visualization:

![Create pie chart](/blog/2022-04-24-sync-data-from-jdbc/create-another-pie-chart.png)

Save this chart to the dashboard too and navigate to the dashboard. And, here is the dashboard of the Employees that we just created:

![](/blog/2022-04-24-sync-data-from-jdbc/save-pie-chart.png)

Congratulations! You did it!

Bonus part
There is a dedicated python library to help to automate this table replication with just a configuration. Please, check out [Syncing JDBC Sources.](/docs/sync-data-from-jdbc-sources)