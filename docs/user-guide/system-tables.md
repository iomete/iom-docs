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
