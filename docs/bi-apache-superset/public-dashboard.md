---
title: Public Dashboards
---

<!-- <head>
  <title>Public Dashboards</title>
  <meta
    name="description"
    content="Public Dashboards"
  />
</head> -->

Share Dashboard And Charts
___



In some cases, you will need to share dashboards with team members who don't have an iomete account. In most cases, you can just invite them to use / create / edit dashboards through Users & Groups settings. But it is possible to share dashboards without creating accounts. 

By default, BI requires an account in order to view dashboards, but you can change that behavior by following the next steps:

1. Go to BI tool and from **Settings** menu choose **Roles**. You will see the role named "**Public**".

![sharing dashboards with team members on iomete console](/img/bi-apache-superset/dashboard-bi-role-settings.png)

1. Edit **Public** role and provide the following system accesses and datasource (which you want to be publicly available) individually
```
menu access on Home
can get on MenuApi
can get on Datasource
can query form data on Api
can query on Api
can log on Superset
can explore on Superset
can read on CssTemplate
can time range on Api
can queries on Superset
can filter on Superset
can dashboard on Superset
can results on Superset
can slice on Superset
can publish on Superset
database access on [main].(id:9)
datasource access on [main].[customers](id:1)
datasource access on [main].[orders](id:2)
schema access on [main].[example]
can fetch datasource metadata on Superset
can datasources on Superset
can tables on Superset
can list on FilterSets
can show on DynamicPlugin
can list on DynamicPlugin
can read on Dashboard
can read on Chart
can read on Dataset
can read on Database
can read on SecurityRestApi
can schemas on Superset
can sql json on Superset
can explore json on Superset
```

![sharing data with different roles](/img/bi-apache-superset/dashboard-bi-public-accesses.png)

1. Go to the dashboard you would like to share and from right menu select one of the options [**Copy dashboard URL** or **Share dashboard by email**]

:::info Browser Compatibility
Please keep in mind that copy URL won't work in Safari browser, due to Apple software limitations
:::

![copy dashboard URL iomete console](/img/bi-apache-superset/dashboard-bi-copy-url.png)

You can verify it is working by simple opening the copied link in incognito mode (or you can just log out). You should be able to view dashboard without any Menu item or Edit actions visible

![copying URL iomete console](/img/bi-apache-superset/dashboard-bi-dash.png)

:::warning Access denied issue
If one or more chart throws access denied error, please make sure that **Public** role has access to all data sources that the chart uses.
:::

:::info Public Access
It is important to understand that anyone with the link will be able to access (view) your data. But depending on your company's security policies, you could provide additional accesses to **Public** role
:::
