import React from "react";

import styles from "./styles.module.scss";

const MiniCard = ({ link, linkName, children }) => (
  <div className={styles.MiniCard}>
    <h3 className="title">{children}</h3>
    <a href={link}>{linkName}</a>
  </div>
);

export default MiniCard;
