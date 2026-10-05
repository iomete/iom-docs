/**
 * Remark plugin that places the in-article CTA in the MIDDLE of a blog post.
 *
 * A CTA appended after the last paragraph is read by almost nobody: most
 * readers leave a long post well before the footer. This plugin injects a
 * single slim `<BlogCTA />` node into the body itself, at ~45% of the post's
 * words, so the ask arrives while the reader is still engaged. The block is
 * deliberately narrow (see BlogCTA/style.scss) so it reads as a rule in the
 * text flow, not as a banner.
 *
 * Only blog posts get it. The glossary and the docs share remark config but
 * are not conversion surfaces, so they are skipped by path. Very short posts
 * (fewer than MIN_WORDS words) are skipped too: there is no "middle" to speak
 * of and the CTA would sit next to the intro.
 *
 * Position is measured in words, not in top-level AST nodes. One node can be a
 * one-line paragraph or a whole JSX component, so node counts drifted from 4%
 * to 88% of the text. Each top-level node is weighed by the words it renders,
 * and the CTA goes on the safe block boundary closest to the 45% mark.
 */

const path = require("path");

const BLOG_DIR = `${path.sep}blog${path.sep}`;
const MIN_WORDS = 400;
const TARGET_RATIO = 0.45;
// Candidate boundaries must leave 30-65% of the words above the CTA.
const MIN_RATIO = 0.3;
const MAX_RATIO = 0.65;
// A heading boundary wins over a plain paragraph boundary unless the paragraph
// sits this much closer to the target.
const HEADING_BONUS = 0.08;
// Other block boundaries (lists, tables, JSX) lose to paragraphs by this much.
const BLOCK_PENALTY = 0.04;
const IMPORT_SOURCE = "@site/src/components/BlogCTA";

function isBlogPost(file) {
  const filePath = file && (file.path || file.history?.[0]);
  if (!filePath) return false;
  return filePath.includes(BLOG_DIR) && !filePath.includes("glossary");
}

function hasImport(tree) {
  return tree.children.some(
    (node) =>
      node.type === "mdxjsEsm" &&
      typeof node.value === "string" &&
      node.value.includes(IMPORT_SOURCE)
  );
}

function importNode() {
  const value = `import BlogCTA from "${IMPORT_SOURCE}";`;
  return {
    type: "mdxjsEsm",
    value,
    data: {
      estree: {
        type: "Program",
        sourceType: "module",
        body: [
          {
            type: "ImportDeclaration",
            specifiers: [
              {
                type: "ImportDefaultSpecifier",
                local: { type: "Identifier", name: "BlogCTA" },
              },
            ],
            source: { type: "Literal", value: IMPORT_SOURCE, raw: `"${IMPORT_SOURCE}"` },
          },
        ],
      },
    },
  };
}

function ctaNode() {
  return {
    type: "mdxJsxFlowElement",
    name: "BlogCTA",
    attributes: [],
    children: [],
  };
}

function countWords(text) {
  const m = String(text).match(/[\p{L}\p{N}][\p{L}\p{N}'’_.-]*/gu);
  return m ? m.length : 0;
}

// Words in string literals inside a JSX expression attribute, e.g. text
// passed to a card component as props rather than as children.
function expressionWords(value) {
  if (typeof value !== "string") return 0;
  let n = 0;
  for (const m of value.matchAll(/(["'`])((?:\\.|(?!\1).)*)\1/gs)) {
    n += countWords(m[2]);
  }
  return n;
}

/** Words a node renders: text, code, JSX children and JSX string props. */
function nodeWords(node) {
  if (!node) return 0;
  if (["mdxjsEsm", "yaml", "toml", "html"].includes(node.type)) return 0;
  if (node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") {
    return 0; // comments such as {/* truncate */}
  }
  let n = 0;
  if (typeof node.value === "string") {
    n += countWords(node.value);
  }
  if (Array.isArray(node.attributes)) {
    for (const attr of node.attributes) {
      if (typeof attr.value === "string") {
        if (attr.name === "alt" || attr.name === "title") n += countWords(attr.value);
      } else if (attr.value && typeof attr.value.value === "string") {
        n += expressionWords(attr.value.value);
      }
    }
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) n += nodeWords(child);
  }
  return n;
}

function isTruncateMarker(node) {
  return (
    node &&
    (node.type === "mdxFlowExpression" || node.type === "html") &&
    typeof node.value === "string" &&
    /truncate/.test(node.value)
  );
}

function isFaqSection(node) {
  return node && node.type === "mdxJsxFlowElement" && node.name === "FAQSection";
}

/**
 * Pick the insertion index. Index i means "insert before children[i]", so the
 * words above the CTA are the sum of children[0..i-1].
 *
 * Safe boundaries: after the truncate marker (so the CTA never shows in blog
 * list excerpts), not directly under a heading (a heading must keep its first
 * paragraph), and never after the last content block or inside the FAQ.
 * Headings are preferred, then paragraph-to-paragraph breaks, then any other
 * block boundary. Returns -1 if nothing fits the window.
 */
function insertionIndex(children) {
  // The FAQ accordion is a collapsed appendix (answers render at height 0), so
  // the "article" ends where it starts. Its words do not count, and the CTA
  // always lands above it.
  const faqAt = children.findIndex(isFaqSection);
  const bodyEnd = faqAt < 0 ? children.length : faqAt;
  const words = children.map((n, i) => (i < bodyEnd ? nodeWords(n) : 0));
  const total = words.reduce((a, b) => a + b, 0);
  if (total < MIN_WORDS) return -1;

  const truncateAt = children.findIndex(isTruncateMarker);
  const firstAllowed = Math.max(1, truncateAt + 1);

  // Last node that renders words: nothing goes after it.
  let lastContent = children.length - 1;
  while (lastContent > 0 && words[lastContent] === 0) lastContent -= 1;

  const prefix = [0];
  for (const w of words) prefix.push(prefix[prefix.length - 1] + w);

  let best = null;
  for (let i = firstAllowed; i <= lastContent; i += 1) {
    const prev = children[i - 1];
    const next = children[i];
    if (prev.type === "heading") continue;
    if (prev.type === "mdxjsEsm" || isTruncateMarker(prev)) continue;

    const isHeading = next.type === "heading" && next.depth <= 3;
    const isParagraph = next.type === "paragraph" && prev.type === "paragraph";

    const ratio = prefix[i] / total;
    if (ratio < MIN_RATIO || ratio > MAX_RATIO) continue;

    // Any other top-level boundary (list, table, image, JSX block) is still a
    // clean break between blocks, just a less natural one.
    let score = Math.abs(ratio - TARGET_RATIO);
    if (isHeading) score -= HEADING_BONUS + (next.depth === 2 ? 0.01 : 0);
    else if (!isParagraph) score += BLOCK_PENALTY;
    if (!best || score < best.score) best = { index: i, score };
  }
  return best ? best.index : -1;
}

module.exports = function remarkBlogCTA() {
  return (tree, file) => {
    if (!isBlogPost(file)) return;
    if (!Array.isArray(tree.children)) return;

    // Already placed by hand in the MDX: respect the author's position.
    const manual = tree.children.some(
      (n) =>
        n.type === "mdxJsxFlowElement" &&
        (n.name === "BlogCTA" || n.name === "DemoCta")
    );
    if (manual) return;

    const index = insertionIndex(tree.children);
    if (index < 0) return;
    tree.children.splice(index, 0, ctaNode());

    if (!hasImport(tree)) tree.children.unshift(importNode());
  };
};
