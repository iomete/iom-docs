import React from "react";

import styles from "./Section.module.css";

type SectionTone = "default" | "subtle";

type SectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  tone?: SectionTone;
  className?: string;
  background?: string;
};

// Shared section wrapper with consistent spacing and optional banded background.
export default function Section({
  title,
  description,
  children,
  tone = "default",
  className,
  background,
}: SectionProps) {
  const sectionClassName = `${styles.section} ${tone === "subtle" ? styles.subtle : ""} ${className ?? ""}`;

  return (
    <section className={sectionClassName} style={background ? { background } : undefined}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          {description ? <p className={styles.description}>{description}</p> : null}
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </section>
  );
}
