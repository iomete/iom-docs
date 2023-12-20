---
title: PySpark windows
description:  PySpark SQL `Inner` join is the most commonly used join. It joins two DataFrames on key columns, and if keys don't match, the rows are dropped from both datasets (`emp` & `dept`)
---

In this article, I will explain how to install and run PySpark on windows and also explain how to [start a history server](https://sparkbyexamples.com/spark/spark-history-server-to-monitor-applications/) and [monitor your jobs using Web UI](https://sparkbyexamples.com/spark/spark-web-ui-understanding/).

**Related:**

*   [PySpark Install on Mac OS](https://sparkbyexamples.com/pyspark/how-to-install-pyspark-on-mac/)
*   [Apache Spark Installation on Windows](https://sparkbyexamples.com/spark/apache-spark-installation-on-windows/)

PySpark is a Spark library written in Python to run Python applications using Apache Spark capabilities. so there is no PySpark library to download. All you need is Spark.

Follow the below steps to **Install PySpark on Windows**.

Install Python or Anaconda distribution
---------------------------------------

Download and install either Python from [Python.org](https://www.python.org/downloads/windows/) or [Anaconda distribution](https://www.anaconda.com/) which includes Python, Spyder IDE, and Jupyter notebook. I would recommend using Anaconda as it’s popular and used by the Machine Learning & Data science community.

Follow [Install PySpark using Anaconda & run Jupyter notebook](https://sparkbyexamples.com/pyspark/install-pyspark-in-anaconda-jupyter-notebook/)

**Install Java 8**
------------------

To run the PySpark application, you would need Java 8 or a later version hence download the Java version from [Oracle](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) and install it on your system.

Post-installation set JAVA\_HOME and PATH variable.

    
    JAVA_HOME = C:\Program Files\Java\jdk1.8.0_201
    PATH = %PATH%;C:\Program Files\Java\jdk1.8.0_201\bin
    

**PySpark** Install on Windows
------------------------------

PySpark is a Spark library written in Python to run Python applications using Apache Spark capabilities. so there is no PySpark library to download. All you need is Spark; follow the below steps to install PySpark on windows.

1\. On [Spark Download](https://spark.apache.org/downloads.html) page, select the link “Download Spark (point 3)” to download. If you wanted to use a different version of Spark & Hadoop, select the one you wanted from drop-downs, and the link on point 3 changes to the selected version and provides you with an updated link to download.

![Pyspark install windows](https://sparkbyexamples.com/ezoimgfmt/i0.wp.com/sparkbyexamples.com/wp-content/uploads/2020/08/pyspark-installation.jpg?resize=565%2C148&ssl=1)

2\. After download, untar the binary using [7zip](https://www.7-zip.org/download.html) and copy the underlying folder `spark-3.0.0-bin-hadoop2.7` to `c:\apps`

3\. Now set the following environment variables.

    
    SPARK_HOME  = C:\apps\spark-3.0.0-bin-hadoop2.7
    HADOOP_HOME = C:\apps\spark-3.0.0-bin-hadoop2.7
    PATH=%PATH%;C:\apps\spark-3.0.0-bin-hadoop2.7\bin
    

Install winutils.exe on Windows
-------------------------------

Download winutils.exe file from [winutils](https://github.com/steveloughran/winutils/blob/master/hadoop-2.7.1/bin/winutils.exe), and copy it to `%SPARK_HOME%\bin` folder. Winutils are different for each Hadoop version hence download the right version from [https://github.com/steveloughran/winutils](https://github.com/steveloughran/winutils)

PySpark shell
-------------

Now open the command prompt and type pyspark command to run the PySpark shell. You should see something like this below.

![pyspark installation windows](https://sparkbyexamples.com/ezoimgfmt/i0.wp.com/sparkbyexamples.com/wp-content/uploads/2020/08/pyspark-shell.jpg?resize=668%2C127&ssl=1)

Spark-shell also creates a [Spark context web UI](https://sparkbyexamples.com/spark/spark-web-ui-understanding/) and by default, it can access from http://localhost:4041.

Web UI
------

Apache Spark provides a suite of Web UIs (Jobs, Stages, Tasks, Storage, Environment, Executors, and SQL) to [monitor the status of your Spark application](https://sparkbyexamples.com/spark/spark-web-ui-understanding/).

![Spark Web UI](https://sparkbyexamples.com/ezoimgfmt/i0.wp.com/sparkbyexamples.com/wp-content/uploads/2020/08/spark-web-ui.png?resize=755%2C501&ssl=1)

Spark Web UI

History Server
--------------

History servers, keep a log of all PySpark applications you submit by spark-submit, pyspark shell. before you start, first you need to set the below config on `spark-defaults.conf`

    
    spark.eventLog.enabled true
    spark.history.fs.logDirectory file:///c:/logs/path
    

Now, start the history server on Linux or Mac by running.

    
    $SPARK_HOME/sbin/start-history-server.sh
    

If you are running PySpark on windows, you can start the history server by starting the below command.

    
    $SPARK_HOME/bin/spark-class.cmd org.apache.spark.deploy.history.HistoryServer
    

By default, History server listens at 18080 port and you can access it from the browser using http://localhost:18080/

![pyspark installation windows](https://sparkbyexamples.com/ezoimgfmt/i0.wp.com/sparkbyexamples.com/wp-content/uploads/2020/08/spark-history-server-1.png?resize=1024%2C465&ssl=1)

History Server

By clicking on each App ID, you will get the details of the application in PySpark web UI.

Conclusion
----------

In summary, you have learned how to install PySpark on windows and run sample statements in spark-shell

If you have any issues, setting up, please message me in the comments section, I will try to respond with the solution.