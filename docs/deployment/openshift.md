---
title: Deploying IOMETE on Red Hat OpenShift
sidebar_label: Red Hat OpenShift
description: Install IOMETE Data Plane Enterprise on Red Hat OpenShift 4.18 and later, validated on 4.22, with the IOMETE Operator or Helm.
last_update:
  date: 11/25/2026
  author: Abhishek Pathania
---

:::info Red Hat OpenShift
IOMETE Data Plane Enterprise is supported on Red Hat OpenShift 4.18 and later. Validated on OpenShift 4.22 with IOMETE Operator 1.0.0.
:::

IOMETE ships as an operator in the OpenShift software catalog. Every IOMETE pod runs under OpenShift's default `restricted-v2` security context constraint (SCC) with a user ID that OpenShift assigns, so no additional SCCs are needed.

## Supported Versions

IOMETE supports these versions on OpenShift:

| Component | Supported versions |
| -- | -- |
| Red Hat OpenShift Container Platform | 4.18 and later, validated on 4.22 |
| IOMETE Operator | 1.0.0 and later |
| IOMETE Data Plane Enterprise (Helm installs) | 4.0.3 and later |

## Prerequisites

- An OpenShift 4.18 or later cluster, and `oc` logged in to it. The IOMETE services request about 14 vCPU and 24 GiB of memory in the data plane project. OpenShift's own workloads, lakehouses, Spark jobs and notebooks need capacity on top of that.
- Cluster-admin access.
- A PostgreSQL database and supported object storage, both reachable from the cluster.

## Installing with the IOMETE Operator

The operator installs the data plane from a single custom resource, and Operator Lifecycle Manager (OLM) keeps the operator up to date.

1. **Install the operator.** In the web console, open **Ecosystem** > **Software Catalog** (**Operators** > **OperatorHub** on OpenShift 4.18 and 4.19) and search for **IOMETE Operator**. Install it from the `stable` channel with **All namespaces on the cluster** selected. The operator runs in `openshift-operators`. Don't install the 0.0.x versions on the `alpha` channel.

   To install from the CLI instead, apply this Subscription:

   ```yaml
   apiVersion: operators.coreos.com/v1alpha1
   kind: Subscription
   metadata:
     name: iomete-operator
     namespace: openshift-operators
   spec:
     channel: stable
     name: iomete-operator
     source: certified-operators
     sourceNamespace: openshift-marketplace
   ```

   The install is done when the operator's ClusterServiceVersion reports `Succeeded`. It can take a minute to appear:

   ```shell
   oc get csv --namespace openshift-operators
   ```

   Each operator release bundles a new chart version, so an operator update also upgrades the data plane. For production, set the update approval to **Manual** (`installPlanApproval: Manual` in the Subscription) and approve each update, including the first install, after reading the release notes.

2. **Create a project and credentials.** The data plane reads its database and storage passwords from Secrets in its own project:

   ```shell
   oc new-project iomete-system
   oc create secret generic iomete-db-credentials --namespace iomete-system \
     --from-literal=password='<database-user-password>'
   oc create secret generic iomete-db-admin-credentials --namespace iomete-system \
     --from-literal=password='<database-admin-password>'
   oc create secret generic iomete-s3-credentials --namespace iomete-system \
     --from-literal=secret-key='<storage-secret-key>'
   ```

3. **Create the data plane.** The `spec` of an `IometeDataPlaneEnterprise` resource takes the values of the `iomete-data-plane-enterprise` Helm chart ([Artifact Hub](https://artifacthub.io/packages/helm/iomete/iomete-data-plane-enterprise)). Operator 1.0.0 bundles chart 4.0.3. Start from this minimal resource:

   ```yaml title="data-plane.yaml"
   apiVersion: charts.iomete.com/v1
   kind: IometeDataPlaneEnterprise
   metadata:
     name: iomete
     namespace: iomete-system
   spec:
     name: iomete-data-plane
     adminUser:
       username: admin
       email: admin@example.com
       firstName: Admin
       lastName: User
       temporaryPassword: "<temporary-password>"
     database:
       type: postgresql
       host: <postgresql-host>
       port: "5432"
       user: <database-user>
       passwordSecret:
         name: iomete-db-credentials
         key: password
       prefix: iomete_
       adminCredentials:
         user: <database-admin-user>
         passwordSecret:
           name: iomete-db-admin-credentials
           key: password
     storage:
       type: s3_compatible
       bucketName: <bucket>
       s3CompatibleSettings:
         endpoint: <s3-endpoint-url>
         accessKey: <storage-access-key>
         secretKeySecret:
           name: iomete-s3-credentials
           key: secret-key
   ```

   Use fully qualified hostnames for the database and the storage endpoint, such as `postgresql.iomete-system.svc.cluster.local`, and give the endpoint as a URL with its scheme and port, such as `http://minio.iomete-system.svc.cluster.local:9000`. This storage block fits S3-compatible storage (`s3_compatible`) and Dell ECS (`dell_ecs`). For AWS S3, Google Cloud Storage or Azure, see the `storage` values on [Artifact Hub](https://artifacthub.io/packages/helm/iomete/iomete-data-plane-enterprise). Then apply the resource:

   ```shell
   oc apply -f data-plane.yaml
   ```

4. **Verify the installation.** Check the pods until every one is `Running` or `Completed`. A few pods can restart once while the services they depend on start:

   ```shell
   oc get pods --namespace iomete-system
   ```

Once the pods are up, give users access with a Route, as shown in [Accessing the Console](#accessing-the-console).

## Installing with Helm

Alternatively, install with Helm by following the [On-Premises Deployment Guide](./on-prem/install.md). Add these Spark versions to your values file:

```yaml title="data-plane-values.yaml"
docker:
  defaultSparkVersion: 4.2.1-v1
  additionalSparkVersions:
    - 3.5.9-v1
```

Set `platform: openshift` when you render the chart without cluster access, such as with `helm template` or [Argo CD](./argocd.md). Skip the guide's Istio step and expose the console with a Route instead.

## Accessing the Console

The chart doesn't expose the console, so create an edge Route to the gateway. The OpenShift router terminates HTTPS and redirects plain HTTP requests to HTTPS:

```shell
oc create route edge iomete --service=iom-gateway --port=http --insecure-policy=Redirect --namespace iomete-system
```

By default, the router ends a request that gets no response within 30 seconds, so longer queries fail with `504 Gateway Timeout`. Raise the timeout on the Route above your longest query:

```shell
oc annotate route iomete --namespace iomete-system haproxy.router.openshift.io/timeout=1h
```

On a cloud provider, the load balancer in front of the router has its own idle timeout, so raise that too. On AWS, the Classic Load Balancer closes idle connections after 60 seconds unless you set `spec.endpointPublishingStrategy.loadBalancer.providerParameters.aws.classicLoadBalancer.connectionIdleTimeout` on the IngressController.

Then print the console URL:

```shell
echo "https://$(oc get route iomete --namespace iomete-system --output=jsonpath='{.spec.host}')"
```

The Route uses the cluster's default ingress certificate, which browsers don't trust unless your administrator replaced it. For your own hostname and certificate, add `--hostname`, `--cert` and `--key` to the `oc create route` command, plus `--ca-cert` with the intermediate certificates if your certificate has any, and create a DNS record that points the hostname at the router. If the certificate comes from a private CA, or you enable the MCP server with the default certificate, add the CA as described in [Custom Java Truststore](./truststore.md). The MCP server also needs `services.mcpServer.urls.public` set to the Route URL.

This Route serves the console, the REST API and JDBC clients, but not Arrow Flight or Spark Connect clients. To connect those, see [Connecting Arrow Flight and Spark Connect Clients](#connecting-arrow-flight-and-spark-connect-clients).

### Connecting Arrow Flight and Spark Connect Clients

Arrow Flight and Spark Connect clients use gRPC, which needs HTTP/2. The OpenShift router offers HTTP/2 only when it's enabled and the Route has its own certificate. The cluster's default ingress certificate never qualifies.

1. **Enable HTTP/2 on the router.** This applies to every Route that has its own certificate and restarts the router pods, so agree it with your cluster administrator:

   ```shell
   oc annotate ingresses.config/cluster ingress.operator.openshift.io/default-enable-http2=true
   ```

2. **Give the Route its own hostname and certificate.** Delete the Route you created above, create it again with `--hostname`, `--cert` and `--key`, then set the timeout again:

   ```shell
   oc delete route iomete --namespace iomete-system
   oc create route edge iomete --service=iom-gateway --port=http --insecure-policy=Redirect \
     --hostname=<iomete.example.com> --cert=<tls.crt> --key=<tls.key> --namespace iomete-system
   oc annotate route iomete --namespace iomete-system haproxy.router.openshift.io/timeout=1h
   ```

   Don't use this certificate on any other Route. When two Routes share a certificate, the router turns HTTP/2 off for both, so a wildcard certificate reused across Routes breaks these clients.

3. **Connect on port 443.** The connection strings the console shows already include it. Clients must trust the certificate's CA. gRPC clients don't read the browser's trust store, so if the CA is private, add it to each client.

## Limitations

- Doris compute isn't supported on OpenShift. Leave `features.doris.enabled` off, which is the default.
- Lakehouses and Spark jobs use EmptyDir volumes by default on OpenShift, and Host Path volumes are rejected. For large shuffle or spill data, attach an [On-Demand PVC volume](/user-guide/volumes#on-demand-pvc).
- The [MinIO](./minio-deployment.md) and [Apache Ozone](./ozone-deployment.md) installation guides don't run under `restricted-v2`. Bring your own PostgreSQL database and object storage.
