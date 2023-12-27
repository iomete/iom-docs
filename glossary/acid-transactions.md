---
title: ACID Transactions
description: ACID is an acronym representing the four essential properties defining a transaction - Atomicity, Consistency, Isolation, and Durability.
---

# ACID Transactions

## What is an ACID Transaction?

In the realm of databases and data storage systems, a transaction refers to any operation treated as a single unit of work, which either fully completes or doesn't complete at all, ensuring the storage system remains in a consistent state. A classic transaction example is withdrawing money from a bank account – either the money is withdrawn, or it isn't, with no in-between state.

## Key ACID Properties: Atomicity, Consistency, Isolation, and Durability

ACID is an acronym representing the four essential properties defining a transaction: Atomicity, Consistency, Isolation, and Durability. A database operation possessing these ACID properties is considered an ACID transaction, and data storage systems implementing these operations are called transactional systems. ACID transactions guarantee that each table read, write, or modification has the following properties:

- **Atomicity:** Every statement in a transaction (to read, write, update, or delete data) is treated as a single unit. Either the entire statement is executed, or none of it is executed, preventing data loss and corruption, for instance, if a streaming data source fails mid-stream.
- **Consistency:** Ensures that transactions only make table changes in predefined, predictable ways. Transactional consistency safeguards against corruption or errors in your data, preventing unintended consequences for your table's integrity.
- **Isolation:** When multiple users read and write from the same table simultaneously, transaction isolation ensures that concurrent transactions don't interfere with or affect one another. Each request can occur as though they were happening sequentially, even though they're occurring simultaneously.
- **Durability:** Guarantees that changes to your data made by successfully executed transactions are saved, even in the event of system failure.

## Why are ACID Transactions Beneficial?

ACID transactions ensure optimal data reliability and integrity. They guarantee that your data never falls into an inconsistent state due to an operation that only partially completes. For example, without ACID transactions, if you were writing data to a database table and the power went out unexpectedly, it's possible that only some of your data would be saved, while some would not. This inconsistency in your database would be challenging and time-consuming to recover from.
