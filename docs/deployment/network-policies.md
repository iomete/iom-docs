---
title: Kubernetes Network Policies
sidebar_label: Network Policies
description: Learn how to configure network policies for IOMETE services in a Kubernetes cluster.
last_update:
  date: 10/12/2026
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
kubectl cluster-info | grep master
```

Replace `[API_SERVER_IP]` in the YAML file with the actual IP address.

---

## IOMETE Namespaces Communication Policy

This policy ensures that all IOMETE control plane and data plane services can communicate securely across namespaces, using the label `iomete.com/managed: "true"`.

It leaves out Jupyter Container pods. Kubernetes combines policies by allowing anything any of them allows, so a policy that selects every pod would cancel out the [Jupyter Containers policy](#jupyter-containers-policy).

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

Jupyter Containers run user code, so the data plane Helm chart installs a policy named `iomete-jupyter-containers` in the data plane namespace and every Spark namespace. With it:

- Only the IOMETE gateway can reach notebooks.
- Notebooks can reach DNS, your ingress controller and the internet.
- Notebooks can't reach private, link-local (cloud metadata) or carrier-grade NAT addresses.

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
| `blockedCidrs` | Change which address ranges count as internal. |
| `enabled` | Turn the policy off. |

If notebooks open but can't connect to a compute cluster, add your ingress controller's namespace to `ingressNamespaces`.

---

## Applying Network Policies

The following steps explain how to apply network policies to IOMETE control plane and data plane namespaces.

1. Save both `iomete-spark-operator.yaml` and `iomete-ingress-egress.yaml` files.
2. In the `iomete-spark-operator.yaml`, replace: `[API_SERVER_IP]` with your Kubernetes API server's IP address (obtain this using `kubectl cluster-info | grep master`).
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
kubectl cluster-info | grep master
```

3. **Connectivity Issues**:
If errors persist, review your network policies and consult with your networking team or system administrator for potential misconfigurations.

---

## Conclusion

Ensuring proper network communication between IOMETE components is essential for the platform's security and performance. By applying the correct network policies and monitoring connectivity, you can maintain a secure and efficient IOMETE deployment.