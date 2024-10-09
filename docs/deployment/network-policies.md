---
title: Kubernetes Network Policies
sidebar_label: Network Policies
description: Learn how to configure network policies for IOMETE services in a Kubernetes cluster.
last_update:
  date: 04/28/2024
  author: Vusal Dadalov
---

IOMETE services rely on specific network configurations to function properly in a Kubernetes cluster. These network policies govern how different components communicate securely and efficiently.

## 1. Control Plane Network Policies

### 1.1 IOMETE Spark Operator Webhook Policy

The webhook service plays a critical role in managing IOMETE resources. If resource creation times out or fails, there could be a connectivity issue between the Kubernetes API server and the webhook. This is often due to restrictive network policies that block incoming traffic.

Kubernetes API server requires access to the Spark Operator webhook service. This policy allows controlled ingress traffic to the webhook while restricting external access.

#### Policy Details
- **Namespace**: Control plane
- **File Name**: `iomete-spark-operator.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: iomete-spark-operator
  namespace: <control-plane-namespace>  # Replace with the control plane namespace
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

#### How to Find API Server IP
Use the following command to retrieve the API server IP and update the policy:

```bash
kubectl cluster-info | grep master
```

Replace `[API_SERVER_IP]` in the YAML file with the actual IP address.

---

### 1.2 IOMETE Control Plane and Data Plane Communication

This policy ensures that all IOMETE control plane and data plane services can communicate securely across namespaces, using the label `iomete.com/managed: "true"`.

#### Policy Details
- **Namespace**: Control plane and data plane
- **File Name**: `iomete-ingress-egress.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: iomete-ingress-egress
  namespace: <control-plane-and-data-plane-namespace>  # Replace with the correct namespaces
spec:
  podSelector: {}
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

This policy ensures unrestricted communication between all IOMETE services across managed namespaces.

---

## 2. Applying Network Policies

The deployment of network policies for the control plane and data planes must be handled separately. Below are the specific instructions for each environment to ensure proper communication between IOMETE components.

### 2.1 Applying Network Policies to the Control Plane

The control plane is responsible for key IOMETE services like the Spark Operator webhook and other internal components. The following steps explain how to apply network policies to the control plane.

#### Step-by-Step for Control Plane

1. **Save the policies**:
    - Save both `iomete-spark-operator.yaml` and `iomete-ingress-egress.yaml` files.

2. **Replace placeholders**:
    - In the `iomete-spark-operator.yaml`, replace:
        - `<control-plane-namespace>` with your actual control plane namespace.
        - `[API_SERVER_IP]` with your Kubernetes API server's IP address (obtain this using `kubectl cluster-info | grep master`).
    - In the `iomete-ingress-egress.yaml`, replace:
        - `<control-plane-and-data-plane-namespace>` with the control plane namespace for this step.

3. **Apply the Spark Operator webhook network policy**:

This policy controls the communication between the Spark Operator webhook and the Kubernetes API server.

```bash
kubectl apply -f iomete-spark-operator.yaml
```

4. **Apply the ingress-egress policy for the control plane**:

This policy enables communication between the control plane services.

```bash
kubectl apply -f iomete-ingress-egress.yaml -n <control-plane-namespace>
```

5. **Verify the policies**:
   Ensure that both policies have been applied successfully:

```bash
kubectl get networkpolicies -n <control-plane-namespace>
```

---

### 2.2 Applying Network Policies to Data Planes

The data planes handle specific workloads, and similar network policies need to be applied to ensure communication between data plane services and the control plane.

#### Step-by-Step for Data Planes

1. **Save the ingress-egress policy**:
    - Save the `iomete-ingress-egress.yaml` file if you haven't already.

2. **Replace placeholders**:
    - In `iomete-ingress-egress.yaml`, replace `<control-plane-and-data-plane-namespace>` with the namespace(s) where your data plane services are running.

3. **Apply the ingress-egress policy for each data plane namespace**:

Repeat this step for all data plane namespaces.

```bash
kubectl apply -f iomete-ingress-egress.yaml -n <data-plane-namespace-1>
kubectl apply -f iomete-ingress-egress.yaml -n <data-plane-namespace-2>
```

4. **Verify the policies for each data plane**:
   Ensure the policies have been applied for all data plane namespaces:

```bash
kubectl get networkpolicies -n <data-plane-namespace-1>
kubectl get networkpolicies -n <data-plane-namespace-2>
```
---

## 4. Troubleshooting

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

## 3. Conclusion

Ensuring proper network communication between IOMETE components is essential for the platform's security and performance. By applying the correct network policies and monitoring connectivity, you can maintain a secure and efficient IOMETE deployment.