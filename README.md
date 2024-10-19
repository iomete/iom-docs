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

---

### Feedback component

If you want to hide rating feedback
`hideFeedback:true` in frontMatter

```mdx
---
title: Doc title
hideFeedback:true
---
```

---

### Img component

| Property      | Requirements | Type       |   Default   | Description                  |
| ------------- | ------------ | ---------- | :---------: | ---------------------------- |
| src           | mandatory    | string     |      -      | Image source                 |
| alt           | optional     | string     |      -      | Image alternative (for SEO). |
| centered      | optional     | true/false |    false    | Make centered image.         |
| maxWidth (px) | optional     | string     | max-content | Set max width.               |
| borderless    | optional     | true/false |    false    | Make img borderless          |

```jsx
import Img from "@site/src/components/Img";

<Img
  src="source.png"
  alt="Alternative text"
  maxWidth="256px"
  centered
  borderless
/>;
```

---

### Mini Card component

```jsx
import MiniCard from "@site/src/components/MiniCard";

<MiniCard link="https://iomete.com/start-know" linkName="Start now">
  Click to Get started
</MiniCard>;
```

---

## Export to PDF

https://github.com/signcl/docusaurus-prince-pdf

`npm run build`
`npm run serve`
`npx docusaurus-prince-pdf -u http://localhost:3000/docs/guides --include-index`

---

### Iframe component (Exp: Youtube iframe)

```jsx
import Iframe from "@site/src/components/Iframe";

<Iframe title="Title of video" src="https://www.youtube.com/embed/link" />;
```

---

### Glossary

The Glossary plugin is disabled in devMode by default for low-speed purposes.
If you want to enable both modes, comment out the line `process.env.NODE_ENV === 'production' && glossaryPlugin,` and uncomment the line `// glossaryPlugin,`.

### Youtube (Embed) video

For youtube embed videos import and use YoutubeCard component. Just pass link and title.
