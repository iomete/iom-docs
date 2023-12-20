---
title: PySpark Joins
description:  PySpark SQL `Inner` join is the most commonly used join. It joins two DataFrames on key columns, and if keys don't match, the rows are dropped from both datasets (`emp` & `dept`)
---

**PySpark Join** is used to combine two DataFrames and by chaining these you can join multiple DataFrames; it supports all basic join type operations available in traditional SQL like `INNER`, `LEFT OUTER`, `RIGHT OUTER`, `LEFT ANTI`, `LEFT SEMI`, `CROSS`, `SELF` JOIN. PySpark Joins are wider transformations that involve [data shuffling across the network](https://sparkbyexamples.com/spark/spark-shuffle-partitions/).

PySpark SQL Joins comes with more optimization by default (thanks to DataFrames) however still there would be some performance issues to consider while using. I would recommend reading through the [PySpark Tutorial](https://sparkbyexamples.com/pyspark-tutorial/) where I explained several insights of performance issues.

In this **PySpark SQL Join**, you will learn different Join syntaxes and use different Join types on two or more DataFrames and Datasets using examples.

- [1. PySpark Join Syntax](#1-pyspark-join-syntax)
- [2. PySpark Join Types](#2-pyspark-join-types)
- [3. How Join works?](#3-how-join-works)
- [4. PySpark Inner Join DataFrame](#4-pyspark-inner-join-dataframe)
- [5. PySpark Full Outer Join](#5-pyspark-full-outer-join)
- [6. PySpark Left Outer Join](#6-pyspark-left-outer-join)
- [7. Right Outer Join](#7-right-outer-join)
- [8. Left Semi Join](#8-left-semi-join)
- [9. Left Anti Join](#9-left-anti-join)
- [10. PySpark Self Join](#10-pyspark-self-join)
- [11. Using SQL Expression](#11-using-sql-expression)
- [12. PySpark SQL Join on multiple DataFrames](#12-pyspark-sql-join-on-multiple-dataframes)
- [13. PySpark SQL Join Complete Example](#13-pyspark-sql-join-complete-example)
- [14. Frequently asked questions on PySpark Joins](#14-frequently-asked-questions-on-pyspark-joins)
  - [Conclusion](#conclusion)

1\. PySpark Join Syntax
-----------------------

PySpark SQL join has a below syntax and it can be accessed directly from DataFrame.

    
    
    join(self, other, on=None, how=None)
    

`join()` operation takes parameters as below and returns DataFrame.

*   param other: Right side of the join
*   param on: a string for the join column name
*   param how: default `inner`. Must be one of `inner`, `cross`, `outer`,`full`, `full_outer`, `left`, `left_outer`, `right`, `right_outer`,`left_semi`, and `left_anti`.

You can also write Join expression by adding [where()](https://sparkbyexamples.com/pyspark/pyspark-dataframe-filter/) and [filter()](https://sparkbyexamples.com/pyspark/pyspark-dataframe-filter/) methods on DataFrame and can have Join on multiple columns.

2\. PySpark Join Types
----------------------

Below are the different Join Types PySpark supports.

**Join String**

**Equivalent SQL Join**

inner

INNER JOIN

outer, full, fullouter, full\_outer

FULL OUTER JOIN

left, leftouter, left\_outer

LEFT JOIN

right, rightouter, right\_outer

RIGHT JOIN

cross

anti, leftanti, left\_anti

semi, leftsemi, left\_semi

PySpark Join Types

Before we jump into PySpark SQL Join examples, first, let’s create an `"emp"` and `"dept"` [DataFrames](https://sparkbyexamples.com/pyspark/different-ways-to-create-dataframe-in-pyspark/). here, column `"emp_id"` is unique on emp and `"dept_id"` is unique on the dept dataset, and emp\_dept\_id from emp has a reference to dept\_id on the dept dataset.

    
    
    import pyspark
    from pyspark.sql import SparkSession
    
    emp = [(1,"Smith",-1,"2018","10","M",3000), \
        (2,"Rose",1,"2010","20","M",4000), \
        (3,"Williams",1,"2010","10","M",1000), \
        (4,"Jones",2,"2005","10","F",2000), \
        (5,"Brown",2,"2010","40","",-1), \
          (6,"Brown",2,"2010","50","",-1) \
      ]
    empColumns = ["emp_id","name","superior_emp_id","year_joined", \
           "emp_dept_id","gender","salary"]
    
    empDF = spark.createDataFrame(data=emp, schema = empColumns)
    empDF.printSchema()
    empDF.show(truncate=False)
    
    dept = [("Finance",10), \
        ("Marketing",20), \
        ("Sales",30), \
        ("IT",40) \
      ]
    deptColumns = ["dept_name","dept_id"]
    deptDF = spark.createDataFrame(data=dept, schema = deptColumns)
    deptDF.printSchema()
    deptDF.show(truncate=False)
    

This prints “emp” and “dept” DataFrame to the console. Refer complete example below on how to create `spark` object.

    
    Emp Dataset
    +------+--------+---------------+-----------+-----------+------+------+
    |emp_id|name    |superior_emp_id|year_joined|emp_dept_id|gender|salary|
    +------+--------+---------------+-----------+-----------+------+------+
    |1     |Smith   |-1             |2018       |10         |M     |3000  |
    |2     |Rose    |1              |2010       |20         |M     |4000  |
    |3     |Williams|1              |2010       |10         |M     |1000  |
    |4     |Jones   |2              |2005       |10         |F     |2000  |
    |5     |Brown   |2              |2010       |40         |      |-1    |
    |6     |Brown   |2              |2010       |50         |      |-1    |
    +------+--------+---------------+-----------+-----------+------+------+
    
    Dept Dataset
    +---------+-------+
    |dept_name|dept_id|
    +---------+-------+
    |Finance  |10     |
    |Marketing|20     |
    |Sales    |30     |
    |IT       |40     |
    +---------+-------+
    

3\. How Join works?
-------------------

PySpark’s join operation works by combining data from two or more Datasets based on a common column or key. The join operation is a fundamental operation in PySpark and it is a similar approach to SQL joins.

**Common Key**: In order to join two or more datasets we need a common key or a column on which you want to join. This key is used to join the matching rows from the datasets.

**Partitioning**: PySpark Datasets are distributed and partitioned across multiple nodes in a cluster. Ideally, data with the same join key should be located in the same partition. If the Datasets are not already partitioned on the join key, PySpark may perform a shuffle operation to redistribute the data, ensuring that rows with the same join key are on the same node. Shuffling can be an expensive operation, especially for large Datasets.

**Join Type Specification**: We can specify the type of join like inner join, full join, left join, etc., by specifying on “how” parameter of the `.join()` method. This parameter determines which rows should be included or excluded in the resulting Dataset.

**Join Execution**: PySpark performs the join by comparing the values in the common key column between the Datasets.

*   Inner Join: Returns only the rows with matching keys in both DataFrames.
*   Left Join: Returns all rows from the left DataFrame and matching rows from the right DataFrame.
*   Right Join: Returns all rows from the right DataFrame and matching rows from the left DataFrame.
*   Full Outer Join: Returns all rows from both DataFrames, including matching and non-matching rows.
*   Left Semi Join: Returns all rows from the left DataFrame where there is a match in the right DataFrame.
*   Left Anti Join: Returns all rows from the left DataFrame where there is no match in the right DataFrame.

4\. PySpark Inner Join DataFrame
--------------------------------

`Inner` join is the default join in PySpark and it’s mostly used when you want to retrieve data from two or more DataFrames based on a shared key. An Inner join combines two DataFrames based on the key (common column) provided and results in rows where there is a matching found. Rows from both DataFrames are dropped with a non-matching key.

    
    
    empDF.join(deptDF,empDF.emp_dept_id ==  deptDF.dept_id,"inner") \
         .show(truncate=False)
    

When we apply Inner join on our datasets, It drops “`emp_dept_id`” 50 from “`emp`” And “`dept_id`” 30 from “`dept`” datasets. Below is the result of the above Join expression.

    
    
    +------+--------+---------------+-----------+-----------+------+------+---------+-------+
    |emp_id|name    |superior_emp_id|year_joined|emp_dept_id|gender|salary|dept_name|dept_id|
    +------+--------+---------------+-----------+-----------+------+------+---------+-------+
    |1     |Smith   |-1             |2018       |10         |M     |3000  |Finance  |10     |
    |2     |Rose    |1              |2010       |20         |M     |4000  |Marketing|20     |
    |3     |Williams|1              |2010       |10         |M     |1000  |Finance  |10     |
    |4     |Jones   |2              |2005       |10         |F     |2000  |Finance  |10     |
    |5     |Brown   |2              |2010       |40         |      |-1    |IT       |40     |
    +------+--------+---------------+-----------+-----------+------+------+---------+-------+
    

5\. PySpark Full Outer Join
---------------------------

`Outer` a.k.a `full`, `fullouter` join returns all rows from both datasets, where the join expression doesn’t match it returns null on respective record columns.

    
    
    empDF.join(deptDF,empDF.emp_dept_id ==  deptDF.dept_id,"outer") \
        .show(truncate=False)
    empDF.join(deptDF,empDF.emp_dept_id ==  deptDF.dept_id,"full") \
        .show(truncate=False)
    empDF.join(deptDF,empDF.emp_dept_id ==  deptDF.dept_id,"fullouter") \
        .show(truncate=False)
    

From our “`emp`” dataset’s “`emp_dept_id`” with value 50 doesn’t have a record on “`dept`” hence dept columns have null and “`dept_id`” 30 doesn’t have a record in “`emp`” hence you see null’s on emp columns. Below is the result of the above Join expression.

    
    
    +------+--------+---------------+-----------+-----------+------+------+---------+-------+
    |emp_id|name    |superior_emp_id|year_joined|emp_dept_id|gender|salary|dept_name|dept_id|
    +------+--------+---------------+-----------+-----------+------+------+---------+-------+
    |2     |Rose    |1              |2010       |20         |M     |4000  |Marketing|20     |
    |5     |Brown   |2              |2010       |40         |      |-1    |IT       |40     |
    |1     |Smith   |-1             |2018       |10         |M     |3000  |Finance  |10     |
    |3     |Williams|1              |2010       |10         |M     |1000  |Finance  |10     |
    |4     |Jones   |2              |2005       |10         |F     |2000  |Finance  |10     |
    |6     |Brown   |2              |2010       |50         |      |-1    |null     |null   |
    |null  |null    |null           |null       |null       |null  |null  |Sales    |30     |
    +------+--------+---------------+-----------+-----------+------+------+---------+-------+
    

6\. PySpark Left Outer Join
---------------------------

`Left` a.k.a `Leftouter` join returns all rows from the left dataset regardless of match found on the right dataset when join expression doesn’t match, it assigns null for that record and drops records from right where match not found.

    
    
    empDF.join(deptDF,empDF.emp_dept_id ==  deptDF.dept_id,"left")
        .show(truncate=False)
    empDF.join(deptDF,empDF.emp_dept_id ==  deptDF.dept_id,"leftouter")
        .show(truncate=False)
    

From our dataset, “`emp_dept_id`” 5o doesn’t have a record on “`dept`” dataset hence, this record contains null on “`dept`” columns (dept\_name & dept\_id). and “`dept_id`” 30 from “`dept`” dataset dropped from the results. Below is the result of the above Join expression.

    
    
    +------+--------+---------------+-----------+-----------+------+------+---------+-------+
    |emp_id|name    |superior_emp_id|year_joined|emp_dept_id|gender|salary|dept_name|dept_id|
    +------+--------+---------------+-----------+-----------+------+------+---------+-------+
    |1     |Smith   |-1             |2018       |10         |M     |3000  |Finance  |10     |
    |2     |Rose    |1              |2010       |20         |M     |4000  |Marketing|20     |
    |3     |Williams|1              |2010       |10         |M     |1000  |Finance  |10     |
    |4     |Jones   |2              |2005       |10         |F     |2000  |Finance  |10     |
    |5     |Brown   |2              |2010       |40         |      |-1    |IT       |40     |
    |6     |Brown   |2              |2010       |50         |      |-1    |null     |null   |
    +------+--------+---------------+-----------+-----------+------+------+---------+-------+
    

7\. Right Outer Join
--------------------

`Right` a.k.a `Rightouter` join is opposite of `left` join, here it returns all rows from the right dataset regardless of math found on the left dataset, when join expression doesn’t match, it assigns null for that record and drops records from left where match not found.

    
    
    empDF.join(deptDF,empDF.emp_dept_id ==  deptDF.dept_id,"right") \
       .show(truncate=False)
    empDF.join(deptDF,empDF.emp_dept_id ==  deptDF.dept_id,"rightouter") \
       .show(truncate=False)
    

From our example, the right dataset “`dept_id`” 30 doesn’t have it on the left dataset “`emp`” hence, this record contains null on “`emp`” columns. and “`emp_dept_id`” 50 dropped as a match not found on left. Below is the result of the above Join expression.

    
    
    +------+--------+---------------+-----------+-----------+------+------+---------+-------+
    |emp_id|name    |superior_emp_id|year_joined|emp_dept_id|gender|salary|dept_name|dept_id|
    +------+--------+---------------+-----------+-----------+------+------+---------+-------+
    |4     |Jones   |2              |2005       |10         |F     |2000  |Finance  |10     |
    |3     |Williams|1              |2010       |10         |M     |1000  |Finance  |10     |
    |1     |Smith   |-1             |2018       |10         |M     |3000  |Finance  |10     |
    |2     |Rose    |1              |2010       |20         |M     |4000  |Marketing|20     |
    |null  |null    |null           |null       |null       |null  |null  |Sales    |30     |
    |5     |Brown   |2              |2010       |40         |      |-1    |IT       |40     |
    +------+--------+---------------+-----------+-----------+------+------+---------+-------+
    

8\. Left Semi Join
------------------

`leftsemi` join is similar to `inner` join difference being `leftsemi` join returns all columns from the left dataset and ignores all columns from the right dataset. In other words, this join returns columns from the only left dataset for the records match in the right dataset on join expression, records not matched on join expression are ignored from both left and right datasets.

The same result can be achieved using select on the result of the inner join however, using this join would be efficient.

    
    
    empDF.join(deptDF,empDF.emp_dept_id ==  deptDF.dept_id,"leftsemi") \
       .show(truncate=False)
    

Below is the result of the above join expression.

    
    
    +------+--------+---------------+-----------+-----------+------+------+
    |emp_id|name    |superior_emp_id|year_joined|emp_dept_id|gender|salary|
    +------+--------+---------------+-----------+-----------+------+------+
    |1     |Smith   |-1             |2018       |10         |M     |3000  |
    |2     |Rose    |1              |2010       |20         |M     |4000  |
    |3     |Williams|1              |2010       |10         |M     |1000  |
    |4     |Jones   |2              |2005       |10         |F     |2000  |
    |5     |Brown   |2              |2010       |40         |      |-1    |
    +------+--------+---------------+-----------+-----------+------+------+
    

9\. Left Anti Join
------------------

`leftanti` join does the exact opposite of the `leftsemi`, `leftanti` join returns only columns from the left dataset for non-matched records.

    
    
    empDF.join(deptDF,empDF.emp_dept_id ==  deptDF.dept_id,"leftanti") \
       .show(truncate=False)
    

Yields below output

    
    
    +------+-----+---------------+-----------+-----------+------+------+
    |emp_id|name |superior_emp_id|year_joined|emp_dept_id|gender|salary|
    +------+-----+---------------+-----------+-----------+------+------+
    |6     |Brown|2              |2010       |50         |      |-1    |
    +------+-----+---------------+-----------+-----------+------+------+
    

10\. PySpark Self Join
----------------------

Joins are not complete without a self join, Though there is no self-join type available, we can use any of the above-explained join types to join DataFrame to itself. below example use `inner` self join.

    
    
    empDF.alias("emp1").join(empDF.alias("emp2"), \
        col("emp1.superior_emp_id") == col("emp2.emp_id"),"inner") \
        .select(col("emp1.emp_id"),col("emp1.name"), \
          col("emp2.emp_id").alias("superior_emp_id"), \
          col("emp2.name").alias("superior_emp_name")) \
       .show(truncate=False)
    

Here, we are joining `emp` dataset with itself to find out superior `emp_id` and `name` for all employees.

    
    
    +------+--------+---------------+-----------------+
    |emp_id|name    |superior_emp_id|superior_emp_name|
    +------+--------+---------------+-----------------+
    |2     |Rose    |1              |Smith            |
    |3     |Williams|1              |Smith            |
    |4     |Jones   |2              |Rose             |
    |5     |Brown   |2              |Rose             |
    |6     |Brown   |2              |Rose             |
    +------+--------+---------------+-----------------+
    

11\. Using SQL Expression
-------------------------

Since PySpark SQL support native SQL syntax, we can also write join operations after creating temporary tables on DataFrames and use these tables on `spark.sql()`.

    
    
    
    empDF.createOrReplaceTempView("EMP")
    deptDF.createOrReplaceTempView("DEPT")
    
    joinDF = spark.sql("select * from EMP e, DEPT d where e.emp_dept_id == d.dept_id") \
      .show(truncate=False)
    
    joinDF2 = spark.sql("select * from EMP e INNER JOIN DEPT d ON e.emp_dept_id == d.dept_id") \
      .show(truncate=False)
    

12\. PySpark SQL Join on multiple DataFrames
--------------------------------------------

When you need to join more than two tables, you either use SQL expression after creating a temporary view on the DataFrame or use the result of join operation to join with another DataFrame like chaining them. for example

    
    
    df1.join(df2,df1.id1 == df2.id2,"inner") \
       .join(df3,df1.id1 == df3.id3,"inner")
    

13\. PySpark SQL Join Complete Example
--------------------------------------

    
    import pyspark
    from pyspark.sql import SparkSession
    from pyspark.sql.functions import col
    
    spark = SparkSession.builder.appName('SparkByExamples.com').getOrCreate()
    
    emp = [(1,"Smith",-1,"2018","10","M",3000), \
        (2,"Rose",1,"2010","20","M",4000), \
        (3,"Williams",1,"2010","10","M",1000), \
        (4,"Jones",2,"2005","10","F",2000), \
        (5,"Brown",2,"2010","40","",-1), \
          (6,"Brown",2,"2010","50","",-1) \
      ]
    empColumns = ["emp_id","name","superior_emp_id","year_joined", \
           "emp_dept_id","gender","salary"]
    
    empDF = spark.createDataFrame(data=emp, schema = empColumns)
    empDF.printSchema()
    empDF.show(truncate=False)
    
    
    dept = [("Finance",10), \
        ("Marketing",20), \
        ("Sales",30), \
        ("IT",40) \
      ]
    deptColumns = ["dept_name","dept_id"]
    deptDF = spark.createDataFrame(data=dept, schema = deptColumns)
    deptDF.printSchema()
    deptDF.show(truncate=False)
      
    empDF.join(deptDF,empDF.emp_dept_id ==  deptDF.dept_id,"inner") \
         .show(truncate=False)
    
    empDF.join(deptDF,empDF.emp_dept_id ==  deptDF.dept_id,"outer") \
        .show(truncate=False)
    empDF.join(deptDF,empDF.emp_dept_id ==  deptDF.dept_id,"full") \
        .show(truncate=False)
    empDF.join(deptDF,empDF.emp_dept_id ==  deptDF.dept_id,"fullouter") \
        .show(truncate=False)
        
    empDF.join(deptDF,empDF.emp_dept_id ==  deptDF.dept_id,"left") \
        .show(truncate=False)
    empDF.join(deptDF,empDF.emp_dept_id ==  deptDF.dept_id,"leftouter") \
       .show(truncate=False)
    
    empDF.join(deptDF,empDF.emp_dept_id ==  deptDF.dept_id,"right") \
       .show(truncate=False)
    empDF.join(deptDF,empDF.emp_dept_id ==  deptDF.dept_id,"rightouter") \
       .show(truncate=False)
    
    empDF.join(deptDF,empDF.emp_dept_id ==  deptDF.dept_id,"leftsemi") \
       .show(truncate=False)
       
    empDF.join(deptDF,empDF.emp_dept_id ==  deptDF.dept_id,"leftanti") \
       .show(truncate=False)
       
    empDF.alias("emp1").join(empDF.alias("emp2"), \
        col("emp1.superior_emp_id") == col("emp2.emp_id"),"inner") \
        .select(col("emp1.emp_id"),col("emp1.name"), \
          col("emp2.emp_id").alias("superior_emp_id"), \
          col("emp2.name").alias("superior_emp_name")) \
       .show(truncate=False)
    
    empDF.createOrReplaceTempView("EMP")
    deptDF.createOrReplaceTempView("DEPT")
       
    joinDF = spark.sql("select * from EMP e, DEPT d where e.emp_dept_id == d.dept_id") \
      .show(truncate=False)
    
    joinDF2 = spark.sql("select * from EMP e INNER JOIN DEPT d ON e.emp_dept_id == d.dept_id") \
      .show(truncate=False)
    
    

Examples explained here are available at the [GitHub](https://github.com/spark-examples/pyspark-examples/blob/master/pyspark-join.py) project for reference.

14\. Frequently asked questions on PySpark Joins
------------------------------------------------

**What is the default join in PySpark?**

In PySpark the default join type is “inner” join when using with `.join()` method. If you don’t explicitly specify the join type using the “`how`” parameter, it will perform the inner join. One can change the join type using the how parameter of `.join()`.

**Is join expensive in PySpark?**

Yes Join in PySpark is expensive because of the data shuffling (wider transformation) that happens between the partitioned data in a cluster. It basically depends on the data size, data skew, cluster configuration, join type being performed, partitioning and Broadcast joins.

**Can we join on multiple columns in PySpark?**

Yes we can join on multiple columns. Joining on multiple columns involves more join conditions with multiple keys for matching the rows between the datasets.It can be achieved by passing a list of column names as the join condition when using the `.join()` method.

**How do I drop duplicate columns after joining PySpark?**

PySpark `distinct()` function is used to drop/remove the duplicate rows (all columns) from Dataset and `dropDuplicates()` is used to drop rows based on selected (one or multiple) columns

**What is the difference between the inner join and the left join?**

The key difference is that an inner join includes only the rows with matching keys in both Datasets, while a left join includes all the rows from the left Dataset and matches them with rows from the right Dataset where there’s a match. Non-matching rows in the left Dataset in a left join are included with null values in the columns from the right Dataset.

**What is the difference between left join and left outer join?**

Both terms refer to the same type of join operation, and they can be used interchangeably. The “OUTER” keyword is optional when specifying a “LEFT JOIN.”

### Conclusion

In this PySpark SQL tutorial, you have learned two or more DataFrames can be joined using the `join()` function of the DataFrame, Join types syntax, usage, and examples with PySpark (Spark with Python), I would also recommend reading through Optimizing SQL Joins to know performance impact on joins.