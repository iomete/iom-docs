---
title: Spark 4 Feature Status
sidebar_label: Spark 4 Features
description: Status of the new Spark 4.x and Iceberg V3 features on IOMETE Spark 4 clusters, with verified SQL examples, supported and partially supported functionality, and known limitations.
last_update:
  date: 09/01/2026
  author: Rovshan Baghirov
---

Status of the new Spark 4.x and Iceberg V3 features on IOMETE Spark 4 clusters. Every example below was verified end-to-end against a live IOMETE Spark 4.1.3 cluster.

**Legend:** ✅ supported &nbsp;•&nbsp; ⚠️ partially supported &nbsp;•&nbsp; ❌ not supported

Several examples reuse this table:

```sql
CREATE TABLE sales (
  id INT, region STRING, product STRING, amount DECIMAL(10,2), sold_at DATE
) USING iceberg TBLPROPERTIES ('format-version'='3');

INSERT INTO sales VALUES
  (1, 'EU',   'laptop', 1200.00, DATE'2026-01-15'),
  (2, 'EU',   'phone',   800.00, DATE'2026-01-20'),
  (3, 'US',   'laptop', 1350.00, DATE'2026-02-02'),
  (4, 'US',   'tablet',  500.00, DATE'2026-02-10'),
  (5, 'APAC', 'phone',   750.00, DATE'2026-03-05');
```

## Nessie Catalog Support on Spark 4 Clusters

Project Nessie catalogs are **not** supported on IOMETE **Spark 4** clusters.

**Why is this happening?** Nessie's Spark integration requires an extension library built for specific Spark versions. Project Nessie has **not yet released** an extension compatible with the Spark 4 version. This is an upstream limitation, not an IOMETE restriction.

*Track upstream progress:* [Project Nessie Releases](https://github.com/projectnessie/nessie/releases)

**What this means for your workloads**

- ❌ Spark 4 clusters: Will not connect to Nessie catalogs.
- ✅ Nessie workloads: Move or keep these running on **Spark 3.5** clusters.

**When will Spark 4 support Nessie?** IOMETE will restore Nessie support on the Spark 4 engine as soon as Project Nessie publishes a Spark 4-compatible extension. Until then, please route all Nessie tasks to a Spark 3.5 cluster.

## SQL Language Features

### ✅ SQL Pipe Syntax

Chain transformations top-to-bottom with the `|>` operator instead of nesting subqueries.

```sql
FROM sales
|> WHERE amount > 600
|> SELECT region, product, amount
|> ORDER BY amount DESC
|> LIMIT 3;

FROM sales
|> AGGREGATE SUM(amount) AS total_sales, COUNT(*) AS order_cnt GROUP BY region
|> WHERE total_sales > 1000
|> ORDER BY total_sales DESC;
```

### ✅ Session Variables

Session-scoped variables declared and set in SQL, usable in any later query of the same session.

```sql
DECLARE VARIABLE min_amount DECIMAL(10,2) DEFAULT 600.00;
SET VARIABLE min_amount = (SELECT AVG(amount) FROM sales);

SELECT region, product, amount FROM sales WHERE amount > min_amount;

DROP TEMPORARY VARIABLE min_amount;
```

### ✅ Parameter Markers

Positional (`?`) and named (`:name`) parameters — in the DataFrame API, in JDBC prepared statements, and in `EXECUTE IMMEDIATE ... USING`.

```sql
EXECUTE IMMEDIATE
  'SELECT region, product, amount FROM sales
   WHERE amount > :min AND region = :reg' USING 600.00 AS min, 'EU' AS reg;

-- DataFrame API
spark.sql("SELECT * FROM sales WHERE amount > ?", Array(600.00))
```

**Note:** requires the current IOMETE Spark 4 engine release.

### ✅ EXECUTE IMMEDIATE

Run dynamically composed SQL, optionally binding parameters and capturing the result into a session variable.

```sql
EXECUTE IMMEDIATE 'SELECT COUNT(*) FROM sales';

DECLARE VARIABLE cnt INT;
EXECUTE IMMEDIATE 'SELECT COUNT(*) FROM sales' INTO cnt;
SELECT cnt;
```

### ✅ SQL Scripting

Procedural blocks with variables, conditionals and loops (`BEGIN ... END`, `IF`, `WHILE`, `FOR`).

```sql
BEGIN
  DECLARE total DECIMAL(10,2);
  SET total = (SELECT SUM(amount) FROM sales);
  IF total > 4000 THEN
    SELECT concat('high: ', total) AS verdict;
  ELSE
    SELECT concat('low: ', total) AS verdict;
  END IF;
END
```

### ✅ Recursive CTEs

`WITH RECURSIVE` for hierarchies and sequences.

```sql
WITH RECURSIVE chain AS (
  SELECT id, name, 0 AS lvl, name AS path FROM emp WHERE mgr IS NULL
  UNION ALL
  SELECT e.id, e.name, c.lvl + 1, concat(c.path, ' > ', e.name)
  FROM emp e JOIN chain c ON e.mgr = c.id
) SELECT * FROM chain ORDER BY lvl, id;
```

### ✅ SQL UDFs (CREATE FUNCTION)

Reusable functions defined in plain SQL — temporary or persistent, with or without parameters.

```sql
CREATE FUNCTION to_hex(x INT COMMENT 'Any number between 0 - 255')
  RETURNS STRING
  COMMENT 'Converts a decimal to a hexadecimal'
  RETURN lpad(hex(least(greatest(0, x), 255)), 2, '0');

SELECT to_hex(255);   -- FF
```

**Notes:** persistent SQL UDFs are stored in the `spark_catalog`; they cannot be created inside an Iceberg catalog, but once created they can be used in queries over Iceberg tables like any other function. Requires the current IOMETE Spark 4 engine release.

### ✅ View Schema Evolution

Views declared `WITH SCHEMA EVOLUTION` adapt automatically when the underlying table's schema changes.

```sql
CREATE VIEW v_evo WITH SCHEMA EVOLUTION AS SELECT * FROM sales;

ALTER TABLE sales ADD COLUMN discount DECIMAL(5,2);

SELECT * FROM v_evo;   -- now includes discount; pre-existing rows show NULL
```

**Limitation — Iceberg views:** views stored *in an Iceberg catalog* do not evolve — the `WITH SCHEMA EVOLUTION` clause is accepted but has no effect, and the view keeps its creation-time schema. This is about where the view lives — an evolving spark-catalog view over an Iceberg table works fine.

## Data Types

### ✅ VARIANT Data Type

Store and query semi-structured JSON-like data with types preserved. Requires Iceberg format version 3 for table storage.

```sql
CREATE TABLE events (id INT, payload VARIANT)
USING iceberg TBLPROPERTIES ('format-version'='3');

INSERT INTO events VALUES
  (1, parse_json('{"user":{"id":42,"name":"alice"},"score":9.5,"tags":["a","b"]}')),
  (2, parse_json('{"user":{"id":7,"name":"bob"},"active":true}')),
  (3, parse_json('[10,20,30]'));

SELECT id,
       variant_get(payload, '$.user.name', 'string') AS user_name,
       try_variant_get(payload, '$.score', 'double') AS score,
       schema_of_variant(payload)                    AS inferred
FROM events ORDER BY id;
```

### ✅ Variant Colon Access Syntax

Path shorthand for variant fields, with `::` casts.

```sql
SELECT id,
       payload:user.name::string AS name,
       payload:user.id::int      AS uid,
       payload:score::double     AS score
FROM events ORDER BY id;
```

### ✅ Unknown Column Type (Iceberg V3)

Iceberg format v3 tables can declare columns of the *unknown* type (Spark's `VOID`) — columns that always hold NULL, useful as schema placeholders.

```sql
CREATE TABLE unk_t (id INT, u VOID)
USING iceberg TBLPROPERTIES ('format-version'='3');

INSERT INTO unk_t VALUES (1, NULL);
SELECT * FROM unk_t;    -- (1, NULL)
```

## Iceberg V3 Table Features

*Format v3 is a table-level upgrade that affects every reader of the table — engines without v3 support cannot read v3 tables correctly. Upgrade all consumers before converting shared tables.*

### ✅ Row Lineage

Format v3 tables track each row's identity and last modification via the `_row_id` and `_last_updated_sequence_number` metadata columns.

```sql
SELECT id, region, amount, _row_id, _last_updated_sequence_number
FROM sales ORDER BY id;

UPDATE sales SET amount = amount + 1 WHERE region = 'EU';
-- EU rows keep their _row_id but get a higher _last_updated_sequence_number;
-- all other rows are unchanged. Fresh inserts get new _row_id values.
```

### ✅ Deletion Vectors

With merge-on-read, format v3 tables store deletes as compact deletion vectors (Puffin files) instead of rewriting data files.

```sql
ALTER TABLE sales SET TBLPROPERTIES (
  'write.delete.mode'='merge-on-read',
  'write.update.mode'='merge-on-read',
  'write.merge.mode'='merge-on-read'
);

DELETE FROM sales WHERE id IN (2, 4);

SELECT content, file_format, record_count FROM spark_catalog.default.sales.delete_files;
-- file_format = PUFFIN  (deletion vectors, not v2 delete files)
```

**Interoperability warning:** if you delete records from a table on a Compute image version 4.x cluster and then run a `SELECT` on that table from a Compute image version 3.x cluster, those records are returned as if they were never deleted.

### ✅ MERGE with Schema Evolution

`MERGE WITH SCHEMA EVOLUTION` lets the target table gain new columns from the source during the merge.

```sql
-- source src has an extra `discount` column
MERGE WITH SCHEMA EVOLUTION INTO t USING src ON t.id = src.id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
-- target gains `discount`; pre-existing rows are backfilled with NULL
```

**Note:** if a source column's inferred type is narrower than the target's (e.g. a VALUES-inferred `decimal(5,2)` against a `decimal(10,2)` column), evolution fails with "Cannot change column type". Workaround: CAST source columns to the exact target types.

### ⚠️ Column Default Values

Supported for spark-catalog tables; not supported by Iceberg tables.

```sql
-- session catalog: works
CREATE TABLE spark_catalog.default.orders (id INT, status STRING DEFAULT 'new') USING parquet;
INSERT INTO spark_catalog.default.orders (id) VALUES (1);
SELECT * FROM spark_catalog.default.orders;   -- (1, 'new')

-- Iceberg: rejected
CREATE TABLE def_ice (id INT, status STRING DEFAULT 'new')
USING iceberg TBLPROPERTIES ('format-version'='3');
-- [UNSUPPORTED_FEATURE.TABLE_OPERATION] ... does not support column default value
```

## Analytics Functions

### ✅ KLL Sketches

Approximate quantiles/ranks over large data via Apache DataSketches KLL, with mergeable sketch aggregates (`kll_sketch_agg_*`, `kll_sketch_get_quantile_*`, `kll_sketch_get_rank_*`, `kll_sketch_merge_*`).

```sql
WITH m AS (SELECT CAST(id AS DOUBLE) AS latency FROM range(1, 1001)),
sk AS (SELECT kll_sketch_agg_double(latency) AS s FROM m)
SELECT kll_sketch_get_quantile_double(s, 0.5)  AS p50,   -- ~500
       kll_sketch_get_quantile_double(s, 0.95) AS p95,   -- ~950
       kll_sketch_get_rank_double(s, 900.0)    AS rank_of_900,
       kll_sketch_get_n_double(s)              AS n
FROM sk;
```

### ✅ Theta Sketches

Approximate distinct counting with set operations (union / intersection / difference) across groups.

```sql
WITH s AS (SELECT region, theta_sketch_agg(user_id) AS sk FROM visits GROUP BY region)
SELECT
  theta_sketch_estimate(theta_union_agg(sk))        AS union_est,
  theta_sketch_estimate(theta_intersection_agg(sk)) AS overlap_est
FROM s;
```

## Python & Spark Connect

### ✅ Lightweight pyspark-client (Spark Connect)

```bash
pip install pyspark-client==4.1.3
```

```python
from pyspark.sql import SparkSession
spark = (SparkSession.builder
    .remote("sc://<endpoint>:15002/;user_id=<user>;api_token=<token>;cluster=<cluster>")
    .getOrCreate())
spark.sql("SELECT COUNT(*) FROM sales").show()
```

### ✅ Spark Declarative Pipelines

Define materialized views in SQL and Python, and let Spark plan and run them in dependency order — driven by the pipelines CLI over Spark Connect.

```bash
pip install pyspark-client==4.1.3 pyyaml
spark-pipelines init --name sales_pipeline    # generates spark-pipeline.yml + transformations/
spark-pipelines dry-run                        # validates the flow graph
spark-pipelines run                            # runs all flows in dependency order
```

```sql
-- transformations/sales_by_region.sql
CREATE MATERIALIZED VIEW sales_by_region AS
SELECT region, SUM(amount) AS total, COUNT(*) AS cnt FROM sales_raw GROUP BY region;
```

```python
# transformations/numbers.py
@dp.materialized_view
def numbers() -> DataFrame:
    return spark.range(10)
```

**Note:** pipelines run over the Spark Connect endpoint (see pyspark-client above), not from the SQL editor. Set the connection via `SPARK_REMOTE` or the CLI's remote option.
