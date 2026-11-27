/**
 * Remark plugin that appends the 60-day free trial banner to blog posts and
 * docs pages (see src/components/TrialBanner).
 *
 * Blog posts: the banner closes the article, above the FAQ accordion when
 * there is one. It is an addition to the slim in-article CTA placed by
 * plugins/remark-blog-cta.js, which stays as it is.
 *
 * Docs pages (docs/ only): the banner goes after the last block, above the
 * previous/next pagination, so it never interrupts a task. The user guide is
 * read by people who already run IOMETE and is not registered for this plugin.
 *
 * Skipped when:
 *   - the page already places a DemoCta or TrialBanner by hand,
 *   - the page is a glossary entry, a release-notes page or a per-version
 *     release page,
 *   - the page is a partial (_name.md),
 *   - the page is shorter than the minimum word count (index and stub pages),
 *   - frontmatter sets `trial_banner: false`.
 */

const path = require("path");

const DOCS_DIR = `${path.sep}docs${path.sep}`;
const BLOG_DIR = `${path.sep}blog${path.sep}`;
// Release notes and per-version install pages are read by existing customers.
const RELEASE_DIR = /[\\/]release(s|-notes)[\\/]/;
const MIN_WORDS = { docs: 150, blog: 400 };
const IMPORT_SOURCE = "@site/src/components/TrialBanner";
const MANUAL_CTAS = new Set(["DemoCta", "TrialBanner"]);

function filePathOf(file) {
  return (file && (file.path || file.history?.[0])) || "";
}

function placementOf(filePath) {
  if (filePath.includes("glossary")) return null;
  if (filePath.includes(BLOG_DIR)) return "blog";
  if (filePath.includes(DOCS_DIR) && !RELEASE_DIR.test(filePath)) {
    return "docs";
  }
  return null;
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

// Value for the tracking query: the frontmatter slug when the page sets one,
// otherwise the file name without extension and blog date prefix.
function pageId(filePath, frontMatter) {
  const slug = typeof frontMatter?.slug === "string" ? frontMatter.slug : "";
  const fromSlug = slug.replace(/^\/+|\/+$/g, "").split("/").pop();
  if (fromSlug) return fromSlug;
  let name = path.basename(filePath).replace(/\.mdx?$/, "");
  if (name === "index") name = path.basename(path.dirname(filePath));
  return name.replace(/^\d{4}-\d{2}-\d{2}-/, "");
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

function bannerNode(placement, page) {
  return {
    type: "mdxJsxFlowElement",
    name: "TrialBanner",
    attributes: [
      { type: "mdxJsxAttribute", name: "placement", value: placement },
      { type: "mdxJsxAttribute", name: "page", value: page },
    ],
    children: [],
  };
}

module.exports = function remarkTrialBanner() {
  return (tree, file) => {
    const filePath = filePathOf(file);
    const placement = placementOf(filePath);
    if (!placement) return;
    if (!Array.isArray(tree.children)) return;
    // Partials (_name.md) are imported into other pages, never routed.
    if (path.basename(filePath).startsWith("_")) return;
    const frontMatter = file.data?.frontMatter;
    if (frontMatter?.trial_banner === false) return;
    if (hasManualCta(tree)) return;
    if (countWords(tree) < MIN_WORDS[placement]) return;

    const banner = bannerNode(placement, pageId(filePath, frontMatter));
    const faqAt = tree.children.findIndex(
      (n) => n.type === "mdxJsxFlowElement" && n.name === "FAQSection"
    );
    if (placement === "blog" && faqAt >= 0) {
      tree.children.splice(faqAt, 0, banner);
    } else {
      tree.children.push(banner);
    }
    tree.children.unshift(importNode());
  };
};
