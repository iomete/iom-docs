---
title: Verifying Image Signatures
sidebar_label: Verify Images
description: Check that the IOMETE container images you pull were published by IOMETE, using cosign and the IOMETE public key.
last_update:
  date: 08/21/2026
  author: Maksym
---

Every container image in an IOMETE release is signed by IOMETE at publish time. The
signature lets you confirm, before you deploy, that an image came from IOMETE and
has not been altered in transit or in a mirror.

Verification is optional, and nothing about installing IOMETE requires it. It is
worth doing if you mirror our images into your own registry, if your organization
requires a supply chain check before workloads run, or simply before an upgrade.

## What you need

- [cosign](https://docs.sigstore.dev/cosign/system_config/installation/) v3 or newer.
- The IOMETE public key, below. No registry credentials are needed.

## The IOMETE public key

Save this as `iomete.pub`:

```
-----BEGIN PUBLIC KEY-----
PLACEHOLDER: replace with the published IOMETE cosign public key
-----END PUBLIC KEY-----
```

## Verifying an image

Pass the image and the version you are deploying:

```bash
cosign verify --key iomete.pub --insecure-ignore-tlog \
  iomete.azurecr.io/iomete/iom-core:<version>
```

A signed image prints the checks that passed and the signature payload. `--insecure-ignore-tlog`
is expected here: IOMETE signs with its own key rather than through a public
transparency log, so there is no log entry to check, and the flag tells cosign not
to look for one. The signature itself is still verified against the key.

To check more than one image, run the same command for each. The images a version
deploys, with their tags, come from the data plane chart itself:

```bash
helm template iomete-data-plane-enterprise --version <version> \
  --repo https://chartmuseum.iomete.com | grep -o 'image: .*' | sort -u
```

## If verification fails

`no signatures found` usually means either the tag does not exist in the registry
or you are running cosign v2, which looks for signatures in an older layout. Check
the version with `cosign version` first.

A signature that exists but does not verify means the image is not the one IOMETE
published. Do not deploy it, and contact IOMETE support.
