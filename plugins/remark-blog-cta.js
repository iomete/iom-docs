/**
 * Remark plugin that places the in-article CTA in the MIDDLE of a blog post.
 *
 * A CTA appended after the last paragraph is read by almost nobody: most
 * readers leave a long post well before the footer. This plugin injects a
 * single slim `<BlogCTA />` node into the body itself, at the first h2 that
 * sits past ~45% of the post, so the ask arrives while the reader is still
 * engaged. The block is deliberately narrow (see BlogCTA/style.scss) so it
 * reads as a rule in the text flow, not as a banner.
 *
 * Only blog posts get it. The glossary and the docs share remark config but
 * are not conversion surfaces, so they are skipped by path. Very short posts
 * (fewer than MIN_BLOCKS top-level blocks) are skipped too — there is no
 * "middle" to speak of and the CTA would sit next to the intro.
 */

const path = require("path");

const BLOG_DIR = `${path.sep}blog${path.sep}`;
const MIN_BLOCKS = 8; // roughly 500+ words
const TARGET_RATIO = 0.45;
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

/**
 * Index of the h2 nearest to (and at or after) the target position. Falls back
 * to the nearest earlier h2, then to a plain block boundary at the target, so
 * posts written without subheadings still get a mid-post placement.
 */
function insertionIndex(children) {
  const headings = [];
  children.forEach((node, i) => {
    if (node.type === "heading" && node.depth === 2) headings.push(i);
  });

  const target = Math.floor(children.length * TARGET_RATIO);

  const after = headings.find((i) => i >= target && i < children.length - 2);
  if (after !== undefined) return after;

  const before = [...headings].reverse().find((i) => i > 2);
  if (before !== undefined) return before;

  return Math.min(Math.max(target, 3), children.length - 2);
}

module.exports = function remarkBlogCTA() {
  return (tree, file) => {
    if (!isBlogPost(file)) return;
    if (!Array.isArray(tree.children)) return;

    // Already placed by hand in the MDX: respect the author's position.
    const manual = tree.children.some(
      (n) => n.type === "mdxJsxFlowElement" && n.name === "BlogCTA"
    );
    if (manual) return;

    const blocks = tree.children.filter((n) => n.type !== "mdxjsEsm");
    if (blocks.length < MIN_BLOCKS) return;

    const index = insertionIndex(tree.children);
    tree.children.splice(index, 0, ctaNode());

    if (!hasImport(tree)) tree.children.unshift(importNode());
  };
};
