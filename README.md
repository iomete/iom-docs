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

`src` **_required_** Image source

```html
<Img src="source.png" />

<!-- Result -->
<img src="source.png" />
```

`alt` **_optional_** Image alternative (for SEO)

```html
<Img src="source.png" alt="Alternative text" />

<!-- Result -->
<img src="source.png" alt="Alternative text" />
```

`caption` **_optional_** Image label (Shows in the bottom of image)

```html
<Img src="source.png" alt="Alternative text" caption="Image label" />

<!-- Result -->
<img src="source.png" alt="Alternative text" caption="Image label" />
```

If not specified `alt` props then `caption`'s value will set instead.

```html
<Img src="source.png" caption="Image label" />

<!-- Result -->
<img src="source.png" alt="Image label" caption="Image label" />
```

`padding` *type*:**number**,  *default*: **32** 

```html
<Img src="source.png" padding={48}/>

<!-- Result -->
<div style="padding: 48px;">
    <img src="source.png" />
</div>
```