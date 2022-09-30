---
title: File Streaming
---

<!-- <head>
  <title>File Streaming</title>
  <meta
    name="description"
    content="File Streaming"
  />
</head> -->

___

Transfer files to iceberg continuously.

## Table of Contents
 * [File Formats](#file-formats)
 * [Job creation](#job-creation)
 * [Tests](#tests)

## File formats
Tested file formats.
- CSV

## Job creation

- Go to `Spark Jobs`.
- Click on `Create New`.

Specify the following parameters (these are examples, you can change them based on your preference):
- **Name:** `file-streaming-job`
- **Docker Image:** `iomete/iomete_file_streaming_job:0.2.0`
- **Main application file:** `local:///app/driver.py`
- **Environment Variables:** `LOG_LEVEL`: `INFO` or ERROR
- **Config file:** 
```json
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
        <code>file</code><br/>
      </td>
      <td>
        <p>Required properties to connect and configure.</p>
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
        <p>Destination database properties.</p>
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
        <p>Processing time to persist incoming data on iceberg.</p>
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
You can use **Environment Variables** to store your sensitive data like password, secrets, etc. Then you can use these variables in your config file using the <code>${ENV_NAME}</code> syntax.
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