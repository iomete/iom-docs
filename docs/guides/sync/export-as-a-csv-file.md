---
title: How to export data as a CSV file
description: Learn how to export data from a table as a CSV file in IOMETE using SQL Editor or by writing a query, and how to bypass limitations for larger exports by exporting to an S3 bucket. Compare pros and cons of each method
last_update:
  date: 05/04/2023
---

import Img from '@site/src/components/Img';

import Card from "@site/src/components/Card";
import ExternalCard from "@site/src/components/ExternalCard";
import GridBox from "@site/src/components/GridBox";
import { File, FileCsv, FileJs } from "@phosphor-icons/react";

There are times when you may need to export data from a table as a CSV file to use in another application, such as Excel or Google Sheets. In IOMETE, there are two ways to accomplish this:

1.  Utilizing the SQL Editor in IOMETE.
2.  Exporting a query result as a CSV to an S3 bucket.


## Utilizing the SQL Editor in IOMETE.

To export data as a CSV file, simply write your query, run it, and click the "Download CSV" button. While this method is the easiest, it does have a limitation on the number of rows that can be exported, currently set at 10,000. For larger exports, the second method must be used.

<Img src="/img/guides/sync/export-as-a-csv-file/csv-export-from-sql-editor.png" alt="CSV export from SQL Editor"/>

:::info Why IOMETE has a limit on the SQL Editor UI
There are two main reasons why IOMETE imposes a limit on the number of rows that can be exported via the SQL Editor UI.

Firstly, to prevent users accidentally querying very large tables, which could fill up the Lakehouse driver's memory, causing it to crash. By limiting the number of rows that can be exported, IOMETE helps ensure that the application remains stable and responsive.

Secondly, exporting a large amount of data can cause the browser (SQL Editor) to crash. To prevent this from happening and provide a better user experience, IOMETE automatically adds a LIMIT clause to SQL statements if none is specified by the user. This ensures that only a reasonable amount of data is returned and displayed in the SQL Editor UI.
:::

## Exporting a query result as a CSV to an S3 bucket.

As we spoke, exporting a large table or query result to CSV using the SQL editor is not feasible. Luckily there is a reliable way for it. Exporting the query/table result directly to an S3 bucket. This is the most flexible and robust way to export data as a CSV file. You can export any table or query result as a CSV file.

:::tip
By exporting the data directly to an S3 bucket, you can bypass the limitations of the SQL Editor UI and export much larger datasets.
:::

### Exporting data to an S3 bucket

:::info Prerequisite
Before exporting data to an S3 bucket, ensure that IOMETE has read/write access to the S3 bucket you plan to export data to. Follow [this guide](/docs/guides/external-s3-buckets-access) to provide the necessary permissions.
:::

Let's assume that we want to export the result of the following query to an S3 bucket:

```sql
select * from employees
```

To export the query result to an S3 bucket, we need to write a SQL that exports the result of the query to an S3 bucket. The query will look like this:

```sql
CREATE table my_csv_export
USING csv
OPTIONS (
  header "true", --first row is header information
  path "s3a://iom-test-dir-us-east-2/csv/employees" --in your case, the path will be the path of your S3 bucket
) AS 
select * from employees
```
Here CSV external table is used to export the query result to an S3 bucket. Read [CSV Data Source](/docs/data-sources/csv-files) to learn more about the data source options.

:::tip
It can be any complex query result. Just put any query after the `as` keyword.
:::

:::info
You can drop the table with `drop table my_csv_export` command. Dropping external tables don't delete the data. So, it's safe to drop the table.
:::

See the exported file in the S3 bucket:
<Img src="/img/guides/sync/export-as-a-csv-file/exported-csv-file.png" alt="CSV export from SQL Editor"/>

Once the data has been exported to your specified S3 bucket, you can easily download it as a CSV file from within your AWS account or use it in other applications that support reading from S3 buckets.
Here is the preview of the exported CSV file:
<Img src="/img/guides/sync/export-as-a-csv-file/csv-file-preview.png" alt="CSV export from SQL Editor"/>

## Summary

Now that we've gone over the two ways to export data as a CSV file in IOMETE, let's compare them and their pros and
cons.

| Method                                                   | Pros                                                                                                           | Cons                                                                                                         |
|----------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| **Utilizing the SQL Editor in IOMETE**                   | Easy to use, Quick for small exports                                                                           | Limited to 10,000 rows, Not recommended for large query results. Can cause browser crashes for large exports |
| **Exporting a query result as a CSV to an S3 bucket.**   | No limit on the number of rows exported, More flexible for large exports, Can export any table or query result | Additional setup required to provide read/write access to an S3 bucket                                       |


 