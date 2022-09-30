---
title: Sync JDBC Sources
---

<!-- <head>
  <title>Sync JDBC Sources</title>
  <meta
    name="description"
    content="Sync JDBC Sources"
  />
</head> -->

Python Library. This library provides an easy way of replicating tables from JDBC databases (MySQL, PostgreSQL, etc.) to iomete
___

Define your tables to migrate, your source JDBC connection and destination warehouse connection details, and it's ready.


:::info
If your database is in your private network then you need to have SSH Tunnel between Iomete (see: [Database Connection Options](https://iomete.readme.io/docs/database-connection-options))
:::

### How it works

Let's say you have a table `payments` in your MySQL database name: `mydb`.
The script does the following steps for each table:
  1. Create a database named `mydb` in the warehouse, if it doesn't exist
  2. Create a proxy table named: `__payments_proxy` using JDBC provider. See <a href="https://iomete.readme.io/docs/jdbc-sources" target="_blank">JDBC Sources</a> for more details
  3. Select from `__payments_proxy` and insert/merge (based on sync_mode) into destination table `payments`

### Sync mode

You can define sync mode for each table. Currently, supported sync modes are:

  * `FullLoad`: Read everything in the source and overwrites the whole table at the destination at each sync
  * `IncrementalSnapshot`: It creates the snapshot of the table in the destination and only moves the newly inserted and updated records. While writing to iomete it uses a merge statement. This mode requires 2 parameters: `identification_column` will be used on merge statement, and `tracking_column` to track where it should continue to get data from the source table 

### Code Example

Install the library

```
pip install iomete-jdbc-sync
```

:::info
For quick start you can use the example project template: https://github.com/iomete/jdbc-sync-project-template
:::

Code example:
```python
import os

from iomete_jdbc_sync.connection.source import MySQLConnection

from iomete_jdbc_sync import DataSyncer

from iomete_jdbc_sync.connection.destination import WarehouseConnection
from iomete_jdbc_sync.sync.sync_mode import FullLoad, IncrementalSnapshot
from iomete_jdbc_sync import Table

if __name__ == '__main__':
    tables = [
        Table(
            table_name='orders',
            sync_mode=IncrementalSnapshot(
                identification_column="id",
                tracking_column="updated_at")
        ),
        Table(
            table_name='payments',
            sync_mode=FullLoad()
        )
    ]

    data_syncer = DataSyncer(
        source_connection=MySQLConnection(
            host="test-db-1", #ssh tunnel name to the source db
            port="3306", # source db port
            schema="mydb", # source db schema
            user_name="sync-user", 
            user_pass=os.getenv("mysql_password")),
        warehouse_connection=WarehouseConnection(
          host="<warehouse-name>-<account-number>-dwh.iomete.com", # iomete warehouse instance
            port="443",
            user_name="data-replicator", # iomete user
            password=os.getenv("warehouse_password"),
            db_name="mydb-backup" # database name in iomete to replicate data to
        ),
        tables=tables
    )

    data_syncer.run()
```