---
title: JDBC Driver
description: IOMETE warehouse JDBC endpoints are compatible with Hive JDBC drivers
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

___

IOMETE warehouse JDBC endpoints are compatible with Hive JDBC drivers. So we can use the following dependency from the `Maven Repository:`

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.hive</groupId>
        <artifactId>hive-jdbc</artifactId>
        <version>2.3.9</version>
    </dependency>
</dependencies>
```

:::success
Currently, the supported version is  <=2.3.9
:::