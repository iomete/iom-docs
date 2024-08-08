import React from "react";
import TOC from "@theme-original/TOC";

export default function TOCWrapper(props) {
  return (
    <div className={`toc-wrapper`}>
      <h2 className="mb-2">ON THIS PAGE</h2>
      <TOC {...props} />
    </div>
  );
}
