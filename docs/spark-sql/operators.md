---
title: Operators
description: Learn about logical, arithmetic, and comparison operators in SQL. Understand how to use operators such as !, %, *, +, -, /, <, <=, <=>, =, ==, >, >=, and more with examples.
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

---

### **!**

! expr - Logical not.

### %

expr1 % expr2 - Returns the remainder after `expr1` / `expr2`.

**Examples:**

```sql
> SELECT 2 % 1.8;
 0.2
> SELECT MOD(2, 1.8);
 0.2
```

### &

expr1 & expr2 - Returns the result of bitwise AND of `expr1` and `expr2`.

**Examples:**

```sql
> SELECT 3 & 5;
 1
```

## \*

expr1 \* expr2 - Returns `expr1` \* `expr2`.

**Examples:**

```sql
> SELECT 2 * 3;
 6
```

### +

expr1 + expr2 - Returns `expr1` + `expr2`.

**Examples:**

```sql
> SELECT 1 + 2;
 3
```

### -

expr1 - expr2 - Returns `expr1` - `expr2`.

**Examples:**

```sql
> SELECT 2 - 1;
 1
```

### /

expr1 / expr2 - Returns `expr1` / `expr2`. It always performs floating point division.

**Examples:**

```sql
> SELECT 3 / 2;
 1.5
> SELECT 2L / 2L;
 1.0
```

### \<

expr1 < expr2 - Returns true if `expr1` is less than `expr2`.

**Arguments:**

- expr1, expr2 - the two expressions must be same type or can be casted to a common type, and must be a type that can be ordered. For example, map type is not orderable, so it is not supported. For complex types such array/struct, the data types of fields must be orderable.

**Examples:**

```sql
> SELECT 1 < 2;
 true
> SELECT 1.1 < '1';
 false
> SELECT to_date('2009-07-30 04:17:52') < to_date('2009-07-30 04:17:52');
 false
> SELECT to_date('2009-07-30 04:17:52') < to_date('2009-08-01 04:17:52');
 true
> SELECT 1 < NULL;
 NULL
```

### \<=

expr1 \<= expr2 - Returns true if `expr1` is less than or equal to `expr2`.

**Arguments:**

- expr1, expr2 - the two expressions must be same type or can be casted to a common type, and must be a type that can be ordered. For example, map type is not orderable, so it is not supported. For complex types such array/struct, the data types of fields must be orderable.

**Examples:**

```sql
> SELECT 2 <= 2;
 true
> SELECT 1.0 <= '1';
 true
> SELECT to_date('2009-07-30 04:17:52') <= to_date('2009-07-30 04:17:52');
 true
> SELECT to_date('2009-07-30 04:17:52') <= to_date('2009-08-01 04:17:52');
 true
> SELECT 1 <= NULL;
 NULL
```

### \<=>

expr1 \<=> expr2 - Returns same result as the EQUAL(=) operator for non-null operands, but returns true if both are null, false if one of the them is null.

**Arguments:**

- expr1, expr2 - the two expressions must be same type or can be casted to a common type, and must be a type that can be used in equality comparison. Map type is not supported. For complex types such array/struct, the data types of fields must be orderable.

**Examples:**

```sql
> SELECT 2 <=> 2;
 true
> SELECT 1 <=> '1';
 true
> SELECT true <=> NULL;
 false
> SELECT NULL <=> NULL;
 true
```

### =

expr1 = expr2 - Returns true if `expr1` equals `expr2`, or false otherwise.

**Arguments:**

- expr1, expr2 - the two expressions must be same type or can be casted to a common type, and must be a type that can be used in equality comparison. Map type is not supported. For complex types such array/struct, the data types of fields must be orderable.

**Examples:**

```sql
> SELECT 2 = 2;
 true
> SELECT 1 = '1';
 true
> SELECT true = NULL;
 NULL
> SELECT NULL = NULL;
 NULL
```

### ==

expr1 == expr2 - Returns true if `expr1` equals `expr2`, or false otherwise.

**Arguments:**

- expr1, expr2 - the two expressions must be same type or can be casted to a common type, and must be a type that can be used in equality comparison. Map type is not supported. For complex types such array/struct, the data types of fields must be orderable.

**Examples:**

```sql
> SELECT 2 == 2;
 true
> SELECT 1 == '1';
 true
> SELECT true == NULL;
 NULL
> SELECT NULL == NULL;
 NULL
```

### >

expr1 > expr2 - Returns true if `expr1` is greater than `expr2`.

**Arguments:**

- expr1, expr2 - the two expressions must be same type or can be casted to a common type, and must be a type that can be ordered. For example, map type is not orderable, so it is not supported. For complex types such array/struct, the data types of fields must be orderable.

**Examples:**

```sql
> SELECT 2 > 1;
 true
> SELECT 2 > '1.1';
 true
> SELECT to_date('2009-07-30 04:17:52') > to_date('2009-07-30 04:17:52');
 false
> SELECT to_date('2009-07-30 04:17:52') > to_date('2009-08-01 04:17:52');
 false
> SELECT 1 > NULL;
 NULL
```

### >=

expr1 >= expr2 - Returns true if `expr1` is greater than or equal to `expr2`.

**Arguments:**

- expr1, expr2 - the two expressions must be same type or can be casted to a common type, and must be a type that can be ordered. For example, map type is not orderable, so it is not supported. For complex types such array/struct, the data types of fields must be orderable.

**Examples:**

```sql
> SELECT 2 >= 1;
 true
> SELECT 2.0 >= '2.1';
 false
> SELECT to_date('2009-07-30 04:17:52') >= to_date('2009-07-30 04:17:52');
 true
> SELECT to_date('2009-07-30 04:17:52') >= to_date('2009-08-01 04:17:52');
 false
> SELECT 1 >= NULL;
 NULL
```

### ^

expr1 ^ expr2 - Returns the result of bitwise exclusive OR of `expr1` and `expr2`.

**Examples:**

```sql
> SELECT 3 ^ 5;
 6
```
