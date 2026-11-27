/**
 * Remark plugin that appends the 60-day free trial banner to blog posts and
 * docs pages (see src/components/TrialBanner).
 *
 * Blog posts: the banner closes the article, above the FAQ accordion when
 * there is one. It is an addition to the slim in-article CTA placed by
 * plugins/remark-blog-cta.js, which stays as it is.
 *
 * Docs and user guide pages: the banner goes after the last block, above the
 * previous/next pagination, so it never interrupts a task. Release notes and
 * short pages get it too.
 *
 * Skipped when:
 *   - the page already places a DemoCta or TrialBanner by hand (all of those
 *     sit at the end of the page, so the banner would stack on another CTA),
 *   - the page is a glossary entry,
 *   - the page is a partial (_name.md),
 *   - frontmatter sets `trial_banner: false`.
 */

const path = require("path");

const DOCS_DIR = `${path.sep}docs${path.sep}`;
const BLOG_DIR = `${path.sep}blog${path.sep}`;
const USER_GUIDE_DIR = `${path.sep}user-guide${path.sep}`;
const IMPORT_SOURCE = "@site/src/components/TrialBanner";
const MANUAL_CTAS = new Set(["DemoCta", "TrialBanner"]);

function filePathOf(file) {
  return (file && (file.path || file.history?.[0])) || "";
}

function placementOf(filePath) {
  if (filePath.includes("glossary")) return null;
  if (filePath.includes(BLOG_DIR)) return "blog";
  if (filePath.includes(DOCS_DIR) || filePath.includes(USER_GUIDE_DIR)) {
    return "docs";
  }
  return null;
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
