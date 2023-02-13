---
title: SQLAlchemy Driver
description: IOMETE lakehouse endpoints are compatible with special driver, you can use the samples repository to quick start
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

___

IOMETE lakehouse endpoints are compatible with <a href="https://pypi.org/project/py-hive-iomete" targetr="_blank">py-hive-iomete</a> driver

## Usage

:::info
For a quick start, you can use the samples repository: <https://github.com/iomete/py-hive-iomete-samples>
:::

## DB-API

Install the following dependency

```shell
pip install py-hive-iomete==1.1.0
```



### DB-API sample

```python
from pyhive import hive

connection = hive.connect(
    host="<cluster_id>.iomete.cloud",
    workspace_id="<workspace_id>",
    lakehouse="<lakehouse_cluster_name>",
    database="default",
    username="<username>",
    password="<password>"
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
    host="<cluster_id>.iomete.cloud",
    workspace_id="<workspace_id>",
    lakehouse="<lakehouse_cluster_name>",
    database="default",
    username="<username>",
    password="<password>"
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

engine = create_engine(
    'iomete://<username>:<personal_access_token>@<cluster_id>.iomete.cloud/<database>?workspace_id=<workspace_id>&lakehouse=<lakehouse_cluster_name>')

# Alternatively, "hive" driver could be used as well
# engine = create_engine(
#    'hive://<username>:<personal_access_token>@<cluster_id>.iomete.cloud/<database>?workspace_id=<workspace_id>&lakehouse=<lakehouse_cluster_name>')

session = sessionmaker(bind=engine)()
records = session.query(Table('my_awesome_data', MetaData(bind=engine), autoload=True)) \
    .limit(10) \
    .all()
print(records)
```



You can find the configuration parameters from the lakehouse "Connection Details" tab from the IOMETE console