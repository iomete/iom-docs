---
slug: new-iomete-features-september-2022
title: New iomete features | September 2022
authors: fuad
hide_table_of_contents: true
tags: [Release]
image: /blog/2022-09-21-new-features/thumb.jpeg
---

<head>
  <title>New iomete features | September 2022 | iomete blog</title>
  <meta name="robots" content="noindex, nofollow" />
  <meta name="googlebot" content="noindex"/>
</head>

In September 2022, we released a number of new and improved platform features:

- New single domain for iomete console
- Transparent pricing
- New Access Control System
- New metrics dashboard
- Account switching
- Billing

<!-- truncate -->

## New single domain for iomete console
The console became easier to access through one single domain at [app.iomete.com](https://app.iomete.com/signin). The old *<account_number>.iomete.com* domains have been removed. Use your 12-digit account number to sign in.

![sign in to your iomete account through one single domain at app.iomete.com](/blog/2022-09-21-new-features/iomete-signin.jpeg "sign in to your iomete account through one single domain at app.iomete.com
")


## Transparent pricing
We are proud to offer the most transparent pricing in the industry. Users pay the AWS on-demand compute price. No markups. You may select the AWS machine types supported by iomete from the interface and view the AWS price for that machine; iomete will charge you the same amount as AWS would charge you. Please keep in mind that prices vary depending on your AWS region.

![Transparent pricing](/blog/2022-09-21-new-features/transparent-pricing.jpeg)


## New Access Control System
Simply manage iomete permissions through the Access Control System. Detailed roles and permissions can be assigned to individuals and groups. Resource-based permissions are also supported. For a smooth transition, we enabled systems default permissions and allocated them to each user.

![iomete access control system - roles](/blog/2022-09-21-new-features/access-control-system.jpeg "iomete access control system - roles")

![iomete access control system - permissions](/blog/2022-09-21-new-features/create-permission.jpeg "iomete access control system - permissions")


## Improved dashboard
The improved dashboard makes it easy to analyze your tasks and discover pain points. With the Grafana tool one can easily optimize spark jobs.

![iomete dashboard](/blog/2022-09-21-new-features/improved-dashboard.jpeg)

## Switch between accounts
Users can now easily switch between multiple iomete accounts. To switch between accounts, click on the profile button found on the left bottom side.

![iomete switch between accounts](/blog/2022-09-21-new-features/switch-account.jpeg)


## Billing console
Users can quickly review and download invoices and arrange payment directly from iomete’s billing console.

![iomete billing console](/blog/2022-09-21-new-features/billing-console.jpeg)


## Role-based integrations
We removed “External Storage Integration”. Now we support only role-based and user-based integrations. Reason for this change was that the external type was not recommended by AWS and led to confusion.

## Lakehouse connection
To use lakehouse connection from Database Tools (for example, DataGrip) or Python (SQL Alchemy), you will have to update your connection details. For further details check the [datagrip lakehouse connection](/docs/datagrip-lakehouse-connection) and [SQL alchemy](/docs/libraries/drivers/sql-alchemy-driver) driver documentation.


## Smaller updates and fixes
&#150; Superset BI now supports async query executions.

&#150; iomete’s built-in SQL Editor was optimized for a better experience.

&#150; UI improvements (Users, Groups, Storage Integrations now moved to Settings).

&#150; Many technical improvements to make your experience even better.