/**
 * Remark plugin that appends the 60-day free trial banner to docs pages.
 *
 * Only pages under docs/ get it. The user guide is read by people who already
 * run IOMETE, and the blog has its own mid-article placement
 * (plugins/remark-blog-cta.js). The banner goes after the last block, above
 * the previous/next pagination, so it never interrupts a task.
 *
 * Skipped when:
 *   - the page already places a CTA by hand (DemoCta, TrialBanner, BlogCTA),
 *   - the page is a release-notes page (read by existing customers),
 *   - the page is shorter than MIN_WORDS (index and stub pages),
 *   - frontmatter sets `trial_banner: false`.
 */

const path = require("path");

const DOCS_DIR = `${path.sep}docs${path.sep}`;
const RELEASE_NOTES_DIR = `${path.sep}release-notes${path.sep}`;
const MIN_WORDS = 150;
const IMPORT_SOURCE = "@site/src/components/TrialBanner";
const MANUAL_CTAS = new Set(["DemoCta", "TrialBanner", "BlogCTA"]);

function filePathOf(file) {
  return (file && (file.path || file.history?.[0])) || "";
}

function countWords(node) {
  if (!node) return 0;
  if (node.type === "mdxjsEsm" || node.type === "yaml" || node.type === "toml") {
    return 0;
  }
  let n = 0;
  if (typeof node.value === "string") {
    const m = node.value.match(/[\p{L}\p{N}][\p{L}\p{N}'’_.-]*/gu);
    n += m ? m.length : 0;
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) n += countWords(child);
  }
  return n;
}

function hasManualCta(node) {
  if (!node) return false;
  if (
    (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
    MANUAL_CTAS.has(node.name)
  ) {
    return true;
  }
  return Array.isArray(node.children) && node.children.some(hasManualCta);
}

function importNode() {
  return {
    type: "mdxjsEsm",
    value: `import TrialBanner from "${IMPORT_SOURCE}";`,
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
                local: { type: "Identifier", name: "TrialBanner" },
              },
            ],
            source: {
              type: "Literal",
              value: IMPORT_SOURCE,
              raw: `"${IMPORT_SOURCE}"`,
            },
          },
        ],
      },
    },
  };
}

function bannerNode(page) {
  return {
    type: "mdxJsxFlowElement",
    name: "TrialBanner",
    attributes: [
      { type: "mdxJsxAttribute", name: "placement", value: "docs" },
      { type: "mdxJsxAttribute", name: "page", value: page },
    ],
    children: [],
  };
}

module.exports = function remarkDocsTrialBanner() {
  return (tree, file) => {
    const filePath = filePathOf(file);
    if (!filePath.includes(DOCS_DIR)) return;
    if (filePath.includes(RELEASE_NOTES_DIR)) return;
    if (!Array.isArray(tree.children)) return;
    // Partials (_name.md) are imported into other pages, never routed.
    if (path.basename(filePath).startsWith("_")) return;
    if (file.data?.frontMatter?.trial_banner === false) return;
    if (hasManualCta(tree)) return;
    if (countWords(tree) < MIN_WORDS) return;

    const page = path.basename(filePath).replace(/\.mdx?$/, "");
    tree.children.push(bannerNode(page));
    tree.children.unshift(importNode());
  };
};
