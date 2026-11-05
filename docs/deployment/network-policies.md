---
title: Kubernetes Network Policies
sidebar_label: Network Policies
description: Learn how to configure network policies for IOMETE services in a Kubernetes cluster.
last_update:
  date: 11/05/2026
  author: Rovshan Baghirov
---

IOMETE services rely on specific network configurations to function properly in a Kubernetes cluster. These network policies govern how different components communicate securely and efficiently.

## NetworkPolicy Enforcement Is a Prerequisite for Doris Computes

Doris computes depend on Kubernetes NetworkPolicy. For each Doris compute, IOMETE creates a policy named `cc-<name>-ingress`. It lets only the compute's own frontend and backend pods, the compute proxy and doris-operator reach the Doris pods.

The policy matters because Doris's internal ports accept no login at all. These are the frontend's Thrift RPC port `9020`, its edit log port `9010` and every backend port. The Thrift port runs statements as any user named in the request. Without the policy, any pod in the data plane namespace could use these ports. That includes user code in Spark drivers and executors.

Kubernetes stores a NetworkPolicy on any cluster, but only the cluster's network plugin enforces it. On a cluster that doesn't enforce policies, `kubectl apply` succeeds and the policy has no effect.

These platforms enforce NetworkPolicies by default:

- OpenShift, with OVN-Kubernetes or OpenShift SDN.
- k3s, through its embedded policy controller, unless it runs with `--disable-network-policy`.
- AKS with `networkPolicy` set to `azure`, `calico` or `cilium`.
- GKE with Dataplane V2.
- Any cluster that runs Cilium or Calico.

These platforms accept NetworkPolicies but ignore them until you switch enforcement on:

- AKS without a network policy mode (`networkPolicy: none`).
- GKE without Dataplane V2 or the network policy add-on.
- EKS Auto Mode, until you create the `amazon-vpc-cni` ConfigMap in the `kube-system` namespace with `enable-network-policy-controller: "true"`. The ConfigMap doesn't exist by default.
- Classic EKS, until you set `enableNetworkPolicy: "true"` in the VPC CNI add-on configuration, or install a CNI that enforces policies, such as Calico or Cilium. The `enableNetworkPolicy` setting needs VPC CNI add-on version 1.14 or later.
- Any cluster with a plain network plugin such as Flannel.

A policy is enforced on the node that receives the traffic. So enforcement must be on for every node pool the Doris pods can run on. On EKS Auto Mode, that means every NodeClass.

IOMETE's data plane agent also checks enforcement itself. It runs a canary pod on the node pool where the agent runs. If the data plane doesn't enforce policies, the agent refuses to place Doris computes on it. The agent repeats the check after a restart. So after you switch enforcement on, restart the lakehouse agent.

### Checking That Your Cluster Enforces NetworkPolicies

This check works on any cluster. It starts a pod that listens on a port, blocks all traffic to it with a NetworkPolicy, and then tries to connect from another pod. It runs in a throwaway namespace, because other policies in a namespace can allow the traffic and hide the result.

The commands use the `busybox` image. On an air-gapped cluster, use any image you have that can listen on a port.

1. Create the namespace and the listening pod. The pod runs the small web server built into `busybox` on port `8080`. The check only tests whether a TCP connection opens, so what the server answers doesn't matter:

   ```bash
   kubectl create namespace np-check
   kubectl run np-server -n np-check --image=busybox:1.36 --labels=app=np-server -- httpd -f -p 8080
   kubectl wait --for=condition=Ready pod/np-server -n np-check --timeout=120s
   SERVER_IP=$(kubectl get pod np-server -n np-check -o jsonpath='{.status.podIP}')
   ```

2. Connect from another pod. This should print `CONNECTED`, which shows the test itself works:

   ```bash
   kubectl run np-client -n np-check --image=busybox:1.36 --rm -i --restart=Never -- \
     sh -c "nc -z -w 3 $SERVER_IP 8080 && echo CONNECTED || echo BLOCKED"
   ```

3. Apply a policy that selects the listening pod and allows no ingress:

   ```bash
   kubectl apply -n np-check -f - <<'YAML'
   apiVersion: networking.k8s.io/v1
   kind: NetworkPolicy
   metadata:
     name: np-check-deny-ingress
   spec:
     podSelector:
       matchLabels:
         app: np-server
     policyTypes:
       - Ingress
   YAML
   ```

4. Wait a few seconds, then run the command from step 2 again. It should now print `BLOCKED`. If it prints `CONNECTED`, your cluster does not enforce NetworkPolicies. Switch enforcement on before you create Doris computes.

5. Clean up:

   ```bash
   kubectl delete namespace np-check
   ```

---

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

The policy only restricts traffic when your cluster's network plugin enforces NetworkPolicies, so [check that](#checking-that-your-cluster-enforces-networkpolicies) before relying on it.

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