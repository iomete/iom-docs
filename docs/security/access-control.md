---
title: Access control
description: These policies determine who can perform specific actions (read, write, execute, admin) on resources within the Hadoop ecosystem. Access Control Policies can be configured at a granular level to ensure precise control over user privileges.
---



These policies determine who can perform specific actions (read, write, execute, admin) on resources within the Hadoop ecosystem. Access Control Policies can be configured at a granular level to ensure precise control over user privileges.

## Policy details

| Field               | Description                                                                                                                                                                                                                                                                             |
|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Policy Name         | Enter an appropriate policy name. This name cannot be duplicated across the system. This field is mandatory. The policy is enabled by default.                                                                                                                                          |
| Normal/override     | Enables you to specify an override policy. When override is selected, the access permissions in the policy override the access permissions in existing policies. This feature can be used with Add Validity Period to create temporary access policies that override existing policies. |
| Database            | Type in the applicable database name. The autocomplete feature displays available databases based on the entered text. Include is selected by default to allow access. Select Exclude to deny access.                                                                                   |
| Table               | Specifies a table-based. Select table, then type in the applicable table name. The autocomplete feature displays available tables based on the entered text. Include is selected by default to allow access. Select Exclude to deny access.                                             |
| Column              | Type in the applicable Hive column name. The autocomplete feature displays available columns based on the entered text. Include is selected by default to allow access. Select Exclude to deny access.                                                                                  |
| Description         | (Optional) Describe the purpose of the policy.                                                                                                                                                                                                                                          |
| Add Validity Period | Specify a start and end time for the policy.                                                                                                                                                                                                                                            |

## Allow Conditions

| Field        | Description                                                                                                                    |
|--------------|--------------------------------------------------------------------------------------------------------------------------------|
| Select Role  | Specify one or more roles for whom this policy should be applied                                                               |
| Select Group | Specify one or more groups for whom this policy should be applied                                                              |
| Select User  | Specify one or more users for whom this policy should be applied                                                               |
| Permissions  | Add or edit permissions: Select, Update, Create, Drop, Alter, Index, Lock, All, ReplAdmin, Service Admin, Select/Deselect All. |


To add additional conditions, click on the '**Add new condition**' button. The conditions are evaluated in the order they appear in the policy. The top condition is applied first, followed by the second, third, and so on.

Additionally, you can use "Deny All Other Accesses" to block access for all users, groups, and roles not explicitly specified in the allow conditions of the policy. This ensures that only those specified in the allow conditions are granted access, and all others are denied access.

## Access control use cases

## Access **Policy evaluation flow**

Find all the policies that apply to the requested resource. Once the policies are found, they are evaluated in the following order:

1. If the request matches any deny conditions and not excluded by deny exclusions in any of the policies, then the request is **denied**.
2. If the request matches any allow conditions and not excluded with allow exclusions, then the request is **allowed**.

![accces-policy-evaliation-flow](/img/security/access-control-use-case/access-control-logic.png)

## **Use Case: Payment Database Access**

This use case establishes the access rules for the `payment_db` database. It gives the `finance` group full access, while all other groups are excluded, apart from the `data_engs` group. This allows for potential access to be extended to `data_engs` group members.

```
Resources:
  - databases: payment_db:[*]
Allow: groups:[finance] permissions:[*]
Deny:  groups:[public] permission:[*]
Exclude from deny:
    - groups:[data_engs] permissions:[select]
    - groups:[finance] permissions:[*]

```

![access policy-use-case](/img/security/access-control-use-case/access-policy-use-case.png)

**Explanation**:

- The `Resources` section outlines the specific area this policy relates to. In this instance, it’s all tables/views found within the `payment_db` database.
    
    ![access policy resources](/img/security/access-control-use-case/access-policy-resources.png)
    

- The `Allow` section specifies which groups are granted access to the aforementioned resources. For this policy, the `finance` group has full access to all tables/views in the `payment_db` database.
    
    ![access policy conditions](/img/security/access-control-use-case/access-policy-conditions.png)
    

- The `Deny` section identifies the groups that are not permitted to access these resources. Here, the `public` group is explicitly denied access to all tables/views within the `payment_db` database.
    
    ![deny condition](/img/security/access-control-use-case/access-policy-deny-conditions.png)
    

- The `Exclude from deny` section lists the groups that are exempted from the access denial rule.
    
    ![exclude from deny](/img/security/access-control-use-case/exclude-from-deny-conditions.png)
    

> **Important**: Being excluded from denial doesn’t automatically grant resource access. It simply means that if there’s another rule permitting access, that rule will apply. In this case, the data_engs group is exempt from the denial rule, but they don’t have access to the resources since there isn’t an additional rule granting them access.
> 

> **Note**: If the Exclude from deny rule is not applied, all groups mentioned in the Deny section would be completely barred from accessing the specified resources, regardless of any other Allow rules that might exist. In this scenario, if the data_engs group was not specified in the Exclude from deny rule, they would be denied access to the payment_db database, even if there was another rule elsewhere that allowed them access. The Deny rule takes precedence over any conflicting Allow rules unless an Exclude from deny rule is specifically applied.
> 

## **Use Case: Validity Period**

 Validity Period can be applied to the policies. When validity period is defined, the policy will be active only during the specified time period.

![validity period](/img/security/access-control-use-case/access-policy-validity-period.png) 

> **Note**: Multiple date ranges can be specified in the validity period.
>  

 ![add validity period](/img/security/access-control-use-case/add-policy-validity-period.png)

 > **Note**: If you would like the policy to override all other policies during its validity period, select override.
> 

![edit validity period](/img/security/access-control-use-case/edit-validity-period.png) 