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
    <Link
      to={permalink}
      className={clsx(
        active ? "bg-primary-light" : "bg-gray-100",
        active ? "text-white" : "text-black",
        "hover:bg-primary-light",
        "hover:text-white",
        active ? "dark:bg-primary-dark" : "dark:bg-gray-500",
        "dark:text-white",
        "dark:hover:bg-primary-dark",
        "transition-colors",
        "duration-100",
        "rounded",
        "no-underline",
        "text-lg",
        "px-3",
        "py-1",
        "md:px-4",
        "md:py-2",
        "xl:px-6",
        "xl:py-2",
        "capitalize"
      )}
    >
      {label}
    </Link>
  );
};

export const Tags = ({ activeTag }) => (
  <div className="flex space-x-2 md:space-x-3 xl:space-x-5 justify-start">
    <Chip label="All" permalink="/docs/blog" />
    {prioritizedTags.map(({ name, permalink }) => (
      <Chip key={permalink} label={name} permalink={permalink} active={activeTag === permalink} />
    ))}
    {/* <Chip label="More..." permalink="/docs/blog/tags" /> */}
  </div>
);
