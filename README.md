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

| Property     | Requirements | Type   | Default    | Description                                                                                            |
|--------------|--------------|--------|:----------:|--------------------------------------------------------------------------------------------------------|
| src          | mandatory    | string |    -       | Image source                                                                                           |
| alt          | optional     | string |    -       | Image alternative (for SEO).  If the image "alt" is not specified, then it will take the caption text. |
| caption      | optional     | string |    -       | The caption text displayed after (on the bottom) the image                                             |
| padding (px) | optional     | number |    16      | Padding of gradient                                                                                    |
| centered     | optional     |    -   |    -       | Make centered image. You don't need to set value.                                                      |
| maxWidth (px)| optional     | string |max-content | Set max width.                                                                                         |
| imgClass     | optional     | string |    -       | Set css class to img                                                                                   |

### Examples

```html
<!-- src -->
<Img src="source.png"/>

<!-- Converted to -->
<img src="source.png" />
```

```html
<!-- src, caption -->
<Img src="source.png" caption="Image label" />

<!-- Converted to -->
<img src="source.png" caption="Image label" alt="Image label" />

```

```html
<!-- src, caption, alt -->
<Img src="source.png" caption="Image label" alt="Alternative text" />

<!-- Converted to -->
<img src="source.png" caption="Image label" alt="Alternative text" />
```

```html
<!-- centered -->
<Img src="source.png" centered/>
```

```html
<!-- maxWidth -->
<Img src="source.png" maxWidth="256px"/>
```

```html
<!-- imgClass -->
<Img src="source.png" imgClass="bg-white"/>
```


### Export to PDF

https://github.com/signcl/docusaurus-prince-pdf

### Local
`npm run build`
`npm run serve`
`npx docusaurus-prince-pdf -u http://localhost:3000/docs/guides --include-index`