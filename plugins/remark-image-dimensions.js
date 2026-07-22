/**
 * Remark plugin that rewrites <Img src="/img/..."> usages (our custom MDX
 * image component) at build time. For every Img with a literal src under
 * static/ it:
 *
 * 1. Injects intrinsic `width`/`height` attributes so the browser reserves
 *    space before the image loads (CLS fix). Docusaurus core does the same
 *    for plain markdown `![]()` images. Author-provided width/height win.
 *
 * 2. Replaces the string src with a STATIC `require("@site/static/...")`
 *    expression, and adds a `darkSrc` require when a `-dark` variant file
 *    exists. The Img component previously did `require("@site/static" + src)`
 *    at runtime — a dynamic require, which forces webpack to bundle a context
 *    map of EVERY file under static/ (~1600 entries, ~1 MB) into every page
 *    chunk. Static requires keep the per-page chunk down to that page's own
 *    images and let webpack emit content-hashed URLs (1-year immutable
 *    cache), matching how core handles markdown images.
 *
 * A missing image file fails the build with a readable error — same outcome
 * as the old runtime require, which also threw at build time, just harder to
 * trace.
 */

const path = require("path");
const fs = require("fs");
const { imageSizeFromFile } = require("image-size/fromFile");

const STATIC_DIR = path.join(__dirname, "..", "static");

// One cache per build process: many pages reuse the same screenshots.
const dimensionsCache = new Map();

async function getDimensions(filePath) {
  if (!dimensionsCache.has(filePath)) {
    dimensionsCache.set(
      filePath,
      imageSizeFromFile(filePath).catch(() => null)
    );
  }
  return dimensionsCache.get(filePath);
}

function getAttribute(node, name) {
  return (node.attributes || []).find(
    (a) => a.type === "mdxJsxAttribute" && a.name === name
  );
}

function toDarkVariant(src) {
  return src.replace(/(\.[^.]+)$/, "-dark$1");
}

// mdxJsxAttribute whose value is the expression `require("<request>").default`
function requireAttribute(name, request) {
  const expr = `require(${JSON.stringify(request)}).default`;
  return {
    type: "mdxJsxAttribute",
    name,
    value: {
      type: "mdxJsxAttributeValueExpression",
      value: expr,
      data: {
        estree: {
          type: "Program",
          sourceType: "module",
          comments: [],
          body: [
            {
              type: "ExpressionStatement",
              expression: {
                type: "MemberExpression",
                object: {
                  type: "CallExpression",
                  callee: { type: "Identifier", name: "require" },
                  arguments: [
                    {
                      type: "Literal",
                      value: request,
                      raw: JSON.stringify(request),
                    },
                  ],
                  optional: false,
                },
                property: { type: "Identifier", name: "default" },
                computed: false,
                optional: false,
              },
            },
          ],
        },
      },
    },
  };
}

async function processNode(node, sourceFilePath) {
  const srcAttr = getAttribute(node, "src");
  if (!srcAttr || typeof srcAttr.value !== "string") return;
  const src = srcAttr.value;
  if (!src.startsWith("/")) return;

  const filePath = path.join(STATIC_DIR, decodeURIComponent(src));
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `<Img src="${src}"> in ${sourceFilePath} does not resolve to a file under static/`
    );
  }

  // 1. Intrinsic dimensions (skip if the author set either one).
  if (!getAttribute(node, "width") && !getAttribute(node, "height")) {
    const size = await getDimensions(filePath);
    if (size && size.width && size.height) {
      node.attributes.push(
        { type: "mdxJsxAttribute", name: "width", value: String(size.width) },
        { type: "mdxJsxAttribute", name: "height", value: String(size.height) }
      );
    }
  }

  // 2. Static requires for the image and its optional -dark variant.
  const darkSrc = toDarkVariant(src);
  const hasDark =
    darkSrc !== src &&
    fs.existsSync(path.join(STATIC_DIR, decodeURIComponent(darkSrc)));

  node.attributes = node.attributes.filter((a) => a !== srcAttr);
  node.attributes.push(requireAttribute("src", `@site/static${src}`));
  if (hasDark && !getAttribute(node, "darkSrc")) {
    node.attributes.push(requireAttribute("darkSrc", `@site/static${darkSrc}`));
  }
}

function collectImgNodes(node, out) {
  if (
    (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
    node.name === "Img"
  ) {
    out.push(node);
  }
  if (node.children) {
    for (const child of node.children) collectImgNodes(child, out);
  }
}

function remarkImageDimensions() {
  return async (root, vfile) => {
    const imgNodes = [];
    collectImgNodes(root, imgNodes);
    await Promise.all(
      imgNodes.map((n) => processNode(n, vfile && vfile.path))
    );
  };
}

module.exports = remarkImageDimensions;
