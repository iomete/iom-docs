---
title: Verifying Your Installation
sidebar_label: Verify Installation
description: Run IOMETE's acceptance tests against your install to check that computes, SQL, jobs, data security and users work end to end.
last_update:
  date: 10/23/2026
  author: Maksym Kryvchun
---

IOMETE publishes its acceptance tests with every release. They call the IOMETE API the way the console and client tools do and check each result, so a passing run means your install works end to end.

Run them against a test or staging install, not production. They create their own test objects and remove them when they finish.

## Running the Tests

You need an IOMETE admin account and Docker on a machine that can reach your console address. Use the image tag that matches your IOMETE version.

```bash
mkdir -p reports
docker run --rm -u "$(id -u):$(id -g)" \
  -e IOMETE_BASE_URL=https://iomete.example.com \
  -e IOMETE_ADMIN_PASSWORD=your-admin-password \
  -v "$PWD/reports:/suite/target/karate-reports" \
  iomete.azurecr.io/iomete/api-testing-suite:<your IOMETE version>
```

The run checks that it can reach your install and sign in, runs every test, then removes what it created. A full run takes about 30 to 40 minutes.

## Reading the Results

| Output | Meaning |
| -- | -- |
| `Setup problem: ...` | The run stopped before testing. The line says what to fix, such as the address or the password. |
| `<< PASS`, `<< FAIL`, `<< SKIP` | Each test's result. A skip is not a failure: the feature it checks is turned off or not set up on your install. |
| `reports/karate-summary.html` | The full report. Open it in a browser to see every request and response, with passwords and tokens hidden. |

If you contact IOMETE support about a failure, send the `reports` folder and your IOMETE version.

## Learning More

The [iomete-acceptance-tests](https://github.com/iomete/iomete-acceptance-tests) repository has the tests, the optional tests and their settings, running from source, and troubleshooting.
