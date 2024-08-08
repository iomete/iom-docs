---
title: Secrets
description: IOMETE centralized secrets management
last_update:
  date: 08/08/2024
  author: Fuad Musayev
---

import { Plus, Trash } from "@phosphor-icons/react";
import Img from '@site/src/components/Img';

We are pleased to introduce centralized secrets management in the IOMETE platform. This feature is accessible via a new page under **Settings** &#8594; **Secrets**, allowing users to list, manage, and securely store keys and secrets.

<Img src="/img/user-guide/secrets/secrets.png" alt="Secrets Page" />


## Secrets Store
IOMETE currently supports the following secret storage backends:
1. **Database**
2. **Kubernetes**
3. **HashiCorp Vault**

During deployment, users can specify their preferred backend storage for secrets using the Helm chart configuration. Below is an example configuration for selecting HashiCorp Vault:

```yaml
secretStore:
    # Currently supported: Database, Kubernetes, and HashiCorp Vault.
    type: vault # options: database, kubernetes, vault
    vaultSettings:
       endpoint: "http://vault.vault.svc.cluster.local:8200"
       path: "/v1/secret/data/iomete/poc"
       token: "root"
       # To read the token from a Kubernetes secret, uncomment the following lines:
       # tokenSecret: 
       #   name: secret-name
       #   key: token
```

### Storage Internals

To assist you in selecting the optimal backend storage for your Data-Plane instance, this section will delve into the internal details of each option, along with their respective pros and cons.

**Database**:  
Secrets are stored in the database table `secret_store`. This is not recommended for production environments due to security concerns. However, it is suitable for POC and development environments.  
_Pros_:  
	•	Centralized storage leveraging existing database infrastructure.  
	•	Simplified backup and management using standard database tools.  
_Cons_:  
	•	Potential single point of failure if the database is compromised.  
	•	Requires robust database security measures.  

**Kubernetes**:  
Secrets are stored as Kubernetes secret under the name `iomete-secret-store` within the same namespace as the data-plane installation.  
_Pros_:  
	•	Leverages Kubernetes' security features.  
	•	Seamlessly integrates with Kubernetes-native applications.  
_Cons_:  
	•	Limited to Kubernetes environments.  
	•	Requires additional configuration for cross-namespace access.  

**HashiCorp Vault**:  
Recommended for production environments. Secrets are stored in HashiCorp Vault using the provided settings.  
_Pros_:  
	•	Highly secure and scalable solution.  
	•	Offers fine-grained access control and comprehensive audit capabilities.  
  •	Supports dynamic secrets and various secret engines.  
_Cons_:  
	• Additional infrastructure setup and maintenance required.  
	•	Requires additional configuration for cross-namespace access.  

:::info
  Currently, IOMETE does not support grouping or folder logic, but planned for future releases.
:::


### HashiCorp Vault
When using HashiCorp Vault as the secret storage backend, we recommend the following best practices:
1. It is recommended to structure the path in the format `iomete/{data-plane-instance-name}`. For example, for POC environment it could be: `/iomete/poc`.
2. **Vault Structure**: 
   1. Each secret key should be a folder under `/iomete/{data-plane-instance-name}`.  
       For example, `/iomete/poc/EXAMPLE_KEY` with data `"value": "sensitive_data"`. 
       <Img src="/img/user-guide/secrets/vault-create.png" alt="Vault: Create Secret" />
    2. The path under `/iomete/{data-plane-instance-name}` should look like this:
       <Img src="/img/user-guide/secrets/vault-list.png" alt="Vault: List" />
    3. Example `/iomete/poc/EXAMPLE_KEY` secret in Vault:
       <Img src="/img/user-guide/secrets/vault-key.png" alt="Vault: Secret" />


:::warning
Due to limitations of Vault API the mentioned **Vault Structure** must be followed to ensure proper functionality.
:::


## Utilizing Secrets
Secrets can be configured and selected in the IOMETE Console for Spark jobs under the **Environment variables** and **Spark config** sections.

<Img src="/img/user-guide/secrets/secret-job.png" alt="Secret Usage in Spark Job" />

### Accessing Secrets in Spark Applications
Secrets can also be accessed programmatically within Spark applications using the SDK or API. For instance, when utilizing Vault as the backend, we recommend using the Vault API for secure access and management of IOMETE secrets.

For detailed instructions on using the Vault API, please refer to the [HashiCorp Vault API documentation](https://www.vaultproject.io/api).

## Future Enhancements
- Implementation of grouping and folder logic for enhanced secrets management.
- Expanded integration with additional secret management solutions.
