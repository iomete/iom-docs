---
title: Kubernetes Network Policies
sidebar_label: Network Policies
description: Learn how to configure network policies for IOMETE services in a Kubernetes cluster.
last_update:
  date: 10/23/2026
  author: Maksym Kryvchun
---

IOMETE services rely on specific network configurations to function properly in a Kubernetes cluster. These network policies govern how different components communicate securely and efficiently.

## Spark Operator Webhook Policy

The webhook service plays a critical role in managing IOMETE resources. If resource creation times out or fails, there could be a connectivity issue between the Kubernetes API server and the webhook. This is often due to restrictive network policies that block incoming traffic.

Kubernetes API server requires access to the Spark Operator webhook service. This policy allows controlled ingress traffic to the webhook while restricting external access.

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
            cidr: [API_SERVER_IP]/32  # Replace with your API server's IP
  egress:
    - {}
  policyTypes:
    - Ingress
    - Egress
```

**How to Find API Server IP**
Use the following command to retrieve the API server IP and update the policy:

```bash
kubectl cluster-info | grep -iE 'control plane|master'
```

Replace `[API_SERVER_IP]` in the YAML file with the actual IP address.

---

## IOMETE Namespaces Communication Policy

This policy ensures that all IOMETE control plane and data plane services can communicate securely across namespaces, using the label `iomete.com/managed: "true"`.

It leaves out Jupyter Container pods. Kubernetes combines policies by allowing anything any of them allows, so a policy that selects every pod would cancel out the [Jupyter Containers policy](#jupyter-containers-policy).

Use the `NotIn` selector below only when the Jupyter Containers policy is installed. Without it, notebooks match no policy and become fully open, so keep `podSelector: {}` instead.

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
  egress:
    - {}
  policyTypes:
    - Ingress
    - Egress
```

---

## Jupyter Containers Policy

Jupyter Containers run user code, so the data plane Helm chart can install a policy named `iomete-jupyter-containers` in the data plane namespace and every Spark namespace. It's off by default. To turn it on, set this in `values.yaml` and run the Helm upgrade:

```yaml title="values.yaml"
networkPolicies:
  jupyterContainers:
    enabled: true
```

The policy only restricts traffic when your cluster's network plugin enforces NetworkPolicies, so check that before relying on it.

With it:

- Only the IOMETE gateway can reach notebooks.
- Notebooks can reach DNS, your ingress controller and the internet over IPv4 and IPv6.
- Apart from DNS, your ingress controller and any `extraEgress` entries, notebooks can't reach private, link-local (cloud metadata) or carrier-grade NAT addresses.

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

If notebooks open but can't connect to a compute cluster, add your ingress controller's namespace to `ingressNamespaces`.

To apply the policy yourself instead of through the chart, save it as `iomete-jupyter-containers.yaml`, replace `<iomete-namespace>` with the data plane namespace, and apply it to the data plane namespace and every Spark namespace:

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

## Data Plane Workloads Policy

Spark compute, Spark jobs and event streams run user code too. This policy keeps them away from the platform's internal services: they reach the control plane only through the data plane gateway, plus the metastore, the lakehouse agent, DNS, and addresses outside the blocked ranges. The control plane gets a matching policy that accepts data plane traffic only through the gateway.

The chart manages both policies. They are off by default. Turn them on under `networkPolicies.dataPlaneWorkloads` in your values file:

```yaml title="values.yaml"
networkPolicies:
  dataPlaneWorkloads:
    enabled: true
    kubernetesApi:
      cidrs:
        - <api-server-ip>/32   # required: Spark drivers create executors through the API server
      ports: [443, 6443]       # override only if your API server uses a different port
    extraEgress:
      # Example: allow object storage or the activity-monitoring Postgres on a private address.
      - to:
          - ipBlock:
              cidr: 10.20.30.40/32
        ports:
          - protocol: TCP
            port: 443
```

Find the API server address with `kubectl get endpoints kubernetes`. Without `kubernetesApi.cidrs`, Spark drivers cannot start their executors and jobs fail. Apply the change with `helm upgrade`.

| Setting | Use it to |
|---|---|
| `enabled` | Turn the policies on. |
| `kubernetesApi.cidrs` | List the Kubernetes API server addresses. Required when enabled, so drivers can create executors. |
| `kubernetesApi.ports` | Override the API server ports if they aren't the default `443` and `6443`. |
| `extraEgress` | Allow a private address the workloads need, such as object storage or the activity-monitoring Postgres. |
| `blockedCidrs` | Change which ranges count as internal. Setting it replaces the default list. |
| `monitoringNamespaces` | List extra namespaces allowed to scrape Spark metrics, besides `monitoring`. |
| `dnsPorts` | Change the ports used for DNS. |

If Spark jobs fail to launch executors after turning this on, check that `kubernetesApi.cidrs` covers every API server address and that `kubernetesApi.ports` matches your cluster. If a job cannot reach a private data source, add it to `extraEgress`.

---

## Applying Network Policies

The following steps explain how to apply network policies to IOMETE control plane and data plane namespaces.

1. Save both `iomete-spark-operator.yaml` and `iomete-ingress-egress.yaml` files.
2. In the `iomete-spark-operator.yaml`, replace: `[API_SERVER_IP]` with your Kubernetes API server's IP address (obtain this using `kubectl cluster-info | grep -iE 'control plane|master'`).
3. Apply the policies using `kubectl` to the respective namespaces:
```bash
kubectl apply -f iomete-spark-operator.yaml -n <iomete-namespace>
kubectl apply -f iomete-ingress-egress.yaml -n <iomete-namespace>
```

Ensure that both policies have been applied successfully

---

## Troubleshooting

If issues arise, follow these troubleshooting steps:

1. **Verify Policy Application**:
Ensure the policies are correctly applied:
```bash
kubectl get networkpolicies -n <namespace>
```

2. **Check API Server Access**:
Confirm that the API server can reach the webhook:
```bash
kubectl cluster-info | grep -iE 'control plane|master'
```

3. **Connectivity Issues**:
If errors persist, review your network policies and consult with your networking team or system administrator for potential misconfigurations.

---

## Conclusion

Ensuring proper network communication between IOMETE components is essential for the platform's security and performance. By applying the correct network policies and monitoring connectivity, you can maintain a secure and efficient IOMETE deployment.