---
title: "Lakehouse encryption: hands-on lab with SSE, CSE, Spark and Iceberg"
description: "Explore SSE-S3, SSE-KMS, SSE-C, CSE, and key rotation in Apache Iceberg with on-disk inspection using MinIO and Spark."
slug: "iceberg-encryption-lab"
authors: "rocco"
tags2: ["Security", "Technical"]
coverImage: "img/blog/thumbnails/4.png"
date: "02/24/2026"
---

In this article, we are going to get hands-on with encryption in Apache Iceberg. In our previous article, [Data Lakehouse Encryption: Encrypting Data at Rest](/blog/data-lakehouse-encryption-iceberg), we covered the theory behind SSE-S3, SSE-KMS, SSE-C, and client-side encryption. Here, we'll walk through each mode in practice and see what the data actually looks like on disk.

Everything runs locally so you can reproduce it yourself without any cloud accounts. The big advantage: we can actually look at the data on disk behind the object store, which is impossible when using AWS, GCP or Azure directly.

<!-- truncate -->

---

## Encryption Cheat Sheet

This lab is designed as reference material: jump between sections or run one mode at a time. The table contains a summary of what we will see in each section:

| Mode | Protects against | Spark/Iceberg compatibility | Ops Burden for key rotation |
|------|------------------|-----------------------------|-----------------------------|
| [No Encryption](#no-encryption) | Basically nothing | High | N/A |
| [SSE-S3](#sse-s3-the-platform-manages-everything) | Bad actors that get access to the underlying file system | High: Object store manages everything transparently | Low: object store and KMS handle this transparently |
| [SSE-KMS](#sse-kms-customer-specifies-keys) | Same as SSE-S3 + limits blast radius of compromised keys/credentials | Medium: one key per session with `S3FileIO`; per-bucket keys possible with `HadoopFileIO` | Medium: object store + KMS handle rotation transparently. More keys means harder to know which key/version is still in use. |
| [SSE-C](#sse-c-customer-provided-keys) | Same as SSE-KMS + Object Store access itself being compromised | Low: one key per session with `S3FileIO`; per-bucket keys possible with `HadoopFileIO` | High: You have to track which object is encrypted with which version of which key |
| [CSE](#client-side-encryption) | Same as SSE-C + Any server side compromise on the Object Store provider side | Experimental, emerging at this point | Extreme: You have to track which key is used for what data. To rotate a key, you have to download, decrypt, re-encrypt, and upload data back again yourself |

## Setup

We’ll briefly introduce the tools and components used in this hands-on lab. In the appendix, you’ll find a `docker-compose.yaml` that allows you to reproduce everything locally. All you need is Docker installed on your machine. This local stack lets us demonstrate encryption mechanics end-to-end, including on-disk inspection, without cloud dependencies or costs.

### Containers

#### Object Store: MinIO
[MinIO](https://github.com/minio/minio) is an open-source, S3-compatible object store. We use it as a stand-in for cloud object stores like AWS S3, Google Cloud Storage (GCS), and Azure Blob Storage. For production self-hosted deployments, you might also consider alternatives like Ceph RGW, SeaweedFS, or RustFS. See our [comparison of S3-compatible storage options](/blog/evaluating-s3-compatible-storage-for-lakehouse). The key requirement here is that MinIO can run locally and lets us peek at how data is stored on disk.

MinIO uses its own internal on-disk format (for example, inlining small objects into metadata files like `xl.meta` and splitting larger ones into shards). This differs from AWS/GCP/Azure internals, but the core behavior is very similar.

#### Key Management System: MinIO KMS (minkms)
We use [minkms](https://github.com/minio/minkms) as our example KMS. This is intentionally a simple setup to demonstrate mechanics rather than a production-grade configuration. It allows us to show object store–KMS integration and key rotation behavior.

#### Apache Spark
We will use [Apache Spark](https://spark.apache.org) as our compute engine to help us write data in Apache Iceberg's storage format. We use the official public Spark Docker image with the [spark-sql](https://spark.apache.org/docs/latest/sql-distributed-sql-engine-spark-sql-cli.html) setup. Enthusiasts can also use [PySpark](https://spark.apache.org/docs/latest/api/python/index.html) or Scala via [Spark-Shell](https://spark.apache.org/docs/latest/quick-start.html) if they so prefer.

#### Tools
We launch a custom Alpine-based container with a number of pre-installed and pre-configured command-line tools. In this lab, we use the [AWS CLI](https://github.com/aws/aws-cli), [mc](https://github.com/minio/mc), and [minkms](https://github.com/minio/minkms) as administration tools for MinIO, as well as [hexdump](https://opensource.com/article/19/8/dig-binary-files-hexdump) and [parq](https://github.com/a-poor/parq) to inspect files stored on disk.

#### Init containers
Several init containers run on startup to prepare the environment. They create certificates to ensure [TLS communication](https://en.wikipedia.org/wiki/Transport_Layer_Security) everywhere (which is needed for SSE-C), initialize MinIO and MinIO KMS, and make sure all containers are wired together correctly before the lab begins.

### Running the lab

To start the environment, copy the docker-compose file from the appendix and save it as a file named `docker-compose.yaml` on your local machine. From the directory you installed it in:

```shell
$ docker compose up -d
[+] Running 14/14
…
 ✔ Container tools                            Started                                                                                                                                      67.2s 
```

After completing a section, you can clean up everything with:

```shell
$ docker compose down -v
[+] Running 9/9
…
 ✔ Volume iceberg-encryption_minio-data     Removed  
```

## No Encryption

To set a baseline, let's run everything without encryption and see what the data really looks like on disk. Intuitively, we expect to see data stored in plain text.

### AWS CLI

We start by creating a bucket with the AWS CLI (same syntax as real S3), upload a test file and download it again.

```shell
$ # Create a bucket
$ docker exec tools aws s3 mb s3://no-encryption
make_bucket: no-encryption

$ # Upload test file to MinIO using 'aws s3 cp' command
$ docker exec tools sh -c 'echo "secret data here" | aws s3 cp - s3://no-encryption/test.txt'

$ # Download from MinIO and inspect the contents
$ docker exec tools aws s3 cp s3://no-encryption/test.txt -
secret data here
```

Round-trip works as expected, nothing special so far. Let's look directly at MinIO's filesystem to see what we end up with:

```shell
$ # Inspect on disk - data is visible in plaintext at the end
$ docker exec minio cat /data/no-encryption/test.txt/xl.meta
XL2 ???&?????2?$?6??????W??Type?V2Obj??ID??DDir?P??F?@G?????w???EcAlgo?EcM?EcN?EcBSize??EcIndex?EcDist??CSumAlgo?PartNums??PartETags??PartSizes??PartASizes??Size?MTime???2?$?6?MetaSys??x-minio-internal-inline-data?true?x-minio-internal-crc?	?d-'?MetaUsr??content-type?binary/octet-stream?etag? 78142deea96ae5a490403136626ba1cc?v??6????null?1???V迲D???<u<??=?6?????P?k?secret data here
```

We can clearly see **`secret data here`** in plaintext at the end of the file. While this MinIO internal file layout may differ from AWS, the conceptual behavior is the same: the data is stored unencrypted on disk.
If someone gains filesystem access (rogue admin, container escape, misconfigured permissions) they can simply read your data. Production often uses full-disk encryption (LUKS/dm-crypt) to protect against physical theft. But once the host is running, the OS sees everything decrypted. Disk encryption does not stop runtime access.

### Spark & Iceberg

Now let's repeat the exercise with Apache Spark and Iceberg: lakehouse workloads are where this really matters. Clean slate first:

```shell
$ # Remove the bucket, if this fails on non-existing bucket that is fine
$ docker exec tools aws s3 rb s3://no-encryption --force
remove_bucket: no-encryption

$ # Create a bucket
$ docker exec tools aws s3 mb s3://no-encryption
make_bucket: no-encryption
```

We launch an interactive Spark SQL session, point the Iceberg warehouse to our bucket, create a tiny table, insert a row, and query it:

```shell
$ # Create a database, a table, insert data into the table and select that data
$ docker exec -it spark spark-sql --conf spark.sql.catalog.local.warehouse=s3://no-encryption/
spark-sql ()> CREATE DATABASE no_enc;
spark-sql ()> USE no_enc;
spark-sql (no_enc)> CREATE TABLE test (id INT, secret STRING);
spark-sql (no_enc)> INSERT INTO test VALUES (1, 'my secret data');
spark-sql (no_enc)> SELECT * FROM test;
1	my secret data
```

From Spark's point of view everything works normally. We exit Spark and list the bucket in MinIO:

```shell
$ # List all files in bucket “no-encryption”. We get data, metadata and manifest files
$ docker exec tools aws s3 ls s3://no-encryption/ --recursive 
no_enc/test/data/00000-0-4f6e99fb-85cd-4714-9c08-791a099bc707-0-00001.parquet
no_enc/test/metadata/00000-e7a6e1d0-c8db-44b2-8004-750507eb90f1.metadata.json
no_enc/test/metadata/00001-5e741a08-3474-454c-8209-8b8f2bc4e9b6.metadata.json
no_enc/test/metadata/6b8017ab-b069-4fe3-a0e0-1449db4a5747-m0.avro
no_enc/test/metadata/snap-5598329974827976532-1-6b8017ab-b069-4fe3-a0e0-1449db4a5747.avro
```

You will see the usual Iceberg layout: Parquet data file + metadata and manifest files. First, let’s examine the metadata of the data file. Then we download the data file and peek at the Parquet data it holds:

```shell
$ # Display the metadata of the parquet data files in bucket no-encryption
$ docker exec tools sh -c 'aws s3api head-object --bucket no-encryption --key $(aws s3 ls s3://no-encryption/no_enc/test/data/ --recursive | head -1 | awk "{print \$4}")'
{
    …
    "AcceptRanges": "bytes",
    "ContentLength": 710,
    "ETag": "\"1f066be265d0183647a7ade7072c534d\"",
    "ContentType": "application/octet-stream",
}

$ # Download and inspect the Parquet file with parq
$ docker exec tools sh -c 'aws s3 cp s3://no-encryption/no_enc/test/data/$(aws s3 ls s3://no-encryption/no_enc/test/data/ | head -1 | awk "{print \$4}") /tmp/test.parquet && parq /tmp/test.parquet --head 10' 

   id          secret
0   1  my secret data
```

Data is readable as expected. The same goes for the metadata and manifest files, something we will leave to the reader to explore on their own.

Finally, let's look at how this same Parquet file is stored inside MinIO itself. Because the data is in Parquet format, and MinIO tends to inline small objects into its `xl.meta` files, simply printing the file contents can make it look like the data is encrypted. Dumping the file as hex helps shatter that illusion. The output below is abbreviated for readability and to focus on the interesting parts.

```shell
$ # Print the data and make a hex dump of it
$ docker exec minio sh -c 'cat /data/no-encryption/no_enc/test/data/*.parquet/xl.meta' | hexdump -C
00000000  58 4c 32 20 01 00 03 00  c6 00 00 01 74 03 03 01  |XL2 ........t...|
…
000000f0  69 6d 65 d3 18 8d 9f c6  25 7d 32 64 a7 4d 65 74  |ime.....%}2d.Met|
00000100  61 53 79 73 81 bc 78 2d  6d 69 6e 69 6f 2d 69 6e  |aSys..x-minio-in|
00000110  74 65 72 6e 61 6c 2d 69  6e 6c 69 6e 65 2d 64 61  |ternal-inline-da|
00000120  74 61 c4 04 74 72 75 65  a7 4d 65 74 61 55 73 72  |ta..true.MetaUsr|
00000130  82 ac 63 6f 6e 74 65 6e  74 2d 74 79 70 65 b8 61  |..content-type.a|
00000140  70 70 6c 69 63 61 74 69  6f 6e 2f 6f 63 74 65 74  |pplication/octet|
00000150  2d 73 74 72 65 61 6d a4  65 74 61 67 d9 20 31 66  |-stream.etag. 1f|
…
000001b0  50 41 52 31 15 00 15 08  15 20 15 91 d2 c0 a1 05  |PAR1..... ......|
…
00000300  16 6a 26 56 3c 18 0e 6d  79 20 73 65 63 72 65 74  |.j&V<..my secret|
00000310  20 64 61 74 61 18 0e 6d  79 20 73 65 63 72 65 74  | data..my secret|
…
00000370  18 0e 69 63 65 62 65 72  67 2e 73 63 68 65 6d 61  |..iceberg.schema|
00000380  18 95 01 7b 22 74 79 70  65 22 3a 22 73 74 72 75  |...{"type":"stru|
..
000003a0  30 2c 22 66 69 65 6c 64  73 22 3a 5b 7b 22 69 64  |0,"fields":[{"id|
000003b0  22 3a 31 2c 22 6e 61 6d  65 22 3a 22 69 64 22 2c  |":1,"name":"id",|
..
000003e0  69 64 22 3a 32 2c 22 6e  61 6d 65 22 3a 22 73 65  |id":2,"name":"se|
000003f0  63 72 65 74 22 2c 22 72  65 71 75 69 72 65 64 22  |cret","required"|
…
00000470  00 00 50 41 52 31                                 |..PAR1|
00000476
```

Everything stands out in plaintext: the row data and the higher-level Iceberg structure (column names, types, schema). No encryption means no protection at the object-store layer. Anyone with filesystem access can extract both raw values and table semantics.

### Key Takeaways

* Without encryption, object-store data is readable to anyone with filesystem access: hackers or rogue admins with host-level access.
* Full-disk encryption protects mainly against physical theft or offline attacks. It does not stop someone who compromises a running host (SSH, container breakout, etc.) from reading plaintext data directly.

This baseline shows why at-rest encryption matters in shared/multi-tenant object stores, especially for lakehouses where metadata + data reveal full table meaning.

## SSE-S3: The Platform Manages Everything

With SSE-S3, the object store [encrypts your data using keys it manages internally](/blog/data-lakehouse-encryption-iceberg#sse-platform-managed-keys). You don't handle keys at all.

We start with the simplest form: everything managed by the platform. This is equivalent to SSE-S3 in AWS, Google-managed keys in Google Cloud, and Microsoft-managed keys in Azure. The object store connects to a KMS and handles encryption and decryption completely transparently. It just works for you and your applications.
In cloud environments, at-rest encryption is often enabled by default or just a one-click bucket setting. In our local Docker Compose setup (see appendix), we’ve already created a default key and connected it to MinIO:

```shell
$ # List all keys in MinIO KMS Server
$ docker exec tools mc admin kms key list minio
┌─────────────────────────┐
│ KMS Keys                │
├─────┬───────────────────┤
│ S N │ NAME              │
├─────┼───────────────────┤
│   1 │ minio-default-key │
└─────┴───────────────────┘


$  # Show the status of MinIO's key configuration
$  docker exec tools mc admin kms key status minio               
Key: minio-default-key
   - Encryption ✔
   - Decryption ✔
```

We will use the below bucket for all sse-s3 samples. You may destroy and recreate the bucket if you wish for each subsection.

```shell
$ # remove bucket “sse-s3” if it exists
$ docker exec tools aws s3 rb s3://sse-s3 --force
… 
remove_bucket: sse-s3

$ # create a bucket named "sse-s3"
$ docker exec tools aws s3 mb s3://sse-s3
make_bucket: sse-s3

$ # enable encryption on the bucket
$ docker exec tools mc encrypt set sse-s3 minio/sse-s3
Auto encryption configuration has been set successfully for minio/sse-s3
```

### AWS CLI

First, we upload a file, download it, and check its contents: all encryption/decryption happens behind the scenes.

```shell
$ # Upload test file to MinIO using 'aws s3 cp' command
$ docker exec tools sh -c 'echo "secret data here" | aws s3 cp - s3://sse-s3/test.txt'

$ # Download and verify: decryption is transparent
$ docker exec tools aws s3 cp s3://sse-s3/test.txt -
secret data here
```

Notice: nothing changes from the client’s point of view compared to the no-encryption case. If you have read access: you get plaintext data on download. No key to pass, no extra headers.
When we check the metadata of the file on MinIO:

```shell
$ # Display the metadata of the file
$ docker exec tools aws s3api head-object --bucket sse-s3 --key test.txt
{
    …
    "ContentLength": 17,
    "ETag": "\"78142deea96ae5a490403136626ba1cc\"",
    "ContentType": "binary/octet-stream",
    "ServerSideEncryption": "AES256",
}
```

The metadata indicates that _ServerSideEncryption_ is enabled on this file! Now the important part: what does the object look like on MinIO’s disk?

```shell
$ # Print the contents of the file in MinIO
$ docker exec minio cat /data/sse-s3/test.txt/xl.meta
XL2 ?J?&??????????Tv?8???Type?V2Obj??ID??DDir?g?	
…
X-Minio-Internal-Server-Side-Encryption-S3-Kms-Key-Id?minio-default-key?9X-Minio-Internal-Server-...
WDpKIgR5dRSQVqHnYgzcSTQZwC91gFnnUg6gTeMQ==?:X-Minio-Internal-Server-Side-Encryption-S3-Kms-Key-Version?1?x-minio-internal-crc?% 
…
                                         Z?Դ??:%  
```

Unlike the unencrypted example, we can't make out our data anymore. We can, however, still see the metadata in plaintext. Notice **`X-Minio-Internal-Server-Side-Encryption-S3-Kms-Key-Id`** showing `minio-default-key`, and **`X-Minio-Internal-Server-Side-Encryption-S3-Kms-Key-Version`** showing version `1`.

This changes the threat model: filesystem access alone is no longer enough to read the data. An attacker sees only useless blobs plus some metadata. To decrypt they'd need both filesystem access and the actual key material from the KMS.

The remaining risks are narrow but real:
* If someone steals the encryption key and has filesystem access, they can decrypt.
* If a bad actor compromises your object-store credentials, the store will happily decrypt and serve plaintext for any object they’re allowed to read.

### Spark & Iceberg

Let’s repeat the exercise with Spark and Iceberg. We first create a table again with Spark and insert some data:

```shell
$ docker exec -it spark spark-sql --conf spark.sql.catalog.local.warehouse=s3://sse-s3/
...
spark-sql ()> CREATE DATABASE sse_s3;
spark-sql ()> USE sse_s3;
spark-sql (sse_s3)> CREATE TABLE test (id INT, secret STRING);
spark-sql (sse_s3)> INSERT INTO test VALUES (1, 'my secret data');
spark-sql (sse_s3)> SELECT * FROM test;
1	my secret data
```

Everything behaves normally from Spark’s perspective. Exit Spark, then check the bucket contents, metadata, download the Parquet file and inspect it.

```shell
$ # Fetch the metadata of the data file
$ docker exec tools sh -c 'aws s3api head-object --bucket sse-s3 --key $(aws s3 ls s3://sse-s3/sse_s3/test/data/ --recursive | head -1 | awk "{print \$4}")'
{
    …
    "ServerSideEncryption": "AES256"
}

$ # Download and inspect with parq - decryption is transparent, data is readable
$ docker exec tools sh -c 'aws s3 cp s3://sse-s3/sse_s3/test/data/$(aws s3 ls s3://sse-s3/sse_s3/test/data/ | head -1 | awk "{print \$4}") /tmp/test.parquet && parq /tmp/test.parquet --head 10' 
   id          secret
0   1  my secret data
```

As we saw in the AWS CLI subsection: if we download the data then we get it in decrypted format. To confirm that the data is actually encrypted at rest, we again take a hex dump of the file as stored inside MinIO:

```shell
$ docker exec minio sh -c 'cat /data/sse-s3/sse_s3/test/data/*.parquet/xl.meta' | hexdump -C
00000000  58 4c 32 20 01 00 03 00  c6 00 00 04 19 03 03 01  |XL2 ............|
…
00000300  53 41 3d 3d d9 35 58 2d  4d 69 6e 69 6f 2d 49 6e  |SA==.5X-Minio-In|
00000310  74 65 72 6e 61 6c 2d 53  65 72 76 65 72 2d 53 69  |ternal-Server-Si|
00000320  64 65 2d 45 6e 63 72 79  70 74 69 6f 6e 2d 53 33  |de-Encryption-S3|
00000330  2d 4b 6d 73 2d 4b 65 79  2d 49 64 c4 11 6d 69 6e  |-Kms-Key-Id..min|
00000340  69 6f 2d 64 65 66 61 75  6c 74 2d 6b 65 79 d9 3a  |io-default-key.:|
00000350  58 2d 4d 69 6e 69 6f 2d  49 6e 74 65 72 6e 61 6c  |X-Minio-Internal|
00000360  2d 53 65 72 76 65 72 2d  53 69 64 65 2d 45 6e 63  |-Server-Side-Enc|
00000370  72 79 70 74 69 6f 6e 2d  53 33 2d 4b 6d 73 2d 4b  |ryption-S3-Kms-K|
00000380  65 79 2d 56 65 72 73 69  6f 6e c4 01 31 a7 4d 65  |ey-Version..1.Me|
…
00000730  79 a0 d1 b8 28 bd 31 45  82 b2 d4                 |y...(.1E...|
0000073b
```

Unlike the unencrypted setup, we are no longer able to make out our data or the Iceberg schema: it is all scrambled. What we can still clearly see are the internal MinIO metadata fields, **`X-Minio-Internal-Server-Side-Encryption-S3-Kms-Key-Id`** and **`X-Minio-Internal-Server-Side-Encryption-S3-Kms-Key-Version`**, that record which key and which key version were used. The same pattern repeats across the manifest and metadata files as well (left as an exercise for the reader to explore).

So, just as we saw with the AWS CLI earlier, merely having filesystem access to the object store is no longer enough to inspect the data. You would also need to obtain the corresponding encryption key. At the same time, if you do have credentials that allow you to access the object through the object store API, the object store itself will happily return the decrypted content for any object those credentials are allowed to read.

### Key rotation

Now that we use keys for encryption, the next obvious question is: how do we rotate them? And what happens when we rotate a key? Do we still have access to our files during and after rotation?
Let’s upload a file like we did before:

```shell
$ # Upload a file with content “data before key rotation”
$ docker exec tools sh -c 'echo "data before key rotation" | aws s3 cp - s3://sse-s3/before-rotation.txt'
```

Next, let’s check the current key version and then rotate the key:

```shell
$ # display the status of key “minio-default-key”
$ docker exec tools minkms stat-key -k --enclave minio-enclave minio-default-key      
Name     minio-default-key
Version  1
Type     AES256
Owner    h1:xkDu-osB2iIgtaasijYuHUmu9_p4LQPZBk5XxKtG0Gw


$ # add a new version for key “minio-default-key”
$ docker exec tools minkms add-key -k --version --enclave minio-enclave minio-default-key

$ # display the updated status of key “minio-default-key”
$ docker exec tools minkms stat-key -k --enclave minio-enclave minio-default-key      
Name     minio-default-key
Version  2
Type     AES256
Owner    h1:xkDu-osB2iIgtaasijYuHUmu9_p4LQPZBk5XxKtG0Gw
```

So at this point, we’ve rotated the key and MinIO’s default key is now at version 2. With the key rotated, let’s see if we can still access the content of the file. We’ll also look at the raw metadata of the object:

```shell
$ # download the file and print its content
$ docker exec tools aws s3 cp s3://sse-s3/before-rotation.txt -
data before key rotation


$ # show the content of file in MinIO itself
$ docker exec minio cat /data/sse-s3/before-rotation.txt/xl.meta
XL2 ?J?&?????6?R$?]r؄???Type?V2Obj??ID??DDir??5F?ՀO??R??bD?EcAlgo?EcM?EcN?EcBSize??EcIndex...X-Minio-Internal-Server-Side-Encryption-S3-Kms-Key-Version?1...5X-Minio-Internal-Server-Side-Encryption-S3-Kms-Key-Id?minio-default-key...  
```

We can see two things here:
1. We can still download and read the data just fine.
2. The metadata clearly shows that the object is still encrypted with version 1 of the key.

This tells us something important about how server-side encryption with a KMS works: the object store keeps track of which key version was used for each object. When you read an older object, the object store uses that metadata to ask the KMS for the correct (older) key version to decrypt it. In other words: rotating the key does not immediately re-encrypt all existing data. As long as the old key version is still available in the KMS, previously written objects remain readable without any disruption.

Now let’s say we actually do care about re-encrypting the data. For example, because we believe version 1 of the key is compromised. A simple (and very brute-force) way to do that is to rewrite the object so that the object store encrypts it again using the current key version:

```shell
$ # copy the file onto itself with the “REPLACE” directive
$ docker exec tools aws s3 cp s3://sse-s3/before-rotation.txt s3://sse-s3/before-rotation.txt --metadata-directive REPLACE
copy: s3://sse-s3/before-rotation.txt to s3://sse-s3/before-rotation.txt

$ # show the content of file in MinIO itself
$ docker exec minio cat /data/sse-s3/before-rotation.txt/xl.meta
????EcAlgo?EcM?EcN?EcBSize??EcIndex?EcDist??CSumAlgo?PartNums??PartETags??PartSizes?9?PartASi...X-Minio-Internal-Server-Side-Encryption-S3-Kms-Key-Version?2...5X-Minio-Internal-Server-Side-Encryption-S3-Kms-Key-Id?minio-default-key...                                                                                                                                                 


$ # download the file and print its content
$ docker exec tools aws s3 cp s3://sse-s3/before-rotation.txt -
data before key rotation
```

Now we can clearly see that the object has been re-encrypted using version 2 of the key.

So the mental model is:
* Key rotation alone does not touch existing data.
* Each object remembers which key version it was encrypted with.
* As long as the KMS keeps old key versions around, old objects remain readable.
* To actually move data onto a new key version, you must rewrite or copy it (or use a provider-specific batch re-encryption feature).

*Note*: MinIO has special batch operations that can rotate encryption metadata without fully rewriting the object payload. Other cloud providers expose similar functionality, or hide it behind a “re-encrypt” or “rotate key” operation. The exact mechanics differ per provider, but the conceptual behavior is the same.

### Key Takeaways

What SSE-S3 gives you:
* Encryption at rest is handled by the object store. Your applications don't need any special configuration.
* Key rotation happens automatically. The object store tracks which key version was used for each object and fetches the right one on read.
* The on-disk data becomes useless gibberish if you don’t have access to the right key version.

The main win over unencrypted data is that bad actors with access to your machines or operating systems will not be able to abuse your data without having the right encryption key for the data. However, they will be able to infer which key they need from the plaintext metadata and would be able to access the data if they also acquire the key.

If someone gains access to your object store itself, for example via leaked credentials or a compromised account, they will have full access to any data that the account has access to.

## SSE-KMS: Customer Specifies Keys

With SSE-KMS, you [tell the object store which key to use](/blog/data-lakehouse-encryption-iceberg#sse-customer-specifies-keys), but the store still handles the actual encryption.

Up next is the option where we don't use the same key for every object in a bucket. This is SSE-KMS in AWS, customer-managed keys (CMEK) in GCP, and customer-managed keys in Azure. Instead of one bucket-wide key, we tell the object store which specific key to use for each object we write.

The object store still talks directly to the KMS and uses the key we specify to encrypt a per-object data key (DEK), which then encrypts the actual data. From the application’s point of view, it still feels very similar to SSE-S3: we upload plaintext, and the store handles encryption transparently.

One important catch: the caller needs permission to use the chosen key (`kms:Encrypt` in AWS terms). If not, the upload fails. In the real world, this means admins have to ensure users have access to both the object and the right KMS key. Misconfigure either, and people can't read or write their data, even if everything else looks fine.

### AWS CLI

First, let's create a couple of extra keys in our KMS stand-in (we use the minkms tool):

```shell
$ # Create 2 different keys
$ docker exec tools minkms add-key -k --enclave minio-enclave tenant-a-key
$ docker exec tools minkms add-key -k --enclave minio-enclave tenant-b-key

$ # List all keys: the minio-default-key is created by the docker-compose setup. See appendix
$ docker exec tools minkms ls-key -k --enclave minio-enclave
Type     Created Name
AES256   minio-default-key
AES256   tenant-a-key
AES256   tenant-b-key
```

Good, now we have multiple keys. Create a bucket and enable default encryption (same as SSE-S3):
```shell
$ # Make bucket named “sse-kms”
$ docker exec tools aws s3 mb s3://sse-kms
make_bucket: sse-kms

$ # Enable encryption at the bucket level using the minio-default-key
$ docker exec tools mc encrypt set sse-kms minio-default-key minio/sse-kms                                                                                                                      
Auto encryption configuration has been set successfully for minio/sse-kms
```

Now upload three files, each specifying a different key, and check metadata of each successfully uploaded file:
```shell
$ # Upload file “tenant-a.txt”, encrypted with key “tenant-a-key”
$ docker exec tools sh -c 'echo "tenant A data" | aws s3 cp - s3://sse-kms/tenant-a.txt --sse aws:kms --sse-kms-key-id tenant-a-key'
$ docker exec tools aws s3api head-object --bucket sse-kms --key tenant-a.txt
{
...,
"ServerSideEncryption": "aws:kms",
"SSEKMSKeyId": "arn:aws:kms:tenant-a-key"
}

$ # Upload file “tenant-b.txt”, encrypted with key “tenant-b-key”
$ docker exec tools sh -c 'echo "tenant B data" | aws s3 cp - s3://sse-kms/tenant-b.txt --sse aws:kms --sse-kms-key-id tenant-b-key'
$ docker exec tools aws s3api head-object --bucket sse-kms --key tenant-b.txt
{
...
"ServerSideEncryption": "aws:kms",
"SSEKMSKeyId": "arn:aws:kms:tenant-b-key"
}

$ # Upload file to be encrypted with non-existing key “tenant-c-key” fails
$ docker exec tools sh -c 'echo "tenant C data" | aws s3 cp - s3://sse-kms/tenant-c.txt --sse aws:kms --sse-kms-key-id tenant-c-key'
upload failed: - to s3://sse-kms/tenant-c.txt An error occurred (kms:KeyNotFound) when calling the PutObject operation: key with given key ID does not exist
```

From metadata alone we see each object uses its own key. When downloading, we don’t specify which key to use for decryption:
```shell
$ # Both files readable on download - MinIO uses key from metadata for decryption
$ docker exec tools aws s3 cp s3://sse-kms/tenant-a.txt -
tenant A data
$ docker exec tools aws s3 cp s3://sse-kms/tenant-b.txt -
tenant B data
```

Just like SSE-S3, downloads are transparent for us: the store handles decryption using the key ID from metadata to hand us decrypted data. We can access the data as long as we have access to the object and the key via IAM policies.

Quick look at one object on disk (others left to the reader):
```shell
$ # Display hex dump of the data file in MinIO
$ docker exec minio cat /data/sse-kms/tenant-a.txt/xl.meta | hexdump -C                        
00000000  58 4c 32 20 01 00 03 00  c6 00 00 04 46 03 03 01  |XL2 ........F...|
...
00000260  6e 65 2d 64 61 74 61 c4  04 74 72 75 65 d9 35 58  |ne-data..true.5X|
00000270  2d 4d 69 6e 69 6f 2d 49  6e 74 65 72 6e 61 6c 2d  |-Minio-Internal-|
00000280  53 65 72 76 65 72 2d 53  69 64 65 2d 45 6e 63 72  |Server-Side-Encr|
00000290  79 70 74 69 6f 6e 2d 53  33 2d 4b 6d 73 2d 4b 65  |yption-S3-Kms-Ke|
000002a0  79 2d 49 64 c4 0c 74 65  6e 61 6e 74 2d 61 2d 6b  |y-Id..tenant-a-k|
000002b0  65 79 d9 3a 58 2d 4d 69  6e 69 6f 2d 49 6e 74 65  |ey.:X-Minio-Inte|
000002c0  72 6e 61 6c 2d 53 65 72  76 65 72 2d 53 69 64 65  |rnal-Server-Side|
000002d0  2d 45 6e 63 72 79 70 74  69 6f 6e 2d 53 33 2d 4b  |-Encryption-S3-K|
000002e0  6d 73 2d 4b 65 79 2d 56  65 72 73 69 6f 6e c4 01  |ms-Key-Version..|
000002f0  31 d9 36 58 2d 4d 69 6e  69 6f 2d 49 6e 74 65 72  |1.6X-Minio-Inter|
...
000004af
```

You’ll see similar sealed-key fields, but now with the specific key ID and its version visible. So for each object we know exactly which key and which version was used.

The big thing we're not showing here is IAM policies. In real cloud setups you configure policies so accounts can only use certain keys. This adds complexity: users need permissions for both the object and the KMS key. Misconfigure either and things break silently.

Major advantages of multiple keys:
* Different accounts can share a bucket but can't access each other's data. This is the foundation for multi-tenancy.
* A compromised key or credential only exposes objects encrypted with that key, not the entire bucket.

### Spark & Iceberg

Spark works much like the CLI: transparent encryption/decryption. But Spark can only be configured with one SSE-KMS key per running session when using Iceberg's `S3FileIO`. All objects written in that session use that single key. It can still read objects encrypted with other keys: the object store handles decryption transparently as long as the Spark account has KMS permissions for those keys.

> **Note:** Using `HadoopFileIO` with the `s3a://` scheme instead of `S3FileIO` allows per-bucket SSE keys via `spark.hadoop.fs.s3a.bucket.<bucket>.server-side-encryption.key`. However, this is still bucket-level configuration, so multiple tenants or tables sharing a bucket still hit the same limitation. It also trades Iceberg's optimized S3 client for Hadoop's S3A filesystem.
>
> Per-table SSE-KMS configuration via table properties would be a natural extension for Iceberg, similar to how [CSE table encryption](#client-side-encryption) allows per-table keys. As of writing, this is not implemented.

Let's demonstrate with two different keys:
```shell
$ # add kms keys for spark to use
$ docker exec tools minkms add-key -k --enclave minio-enclave spark-key-a
$ docker exec tools minkms add-key -k --enclave minio-enclave spark-key-b
$ docker exec tools minkms ls-key -k --enclave minio-enclave
Type     Created Name
AES256   minio-default-key
AES256   spark-key-a
AES256   spark-key-b
```

In the first session, we will create a table and write data with spark-key-a. Notice the SSE-KMS specific settings!

```shell
$ # Start Spark using KMS key "spark-key-a", writing to bucket "sse-kms"
$ docker exec -it spark spark-sql \
  --conf spark.sql.catalog.local.warehouse=s3://sse-kms/ \
  --conf spark.sql.catalog.local.s3.sse.type=kms \
  --conf spark.sql.catalog.local.s3.sse.key=spark-key-a
...
spark-sql ()> CREATE DATABASE sse_kms;
spark-sql ()> USE sse_kms;
spark-sql (sse_kms)> CREATE TABLE tenant_a (id INT, data STRING);
spark-sql (sse_kms)> INSERT INTO tenant_a VALUES (1, 'tenant A secret data');
spark-sql (sse_kms)> SELECT * FROM tenant_a;
1	tenant A secret data
```

In the second session, we write with spark-key-b and read from both tables:
```shell
$ # Start Spark using KMS key "spark-key-b", reading from/writing to bucket "sse-kms"
$ docker exec -it spark spark-sql \
  --conf spark.sql.catalog.local.warehouse=s3://sse-kms/ \
  --conf spark.sql.catalog.local.s3.sse.type=kms \
  --conf spark.sql.catalog.local.s3.sse.key=spark-key-b
...
spark-sql ()> USE sse_kms;
spark-sql (sse_kms)> CREATE TABLE tenant_b (id INT, data STRING);
spark-sql (sse_kms)> INSERT INTO tenant_b VALUES (2, 'tenant B secret data');
spark-sql (sse_kms)> SELECT * FROM tenant_b;
2	tenant B secret data
spark-sql (sse_kms)> SELECT * FROM tenant_a;
1	tenant A secret data
```

As expected, the second session reads data encrypted with **`spark-key-a`** just fine, decryption happens transparently.

Let’s check the metadata on the Parquet files. We leave hex dumps to the reader as they show the same as we saw in the AWS CLI.
```shell
$ # Show metadata of data files for Iceberg table “tenant_a”
$ docker exec tools sh -c 'aws s3api head-object --bucket sse-kms --key $(aws s3 ls s3://sse-kms/sse_kms/tenant_a/data/ --recursive | head -1 | awk "{print \$4}")'
{
    ...
    "ServerSideEncryption": "aws:kms",
    "SSEKMSKeyId": "arn:aws:kms:spark-key-a"
}


$ # Show metadata of data files for Iceberg table “tenant_b”
$ docker exec tools sh -c 'aws s3api head-object --bucket sse-kms --key $(aws s3 ls s3://sse-kms/sse_kms/tenant_b/data/ --recursive | head -1 | awk "{print \$4}")'
{
    ...
    "ServerSideEncryption": "aws:kms",
    "SSEKMSKeyId": "arn:aws:kms:spark-key-b"
}
```

We can see that the first table’s files are encrypted with *spark-key-a*, while the second table’s files use *spark-key-b*. The key point here is that Spark writes all files using the one key it is configured with. If multiple Spark instances write to the same bucket with different keys, it is easy to unintentionally mix which key encrypts which table.

Furthermore, if a Spark job does not have access to the key used for existing objects, it will fail when trying to read that data.

### Key rotation

Key rotation itself works the same way as we described in the previous SSE-S3 section, so we won’t rehash that here. Instead, let’s focus on what happens when you delete a version of a key that is still in use. This scenario is far more likely under SSE-KMS than under SSE-S3.

With SSE-KMS, it wouldn’t be uncommon to have lots of different keys and versions in circulation. You need to make sure you know whether a particular key version is still used by any object. If that key version is removed, you risk locking yourself out of your own data. One alternative is to never delete keys, but if a key is compromised you might prefer deletion over potential data leaks. With large amounts of data potentially being “cold” and not accessed for years, this puts more operational burden on you to track which key versions are used where.

We first create a fresh key for this demo and upload some data encrypted with it:
```shell
$ # Create key “rotation-demo”
$ docker exec tools minkms add-key -k --enclave minio-enclave rotation-demo

$ # Upload file “test.txt” encrypted with key “rotation-demo”
$ docker exec tools sh -c 'echo "data before rotation" | aws s3 cp - s3://sse-kms/test.txt --sse aws:kms --sse-kms-key-id rotation-demo'

$ # Download file “test.txt” and print its content
$ docker exec tools aws s3 cp s3://sse-kms/test.txt -
data before rotation
```

Then we rotate our key:
```shell
$ # Show status of key “rotation-demo”
$ docker exec tools minkms stat-key --enclave minio-enclave rotation-demo
Name     rotation-demo
Version  1
Type     AES256
Owner    h1:xkDu-osB2iIgtaasijYuHUmu9_p4LQPZBk5XxKtG0Gw

$ # Rotate key “rotation-demo”
$ docker exec tools minkms add-key -k --version --enclave minio-enclave rotation-demo

$ # Show status of key “rotation-demo”
$ docker exec tools minkms stat-key -k --enclave minio-enclave rotation-demo
Name     rotation-demo
Version  2
Type     AES256
Owner    h1:xkDu-osB2iIgtaasijYuHUmu9_p4LQPZBk5XxKtG0Gw
```

After rotation, we can still download the object:
```shell
$ # Download file “test.txt” and print its content
$ docker exec tools aws s3 cp s3://sse-kms/test.txt -
data before rotation
```

Now we delete version 1 of the key and try to download the data again:
```shell
$ # Delete version 1 of key “rotation-demo”
$ docker exec tools minkms rm-key -k --enclave minio-enclave --version 1 rotation-demo

$ # Download file “test.txt” and print its content
$ docker exec tools aws s3 cp s3://sse-kms/test.txt -
download failed: s3://sse-kms/test.txt to - An error occurred (kms:DecryptionFailed) when calling the GetObject operation (reached max retries: 4): failed to decrypt ciphertext with KMS key
```

And now we have bricked our data: the object store is unable to decrypt it and therefore won't let us download it.

Cloud providers typically have a soft-delete mechanism for keys, where a deleted key version can be restored for a certain period of time. But after that window expires, the key is gone permanently. Organizations should be acutely aware of this pitfall when using customer-managed keys and aggressive key deletion policies.

### Key Takeaways

* SSE-KMS improves key hygiene: use different keys per object, workload, or tenant instead of one bucket-wide key.
* Metadata records the exact key and version in plaintext. Anyone with filesystem access can see which key protects what.
* Downloads are fully transparent: anyone with read access + KMS permissions for the referenced key gets plaintext. No extra steps needed.
* Spark/Iceberg limitation: with `S3FileIO`, only one KMS key per session or catalog. All writes use that key; reads work across keys if permissions allow. `HadoopFileIO` with S3A supports per-bucket keys, but not per-table.

The big win over SSE-S3: strong workload isolation. Multiple tenants or jobs can safely share a bucket without seeing each other’s data. A compromised key or credential only exposes objects tied to that key and not the whole bucket.

But it comes with real operational cost: you must track key-version usage carefully. Delete a version still in use and you permanently brick your own data (no recovery once soft-delete expires). Rotation is still envelope-style and low-effort, but deletion policies need discipline, especially with cold data that might sit untouched for years.

## SSE-C: Customer-Provided Keys

With SSE-C, you [provide the encryption key on every request](/blog/data-lakehouse-encryption-iceberg#sse-customer-supplies-keys). The object store uses it and immediately forgets it.

We now move on to the last form of server-side encryption: you provide the keys yourself. The object store does not communicate with a KMS; instead, you supply the key to use for encryption, and the object store immediately forgets it. This is referred to as SSE-C in AWS S3, CSEK in GCP, and Customer-Provided Keys in Azure.

Typically, you would manage a KMS yourself in this setup. This is useful in multi-cloud or hybrid-cloud scenarios where data is replicated across different object stores from multiple providers, or when you want to avoid the risk of your provider being breached and having both your data and keys at the same time.

This setup comes with more complexity than the previous two: you must keep track of which key was used for which object. Lose either the key or the mapping, and you permanently lose access to your data.

### AWS CLI

First, let’s create the bucket and generate the keys we will use to upload and download data. Each generated key will be unique, so your output will look different.

```shell
$ # Create a bucket named “sse-c”
$ docker exec tools aws s3 mb s3://sse-c
make_bucket: sse-c

$ # Generate raw keys locally to be used for encryption
$ docker exec tools sh -c 'openssl rand 32 > /tmp/key-a.raw'
$ docker exec tools sh -c 'openssl rand 32 > /tmp/key-b.raw'

$ # Show keys (base64 encoded)
$ docker exec tools sh -c 'echo "Key A: $(cat /tmp/key-a.raw | base64)"'
Key A: UKgNHfXVgYAuBHORdNaIuXTJxn6zy2iwLUXYz6rFXGc=
$ docker exec tools sh -c 'echo "Key B: $(cat /tmp/key-b.raw | base64)"'
Key B: UXUJNmdJJssySkGNs9JUGgxciA6+hZebDK1GXSc6dhI=
```

Now we use those keys to upload two simple text files. Notice that we have to provide the key itself as part of the command, which we do by referencing the file containing the key.
```shell
$ # Upload file A, providing key A as the encryption key
$ docker exec tools sh -c 'echo "encrypted with key A" | aws s3 cp - s3://sse-c/file-a.txt --sse-c AES256 --sse-c-key fileb:///tmp/key-a.raw'

$ # Upload file B, providing key B as the encryption key
$ docker exec tools sh -c 'echo "encrypted with key B" | aws s3 cp - s3://sse-c/file-b.txt --sse-c AES256 --sse-c-key fileb:///tmp/key-b.raw'
```

Then we try to view the contents of the files.
```shell
$ # Try to access the content without specifying a key
$ docker exec tools aws s3 cp s3://sse-c/file-a.txt -
download failed: s3://sse-c/file-a.txt to - An error occurred (400) when calling the HeadObject operation: Bad Request

$ # Specify key A to show content of file A
$ docker exec tools aws s3 cp s3://sse-c/file-a.txt - --sse-c AES256 --sse-c-key fileb:///tmp/key-a.raw
encrypted with key A

$ # Try and access content of file B with key A
$ docker exec tools aws s3 cp s3://sse-c/file-b.txt - --sse-c AES256 --sse-c-key fileb:///tmp/key-a.raw
download failed: s3://sse-c/file-b.txt to - An error occurred (403) when calling the HeadObject operation: Forbidden

$ # Specify key B to show content of file B
$ docker exec tools aws s3 cp s3://sse-c/file-b.txt - --sse-c AES256 --sse-c-key fileb:///tmp/key-b.raw
encrypted with key B
```

Here we can see how SSE-C behaves differently from the other two forms of server-side encryption. You cannot access an object at all without explicitly providing a key, and you must supply the exact key that was used for encryption: a wrong key simply results in access being denied.

If we inspect the object metadata, we can see that SSE-C is in use (`SSECustomerAlgorithm: AES256`) and that the object store has recorded only the MD5 checksum of the key we provided. The key itself is never stored; the checksum is just a fingerprint used to verify that the same key is being sent again on future requests.
```shell
# Request the metadata without specifying the key
$ docker exec tools aws s3api head-object --bucket sse-c --key file-a.txt                                                                                                                         
An error occurred (400) when calling the HeadObject operation: Bad Request

# Request the metadata without specifying the MD5 checksum of the key
$ docker exec tools sh -c 'aws s3api head-object --bucket sse-c --key file-a.txt --sse-customer-algorithm AES256 --sse-customer-key "$(cat /tmp/key-a.raw | base64)"'                           
An error occurred (403) when calling the HeadObject operation: Forbidden

# Request metadata of the “file-a” using the key and the MD5 of the key
$ KEY_A_B64=$(docker exec tools sh -c 'cat /tmp/key-a.raw | base64 | tr -d "\n"')
$ KEY_A_MD5=$(docker exec tools sh -c 'cat /tmp/key-a.raw | openssl dgst -md5 -binary | base64 | tr -d "\n"')
$ docker exec tools aws s3api head-object --bucket sse-c --key file-a.txt --sse-customer-algorithm AES256 --sse-customer-key "$KEY_A_B64" --sse-customer-key-md5 "$KEY_A_MD5"
{
...
"SSECustomerAlgorithm": "AES256",
"SSECustomerKeyMD5": "Eo/k3GmmGzVS+dPZ2I2L4w=="
}


# Request metadata of the “file-b” using the key and the MD5 of the key
$ KEY_B_B64=$(docker exec tools sh -c 'cat /tmp/key-b.raw | base64 | tr -d "\n"')
$ KEY_B_MD5=$(docker exec tools sh -c 'cat /tmp/key-b.raw | openssl dgst -md5 -binary | base64 | tr -d "\n"')
$ docker exec tools aws s3api head-object --bucket sse-c --key file-b.txt --sse-customer-algorithm AES256 --sse-customer-key "$KEY_B_B64" --sse-customer-key-md5 "$KEY_B_MD5"
{
...
"SSECustomerAlgorithm": "AES256",
"SSECustomerKeyMD5": "Z7luBZhzw79jWYX2fZmUAg=="
}
```

Do note: even to inspect the metadata, you now have to provide both the raw encryption key and its MD5 checksum: without both values, the object store refuses the request. This is a safety belt, not a security feature: since the object store never stores your key, it needs a fingerprint to verify that the exact same key is being resent on every request. Higher-level APIs like `aws s3 cp`, which we used earlier, calculate and send this MD5 checksum automatically; when you drop down to low-level APIs like `head-object`, you have to provide it yourself.

Finally, let’s look at both the object metadata and what the data actually looks like on disk:
```shell
# Print the contents of the file as stored in MinIO
$ docker exec minio cat /data/sse-c/file-a.txt/xl.meta
XL2 ??&?????X???F??냤Type?V2Obj??ID??DDir???OJJ;I??Q?Ϭ[?>?EcAlgo?EcM?EcN?EcBSize??EcIndex?EcDist??CSumAlgo?PartNums??PartETags??PartSizes?5?PartASizes??Size5?MTime???X?ڧMetaSys??x-minio-internal-inline-data?true?6X-Minio-Internal-Server-Side-Encryption-Seal-Algorithm?DAREv2-HMAC-SHA256?*X-Minio-Internal-Server-Side-Encryption-Iv?,XzbKOhCS3ePHuqW9g7ei0tMsLjWzvZ0+z3ozb9PUhgI=?2X-Minio-Internal-Server-Side-Encryption-Sealed-Key?XIAEfAOGy/1A6UvB1GOUyVVF1QGQNUxe6KxZziPEgDZ811Mz8knOCdgC5XaLtVSxPqIrT6shDAk3eGQ3ukDXQdA==?x-minio-internal-crc?% ?z?4???????V??G?>&?QMq.??>J?MetaUsr??etag?`20010f00a96965110a7abda9c03f47458227a360feae7c4304527ae4c74547b222937c703326f1531b0f914c10f1f5be?content-type?binary/octet-stream?v??yv???null?U}?a???w?`?kk:???`?v?4?b??? ?y?K?&???.u????7,~()???8%
```

Like with the other two SSE forms, the data is clearly stored as gibberish at rest. However, unlike SSE-S3 and SSE-KMS, there is no identifier anywhere that tells you which key was used. The object store only has a sealed data key and a checksum fingerprint, but no key ID you can later refer back to.

That means you're not just at risk of losing access if a key is lost. You also have to maintain your own mapping of which key was used for which object. At scale, and especially in multi-tenant buckets, this quickly becomes real operational overhead and a genuine footgun: lose the key or the mapping, and the data is gone forever.

### Spark & Iceberg

Now let's look at how Spark behaves with SSE-C. First, we generate 2 keys to be used.

```shell
# Create key “spark-key-a” and store it locally, not in KMS
$ docker exec tools sh -c 'openssl rand 32 > /tmp/spark-key-a.raw'

# Create key “spark-key-b” and store it locally, not in KMS
$ docker exec tools sh -c 'openssl rand 32 > /tmp/spark-key-b.raw'
```

Next, we create a table and insert data using key A. Just like with the low-level s3api calls earlier, Spark also requires both the raw key and its MD5 checksum to be configured. And just as importantly: this means the key ends up in plaintext inside Spark configuration on our side. This also means your Spark configs now contain raw key material, which has its own security implications!
```shell
# Store Base64 and MD5 checksum of the key in variables
$ KEY_A_B64=$(docker exec tools sh -c 'cat /tmp/spark-key-a.raw | base64 | tr -d "\n"')
$ KEY_A_MD5=$(docker exec tools sh -c 'cat /tmp/spark-key-a.raw | openssl dgst -md5 -binary | base64 | tr -d "\n"')

# Start spark with above variables for “spark-key-a”, create a database, a table and insert data
$ docker exec -it spark spark-sql \
--conf spark.sql.catalog.local.warehouse=s3://sse-c/ \
--conf spark.sql.catalog.local.s3.sse.type=custom \
--conf "spark.sql.catalog.local.s3.sse.key=$KEY_A_B64" \
--conf "spark.sql.catalog.local.s3.sse.md5=$KEY_A_MD5"
…
spark-sql ()> CREATE DATABASE sse_c;
spark-sql ()> USE sse_c;
spark-sql (sse_c)> CREATE TABLE table_a (id INT, data STRING);
spark-sql (sse_c)> INSERT INTO table_a VALUES (1, 'encrypted with key A');
spark-sql (sse_c)> SELECT * FROM table_a;
1	encrypted with key A
```

Now we start Spark again, this time configured with key B, and try to read from the same table:
```shell
# Store Base64 and MD5 checksum of the key in variables
$ KEY_B_B64=$(docker exec tools sh -c 'cat /tmp/spark-key-b.raw | base64 | tr -d "\n"')
$ KEY_B_MD5=$(docker exec tools sh -c 'cat /tmp/spark-key-b.raw | openssl dgst -md5 -binary | base64 | tr -d "\n"')

# Start spark with above variables for “spark-key-b” and try to select data
$ docker exec -it spark spark-sql \
--conf spark.sql.catalog.local.warehouse=s3://sse-c/ \
--conf spark.sql.catalog.local.s3.sse.type=custom \
--conf "spark.sql.catalog.local.s3.sse.key=$KEY_B_B64" \
--conf "spark.sql.catalog.local.s3.sse.md5=$KEY_B_MD5"
…
spark-sql ()> USE sse_c;
spark-sql (sse_c)> SELECT * FROM table_a;
26/01/25 04:04:54 WARN Tasks: Retrying task after failure: sleepTimeMs=102 Access Denied. (Service: S3, Status Code: 403, Request ID: 188DDD9CF1BFCEA8, Extended Request ID: dd9025bab4ad464b049177c95eb6ebf374d3b3fd1af9251148b658df7ac2e3e8)
software.amazon.awssdk.services.s3.model.S3Exception: Access Denied. (Service: S3, Status Code: 403, Request ID: 188DDD9CF1BFCEA8, Extended Request ID: dd9025bab4ad464b049177c95eb6ebf374d3b3fd1af9251148b658df7ac2e3e8)
```

As expected, Spark cannot read data that was encrypted with a different key. Every object Spark needs to access must be decryptable with the single key it was configured with, otherwise queries will fail. Per-table SSE-C keys via table properties are not currently supported in Iceberg, but would be a natural extension, similar to [CSE table encryption](#client-side-encryption).

We'll leave inspecting the object metadata and the on-disk data to the reader. The result is in line with the earlier SSE-C CLI example: the data at rest is encrypted, and the object metadata only contains the SSE-C algorithm and a key fingerprint. There is no way to tell which actual key was used when writing from the data stored on disk.

### Key rotation

Key rotation with SSE-C is a lot more involved. There is no KMS attached to the object store that transparently handles it for you. From the object store’s perspective, there is no concept of “key versions” at all: every key is just an opaque blob that must be supplied on each request. That means rotation becomes a fully client-side operation, and you are responsible for re-encrypting data yourself.

Let’s walk through an example. We start with a clean bucket, generate version 1 of our key, and upload some data with it:

```shell
# Create key “key-v1” and store it locally in tool container, not in KMS
$ docker exec tools sh -c 'openssl rand 32 > /tmp/key-v1.raw'

# Upload file “data.txt” encrypted with “key-v1”
$ docker exec tools sh -c 'echo "original data" | aws s3 cp - s3://sse-c/data.txt --sse-c AES256 --sse-c-key fileb:///tmp/key-v1.raw'
```

Now we create a v2 of that key and try to “rotate” the object by copying it onto itself, like we did in the SSE-S3 example:
```shell
# Create key “key-v2” and store it locally in tool container, not in KMS
$ docker exec tools sh -c 'openssl rand 32 > /tmp/key-v2.raw'

# Try copying the data without specifying any key
$ docker exec tools aws s3 cp s3://sse-c/data.txt s3://sse-c/data.txt
fatal error: An error occurred (400) when calling the HeadObject operation: Bad Request

# Try copying the data to get it encrypted with “key-v2” by the object store
$ docker exec tools aws s3 cp s3://sse-c/data.txt s3://sse-c/data.txt --sse-c AES256 --sse-c-key fileb:///tmp/key-v2.raw
fatal error: An error occurred (403) when calling the HeadObject operation: Forbidden
```

This fails! What we actually need to do is provide both keys: the old one to read the existing object, and the new one to write it back. That allows the object store to decrypt with v1 and re-encrypt with v2:
```shell
# Copy the file specifying both source key “key-v1” and destination key “key-v2”
$ docker exec tools sh -c 'aws s3 cp s3://sse-c/data.txt s3://sse-c/data.txt --sse-c AES256 --sse-c-key fileb:///tmp/key-v2.raw --sse-c-copy-source AES256 --sse-c-copy-source-key fileb:///tmp/key-v1.raw'
copy: s3://sse-c/data.txt to s3://sse-c/data.txt

# Try to access the data with “key-v1” after rotation
$ docker exec tools aws s3 cp s3://sse-c/data.txt - --sse-c AES256 --sse-c-key fileb:///tmp/key-v1.raw
download failed: s3://sse-c/data.txt to - An error occurred (403) when calling the HeadObject operation: Forbidden

# Try to access the data with “key-v2” after rotation
$ docker exec tools aws s3 cp s3://sse-c/data.txt - --sse-c AES256 --sse-c-key fileb:///tmp/key-v2.raw
original data
```

At this point, the old key can no longer access the data: the rotation is complete.

Thinking back to our Spark example, this has an important implication. The moment you rotate a key like this, any Spark instance still configured with the previous key will immediately lose access to the data. In practice, this means all data an application depends on must be rotated in one coordinated operation.

Unless of course the application you use has explicit code to track which key version to use for which object.
That kind of per-object key awareness is not universally implemented in many popular tools today, which makes SSE-C key rotation operationally risky at scale. Skipping regular rotation increases the blast radius if a key is ever compromised, and it also means your organization never builds the operational muscle to perform this kind of re-encryption safely when you eventually have to do it under pressure.

### Key Takeaways
* You fully control the encryption keys: the object store never stores them and cannot decrypt anything unless you explicitly provide the correct key on every request.
* There is no built-in concept of key versions or automatic rotation: from the object store’s perspective, every key is just an opaque blob it forgets after using it to encrypt/decrypt.
* Object metadata only records that SSE-C is used and a fingerprint (MD5) of the key; it does not tell you which actual key was used. You will need to keep that mapping on your side.
* With `S3FileIO`, applications like Spark can only use a single key per session or catalog configuration. `HadoopFileIO` with S3A supports per-bucket keys, but all data within a bucket must use the same key.

The main win over SSE-S3 and SSE-KMS is maximum isolation and provider independence: you can use different keys per tenant or workload, and your cloud provider never has custody of your keys. A compromised key or application configuration only exposes the objects encrypted with that specific key.

The tradeoff is operational risk: losing a key permanently locks you out of the data, and rotating keys is a fully client-side re-encryption process. Because the object store cannot tell you which key belongs to which object, you must track key usage yourself. At scale or in multi-tenant buckets, this quickly becomes complex and brittle.

## Client-Side Encryption

With CSE, [encryption happens entirely on your side](/blog/data-lakehouse-encryption-iceberg#client-side-encryption) before data reaches the object store. The provider never sees plaintext.

The last form of encryption we discuss is Client-Side Encryption (CSE). This is the true zero-trust option, used when you cannot trust your object store provider to ever see plaintext data.

With CSE, the entire burden of key management and encryption moves to your application layer. The object store only ever sees opaque blobs and is not involved in encryption or decryption. As a result, you also lose a number of advanced features that object stores normally provide.

### AWS CLI

We start by creating a bucket and generating an encryption key we will use in this section. Note that there is no need to enable encryption on the bucket itself. You can do so, but that would simply add another layer of server-side encryption on top of your already encrypted data.
```shell
$ # create a bucket named “cse”
$ docker exec tools aws s3 mb s3://cse
make_bucket: cse

$ # create a key named “cse.key” and store locally in tools container
$ docker exec tools sh -c 'openssl rand -base64 32 > /tmp/cse.key'

$ # print key “cse.key”
$ docker exec tools sh -c 'echo "CSE Key: $(cat /tmp/cse.key)"'
CSE Key: ePwZKjzzVX8rRMopm43vGWDJ4BiUAkMoVb1qQ71D4F4=
```

Next, we create a data file locally, encrypt it ourselves, and then upload the encrypted blob to the object store:
```shell
$ # Create file “plaintext.txt” and store in tools container
$ docker exec tools sh -c 'echo "this is my secret data" > /tmp/plaintext.txt'


$ # Encrypt file "plaintext.txt" with "cse.key", store as new file "encrypted.bin"
$ docker exec tools sh -c 'openssl enc -aes-256-cbc -pbkdf2 -in /tmp/plaintext.txt -out /tmp/encrypted.bin -pass "pass:$(cat /tmp/cse.key)"'

$ # Copy file “encrypted.bin” from tools container to “secret.bin” in MinIO
$ docker exec tools aws s3 cp /tmp/encrypted.bin s3://cse/secret.bin
upload: tmp/encrypted.bin to s3://cse/secret.bin
```

If we print the content of the file locally and directly from MinIO’s on-disk storage, we can see that they match exactly:
```shell
$ # Print content of file “encrypted.bin” in tools container
$ docker exec tools cat /tmp/encrypted.bin
Salted__V?^?#??8T?Ko,??^?C:ɔr?'=4???HJH.??%

$ # Print content of file “secret.bin” in MinIO
$ docker exec minio cat /data/cse/secret.bin/xl.meta
XL2 ???&???? 7z0???q?\??Type?V2Obj??ID??DDir??"?:?F??Z4?(?A8?EcAlgo?EcM?EcN?EcBSize??EcIndex?EcDist??CSumAlgo?PartNums??PartETags??PartSizes?0?PartASizes?0?Size0?MTime?? 7z0?MetaSys??x-minio-internal-inline-data?true?x-minio-internal-crc?	???MetaUsr??content-type?application/octet-stream?etag? b113f379acc003cb58f4f565817cc392?v??8??null?PR???f? ?????民???Q?]?9?Ȏ?u?Salted__V?^?#??8T?Ko,??^?C:ɔr?'=4???HJH.??%
```

As expected, this behaves very differently from all forms of server-side encryption. The object store stores and serves the data as is. When we download the object, we simply get back the encrypted blob and must decrypt it ourselves using our key. This works just as we saw in the unencrypted example.

Besides the complexity of moving all encryption handling to your application layer, you also lose a number of advanced features that object stores normally provide. Features like S3 Select, which let you run SQL queries directly against object contents, become unusable. With CSE, the object store cannot inspect file contents at all, so you either have to maintain your own metadata about what is in each file or download and decrypt every object client-side just to inspect it.

Other features you either lose entirely or that become much less practical include range reads, cache validation, data integrity checks, and presigned URLs. The latter can still be used, but you will only ever be sharing encrypted blobs, pushing the decryption burden to whoever receives the link.

### Spark & Iceberg

Customer-side encryption is starting to emerge in Apache Iceberg under the name Table Encryption. The idea is to let you define, per table, which key should be used via table properties, with Spark talking directly to a KMS instead of relying on the object store for encryption and decryption.

At the time of writing, this is still limited and experimental, and showcasing it would significantly complicate our lab setup. That said, the proposed design, with the Iceberg catalog tracking which keys are used for which files, looks like a promising path to making CSE workable for lakehouse deployments, especially in hybrid or multi-cloud environments.

For a demo and a look at the design, see this [Iceberg Summit 2024 talk](https://www.youtube.com/watch?v=3-NYDmhQU7Q).

### Key rotation

With CSE, the object store only ever sees opaque encrypted blobs, so it cannot help you with key rotation at all. Where SSE-S3 and SSE-KMS handled rotation transparently, and SSE-C at least gave us a server-side copy mechanism, CSE leaves everything to the client. Rotating a key now means you must download each object, decrypt it locally, re-encrypt it with the new key, and upload it again.

We leave the exact commands as an exercise for the reader as the mechanics should be clear from the earlier examples. The important point is the operational impact: at scale, key rotation becomes very expensive and disruptive. You have to move all affected data out of the object store and back in again. In a cloud environment, this can also introduce significant egress, cross-zone, or cross-region costs.

Tracking progress during a key rotation is another problem. You now need to know which objects are still encrypted with the old key and which have already been rotated. This creates the same class of operational risk as SSE-C, but amplified: not only do you have per-object keys to track, you also have a long-running, failure-prone re-encryption workflow that must be carefully coordinated to avoid data loss or partial lockout.

As with SSE-C, skipping regular rotation increases the blast radius if a key is ever compromised. It also means your organization never builds the operational muscle to perform this kind of large-scale re-encryption safely, which becomes a serious liability when you eventually have to do it under pressure.

### Key Takeaways
* All encryption and decryption is entirely handled by your application. The object store only ever sees opaque blobs.
* The object store cannot decrypt or inspect your data at all; losing the key means permanently losing access to the data encrypted with it.
* Object metadata does not reveal which key was used, so you must track key usage yourself for every object.
* Advanced object store features like S3 Select, server-side filtering, and content inspection no longer work.
* Key rotation is a fully client-side operation: objects must be downloaded, decrypted, re-encrypted, and re-uploaded.
* At scale, key rotation becomes operationally expensive and can incur significant data transfer and storage costs.

CSE gives you the strongest isolation from your cloud provider, but it shifts the entire security and operational burden onto your application and organization. Any mistake in key handling, tracking, or rotation can result in permanent data loss. It also significantly raises the cost and complexity of day-two operations like audits, re-encryption, and incident response.

## Conclusion

We walked through five encryption approaches, from no encryption through SSE-S3, SSE-KMS, SSE-C, to client-side encryption, and saw exactly what the data looks like on disk in each case.

The main takeaway: there's no single right answer. SSE-S3 is effortless but gives you no key control. SSE-KMS adds isolation at the cost of complexity. SSE-C and CSE give you full control but shift the operational burden entirely to your side. The [cheat sheet](#encryption-cheat-sheet) at the top summarizes the tradeoffs.

At IOMETE, we specialize in on-premises lakehouses with full data sovereignty. If that's what you're building, [let's talk](https://iomete.com/contact).

## Appendix

Below is the `docker-compose` file used.

Please note that we use a patched version of MinIO. The latest available version has a bug preventing it from reading data encrypted with older key versions after key rotation. We have patched this issue and published a pre-built image for convenience. Unfortunately, the MinIO repository has been archived, so we cannot submit the fix upstream.

You can download the content below and place it in a file named `docker-compose.yaml` in a local directory on your machine. To start any of the labs shown, run `docker compose up -d`. To teardown the entire setup, run `docker compose down -v`.

```yaml
# =============================================================================
# Iceberg Encryption Demo Environment (with MinIO KMS - minkms)
# =============================================================================
# This docker-compose sets up:
#   - MinIO KMS (minkms) for key management with versioning support
#   - MinIO as S3-compatible storage with KMS integration
#   - Tools container with CLI tools (aws, mc, minkms, parq, hexdump)
#   - Spark with Iceberg for running queries
#
# Start with: docker compose up -d
# CLI tools:  docker exec tools <command>
# Spark SQL:  docker exec spark spark-sql [options]
# =============================================================================
services:
  # ---------------------------------------------------------------------------
  # Certificate Generator (reuses Spark image - has openssl + keytool)
  # ---------------------------------------------------------------------------
  certgen:
    image: apache/spark:3.5.7
    user: root
    volumes:
      - kms-certs:/certs
      - minio-certs:/minio-certs
    entrypoint: ["/bin/bash", "-c"]
    command:
      - |
        set -e
        # Skip if all certs already exist
        if [ -f /certs/private.key ] && [ -f /minio-certs/private.key ] && [ -f /minio-certs/truststore.jks ]; then
          echo 'Certs already exist, skipping'
          exit 0
        fi
        # KMS server certificate
        if [ ! -f /certs/private.key ]; then
          echo 'Generating KMS server certs...'
          openssl req -new -newkey rsa:2048 -days 365 -nodes -x509 \
            -subj '/CN=minio-kms' \
            -addext 'subjectAltName=DNS:minio-kms,DNS:localhost,IP:127.0.0.1' \
            -keyout /certs/private.key -out /certs/public.crt
        fi
        # MinIO server certificate
        if [ ! -f /minio-certs/private.key ]; then
          echo 'Generating MinIO server certs...'
          openssl req -new -newkey rsa:2048 -days 365 -nodes -x509 \
            -subj '/CN=minio' \
            -addext 'subjectAltName=DNS:minio,DNS:localhost,IP:127.0.0.1' \
            -keyout /minio-certs/private.key -out /minio-certs/public.crt
        fi
        # MinIO KMS client certificate (for MinIO to auth to minkms)
        if [ ! -f /certs/client.key ]; then
          echo 'Generating MinIO KMS client cert...'
          openssl req -new -newkey rsa:2048 -days 365 -nodes -x509 \
            -subj '/CN=minio-client' \
            -keyout /certs/client.key -out /certs/client.crt
        fi
        # Copy KMS CA cert to MinIO's CA directory
        mkdir -p /minio-certs/CAs
        cp /certs/public.crt /minio-certs/CAs/minio-kms.crt
        # Java truststore for Spark
        if [ ! -f /minio-certs/truststore.jks ]; then
          echo 'Creating Java truststore...'
          JAVA_HOME=$$(dirname $$(dirname $$(readlink -f $$(which java))))
          cp $$JAVA_HOME/lib/security/cacerts /minio-certs/truststore.jks
          keytool -import -trustcacerts -noprompt -alias minio \
            -file /minio-certs/public.crt -keystore /minio-certs/truststore.jks -storepass changeit
          keytool -import -trustcacerts -noprompt -alias minio-kms \
            -file /certs/public.crt -keystore /minio-certs/truststore.jks -storepass changeit
        fi
        echo 'All certs generated'
  # ---------------------------------------------------------------------------
  # MinIO KMS (minkms) - Key Management Service with Versioning
  # ---------------------------------------------------------------------------
  minio-kms:
    image: quay.io/minio/aistor/minkms:latest
    container_name: minio-kms
    depends_on:
      certgen:
        condition: service_completed_successfully
    ports:
      - "7373:7373"
    volumes:
      - kms-data:/mnt/minio-kms
      - kms-certs:/certs:ro
    environment:
      - MINIO_KMS_HSM_KEY=hsm:aes256:DDRvKllG1OuyocfCQwJOgIC44e4hFWiKm+SeDZN4A2s=
    configs:
      - source: kms_config
        target: /etc/minkms/config.yaml
    command: ["server", "--config", "/etc/minkms/config.yaml", "/mnt/minio-kms"]
  # ---------------------------------------------------------------------------
  # MinIO KMS Initialization
  # ---------------------------------------------------------------------------
  kms-init:
    image: alpine:latest
    depends_on:
      minio-kms:
        condition: service_started
    volumes:
      - kms-certs:/certs
    environment:
      - MINIO_KMS_SERVER=https://minio-kms:7373
      - MINIO_KMS_API_KEY=k1:b_6Dhm4iqaGR1gd_CkAA_otcPtgaqS2Xixb_G95TJV8
    entrypoint: ["/bin/sh", "-c"]
    command:
      - |
        set -e
        apk add --no-cache curl
        # Download minkms CLI
        ARCH=$$(uname -m | sed 's/aarch64/arm64/' | sed 's/x86_64/amd64/')
        echo "Downloading minkms CLI for $$ARCH..."
        curl -sSL "https://dl.min.io/aistor/minkms/release/linux-$${ARCH}/minkms" -o /usr/local/bin/minkms
        chmod +x /usr/local/bin/minkms
        sleep 3
        echo 'Initializing MinIO KMS...'
        # Create enclave for MinIO
        echo 'Creating enclave for MinIO...'
        minkms add-enclave -k minio-enclave 2>&1 || true
        # Compute identity from MinIO client certificate
        echo 'Computing client certificate identity...'
        CLIENT_IDENTITY=$$(minkms identity /certs/client.crt 2>&1)
        echo "Client identity: $$CLIENT_IDENTITY"
        echo "$$CLIENT_IDENTITY" > /certs/client.identity
        # Register the certificate identity with admin policy
        echo 'Registering certificate identity...'
        minkms add-identity -k --enclave minio-enclave --admin "$$CLIENT_IDENTITY" 2>&1 || true
        # Create default encryption key
        echo 'Creating default encryption key...'
        minkms add-key -k --enclave minio-enclave minio-default-key 2>&1 || true
        echo 'MinIO KMS initialized'
  # ---------------------------------------------------------------------------
  # MinIO - S3-compatible Object Storage
  # ---------------------------------------------------------------------------
  minio:
    image: iomete.azurecr.io/labs/encryption-lab/minio:latest
    container_name: minio
    depends_on:
      kms-init:
        condition: service_completed_successfully
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio-data:/data
      - kms-certs:/kms-certs:ro
      - minio-certs:/root/.minio/certs:ro
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
      # KMS configuration - will be set by init script
      # minkms connection (not KES!)
      - MINIO_KMS_SERVER=https://minio-kms:7373
      - MINIO_KMS_ENCLAVE=minio-enclave
      - MINIO_KMS_SSE_KEY=minio-default-key
      - MINIO_KMS_API_KEY=k1:b_6Dhm4iqaGR1gd_CkAA_otcPtgaqS2Xixb_G95TJV8
    command: server /data --console-address ":9001"
  # ---------------------------------------------------------------------------
  # Tools Initialization
  # ---------------------------------------------------------------------------
  tools-init:
    image: python:3.11-slim
    depends_on:
      minio:
        condition: service_started
    volumes:
      - tools-bin:/tools
      - kms-certs:/kms-certs:ro
      - minio-certs:/minio-certs:ro
    entrypoint: ["/bin/bash", "-c"]
    command:
      - |
        set -e
        apt-get update && apt-get install -y --no-install-recommends curl bsdmainutils
        # Copy hexdump
        cp /usr/bin/hexdump /tools/
        mkdir -p /tools/lib
        cp /usr/lib/*/libbsd.so.* /tools/lib/ 2>/dev/null || true
        # Download CLI tools
        ARCH=$$(uname -m | sed 's/aarch64/arm64/' | sed 's/x86_64/amd64/')
        if [ ! -f /tools/mc ]; then
          echo 'Downloading mc CLI...'
          curl -sSL https://dl.min.io/client/mc/release/linux-$${ARCH}/mc -o /tools/mc
          chmod +x /tools/mc
        fi
        # Download minkms CLI
        if [ ! -f /tools/minkms ] || [ ! -s /tools/minkms ]; then
          echo 'Downloading minkms CLI...'
          curl -sSL "https://dl.min.io/aistor/minkms/release/linux-$${ARCH}/minkms" -o /tools/minkms
          chmod +x /tools/minkms
        fi
        # Install Python tools
        pip install --quiet --target=/tools/python awscli parquet-cli
        # Create CA bundle
        cat /etc/ssl/certs/ca-certificates.crt /minio-certs/public.crt /kms-certs/public.crt > /tools/ca-bundle.crt
        # Configure mc
        mkdir -p /tools/.mc/certs/CAs
        cp /minio-certs/public.crt /tools/.mc/certs/CAs/
        cp /kms-certs/public.crt /tools/.mc/certs/CAs/
        export PATH=/tools:$$PATH
        export SSL_CERT_FILE=/tools/ca-bundle.crt
        mc --config-dir /tools/.mc alias set minio https://minio:9000 minioadmin minioadmin
        # Create buckets
        echo 'Creating buckets...'
        mc --config-dir /tools/.mc mb minio/warehouse --ignore-existing
        mc --config-dir /tools/.mc mb minio/test-bucket --ignore-existing
        echo 'Done'
  # ---------------------------------------------------------------------------
  # Tools Container
  # ---------------------------------------------------------------------------
  tools:
    image: python:3.11-slim
    container_name: tools
    depends_on:
      tools-init:
        condition: service_completed_successfully
    volumes:
      - tools-bin:/tools:ro
      - kms-certs:/kms-certs:ro
      - minio-certs:/minio-certs:ro
    environment:
      - MINIO_KMS_SERVER=https://minio-kms:7373
      - MINIO_KMS_API_KEY=k1:b_6Dhm4iqaGR1gd_CkAA_otcPtgaqS2Xixb_G95TJV8
      - MINIO_KMS_TLS_CA=/kms-certs/public.crt
      - PATH=/tools:/tools/python/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
      - PYTHONPATH=/tools/python
      - MC_CONFIG_DIR=/tools/.mc
      - AWS_ACCESS_KEY_ID=minioadmin
      - AWS_SECRET_ACCESS_KEY=minioadmin
      - AWS_ENDPOINT_URL=https://minio:9000
      - AWS_REGION=us-east-1
      - AWS_CA_BUNDLE=/tools/ca-bundle.crt
      - SSL_CERT_FILE=/tools/ca-bundle.crt
      - LD_LIBRARY_PATH=/tools/lib
    command: tail -f /dev/null
  # ---------------------------------------------------------------------------
  # Spark Container
  # ---------------------------------------------------------------------------
  spark:
    image: apache/spark:3.5.7
    container_name: spark
    user: root
    depends_on:
      tools:
        condition: service_started
    volumes:
      - kms-certs:/kms-certs:ro
      - minio-certs:/minio-certs:ro
      - spark-ivy-cache:/root/.ivy2
    environment:
      - PATH=/opt/spark/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
      - AWS_REGION=us-east-1
    configs:
      - source: spark_defaults
        target: /opt/spark/conf/spark-defaults.conf
    command: tail -f /dev/null
# =============================================================================
# Configs
# =============================================================================
configs:
  kms_config:
    content: |
      version: v1
      admin:
        api-key: k1:b_6Dhm4iqaGR1gd_CkAA_otcPtgaqS2Xixb_G95TJV8
      tls:
        certs:
          - key: /certs/private.key
            cert: /certs/public.crt
  spark_defaults:
    content: |
      spark.jars.packages=org.apache.iceberg:iceberg-spark-runtime-3.5_2.12:1.10.0,software.amazon.awssdk:s3:2.29.33,software.amazon.awssdk:sts:2.29.33,software.amazon.awssdk:kms:2.29.33,software.amazon.awssdk:url-connection-client:2.29.33,org.xerial:sqlite-jdbc:3.42.0.0
      spark.sql.extensions=org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions
      spark.sql.defaultCatalog=local
      spark.sql.catalog.local=org.apache.iceberg.spark.SparkCatalog
      spark.sql.catalog.local.catalog-impl=org.apache.iceberg.jdbc.JdbcCatalog
      spark.sql.catalog.local.uri=jdbc:sqlite:file:/tmp/iceberg_catalog.db
      spark.sql.catalog.local.warehouse=s3://warehouse/
      spark.sql.catalog.local.io-impl=org.apache.iceberg.aws.s3.S3FileIO
      spark.sql.catalog.local.s3.endpoint=https://minio:9000
      spark.sql.catalog.local.s3.access-key-id=minioadmin
      spark.sql.catalog.local.s3.secret-access-key=minioadmin
      spark.sql.catalog.local.s3.path-style-access=true
      spark.sql.catalog.local.s3.region=us-east-1
      spark.driver.extraJavaOptions=-Djavax.net.ssl.trustStore=/minio-certs/truststore.jks -Djavax.net.ssl.trustStorePassword=changeit
      spark.executor.extraJavaOptions=-Djavax.net.ssl.trustStore=/minio-certs/truststore.jks -Djavax.net.ssl.trustStorePassword=changeit
# =============================================================================
# Volumes
# =============================================================================
volumes:
  kms-data:
  kms-certs:
  minio-certs:
  tools-bin:
  minio-data:
  spark-ivy-cache:
```
