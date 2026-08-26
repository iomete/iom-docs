import React from "react";
import Link from "@docusaurus/Link";
import { usePluginData } from "@docusaurus/useGlobalData";
import "../BlogCTA/style.scss";

const MAX_ITEMS = 3;

const STOPWORDS = new Set(
  ("the a an and or of for to in on with without your you we our it is are be by" +
    " what why how when which that this these those from as at into over under" +
    " guide post blog iomete data using use vs versus can does do not more most" +
    " about across after before between during than then there here its their")
    .split(" ")
);

const MIN_SCORE = 2;

function tokenize(text) {
  return new Set(
    String(text)
      .toLowerCase()
      .split(/[^a-z0-9+]+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w))
  );
}

function topicTokens(post) {
  return tokenize(
    [post.title, post.description, (post.keywords || []).join(" ")].join(" ")
  );
}

function overlap(a, b) {
  let hits = 0;
  b.forEach((token) => {
    if (a.has(token)) hits += 1;
  });
  return hits;
}

/**
 * Ranks sibling posts by topical overlap, so a reader who finishes one post has
 * an obvious second one. Only 8 of 116 posts declare `keywords` and `tags2` is
 * coarse (most posts are Technical/Educational), so the primary signal is
 * significant-word overlap in title + description; keywords weigh more when
 * present and tags only break ties.
 *
 * The index comes from plugins/blog-index-plugin.js — Docusaurus gives a post
 * no view of its siblings on its own.
 */
function rank(posts, current) {
  const currentTokens = topicTokens(current);
  const currentKeywords = new Set(
    (current.keywords || []).map((k) => k.toLowerCase())
  );
  const currentTags = new Set((current.tags || []).map((t) => t.toLowerCase()));

  return posts
    .filter((p) => p.slug && p.slug !== current.slug)
    .map((p) => {
      const keywordHits = (p.keywords || []).filter((k) =>
        currentKeywords.has(k)
      ).length;
      const tagHits = (p.tags || []).filter((t) => currentTags.has(t)).length;
      const tokenHits = overlap(currentTokens, topicTokens(p));
      return {
        post: p,
        score: keywordHits * 3 + tokenHits + tagHits * 0.5,
      };
    })
    .filter((entry) => entry.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score || b.post.date - a.post.date)
    .slice(0, MAX_ITEMS)
    .map((entry) => entry.post);
}

export default function RelatedPosts({ current }) {
  const data = usePluginData("blog-index");
  const posts = (data && data.posts) || [];
  if (!current || posts.length === 0) return null;

  const related = rank(posts, current);
  if (related.length === 0) return null;

  return (
    <nav className="related-posts" aria-label="Related posts">
      <h2 className="related-posts__heading">Keep reading</h2>
      <ul className="related-posts__list">
        {related.map((post) => (
          <li className="related-posts__item" key={post.slug}>
            <Link className="related-posts__link" to={`/resources/blog/${post.slug}`}>
              <span className="related-posts__title">{post.title}</span>
              {post.description && (
                <span className="related-posts__description">
                  {post.description.length > 110
                    ? `${post.description.slice(0, 107)}…`
                    : post.description}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
