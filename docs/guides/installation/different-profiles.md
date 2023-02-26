---
title: Different profiles
last_update:
  date: 10/04/2022 
---

# Different profiles

Sometime need to separate accounts (ex. dev, stage, prod) by the access keys. 

Profiles  is a like alias for this access and secret key combinations. 

For detailed information see:  

[Named profiles for the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html)

### Using profile:

After successfully creating Profile (ex. iomete-stage) need to export profile to environment before running terraform. ex:

```bash

export AWS_PROFILE=iomete-stage

terraform init
terraform plan
terraform apply
```

P.S. Using profile into terraform code will create additional works (ex. need declare profile name in all providers).

We are reccomend to export profile to environment.