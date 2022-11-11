import React from "react";
import styles from "./custom.img.module.scss";

export default function Img({ src, alt = "", caption = "", padding = 32 }) {
  const paddingBottom = padding - 8;
  console.log(padding, paddingBottom);
  return (
    <div className={styles.imgContainer}>
      <div className={styles.imgContent} style={{ padding: padding, paddingBottom: paddingBottom }}>
        <img src={require("@site/static" + src).default} alt={alt ? alt : caption} />
      </div>
      {caption && <div className={styles.imgCaption}>{caption}</div>}
    </div>
  );
}