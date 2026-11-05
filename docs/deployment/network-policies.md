---
title: Kubernetes Network Policies
sidebar_label: Network Policies
description: Learn how to configure network policies for IOMETE services in a Kubernetes cluster.
last_update:
  date: 11/05/2026
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
| Ingress controller | The plane's gateway pods | Console/API HTTP, gRPC and notebook WebSockets. Service ports 80 and 8081 both target gateway pod port 8080 in the 4.0 charts. |
| Kubernetes API server | Spark Operator webhook pods | Admission requests on pod port 9443; the webhook Service exposes port 443. |
| Control-plane services | Additional plane's API address and compute hostname | Enrollment, runtime management and SQL. Remote compute traffic requires TLS port 443 and HTTP/2. |
| Data-plane agent and gateway | Control-plane API address | Enrollment, status reports and authentication. |
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

For an additional plane, include its service namespace and managed workload namespaces. Do not label unrelated namespaces just to bypass a blocked connection. Replace `istio-system` in the policy if your ingress controller runs elsewhere.

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

---

## Jupyter Containers Policy

Jupyter Containers run user code. Their policy allows gateway access to the notebook and limits notebook egress to DNS, ingress controllers, public addresses and explicitly permitted private destinations.

First check whether your **installed chart version** offers `networkPolicies.jupyterContainers`. Use the enterprise chart for the control plane's default plane, or `iomete/iomete-lakehouse-runtime` for an additional plane:

```shell
helm show values iomete/iomete-data-plane-enterprise \
  --version <installed-chart-version> > installed-chart-defaults.yaml
```

Look for the `networkPolicies.jupyterContainers` block in that file. If it is absent, adding the key to Helm values has no effect; use the manual policy below or an approved chart upgrade. If the setting is available, enable it in the release's **complete values file**, preserving all existing namespaces, then follow the [upgrade procedure](./life-cycle-management.mdx#upgrade-example):

```yaml title="values.yaml"
networkPolicies:
  jupyterContainers:
    enabled: true
```

The chart creates the policy in its service namespace and every namespace in `namespaces`, provided Jupyter Containers are enabled. Confirm the policy exists in each namespace after the upgrade.

When no other policy grants broader access:

- Only gateway pods in the owning plane's service namespace can initiate connections to notebook port 8888.
- Notebooks can reach DNS, the configured ingress controller namespaces and public IPv4/IPv6 addresses.
- Egress to the configured blocked CIDRs is denied except for DNS, ingress-controller access and explicit `extraEgress` entries. Review those ranges and exceptions for your network.

If you applied `iomete-ingress-egress` before, it may still select every pod and cancel this policy. Re-apply the [updated version](#iomete-namespaces-communication-policy) and check its `podSelector` uses `NotIn jupyterContainer`:

```bash
kubectl get networkpolicy iomete-ingress-egress -n <namespace> -o yaml
```

Notebooks connect to compute clusters through your ingress controller. The policy allows the `istio-system`, `istio-ingress`, `ingress-nginx`, `openshift-ingress` and `traefik` namespaces. If your controller runs elsewhere, or your platform host resolves to a private IP, adjust the policy in `values.yaml`:

```yaml title="values.yaml"
networkPolicies:
  jupyterContainers:
    ingressNamespaces:
      - my-ingress
    extraEgress:
      - to:
          - ipBlock:
              cidr: 10.20.30.40/32 # internal load balancer or private data source
        ports:
          - protocol: TCP
            port: 443
```

| Setting | Use it to |
|---|---|
| `ingressNamespaces` | List the namespaces of the ingress controller serving the platform host. Setting it replaces the default list. |
| `extraEgress` | Allow an internal address notebooks need. |
| `blockedCidrs` | Change which IPv4 and IPv6 ranges count as internal. |
| `dnsPorts` | Change the ports notebooks use for DNS, for example add `5353` on OpenShift. |
| `enabled` | Turn the policy on. |

If notebooks open but cannot connect to compute, check the resolved destination and blocked-flow logs. A connection through a private load-balancer IP may need an `extraEgress` IP rule as well as `ingressNamespaces`; namespace selectors alone do not cover every load-balancer path.

To manage the policy yourself, save it as `iomete-jupyter-containers.yaml`. Replace `<iomete-namespace>` with the **service namespace of the plane that owns these notebooks**, and adjust the ingress namespaces and private destination exceptions for your network. Apply it separately in that service namespace and each managed workload namespace. Do not also enable chart ownership for the same policy without an explicit ownership migration.

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
    - ports:
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

```bash
kubectl apply -f iomete-jupyter-containers.yaml -n <iomete-namespace>
kubectl apply -f iomete-jupyter-containers.yaml -n <spark-namespace>
```

---

## Applying Network Policies

Save and review the policies above before applying them. Substitute the correct API server source ranges, ingress namespace and notebook gateway namespace.

1. Apply the webhook policy in the plane's service namespace, where its Spark Operator runs.
2. Apply the communication policy in the service namespace and every workload namespace that should use it.
3. If you excluded notebooks from the communication policy, verify that their restrictive policy is installed in every affected namespace.

```shell
kubectl apply -f iomete-spark-operator.yaml --namespace <service-namespace>
kubectl apply -f iomete-ingress-egress.yaml --namespace <service-namespace>
kubectl apply -f iomete-ingress-egress.yaml --namespace <workload-namespace>
```

Repeat the workload command for each namespace; a single application does not cover the data plane as a whole. Keep the policy files in the configuration management system that owns these resources.

## Troubleshooting

Inspect the policies and the labels they select:

```shell
kubectl get networkpolicies --namespace <namespace>
kubectl describe networkpolicy <policy-name> --namespace <namespace>
kubectl get pods --namespace <namespace> --show-labels
```

Then check the actual operation that failed:

- **Webhook timeout:** create or update a test compute through IOMETE, inspect the admission error and check CNI flow logs for API-server traffic to the operator's pod port 9443. `kubectl cluster-info` only reports the API endpoint; it does not test the reverse connection to the webhook.
- **Console or API unavailable:** verify ingress-controller access to the gateway, including source namespace labels and any existing egress isolation on the controller.
- **Plane disconnected:** verify both directions of the plane-to-plane API connection. Same-cluster namespace rules do not allow cross-cluster traffic by themselves.
- **SQL fails on a connected plane:** check the control plane's egress to the compute hostname on TLS port 443, TLS trust and HTTP/2 routing.
- **Notebook cannot reach compute or data:** inspect its resolved destination and add the specific required egress rule. Confirm that another broad policy has not removed notebook isolation.

Test allowed and denied connections after each policy change. A NetworkPolicy object being accepted by Kubernetes does not prove that the CNI enforces the intended restrictions.
