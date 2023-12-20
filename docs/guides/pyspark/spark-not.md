---
title: Spark 'NOT'
description: The Spark and PySpark 'NOT' operator is a crucial part of logical operations in data processing, allowing for negation of conditions in queries. It's used alongside other logical operators like `AND` and `OR`.
---

Both PySpark & Spark AND, OR and NOT operators are part of logical operations that supports determining the conditional-based logic relation among the operands.

In Spark/PySpark SQL expression, you need to use the following operators for AND & OR.

-   `AND` – Evaluates to TRUE if all the conditions separated by `&&` operator is TRUE.
-   `OR` – Evaluates to TRUE if any of the conditions separated by `||` is TRUE.

## 1\. Logical Operations

Both PySpark & Spark supports standard logical operators such as `AND`, `OR` and `NOT`. These operators take Boolean expressions as arguments and return a `Boolean` value.

Below we can take a look at the behavior of the Spark AND & OR operator based on the Boolean expression.

<table><tbody><tr><td><strong>LEFT OPERAND</strong></td><td><strong>RIGHT OPERAND</strong></td><td><strong>AND</strong></td><td><strong>OR</strong></td></tr><tr><td>TRUE</td><td>TRUE</td><td>TRUE</td><td>TRUE</td></tr><tr><td>TRUE</td><td>FALSE</td><td>FALSE</td><td>TRUE</td></tr><tr><td>FALSE</td><td>TRUE</td><td>FALSE</td><td>TRUE</td></tr><tr><td>FALSE</td><td>FALSE</td><td>FALSE</td><td>FALSE</td></tr></tbody></table>

Spark AND & OR operator

## 2\. Null handling in Logical AND & OR Operations

The below table illustrates the behavior of Spark logical AND & OR operators when a NULL value is encountered.

<table><tbody><tr><td><strong>LEFT Operand</strong></td><td><strong>RIGHT Operand</strong></td><td><strong>OR</strong></td><td><strong>AND</strong></td></tr><tr><td>TRUE</td><td>NULL</td><td>TRUE</td><td>NULL</td></tr><tr><td>NULL</td><td>TRUE</td><td>TRUE</td><td>NULL</td></tr><tr><td>FALSE</td><td>NULL</td><td>NULL</td><td>FALSE</td></tr><tr><td>NULL</td><td>FALSE</td><td>NULL</td><td>FALSE</td></tr><tr><td>NULL</td><td>NULL</td><td>NULL</td><td>NULL</td></tr></tbody></table>

Spark AND & OR Operator

In the case of OR operations when a null value is one of the boolean expressions then

-   If any one of the expressions is TRUE and the Other is NULL then the result is TRUE
-   If any one of the expressions is FALSE and the Other is NULL then the result is NULL

In the case of AND operations when a null value is one of the boolean expressions then

-   If any one of the expressions is TRUE and the Other is NULL then the result is NULL
-   If any one of the expressions is FALSE and the Other is NULL then the result is FALSE

When both the expressions of an AND, and OR are NULL the final result is obviously NULL.

## 3\. Spark Using And & OR Operator

Usually, AND (&&) operator is useful when you wanted to filter the Spark DataFrame by multiple conditions.

Similarly, let’s use the OR (||) operator to filter the Spark DataFrame.

```bash
// Spark AND Operator 
df.filter(df("state") === "OH" && df("gender") === "M")
    .show(false)

// Spark OR Operator
df.filter(df("state") === "OH" || df("gender") === "M")
    .show(false)
```

## 4\. PySpark Using OR Operator

PySpark Logical operations use the [bitwise operators](https://stackoverflow.com/questions/3845018/boolean-operators-vs-bitwise-operators/25949622):

-   `&` for `and`
-   `|` for `or`
-   `~` for `not`

```bash
// PySpark AND Operator 
df.filter(df("state") === "OH" & df("gender") === "M")
    .show(false)

// PySpark OR Operator
df.filter(df("state") === "OH" | df("gender") === "M")
    .show(false)
```

## 3\. Conclusion

Spark & PySpark support standard logical operators such as `AND`, `OR` and `NOT`. These operators take `Boolean` expressions as arguments and return a `Boolean` value.



