const fs = require("fs");
const path = require("path");

// Build-time index of every blog post's frontmatter, exposed as plugin global
// data so client components (RelatedPosts) can rank siblings without an API
// call. Docusaurus gives a blog post no access to its siblings, and reading
// `blog/` from a component is impossible (browser bundle, no fs), so the read
// happens here, once, during the build.
//
// Frontmatter is parsed with a deliberately small parser (the same approach as
// plugins/llms-txt-plugin.js) instead of pulling in a YAML dep: it handles the
// three shapes the blog actually uses — scalars, inline `[a, b]` lists and
// dash lists.

const LIST_KEYS = new Set(["keywords", "tags2", "tags", "authors"]);

function stripQuotes(value) {
  return value.trim().replace(/^["']|["']$/g, "");
}

function parseFrontmatter(raw) {
  const fm = {};
  const lines = raw.split("\n");
  let listKey = null;

  for (const line of lines) {
    const dashItem = line.match(/^\s+-\s+(.*)$/);
    if (listKey && dashItem) {
      fm[listKey].push(stripQuotes(dashItem[1]));
      continue;
    }

    const kv = line.match(/^([\w][\w_-]*):\s*(.*)$/);
    if (!kv) continue;
    const [, key, rest] = kv;
    listKey = null;

    if (rest === "" && LIST_KEYS.has(key)) {
      // A dash list follows on the next lines.
      fm[key] = [];
      listKey = key;
      continue;
    }

    const inlineList = rest.match(/^\[(.*)\]$/);
    if (inlineList) {
      fm[key] = inlineList[1]
        .split(",")
        .map(stripQuotes)
        .filter(Boolean);
      continue;
    }

    if (rest !== "") fm[key] = stripQuotes(rest);
  }

  return fm;
}

function slugFromFilename(filename) {
  // Mirror Docusaurus' default blog slug for posts with no `slug:` frontmatter:
  // `<YYYY>/<MM>/<DD>/<name>` when the filename carries a date prefix, the
  // bare name otherwise. Only two posts lack `slug:`, and guessing the bare
  // name for the dated one broke the build with 404 related-post links.
  const name = filename.replace(/\.mdx?$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
  const fromFilename = filename.match(/^(\d{4})-(\d{2})-(\d{2})-/);
  if (fromFilename) {
    const [, y, m, d] = fromFilename;
    return `${y}/${m}/${d}/${name}`;
  }
  return name;
}

function toList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function readPosts(blogDir) {
  if (!fs.existsSync(blogDir)) return [];

  return fs
    .readdirSync(blogDir)
    .filter((f) => /\.mdx?$/.test(f))
    .map((filename) => {
      const source = fs.readFileSync(path.join(blogDir, filename), "utf-8");
      const match = source.match(/^---\n([\s\S]*?)\n---/);
      if (!match) return null;

      const fm = parseFrontmatter(match[1]);
      if (!fm.title) return null;

      const dateString = fm.date || filename.slice(0, 10).replace(/-/g, "/");
      const timestamp = Date.parse(dateString);

      return {
        slug: fm.slug ? fm.slug.replace(/^\//, "") : slugFromFilename(filename),
        title: fm.title,
        description: fm.description || fm.banner_description || "",
        keywords: toList(fm.keywords).map((k) => k.toLowerCase()),
        tags: toList(fm.tags2).map((t) => t.toLowerCase()),
        coverImage: fm.coverImage || "",
        date: Number.isNaN(timestamp) ? 0 : timestamp,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.date - a.date);
}

module.exports = function blogIndexPlugin(context) {
  return {
    name: "blog-index",

    async loadContent() {
      return readPosts(path.join(context.siteDir, "blog"));
    },

    async contentLoaded({ content, actions }) {
      actions.setGlobalData({ posts: content });
    },
  };
};
