---
title: Data Security API
sidebar_label: Data Security API
description: Data Security API allows developers to manage data access, masking, and filtering efficiently.
---

import FAQSection from '@site/src/components/FAQSection';

## Introduction

Data Security API allows developers to manage data access, masking, and filtering efficiently.
Built upon Apache Ranger's principles, IOMETE simplifies the process while adding refinements that make the API more user-friendly.

This documentation focuses on the **Access Control API**, which enables developers to automate user access to data resources.
The API also supports masking sensitive data, defining row-level filters, and implementing tag-based access control, all of which contribute to a more secure data environment.

## Authentication

To interact with the IOMETE Data Security API, you create an access token and include it in the headers of your API requests.

Header Example:

```
X-API-Token: <Your-API-Token>
```

You generate tokens in the IOMETE UI under the settings. See [Personal Access Tokens](../access-tokens/personal.md) for details.

### Required Admin Role

Every endpoint on this page requires the **Data Security and Audit Manager** admin role. A valid token alone is not enough. If the user or service account behind the token does not hold this role, the request fails with `403 Forbidden`.

If you hold the **Read-Only Admin** role instead, you get read access only. You can call the `GET` endpoints to list and read policies, but not create, update, or delete them.

See [Admin Roles](../iam/admin-roles.md) to review and assign roles.

## Access Control API

The Access Control API lets you manage user access to databases, tables, and columns programmatically. It is the API equivalent of the [Access Policy](./access-policy.mdx) screens in the console.

You can use this API to:

- Grant or revoke access to specific users or groups.
- Define granular permissions on databases, tables, or even specific columns.
- Automate access control to ensure secure and compliant data usage.

### Creating an Access Policy

HTTP Method: `POST`  
Endpoint: `https://example.com/api/v1/admin/data-security/access/policy`

**Request Body Parameters**

- **isEnabled** (`boolean`): Enable or disable the access policy.
- **priority** (`string`): Optional. Can be `NORMAL` or `OVERRIDE`; defaults to `NORMAL`. An `OVERRIDE` policy takes precedence over `NORMAL` ones.
- **name** (`string`): A unique name for the access policy. Allows alpha-numeric characters and the hyphen `-`.
- **description** (`string`): Optional description of the policy.
- **validityPeriod** (`object`): Optional. Defines the start and end time of the policy. Includes:
  - **startTime** (`string`): Start time in the format `YYYY/MM/DD HH:mm:ss`.
  - **endTime** (`string`): End time in the format `YYYY/MM/DD HH:mm:ss`.
  - **timeZone** (`string`): Time zone (e.g., `Asia/Singapore`).
- **resources** (`array`): Specifies the databases, tables, and columns that the policy applies to. Each resource contains:
  - **databases** (`array`): List of databases (e.g., `["spark_catalog.default"]`). Catalog name should be specified as in the example.
  - **tables** (`array`): List of tables (e.g., `["demo_table"]` or `["*"]` - for all tables).
  - **columns** (`array`): List of columns (e.g., `["*"]` for all columns).
  - **databasesInclusionType** (`string`): Optional. Can be `INCLUDE` or `EXCLUDE`; defaults to `INCLUDE`.
  - **tablesInclusionType** (`string`): Optional. Can be `INCLUDE` or `EXCLUDE`; defaults to `INCLUDE`.
  - **columnsInclusionType** (`string`): Optional. Can be `INCLUDE` or `EXCLUDE`; defaults to `INCLUDE`.
- **allowPolicyItems** (`array`): Defines users or groups with access and the access types. Each policy item includes:
  - **groups** (`array`): List of groups (e.g., `["admin_group"]`).
  - **users** (`array`): List of users (e.g., `["admin"]`).
  - **roles** (`array`): List of role names granted this access (e.g., `["analysts"]`). These are policy subjects alongside users and groups, unrelated to the admin roles in [Required Admin Role](#required-admin-role).
  - **accesses** (`array`): List of access types (e.g., `["SELECT"]`). Possible values: `ALL`, `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `DROP`, `ALTER`, `READ`, `WRITE`, `REFRESH`, `CREATE_DATABASE`, `DROP_DATABASE`, `ALTER_DATABASE`.

:::warning Field names must match exactly

The API ignores unrecognized fields instead of rejecting them. If you misspell an inclusion type (for example `databaseInclusionType` instead of `databasesInclusionType`), the API drops your value and falls back to `INCLUDE`. The request still succeeds with a `201`, so an `EXCLUDE` rule written this way silently becomes an `INCLUDE` rule. Always check the response body to confirm the stored values.

:::

### Example Request

In this example, we create a policy that grants `SELECT` access to the `admin` user on the `demo_table` in the default database within the catalog `spark_catalog`.

Curl Example:

```bash showLineNumbers
curl -X POST https://example.com/api/v1/admin/data-security/access/policy \
-H "Content-Type: application/json" \
-H "X-API-Token: <Your-API-Token>" \
-d '{
  "isEnabled": true,
  "priority": "NORMAL",
  "name": "access-to-demo-api-example",
  "validityPeriod": {
    "startTime": "2024/10/10 00:00:00",
    "endTime": "2024/10/30 00:00:00",
    "timeZone": "Asia/Singapore"
  },
  "resources": [
    {
      "databases": ["spark_catalog.default"],
      "tables": ["demo_table"],
      "columns": ["*"],
      "databasesInclusionType": "INCLUDE",
      "tablesInclusionType": "INCLUDE",
      "columnsInclusionType": "INCLUDE"
    }
  ],
  "allowPolicyItems": [
    {
      "users": ["admin"],
      "accesses": ["SELECT"]
    }
  ]
}'
```

**Response**  
A successful request returns a status code of 201 and a JSON response with the details of the created policy.

**Status Code**: `201`  
**Response Body Example**:

```json showLineNumbers
{
  "id": 12345,
  "isEnabled": true,
  "priority": "NORMAL",
  "name": "access-to-demo-api-example",
  "validityPeriod": {
    "startTime": "2024/10/10 00:00:00",
    "endTime": "2024/10/30 00:00:00",
    "timeZone": "Asia/Singapore"
  },
  "resources": [
    {
      "databases": ["spark_catalog.default"],
      "databasesInclusionType": "INCLUDE",
      "tables": ["demo_table"],
      "tablesInclusionType": "INCLUDE",
      "columns": ["*"],
      "columnsInclusionType": "INCLUDE"
    }
  ],
  "allowPolicyItems": [
    {
      "users": ["admin"],
      "accesses": ["SELECT"]
    }
  ]
}
```

### Deleting an Access Policy

To delete an access policy, use the following `DELETE` request. Provide the unique `policy_id` in the URL, which you get from the policy creation or listing.

```bash showLineNumbers
curl -X DELETE https://example.com/api/v1/admin/data-security/access/policy/<policy_id> \
-H "X-API-Token: <Your-API-Token>"
```

### Listing Access Policies

To list all access policies, use the following `GET` request.

```bash showLineNumbers
curl -X GET https://example.com/api/v1/admin/data-security/access/policy \
-H "X-API-Token: <Your-API-Token>"
```

### Updating an Access Policy

Updating a policy is similar to creating one, but requires the `policy_id` in the URL. You modify the policy details in the request body.

```bash showLineNumbers
curl -X PUT https://example.com/api/v1/admin/data-security/access/policy/123 \
-H "Content-Type: application/json" \
-H "X-API-Token: <Your-API-Token>" \
-d '{
  "id": 123,
  "isEnabled": false,
  "priority": "NORMAL",
  "name": "access-to-demo-api-example",
  "resources": [
    {
      "databases": ["spark_catalog.default"],
      "tables": ["demo_table"],
      "columns": ["*"],
      "databasesInclusionType": "INCLUDE",
      "tablesInclusionType": "INCLUDE",
      "columnsInclusionType": "INCLUDE"
    }
  ],
  "allowPolicyItems": [
    {
      "users": ["admin"],
      "accesses": ["SELECT"]
    }
  ]
}'
```

## Other Features

The same authentication, admin role and error handling rules apply to the other data security APIs. Each one follows the request and response shape shown above, so the sections below list only the base endpoint and point to the corresponding console documentation.

### Data Masking API

The Data Masking API masks sensitive data at the column level, showing only part of the data, or a transformed version of it, to specific users. See [Data Masking](./data-masking.mdx).

**Example Use Case**: Masking credit card numbers or personal identifiers.  
**Base Endpoint**: `https://example.com/api/v1/admin/data-security/mask/policy`

### Row-Level Filters API

The Row-Level Filters API defines row-level access policies, so users see only the rows in a table that match your conditions. See [Row-Level Filter](./row-level-filter.mdx).

**Example Use Case**: Restricting access to sales data from specific regions based on user roles.  
**Base Endpoint**: `https://example.com/api/v1/admin/data-security/filter/policy`

### Tag-Based Access Control API

With tag-based access control, you apply access policies based on metadata tags assigned to data resources. This manages access at scale by grouping data under tags. See [Tag-Based Access Policy](./tag-based-access-policy.mdx) and [Tag-Based Data Masking](./tag-based-data-masking.mdx).

**Example Use Case**: Tagging sensitive financial data and enforcing stricter access controls based on tags.  
**Base Endpoint**: `https://example.com/api/v1/admin/data-security/tag/access/policy`  
**Base Endpoint for tag-based masking policies**: `https://example.com/api/v1/admin/data-security/tag/mask/policy`

## Error Handling

The IOMETE Data Security API uses standard HTTP error codes to indicate request outcomes. Common errors include:

**400 Bad Request**: The request body is malformed or missing required fields.  
**401 Unauthorized**: The API token is invalid or missing.  
**403 Forbidden**: The token is valid, but the user or service account behind it lacks the required admin role. See [Required Admin Role](#required-admin-role).  
**404 Not Found**: The endpoint path is wrong. Check that it includes the `/admin/` segment.  
**500 Internal Server Error**: A server error occurred.

## FAQs

Common questions about managing policies through the API.

<FAQSection faqs={[
  {
    question: "How do I revoke access?",
    answer: "To revoke access, you can either delete the policy or modify it to remove the user or group from the allowPolicyItems."
  },
  {
    question: "What happens if conflicting policies exist?",
    answer: "A policy with OVERRIDE priority takes precedence over policies with NORMAL priority."
  }
]} />
