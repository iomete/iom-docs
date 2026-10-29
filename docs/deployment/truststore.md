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

## MCP Server

From IOMETE 4.1, the MCP server reads its CA certificates from the `caCertificates` Helm setting. Other services move to it over time; until then they keep using the `javaTrustStore` Helm setting (`javaTrustStore.enabled: true`), which reads the Secret from step 3, so keep that set too.

Add a PEM bundle with the public root CAs plus your own to the `java-truststore` Secret from step 3 (the path of the public bundle depends on your system). `your_ca.crt` must be PEM; convert a DER `.cer` with `openssl x509 -inform der -in your_ca.cer -out your_ca.crt`.

If you already set `javaTrustStore.caCertFileName` and that file holds the public root CAs plus your own, skip this step and set `pemKey` to that key.

If `truststore.jks` is no longer at hand, copy it from the cluster first:

```bash
kubectl get secret java-truststore -n iomete-system \
  -o jsonpath='{.data.truststore\.jks}' | base64 -d > truststore.jks
```

Then recreate the Secret. If it holds other files, add a `--from-file` for each:

```bash showLineNumbers
cat /etc/ssl/certs/ca-certificates.crt your_ca.crt > ca.crt
kubectl delete secret java-truststore -n iomete-system
kubectl create secret generic java-truststore \
  --from-file=truststore.jks --from-file=ca.crt -n iomete-system
```

Whenever you run step 3 again, add `--from-file=ca.crt` to it, or the MCP server fails at its next restart. If `javaTrustStore` is not enabled, a Secret with only `ca.crt` is enough: create it with `kubectl create secret generic <name> --from-file=ca.crt -n iomete-system` and set `existingSecret` to its name.

Then point `caCertificates` at it in your Helm values:

```yaml
caCertificates:
  existingSecret: java-truststore
  pemKey: ca.crt
```

The bundle must hold every private CA the MCP server talks to: the IOMETE endpoint and, with `database.ssl.enabled: true`, the CA that signs your database certificate, also when it is a cloud provider's CA. The MCP server then verifies the database certificate, even with `database.ssl.mode: require`.

After you change the bundle, a `helm upgrade` restarts the MCP server. If you deploy manifests rendered with `helm template`, restart it yourself:

```bash
kubectl rollout restart deployment/iom-mcp-server -n iomete-system
```

`services.mcpServer.iometeTls` is deprecated. It still works and is ignored once `caCertificates` is set. Keep it while you may still install a version older than 4.1: older versions ignore `caCertificates`. If your bundle is in a ConfigMap or inline in `iometeTls`, copy the PEM into the Secret as above and add the public root CAs: `caCertificates` reads only a Secret.

## Conclusion

By following these steps, you will create a `truststore.jks` file that includes both global root CA certificates and your custom CA certificate, and, for the MCP server, a PEM bundle in the same Secret, and you will securely store it as a Kubernetes secret for use in IOMETE platform.
