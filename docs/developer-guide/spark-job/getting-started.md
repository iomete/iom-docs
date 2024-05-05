---
title: Getting Started with Spark Jobs
sidebar_label: Getting Started
description: Learn how to run your first Spark Job on the IOMETE platform using PySpark. Follow our step-by-step guide and get started with Spark Jobs today!
last_update:
  date: 01/26/2024
---

import Img from '@site/src/components/Img';
import { Plus, Code, Cpu } from "@phosphor-icons/react";

This guide aims to help you get familiar with getting started with writing your first Spark Job and deploying in the IOMETE platform.

:::info
In this guide, we will use a PySpark sample job but, you can use any other language like Scala, Java or other supported languages.
:::

---

## Quickstart

IOMETE provides a [PySpark quickstart template for AWS](https://github.com/iomete/spark-job-template) or [PySpark quickstart template for GCP](https://github.com/iomete/spark-job-template-gcp) for you to get started with your first Spark Job. You can use this template to get started with your first Spark Job. Please follow the instructions in the `README` file to get started.

## Sample Job

The template already contains a sample job that reads a CSV file from a S3 bucket, run some transformations and writes the output to an Iceberg Table.

:::info
[Apache Iceberg](https://iceberg.apache.org/) is a new open table format for Apache Spark that improves on the existing table formats to provide **ACID** transactions, scalable metadata handling, and a unified specification for both **streaming** and **batch** data.
:::

## How can I use this template?

This template is meant to be used as a starting point for your own jobs. You can use it as follows:

1.  Clone this repository
2.  Modify the code and tests to fit your needs
3.  Build the Docker image and push it to your Docker registry
4.  Create a Spark Job in the IOMETE Control Plane
5.  Run the Spark Job
6.  Modify the code and tests as needed
7.  Go to step 3

:::note
If you are just starting with PySpark at IOMETE, you can just explore the sample code without modifying it. It will help you understand process of creating a Spark Job and running it.
:::

## Project Structure

The project is composed of the following folders/files:

- `infra/`: contains requirements and Dockerfile files
  - `requirements-dev.txt`: contains the list of python packages to install for development
  - `requirements.txt`: contains the list of python packages to install for production. This requirements file is used to build the Docker image
  - `Dockerfile`: contains the Dockerfile to build the spark job image
- `spark-conf/`: contains the spark configuration files for development environment
  - `spark-defaults.conf`: contains the spark configuration
  - `log4j.properties`: contains the log4j configuration for the PySpark job. This file is used to configure the logging level of the job
- `test_data/`: contains the test data for the job unit/integration tests
- `job.py`: contains the spark job code. Template comes with a sample code that reads a csv file from S3 and writes the data to a table in the Lakehouse. Feel free to modify the code to fit your needs.
- `test_job.py`: contains the spark job tests. Template comes with a sample test that reads the test data from `test_data/` and asserts the output of the job. Feel free to modify the tests to fit your needs.
- `Makefile`: contains the commands to run the job and tests

## How to run the job

First, create a virtual environment and install the dependencies:

```bash
virtualenv .env
source .env/bin/activate

# make sure you have python version 3.7.0 or higher
make install-dev-requirements
```

Also, set the `SPARK_CONF_DIR` environment variable to point to the `spark_conf` folder. This is needed to load the spark configuration files for local development:

```bash
export SPARK_CONF_DIR=./spark_conf
```

Then, you can run the job:

```bash
python job.py
```

## How to run the tests

:::info
Make sure you have installed the dependencies, and exported the `SPARK_CONF_DIR` environment variable as described in the previous section.
:::

To run the tests, you can use the `pytest` command:

```bash
pytest
```

## Deployment

### Build Docker Image

In the Makefile, modify `docker_image` and `docker_tag` variables to match your Docker image name and tag.

:::info
For example, if you push your image to AWS ECR, your docker image name will be something like `123456789012.dkr.ecr.us-east-1.amazonaws.com/my-image`.
:::

Then, run the following command to build the Docker image:

```bash
make docker-push
```

Once the docker is built and pushed to your Docker registry, you can create a Spark Job in the IOMETE.

### Creating a Spark Job

There are two ways to create a Spark Job in the IOMETE:

1.  Using the IOMETE Control Plane UI
2.  Using the IOMETE Control Plane API

**Using the IOMETE Control Plane UI**

1.  Go to <button className="button button--default button-iom"><Cpu size={16} /> Spark Jobs</button> page
2.  Click on <button className="button button--primary button-iom"><Plus size={16} /><b>Create</b></button>
3.  Provide the following information:
    - `Name` : `sample-job`
    - `Docker image` : `iomete/sample-job:1.0.0`
    - `Main application file` : `local:///app/job.py`

<Img src="/img/guides/spark-job/job-create.png" alt="Create Spark Job" maxWidth="520px"/>

**Using the IOMETE Control Plane API**

You can create a Spark job using the API. After entering the inputs, go to the bottom and click the <button className="button button--primary button-iom"><Code size={16} /></button> button next to the <button className="button button--primary button-iom">Create</button> button. You will see a CURL command.

<Img src="/img/guides/spark-job/job-create-api.png" alt="Create Spark Job with API" maxWidth="520px"/>

<!-- :::info CURL
You can see <button className="button button--primary button-iom"><Code size={16} /></button> button for `Run job`, `Abort job`, `Get run list`,` Get job details`, `Delete job`, `Edit job`
::: -->

<Img src="/img/guides/spark-job/job-create-api-example.png" alt="Create Spark Job with API" maxWidth="520px"/>

:::info ACCESS TOKEN
To create an access token, go to the Settings menu and switch to the Access Tokens tab.
:::

### Run Spark Job

Once the Spark Job is created, you can run it using the IOMETE Control Plane UI or API.

To run it from the UI, go to the `Spark Jobs` page, go to the details of job and click on the `Run` button.

<Img src="/img/guides/spark-job/job-run-btn.png" alt="Run Spark Job" maxWidth="520px"/>

To run it from the API, click the <button className="button button--primary button-iom"><Code size={16} /></button> button next to the <button className="button button--primary button-iom">Run job</button> button.

<Img src="/img/guides/spark-job/job-run-api.png" alt="Run Spark Job with API" maxWidth="520px"/>

You can monitor and check the status of the Spark Job run from the `Spark Job Runs` page:

<Img src="/img/guides/spark-job/job-run-view.png" alt="Spark Job Run Details"/>

Congratulations 🎉🎉🎉
