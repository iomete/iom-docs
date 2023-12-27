import React from "react";
import styles from "./styles.module.scss";

function Header() {
  return (
    <div className={styles.Header}>
      <div className={styles.HeaderContent}>
        <h3>The IOMETE blog</h3>
        <p className="text-lg text-muted">
          Welcome to our blog. Here's where we share company news, engineering updates and educational content. Don't
          hesitate to reach out to us by email{" "}
          <a href="mailto:hello@iomete.com" className="text-primary">
            hello@iomete.com
          </a>
          . <p>We'd love to hear from you!</p>
        </p>
      </div>
      <img src="/img/iomete-bg.svg" alt="Iomete Logo" className={styles.BgImg} />
    </div>
  );
}

export default Header;
