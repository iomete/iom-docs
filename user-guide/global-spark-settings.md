---
title: Global Spark Settings
description: IOMETE offers a convenient feature for configuring Spark settings through an autocomplete interface.
last_update:
  date: 06/02/2024
  author: Vugar Dadalov
---

import { Plus, Trash } from "@phosphor-icons/react";
import Img from '@site/src/components/Img';

IOMETE offers a convenient feature for configuring Spark settings through an autocomplete interface.

---

To view Global Spark Settings, navigate to the `Settings` menu item and switch to the `Global Spark Settings` tab.

<Img src="/img/user-guide/global-spark-settings/spark-settings.png" alt="Global Spark Settings" />

## Add config

To add a new configuration item, click on the `Add config` button. If you want to remove a configuration item, simply click on the <Trash size={20} /> button. Once you have configured all the necessary Spark settings, click on `Save changes`.

<Img src="/img/user-guide/global-spark-settings/save.png" alt="Save spark setting" />

## Autocomplete

As you begin typing in the `Key` input, the autocomplete feature will suggest relevant Spark settings based on your input. These suggestions include common Spark configuration parameters. Users can easily discover and select appropriate Spark settings, even if they are not familiar with the complete list of available options.

<div className="row">
  <div className="col col--6">
<Img src="/img/user-guide/global-spark-settings/autocomplete.png" alt="Autocomplete" maxWidth="400px"/>
  </div>
  <div className="col col--6">
<Img src="/img/user-guide/global-spark-settings/autocomplete-suggest.png" alt="Autocomplete suggest" maxWidth="400px" />
  </div>
</div>

:::info Autocomplete
Autocomplete speeds up configuration by suggesting relevant settings, cutting down on manual input and potential errors. This feature ensures that settings are properly formatted and aligned with Spark's requirements, reducing configuration problems and runtime errors.
:::
