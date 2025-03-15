import React from "react";

const tagsColorMap = {
  Technical: "var(--racing-100)",
  Release: "var(--fluoro-200)",
  Educational: "var(--stone-100)",
  Company: "var(--lake-100)",
  Engineering: "var(--geode-100)",
};

function CardTags({ tags }: { tags: string[] }) {
  if (!tags) return null;
  return (
    <div className="flex gap-2 text-[var(--base-950)]">
      {tags.map((t) => (
        <small
          key={t}
          className={`text-xs rounded px-1 py-0.5 bg-[${tagsColorMap[t]}]`}
          style={{
            backgroundColor: tagsColorMap[t] || tagsColorMap["Educational"],
          }}
        >
          {(t || "").toUpperCase()}
        </small>
      ))}
    </div>
  );
}

export default CardTags;
