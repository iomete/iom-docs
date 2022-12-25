---
title: Data Compaction Job
description: IOMETE provides built-in job to run data compactions for iceberg tables that slow down over the time and require to run data compaction to clean up tables
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

___

Over the time iceberg tables could slow down and require to run data compaction to clean up tables.
**IOMETE** provides built-in job to run data compactions for each table. This job triggers the next iceberg processes:
1. ExpireSnapshots [Maintenance - Expire Snapshots](https://iomete.com/docs/iceberg-tables/maintenance#expire-snapshots)
2. Delete Orphan Files - See [Maintenance - Delete Orphan Files](https://iomete.com/docs/iceberg-tables/maintenance#delete-orphan-files)
3. Rewrite Data Files - See [Maintenance - Rewrite Data Files](https://iomete.com/docs/iceberg-tables/maintenance#compact-data-files) 
4. Rewrite Manifests - See [Maintenance](https://iomete.com/docs/iceberg-tables/maintenance#rewrite-manifests) 
   
To enable data compaction spark job follow the next steps:
1. In the left sidebar menu choose `Spark Jobs`
2. `Create` new job
3. Fill the form with below values:

| Field Name                                                                           	| Value                               	|
|--------------------------------------------------------------------------------------	|-------------------------------------	|
| Schedule (example will run job every Sunday at 12:00, feel free to change the value) 	| 0 12 * * SUN                        	|
| Docker Image                                                                         	| iomete/iomete_data_compaction:0.2.0 	|
| Main application file                                                                	| local:///app/driver.py              	|
| Main class                                                                           	| Leave empty                         	|
| Instance: Size (ICU) (feel free to increase)                                         	| 2                                   	|

See example screenshot below

![data compaction job](/img/spark-job/data-compaction-job.png)

<br/>
 

### Github

We've created initial job for data-compaction which will be enough in most cases. Feel free to fork and create new data compaction image based on your company requirements. 
[View in Github](https://github.com/iomete/data-compaction-job)