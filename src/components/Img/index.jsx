import React from "react";
import styles from "./custom.img.module.scss";

export default function Img({ src, alt = "IOMETE", maxWidth = "max-content", centered = true, borderless = false, isBackgroundWhite = false }) {
  return (
    <div className={`${styles.imgContainer} ${centered && styles.imgCentered} ${borderless && styles.imgBorderless}`} style={{ maxWidth }}>
      <img src={require("@site/static" + src).default} alt={alt} style={{ background: isBackgroundWhite && "white" }} />
    </div>
  );
}
