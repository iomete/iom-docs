## Img component

| Property      | Requirement | Type       |   Default   | Description                                                             |
| ------------- | ----------- | ---------- | :---------: | ----------------------------------------------------------------------- |
| src           | mandatory   | string     |      -      | Image source                                                            |
| alt           | optional    | string     |      -      | Alternative text for accessibility (screen readers); also used for SEO. |
| centered      | optional    | true/false |    false    | Center the image.                                                       |
| maxWidth (px) | optional    | string     | max-content | Set max width.                                                          |
| borderless    | optional    | true/false |    false    | Remove image border.                                                    |

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

## TinyPNG

Use [TinyPNG website](https://tinypng.com/) or the API to reduce image size.

### API Setup

- Install the CLI globally:

  ```bash
  npm install -g tinypng-cli
  ```

- Get your API key from [TinyPNG Developers](https://tinify.com/developers).

### Usage

TinyPNG CLI supports two ways to provide your API key:

1. Save it in a `.tinypng` file in your home directory.
2. Pass it as an option (`-k {API_KEY}`).

#### Single file:

```bash
tinypng demo.png -k {API_KEY}
```

#### All PNGs in current directory:

```bash
tinypng
tinypng .
```

#### Recursively (current + subdirectories):

```bash
tinypng -r
```

#### Specific directory:

```bash
tinypng assets/img
```

#### Multiple directories:

```bash
tinypng assets/img1 assets/img2
```

#### Specific image(s):

```bash
tinypng assets/img/demo.png
tinypng assets/img/demo1.png assets/img/demo2.png
```

#### Resize while compressing:

```bash
tinypng assets/img/demo.png --width 123
tinypng assets/img/demo.png --height 123
tinypng assets/img/demo.png --width 123 --height 123
```
