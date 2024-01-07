import React from "react";
import TOC from "@theme-original/TOC";
import styles from "./styles.module.scss";

export default function TOCWrapper(props) {
  return (
    <div className={styles.Content}>
      <span className={styles.ContentTitle}>CONTENTS</span>
      <TOC {...props} />
    </div>
  );
}
