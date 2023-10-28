---
title: Kafka Streaming
description: Learn how to move data from Kafka to Iceberg using IOMETE. This guide covers deserialization, job creation, configuration, and testing.
slug: kafka-streaming-job
last_update:
  date: 08/24/2023
  author: Vugar Dadalov
---

import FlexButton from "@site/src/components/FlexButton";
import Img from "@site/src/components/Img";
import { Cpu, Plus } from "@phosphor-icons/react";

---

![kafka and IOMETE logo](/img/spark-job/kafka-logo-iomete.png)

This is a collection of data movement capabilities. This streaming job copies data from Kafka to Iceberg.

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Deserialization Format](#deserialization-format)
- [Spark Job creation](#spark-job-creation)
- [Configuration properties](#configuration-properties)

## Deserialization Format

Currently, only JSON deserialization format supported.

## Spark Job creation

- In the left sidebar menu choose <FlexButton label='Spark Jobs'><Cpu size={20} color='#858c9c' weight="duotone"/></FlexButton>
- Click on <FlexButton label='Create' primary><Plus size={16} /></FlexButton>

Specify the following parameters (these are examples, you can change them based on your preference):

- **Name**: `kafka-iceberg-stream`
- **Docker image**: `iomete/kafka-iceberg-stream:1.0.0`
- **Main application file**: `local:///app/job.py`
- **Java options** (Optional): `-Dlog4j.configurationFile=/opt/spark/iomete/log4j2.properties` - specify logging configuration file
- **Config file**: 
  ```hocon
  {
    kafka: {
      options: {
        "kafka.bootstrap.servers": "kafka-bootstrap-server:9092",
        "subscribePattern": ".*"
      },

      # either once or processing_time should be set for the trigger. Not both.
      trigger: {
        # processing_time: "15 minutes",
        once: True
      },

      # set checkpointLocation to object storage for production.
      # Example: "s3a://assests-dir/checkpoints/kafka-streaming/data/app1"
      checkpoint_location: ".tmp/checkpoints/kafka-streaming/data/app1",
    },
    destination: {
      database: "default",
      table: "all_db_changes_v1",
    }
  }
  ```

  :::note

  Note: It's recommended to exclude the `startingOffsets` option. If the table doesn't exist or is empty, it will default to the `earliest` setting automatically. Conversely, if the table is filled, it will default to the `latest` setting. This allows you to start from the beginning when the table is empty and continue from where you left off (based on the checkpoint state) when the table is not empty.

  :::

<Img src="/img/spark-job/cdc.png" alt="IOMETE Spark Jobs Create kafka streaming" />


## Configuration properties

- **kafka.options**: Kafka options. See [Kafka Consumer Configurations](https://spark.apache.org/docs/latest/structured-streaming-kafka-integration.html) for more details.
- **kafka.trigger**: Trigger options. See [Triggers](https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html#triggers) for more details. Only one of the `processing_time` or `once` should be set.
- **kafka.checkpoint_location**: Checkpoint location. See [Checkpointing](https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html#recovering-from-failures-with-checkpointing) for more details.
- **destination.database**: Iceberg database name. Database should be created before running the job.
- **destination.table**: Iceberg table name. Table will be created if it does not exist.

Job will create a table with the following schema:
```
root
 |-- topic: string (nullable = true)
 |-- partition: integer (nullable = true)
 |-- offset: long (nullable = true)
 |-- timestamp: timestamp (nullable = true)
 |-- timestampType: integer (nullable = true)
 |-- key: string (nullable = true)
 |-- value: string (nullable = true)
```

- **topic**: Kafka topic name that the record is received from.
- **partition**: Kafka partition number that the record is received from.
- **offset**: Kafka offset number that the record is received from.
- **timestamp**: Kafka timestamp that the record is received from.
- **timestampType**: Kafka timestamp type that the record is received from.
- **key**: Kafka record key.
- **value**: Kafka record value.
