import React from "react";

type FeatureItem = {
  title: string;
  description: React.ReactNode;
  icon?: React.ReactNode;
};

type FeatureGridProps = {
  items: FeatureItem[];
};

export default function FeatureGrid2({ items }: FeatureGridProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <article
          key={item.title}
          className="flex-1 min-w-[240px] p-3 px-4 border border-solid rounded-md border-[var(--base-200)] bg-[--base-50] text-[var(--base-700)] font-inter leading-[18.2px]"
        >
          {item.icon ? <div className="mb-3 text-[var(--base-700)]">{item.icon}</div> : null}
          <h3 className="m-0 mb-2.5 text-[1.1rem] text-[var(--base-950)] font-archivo font-normal">{item.title}</h3>
          {typeof item.description === "string" ? (
            <p className="m-0 text-[var(--base-700)] text-[14px] leading-[18.2px] tracking-[-0.14px]">{item.description}</p>
          ) : (
            <div className="m-0 text-[var(--base-700)] text-[14px] leading-[18.2px] tracking-[-0.14px]">{item.description}</div>
          )}
        </article>
      ))}
    </div>
  );
}
