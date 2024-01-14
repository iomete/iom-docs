import React from "react";
import styles from "./custom.img.module.scss";
import ThemedImage from "@theme/ThemedImage";

export default function Img({
  src,
  alt = "IOMETE",
  maxWidth = "max-content",
  centered = true,
  borderless = false,
  style = {},
  srcDark = null,
}) {
  return (
    <div
      className={`${styles.imgContainer} ${centered && styles.imgCentered} ${borderless && styles.imgBorderless}`}
      style={{ maxWidth }}
    >
      {!srcDark && <img src={require("@site/static" + src).default} alt={alt} style={style} />}

      {srcDark && (
        <ThemedImage
          alt={`${alt} | IOMETE`}
          sources={{
            light: require("@site/static" + src).default,
            dark: require("@site/static" + srcDark).default,
          }}
          style={style}
        />
      )}
    </div>
  );
}
