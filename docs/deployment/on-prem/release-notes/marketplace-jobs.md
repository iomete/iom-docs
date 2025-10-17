---
title: Marketplace Jobs
sidebar_label: Marketplace Jobs
description: Release notes for IOMETE Marketplace Jobs. Learn about updates, improvements, and bug fixes for various data integration and processing jobs.
---

import Img from '@site/src/components/Img';
import GridBox from '@site/src/components/GridBox';
import MarketplaceJob from '@site/src/components/MarketplaceJob';
import { Release, NewFeatures, Improvements, BugFixes, ReleaseDescription, Deprecations, BreakingChanges } from '@site/src/components/Release';

## Latest Versions

<GridBox>
  <MarketplaceJob
    name="Data Compaction"
    githubPath="data-compaction-job"
    version="1.2.11"
    description="Over time, iceberg tables can slow down and may need data compaction to tidy them up. IOMETE offers a built-in job to execute data compactions for each table."
  />
  <MarketplaceJob
    name="File Streaming"
    githubPath="file-streaming"
    version="0.3.0"
    description="A configuration-based, ready-to-use Spark Streaming job for replicating data from File sources (a directory, S3 location, etc.) to the IOMETE Lakehouse."
  />
  <MarketplaceJob
    name="Catalog Sync"
    githubPath="iomete-catalog-sync"
    version="4.3.3"
    description="Efficiently synchronize your data with the Data Catalog using IOMETE's Catalog Sync Job."
  />
  <MarketplaceJob
    name="MySQL Sync"
    githubPath="iomete-mysql-sync"
    version="3.0.0"
    description="Seamlessly transfer your MySQL tables to IOMETE Lakehouse with our easy-to-configure Spark Job."
  />
  <MarketplaceJob
    name="Kafka Iceberg Stream"
    githubPath="kafka-iceberg-stream"
    version="1.2.0"
    description="A configuration-based, ready-to-use Spark Streaming job for replicating data from Kafka to the IOMETE Lakehouse."
  />
</GridBox>

---

## Release Notes

<Release name="Data Compaction Job" version="1.2.11" date="October 20, 2025">
  <Improvements>
  </Improvements>
</Release>