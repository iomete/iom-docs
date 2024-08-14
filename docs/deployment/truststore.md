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

## Conclusion

By following these steps, you will create a `truststore.jks` file that includes both global root CA certificates and your custom CA certificate, and you will securely store it as a Kubernetes secret for use in IOMETE platform.
