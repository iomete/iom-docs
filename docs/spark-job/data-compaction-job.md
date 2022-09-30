---
title: Data Compaction Job
---

<!-- <head>
  <title>Data Compaction Job</title>
  <meta
    name="description"
    content="Data Compaction Job"
  />
</head> -->

___

Over the time iceberg tables could slow down and require to run data compaction to clean up tables.
**iomete** provides built-in job to run data compactions for each table. This job triggers the next iceberg processes:
1. ExpireSnapshots [Maintenance - Expire Snapshots](doc:data-compaction#expire-snapshots)
2. Delete Orphan Files - See [Maintenance - Delete Orphan Files](doc:data-compaction#delete-orphan-files)
3. Rewrite Data Files - See [Maintenance - Rewrite Data Files](doc:data-compaction#compact-data-files) 
4. Rewrite Manifests - See [Maintenance](doc:data-compaction#rewrite-manifests) 
   
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

![](/img/spark-job/data-compaction-job.png)

<br/>
 

### Github

We've created initial job for data-compaction which will be enough in most cases. Feel free to fork and create new data compaction image based on your company requirements. 
[View in Github](https://github.com/iomete/data-compaction-job)