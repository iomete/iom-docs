import React from "react";
import styles from "./styles.module.scss";

interface IProps {
  src: string;
  title: string;
  allowFullScreen?: boolean;
}
function Iframe({ src, title }: IProps) {
  return (
    <div className={styles.Iframe}>
      <iframe
        width="100%"
        height="100%"
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
}

export default Iframe;
