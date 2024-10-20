---
title: Nessie Catalog Integration
description: Configure IOMETE to connect to existing Nessie Catalogs.
last_update:
  date: 06/02/2024
  author: Vugar Dadalov
---

import Img from '@site/src/components/Img';

IOMETE supports integration with **Nessie Catalogs**, enabling advanced versioning of tables and schemas.

To set up a Nessie catalog, provide the following information:

- **Name**: The name of the catalog.
- **Warehouse**: The URL of an S3-compatible warehouse.
- **URI**: The API endpoint for Nessie.
- **Ref**: Name of the initial Nessie referance, usually main.

<Img src="/img/user-guide/spark-catalogs/create-external-nessie-catalog.png" alt="Create Nessie Catalog" />

- Authentication type **BEARER**: A token-based authentication method where the client must send a security token (a bearer token) with each request.

  <Img src="/img/user-guide/spark-catalogs/nessie-auth-bearer.png" alt="Nessie Catalog auth bearer" />

- Authentication type **OAuth2** is an open standard for access delegation and token-based authentication, providing secure access to resources without exposing user credentials directly. This option allows you to configure several parameters to authenticate via OAuth2:

  - **Issuer URL**: The URL of the authorization server responsible for issuing tokens.
  - **Token Endpoint**: The endpoint on the authorization server where the application sends the request to obtain an access token.
  - **Grant Type**: Defines the OAuth2 flow to use, such as authorization code, client credentials, or password-based flow.
  - **Client ID**: The unique identifier assigned to the client by the authorization server.
  - **Client Secret**: A confidential value shared between the client and the authorization server to authenticate the client.
  - **Client Scopes**: Specific permissions or access levels that the client is requesting, defining the extent of access to the protected resources.
    <br />
    <Img src="/img/user-guide/spark-catalogs/nessie-auth-oauth2.png" alt="Nessie Catalog auth oauth2" />

Follow the on-screen instructions for setting up credentials and permissions.

For more details, refer to the [Iceberg Nessie Integration](https://iceberg.apache.org/docs/1.5.1/nessie/).
