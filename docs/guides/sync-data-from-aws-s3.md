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

<Img src="/img/guides/bucket.png" alt="The dedicated bucket for iomete"/>

:::note
💡 This is just an example bucket for demonstration purpose. This bucket will be different in your case.
:::

Let's say, we want to create or receive a new query/migrate `countries.json` file in iomete platform.

<Img src="/img/guides/countries.png" alt="The File (countries.json) we want to move to iomete"/>

<br/>

:::info You could download the countries.json file for yourself with this command:
wget <a href="https://iomete-public.s3.eu-central-1.amazonaws.com/datasets/countries.json" target="blank"> https\://iomete-public.s3.eu-central-1.amazonaws.com/datasets/countries.json</a>
:::

<br/>

## Create a policy for default iomete access role

:::note 💡

Remember the first storage integration and **default_iomete_access_role**  from 
[IAM Role For Data Lake Access](https://iomete.com/docs/administration-guide/iam-role-for-datalake-access)
:::

Just create a policy for bucket **area-for-iomete** and attach it to the **default_iomete_access_role**. 

The following step-by-step instructions describe how to configure it.

### Create policy

- Go to **Identity & Access Management (IAM) -> Policies -> Create Policy:**

<Img src="/img/guides/create-policy-button.png" alt="Create policy button on Policies page"/>

- In the editor, click the **JSON** tab.

<Img src="/img/guides/json-tab.png" alt="JSON tab in editor"/>

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

<Img src="/img/guides/default_iomete_access_role.png" alt="Default iomete access role on Policies page"/>

Inside of the **default_iomete_access_role**, attach the new created **area_for_iomete_access** beside of **iomete_datalake_access**.

- Click the **Add permissions -> Attach policies**

<Img src="/img/guides/attach-policy.png" alt="Default iomete access role"/>

- Search for **area_for_iomete_access** and click the **Attach policies** button.

<Img src="/img/guides/attached-policy.png" alt="New attached **area_for_iomete** role."/>

**area_for_iomete** successfully attached to the **default_iomete_access_role**. Now let's see how to get data from the platform.


## Data movement

In the SQL Editor, you should be able to query the file and migrate to iomete using the following methods.

### Querying Data

Querying JSON file data without moving to `iomete`

<Img src="/img/guides/querying-data.png" alt="Query JSON Data"/>

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

### Visualize Data - Integration to BI applications:

[Metabase](/docs/guides/how-to-connect-iomete-and-metabase-bi)

[Apache Superset](/docs/guides/how-to-connect-iomete-and-apache-superset)

[Power BI](/docs/guides/power-bi)

[Tableau](/docs/guides/iomete-tableau-integration)