---
title: Access Permissions
description: Permission levels, catalog-level access control, and admin roles for the IOMETE Data Catalog.
sidebar_label: Access Permissions
last_update:
  date: 03/26/2026
  author: Abhishek Pathania
---

import Img from '@site/src/components/Img';

What you can see and do in the Data Catalog depends on two domain bundle permissions, configured through [Domain Authorization](/user-guide/iam/ras/domain-authorization).

- **View Data Catalog**: Browse the Data Catalog and Data Explorer pages, view table metadata, classification tags, and classification requests.
- **Manage Data Catalog**: Everything in View, plus editing table and column descriptions, managing owners, submitting classification tag requests, and canceling your own requests.

Domain owners or administrators grant these permissions per-domain through the Resource Bundle interface. Without explicit assignment, users have no Data Catalog access (zero-trust default).

<Img src="/img/data-catalog/domain-permissions.png" alt="Data Governance permission settings showing View and Manage Data Catalog options" />

## Admin Permissions

Classification tag management (creating, editing, deleting definitions and approving or rejecting requests) requires the `DATA_SECURITY_AND_AUDIT_MANAGER` admin role. See [Classifications](../data-security/classifications) for the full admin workflow.
