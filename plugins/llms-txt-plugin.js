const fs = require("fs");
const path = require("path");

const SITE_URL = "https://iomete.com/resources";

const HEADER = `# IOMETE — Complete Documentation Index

> IOMETE is a Kubernetes-native, self-hosted sovereign data lakehouse platform built on Apache Spark and Apache Iceberg. It runs entirely within customer infrastructure — on-premises, private cloud, or public cloud VPC — so data never leaves the organization's trust perimeter by design.

This is the auto-generated full documentation index. For a curated overview with detailed descriptions, blog index, and FAQ, see [llms.txt](https://iomete.com/resources/llms.txt).
`;

function resolveDocUrl(docId) {
  const normalized = docId.replace(/\/index$/, "");
  return `${SITE_URL}/${normalized}`;
}

function readFrontmatter(docsDir, docId) {
  const candidates = [
    path.join(docsDir, `${docId}.md`),
    path.join(docsDir, `${docId}.mdx`),
    path.join(docsDir, docId, "index.md"),
    path.join(docsDir, docId, "index.mdx"),
  ];

  let filePath;
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      filePath = c;
      break;
    }
  }
  if (!filePath) return null;

  const content = fs.readFileSync(filePath, "utf-8");
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const fm = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w[\w_-]*):\s*(.+)/);
    if (kv) fm[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return fm;
}

function buildLinkLine(docsDir, docId) {
  const fm = readFrontmatter(docsDir, docId);
  const title = fm?.sidebar_label || fm?.title || docId.split("/").pop();
  const description = fm?.description || "";
  const url = resolveDocUrl(docId);

  if (description) {
    return `- [${title}](${url}): ${description}`;
  }
  return `- [${title}](${url})`;
}

function flattenItems(items, docsDir) {
  const links = [];
  for (const item of items) {
    if (typeof item === "string") {
      links.push(buildLinkLine(docsDir, item));
    } else if (item.type === "category") {
      links.push(...flattenItems(item.items || [], docsDir));
    }
  }
  return links;
}

function processSidebarItems(items, docsDir) {
  const sections = [];

  for (const item of items) {
    if (typeof item === "string") {
      const lastSection = sections[sections.length - 1];
      if (lastSection) {
        lastSection.links.push(buildLinkLine(docsDir, item));
      }
    } else if (item.type === "category") {
      const section = {
        label: item.label,
        links: flattenItems(item.items || [], docsDir),
      };
      if (section.links.length > 0) {
        sections.push(section);
      }
    }
  }

  return sections;
}

function generateLlmsFullTxt(allSections) {
  let md = HEADER;

  for (const section of allSections) {
    md += `\n## ${section.label}\n\n`;
    md += section.links.join("\n") + "\n";
  }

  return md;
}

function llmsTxtPlugin(context) {
  return {
    name: "docusaurus-plugin-llms-txt",

    configureWebpack() {
      return {
        module: {
          rules: [
            {
              test: /\.txt$/,
              type: "asset/resource",
            },
          ],
        },
      };
    },

    async postBuild({ siteDir, outDir }) {
      // Read sidebars.js content and parse it
      const sidebarsPath = path.join(siteDir, "sidebars.js");
      const sidebarsContent = fs.readFileSync(sidebarsPath, "utf-8");

      // Strip ESM syntax and evaluate as plain object
      const cleaned = sidebarsContent
        .replace(/\/\*[\s\S]*?\*\//g, "") // remove block comments
        .replace(/\/\/.*$/gm, "") // remove line comments
        .replace(/export\s+default\s+sidebars\s*;?\s*$/m, "") // remove ESM export
        .replace(/^const\s+sidebars\s*=\s*/m, "module.exports = "); // convert to CJS

      // Write to a temp file and require it
      const tmpPath = path.join(outDir, "_sidebars_tmp.js");
      fs.writeFileSync(tmpPath, cleaned);

      let sidebars;
      try {
        sidebars = require(tmpPath);
      } catch (e) {
        console.error("[llms-txt] Failed to parse sidebars.js:", e.message);
        return;
      } finally {
        fs.unlinkSync(tmpPath);
      }

      const docsDir = path.join(siteDir, "docs");
      const allSections = [];

      for (const [, sidebarItems] of Object.entries(sidebars)) {
        const sections = processSidebarItems(sidebarItems, docsDir);
        allSections.push(...sections);
      }

      // Only generate llms-full.txt (llms.txt is manually curated in static/)
      const llmsFullTxt = generateLlmsFullTxt(allSections);
      fs.writeFileSync(path.join(outDir, "llms-full.txt"), llmsFullTxt);

      console.log(
        `[llms-txt] Generated llms-full.txt (${allSections.length} sections)`
      );
    },
  };
}

module.exports = llmsTxtPlugin;
