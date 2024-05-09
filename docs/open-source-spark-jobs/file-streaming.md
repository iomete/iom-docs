---
title: File Streaming
description: Stream files to iceberg continuously with Spark file streaming job. Configure file formats, database settings, and processing time intervals. Run tests for seamless file streaming.
slug: file-streaming-job
last_update:
  date: 08/24/2023
  author: Vugar Dadalov
---

import FlexButton from "@site/src/components/FlexButton";
import Img from "@site/src/components/Img";
import { Cpu, Plus } from "@phosphor-icons/react";

---

Transfer files to iceberg continuously.

## File formats

Tested file formats.

- CSV

## Job creation

- In the left sidebar menu choose <FlexButton label='Spark Jobs'><Cpu size={20} color='#858c9c' weight="duotone"/></FlexButton>
- Click on <FlexButton label='Create' primary><Plus size={16} /></FlexButton>

Specify the following parameters (these are examples, you can change them based on your preference):

- **Name:** `file-streaming-job`
- **Docker image:** `iomete/iomete_file_streaming_job:0.2.0`
- **Main application file:** `local:///app/driver.py`
- **Environment variables:** `LOG_LEVEL`: `INFO` or ERROR

<Img src="/img/spark-job/spark-job-create-file-streaming.png" alt="IOMETE Spark Jobs Create" />

:::info Environment variables
You can use **Environment variables** to store your sensitive variables like password, secrets, etc. Then you can use these variables in your config file using the <code>$\{DB_PASSWORD}</code> syntax.
:::

<br/>

### Config file

- **Config file:**
  Scroll down and expand `Application configurations` section and click `Add config file` and paste following **JSON**.

  <Img src="/img/spark-job/spark-job-app-config.png" alt="IOMETE Spark Jobs add config file" />

```js
{
  file: {
    format: csv,
    path: "files/",
    max_files_per_trigger: 1,
    latest_first: false,
    max_file_age: "7d"
  }
  database: {
    schema: default,
    table: awesome_csv_addresses
  }
  processing_time: {
    interval: 5
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
        <code>file</code><br/>
      </td>
      <td>
        Required properties to connect and configure.
        <ul>
          <li><code>format</code> The format of file.</li>
          <li><code>path</code> The source path to connect file directory</li>
          <li><code>max_files_per_trigger</code> Maximum file number per trigger.</li>
          <li><code>latest_first</code> Whether to process the latest new files first, useful when there is a large backlog of files.</li>
          <li><code>max_file_age</code> Maximum age of files to be processed.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <code>database</code><br/>
      </td>
      <td>
        Destination database properties.
        <ul>
          <li><code>schema</code> Specify the schema (database) to store into.</li>
          <li><code>table</code> Specify the table.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <code>processing_time</code><br/>
      </td>
      <td>
        Processing time to persist incoming data on iceberg.
        <ul>
          <li><code>interval</code> Processing trigger interval.</li>
          <li><code>table</code> Processing trigger unit: seconds, minutes.</li>
        </ul>
      </td>
    </tr>
</tbody>
</table>

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
