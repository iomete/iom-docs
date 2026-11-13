---
title: Log Configurations
sidebar_label: Log Configurations
description: Spark jobs log at INFO by default. Change one job's log level with the LOG_LEVEL environment variable or a custom log4j2 configuration, then verify it in a new run.
last_update:
  date: 11/07/2026
  author: IOMETE
---

import Img from '@site/src/components/Img';

By default, Spark applications on IOMETE log at the `INFO` level, which gives useful information without too much output. When you troubleshoot a job, you can raise that job's level to `debug`, or lower it to `warn` to cut noise, without affecting other workloads.

## Default Log Level {#1-global-log-level-configuration}

IOMETE writes a ConfigMap named `spark-config` into the service namespace and every workload namespace of each data plane. Every compute cluster and Spark job that IOMETE runs mounts it as its Spark configuration directory. Its `log4j2.properties` file reads the root log level from an environment variable:

```properties
rootLogger.level=${env:LOG_LEVEL:-info}
```

A Spark application therefore logs at `INFO` unless its `LOG_LEVEL` environment variable says otherwise.

Don't edit the `spark-config` ConfigMap to change the default. The init job of the release that owns the namespace replaces the ConfigMap on every install and upgrade, so your edits are lost. That release is the control-plane release for the default data plane, or the runtime release of an additional data plane. No Helm value sets a platform-wide Spark log level: change the level per job instead, as described below.

## Changing a Job's Log Level {#2-custom-log-configurations}

You can change the level for one Spark job in two ways:

- Set the `LOG_LEVEL` environment variable. This changes the root level and needs no other configuration.
- Supply your own log4j2 configuration file. Use it when you need more than the root level, for example a different level for one package or a different log format.

Both apply only to runs that start after you save the job.

### Setting the Level With LOG_LEVEL

1. Open the job in the IOMETE console and click **Configure**.
2. In the **Configurations** section, open the **Environment variables** tab and add `LOG_LEVEL` with the level you want, for example `debug` or `warn`.
3. Click **Save**.

IOMETE passes the job's environment variables to both the driver and the executors, so both use the new level.

<Img src="/img/spark-job/logging/spark-logging-env.png" alt="Environment variables tab with LOG_LEVEL set to debug" />

### Using a Custom log4j2 Configuration

1. Open the job in the IOMETE console and click **Configure**.
2. In the **Configurations** section, open the **Config Maps** tab, click **Add config**, and paste the content of your `log4j2.properties` file. Start from the [base template](#3-base-log4j2-configuration-template) below.
3. Set **File path** to the path where the file should be mounted, for example `/etc/configs/log4j2.properties`.
    <Img src="/img/spark-job/logging/spark-logging-configmap.png" alt="Config Maps tab with a log4j2.properties file mounted at /etc/configs/log4j2.properties" />
4. On the **Java options** tab, point log4j2 to the file:
   ```shell
   -Dlog4j.configurationFile=/etc/configs/log4j2.properties
   ```
   The path must match the **File path** from the previous step.
    <Img src="/img/spark-job/logging/spark-logging-javaopts.png" alt="Java options tab with the log4j.configurationFile option" />
5. Click **Save**.

To keep controlling the root level with `LOG_LEVEL`, keep this line in your file:

```properties
rootLogger.level = ${env:LOG_LEVEL:-info}
```

<details id="3-base-log4j2-configuration-template" style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}>
<summary>Base log4j2 configuration template</summary>

This template has the same settings as the `log4j2.properties` file in the `spark-config` ConfigMap. Customize it as needed for specific logging requirements.

```properties
# Set everything to be logged to the console
rootLogger.level = ${env:LOG_LEVEL:-info}
rootLogger.appenderRef.stdout.ref = console

# Console appender configuration
appender.console.type = Console
appender.console.name = console
appender.console.target = SYSTEM_ERR
appender.console.layout.type = PatternLayout
appender.console.layout.pattern = %d{yy/MM/dd HH:mm:ss} %p %c{1}: %m%n%ex

# Default log levels for Spark REPL and SQL shell
logger.repl.name = org.apache.spark.repl.Main
logger.repl.level = warn
logger.thriftserver.name = org.apache.spark.sql.hive.thriftserver.SparkSQLCLIDriver
logger.thriftserver.level = warn

# Quieter Spark scheduler and Ranger logs
logger.scheduler.name = org.apache.spark.scheduler
logger.scheduler.level = warn
logger.ranger.name = org.apache.ranger
logger.ranger.level = warn

# Settings to quiet third-party logs
logger.jetty1.name = org.sparkproject.jetty
logger.jetty1.level = warn
logger.jetty2.name = org.sparkproject.jetty.util.component.AbstractLifeCycle
logger.jetty2.level = error
logger.replexprTyper.name = org.apache.spark.repl.SparkIMain$exprTyper
logger.replexprTyper.level = info
logger.replSparkILoopInterpreter.name = org.apache.spark.repl.SparkILoop$SparkILoopInterpreter
logger.replSparkILoopInterpreter.level = info
logger.parquet1.name = org.apache.parquet
logger.parquet1.level = error
logger.parquet2.name = parquet
logger.parquet2.level = error

# Hive support and ThriftServer log settings
logger.RetryingHMSHandler.name = org.apache.hadoop.hive.metastore.RetryingHMSHandler
logger.RetryingHMSHandler.level = fatal
logger.FunctionRegistry.name = org.apache.hadoop.hive.ql.exec.FunctionRegistry
logger.FunctionRegistry.level = error

# ThriftServer log suppression
appender.console.filter.1.type = RegexFilter
appender.console.filter.1.regex = .*Thrift error occurred during processing of message.*
appender.console.filter.1.onMatch = deny
appender.console.filter.1.onMismatch = neutral
```

</details>

### Verifying the Log Level

Editing the job doesn't change a run that's already running. Start a new run, open it, and confirm its **Data plane** and **Namespace** on the **Details** tab. Then check the **Logs** tab. With `LOG_LEVEL` set to `debug`, the driver log contains `DEBUG` lines such as:

```text
26/11/07 01:41:05 DEBUG InternalLoggerFactory: Using SLF4J as the default logging framework
```

If the log still shows only `INFO` and `WARN` lines, check that the variable name is exactly `LOG_LEVEL`, and that the run started after you saved the job. If you use a custom file, also check that the **Java options** path matches the config map's **File path**.

## Troubleshooting

### SLF4J StaticLoggerBinder Warning

When running Spark applications, you may encounter the following warning messages related to SLF4J
```
SLF4J: Failed to load class "org.slf4j.impl.StaticLoggerBinder".
SLF4J: Defaulting to no-operation (NOP) logger implementation
SLF4J: See http://www.slf4j.org/codes.html#StaticLoggerBinder for further details.
```

This warning only happens in slf4j version 1.7.x (and earlier versions) and it indicates that the SLF4J binding is not found in the classpath. Which happens due to conflicting dependencies. By default Spark uses the slf4j version 2.0.x. To resolve this issue you can force spark to load the version 2.0.x before the other conflicting dependencies. You can do this by adding the following spark-conf configuration:
```
spark.driver.extraClassPath    /opt/spark/jars/slf4j-api-2.0.7.jar
```
