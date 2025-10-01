---
title: Data Security API
sidebar_label: Data Security API
description: Data Security API allows developers to manage data access, masking, and filtering efficiently.
---

## Introduction

Data Security API allows developers to manage data access, masking, and filtering efficiently.
Built upon Apache Ranger's principles, IOMETE simplifies the process while adding refinements that make the API more user-friendly.

This documentation focuses on the **Access Control API**, which enables developers to automate user access to data resources.
The API also supports masking sensitive data, defining row-level filters, and implementing tag-based access control, all of which contribute to a more secure data environment.

## Authentication

To interact with the IOMETE Data Security API, users need to create an access token and include it in the headers of API requests.

Header Example:

```
X-API-Token: <Your-API-Token>
```

Tokens can be generated in the IOMETE UI under the settings. Please refer to [this documentation](../create-a-personal-access-token) for more info.

## Access Control API

The Access Control API allows developers to manage user access to databases, tables, and columns programmatically.

You can use this API to:

- Grant or revoke access to specific users or groups.
- Define granular permissions on databases, tables, or even specific columns.
- Automate access control to ensure secure and compliant data usage.

### Creating Access Policy

HTTP Method: `POST`  
Endpoint: `https://example.com/api/v1/data-security/access/policy`

**Request Body Parameters**

- **isEnabled** (`boolean`): Enable or disable the access policy.
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
- **databaseInclusionType** (`string`): Can be `INCLUDE` or `EXCLUDE`.
- **tableInclusionType** (`string`): Can be `INCLUDE` or `EXCLUDE`.
- **columnInclusionType** (`string`): Can be `INCLUDE` or `EXCLUDE`.
- **allowPolicyItems** (`array`): Defines users or groups with access and the access types. Each policy item includes:
  - **groups** (`array`): List of groups (e.g., `["admin_group"]`).
  - **users** (`array`): List of users (e.g., `["admin"]`).
  - **accesses** (`array`): List of access types (e.g., `["SELECT"]`). Possible values: `ALL`, `SELECT`, `UPDATE`, `CREATE`, `DROP`, `ALTER`, `WRITE`.

### Example Request

In this example, we create a policy that grants `SELECT` access to the `admin` user on the `demo_table` in the default database within the catalog `spark_catalog`.

Curl Example:

```bash showLineNumbers
curl -X POST https://example.com/api/v1/data-security/access/policy \
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
      "databaseInclusionType": "INCLUDE",
      "tableInclusionType": "INCLUDE",
      "columnInclusionType": "INCLUDE"
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
  "id": "12345",
  "isEnabled": true,
  "priority": "NORMAL",
  "name": "access-to-resource-api-example",
  "validityPeriod": {
    "startTime": "2024/10/10 00:00:00",
    "endTime": "2024/10/30 00:00:00",
    "timeZone": "Asia/Singapore"
  },
  "resources": [
    {
      "databases": ["spark_catalog.default"],
      "tables": ["demo_table"],
      "columns": ["*"]
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

### Delete Access Policy API

To delete an access policy, you can use the following `DELETE` request. You need to provide the unique `policy_id` in the URL, which you get from the policy creation or listing.

```bash showLineNumbers
curl -X DELETE https://example.com/api/v1/data-security/access/policy/<policy_id> \
-H "X-API-Token: <Your-API-Token>"
```

### List Access Policies

To list all access policies, you can use the following `GET` request.

```bash showLineNumbers
curl -X GET https://example.com/api/v1/data-security/access/policy \
-H "X-API-Token: <Your-API-Token>"
```

### Update Access Policy

Updating policy is similar to creation but requires the `policy_id` in the URL. You can modify the policy details in the request body.

```bash showLineNumbers
curl -X PUT https://example.com/api/v1/data-security/access/policy/123 \
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
      "databaseInclusionType": "INCLUDE",
      "tableInclusionType": "INCLUDE",
      "columnInclusionType": "INCLUDE"
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

### Data Masking API

The Data Masking API allows masking of sensitive data at the column level. This feature is useful for protecting sensitive information by showing only a part or transformed version of the data to specific users.

**Example Use Case**: Masking credit card numbers or personal identifiers.  
**Base Endpoint**: `https://example.com/api/v1/data-security/mask/policy`

### Row-level Filters API

The Row-level Filters API enables defining row-level access policies, allowing users to access only specific rows in a table based on conditions.

**Example Use Case**: Restricting access to sales data from specific regions based on user roles.  
**Base Endpoint**: `https://example.com/api/v1/data-security/filter/policy`

### Tag-based Access Control API

With Tag-based Access Control, you can apply access policies based on metadata tags assigned to data resources. This is useful for managing access at scale by grouping data under tags.

**Example Use Case**: Tagging sensitive financial data and enforcing stricter access controls based on tags.  
**Base Endpoint**: `https://example.com/api/v1/data-security/tag/access/policy`  
**Base Endpoint for Tag based Masking policies**: `https://example.com/api/v1/data-security/tag/mask/policy`

## Error Handling

The IOMETE Data Security API uses standard HTTP error codes to indicate request outcomes. Common errors include:

**400 Bad Request**: The request body is malformed or missing required fields.  
**401 Unauthorized**: The API token is invalid or missing.  
**403 Forbidden**: The user does not have permission to perform the requested action.  
**500 Internal Server Error**: A server error occurred.

import FAQSection from '@site/src/components/FAQSection';

## FAQs

<FAQSection faqs={[
  {
    question: "How do I revoke access?",
    answer: "To revoke access, you can either delete the policy or modify it to remove the user or group from the allowPolicyItems."
  },
  {
    question: "What happens if conflicting policies exist?",
    answer: "The policy with higher priority (HIGH) will override policies with NORMAL priority."
  }
]} />
