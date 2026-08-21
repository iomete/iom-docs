---
title: Verifying Image Signatures
sidebar_label: Verify Images
description: Check that the IOMETE container images you pull were published by IOMETE, using cosign and the IOMETE public key.
last_update:
  date: 08/21/2026
  author: Maksym
---

Every image in an IOMETE release is signed. Checking the signature confirms the
image came from IOMETE and has not been altered, for example in a mirror.

This is optional. Installing IOMETE does not require it.

## What you need

- [cosign](https://docs.sigstore.dev/cosign/system_config/installation/) v3 or newer
- The IOMETE public key below, saved as `iomete.pub`

No registry credentials are needed.

```
-----BEGIN PUBLIC KEY-----
PLACEHOLDER: replace with the published IOMETE cosign public key
-----END PUBLIC KEY-----
```

## Check an image

```bash
cosign verify --key iomete.pub --insecure-ignore-tlog \
  iomete.azurecr.io/iomete/iom-core:<version>
```

A signed image prints the checks that passed. `--insecure-ignore-tlog` is expected:
IOMETE signs with its own key instead of a public transparency log, so there is no
log entry to look for. The signature is still checked against the key.

## Check every image in a version

List them from the chart, then run the command above for each:

```bash
helm template iomete-data-plane-enterprise --version <version> \
  --repo https://chartmuseum.iomete.com | grep -o 'image: .*' | sort -u
```

## If a check fails

- **`no signatures found`** - either the tag does not exist, or you are on cosign
  v2, which looks in an older location. Check with `cosign version`.
- **Signature found but does not verify** - the image is not the one IOMETE
  published. Do not deploy it, and contact IOMETE support.
