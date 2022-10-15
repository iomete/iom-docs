---
slug: sync-data-from-s3
title: Sync Data From S3
authors: namig
hide_table_of_contents: true
tags: [Engineering]
image: /img/blog/2022-04-25-sync-data-from-s3/thumb.jpeg
---

<head>
  <title>Sync Data From S3 | iomete blog</title>
  <meta name="robots" content="noindex, nofollow" />
  <meta name="googlebot" content="noindex"/>
</head>

## Intro
This is an end-to-end guide about how to move files from your AWS S3 to iomete and show it in the BI dashboard. In this example, we use a JSON file, but for other file types (such as CSV, Parquet, and ORC) visit [docs.](/docs/sync-data-from-aws-s3)

<!-- truncate -->

## Your files in AWS S3
Let's say you have a dedicated bucket where you have files you want to move to iomete:​

![Your files in AWS S3](/img/blog/2022-04-25-sync-data-from-s3/files-in-aws-s3.png)

:::note
This bucket will be different in your case. This is just an example bucket for demonstration purpose. We want to query/migrate countries.json file in the iomete platform:
:::

![The file (countries.json) we want to move to iomete](/img/blog/2022-04-25-sync-data-from-s3/my-staging-area-for-iomete.png)


You could download the countries.json file for yourself with this command:
```shell
wget https://iomete-public.s3.eu-central-1.amazonaws.com/datasets/countries.json​
```

## Create a storage integration in iomete
‍
1. Choose AWS External Storage:
![Create a storage integration in iomete](/img/blog/2022-04-25-sync-data-from-s3/create-storage-integration.png)

2. Specify a name and enter your AWS S3 Location to create integration between to:
![Specify a name](/img/blog/2022-04-25-sync-data-from-s3/specify-aws-location.png)

3. Once it is created copy policies created to be added to your S3 Bucket permissions:
![](/img/blog/2022-04-25-sync-data-from-s3/generated-bucket-policies.png)
![](/img/blog/2022-04-25-sync-data-from-s3/user-bucket-policies.png)

4. Go to your AWS S3 Bucket and add generated JSON policy to your S3 Bucket's Permission:
![S3 permissions](/img/blog/2022-04-25-sync-data-from-s3/s3-permission.png)
![Edit bucket policy](/img/blog/2022-04-25-sync-data-from-s3/edit-bucket-policy.png)


## Create warehouse
Create a new warehouse instance and specify the storage integration you created in the previous step.

![Create warehouse](/img/blog/2022-04-25-sync-data-from-s3/create-lakehouse.png)

## Moving Data
In the SQL Editor, you should be able to query the file and migrate to iomete using the following methods. Querying JSON file data without moving to iomete:

![Moving Data](/img/blog/2022-04-25-sync-data-from-s3/editor-moving-data.png)

Once you decided that you want to move data to iomete you could use the following commands:
‍

**Option 1. Create a table from select**
```sql
CREATE TABLE countries USING delta
  AS SELECT * FROM json.`s3a://my-staging-area-for-iomete/countries.json`
```

**Option 2. Insert into to existing table**
```sql
-- just append data
INSERT INTO countries
  SELECT  * FROM json.`s3a://my-staging-area-for-iomete/countries.json`

-- or you can use the follwing command to overwerite data
INSERT OVERWRITE TABLE countries
  SELECT  * FROM json.`s3a://my-staging-area-for-iomete/countries.json`Insert to the existing table.
```

**‍Option 3. Merge with existing data**
```sql
MERGE INTO countries
USING (SELECT  * FROM json.`s3a://my-staging-area-for-iomete/countries.json`) updates
ON countries.id = updates.id
WHEN MATCHED THEN  
UPDATE SET 
*WHEN NOT MATCHED  
THEN INSERT *
```

## Visualize Data

First, let's create a view with clean column names to be used in BI dashboarding:
```sql
CREATE OR REPLACE VIEW countries_view
AS SELECT
country_code,
region,
`SP.POP.TOTL` AS sp_pop_totl      
FROM countries;
```

## Open BI Application

![Open BI Application](/img/blog/2022-04-25-sync-data-from-s3/open-bi.png)

## Add new database connection.
Select Data -> Databases from the menu:
![](/img/blog/2022-04-25-sync-data-from-s3/add-new-database.png)

Choose Database Type. Here you need to choose **Apache Hive** from the dropdown:
![Choose Database Type](/img/blog/2022-04-25-sync-data-from-s3/choose-database-type.png)

Replace iomete_username and warehouse_name with your values.
```
hive://:XXXXXXXXXX@-warehouse-thriftserver:10000/?auth=CUSTOM&transport_mode=http
```

![Connect database](/img/blog/2022-04-25-sync-data-from-s3/connect-database.png)

## Add new dataset
From the menu choose Data -> Dataset and click + Dataset button on the right top corner

![Add new dataset](/img/blog/2022-04-25-sync-data-from-s3/add-new-dataset.png)

## Create a new chart
Click on the newly created dataset countries_view which opens chart view. Choose the visualization type and corresponding settings:

![Create new pie chart](/img/blog/2022-04-25-sync-data-from-s3/create-new-chart.png)

Save this chart to the dashboard too and navigate to the dashboard. And, here is the dashboard of the Countries that we just created:

![Created dashboard](/img/blog/2022-04-25-sync-data-from-s3/view-pie-chart.png)

That was easy...