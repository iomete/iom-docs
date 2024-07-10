---
title: Temporary Shutdown for Maintenance
description: This documentation provides a step-by-step guide for temporarily shutting down IOMETE for maintenance purposes in a Kubernetes environment.
slug: /user-guide/shutdown-for-maintenance
last_update:
  date: 10/07/2024
  author: Fuad Musayev
---

import Img from '@site/src/components/Img';

### Overview
This documentation provides a step-by-step guide for temporarily shutting down IOMETE for maintenance purposes in a Kubernetes environment. The IOMETE system is deployed in a single namespace called `iomete-system`. The process includes stopping certain services, taking backups, scaling down resources, and uninstalling the data-plane. After maintenance, the services will be restored and the data-plane reinstalled.

### Steps to Shutdown IOMETE for Maintenance

#### 1. Stop Lakehouse and Spark Jobs
- Log in to the IOMETE console.
- Manually stop any running lakehouse, spark-connect, and Spark jobs.
- Disable scheduling, if enabled, for Spark jobs to prevent new jobs from starting during maintenance.

#### 2. Backup and Scale Down PostgreSQL and Minio
If you are using external databases and cloud storage (like AWS S3), skip this step.

- **Backup PostgreSQL Database**
  - Refer to PostgreSQL documentation for backup and restore procedures.
- **Backup Minio Storage**
  - Refer to Minio documentation for backup and restore procedures.

- **Scale Down PostgreSQL and Minio**
  ```sh
  kubectl -n iomete-system scale statefulset postgresql --replicas=0
  kubectl -n iomete-system scale deployment minio --replicas=0
  ```

#### 3. Remember IOMETE Version
- Record the current IOMETE Data-Plane version used.
  ```sh
  helm list -n iomete-system
  ```
  Or from IOMETE Console, open user menu.
  <Img src="/img/misc/maintenance-version.png" alt="Data Plane Version" />

#### 4. Uninstall Data-Plane
- Uninstall the data-plane using Helm.
  ```sh
  helm uninstall -n iomete-system data-plane
  ```

### Steps to Restore IOMETE After Maintenance

#### 1. Scale Up PostgreSQL and Minio Instances
- **Scale Up PostgreSQL and Minio**
  ```sh
  kubectl -n iomete-system scale statefulset postgresql --replicas=1
  kubectl -n iomete-system scale deployment minio --replicas=1
  ```

#### 2. Reinstall Data-Plane
- Install the data-plane using the same version and the `values.yaml` file used in the previous installation (ignore this step if you used default values).
  ```sh
  helm upgrade --install -n iomete-system data-plane iomete/iomete-data-plane-enterprise -f /path/to/values.yaml --version <iomete-version>
  ```

### Notes
- Always ensure you have recent backups before performing any maintenance activities.
- If any issues arise during the process, consult with the IOMETE support for assistance.

### Conclusion
Following these steps will help ensure that your IOMETE system is properly shut down for maintenance and restored without data loss. Always verify each step, especially when dealing with backups and data restoration.
