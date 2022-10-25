---
title: Query Scheduler Job
description: iomete provides Query Scheduler Job to run your queries over warehouse on schedule time or manually
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

___

**iomete** provides **Query Scheduler Job** to run your queries over warehouse. You can run your queries on schedule time or manually.  To enable job follow the next steps:

### Installation

- Go to `Spark Jobs`.
- Click on `Create New`.

Specify the following parameters (these are examples, you can change them based on your preference):
- **Name:** `query-scheduler-job`
- **Schedule:** `0 0/22 1/1 * *`
- **Docker Image:** `iomete/query_scheduler_job:0.3.0`
- **Main application file:** `local:///app/driver.py`
- **Environment Variables:** `LOG_LEVEL`: `INFO`
- **Config file:**
```json
# Queries to be run sequentially
[
  # let's create an example database
  """
  CREATE DATABASE EXAMPLE
  """,

  # use the newly created database to run the further queries within this database
  """
  USE EXAMPLE
  """,

  # query example one
  """
  CREATE TABLE IF NOT EXISTS dept_manager_proxy
  USING org.apache.spark.sql.jdbc
  OPTIONS (
    url "jdbc:mysql://iomete-tutorial.cetmtjnompsh.eu-central-1.rds.amazonaws.com:3306/employees",
    dbtable "employees.dept_manager",
    driver 'com.mysql.cj.jdbc.Driver',
    user 'tutorial_user',
    password '9tVDVEKp'
  )
  """,

  # another query that depends on the previous query result
  """
  CREATE TABLE IF NOT EXISTS dept_manager AS SELECT  * FROM dept_manager_proxy
  """
]
```


## **Summary**
You can find source code in <a href="https://github.com/iomete/query-scheduler-job" target="blank">Github</a>. Feel free to customize code for your requirements. Please do not hesitate to contact us if you have any question

![Create Spark Job](/img/spark-job/create-spark-job.png)

<br/>

![Create Spark Job - Environment Variables](/img/spark-job/job-add-environment-variables.png)

<br/>

![Create Spark Job - Application Config](/img/spark-job/create-spark-job--application-config.png)


And, hit the create button.

<hr/>
<br/>

The job will be run based on the defined schedule. But, you can trigger the job manually by clicking on the Run button.

![Run Job Manually](/img/spark-job/job-manual-run.png)

### Github

  * You can find source code of **Query Scheduler Jon** in github. [View in Github](https://github.com/iomete/query-scheduler-job)