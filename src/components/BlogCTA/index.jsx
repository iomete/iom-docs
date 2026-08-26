import React from "react";
import Link from "@docusaurus/Link";
import { VARIANTS, selectVariant, withUtm } from "./variants";
import "./style.scss";

/**
 * In-article call to action, rendered automatically at the end of every blog
 * post by src/theme/BlogPostItem/Footer. Variant copy lives in variants.js.
 */
export default function BlogCTA({ post = {}, variant }) {
  const key = variant && VARIANTS[variant] ? variant : selectVariant(post);
  const content = VARIANTS[key];
  if (!content) return null;

  const primaryHref = withUtm(post.ctaLink || content.primary.href, post.slug);
  const secondaryHref = content.secondary
    ? withUtm(content.secondary.href, post.slug)
    : null;

  return (
    <aside className={`blog-cta blog-cta--${key}`} data-cta-variant={key}>
      <p className="blog-cta__eyebrow">{content.eyebrow}</p>
      <h2 className="blog-cta__heading">{content.heading}</h2>
      <p className="blog-cta__body">{content.body}</p>
      <div className="blog-cta__actions">
        <Link className="blog-cta__primary" to={primaryHref}>
          {content.primary.label}
        </Link>
        {secondaryHref && (
          <Link className="blog-cta__secondary" to={secondaryHref}>
            {content.secondary.label}
          </Link>
        )}
      </div>
    </aside>
  );
}
