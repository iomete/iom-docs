import React from "react";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import TrialBanner from "../TrialBanner";
import { FREE_TRIAL_PATH } from "../DemoCta/paths";
import { VARIANTS, selectVariant, withUtm } from "./variants";

const BLOG_PATH = "/resources/blog/";

// Same shape the variant selector expects, derived from the post being rendered.
function toIndexShape(metadata = {}, frontMatter = {}) {
  const slug = (metadata.permalink || "")
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

/**
 * Presentational CTA. Takes the post explicitly, so it can render outside a
 * blog post page (e.g. a preview) without touching blog context.
 */
export function BlogCTAView({ post, variant }) {
  if (!post) return null;

  const key = variant && VARIANTS[variant] ? variant : selectVariant(post);
  const content = VARIANTS[key];
  if (!content) return null;

  const secondary = {
    label: `${content.primary.label} →`,
    href: withUtm(post.ctaLink || content.primary.href, post.slug),
  };

  return (
    <div className={`blog-cta blog-cta--${key}`} data-cta-variant={key}>
      <TrialBanner
        placement="blog"
        href={withUtm(FREE_TRIAL_PATH, post.slug)}
        secondary={secondary}
      />
    </div>
  );
}

/**
 * In-article call to action. Placed mid-post by plugins/remark-blog-cta.js
 * (or by hand in MDX). It renders the 60-day free trial banner; the post's
 * variant (see ./variants.js) supplies the secondary link beside the button.
 *
 * Both placements render inside the blog post body, so BlogPostProvider is
 * always present and the hook is called unconditionally at the top level.
 * Use BlogCTAView to render with an explicit post outside that provider.
 */
export default function BlogCTA({ variant }) {
  const { metadata, frontMatter } = useBlogPost();
  return (
    <BlogCTAView post={toIndexShape(metadata, frontMatter)} variant={variant} />
  );
}
