---
title: File Streaming
description: Continuously ingest files from object storage into an Iceberg table with the File Streaming Spark job. Configure source file settings, destination table settings, and processing intervals.
slug: file-streaming-job
last_update:
  date: 05/07/2026
  author: Vugar Dadalov
---

import FlexButton from "@site/src/components/FlexButton";
import Img from "@site/src/components/Img";
import { Cpu, Plus } from "@phosphor-icons/react";

---

Continuously ingest files from object storage into an Iceberg table.

## File formats

Tested file formats.

- CSV

## Job creation

- In the left sidebar menu choose <FlexButton label='Spark Jobs'><Cpu size={20} color='#858c9c' weight="duotone"/></FlexButton>
- Click on <FlexButton label='Create' primary><Plus size={16} /></FlexButton>

Specify the following parameters (these are examples, you can change them based on your preference):

- **Name:** `file-streaming-job`
- **Docker image:** `iomete/iomete-file-streaming:1.0.1`
- **Main application file:** `local:///app/driver.py`
- **Environment variables:** `LOG_LEVEL`: `INFO` or ERROR

<Img src="/img/spark-job/spark-job-create-file-streaming.png" alt="IOMETE Spark Jobs Create" />

:::info Environment variables
You can use **Environment variables** to store your sensitive variables like password, secrets, etc. Then you can use these variables in your config file using the <code>$\{DB_PASSWORD}</code> syntax.
:::

<br/>

### Config file

- **Config file:**
  Scroll down, expand the `Application configurations` section, click `Add config file`, and paste the following HOCON configuration.

  <Img src="/img/spark-job/config/spark-config.png" alt="IOMETE Spark Jobs add config file" />

```hocon
{
  source: {
    file: {
      format: csv,
      header: true,
      path: "s3a://bucket/path_to_csv_files/",
      max_files_per_trigger: 1,
      latest_first: false,
      max_file_age: "7d"
    }
  }
  destination: {
    schema: default,
    table: csv_file_stream,
    partitions: []
  }
  processing_time: {
    interval: 30,
    unit: seconds # minutes
  }
}
```

### Configuration properties

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
        <code>source.file</code><br/>
      </td>
      <td>
        Source file configuration.
        <ul>
          <li><code>format</code> File format to read. CSV is currently supported.</li>
          <li><code>header</code> Whether the CSV files include a header row.</li>
          <li><code>path</code> Source directory path, including the filesystem scheme, for example <code>s3a://bucket/path_to_csv_files/</code>.</li>
          <li><code>max_files_per_trigger</code> Maximum number of new files to process per streaming trigger.</li>
          <li><code>latest_first</code> Whether to process the latest files first when there is a backlog.</li>
          <li><code>max_file_age</code> Maximum age of files to be considered by the stream.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <code>destination</code><br/>
      </td>
      <td>
        Destination Iceberg table configuration.
        <ul>
          <li><code>schema</code> Destination schema or database.</li>
          <li><code>table</code> Destination table.</li>
          <li><code>partitions</code> Optional destination partition columns.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <code>processing_time</code><br/>
      </td>
      <td>
        Streaming trigger interval configuration.
        <ul>
          <li><code>interval</code> Processing trigger interval.</li>
          <li><code>unit</code> Processing trigger unit, such as <code>seconds</code> or <code>minutes</code>.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

:::note
Use the full source path in `source.file.path`, including the filesystem scheme, for example `s3a://bucket/path_to_csv_files/`. For the default CSV example, omit `schema` unless you provide explicit column definitions.
:::

Create Spark Job - Deployment

![Deployment preferences.](/img/spark-job/file-job-creation-deployment.png)

Create Spark Job - Instance

:::note
You can use **Environment Variables** to store your sensitive data like password, secrets, etc. Then you can use these variables in your config file using the <code>$\{ENV_NAME}</code> syntax.
:::

![Instance and environment variable parameters.](/img/spark-job/file-job-creation-instance.png)

Create Spark Job - Application Config

![Job config.](/img/spark-job/file-spark-job-config-hocon.png)

## Tests

### Prepare the dev environment

```shell
virtualenv .env #or python3 -m venv .env
source .env/bin/activate

pip install -e ."[dev]"
```

### Run test

```shell
python3 -m pytest # or just pytest
```
