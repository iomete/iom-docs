import React from "react";

import styles from "./styles.module.scss";
import Link from "@docusaurus/Link";
import clsx from "clsx";

export type Props = {
  items: Array<{ name: string; permalink: string }>;
  activeTag?: string;
};

const prioritizedTags: Props["items"] = ["release", "educational", "company", "engineering"].map((tag) => ({
  name: tag,
  permalink: `/blog/tags/${tag.replace(/ /g, "-")}`,
}));

const Chip = function ({ label, permalink, active = false }) {
  return (
    <Link to={permalink} className={clsx(styles.TagLink, active && styles.Active)}>
      {label}
    </Link>
  );
};

interface IProps {
  activeTag?: string;
}
function Tags({ activeTag }: IProps) {
  return (
    <div className={styles.Tags}>
      <Chip label="All" permalink="/blog" />

      {prioritizedTags.map(({ name, permalink }) => (
        <Chip key={permalink} label={name} permalink={permalink} active={activeTag === permalink} />
      ))}
      <Chip label="More..." permalink="/blog/tags" />
    </div>
  );
}

export default Tags;
