import React from "react";
import Card from "@site/src/components/Card";
import styles from "./styles.module.scss";

const BASE_GITHUB_URL = 'https://github.com/iomete/iomete-marketplace-jobs/tree/main';

const MarketplaceJob = ({ name, githubPath, version, description }) => {
  const githubUrl = `${BASE_GITHUB_URL}/${githubPath}`;

  return (
    <Card title={name} link={githubUrl}>
      <div className={styles.jobContent}>
        {description && <p>{description}</p>}
        <div className={styles.versionBadge}>
          {version ? (
            <span className={styles.version}>v{version}</span>
          ) : (
            <span className={styles.comingSoon}>Version coming soon</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MarketplaceJob;