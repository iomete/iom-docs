---
title: IAM Role For Data Lake Access
---

<!-- <head>
  <title>IAM Role For Data Lake Access</title>
  <meta
    name="description"
    content="IAM Role For Data Lake Access"
  />
</head> -->

___

### Creating an IAM Policy For Data Lake Location

The following step-by-step instructions describe how to configure access permissions for **iomete:**

- Log into your AWS Management Console
- Go to **Identity & Access Management (IAM) -> Policies -> Create Policy:** 

![Create Policy button on Policies page](/img/administration-guide/admin-guide-iam2-policy-create.png)


- In the policy editor, click the **JSON** tab
![](/img/administration-guide/admin-guide-create-policy.png)


- Add a policy document that will allow **iomete** to access the S3 bucket and folder.
The following policy (in JSON format) provides iomete with the required permissions to load or unload data using a single bucket and folder path. Copy and paste the text into the policy editor:

:::info
Provide **bucket** and **prefix** of your data lake location
:::

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
              "s3:PutObject",
              "s3:GetObject",
              "s3:GetObjectVersion",
              "s3:DeleteObject",
              "s3:DeleteObjectVersion"
            ],
            "Resource": "arn:aws:s3:::<bucket>/*"
        },
        {
            "Effect": "Allow",
            "Action": "s3:ListBucket",
            "Resource": "arn:aws:s3:::<bucket>"
        }
    ]
}
```

After review save it with the name: **iomete_datalake_access** 

#### Create the IAM Role

In the AWS Management Console, create an AWS IAM role to grant privileges on the S3 bucket containing your data files.



- Log into your AWS Management Console
- Go to **Identity & Access Management (IAM) -> Roles -> Create role:**

![](/img/administration-guide/admin-guide-Identity_and_Access_Management.png)

- Select **Another AWS account** as the trusted entity type
  
![Select Trusted Entity Page in AWS Management Console](/img/administration-guide/admin-guide-create_role.png)

- In the **Account ID** field, enter iomete account ID: **680330367469**
- Click the **Next: Permissions** button.
- Locate the policy you created in the previous step (**iomete_datalake_access**), and select this policy
- Go to **Review** and provide a name. For example, **default_iomete_access_role**
- Edit **default_iomete_access_role** role and switch to the **Trust relationships** section of the role:

![](/img/administration-guide/admin-guide-in_the_console.png)

Click the **Edit trust relationship** button and add the following JSON policy:


```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "<IAM ROLE PROVIDED BY IOMETE>" //iomete provided role will look like: arn:aws:iam::680330367469:role/dwh-master-role-frankfurt
      },
      "Action": "sts:AssumeRole",
      "Condition": {}
    }
  ]
}
```
- In the role summary, copy the Role ARN.
<br/>

![](/img/administration-guide/admin-guide-summary.png)