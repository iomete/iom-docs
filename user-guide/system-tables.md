---
title: System Tables
description: Learn about IOMETE system tables used for internal platform operations, audit logging, and event streaming.
last_update:
  date: 02/17/2026
  author: IOMETE Documentation Team
---

IOMETE system tables are stored in the `spark_catalog.iomete_system_db` database. These tables are used internally by IOMETE and are created automatically during deployment if they don't already exist.

---

## platform_event_logs

The `platform_event_logs` table stores all platform audit events. This includes user actions, service operations, and other platform-level activities.

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
