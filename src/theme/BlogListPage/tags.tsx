import React from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";

export type Props = {
  items: Array<{ name: string; permalink: string }>;
  activeTag?: string;
};

// Todo remove '/docs' after blog migration
const prioritizedTags: Props["items"] = ["release", "educational", "company", "engineering"].map((tag) => ({
  name: tag,
  permalink: `/docs/blog/tags/${tag.replace(/ /g, "-")}`,
}));

const Chip = function ({ label, permalink, active = false }) {
  return (
    <Link to={permalink} className={clsx("blog-tag-link", active && "active")}>
      {label}
    </Link>
  );
};

export const Tags = ({ activeTag }) => {
  return (
    <div className="blog-tags">
      <Chip label="All" permalink="/docs/blog" />
      {prioritizedTags.map(({ name, permalink }) => (
        <Chip key={permalink} label={name} permalink={permalink} active={activeTag === permalink} />
      ))}
      <Chip label="More..." permalink="/docs/blog/tags" />
    </div>
  )
};
