---
title: Kubernetes Setup Guide
sidebar_label: Kubernetes Setup Guide
description: Kubernetes cluster recommendations for IOMETE deployments
last_update:
  date: 08/12/2025
  author: Vusal Dadalov
---

## Kubernetes Setup for IOMETE

IOMETE requires a Kubernetes cluster to run. For production environments, use your company's existing production-ready Kubernetes cluster. If you don't have access to a Kubernetes cluster or need something quick for demos and proof-of-concepts, we recommend [k3s](https://docs.k3s.io/) Kubernetes Cluster.

## Why k3s?

k3s is perfect for getting started because it's:  
- Lightweight - Uses minimal resources  
- Fast - Installs easily  

## When to use k3s
IOMETE recommends [k3s](https://docs.k3s.io/) for:  
1. Demos and POCs - Quick setup for evaluations  
2. Development and testing  
3. Small and non-critical production workloads   

## Quick single-node installation

**Critical:** firewall rules to set before install. See: https://docs.k3s.io/installation/requirements

Install k3s with a single command:
```bash
curl -sfL https://get.k3s.io | sh -

# Verify: 
kubectl get nodes
```

See: https://docs.k3s.io/quick-start
