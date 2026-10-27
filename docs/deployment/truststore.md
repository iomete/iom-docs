---
title: Custom CA Certificates
sidebar_label: Custom CA Certificates
description: Give the IOMETE services a private certificate authority to trust with one Helm setting.
last_update:
  date: 04/28/2024
  author: Vusal Dadalov
---

## When You Need This

Use this page when an endpoint IOMETE connects to presents a certificate from a private certificate authority (CA): your object storage, the PostgreSQL database, a control plane reached from a data plane, or the IOMETE address the MCP server calls. Endpoints with a certificate from a public CA need none of this.

## Preparing the Files

You need one Kubernetes Secret with two files.

### PEM Bundle

`ca.crt` holds the public root certificates plus your CA certificates, in PEM format. Build it from your system's public bundle:

```bash
cat /etc/ssl/certs/ca-certificates.crt my-ca.crt > ca.crt
```

The path is the public CA bundle of a Debian or Ubuntu system; on other systems use your distribution's bundle. Most IOMETE services trust this file instead of the system bundle, so a file holding only your CA breaks connections to public endpoints.

### Java Keystore

The JVM services cannot read PEM files, so they need the same certificates in a keystore.

:::note Keystore Format
Create the file as a JKS with the password you will put in `jvm.password` (`changeit` below).
:::

### 1. Create `truststore.jks` with Global Root CA Certificates

Use the following command to create a `truststore.jks` file that includes default root CA certificates from the Java default `cacerts` file. This step is crucial to prevent certificate errors when accessing known websites.

```bash showLineNumbers
keytool -importkeystore -srckeystore $JAVA_HOME/lib/security/cacerts \
  -destkeystore truststore.jks -deststoretype JKS -keyalg RSA
```

keytool asks for the destination keystore password twice. On a JDK older than 18 it then asks for the `cacerts` password, which is `changeit`. Use the destination password you chose in `-storepass` below and in `jvm.password`; it must not contain double quotes, backslashes, dollar signs or spaces.

### 2. Add Custom CA Certificate to `truststore.jks`

Once the `truststore.jks` file is created, add your custom CA certificate to it using the following command. Replace `your_ca` with a unique alias for your CA certificate and `your_ca.cer` with the path to your CA certificate file.

```bash
keytool -import -alias your_ca -keystore truststore.jks \
  -file your_ca.cer -storepass changeit -noprompt
```

## Creating the Secret

```bash
kubectl create secret generic iomete-ca --from-file=ca.crt --from-file=truststore.jks -n iomete-system
```

Create the same Secret in every namespace listed under `namespaces` in your Helm values, because the workloads there mount it by name. Compute clusters, Spark jobs and event streams on a remote data plane mount it by the same name too, so create it there as well, with the same files. If you already have a `java-truststore` Secret, add `ca.crt` to it before using it below. `helm install` or `helm upgrade` fails when the Secret in the release namespace lacks a file named in the values; a GitOps render cannot check this, and the copies in the other namespaces are never checked, so verify their keys yourself. If your CA bundle is published as a ConfigMap, for example by trust-manager or OpenShift, copy its PEM into the Secret.

## Configuring the Helm Values

`caCertificates` needs IOMETE 4.0.2 or later.

```yaml
caCertificates:
  existingSecret: iomete-ca
  pemKey: ca.crt
  jvm:
    keystoreKey: truststore.jks
    password: changeit
```

Run `helm upgrade` with your values. The services below read the files at start. The JVM services and Spark pods use the keystore; the nginx gateways, the Postgres clients, Spark Comet and the job orchestrator's S3 client trust the PEM bundle in place of the system roots; the MCP server's calls to IOMETE and the lakehouse agent add it to the system roots. Calls from the AI services to model endpoints do not use this setting yet. Spark pods get the PEM only when `jvm.keystoreKey` is set. Data planes installed with the `iomete-lakehouse-runtime` chart keep `javaTrustStore` (see below); do not set `caCertificates` in that chart's values.

## Rotating the Certificates

Update the Secret in every namespace, then run `helm upgrade` against the cluster. The gateways and the MCP server restart on their own when the bundle changed and the upgrade ran against the cluster (`helm upgrade`, not `helm template` or a GitOps render; after those, restart them yourself). Restart the other services: change any value under `customRestartAnnotations` in your Helm values (for example `customRestartAnnotations: {ca-rotated: "2026-10-27"}`) and run `helm upgrade`, or run `kubectl rollout restart` on them; the job orchestrator worker only restarts through `kubectl rollout restart`. Then stop and start running compute clusters, Spark jobs and event streams from the console.

## Earlier Settings

Before IOMETE 4.0.2, the services read the Secret through `javaTrustStore`, and the MCP server through `services.mcpServer.iometeTls`.

```yaml
javaTrustStore:
  enabled: true
  secretName: java-truststore
  fileName: truststore.jks
  caCertFileName: ca.crt
  password: changeit
```

```yaml
services:
  mcpServer:
    iometeTls:
      existingCaBundleConfigMap: my-ca-bundle
      caBundleKey: ca.crt
```

The `javaTrustStore` Secret is created the same way, under the name in `secretName`. `existingCaBundleConfigMap` names a ConfigMap that holds the PEM under `caBundleKey`. Both settings are deprecated. They still work and are ignored once `caCertificates` is set. Remove them once you no longer install a version without `caCertificates`; they will be removed in a later release. Keep the old Secret until every compute cluster, job and event stream has restarted: those created before the switch still mount it.
