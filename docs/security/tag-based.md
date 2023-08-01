---
title: Tag based policy
description: These policies determine who can perform specific actions (read, write, execute, admin) on resources within the Hadoop ecosystem. Access Control Policies can be configured at a granular level to ensure precise control over user privileges.
---


These policies determine who can perform specific actions (read, write, execute, admin) on resources within the Hadoop ecosystem. Access Control Policies can be configured at a granular level to ensure precise control over user privileges.

## Policy details

| Field 	| Description 	|
|---	|---	|
| Policy Name 	| Enter an appropriate policy name. This name cannot be duplicated across the system. This field is mandatory. The policy is enabled by default. 	|
| normal/override 	| Enables you to specify an override policy. When override is selected, the access permissions in the policy override the access permissions in existing policies. This feature can be used with Add Validity Period to create temporary access policies that override existing policies. 	|
| TAG 	| Provide the relevant tag name that should be applied. 	|
| Description 	| (Optional) Describe the purpose of the policy. 	|
| Add Validity Period 	| Specify a start and end time for the policy. 	|

## Allow Conditions

| Field 	| Description 	|
|---	|---	|
| Select Role 	| Specify one or more roles for whom this policy should be applied 	|
| Select Group 	| Specify one or more groups for whom this policy should be applied 	|
| Select User 	| Specify one or more users for whom this policy should be applied 	|
| Permissions 	| Add or edit permissions: Select, Update, Create, Drop, Alter, Index, Lock, All, ReplAdmin, Service Admin, Select/Deselect All. 	|

To add additional conditions, click on the '**Add new condition**' button. The conditions are evaluated in the order they appear in the policy. The top condition is applied first, followed by the second, third, and so on.

Additionally, you can use "Deny All Other Accesses" to block access for all users, groups, and roles not explicitly specified in the allow conditions of the policy. This ensures that only those specified in the allow conditions are granted access, and all others are denied access.