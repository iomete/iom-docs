---
title: Private Docker Registry
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

<!-- <head>
  <title>Private Docker Registry</title>
  <meta
    name="description"
    content="Private Docker Registry"
  />
</head> -->

___


## Private Docker Registries

While using **iomete** platform, at some point, you may required to use private docker registry, for example when creating spark job you may want to add a custom docker image stored in your private registry. 

In this section we will demonstrate on how to integrate private docker registries into **iomete** and we will create sample Spark Job using image from private registry. Also we are going to cover some popular registries ( *AWS ECR, DigitalOcean, Quay.io, DockerHub, GCP / Google Container Registry*) with helpful resources.

Let's get started.

To add new registry, open your iomete console, and go to settings panel and press `Create New` button.

![](/img/user-guide/docker-registry-list.png)

Adding private docker registry is similar to `docker login` command, you will need to fill in 4 fields:

`name` - name for registry (can not be change, should be unique, when deleting private docker registry your running or scheduled jobs can become invalid)
`host` - docker registry server (for Docker Hub it is just *http://docker.io*, see more examples below)
`username` - account credentials
`password` - account credentials

After filling the form you should see a new line in *Docker Registries* table.

Now to use your private docker registry go to *Jobs* menu and create a new job. Under the *Deployment* section type in private repository to **Docker Image** field. And on the left side of *Docker Image* field you will see dropdown with list of your private docker registries added to **iomete** platform. Choose corresponding one from dropdown list.

![](/img/user-guide/job-form-docker-registry.png)

Now Run the job to test. If username/password provided are correct you should see that job will successfully run.  

Below we will provide some helpful resources and detailed informations about popular Docker Container Registries.

## Docker Hub

Connecting Docker Hub is pretty easy, you should just type username / password from [https://hub.docker.com](https://hub.docker.com)

**Host**: `docker.io`
**Username**: `[your username]`
**Password**: `[your password]`

## AWS ECR

Adding AWS ECR is a bit tricky. You should generate password before adding it as a private docker registry.
To do so please execute following command from Terminal or any CLI tool:

```
aws ecr get-login-password --region [YOUR_REGION]
```

**Host**: `[your_aws_account_id].dkr.ecr.[your_region].amazonaws.com`
**Username**: `AWS` 
**Password**: `[GENERATED_PASSWORD]`
region - the ECR region, like `us-east-1`

For more information please refer to [https://docs.aws.amazon.com/AmazonECR/latest/userguide/registry_auth.html](https://docs.aws.amazon.com/AmazonECR/latest/userguide/registry_auth.html)

## Quay.io

**Host**: `quay.io`
**Username**: `[your username]`
**Password**: `[your password]`

## DigitalOcean

For Digital ocean you first need to create API Token. Navigating to **API** in the DigitalOcean control panel, under the section Token/Keys generate the token with Read access. Then use token for username and the password. 

**Host**: `registry.digitalocean.com`
**Username**: `[token]`
**Password**: `[token]`

## GCP

**Host**: `gcr.io`  (United States, for other regions please refer to https://cloud.google.com/container-registry/docs/pushing-and-pulling)
**Username**: `_json_key`
**Password**: `[full GCP service account JSON]`

The service account must have the IAM role `Storage Object Viewer` on the `artifacts.your-gcp-project.appspot.com` Google Cloud Storage bucket.

[https://cloud.google.com/container-registry/docs/advanced-authentication](https://cloud.google.com/container-registry/docs/advanced-authentication)

## Resources

- [https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/)
- [https://docs.aws.amazon.com/AmazonECR/latest/userguide/registry_auth.html](https://docs.aws.amazon.com/AmazonECR/latest/userguide/registry_auth.html)
- [https://docs.digitalocean.com/products/container-registry/how-to/use-registry-docker-kubernetes/](https://docs.digitalocean.com/products/container-registry/how-to/use-registry-docker-kubernetes/)