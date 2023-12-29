import { MagnifyingGlass } from "@phosphor-icons/react";
import React from "react";

import styles from "./styles.module.scss";

interface IProps {
  onChange: (val: string) => void;
}

function Search({ onChange }: IProps) {
  return (
    <div className={styles.Search}>
      <input type="text" onChange={(e) => onChange(e.target.value)} placeholder="Search by title" />
      <MagnifyingGlass size={18} />
    </div>
  );
}

export default Search;
