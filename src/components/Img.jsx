import React from "react";
import styles from "./custom.img.module.scss";

export default function Img({ src, alt = "", caption, width = "auto", height = "auto" }) {
  return (
    <div className={styles.imgContainer}>
      <div
        className={styles.imgContent}
        style={{
          width: width,
          height: height,
        }}
      >
        <img src={require("@site/static" + src).default} alt={alt} />
      </div>
      {caption && <div className={styles.imgCaption}>{caption}</div>}
    </div>
  );
}
