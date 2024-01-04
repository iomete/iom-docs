# Website

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

## Installation

1. [Install](https://nodejs.org/en/download) nodejs and npm

2. Check nodejs version `node -v`

   - The Node.js version number should be displayed as output.

3. Verify the installation of npm alongside Node.js `npm -v`

   - The npm version number should be displayed as output.

4. Clone Repository

5. Run `cd iom-docs`

6. Run `npm install`

7. Run `npm run start`
   - The project should be running on port 3000 and will be opened in the browser.

### Feedback component

If you want to hide rating feedback
`hideFeedback:true` in frontMatter

**Expample**

```mdx
---
title: Doc title
hideFeedback:true
---
```

### Custom Img component properties

| Property      | Requirements | Type   |   Default   | Description                                                                                           |
| ------------- | ------------ | ------ | :---------: | ----------------------------------------------------------------------------------------------------- |
| src           | mandatory    | string |      -      | Image source                                                                                          |
| alt           | optional     | string |      -      | Image alternative (for SEO). If the image "alt" is not specified, then it will take the caption text. |
| padding (px)  | optional     | number |     16      | Padding of gradient                                                                                   |
| centered      | optional     | -      |      -      | Make centered image. You don't need to set value.                                                     |
| maxWidth (px) | optional     | string | max-content | Set max width.                                                                                        |
| borderless    | optional     | -      |      -      | Make img without borderless                                                                           |

### Examples

```jsx
// <!-- src, alt, maxWidth, centered -->
<Img src="source.png" alt="Alternative text" maxWidth="256px" centered borderless />
```

### Mini Card

import MiniCard from "@site/src/components/MiniCard";

<MiniCard link="https://iomete.com/start-know" linkName="Start now">Click to Get started</MiniCard>

### Export to PDF

https://github.com/signcl/docusaurus-prince-pdf

### Local

`npm run build`
`npm run serve`
`npx docusaurus-prince-pdf -u http://localhost:3000/docs/guides --include-index`
