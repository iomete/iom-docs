# Saving Terraform State

To move or save Terraform state files to an Amazon S3 bucket, follow these steps:

1. Create an S3 bucket in your AWS account in any region.
2. Add the Terraform code to a configuration file, such as **`main.tf`**.

```bash

terraform {
  backend "s3" {
    bucket         = "your-bucket-name"
    region         = "aws-region"
    key            = "terraform.tfstate"
  }
}
```

1. Run Terraform 

```bash
terraform init
terraform plan
terraform apply
```

If the output that you receive is similar to the example displayed below, then you can be assured that your code has been executed successfully.

> **“Successfully configured the backend "s3"! Terraform will automatically
use this backend unless the backend configuration changes.”**
> 

```bash
terraform init

Successfully configured the backend "s3"! Terraform will automatically
use this backend unless the backend configuration changes.

Initializing provider plugins...
- Reusing previous version of hashicorp/kubernetes from the dependency lock file
- Reusing previous version of hashicorp/tls from the dependency lock file
- Reusing previous version of hashicorp/aws from the dependency lock file
- Reusing previous version of hashicorp/null from the dependency lock file
- Reusing previous version of hashicorp/helm from the dependency lock file
- Reusing previous version of gavinbunney/kubectl from the dependency lock file
- Reusing previous version of hashicorp/cloudinit from the dependency lock file
- Reusing previous version of hashicorp/local from the dependency lock file
- Reusing previous version of hashicorp/random from the dependency lock file
- Using previously-installed hashicorp/local v2.1.0
- Using previously-installed hashicorp/kubernetes v2.17.0
- Using previously-installed hashicorp/aws v4.53.0
- Using previously-installed hashicorp/helm v2.8.0
- Using previously-installed hashicorp/cloudinit v2.2.0
- Using previously-installed hashicorp/random v3.1.0
- Using previously-installed hashicorp/tls v4.0.4
- Using previously-installed hashicorp/null v3.1.0
- Using previously-installed gavinbunney/kubectl v1.14.0

Terraform has been successfully initialized!

You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure. All Terraform commands
should now work.

If you ever set or change modules or backend configuration for Terraform,
rerun this command to reinitialize your working directory. If you forget, other
commands will detect it and remind you to do so if necessary.
```

To verify that the **`.tfstate`** file has been saved to your bucket, you can check the contents of the bucket to confirm that the file exists. If the file is present, it means that the state file has been successfully saved.