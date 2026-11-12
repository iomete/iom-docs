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

The policy matters because Doris's internal ports accept no login at all. These are the frontend's Thrift RPC port `9020`, its edit log port `9010` and every backend port. The Thrift port runs statements as any user named in the request. Without the policy, any pod in the cluster could use these ports. That includes user code in Spark drivers and executors.

The policy selects the compute's pods by their `app.doris.cluster` label. Kubernetes combines policies by allowing anything any of them allows. So another policy that selects Doris pods and allows broad ingress cancels this one. Keep Doris pods out of your own policies, as the [IOMETE namespaces policy](#iomete-namespaces-communication-policy) below does.

If you applied `iomete-ingress-egress` before, re-apply the [version on this page](#iomete-namespaces-communication-policy) in every namespace that has it, then restart the lakehouse agent. To find those namespaces:

```bash
kubectl get networkpolicy --all-namespaces --field-selector metadata.name=iomete-ingress-egress
```

Kubernetes stores a NetworkPolicy on any cluster, but only the cluster's network plugin enforces it. On a cluster that doesn't enforce policies, `kubectl apply` succeeds and the policy has no effect.

These setups enforce NetworkPolicies:

- OpenShift with OVN-Kubernetes, or with OpenShift SDN in its default NetworkPolicy mode.
- k3s, through its embedded policy controller, unless it runs with `--disable-network-policy`.
- AKS with `networkPolicy` set to `azure`, `calico` or `cilium`.
- GKE with Dataplane V2.
- Any cluster that runs Cilium or Calico.

These platforms accept NetworkPolicies but ignore them until you switch enforcement on:

- AKS without a network policy mode (`networkPolicy: none`).
- GKE without Dataplane V2 or the network policy add-on.
- EKS Auto Mode, until you create the `amazon-vpc-cni` ConfigMap in the `kube-system` namespace with `enable-network-policy-controller: "true"`. The ConfigMap doesn't exist by default. It switches enforcement on for the whole cluster. The NodeClass `networkPolicy` field is optional: it only sets the default behavior (`DefaultAllow` or `DefaultDeny`) and can't switch enforcement off.
- Classic EKS, until you set `enableNetworkPolicy: "true"` in the VPC CNI add-on configuration, or install a CNI that enforces policies, such as Calico or Cilium. The `enableNetworkPolicy` setting needs VPC CNI add-on version 1.14 or later.
- Any cluster with a plain network plugin such as Flannel.

A policy is enforced on the node that receives the traffic. So enforcement must be on for every node pool the Doris pods can run on.

### How IOMETE Checks Enforcement

When Doris computes are enabled (`features.doris.enabled: true` in the data plane Helm values), the lakehouse agent checks enforcement itself, at startup and then every 6 hours. It starts a short-lived canary pod in the IOMETE namespace, applies a deny-all policy to it and checks that connections to it are blocked. IOMETE refuses to create or start Doris computes on the data plane unless the latest check says policies are enforced.

The canary runs in the IOMETE namespace, with the lakehouse agent's node selector and tolerations. So the check covers one node and one namespace. Use the [manual check](#checking-that-your-cluster-enforces-networkpolicies) for other node pools. In other namespaces that host Doris computes, make sure no policy of yours allows ingress to Doris pods.

The check reports policies as not enforced when a connection reaches the canary despite the deny-all policy. That happens when the network plugin doesn't enforce policies, or when another policy in the namespace allows traffic to the canary. The canary has the label `iomete.com/network-policy-canary`, so your own policies can leave it out, as the [IOMETE namespaces policy](#iomete-namespaces-communication-policy) does.

To read the latest result:

```bash
kubectl get configmap iomete-network-policy-enforcement -n <iomete-namespace> -o jsonpath='{.data.result\.json}'
```

If the ConfigMap doesn't exist, the check hasn't finished yet or Doris computes aren't enabled.

The result is JSON with these fields:

- `enforced`: `true`, `false`, or `null` when the check couldn't tell.
- `checkedAt`: when the check ran.
- `details`: why the check reached its result.

After you switch enforcement on, or fix a policy that let traffic through, restart the lakehouse agent so it checks again at once instead of waiting up to 6 hours:

```bash
kubectl rollout restart deployment/iomete-lakehouse-agent -n <iomete-namespace>
```

### Checking That Your Cluster Enforces NetworkPolicies

This check works on any cluster. It starts a pod that listens on a port, blocks all traffic to it with a NetworkPolicy, and then tries to connect from another pod. It runs in a throwaway namespace, because other policies in a namespace can allow the traffic and hide the result.

The commands use the `busybox` image. On an air-gapped cluster, use any image you have that can listen on a port.

Run all the steps in the same shell. Step 1 sets the `$SERVER_IP` variable that later steps use.

The result covers only the node the listening pod runs on. On a cluster with more than one node pool, repeat the check for each pool Doris computes can use. Pin the listening pod to a node in that pool by adding `--overrides='{"spec":{"nodeName":"<node-name>"}}'` before the `--` in its `kubectl run` command in step 1, and clean up with step 5 before each repeat.

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
kubectl cluster-info | grep -iE 'control plane|master'
```

Replace `[API_SERVER_IP]` in the YAML file with the actual IP address.

---

## IOMETE Namespaces Communication Policy

This policy ensures that all IOMETE control plane and data plane services can communicate securely across namespaces, using the label `iomete.com/managed: "true"`.

It leaves out three kinds of pods: Jupyter Container pods, Doris compute pods and the lakehouse agent's NetworkPolicy check pod. Kubernetes combines policies by allowing anything any of them allows. A policy that selected these pods would cancel the [Jupyter Containers policy](#jupyter-containers-policy) and the per-compute Doris policy, and would make the lakehouse agent report that the cluster doesn't enforce policies.

Always keep the two `DoesNotExist` entries. Keep the `NotIn` entry only when the Jupyter Containers policy is installed. Without that policy, the `NotIn` entry would leave notebooks matched by no policy and fully open, so remove it.

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
      - key: app.doris.cluster
        operator: DoesNotExist
      - key: iomete.com/network-policy-canary
        operator: DoesNotExist
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

If you applied `iomete-ingress-egress` before, it may still select every pod and cancel this policy. Re-apply the [version on this page](#iomete-namespaces-communication-policy) and check its `podSelector` uses `NotIn jupyterContainer`:

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

Spark compute, Spark jobs and event streams run user code, so this policy keeps them away from the platform's internal services. They can still reach the data plane gateway, the metastore, the lakehouse agent, DNS, the Kubernetes API, and public addresses.

This policy only limits what the workloads can send. It does not lock down the platform pods themselves. For that, also turn on the [Control Plane Policy](#control-plane-policy).

The policy is off by default. To turn it on, set this in your values file and apply it with `helm upgrade`:

```yaml title="values.yaml"
networkPolicies:
  dataPlaneWorkloads:
    enabled: true
```

**Two things to check first.**

- The policy does not apply to pods that `iomete-ingress-egress` also selects, because Kubernetes adds up what matching policies allow and that one allows all egress. If you applied it, exclude the workloads from its `podSelector` by adding `compute`, `sparkApp`, `scheduledSparkApp` and `eventStream` next to `jupyterContainer` in the `NotIn` list, and keep them there when you re-apply it later.
- The policy blocks private addresses (anything in `10.x`, `172.16-31.x` or `192.168.x`), except on the Kubernetes API ports `443` and `6443`, which stay open to any address until you set `kubernetesApi.cidrs`. If your object storage or any data source sits on a private address, list it under `extraEgress`, or Spark jobs will not be able to reach it:

```yaml title="values.yaml"
networkPolicies:
  dataPlaneWorkloads:
    enabled: true
    extraEgress:
      - to:
          - ipBlock:
              cidr: 10.20.30.40/32   # your object storage, database, etc.
        ports:
          - protocol: TCP
            port: 443
```

| Setting | Use it to |
|---|---|
| `enabled` | Turn the policy on. |
| `extraEgress` | Allow a private address the workloads need, such as object storage or a database. |
| `kubernetesApi.cidrs` | Pin the API-server egress to these addresses (the IPs from `kubectl get endpoints kubernetes -n default`). Left empty, ports `443` and `6443` stay open to any address, private ones included. |
| `blockedCidrs` | Change which ranges count as private. Setting it replaces the default list. |
| `monitoringNamespaces` | Allow extra namespaces to scrape Spark metrics, besides `monitoring`. |

If Spark jobs fail after you turn this on, it is almost always a private address missing from `extraEgress`.

### Control Plane Policy

This policy restricts who can reach the platform's own pods. They accept traffic only from each other, your ingress controller, monitoring, and the Kubernetes API's webhook calls. User workloads can reach only the gateway, the metastore and the lakehouse agent.

It has its own switch and is off by default, even when the workloads policy is on:

```yaml title="values.yaml"
networkPolicies:
  controlPlane:
    enabled: true
```

**One thing to check first.** If your ingress controller runs in a namespace that is not listed under `ingressNamespaces`, the console and API become unreachable. Add that namespace before you turn this on.

| Setting | Use it to |
|---|---|
| `enabled` | Turn the policy on. |
| `ingressNamespaces` | List the namespaces your ingress controller runs in. Defaults to `istio-system`, `istio-ingress`, `ingress-nginx`, `openshift-ingress` and `traefik`. |
| `monitoringNamespaces` | Allow extra namespaces to scrape platform metrics, besides `monitoring`. |
| `webhookPorts` | Ports the platform's admission webhooks listen on. They stay open to any source. Defaults to `9443`. |
| `extraIngress` | Add your own ingress rules, for a client that is not covered above. |

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

Ensure that both policies have been applied successfully.

Doris computes can also run in [connected namespaces](./connect-namespace.md). If you apply `iomete-ingress-egress` to a connected namespace, use the same file there, so Doris compute pods stay out of it.

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