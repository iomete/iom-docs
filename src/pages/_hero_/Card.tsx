import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.scss";

const Card = ({ label, title, link, description }) => {
  const baseUrl = useBaseUrl("/");
  return (
    <div className={styles.FeatureCard}>
      <a href={baseUrl + link}>
        <div className={styles.CardContent}>
          <p className={styles.CardLabel}>{label}</p>
          <p className={styles.CardTitle}>{title}</p>
          <p className={styles.CardDescription}>{description}</p>
        </div>
      </a>
    </div>
  );
};

export default Card;
