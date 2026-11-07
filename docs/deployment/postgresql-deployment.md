---
title: PostgreSQL Deployment
sidebar_label: PostgreSQL Deployment
description:  Deploy a PostgreSQL database for the IOMETE deployment.
last_update:
  date: 11/07/2026
  author: Vusal Dadalov
---

IOMETE requires a PostgreSQL database to store metadata and other information. Refer [Backend Databases](./backend-databases.md) for more details.

You can use your own database, or you can use the provided `postgresql` database.

:::info
This postgresql database is for testing purpose only. For production, please use your own database that is optimized for production use.
:::

Add `bitnami` helm repo if you haven't done so.

```shell showLineNumbers
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

Deploy postgresql database, and wait for it to be ready.

Required file: [postgresql-values.yaml](https://github.com/iomete/iomete-deployment/blob/main/database/postgresql/postgresql-values.yaml)

```shell showLineNumbers
wget https://raw.githubusercontent.com/iomete/iomete-deployment/main/database/postgresql/postgresql-values.yaml

helm upgrade --install -n iomete-system \
  postgresql bitnami/postgresql -f postgresql-values.yaml
```

Wait for postgresql pod to be ready. It takes about **~1 minute**

```shell showLineNumbers
kubectl get pods -n iomete-system \
  -l app.kubernetes.io/name=postgresql --watch
```

:::note
When you set `database.adminCredentials` in the IOMETE values, the initialization job creates the IOMETE role and databases automatically. To create them yourself, create every database in the [control-plane database list](./backend-databases.md#control-plane-databases). The [database-init-postgres.sql](https://github.com/iomete/iomete-deployment/blob/main/database/postgresql/database-init-postgres.sql) script creates only seven of the nine: also create `iomete_prefect_db` and `iomete_ai_services_db`, with the same grants.
:::