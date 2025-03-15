import React from "react";

import styles from "./styles.module.scss";
import clsx from "clsx";

export type Props = {
  items: Array<{ name: string; permalink: string }>;
  activeTag?: string;
};

const tags = ["Release", "Educational", "Company", "Engineering", "Technical"];

interface IProps {
  selected?: string;
  onChange: (val: string) => void;
}
function Tags({ selected, onChange }: IProps) {
  return (
    <div className={styles.Tags}>
      <div
        className={clsx(styles.TagLink, selected === "" && styles.Active)}
        onClick={() => onChange("")}
      >
        All
      </div>

      {tags.map((tag) => (
        <div
          key={tag}
          className={clsx(styles.TagLink, tag === selected && styles.Active)}
          onClick={() => onChange(tag)}
        >
          {tag}
        </div>
      ))}
    </div>
  );
}

export default Tags;
