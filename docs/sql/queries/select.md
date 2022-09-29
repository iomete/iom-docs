---
title: Select
---

<!-- <head>
  <title>Select</title>
  <meta
    name="description"
    content="Select"
  />
</head> -->

Spark supports a `SELECT` statement and conforms to the ANSI SQL standard. Queries are used to retrieve result sets from one or more tables. The following section describes the overall query syntax and the sub-sections cover different constructs of a query along with examples.
___

### Description
Spark supports a `SELECT` statement and conforms to the ANSI SQL standard. Queries are used to retrieve result sets from one or more tables. The following section describes the overall query syntax and the sub-sections cover different constructs of a query along with examples.


### Syntax

```sql
[ WITH with_query [ , ... ] ]
select_statement [ { UNION | INTERSECT | EXCEPT } [ ALL | DISTINCT ] select_statement, ... ]
    [ ORDER BY { expression [ ASC | DESC ] [ NULLS { FIRST | LAST } ] [ , ... ] } ]
    [ SORT BY { expression [ ASC | DESC ] [ NULLS { FIRST | LAST } ] [ , ... ] } ]
    [ CLUSTER BY { expression [ , ... ] } ]
    [ DISTRIBUTE BY { expression [, ... ] } ]
    [ WINDOW { named_window [ , WINDOW named_window, ... ] } ]
    [ LIMIT { ALL | expression } ]
```

While `select_statement` is defined as

```sql
SELECT [ hints , ... ] [ ALL | DISTINCT ] { [ [ named_expression | regex_column_names ] [ , ... ] | TRANSFORM (...) ] }
    FROM { from_item [ , ... ] }
    [ PIVOT clause ]
    [ LATERAL VIEW clause ] [ ... ] 
    [ WHERE boolean_expression ]
    [ GROUP BY expression [ , ... ] ]
    [ HAVING boolean_expression ]
```


### Parameters

- ** with_query**

    Specifies the <a href="https://spark.apache.org/docs/latest/sql-ref-syntax-qry-select-cte.html">common table expressions (CTEs)</a> before the main query block. These table expressions are allowed to be referenced later in the FROM clause. This is useful to abstract out repeated subquery blocks in the FROM clause and improves readability of the query.



- ** hints**

    Hints can be specified to help spark optimizer make better planning decisions. Currently spark supports hints that influence selection of join strategies and repartitioning of the data.


- ** ALL**

    Select all matching rows from the relation and is enabled by default.


- ** DISTINCT**

  Select all matching rows from the relation after removing duplicates in results.

- ** named_expression**

    An expression with an assigned name. In general, it denotes a column expression.

     **Syntax:** `expression [AS] [alias]`


- ** from_item**

    Specifies a source of input for the query. It can be one of the following:

  - Table relation
  - <a href="https://docs.iomete.com/docs/queries-join">Join </a> relation
  - <a href="https://docs.iomete.com/docs/queries-table-valued-functions-tvf">Table-value function</a>
  - <a href="https://docs.iomete.com/docs/queries-inline-table">Inline table</a>
  - Subquery
  - <a href="https://docs.iomete.com/docs/queries-file">File </a>


- ** pivot**

    The PIVOT clause is used for data perspective; We can get the aggregated values based on specific column value.

- ** LATERAL VIEW**

    The `LATERAL VIEW` clause is used in conjunction with generator functions such as `EXPLODE`, which will generate a virtual table containing one or more rows. `LATERAL VIEW` will apply the rows to each original output row.

- ** WHERE**

    Filters the result of the FROM clause based on the supplied predicates.

- ** GROUP BY**

    Specifies the expressions that are used to group the rows. This is used in conjunction with aggregate functions (MIN, MAX, COUNT, SUM, AVG, etc.) to group rows based on the grouping expressions and aggregate values in each group. When a FILTER clause is attached to an aggregate function, only the matching rows are passed to that function.


- ** HAVING**

    Specifies the predicates by which the rows produced by GROUP BY are filtered. The HAVING clause is used to filter rows after the grouping is performed. If HAVING is specified without GROUP BY, it indicates a GROUP BY without grouping expressions (global aggregate).


- ** ORDER BY**

    Specifies an ordering of the rows of the complete result set of the query. The output rows are ordered across the partitions. This parameter is mutually exclusive with SORT BY, CLUSTER BY and DISTRIBUTE BY and can not be specified together.

- ** SORT BY**

    Specifies an ordering by which the rows are ordered within each partition. This parameter is mutually exclusive with ORDER BY and CLUSTER BY and can not be specified together.


- ** CLUSTER  BY**

    Specifies a set of expressions that is used to repartition and sort the rows. Using this clause has the same effect of using DISTRIBUTE BY and SORT BY together.


- ** DISTRIBUTE BY**

    Specifies a set of expressions by which the result rows are repartitioned. This parameter is mutually exclusive with ORDER BY and CLUSTER BY and can not be specified together.


- ** LIMIT **

    Specifies the maximum number of rows that can be returned by a statement or subquery. This clause is mostly used in the conjunction with ORDER BY to produce a deterministic result.


- ** boolean_expression**

    Specifies any expression that evaluates to a result type boolean. Two or more expressions may be combined together using the logical operators ( AND, OR ).


- ** expression**

    Specifies a combination of one or more values, operators, and SQL functions that evaluates to a value.


- ** named_window**

    Specifies aliases for one or more source window specifications. The source window specifications can be referenced in the widow definitions in the query.


- ** regex_column_names**

    When `spark.sql.parser.quotedRegexColumnNames` is true, quoted identifiers (using backticks) in `SELECT` statement are interpreted as regular expressions and `SELECT` statement can take regex-based column specification. For example, below SQL will only take column c:

    ```sql
     SELECT `(a|b)?+.+` FROM (
         SELECT 1 as a, 2 as b, 3 as c
       )
    ```


- ** TRANSFORM**

    Specifies a hive-style transform query specification to transform the input by forking and running user-specified command or script.