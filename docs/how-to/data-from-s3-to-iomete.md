---
title: Sync Data From AWS S3 to iomete
slug: /sync-data-from-aws-s3-to-iomete
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

<!-- <head>
  <title>Sync Data From AWS S3 to iomete</title>
  <meta
    name="description"
    content="Sync Data From AWS S3 to iomete"
  />
</head> -->

This is an end-to-end guide that explains how to move files from your AWS S3 to iomete and show it in the built-in BI dashboard.
___

### Intro

This is an end-to-end guide about how to move files from your AWS S3 to iomete and show it in the BI dashboard. In this example, we use a JSON file, but for other file types (such as CSV, Parquet, and ORC) please check out: <a href="https://docs.iomete.com/docs/reading-raw-files" target="_blank">https\://docs.iomete.com/external-data-sources/reading-raw-files</a>

<br/>

### Your files in AWS S3

Let's say you have a dedicated bucket where you have files you want to move to iomete

![](/img/how-to/z2-aws-file.png)

:::info Note
This bucket will be different in your case. This is just an example bucket for demonstration purpose
:::
We want to query/migrate `countries.json` file in iomete platform

![The file (countries.json) we want to move to iomete](/img/how-to/z2-jsonf.png "The file (countries.json) we want to move to iomete")

<!-- [block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/6d71379-jsonf.png",
        "jsonf.png",
        3286
      ],
      "caption": "The file (countries.json) we want to move to iomete"
    }
  ]
}
[/block] -->


:::info You could download  thecountries.json file for yourself with this command:
wget <a href="https://iomete-public.s3.eu-central-1.amazonaws.com/datasets/countries.json" target="blank"> https\://iomete-public.s3.eu-central-1.amazonaws.com/datasets/countries.json</a>
:::

**Create a storage integration in iomete**
------------------------------------------

1. Choose `AWS External Storage`


1. Specify a name and enter your `AWS S3 Location` to create integration between to

![Create AWS External Stage Storage Integration](/img/how-to/z2-ext-aws.png)
<!-- [block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/8c15ce8-Screen_Shot_2022-02-20_at_14.02.42.png",
        "Screen Shot 2022-02-20 at 14.02.42.png",
        2330
      ],
      "caption": "Create AWS External Stage Storage Integration"
    }
  ]
}
[/block] -->

3. Once it is created copy policies created to be added to your S3 Bucket permissions

![](/img/how-to/z2-create-ext-aws-form.png)
<!-- TODO external storage integration -->

![](https://files.readme.io/b1a6fdd-Screen_Shot_2022-02-20_at_14.09.23.png "Screen Shot 2022-02-20 at 14.09.23.png")

1. Go to your AWS S3 Bucket and add generated JSON policy to your S3 Bucket's Permission

![](https://files.readme.io/4bc29e9-JSON_policy_1.png "JSON_policy_1.png")

![](https://files.readme.io/528ede1-Json_Policy_2.png "Json_Policy_2.png")

**Create warehouse**
--------------------

Create a new warehouse instance and specify the storage integration you created in the previous step.

![](https://files.readme.io/e8f06b5-Screen_Shot_2022-02-20_at_14.27.00.png "Screen Shot 2022-02-20 at 14.27.00.png")

** Moving Data**
----------------

In the SQL Editor, you should be able to query the file and migrate to iomete using the following methods  
Querying JSON file data without moving to `iomete`

![](https://files.readme.io/b3f6b38-moving_data.png "moving_data.png")

Once you decided that you want to move data to iomete you could use the following commands

Non-partitioned Table
---------------------

- **Option 1. Create a table from select**

```sql
-- Create table directly from the query
CREATE TABLE countries
AS SELECT  * FROM json.`s3a://my-staging-area-for-iomete/countries.json`

-- To inspect the table use the following query
DESC TABLE EXTENDED countries;
```

- **Option 2. Insert into to existing table**

```sql
-- just append data
INSERT INTO countries
SELECT  * FROM json.`s3a://my-staging-area-for-iomete/countries.json`

-- first clean an existing data and then insert new data
INSERT OVERWRITE TABLE countries
SELECT  * FROM json.`s3a://my-staging-area-for-iomete/countries.json`
```

- **Option 3. Merge with existing data**

```sql
MERGE INTO countries
    USING (SELECT  * FROM json.`s3a://my-staging-area-for-iomete/countries.json`) updates
ON countries.id = updates.id
WHEN MATCHED THEN
    UPDATE SET *
WHEN NOT MATCHED
    THEN INSERT *
```

Partitioning data to speed up queries or DML that have predicates involving the partition columns. Here we use `country_code` as a partition column

Partitioned Table
-----------------

- **Option 1. Create a partitioned table from select**

```sql
-- Create a partitioned table directly from the query
CREATE TABLE countries_partitioned
  PARTITIONED BY (country_code)
AS SELECT * FROM json.`s3a://my-staging-area-for-iomete/countries.json` 
ORDER BY country_code;
         
-- To inspect the table use the following query
DESC TABLE EXTENDED countries_partitioned;
```

- **Option 2. Insert into to existing table**

```sql
-- just append data
INSERT INTO countries_partitioned
  SELECT  * FROM json.`s3a://my-staging-area-for-iomete/countries.json`
  ORDER BY country_code;

-- or you can use the follwing command to overwerite data
INSERT OVERWRITE TABLE countries_partitioned
  SELECT  * FROM json.`s3a://my-staging-area-for-iomete/countries.json`
  ORDER BY country_code;
```

- **Option 3. Merge with existing data**

```sql
MERGE INTO countries_partitioned
  USING (SELECT  * FROM json.`s3a://my-staging-area-for-iomete/countries.json`) updates
ON countries_partitioned.id = updates.id
WHEN MATCHED THEN
  UPDATE SET *
WHEN NOT MATCHED
  THEN INSERT *
```

** Visualize Data**
-------------------

First, let's create a view with clean column names to be used in BI dashboarding:

```sql
CREATE OR REPLACE VIEW countries_view 
  AS SELECT 
      country_code, 
      region, 
      `SP.POP.TOTL` AS sp_pop_totl 
     FROM countries;
```

<<!-- <br> -->>

Open BI Application

![](https://files.readme.io/ea74a9f-Screen_Shot_2022-02-20_at_14.29.39.png "Screen Shot 2022-02-20 at 14.29.39.png")

<<!-- <br> -->>

**Add new dataset**

From the menu choose `Data -> Dataset` and click `+ Dataset` button on the right top corner

![](https://files.readme.io/101b44d-addDataset.png "addDataset.png")

<<!-- <br> -->>

**Create a new chart** 

Click on the newly created dataset `countries_view` which opens chart view. Choose the visualization type and corresponding settings:

![](https://files.readme.io/fbe682c-createNewChart.png "createNewChart.png")

<<!-- <br> -->>

Save this chart to the dashboard too and navigate to the dashboard. And, here is the dashboard of the `Countries` that we just created 

![](https://files.readme.io/1be6fce-saveChart.png "saveChart.png")

Congratulations 🎉🎉🎉