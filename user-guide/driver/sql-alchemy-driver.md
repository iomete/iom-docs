---
title: SQLAlchemy Driver
description: IOMETE lakehouse endpoints are compatible with the py-hive-iomete driver, and you can use the samples repository for a quick start
last_update:
  date: 10/04/2023
  author: Vusal Dadalov
---

IOMETE lakehouse endpoints are compatible with the [py-hive-iomete](https://pypi.org/project/py-hive-iomete) driver.

## Usage

:::info
For a quick start, you can use the samples repository: https://github.com/iomete/py-hive-iomete-samples
:::

## DB-API

Install the following dependency

```shell
pip install --upgrade py-hive-iomete
```

### DB-API sample

```python
from pyhive import hive

connection = hive.connect(
    host="<host>",
    port="<port>",
    scheme="<https or http>",
    data_plane="<data_plane_name>", # Optional, skip if using default data-plane
    lakehouse="<lakehouse_cluster_name>",
    database="default",  # For tables in a non-default catalog, use "<catalog>.<database>"
    username="<username>",
    password="<personal_access_token>"
)

cursor = connection.cursor()
cursor.execute("SELECT * FROM my_awesome_data LIMIT 10")

print(cursor.fetchone())
print(cursor.fetchall())
```

### DB-API (asynchronous) sample

```python
from pyhive import hive
from TCLIService.ttypes import TOperationState

connection = hive.connect(
    host="<host>",
    port="<port>",
    scheme="<https or http>",
    data_plane="<data_plane_name>", # Optional, skip if using default data-plane
    lakehouse="<lakehouse_cluster_name>",
    database="default",  # For tables in a non-default catalog, use "<catalog>.<database>"
    username="<username>",
    password="<personal_access_token>"
)

cursor = connection.cursor()

cursor.execute("SELECT * FROM my_awesome_data LIMIT 10", async_=True)

status = cursor.poll().operationState

while status in (TOperationState.INITIALIZED_STATE, TOperationState.RUNNING_STATE):
    logs = cursor.fetch_logs()
    for message in logs:
        print(message)

    # If needed, an asynchronous query can be cancelled at any time with:
    # cursor.cancel()

    status = cursor.poll().operationState

print(cursor.fetchall())
```

## SQLAlchemy

Install SQLAlchemy extra package

```shell
pip install "py-hive-iomete[sqlalchemy]"
```

```python
from sqlalchemy import MetaData, Table
from sqlalchemy.engine import create_engine
from sqlalchemy.orm import sessionmaker

# Possible dialects (hive and iomete operate identically):
# hive+http
# hive+https
# iomete+http
# iomete+https

engine = create_engine(
    'iomete+https://<username>:<personal_access_token>@<host>:<port>/<database>?data_plane=<data_plane_name>&lakehouse=<lakehouse_cluster_name>')

# or if using default data-plane
# engine = create_engine(
#     'iomete+https://<username>:<personal_access_token>@<host>:<port>/<database>?lakehouse=<lakehouse_cluster_name>')

# If your table is in a non-default catalog, specify the path as <catalog>.<database>.
# Example:
# iomete+https://<username>:<personal_access_token>@<host>:<port>/<catalog>.<database>?data_plane=<data_plane_name>&lakehouse=<lakehouse_cluster_name>

session = sessionmaker(bind=engine)()
records = session.query(Table(
    "my_awesome_data",
    MetaData(),
    # schema="<database>",  # Optional: use when the table belongs to a different database than the one in the connection URL
    autoload_with=engine,
)) \
    .limit(10) \
    .all()
print(records)
```

You can find the configuration parameters in the lakehouse "Connection Details" tab in the IOMETE console.

If your table is in a non-default catalog, use `<catalog>.<database>` in the connection URL path instead of only `<database>`.

If the reflected table belongs to a different database than the one used in the connection URL, specify it with `schema="<database>"` in `Table(...)`.
