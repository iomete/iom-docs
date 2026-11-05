---
title: IOMETE SQLAlchemy Driver
description: Connect to IOMETE using the iomete-sqlalchemy dialect, which uses Arrow Flight SQL for high-performance gRPC-based connectivity.
sidebar_label: IOMETE SQLAlchemy
last_update:
  date: 11/05/2026
  author: Sanan Ahmadli
---

import Img from '@site/src/components/Img';

The `iomete-sqlalchemy` package provides a SQLAlchemy dialect for IOMETE that communicates over [Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html) (`adbc-driver-flightsql`) — offering faster, binary-efficient transport compared to the legacy Thrift/Hive driver.

## Requirements

- Python 3.9+
- SQLAlchemy >= 2.0.30
- adbc-driver-flightsql >= 1.1.0
- pyarrow >= 16.0

## Installation

```bash
pip install iomete-sqlalchemy
```

## Connection URL Format

```
iomete://<user>:<password>@<host>:<port>/<catalog>/<schema>?cluster=<cluster>&data_plane=<kubernetes_namespace>
```

### Parameters

| Parameter | Description | Default |
|---|---|---|
| `host` | Host for the compute's data plane, from its Connections tab | Required |
| `port` | gRPC port | `443` |
| `catalog` | Top-level catalog (e.g. `spark_catalog`) | Required |
| `schema` | Schema / database inside the catalog | Required |
| `cluster` | IOMETE compute cluster name | Required |
| `data_plane` | Compute's Kubernetes namespace (the driver retains this legacy parameter name) | Required |
| `tls` | Use `grpc+tls` transport | `true` |
| `max_msg_size` | Max gRPC message size in bytes | `134217728` (128 MB) |

Find the host, port, and compute name under **Compute → select a compute → Connections**. Use the compute's **Namespace** value for `data_plane`. For example, a compute in namespace `analytics` on data plane `dp-2` uses `data_plane=analytics` with that data plane's host.

The `catalog` and `schema` URL path segments select data to query. They are independent of the Kubernetes namespace used to route the connection.

## Usage

### Basic Connection

```python
from sqlalchemy import create_engine, text

engine = create_engine(
    "iomete://<username>:<personal_access_token>@<host>:443"
    "/spark_catalog/default"
    "?cluster=<cluster>&data_plane=<kubernetes_namespace>"
)

with engine.connect() as conn:
    result = conn.execute(text("SELECT 1")).scalar()
    print(result)  # 1
```

### Querying Data

```python
from sqlalchemy import create_engine, text

engine = create_engine(
    "iomete://<username>:<personal_access_token>@<host>:443"
    "/spark_catalog/default"
    "?cluster=<cluster>&data_plane=<kubernetes_namespace>"
)

with engine.connect() as conn:
    rows = conn.execute(text("SELECT * FROM my_table LIMIT 10")).fetchall()
    for row in rows:
        print(row)
```

### Schema Inspection

All reflection methods are fully implemented, making `iomete-sqlalchemy` compatible with schema inspection tools and data catalog integrations.

```python
from sqlalchemy import create_engine, inspect

engine = create_engine(
    "iomete://<username>:<personal_access_token>@<host>:443"
    "/spark_catalog/default"
    "?cluster=<cluster>&data_plane=<kubernetes_namespace>"
)

inspector = inspect(engine)

print(inspector.get_schema_names())
print(inspector.get_table_names(schema="spark_catalog.default"))
```

## Supported Type Mappings

| Spark / Iceberg type | SQLAlchemy type |
|---|---|
| `boolean` | `Boolean` |
| `tinyint`, `smallint` | `SmallInteger` |
| `int`, `integer` | `Integer` |
| `bigint` | `BigInteger` |
| `float`, `real` | `Float(24)` |
| `double` | `Float(53)` |
| `decimal(p, s)` | `Numeric(p, s)` |
| `char(n)` | `CHAR(n)` |
| `varchar(n)` | `VARCHAR(n)` |
| `string`, `text` | `Text` |
| `binary` | `LargeBinary` |
| `date` | `Date` |
| `timestamp`, `timestamp_ntz` | `DateTime` |
| `array<…>`, `map<…>`, `struct<…>` | `JSON` |

## Resources

- [PyPI — iomete-sqlalchemy](https://pypi.org/project/iomete-sqlalchemy/)