import React from "react";

import styles from "./FeatureGrid.module.css";

type FeatureItem = {
  title: string;
  description: React.ReactNode;
  icon?: React.ReactNode;
};

type FeatureGridProps = {
  items: FeatureItem[];
};

// Reusable grid for concise feature/value blocks.
export default function FeatureGrid({ items }: FeatureGridProps) {
  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <article key={item.title} className={styles.card}>
          {item.icon ? <div className={styles.icon}>{item.icon}</div> : null}
          <h3 className={styles.title}>{item.title}</h3>
          {typeof item.description === "string" ? (
            <p className={styles.description}>{item.description}</p>
          ) : (
            <div className={styles.description}>{item.description}</div>
          )}
        </article>
      ))}
    </div>
  );
}
