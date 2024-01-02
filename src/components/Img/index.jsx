import React from "react";
import styles from "./custom.img.module.scss";

import useBaseUrl from "@docusaurus/useBaseUrl";

export default function Img({ src, alt = "", caption = "", padding = 16, maxWidth = "max-content", centered = false, imgClass = "", imgStyle = {} }) {
  const paddingBottom = padding - 8;
  const margin = centered ? "auto" : "inherit";

  const baseUrl = useBaseUrl("/");

  return (
    <div className={styles.imgContainer} style={{ maxWidth, marginLeft: margin, marginRight: margin }}>
      <div className={styles.imgContent} style={{ padding: padding, paddingBottom: paddingBottom }}>
        <img className={imgClass} src={baseUrl + src} alt={alt ? alt : caption} />
      </div>
      {caption && (
        <div className={styles.imgCaption} imgStyle={imgStyle}>
          {caption}
        </div>
      )}
    </div>
  );
}
