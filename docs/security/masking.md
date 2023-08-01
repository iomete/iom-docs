---
title: Data masking
description: Explore our use case on policy masking for phone numbers in the customers table.Discover effective data-masking strategies and implement them with ease.
---

**IOMETE** allows you to protect sensitive data in Hive in near real-time using dynamic resource-based column masking capabilities. With this feature, you can create policies that mask or anonymize specific columns containing sensitive data (e.g., **PII**, **PCI**, and **PHI**) dynamically in the Hive query output. For instance, you can choose to show only the first or last four characters of a **sensitive** data column, thus enhancing data security and privacy.

## Policy details

| Field               | Description                                                                                                                                                                                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Policy Name         | Enter an appropriate policy name. This name cannot be duplicated across the system. This field is mandatory. The policy is enabled by default.                                                                                                                                          |
| normal/override     | Enables you to specify an override policy. When override is selected, the access permissions in the policy override the access permissions in existing policies. This feature can be used with Add Validity Period to create temporary access policies that override existing policies. |
| Database            | Type in the applicable database name. The autocomplete feature displays available databases based on the entered text. Include is selected by default to allow access. Select Exclude to deny access..                                                                                  |
| Table               | Specifies a table-based. Select table, then type in the applicable table name. The autocomplete feature displays available tables based on the entered text. Include is selected by default to allow access. Select Exclude to deny access.                                             |
| Column              | Type in the applicable Hive column name. The autocomplete feature displays available columns based on the entered text. Include is selected by default to allow access. Select Exclude to deny access.                                                                                  |
| Description         | (Optional) Describe the purpose of the policy.                                                                                                                                                                                                                                          |
| Add Validity Period | Specify a start and end time for the policy.                                                                                                                                                                                                                                            |

## Allow Conditions

| Field               | Description                                                                                                                                                                                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Policy Name         | Enter an appropriate policy name. This name cannot be duplicated across the system. This field is mandatory. The policy is enabled by default.                                                                                                                                          |
| normal/override     | Enables you to specify an override policy. When override is selected, the access permissions in the policy override the access permissions in existing policies. This feature can be used with Add Validity Period to create temporary access policies that override existing policies. |
| Database            | Type in the applicable database name. The autocomplete feature displays available databases based on the entered text. Include is selected by default to allow access. Select Exclude to deny access..                                                                                  |
| Table               | Specifies a table-based. Select table, then type in the applicable table name. The autocomplete feature displays available tables based on the entered text. Include is selected by default to allow access. Select Exclude to deny access.                                             |
| Column              | Type in the applicable Hive column name. The autocomplete feature displays available columns based on the entered text. Include is selected by default to allow access. Select Exclude to deny access.                                                                                  |
| Description         | (Optional) Describe the purpose of the policy.                                                                                                                                                                                                                                          |
| Add Validity Period | Specify a start and end time for the policy.                                                                                                                                                                                                                                            |

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
