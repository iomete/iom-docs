---
title: Custom Java Truststore
sidebar_label: Custom Java Truststore
description: Configure IOMETE to trust a private certificate authority while keeping the default public certificate authorities.
last_update:
  date: 11/07/2026
  author: Vusal Dadalov
---
Use a custom truststore when IOMETE connects to a service whose TLS certificate is issued by your organization's private certificate authority (CA). The truststore tells Java which CAs to trust.

Start with Java's default public CAs and add your private CA. This keeps connections to public services working too. You need `keytool` from a Java installation and your CA certificate in PEM format, `your_ca.crt` in the examples.

The examples use `java-truststore` as the Secret name, `truststore.jks` as the file name, and `changeit` as the truststore password. If you choose different values, use them consistently in the commands and Helm values below. The JKS format also supports older deployments that include Java 8 services.

The examples also use the control-plane release `data-plane`, its service namespace `iomete-system`, and the default data plane's workload namespaces `reporting` and `sales`. The additional data plane `analytics` has the workload namespaces `finance` and `marketing`.

## Creating the Truststore {#steps-to-create-custom-truststore}

### 1. Create `truststore.jks` with Global Root CA Certificates

Copy the default CAs into a new JKS file. Set `JAVA_HOME` to your Java installation; for Java 8, the source file may be under `$JAVA_HOME/jre/lib/security/cacerts` instead. When prompted for the source keystore password, use your installation's `cacerts` password, commonly `changeit`.

```bash showLineNumbers
keytool -importkeystore -srckeystore "$JAVA_HOME/lib/security/cacerts" \
  -destkeystore truststore.jks -deststoretype JKS -deststorepass changeit
```

### 2. Add Custom CA Certificate to `truststore.jks`

Replace `your_ca` with a unique alias and `your_ca.crt` with your CA certificate file:

```bash
keytool -import -alias your_ca -keystore truststore.jks \
  -file your_ca.crt -storepass changeit -noprompt
```

Check that the certificate is there:

```bash
keytool -list -keystore truststore.jks -storepass changeit -alias your_ca
```

The output shows `your_ca` as a `trustedCertEntry`.

### 3. Create a Kubernetes Secret with the `truststore.jks` File {#3-create-a-kubernetes-secret-with-the-truststorejks-file}

#### Building an Optional PEM Bundle

Some IOMETE components can't read JKS. When `javaTrustStore.caCertFileName` is set, they read a PEM bundle from the same Secret instead. Add one if any of these connections uses your CA: TLS connections between the control plane and data planes, made by the gateways and the agent; database connections over TLS from non-Java services such as Prefect; or Spark's native Parquet reader accessing object storage.

Some of these components use the bundle instead of their default list of CAs, so it must contain the public CAs as well as yours:

```bash
cat /etc/ssl/certs/ca-certificates.crt your_ca.crt > ca.crt
```

`/etc/ssl/certs/ca-certificates.crt` is the system CA bundle on Debian and Ubuntu. On Red Hat-based systems, use `/etc/pki/tls/certs/ca-bundle.crt`. `your_ca.crt` must be in PEM format, starting with `-----BEGIN CERTIFICATE-----`. To convert a DER file, run `openssl x509 -inform der -in your_ca.cer -out your_ca.crt`.

#### Creating the Secret in Each Namespace

A pod can mount only Secrets in its own namespace, and Helm doesn't copy Secrets between namespaces. When the control-plane release enables the truststore, its Secret must exist in:

- the service namespace, `iomete-system`;
- each workload namespace of the default data plane, such as `reporting` and `sales`;
- each workload namespace of every additional data plane, such as `finance` and `marketing` on `analytics`. Compute, Spark job and event stream pods use the control-plane release's `javaTrustStore` settings on every data plane.

Create or update the Secret in each of those namespaces. For the control-plane release's namespaces:

```bash showLineNumbers
for ns in iomete-system reporting sales; do
  kubectl create secret generic java-truststore \
    --namespace "$ns" \
    --from-file=truststore.jks \
    --dry-run=client -o yaml | kubectl apply --server-side -f -
done
```

If you built a PEM bundle, add `--from-file=ca.crt` after `--from-file=truststore.jks`. For each namespace, you should see `secret/java-truststore serverside-applied`. The loop uses server-side apply because the two files together are too large for client-side `kubectl apply`, which fails with `metadata.annotations: Too long`.

For an additional data plane, run the same loop in the Kubernetes cluster that hosts it, over its workload namespaces, such as `finance` and `marketing`. If its runtime release enables its own `javaTrustStore` settings, the Secret named there must exist in its service namespace, such as `iomete-analytics`, and in its workload namespaces. Using the same Secret name, file name and password in both releases lets one Secret per namespace serve both.

### 4. Enable the Truststore in IOMETE

Add these settings to the control-plane release's values file:

```yaml title="values.yaml"
javaTrustStore:
  enabled: true
  secretName: java-truststore
  fileName: truststore.jks
  password: changeit
  # caCertFileName: ca.crt # Set only if the Secret also holds the PEM bundle.
```

Upgrade the release with its complete values file and its installed chart version, which `helm list --namespace iomete-system` shows. See [Upgrading the Existing Release](./connect-namespace.md#upgrade-iomete) for details.

```shell
export IOMETE_VERSION="<installed-chart-version>"   # For example, 4.0.1

helm upgrade data-plane iomete/iomete-data-plane-enterprise \
  --namespace iomete-system \
  --version "$IOMETE_VERSION" \
  --values values.yaml \
  --wait
```

The upgrade restarts the IOMETE services whose settings change, so they load the truststore. `iom-cluster` applies the settings to new computes, Spark jobs and event streams, using the values it read when it started. If you only added or changed `caCertFileName`, the upgrade doesn't restart `iom-cluster`, so restart it yourself:

```shell
kubectl rollout restart deployment/iom-cluster --namespace iomete-system
```

Running computes and event streams keep their old settings until you stop and start them. Spark jobs use the new settings from their next run.

To enable the truststore for an additional data plane's own services, add the same `javaTrustStore` settings to its runtime release's values file and upgrade that release, as in [Adding a Namespace to an Additional Data Plane](./connect-namespace.md#adding-a-namespace-to-an-additional-data-plane).

## Replacing Certificates Later

When a CA certificate changes, rebuild `truststore.jks` with steps 1 and 2, and `ca.crt` if you use it. Then run the step 3 loop again. It updates the Secret in place in every namespace you list.

Updating a Secret doesn't reload the certificates in running processes, so restart what uses them. For the control-plane release:

```bash showLineNumbers
kubectl rollout restart deployment --namespace iomete-system \
  --selector app.kubernetes.io/instance=data-plane
kubectl rollout restart statefulset --namespace iomete-system \
  --selector app.kubernetes.io/instance=data-plane
kubectl delete pod iom-spark-connect-driver --namespace iomete-system

for ns in reporting sales; do
  kubectl rollout restart deployment --namespace "$ns" \
    --selector app.kubernetes.io/instance=data-plane
done
```

These commands restart the release's services and its proxy and worker pods in each workload namespace, as rolling updates. The Spark operator starts the deleted `iom-spark-connect-driver` pod again. The release selector leaves out other releases in the same namespaces, such as a PostgreSQL release.

Then stop and start running computes and event streams. Spark jobs use the new certificates from their next run.

For an additional data plane, run the same `rollout restart` commands in its cluster with its release name, such as `--selector app.kubernetes.io/instance=analytics`. Run them in its service namespace, such as `iomete-analytics`, and in its workload namespaces.

Afterward, retry the connection that previously failed and check that the certificate error is resolved.
