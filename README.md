# Website

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

## Custom Img component properties

| Property     | Requirements | Type   | Default    | Description                                                                                            |
|--------------|--------------|--------|:----------:|--------------------------------------------------------------------------------------------------------|
| src          | mandatory    | string |    -       | Image source                                                                                           |
| alt          | optional     | string |    -       | Image alternative (for SEO).  If the image "alt" is not specified, then it will take the caption text. |
| caption      | optional     | string |    -       | The caption text displayed after (on the bottom) the image                                             |
| padding (px) | optional     | number |    16      | Padding of gradient                                                                                    |
| centered     | optional     |    -   |    -       | Make centered image. You don't need to set value.                                                      |
| maxWidth (px)| optional     | string |max-content | Set max width.                                                                                         |
| imgClass     | optional     | string |    -       | Set css class to img                                                                                   |

## Examples

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