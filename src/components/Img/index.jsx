import React from "react";
import styles from "./styles.module.scss";
import ThemedImage from "@theme/ThemedImage";
import useBaseUrl from "@docusaurus/useBaseUrl";

/**
 * Content image with automatic dark-mode variant and layout-stable sizing.
 *
 * In MDX, plugins/remark-image-dimensions.js rewrites <Img src="/img/x.png">
 * at build time: `src`/`darkSrc` become static require() URLs (hashed assets,
 * long-cache) and `width`/`height` carry the intrinsic dimensions so the
 * browser reserves space before the image loads.
 *
 * IMPORTANT: no dynamic `require("@site/static" + ...)` here — that pattern
 * makes webpack bundle a context map of every file under static/ (~1 MB)
 * into every page chunk. If src arrives as a plain string (an Img used
 * outside the MDX pipeline), it's served as a static passthrough URL
 * instead.
 */
export default function Img({
  src,
  darkSrc,
  alt = "IOMETE",
  maxWidth = "max-content",
  centered = false,
  borderless = false,
  style = {},
  width,
  height,
}) {
  const passthroughUrl = useBaseUrl(typeof src === "string" ? src : "/");
  const lightSrc = typeof src === "string" ? passthroughUrl : src;
  return (
    <div
      className={`${styles.imgContainer} ${centered && styles.imgCentered} ${
        borderless && styles.imgBorderless
      }`}
      style={{ maxWidth }}
    >
      <ThemedImage
        alt={`${alt} | IOMETE`}
        sources={{
          light: lightSrc,
          dark: darkSrc || lightSrc,
        }}
        width={width}
        height={height}
        style={style}
      />
    </div>
  );
}
