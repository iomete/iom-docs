import React from "react";
import clsx from "clsx";
import Footer from "@theme-original/BlogPostItem/Footer";
import EditMetaRow from "@theme/EditMetaRow";
import { ThemeClassNames } from "@docusaurus/theme-common";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import BlogCTA from "@site/src/components/BlogCTA";
import RelatedPosts from "@site/src/components/RelatedPosts";

// Blog posts serve under /resources/blog/. The glossary is a second instance of
// the blog plugin and shares this theme component, so conversion blocks are
// gated on the permalink instead of rendering on every glossary entry too.
const BLOG_PATH = "/resources/blog/";

function toIndexShape(metadata, frontMatter) {
  // Keep the full blog-relative permalink, not just the last segment: posts
  // without a `slug:` frontmatter serve under `<YYYY>/<MM>/<DD>/<name>`, and
  // truncating to the bare name made a post fail to match itself in the index,
  // so it ranked as its own top related post.
  const slug = metadata.permalink
    .replace(/\/$/, "")
    .replace(new RegExp(`^${BLOG_PATH}`), "");

  return {
    slug,
    title: metadata.title || "",
    description: metadata.description || "",
    keywords: (frontMatter.keywords || []).map((k) => String(k).toLowerCase()),
    tags: (frontMatter.tags2 || []).map((t) => String(t).toLowerCase()),
    cta: frontMatter.cta,
    ctaLink: frontMatter.ctaLink,
  };
}

// IOMETE blog posts use a custom `tags2` frontmatter field (not the standard
// `tags`) and the blog has no `editUrl`. The default BlogPostItem/Footer
// early-returns `null` when there are no standard tags / editUrl, which also
// hides the "Last updated" line even though `showLastUpdateTime` is enabled
// and `lastUpdatedAt` is computed. This wrapper renders the original footer,
// then appends the Last-updated row (above the pagination) whenever the
// original footer would have skipped it.
export default function FooterWrapper(props) {
  const { metadata, frontMatter, isBlogPostPage } = useBlogPost();
  const { tags, editUrl, hasTruncateMarker, lastUpdatedAt, lastUpdatedBy } =
    metadata;

  const tagsExists = tags.length > 0;
  const truncatedPost = !isBlogPostPage && hasTruncateMarker;
  // Mirrors the default footer's render guard so we only step in when it bails.
  const originalRendersFooter = tagsExists || truncatedPost || !!editUrl;

  const showLastUpdated =
    isBlogPostPage && !originalRendersFooter && (lastUpdatedAt || lastUpdatedBy);

  const isBlogPost =
    isBlogPostPage && (metadata.permalink || "").startsWith(BLOG_PATH);
  const post = isBlogPost ? toIndexShape(metadata, frontMatter || {}) : null;

  return (
    <>
      {post && (
        <>
          <BlogCTA post={post} />
          <RelatedPosts current={post} />
        </>
      )}
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
