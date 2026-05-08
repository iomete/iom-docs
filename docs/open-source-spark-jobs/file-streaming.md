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

---

Continuously ingest files from object storage into an Iceberg table.

## File formats

Tested file formats.

- CSV

## Job creation

- In the left sidebar, under **Applications**, click **Job Templates**.
- Click <FlexButton label='Marketplace' /> to open the list of preconfigured Marketplace jobs.
- Find `file-streaming-job`, open the actions menu, and click <FlexButton label='Deploy' />.
- The Marketplace template opens a pre-filled **Create New Job** form. Review the defaults and update the values for your environment.

You can also create a job template manually with [**New Job Template**](/resources/user-guide/spark-jobs/creating-spark-job), but the Marketplace flow is recommended because it pre-populates the File Streaming image, Spark config, environment variables, and default config map.

Specify the following parameters (these are examples, you can change them based on your preference):

- **Name:** `file-streaming-job`
- **Docker image:** `iomete/iomete-file-streaming:1.0.1`
- **Main application file:** `local:///app/driver.py`
- **Environment variables:** `LOG_LEVEL`: `INFO` or `ERROR`
- **Spark config:** `spark.sql.streaming.schemaInference`: `true`

<Img src="/img/spark-job/spark-job-create-file-streaming.png" alt="IOMETE Spark Jobs Create" />

### Environment variables

The Marketplace template includes `LOG_LEVEL` by default. You can also use environment variables to store sensitive values, such as passwords or secrets, and reference them in your config file using the <code>$\{DB_PASSWORD}</code> syntax.

<Img src="/img/spark-job/file-streaming-environment-variables.png" alt="File Streaming environment variables" />

### Spark config

The Marketplace template enables schema inference for CSV file streaming.

<Img src="/img/spark-job/file-streaming-spark-config.png" alt="File Streaming Spark config" />

<br/>

### Config file

- **Config file:**
  The Marketplace template includes a default `application.conf` file under the `Config Maps` tab. Review the configuration and update the source path and destination table values for your environment.

  The configuration uses HOCON syntax, which supports JSON-like objects with comments and unquoted keys. The example below matches the default Marketplace `application.conf` shape.

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
Use the full source path in `source.file.path`, including the filesystem scheme, for example `s3a://bucket/path_to_csv_files/`. The default Marketplace config omits `schema`; only add it if you provide explicit column definitions.
:::

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
