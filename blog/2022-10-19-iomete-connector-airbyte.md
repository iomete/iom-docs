---
slug: iomete-airbyte-connector
title: IOMETE Airbyte Connector
authors: namig
hide_table_of_contents: true
tags: [Engineering]
image: img/blog/2022-10-19-iomete-connector-airbyte.md/iomete-airbyte-og.png
description: The IOMETE Airbyte Connector allows you to easily integrate data from popular third-party applications like Hubspot, Mixpanel, Salesforce, and other sources into the IOMETE platform for analysis and reporting.
banner_description: Easily integrate data from popular third-party applications like Hubspot, Mixpanel, Salesforce, and other sources into the IOMETE platform.
---

## Introduction

We are happy to introduce the IOMETE connector! This connector allows you to easily integrate data from popular third-party applications like Hubspot, Mixpanel, Salesforce, and other sources into the IOMETE platform for analysis and reporting. Combining data from these popular applications giving you a comprehensive view of your data and helping you better understand your customers and make more informed business decisions.

<!-- truncate -->

## What is an IOMETE connector?

IOMETE Connector is an Airbyte destination that allows you to incrementally or fully refresh your data into lakehouses. The goal is to safely extract data from your source and upload it to the lakehouses.
which allows data replication from any source into IOMETE lakehouses. With the IOMETE connector, you can easily configure the data load operations to keep the lakehouses synchronized. Airbyte provides over 150 editable prebuilt [connectors](https://airbyte.com/connectors). You can choose your source like MySQL or PostgreSQL among hundreds of connectors. Airbyte has a large open-source community and connectors are growing steadily.

## How does IOMETE connector work?

Data streams are first written as staging Parquet files on S3 and then loaded into IOMETE lakehouse. All the staging files will be deleted after the sync is done. IOMETE and Airbyte simplify data architectures and make it simple to develop and use a cloud data lake for analytics.

## Full Refresh sync

Full refresh deletes all previously synced data in the configured bucket path. It is recommended to provide a dedicated S3 resource for this sync to avoid unexpected data deletion caused by misconfiguration.

## Incremental - Append sync

Incremental synchronization is a process that periodically copies records that have been updated or inserted since the previous sync operation. It uses a cursor to determine which records have already been synchronized and which should be propagated.

## Staging area

The storage that Airbyte uses as a staging area. Airbyte will read/write to this staging area. Lakehouse only needs read access. Currently, IOMETE destination only supports S3.

## How to start your first synchronization?

Read the [doc](https://iomete.com/docs/integrations/airbyte/) on how to connect your MySQL database to IOMETE
