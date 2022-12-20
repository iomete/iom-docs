---
title: From AWS S3 Files
description: Sync Data From AWS S3. This is an end-to-end guide about how to move files from your AWS S3 to iomete and show it in the BI dashboard.
last_update:
  date: 10/04/2022
---

import Img from '@site/src/components/Img';

### Intro

This is an end-to-end guide about how to move files from your AWS S3 to iomete and show it in the BI dashboard.

### Your files in AWS S3

Let's say you have a bucket where you have files you want to move to iomete.

<!-- ![The dedicated bucket for iomete](/img/guides/bucket.png) -->
<Img src="/img/guides/bucket.png" alt="The dedicated bucket for iomete"/>

<!-- [block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/bf656b8-bucket-image-from-outside.png",
        null,
        "The dedicated bucket for iomete"
      ],
      "caption": "Just an example bucket"
    }
  ]
}
[/block] -->

:::note
💡 This is just an example bucket for demonstration purpose. This bucket will be different in your case.
:::

Let's say, we want to create or receive a new query/migrate `countries.json` file in iomete platform.

<!-- ![The File (countries.json) we want to move to iomete](/img/guides/countries.png) -->
<Img src="/img/guides/countries.png" alt="The File (countries.json) we want to move to iomete"/>

<!-- [block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/bc39207-countries.png",
        null,
        "The File (countries.json) we want to move to iomete"
      ],
      "caption": "The File (countries.json) we want to move to iomete"
    }
  ]
}
[/block] -->

<br/>

:::info You could download the countries.json file for yourself with this command:
wget <a href="https://iomete-public.s3.eu-central-1.amazonaws.com/datasets/countries.json" target="blank"> https\://iomete-public.s3.eu-central-1.amazonaws.com/datasets/countries.json</a>
:::

<br/>

## Create a policy for default iomete access role

:::note

💡Remember the first storage integration and **default_iomete_access_role**  from <a href="administration-guide/iam-role-for-datalake-access" target="blank"> IAM Role For Data Lake Access </a>
:::

Just create a policy for bucket **area-for-iomete** and attach it to the **default_iomete_access_role**. 

The following step-by-step instructions describe how to configure it.

### Create policy

- Go to **Identity & Access Management (IAM) -> Policies -> Create Policy:**

![Create policy button on Policies page](/img/guides/create-policy-button.png)
<!-- [block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/6793a96-create-policy-button.png",
        null,
        "Create policy button on Policies page"
      ],
      "caption": "Create policy button on Policies page"
    }
  ]
}
[/block] -->

- In the editor, click the **JSON** tab.

![JSON tab in editor](/img/guides/json-tab.png)
<!-- [block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/c8eeb8c-json-tab.png",
        null,
        "JSON tab in editor"
      ],
      "caption": "JSON tab in editor"
    }
  ]
}
[/block] -->

- Add a policy document that will allow **iomete** to access the S3 bucket and folder.  
  The following policy (in JSON format) provides iomete with the required permissions to load or unload data using a single bucket and folder path. Copy and paste the text into the policy editor:

:::note
💡 Change the bucket name with yours. This is just an example bucket for demonstration 
purpose.
:::

```json json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:GetObjectVersion",
                "s3:DeleteObject",
                "s3:DeleteObjectVersion"
            ],
            "Resource": "arn:aws:s3:::area-for-iomete/*"
        },
        {
            "Effect": "Allow",
            "Action": "s3:ListBucket",
            "Resource": "arn:aws:s3:::area-for-iomete"
        }
    ]
}
```



After review save it with the name: **area_for_iomete_access**.

### Attach the policy to the default role

- Go to **Identity & Access Management (IAM) -> Roles**
- Search for **default_iomete_access_role**

![Default iomete access role on Policies page](/img/guides/default_iomete_access_role.png)

<!-- [block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/b342cac-default_iomete_access_role.png",
        null,
        "Default iomete access role on Policies page"
      ],
      "caption": "Default iomete access role on Policies page"
    }
  ]
}
[/block] -->

Inside of the **default_iomete_access_role**, attach the new created **area_for_iomete_access** beside of **iomete_datalake_access**.

- Click the **Add permissions -> Attach policies**

![Default iomete access role](/img/guides/attach-policy.png)

<!-- [block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/813548f-attach-policy.png",
        null,
        "Default iomete access role"
      ],
      "caption": "Default iomete access role"
    }
  ]
}
[/block] -->

- Search for **area_for_iomete_access** and click the **Attach policies** button.

![New attached **area_for_iomete** role.](/img/guides/attached-policy.png)
<!-- 
[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/981cc78-attached-policy.png",
        null,
        null
      ],
      "caption": "New attached **area_for_iomete** role."
    }
  ]
}
[/block] -->

**area_for_iomete** successfully attached to the **default_iomete_access_role**. Now let's see how to get data from the platform.



## Data movement

In the SQL Editor, you should be able to query the file and migrate to iomete using the following methods.

### Querying Data

Querying JSON file data without moving to `iomete`

![Query JSON Data](/img/guides/querying-data.png)
<!-- [block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/8c9aff5-querying-data.png",
        null,
        "Query JSON Data"
      ],
      "border": true,
      "caption": "Query JSON Data"
    }
  ]
}
[/block] -->

### Non-partitioned Table

- **Option 1. Create a table from select**

```sql SQL
-- Create table directly from the query
CREATE TABLE countries
AS SELECT  * FROM json.`s3a://area-for-iomete/countries.json`;

-- To inspect the table use the following query
DESC TABLE EXTENDED countries;
```



- **Option 2. Insert into to existing table**

```sql
-- just append data
INSERT INTO countries
SELECT  * FROM json.`s3a://area-for-iomete/countries.json`;

-- first clean an existing data and then insert new data
INSERT OVERWRITE TABLE countries
SELECT  * FROM json.`s3a://area-for-iomete/countries.json`;
```



- **Option 3. Merge with existing data**

```sql
MERGE INTO countries
    USING (SELECT  * FROM json.`s3a://area-for-iomete/countries.json`) updates
ON countries.id = updates.id
WHEN MATCHED THEN
    UPDATE SET *
WHEN NOT MATCHED
    THEN INSERT *;
```



### Partitioned Table

Partitioning data to speed up queries or DML that have predicates involving the partition columns. Here we use `country_code` as a partition column

- **Option 1. Create a partitioned table from select**

```sql SQL
-- Create a partitioned table directly from the query
CREATE TABLE countries_partitioned
  PARTITIONED BY (country_code)
AS SELECT * FROM json.`s3a://area-for-iomete/countries.json` 
ORDER BY country_code;
         
-- To inspect the table use the following query
DESC TABLE EXTENDED countries_partitioned;
```



- **Option 2. Insert into to existing table**

```sql SQL
-- just append data
INSERT INTO countries_partitioned
  SELECT  * FROM json.`s3a://area-for-iomete/countries.json`
  ORDER BY country_code;

-- or you can use the following command to overwerite data
INSERT OVERWRITE TABLE countries_partitioned
  SELECT  * FROM json.`s3a://area-for-iomete/countries.json`
  ORDER BY country_code;
```



- **Option 3. Merge with existing data**

```sql
MERGE INTO countries_partitioned
  USING (SELECT  * FROM json.`s3a://area-for-iomete/countries.json`) updates
ON countries_partitioned.id = updates.id
WHEN MATCHED THEN
  UPDATE SET *
WHEN NOT MATCHED
  THEN INSERT *;
```



### Visualize Data

First, let's create a view with clean column names to be used in BI dashboarding:

```sql
CREATE OR REPLACE VIEW countries_view 
  AS SELECT 
      country_code, 
      region, 
      `SP.POP.TOTL` AS sp_pop_totl 
     FROM countries;
```



Lets visualize the new **countries_view** in the BI Application.

**Add new dataset**

From the menu choose `Data -> Dataset` and click `+ Dataset` button on the right top corner.

![New dataset creation on BI](/img/guides/create-dataset.png)

<!-- [block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/572dbae-create-dataset.png",
        null,
        "New dataset creation on BI"
      ],
      "caption": "New dataset creation on BI"
    }
  ]
}
[/block] -->

**Create a new chart** 

Click on the newly created dataset `countries_view` which opens chart view. Choose the visualization type and corresponding settings:

![Top 10 countries with highest population](/img/guides/chart.png)
<!-- [block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/78028d9-chart.png",
        null,
        "Top 10 countries with highest population"
      ],
      "border": true,
      "caption": "Top 10 countries with highest population"
    }
  ]
}
[/block] -->

Save this chart to the dashboard too and navigate to the dashboard. And, here is the dashboard of the `Countries` that we just created.

![Countries dashboard on BI](/img/guides/dashboard-countries.png)
<!-- [block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/5dea395-dashboard-countries.png",
        null,
        "Countries dashboard on BI"
      ],
      "border": true,
      "caption": "Countries dashboard on BI"
    }
  ]
}
[/block] -->