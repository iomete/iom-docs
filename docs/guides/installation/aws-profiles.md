---
title: Using AWS Profiles
last_update:
  date: 10/04/2022 

---

# Using AWS Profiles
    
A *named profile* is a collection of settings and credentials that you can apply to an AWS CLI command. When you specify a profile to run a command, the settings and credentials are used to run that command. Multiple *named profiles* can be stored in the `config` and `credentials` files.
    
For detailed information see:  
    
[Named profiles for the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html)
    
### Using profile:
    
After successfully creating Profile (ex. iomete-stage) need to export the profile to the environment before running terraform. ex:

    ```bash
    export AWS_PROFILE=iomete-stage

    Then run terraform code as below

    terraform init
    terraform plan
    terraform apply
    ```

P.S. Using the profile in terraform code will create additional works (ex. need to declare profile name in all providers).
    
We recommend exporting the profile to the environment before running the code. 
    
If using only one account (only default profile) no need to export or separate the AWS profile.
    
Just run the Terraform code.