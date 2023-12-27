import { MagnifyingGlass } from "@phosphor-icons/react";
import React from "react";

import styles from "./styles.module.scss";

interface IProps {
  onChange: (val: string) => void;
  placeholder?: string;
}

function Search({ onChange, placeholder = "Search by name, title, category..." }: IProps) {
  return (
    <div className={styles.Search}>
      <input type="text" onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      <MagnifyingGlass size={18} />
    </div>
  );
}

export default Search;
