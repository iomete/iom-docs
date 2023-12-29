import React from "react";

import styles from "./styles.module.scss";
import clsx from "clsx";

interface IProps {
  list: string[];
  selected?: string;
  onChange: (val: string) => void;
}
function Tags({ list, selected, onChange }: IProps) {
  return (
    <div className={styles.Tags}>
      <div className={clsx(styles.TagLink)} onClick={() => onChange("")}>
        All
      </div>

      {list.map((item) => (
        <div className={clsx(styles.TagLink, selected === item && styles.Active)} onClick={() => onChange(item)}>
          {item}
        </div>
      ))}
    </div>
  );
}

export default Tags;
