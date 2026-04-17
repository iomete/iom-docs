---
title: SQLAlchemy Driver
description: IOMETE lakehouse endpoints are compatible with the py-hive-iomete driver, and you can use the samples repository for a quick start
last_update:
  date: 10/04/2023
  author: Vusal Dadalov
---

IOMETE compute endpoints are compatible with the [py-hive-iomete](https://pypi.org/project/py-hive-iomete) driver.

## Usage

:::info
For additional DB-API and SQLAlchemy reference examples, see: https://github.com/iomete/iomete-integrations/tree/main/py-hive-iomete
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

session = sessionmaker(bind=engine)()
records = (
    session.query(
        Table(
            "my_awesome_data",
            MetaData(),
            autoload_with=engine,
        )
    )
    .limit(10)
    .all()
)
print(records)

# If your table is in a non-default catalog, specify the path as <catalog>.<database>.
# Example:
# iomete+https://<username>:<personal_access_token>@<host>:<port>/<catalog>.<database>?data_plane=<data_plane_name>&lakehouse=<lakehouse_cluster_name>

# Example: use a non-default catalog in the connection URL and specify
# schema="<database_b>" when the reflected table belongs to a different
# database than the one used in the connection URL.
#
# In this example, <database_a> is the database used in the connection URL,
# and <database_b> is the database that contains the reflected table.
# Both belong to the same <catalog>.

engine = create_engine(
    "iomete+https://<username>:<personal_access_token>@<host>:<port>/<catalog>.<database_a>?data_plane=<data_plane_name>&lakehouse=<lakehouse_cluster_name>"
)

session = sessionmaker(bind=engine)()
records = (
    session.query(
        Table(
            "my_awesome_data",
            MetaData(),
            schema="<database_b>",
            autoload_with=engine,
        )
    )
    .limit(10)
    .all()
)
print(records)
```

You can find the connection parameters in the compute "Connections" tab in the IOMETE console.

If your table is in a non-default catalog, use `<catalog>.<database>` in the connection URL path instead of only `<database>`.

If the reflected table belongs to a different database than the one used in the connection URL, specify it with `schema="<database>"` in `Table(...)`.
