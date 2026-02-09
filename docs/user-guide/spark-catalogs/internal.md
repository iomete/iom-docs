---
title: Iceberg REST Catalog
sidebar_label: Iceberg REST Catalog
description: Configure and manage IOMETE-managed Iceberg REST Catalogs, including external access, credentials vending, remote signing, and operational settings.
last_update:
  date: 02/07/2026
  author: Rocco Verhoef
---

import Img from '@site/src/components/Img';

IOMETE allows you to create **Iceberg REST Catalogs** that are fully managed by the platform. These catalogs:

- Are accessible by IOMETE workloads (Lakehouses, Spark jobs, Jupyter notebooks) and by external compute engines via the Iceberg REST API
- Integrate with [Data Security](/user-guide/data-security/overview) for role-based access control (RBAC)
- Require a valid session or [Access Token](../create-a-personal-access-token.md) for authentication

<Img src="/img/user-guide/spark-catalogs/rest-catalog-sol.png" alt="Spark Rest Catalogs Solution" />

## Creating a Catalog

Select **Iceberg REST Catalog** from the **Managed Catalogs** section, and provide:

- **Name**: The name of the catalog
- **Warehouse**: The URL of an S3-compatible warehouse _(IOMETE only supports object stores compatible with Amazon S3 APIs)_

<Img src="/img/user-guide/spark-catalogs/internal-rest-catalog-create.png" alt="Spark Catalog create" maxWidth="600px" />

### Custom S3 Credentials

By default, IOMETE uses the S3-compatible storage and credentials configured by your administrator during installation.
To use different credentials or a different storage provider for this catalog, enable the **Custom Credentials** checkbox:

- **Endpoint** — Required for MinIO and Dell ECS. Can be omitted for AWS S3.
- **Access key**
- **Secret key**

<Img src="/img/user-guide/spark-catalogs/spark-custom-credentials.png" alt="Spark Catalog custom credentials" maxWidth="600px"/>

### Additional Properties and Resource Tags

You can configure additional catalog properties and resource tags:

1. **Additional Properties** — Key-value pairs that customize catalog behavior. These correspond to [Iceberg catalog properties](https://iceberg.apache.org/docs/latest/configuration/#catalog-properties). Click **Add property** and enter a key and value.
2. **Resource Tags** — Organize IOMETE resources with custom tags. Click **Add tag** and enter a key and value.

<Img src="/img/user-guide/spark-catalogs/catalogs-additional.png" alt="Spark Catalogs additional properties" maxWidth="600px"/>

### Validating and Saving

Click **Test Connection** to validate connectivity and permissions, then click **Create** or **Save**.

<Img src="/img/user-guide/spark-catalogs/catalog-test-connection.png" alt="Test Connection" maxWidth="600px"/>

:::note Edit & Delete
Editing and deleting the `default` catalog is not permitted; you can only make changes to other catalogs.
:::

:::note Using a new catalog
Restart relevant Lakehouses and Spark Connect instances to ensure a newly created catalog is available.
:::

---

## Connecting from External Applications

IOMETE exposes each managed catalog at the subpath `/catalogs/<catalog name>` on the same domain as the IOMETE console. All endpoints are compliant with the [Iceberg REST Catalog OpenAPI specification](https://github.com/apache/iceberg/blob/apache-iceberg-1.6.1/open-api/rest-catalog-open-api.yaml).

For example, if your console is available at `https://console.iomete.internal`, the config endpoint for a catalog named `my_catalog` is:

```
https://console.iomete.internal/catalogs/my_catalog/v1/config
```

Authentication requires an [Access Token](../create-a-personal-access-token.md). You can pass it via:
- The `X-API-Token` header
- The `Authorization: Bearer <token>` header (standard for Iceberg Spark/Trino clients)

The user associated with the token must have the necessary [Access Policies](/user-guide/data-security/access-policy) on the catalog, namespace, and tables.

### PySpark Example

```shell
pyspark \
    --conf spark.sql.catalog.my_catalog=org.apache.iceberg.spark.SparkCatalog \
    --conf spark.sql.catalog.my_catalog.catalog-impl=org.apache.iceberg.rest.RESTCatalog \
    --conf spark.sql.catalog.my_catalog.uri="https://<console-url>/catalogs/my_catalog" \
    --conf spark.sql.catalog.my_catalog.token="<access-token>" \
    --conf spark.sql.catalog.my_catalog.warehouse="<path-to-your-s3-warehouse>" \
    --conf spark.sql.catalog.my_catalog.s3.endpoint="<s3-endpoint>" \
    --conf spark.sql.catalog.my_catalog.s3.client.region="<region>" \
    --conf spark.sql.catalog.my_catalog.s3.access-key-id="<access-key>" \
    --conf spark.sql.catalog.my_catalog.s3.secret-access-key="<secret-key>" \
    --conf spark.sql.catalog.my_catalog.s3.path-style-access=true \
    --conf spark.sql.defaultCatalog=my_catalog \
    --conf spark.sql.extensions=org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions \
    --packages org.apache.iceberg:iceberg-spark-extensions-3.5_2.12:1.9.2,org.apache.iceberg:iceberg-spark-runtime-3.5_2.12:1.9.2,org.apache.iceberg:iceberg-aws-bundle:1.9.2
```

:::tip TLS Certificates
If the IOMETE console uses HTTPS with certificates not in your JVM's default truststore, configure a custom truststore:
```
--conf "spark.driver.extraJavaOptions=-Djavax.net.ssl.trustStore=<path> -Djavax.net.ssl.trustStorePassword=<password>"
```
:::

---

## Access Delegation

:::info New in 3.16.0
Access delegation is available starting with IOMETE 3.16.0.
:::

Without access delegation, external clients must be configured with their own (static) S3 credentials to read data from Iceberg tables. Static credentials are difficult to rotate, cannot be scoped per-table, and pose a security risk if leaked.

**Access delegation** allows the REST catalog to handle data access on behalf of clients, so they only need a catalog-level access token. The Iceberg REST specification defines two access delegation modes, both implemented by IOMETE:

| Mode | How it works                                                            | Credentials leave the server? |
|---|-------------------------------------------------------------------------|---|
| **Credential Vending** | Catalog issues temporary, scoped credentials per table                  | Yes — client receives short-lived credentials |
| **Remote Signing** | Catalog signs requests on behalf of the client via presigned requests | No — credentials never leave the server |

Both modes enforce [Data Security](/user-guide/data-security/overview) policies. Permissions are derived from the configured data governance rules:
- `SELECT` privilege → read-only S3 access
- `INSERT` / `DELETE` privileges → read-write S3 access

### Global Configuration (System Configs)

Access delegation settings can be configured globally via **System Configs** and overridden per catalog via additional catalog properties.

#### Credential Vending

| System Config | Description | Default |
|---|---|---|
| `iceberg-catalog.vended-credentials.enabled` | Enable credential vending for all catalogs | `false` |
| `iceberg-catalog.vended-credentials.ttl` | Time-to-live for vended credentials (seconds) | `3600` |
| `iceberg-catalog.vended-credentials.sts.role-arn` | IAM role ARN for STS AssumeRole | — |
| `iceberg-catalog.vended-credentials.sts.external-id` | External ID for confused deputy protection | — |
| `iceberg-catalog.vended-credentials.sts.kms-enabled` | Include KMS permissions for SSE-KMS encrypted buckets | `false` |

To use this, your S3 compatible storage must have an equivalent of the [STS AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html). The credentials configured in IOMETE to connect to your object store must
allow IOMETE to call [STS AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) to be able to issue temporary credentials.

#### Remote Signing

| System Config | Description | Default |
|---|---|---|
| `iceberg-catalog.remote-signing.enabled` | Enable remote signing for all catalogs | `false` |
| `iceberg-catalog.remote-signing.token-ttl` | Time-to-live for signing JWT tokens (seconds) | `3600` |

### Per-Catalog Overrides

You can override global settings on individual catalogs by adding these as **Additional Properties** when creating or editing a catalog:

**Credential Vending:**
| Property | Overrides | Fallback |
|---|---|---|
| `vended-credentials.ttl` | Global TTL | — |
| `vended-credentials.sts.role-arn` | Global role ARN | — |
| `vended-credentials.sts.external-id` | Global external ID | — |
| `vended-credentials.sts.kms-enabled` | Global KMS setting | — |
| `vended-credentials.sts.region` | — | `s3.client.region` |
| `vended-credentials.sts.endpoint` | — | `s3.endpoint` |
| `vended-credentials.sts.access-key-id` | — | `s3.access-key-id` |
| `vended-credentials.sts.secret-access-key` | — | `s3.secret-access-key` |

**Remote Signing:**
| Property | Overrides | Fallback |
|---|---|---|
| `remote-signing.token-ttl` | Global token TTL | — |
| `remote-signing.s3.region` | — | `s3.client.region` |

---

## Operational Settings

### Overload Protection

The REST catalog enforces a maximum number of concurrent requests to prevent pod overload. When the limit is exceeded, the catalog returns **HTTP 503 Service Unavailable**.
This can be used to protect the service from denial of service type attacks.

```yaml
# Helm values
services:
  restCatalog:
    settings:
      maxConcurrentRequests: 10000  # default
```

### Client Request Tracking

When enabled, HTTP metrics are tagged with the access token name and user ID. This provides per-client visibility into request rates, latency, and error rates in Grafana.

```yaml
# Helm values
services:
  restCatalog:
    settings:
      serviceAccountRequestTracking: false  # default
```

:::warning High-Cardinality Labels
Enabling request tracking adds per-client labels (`iomete_user_id`, `iomete_pat`) to HTTP metrics. These are high-cardinality labels — most metrics backends (Prometheus, Mimir, Thanos, Datadog) are sensitive to label cardinality and can experience performance degradation or increased storage costs. Only enable this if you have a limited number of access tokens and your metrics infrastructure can handle the additional cardinality.
:::

### Rate Limiting

Per-token rate limiting prevents individual clients from overwhelming the catalog. Each [Access Token](../create-a-personal-access-token.md) can have a configurable **max requests per second (maxRPS)**.

```yaml
# Helm values
features:
  ratelimiter:
    enabled: false  # default
```

When enabled, IOMETE deploys a dedicated rate limiter pod alongside the REST catalog.

See [Access Tokens](../create-a-personal-access-token.md) for configuring maxRPS per token.

### Scaling

The REST catalog supports horizontal scaling via replicas or HPA:

```yaml
# Helm values
services:
  restCatalog:
    replicas: 1  # default
    autoscaling:
      enabled: false
      minReplicas: 1
      maxReplicas: 3
```
