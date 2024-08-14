---
title: PostgreSQL Deployment
sidebar_label: PostgreSQL Deployment
description:  Deploy a PostgreSQL database for the IOMETE deployment.
last_update:
  date: 08/15/2024
  author: Vusal Dadalov
---

IOMETE requires a PostgreSQL database to store metadata and other information. Refer [Backend Databases](/deployment/backend-databases) for more details.

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
When admin user credentials are provided to IOMETE deployment, IOMETE will create necessary users and databases automatically. If you want to create users and databases manually, you can use the following script:
[database-init-postgres.sql](https://github.com/iomete/iomete-deployment/blob/main/database/postgresql/database-init-postgres.sql)
:::