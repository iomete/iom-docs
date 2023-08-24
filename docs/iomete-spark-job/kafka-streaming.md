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
- [Deserialization](#deserialization)
  - [JSON](#json)
  - [Avro](#avro)
- [Job creation](#job-creation)
- [Configuration properties](#configuration-properties)
- [Tests](#tests)

## Deserialization

Currently, two deserialization format supported.

1. JSON
2. AVRO

### JSON

In the Spark configuration, a user-defined reference json schema can be defined,
and the system processes the binary data accordingly. Otherwise,
It considers the schema of the first row and assumes the rest of the rows is compatible.

### Avro

Converts binary data according to the schema defined by the user or retrieves the schema from the schema registry.

![Avro record streaming.](/img/spark-job/kafka-avro-diagram.jpeg)

## Job creation

- In the left sidebar menu choose <FlexButton label='Spark Jobs'><Cpu size={20} color='#858c9c' weight="duotone"/></FlexButton>
- Click on <FlexButton label='Create' primary><Plus size={16} /></FlexButton>

Specify the following parameters (these are examples, you can change them based on your preference):

- **Name:** `kafka-streaming-job`
- **Docker image:** `iomete/iomete_kafka_streaming_job:0.2.1`
- **Main application file:** `local:///app/driver.py`
- **Environment variables:** `LOG_LEVEL`: `INFO` or `ERROR`

<Img src="/img/spark-job/spark-job-create-kafka-streaming.png" alt="IOMETE Spark Jobs Create kafka streaming" />

:::info Environment variables
You can use **Environment variables** to store your sensitive variables like password, secrets, etc. Then you can use these variables in your config file using the <code>${DB_PASSWORD}</code> syntax.
:::

## Config file

Scroll down and expand `Application configurations` section and click `Add config file` and paste following **JSON**.

<Img src="/img/spark-job/spark-job-app-config.png" alt="IOMETE Spark Jobs add config file" />

```json
{
  kafka: {
      bootstrap_servers: "localhost:9092",
      topic: "usage.spark.0",
      serialization_format: json,
      group_id: group_1,
      starting_offsets: latest,
      trigger: {
        interval: 5
        unit: seconds # minutes
      },
      schema_registry_url: "http://127.0.0.1:8081"
  },
  database: {
    schema: default,
    table: spark_usage_20
  }
}
```

## Configuration properties

<table>
  <thead>
    <tr>
      <th>Property</th>
      <th>Description</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        <code>kafka</code><br/>
      </td>
      <td>
        <p>Required properties to connect and configure.</p>
        <table>
            <tbody>
                <tr>
                  <td>
                    <code>bootstrap_servers</code>
                  </td>
                  <td>
                    <p>Kafka broker server.</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>topic</code>
                  </td>
                  <td>
                    <p>Kafka topic name.</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>serialization_format</code>
                  </td>
                  <td>
                    <p>Value data serialization format.</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>group_id</code>
                  </td>
                  <td>
                    <p>Consumer group id.</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>starting_offsets</code>
                  </td>
                  <td>
                    <p>Specify where to start instead.</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>trigger</code>
                  </td>
                  <td>
                    <ul>
                      <li><code>interval</code> Processing trigger interval.</li>
                      <li><code>unit</code> Processing trigger unit: seconds, minutes</li>
                    </ul>
                  </td>
                </tr>
            </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <code>database</code><br/>
      </td>
      <td>
        <p>Destination database properties.</p>
        <ul>
          <li><code>schema</code> Specify the schema (database) to store into.</li>
          <li><code>table</code> Specify the table.</li>
        </ul>
      </td>
    </tr>
</tbody>
</table>

<br/>

<Img src="/img/spark-job/spark-job-create-kafka-streaming-config.png" alt="IOMETE Spark kafka streaming create spark job application configuration" />

And, hit the create button.

## Tests

**Prepare the dev environment**

```shell
virtualenv .env #or python3 -m venv .env
source .env/bin/activate

pip install -e ."[dev]"
```

**Run test**

```shell
python3 -m pytest
```
