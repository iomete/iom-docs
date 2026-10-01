---
title: Git Integration
description: This documentation provides details on how to integrate Git with SQL Editor.
last_update:
  date: 09/30/2026
  author: Shashank Chaudhary
---

import Img from '@site/src/components/Img';

Starting from version 3.1.0 of the IOMETE platform, we now support Git integration, with GitLab as our initial Git provider. The initial support focuses on hosting SQL worksheets in Git repositories that can be accessed through the SQL editor tab within the platform. This document outlines the process for setting up the integration and accessing SQL files hosted on Git.

## Registering a Git Repo

To integrate a repository within the platform, first register it through the Git Integration tab or by using the "Checkout Git Repo" button directly from the SQL editor.

<Img src="/img/integrations/git/git-integration/checkout-git-repo.png" alt="checkout repo"/>

We can now fill in the details requested.

Git Repository URL: The URL of the repository for the current configuration. eg. https://gitlab.com/namespace/project.git

Name: The name that you want to be used in, used to display the specified repository.

Provider: The Git provider in use. Currently only Gitlab is supported.

<Img src="/img/integrations/git/git-integration/create-git-folder.png" alt="create git folder"/>

## Select or create a token

Once all the repository related details are filled in, we need to provide the token via which we want to interact with git.

If you don't have a token configured already we can create a new token by clicking on the Create new button inside token drop down.

<Img src="/img/integrations/git/git-integration/create-token.png" alt="create token"/>

Tokens can also be managed from the Git Integration tab.

A token belongs to the user who created it, and each user links their own token to a repository. Users without the **Manage Git Repository** permission can still link their token from the repository's **Configure** option in the SQL Editor. See [Git Repository Worksheets](/user-guide/sql-editor/collaboration#git-repository-worksheets).

Token values are never shown after you save them. To change a token, use **Configure** on it, and leave the token field blank to keep the current value.

Once the token is set click on the create button to register the repository.

We can now see the content of the git repo and execute the Sql queries present in them. 

<Img src="/img/integrations/git/git-integration/execute-sql.png" alt="execute sql"/>




