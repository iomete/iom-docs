---
title: Configuring IOMETE Hostnames
sidebar_label: Custom DNS
description: Choose hostnames for the control plane and additional data planes, point them at ingress, and verify DNS and TLS access.
last_update:
  date: 11/06/2026
  author: IOMETE
---

Give the control plane a stable hostname, such as `iomete.example.com`. Users open that address to access the console. An additional data plane uses a separate compute hostname, such as `analytics.example.com`; it does not provide another console.

## Choosing the Addresses {#understanding-the-basics}

| Address | Who uses it | Example |
|---|---|---|
| Control-plane URL | Users, API clients and enrolled data planes | `https://iomete.example.com` |
| Additional plane's `multiCluster.externalUrl` | Compute clients and the control plane's SQL service | `https://analytics.example.com` |
| Additional plane's `multiCluster.selfUrl` | Control-plane enrollment and plane-to-plane API calls | A reachable private gateway address or the plane's HTTPS hostname |

Two hostnames can resolve to the same ingress address when the planes share a Kubernetes cluster. Their ingress routes must still select the correct plane's service namespace. A Kubernetes namespace does not automatically receive a public hostname.

Choose data-plane addresses before enrollment. IOMETE records them when the plane enrolls; changing DNS, Helm values or restarting the agent is not a general procedure for replacing an already registered address. Plan an address migration separately if an enrolled plane must move to a different URL. See [Multi-Cluster Setup](./multi-cluster-setup.mdx).

## Identifying the Istio Ingress Gateway Address

The hostname must resolve from every network that needs it. In particular, the control plane must reach an additional plane's compute hostname on TLS port 443, even if the two planes also use a private address for their API calls.

### If Your Setup Uses a `LoadBalancer`

Find the ingress Service. These names match the [Istio installation example](./configure-ingress.md):

```shell
kubectl config current-context
kubectl get service istio-ingress --namespace istio-system
```

Use the address in `EXTERNAL-IP`, which may be an IP address or a load-balancer DNS name. If it remains pending, finish the load-balancer configuration before creating DNS records. For a different controller or release name, use that controller's Service.

<details id="if-your-setup-uses-a-nodeport">
<summary>Using NodePort instead of a LoadBalancer</summary>

DNS maps a name to an address; it does not map port 443 to a Kubernetes NodePort. Configure a reachable load balancer, reverse proxy or firewall forwarding rule that accepts the required public ports and forwards to the ingress NodePorts. Use that stable frontend address for DNS. Pointing DNS at an arbitrary worker node is not enough to provide HTTPS on port 443.

</details>

## Creating Your DNS Record

Create the record for the chosen hostname with your DNS administrator or provider:

- Use an `A` record for an IPv4 address, or an `AAAA` record for an IPv6 address.
- Use a `CNAME` for a load-balancer DNS name where your DNS provider permits it. Use the provider's supported alias mechanism if you need a record at the domain apex.

Repeat for an additional plane's hostname if it has a separate endpoint. Public DNS is not required for a private deployment, but the names must resolve from users' networks, the control plane and the participating data planes as appropriate.

Verify the answer from the networks that will use it:

```shell
dig +short iomete.example.com
dig +short analytics.example.com
```

Only run the second check if you configured that additional plane. Allow for your DNS records' TTL when changing an existing address.

## Configuring TLS and Routing

Follow [Configuring Ingress](./configure-ingress.md) to bind each hostname to the correct services and install a certificate covering the hostname. DNS alone does not configure ingress or TLS.

Keep the configured control-plane platform URL (`platform.url`) and additional planes' `multiCluster.controlPlaneAddress` consistent with the control-plane URL. For new data-plane enrollment, also check the control plane's `multiCluster.trustedDomains` allows the host in `selfUrl`. The trust allowlist is separate from DNS resolution and certificate trust.

Use a certificate trusted by all clients, including IOMETE services that connect to an additional plane. With a private CA, configure the [truststore](./truststore.md) and client trust before enrollment or compute tests.

## Verifying the Result

```shell
curl --fail --show-error --silent --output /dev/null \
  --write-out 'HTTP %{http_code}\n' https://iomete.example.com/
```

For a private CA, add `--cacert <ca-certificate.pem>`. Do not use `--insecure` to decide whether TLS is configured correctly.

Open the control-plane URL in a browser and sign in. Then verify compute access by running `SELECT 1` on the affected data plane. A successful DNS lookup or console response does not verify the separate HTTP/2 route used by compute connections.
