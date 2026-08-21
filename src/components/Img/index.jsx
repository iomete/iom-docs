import React, { useEffect, useId, useRef, useState } from "react";
import styles from "./styles.module.scss";
import ThemedImage from "@theme/ThemedImage";
import useBaseUrl from "@docusaurus/useBaseUrl";

function GridPlaceholder({ hidden, borderless }) {
  const patternId = `imgGrid-${useId().replace(/:/g, "")}`;
  return (
    <div
      className={`${styles.placeholder} ${hidden ? styles.placeholderHidden : ""}`}
      aria-hidden="true"
    >
      <svg className={styles.placeholderPattern} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id={patternId}
            width="162"
            height="44"
            patternUnits="userSpaceOnUse"
            patternTransform="scale(0.667)"
          >
            <line x1="-0.131055" y1="43.6171" x2="80.8689" y2="21.6171" stroke="currentColor" />
            <line y1="44" x2="0" y2="0" stroke="currentColor" />
            <line x1="81" y1="44" x2="81" y2="0" stroke="currentColor" />
            <path d="M0 0.299805L81 21.2998" stroke="currentColor" />
            <line y1="-0.5" x2="83.9345" y2="-0.5" transform="matrix(-0.965038 -0.262109 -0.262109 0.965038 162 44.0996)" stroke="currentColor" />
            <line y1="-0.5" x2="44" y2="-0.5" transform="matrix(8.45086e-10 -1 -1 -8.45086e-10 161.5 44)" stroke="currentColor" />
            <line y1="-0.5" x2="44" y2="-0.5" transform="matrix(8.45086e-10 -1 -1 -8.45086e-10 80.5 44)" stroke="currentColor" />
            <path d="M162 0.299805L81 21.2998" stroke="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}

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

  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  // Cached images can be `complete` before React attaches onLoad, so the load
  // event never fires. Detect that on mount by inspecting the rendered <img>.
  useEffect(() => {
    const img = containerRef.current?.querySelector("img");
    if (img?.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${styles.imgContainer} ${centered && styles.imgCentered} ${
        borderless && styles.imgBorderless
      }`}
      style={{ maxWidth }}
    >
      <GridPlaceholder hidden={loaded} borderless={borderless} />
      <ThemedImage
        alt={`${alt} | IOMETE`}
        sources={{
          light: lightSrc,
          dark: darkSrc || lightSrc,
        }}
        width={width}
        height={height}
        style={style}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
    </div>
  );
}
