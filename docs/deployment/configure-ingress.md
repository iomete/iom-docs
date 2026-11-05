---
title: Configuring Istio Ingress
sidebar_label: Configure Ingress
description: Route the IOMETE console, compute traffic and cross-plane requests through an Istio ingress with TLS and HTTP/2.
last_update:
  date: 11/05/2026
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

For a new Istio installation, select a version compatible with your Kubernetes version and approved for your environment. Follow the [Istio Helm installation guide](https://istio.io/latest/docs/setup/install/helm/), using the same pinned version for all components. The following example creates a gateway release named `istio-ingress`:

```shell
ISTIO_VERSION="<approved-istio-version>"
helm install base istio/base \
  --namespace istio-system --create-namespace --version "$ISTIO_VERSION"
helm install istiod istio/istiod \
  --namespace istio-system --version "$ISTIO_VERSION" --wait
helm install istio-ingress istio/gateway \
  --namespace istio-system --version "$ISTIO_VERSION" --wait
```

These commands are for a new installation. Upgrade an existing Istio installation using its own release names, values and upgrade procedure. Verify that its Service exposes the ports you intend to use:

```shell
kubectl get services,pods --namespace istio-system
kubectl get pods --namespace istio-system --show-labels
```

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

For an existing shared Gateway, merge the IOMETE hostname and TLS listener into the managed configuration. Preserve other hosts, certificates and any required TCP listeners, such as an existing JDBC route. Do not replace the entire resource with this example.

### Routing Requests to IOMETE

Check the Services first:

```shell
kubectl get service iom-gateway iom-gateway-cross-ingress \
  --namespace iomete-system -o yaml
```

The example uses three destinations from the 4.0 charts:

| Traffic | Destination | Why |
|---|---|---|
| Spark Connect and Arrow Flight gRPC | `iom-gateway:8081` | This Service port declares HTTP/2 for the upstream connection. |
| `/cross-plane/` requests | `iom-gateway-cross-ingress:8083` | Plane-to-plane API calls pass through the gateway's trust check. |
| Console, public APIs and WebSockets | `iom-gateway:80` | Supports ordinary HTTP and notebook WebSocket upgrades. |

If your installed chart exposes different Services or ports, use the ingress configuration for that version. Do not add a port to a chart-managed Service manually as an upgrade workaround.

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

### Routing an Additional Data Plane

An additional plane needs its own hostname, for example `compute-east.example.com`, and its own runtime release, for example in `iomete-dp-east`. Add that hostname to an appropriate HTTPS Gateway with a certificate covering it. Create a separate VirtualService using the route structure above, with these substitutions:

| Field | Additional-plane value |
|---|---|
| VirtualService name | `iomete-dp-east` |
| VirtualService namespace | `iomete-dp-east` |
| Hostname | `compute-east.example.com` |
| Destination Service namespace | `iomete-dp-east` in all three destination hosts |
| Gateway reference | The Gateway serving this hostname |

Do not send the additional plane's hostname to the control-plane namespace. Avoid wildcard catch-all routes that can also match another plane's hostname. Set `ingress.httpsEnabled: true` in the runtime release's values too.

The plane's `multiCluster.externalUrl` is the compute URL clients use, such as `https://compute-east.example.com`. Its `multiCluster.selfUrl` is the address the control plane uses for enrollment and plane-to-plane calls; it can be an internal service address when both planes share a Kubernetes cluster. A private `selfUrl` does not replace the compute endpoint: the control plane's SQL service also needs access to the external compute hostname on **TLS port 443 with HTTP/2**.

Decide these addresses before enrolling the plane. They are recorded during enrollment, and changing Helm values alone does not reliably change an already registered address. See [Multi-Cluster Setup](./multi-cluster-setup.mdx) for enrollment prerequisites.

Do not change the ordinary port 80 Service to force HTTP/2: notebooks need its WebSocket upgrade behavior. Use the dedicated gRPC port. See [Istio protocol selection](https://istio.io/latest/docs/ops/configuration/traffic-management/protocol-selection/) for upstream protocol handling.

### Using HTTP for a Local Evaluation {#for-http-non-tls-mode}

For a local evaluation of the control plane and its default data plane, you can use an HTTP listener on port 80 without `httpsRedirect` and set `ingress.httpsEnabled: false`. Keep the hostname-specific VirtualService and route destinations above. Do not submit real credentials over an untrusted HTTP connection.

HTTP-only console access does not validate an additional data plane's compute connectivity. The remote SQL path requires the TLS endpoint described above.

## Verifying Access {#follow-up-steps}

```shell
curl --fail --show-error --silent --output /dev/null \
  --write-out 'HTTP %{http_code}\n' https://iomete.example.com/
```

With a private CA, use `--cacert <ca-certificate.pem>` for this check. Expect a successful console response, then sign in using a browser. For an additional plane, visiting its root URL should redirect to the control plane.

Complete the functional checks: confirm the plane is connected, run `SELECT 1` on one of its compute clusters, and open a Jupyter container if you use notebooks. An HTTP response from the console does not verify gRPC or WebSockets. If SQL fails while the plane remains connected, check TLS trust, port 443 reachability and the gRPC route to Service port 8081.
