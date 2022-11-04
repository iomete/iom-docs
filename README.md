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


## Custom Img component

**Props**
- **src** Image source *required*
- **alt** Image alternative (for SEO) *required*
- **caption** For label int the bottom of image *optional*
- **width** Image width *optional*
- **height** Image height *optional*

**import component in md/mdx file**  *required*
```jsx
    import Img from "@site/src/components/Img";
```

```html
    <Img src="../img/guides/metabase-bi/choose-datasource.png" alt="Choose datasource"/>
    <Img src="../img/guides/metabase-bi/choose-datasource.png" alt="Choose datasource" caption="Choose datasource with/>
    <Img src="../img/guides/metabase-bi/choose-datasource.png" alt="Choose datasource" caption="Choose datasource with caption" width="800px"/>
    <Img src="../img/guides/metabase-bi/choose-datasource.png" alt="Choose datasource" caption="Choose datasource with caption" height="800px"/>
```
