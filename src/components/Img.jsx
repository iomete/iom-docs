import React from "react";
import styles from "./custom.img.module.scss";

export default function Img({ src, alt = "", caption = "", padding = 16, maxWidth = 'max-content', centered = false, imgClass = "" }) {
  const paddingBottom = padding - 8;
  const margin = centered ? 'auto' : 'inherit';

  return (
    <div className={styles.imgContainer} style={{ maxWidth, marginLeft: margin, marginRight: margin }}>
      <div className={styles.imgContent} style={{ padding: padding, paddingBottom: paddingBottom }}>
        <img className={imgClass} src={require("@site/static" + src).default} alt={alt ? alt : caption} />
      </div>
      {caption && <div className={styles.imgCaption}>{caption}</div>}
    </div>
  );
}