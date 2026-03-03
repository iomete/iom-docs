---
title: "CLOUD Act Reality Check: Encryption Does Not Guarantee Data Sovereignty"
description: "Jurisdiction follows the provider, not the data. Your encryption model determines your trust boundary."
slug: "cloud-act-reality-check"
authors: "rocco"
tags2: ["Security", "Compliance"]
coverImage: "img/blog/thumbnails/4.png"
date: "03/03/2026"
---

Encryption can protect data from bad actors, not from court-ordered access. Under the U.S. [CLOUD Act](https://en.wikipedia.org/wiki/CLOUD_Act) (2018), American authorities can compel U.S.-based providers like AWS, Google Cloud, and Azure to hand over data regardless of where it's physically stored.

Organizations chasing [data residency](/blog/data-residency-vs-data-sovereignty) in Frankfurt or Dublin often assume local storage means local law. It doesn't. Jurisdiction follows the provider, not the data. And when the provider holds your encryption keys, a subpoena may cover those too.

The regulatory pressure is only growing. [Schrems II](https://en.wikipedia.org/wiki/Schrems_II) (2020) invalidated the EU-U.S. Privacy Shield over U.S. surveillance law concerns. [DORA](https://en.wikipedia.org/wiki/Digital_Operational_Resilience_Act), fully applicable since January 2025, requires financial entities to assess risks from third-party ICT providers, including exposure to non-EU legal frameworks that could compel data disclosure. [GDPR](https://en.wikipedia.org/wiki/General_Data_Protection_Regulation) compliance depends increasingly on demonstrating that data cannot be accessed without your knowledge or consent, a bar that provider-managed encryption cannot clear on its own.

<!-- truncate -->

---

## When the Provider Also Manages your Encryption Keys

Most organizations default to having their cloud provider manage everything related to encryption. In practice, this means one of two models:
* **Platform-Managed Keys**: the object store handles encryption transparently using its own keys. AWS calls this [SSE-S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingServerSideEncryption.html), Azure calls it [Microsoft-managed keys](https://learn.microsoft.com/en-us/azure/storage/common/storage-service-encryption), GCP calls it [Google-managed keys](https://cloud.google.com/docs/security/encryption/default-encryption).
* **Customer-Specified Keys**: you control which key is used, but the provider still operates the key management system. [AWS SSE-KMS](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html), [Azure customer-managed keys](https://learn.microsoft.com/en-us/azure/storage/common/customer-managed-keys-overview) (via Key Vault), and [GCP customer-managed encryption keys](https://cloud.google.com/storage/docs/encryption/customer-managed-keys) (via Cloud KMS) all fall in this category.

These models are the default for good reason: they're simple and operationally easy. We explain both approaches in detail in the [first article of this series](/blog/data-lakehouse-encryption-iceberg).

The problem is the same in both cases: **the provider controls both storage and keys**. It doesn’t matter if storage and keys are kept separate: when faced with a subpoena, these forms of encryption become an implementation detail. As shown in [our hands-on lab](/blog/iceberg-encryption-lab), the key used to encrypt each object is explicitly recorded in object metadata; once a provider is legally compelled to cooperate, matching the keys to the data is straightforward.

Think of it like a bank storing valuables in multiple deposit boxes in one building and the keys for those in another building. The separation helps against burglars, but it does nothing when a sheriff arrives with a valid warrant.

## Managing Your Own Keys Comes With Serious Trade-offs

Some organizations take control by managing their own keys using [SSE-C](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ServerSideEncryptionCustomerKeys.html) (AWS), [customer-provided keys](https://learn.microsoft.com/en-us/azure/storage/blobs/encryption-customer-provided-keys) in Azure, or Google's [customer-supplied encryption keys](https://cloud.google.com/storage/docs/encryption/customer-supplied-keys). The provider cannot decrypt your data without the key, which does improve the security posture. In principle, a CLOUD Act order alone cannot compel a provider to produce a key they don't hold.

However, a trust boundary issue remains: **encryption and decryption still happen on the provider's servers**. Your key passes through their infrastructure on every read and write, which means the provider is still part of your trust boundary. To extend our bank analogy: you bring your own padlock and keep the key at home. But each time you need access, you hand the key to the clerk and wait outside. They could copy it if a court orders them to. Reputable institutions would resist, but the technical possibility exists. For organizations handling military intelligence or similarly sensitive data, that is enough to look elsewhere.

The operational reality is equally challenging. Key rotation with SSE-C is complex and risky, as we demonstrate in [our hands-on lab](/blog/iceberg-encryption-lab#key-rotation-3): you must track which key encrypted which object, and rotation means re-encrypting every object yourself. Lose the key or the mapping, and you permanently lose access to your own data.

Note: [AWS is disabling SSE-C by default](https://aws.amazon.com/blogs/storage/advanced-notice-amazon-s3-to-disable-the-use-of-sse-c-encryption-by-default-for-all-new-buckets-and-select-existing-buckets-in-april-2026/) starting April 6, 2026, for all new buckets and for existing buckets in accounts without any SSE-C encrypted data. Existing active workloads will require explicit re-enablement, pushing most workloads toward SSE-S3 or SSE-KMS.

## Client-Side Encryption and the Compute Problem

Client-Side Encryption (CSE) provides the strongest protection for data at rest. As we explain in more detail [here](/blog/data-lakehouse-encryption-iceberg#client-side-encryption), all encryption and decryption happens inside your application, and the cloud provider only stores opaque encrypted blobs.

However, modern data lakehouses are built for analytics, not just storage. Tables based on Apache Iceberg, Delta Lake, or Apache Hudi are typically queried through compute engines like Apache Spark, Trino, or Impala. When running these in the cloud, your encryption keys must be supplied as part of their configuration, and data exists in decrypted form during processing: in memory, intermediate shuffle files, and potentially application logs. This effectively makes their CPU and RAM part of your trust boundary.

To continue our analogy: imagine you need to review the contents of your deposit box. A bank employee brings it to a private room and helps you go through it. The box is open, your documents are on the table, and a bank employee is in the room. You are trusting the institution, not just the lock.

For most organizations this is an acceptable trade-off. But for workloads involving military planning, central bank operations, or classified information, the presence of decrypted data in cloud provider infrastructure during processing introduces an unacceptable risk. 

The only way to fully eliminate this exposure is to run compute outside the cloud provider's environment entirely: keep encrypted data in cloud storage if needed, but run the processing on your own sovereign infrastructure. That incurs egress costs and operational complexity, but it ensures the provider never has the technical means to see unencrypted data.

Cloud providers are aware of this problem. Trusted Execution Environments (TEEs), such as [AWS Nitro Enclaves](https://docs.aws.amazon.com/enclaves/latest/user/nitro-enclave.html), are impressive engineering that promise provable isolation. Attested TEEs can protect against rogue system administrators, but they do not negate legal compulsion: the entity providing the hardware still falls under US jurisdiction, which means their infrastructure remains part of your trust boundary.

## Final Thoughts

Cloud platforms are powerful tools that have lowered costs, accelerated development, and made operational life easier for most organizations. None of that changes. But sovereignty is a spectrum, and where your organization sits on it determines how much the trade-offs in this article actually matter to you.

For most organizations, provider-managed encryption combined with solid IAM policies is sufficient. The CLOUD Act is a real legal instrument, but the actual number of orders targeting private sector data is largely unknown: many are sealed, and providers often challenge or narrow overbroad requests in court. The opacity makes risk assessment difficult, which is precisely why some regulated organizations prefer technical controls over legal ones. Customer-managed keys add meaningful isolation. Running compute outside the cloud provider's environment removes the trust dependency entirely, at the cost of operational complexity and egress fees.

It is worth noting that even hyperscalers are acknowledging this gap. AWS recently launched the [AWS European Sovereign Cloud](https://aws.amazon.com/blogs/aws/opening-the-aws-european-sovereign-cloud/) (generally available January 2026): a physically and logically separate infrastructure operated by a dedicated EU legal entity, AWS European Sovereign Cloud GmbH, with EU-resident staff and management. Whether a US-parented subsidiary sits fully outside CLOUD Act reach remains an open legal question, but the investment signals that data residency alone was never enough.

If you want the full lakehouse experience—Apache Spark, Apache Iceberg, Workflow Orchestration, unified Data Governance—without placing your data inside a provider's trust boundary: that is what we are building at IOMETE. Self-hosted on-premise, private cloud, or public cloud. Your infrastructure, your keys, no clerk in the room.
