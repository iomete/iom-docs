---
title: Custom Java Truststore
sidebar_label: Custom Java Truststore
description: Configure IOMETE to trust a private certificate authority while keeping the default public certificate authorities.
last_update:
  date: 11/06/2026
  author: Vusal Dadalov
---
Use a custom truststore when IOMETE connects to a service whose TLS certificate is issued by your organization's private certificate authority (CA). The truststore tells Java which CAs to trust.

Start with Java's default public CAs and add your private CA. This keeps connections to public services working too. You need `keytool` from a Java installation and your CA certificate file.

The examples use `java-truststore` as the Secret name, `truststore.jks` as the file name, and `changeit` as the truststore password. If you choose different values, use them consistently in the commands and Helm configuration below. The JKS format also supports older deployments that include Java 8 services.

### 1. Create `truststore.jks` with Global Root CA Certificates

Copy the default CAs into a new JKS file. Set `JAVA_HOME` to your Java installation; for Java 8, the source file may be under `$JAVA_HOME/jre/lib/security/cacerts` instead. When prompted for the source keystore password, use your installation's `cacerts` password, commonly `changeit`.

```bash showLineNumbers
keytool -importkeystore -srckeystore "$JAVA_HOME/lib/security/cacerts" \
  -destkeystore truststore.jks -deststoretype JKS -deststorepass changeit
```

### 2. Add Custom CA Certificate to `truststore.jks`

Replace `your_ca` with a unique alias and `your_ca.cer` with your CA certificate file:

```bash
keytool -import -alias your_ca -keystore truststore.jks \
  -file your_ca.cer -storepass changeit -noprompt
```

### 3. Create a Kubernetes Secret with the `truststore.jks` File {#3-create-a-kubernetes-secret-with-the-truststorejks-file}

Create or update the Secret in the namespace containing the IOMETE services:

```bash showLineNumbers
kubectl create secret generic java-truststore \
  --namespace iomete-system \
  --from-file=truststore.jks \
  --dry-run=client -o yaml | kubectl apply -f -
```

Repeat the command for **every workload namespace** in the `namespaces` list of your values file, replacing `iomete-system` with that namespace. For example, use `--namespace finance` for a new `finance` namespace. Kubernetes reads Secrets from the pod's own namespace; Helm does not copy them.

<details>
<summary>Including a PEM bundle for services that do not read JKS</summary>

If you configured `javaTrustStore.caCertFileName`, include that PEM file in the same Secret as well, for example by adding `--from-file=ca.crt`. The PEM bundle should contain the public CAs and your private CA, just like the JKS file. Services that cannot read JKS use this file.

</details>

### 4. Enable the Truststore in IOMETE

Add these settings to your existing Helm values file:

```yaml title="values.yaml"
javaTrustStore:
  enabled: true
  secretName: java-truststore
  fileName: truststore.jks
  password: changeit
  # caCertFileName: ca.crt # Set only if you also included this PEM bundle.
```

Upgrade your existing release with its complete values file and installed chart version. For the default data plane, follow the [existing-release upgrade example](./connect-namespace.md#4-upgrading-the-existing-release). Existing computes must be stopped and started to pick up the truststore configuration.

For separately installed data planes, create the Secret wherever the affected services or Spark workloads run. Spark workloads can reference the control plane's truststore settings, so check those settings too.

### Replacing Certificates Later

Update the Secret in every namespace that uses it, including its PEM file if configured. Restart the services that use the truststore, and stop and start affected computes: updating a Secret alone does not reload the certificates in an already running Java process.

Afterward, retry the connection that previously failed and check that the certificate error is resolved.
