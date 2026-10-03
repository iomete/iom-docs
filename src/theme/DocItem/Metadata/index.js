import React from "react";
import { PageMetadata } from "@docusaurus/theme-common";
import { useDoc } from "@docusaurus/plugin-content-docs/client";

const EXACT_TITLE = "@@";

export default function DocItemMetadata() {
  const { metadata, frontMatter, assets } = useDoc();
  const documentTitle = frontMatter.title_meta
    ? `${EXACT_TITLE}${frontMatter.title_meta}`
    : metadata.title;
  return (
    <PageMetadata
      title={documentTitle}
      description={metadata.description}
      keywords={frontMatter.keywords}
      image={assets.image ?? frontMatter.image}
    />
  );
}
