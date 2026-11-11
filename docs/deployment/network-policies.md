---
title: Kubernetes Network Policies
sidebar_label: Network Policies
description: Learn how to configure network policies for IOMETE services in a Kubernetes cluster.
last_update:
  date: 11/07/2026
  author: Maksym Kryvchun
---

Apply policies to the Kubernetes namespaces that run the services and workloads. A data plane can manage several namespaces, and several planes can share a Kubernetes cluster. A policy in the service namespace does not automatically apply to its workload namespaces.

These examples assume your network plugin enforces [Kubernetes NetworkPolicies](https://kubernetes.io/docs/concepts/services-networking/network-policies/). Policies are additive: traffic allowed by any policy selecting a pod remains allowed. If the source is isolated for egress and the destination for ingress, both sides must allow the connection.

The broad communication policy below permits trusted IOMETE namespaces to reach each other and permits all egress. It is a starting point for connectivity, **not an isolation boundary between domains or data planes**. Review it against your own network requirements before applying it.

Check the target context and the namespaces involved:

```shell
kubectl config current-context
kubectl get namespaces --show-labels
kubectl get networkpolicies --all-namespaces
```

## Required Connections

| Source | Destination | Purpose |
|---|---|---|
| Ingress controller | The plane's gateway pods | Console/API HTTP, gRPC and notebook WebSockets. Service ports 80 and 8081 both target gateway pod port 8080 in the 4.0 charts. Plane-to-plane calls on Service port 8083 target pod port 8083. |
| Kubernetes API server | Spark Operator webhook pods | Admission requests on pod port 9443; the webhook Service exposes port 443. |
| Control-plane services | Additional plane's API address and compute hostname | Enrollment, runtime management and SQL. Remote compute traffic requires TLS port 443 and HTTP/2. |
| Data-plane agent and gateway | Control-plane API address | Enrollment, status reports and authentication. |
| Computes and Spark jobs, from 4.0.2 | The plane's `iomete-lakehouse-agent` pods, port 8080, through the `iom-data-plane-agent` Service | Token and permission checks. The communication policy below allows it while the service and workload namespaces carry the `iomete.com/managed` label. |
| Services and workloads | DNS, Kubernetes API, databases, object storage and configured data sources | Name resolution, workload management and data access. |

The exact destinations depend on whether traffic stays inside the cluster or passes through a load balancer. Check [ingress routing](./configure-ingress.md) and your CNI's address translation behavior when writing IP-based rules. A successful connection to the console does not test all these paths.

## Spark Operator Webhook Policy

The Kubernetes API server must reach the webhook in each plane's **service namespace**. Use the API server source address or CIDR as observed by your CNI. The endpoint in kubeconfig may be a load balancer and is not necessarily the source address of admission traffic.

Ask the Kubernetes administrator for the allowed source ranges, including every control-plane node or managed-service range. Replace the example CIDR below before applying it and add entries if more than one range is needed. For host-networked API servers, enforcement depends on the CNI; verify with an actual admission request.

```yaml title="iomete-spark-operator.yaml"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: iomete-spark-operator
spec:
  podSelector:
    matchLabels:
      service: spark-operator
  ingress:
    - from:
        - ipBlock:
            cidr: 192.0.2.10/32  # Replace with the observed API server source CIDR
      ports:
        - protocol: TCP
          port: 9443
  egress:
    - {}
  policyTypes:
    - Ingress
    - Egress
```

## IOMETE Namespaces Communication Policy

This policy allows ingress from namespaces labeled `iomete.com/managed: "true"` and from the ingress controller namespace. Set the label on the service and workload namespaces that should communicate, using the actual namespace names:

```shell
kubectl label namespace iomete-system iomete.com/managed=true --overwrite
kubectl label namespace <workload-namespace> iomete.com/managed=true --overwrite
```

For an additional data plane, label its service namespace and workload namespaces too. Do not label unrelated namespaces just to bypass a blocked connection. Replace `istio-system` in the policy if your ingress controller runs elsewhere.

The example leaves out Jupyter Container pods so it does not cancel their more restrictive [notebook policy](#jupyter-containers-policy). Use the `NotIn` selector only when that policy is installed. If it is not installed, use `podSelector: {}` instead; otherwise notebook pods may have no ingress isolation at all.

```yaml title="iomete-ingress-egress.yaml"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: iomete-ingress-egress
spec:
  podSelector:
    matchExpressions:
      - key: iomete.com/appType
        operator: NotIn
        values:
          - jupyterContainer
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              iomete.com/managed: "true"
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: istio-system
  egress:
    - {}
  policyTypes:
    - Ingress
    - Egress
```

This policy also blocks a Prometheus that runs in a namespace without the `iomete.com/managed` label, so its scrapes of IOMETE services and Spark drivers time out. If you collect metrics as described in [Monitoring](/resources/user-guide/k8s/monitoring), add the Prometheus namespace to the `from` list, for example `monitoring`:

```yaml
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: monitoring
```

---

## Jupyter Containers Policy

Jupyter Containers run user code. This policy lets only the plane's gateway reach notebooks, and limits notebook egress to DNS, ingress controllers, public addresses and private destinations you explicitly allow.

Up to 4.0.1, the charts don't create this policy, so apply it yourself. From 4.0.2, both charts can create it for you; see [Letting the Chart Manage the Notebook Policy](#letting-the-chart-manage-the-notebook-policy). Otherwise, save it as `iomete-jupyter-containers.yaml` and replace `<iomete-namespace>` with the **service namespace of the plane that owns the notebooks**: `iomete-system` for the default data plane, or `iomete-analytics` for the `analytics` data plane. Adjust the ingress namespaces and private destination exceptions for your network.

```yaml title="iomete-jupyter-containers.yaml"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: iomete-jupyter-containers
spec:
  podSelector:
    matchLabels:
      iomete.com/appType: jupyterContainer
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: <iomete-namespace>
          podSelector:
            matchExpressions:
              - key: app
                operator: In
                values:
                  - iom-gateway
                  - iom-gateway-dp
      ports:
        - protocol: TCP
          port: 8888
  egress:
    # DNS. The blocked ranges are listed too, so cluster DNS stays reachable
    # with the AWS VPC CNI, which otherwise denies every port to an except range.
    - to:
        - ipBlock:
            cidr: 0.0.0.0/0
        - ipBlock:
            cidr: "::/0"
        - ipBlock:
            cidr: 10.0.0.0/8
        - ipBlock:
            cidr: 172.16.0.0/12
        - ipBlock:
            cidr: 192.168.0.0/16
        - ipBlock:
            cidr: 169.254.0.0/16
        - ipBlock:
            cidr: 100.64.0.0/10
        - ipBlock:
            cidr: fc00::/7
        - ipBlock:
            cidr: fe80::/10
      ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53
    - to:
        - namespaceSelector:
            matchExpressions:
              - key: kubernetes.io/metadata.name
                operator: In
                values:
                  - istio-system
                  - istio-ingress
                  - ingress-nginx
                  - openshift-ingress
                  - traefik
    - to:
        - ipBlock:
            cidr: 0.0.0.0/0
            except:
              - 10.0.0.0/8
              - 172.16.0.0/12
              - 192.168.0.0/16
              - 169.254.0.0/16
              - 100.64.0.0/10
        - ipBlock:
            cidr: "::/0"
            except:
              - fc00::/7
              - fe80::/10
```

Apply it in the plane's service namespace and in each of its workload namespaces, as described in [Applying Network Policies](#applying-network-policies). When no other policy grants broader access:

- Only gateway pods in the owning plane's service namespace can open connections to notebook port 8888.
- Notebooks can reach DNS, the listed ingress controller namespaces and public IPv4 and IPv6 addresses.
- Apart from DNS and the ingress controller namespaces, notebooks can't reach private, link-local (cloud metadata) or carrier-grade NAT addresses.

If you applied `iomete-ingress-egress` before, it may still select every pod and cancel this policy. Re-apply the [updated version](#iomete-namespaces-communication-policy) and check its `podSelector` uses `NotIn jupyterContainer`:

```bash
kubectl get networkpolicy iomete-ingress-egress -n <namespace> -o yaml
```

Notebooks connect to compute clusters through your ingress controller. If your controller runs in a namespace that isn't in the policy's list, add it. If your platform host resolves to a private IP, or notebooks need a private data source, add an egress rule for that address to the `egress` list:

```yaml
    - to:
        - ipBlock:
            cidr: 10.20.30.40/32 # internal load balancer or private data source
      ports:
        - protocol: TCP
          port: 443
```

If notebooks open but cannot connect to compute, check the resolved destination and blocked-flow logs. A connection through a private load-balancer IP may need such an IP rule as well as the ingress namespace; namespace selectors alone do not cover every load-balancer path.

<details id="letting-the-chart-manage-the-notebook-policy" style={{scrollMarginTop: "calc(var(--ifm-navbar-height) + 0.5rem)"}}>
<summary>Letting the chart manage the notebook policy (4.0.2 and later)</summary>

From 4.0.2, `iomete-data-plane-enterprise` and `iomete-lakehouse-runtime` have a `networkPolicies.jupyterContainers` block, off by default. 4.0.1 and earlier charts don't. Check the chart version you install, using `iomete/iomete-lakehouse-runtime` for an additional data plane:

```shell
helm show values iomete/iomete-data-plane-enterprise \
  --version <chart-version> | grep -A3 '^networkPolicies:'
```

If the block is there, you can set `networkPolicies.jupyterContainers.enabled: true` in the release's **complete values file** and follow the [upgrade procedure](./life-cycle-management.mdx#upgrade-example). The chart then creates an `iomete-jupyter-containers` policy like the one above in the release's service namespace and in each of its workload namespaces. The comments in the chart's values describe the other settings: `ingressNamespaces`, `blockedCidrs`, `dnsPorts` and `extraEgress`.

Helm doesn't take over a NetworkPolicy it didn't create: while your own `iomete-jupyter-containers` exists, the upgrade fails with `exists and cannot be imported into the current release`. If you applied it yourself, delete it in each namespace just before that upgrade, then confirm the chart created it again in the service namespace and every workload namespace.

</details>

---

## Applying Network Policies

Save and review the policies above before applying them. Substitute the correct API server source ranges, ingress namespace and notebook gateway namespace.

1. Apply the webhook policy in the plane's service namespace, where its Spark Operator runs.
2. Apply the communication policy in the service namespace and every workload namespace that should use it.
3. Apply the notebook policy in the same namespaces. The communication policy leaves notebook pods out, so without the notebook policy they are not isolated.

For example, for the `analytics` data plane, with service namespace `iomete-analytics` and workload namespaces `finance` and `marketing`, and with `<iomete-namespace>` set to `iomete-analytics` in the notebook policy:

```shell
kubectl apply -f iomete-spark-operator.yaml --namespace iomete-analytics
for ns in iomete-analytics finance marketing; do
  kubectl apply -f iomete-ingress-egress.yaml --namespace "$ns"
  kubectl apply -f iomete-jupyter-containers.yaml --namespace "$ns"
done
```

Each command reports the policy as `created`, or `configured` when it already existed. A single application does not cover the data plane as a whole, so check every namespace:

```shell
kubectl get networkpolicies --namespace finance
```

```text
NAME                        POD-SELECTOR                                  AGE
iomete-ingress-egress       iomete.com/appType notin (jupyterContainer)   1m
iomete-jupyter-containers   iomete.com/appType=jupyterContainer           1m
```

Repeat for each plane, with its own namespaces and its own notebook policy file. Keep the policy files in the configuration management system that owns these resources.

## Troubleshooting

Inspect the policies and the labels they select:

```shell
kubectl get networkpolicies --namespace <namespace>
kubectl describe networkpolicy <policy-name> --namespace <namespace>
kubectl get pods --namespace <namespace> --show-labels
```

Then check the actual operation that failed:

- **Slow pod creation or Spark pods missing settings:** the API server calls the operator's webhook for every pod created in the plane's namespaces. When it can't reach the webhook, each pod creation waits for the 30-second webhook timeout and then continues without the webhook's changes, so there is no admission error to inspect. Start a test compute through IOMETE and check CNI flow logs, or API server logs where you have them, for failed calls from the API server to the operator's pod port 9443. `kubectl cluster-info` only reports the API endpoint; it does not test the reverse connection to the webhook.
- **Console or API unavailable:** verify ingress-controller access to the gateway, including source namespace labels and any existing egress isolation on the controller.
- **Plane disconnected:** verify both directions of the plane-to-plane API connection. Same-cluster namespace rules do not allow cross-cluster traffic by themselves.
- **SQL fails on a connected plane:** check the control plane's egress to the compute hostname on TLS port 443, TLS trust and HTTP/2 routing.
- **Notebook cannot reach compute or data:** inspect its resolved destination and add the specific required egress rule. Confirm that another broad policy has not removed notebook isolation.
- **Prometheus targets down:** if Prometheus runs in a namespace without the `iomete.com/managed` label, add that namespace to the communication policy, as described in [IOMETE Namespaces Communication Policy](#iomete-namespaces-communication-policy).

Test allowed and denied connections after each policy change. A NetworkPolicy object being accepted by Kubernetes does not prove that the CNI enforces the intended restrictions.
