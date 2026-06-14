import React from "react";
import clsx from "clsx";
import Footer from "@theme-original/BlogPostItem/Footer";
import EditMetaRow from "@theme/EditMetaRow";
import { ThemeClassNames } from "@docusaurus/theme-common";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";

// IOMETE blog posts use a custom `tags2` frontmatter field (not the standard
// `tags`) and the blog has no `editUrl`. The default BlogPostItem/Footer
// early-returns `null` when there are no standard tags / editUrl, which also
// hides the "Last updated" line even though `showLastUpdateTime` is enabled
// and `lastUpdatedAt` is computed. This wrapper renders the original footer,
// then appends the Last-updated row (above the pagination) whenever the
// original footer would have skipped it.
export default function FooterWrapper(props) {
  const { metadata, isBlogPostPage } = useBlogPost();
  const { tags, editUrl, hasTruncateMarker, lastUpdatedAt, lastUpdatedBy } =
    metadata;

  const tagsExists = tags.length > 0;
  const truncatedPost = !isBlogPostPage && hasTruncateMarker;
  // Mirrors the default footer's render guard so we only step in when it bails.
  const originalRendersFooter = tagsExists || truncatedPost || !!editUrl;

  const showLastUpdated =
    isBlogPostPage && !originalRendersFooter && (lastUpdatedAt || lastUpdatedBy);

  return (
    <>
      <Footer {...props} />
      {showLastUpdated && (
        <footer className="docusaurus-mt-lg">
          <EditMetaRow
            className={clsx(
              "margin-top--sm",
              ThemeClassNames.blog.blogFooterEditMetaRow
            )}
            editUrl={editUrl}
            lastUpdatedAt={lastUpdatedAt}
            lastUpdatedBy={lastUpdatedBy}
          />
        </footer>
      )}
    </>
  );
}
