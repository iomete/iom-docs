---
title: DBT integration
last_update:
  date: 10/04/2022
  author: Vugar Dadalov
---

<!-- <head>
  <title>DBT integration</title>
  <meta
    name="description"
    content="DBT integration"
  />
</head> -->

Setup profile to connect iomete DBT adapter
___

### Installation and Distribution

The easiest way to install dbt-iomete is to use `pip`:

```shell
pip install dbt-iomete
```

Alternatively, you can install the package from GitHub with:

```text
pip install git+https://github.com/iomete/dbt-iomete.git
```

### Set up a iomete Target​

iomete targets should be set up using the following configuration in your `profiles.yml` file.

```yaml
iomete:
  target: dev
  outputs:
    dev:
      type: iomete
      cluster: cluster_name
      host: <region_name>.iomete.com
      account_number: 123456
      port: 443
      schema: database_name
      user: iomete_user_name
      password: iomete_user_password
```



### Description of Profile Fields

| Field          | Description                                                                                        | Required | Example                |
| :------------- | :------------------------------------------------------------------------------------------------- | :------- | :--------------------- |
| type           | The specific adapter to use                                                                        | Required | `iomete`               |
| cluster        | The cluster to connect                                                                             | Required | `reporting`            |
| host           | - The host name of the connection. It starts with your region name like`<region_name>.iomete.com`. | Required | `frankfurt.iomete.com` |
| account_number | iomete account number                                                                              | Required | `123456`               |
| port           | The port to use.                                                                                   | Required | `443`                  |
| schema         | Specify the schema (database) to build models into.                                                | Required | `dbt_finance`          |
| user           | The iomete username to use to connect to the server.                                               | Required | `dbt_user`             |
| password       | The iomete user password to use to connect to the server.                                          | Required | `strong_password`      |