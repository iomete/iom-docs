---
title: Spark 'NOT'
description: The Spark and PySpark 'NOT' operator is a crucial part of logical operations in data processing, allowing for negation of conditions in queries. It's used alongside other logical operators like `AND` and `OR`.
---

Both PySpark & Spark support logical operations like AND, OR, and NOT. These operations help determine conditional logic among operands.

### AND & OR Operators in Spark/PySpark SQL
- `AND`: True if all conditions (separated by `&&`) are True.
- `OR`: True if any condition (separated by `||`) is True.

## 1. Logical Operations
These operators take Boolean expressions as arguments and return a Boolean value.

### Behavior with Boolean Expressions
- Table showing the behavior based on different combinations of Boolean expressions.

## 2. Null Handling in Logical Operations
- Table illustrating behavior when encountering NULL values in AND & OR operations.
- Rules for handling NULL values in OR and AND operations.

## 3. Using AND & OR Operators in Spark
- Example: Using `AND` (`&&`) and `OR` (`||`) operators to filter a Spark DataFrame.

## 4. Using Operators in PySpark
- PySpark uses bitwise operators for logical operations:
  - `&` for `and`
  - `|` for `or`
  - `~` for `not`
- Examples of using `AND` and `OR` operators in PySpark.



