---
title: New IOMETE features | September 2022
description: In September 2022, IOMETE released a number of new platform features including new single domain for IOMETE console, a new access control system, pricing module, improved metrics dashboard, billing and role-based integrations.
slug: new-iomete-features-september-2022
authors: fuad
hide_table_of_contents: true
tags: [Release]
image: img/blog/2022-09-21-new-features/september-update-2022.png
coverImage: img/blog/thumbnails/0.png
banner_description: In September 2022, we released a number of new and improved platform features. Check full description in this blog post.
---

In September 2022, we released a number of new and improved platform features:

- New single domain for IOMETE console
- Transparent pricing
- New Access Control System
- New metrics dashboard
- Account switching
- Billing

<!-- truncate -->

## New single domain for IOMETE console

The console became easier to access through one single domain at [app.iomete.com](https://app.iomete.com/signin). The old _\<account_number\>.iomete.com_ domains have been removed. Use your 12-digit account number to sign in.

![sign in to your IOMETE account through one single domain at app.iomete.com](/img/blog/2022-09-21-new-features/iomete-signin.jpeg "sign in to your IOMETE account through one single domain at app.iomete.com
")

## Transparent pricing

We are proud to offer the most transparent pricing in the industry. Users pay the AWS on-demand compute price. No markups. You may select the AWS machine types supported by IOMETE from the interface and view the AWS price for that machine; IOMETE will charge you the same amount as AWS would charge you. Please keep in mind that prices vary depending on your AWS region.

![Transparent pricing](/img/blog/2022-09-21-new-features/transparent-pricing.jpeg)

## New Access Control System

Simply manage IOMETE permissions through the Access Control System. Detailed roles and permissions can be assigned to individuals and groups. Resource-based permissions are also supported. For a smooth transition, we enabled systems default permissions and allocated them to each user.

![IOMETE access control system - roles](/img/blog/2022-09-21-new-features/access-control-system.jpeg "IOMETE access control system - roles")

![IOMETE access control system - permissions](/img/blog/2022-09-21-new-features/create-permission.jpeg "IOMETE access control system - permissions")

## Improved dashboard

The improved dashboard makes it easy to analyze your tasks and discover pain points. With the Grafana tool one can easily optimize spark jobs.

![IOMETE dashboard](/img/blog/2022-09-21-new-features/improved-dashboard.jpeg)

## Switch between accounts

Users can now easily switch between multiple IOMETE accounts. To switch between accounts, click on the profile button found on the left bottom side.

![iomete switch between accounts](/img/blog/2022-09-21-new-features/switch-account.jpeg)

## Billing console

Users can quickly review and download invoices and arrange payment directly from IOMETE’s billing console.

![IOMETE billing console](/img/blog/2022-09-21-new-features/billing-console.jpeg)

## Role-based integrations

We removed “External Storage Integration”. Now we support only role-based and user-based integrations. Reason for this change was that the external type was not recommended by AWS and led to confusion.

## Lakehouse connection

To use lakehouse connection from Database Tools (for example, DataGrip) or Python (SQL Alchemy), you will have to update your connection details. For further details check the [datagrip lakehouse connection](https://iomete.com/docs/datagrip-lakehouse-connection) and [SQL alchemy](https://iomete.com/docs/libraries/drivers/sql-alchemy-driver) driver documentation.

## Smaller updates and fixes

&#150; Superset BI now supports async query executions.

&#150; IOMETE’s built-in SQL Editor was optimized for a better experience.

&#150; UI improvements (Users, Groups, Storage Integrations now moved to Settings).

&#150; Many technical improvements to make your experience even better.
