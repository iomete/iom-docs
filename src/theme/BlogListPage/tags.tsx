import React from "react";
import clsx from "clsx";

export type Props = {
  items: Array<{ name: string; permalink: string }>;
  activeTag?: string;
};

// Todo remove '/docs' after blog migration
const prioritizedTags: Props["items"] = ["release","educational", "company", "engineering"].map((tag) => ({
  name: tag,
  permalink: `/docs/blog/tags/${tag.replace(/ /g, "-")}`,
}));

const Chip = function ({ label, permalink, active = false }) {
  return (
    <a
      href={permalink}
      className={clsx(
        active ? "bg-blue-700" : "bg-gray-100",
        active ? "text-white" : "text-black",
        "hover:bg-blue-700",
        "hover:text-white",
        active ? "dark:bg-blue-600" : "dark:bg-gray-500",
        "dark:text-white",
        "dark:hover:bg-blue-600",
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
    </a>
  );
};

export const Tags = ({ activeTag }) => (
  <section className="block p-5 md:px-10">
    <div className="max-w-7xl w-full mx-auto">
      <div className="flex space-x-2 md:space-x-3 xl:space-x-5 justify-center">
        <Chip label="All" permalink="/docs/blog" />
        {prioritizedTags.map(({ name, permalink }) => (
          <Chip key={permalink} label={name} permalink={permalink} active={activeTag === permalink} />
        ))}
        <Chip label="More..." permalink="/docs/blog/tags" />
      </div>
    </div>
  </section>
);
