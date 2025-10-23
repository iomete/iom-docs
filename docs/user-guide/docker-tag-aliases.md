---
title: Docker Tag Aliases
description: Manage custom aliases for Docker image tags in IOMETE for easier version management
last_update:
  date: 10/22/2025
  author: Sourabh Jajoria
---

import Img from '@site/src/components/Img';

## Overview

Docker Tag Aliases allow you to define and manage custom aliases for Docker image tags. These aliases let you reference meaningful names (e.g., `latest`, `experimental`, `spark-3-latest`, `sample-job-latest`) instead of hard-coded version numbers in Spark jobs or deployment configurations. This provides greater flexibility in version management and simplifies updates across your deployment environment.

To view Docker Tag Aliases, navigate to the **Settings** menu item, switch to the **Docker Settings** tab, and then select the **Docker Tag Aliases** tab.

<Img src="/img/user-guide/docker-tag-aliases/docker-tag-alias.png" alt="Docker Tag Aliases" />

---

## Types of Tag Aliases

Docker Tag Aliases are organized into two categories:

### Global Aliases

Global aliases are predefined aliases managed by system administrators. These are defined in HELM files at the time of IOMETE installation and provide consistent references across all environments.

**Key characteristics:**
- Defined during platform installation
- Cannot be modified by users
- Provide standardized version references across the entire platform
- Ensure consistency across different domains and environments

### Domain Aliases

Domain aliases are custom aliases that you can create and manage within your specific domain. Use these to define your own tag mappings for easier version management and deployment flexibility.

**Key characteristics:**
- Created and managed by domain users
- Provide flexibility for domain-specific versioning
- Can be modified or deleted as needed
- Ideal for custom deployments and version control strategies

---

## Managing Domain Tag Aliases

### Adding a New Tag Alias

To add a new tag alias:

1. Navigate to **Settings** > **Docker Settings** > **Docker Tag Aliases** tab
2. Ensure you're in the **Domain aliases** section
3. Click on the **New tag alias** button
4. Enter the alias name (e.g., `latest`, `stable`, `experimental`)
5. Enter the corresponding Docker tag/version (e.g., `3.9.1`, `2.1.0`)
6. Click **Save** to save the tag alias

<Img src="/img/user-guide/docker-tag-aliases/docker-tag-alias-create.png" alt="Add new tag alias" />

### Changing an Alias Value

If you want to update the tag version for an existing alias:

1. Locate the alias in the Domain aliases table
2. Click on the three dots menu (⋮) next to the alias
3. Select **Change value**
4. Enter the new tag version
5. Click **Save**

<Img src="/img/user-guide/docker-tag-aliases/docker-tag-alias-edit.png" alt="Change alias value" />

<!-- ### Deleting a Tag Alias

To delete a tag alias:

1. Locate the alias in the Domain aliases table
2. Click on the three dots menu (⋮) next to the alias
3. Select **Delete**
4. In the confirmation dialog, type the alias name to confirm
5. Click **Delete**

:::warning
Deleting this alias may affect Spark Jobs, Compute Clusters, and Streaming Jobs that reference it. Ensure no active resources are using the alias before deletion.
:::

<Img src="/img/user-guide/docker-tag-aliases/docker-tag-alias-delete.png" alt="Delete alias" /> -->

---

## Using Tag Aliases in Spark Jobs

Tag aliases can be used in Spark jobs to reference Docker images without hard-coding specific version numbers. This makes it easier to update versions across multiple jobs by simply updating the alias mapping.

### Syntax

To use a tag alias in a Spark job, reference it using the `${alias_name}` syntax in the Docker image field:

```
iomete.azurecr.io/iomete/spark-py:${stable}
```

Instead of using a hard-coded version:

```
iomete.azurecr.io/iomete/spark-py:3.9.1
```

### Steps to Use Tag Aliases

1. Navigate to **Spark Jobs** and create or edit a job
2. In the **Application** section, locate the **Docker image** field
3. Enter the Docker image path with the alias syntax:
   - Example: `iomete.azurecr.io/iomete/spark-py:${stable}`
   - Example: `myregistry.io/custom-spark:${latest}`
4. Save and run the job

### Benefits

- **Easy version management**: Update the alias mapping once to affect all jobs using that alias
- **Consistent deployments**: Use meaningful names like `stable` or `production` across your environment
- **Simplified rollbacks**: Quickly revert to previous versions by updating the alias
- **Better organization**: Group related versions under meaningful aliases

---

## Best Practices

1. **Use descriptive alias names**: Choose names that clearly indicate the purpose (e.g., `stable`, `beta`, `prod-latest`)
2. **Document your aliases**: Maintain documentation of which aliases map to which versions
3. **Test before updating**: When changing an alias value, test with a single job before updating production workloads
4. **Avoid frequent changes**: Establish a process for updating aliases to prevent unexpected behavior
5. **Monitor dependencies**: Before deleting an alias, check which resources reference it
