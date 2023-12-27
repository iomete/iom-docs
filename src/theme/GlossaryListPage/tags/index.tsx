import React from "react";

import styles from "./styles.module.scss";
import Link from "@docusaurus/Link";
import clsx from "clsx";

export type Props = {
  items: Array<{ name: string; permalink: string }>;
  activeTag?: string;
};

const prioritizedTags: Props["items"] = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
].map((tag) => ({
  name: tag,
  permalink: `/glossary/tags/${tag.replace(/ /g, "-")}`,
}));

const Chip = function ({ label, permalink, active = false }) {
  console.log("Chip", permalink, active);

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
    <div className={`$styles.Tags} row`}>
      <div className="col col--1">
        <Chip label="All" permalink="/glossary" />
      </div>

      {prioritizedTags.map(({ name, permalink }) => (
        <div className="col col--1">
          <Chip key={permalink} label={name} permalink={permalink} active={activeTag === permalink} />
        </div>
      ))}
    </div>
  );
}

export default Tags;
