---
title: Git Integration
description: This documentation provides details on how to integrate Git with SQL Editor.
last_update:
  date: 05/02/2025
  author: Alokh Pullanikkatt
---

import Img from '@site/src/components/Img';

Starting with version 3.1.0 of the IOMETE platform, we now support Git integration, with GitLab as our initial Git provider. The initial support focuses on hosting SQL worksheets in Git repositories that can be accessed through the SQL editor tab within the platform. This document outlines the process for setting up the integration and accessing SQL files hosted on Git.

## Registering a Git Repo

To integrate a repository within the platform, first register it through the Git Integration tab. You can also access the Git Integration window directly from the SQL editor using the "Checkout Git Repo" button.

<Img src="/img/integrations/git/git-integration/checkout-git-repo.png" alt="checkout repo"/>

Click on add new and fill in the details requested.
Name: The name that you want to be used in, used to display the specified repository.

Provider: The Git provider in use. Currently only Gitlab is supported

Git Server URL: The URL of the Git provider (GitLab) for the current configuration. In most cases it would be https://gitlab.com , but when using a self-hosted GitLab instance, provide the URL of your self-hosted GitLab server.

Project ID: Project ID of the repository that you want integrated. This can be retrieved from the Gitlab UI.

<Img src="/img/integrations/git/git-integration/project-id.png" alt="project id"/>

Once all the details are filled in click on create to save the repo.

<Img src="/img/integrations/git/git-integration/create-repo.png" alt="create repo"/>

## Creating and Configuring a Token

When we open the SQL Editor tab, we can now see that the integrated repo is visible in the repositories section.

<Img src="/img/integrations/git/git-integration/sql-editor-tab.png" alt="sql editor tab"/>

To browse Git repositories integrated within the platform, users must provide a GitLab access token with appropriate permissions for both platform access and repository browsing privileges for the specific registered repository.

In the Git Integration Tab, register the token via which we want to access Git.

<Img src="/img/integrations/git/git-integration/create-token.png" alt="create token"/>

Once this is done, navigate back to SQL and click on Configure token and choose the token from the list of registered tokens.

<Img src="/img/integrations/git/git-integration/configure-token.png" alt="configure token"/>

As soon as we configure the token, we can see the content of the git repo and execute the Sql queries present in them. 

<Img src="/img/integrations/git/git-integration/execute-sql.png" alt="execute sql"/>




