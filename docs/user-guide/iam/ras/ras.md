---
slug: /user-guide/ras/resource-bundles
title: RAS - Resource Bundles
description: Learn how to manage resource level permissions with resource bundles
last_update:
  date: 09/19/2025
  author: Soltan Garayev
---

import acorn from 'acorn';
import { mdxExpression } from 'micromark-extension-mdx-expression';
import Img from '@site/src/components/Img';

# Resource Authorization System

## Resource Bundle Management Overview

The Resource Authorization System (RAS) in IOMETE provides a comprehensive way to organize and manage access to your data platform resources through **Resource Bundles**. Think of resource bundles as organized containers that group related resources together and control who can access them.

RAS helps you:
- **Organize resources** into logical groups for easier management
- **Control access** by granting specific permissions to users and groups
- **Maintain security** by ensuring only authorized users can access sensitive resources
- **Simplify administration** through centralized permission management

<Img src="/img/user-guide/iam/ras/bundle-list.png" alt="Resource Bundle List" maxWidth="800px" />

## Understanding Resource Bundles

### What are Resource Bundles?

A resource bundle is a collection of related resources (called assets) with associated access permissions. Each bundle contains:

- **Assets**: The actual resources like compute clusters, Spark jobs, storage configurations, and workspaces
- **Permissions**: Specific access rights granted to users and groups for each type of resource
- **Ownership**: Who manages and controls the resource bundle

### Resource Bundle Ownership

Bundles can be owned by:
- **Individual Users**: Only the specific user can manage the resource bundle
- **Groups**: Any member of the group (including nested group members) can manage the resource bundle

## Creating Your First Resource Bundle

Follow these steps to create a new resource bundle:

1. **Navigate to Resource Bundle Management**
   - Open the IOMETE Console
   - Go to the **Other** section in Domain page
   - Click on **Bundles** in the navigation menu


2. **Start Resource Bundle Creation**
   - Click the **New Resource Bundle** button
   - A new resource bundle creation form will appear


3. **Fill in Resource Bundle Details**
   - **Name**: Enter a unique, descriptive name
   - **Description**: Add an optional description explaining the resource bundle's purpose
   - **Owner**: Choose either yourself or a group as the resource bundle owner


4. **Create the Resource Bundle**
   - Click **Create** to save your new resource bundle
   - You'll see a confirmation message and be redirected to the resource bundle list


<Img src="/img/user-guide/iam/ras/create-bundle.png" alt="Create Resource Bundle" maxWidth="800px" />

## Managing Resource Bundle Assets

### Adding Resources to Your Resource Bundle

Once you have a resource bundle, you can add resources to it:

**Create New Resource (Compute)**
- Click the **New Compute Cluster** button in **Compute** page  
- From the resource bundle list, select a resource bundle to add compute


<Img src="/img/user-guide/iam/ras/compute-create-bundle.png" alt="Create Compute with Bundle" maxWidth="800px" />


### Viewing Resource Bundle Contents

To see what resources are in a resource bundle:

1. Open the resource bundle from the resource bundle list
2. The **Resources** section shows all resources grouped by type
3. Each resource displays its name and current status

<Img src="/img/user-guide/iam/ras/bundle-assets.png" alt="Bundle Resources" maxWidth="800px" />

### Transferring Assets Between Resource Bundles

You can move assets from one resource bundle to another:

1. **Open Source Resource Bundle**
   - Navigate to the resource bundle containing the assets you want to move
   - Go to the **Resources** tab

2. **Initiate Transfer**
   - Select the assets you want to transfer
   - Click **Transfer**
   - Choose the **Destination Resource Bundle** from the dropdown
   - Confirm the transfer


:::info **Note**  
Only resource bundle owners can transfer assets out of their resource bundles.
:::

## Setting Up Permissions

### Understanding Permission Types

Different resource types have different available permissions

### Granting Access to Users and Groups

To give others access to your resource bundle resources:

1. **Open Resource Bundle Permissions**
   - Navigate to your resource bundle
   - Click on the **Permissions** tab


<Img src="/img/user-guide/iam/ras/bundle-permissions-list.png" alt="Bundle Permissions" maxWidth="800px" />

2. **Add New Permissions**
   - Click **New Permission**
   - Select the **Actor Type** you want to grant access to
   - Choose **Users** or **Groups** to grant permissions to
   - Select the specific **Permissions** to grant
   - Click **Preview** to navigate Preview page and confirm permission set
   - Click **Save**


3. **Set Specific Permissions**
   - For each resource type, select the appropriate permissions
   - Remember: only grant the minimum permissions needed
   - Different users/groups can have different permission levels

<Img src="/img/user-guide/iam/ras/bundle-new-permissions.png" alt="Bundle New Permissions" maxWidth="800px" />

### Managing Existing Permissions

To modify or remove existing permissions:

1. **View Current Permissions**
   - In the bundle's **Permissions** tab, you'll see all current permission grants
   - Permissions are organized by resource type and actor (user/group)

<Img src="/img/user-guide/iam/ras/edit-permission.png" alt="Bundle Edit Permissions" maxWidth="800px" />

2. **Edit Permissions**
   - Click the **Edit** button next to the permission you want to modify
   - Update the permission levels as needed
   - Click **Save** to apply changes

3. **Remove Permissions**
   - Click the **Delete** button next to the permission you want to remove
   - Confirm the removal when prompted


## Resource Bundle Administration

### Viewing All Resource Bundles

The resource bundle management interface provides different views:

**My Resource Bundles** (Default View)
- Shows resource bundles you
- Use this view for day-to-day resource bundle management

<Img src="/img/user-guide/iam/ras/bundle-list.png" alt="Bundles" maxWidth="800px" />

**Domain Resource Bundles**
- Shows all resource bundles within your current domain
- Useful for discovering resources in your organization

<Img src="/img/user-guide/iam/ras/domain-bundle-list.png" alt="Domain Bundles" maxWidth="800px" />

### Updating Resource Bundle Information

To modify resource bundle details:

1. **Open Resource Bundle Page**
   - Click on the resource bundle name from the list
   - Click **Edit** button to update resource bundle settings
   - Update the description or change ownership as needed
   - Click **Save Changes**

:::info **Note**  
Bundle names cannot be changed after creation.
:::

### Archiving Resource Bundles

When you no longer need a resource bundle:

1. **Ensure Resource Bundle is Empty**
   - Remove all assets from the bundle first
   - Resource Bundles with assets cannot be archived

2. **Open Resource Bundle Page**
    - Click on the resource bundle name from the list
    - Click **Archive** button to archive resource bundle

Archived resource bundles are hidden from normal views but can be restored if needed.

:::info **Note**  
Only resource bundle owners can archive their resource bundles.
:::

## Finding RAS in the IOMETE Console

### Common Workflows

**Daily Operations**
- Check "My resource bundles" to see resource bundles you own
- Add new resources to existing resource bundles as they're created
- Grant permissions to team members as projects evolve

**Administrative Tasks**
- Create resource bundles for new projects or teams
- Transfer ownership when team members change roles
- Archive resource bundles when projects are completed

**Troubleshooting Access Issues**
- Checkresource bundle permissions when users report access problems
- Verify resource-to-bundle associations
- Review group memberships for permission inheritance

## Best Practices

### Resource Bundle Organization
- **Create resource bundles by project or team** rather than by resource type
- **Use descriptive names** that clearly indicate the resource bundle's purpose
- **Keep related resources together** for easier management

### Permission Management
- **Follow the principle of least privilege** - grant only necessary permissions
- **Use groups instead of individual users** when possible for easier maintenance
- **Regularly review permissions** to ensure they're still appropriate

### Security Considerations
- **Monitor resource bundle ownership** and transfer ownership when team members leave
- **Audit permissions regularly** to prevent unauthorized access
- **Use domain separation** in multi-tenant environments

By following this guide, you'll be able to effectively use IOMETE's Resource Authorization System to organize your resources and control access across your data platform.