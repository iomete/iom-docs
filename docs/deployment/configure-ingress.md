---
title: Configuring Istio Ingress
sidebar_label: Configure Ingress
description: Route the IOMETE console, compute traffic and cross-plane requests through an Istio ingress with TLS and HTTP/2.
last_update:
  date: 11/07/2026
  author: IOMETE
---

Use ingress to expose the **control-plane console and APIs** and, when needed, the compute endpoint of an additional data plane. An additional data plane does not have a separate console: its root page redirects to the control plane.

This guide uses Istio and the gateway Services in the IOMETE 4.0 charts. If you use another ingress controller, configure the same destinations with HTTP/2 support for gRPC and WebSocket support for notebooks. For the platform's topology, see [Multi-Cluster Setup](./multi-cluster-setup.mdx).

## Deploying Istio {#deploying-istio}

If your cluster already has an ingress controller, review its existing listeners and routes before changing it. Do not install a second controller or overwrite a shared Gateway just to add IOMETE.

### Adding the Istio Helm Repository {#adding-the-istio-helm-repository}

```shell
kubectl config current-context
helm repo add istio https://istio-release.storage.googleapis.com/charts
helm repo update
```

### Installing Istio Components {#deploy-istio-components-via-helm}

IOMETE's 4.0 test environments run Istio 1.30.4. Use that version for a new installation unless your organization has approved another one, and check in Istio's [supported releases](https://istio.io/latest/docs/releases/supported-releases/) table that it supports your Kubernetes version. Use the same version for every Istio component. For other installation options, see the [Istio Helm installation guide](https://istio.io/latest/docs/setup/install/helm/).

These commands install Istio and a gateway release named `istio-ingress`:

```shell
ISTIO_VERSION="1.30.4"
helm install base istio/base \
  --namespace istio-system --create-namespace --version "$ISTIO_VERSION"
helm install istiod istio/istiod \
  --namespace istio-system --version "$ISTIO_VERSION" --wait
helm install istio-ingress istio/gateway \
  --namespace istio-system --version "$ISTIO_VERSION"
kubectl rollout status deployment/istio-ingress --namespace istio-system --timeout=5m
```

The gateway release is installed without `--wait`. With `--wait`, Helm 3 also waits for the gateway's `LoadBalancer` Service to get an external address, so on a cluster without a load-balancer provider the install hangs until it times out. `kubectl rollout status` waits only for the gateway pods.

Check the gateway pods and Service:

```shell
kubectl get pods --namespace istio-system --selector istio=ingress
kubectl get service istio-ingress --namespace istio-system
```

The gateway pod should be `Running`. Its `istio=ingress` label is what the Gateway below selects. The Service should show an IP address or DNS name in `EXTERNAL-IP`:

```text
NAME            TYPE           CLUSTER-IP     EXTERNAL-IP    PORT(S)                                      AGE
istio-ingress   LoadBalancer   10.43.158.20   203.0.113.10   15021:31325/TCP,80:30129/TCP,443:32507/TCP   2m
```

If `EXTERNAL-IP` stays `<pending>` for more than a few minutes, the cluster probably has no load-balancer provider, which is common on bare metal. Switch the gateway Service to `NodePort` and put a load balancer or forwarder in front of it, as described in [Using NodePort instead of a LoadBalancer](./configure-custom-dns.md#if-your-setup-uses-a-nodeport):

```shell
helm upgrade istio-ingress istio/gateway \
  --namespace istio-system --version "$ISTIO_VERSION" \
  --set service.type=NodePort
```

These commands are for a new installation. To upgrade an existing Istio installation, use its own release names, values and upgrade procedure.

## Configuring the Gateway

The example below assumes:

- Control-plane release `data-plane` in `iomete-system`.
- Control-plane hostname `iomete.example.com`, resolving to the ingress address.
- Istio gateway pods in `istio-system` with label `istio: ingress`.
- A certificate valid for `iomete.example.com`, trusted by browsers and IOMETE services.

Replace the hostname, namespace and pod selector for your installation. The IOMETE chart creates its internal gateway Services; you configure the ingress listener and routing separately.

### Configuring HTTPS {#for-https-tls-mode}

#### Prerequisites

Set up [DNS](./configure-custom-dns.md) and obtain a certificate from your organization's certificate authority or a public CA. If you use a private CA, configure the relevant clients and [IOMETE truststores](./truststore.md) to trust it. Skipping certificate verification is not a replacement for trust configuration.

#### Creating the TLS Secret {#create-a-tls-secret}

Use the certificate chain and matching private key in `tls.crt` and `tls.key`. The Secret belongs in the namespace of the Istio gateway pods:

```shell
kubectl create secret tls iomete-ingress-tls \
  --namespace istio-system --cert=tls.crt --key=tls.key \
  --dry-run=client -o yaml | kubectl apply -f -
```

#### Configuring the HTTPS Listener {#deploy-the-https-gateway}

Save this as `iomete-gateway.yaml`. It redirects HTTP to HTTPS and terminates TLS on port 443:

```yaml title="iomete-gateway.yaml"
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: iomete-gateway
  namespace: istio-system
spec:
  selector:
    istio: ingress
  servers:
    - port:
        number: 80
        name: http
        protocol: HTTP
      hosts:
        - iomete.example.com
      tls:
        httpsRedirect: true
    - port:
        number: 443
        name: https
        protocol: HTTPS
      hosts:
        - iomete.example.com
      tls:
        mode: SIMPLE
        credentialName: iomete-ingress-tls
```

For an existing shared Gateway, merge the IOMETE hostname and TLS listener into the managed configuration. Preserve its other hosts, certificates and listeners. Do not replace the entire resource with this example.

:::caution Configured with the earlier example files?
If you set up ingress with the earlier `gateway-http.yaml` or `gateway-https.yaml` files, the `istio-system` namespace still has a Gateway named `gateway` and a VirtualService named `iomete-virtual-service`. That Gateway serves every hostname on the same ports, so it overlaps the new one. Replace it as described in [Replacing the Earlier Example Configuration](#replacing-the-earlier-example-configuration) instead of applying the new files next to it.
:::

### Routing Requests to IOMETE

Check the Services first:

```shell
kubectl get service iom-gateway iom-gateway-cross-ingress \
  --namespace iomete-system
```

`iom-gateway` should list ports `80` and `8081`, and `iom-gateway-cross-ingress` port `8083`:

```text
NAME                        TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)           AGE
iom-gateway                 ClusterIP   10.43.150.52   <none>        80/TCP,8081/TCP   5m
iom-gateway-cross-ingress   ClusterIP   10.43.140.48   <none>        8083/TCP          5m
```

The example uses three destinations from the 4.0 charts:

| Traffic | Destination | Why |
|---|---|---|
| Spark Connect and Arrow Flight gRPC | `iom-gateway:8081` | This Service port declares HTTP/2 for the upstream connection. |
| `/cross-plane/` requests | `iom-gateway-cross-ingress:8083` | Plane-to-plane API calls pass through the gateway's trust check. |
| Console, public APIs and WebSockets | `iom-gateway:80` | Supports ordinary HTTP and notebook WebSocket upgrades. |

If your installed chart exposes different Services or ports, use the ingress configuration for that version. Do not add a port to a chart-managed Service manually as an upgrade workaround.

Spark Connect and Arrow Flight hold a gRPC stream open while a query runs, so a long query keeps its connection open for a long time. IOMETE's gateway is configured for this: it turns on TCP keepalive for its gRPC connections to computes (`grpc_socket_keepalive on`) and closes a stream only after 24 hours without data (`grpc_read_timeout 86400s`). JDBC connections on the port 80 route have the same 24-hour read timeout. Make sure the ingress does not close these connections sooner. Istio sets no request timeout on a route unless you add one, so leave `timeout` unset on these routes or set it longer than your longest query. If a load balancer or another proxy sits in front of the Istio gateway, check its idle and request timeouts as well.

Save the following as `iomete-route.yaml`. Keep the specific path matches before the final catch-all route:

```yaml title="iomete-route.yaml"
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: iomete-control-plane
  namespace: iomete-system
spec:
  hosts:
    - iomete.example.com
  gateways:
    - istio-system/iomete-gateway
  http:
    - match:
        - uri:
            prefix: /spark.connect.
        - uri:
            prefix: /arrow.flight.protocol.FlightService
      route:
        - destination:
            host: iom-gateway.iomete-system.svc.cluster.local
            port:
              number: 8081
    - match:
        - uri:
            prefix: /cross-plane/
      route:
        - destination:
            host: iom-gateway-cross-ingress.iomete-system.svc.cluster.local
            port:
              number: 8083
    - route:
        - destination:
            host: iom-gateway.iomete-system.svc.cluster.local
            port:
              number: 80
```

Use your cluster's DNS suffix if it differs from `cluster.local`. Apply the reviewed configuration:

```shell
kubectl apply -f iomete-gateway.yaml -f iomete-route.yaml
```

Set this in the **complete values file** for the IOMETE release, then follow the [upgrade procedure](./life-cycle-management.mdx#upgrade-example):

```yaml title="values.yaml"
ingress:
  httpsEnabled: true
```

This setting tells IOMETE that the public connection uses HTTPS. It does not enable TLS by itself. Keep the existing namespace list and other release settings when applying it.

For an additional data plane, complete [Routing an Additional Data Plane](#routing-an-additional-data-plane) before the checks below.

## Verifying Access {#follow-up-steps}

```shell
curl --fail --show-error --silent --output /dev/null \
  --write-out 'HTTP %{http_code}\n' https://iomete.example.com/
```

With a private CA, use `--cacert <ca-certificate.pem>` for this check. Expect `HTTP 200`, then sign in using a browser. For an additional data plane, its root URL should redirect to the control plane. It returns `404` instead when the plane's `multiCluster.controlPlaneAddress` is an in-cluster address.

Complete the functional checks: in the Admin Portal, open **Data Planes** and confirm the plane shows **Connected**. Then run `SELECT 1` on one of its compute clusters, and open a Jupyter container if you use notebooks. An HTTP response from the console does not verify gRPC or WebSockets. If SQL fails while the plane remains connected, check TLS trust, port 443 reachability and the gRPC route to Service port 8081.

## Other Deployment Scenarios

<details id="routing-an-additional-data-plane" style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}>
<summary>Routing an additional data plane</summary>

An additional data plane needs its own hostname. In this example, the `analytics` data plane uses `analytics.example.com`, and its runtime release `analytics` runs in the service namespace `iomete-analytics`. Add that hostname to an appropriate HTTPS Gateway with a certificate covering it. Create a separate VirtualService using the route structure above, with these substitutions:

| Field | Additional-plane value |
|---|---|
| VirtualService name | `iomete-analytics` |
| VirtualService namespace | `iomete-analytics` |
| Hostname | `analytics.example.com` |
| Destination Service namespace | `iomete-analytics` in all three destination hosts |
| Gateway reference | The Gateway serving this hostname |

Do not send the additional data plane's hostname to the control-plane release's service namespace. Avoid wildcard catch-all routes that can also match another plane's hostname. Set `ingress.httpsEnabled: true` in the runtime release's values too.

The plane's `multiCluster.externalUrl` is the compute URL clients use, such as `https://analytics.example.com`. Its `multiCluster.selfUrl` is the address the control plane uses for enrollment and plane-to-plane calls; it can be an internal service address when both planes share a Kubernetes cluster. A private `selfUrl` does not replace the compute endpoint: the control plane's SQL service also needs access to the external compute hostname on **TLS port 443 with HTTP/2**.

Keep the `/cross-plane/` route in the plane's VirtualService. When `selfUrl` uses the plane's hostname, the control plane calls the plane through that route, because the plane's port 80 route does not accept those calls.

Decide these addresses before enrolling the plane. The control plane stores them when the plane first enrolls and does not read them again, so a later Helm upgrade cannot correct them. See [Multi-Cluster Setup](./multi-cluster-setup.mdx) for enrollment prerequisites.

Do not change the ordinary port 80 Service to force HTTP/2: notebooks need its WebSocket upgrade behavior. Use the dedicated gRPC port. See [Istio protocol selection](https://istio.io/latest/docs/ops/configuration/traffic-management/protocol-selection/) for upstream protocol handling.

</details>

<details id="for-http-non-tls-mode" style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}>
<summary>HTTP-only access for a local evaluation</summary>

For a local evaluation of the control plane and its default data plane, you can use an HTTP listener on port 80 without `httpsRedirect` and set `ingress.httpsEnabled: false`. Keep the hostname-specific VirtualService and route destinations above. Do not submit real credentials over an untrusted HTTP connection.

HTTP-only console access does not validate an additional data plane's compute connectivity. The remote SQL path requires the TLS endpoint described above.

</details>

<details id="replacing-the-earlier-example-configuration" style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}>
<summary>Replacing the earlier example configuration</summary>

Earlier versions of this guide applied `gateway-http.yaml` or `gateway-https.yaml` from the [iomete-deployment](https://github.com/iomete/iomete-deployment) repository. They created these resources in `istio-system`:

| Resource | Name | What it does |
|---|---|---|
| Gateway | `gateway` | Listens on ports 80 and 31400, plus 443 in the HTTPS file, for every hostname (`*`) |
| VirtualService | `iomete-virtual-service` | Sends all traffic, as plain TCP, to `iom-gateway:80` |
| Secret (HTTPS file only) | `tls-secret` | Holds the certificate for port 443 |

Because that configuration forwards plain TCP to port 80, it does not use the dedicated gRPC port described above. Its Gateway also selects the same `istio: ingress` pods and ports as `iomete-gateway`, for every hostname, so the two overlap. Replace the old resources instead of running both.

1. Check which routes use the old Gateway:

   ```shell
   kubectl get virtualservices.networking.istio.io --all-namespaces \
     -o custom-columns='NAMESPACE:.metadata.namespace,NAME:.metadata.name,GATEWAYS:.spec.gateways,HOSTS:.spec.hosts'
   ```

   If a route other than `iomete-virtual-service` lists `gateway`, another application shares that Gateway. Stop here and plan the change with its owner: merge the IOMETE hostname into the shared configuration instead of deleting it.

2. Choose the certificate Secret. To keep using the existing one, set `credentialName: tls-secret` in `iomete-gateway.yaml`. Otherwise, create `iomete-ingress-tls` as described in [Creating the TLS Secret](#create-a-tls-secret).

3. Delete the old resources and apply the new ones. The console is unreachable between these commands, so run them together in a maintenance window:

   ```shell
   kubectl delete virtualservices.networking.istio.io iomete-virtual-service --namespace istio-system
   kubectl delete gateways.networking.istio.io gateway --namespace istio-system
   kubectl apply -f iomete-gateway.yaml -f iomete-route.yaml
   ```

4. Complete [Verifying Access](#follow-up-steps). If you switched to `iomete-ingress-tls`, delete `tls-secret` once nothing references it.

</details>
