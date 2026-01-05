---
title: IOMETE Release Notes
sidebar_label: Platform
description: Get latest release notes for IOMETE. Learn about new features, enhancements, and bug fixes in each release.
last_update:
  date: 07/31/2024
  author: Fuad Musayev
---

import Img from '@site/src/components/Img';
import GridBox from '@site/src/components/GridBox';
import Mailer from '@site/src/components/Mailer';
import { Release, NewFeatures, Improvements, BugFixes, ReleaseDescription, Deprecations, BreakingChanges } from '@site/src/components/Release';

<Mailer/>

<Release version="3.15.0" date="January 5th, 2026">
<!--
Abhishek Pathania
  kotlin:
      01e0a409f 2025-10-28 Abhishek Pathania Add job orchestrator queue configs in system configs (#1302)
      5c7f085eb 2025-11-14 Abhishek Pathania Add job user and tags to job (#1391)
      01dc8c459 2025-11-07 Abhishek Pathania Auto retry quota failed jobs (#1332)
      264deadfa 2025-11-12 Abhishek Pathania Fix manual run handling for Prefect-managed Spark jobs (#1377)
      bea9ec12b 2025-11-18 Abhishek Pathania Fix Prefect retry visibility and tag propagation for scheduled jobs. (#1448)
      39c43b0c0 2025-10-30 Abhishek Pathania Fix startup timeout not being enforced due to executor state (#1307)
      f6df37582 2025-11-14 Abhishek Pathania Retry run handling for prefect cancelled jobs (#1387)
      81c0c95db 2025-11-17 Abhishek Pathania Revert executor changes as this is working as expected (Fix updateJob API transactional issue) (#1401)
      7db628eed 2025-11-13 Abhishek Pathania Sync status from Prefect for manual runs (#1385)
  infra:
      -
  iom-console:
      -

alokhp
  kotlin:
      6364d7a7b 2025-12-11 alokhp fix: add support for md5 checksum for ECS compatability (#1616)
      923d418f7 2025-11-17 alokhp fix: compaction zorder operation failure (#1436)
      055755140 2025-10-21 alokhp fix: failing test in PojoSchemaMapperTest.kt (#1267)
      43d22addb 2025-11-28 alokhp fix: support for splunk basic auth as well for log fetching (#1511)
      1a5eb774e 2025-10-30 alokhp fix: test connection fix that works with minio and ecs (#1311)
      713cbea8e 2025-12-23 alokhp Revert "fix: add support for md5 checksum for ECS compatability (#1616)" (#1674)
  infra:
      9bf711f9 2025-10-25 alokhp chore: add feature flag s3ChecksumValidationDisabled (#258)
      139dbcbf 2025-10-30 alokhp Revert "chore: add feature flag s3ChecksumValidationDisabled (#258)"
  iom-console:
      -

Altay
  kotlin:
      545e365e4 2025-12-30 Altay fix for driver nfs volume to not override the existing attached volumes (#1773)
      ed35026c2 2025-10-21 Altay fixing failing test after removing some strong validations in code for the token length (#1266)
  infra:
      b8988c69 2025-10-31 Altay bump proxy version (#262)
      184c3b6e 2025-11-21 Altay bumped proxy version and also set proper resources (#323)
  iom-console:
      -

Aslan Bakirov
  kotlin:
      911df413d 2025-11-25 Aslan Bakirov Ab/add release tag (#1359)
      0b3e974f0 2025-10-21 Aslan Bakirov Add common and cloud-storages-lib to the CI (#1193)
      a90f0efe5 2025-10-25 Aslan Bakirov Fix test connection issue (#1278)
      26df71bac 2025-10-28 Aslan Bakirov Revert "build(deps): bump software.amazon.awssdk:s3 in /iom-rest-catalog (#1289)" (#1304)
      015b4200d 2025-10-28 Aslan Bakirov Revert "build(deps): bump software.amazon.awssdk:sts in /iom-core (#1296)" (#1303)
  infra:
      236acb27 2025-11-20 Aslan Bakirov Add alerts and contact points for dell (#320)
      125e9cd4 2025-11-25 Aslan Bakirov Add new alerts (#325)
      ac8f4085 2025-12-17 Aslan Bakirov Add new dashboards (#357)
      2278033c 2025-12-18 Aslan Bakirov Add new dashboards (#360)
      94203b7f 2025-11-25 Aslan Bakirov Add release tag in other repos (#273)
      ae118366 2025-12-09 Aslan Bakirov Add rust-monorepo to release pipeline (#351)
      c75c6b42 2025-12-07 Aslan Bakirov Add trustore volume (#345)
      4efcb1d4 2025-12-18 Aslan Bakirov bump the chart version (#361)
      8754d674 2025-11-04 Aslan Bakirov Dell Prod Dashboards (#268)
      caae6fa6 2025-11-10 Aslan Bakirov Fix deployment of papyrus (#278)
      26afb977 2025-11-17 Aslan Bakirov Image url fixup (#307)
      5ad061ef 2025-12-03 Aslan Bakirov New dash (#340)
      eb228f27 2025-12-18 Aslan Bakirov New dashboards (#359)
      3d8699ef 2025-11-10 Aslan Bakirov Remove wierd characters (#272)
      c1706d32 2025-11-18 Aslan Bakirov Update chart version (#313)
      cc3f57af 2025-11-17 Aslan Bakirov Update ns dashboard (#308)
      20587d6d 2025-11-25 Aslan Bakirov Update version (#326)
      f7f2b6fc 2025-11-27 Aslan Bakirov Upgrade iom-socket version (#329)
  iom-console:
      8142d6e21 2025-11-25 Aslan Bakirov Add release tag (#492)

azsefi
  kotlin:
      738f38959 2025-12-21 azsefi feat(core/volumes): Use selected volume for driver as well (#1667)
      175140ed5 2025-10-22 azsefi fix(iom-core/token): expiration should be null for 'never' expiration (#1272)
      8c7463235 2025-11-17 azsefi Handle getViews on empty spark_catalog schema (#1433)
  infra:
      af16ac9e 2025-11-10 azsefi Add iom-event-ingest monitoring (#261)
      45c2acd1 2025-11-28 azsefi Add Papyrus/Loader monitoring (#331)
  iom-console:
      -


Fuad Musayev
  kotlin:
      035c1d0af 2025-12-15 Fuad Musayev Added classification tags service (#1625)
      8f36eab21 2025-12-12 Fuad Musayev Added notification validation and readmes (#1618)
      ccb11f93b 2025-10-24 Fuad Musayev Added s3fs library to docker
      0d709aa61 2025-10-24 Fuad Musayev Added sample jupyter-notebooks
      398380d4a 2025-12-01 Fuad Musayev Added write-enable=false (#1556)
      0cf4cf851 2025-11-21 Fuad Musayev Bump jupyter-container base image (#1460)
      fed70908f 2025-11-05 Fuad Musayev Changes in docker image of Jupyter Container
      bf74dda69 2025-10-23 Fuad Musayev Image size adjusted for login page
      189b1b645 2025-12-05 Fuad Musayev In app notification (#1577)
      beec5768e 2025-12-27 Fuad Musayev Jc docker (#1743)
      b0dde3f49 2025-12-27 Fuad Musayev JC: Added export venv to .profile (#1744)
      891b8bedb 2025-12-06 Fuad Musayev Local Storage Interface implemented for UI (#1581)
      568b85076 2025-10-23 Fuad Musayev Login Redesign
      903e2b860 2025-10-23 Fuad Musayev Login Redesign: Fluro SSO button
      c3136e8fa 2025-10-23 Fuad Musayev Login Redesign: image moved to META-INF
      f6a6a5887 2025-11-01 Fuad Musayev Moved openapi ui to core service
      944b2a765 2025-12-12 Fuad Musayev Removed annotation from identity client in common (#1622)
      03409c786 2025-11-02 Fuad Musayev Removed deprecated ConnectClusters logic, as it is moved to Compute
      0265faa1b 2025-11-01 Fuad Musayev Renamed module iom-health-checker to iom-monitoring
      a5a71eb3b 2025-11-01 Fuad Musayev Renamed module iom-health-checker to iom-monitoring. Part 2: Github Actions updated
      7cc2dd18a 2025-11-01 Fuad Musayev Small adjustment in swagger initializer
      07b984b33 2025-12-10 Fuad Musayev User notifications (#1617)
  infra:
      c939d634 2025-10-23 Fuad Musayev Added login img path to identity in nginx conf
      c5c974db 2025-12-06 Fuad Musayev Added new notification endpoint (#344)
      187dbc71 2025-10-23 Fuad Musayev Adjusted login img path to identity in nginx conf
      e377a9e5 2025-11-19 Fuad Musayev Bump iom-gateway (2.0.1) and spark operator (4.0.4) (#318)
      68511b25 2026-01-05 Fuad Musayev Bump jupyter to 2.0.0 image
      69b23811 2025-11-21 Fuad Musayev Bump jupyter-container image (1.2.0) (#322)
      3f63119d 2025-12-10 Fuad Musayev Dev install (#352)
      209ca08c 2025-11-19 Fuad Musayev Moving iom-gateway image to alpine-slim image (#316)
      3ebc1c51 2025-11-03 Fuad Musayev Remove services jupyter kernels, presidio, openapi, etc. from Data Plane Enterprise
      fd4f6fda 2025-11-05 Fuad Musayev Removed data-product and jupyter-kernels (old) feature flags
      9e9ddcfa 2025-12-25 Fuad Musayev Rolling back to 1.1.0 image for jupyter
      e89b8fab 2025-12-12 Fuad Musayev Typesense bump to 29 + new endpoint in gateway (#355)
      7317462a 2025-12-13 Fuad Musayev Upgraded grafana to 11.6.8 (#354)
  iom-console:
      728501545 2025-12-07 Fuad Musayev Added column type based icons to database explorer (#557)
      37456668a 2025-11-01 Fuad Musayev Fixed data-catalog statBadge having 0%
      5f98c6e5f 2025-11-08 Fuad Musayev Import now supports ipynb, dash files
      e57b12c4c 2025-12-07 Fuad Musayev Improved readability and added icon on SparkJobScheduleDetail component (#559)
      7868d56fe 2025-12-11 Fuad Musayev Notifications - some improvements (#570)
      b11e52fe8 2025-12-11 Fuad Musayev Notifications - title changes (#572)
      50511311d 2025-11-02 Fuad Musayev Plan details - style adjustments
      e5abf4b9d 2025-11-02 Fuad Musayev Small design touches to React Flow
      689617116 2025-11-08 Fuad Musayev Some icons updated

garayevs
  kotlin:
      885e269ce 2025-12-20 garayevs Add prefect deployment ids filter parameter
      17acf73a8 2025-10-27 garayevs Add Spark Jobs to RAS through different channel
      2d62b969c 2025-11-04 garayevs Allow users to add resources to bundles they are member of
      bf09c58b8 2025-11-28 garayevs BugFix / Add domain level access token management API
      d60029344 2025-12-05 garayevs Create annotation to log events
      892834d10 2025-11-28 garayevs Create common function to log actions async
      8978fa6c4 2025-10-27 garayevs Create Jupyter Container API layer for OpenAPI documentation
      5f2547052 2025-11-26 garayevs Create permission for access token management (#1505)
      9b722d2cf 2025-12-19 garayevs Create worksheet schedule
      321175cad 2025-10-29 garayevs CS 107 Add `delete` and `move` authorization to workspaces (#1279)
      12987ad63 2025-10-24 garayevs CS-125 Put sample notebooks in Jupyter Container
      5960dcebc 2025-12-19 garayevs Delete schedule
      8d2bb0a1a 2025-10-23 garayevs Display Sign in with SSO button (#1275)
      add340a37 2025-12-20 garayevs Get schedule list and details
      13c1d7e50 2025-11-25 garayevs IE-154 :: Check if identities added already exist in the domain
      8003378b9 2025-11-12 garayevs Improve search in Resources tab of Bundle page (#1379)
      5a3497b73 2025-10-22 garayevs Install Java in JC docker image (#1273)
      5247e5379 2025-12-01 garayevs Log data security ops in firehose
      0d349c088 2025-12-02 garayevs Log IAM actions in Firehose
      2733eefef 2025-12-01 garayevs Log RAS actions in Firehose
      7da95cc16 2025-12-19 garayevs Move schedule logic to iom-core from iom-sql
      cf1188057 2025-12-19 garayevs Pause and resume schedule
      bdd9fe4f3 2025-10-27 garayevs Replace authz service with with correct ones for Spark Jobs
      0e84bdc67 2025-10-22 garayevs Separate Jupyter Containers in 2 tabs: My, Shared with me
      7a6e356dc 2025-11-25 garayevs Show compute list with pagination
      da4a05ab7 2025-10-28 garayevs Test Containers in iom-core
  infra:
      -
  iom-console:
      -

Mammad Mammadli
  kotlin:
      -
  infra:
      -
  iom-console:
      a8b83eb3d 2025-12-02 Mammad Mammadli Adapt endpoints for service accounts for create, delete (#550)
      b05a96614 2025-12-03 Mammad Mammadli bring back search functionality (#552)
      b75269af4 2025-11-28 Mammad Mammadli change bundle assets with new structured endpoint (#532)
      b5f6ea5b3 2025-10-23 Mammad Mammadli chore: disable deleting for deleting alias (#462)
      f3336cab6 2025-12-11 Mammad Mammadli disable highlighting of SQL editor (#573)
      a79f0f51f 2025-10-30 Mammad Mammadli feat: add Jupyter notebook support to SQL editor
      d7fe76898 2025-11-19 Mammad Mammadli feat: add resource type filter to bundle members (#515)
      89ade8c52 2025-10-31 Mammad Mammadli feat: enhance bundle permissions with single selection and smart filtering
      0f41ee649 2025-10-23 Mammad Mammadli feat: enhance docker image selection for private registries
      680beb7db 2025-10-29 Mammad Mammadli feat: filter asset type permissions based on selected actors' existing permissions
      f504d7b8b 2025-10-22 Mammad Mammadli feat: implement API versioning with feature toggle support
      731231d38 2025-12-09 Mammad Mammadli feat: implement basic notifications page (#534)
      9fb17eb43 2025-11-28 Mammad Mammadli Fix broken Compute edit page (#519)
      222429590 2025-12-17 Mammad Mammadli fix failing test (#588)
      8e4f4bd73 2025-11-10 Mammad Mammadli fix failing tests
      3ebd97162 2025-12-02 Mammad Mammadli Fix namespace test failures and split namespace pages per version (#548)
      5c657094b 2025-11-05 Mammad Mammadli fix: invalidate correct query key for bundle resource assets
      bfb79bb00 2025-10-21 Mammad Mammadli fix: pagination not working when sorting is applied in query monitoring
      5ed8051c0 2025-11-03 Mammad Mammadli fix: resolve placeholder visibility and form reset issues in bundle permissions
      20697533c 2025-11-03 Mammad Mammadli fix: update bundle permission form tests to match new disabled behavior
      9c5ac4354 2025-12-01 Mammad Mammadli IE-156/separate admin domain access (#542)
      60842ad57 2025-11-28 Mammad Mammadli Implement ButtonGroup component (#513)
      cd3a76523 2025-10-31 Mammad Mammadli implement global uuid interface
      303593658 2025-11-27 Mammad Mammadli Implement permission management for access token (#535)
      efb2f8a63 2025-11-14 Mammad Mammadli increase maxThreads (#505)
      fa40a2cc0 2025-12-17 Mammad Mammadli Increase tests (#584)
      b14d2d9ce 2025-11-04 Mammad Mammadli install jupyter and enable
      ef0ac4218 2025-11-03 Mammad Mammadli Make some cleanups
      463884ba1 2025-11-24 Mammad Mammadli New endpoints for Secret management (#508)
      eed269224 2025-11-18 Mammad Mammadli Pe 159/bundle permission improvement (#502)
      1114dacbd 2025-12-03 Mammad Mammadli PE-199/migrate namespaces to v2 (#549)
      cf7b2ca37 2025-12-11 Mammad Mammadli PE-229/Notification settings (#569)
      5415f0fcb 2025-11-10 Mammad Mammadli Redirect to bundle details after creating
      daa7cf691 2025-10-21 Mammad Mammadli redirect to specific jupyter
      72d52f78a 2025-11-20 Mammad Mammadli refactor: remove forceUpdate pattern from BundlePermissionManager (#520)
      5e315fd73 2025-12-09 Mammad Mammadli remove caching from namespaces list (#567)
      65c9932e8 2025-11-04 Mammad Mammadli REmove flag for Jupyter
      ac91a4f82 2025-11-10 Mammad Mammadli remove redundant comments
      c55ec3e35 2025-11-16 Mammad Mammadli Removed parsing to json since it's going to be parsed inside package (#509)
      92fe9cb3f 2025-11-10 Mammad Mammadli revert changes on pr.yml
      f89becf0b 2025-11-10 Mammad Mammadli run all tests
      c571ef226 2025-10-21 Mammad Mammadli send request to v2 on compute log download
      3dc7fe547 2025-11-03 Mammad Mammadli Show loading on BundlePermissionForm
      d56d68b40 2025-11-28 Mammad Mammadli Split endpoints for access token into 2 parts domain/admin (#540)
      e1eb2450e 2025-10-29 Mammad Mammadli test: add comprehensive unit tests for BundlePermissionCreate and BundlePermissionEdit
      76431a03a 2025-10-29 Mammad Mammadli test: add comprehensive unit tests for BundlePermissionForm components
      a5e060cab 2025-11-07 Mammad Mammadli update config
      6a76060a2 2025-11-09 Mammad Mammadli Update eslint config
      03e41c68c 2025-12-13 Mammad Mammadli update html data-theme for dark/light theme (#574)
      1e1181bee 2025-11-25 Mammad Mammadli update packages (#531)
      74b3a85eb 2025-11-05 Mammad Mammadli update yarn.lock
      ab9ac062b 2025-11-06 Mammad Mammadli update yarn.lock
      fa9f53152 2025-10-21 Mammad Mammadli update yarn.lock

Nurlan Mammadov
  kotlin:
      -
  infra:
      -
  iom-console:
      86959f1dc 2025-10-22 Nurlan Mammadov feat: add My/Shared view filter to Jupyter containers list
      de7bcd0c4 2025-11-03 Nurlan Mammadov feat: implement BI dashboard feature with widget management and real-time query execution
      153601d45 2025-11-17 Nurlan Mammadov feat: set Runs tab as default active tab on job view pages (#511)
      ad033260d 2025-10-28 Nurlan Mammadov fix: add domain context support for Docker registry API endpoints
      cec909eb2 2025-11-26 Nurlan Mammadov fix: update border colors for SQL header split components (#533)
      6866f9612 2025-11-03 Nurlan Mammadov Key features: - Dashboard-level error handling: Show full-page alert for invalid dashboard JSON - Widget-level error handling: Display config errors inside widget boundary - Safe JSON parsing with validation helpers (parseDashboardContent, validateWidgetConfig) - Empty dashboard support: Create default empty dashboard when content is blank - WidgetConfigError component: Shows config errors with reset option - Maintains widget chrome (title, actions) even with config errors - Error priority: Loading → Config Error → Query Error → Empty → Success
      3e7b35d09 2025-12-17 Nurlan Mammadov Refactor dashboard-view for improved maintainability and reduced complexity (#582)
      6ec688067 2025-11-20 Nurlan Mammadov refactor: enforce legacy deployment flow for streaming jobs (#517)
      1886d4ead 2025-12-17 Nurlan Mammadov Add loading states to General Info page (#583)
      c46f9947b 2025-11-16 Nurlan Mammadov feat: add chart configuration modal for dashboard widgets (#507)
      a11124adc 2025-11-18 Nurlan Mammadov - jupyterContainers feature flag removed (#512)
      7bb577c7a 2025-12-17 Nurlan Mammadov Add segment colors customization to treemap chart (#586)
      2ab18c5bf 2025-11-17 Nurlan Mammadov Add showRegardingObjectKindFilter prop to K8sEvents component (default: true). (#510)
      3bef966c7 2025-12-15 Nurlan Mammadov Dashboard improvements (#566)
      17ab1a16f 2025-11-03 Nurlan Mammadov feat: add Big Number chart with extensive customization and chart enhancements
      39145266c 2025-11-03 Nurlan Mammadov feat: add editable text and textarea components for dashboard metadata updates
      70b068cb8 2025-11-07 Nurlan Mammadov feat: add ph id to HugeIcon components (#488)
      23e269d75 2025-11-15 Nurlan Mammadov Feat/bi improvements (#506)
      0b885f20b 2025-11-20 Nurlan Mammadov Feat/compute create new UI (#518)
      19992d90f 2025-11-24 Nurlan Mammadov Feat/jupyter container tabbed form (#521)
      e9edca2a8 2025-11-26 Nurlan Mammadov Feat/sql compute inline actions (#529)
      692b8d526 2025-12-20 Nurlan Mammadov Feat/sql editor reusable component (#590)
      209457ffb 2025-11-28 Nurlan Mammadov Fix ErrorResult text overflow for long error messages (#541)
      0aa16c34f 2025-12-15 Nurlan Mammadov Fix whitespace handling in domain user filter labels (#581)
      d30a82964 2025-11-27 Nurlan Mammadov fix: add delay to spark job retry success callbacks for better UX (#538)
      761d2e0fc 2025-11-03 Nurlan Mammadov fix: add missing react-grid-layout and react-resizable dependencies
      ae35c9f39 2025-11-03 Nurlan Mammadov fix: add missing react-grid-layout dependencies
      75ea81748 2025-11-07 Nurlan Mammadov fix: enable navigation for enqueued spark apps and show driver messages (#489)
      6ea9564d0 2025-11-11 Nurlan Mammadov fix: make Spark app names always clickable in job and streaming job lists
      e37765187 2025-11-03 Nurlan Mammadov fix: prevent persisting query results with type-safe serialization
      fad9e219f 2025-11-06 Nurlan Mammadov Fix/convert phosphor icons to hugeiocns (#487)
      1b9d7e165 2025-11-12 Nurlan Mammadov Fix/sql editor icons and chart issues (#499)
      5ad63fcab 2025-11-11 Nurlan Mammadov refactor: remove Jupyter notebook permissions from role creation

rbhokre
  kotlin:
      fbcae940a 2025-11-17 rbhokre Add additional flight server headers for flight request handling in db explorer (#1434)
      3b6fa1c28 2025-12-09 rbhokre add an internal SQL query executor service that uses Apache Arrow Flight for executing SQL queries for internal services (#1612)
      fa054cf93 2025-12-02 rbhokre Add Arrow Flight–based endpoints for Iceberg table registration to enable Spark Disconnect migration (#1562)
      cbfe861aa 2025-12-03 rbhokre Add Arrow Flight–based endpoints for snapshotting parquet tables to enable Spark Disconnect migration (#1564)
      903f25013 2025-12-11 rbhokre feat(audit): integrate iom-sql service for audit data retrieval via Arrow Flight (#1613)
      7d9e48867 2025-11-14 rbhokre Fix api paths for sql db explorer endpoints and add admin API endpoints (#1388)
      8c214ffac 2025-11-11 rbhokre Integration with Arrow Flight to power DB Explorer functionality
      206338cc3 2025-10-22 rbhokre Refactor `SparkAppServiceTest`: (#1271)
      cd6ccd6bf 2025-11-11 rbhokre Refactor Arrow Flight authentication in iom-sql to use system-generated tokens with flight creds caching, and migrate all cache implementations from Guava to Caffeine.
      551f68d5d 2025-12-04 rbhokre Refactor SqlExecutor to remove spark connect rest client dependency (#1567)
      96127dc93 2025-11-14 rbhokre Refactor: Add Admin API's for catalog listing with full domain coverage (#1389)
      874e642a8 2025-12-04 rbhokre Spark disconnect migrate table ref and snapshot from the legacy implementation to use Arrow Flight (#1572)
      6b84b823d 2025-11-18 rbhokre table partition extraction from flight response for dbExplorer (#1439)
  infra:
      562443f0 2025-11-13 rbhokre Add new sql endpoints to nginx and revert removing useSparkConnectForDbExplorer flag (#286)
      cbe597d3 2025-11-19 rbhokre Add schema path to admin API routes in nginx configuration (#319)
      660507a0 2025-12-19 rbhokre Enable listing metadata authorization using ranger in iom Spark connect cluster (#362)
      aa46096f 2025-11-17 rbhokre fix additional space in config that went un-noticed (#306)
      417f3ac4 2025-11-14 rbhokre fix: REVERT SQL service route in nginx configuration (#294)
      d9f5c433 2025-11-11 rbhokre introduce feature flag `arrowFlightForDbExplorer` (#269)
      90949014 2025-11-19 rbhokre Remove default domain configuration from Spark connect driver (#317)
      e264429c 2025-11-17 rbhokre Revert "revert iom_spark_connect mainClass to SparkConnect and remove… (#303)
      b95bf086 2025-12-09 rbhokre spark-disconnect related changes (#348)
  iom-console:
      -

rcjverhoef
  kotlin:
      2bd133a35 2025-11-12 rcjverhoef bump quarkus and gradle (#1376)
      64b0b098b 2025-11-18 rcjverhoef bump socket client dependencies (#1440)
      2ae40c34a 2025-11-19 rcjverhoef cloud-lib-storages: bump azure-identity (#1456)
      55b93591e 2025-10-30 rcjverhoef fetch the jupyter container base image from config map (#1310)
      e494d61b5 2025-11-19 rcjverhoef iom-rest-catalog: bump iceberg versions to resolve netty vulnerabilities (#1444)
      ef3867018 2025-11-05 rcjverhoef iom-rest-catalog: remove hadoop-aws dependency (#1336)
      73228a8ae 2025-11-20 rcjverhoef iom-sql: add hive-server jar + test-case to validate we can run queries (#1458)
      4de9a143b 2025-11-19 rcjverhoef iom-sql: bump hive jdbc (#1447)
      6f72bccb7 2025-11-18 rcjverhoef iom-sql: disallow user to access query results for queries they don't own (#1443)
      a8048cda8 2025-11-19 rcjverhoef iom-sql: force jetty 9.4.57.v20241219 (#1446)
      c97fc3a20 2025-11-19 rcjverhoef iom-sql: force netty 4.1.125.Final (#1445)
      e946368d6 2025-11-19 rcjverhoef iom-sql: force parquet-arrow-version (#1451)
      9ef2474ad 2025-10-31 rcjverhoef iom-sql: minor adjustments to BI-dashboard contract (#1316)
      3fe70480d 2025-11-20 rcjverhoef iom-sql: move to hide-jdbc-standalone (#1459)
      77a3c20f2 2025-11-18 rcjverhoef iom-sql: remove dashboard endpoints (#1442)
      2fafd27b2 2025-11-19 rcjverhoef iom-sql: remove duplicated dependencies (#1452)
      1cd66795c 2025-11-19 rcjverhoef iom-sql: remove spark dependency (#1455)
      1d6fa59eb 2025-10-31 rcjverhoef iom-sql: switch bi-dashboards to use map/dict instead of list of widgets (#1313)
      0bd70fcef 2025-10-22 rcjverhoef Make dashboards url consistent with worksheet url (#1268)
      93f056c0d 2025-11-05 rcjverhoef move docker base images to use jre instead of jdk (#1335)
      5d2b4d986 2025-11-17 rcjverhoef remove pinned netty version (#1435)
      e312698ae 2025-11-06 rcjverhoef Rocco/revert rename of iom health checker (#1340)
      e6c2db967 2025-10-23 rcjverhoef small refactor for workspace
      7ce404ab8 2025-11-06 rcjverhoef switch docker containers to use 21-jre-alpine (#1339)
      ca70c8a77 2025-11-17 rcjverhoef upgrade dependabot settings (#1402)
  infra:
      840a683b 2025-11-14 rcjverhoef add cpu optimized nodes for iom-console tests (#295)
      2b7d8d61 2025-11-14 rcjverhoef add dns to release environment (#291)
      0100f225 2025-11-13 rcjverhoef add istio as ingress (#290)
      e2b0061e 2025-11-04 rcjverhoef create reusable steps for scanning vulnerabilities (#265)
      3666ead5 2025-11-05 rcjverhoef create reusable steps for scanning vulnerabilities part 2 (#266)
      cae1fc0c 2025-11-12 rcjverhoef disable release env in TF cloud to save $$$ (#282)
      ffcd0348 2025-11-12 rcjverhoef disable release env in TF cloud to save $$$ (#283)
      55a226a3 2025-12-02 rcjverhoef don't put AWS CHECKSUM vars inside if idiot (#336)
      b1468bb6 2025-11-13 rcjverhoef forgot to rebase and missed the tenant (#289)
      93a1dcdc 2025-11-25 rcjverhoef iomete-github-bot setup as github app (#324)
      c1916a32 2025-11-14 rcjverhoef iomete-github-bot webhook bot installation (#298)
      d19107bb 2025-11-13 rcjverhoef patching up the external-secret-sync (#287)
      48c70de5 2025-11-10 rcjverhoef reinstall github-arc-runner-sets (#276)
      7e1aaad9 2025-11-10 rcjverhoef remove github-arc-runner-sets (#275)
      5d7db8c8 2025-11-17 rcjverhoef remove splunk reference from pentest environment (#302)
      b74f0833 2025-11-17 rcjverhoef rename env to pentest (#304)
      22f50b97 2025-11-11 rcjverhoef revert iom_monitoring to iom_health_check part 2 (I missed a spot) (#279)
      67763396 2025-11-07 rcjverhoef revert iom-monitoring back to iom-health-checker (#270)
      0bc88bdd 2025-11-13 rcjverhoef Rocco/terraform release env ingress (#288)
      6184c257 2025-10-24 rcjverhoef scan releases for vulnerabilities (phase 1) (#257)
      34c4fa40 2025-12-02 rcjverhoef set checksum checks for AWS S3 to 'when_required' for iceberg-rest-catalog via env variables (#333)
      afc8f029 2025-11-17 rcjverhoef setup penetration test environment in TF Cloud (#301)
      52ab7855 2025-11-17 rcjverhoef Setup weekly vulnerability scans (#292)
      2fb1d00f 2025-11-12 rcjverhoef spin down last parts of release env (#284)
      f3e3df5f 2025-11-14 rcjverhoef tearing down release environment - part 1 (#296)
      afb6d4b6 2025-11-14 rcjverhoef tearing down release environment - stage 2 (#297)
      4e767d92 2025-11-12 rcjverhoef Terraform cloud release environment (#281)
      7910e2dd 2025-11-13 rcjverhoef update terraform to allow syncing secrets for istio ingress from a Azure Vault (#285)
  iom-console:
      ee93b161d 2025-11-14 rcjverhoef switch github actions to use fast-runner group (#504)

rocco.verhoef
  kotlin:
      88f7d7dfa 2025-11-05 rocco.verhoef temporary rename to iom-health-checker
  infra:
      15200472 2025-10-24 rocco.verhoef add test action for publishing vulnerability reports
      5335bbeb 2025-10-31 rocco.verhoef Revert "Added job orchestrator batch size configurability (#260)"
      b33da5ea 2025-10-31 rocco.verhoef set dev to spark-3.5.5-v7
      b9e8873a 2025-10-29 rocco.verhoef update promote step to correctly tag release
  iom-console:
      -

Shahriyar Novruzov
  kotlin:
      33032ff83 2025-12-16 Shahriyar Novruzov Unified endpoint for token validation (#1652)
      941330d28 2025-12-19 Shahriyar Novruzov Expose Authorization API (#1665)
      d7efac366 2025-12-08 Shahriyar Novruzov Spark config for event-ingest service (#1580)
  infra:
      83e787cc 2025-12-08 Shahriyar Novruzov adjust securityContext (#346)
      12276abe 2025-12-04 Shahriyar Novruzov iom-event-ingest to helm (#335)
      222049f7 2025-12-05 Shahriyar Novruzov mount java truststore (#342)
      82c0d416 2025-12-09 Shahriyar Novruzov volumeClaimTemplates instead of PersistentVolumeClaim (#350)
  iom-console:
      -

Shashank Chaudhary
  kotlin:
      537cab41a 2025-10-28 Shashank Chaudhary Added batch validation for spark jobs with cumulative quota tracking (#1300)
      653643345 2025-11-11 Shashank Chaudhary Added job quota(queued)/failure reason visibility in console for prefect runs (#1357)
      631914a0c 2025-11-18 Shashank Chaudhary Exposes Job Orchestrator as domain-scoped REST API (#1437)
      53ea2c282 2025-11-12 Shashank Chaudhary Fix manual job run errors for Prefect jobs failing pre-Spark-launch (#1381)
      d4c24a916 2025-10-30 Shashank Chaudhary Moved the batch deployable API out of the domain (#1314)
      640e84724 2025-11-07 Shashank Chaudhary Sending proper failure messages from batch deployable validation API (#1331)
      1f98ef56b 2025-11-12 Shashank Chaudhary Validate context status relevance before displaying error messages (#1382)
  infra:
      98b5949f 2025-11-17 Shashank Chaudhary Added cleanup config env variables (#305)
      6032978a 2025-10-31 Shashank Chaudhary Added job orchestrator batch size configurability (#260)
      d3b95ff4 2025-11-19 Shashank Chaudhary Added jobs orchestrator route in gateway config (#315)
      247eeda9 2025-10-31 Shashank Chaudhary Added quotes to fix adding integer value to the env (#263)
      4f841bf4 2025-11-04 Shashank Chaudhary Added the default batchSize value removed in PR revert :shrug: (#264)
      b881ef62 2025-11-07 Shashank Chaudhary Dell Job Orchestrator Dashboard JSON Update (#271)
      d14a25d9 2025-11-18 Shashank Chaudhary Updated batch size and query seconds (#311)
      e0fdf7b9 2025-11-19 Shashank Chaudhary Updated dev values to use latest image version for prefect (#314)
      af0b1e1f 2025-11-21 Shashank Chaudhary Updated Job Orchestrator Metrics Exporter to 1.3.0 with security updates (#321)
      161b23ad 2025-11-18 Shashank Chaudhary Updated Prefect server, worker & post-install image versions (#312)
  iom-console:
      -

Sourabh Jajoria
  kotlin:
      24eea8ef2 2025-12-02 Sourabh Jajoria Accessing vault secrets in the domain dashboard (#1514)
      8e1c69f28 2025-11-18 Sourabh Jajoria Adding Secrets V2 service to iom-core (#1378)
      bf6fc7fbc 2025-12-11 Sourabh Jajoria Changing API contracts as per inputs from team. (#1619)
      d615d75af 2025-10-22 Sourabh Jajoria Fixing failed test for leaderelectortest (#1269)
      bdcc54052 2025-12-17 Sourabh Jajoria Fixing legacy secret resolution logic in Jupyter containers. (#1655)
      4586f91b2 2025-12-05 Sourabh Jajoria Making global scope secretsv2 compatible with legacy secrets (#1579)
      0f2fef1a6 2025-11-26 Sourabh Jajoria Namespace resource bundle (#1500)
      80e21aaae 2025-12-01 Sourabh Jajoria Pe 195/namespace listing endpoint v2 to give resource bundle link along with namespace (#1509)
      c8e395e97 2025-12-12 Sourabh Jajoria Pe 240/secret v2 new dropdown based secrets resolution (#1621)
      59d5fc567 2025-12-05 Sourabh Jajoria SecretsV2 secret resolution logic (#1565)
      5f5f5c5f4 2025-12-05 Sourabh Jajoria Test endpoint for vault configurations (#1569)
      cd0144082 2025-10-27 Sourabh Jajoria Updating validation conditions for domain id and name to match UI information being shown to user (#1277)
      c89a90ad5 2025-11-28 Sourabh Jajoria Vault configuration support to access secrets from customer vault (#1496)
  infra:
      09ef9ee6 2025-11-26 Sourabh Jajoria Adding a feature flag for secrets management rollout (#328)
      0923ee28 2025-12-02 Sourabh Jajoria Whitelist secrets end-point for admin APIs (#334)
      25bb8a55 2025-12-03 Sourabh Jajoria Whitelisting vault-configs path for iom-core (#338)
  iom-console:
      -

Tural Sadigov
  kotlin:
      cb2f1a240 2025-11-14 Tural Sadigov Data size calculation (#1390)
      10825d778 2025-11-23 Tural Sadigov Dependabot auto merge (#1454)
      e44479c92 2025-11-24 Tural Sadigov disable cronjob (#1497)
      335f5e889 2025-11-17 Tural Sadigov Revert "build(deps): bump io.quarkus:quarkus-test-common in /common (#1432)" (#1441)
      999476130 2025-11-25 Tural Sadigov simplification (#1498)
      7c65e2b68 2025-12-05 Tural Sadigov Tural/mask compute secrets (#1578)
  infra:
      6798e264 2025-12-05 Tural Sadigov $ s fixed in .values, editted values for dev (#343)
      b65d701b 2025-12-02 Tural Sadigov checkout fix (#337)
      246a8082 2025-12-03 Tural Sadigov new alerts (#341)
      1cd5c00c 2025-12-03 Tural Sadigov Operational support quota (#339)
      35d09ca0 2025-11-17 Tural Sadigov Spark history change (#309)
      1deda596 2025-11-19 Tural Sadigov Spark history change (#310)
  iom-console:
      -

Ujjawal Khare
  kotlin:
      d777f3110 2025-12-18 Ujjawal Khare 071 migration - delete column only if exists (#1668)
      38050a348 2025-11-12 Ujjawal Khare actor details resp changed (#1380)
      22c3b1d07 2025-11-27 Ujjawal Khare Compute namespace authorization access for user added (#1508)
      f902c0375 2025-11-13 Ujjawal Khare delete actor permissions to delete all assetType permissions (#1384)
      359bf70f1 2025-11-27 Ujjawal Khare Feat: Spark job authorization for namespace (#1507)
      16fbcbf55 2025-12-04 Ujjawal Khare Fix for new namespace bundle owner
      0ec80c07e 2025-11-29 Ujjawal Khare fix namespace utilization api access in namespace v2 api
      c5b92eceb 2025-11-28 Ujjawal Khare Jupyter Namespace Authorization (#1510)
      2172f6829 2025-12-03 Ujjawal Khare Namespace bundle-asset-owner to be same as bundle owner (#1568)
      92fb61e71 2025-11-29 Ujjawal Khare Namespace removal resource bundle management (#1519)
      20b718478 2025-11-28 Ujjawal Khare Namespace resource bundle creation on namespace addition (#1515)
      8b2a5319a 2025-11-14 Ujjawal Khare Pe 127/optimize resource bundle detailed page be v2 (#1386)
      bf376498e 2025-11-11 Ujjawal Khare Pe 160/feat/resource bundles permissions v2 api (#1374)
      6cb19183b 2025-12-17 Ujjawal Khare prefect_job_id to orchestration_id (#1654)
      5cfd8bde9 2025-11-27 Ujjawal Khare RAS namespace authorization core logic (#1504)
      8d85c0350 2025-11-28 Ujjawal Khare Resource Bundle archival name change (#1512)
      5f506a7d3 2025-11-17 Ujjawal Khare Resource bundles Members api total number of actors count fix (#1400)
      12013bbdb 2025-11-13 Ujjawal Khare Update permission enabled to accept extra resource types (#1383)
  infra:
      108e601e 2025-12-08 Ujjawal Khare Namespace bundle default value change for dev clusters (#347)
      473a7ddd 2025-12-05 Ujjawal Khare Namespace feature flag description
      e6f73ca4 2025-11-26 Ujjawal Khare Namespace RAS feature flag introduction (#327)
  iom-console:
      -

Vugar Dadalov
  kotlin:
      -
  infra:
      -
  iom-console:
      e149201dc 2025-12-05 Vugar Dadalov Add ArrowFlight API endpoints and update queries for conditional access (#553)
      82830959d 2025-12-05 Vugar Dadalov Add secrets management functionality with admin support (#551)
      8f92f26be 2025-12-18 Vugar Dadalov antd upgraded to v6.1.1 and fixed deprecated (#589)
      ec5e6b2f5 2025-12-15 Vugar Dadalov Enable `Manage Marketplace` permission always (#575)
      a39662db0 2025-11-24 Vugar Dadalov feat: add CatalogMetricCard and LiveDataRatioChart components; update Statistics to utilize new components and enhance data display (#523)
      18881448f 2025-10-27 Vugar Dadalov feat: add truncateCellValue utility function and corresponding tests
      6876494ef 2025-10-23 Vugar Dadalov feat: implement file download functionality with customizable filenames
      3953798e9 2025-10-24 Vugar Dadalov feat: Implement right-click open menu in SQL database and workspace views. (#458)
      7257613c9 2025-11-27 Vugar Dadalov fix: change queryClient.resetQueries to queryClient.invalidateQueries in useCatalogs function (#539)
      ed253a3e6 2025-10-24 Vugar Dadalov fix: correct 'Runs as user' title to 'Run as user' in multiple components; enhance tree data handling in FolderNodeMenu and WorksheetNodeMenu (#464)
      077473c49 2025-10-24 Vugar Dadalov fix: correct API URL in fetchTokenData function for token refresh request
      35e986e33 2025-11-12 Vugar Dadalov fix: correct link path to saved last page in AdminLayout (#500)
      3e7457e36 2025-10-27 Vugar Dadalov fix: enhance truncateCellValue function to handle boolean and number inputs in tests
      0bc8b2cba 2025-11-27 Vugar Dadalov fix: remove unused TEST route and refactor redirect logic in RootRouter (#537)
      fabd5ddbb 2025-11-19 Vugar Dadalov fix: replace refetch with forceRefresh in Column component and tests (#514)
      9031392ce 2025-11-19 Vugar Dadalov fix: update schemaCatalogsAdmin API URL for admin access (#516)
      15b162c18 2025-11-27 Vugar Dadalov fix: update titles and descriptions in CatalogMetricCard usage for clarity (#536)
      6eba7bffa 2025-11-25 Vugar Dadalov forceRefresh bug fixed in SQL DB explorer and Data security create page (#530)
      b26c8e674 2025-12-07 Vugar Dadalov Implement test connection functionality for vaults (#556)
      64faca5d4 2025-12-17 Vugar Dadalov PE-242/integrate-secrets-management-for-spark-job (#585)
      08de85fe3 2025-12-12 Vugar Dadalov Refactor Secrets and Vaults components for improved routing and layout; add Vault Integrations path and enhance styling (#560)
      fd50ece21 2025-11-12 Vugar Dadalov refactor: implement AdminLayout and MainLayout, update routing and local storage management (#498)
      198afbee6 2025-11-18 Vugar Dadalov refactor: update API URLs and remove unused compute references across SQL components (#501)
      c1d778121 2025-10-31 Vugar Dadalov refactor: update sidebar styles and structure for improved layout and consistency (#478)
      568485bb0 2025-12-05 Vugar Dadalov Remove delete button functionality from secrets and vault forms (#554)
      887423b44 2025-12-07 Vugar Dadalov UI-42/implement-secret-v2-in-password-input (#555)
      d37570c25 2025-12-07 Vugar Dadalov Update Statistics component to always display current percentage card (#558)

-->
    <NewFeatures>
    </NewFeatures>
    <BugFixes>
    </BugFixes>
    <Improvements>
    </Improvements>
</Release>

<Release version="3.14.3" date="December 2, 2025">
    <BugFixes>
        - Fixed compatibility issue stemming from latest version bump of AWS S3 jars. 
          AWS is now always doing checksums against request/response. This fails on Dell ECS as there is some compatibility issue.
    </BugFixes>
</Release>

<Release version="3.14.2" date="December 1, 2025">
    <Improvements>
        - We have patched various outstanding security vulnerabilities in iom services.
        - We switched over to Alpine Linux for our iom services as our base image to reduce memory footprint.
        - Various libraries have been upgraded to a recent or the latest version.
        - Added basic authentication that allows us to authenticate with splunk for log fetching. Now, pulling logs from splunk for executors and drivers in IOMETE UI is possible. 
    </Improvements>
</Release>

<Release version="3.14.1" date="November 5, 2025">
    <Improvements>
        - Users can now add resources to resource bundles where they are the owner or listed as an actor.
    </Improvements>
</Release>

<Release version="3.14.0" date="October 27, 2025">
  <NewFeatures>
    - **Docker Tag Alias Management**:
      - Introduced UI-based management for Docker tag aliases in the Console, allowing domain users to create, edit, and delete aliases without modifying Helm configurations.
      - Domain-level tag aliases are now stored in the database and can be updated dynamically without pod restarts, while global tag aliases continue to be managed via Helm chart configuration.
      - Unique alias validation within each domain prevents conflicts and maintains consistency across Spark resources.
    - **Ranger Audit events**:
      - Added internal HTTP sender for Ranger Audit events
  </NewFeatures>

  <Improvements>
    - **Spark Job Filtering Enhancements**:
      - Added "Run as user" column to Job Template and Streaming Job listing pages.
          <Img src="/img/getting-started/release-notes/3.14.0/spark-job-template-run-as-user.png" alt="Job Templates | run as user" />
      - Implemented filtering by "Job User" (Run as user) for both Job Template Applications and Spark applications.
          <Img src="/img/getting-started/release-notes/3.14.0/spark-applications-run-as-user.png" alt="Spark applications | run as user" />
      - Improved time-based filtering to include running jobs that started before the selected time window, ensuring active jobs remain visible regardless of when they were initiated.

    - **SQL Workspace Improvements**:
      - Added `Copy to` functionality to copy worksheets and folders from one location to another
      - Added `Copy name` and `Copy full path` options for worksheets and folders

        <div class="row">
          <div class="margin-right--md">
            <Img src="/img/getting-started/release-notes/3.14.0/sql-workspace-copy-to.png" alt="SQL editor | workspace copy to" maxWidth="360px" />
          </div>
          <Img src="/img/getting-started/release-notes/3.14.0/sql-workspace-copy-name.png" alt="SQL editor | workspace copy name" maxWidth="360px" />
        </div>

      - Currently supports opening the menu with both right-click and the three-dots button in Workspaces and Database Explorers.
        <div class="row">
          <div class="margin-right--md">
            <Img src="/img/getting-started/release-notes/3.14.0/sql-db-right-click-menu.png" alt="SQL editor | database explorer menu" maxWidth="360px" />
          </div>
          <Img src="/img/getting-started/release-notes/3.14.0/sql-worksheet-right-click-menu.png" alt="SQL editor | workspace menu" maxWidth="360px" />
        </div>


    - **Spark driver and executor logs view**:
      - Improved log download functionality by separating it into `Visible logs` and `All logs`.

        **Visible logs** downloads the logs currently shown based on applied filters. **All logs** downloads the complete log set without filters. (This may take a few minutes if the log size is large.)
        <Img src="/img/getting-started/release-notes/3.14.0/spark-logs-download-button.png" alt="Spark logs download" />

    - **Docker tag alias improvement**:
      - Suggesting `tag aliases` on docker images in private registries.
        <Img src="/img/getting-started/release-notes/3.14.0/docker-tag-alias.png" alt="Docker tag alias" maxWidth="700px" />

    - **Data-Catalog Stale Data Cleanup**:
      - Added automatic stale data cleanup logic in the Data-Catalog (Data-Explorer) service.
      - By default, all data not synced within 14 days will be automatically deleted.
      - The retention period can be configured using the environment variable STALE_DATA_RETENTION_DAYS (applies to iom-catalog-service).
      - Note: Data-Catalog Search will not be automatically cleaned — to refresh the indexed data, manually delete it using "Clean search" button and perform a full re-sync.

    - **Storage Configuration Enhancements**:
      - Added storage provider options to Storage Config form for improved selection and display.
      - Simplified StorageConfigForm and TestConnection components for better maintainability.
      - Added back button to ErrorResult component in StorageConfigCreate for improved navigation.

    - **Resource Management**:
      - Combined namespace quota components into a unified tabbed interface for better organization.

        <GridBox>
          <Img src="/img/getting-started/release-notes/3.14.0/namespace-quotas.png" alt="Namespace Quotas" />
          <Img src="/img/getting-started/release-notes/3.14.0/resource-compute-quotas.png" alt="Resource Compute Quotas" />
        </GridBox>

      - Added `Storage class name` to Volume details view for improved visibility.
         <Img src="/img/getting-started/release-notes/3.14.0/volume-details.png" alt="Volume Details" maxWidth="600px"/>
      - Improved handling of non-array data in namespace quotas by resource type.

    - **Jupyter Container Improvements**:
      - Improved Jupyter Containers deployment to respect priority class threshold
  </Improvements>

  <BugFixes>
    - Fixed an issue where test connection in create/edit catalog and create/edit storage config was not working properly.
  </BugFixes>
</Release>

<Release version="3.13.2" date="November 5, 2025">
    <Improvements>
        - Users can now add resources to resource bundles where they are the owner or listed as an actor.
    </Improvements>
</Release>


<Release version="3.13.1" date="October 28, 2025">
  <Improvements>
  - Added support for optional bundle in Spark Job creation via API call. Spark Job is added to default resource bundle if no bundle id is provided in request payload
  </Improvements>
  <BugFixes>
  - Fixed Spark Job logs permission issue
  </BugFixes>
</Release>

<Release version="3.13.0" date="October 13, 2025">
  <Improvements>
    - **Jupyter Containers**:
        - Implemented automatic sign-in when launching a new Jupyter Container instance, removing the need for manual authentication.
        - Added persistent storage support for Jupyter Container instances using **PVC** and **NFS**. Volume attachment is now **optional** — users can choose to launch temporary Jupyter Containers without any volume attached.
        - Onboarded Jupyter Containers to the [RAS framework](/docs/user-guide/iam/ras/ras.md), enabling management through resource bundles.  You can now streamline access control by granting permissions to users and groups at the resource bundle level.
    - **Spark Applications filtering optimizations in UI**:
      - Optimized SQL queries for filtering Spark applications by resource tags.
    - **Resource Bundles**:
      - Added search and sort functionality to the resource bundle listing dashboard to improve resource bundle user experience.
    - **Spark Job Metrics Link**:
      - Updated Grafana links on the Job Run page to include a **5-minute time buffer** around job duration to account for ingestion delays.
      - Added **`var-app_id`** and **`var-job_id`** query parameters for precise filtering directly from the console.
    - **External Grafana Dashboard**:
      - Added support for configuring external Grafana dashboard URLs via system configuration with given properties 
        - `external-grafana.service-availability.dashboard-url`
        - `external-grafana.alerting-rules.dashboard-url`
      - This allows monitoring links to work seamlessly even when Grafana is hosted externally.
    - **Resource Quotas Visualization enhancements**:
      - Added resource quota visualization to both the **Admin Portal → Namespaces** page and the **Domain Home Page**, showing usage for Compute Clusters, Spark Jobs, and (if enabled) Jupyter Containers at the namespace level.
      - These visualizations appear only when Priority Classes are enabled in helm chart.
      - Moved the **tooltip** to the right side and aligned **values** inside the tooltip to the right for better readability.
      <Img src="/img/user-guide/home-page/resource-quota.png" alt="Home Page" maxWidth="800px" centered />
    - **Resource Quota Enforcement**:
      - **All Resources**:
        - Introduced **volume-based threshold checks** in addition to existing quota checks for **Compute Clusters**, **Spark Jobs**, and **Jupyter Containers**.
        - Added **frontend validations** so users can instantly see if their resource requests exceed quotas before submitting.
          <Img src="/img/user-guide/spark-jobs/quota-validation-frontend.png" alt="Resource Quota Validation" maxWidth="800px" centered />
        - Added a **Resource Allocation Summary** on create/edit pages to show how much of each resource will be used versus maximum limits.
          <Img src="/img/user-guide/spark-jobs/quota-summary.png" alt="Resource Quota Summary" maxWidth="800px" centered />
        - Quotas continue to be enforced at both the **namespace** and **priority-class** levels (when configured).
      - **Spark Job**:
        - For jobs using the new **Job Orchestrator** flow, additional quota checks have been added to further improve **job queuing** when limits are reached. This ensures consistent quota enforcement across both **job creation/update** and **job scheduling**.
          - CPU (requests)
          - Memory (requests)
          - Storage (general & storage-class-specific)
          - PersistentVolumeClaims (PVCs) (general & storage-class-specific)
        - **Grafana Dashboard Update**: Job Orchestrator dashboards now display updated quota utilization insights.
    - **Resource Create/Edit Page**: Displayed the **storage class name** for **On-Demand PVC** volumes, making it easier for users to identify which storage class will be used for each volume.
      <Img src="/img/user-guide/spark-jobs/on-demand-pvc.png" alt="On Demand PVC" maxWidth="800px" centered />
    - **Spark Images for Spark Jobs**:
      - Added support for selecting configurable IOMETE Spark images when creating Spark Jobs, with available versions defined via the `docker.defaultSparkVersion` and `docker.additionalSparkVersions` fields in the Helm chart’s `values.yaml` file.  
      - Image options are shown dynamically based on the chosen application type — **Python** displays Python based images, while **JVM** displays JVM based images.
      <Img src="/img/user-guide/spark-jobs/spark-image.png" alt="Spark Image List" maxWidth="800px" centered /> 
    - **Deployment Flow Renamed**: Renamed the deployment flow from **Prefect** to **Priority-Based**.
    - **Spark Job Access Management**: Onboarded Spark Jobs to the [RAS framework](/docs/user-guide/iam/ras/ras.md), enabling management through resource bundles. You can now streamline access control by granting permissions to users and groups at the resource bundle level eliminating the need to manage role based permissions
    - **SQL Editor CSV Export permission**: CSV export functionality in the SQL Editor is now role-based. A new permission has been added to roles to control access to exporting result sets as CSV files.
    <Img src="/img/user-guide/iam/roles/sql-export.png" alt="SQL Editor CSV Export" maxWidth="800px" centered />
    - **Admins are now fully authorized users in RAS**: **Super Admin**, **Domain Manager Admins** and **Domain Owners** have full authorization within the [RAS framework](/docs/user-guide/iam/ras/ras.md).
    - **Spark/Arrowflight**: 
      - Added possibility to override the content-type for the Arrow file format when uploading data to S3 (Offload mode enabled). For overriding you can set spark configuration per compute or on a global level `spark.iomete.arrow.flight.sql.arrowFetch.storage.s3.contentTypeOverride`.
      - Onboarded Spark to new RAS Authorization. Now external clients using JDBC/ODBC or Spark Connect will have to have a `consume` rights on RAS in order to utilize Spark.
  
  </Improvements>

  <BugFixes>
    - **Spark Jobs**: 
      - **Job Validation Fix**:
        - Fixed an issue where jobs could be created or updated with type **SCHEDULED** without providing a schedule, causing broken entries in the Jobs UI.  
        - **Cause**: Missing validation allowed `SCHEDULED` jobs to be created without a schedule.  
        - **Fix**: Added validation requiring a schedule when creating or updating `SCHEDULED` jobs.
            - **Note/Important: If missing, the API now throws an error.**
        - **Migration**: Existing invalid jobs are automatically corrected by changing their type to **MANUAL**.
      - **Restart Policy Fix**:
        - Fixed an issue where Spark jobs configured with the **Restart Policy = Always** failed to restart and got stuck in the **Failing** state.
      - **Streaming Job Status Fix**: Fixed an issue where streaming job status remained outdated during startup or execution timeouts because only the Spark application status was being updated.
      - Removed validation which required connection tests to pass while creating storage configs
    - **SQL Editor**:
      - Fixed an issue where selected database was not being propagated when connecting via Arrow Flight.
      - Fixed an issue where appending a query tag to the end of the SQL statement caused a syntax error.
    - **Access Token Expiry Notifications**:
      - Fixed an issue where system-managed tokens were being incorrectly included in expiry notifications.
    - **Spark History**:
      - Fixed the issue where clicking "Spark UI" to access Spark History sometimes resulted in "Application not found" error. To enable this optimization, set the following values:
        - spark.history.provider=org.apache.spark.deploy.history.IometeFsHistoryProvider
        - spark.history.fs.update.interval=2147000000 (large number, nearly Int.MAX_VALUE)
  </BugFixes>
</Release>

<Release version="3.12.2" date="September 25, 2025">
  <BugFixes>
      - Improved NFS validation, to ensure multiple NFS storages can exists and be used for different workloads
      - Removed validation which required connection tests to pass while creating storage configs
      - **Resource Bundle list**
        - Fixed issue where the **Archive** button did not work in the dropdown menu.

    - **Resource Bundle Form**

      - Made the **Description** field optional.
      - Set the default **Owner** type to **Group**.

    - **Resource Bundle Detail – Permissions Form**

      - Set the default **Actor** type to **Group**.
      - Removed the **Permission Preview** page.

    - **Spark (ArrowFlight)**

      - Resolved an issue where queries with LIMIT over the ArrowFlight protocol still triggered a full table scan.
      - Removed an unnecessary bucket-level permission check in ArrowFetch that was causing incorrect “access denied” errors.

    - **SQL Editor** - Fixed manual scrollbar dragging issue in Database Explorer.

  </BugFixes>
</Release>

<Release version="3.12.1" date="September 23, 2025">
  <BugFixes>
  - Fixed compute cluster single-node cluster creation failure due to resource quota validation issue.
  </BugFixes>
</Release>

<Release version="3.12.0" date="September 22, 2025">
:::caution **Caution**  
Upgrade with caution. Core Authorization System has changed to RAS, in case you enable it (via helm feature flag) you will have to perform the migration Spark Job from [IOMETE Marketplace](https://github.com/iomete/iomete-marketplace-jobs/tree/main/ras-onboarding)
:::
  <NewFeatures>
  - **Spark ArrowFlight S3 Offload (ArrowFetch mode)**
      - We’re introducing ArrowFetch, a powerful new way to export large datasets.
      This feature leverages direct export from Spark executors to S3, eliminating the driver bottleneck and enabling faster, more scalable, and memory-safe exports.
      With ArrowFetch, you can accelerate exports of big and huge datasets, making it especially valuable for external clients such as BI tools, QA tools, and enterprise data pipelines.
      To enable this feature, set the configuration: `spark.iomete.arrow.flight.sql.arrowFetch=true`
      and provide the required S3 settings as shown in the documentation.
  <Img src="/img/user-guide/spark-arrow/arrowfetch.png" alt="ArrowFetch configurations" maxWidth="650px" centered /> 
  - **Resource Authorization System (RAS) - Resource Bundles**
      - We're excited to introduce **Resource Bundles**, a powerful new feature that revolutionizes how you organize and manage access to your IOMETE resources. Resource Bundles allow you to group related resources — such as compute clusters, storage configurations, and workspaces — into logical collections with centralized permission management.
      - With Resource Bundles, you can now streamline access control by granting permissions to users and groups at the resource bundle level eliminating the need to manage role based permissions. The system supports flexible ownership models, allowing resource bundles to be owned by individual users or groups, with automatic inheritance through group hierarchies. You can easily transfer assets between resource bundles, set granular permissions for different resource types, and maintain organized, secure access to your platform resources.
      - See here for detailed information: [Resource Authorization System Documentation](/docs/user-guide/iam/ras/ras.md)

   <Img src="/img/user-guide/iam/ras/bundle-list.png" alt="Resource Bundle List" maxWidth="1000px" centered />

    - **Storage Configurations**:
      - Configure external storage backends with secure authentication.
      - Onboard resources to these storages and manage access through resource bundles.
      <Img src="/img/user-guide/storage-configs/storage-config-list.png" alt="Storage Configurations" />
      See the [Storage Configs documentation](docs/user-guide/storage-configs.md) for details.
    - **Workspaces**:
      - Organize SQL worksheets into custom workspaces with folder hierarchies.
      - Assign dedicated storages to workspaces via storage configs for data isolation & compliance.
      - Control access through resource bundles, restricting view/write permissions for specific users or groups.
      <Img src="/img/user-guide/workspaces/workspace-list.png" alt="Workspaces" />
      Learn more in the [Workspaces documentation](docs/user-guide/workspaces.md).

    - **EmptyDir Volume Support**

      We've added support for **EmptyDir** as a new volume type.
      With EmptyDir it will be possible to isolate different workloads, automatic post-cleanup, defining usage
      limits while using node local disk which is not possible with Host Path volume type.
      <Img src="/img/user-guide/volumes/emptydir-create.png" alt="On Demand PVC create" maxWidth="600px" />
      Check [documentation](docs/user-guide/volumes.md#emptydir)

    - **NFS Volume Support**:

      We’ve added support for **NFS (Network File System)** as a new volume type.
      With this update, users can now mount external NFS shares directly into their workloads.
      When creating a new volume, simply select **NFS**, provide the **server address** and **exported path**, and the system will handle the rest.
      <Img src="/img/getting-started/release-notes/3.12.0/volume-nfs.png" alt="NFS Volume" />

  </NewFeatures>

  <Improvements>
    - **Access Token Expiry Notifications**: Added support for configurable notifications when access tokens are nearing expiry. Two notification levels are available: *WARNING* and *CRITICAL*. Administrators can define how many days in advance of a token’s expiry the notification should be sent to its owner(s). These settings are configurable in the *System Config* screen using the properties: `access-tokens.notifications.warning` and `access-tokens.notifications.critical`.
    - **Domain Creation Enhancements**:
      - Users no longer need to provide a *Display Name* when creating a domain.  
        - The system now automatically uses the Domain ID as the display name.  
        - Users can still update the display name if they prefer a different name.
      <Img src="/img/user-guide/domain/domain-create.png" alt="Domain Create Page" maxWidth="45rem" centered />
      - Domain IDs now support hyphens (`-`), aligning with conventions already used elsewhere in the platform.
      - **Benefit**: Makes domain creation easier and more consistent, reducing friction during setup.
    - **Spark Applications**
      - We added the namespace column to the *Spark Applications* page inline with the *Job Templates* and *Streaming Jobs* pages 
    - **Resource Quota Enforcement**:
      - Added threshold checks for *Compute Clusters*, *Spark Jobs*, and *Jupyter Containers*.  
      - Users can no longer create or update these resources if doing so would exceed:
        - Namespace-level resource quotas  
        - Or quota limits defined for the **priority class** of the resource (if configured)
      - **Benefit**: Prevents creation of resources that cannot actually run due to quota breaches, ensuring more predictable behavior.
    - **Job Orchestrator (New Spark Deployment Flow)**:  
        - **Prevent Job Starvation**:  
          - Introduced Weighted Round Robin (WRR) scheduling between high- and normal-priority jobs, configurable via `job-orchestrator.queue.high.scheduling-share-percentage` system config.
          - With this configuration, instead of scheduling only high-priority jobs until the high-priority queue is empty, the system allocates 90% of slots to high-priority jobs and 10% to normal-priority jobs by default. This ensures normal-priority jobs still progress and prevents starvation, while high-priority jobs continue to receive preference.
          - Config updates are applied automatically every minute, and admins can adjust the config at any time to match their requirements.
        - **Queued Jobs Visibility**:  
          - Queued jobs are now visible in the IOMETE console on both the Spark Applications listing page and within individual job runs page.
          - Users can also abort queued jobs when needed, providing better control over job management.
    - **JVM Memory Management**: Optimized JVM memory management for the control plane service to maximise the utilisation of allocated memory.
    - **Spark Connect RestClient**: Added liveness and readiness probes to the Spark Connect RestClient to ensure it is healthy and responsive.
    - **Spark Operator Submit Service**: Implemented metrics endpoint for tracking job submission and JVM metrics.
    - **Spark Overhead Memory Customization**: Spark overhead memory is now customizable within the pod memory limits.
  </Improvements>

  <BugFixes>
    - **Global Spark Settings**: Fixed an issue where settings marked as *secret* were incorrectly saved as masked values (`*******`) instead of preserving the original value.
    - **IOM-Catalog Service**: Fixed an OOM issue in the catalog service that occurred during export of tags-related metadata. 
      - **Cause**: Entire tags metadata was being loaded into memory leading to crashes.  
      - **Solution**: Optimized export to filter metadata at the database level and process only what’s required, preventing excessive memory usage.
    - **Spark Operator Submit Service**: Fixed a memory leak issue in the spark operator submit service that occurred when submitting large numbers of Spark jobs.
      - **Cause**: The spark operator submit service was not properly cleaning up in memory error tracking logs after job submission.
      - **Solution**: Implemented proper cleanup of error tracking logs in memory after job submission.
    - **SQL Editor Worksheets**: Fix disappeared words in the worksheet that occurred when navigating to another worksheet and back.
      - **Cause**: The S3 upload was causing truncation when UTF-8 characters required multiple bytes (e.g., accented characters, emojis).
      - **Solution**: Fixed by calculating actual UTF-8 byte length instead of character count to ensure complete file uploads.
  </BugFixes>
</Release>

<Release version="3.11.2" date="September 22, 2025">
  <BugFixes>
  - Fixed users not being able to turn off sending events to Spark History in their Spark jobs. We corrected that we always overwrote setting `spark.eventLog.enabled` to `true`   
  </BugFixes>
</Release>

<Release version="3.11.1" date="August 24, 2025">
  <NewFeatures>
    - **Hybrid Log Retrieval with Kubernetes Hot Storage**:
      - We have added **hot storage** support, allowing recent logs to be served directly from Kubernetes whenever pod logs are available, and the system automatically falls back to external storage like Splunk, Loki, or Elasticsearch if pod logs are not found.
      - This configuration is only valid when using external log sources (Splunk, Loki, or Elasticsearch). Kubernetes cannot be used as a log source together with hot storage.
      - **Helm configuration example for Splunk** (`values.yaml`):
        ```yaml
        logging:
          source: "splunk"          # splunk | loki | elasticsearch
          splunkSettings:
            endpoint: "https://splunk.example.com"
            token: "bearer-token"   # bearer token created in Splunk Settings -> Tokens
            indexName: "main"
          hotStorage:
            enabled: true
            source: "kubernetes"    # currently only kubernetes is supported
        ```
      - **Notes**:
        - Ensure Kubernetes log retention is configured to cover the time ranges you care about; once pods are gone, logs will only be available in external storage.
        - If `hotStorage.enabled: false`, all requests use the external integration if configured.
  </NewFeatures>
  <BugFixes>
    - Fixed missing YAML document separator (`---`) that caused both `spark-log-masking-regexes` and `priority-class-mappings` ConfigMaps to be invalid and not created during Helm upgrades.
    - Fixed an issue where the `useSparkConnectForDbExplorer` feature flag was not respected in the frontend, causing DB Explorer to use v2 APIs (using compute cluster for metadata retrieval) instead of the intended Spark Connect service.
  </BugFixes>
</Release>

<Release version="3.11.0" date="August 11, 2025">
  <NewFeatures>
    - **IOMETE Spark**: Spark version spark-3.5.5 is a default version set.
    - **PriorityClass Mappings**: Implemented Priority Class Mappings, which enables to configure priority classes mappings in helm charts.
    - **Log Management**: 
      - Built Executor Logs feature enabling real-time viewing of compute and Spark job executor logs in the UI. 
      - Added support for downloading logs from external logging systems including Splunk, Loki, and EFK.
    - **Tag Filtering on Spark/Streaming Job List**: You can **search** and **filter** the Spark/Streaming job list by **resource tags**.
      <Img src="/img/getting-started/release-notes/3.11.0/job-filter-by-tag.png" alt="Job Filter By Tag" />
    - **New SQL Chart Types**: You can now visualize SQL query results with **Pie Charts**, **Scatter Plots**, **Treemaps**, and **Composed Charts**.

      <Img src="/img/getting-started/release-notes/3.11.0/sql-pie-chart.png" alt="SQL Pie Chart" />
      <Img src="/img/getting-started/release-notes/3.11.0/sql-scatter-chart.png" alt="SQL Scatter Chart" />
      <Img src="/img/getting-started/release-notes/3.11.0/sql-treemap-chart.png" alt="SQL Treemap Chart" />
      <Img src="/img/getting-started/release-notes/3.11.0/sql-composed-chart.png" alt="SQL Composed Chart" />
    - **Parent-Child Relationship for Groups**:
      - On the **Group Details** page, users can now see both their **directly assigned** and **parent** groups.
      - Added two tabs:
        - **Sub groups** (Inheriting to)
        - **Parent groups** (Inherited from)
      - Same updates applied to **Domain Group Members**.
      - ***Note**: Currently, group relationships apply only to LDAP members.*
      <Img src="/img/getting-started/release-notes/3.11.0/sub-groups.png" alt="Sub groups" maxWidth="700px" centered />
      <Img src="/img/getting-started/release-notes/3.11.0/parent-groups.png" alt="Parent groups" maxWidth="700px" centered />

  </NewFeatures>

  <Improvements>
    - **Job Orchestrator**:
      - Job Priority Restrictions:
          - Only Domain Admins can upgrade jobs to HIGH priority.
          - Regular users can manage NORMAL jobs, edit HIGH, and downgrade to NORMAL.
          - Existing jobs and normal operations remain unaffected.
      - Worker Deployment Changes: Workers moved to respective data planes, reduced resource usage, and added per-namespace configurations.
      - Spark Job Quota Enhancements: Added PriorityClass quota support; system now applies the most restrictive limit across namespace and job-specific quotas for CPU, Memory, and Pods.
    - **API Improvements**: Implemented exposing the token management operations in the API / swagger.
  </Improvements>
 
  <BugFixes>
    - Fixed an issue where resources quotas in the homepage picked up the priority class quota instead of the namespace quota.
    - Fixed an issue where the USE command on a catalog failed with access_denied when the user had access to only specific databases, by adding proper catalog-level USE privilege support.
  </BugFixes>
</Release>

<Release version="3.10.2" date="August 3, 2025">
  <BugFixes>
    - Fixed an issue where the `spark.dynamicAllocation.enabled` flag was always set to false.
    - Fixed an issue where the `spark.executor.instances` was set to 1 even when dynamic allocation was disabled.
    - Fixed an issue where the user failed to query the view when they lack the permission to the underlying table, even if the user has a permission to the view. 
    - Disabled `delete table` button in database explorer within SQL Editor sidebar.
  </BugFixes>
</Release>

<Release version="3.9.3" date="July 23, 2025">
  <BugFixes>
  - Patched `antiAffinity` rules, customers can now configure soft affinity rules for Spark driver pods to help distribute them across nodes and reduce the probability of most drivers ending up on the same node. This can be enabled by setting the flag `iometeSparkDriverAntiAffinity.enabled` to true in values.yaml during installation.
  - The iom-core pod now dynamically reloads any `docker.tagAliases` defined in `values.yaml`, removing the need to restart the pod.  
  </BugFixes>
</Release>

<Release version="3.10.1" date="July 22nd, 2025">
  <BugFixes>
    - Fixed an issue where column descriptions and tags were being unintentionally overridden by the catalog-sync job.  
      - Descriptions will now be preserved if already present.  
      - Tags from the sync job will be merged with existing tags instead of replacing them.
    - Added validations of tags and label names based on the rules mentioned [here](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set).
      - It has been implemented in API level, so that integrated tools to be validated as well.
      - It has been implemented in UI level as well, so the users to be informed about valid syntax formats.
  </BugFixes>
</Release>

<Release version="3.10.0" date="July 15, 2025">
  <NewFeatures>
    - **Job Orchestrator [Beta]**: This is the beta release of our broader initiative to bring orchestration to IOMETE. To enable it, set the flag `jobOrchestrator.enabled` in `values.yaml`.
      - **Priority-based Scheduling**: Users can now prioritize the scheduling of business-critical jobs over regular-priority jobs.
        <Img src="/img/guides/spark-job/job-update-page.png" alt="Job Update Page" maxWidth="600px" centered />
      - **Resource-aware Execution**: Jobs are only submitted when there is sufficient cluster capacity, helping prevent failed or stuck jobs. 
      - **Built-in observability**: We've added rich metrics to monitor queue state, job wait times, and scheduling patterns in real time.
        <Img src="/img/guides/spark-job/job-metrics-monitoring-graphs.png" alt="Job Monitoring Graph" />
      For an in-depth overview, check out the official [press release](/docs/developer-guide/spark-job/job-orchestrator.md).

    - **Jupyter Containers [Beta]**: Jupyter Containers is a powerful new feature that brings familiar Jupyter development environments directly into your IOMETE Platform. This enhancement enables data engineers and analysts to spin up dedicated, pre-configured Jupyter environments with just a few clicks.
      Key highlights:
      - Create isolated Jupyter containers with customizable resource allocation.
      - Each container comes with JupyterLab pre-installed and ready to use. Click "Open JupyterLab" to directly access Jupyter environment from IOMETE UI.
      - Pre-installed Spark libraries for immediate access to distributed computing.
      - Direct connectivity to IOMETE Compute clusters via Spark Connect.
      - Essential developer tools pre-installed: git, aws cli, sparksql-magic, pandas, other libraries and extensions.
      - Authentication: Use your IOMETE username as the default token. Optionally, setup a password to protect sensitive files within container.

      Platform admins can enable it during installation by setting `jupyterContainers.enabled` in `values.yaml`.
      For more details please refer to Jupyter Container's user guide: [Jupyter Containers - Developer Guide](/docs/developer-guide/notebook/jupyter-containers.mdx).

    - **LDAP Group Inheritance**: Group hierarchies synced from LDAP are now taken into account when evaluating Data Security policies. Groups inherit data policies from parent groups in the same way users inherit them.
      - For example, in the diagram below, any data policies applied to the "Data Science Team" will also apply to the "ML Engineers" and "Data Analysts" groups — in addition to any policies directly assigned to those child groups.
        <Img src="/img/getting-started/release-notes/3.10.0/ldap-group-inheritance.png" alt="LDAP Group Inheritance" />
      - This behavior is enabled by default in IOMETE. It can be disabled by setting the feature flag `ldapGroupInheritance.enabled` to `false` in `values.yaml` during Helm installation.

    - **Activity Monitoring**: We are releasing the beta of our own Spark Query Plan viewer. You no longer need to access the UI to view query plans! Enable this feature via `activityMonitoringQueryPlans.enabled` in `values.yaml` during installation.
      <Img src="/img/getting-started/release-notes/3.10.0/query-monitoring-plan.png" maxWidth="700px" centered />
      - Improved visualization of shuffle metrics on the Query Monitoring Details page.
      - Domain owners can now view and cancel all queries within their domain, while regular users can only see and cancel their own queries.
        <Img src="/img/getting-started/release-notes/3.10.0/query-monitoring-domain-member-filter.png" alt="Query Monitoring filter by domain members" maxWidth="700px" />

  </NewFeatures>

  <Improvements>
    - **IOMETE Spark**: Customers can now configure soft affinity rules for Spark driver pods to help distribute them across nodes and reduce the probability of most drivers ending up on the same node. This can be enabled by setting the flag `iometeSparkDriverAntiAffinity.enabled` to `true` in `values.yaml` during installation.
    - Moved hardcoded `iom-openapi` pod resource settings into `values.yaml` in the Helm chart for easier customization.
    - The number of applications shown on the Spark History summary page is now configurable. Set this in `values.yaml` under `services.sparkHistory.settings.maxApplications`.  
      See the Spark property [`spark.history.ui.maxApplications`](https://spark.apache.org/docs/latest/monitoring.html) for more information.
    - Added a new option in the SQL Editor's Database Explorer to delete tables directly from the Iceberg REST Catalog. This is useful when a table is corrupted and Spark cannot delete it. The user must have `DROP TABLE` privileges to perform this operation.  
      <GridBox>
        <Img src="/img/getting-started/release-notes/3.10.0/delete-table-action.png" alt="Data explorer delete table" />
        <Img src="/img/getting-started/release-notes/3.10.0/delete-table-confirm.png" alt="Data explorer delete table" />
      </GridBox>
    - Added a context menu with `Close` and `Close All` options to SQL Editor worksheet tabs for quickly closing the current or all tabs.
      <Img src="/img/getting-started/release-notes/3.10.0/sql-tab-close-all.png" alt="SQL editor tab close all" maxWidth="700px" centered />
    - Tags attached to Spark jobs are now propagated to the corresponding Kubernetes pods as labels.This enables resource management or categorization based on job-specific tags.
      <Img src="/img/k8s/tag-pod-label-propagation.png" alt="Job Tag As a Pod Label" />
  </Improvements>
 
  <BugFixes>
    - Added support to configure the maximum allowed cookie size for HTTP requests. This is useful for customers encountering issues with large cookies. Set the value via `services.gateway.settings.maxCookieSize` in `values.yaml` (default: `128k`).
    - Fixed an issue with access token renewal when executing SQL queries.
    - Patched the data-plane init job to ensure the metastore starts correctly post-install when special characters are used in the PostgreSQL password.
    - Fixed a bug where updates to LDAP settings were not reflected in periodic LDAP syncs.
    - Minor fix to ensure the `iom-catalog` service consistently appears on the health check page.
    - Git Repositories in sql editor now has support for subgroups in gitlab.
    - Allow trailing semicolon in Iceberg CALL statements for better Spark SQL compatibility
  </BugFixes>
</Release>

<Release version="3.9.2" date="July 14th, 2025">
  <Improvements>
    - **Job resource accounting using tags**: Tags that are attached to the spark jobs will be propagated to the pod as labels, which could be used for resource management of jobs categorized by specific tags.
       <Img src="/img/k8s/tag-pod-label-propagation.png" alt="Job Tag As a Pod Label" />
  </Improvements>
  
  <BugFixes>
    - Move hard coded iom-openapi pod resources to values.yaml in chart.
    - Access token renewal issue while executing SQL queries is fixed.
    - Fixed bug where LDAP settings updates were not reflected in periodic LDAP sync.
  </BugFixes>
</Release>

<Release version="3.9.1" date="July 4th, 2025">
  <BugFixes>
    - Fixed an issue where queries run from the SQL Editor were missing automatic `LIMIT` clauses. This was resolved by updating `defaultSparkVersion` in the default HELM chart (`v17`), as older Spark image versions did not enforce limits correctly.
    - Removed unintended debug logging from the `iom-socket` pod to reduce log noise.
  </BugFixes>
</Release>

<Release version="3.9.0" date="June 25, 2025">
  <NewFeatures>
    - **Sensitive data improvements on UI**: Users can now mark variables in the global spark settings as 'sensitive', which shows them redacted on the UI going forward
      <Img src="/img/getting-started/release-notes/3.9.0/spark-settings-masking.png" alt="Sensitive Spark Settings" />
    - On installation, admins can specify `docker.sparkLogMaskingRegexes` in the `values.yaml` which will help mask sensitive data shown on the compute logs.
      This should be specified as named key-value pairs, in the example below we mask passwords, vault tokens and ports:
      ```yaml
      docker:
        sparkLogMaskingRegexes:
          password_mask: "(?i)(password\\s*=\\s*)[^&\\s]+"
          vault_token_mask: "(?i)(vault\\\\s*token\\\\s*[:=]\\\\s*)(s\\.[a-zA-Z0-9]{20,})"
          port_mask: "(?i)(on\s+port\s+)(\d{2,5})"
      ```
      <Img src="/img/getting-started/release-notes/3.9.0/compute-log-masking.png" alt="Compute log masking" />
  </NewFeatures>

  <Improvements>
    - **UI Improvements**: The SQL editor in the IOMETE console now supports multiple tabs. Each tab can be configured with a different compute/catalog/database combination.
      <Img src="/img/getting-started/release-notes/3.9.0/sql-editor-tabs.png" alt="SQL Editor tabs" />
  </Improvements>

  <BugFixes>
    - Fixed a bug in the IOMETE Console that prevented Jupyter kernel configurations from displaying.
    - Patched the logic behind the "Cancel" action in the SQL Editor to prevent it from hanging.
    - The `iom-core` pod now dynamically reloads any `docker.tagAliases` defined in `values.yaml`, removing the need to restart the pod.
    - Fixed issues that could prevent scheduled Spark applications from sending failure notifications.
  </BugFixes>
</Release>

<Release version="3.8.2" date="June 24, 2025">
  <BugFixes>
    - Minor bug fix on the IOMETE console that prevented Jupyter kernel configuration from showing
  </BugFixes>
</Release>

<Release version="3.7.3" date="June 24, 2025">
  <BugFixes>
    - Patched the logic behind the "Cancel" action in the SQL Editor to prevent it from hanging.
    - The `iom-core` pod now dynamically reloads any `docker.tagAliases` defined in `values.yaml`, removing the need to restart the pod.
    - Fixed issues that could prevent scheduled Spark applications from sending failure.
  </BugFixes>  
</Release>

<Release version="3.8.1" date="June 9, 2025">
  <NewFeatures>
    - **Notifications**: We added the ability for users to select the type of security to use when connecting to their SMTP
      <Img src="/img/getting-started/release-notes/3.8.1/smtp-configuration.png" alt="Configure SMTP" />
  </NewFeatures>

  <BugFixes>
    - Fixed a bug that users were not able to use the "restart" button for Compute clusters
    - We added pagination to tables in the data explorer and data catalog
  </BugFixes>
</Release>

<Release version="3.8.0" date="June 9, 2025">
  <NewFeatures>
    - **IOMETE Spark**: IOMETE Spark version `3.5.5-v1` is now available for testing! We recommend configuring it in the `docker.additionalSparkVersions` section of `values.yaml` during installation. This enables users to select this version as a custom image when setting up a lakehouse. You can also use it as the base image for your Spark jobs.
    - We released a patch for IOMETE Spark `3.5.3-v14` that fixes an issue preventing it from starting correctly when feature flags for Activity Monitoring were not enabled.
  </NewFeatures>

  <BugFixes>
    - Fixed a bug introduced in version `3.7.0` that prevented IOMETE from being installed from scratch if `docker.tagAliases` was not explicitly set in `values.yaml`.
    - When users are not allowed to view certain columns in a table, the error message now correctly lists the columns they *do* have access to, instead of the generic "access denied" message previously shown in the SQL Editor.
    - Improved the IOMETE REST Catalog to better handle high load and avoid out-of-memory errors.
    - Added pagination to the LDAP sync job to prevent oversized requests and ensure all users and groups can be synchronized to IOMETE in manageable chunks.
    - Made a small update to worksheet duplication to avoid naming conflicts when a duplicate already exists.
    - Proper support has been added for `-` and `.` characters in secret names.
    - Restored the `Runs as user` field in the Spark Applications section to indicate the privileges under which a job was executed.
  </BugFixes>
</Release>

<Release version="3.7.0" date="May 26, 2025">
  <NewFeatures>
    - **Activity Monitoring**: 
      - Users can now only view their own queries within a domain, enhancing data privacy and security.  
      - A new **Shuffle Metrics** section has been added to the Query Monitoring Details page, providing deeper insights into query performance.  
        <Img src="/img/getting-started/release-notes/3.7.0/shuffle_metrics.png" alt="Shuffle Metrics" />
      - We've also introduced **Total Memory Spilled** to the Performance Metrics section, helping users better diagnose memory-intensive queries.
    
    - **IOMETE Spark**: 
      - Administrators can now define **Docker image tag aliases** using the `docker.tagAliases` field in the `values.yaml` 
        file of the Helm chart used during installation. These aliases simplify image version management for Spark jobs configured 
        in the IOMETE console—allowing teams to reference a friendly name (like `stable` or `experimental`) instead of specific tags. 
        A dedicated UI for managing these aliases is planned for a future release.  
        <Img src="/img/getting-started/release-notes/3.7.0/spark_job_labels.png" alt="Spark Job Docker image tag aliases" />
      - Users can now select specific **IOMETE Spark Images** when running jobs on compute clusters. 
        The list of selectable images is configurable via the `docker.additionalSparkVersions` field in the same `values.yaml` file.  
        <Img src="/img/getting-started/release-notes/3.7.0/compute_cluster_custom_docker_image.png" alt="Compute cluster custom Docker image" />
      - During installation, administrators can configure **Docker image tag aliases** in the `docker.tagAliases` section of 
        the `values.yaml` file. These aliases can be referenced when setting up Spark jobs in the IOMETE console. For example, 
        aliases like `stable` and `experimental` can point to specific versions:
        ```yaml
        docker:
          tagAliases:
            stable: 4.2.0
            experimental: latest
        ```
        We intend to move the configuration of these aliases from the Helm chart to the IOMETE console in a future release.
      - In addition to tag aliases, administrators can control which **IOMETE Spark images** are available for compute clusters. 
        The `docker.defaultSparkVersion` field defines the default image used at startup, while `docker.additionalSparkVersions` 
        allows users to choose from a list of alternative versions. This enables testing of new Spark versions or fallback to 
        older ones if issues arise. For example:
        ```yaml
        docker:
          defaultSparkVersion: 3.5.3-v12
          additionalSparkVersions: [3.5.3-v11, 3.5.3-v13, 3.5.5-v1]
        ```
  </NewFeatures>

  <Improvements>
    - Spark jobs now explicitly set the `SPARK_USER` environment variable on their Kubernetes pods to ensure jobs run under 
      the intended user to avoid Spark falling back on the OS default under specific circumstances.
    - We've improved the **retry logic** for Spark Connect authentication to reduce failures caused by temporary issues.
    - **UI Improvements**: We moved job notifications to a separate tab in the **Job Details** page
      <Img src="/img/getting-started/release-notes/3.7.0/job_notifications_tab.png" alt="Job Notifications Tab" />
  </Improvements>

  <BugFixes>
    - In the **Query Monitoring** section, users within a domain can now only view their own queries for security reasons. 
      Administrators retain the ability to view all queries across users via the **Query Monitoring** page in the Admin Portal.
    - When **Registering an Iceberg Table** via the SQL Editor, we now select the metadata file with the **latest timestamp**, 
      rather than the one with the highest lexicographical name. This ensures that the most recent schema and snapshot information is used, 
      addressing issues where compactions could cause the lexicographical order to be out of sync with the actual modification time.
    - Fixed an issue where adding or removing notifications from a job would cause the schedules of scheduled jobs to be unintentionally reset.
  </BugFixes>

</Release>

<Release version="3.6.0" date="May 12, 2025">
  <NewFeatures>
    - **Activity Monitoring**: Spark job metrics can now be automatically archived to the IOMETE system table `activity_monitoring_spark_jobs` in Iceberg when feature flag `sparkJobArchival` is enabled.
    - **Spark Job Archival**: Added new feature flags to archive spark job statistics. If set, spark job statistics will be periodically archived to IOMETE system table `activity_monitoring_spark_jobs` in Iceberg
  </NewFeatures>

  <Improvements>
    - **UI Improvements**: 
      - Removed the option to set the number of executors when running in single-node mode, as it is not applicable in driver-only configurations
      - Fix bug that can prevent worksheet creation in SQL editor
    - IOMETE Spark now treats all catalogs used in queries as case-insensitive. This behavior can be disabled by setting the Spark configuration `spark.iomete.lowercaseCatalogNames.enabled` to false at the cluster or global level.
  </Improvements>

  <BugFixes>
    - Patch to automatically detect whether SSL/TLS should be used based on the SMTP port
    - Fixed issue where some pods did not initiate leader election after losing leadership, causing IOMETE internal maintenance jobs to stop running
    - Fixed issue where Spark status events were intermittently not sent to the frontend due to leader election instability
    - Fixed issue where the iom-identity pod intermittently returned incorrect permissions for tag-mask policies
    - Fixed permission enforcement issue in Spark Connect where queries using `spark.sql(...).explain(...)` did not correctly validate the permissions of the user issuing the request. This did not affect queries of the form `spark.sql("EXPLAIN ...")`
    - Restored logging functionality for pod iom-socket
  </BugFixes>
</Release>

<Release version="3.4.2" date="May 11, 2025">
  <BugFixes>
    - Fixed iom-identity pod intermittently returning incorrect permissions on tag-mask policies
    - Restored logging functionality for pod iom-socket
  </BugFixes>
</Release>

<Release version="3.5.1" date="Apr 30, 2025">
  <BugFixes>
    - Scheduled Data Compaction jobs now support namespaces other than the default
  </BugFixes>
</Release>

<Release version="3.5.0" date="Apr 29, 2025">
  <NewFeatures>
    - **Activity Monitoring**: Administrators can now cancel running queries directly from the IOMETE console
      <Img src="/img/getting-started/release-notes/3.5.0/activity_monitoring_cancel_query.png" alt="Cancelling Queries" />
    - **Notifications**: 
      - Administrators can now add an SMTP server integration on the IOMETE console to allow IOMETE to send e-mail notifications
        <Img src="/img/getting-started/release-notes/3.5.0/smtp_integration.png" alt="SMTP Integration" />
      - Users can add e-mail addresses to the configuration of a Spark job and select on which job events they wish to trigger an e-mail
        <Img src="/img/getting-started/release-notes/3.5.0/job_notifications.png" alt="Job Notifications`" />
    - **Custom masking expressions**: Next to our predefined masking rules, users can now configure custom masking expressions. In addition, we also support configuring under which conditions this custom masking expression should be applied.
      <Img src="/img/getting-started/release-notes/3.5.0/custom_masking_expression.png" alt="Custom Masking" />
    - **Kubernetes workload isolations**: 
      - Kubernetes administrators can configure dataplantolerations during IOMETE installation, allowing Spark workloads to be assigned to specific nodes.
      - Priority Classes can also be configured during installation.
  </NewFeatures>

  <Improvements>
    - **API Improvements**: 
      - Data security APIs verifies validity date windows are in correct format
      - Catalog creation endpoint enforces that catalog names have lowercase alphanumeric characters an underscores only to match UI validation
      - Catalog lookup and deletion APIs are now case-insensitive
    - **Technical Details**: 
      - Added new feature flags:
        - `priorityClasses`: enabling administrators to limit node allocation for workloads like compute, spark-job, and notebook, and manage resources more effectively across namespaces.
        - `iometeSparkLivenessProbe`: adds a liveness probe as part of the default spark template to monitor if Compute Clusters and jobs are healthy and not in a zombie state. Requires all jobs and compute clusters to run `3.5.3-v10` or newer.
      - When launching a compute cluster with AutoScale enabled, the system will now start with a single executor. Additional executors will automatically scale up based on demand, up to the defined maximum limit.
  </Improvements>

  <BugFixes>
    - Fixed Catalog sync Job breaking on Iceberg nested namespaces
    - IOMETE Iceberg REST Catalog returning HTTP 500 instead of HTTP 503 if connection pool is saturated, preventing Iceberg clients from doing retries
  </BugFixes>
</Release>

<Release version="3.4.0" date="Apr 9, 2025">
  <NewFeatures>
    - **Query Monitoring**: Added new query monitoring feature where users can view all running queries and their resource utilization. Active running queries are prioritized at the top for better visibility, with the rest sorted by time. Available in both Admin Panel and Domain page.
      <Img src="/img/getting-started/release-notes/3.4.0/query-monitoring.png" alt="Query Monitoring" />
  </NewFeatures>

  <Improvements>
    - **API Improvements**: 
      - Upgraded IOMETE API Reference tool to support V3 OpenAPI Specifications
      - Data Catalog v2 APIs implemented with extended fields:
        - New APIs for retrieving catalogs with metrics: `totalSchemaCount`, `totalTableCount`, `totalSizeInBytes`, `totalFiles`
        - New APIs to list databases with metrics: `totalTableCount`, `totalViewCount`, `totalSizeInBytes`, `totalFiles`, `failedTableCount`
        - New APIs for getting table details and metadata, making it easier to retrieve tables by name instead of ID
          <Img src="/img/getting-started/release-notes/3.4.0/data-catalog-v2.png" alt="Data Catalog new APIs" />
      - Added new APIs under IAM Service for checking if user or group exists and retrieving group members
        <Img src="/img/getting-started/release-notes/3.4.0/user-group-apis.png" alt="New user/group APIs" />
    - **UI Improvements**: 
      - Improved input formats on UI and API, now supporting spaces, uppercase characters, and increased length limits
        - Special validation rules remain in place for:
          - Spark catalogs (underscores only)
          - Lakehouses (hyphens, max 53 length)
          - Usernames
      - Standardized UI titles for create actions across all pages
      - Added warning on Data Security page to clarify access permissions when using predefined `{USER}` or `public` group
        <Img src="/img/getting-started/release-notes/3.4.0/security-warning.png" alt="Security Warning" />
    - **Technical Details**: 
      - Spark now launches with new listeners for monitoring and collecting metrics for running queries (requires restart)
      - SQL Limit enforcer moved to Spark with fallback to previously used `iom-spark-connect` service, removing a potential bottleneck
      - Removed default `autoBroadcastJoinThreshold` config (Spark default is 10mb)
      - Moved spark-config configmap generation process from Helm to init-job for easier deployment process
      - Added new metric to underlying database to track users' last login time
      - Added new feature flags:
        - `caseInsensitiveIcebergIdentifiers`: Makes all table and database names case insensitive in Iceberg REST Catalog
        - `icebergRestCatalogStrictMode`: Enforces users to create database before creating tables
  </Improvements>

  <BugFixes>
    - Fixed security issue where expiration on policies was not working
    - Restored Manage Catalog permission
    - Fixed issue when creating multi-level database where the separator was replaced by non-UTF(01xf) character, causing problems on storage layer
    - Fixed issue with pagination on Gitlab Repositories
    - Fixed issue where job Resume was triggering jobs even if scheduling time passed
    - Fixed issue with Helm where curly braces on `adminCredentials: {}` caused deployment failure
    - Fixed access issue to systems underlying `default_cache_iceberg` virtual catalog
    - Multiple additional bug fixes and improvements across the platform
  </BugFixes>

  <Deprecations>
    - Data Catalog v1 APIs and Connect Cluster Resource APIs are now deprecated and planned for removal in the next release
  </Deprecations>
</Release>

<Release version="3.2.0" date="Mar 10, 2025">
  <NewFeatures>
    - **Branding**: 
      - Color schemes adjusted to match our new Branding Identity
      - New Login Page with brand colors and our New Logo
        <Img src="/img/getting-started/release-notes/3.2.0/login-page.png" alt="Login Page" />
  </NewFeatures>

  <Improvements>
    - SQL Editor now has "View Logs" functionality to quickly access Compute logs without quitting the page and navigating to Compute / details / logs.
      <Img src="/img/getting-started/release-notes/3.2.0/view-logs.png" alt="View Logs" />
    - Logs Panel is now redesigned, highlighting log levels and keywords like WARN, ERROR, etc. for visual prominence. Made buttons "Scroll to Bottom" and "Copy" more accessible and user-friendly.
      <Img src="/img/getting-started/release-notes/3.2.0/logs.png" alt="Logs" />
    - Added special feature flag for controlling the export/download of SQL Query results into CSV. This enables Enterprise companies to implement enhanced security measures in preventing data breaches within their organizations.
    - Added FeatureFlags into our Deployment Helm Values. Now features like Jupyter Notebooks, ArrowFlight, Data Products (Experimental), and Monitoring can be disabled individually.
      <Img src="/img/getting-started/release-notes/3.2.0/feature-flags.png" alt="Feature Flags" />
    - Removed the custom right-click context menu from the SQL Editor section and restored the standard browser context menu.
    - Hiding non-relevant information from Data Catalog for non-Iceberg tables. Statistics, Partitions, Snapshots, etc. are now only available for Managed Iceberg Tables.
      <Img src="/img/getting-started/release-notes/3.2.0/data-catalog.png" alt="Data Catalog" />
    - Added Breadcrumbs and removed "Back" icons, for improving the navigation experience.
      <Img src="/img/getting-started/release-notes/3.2.0/breadcrumb.png" alt="Breadcrumb" />
    - Improved experience with Git integrations. Users can now add git integration from a single modal. Removed the project ID field for streamlined setup.
      <Img src="/img/getting-started/release-notes/3.2.0/git.png" alt="Git" />
    - Added "Reset Connection" to SQL Editor Menu. During Connection or network problems users can reset their existing connections and reconnect to Compute instance.
      <Img src="/img/getting-started/release-notes/3.2.0/reset-conn.png" alt="Reset Conn" />
    - Added Rename / Duplicate functionalities to SQL Worksheets
      <Img src="/img/getting-started/release-notes/3.2.0/rename.png" alt="Rename" />
    - Significant amount of vulnerabilities remediated across our systems for enhanced security.
    - Upgraded Spark Version to 3.5.4 (prev 3.5.3).
    - Upgraded Apache Iceberg version from 1.6.1 to 1.7.1 in our Spark images.
    - IOMETE is now switching to Azure Container Registry `iomete.azurecr.io/iomete` to enable image immutability and avoid limitations of docker hub.
    - Set default `spark.sql.thriftServer.incrementalCollect=true` Spark config. Can be overridden from Global Spark Settings per domain.
  </Improvements>

  <BugFixes>
    - Fixed hard-coded Kubernetes's Cluster DNS (cluster.local) in some internal network calls
    - Ticket CS-194 - resolved - ServiceAccount page was throwing an internal error when end-users within the same group attempted to access its tokens.
    - CS-166, CS-178 - To address cases where artifacts added using --jars or --packages are not being loaded in the executor, we introduced the property `spark.executor.iomete.loadInitialUserArtifactsForEachSession`. Enabling this property for a compute cluster ensures that each session connecting to Spark will load these artifacts. Please note, this property is currently experimental.
    - Auto-Complete issue fixed in Data Security Policy management page.
  </BugFixes>
</Release>

<Release version="3.1.3" date="Feb 11, 2025">
  <Improvements>
    - Implemented Granular Admin Roles. Admins can now assign specific roles to users for more precise control over platform management.
    - Deleting files from SQL Workspace now does soft delete, allowing users to recover files if needed.
  </Improvements>

  <BugFixes>
    - Fixed migration issue with SQL Workspace.
    - Added configuration property to NGINX Gateway, solving timeout issue with SQL Alchemy library when executing long-running queries.
  </BugFixes>
</Release>

<Release version="3.1.2" date="Feb 07, 2025">
  <BugFixes>
    - Fixed an issue where users could not view access tokens for Service Accounts within the same LDAP group.
  </BugFixes>
</Release>

<Release version="3.0.2" date="Feb 03, 2025">
  <NewFeatures>
    - **Domain-Centric Platform**: All resources, including Compute, Spark Jobs, Data Catalog, and SQL Workspace, are now organized by domains. Each domain can manage its own resources, members, and user roles independently.
    - **New Admin Portal**: A brand-new Admin Portal has been introduced to centralize management, including:
      - Domains and their resources  
      - LDAP and SSO settings  
      - User groups and role management  
      - Compute configurations (node types, volumes, Docker registries)  
      - Spark catalogs and data security policies  
      - Audit and monitoring tools
    - **Unified Compute Clusters**: Lakehouse and Spark Connect have been merged into a single Compute Cluster for improved efficiency. 
      <Img src="/img/getting-started/release-notes/3.1.2/compute.png" alt="Compute" /> 
    - **Arrow Flight JDBC/ODBC Support**: 
      - Added support for Arrow Flight JDBC/ODBC connections for faster and more efficient data transfer.  
      - Introduced a custom IOMETE ODBC Driver over Arrow Flight protocol, enabling seamless integration with Power BI.  
      - The IOMETE ODBC Driver now supports multi-catalog access, allowing users to view and interact with multiple Spark catalogs through a single connection. Previously, each connection was limited to a single catalog.  
        <Img src="/img/getting-started/release-notes/3.1.2/arrow.png" alt="Arrow Flight" />
    - **GitLab Integration**: Domain owners can now seamlessly integrate and manage GitLab repositories within their domains.
      - Adding repositories for collaborative development within the domain.  
      - Viewing repository content and switching branches directly from the platform.  
      - Commit and push functionality is planned for future releases.
    - **Experimental Launch: Data Products**: The Data Products section has been introduced as an experimental feature, providing a structured way to package, manage, and share curated datasets across teams. This feature enables:
      - Domain-driven data product creation, ensuring governance and ownership.
      - Enhanced discoverability, allowing users to find and reuse high-quality data assets.
      
      This marks the first step towards self-service data sharing, with more enhancements planned in future releases.
    - **New Monitoring System**: 
      - A new Monitoring Chart has been introduced, powered by IOMETE-supported Prometheus/Grafana integration.  
      - Pre-configured Grafana Dashboards for built-in monitoring and alerting.
  </NewFeatures>

  <Improvements>
    - **SQL Workspace Redesign**: The SQL Editor has been redesigned for improved usability and organization:
      - Vertical tabs for seamless navigation between:
        - Worksheets
        - Database Explorer
        - Query History
      - Sub-folder support in SQL Workspace for better file organization.  
      - Shared Folders and Git Repositories integration, enabling enhanced collaboration and version control.  
        <Img src="/img/getting-started/release-notes/3.1.2/sql.png" alt="SQL Workspace"/>
    - **Data Catalog Improvements**: The Data Catalog details page has been redesigned, now providing more comprehensive insights.  
      <Img src="/img/getting-started/release-notes/3.1.2/data-catalog.png" alt="Data Catalog"/>
    - **Centralized Security & Catalog Management**: Data Security and Spark Catalog Management are now fully centralized in the Admin Portal, streamlining governance and access control.
    - **Service Account Improvements**: 
      - Restricted login access, preventing unauthorized usage.  
      - Granular token visibility, ensuring that Service Account tokens can only be accessed and managed by members within the same group who hold appropriate roles.
  </Improvements>
</Release>

<Release version="2.2.0" date="November 29, 2024">
  <NewFeatures>
    - **File and Artifact Upload in Spark Jobs**: You can now directly upload files and artifacts to Spark Jobs within the IOMETE Console.
    - **Single-Node Spark Instance**: Introduced a Single-Node Spark instance ideal for development and running small-scale jobs, offering a resource-efficient option.  
      <Img src="/img/getting-started/release-notes/single-node.png" alt="Single Node"/>
    - **Streaming Jobs Management**: Added a dedicated page for managing Streaming Jobs, providing better oversight and control over streaming operations.
    - **Health Monitoring**: Introduced a Health page to overview the state of system components, enhancing system monitoring capabilities.  
      <Img src="/img/getting-started/release-notes/health-page.png" alt="Health Page"/>
    - **Service Accounts Support**: Introduced support for service accounts. Users can mark accounts as service accounts and create tokens for them, which can be used in Spark Jobs and other integrations.
  </NewFeatures>

  <Improvements>
    - **Major Spark Operator Upgrade**: Upgraded the Spark Operator to version 2.0.2, enabling control over multiple data-plane namespaces. The Spark Operator and webhook can now be deployed exclusively to the controller namespace for improved management.
    - **Automatic Catalog Updates**: Any changes to Spark Catalogs are now fetched automatically within 10 seconds, eliminating the need to restart the lakehouse and Spark resources.
    - **Spark Catalog Documentation**: Added a description field to Spark Catalogs for better documentation.
    - **ClickHouse Catalog Support**: Included necessary libraries to support the ClickHouse Catalog, expanding data source compatibility.
    - **Enhanced Data Security**: Implemented more granular data security controls with separated database permissions.
    - **SSO Improvements**: Relaxed mandatory validations for the SSO protocol to enhance compatibility and user experience.
    - **User Management**: Admins can now change or reset users password directly within the platform.
    - **Log Management**: Cleaned up logs by removing unnecessary messages, improving log readability.
  </Improvements>
</Release>

<Release version="2.1.0" date="October 31, 2024">
  <NewFeatures>
    - **Job Marketplace**: Introduced a new Job Marketplace in the IOMETE Console, empowering users to share and explore Spark job templates. Admins can manage, curate, and publish templates directly to the marketplace for streamlined collaboration.
    - **LOG_LEVEL Environment Variable**: Introduced the LOG_LEVEL environment variable, allowing users to independently set log levels for both Spark Jobs and Lakehouses.
    - **SCIM API**: Implemented the System for Cross-domain Identity Management (SCIM) API, facilitating simplified user provisioning and management.
    - **Configurable SQL Query Limits**: Added a configurable Limit property (default value: 100) to the SQL Editor, giving users control over query results.  
      <Img src="/img/getting-started/release-notes/query-limit.png" alt="SQL Limit"/>
  </NewFeatures>

  <Improvements>
    - **Spark History Server Performance**: Improved performance of the Spark History Server, optimizing responsiveness and handling of large workloads.
    - **FAIR Scheduler Configuration**: Added a new global Spark configuration, spark.sql.thriftserver.scheduler.pool, to resolve issues related to the FAIR Scheduler.
    - **Access Token Management Enhancements**: 
      - New System Config for Access Token expiration policy `access-token.lifetime` to set global expiration limits.
      - Users can now set custom expiration times for Access Tokens directly in the UI Console.
      - Added `lastUsed` field for Access Tokens to enhance tracking and security.
    - **Spark Policy Optimization**: Substantial optimizations to the Spark policy download process, ensuring smooth performance in large-scale deployments.
    - **Data Compaction Enhancements**: 
      - Updated the Data-Compaction job to support catalog, database, and table filters, giving users greater control over data organization.
      - Updated Data-Compaction job to support catalog, database, table include/exclude filters.
    - **Query Scheduler Logging**: The Query Scheduler job now logs SQL query results, enabling easier debugging and tracking of job outcomes.
    - **Data Security for Views**: Added support for VIEWs, enhancing data access control options.
  </Improvements>

  <BugFixes>
    - Resolved an issue where the Spark UI link was unresponsive from the SQL Editor page.
    - **Data Security**: Fixed INSERT and DELETE permissions (also covering TRUNCATE operations).
  </BugFixes>
</Release>

<Release version="2.0.1" date="October 14, 2024">
  <Improvements>
    - **Database Driver Support**: Added out-of-the-box support for Oracle and Microsoft SQL Server JDBC drivers.
    - **User Impersonation**: Introduced the "Run as User" property in Spark job configuration, allowing user impersonation for special accounts (e.g., service accounts) when running Spark jobs.
  </Improvements>

  <BugFixes>
    - Resolved an issue with LDAP sync that caused User, Group, and Role Mappings to be removed after synchronization.
    - Fixed an issue in Jupyter Notebook where database queries returned no results.
    - Resolved a failure when querying Iceberg metadata tables due to row-level filtering policies.
    - Fixed LDAP login issue that occurred with case-sensitive usernames.
  </BugFixes>
</Release>

<Release version="2.0.0" date="October 07, 2024">
    :::info
    This release introduces major architectural, functional, and user experience improvements to IOMETE, including significant changes to user and security management, data access and governance, and catalog performance.
    :::
    :::warning Major Release
    This is a major release with significant changes to the architecture and user experience. IOMETE 2.0.0 is not backward compatible with IOMETE 1.22.0 or earlier versions. We recommend reviewing the upgrade documentation carefully before proceeding.
    :::

  <BreakingChanges>
    - **Keycloak Removal**: We have removed `Keycloak` and transitioned all its functionality—`user`, `group`, and `role` management, as well as `LDAP` and `SAML/OIDC Connect` support—directly into IOMETE. This shift centralizes control within IOMETE, enhancing security and simplifying management for large-scale deployments.
      
      Key Improvements:
      - Optimized LDAP support for large-scale user integrations, addressing performance issues experienced with Keycloak.
      - Support for both user-based and group-based synchronization.
      - Service accounts support (users without standard identifiers such as email or first name).

      This change improves performance and simplifies maintenance by reducing external dependencies.

    - **Ranger Removal**: We have removed Apache Ranger, fully integrating its data access policy management functionality within IOMETE. This offers better control, performance, and security while reducing the complexity of managing separate systems.

      Key Benefits:
      - Improved performance and streamlined management of data access policies.
      - Reduced security concerns by eliminating the dependency on open-source Ranger.

  </BreakingChanges>

  <NewFeatures>
    - **Tag-Based Access Control & Masking**: We are introducing Tag-Based Access Control and Tag-Based Masking, simplifying data governance within IOMETE by allowing policies to be triggered automatically based on tags.

      Key Features:
      - Dynamic Policy Activation: Automatically apply access or masking policies based on tags assigned to tables or columns.
      - Tag-Based Access Control: Define user or group access based on tags.
      - Tag-Based Masking: Dynamically apply data masking policies for sensitive data based on tags.

      This feature streamlines governance processes and provides a more efficient solution for large datasets.

    - **Integrated Iceberg REST Catalog**: IOMETE now includes a fully integrated Iceberg REST Catalog, replacing the previous Iceberg JDBC catalog. This upgrade delivers enhanced performance, scalability, and security for Spark jobs, Lakehouse clusters, and SparkConnect clusters.

      Key Benefits:
      - Centralized Caching: Shared metadata cache across all Spark jobs and clusters, improving query resolution times and overall system performance.
      - Reduced Database Load: Pooled connections significantly reduce strain on the Postgres metadata database.
      - Integrated Authentication and Authorization: Supports token-based authentication, OpenConnect, OAuth, and ensures data access policies are enforced across REST catalog interactions.
      - Multi-Catalog Support: Manage multiple catalogs simultaneously for greater flexibility.
      - Openness and Interoperability: Aligns with IOMETE's vision of openness, supporting external platforms like Dremio, Databricks, and Snowflake via standard Iceberg REST protocol.

  </NewFeatures>
</Release>

<Release version="1.22.0" date="September 18, 2024">
  <BreakingChanges>
    - **Deployment Process Changes**: 
      - The `data-plane-base` Helm chart has been deprecated and is no longer required for installation.  
      - `ClusterRole`, previously added for multi-namespace support, has been removed, and the system now uses only namespaced Roles.   
      - Spark-Operator is now deployed separately to each connected namespace.  
      - The process for connecting a new namespace has been updated. Please refer to the Advanced Deployment Guides for more information.
  </BreakingChanges>

  <Improvements>
    - **UI Console Pagination**: Added pagination to user related components on UI Console.
  </Improvements>
</Release>

<Release version="1.20.2" date="September 3, 2024">
  <NewFeatures>
    - **Scheduled Job Suspension**: Added possibility to suspend Scheduled Spark applications.
  </NewFeatures>

  <BugFixes>
    - Fixed issue with private docker repos not being visible on UI.
  </BugFixes>
</Release>

<Release version="1.20.0" date="August 26, 2024">
  <NewFeatures>
    - **Centralized Secret Management**: Users can now create and manage secrets centrally from the settings page and inject them into Spark applications. Supports integration with Kubernetes and HashiCorp Vault for storing secrets. Learn more [here](docs/user-guide/secrets.md).
    - **Multi-Namespace Support**: Spark resources can now be deployed across different namespaces, enhancing multi-tenant and organizational capabilities.
    - **Iceberg REST Catalog Support**: Added support for the Iceberg REST Catalog, expanding the range of catalog integrations.
    - **JDBC Catalog Support**: Introduced support for JDBC Catalog, allowing connections to a wider array of databases.
    - **Catalog-Level Access Control**: Security improvements now allow access control to be managed at the catalog level for more granular permissions management.
  </NewFeatures>

  <Improvements>
    - **Spark Connect Logging**: Added Logs Panel for Spark Connect.
    - **Spark Job API Enhancement**: Added the ability to override `instanceConfig` in the Spark job API.
  </Improvements>

  <BugFixes>
    - Resolved an issue related to `tmpfs` storage.
  </BugFixes>
</Release>

<Release version="1.19.2" date="August 5, 2024">
  <Improvements>
    - **Spark Operator Performance**: Optimized performance of spark-operator for handling large numbers of Spark job submissions.
  </Improvements>
</Release>

<Release version="1.19.0" date="July 31, 2024">
  <NewFeatures>
    - **Spark Applications**: Introduced a new Spark Applications page featuring a zoomable timeline chart. This enhancement allows for easy tracking and visualization of applications across all Spark jobs.  
      <Img src="/img/getting-started/release-notes/spark-apps.png" alt="Spark Applications"/>
    - **Persistent Volume Claim (PVC) Options**: When creating a Volume, you can now choose the "Reuse Persistent Volume Claim" and "Wait to Reuse Persistent Volume Claim" options on a per-PVC basis. This feature allows for customized volume configurations for different lakehouse and Spark resources, providing greater flexibility and control over resource management.
      <Img src="/img/getting-started/release-notes/volumes-reusable-pvc.png" alt="PVC Volume"/>
  </NewFeatures>

  <Improvements>
    - **UI Restructuring**: Restructured sidebar menu in the IOMETE Console.
      <Img src="/img/getting-started/release-notes/sidebar.png" alt="Sidebar"/>
  </Improvements>
</Release>

<Release version="1.18.0" date="July 16, 2024">
  <Improvements>
    - **SQL Editor Enhancements**: 
      - Added cell expand to the SQL Editor result grid. You can double click on the cell with multi-line value to expand it.
      - Added import/download functionality to the worksheets.
      - UI / Design improvements in SQL Editor.
  </Improvements>

  <BugFixes>
    - Fixed issue with `explain ...` sql statement.
    - Fixed issue with DBeaver and Power BI integrations.
  </BugFixes>
</Release>

<Release version="1.17.0" date="July 8, 2024">
  <NewFeatures>
    - **Data-Catalog Explorer**: Launched beta version of Data-Catalog Explorer (Available in the Data-Catalog menu: from right-top side choose Explorer)
  </NewFeatures>

  <Improvements>
    - **SQL Editor Database Explorer**: 
      - Added partitions folder, you can view table partition columns.
      - Added Iceberg View support. `view` folder now available for iceberg catalogs
      - Improved error messaging in SQL Editor
      - Added item "Open in explorer" to the right-context menu. You can open the selected table in the Data-Catalog Explorer to view detailed information and snapshots
      - Redesigned result charts
    - **System Information**: Added Spark / Iceberg / Scala version information to the Data-Plane Information page in the Settings menu
    - **Spark Job**: Improved Cron editor in Spark Job configuration
    - **Design Improvements**: Overall design improvements: slowly moving to a more compact design
  </Improvements>

  <BugFixes>
    - Fixed issue where nessie catalog displayed wrong list of databases/tables in the SQL Explorer
    - Fixed "Invalid YearOfEra" issue during Registration of Iceberg Tables.
  </BugFixes>
</Release>

<Release version="1.16.0" date="July 1, 2024">
  <NewFeatures>
    - **Nessie Catalog Support**: Added Nessie catalog support `Beta`
  </NewFeatures>

  <Improvements>
    - **Spark Operator Updates**: Updated spark-operator with performance optimizations and bug fixes
      - Enhances overall system stability and efficiency
    - **Node Type Validation**: Implemented stricter validation for Node Types
      - CPU: Minimum 300 milli-cores
      - Memory: Minimum 900 MiB
      - Ensures compliance with Spark requirements for optimal performance
    - **UI Enhancements**: Various UI improvements for better user experience
  </Improvements>

  <BugFixes>
    - Resolved issue with "STARTING" status in Spark Jobs
      - Improves job status accuracy and monitoring
  </BugFixes>
</Release>

<Release version="1.15.0" date="June 24, 2024">
  <Improvements>
    - **Spark Operator Enhancements**: 
      - Improved performance to handle ~1000 Spark Job submissions per minute
      - Fixed conflict issues when submitting Spark jobs via API
      - Added comprehensive metrics to Spark run details view
      - Implemented Timeline (beta) feature for tracking status changes
      - Integrated Kubernetes events for Spark Resources (Run, Lakehouse)
    - **Job Management**: 
      - Introduced Job retry policy
      - Spark run metrics now available during "running" state
      - Implemented periodic garbage collection for failed jobs in Kubernetes
      - Added support for job run tags and filtering by tag
      - Introduced option to re-trigger runs with the same configuration
    - **Monitoring and Logging**: 
      - Added support for Splunk logging
      - Implemented new System Config in UI Console
      - Added "Spark Jobs alive time" to new "System Config" page
      - Separated Driver and Executor task durations
      - Display summary of total running/complete/pending runs on Spark job page
      - Spark job log view now auto-scrolls to bottom when new logs are added
      - Implemented "Spark Jobs alive time" configuration
    - **UI/UX Enhancements**: 
      - Added time filter to Job Runs
      - Displaying Scheduler Next Run information on UI
      - Added ID to Spark Run Details page
    - **Performance Optimizations**: Fixed long job names causing Spark driver service name conflicts
  </Improvements>

  <BugFixes>
    - Fixed issue where Spark UI occasionally failed to update
    - Resolved Spark History redirection issue (now opens correct page on first load)
    - Addressed Spark driver service name conflicts caused by long job names
  </BugFixes>
</Release>

<Release version="1.14.0" date="June 13, 2024">
  <BugFixes>
    - **Ranger Audit**: Ranger Audit now working as expected. Page added to Data Security section in IOMETE Console.
    - Fixed issue with PowerBI integration.
  </BugFixes>
</Release>
