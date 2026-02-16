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
  __id__ STRING NOT NULL,
  __ts__ TIMESTAMP NOT NULL,
  __write_id__ STRING NOT NULL,
  user_id STRING,
  occurred_at TIMESTAMP,
  service STRING,
  action STRING,
  success BOOLEAN,
  payload STRING)
USING iceberg
PARTITIONED BY (days(__ts__), __write_id__);
```

| Column | Type | Description |
|--------|------|-------------|
| `__id__` | STRING | Unique identifier for the event |
| `__ts__` | TIMESTAMP | Timestamp when the event was recorded |
| `__write_id__` | STRING | Write batch identifier |
| `user_id` | STRING | ID of the user who triggered the event |
| `occurred_at` | TIMESTAMP | When the event actually occurred |
| `service` | STRING | The service that generated the event |
| `action` | STRING | The action that was performed |
| `success` | BOOLEAN | Whether the action was successful |
| `payload` | STRING | Additional event data in JSON format |

---

## data_access_audit

The `data_access_audit` table stores Ranger audit events. This includes all data access attempts, policy evaluations, and access control decisions.

```sql
CREATE TABLE IF NOT EXISTS spark_catalog.iomete_system_db.data_access_audit (
  __id__ STRING NOT NULL,
  __ts__ TIMESTAMP NOT NULL,
  __write_id__ STRING NOT NULL,
  repositoryName STRING,
  repositoryType INT,
  clientIP STRING,
  accessType STRING,
  resourcePath STRING,
  logType STRING,
  agentId STRING,
  resultReason STRING,
  aclEnforcer STRING,
  requestData STRING,
  resourceType STRING,
  accessResult INT,
  eventDurationMS BIGINT,
  eventId STRING,
  zoneName STRING,
  policyId BIGINT,
  clientType STRING,
  eventCount INT,
  seqNum INT,
  sessionId STRING,
  eventTime BIGINT,
  additionalInfo STRING,
  clusterName STRING,
  agentHostname STRING,
  action STRING,
  user STRING,
  serviceType INT,
  serviceName STRING,
  policyVersion INT)
USING iceberg
PARTITIONED BY (days(__ts__), __write_id__);
```

| Column | Type | Description |
|--------|------|-------------|
| `__id__` | STRING | Unique identifier for the audit record |
| `__ts__` | TIMESTAMP | Timestamp when the record was created |
| `__write_id__` | STRING | Write batch identifier |
| `repositoryName` | STRING | Name of the repository being accessed |
| `repositoryType` | INT | Type of repository |
| `clientIP` | STRING | IP address of the client |
| `accessType` | STRING | Type of access requested |
| `resourcePath` | STRING | Path to the resource being accessed |
| `logType` | STRING | Type of log entry |
| `agentId` | STRING | ID of the Ranger agent |
| `resultReason` | STRING | Reason for the access result |
| `aclEnforcer` | STRING | ACL enforcer used |
| `requestData` | STRING | Additional request data |
| `resourceType` | STRING | Type of resource |
| `accessResult` | INT | Result of the access attempt |
| `eventDurationMS` | BIGINT | Duration of the event in milliseconds |
| `eventId` | STRING | Unique event identifier |
| `zoneName` | STRING | Security zone name |
| `policyId` | BIGINT | ID of the policy evaluated |
| `clientType` | STRING | Type of client |
| `eventCount` | INT | Number of events |
| `seqNum` | INT | Sequence number |
| `sessionId` | STRING | Session identifier |
| `eventTime` | BIGINT | Event time as epoch |
| `additionalInfo` | STRING | Additional information |
| `clusterName` | STRING | Name of the cluster |
| `agentHostname` | STRING | Hostname of the agent |
| `action` | STRING | Action performed |
| `user` | STRING | User who performed the action |
| `serviceType` | INT | Type of service |
| `serviceName` | STRING | Name of the service |
| `policyVersion` | INT | Version of the policy |
