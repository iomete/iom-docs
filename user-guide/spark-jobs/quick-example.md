---
title: Quick example of Spark Job
sidebar_label: Quick Example
description: Learn how to run your first Spark Job on the IOMETE platform using PySpark. Follow our step-by-step guide and get started with Spark Jobs today!
last_update:
  date: 04/20/2026
  author: Ujjawal Khare
---

import Img from '@site/src/components/Img';
import { Plus, Code, Cpu } from "@phosphor-icons/react";

This guide walks you through writing, testing, and deploying your first Spark Job on the IOMETE platform. By the end, you'll have a working PySpark job running in IOMETE.

:::info
In this guide, we will use a PySpark sample job but, you can use any other language like Scala, Java or other supported languages.
:::

---

## Quickstart

IOMETE provides a [PySpark quickstart template for AWS](https://github.com/iomete/spark-job-template) or [PySpark quickstart template for GCP](https://github.com/iomete/spark-job-template-gcp) as a starting point for your first Spark Job. Follow the instructions in the `README` file to set up and run it.

## Sample Job

The template already contains a sample job that reads a CSV file from an S3 bucket, runs some transformations, and writes the output to an Iceberg Table.

[Apache Iceberg](https://iceberg.apache.org/) is an open table format for Apache Spark that provides **ACID** transactions, scalable metadata handling, and a unified specification for both **streaming** and **batch** data.

## Using the Template

This template is meant to be used as a starting point for your own jobs. The typical workflow is:

1.  Clone the repository
2.  Modify the code and tests to fit your needs
3.  Build the Docker image and push it to your Docker registry
4.  [Create a Spark Job](./creating-spark-job.md) in the IOMETE console
5.  Run the Spark Job
6.  Iterate — modify code, rebuild, and redeploy

:::note
If you are starting with PySpark at IOMETE, explore the sample code without modifying it. It will help you understand the process of creating and running a Spark Job.
:::

## Project Structure

The project is composed of the following folders/files:

- `infra/`: contains requirements and Dockerfile files
  - `requirements-dev.txt`: contains the list of python packages to install for development
  - `requirements.txt`: contains the list of python packages to install for production. This requirements file is used to build the Docker image
  - `Dockerfile`: contains the Dockerfile to build the spark job image
- `spark_conf/`: contains the spark configuration files for development environment
  - `spark-defaults.conf`: contains the spark configuration
  - `log4j.properties`: contains the log4j configuration for the PySpark job. This file is used to configure the logging level of the job
- `test_data/`: contains the test data for the job unit/integration tests
- `job.py`: contains the spark job code. Template comes with a sample code that reads a csv file from S3 and writes the data to a table in the Lakehouse. Feel free to modify the code to fit your needs.
- `test_job.py`: contains the spark job tests. Template comes with a sample test that reads the test data from `test_data/` and asserts the output of the job. Feel free to modify the tests to fit your needs.
- `Makefile`: contains the commands to run the job and tests

## Running the Job

First, create a virtual environment and install the dependencies:

```bash
virtualenv .env
source .env/bin/activate

# make sure you have Python 3.9 or higher
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

## Running the Tests

Make sure you have installed the dependencies and exported the `SPARK_CONF_DIR` environment variable as described in the previous section.

To run the tests, use the `pytest` command:

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

Once the image is pushed to your Docker registry, you're ready to deploy it. Head over to [Creating Spark Job](./creating-spark-job.md) to set up the job in the IOMETE console. Use the following values in the **Application** section:

- **Docker registry**: Select the registry where you pushed the image (or `default` if using IOMETE's built-in registry).
- **Docker image**: Enter your image and tag, e.g. `your-registry/your-image:1.0.0`.
- **Main application file**: `local:///app/job.py`