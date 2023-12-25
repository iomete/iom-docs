---
title: SQLAlchemy Driver
description: IOMETE lakehouse endpoints are compatible with special driver, you can use the samples repository to quick start
last_update:
  date: 10/04/2023
  author: Vusal Dadalov
---

IOMETE lakehouse endpoints are compatible with [py-hive-iomete](https://pypi.org/project/py-hive-iomete) driver

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
    lakehouse="<lakehouse_cluster_name>",
    database="default",
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
    lakehouse="<lakehouse_cluster_name>",
    database="default",
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
from sqlalchemy.engine import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.schema import *

# Possible dialects (hive and iomete are both operate identically):
# hive+http
# hive+https
# iomete+http
# iomete+https

engine = create_engine(
    'iomete+https://<username>:<personal_access_token>@<host>:<port>/<database>?lakehouse=<lakehouse_cluster_name>')

session = sessionmaker(bind=engine)()
records = session.query(Table('my_awesome_data', MetaData(bind=engine), autoload=True)) \
    .limit(10) \
    .all()
print(records)
```

You can find the configuration parameters from the lakehouse "Connection Details" tab from the IOMETE console
