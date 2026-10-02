/**
 * Remark plugin that adds <Release> elements to the right-hand table of
 * contents of release-notes pages.
 *
 * <Release> renders its version heading as JSX, and Docusaurus only collects
 * markdown headings into the TOC, so these pages would otherwise list no
 * releases. On a page with top-level <Release> elements, this plugin replaces
 * the `toc` export with the page's top-level markdown headings, followed by
 * the releases grouped by product (or by version line on single-product
 * pages). Headings inside a <Release> are left out, so the TOC lists versions
 * rather than every heading in every release.
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

function releaseInfo(node) {
  const version = getAttribute(node, "version");
  if (!version) return null;
  const name = getAttribute(node, "name");
  const date = getAttribute(node, "date");
  return {
    name,
    version,
    id: name
      ? `${name.toLowerCase().replace(/\s+/g, "-")}-v${version}`
      : `v${version}`,
    label: `v${escapeHtml(version)}`,
    dateHtml: date
      ? `<span class="release-toc-date">${escapeHtml(formatDate(date))}</span>`
      : "",
  };
}

// "3.19.1" -> "v3.19", "3.5.7-v7" -> "v3.5". Falls back to the full version.
function versionLine(version) {
  const match = /^(\d+)\.(\d+)/.exec(version);
  return match ? `v${match[1]}.${match[2]}` : `v${version}`;
}

// Groups releases for the TOC, keeping first-appearance order (pages list
// releases newest first). A page with several products groups by product name;
// a single-product page groups by version line.
function groupReleases(releases) {
  const multiProduct = new Set(releases.map((r) => r.name)).size > 1;
  const groups = new Map();
  for (const release of releases) {
    const key = multiProduct ? release.name : versionLine(release.version);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(release);
  }
  return [...groups].map(([key, items]) => ({ label: escapeHtml(key), items }));
}

function plugin() {
  return async (root) => {
    if (!root.children.some(isRelease)) return;

    const { toString } = await import("mdast-util-to-string");
    const tocItems = [];
    const releases = [];
    for (const node of root.children) {
      if (node.type === "heading" && node.depth >= 2 && node.depth <= 3 && node.data?.id) {
        tocItems.push({
          value: escapeHtml(toString(node)),
          id: node.data.id,
          level: node.depth,
        });
      } else if (isRelease(node)) {
        const release = releaseInfo(node);
        if (release) releases.push(release);
      }
    }

    // A group has no heading of its own, so it links to its newest release.
    // Groups sit at level 2 and releases at level 3: Docusaurus hides TOC
    // levels below 3 by default.
    for (const group of groupReleases(releases)) {
      tocItems.push({ value: group.label, id: group.items[0].id, level: 2 });
      for (const release of group.items) {
        tocItems.push({ value: release.label + release.dateHtml, id: release.id, level: 3 });
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
