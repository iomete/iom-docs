---
title: Catalyst Optimizer
description: Spark SQL's Catalyst optimizer is a powerful tool that uses advanced programming language features to build an extensible query optimizer. Catalyst is based on functional programming constructs in Scala and is designed to easily add new optimization techniques and features to Spark SQL.
alphabet: C
---

# Catalyst Optimizer

## What is a Catalyst Optimizer?

Spark SQL's Catalyst optimizer is a powerful tool that uses advanced programming language features to build an extensible query optimizer. Catalyst is based on functional programming constructs in Scala and is designed to easily add new optimization techniques and features to Spark SQL. It also enables external developers to extend the optimizer by adding data source specific rules and support for new data types.

Catalyst contains a general library for representing trees and applying rules to manipulate them, making it an ideal tool for relational query processing. It has several sets of rules that handle different phases of query execution, including analysis, logical optimization, physical planning, and code generation. Catalyst also offers several public extension points, including external data sources and user-defined types, and supports both rule-based and cost-based optimization.
