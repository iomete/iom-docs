---
title: Tableau - Connecting to IOMETE
sidebar_label: Overview
description: Choose a Tableau connection method for IOMETE, then build a dashboard on your lakehouse data.
last_update:
  date: 09/09/2026
  author: Abhishek Pathania
---

import Img from '@site/src/components/Img';
import GridBox from "@site/src/components/GridBox";

## Choose a Connection Method

IOMETE supports two ways to connect Tableau. Choose the guide that matches the protocol you want to use.

| Method | Connector | Guide |
|---|---|---|
| **Arrow Flight (recommended)** | IOMETE Arrow Flight SQL connector | [Arrow Flight](./arrow-flight.md) |
| Thrift | Tableau's built-in Spark SQL connector or the CData Spark SQL connector | [Thrift](./thrift.md) |

## Building a Dashboard

With either connection in place, you're ready to turn your IOMETE data into visualizations.

1. Select a schema, drag tables into the canvas, then click **Sheet 1** to open a new sheet.

<Img src="/img/guides/iomete-tableau-integration/table-report.png" alt="Table data preview in Tableau"/>

2. Right-click a dimension or measure and select **Add to Sheet**.

<Img src="/img/guides/iomete-tableau-integration/report-to-sheet-tableau.png" alt="Adding a field to a Tableau sheet" maxWidth="400px"/>

3. Drag additional fields into rows, columns, or filters to refine the report.

<GridBox>
<Img src="/img/guides/iomete-tableau-integration/gender-sheet-tableau.png" alt="Adding gender dimension to the Tableau report" maxWidth="400px"/>

<Img src="/img/guides/iomete-tableau-integration/employees-sheet-tableau.png" alt="Adding employee count to the report" maxWidth="400px"/>
</GridBox>

4. Pick a visualization type and customize the layout to finish your dashboard.

<Img src="/img/guides/iomete-tableau-integration/iomete-tableau-dashboard.png" alt="Completed Tableau dashboard with IOMETE data"/>

