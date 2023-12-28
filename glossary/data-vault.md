---
title: Data Vault
description: A Data Vault is a data modeling design pattern used to build a data warehouse for enterprise-scale analytics. It is made up of three types of entities - hubs, links, and satellites.
tags: [d]
---

# Data Vault

## What is a Data Vault?

A **Data Vault** is a data modeling design pattern used to build a data warehouse for enterprise-scale analytics. It is made up of three types of entities: hubs, links, and satellites.

Hubs represent core business concepts, links represent relationships between hubs, and satellites store information about hubs and relationships between them.

The Data Vault methodology is well-suited to organizations that are adopting the data lakehouse paradigm. It is agile, structured, and extremely scalable, making it a popular choice for businesses dealing with large volumes of data.

One of the major advantages of using the Data Vault methodology is that ETL jobs need less refactoring when the model changes. This is because Hubs make key management easier, satellites make loading dimensions easier, and links make loading fact tables straightforward.

If you're interested in implementing the Data Vault methodology, it's important to keep in mind that a satellite cannot have a direct connection to another satellite, and a hub or link may have one or more satellites.
