import React from "react";
import { TitleFormatterProvider } from "@docusaurus/theme-common/internal";

// Prefix added by BlogPostPage/Metadata and DocItem/Metadata when a page sets
// `title_meta`. The marker is stripped here so the <title> and og:title match
// the SEO title exactly, instead of always gaining " | IOMETE".
const EXACT_TITLE = "@@";

const formatter = (params) => {
  const trimmed = params.title?.trim() ?? "";
  if (trimmed.startsWith(EXACT_TITLE)) {
    return trimmed.slice(EXACT_TITLE.length);
  }
  return params.defaultFormatter(params);
};

export default function ThemeProviderTitleFormatter({ children }) {
  return (
    <TitleFormatterProvider formatter={formatter}>
      {children}
    </TitleFormatterProvider>
  );
}
