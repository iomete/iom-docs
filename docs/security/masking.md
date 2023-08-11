---
title: Data masking
description: Explore our use case on policy masking for phone numbers in the customers table.Discover effective data-masking strategies and implement them with ease.
---

**IOMETE** allows you to protect sensitive data in Hive in near real-time using dynamic resource-based column masking capabilities. With this feature, you can create policies that mask or anonymize specific columns containing sensitive data (e.g., **PII**, **PCI**, and **PHI**) dynamically in the Hive query output. For instance, you can choose to show only the first or last four characters of a **sensitive** data column, thus enhancing data security and privacy.

## Policy details

| Field               | Description                                                                                                                                                                                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Policy Name         | Enter an appropriate policy name. This name cannot be duplicated across the system. This field is mandatory. The policy is enabled by default.                                                                                                                                          |
| Normal/Override     | Enables you to specify an override policy. When override is selected, the access permissions in the policy override the access permissions in existing policies. This feature can be used with Add Validity Period to create temporary access policies that override existing policies. |
| Database            | Type in the applicable database name. The autocomplete feature displays available databases based on the entered text. Include is selected by default to allow access. Select Exclude to deny access..                                                                                  |
| Table               | Specifies a table-based. Select table, then type in the applicable table name. The autocomplete feature displays available tables based on the entered text. Include is selected by default to allow access. Select Exclude to deny access.                                             |
| Column              | Type in the applicable Hive column name. The autocomplete feature displays available columns based on the entered text. Include is selected by default to allow access. Select Exclude to deny access.                                                                                  |
| Description         | (Optional) Describe the purpose of the policy.                                                                                                                                                                                                                                          |
| Add Validity Period | Specify a start and end time for the policy.                                                                                                                                                                                                                                            |

## Allow Conditions

| Field        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Select Group | Specify one or more groups for whom this policy should be applied.If no group is specified, you must provide a user.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Select User  | Specify one or more users for whom this policy should be applied. If no user is specified, you must provide a group.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Permissions  | To create a masking filter for the specified users, groups, and roles, click Select Masking Option, then select a masking type: <br/> - **Redact** – mask all alphabetic characters with "x" and all numeric characters with "n". <br /> - **Partial mask**: show last 4 – Show only the last four characters. <br />- **Partial mask**: show first 4 – Show only the first four characters. <br />- **Hash** – Replace all characters with a hash of entire cell value. <br />- **Nullify** – Replace all characters with a NULL value. <br />- **Unmasked** (retain original value) – No masking is applied. <br />- **Date: show only year** – Show only the year portion of a date string and default the month and day to 01/01 <br />- **Custom** – Specify a custom masked value or expression. Custom masking can use any valid Hive UDF (Hive that returns the same data type as the data type in the column being masked). Masking conditions are evaluated in the order listed in the policy. The condition at the top of the Masking Conditions list is applied first, then the second, then the third, and so on. |
|  |

:::info
To add additional conditions, click on the '**Add new condition**' button.
:::

## **Use Case: Policy Masking for Phone Number in Customers Table**

Let's use the `customers` table for data-masking feature use cases as well.

This use case focuses on implementing a masking policy for the `phone_number` column within the `customers` table. The objective is to provide a certain level of data privacy while granting access to the data for the public group.

![data masking use](/img/security/masking/data-masking-use-case.png)

## **Policy details**

- Target Table: `customers`
- Target Column: `phone_number`
  ![data masking UI](/img/security/masking/data-masking-ui.png)

**Masking Rule:**

- The policy enforces that members of the public group can only view the last 4 digits of the `phone_number` column.
- All other digits preceding the last 4 should be masked or obfuscated, ensuring that sensitive information remains protected.

**Access Permissions:**

- The public group is granted read access to the `phone_number` column within the `customers` table.
- This allows the `public` group members to view the partially masked phone numbers for customers while ensuring that critical digits are concealed.
  ![data masking permission](/img/security/masking/data-masking-permission.png)

## **Query Results**

```sql
SELECT * from default.customers;
```

- **Sample Data Before Applying Masking Policy for public group:**
  Consider a few records in the `customers` table before the masking policy is applied:

  ![data masking example](/img/security/masking/data-masking-example.png)

- **Sample Data After Applying Masking Policy public group:**
  Once the masking policy is applied, the `phone_number` column will show different results based on the user group's access level.

  ![data masking sample](/img/security/masking/data-masking-sample.png)
