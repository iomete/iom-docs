import React from "react";

import styles from "./styles.module.scss";
import Link from "@docusaurus/Link";
import clsx from "clsx";

export type Props = {
  items: Array<{ name: string; permalink: string }>;
  activeTag?: string;
};

const prioritizedTags: Props["items"] = ["A", "B", "C", "D", "E", "F", "H", "J", "K", "L", "M", "N", "O", "P", "R", "S", "T", "U"].map((tag) => ({
  name: tag,
  permalink: `/glossary/tags/${tag.replace(/ /g, "-")}`,
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
      <Chip label="All" permalink="/glossary" />

      {prioritizedTags.map(({ name, permalink }) => (
        <Chip key={permalink} label={name} permalink={permalink} active={activeTag === permalink} />
      ))}
    </div>
  );
}

export default Tags;
