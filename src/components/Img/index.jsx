import React from "react";
import styles from "./styles.module.scss";
import ThemedImage from "@theme/ThemedImage";

export default function Img({
  src,
  alt = "IOMETE",
  maxWidth = "max-content",
  centered = true,
  borderless = false,
  style = {},
}) {
  let darkSrc;
  try {
    require("@site/static" + src.replace(/(\.[^.]+)$/, "-dark$1"));
    darkSrc = src.replace(/(\.[^.]+)$/, "-dark$1");
  } catch (_) {}
  return (
    <div
      className={`${styles.imgContainer} ${centered && styles.imgCentered} ${borderless && styles.imgBorderless}`}
      style={{ maxWidth }}
    >
      <ThemedImage
        alt={`${alt} | IOMETE`}
        sources={{
          light: require("@site/static" + src).default,
          dark: require("@site/static" + (darkSrc || src)).default,
        }}
        style={style}
      />
    </div>
  );
}
