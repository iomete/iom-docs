---
title: SORT BY Clause
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

<!-- <head>
  <title>SORT BY Clause</title>
  <meta
    name="description"
    content="SORT BY Clause"
  />
</head> -->

### Description

The SORT BY clause is used to return the result rows sorted within each partition in the user specified order. When there is more than one partition SORT BY may return result that is partially ordered. This is different than <a href="https://docs.iomete.com/docs/queries-order-by-clause">ORDER BY</a> clause which guarantees a total order of the output.

### Syntax

```sql
SORT BY { expression [ sort_direction | nulls_sort_order ] [ , ... ] }
```

### Parameters

- **SORT BY**

    Specifies a comma-separated list of expressions along with optional parameters sort_direction and             
    nulls_sort_order which are used to sort the rows within each partition.

- **sort_direction**

    Optionally specifies whether to sort the rows in ascending or descending order. The valid values for the sort 
    direction are ```ASC``` for ascending and ```DESC``` for descending. If sort direction is not explicitly specified, then by 
    default rows are sorted ascending.

    **Syntax:** ```[ ASC | DESC ]```

- **nulls_sort_order**

    Optionally specifies whether NULL values are returned before/after non-NULL values. If ```null_sort_order``` is not 
    specified, then ```NULLs``` sort first if sort order is ```ASC``` and ```NULLS``` sort last if sort order is ```DESC```.

    - If ```NULLS FIRST``` is specified, then NULL values are returned first regardless of the sort order.
    - If ```NULLS LAST``` is specified, then NULL values are returned last regardless of the sort order.

    **Syntax:** ```[ NULLS { FIRST | LAST } ]```

### Examples

```sql
CREATE TABLE person (zip_code INT, name STRING, age INT);
INSERT INTO person VALUES
    (94588, 'Zen Hui', 50),
    (94588, 'Dan Li', 18),
    (94588, 'Anil K', 27),
    (94588, 'John V', NULL),
    (94511, 'David K', 42),
    (94511, 'Aryan B.', 18),
    (94511, 'Lalit B.', NULL);

-- Use `REPARTITION` hint to partition the data by `zip_code` to
-- examine the `SORT BY` behavior. This is used in rest of the
-- examples.

-- Sort rows by `name` within each partition in ascending manner
SELECT /*+ REPARTITION(zip_code) */ name, age, zip_code FROM person SORT BY name;
+--------+----+--------+
|    name| age|zip_code|
+--------+----+--------+
|  Anil K|  27|   94588|
|  Dan Li|  18|   94588|
|  John V|null|   94588|
| Zen Hui|  50|   94588|
|Aryan B.|  18|   94511|
| David K|  42|   94511|
|Lalit B.|null|   94511|
+--------+----+--------+

-- Sort rows within each partition using column position.
SELECT /*+ REPARTITION(zip_code) */ name, age, zip_code FROM person SORT BY 1;
+--------+----+--------+
|    name| age|zip_code|
+--------+----+--------+
|  Anil K|  27|   94588|
|  Dan Li|  18|   94588|
|  John V|null|   94588|
| Zen Hui|  50|   94588|
|Aryan B.|  18|   94511|
| David K|  42|   94511|
|Lalit B.|null|   94511|
+--------+----+--------+

-- Sort rows within partition in ascending manner keeping null values to be last.
SELECT /*+ REPARTITION(zip_code) */ age, name, zip_code FROM person SORT BY age NULLS LAST;
+----+--------+--------+
| age|    name|zip_code|
+----+--------+--------+
|  18|  Dan Li|   94588|
|  27|  Anil K|   94588|
|  50| Zen Hui|   94588|
|null|  John V|   94588|
|  18|Aryan B.|   94511|
|  42| David K|   94511|
|null|Lalit B.|   94511|
+----+--------+--------+

-- Sort rows by age within each partition in descending manner, which defaults to NULL LAST.
SELECT /*+ REPARTITION(zip_code) */ age, name, zip_code FROM person SORT BY age DESC;
+----+--------+--------+
| age|    name|zip_code|
+----+--------+--------+
|  50| Zen Hui|   94588|
|  27|  Anil K|   94588|
|  18|  Dan Li|   94588|
|null|  John V|   94588|
|  42| David K|   94511|
|  18|Aryan B.|   94511|
|null|Lalit B.|   94511|
+----+--------+--------+

-- Sort rows by age within each partition in descending manner keeping null values to be first.
SELECT /*+ REPARTITION(zip_code) */ age, name, zip_code FROM person SORT BY age DESC NULLS FIRST;
+----+--------+--------+
| age|    name|zip_code|
+----+--------+--------+
|null|  John V|   94588|
|  50| Zen Hui|   94588|
|  27|  Anil K|   94588|
|  18|  Dan Li|   94588|
|null|Lalit B.|   94511|
|  42| David K|   94511|
|  18|Aryan B.|   94511|
+----+--------+--------+

-- Sort rows within each partition based on more than one column with each column having
-- different sort direction.
SELECT /*+ REPARTITION(zip_code) */ name, age, zip_code FROM person
    SORT BY name ASC, age DESC;
+--------+----+--------+
|    name| age|zip_code|
+--------+----+--------+
|  Anil K|  27|   94588|
|  Dan Li|  18|   94588|
|  John V|null|   94588|
| Zen Hui|  50|   94588|
|Aryan B.|  18|   94511|
| David K|  42|   94511|
|Lalit B.|null|   94511|
+--------+----+--------+
```