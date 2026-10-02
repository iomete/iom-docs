/**
 * Remark plugin that adds <Release> elements to the right-hand table of
 * contents of release-notes pages.
 *
 * <Release> renders its version heading as JSX, and Docusaurus only collects
 * markdown headings into the TOC, so these pages would otherwise list no
 * releases. On a page with top-level <Release> elements, this plugin replaces
 * the `toc` export with the page's top-level markdown headings plus one entry
 * per release, in document order. A release that follows a `##` heading is
 * nested under it. Headings inside a <Release> are left out, so the TOC lists
 * versions rather than every heading in every release.
 *
 * It must run after the default remark plugins (`remarkPlugins`, not
 * `beforeDefaultRemarkPlugins`): it reads the heading ids those plugins assign
 * and replaces the `toc` export they emit.
 *
 * The label and id rules mirror src/components/Release/index.jsx, so each TOC
 * link targets the heading the component renders. Keep the two in sync.
 */

const TOC_EXPORT_NAME = "toc";

function getAttribute(node, name) {
  const attribute = node.attributes.find(
    (attr) => attr.type === "mdxJsxAttribute" && attr.name === name
  );
  return typeof attribute?.value === "string" ? attribute.value : undefined;
}

// TOC values are rendered as HTML, so text from the source must be escaped.
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Release dates are authored in mixed styles ("Apr 9, 2025", "August 5th, 2026").
// Normalize them to one short form for the narrow sidebar, and fall back to the
// authored text when it doesn't parse.
function formatDate(date) {
  const parsed = new Date(date.replace(/(\d+)(st|nd|rd|th)\b/, "$1"));
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isRelease(node) {
  return node.type === "mdxJsxFlowElement" && node.name === "Release";
}

function isTocExport(node) {
  const declaration = node.data?.estree?.body?.[0]?.declaration;
  return (
    node.type === "mdxjsEsm" &&
    declaration?.type === "VariableDeclaration" &&
    declaration.declarations[0]?.id?.name === TOC_EXPORT_NAME
  );
}

function releaseTocItem(node, level) {
  const version = getAttribute(node, "version");
  if (!version) return null;
  const name = getAttribute(node, "name");
  const date = getAttribute(node, "date");
  const label = escapeHtml(name ? `${name} - v${version}` : `v${version}`);
  return {
    value: date
      ? `${label}<span class="release-toc-date">${escapeHtml(formatDate(date))}</span>`
      : label,
    id: name
      ? `${name.toLowerCase().replace(/\s+/g, "-")}-v${version}`
      : `v${version}`,
    level,
  };
}

function plugin() {
  return async (root) => {
    if (!root.children.some(isRelease)) return;

    const { toString } = await import("mdast-util-to-string");
    const tocItems = [];
    let underHeading = false;
    for (const node of root.children) {
      if (node.type === "heading" && node.depth >= 2 && node.depth <= 3 && node.data?.id) {
        tocItems.push({
          value: escapeHtml(toString(node)),
          id: node.data.id,
          level: node.depth,
        });
        if (node.depth === 2) underHeading = true;
      } else if (isRelease(node)) {
        const item = releaseTocItem(node, underHeading ? 3 : 2);
        if (item) tocItems.push(item);
      }
    }

    const { valueToEstree } = await import("estree-util-value-to-estree");
    root.children = root.children.filter((node) => !isTocExport(node));
    root.children.push({
      type: "mdxjsEsm",
      value: "",
      data: {
        estree: {
          type: "Program",
          sourceType: "module",
          body: [
            {
              type: "ExportNamedDeclaration",
              specifiers: [],
              source: null,
              declaration: {
                type: "VariableDeclaration",
                kind: "const",
                declarations: [
                  {
                    type: "VariableDeclarator",
                    id: { type: "Identifier", name: TOC_EXPORT_NAME },
                    init: valueToEstree(tocItems),
                  },
                ],
              },
            },
          ],
        },
      },
    });
  };
}

module.exports = plugin;
