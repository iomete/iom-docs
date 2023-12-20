---
title: PySpark Groupby
description:  PySpark SQL `Inner` join is the most commonly used join. It joins two DataFrames on key columns, and if keys don't match, the rows are dropped from both datasets (`emp` & `dept`)
---

Similar to SQL `GROUP BY` clause, PySpark `groupBy()` function is used to collect the identical data into groups on DataFrame and perform count, sum, avg, min, max functions on the grouped data. In this article, I will explain several `groupBy()` examples using PySpark (Spark with Python).

**Related:** [How to group and aggregate data using Spark and Scala](https://sparkbyexamples.com/spark/using-groupby-on-dataframe/)

1\. GroupBy() Syntax & Usage
----------------------------

**Syntax:**

    
    
    DataFrame.groupBy(*cols)
    
    DataFrame.groupby(*cols)
    

When we perform `groupBy()` on PySpark Dataframe, it returns `GroupedData` object which contains below aggregate functions.

`count()` – Use [groupBy() count()](https://sparkbyexamples.com/pyspark/pyspark-groupby-count-explained/) to return the number of rows for each group.

`mean()` – Returns the mean of values for each group.

`max()` – Returns the maximum of values for each group.

`min()` – Returns the minimum of values for each group.

`sum()` – Returns the total for values for each group.

`avg()` – Returns the average for values for each group.

`agg()` – Using [groupBy() agg()](https://sparkbyexamples.com/pyspark/pyspark-groupby-agg-aggregate-explained/) function, we can calculate more than one aggregate at a time.

`pivot()` – This function is used to Pivot the DataFrame which I will not be covered in this article as I already have a dedicated article for [Pivot & Unpivot DataFrame](https://sparkbyexamples.com/spark/how-to-pivot-table-and-unpivot-a-spark-dataframe/).

Before we start, let’s [create the DataFrame](https://sparkbyexamples.com/pyspark/different-ways-to-create-dataframe-in-pyspark/) from a sequence of the data to work with. This DataFrame contains columns “`employee_name`”, “`department`”, “`state`“, “`salary`”, “`age`” and “`bonus`” columns.

We will use this PySpark DataFrame to run groupBy() on “department” columns and calculate aggregates like minimum, maximum, average, and total salary for each group using min(), max(), and sum() aggregate functions respectively.

    
    simpleData = [("James","Sales","NY",90000,34,10000),
        ("Michael","Sales","NY",86000,56,20000),
        ("Robert","Sales","CA",81000,30,23000),
        ("Maria","Finance","CA",90000,24,23000),
        ("Raman","Finance","CA",99000,40,24000),
        ("Scott","Finance","NY",83000,36,19000),
        ("Jen","Finance","NY",79000,53,15000),
        ("Jeff","Marketing","CA",80000,25,18000),
        ("Kumar","Marketing","NY",91000,50,21000)
      ]
    
    schema = ["employee_name","department","state","salary","age","bonus"]
    df = spark.createDataFrame(data=simpleData, schema = schema)
    df.printSchema()
    df.show(truncate=False)
    

Yields below output.

    
    +-------------+----------+-----+------+---+-----+
    |employee_name|department|state|salary|age|bonus|
    +-------------+----------+-----+------+---+-----+
    |        James|     Sales|   NY| 90000| 34|10000|
    |      Michael|     Sales|   NY| 86000| 56|20000|
    |       Robert|     Sales|   CA| 81000| 30|23000|
    |        Maria|   Finance|   CA| 90000| 24|23000|
    |        Raman|   Finance|   CA| 99000| 40|24000|
    |        Scott|   Finance|   NY| 83000| 36|19000|
    |          Jen|   Finance|   NY| 79000| 53|15000|
    |         Jeff| Marketing|   CA| 80000| 25|18000|
    |        Kumar| Marketing|   NY| 91000| 50|21000|
    +-------------+----------+-----+------+---+-----+
    

2\. PySpark groupBy on DataFrame Columns
----------------------------------------

Let’s do the `groupBy()` on `department` column of DataFrame and then find the sum of salary for each department using `sum()` function.

    
    df.groupBy("department").sum("salary").show(truncate=False)
    +----------+-----------+
    |department|sum(salary)|
    +----------+-----------+
    |Sales     |257000     |
    |Finance   |351000     |
    |Marketing |171000     |
    +----------+-----------+
    

Similarly, we can calculate the number of employees in each department using.

    
    df.groupBy("department").count()
    

Calculate the minimum salary of each department using `min()`

    
    df.groupBy("department").min("salary")
    

Calculate the maximin salary of each department using `max()`

    
    df.groupBy("department").max("salary")
    

Calculate the average salary of each department using `avg()`

    
    df.groupBy("department").avg( "salary")
    

Calculate the mean salary of each department using `mean()`

    
    df.groupBy("department").mean( "salary") 
    

3\. Using Multiple columns
--------------------------

Similarly, we can also run groupBy and aggregate on two or more DataFrame columns, below example does group by on `department`,`state` and does sum() on `salary` and `bonus` columns.

    
    
    df.groupBy("department","state") \
        .sum("salary","bonus") \
        .show(false)
    

This yields the below output.

    
    +----------+-----+-----------+----------+
    |department|state|sum(salary)|sum(bonus)|
    +----------+-----+-----------+----------+
    |Finance   |NY   |162000     |34000     |
    |Marketing |NY   |91000      |21000     |
    |Sales     |CA   |81000      |23000     |
    |Marketing |CA   |80000      |18000     |
    |Finance   |CA   |189000     |47000     |
    |Sales     |NY   |176000     |30000     |
    +----------+-----+-----------+----------+
    

Similarly, we can run group by and aggregate on two or more columns for other aggregate functions, please refer to the below example.

4\. Running more aggregates at a time
-------------------------------------

Using [agg() aggregate function](https://sparkbyexamples.com/pyspark/pyspark-groupby-agg-aggregate-explained/) we can calculate many aggregations at a time on a single statement using SQL functions sum(), avg(), min(), max() mean() e.t.c. In order to use these, we should import `"from pyspark.sql.functions import sum,avg,max,min,mean,count"`

    
    from pyspark.sql.functions import sum,avg,max
    df.groupBy("department") \
        .agg(sum("salary").alias("sum_salary"), \
             avg("salary").alias("avg_salary"), \
             sum("bonus").alias("sum_bonus"), \
             max("bonus").alias("max_bonus") \
         ) \
        .show(truncate=False)
    

This example does group on `department` column and calculates `sum()` and `avg()` of `salary` for each department and calculates `sum()` and `max()` of bonus for each department.

    
    +----------+----------+-----------------+---------+---------+
    |department|sum_salary|avg_salary       |sum_bonus|max_bonus|
    +----------+----------+-----------------+---------+---------+
    |Sales     |257000    |85666.66666666667|53000    |23000    |
    |Finance   |351000    |87750.0          |81000    |24000    |
    |Marketing |171000    |85500.0          |39000    |21000    |
    +----------+----------+-----------------+---------+---------+
    

5\. Using filter on aggregate data
----------------------------------

Similar to SQL “HAVING” clause, On PySpark DataFrame we can use either [where()](https://sparkbyexamples.com/pyspark/pyspark-dataframe-filter/) or [filter()](https://sparkbyexamples.com/pyspark/pyspark-dataframe-filter/) function to filter the rows of aggregated data.

    
    from pyspark.sql.functions import sum,avg,max
    df.groupBy("department") \
        .agg(sum("salary").alias("sum_salary"), \
          avg("salary").alias("avg_salary"), \
          sum("bonus").alias("sum_bonus"), \
          max("bonus").alias("max_bonus")) \
        .where(col("sum_bonus") >= 50000) \
        .show(truncate=False)
    

This removes the sum of a bonus that has less than 50000 and yields below output.

    
    +----------+----------+-----------------+---------+---------+
    |department|sum_salary|avg_salary       |sum_bonus|max_bonus|
    +----------+----------+-----------------+---------+---------+
    |Sales     |257000    |85666.66666666667|53000    |23000    |
    |Finance   |351000    |87750.0          |81000    |24000    |
    +----------+----------+-----------------+---------+---------+
    

6\. PySpark groupBy Example Source code
---------------------------------------

    
    import pyspark
    from pyspark.sql import SparkSession
    from pyspark.sql.functions import col,sum,avg,max
    
    spark = SparkSession.builder.appName('SparkByExamples.com').getOrCreate()
    
    simpleData = [("James","Sales","NY",90000,34,10000),
        ("Michael","Sales","NY",86000,56,20000),
        ("Robert","Sales","CA",81000,30,23000),
        ("Maria","Finance","CA",90000,24,23000),
        ("Raman","Finance","CA",99000,40,24000),
        ("Scott","Finance","NY",83000,36,19000),
        ("Jen","Finance","NY",79000,53,15000),
        ("Jeff","Marketing","CA",80000,25,18000),
        ("Kumar","Marketing","NY",91000,50,21000)
      ]
    
    schema = ["employee_name","department","state","salary","age","bonus"]
    df = spark.createDataFrame(data=simpleData, schema = schema)
    df.printSchema()
    df.show(truncate=False)
    
    df.groupBy("department").sum("salary").show(truncate=False)
    
    df.groupBy("department").count().show(truncate=False)
    
    
    df.groupBy("department","state") \
        .sum("salary","bonus") \
       .show(truncate=False)
    
    df.groupBy("department") \
        .agg(sum("salary").alias("sum_salary"), \
             avg("salary").alias("avg_salary"), \
             sum("bonus").alias("sum_bonus"), \
             max("bonus").alias("max_bonus") \
         ) \
        .show(truncate=False)
        
    df.groupBy("department") \
        .agg(sum("salary").alias("sum_salary"), \
          avg("salary").alias("avg_salary"), \
          sum("bonus").alias("sum_bonus"), \
          max("bonus").alias("max_bonus")) \
        .where(col("sum_bonus") >= 50000) \
        .show(truncate=False)
    

This example is also available at [GitHub PySpark Examples](https://github.com/spark-examples/pyspark-examples/blob/master/pyspark-groupby.py) project for reference.

7\. Conclusion
--------------

In this tutorial, you have learned how to use `groupBy()` functions on PySpark DataFrame and also learned how to run these on multiple columns and finally filter data on the aggregated columns.

Thanks for reading. If you like it, please do share the article by following the below social links and any comments or suggestions are welcome in the comments sections! 

