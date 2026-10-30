---
title: Custom Java Truststore
sidebar_label: Custom Java Truststore
description: Create and use a `truststore.jks` file with custom CA certificates to prevent certificate errors when accessing known websites.
last_update:
  date: 04/28/2024
  author: Vusal Dadalov
---
**Creating and Using `truststore.jks` with Custom CA Certificates**

This documentation provides step-by-step instructions to create and use a `truststore.jks` file with custom CA certificates. This process ensures that your `truststore.jks` file includes global root CA certificates as well as your custom CA certificate, preventing certificate errors when accessing known websites like GitHub and Google.

## Steps to create custom truststore

:::note Ensuring Compatibility with Java 8
It is important to ensure that the `truststore.jks` file is **compatible with Java 8**, as some of the services still run on Java 8 environments.
:::

### 1. Create `truststore.jks` with Global Root CA Certificates

Use the following command to create a `truststore.jks` file that includes default root CA certificates from the Java default `cacerts` file. This step is crucial to prevent certificate errors when accessing known websites.

```bash showLineNumbers
keytool -importkeystore -srckeystore $JAVA_HOME/lib/security/cacerts \
  -destkeystore truststore.jks -deststoretype JKS -keyalg RSA
```

### 2. Add Custom CA Certificate to `truststore.jks`

Once the `truststore.jks` file is created, add your custom CA certificate to it using the following command. Replace `your_ca` with a unique alias for your CA certificate and `your_ca.cer` with the path to your CA certificate file.

```bash
keytool -import -alias your_ca -keystore truststore.jks \
  -file your_ca.cer -storepass changeit -noprompt
```

### 3. Create a Kubernetes Secret with the `truststore.jks` File

After creating the `truststore.jks` file with your custom CA certificate, create a Kubernetes secret to use this truststore in IOMETE platform. Use the following commands to delete any existing secret and create a new one:

```bash showLineNumbers
kubectl delete secret java-truststore -n iomete-system
kubectl create secret generic java-truststore \
  --from-file=truststore.jks -n iomete-system
```

## Setting CA Certificates for the MCP Server

From IOMETE 4.1, the MCP server reads its CA certificates from the `caCertificates` Helm setting. Other services move to it over time; until then they keep using the `javaTrustStore` Helm setting (`javaTrustStore.enabled: true`), which reads the Secret from step 3, so keep that set too.

The MCP server needs a PEM bundle with the public root CAs plus every private CA it connects to. That includes your database's CA when `database.ssl.enabled` is `true`, even if a cloud provider issued it.

If `javaTrustStore.caCertFileName` already names a file with this bundle, skip to the Helm values below and set `pemKey` to that name.

Otherwise, save your CAs as PEM in `your_ca.crt` (convert a DER `.cer` with `openssl x509 -inform der -in your_ca.cer -out your_ca.crt`). Then build the bundle, using your system's public bundle path:

```bash
cat /etc/ssl/certs/ca-certificates.crt your_ca.crt > ca.crt
```

If `javaTrustStore` isn't enabled, put the bundle in its own Secret with `kubectl create secret generic <name> --from-file=ca.crt -n iomete-system`.

If it's enabled, add the bundle to the `java-truststore` Secret from step 3. Recreating the Secret drops every file you don't pass again, so list them first with `kubectl describe secret java-truststore -n iomete-system`. Copy back any file you no longer have, as here for `truststore.jks`:

```bash
kubectl get secret java-truststore -n iomete-system \
  -o jsonpath='{.data.truststore\.jks}' | base64 -d > truststore.jks
```

Then recreate the Secret with every listed file plus `ca.crt`:

```bash showLineNumbers
kubectl delete secret java-truststore -n iomete-system
kubectl create secret generic java-truststore \
  --from-file=truststore.jks --from-file=ca.crt -n iomete-system
```

Whenever you rerun step 3, pass `ca.crt` and the other files too, or the MCP server fails at its next restart.

Then point `caCertificates` at the Secret in your Helm values (`existingSecret` is the Secret's name):

```yaml
caCertificates:
  existingSecret: java-truststore
  pemKey: ca.crt
```

With `database.ssl.enabled: true`, the MCP server checks the database certificate against this bundle, even with `database.ssl.mode: require`.

After you change the bundle, a `helm upgrade` restarts the MCP server. If you deploy manifests rendered with `helm template`, restart it yourself:

```bash
kubectl rollout restart deployment/iom-mcp-server -n iomete-system
```

`services.mcpServer.iometeTls` is deprecated. It still works and is ignored once `caCertificates` is set. Keep it while you may still install a version older than 4.1: older versions ignore `caCertificates`. If your bundle is in a ConfigMap or inline in `iometeTls`, copy the PEM into the Secret as above and add the public root CAs: `caCertificates` reads only a Secret.

## Conclusion

By following these steps, you will create a `truststore.jks` file that includes both global root CA certificates and your custom CA certificate, plus a PEM bundle for the MCP server, and you will securely store them as a Kubernetes secret for use in IOMETE platform.
