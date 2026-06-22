---
title: System Tables
description: Learn about IOMETE system tables used for internal platform operations, audit logging, and event streaming.
last_update:
  date: 06/22/2026
  author: IOMETE Documentation Team
---

IOMETE system tables live in the `spark_catalog.iomete_system_db` database. These tables give you a SQL-queryable view into key platform activity, including audit events, data access decisions, and Iceberg read/write metrics. All tables are automatically populated by the IOMETE Event Stream pipeline, so you can analyze platform behavior directly using SQL.

Setup only takes a few steps. Once the system tables are available, you can query them like any other Iceberg table.

:::info Before you begin
System tables aren't created automatically. You set them up once, then they fill in on their own. Three things need to be in place before a table starts collecting data:

1. **Enable the Event Stream subsystem.** Turn on the `eventStream` feature flag by setting `features.eventStream.enabled: true` in your Helm values. This deploys the ingest service that feeds every system table. Until it's enabled, writes are dropped.
2. **Create the table.** Run the `CREATE TABLE` statement for each table you want (provided below). If a table doesn't exist yet, the pipeline drops its events quietly and harmlessly. The originating query, commit, or data access still succeeds, so nothing breaks while you get set up.
3. **Enable the table's feature flag.** Each table starts receiving data once its producer feature flag is on (see the summary below).
:::

## Enabling System Tables

Knowing which flag controls which table saves you from guessing during setup. This table maps each system table to the feature flag that switches it on:

| System table | Feature flag | Default | Notes |
| --- | --- | --- | --- |
| `platform_event_logs` | _none_ | Always on | Populated whenever the Event Stream subsystem is enabled. |
| `data_access_audit` | `dataAccessAudit` | Enabled | Also writes to Ranger's own S3 audit store (see below). |
| `iceberg_commit_report` | `icebergMetrics` | Enabled | A single flag covers both Iceberg report tables. |
| `iceberg_scan_report` | `icebergMetrics` | Enabled | A single flag covers both Iceberg report tables. |

A table that exists but has its feature flag off (or the Event Stream subsystem disabled) just stays empty until you enable it. No errors, no surprises.

You set these flags in your data plane Helm chart's `values.yaml`, under the `features` block. Each flag follows the `features.<flag>.enabled` notation:

```yaml
features:
  eventStream:
    enabled: true   # deploys the Event Stream subsystem (required for all tables)
  dataAccessAudit:
    enabled: true   # data_access_audit
  icebergMetrics:
    enabled: true   # iceberg_commit_report and iceberg_scan_report
```

Apply the change with a `helm upgrade` to roll it out.

---

## platform_event_logs

The `platform_event_logs` table stores all platform audit events. This includes user actions, service operations, and other platform-level activities.

:::note Enablement
This is the easiest one: no feature flag needed. Just create the table, and it populates automatically as soon as the Event Stream subsystem is enabled.
:::

```sql
CREATE TABLE IF NOT EXISTS spark_catalog.iomete_system_db.platform_event_logs (
  __id__ STRING NOT NULL COMMENT 'Unique identifier for the event',
  __ts__ TIMESTAMP NOT NULL COMMENT 'Timestamp when the event was recorded',
  __write_id__ STRING NOT NULL COMMENT 'Write batch identifier',
  user_id STRING COMMENT 'ID of the user who triggered the event',
  occurred_at TIMESTAMP COMMENT 'When the event actually occurred',
  service STRING COMMENT 'The service that generated the event',
  action STRING COMMENT 'The action that was performed',
  success BOOLEAN COMMENT 'Whether the action was successful',
  payload STRING COMMENT 'Additional event data in JSON format')
USING iceberg
PARTITIONED BY (days(__ts__), __write_id__);
```

---

## data_access_audit

The `data_access_audit` table stores data access audit events. This includes all data access attempts, policy evaluations, and access control decisions.

:::note Enablement
Enable the `dataAccessAudit` feature flag, and remember to create the table first so no events are dropped. Good to know: even before you set this table up, your audit data isn't lost. Ranger always writes a copy to its own audit store in object storage, partitioned by day as ORC files:

```
s3a://<your-bucket>/ranger/audit/day=yyyyMMdd/<hostname>-audit-data.orc
```

Once this table is in place, you get those same audit events in a convenient, SQL-queryable form alongside that Ranger store.
:::

```sql
CREATE TABLE IF NOT EXISTS spark_catalog.iomete_system_db.data_access_audit (
  __id__ STRING NOT NULL COMMENT 'Unique identifier for the audit record',
  __ts__ TIMESTAMP NOT NULL COMMENT 'Timestamp when the record was created',
  __write_id__ STRING NOT NULL COMMENT 'Write batch identifier',
  repositoryName STRING COMMENT 'Name of the repository being accessed',
  repositoryType INT COMMENT 'Type of repository',
  clientIP STRING COMMENT 'IP address of the client',
  accessType STRING COMMENT 'Type of access requested',
  resourcePath STRING COMMENT 'Path to the resource being accessed',
  logType STRING COMMENT 'Type of log entry',
  agentId STRING COMMENT 'ID of the agent',
  resultReason STRING COMMENT 'Reason for the access result',
  aclEnforcer STRING COMMENT 'ACL enforcer used',
  requestData STRING COMMENT 'Additional request data',
  resourceType STRING COMMENT 'Type of resource',
  accessResult INT COMMENT 'Result of the access attempt',
  eventDurationMS BIGINT COMMENT 'Duration of the event in milliseconds',
  eventId STRING COMMENT 'Unique event identifier',
  zoneName STRING COMMENT 'Security zone name',
  policyId BIGINT COMMENT 'ID of the policy evaluated',
  clientType STRING COMMENT 'Type of client',
  eventCount INT COMMENT 'Number of events',
  seqNum INT COMMENT 'Sequence number',
  sessionId STRING COMMENT 'Session identifier',
  eventTime BIGINT COMMENT 'Event time as epoch',
  additionalInfo STRING COMMENT 'Additional information',
  clusterName STRING COMMENT 'Name of the cluster',
  agentHostname STRING COMMENT 'Hostname of the agent',
  action STRING COMMENT 'Action performed',
  user STRING COMMENT 'User who performed the action',
  serviceType INT COMMENT 'Type of service',
  serviceName STRING COMMENT 'Name of the service',
  policyVersion INT COMMENT 'Version of the policy')
USING iceberg
PARTITIONED BY (days(__ts__), __write_id__);
```

---

## iceberg_commit_report

The `iceberg_commit_report` table captures detailed metrics for every Iceberg table commit operation. This includes information about data and delete file changes, record counts, and file sizes. It is useful for monitoring write activity, tracking table growth, and diagnosing commit performance.

:::note Enablement
The `icebergMetrics` feature flag controls this table, and it's enabled by default. So once you create the table and the Event Stream subsystem is on, commit metrics start flowing right away. The same flag also powers `iceberg_scan_report`.
:::

```sql
CREATE TABLE IF NOT EXISTS spark_catalog.iomete_system_db.iceberg_commit_report (
  __id__ STRING NOT NULL COMMENT 'Unique identifier for the report',
  __ts__ TIMESTAMP NOT NULL COMMENT 'Timestamp when the report was recorded',
  __write_id__ STRING NOT NULL COMMENT 'Write batch identifier',
  table_name STRING COMMENT 'Fully qualified name of the Iceberg table',
  snapshot_id BIGINT COMMENT 'Snapshot ID created by the commit',
  sequence_number BIGINT COMMENT 'Sequence number of the snapshot',
  operation STRING COMMENT 'Type of operation (e.g., append, overwrite, delete)',
  total_duration_ns BIGINT COMMENT 'Total commit duration in nanoseconds',
  attempts BIGINT COMMENT 'Number of commit attempts',
  added_data_files BIGINT COMMENT 'Number of data files added',
  removed_data_files BIGINT COMMENT 'Number of data files removed',
  total_data_files BIGINT COMMENT 'Total number of data files after commit',
  added_delete_files BIGINT COMMENT 'Number of delete files added',
  removed_delete_files BIGINT COMMENT 'Number of delete files removed',
  total_delete_files BIGINT COMMENT 'Total number of delete files after commit',
  added_equality_delete_files BIGINT COMMENT 'Number of equality delete files added',
  removed_equality_delete_files BIGINT COMMENT 'Number of equality delete files removed',
  added_positional_delete_files BIGINT COMMENT 'Number of positional delete files added',
  removed_positional_delete_files BIGINT COMMENT 'Number of positional delete files removed',
  added_records BIGINT COMMENT 'Number of records added',
  removed_records BIGINT COMMENT 'Number of records removed',
  total_records BIGINT COMMENT 'Total number of records after commit',
  added_files_size_in_bytes BIGINT COMMENT 'Size of added files in bytes',
  removed_files_size_in_bytes BIGINT COMMENT 'Size of removed files in bytes',
  total_files_size_in_bytes BIGINT COMMENT 'Total file size in bytes after commit',
  added_positional_deletes BIGINT COMMENT 'Number of positional delete entries added',
  removed_positional_deletes BIGINT COMMENT 'Number of positional delete entries removed',
  total_positional_deletes BIGINT COMMENT 'Total positional delete entries after commit',
  added_equality_deletes BIGINT COMMENT 'Number of equality delete entries added',
  removed_equality_deletes BIGINT COMMENT 'Number of equality delete entries removed',
  total_equality_deletes BIGINT COMMENT 'Total equality delete entries after commit')
USING iceberg
PARTITIONED BY (days(__ts__), __write_id__);
```

---

## iceberg_scan_report

The `iceberg_scan_report` table captures detailed metrics for every Iceberg table scan operation. This includes information about planning duration, manifest and file scanning statistics, and filter expressions. It is useful for monitoring read performance, identifying inefficient queries, and optimizing table layouts.

:::note Enablement
The same `icebergMetrics` feature flag as `iceberg_commit_report` controls this table (enabled by default). Create the table, keep the Event Stream subsystem on, and scan metrics populate automatically.
:::

```sql
CREATE TABLE IF NOT EXISTS spark_catalog.iomete_system_db.iceberg_scan_report (
  __id__ STRING NOT NULL COMMENT 'Unique identifier for the report',
  __ts__ TIMESTAMP NOT NULL COMMENT 'Timestamp when the report was recorded',
  __write_id__ STRING NOT NULL COMMENT 'Write batch identifier',
  table_name STRING COMMENT 'Fully qualified name of the Iceberg table',
  snapshot_id BIGINT COMMENT 'Snapshot ID that was scanned',
  filter_expression STRING COMMENT 'Filter expression applied during the scan',
  schema_id INT COMMENT 'Schema ID used for the scan',
  projected_field_ids STRING COMMENT 'Comma-separated list of projected field IDs',
  projected_field_names STRING COMMENT 'Comma-separated list of projected field names',
  total_planning_duration_ns BIGINT COMMENT 'Total scan planning duration in nanoseconds',
  result_data_files BIGINT COMMENT 'Number of data files in the scan result',
  result_delete_files BIGINT COMMENT 'Number of delete files in the scan result',
  total_data_manifests BIGINT COMMENT 'Total number of data manifests',
  scanned_data_manifests BIGINT COMMENT 'Number of data manifests scanned',
  skipped_data_manifests BIGINT COMMENT 'Number of data manifests skipped',
  total_delete_manifests BIGINT COMMENT 'Total number of delete manifests',
  scanned_delete_manifests BIGINT COMMENT 'Number of delete manifests scanned',
  skipped_delete_manifests BIGINT COMMENT 'Number of delete manifests skipped',
  total_file_size_in_bytes BIGINT COMMENT 'Total size of scanned data files in bytes',
  total_delete_file_size_in_bytes BIGINT COMMENT 'Total size of delete files in bytes',
  skipped_data_files BIGINT COMMENT 'Number of data files skipped',
  skipped_delete_files BIGINT COMMENT 'Number of delete files skipped',
  indexed_delete_files BIGINT COMMENT 'Number of indexed delete files',
  equality_delete_files BIGINT COMMENT 'Number of equality delete files',
  positional_delete_files BIGINT COMMENT 'Number of positional delete files')
USING iceberg
PARTITIONED BY (days(__ts__), __write_id__);
```
