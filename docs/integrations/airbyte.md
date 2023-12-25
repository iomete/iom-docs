---
title: MySQL to IOMETE using Airbyte
description: Move MySQL data to IOMETE with Airbyte| Easy configuration of Lakehouse Connection URL, Bucket Name, Bucket Path, Region, and more. Monitor and sync data seamlessly.
last_update:
  date: 10/04/2022
  author: Namig Aliyev
---

This is an end-to-end guide about how to move MySQL data to IOMETE using Airbyte.

### Destination Configuration

Basically, the destination configuration form has two separate parts, IOMETE and Staging area configurations.

Fill in the configuration parameters with your own data according to the table below.

| Parameter                | Type   | Required | Notes                                                                                                                                                                                                        |
| :----------------------- | :----- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lakehouse Connection URL | String | Required | Example: `airbyte://frankfurt.iomete.com/12312421312/default`. <br/> This is a combination of hostname, account number and lakehouse name. Check the lakehouse's connection details from the IOMETE console. |
| Username                 | String | Required | Username to use to access IOMETE.                                                                                                                                                                            |
| Password                 | String | Required | Password associated with username.                                                                                                                                                                           |

![IOMETE destination configuration first part](/img/integrations/airbyte/iomete-destination-config-1.png)

Fill the Staging area informations.

| Parameter           | Type    | Required                                                                                                                                                                                                                                                                                                                                                            | Notes |
| :------------------ | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---- |
| Bucket Name         | string  | Name of the bucket to sync data into.                                                                                                                                                                                                                                                                                                                               |
| Bucket Path         | string  | Subdirectory under the above bucket to sync the data into.                                                                                                                                                                                                                                                                                                          |
| Region              | string  | See [documentation](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-available-regions) for all region codes.                                                                                                                                                                                                     |
| Access Key ID       | string  | AWS/Minio credential.                                                                                                                                                                                                                                                                                                                                               |
| Secret Access Key   | string  | AWS/Minio credential.                                                                                                                                                                                                                                                                                                                                               |
| S3 Filename pattern | string  | The pattern allows you to set the file-name format for the S3 staging file(s), next placeholders combinations are currently supported: \{date}, \{date:yyyy_MM}, \{timestamp}, \{timestamp:millis}, \{timestamp:micros}, \{part_number}, \{sync_id}, \{format_extension}. Please, don't use empty space and not supportable placeholders, as they won't recognized. |
| Purge Staging Data  | boolean | The connector creates staging files and tables on S3. By default, they will be purged when the data sync is complete. Set it to `false` for debugging purposes.                                                                                                                                                                                                     |
|                     |         |                                                                                                                                                                                                                                                                                                                                                                     |

![Staging area configuration](/img/integrations/airbyte/iomete-destination-config-1.png)

### Source Configuration

Let's configurate MySQL database source.

💡 We will be using a publicly accessible `employees` database instance that contains the [Employees Sample Database.](https://dev.mysql.com/doc/employee/en/sakila-structure.html)

Here are the details of `employees` public database:

```
Host: iomete-tutorial.cetmtjnompsh.eu-central-1.rds.amazonaws.com
Port: 3306
Username: tutorial_user
Password: 9tVDVEKp
```

💡 For connection to Amazon RDS MySQL or MariaDB, add `enabledTLSProtocols=TLSv1.2` in the JDBC parameters.

![MySQL source configuration](/img/integrations/airbyte/mysql-source-configuration.png)

### Synchronization

- Set replication parameters. <br/>
  ![Connection replication configuration](/img/integrations/airbyte/connection-replication-configuration.png)

- Start sync and monitor synchronization status from history. <br/>
  ![Successful sync result](/img/integrations/airbyte/successful-sync-result.png)

Synchronization completed successful. Let’s check migrated data in the IOMETE console.

### Editor

The `employees` database has been created and the `current_dept_emp` table has been successfully migrated.

![Migration result in the IOMETE SQL editor](/img/integrations/airbyte/migration-result.png)
