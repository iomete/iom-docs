---
title: Row Level Filter
description: Row-level filtering simplifies Hive queries by pushing the access restriction logic down into the Hive layer. With this approach, Hive applies access restrictions automatically whenever data access is attempted.
---

import Details from "./components/Details";

IOMETE Row-level Filter policies allow users to access only a subset of data based on the context in which they interact with the data. When utilizing a table with a row-filter, only a portion of rows will be visible to the user – as determined by the filter configuration within the row-filter policy.

<hr/>

## Policy details

<Details/>

| Field               | Description                                                                                                                                                                                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Policy Name         | Enter an appropriate policy name. This name cannot be duplicated across the system. This field is mandatory. The policy is enabled by default.                                                                                                                                          |
| Normal/Override     | Enables you to specify an override policy. When override is selected, the access permissions in the policy override the access permissions in existing policies. This feature can be used with Add Validity Period to create temporary access policies that override existing policies. |
| Database            | Type in the applicable database name. The autocomplete feature displays available databases based on the entered text. Include is selected by default to allow access. Select Exclude to deny access..                                                                                  |
| Table               | Specifies a table-based. Select table, then type in the applicable table name. The autocomplete feature displays available tables based on the entered text. Include is selected by default to allow access. Select Exclude to deny access.                                             |
| Description         | (Optional) Describe the purpose of the policy.                                                                                                                                                                                                                                          |
| Add Validity Period | Specify a start and end time for the policy.                                                                                                                                                                                                                                            |

## Allow Conditions

| Field          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Select Group   | Specify one or more groups for whom this policy should be applied. If no group is specified, you must provide a user.                                                                                                                                                                                                                                                                                                                                                                                                           |
| Select User    | Specify one or more users for whom this policy should be applied. If no user is specified, you must provide a group.                                                                                                                                                                                                                                                                                                                                                                                                            |
| Access Types   | Currently select is the only available access type. This will be used in conjunction with the WHERE clause specified in the Row Level Filter field.                                                                                                                                                                                                                                                                                                                                                                             |
| Add Row Filter | To create a row filter for the specified users, groups, and roles, Click Add Row Filter, then type a valid WHERE clause in the Enter filter expression box. <br /> <br />To allow Select access for the specified users and groups without row-level restrictions, do not add a row filter (leave the setting as "Add Row Filter"). <br /> <br />Filters are evaluated in the order listed in the policy. The filter at the top of the Row Filter Conditions list is applied first, then the second, then the third, and so on. |

<!-- burda table-i tam fix ede bilmedim -->

:::info
To add additional conditions, click on the `Add new condition` button. The conditions are evaluated in the order they appear in the policy. The top condition is applied first, followed by the second, third, and so on.
:::

## **Use Case: Policy Masking for Phone Number in Customers Table**

Let's use the `customers` table for row-level filtering feature use cases as well.

This use case focuses on implementing a row-level filtering policy for the `customers` table to restrict user access to customer records based on their respective countries. The objective is to ensure that users can only view records of customers located in the same country where they work. This policy will help maintain data privacy and comply with country-specific regulations.

![row-level-filtering](/img/security/row-level-filter/row-level-example5.png)

## **Policy details**

- Target Table: `customers` table in `default` database.

  ![row level table](/img/security/row-level-filter/row-level-example.png)

**Filtering rule:**

- The policy enforces that users can only access customer records from their own country-specific group.
- For instance, users belonging to the `us_employees` group can only access customer records for customers located in the United States. Similarly, users belonging to the `uk_employees` group can only access customer records for customers located in the United Kingdom.
- The filtering is applied dynamically based on the user's country-specific group membership.

**Group examples:**

- `us_employees`: For users working in the United States.
- `ca_employees`: For users working in the Canada.
- `uk_employees`: For users working in the United Kingdom.
- Other country-specific groups can be created for different regions as per requirements.
  ![row level conditions](/img/security/row-level-filter/row-level-example1.png)

:::info
Default access type in row-level-filter is `select`
:::

**Rationale:**

- By implementing this row-level filtering policy, we ensure that users can only access customer data relevant to their work location, minimizing the risk of unauthorized access to sensitive information.
- Users are restricted to view customer records within their country, promoting data privacy compliance and adhering to the principle of least privilege.

## **Query Results**

```sql
SELECT * from default.customers;
```

- **Sample Data Before Applying Row-Level-Filtering Policy:**
  Consider a few records in the `customers` table before the Row-Level-Filtering policy is applied:

  ![row level sample data](/img/security/row-level-filter/row-level-example2.png)

- **Sample Data After Row-Level-Filtering :**

  Once the Row-Level-Filtering policy is applied, the `rows` in `customers` table will show different results based on filtering.

  User `Olivia`, a member of `uk-employees` group:
  The result includes only customers in UK.

  ![row level use case](/img/security/row-level-filter/row-level-example3.png)

  User `Jane`, a member of `ca-employees` group:
  The result includes only customers in Canada.

  ![Untitled](/img/security/row-level-filter/row-level-example4.png)
