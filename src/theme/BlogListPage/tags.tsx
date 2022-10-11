import React from "react";

export type Props = {
  items: Array<{ name: string; permalink: string }>;
  activeTag?: string;
};

// Todo remove '/docs' after blog migration
const prioritizedTags: Props["items"] = ["educational", "company", "platform", "engineering"].map((tag) => ({
  name: tag,
  permalink: `/docs/blog/tags/${tag.replace(/ /g, "-")}`,
}));

const Chip = function ({ label, permalink, active = false }) {
  return (
    <a
      href={permalink}
      className="
              bg-gray-100
              text-black
              hover:bg-blue-700
              hover:text-white
              dark:bg-gray-500
              dark:text-white
              dark:hover:bg-blue-600
              transition-colors
              duration-100
              rounded
              no-underline
              text-lg
              px-2
              py-1
              sm:px-3
              sm:py-2
              md:px-6
              md:py-4
              capitalize"
    >
      {label}
    </a>
  );
};

export const Tags = ({ activeTag }) => (
  <section className="block p-5 md:px-10">
    <div className="max-w-7xl w-full mx-auto">
      <div className="flex space-x-2 justify-center">
        <Chip label="All" permalink="/docs/blog" />
        {prioritizedTags.map(({ name, permalink }) => (
          <Chip key={permalink} label={name} permalink={permalink} active={activeTag === permalink} />
        ))}
        <Chip label="More..." permalink="/docs/blog/tags" />
      </div>
    </div>
  </section>
);
