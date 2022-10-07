---
title: Introduction
slug: /sync-data-intro
authors:
  - name: Joel Marcey
    title: Co-creator of Docusaurus 1
    url: https://github.com/JoelMarcey
    image_url: https://github.com/JoelMarcey.png
  - name: Sébastien Lorber
    title: Docusaurus maintainer
    url: https://sebastienlorber.com
    image_url: https://github.com/slorber.png

---
<!-- # Overview -->

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  groupId="node-language"
  defaultValue="js"
  values={[
    { label: 'JavaScript', value: 'js', },
    { label: 'TypeScript', value: 'ts', },
  ]
}>
<TabItem value="js">

```jsx
import { DyteMeeting } from "dyte-client";

function App() {
  return (
    <div className="App">
      <DyteMeeting
        onInit={(meeting) => {}}
        clientId={`orgId || clientId`}
        meetingConfig={{
          roomName: `roomName`,
          authToken: `authToken`,
        }}
      />
    </div>
  );
}

export default App;
```

</TabItem>
<TabItem value="ts">

```tsx
import { DyteMeeting, Meeting } from "dyte-client";

function App() {
  return (
    <div className="App">
      <DyteMeeting
        onInit={(meeting: Meeting) => {}}
        clientId={`orgId || clientId`}
        meetingConfig={{
          roomName: `roomName`,
          authToken: `authToken`,
        }}
      />
    </div>
  );
}

export default App;
```

</TabItem>
</Tabs>

:::caution

If you're new to this SDK, we recommend you check out the [UI Kit](/ui-kit) SDK or
the [React UI Kit](/react-ui-kit) depending on your needs

:::

import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

<DocCardList items={useCurrentSidebarCategory().items.slice(1)}/>

```groovy
allprojects {
    repositories {
        google()
        jcenter()
        maven {
            url "https://maven.dyte.in"
        }
    }
}
```